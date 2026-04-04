import { addDoc, serverTimestamp } from 'firebase/firestore';
import { statsEventsCollection } from './firestoreRefs';

export async function createBookUploadedEvent(data: {
  listingId: string;
  uploaderID: string;
  subject: string | null;
  isbn: string | null;
}) {
  return addDoc(statsEventsCollection(), {
    eventType: 'book_uploaded',
    ...data,
    timestamp: serverTimestamp()
  });
}

export async function createBookMatchedEvent(data: {
  listingId: string;
  uploaderID: string | null;
  buyerID: string | null;
  subject: string | null;
  isbn: string | null;
}) {
  return addDoc(statsEventsCollection(), {
    eventType: 'book_matched',
    ...data,
    timestamp: serverTimestamp()
  });
}
