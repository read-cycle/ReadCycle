import { addDoc, collection, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';
import { db } from '../firebase-init';
import type { BuyerRequestedDoc, UploadDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { sendEmail } from '../sendEmail';
import { useForm } from './useForm';
import { mapQuerySnapshot, type FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useRequestNotifications } from './useRequestNotifications';

export function useBrowserPage() {
  const { user, authReady } = useAuthGuard();
  const loading = ref(true);
  const submitLoading = ref(false);
  const searchQuery = ref('');
  const docsData = ref<FirestoreRecord<UploadDoc>[]>([]);
  const selectedDoc = ref<FirestoreRecord<UploadDoc> | null>(null);
  const requestForm = useForm();

  const notifications = useRequestNotifications();

  function normalizeUploadDoc(data: Record<string, unknown> & { id: string }): UploadDoc {
    return {
      id: data.id,
      isbn: normalizeMetadataValue(data.isbn),
      title: normalizeMetadataValue(data.title),
      grade: normalizeMetadataValue(data.grade),
      subject: normalizeMetadataValue(data.subject),
      price: typeof data.price === 'number' ? data.price : 0,
      quantity: typeof data.quantity === 'number' ? data.quantity : 0,
      uploaderName: typeof data.uploaderName === 'string' ? data.uploaderName : '',
      listingImage: typeof data.listingImage === 'string' ? data.listingImage : '',
      extraImages: Array.isArray(data.extraImages) ? data.extraImages.filter((entry): entry is string => typeof entry === 'string') : [],
      timestamp: data.timestamp as UploadDoc['timestamp'],
      uploaderEmail: typeof data.uploaderEmail === 'string' ? data.uploaderEmail : '',
      uploaderID: typeof data.uploaderID === 'string' ? data.uploaderID : ''
    };
  }

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

    const result = await getDocs(query(collection(db, 'uploadPool'), orderBy('timestamp', 'desc')));
    docsData.value = mapQuerySnapshot<UploadDoc>(result, normalizeUploadDoc);
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

  async function submitRequest() {
    if (!selectedDoc.value || !user.value || !user.value.email) return;
    if (!requestForm.validate(['name', 'quantity'])) return;

    submitLoading.value = true;
    try {
      const [docRef, docData] = selectedDoc.value;
      const latest = await getDoc(docRef);
      if (!latest.exists()) return;

      await sendEmail(
          docData.uploaderEmail,
          'Someone wants your book on ReadCycle',
          `<p>${requestForm.payload.value.name} requested <b>${docData.title ?? 'your listing'}</b>.</p>`
      );

      await addDoc(collection(db, 'buyerRequested'), {
        ...docData,
        buyerName: requestForm.payload.value.name,
        buyerQuantity: requestForm.payload.value.quantity,
        buyerID: user.value.uid,
        buyerEmail: user.value.email,
        listingDoc: docRef
      } as BuyerRequestedDoc);

      selectedDoc.value = null;
    } catch (error) {
      console.error('Failed to submit request:', error);
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
