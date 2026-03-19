import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  runTransaction,
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

    async markSolved(userId: string, problemId: string): Promise<void> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(docRef);
        const alreadySolved = existing.exists() && existing.data().solved;
        transaction.set(
          docRef,
          {
            userId,
            problemId,
            attempted: true,
            solved: alreadySolved || true,
            lastAttemptAt: Date.now(),
          },
          { merge: true },
        );
      });
    },

    async addHint(
      userId: string,
      problemId: string,
      hintLevel: number,
    ): Promise<void> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      await runTransaction(db, async (transaction) => {
        const existing = await transaction.get(docRef);
        const currentHistory = existing.exists()
          ? (existing.data().hintHistory ?? [])
          : [];
        transaction.set(
          docRef,
          {
            userId,
            problemId,
            attempted: true,
            hintHistory: [...currentHistory, hintLevel],
            lastAttemptAt: Date.now(),
          },
          { merge: true },
        );
      });
    },
  };
};
