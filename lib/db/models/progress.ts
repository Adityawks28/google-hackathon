import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { getTypedCollection } from "@/lib/db/utils";
import { UserProgress } from "@/types";

export const getProgressCollection = (db: Firestore) =>
  getTypedCollection<UserProgress>("progress", db);

export const ProgressModel = (db: Firestore) => {
  const colRef = getProgressCollection(db);

  return {
    async getById(id: string): Promise<UserProgress | null> {
      const docRef = doc(colRef, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },

    async getByUserAndProblem(
      userId: string,
      problemId: string,
    ): Promise<UserProgress | null> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },

    async getByUserId(userId: string): Promise<UserProgress[]> {
      const q = query(colRef, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data());
    },

    async update(id: string, data: Partial<UserProgress>): Promise<void> {
      const docRef = doc(colRef, id);
      await setDoc(docRef, data, { merge: true });
    },
  };
};
