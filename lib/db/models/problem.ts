import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  addDoc,
} from "firebase/firestore";
import { getTypedCollection } from "@/lib/db/utils";
import { Problem } from "@/types";

export const getProblemCollection = (db: Firestore) =>
  getTypedCollection<Problem>("problems", db);

export const ProblemModel = (db: Firestore) => {
  const colRef = getProblemCollection(db);

  return {
    async getById(id: string): Promise<Problem | null> {
      const docRef = doc(colRef, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },

    async getAll(): Promise<Problem[]> {
      const q = query(colRef);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data());
    },

    async create(data: Omit<Problem, "id">, id?: string): Promise<string> {
      if (id) {
        const docRef = doc(colRef, id);
        await setDoc(docRef, data as Problem);
        return id;
      } else {
        const docRef = await addDoc(colRef, data as Problem);
        return docRef.id;
      }
    },

    async update(
      id: string,
      data: Partial<Omit<Problem, "id">>,
    ): Promise<void> {
      const docRef = doc(colRef, id);
      await updateDoc(docRef, data as any);
    },

    async delete(id: string): Promise<void> {
      const docRef = doc(colRef, id);
      await deleteDoc(docRef);
    },
  };
};
