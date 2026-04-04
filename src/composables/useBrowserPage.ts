import { getDoc } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { createBookRequestEmail } from '../emailTemplates';
import type { BuyerRequestedDoc, UploadDoc } from '../interfaces';
import { createBuyerRequestedEntry } from '../repositories/buyerRequestsRepo';
import { uploadPoolDoc } from '../repositories/firestoreRefs';
import { sendEmail } from '../sendEmail';
import { useForm } from './useForm';
import type { FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { fetchUploadPoolPage } from './useUploadPool';
import { useRequestNotifications } from './useRequestNotifications';

export function useBrowserPage() {
  const PAGE_SIZE = 20;
  const { user, authReady } = useAuthGuard();
  const toast = useToast();
  const loading = ref(true);
  const loadingMore = ref(false);
  const hasMore = ref(true);
  const submitLoading = ref(false);
  const searchQuery = ref('');
  const docsData = ref<FirestoreRecord<UploadDoc>[]>([]);
  const selectedDoc = ref<FirestoreRecord<UploadDoc> | null>(null);
  const requestForm = useForm();
  const lastCursor = ref<Awaited<ReturnType<typeof fetchUploadPoolPage>>['cursor']>(null);
  let activeSearchRequest = 0;

  const notifications = useRequestNotifications();

  const filteredDocs = computed(() => {
    const queryValue = searchQuery.value.trim().toLowerCase();
    if (!queryValue) return docsData.value;

    return docsData.value.filter(([, docData]) => {
      const title = docData.title?.toLowerCase() || '';
      const grade = docData.grade?.toLowerCase() || '';
      const subject = docData.subject?.toLowerCase() || '';
      const isbn = docData.isbn?.toLowerCase() || '';
      return title.includes(queryValue) || grade.includes(queryValue) || subject.includes(queryValue) || isbn.includes(queryValue);
    });
  });

  async function loadBooks() {
    if (!user.value) return;

    loading.value = true;
    loadingMore.value = false;
    hasMore.value = true;
    lastCursor.value = null;
    requestForm.setField('name', user.value.displayName || '');

    try {
      const page = await fetchUploadPoolPage(PAGE_SIZE);
      docsData.value = page.docs;
      lastCursor.value = page.cursor;
      hasMore.value = page.hasMore;
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreBooks() {
    if (!user.value || loading.value || loadingMore.value || !hasMore.value) return;

    loadingMore.value = true;
    try {
      const page = await fetchUploadPoolPage(PAGE_SIZE, lastCursor.value);
      docsData.value = [...docsData.value, ...page.docs];
      lastCursor.value = page.cursor;
      hasMore.value = page.hasMore;
    } finally {
      loadingMore.value = false;
    }
  }

  async function loadAllBooksForSearch() {
    const queryValue = searchQuery.value.trim();
    if (!queryValue || !hasMore.value || loading.value || loadingMore.value) return;

    const requestId = ++activeSearchRequest;

    while (requestId === activeSearchRequest && searchQuery.value.trim() && hasMore.value) {
      await loadMoreBooks();
    }
  }

  watch(
    user,
    async (nextUser) => {
      if (!nextUser) {
        docsData.value = [];
        selectedDoc.value = null;
        hasMore.value = true;
        lastCursor.value = null;
        loading.value = authReady.value ? false : loading.value;
        return;
      }

      await loadBooks();
    },
    { immediate: true }
  );

  watch(searchQuery, () => {
    void loadAllBooksForSearch();
  });

  watch(
    selectedDoc,
    (nextDoc) => {
      const availableQuantity = nextDoc?.[1].quantity ?? 1;
      requestForm.quantity.value = Math.min(Math.max(requestForm.quantity.value || 1, 1), Math.max(availableQuantity, 1));
    },
    { immediate: true }
  );

  async function submitRequest() {
    if (!selectedDoc.value || !user.value || !user.value.email) return;
    if (!requestForm.validate(['name', 'quantity'])) return;

    submitLoading.value = true;
    try {
      const [docId, docData] = selectedDoc.value;
      const latest = await getDoc(uploadPoolDoc(docId));
      if (!latest.exists()) {
        toast.error('This listing is no longer available.');
        selectedDoc.value = null;
        return;
      }

      const latestData = latest.data() as Partial<UploadDoc>;
      const availableQuantity = typeof latestData.quantity === 'number' ? latestData.quantity : 0;

      if (availableQuantity < 1) {
        toast.error('This listing is no longer available.');
        selectedDoc.value = null;
        await loadBooks();
        return;
      }

      if (requestForm.quantity.value > availableQuantity) {
        requestForm.quantity.value = availableQuantity;
        toast.info(`Quantity adjusted to ${availableQuantity}, which is the current amount available.`);
        return;
      }

      await sendEmail(
          docData.uploaderEmail,
          'Someone wants your book on ReadCycle',
          createBookRequestEmail({
            requesterName: requestForm.payload.value.name,
            title: docData.title ?? 'Your listing',
            buyerQuantity: requestForm.payload.value.quantity,
            grade: docData.grade,
            subject: docData.subject,
            price: docData.price
          })
      );

      await createBuyerRequestedEntry({
        buyerName: requestForm.payload.value.name,
        buyerQuantity: requestForm.payload.value.quantity,
        buyerID: user.value.uid,
        buyerEmail: user.value.email,
        uploaderID: docData.uploaderID,
        uploaderEmail: docData.uploaderEmail,
        listingId: docId,
        isbn: docData.isbn,
        title: docData.title,
        grade: docData.grade,
        subject: docData.subject,
        price: docData.price,
        quantity: docData.quantity,
        uploaderName: docData.uploaderName,
        listingImage: docData.listingImage,
        listingImageThumb: docData.listingImageThumb,
        extraImages: docData.extraImages,
        extraImageThumbs: docData.extraImageThumbs,
      } as Omit<BuyerRequestedDoc, 'id' | 'timestamp'>);

      requestForm.reset({
        name: user.value.displayName || '',
        quantity: 1
      });
      selectedDoc.value = null;
      toast.success('Request sent. The uploader has been notified.');
    } catch (error) {
      toast.error('Failed to submit request.');
    } finally {
      submitLoading.value = false;
    }
  }

  function selectDoc(docData: FirestoreRecord<UploadDoc>) {
    selectedDoc.value = docData;
  }

  function closeSelectedDoc() {
    selectedDoc.value = null;
  }

  return {
    loading,
    loadingMore,
    hasMore,
    submitLoading,
    searchQuery,
    filteredDocs,
    selectedDoc,
    requestForm,
    notifications,
    loadMoreBooks,
    selectDoc,
    closeSelectedDoc,
    submitRequest
  };
}
