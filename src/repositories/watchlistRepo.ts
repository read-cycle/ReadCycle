import { addDoc, getDocs, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import type { WatchlistDoc } from '../interfaces';
import { watchlistCollection } from './firestoreRefs';

export function createWatchlistByIsbnQuery(isbn: string) {
  return query(watchlistCollection(), where('isbn', '==', isbn));
}

export function createWatchlistByBuyerQuery(buyerId: string) {
  return query(watchlistCollection(), where('buyerID', '==', buyerId), orderBy('timestamp', 'desc'));
}

export async function fetchWatchlistByIsbn(isbn: string) {
  return getDocs(createWatchlistByIsbnQuery(isbn));
}

export async function fetchWatchlistByBuyer(buyerId: string) {
  return getDocs(createWatchlistByBuyerQuery(buyerId));
}

export async function createWatchlistEntry(data: Omit<WatchlistDoc, 'id' | 'timestamp'>) {
  return addDoc(watchlistCollection(), {
    ...data,
    timestamp: serverTimestamp()
  });
}
