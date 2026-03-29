import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { db, storage } from '../firebase-init';
import type { BuyerRequestedDoc, ChatDisplayItem, Message } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { mapQuerySnapshot, type FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useRequestNotifications } from './useRequestNotifications';

export function useChatsPage() {
  const { user, authReady } = useAuthGuard();
  const toast = useToast();
  const uploaderDocsData = ref<FirestoreRecord<BuyerRequestedDoc>[]>([]);
  const buyerDocsData = ref<FirestoreRecord<BuyerRequestedDoc>[]>([]);
  const currentDoc = ref<FirestoreRecord<BuyerRequestedDoc> | null>(null);
  const messages = ref<Message[]>([]);
  const inputData = ref('');
  const sending = ref(false);
  const loadingLists = ref(true);
  const files = ref<FileList | null>(null);

  const notifications = useRequestNotifications();
  const userId = computed(() => user.value?.uid || '');

  function normalizeBuyerRequestedDoc(data: Record<string, unknown> & { id: string }): BuyerRequestedDoc {
    return {
      id: data.id,
      buyerName: typeof data.buyerName === 'string' ? data.buyerName : '',
      buyerQuantity: typeof data.buyerQuantity === 'number' ? data.buyerQuantity : 0,
      isbn: normalizeMetadataValue(data.isbn),
      title: normalizeMetadataValue(data.title),
      grade: normalizeMetadataValue(data.grade),
      subject: normalizeMetadataValue(data.subject),
      price: typeof data.price === 'number' ? data.price : 0,
      quantity: typeof data.quantity === 'number' ? data.quantity : 0,
      uploaderName: typeof data.uploaderName === 'string' ? data.uploaderName : '',
      listingImage: typeof data.listingImage === 'string' ? data.listingImage : '',
      extraImages: Array.isArray(data.extraImages) ? data.extraImages.filter((entry): entry is string => typeof entry === 'string') : [],
      timestamp: data.timestamp as BuyerRequestedDoc['timestamp'],
      uploaderEmail: typeof data.uploaderEmail === 'string' ? data.uploaderEmail : '',
      buyerEmail: typeof data.buyerEmail === 'string' ? data.buyerEmail : '',
      uploaderID: typeof data.uploaderID === 'string' ? data.uploaderID : '',
      buyerID: typeof data.buyerID === 'string' ? data.buyerID : '',
      listingDoc: data.listingDoc as BuyerRequestedDoc['listingDoc']
    };
  }

  let unsubscribeMessages: (() => void) | undefined;

  const displayItems = computed<ChatDisplayItem[]>(() => messages.value.map((message) => ({ type: 'message', message })));
  const emptyState = computed(() => !uploaderDocsData.value.length && !buyerDocsData.value.length);
  const currentDocFromBuyerList = computed(() =>
    buyerDocsData.value.some(([docRef]) => docRef.id === currentDoc.value?.[0].id)
  );

  async function loadChats() {
    if (!user.value) return;

    loadingLists.value = true;
    const [uploaderResult, buyerResult] = await Promise.all([
      getDocs(query(collection(db, 'matched'), where('uploaderID', '==', user.value.uid), orderBy('timestamp', 'desc'))),
      getDocs(query(collection(db, 'matched'), where('buyerID', '==', user.value.uid), orderBy('timestamp', 'desc')))
    ]);

    uploaderDocsData.value = mapQuerySnapshot<BuyerRequestedDoc>(uploaderResult, normalizeBuyerRequestedDoc);
    buyerDocsData.value = mapQuerySnapshot<BuyerRequestedDoc>(buyerResult, normalizeBuyerRequestedDoc);

    const currentId = currentDoc.value?.[0].id;
    const nextCurrentDoc =
      uploaderDocsData.value.find(([docRef]) => docRef.id === currentId) ||
      buyerDocsData.value.find(([docRef]) => docRef.id === currentId) ||
      uploaderDocsData.value[0] ||
      buyerDocsData.value[0] ||
      null;

    currentDoc.value = nextCurrentDoc;
    loadingLists.value = false;
  }

  watch(
    user,
    async (nextUser) => {
      if (!nextUser) {
        uploaderDocsData.value = [];
        buyerDocsData.value = [];
        currentDoc.value = null;
        messages.value = [];
        loadingLists.value = authReady.value ? false : loadingLists.value;
        return;
      }

      await loadChats();
    },
    { immediate: true }
  );

  watch(currentDoc, (value) => {
    unsubscribeMessages?.();
    messages.value = [];

    if (!value) return;

    unsubscribeMessages = onSnapshot(query(collection(value[0], 'messages'), orderBy('timestamp', 'asc')), (snapshot) => {
      messages.value = snapshot.docs.map((entry) => entry.data() as Message);
    });
  });

  onBeforeUnmount(() => {
    unsubscribeMessages?.();
  });

  async function sendMessage() {
    if (!currentDoc.value || !user.value) return;

    if (!inputData.value.trim() && !files.value?.length) return;

    sending.value = true;
    const [docRef, docData] = currentDoc.value;

    try {
      const messageRef = await addDoc(collection(docRef, 'messages'), {
        text: inputData.value.trim() || undefined,
        sender: currentDocFromBuyerList.value ? docData.buyerName : docData.uploaderName,
        timestamp: serverTimestamp(),
        type: files.value ? (inputData.value.trim() ? 'text+image' : 'image') : 'text',
        senderID: user.value.uid
      });

      if (files.value && files.value.length > 0) {
        const uploads = [];

        for (const file of files.value) {
          const imageRef = storageRef(
            storage,
            `matched/${docRef.id}/${messageRef.id}/${file.name}`
          );

          await uploadBytes(imageRef, file);
          const url = await getDownloadURL(imageRef);
          uploads.push(url);
        }

        await updateDoc(messageRef, {
          imageUrls: uploads
        });
      }

      inputData.value = '';
      files.value = null;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message.');
    } finally {
      sending.value = false;
    }
  }

  function selectChat(docData: FirestoreRecord<BuyerRequestedDoc>) {
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
