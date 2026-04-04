import { collection, doc } from 'firebase/firestore';
import { db } from '../firebase-init';
import { COLLECTIONS } from './firebasePaths';

export const uploadPoolCollection = () => collection(db, COLLECTIONS.uploadPool);
export const watchlistCollection = () => collection(db, COLLECTIONS.watchlist);
export const buyerRequestedCollection = () => collection(db, COLLECTIONS.buyerRequested);
export const matchedCollection = () => collection(db, COLLECTIONS.matched);
export const statsEventsCollection = () => collection(db, COLLECTIONS.statsEvents);

export const uploadPoolDoc = (id?: string) => (id ? doc(db, COLLECTIONS.uploadPool, id) : doc(uploadPoolCollection()));
export const watchlistDoc = (id: string) => doc(db, COLLECTIONS.watchlist, id);
export const buyerRequestedDoc = (id: string) => doc(db, COLLECTIONS.buyerRequested, id);
export const matchedDoc = (id: string) => doc(db, COLLECTIONS.matched, id);
