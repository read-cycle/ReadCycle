import { deleteDoc, doc, runTransaction } from 'firebase/firestore';
import { ref } from 'vue';
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
  await runTransaction(db, async (transaction) => {
    const listingSnapshot = await transaction.get(data.listingDoc);

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

    transaction.set(doc(db, 'matched', docRef.id), data);

    if (remainingQuantity === 0) {
      transaction.delete(data.listingDoc);
    } else {
      transaction.update(data.listingDoc, {
        quantity: remainingQuantity
      });
    }

    transaction.delete(docRef);
  });
}

async function deleteRequest([docRef]: RequestNotificationItem) {
  await deleteDoc(docRef);
}

export function useRequestNotifications(options: RequestNotificationsOptions = {}) {
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
