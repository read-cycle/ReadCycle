import {
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Query,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase-init';
import type { UploadDoc } from '../interfaces';
import { normalizeMetadataValue } from '../interfaces';
import { mapQuerySnapshot, type FirestoreRecord } from './firestore';

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
    listingImage: typeof data.listingImage === 'string' ? data.listingImage : '',
    extraImages: Array.isArray(data.extraImages) ? data.extraImages.filter((entry): entry is string => typeof entry === 'string') : [],
    timestamp: data.timestamp as UploadDoc['timestamp'],
    uploaderEmail: typeof data.uploaderEmail === 'string' ? data.uploaderEmail : '',
    uploaderID: typeof data.uploaderID === 'string' ? data.uploaderID : ''
  };
}

function createUploadPoolQuery(maxItems?: number): Query {
  const constraints = [orderBy('timestamp', 'desc')];
  if (typeof maxItems === 'number') constraints.push(limit(maxItems));
  return query(collection(db, 'uploadPool'), ...constraints);
}

export async function fetchUploadPoolDocs(maxItems?: number) {
  const snapshot = await getDocs(createUploadPoolQuery(maxItems));
  return mapQuerySnapshot<UploadDoc>(snapshot, normalizeUploadDoc);
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
