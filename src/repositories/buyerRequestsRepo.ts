import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type QueryConstraint,
  type Unsubscribe
} from 'firebase/firestore';
import type { BuyerRequestedDoc, UploadDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { normalizeImageUrl, normalizeImageUrlList } from '../utils/imageUrls';
import { db } from '../firebase-init';
import { mapQuerySnapshot, type FirestoreRecord } from '../composables/firestore';
import { buyerRequestedCollection, buyerRequestedDoc, matchedDoc, uploadPoolDoc } from './firestoreRefs';
import { normalizeUploadDoc } from './uploadPoolRepo';

export type BuyerRequestRecord = FirestoreRecord<BuyerRequestedDoc>;

function createEmptyListingFields() {
  return {
    isbn: null,
    title: null,
    grade: null,
    subject: null,
    price: 0,
    quantity: 0,
    uploaderName: '',
    listingImage: '',
    listingImageThumb: '',
    extraImages: [],
    extraImageThumbs: [],
    uploaderEmail: '',
    uploaderID: ''
  } satisfies Pick<
    BuyerRequestedDoc,
    | 'isbn'
    | 'title'
    | 'grade'
    | 'subject'
    | 'price'
    | 'quantity'
    | 'uploaderName'
    | 'listingImage'
    | 'listingImageThumb'
    | 'extraImages'
    | 'extraImageThumbs'
    | 'uploaderEmail'
    | 'uploaderID'
  >;
}

export function normalizeBuyerRequestedDoc(data: Record<string, unknown> & { id: string }): BuyerRequestedDoc {
  const fallbackListingFields = createEmptyListingFields();

  return {
    id: data.id,
    buyerName: typeof data.buyerName === 'string' ? data.buyerName : '',
    buyerQuantity: typeof data.buyerQuantity === 'number' ? data.buyerQuantity : 0,
    ...fallbackListingFields,
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
    timestamp: data.timestamp as BuyerRequestedDoc['timestamp'],
    uploaderEmail: typeof data.uploaderEmail === 'string' ? data.uploaderEmail : '',
    buyerEmail: typeof data.buyerEmail === 'string' ? data.buyerEmail : '',
    uploaderID: typeof data.uploaderID === 'string' ? data.uploaderID : '',
    buyerID: typeof data.buyerID === 'string' ? data.buyerID : '',
    listingId: typeof data.listingId === 'string' ? data.listingId : ''
  };
}

function resolveListingFields(
  requestData: BuyerRequestedDoc,
  listingData?: Partial<UploadDoc> | null
) {
  if (!listingData) return requestData;

  return {
    ...requestData,
    isbn: normalizeMetadataValue(listingData.isbn) ?? requestData.isbn,
    title: normalizeMetadataValue(listingData.title) ?? requestData.title,
    grade: normalizeMetadataValue(listingData.grade) ?? requestData.grade,
    subject: normalizeMetadataValue(listingData.subject) ?? requestData.subject,
    price: typeof listingData.price === 'number' ? listingData.price : requestData.price,
    quantity: typeof listingData.quantity === 'number' ? listingData.quantity : requestData.quantity,
    uploaderName: typeof listingData.uploaderName === 'string' ? listingData.uploaderName : requestData.uploaderName,
    listingImage: normalizeImageUrl(listingData.listingImage) || requestData.listingImage,
    listingImageThumb: normalizeImageUrl(listingData.listingImageThumb) || requestData.listingImageThumb,
    extraImages: normalizeImageUrlList(listingData.extraImages).length ? normalizeImageUrlList(listingData.extraImages) : requestData.extraImages,
    extraImageThumbs: normalizeImageUrlList(listingData.extraImageThumbs).length ? normalizeImageUrlList(listingData.extraImageThumbs) : requestData.extraImageThumbs,
    uploaderEmail: typeof listingData.uploaderEmail === 'string' ? listingData.uploaderEmail : requestData.uploaderEmail,
    uploaderID: typeof listingData.uploaderID === 'string' ? listingData.uploaderID : requestData.uploaderID
  };
}

export function createBuyerRequestedQuery(...constraints: QueryConstraint[]) {
  return query(buyerRequestedCollection(), ...constraints);
}

export async function createBuyerRequestedEntry(data: Omit<BuyerRequestedDoc, 'id' | 'timestamp'>) {
  return addDoc(buyerRequestedCollection(), {
    ...data,
    timestamp: serverTimestamp()
  });
}

export async function hydrateBuyerRequestedRecord(record: BuyerRequestRecord): Promise<BuyerRequestRecord> {
  const [requestId, requestData] = record;

  try {
    if (!requestData.listingId) return record;

    const listingSnapshot = await getDoc(uploadPoolDoc(requestData.listingId));
    if (!listingSnapshot.exists()) return record;

    const listingData = normalizeUploadDoc({ id: listingSnapshot.id, ...listingSnapshot.data() });
    return [requestId, resolveListingFields(requestData, listingData)];
  } catch (error) {
    return record;
  }
}

export async function hydrateBuyerRequestedRecords(records: BuyerRequestRecord[]) {
  return Promise.all(records.map(hydrateBuyerRequestedRecord));
}

export async function fetchHydratedBuyerRequestedRecords(...constraints: QueryConstraint[]) {
  const snapshot = await getDocs(createBuyerRequestedQuery(...constraints));
  return hydrateBuyerRequestedRecords(mapQuerySnapshot<BuyerRequestedDoc>(snapshot, normalizeBuyerRequestedDoc));
}

export function subscribeToHydratedBuyerRequests(
  constraints: QueryConstraint[],
  onUpdate: (docs: BuyerRequestRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  let requestToken = 0;

  return onSnapshot(
    createBuyerRequestedQuery(...constraints),
    async (snapshot) => {
      const token = ++requestToken;
      const docs = await hydrateBuyerRequestedRecords(
        mapQuerySnapshot<BuyerRequestedDoc>(snapshot, normalizeBuyerRequestedDoc)
      );

      if (token === requestToken) {
        onUpdate(docs);
      }
    },
    (error) => {
      onError?.(error);
    }
  );
}

async function deleteRequestsForListing(
  listingId: string,
  predicate?: (data: BuyerRequestedDoc, requestId: string) => boolean
) {
  const siblingSnapshot = await getDocs(
    query(buyerRequestedCollection(), where('listingId', '==', listingId))
  );

  if (siblingSnapshot.empty) return;

  const batch = writeBatch(db);
  let hasWrites = false;

  siblingSnapshot.docs.forEach((entry) => {
    const requestData = normalizeBuyerRequestedDoc({ id: entry.id, ...entry.data() });
    const shouldDelete = predicate ? predicate(requestData, entry.id) : true;
    if (!shouldDelete) return;
    batch.delete(buyerRequestedDoc(entry.id));
    hasWrites = true;
  });

  if (hasWrites) {
    await batch.commit();
  }
}

export async function deleteBuyerRequest(record: BuyerRequestRecord) {
  await deleteDoc(buyerRequestedDoc(record[0]));
}

export async function moveRequestToMatched([requestId, data]: BuyerRequestRecord) {
  if (!data.listingId) {
    await deleteDoc(buyerRequestedDoc(requestId));
    throw new Error('Listing reference is missing.');
  }

  const listingRef = uploadPoolDoc(data.listingId);
  const listingSnapshot = await getDoc(listingRef);

  if (!listingSnapshot.exists()) {
    await deleteRequestsForListing(data.listingId);
    throw new Error('Listing no longer exists. Related requests were cleared.');
  }

  const listingData = normalizeUploadDoc({ id: listingSnapshot.id, ...listingSnapshot.data() });
  const currentQuantity = typeof listingData.quantity === 'number' ? listingData.quantity : 0;
  const requestedQuantity = typeof data.buyerQuantity === 'number' ? data.buyerQuantity : 0;

  if (requestedQuantity < 1) {
    await deleteDoc(buyerRequestedDoc(requestId));
    throw new Error('Requested quantity is invalid.');
  }

  if (requestedQuantity > currentQuantity) {
    await deleteRequestsForListing(
      data.listingId,
      (requestData, siblingRequestId) =>
        siblingRequestId === requestId ||
        (typeof requestData.buyerQuantity === 'number' ? requestData.buyerQuantity : 0) > currentQuantity
    );
    throw new Error('Requested quantity exceeds the remaining listing quantity. Invalid requests were cleared.');
  }

  const remainingQuantity = currentQuantity - requestedQuantity;
  const siblingSnapshot = await getDocs(
    query(buyerRequestedCollection(), where('listingId', '==', data.listingId))
  );
  const batch = writeBatch(db);

  batch.set(matchedDoc(requestId), {
    ...resolveListingFields(data, listingData),
    listingId: data.listingId,
    lastMessagePreview: '',
    lastMessageTimestamp: data.timestamp,
    unreadCountForUploader: 0,
    unreadCountForBuyer: 0
  });

  if (remainingQuantity === 0) {
    batch.delete(listingRef);
  } else {
    batch.update(listingRef, {
      quantity: remainingQuantity
    });
  }

  siblingSnapshot.docs.forEach((entry) => {
    const requestData = normalizeBuyerRequestedDoc({ id: entry.id, ...entry.data() });
    const siblingQuantity = typeof requestData.buyerQuantity === 'number' ? requestData.buyerQuantity : 0;
    const shouldDelete =
      entry.id === requestId ||
      remainingQuantity === 0 ||
      siblingQuantity > remainingQuantity;

    if (shouldDelete) {
      batch.delete(buyerRequestedDoc(entry.id));
    }
  });

  await batch.commit();
}
