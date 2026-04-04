import {
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  type DocumentData,
  type Query,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type Unsubscribe
} from 'firebase/firestore';
import type { UploadDoc } from '../interfaces';
import { mapQuerySnapshot, type FirestoreRecord } from '../composables/firestore';
import { normalizeMetadataValue } from '../interfaces';
import { normalizeImageUrl, normalizeImageUrlList } from '../utils/imageUrls';
import { uploadPoolCollection, uploadPoolDoc } from './firestoreRefs';

export function normalizeUploadDoc(data: Record<string, unknown> & { id: string }): UploadDoc {
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

export function createUploadPoolDoc() {
  return uploadPoolDoc();
}

export async function saveUploadPoolDoc(
  docId: string,
  data: Omit<UploadDoc, 'id' | 'timestamp'>
) {
  return setDoc(uploadPoolDoc(docId), {
    ...data,
    timestamp: serverTimestamp()
  });
}

function createUploadPoolQuery(maxItems?: number): Query {
  const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')];
  if (typeof maxItems === 'number') constraints.push(limit(maxItems));
  return query(uploadPoolCollection(), ...constraints);
}

export function createUploadPoolByUploaderQuery(uploaderId: string) {
  return query(uploadPoolCollection(), where('uploaderID', '==', uploaderId), orderBy('timestamp', 'desc'));
}

export async function fetchUploadPoolByUploader(uploaderId: string) {
  return getDocs(createUploadPoolByUploaderQuery(uploaderId));
}

export async function fetchUploadPoolDocs(maxItems?: number) {
  const snapshot = await getDocs(createUploadPoolQuery(maxItems));
  return mapQuerySnapshot<UploadDoc>(snapshot, normalizeUploadDoc);
}

export async function fetchUploadPoolPage(
  pageSize = 20,
  cursor?: QueryDocumentSnapshot<DocumentData> | null
) {
  const constraints: QueryConstraint[] = [orderBy('timestamp', 'desc')];

  if (cursor) constraints.push(startAfter(cursor));

  constraints.push(limit(pageSize));

  const snapshot = await getDocs(query(uploadPoolCollection(), ...constraints));

  return {
    docs: mapQuerySnapshot<UploadDoc>(snapshot, normalizeUploadDoc),
    cursor: snapshot.docs.at(-1) ?? null,
    hasMore: snapshot.docs.length === pageSize
  };
}

export function subscribeToUploadPool(
  onUpdate: (docs: FirestoreRecord<UploadDoc>[]) => void,
  onError?: (error: Error) => void,
  maxItems?: number
): Unsubscribe {
  return onSnapshot(
    createUploadPoolQuery(maxItems),
    (snapshot) => {
      onUpdate(mapQuerySnapshot<UploadDoc>(snapshot, normalizeUploadDoc));
    },
    (error) => {
      onError?.(error);
    }
  );
}
