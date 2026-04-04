import { onAuthStateChanged } from 'firebase/auth';
import { computed, onBeforeUnmount, ref } from 'vue';
import { auth } from '../firebase-init';
import { subscribeToMatchedByBuyer, subscribeToMatchedByUploader } from '../repositories/matchedRepo';

const uploaderUnreadCount = ref(0);
const buyerUnreadCount = ref(0);
const totalUnreadCount = computed(() => uploaderUnreadCount.value + buyerUnreadCount.value);

let authUnsubscribe: (() => void) | null = null;
let uploaderChatsUnsubscribe: (() => void) | null = null;
let buyerChatsUnsubscribe: (() => void) | null = null;
let consumerCount = 0;

function resetCounts() {
  uploaderUnreadCount.value = 0;
  buyerUnreadCount.value = 0;
}

function stopChatSubscriptions() {
  uploaderChatsUnsubscribe?.();
  buyerChatsUnsubscribe?.();
  uploaderChatsUnsubscribe = null;
  buyerChatsUnsubscribe = null;
  resetCounts();
}

function ensureListeners() {
  if (authUnsubscribe) return;

  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    stopChatSubscriptions();

    if (!user) return;

    uploaderChatsUnsubscribe = subscribeToMatchedByUploader(
      user.uid,
      (docs) => {
        uploaderUnreadCount.value = docs.reduce(
          (sum, [, doc]) => sum + (doc.unreadCountForUploader ?? 0),
          0
        );
      }
    );

    buyerChatsUnsubscribe = subscribeToMatchedByBuyer(
      user.uid,
      (docs) => {
        buyerUnreadCount.value = docs.reduce(
          (sum, [, doc]) => sum + (doc.unreadCountForBuyer ?? 0),
          0
        );
      }
    );
  });
}

function releaseListeners() {
  if (consumerCount > 0) return;

  stopChatSubscriptions();
  authUnsubscribe?.();
  authUnsubscribe = null;
}

export function useChatUnreadCount() {
  consumerCount += 1;
  ensureListeners();

  onBeforeUnmount(() => {
    consumerCount = Math.max(0, consumerCount - 1);
    releaseListeners();
  });

  return {
    unreadChatCount: totalUnreadCount
  };
}
