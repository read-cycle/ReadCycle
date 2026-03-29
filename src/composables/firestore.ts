import type { DocumentData, DocumentReference, QuerySnapshot } from 'firebase/firestore';

export type FirestoreRecord<T> = [DocumentReference, T];

export function mapQuerySnapshot<T extends { id?: string }>(
  snapshot: QuerySnapshot<DocumentData>,
  normalize?: (data: DocumentData & { id: string }) => T
) {
  return snapshot.docs.map((entry) => {
    const rawData = { id: entry.id, ...entry.data() } as DocumentData & { id: string };
    return [entry.ref, normalize ? normalize(rawData) : (rawData as T)] as FirestoreRecord<T>;
  });
}
