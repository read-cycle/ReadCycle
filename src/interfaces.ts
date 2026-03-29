import type { DocumentReference, Timestamp } from 'firebase/firestore';

export type MetadataValue = string | null;

export interface UploadDoc {
  id?: string;
  isbn: MetadataValue;
  title: MetadataValue;
  grade: MetadataValue;
  subject: MetadataValue;
  price: number;
  quantity: number;
  uploaderName: string;
  listingImage: string;
  extraImages: string[];
  timestamp: Timestamp;
  uploaderEmail: string;
  uploaderID: string;
}

export interface BuyerRequestedDoc {
  id?: string;
  buyerName: string;
  buyerQuantity: number;
  isbn: MetadataValue;
  title: MetadataValue;
  grade: MetadataValue;
  subject: MetadataValue;
  price: number;
  quantity: number;
  uploaderName: string;
  listingImage: string;
  extraImages: string[];
  timestamp: Timestamp;
  uploaderEmail: string;
  buyerEmail: string;
  uploaderID: string;
  buyerID: string;
  listingDoc: DocumentReference;
}

export interface Message {
  text?: string;
  imageUrl?: string;
  imageUrls?: string[];
  sender: string;
  timestamp: Timestamp;
  type: 'text' | 'image' | 'text+image';
  senderID: string;
}

export interface DayMarker {
  text: string;
}

export interface ChatDisplayItem {
  message?: Message;
  dayMarker?: DayMarker;
  type: 'message' | 'daymarker';
}

export interface WatchlistDoc {
  id?: string;
  buyerName: string;
  buyerQuantity: number;
  buyerID: string;
  title: MetadataValue;
  subject: MetadataValue;
  isbn: MetadataValue;
  grade: MetadataValue;
  timestamp: Timestamp;
  buyerEmail: string;
}

export function normalizeMetadataValue(value: unknown): MetadataValue {
  if (typeof value !== 'string') return null;
  const trimmedValue = value.trim();
  return trimmedValue || null;
}
