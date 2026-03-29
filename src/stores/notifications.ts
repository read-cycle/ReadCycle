import { ref } from 'vue';
import type { RequestNotificationItem } from '../composables/useRequestNotifications';

const activeNotification = ref<RequestNotificationItem | null>(null);
const notificationsOpen = ref(false);

export function useNotificationsStore() {
  function openNotification(item: RequestNotificationItem) {
    activeNotification.value = item;
    notificationsOpen.value = true;
    document.body.style.overflow = 'hidden';
  }

  function closeNotification() {
    notificationsOpen.value = false;
    activeNotification.value = null;
    document.body.style.overflow = '';
    document.body.style.overflowX = 'hidden';
  }

  return {
    activeNotification,
    notificationsOpen,
    openNotification,
    closeNotification
  };
}
