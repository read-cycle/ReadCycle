import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { db } from '../firebase-init';
import type { BuyerRequestedDoc, UploadDoc } from '../interfaces';
import { useNotificationsStore } from '../stores/notifications';
import type { FirestoreRecord } from './firestore';

export type RequestNotificationItem = FirestoreRecord<BuyerRequestedDoc>;

interface RequestNotificationsOptions {
  onAccepted?: (item: RequestNotificationItem) => Promise<void> | void;
  onDenied?: (item: RequestNotificationItem) => Promise<void> | void;
  acceptRequest?: (item: RequestNotificationItem) => Promise<void>;
  denyRequest?: (item: RequestNotificationItem) => Promise<void>;
}

export async function moveRequestToMatched([docRef, data]: RequestNotificationItem) {
  const listingRef = doc(db, data.listingDoc.path);
  const listingSnapshot = await getDoc(listingRef);

  if (!listingSnapshot.exists()) {
    throw new Error('Listing no longer exists.');
  }

  const listingData = listingSnapshot.data() as Partial<UploadDoc>;
  const currentQuantity = typeof listingData.quantity === 'number' ? listingData.quantity : 0;
  const requestedQuantity = typeof data.buyerQuantity === 'number' ? data.buyerQuantity : 0;
  const remainingQuantity = currentQuantity - requestedQuantity;

  if (remainingQuantity < 0) {
    throw new Error('Requested quantity exceeds the remaining listing quantity.');
  }

  await setDoc(doc(db, 'matched', docRef.id), {
    ...data,
    listingDoc: listingRef
  });

  if (remainingQuantity === 0) {
    await deleteDoc(listingRef);
  } else {
    await updateDoc(listingRef, {
      quantity: remainingQuantity
    });
  }

  await deleteDoc(docRef);
}

async function deleteRequest([docRef]: RequestNotificationItem) {
  await deleteDoc(docRef);
}

export function useRequestNotifications(options: RequestNotificationsOptions = {}) {
  const toast = useToast();
  const notificationLoading = ref(false);
  const { activeNotification, notificationsOpen, openNotification, closeNotification } = useNotificationsStore();

  async function acceptRequest() {
    if (!activeNotification.value) return;

    notificationLoading.value = true;
    try {
      const item = activeNotification.value;
      await (options.acceptRequest?.(item) ?? await moveRequestToMatched(item));
      closeNotification();
      await options.onAccepted?.(item);
      toast.success('Request accepted.');
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept request.');
    } finally {
      notificationLoading.value = false;
    }
  }

  async function denyRequest() {
    if (!activeNotification.value) return;

    notificationLoading.value = true;
    try {
      const item = activeNotification.value;
      await (options.denyRequest?.(item) ?? await deleteRequest(item));
      closeNotification();
      await options.onDenied?.(item);
      toast.info('Request denied.');
    } catch (error) {
      console.error('Failed to deny request:', error);
      toast.error('Failed to deny request.');
    } finally {
      notificationLoading.value = false;
    }
  }

  return {
    activeNotification,
    notificationsOpen,
    notificationLoading,
    openNotification,
    closeNotification,
    acceptRequest,
    denyRequest
  };
}
