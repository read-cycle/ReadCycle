import { ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { createWatchlistMatchEmail } from '../emailTemplates';
import type { WatchlistDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { createBookUploadedEvent } from '../repositories/statsRepo';
import { uploadListingExtraImageSet, uploadListingImageSet } from '../repositories/storageRepo';
import { createUploadPoolDoc, saveUploadPoolDoc } from '../repositories/uploadPoolRepo';
import { fetchWatchlistByIsbn } from '../repositories/watchlistRepo';
import { sendEmail } from '../sendEmail';
import { createListingImageVariants } from '../utils/imageProcessing';
import { useForm } from './useForm';
import { mapQuerySnapshot } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useRequestNotifications } from './useRequestNotifications';

const ISBN_RECOMMENDATION_DISMISSED_KEY = 'readcycle-upload-isbn-recommendation-dismissed';

export function useUploadPage() {
  const { user } = useAuthGuard();
  const toast = useToast();
  const form = useForm();
  const listingImage = ref<File | null>(null);
  const extraImages = ref<File[]>([]);
  const isbnRecommendationOpen = ref(false);
  const isbnRecommendationLoading = ref(false);
  const skipIsbnRecommendation = ref(localStorage.getItem(ISBN_RECOMMENDATION_DISMISSED_KEY) === 'true');

  const notifications = useRequestNotifications();

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

  watch(
    user,
    (nextUser) => {
      if (!nextUser) return;
      form.setField('name', nextUser.displayName || '');
    },
    { immediate: true }
  );

  function handleListingImage(file: File | null) {
    listingImage.value = file;
    delete form.errors.value.listingImage;
  }

  function handleExtraImages(files: File[]) {
    extraImages.value = files;
  }

  async function notifyWatchlistMatches() {
    if (!form.payload.value.isbn) return;

    const result = await fetchWatchlistByIsbn(form.payload.value.isbn);
    const watchlistData = mapQuerySnapshot<WatchlistDoc>(result, normalizeWatchlistDoc);

    watchlistData.forEach(([, item]) => {
      sendEmail(
        item.buyerEmail,
        'A book on your ReadCycle watchlist is now available',
        createWatchlistMatchEmail({
          title: form.payload.value.title ?? 'A matching title',
          grade: form.payload.value.grade,
          subject: form.payload.value.subject,
          quantity: form.payload.value.quantity,
          price: form.payload.value.price
        })
      );
    });
  }

  async function performUpload() {
    if (!user.value || !user.value.email) return;

    form.status.value = 'loading';

    try {
      const docRef = createUploadPoolDoc();

      const listingImageAssets = await createListingImageVariants(listingImage.value);
      const { listingImageUrl, listingImageThumbUrl } = await uploadListingImageSet(
        docRef.id,
        listingImageAssets.displayFile,
        listingImageAssets.thumbFile
      );

      const uploadedExtraImages = await Promise.all(
        extraImages.value.map(async (file, index) => {
          const imageAssets = await createListingImageVariants(file);
          return uploadListingExtraImageSet(
            docRef.id,
            index,
            imageAssets.displayFile,
            imageAssets.thumbFile
          );
        })
      );

      const extraImageUrls = uploadedExtraImages.map((entry) => entry.imageUrl);
      const extraImageThumbUrls = uploadedExtraImages.map((entry) => entry.imageThumbUrl);

      await saveUploadPoolDoc(docRef.id, {
        isbn: form.payload.value.isbn,
        title: form.payload.value.title,
        grade: form.payload.value.grade,
        subject: form.payload.value.subject,
        price: form.payload.value.price ?? 0,
        quantity: form.payload.value.quantity,
        uploaderName: form.payload.value.name,
        uploaderID: user.value.uid,
        uploaderEmail: user.value.email,
        listingImage: listingImageUrl,
        listingImageThumb: listingImageThumbUrl,
        extraImages: extraImageUrls,
        extraImageThumbs: extraImageThumbUrls
      });

      await createBookUploadedEvent({
        listingId: docRef.id,
        uploaderID: user.value.uid,
        subject: form.payload.value.subject,
        isbn: form.payload.value.isbn
      });

      await notifyWatchlistMatches();
      form.reset({
        name: user.value.displayName || '',
        price: 0,
        quantity: 1
      });
      listingImage.value = null;
      extraImages.value = [];
      form.status.value = 'success';
      toast.success('Upload complete.');
    } catch (error) {
      form.status.value = 'error';
      toast.error('Upload failed. Try again.');
    }
  }

  async function submitUpload() {
    if (!user.value || !user.value.email) return;
    if (!form.validate(['title', 'price', 'name', 'quantity']) || !listingImage.value) {
      form.errors.value.listingImage = 'Listing image is required.';
      return;
    }

    if (!form.payload.value.isbn && !skipIsbnRecommendation.value) {
      isbnRecommendationOpen.value = true;
      return;
    }

    await performUpload();
  }

  function closeIsbnRecommendation() {
    isbnRecommendationOpen.value = false;
  }

  async function confirmUploadWithoutIsbn() {
    if (skipIsbnRecommendation.value) {
      localStorage.setItem(ISBN_RECOMMENDATION_DISMISSED_KEY, 'true');
    } else {
      localStorage.removeItem(ISBN_RECOMMENDATION_DISMISSED_KEY);
    }

    isbnRecommendationLoading.value = true;
    isbnRecommendationOpen.value = false;
    try {
      await performUpload();
    } finally {
      isbnRecommendationLoading.value = false;
    }
  }

  return {
    form,
    listingImage,
    extraImages,
    isbnRecommendationOpen,
    isbnRecommendationLoading,
    skipIsbnRecommendation,
    notifications,
    handleListingImage,
    handleExtraImages,
    closeIsbnRecommendation,
    confirmUploadWithoutIsbn,
    submitUpload
  };
}
