import { addDoc, collection, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import { ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { db, storage } from '../firebase-init';
import { createWatchlistMatchEmail } from '../emailTemplates';
import type { WatchlistDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { sendEmail } from '../sendEmail';
import { useForm } from './useForm';
import { mapQuerySnapshot } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useRequestNotifications } from './useRequestNotifications';

export function useUploadPage() {
  const { user } = useAuthGuard();
  const toast = useToast();
  const form = useForm();
  const listingImage = ref<File | null>(null);
  const extraImages = ref<File[]>([]);

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

    const watchlistQuery = query(collection(db, 'watchlist'), where('isbn', '==', form.payload.value.isbn));
    const result = await getDocs(watchlistQuery);
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

  async function submitUpload() {
    if (!user.value || !user.value.email) return;
    if (!form.validate(['isbn', 'title', 'grade', 'subject', 'name', 'quantity']) || !listingImage.value) {
      form.errors.value.listingImage = 'Listing image is required.';
      return;
    }

    form.status.value = 'loading';

    try {
      const docRef = await addDoc(collection(db, 'uploadPool'), {
        isbn: form.payload.value.isbn,
        title: form.payload.value.title,
        grade: form.payload.value.grade,
        subject: form.payload.value.subject,
        price: form.payload.value.price ?? 0,
        quantity: form.payload.value.quantity,
        uploaderName: form.payload.value.name,
        uploaderID: user.value.uid,
        uploaderEmail: user.value.email,
        listingImage: '',
        extraImages: [],
        timestamp: serverTimestamp()
      });

      const listingImageRef = storageRef(storage, `uploadPool/${docRef.id}/listingImage/${listingImage.value.name}`);
      await uploadBytes(listingImageRef, listingImage.value);
      const listingImageUrl = await getDownloadURL(listingImageRef);

      const extraImageUrls: string[] = [];
      for (const file of extraImages.value) {
        const imageRef = storageRef(storage, `uploadPool/${docRef.id}/extraImages/${file.name}`);
        await uploadBytes(imageRef, file);
        extraImageUrls.push(await getDownloadURL(imageRef));
      }

      await updateDoc(docRef, {
        listingImage: listingImageUrl,
        extraImages: extraImageUrls
      });

      await addDoc(collection(db, 'stats_events'), {
        eventType: 'book_uploaded',
        listingId: docRef.id,
        uploaderID: user.value.uid,
        subject: form.payload.value.subject,
        isbn: form.payload.value.isbn,
        timestamp: serverTimestamp()
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
      console.error('Upload failed:', error);
      form.status.value = 'error';
      toast.error('Upload failed. Try again.');
    }
  }

  return {
    form,
    listingImage,
    extraImages,
    notifications,
    handleListingImage,
    handleExtraImages,
    submitUpload
  };
}
