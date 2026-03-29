import { addDoc, collection, deleteDoc, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';
import { db } from '../firebase-init';
import type { BuyerRequestedDoc, UploadDoc, WatchlistDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { sendEmail } from '../sendEmail';
import { mapQuerySnapshot, type FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useForm } from './useForm';
import { moveRequestToMatched, useRequestNotifications } from './useRequestNotifications';


export function useDashboardPage() {
  const { user, authReady } = useAuthGuard();
  const pendingData = ref<FirestoreRecord<BuyerRequestedDoc>[]>([]);
  const watchData = ref<FirestoreRecord<WatchlistDoc>[]>([]);
  const uploadData = ref<FirestoreRecord<UploadDoc>[]>([]);
  const dashboardLoading = ref(true);
  const watchlistModalOpen = ref(false);
  const watchlistLoading = ref(false);
  const watchlistForm = useForm();

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

  function normalizeWatchlistDoc(data: Record<string, unknown> & { id: string }): WatchlistDoc {
    return {
      id: data.id,
      buyerName: typeof data.buyerName === 'string' ? data.buyerName : '',
      buyerQuantity: typeof data.buyerQuantity === 'number' ? data.buyerQuantity : 0,
      buyerID: typeof data.buyerID === 'string' ? data.buyerID : '',
      title: normalizeMetadataValue(data.title),
      subject: normalizeMetadataValue(data.subject),
      isbn: normalizeMetadataValue(data.isbn),
      grade: normalizeMetadataValue(data.grade),
      timestamp: data.timestamp as WatchlistDoc['timestamp'],
      buyerEmail: typeof data.buyerEmail === 'string' ? data.buyerEmail : ''
    };
  }

  async function loadDashboardData() {
    if (!user.value) return;

    dashboardLoading.value = true;
    const [pendingResult, watchResult, uploadResult] = await Promise.all([
      getDocs(query(collection(db, 'buyerRequested'), where('uploaderID', '==', user.value.uid), orderBy('timestamp', 'desc'))),
      getDocs(query(collection(db, 'watchlist'), where('buyerID', '==', user.value.uid), orderBy('timestamp', 'desc'))),
      getDocs(query(collection(db, 'uploadPool'), where('uploaderID', '==', user.value.uid), orderBy('timestamp', 'desc')))
    ]);

    pendingData.value = mapQuerySnapshot<BuyerRequestedDoc>(pendingResult, normalizeBuyerRequestedDoc);
    watchData.value = mapQuerySnapshot<WatchlistDoc>(watchResult, normalizeWatchlistDoc);
    uploadData.value = mapQuerySnapshot<UploadDoc>(uploadResult, normalizeUploadDoc);
    dashboardLoading.value = false;
  }

  watch(
    user,
    async (nextUser) => {
      if (!nextUser) {
        pendingData.value = [];
        watchData.value = [];
        uploadData.value = [];
        dashboardLoading.value = authReady.value ? false : dashboardLoading.value;
        return;
      }

      watchlistForm.setField('name', nextUser.displayName || '');
      await loadDashboardData();
    },
    { immediate: true }
  );

  const notifications = useRequestNotifications({
    onAccepted: loadDashboardData,
    onDenied: loadDashboardData
  });

  async function acceptPendingRequest([docRef, data]: FirestoreRecord<BuyerRequestedDoc>) {
    await addDoc(collection(db, 'stats_events'), {
      eventType: 'book_matched',
      listingId: docRef.id,
      uploaderID: data.uploaderID ?? null,
      buyerID: data.buyerID ?? null,
      subject: data.subject,
      isbn: data.isbn,
      timestamp: serverTimestamp()
    });

    sendEmail(data.buyerEmail, 'Your request was accepted on ReadCycle', `<p>Your request for <b>${data.title ?? 'a book'}</b> was accepted.</p>`);
  }

  notifications.acceptRequest = async () => {
    if (!notifications.activeNotification.value) return;

    notifications.notificationLoading.value = true;
    try {
      const item = notifications.activeNotification.value;
      await acceptPendingRequest(item);
      await moveRequestToMatched(item);
      notifications.closeNotification();
      await loadDashboardData();
    } finally {
      notifications.notificationLoading.value = false;
    }
  };

  async function submitWatchlist() {
    if (!user.value || !user.value.email) return;
    if (!watchlistForm.validate(['isbn', 'title', 'grade', 'subject', 'name', 'quantity'])) return;

    watchlistLoading.value = true;
    watchlistForm.status.value = 'loading';
    try {
      await addDoc(collection(db, 'watchlist'), {
        buyerName: watchlistForm.payload.value.name,
        buyerQuantity: watchlistForm.payload.value.quantity,
        buyerID: user.value.uid,
        title: watchlistForm.payload.value.title,
        subject: watchlistForm.payload.value.subject,
        isbn: watchlistForm.payload.value.isbn,
        grade: watchlistForm.payload.value.grade,
        timestamp: serverTimestamp(),
        buyerEmail: user.value.email
      } satisfies Omit<WatchlistDoc, 'id' | 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> });
      watchlistForm.status.value = 'success';
      watchlistModalOpen.value = false;
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to add watchlist item:', error);
      watchlistForm.status.value = 'error';
    } finally {
      watchlistLoading.value = false;
    }
  }

  async function removeUpload(docRef: FirestoreRecord<UploadDoc>[0]) {
    await deleteDoc(docRef);
    uploadData.value = uploadData.value.filter(([entryRef]) => entryRef.id !== docRef.id);
  }

  async function removeWatchlistItem(docRef: FirestoreRecord<WatchlistDoc>[0]) {
    await deleteDoc(docRef);
    watchData.value = watchData.value.filter(([entryRef]) => entryRef.id !== docRef.id);
  }

  const emptyState = computed(() => !uploadData.value.length && !watchData.value.length && !pendingData.value.length && !dashboardLoading.value);

  return {
    pendingData,
    uploadData,
    watchData,
    dashboardLoading,
    emptyState,
    watchlistModalOpen,
    watchlistLoading,
    watchlistForm,
    notifications,
    loadDashboardData,
    submitWatchlist,
    removeUpload,
    removeWatchlistItem
  };
}
