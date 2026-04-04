import { computed, ref, watch } from 'vue';
import { useToast } from 'vue-toastification';
import type { WatchlistDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { createBookUploadedEvent } from '../repositories/statsRepo';
import { uploadListingImageSet } from '../repositories/storageRepo';
import { createUploadPoolDoc, saveUploadPoolDoc } from '../repositories/uploadPoolRepo';
import { fetchWatchlistByIsbn } from '../repositories/watchlistRepo';
import { sendEmail } from '../sendEmail';
import { createListingImageVariants } from '../utils/imageProcessing';
import { createWatchlistMatchEmail } from '../emailTemplates';
import { mapQuerySnapshot } from './firestore';
import { useAuthGuard } from './useAuthGuard';
import { useBulkUploadForm } from './useBulkUploadForm';
import { useRequestNotifications } from './useRequestNotifications';

export interface BulkUploadBookItem {
  id: string;
  isbn: string;
  title: string;
  subject: string | null;
  grade: string;
  price: number;
  quantity: number;
  listingImage: File | null;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error: string | null;
}

function formatGradeName(raw: string) {
  if (/^\d+$/.test(raw)) return `Grade ${raw}`;
  return raw;
}

export function useBulkUploadPage() {
  const { user } = useAuthGuard();
  const toast = useToast();
  const form = useBulkUploadForm();
  const notifications = useRequestNotifications();
  const books = ref<BulkUploadBookItem[]>([]);
  const selectedBookToAdd = ref('');
  const submissionProgress = ref<{ completed: number; total: number; } | null>(null);
  const bookErrors = ref<Record<string, string>>({});
  const submissionSummary = ref<{ successTitles: string[]; failedTitles: string[]; } | null>(null);

  function createBooksForSelection() {
    const mapping = form.selectedMapping.value;
    if (!mapping || !form.grade.value) return [];

    return Object.entries(mapping.isbnToGrade)
      .filter(([, grade]) => grade === form.grade.value)
      .map(([isbn, grade]) => ({
        id: isbn,
        isbn,
        title: mapping.isbnToTitle[isbn] ?? isbn,
        subject: normalizeMetadataValue(mapping.isbnToSubject[isbn]),
        grade,
        price: form.price.value,
        quantity: form.quantity.value,
        listingImage: null,
        status: 'idle',
        error: null
      }))
      .sort((left, right) => left.title.localeCompare(right.title));
  }

  function syncBooksToSelection() {
    books.value = createBooksForSelection();
    selectedBookToAdd.value = '';
    bookErrors.value = {};
    submissionSummary.value = null;
  }

  watch(
    [form.school, form.grade],
    ([school, grade], [previousSchool, previousGrade]) => {
      if (!school) {
        if (form.grade.value) form.setField('grade', '');
        books.value = [];
        selectedBookToAdd.value = '';
        bookErrors.value = {};
        return;
      }

      const gradeStillExists = form.gradeOptions.value.some((option) => option.value === grade);
      if (grade && !gradeStillExists) {
        form.setField('grade', '');
        books.value = [];
        selectedBookToAdd.value = '';
        bookErrors.value = {};
        return;
      }

      if (school !== previousSchool || grade !== previousGrade) {
        syncBooksToSelection();
      }
    }
  );

  watch(
    user,
    (nextUser) => {
      if (!nextUser) return;
      form.setField('name', nextUser.displayName || '');
    },
    { immediate: true }
  );

  const availableBooks = computed(() => createBooksForSelection());
  const remainingBooks = computed(() =>
    availableBooks.value.filter((book) => !books.value.some((entry) => entry.id === book.id))
  );

  watch([form.price, form.quantity], ([price, quantity]) => {
    books.value = books.value.map((book) => ({
      ...book,
      price: book.status === 'success' ? book.price : price,
      quantity: book.status === 'success' ? book.quantity : quantity
    }));
  });

  function setBookImage(bookId: string, file: File | null) {
    books.value = books.value.map((book) => (
      book.id === bookId
        ? {
            ...book,
            listingImage: file,
            status: book.status === 'success' ? 'success' : 'idle',
            error: null
          }
        : book
    ));
    if (file) delete bookErrors.value[bookId];
  }

  function updateBookField(bookId: string, field: 'price' | 'quantity', value: number) {
    books.value = books.value.map((book) =>
      book.id === bookId
        ? {
            ...book,
            [field]: field === 'price' ? Math.max(0, value) : Math.max(1, Math.trunc(value) || 1),
            status: book.status === 'success' ? 'success' : 'idle',
            error: null
          }
        : book
    );
  }

  function removeBook(bookId: string) {
    books.value = books.value.filter((book) => book.id !== bookId);
    delete bookErrors.value[bookId];
    if (selectedBookToAdd.value === bookId) selectedBookToAdd.value = '';
  }

  function addBook() {
    if (!selectedBookToAdd.value) return;
    const book = remainingBooks.value.find((entry) => entry.id === selectedBookToAdd.value);
    if (!book) return;

    books.value = [...books.value, book].sort((left, right) => left.title.localeCompare(right.title));
    selectedBookToAdd.value = '';
  }

  function validateBookImages() {
    const nextErrors = Object.fromEntries(
      books.value
        .filter((book) => book.status !== 'success')
        .filter((book) => !book.listingImage)
        .map((book) => [book.id, 'Listing image is required.'])
    );

    bookErrors.value = nextErrors;
    return Object.keys(nextErrors).length === 0;
  }

  function validateBookNumbers(book: BulkUploadBookItem) {
    try {
      const parsedPrice = Number(book.price);
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        throw new Error(`"${book.title}" has an invalid price.`);
      }

      const parsedQuantity = Number(book.quantity);
      if (Number.isNaN(parsedQuantity) || parsedQuantity < 1) {
        throw new Error(`"${book.title}" has an invalid quantity.`);
      }

      return {
        price: parsedPrice,
        quantity: Math.max(1, Math.trunc(parsedQuantity))
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : `Invalid values for "${book.title}".`;
      toast.error(message);
      throw error;
    }
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

  async function notifyWatchlistMatches(book: BulkUploadBookItem, numericValues: { price: number; quantity: number; }) {
    const result = await fetchWatchlistByIsbn(book.isbn);
    const watchlistData = mapQuerySnapshot<WatchlistDoc>(result, normalizeWatchlistDoc);

    watchlistData.forEach(([, item]) => {
      sendEmail(
        item.buyerEmail,
        'A book on your ReadCycle watchlist is now available',
        createWatchlistMatchEmail({
          title: book.title,
          grade: formatGradeName(book.grade),
          subject: book.subject,
          quantity: numericValues.quantity,
          price: numericValues.price
        })
      );
    });
  }

  async function uploadBook(book: BulkUploadBookItem) {
    if (!user.value?.email || !book.listingImage) return;
    const numericValues = validateBookNumbers(book);
    const docRef = createUploadPoolDoc();

    const listingImageAssets = await createListingImageVariants(book.listingImage);
    const { listingImageUrl, listingImageThumbUrl } = await uploadListingImageSet(
      docRef.id,
      listingImageAssets.displayFile,
      listingImageAssets.thumbFile
    );

    await saveUploadPoolDoc(docRef.id, {
      isbn: book.isbn,
      title: book.title,
      grade: formatGradeName(book.grade),
      subject: book.subject,
      price: numericValues.price,
      quantity: numericValues.quantity,
      uploaderName: form.name.value.trim(),
      uploaderID: user.value.uid,
      uploaderEmail: user.value.email,
      listingImage: listingImageUrl,
      listingImageThumb: listingImageThumbUrl,
      extraImages: [],
      extraImageThumbs: []
    });

    await createBookUploadedEvent({
      listingId: docRef.id,
      uploaderID: user.value.uid,
      subject: book.subject,
      isbn: book.isbn
    });

    await notifyWatchlistMatches(book, numericValues);
  }

  async function submitBulkUpload() {
    if (!user.value?.email) return;
    if (!form.validate(['school', 'grade', 'name', 'quantity'])) return;
    if (!books.value.length) {
      form.errors.value.books = 'Add at least one book to upload.';
      return;
    }
    delete form.errors.value.books;

    if (!validateBookImages()) return;

    const booksToUpload = books.value.filter((book) => book.status !== 'success');
    if (!booksToUpload.length) {
      toast.info('All books in this batch are already uploaded.');
      return;
    }

    form.status.value = 'loading';
    submissionProgress.value = { completed: 0, total: booksToUpload.length };
    submissionSummary.value = null;

    try {
      const successTitles: string[] = [];
      const failedTitles: string[] = [];

      for (const book of booksToUpload) {
        books.value = books.value.map((entry) =>
          entry.id === book.id ? { ...entry, status: 'uploading', error: null } : entry
        );

        try {
          await uploadBook(book);
          books.value = books.value.map((entry) =>
            entry.id === book.id ? { ...entry, status: 'success', error: null } : entry
          );
          successTitles.push(book.title);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Upload failed.';
          books.value = books.value.map((entry) =>
            entry.id === book.id ? { ...entry, status: 'error', error: message } : entry
          );
          failedTitles.push(book.title);
        }

        submissionProgress.value = submissionProgress.value
          ? { ...submissionProgress.value, completed: submissionProgress.value.completed + 1 }
          : submissionProgress.value;
      }

      submissionSummary.value = { successTitles, failedTitles };

      if (failedTitles.length) {
        form.status.value = 'error';
        toast.warning(`${successTitles.length} uploaded, ${failedTitles.length} failed. Retry only the failed books.`);
      } else {
        form.status.value = 'success';
        toast.success(`Bulk upload complete. ${successTitles.length} books uploaded.`);
      }
    } finally {
      submissionProgress.value = null;
    }
  }

  return {
    form,
    books,
    remainingBooks,
    selectedBookToAdd,
    notifications,
    submissionProgress,
    submissionSummary,
    bookErrors,
    setBookImage,
    updateBookField,
    removeBook,
    addBook,
    submitBulkUpload
  };
}
