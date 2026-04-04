import { deleteDoc, orderBy, where } from 'firebase/firestore';
import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { createRequestAcceptedEmail } from '../emailTemplates';
import type { BuyerRequestedDoc, UploadDoc, WatchlistDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { uploadPoolDoc, watchlistDoc } from '../repositories/firestoreRefs';
import { createBookMatchedEvent } from '../repositories/statsRepo';
import { fetchUploadPoolByUploader } from '../repositories/uploadPoolRepo';
import { createWatchlistEntry, fetchWatchlistByBuyer } from '../repositories/watchlistRepo';
import { sendEmail } from '../sendEmail';
import { normalizeImageUrl, normalizeImageUrlList } from '../utils/imageUrls';
import { fetchHydratedBuyerRequestedRecords, moveRequestToMatched } from './buyerRequests';
import { mapQuerySnapshot, type FirestoreRecord } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useForm } from './useForm';
import { useRequestNotifications } from './useRequestNotifications';


export function useDashboardPage() {
  const { user, authReady } = useAuthGuard();
  const toast = useToast();
  const pendingData = ref<FirestoreRecord<BuyerRequestedDoc>[]>([]);
  const watchData = ref<FirestoreRecord<WatchlistDoc>[]>([]);
  const uploadData = ref<FirestoreRecord<UploadDoc>[]>([]);
  const dashboardLoading = ref(true);
  const watchlistModalOpen = ref(false);
  const watchlistLoading = ref(false);
  const watchlistForm = useForm();

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
      listingImage: normalizeImageUrl(data.listingImage),
      listingImageThumb: normalizeImageUrl(data.listingImageThumb),
      extraImages: normalizeImageUrlList(data.extraImages),
      extraImageThumbs: normalizeImageUrlList(data.extraImageThumbs),
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
      fetchHydratedBuyerRequestedRecords(where('uploaderID', '==', user.value.uid), orderBy('timestamp', 'desc')),
      fetchWatchlistByBuyer(user.value.uid),
      fetchUploadPoolByUploader(user.value.uid)
    ]);

    pendingData.value = pendingResult;
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

  async function acceptPendingRequest(data: BuyerRequestedDoc) {
    await createBookMatchedEvent({
      listingId: data.listingId,
      uploaderID: data.uploaderID ?? null,
      buyerID: data.buyerID ?? null,
      subject: data.subject,
      isbn: data.isbn
    });

    sendEmail(
      data.buyerEmail,
      'Your request was accepted on ReadCycle',
      createRequestAcceptedEmail({
        title: data.title ?? 'A book',
        buyerQuantity: data.buyerQuantity,
        uploaderName: data.uploaderName,
        grade: data.grade,
        subject: data.subject
      })
    );
  }

  notifications.acceptRequest = async () => {
    if (!notifications.activeNotification.value) return;

    notifications.notificationLoading.value = true;
    try {
      const item = notifications.activeNotification.value;
      await moveRequestToMatched(item);
      await acceptPendingRequest(item[1]);
      notifications.closeNotification();
      await loadDashboardData();
      toast.success('Request accepted. A chat has been created.');
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message.includes('were cleared') ||
          error.message.includes('no longer exists') ||
          error.message.includes('is invalid')
        )
      ) {
        notifications.closeNotification();
        await loadDashboardData();
      }
      toast.error(error instanceof Error ? error.message : 'Failed to accept request.');
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
      await createWatchlistEntry({
        buyerName: watchlistForm.payload.value.name,
        buyerQuantity: watchlistForm.payload.value.quantity,
        buyerID: user.value.uid,
        title: watchlistForm.payload.value.title,
        subject: watchlistForm.payload.value.subject,
        isbn: watchlistForm.payload.value.isbn,
        grade: watchlistForm.payload.value.grade,
        buyerEmail: user.value.email
      });
      watchlistForm.status.value = 'success';
      watchlistModalOpen.value = false;
      watchlistForm.reset({
        name: user.value.displayName || '',
        quantity: 1
      });
      await loadDashboardData();
      toast.success('Saved to watchlist.');
    } catch (error) {
      watchlistForm.status.value = 'error';
      toast.error('Failed to save watchlist item.');
    } finally {
      watchlistLoading.value = false;
    }
  }

  async function removeUpload(docId: FirestoreRecord<UploadDoc>[0]) {
    await deleteDoc(uploadPoolDoc(docId));
    uploadData.value = uploadData.value.filter(([entryId]) => entryId !== docId);
    toast.info('Upload removed.');
  }

  async function removeWatchlistItem(docId: FirestoreRecord<WatchlistDoc>[0]) {
    await deleteDoc(watchlistDoc(docId));
    watchData.value = watchData.value.filter(([entryId]) => entryId !== docId);
    toast.info('Watchlist item removed.');
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
