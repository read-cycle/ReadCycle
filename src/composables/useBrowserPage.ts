import { addDoc, collection, getDoc } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { db } from '../firebase-init';
import { createBookRequestEmail } from '../emailTemplates';
import type { BuyerRequestedDoc, UploadDoc } from '../interfaces';
import { sendEmail } from '../sendEmail';
import { useForm } from './useForm';
import type { FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { fetchUploadPoolDocs } from './useUploadPool';
import { useRequestNotifications } from './useRequestNotifications';

export function useBrowserPage() {
  const { user, authReady } = useAuthGuard();
  const toast = useToast();
  const loading = ref(true);
  const submitLoading = ref(false);
  const searchQuery = ref('');
  const docsData = ref<FirestoreRecord<UploadDoc>[]>([]);
  const selectedDoc = ref<FirestoreRecord<UploadDoc> | null>(null);
  const requestForm = useForm();

  const notifications = useRequestNotifications();

  const filteredDocs = computed(() => {
    const queryValue = searchQuery.value.trim().toLowerCase();
    if (!queryValue) return docsData.value;

    return docsData.value.filter(([, docData]) => {
      const title = docData.title?.toLowerCase() || '';
      const grade = docData.grade?.toLowerCase() || '';
      const subject = docData.subject?.toLowerCase() || '';
      return title.includes(queryValue) || grade.includes(queryValue) || subject.includes(queryValue);
    });
  });

  async function loadBooks() {
    if (!user.value) return;

    loading.value = true;
    requestForm.setField('name', user.value.displayName || '');

    docsData.value = await fetchUploadPoolDocs();
    loading.value = false;
  }

  watch(
    user,
    async (nextUser) => {
      if (!nextUser) {
        docsData.value = [];
        selectedDoc.value = null;
        loading.value = authReady.value ? false : loading.value;
        return;
      }

      await loadBooks();
    },
    { immediate: true }
  );

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
      const [docRef, docData] = selectedDoc.value;
      const latest = await getDoc(docRef);
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

      await addDoc(collection(db, 'buyerRequested'), {
        ...docData,
        buyerName: requestForm.payload.value.name,
        buyerQuantity: requestForm.payload.value.quantity,
        buyerID: user.value.uid,
        buyerEmail: user.value.email,
        listingDoc: docRef
      } as BuyerRequestedDoc);

      requestForm.reset({
        name: user.value.displayName || '',
        quantity: 1
      });
      selectedDoc.value = null;
      toast.success('Request sent. The uploader has been notified.');
    } catch (error) {
      console.error('Failed to submit request:', error);
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
    submitLoading,
    searchQuery,
    filteredDocs,
    selectedDoc,
    requestForm,
    notifications,
    selectDoc,
    closeSelectedDoc,
    submitRequest
  };
}
