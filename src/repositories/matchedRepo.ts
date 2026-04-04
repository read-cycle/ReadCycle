import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import type { BuyerRequestedDoc, MatchedChatDoc, Message } from '../interfaces';
import { mapQuerySnapshot, type FirestoreRecord } from '../composables/firestore';
import { matchedCollection, matchedDoc } from './firestoreRefs';
import { normalizeBuyerRequestedDoc } from './buyerRequestsRepo';

function matchedByUploaderQuery(uploaderId: string) {
  return query(matchedCollection(), where('uploaderID', '==', uploaderId), orderBy('timestamp', 'desc'));
}

function matchedByBuyerQuery(buyerId: string) {
  return query(matchedCollection(), where('buyerID', '==', buyerId), orderBy('timestamp', 'desc'));
}

export async function fetchMatchedByUploader(uploaderId: string) {
  return getDocs(matchedByUploaderQuery(uploaderId));
}

export async function fetchMatchedByBuyer(buyerId: string) {
  return getDocs(matchedByBuyerQuery(buyerId));
}

export function normalizeMatchedChatDoc(data: Record<string, unknown> & { id: string }): MatchedChatDoc {
  const base = normalizeBuyerRequestedDoc(data);
  return {
    ...base,
    lastMessagePreview: typeof data.lastMessagePreview === 'string' ? data.lastMessagePreview : '',
    lastMessageTimestamp: data.lastMessageTimestamp as MatchedChatDoc['lastMessageTimestamp'],
    unreadCountForUploader: typeof data.unreadCountForUploader === 'number' ? data.unreadCountForUploader : 0,
    unreadCountForBuyer: typeof data.unreadCountForBuyer === 'number' ? data.unreadCountForBuyer : 0
  };
}

export function mapMatchedSnapshot(snapshot: Awaited<ReturnType<typeof fetchMatchedByUploader>>) {
  return mapQuerySnapshot<MatchedChatDoc>(snapshot, normalizeMatchedChatDoc);
}

export function subscribeToMatchedByUploader(
  uploaderId: string,
  onUpdate: (docs: FirestoreRecord<MatchedChatDoc>[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    matchedByUploaderQuery(uploaderId),
    (snapshot) => {
      onUpdate(mapMatchedSnapshot(snapshot));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export function subscribeToMatchedByBuyer(
  buyerId: string,
  onUpdate: (docs: FirestoreRecord<MatchedChatDoc>[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    matchedByBuyerQuery(buyerId),
    (snapshot) => {
      onUpdate(mapMatchedSnapshot(snapshot));
    },
    (error) => {
      onError?.(error);
    }
  );
}

export function subscribeToMatchedMessages(
  matchRecord: FirestoreRecord<MatchedChatDoc>,
  onUpdate: (messages: Message[]) => void
) {
  return onSnapshot(
    query(collection(matchedDoc(matchRecord[0]), 'messages'), orderBy('timestamp', 'asc')),
    (snapshot) => {
      onUpdate(snapshot.docs.map((entry) => entry.data() as Message));
    }
  );
}

export async function createMatchedMessage(
  matchRecord: FirestoreRecord<MatchedChatDoc>,
  payload: Omit<Message, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> }
) {
  return addDoc(collection(matchedDoc(matchRecord[0]), 'messages'), payload);
}

export async function updateMatchedMessageImages(
  messageRef: Awaited<ReturnType<typeof createMatchedMessage>>,
  imageUrls: string[],
  imageThumbUrls: string[]
) {
  return updateDoc(messageRef, { imageUrls, imageThumbUrls });
}

function clampPreview(text: string) {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (normalized.length <= 80) return normalized;
  return `${normalized.slice(0, 77)}...`;
}

function getUnreadCountField(record: MatchedChatDoc, userId: string) {
  if (record.uploaderID === userId) return 'unreadCountForUploader';
  if (record.buyerID === userId) return 'unreadCountForBuyer';
  return null;
}

function getCounterpartyUnreadField(record: MatchedChatDoc, userId: string) {
  if (record.uploaderID === userId) return 'unreadCountForBuyer';
  if (record.buyerID === userId) return 'unreadCountForUploader';
  return null;
}

export async function markMatchedThreadRead(
  matchRecord: FirestoreRecord<MatchedChatDoc>,
  userId: string
) {
  const unreadField = getUnreadCountField(matchRecord[1], userId);
  if (!unreadField) return;

  await updateDoc(matchedDoc(matchRecord[0]), {
    [unreadField]: 0
  });
}

export async function registerMatchedThreadMessage(
  matchRecord: FirestoreRecord<MatchedChatDoc>,
  senderId: string,
  preview: string
) {
  const ownUnreadField = getUnreadCountField(matchRecord[1], senderId);
  const counterpartyUnreadField = getCounterpartyUnreadField(matchRecord[1], senderId);

  if (!ownUnreadField || !counterpartyUnreadField) return;

  const nextUnreadCount =
    (counterpartyUnreadField === 'unreadCountForBuyer'
      ? matchRecord[1].unreadCountForBuyer
      : matchRecord[1].unreadCountForUploader) ?? 0;

  await updateDoc(matchedDoc(matchRecord[0]), {
    lastMessagePreview: clampPreview(preview),
    lastMessageTimestamp: serverTimestamp(),
    [ownUnreadField]: 0,
    [counterpartyUnreadField]: nextUnreadCount + 1
  });
}
