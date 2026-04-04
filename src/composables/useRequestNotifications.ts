import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import type { BuyerRequestedDoc } from '../interfaces';
import { useNotificationsStore } from '../stores/notifications';
import { deleteBuyerRequest, moveRequestToMatched } from './buyerRequests';
import type { FirestoreRecord } from './firestore';

export type RequestNotificationItem = FirestoreRecord<BuyerRequestedDoc>;

interface RequestNotificationsOptions {
  onAccepted?: (item: RequestNotificationItem) => Promise<void> | void;
  onDenied?: (item: RequestNotificationItem) => Promise<void> | void;
  acceptRequest?: (item: RequestNotificationItem) => Promise<void>;
  denyRequest?: (item: RequestNotificationItem) => Promise<void>;
}

function isTerminalRequestError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes('were cleared') ||
    error.message.includes('no longer exists') ||
    error.message.includes('is invalid')
  );
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
      if (isTerminalRequestError(error)) {
        closeNotification();
      }
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
      await (options.denyRequest?.(item) ?? deleteBuyerRequest(item));
      closeNotification();
      await options.onDenied?.(item);
      toast.info('Request denied.');
    } catch (error) {
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
