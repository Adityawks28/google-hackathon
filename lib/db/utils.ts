import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
  WithFieldValue,
  collection,
  CollectionReference,
  Firestore,
} from "firebase/firestore";

/**
 * Creates a generic Firestore converter that:
 * 1. Strips out the ID field (id or uid) when writing to Firestore.
 * 2. Injects the document ID into the specified field when reading from Firestore.
 */
export function createConverter<T extends object>(
  idField: string = "id",
): FirestoreDataConverter<T> {
  return {
    toFirestore(data: WithFieldValue<T>): DocumentData {
      const doc = { ...data } as any;
      delete doc[idField];
      return doc;
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions,
    ): T {
      const data = snapshot.data(options)!;
      return {
        ...data,
        [idField]: snapshot.id,
      } as T;
    },
  };
}

/**
 * Returns a typed collection reference with an attached converter.
 */
export function getTypedCollection<T extends object>(
  collectionName: string,
  db: Firestore,
  idField: string = "id",
): CollectionReference<T> {
  return collection(db, collectionName).withConverter(
    createConverter<T>(idField),
  );
}
