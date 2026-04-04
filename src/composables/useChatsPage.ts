import { serverTimestamp } from 'firebase/firestore';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import type { ChatDisplayItem, MatchedChatDoc, Message } from '../interfaces';
import { createMatchedMessage, markMatchedThreadRead, registerMatchedThreadMessage, subscribeToMatchedByBuyer, subscribeToMatchedByUploader, subscribeToMatchedMessages, updateMatchedMessageImages } from '../repositories/matchedRepo';
import { uploadMatchedMessageAttachmentSet } from '../repositories/storageRepo';
import { createChatAttachment } from '../utils/imageProcessing';
import type { FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useRequestNotifications } from './useRequestNotifications';

export function useChatsPage() {
  const { user, authReady } = useAuthGuard();
  const toast = useToast();
  const uploaderDocsData = ref<FirestoreRecord<MatchedChatDoc>[]>([]);
  const buyerDocsData = ref<FirestoreRecord<MatchedChatDoc>[]>([]);
  const currentDoc = ref<FirestoreRecord<MatchedChatDoc> | null>(null);
  const messages = ref<Message[]>([]);
  const inputData = ref('');
  const sending = ref(false);
  const loadingLists = ref(true);
  const files = ref<FileList | null>(null);

  const notifications = useRequestNotifications();
  const userId = computed(() => user.value?.uid || '');

  let unsubscribeMessages: (() => void) | undefined;
  let unsubscribeUploaderChats: (() => void) | undefined;
  let unsubscribeBuyerChats: (() => void) | undefined;

  const displayItems = computed<ChatDisplayItem[]>(() => messages.value.map((message) => ({ type: 'message', message })));
  const emptyState = computed(() => !uploaderDocsData.value.length && !buyerDocsData.value.length);
  const currentDocFromBuyerList = computed(() =>
    buyerDocsData.value.some(([docId]) => docId === currentDoc.value?.[0])
  );

  function syncCurrentDocSelection() {
    loadingLists.value = true;
    const currentId = currentDoc.value?.[0];
    const nextCurrentDoc =
      uploaderDocsData.value.find(([docId]) => docId === currentId) ||
      buyerDocsData.value.find(([docId]) => docId === currentId) ||
      uploaderDocsData.value[0] ||
      buyerDocsData.value[0] ||
      null;

    currentDoc.value = nextCurrentDoc;
    loadingLists.value = false;
  }

  function subscribeToChatLists(userUid: string) {
    let pendingLists = 2;

    const finishInitialLoad = () => {
      pendingLists -= 1;
      if (pendingLists <= 0) {
        syncCurrentDocSelection();
      }
    };

    unsubscribeUploaderChats?.();
    unsubscribeBuyerChats?.();

    unsubscribeUploaderChats = subscribeToMatchedByUploader(
      userUid,
      (docs) => {
        uploaderDocsData.value = docs;
        if (pendingLists > 0) {
          finishInitialLoad();
          return;
        }
        syncCurrentDocSelection();
      }
    );

    unsubscribeBuyerChats = subscribeToMatchedByBuyer(
      userUid,
      (docs) => {
        buyerDocsData.value = docs;
        if (pendingLists > 0) {
          finishInitialLoad();
          return;
        }
        syncCurrentDocSelection();
      }
    );
  }

  watch(
    user,
    async (nextUser) => {
      if (!nextUser) {
        uploaderDocsData.value = [];
        buyerDocsData.value = [];
        currentDoc.value = null;
        messages.value = [];
        unsubscribeUploaderChats?.();
        unsubscribeBuyerChats?.();
        loadingLists.value = authReady.value ? false : loadingLists.value;
        return;
      }

      subscribeToChatLists(nextUser.uid);
    },
    { immediate: true }
  );

  watch(currentDoc, (value) => {
    unsubscribeMessages?.();
    messages.value = [];

    if (!value) return;

    if (user.value) {
      void markMatchedThreadRead(value, user.value.uid);
    }

    unsubscribeMessages = subscribeToMatchedMessages(value, (nextMessages) => {
      messages.value = nextMessages;
      if (user.value) {
        void markMatchedThreadRead(value, user.value.uid);
      }
    });
  });

  onBeforeUnmount(() => {
    unsubscribeMessages?.();
    unsubscribeUploaderChats?.();
    unsubscribeBuyerChats?.();
  });

  async function sendMessage() {
    if (!currentDoc.value || !user.value) return;

    const trimmedText = inputData.value.trim();
    const selectedFiles = files.value ? Array.from(files.value) : [];

    if (!trimmedText && !selectedFiles.length) return;

    sending.value = true;
    const [docId, docData] = currentDoc.value;

    try {
      const messagePayload: Omit<Message, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> } = {
        sender: currentDocFromBuyerList.value ? docData.buyerName : docData.uploaderName,
        timestamp: serverTimestamp(),
        type: selectedFiles.length ? (trimmedText ? 'text+image' : 'image') : 'text',
        senderID: user.value.uid
      };

      if (trimmedText) {
        messagePayload.text = trimmedText;
      }

      const messageRef = await createMatchedMessage(currentDoc.value, messagePayload);

      if (selectedFiles.length > 0) {
        const uploads = await Promise.all(
          selectedFiles.map(async (file, index) => {
            const processedFiles = await createChatAttachment(file);
            return uploadMatchedMessageAttachmentSet(
              docId,
              messageRef.id,
              index,
              processedFiles.displayFile,
              processedFiles.thumbFile
            );
          })
        );

        await updateMatchedMessageImages(
          messageRef,
          uploads.map((entry) => entry.imageUrl),
          uploads.map((entry) => entry.imageThumbUrl)
        );
      }

      await registerMatchedThreadMessage(
        currentDoc.value,
        user.value.uid,
        trimmedText || (selectedFiles.length ? 'Sent an image' : 'New message')
      );

      inputData.value = '';
      files.value = null;
    } catch (error) {
      toast.error('Failed to send message.');
    } finally {
      sending.value = false;
    }
  }

  function selectChat(docData: FirestoreRecord<MatchedChatDoc>) {
    currentDoc.value = docData;
  }

  return {
    uploaderDocsData,
    buyerDocsData,
    currentDoc,
    displayItems,
    inputData,
    sending,
    loadingLists,
    emptyState,
    userId,
    files,
    notifications,
    selectChat,
    sendMessage
  };
}
