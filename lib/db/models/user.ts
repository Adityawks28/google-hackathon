import {
  Firestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  UpdateData,
  onSnapshot,
} from "firebase/firestore";
import { getTypedCollection } from "@/lib/db/utils";
import { AppUser } from "@/types";

export const getUserCollection = (db: Firestore) =>
  getTypedCollection<AppUser>("users", db, "uid");

export const UserModel = (db: Firestore) => {
  const colRef = getUserCollection(db);

  return {
    async getById(uid: string): Promise<AppUser | null> {
      const docRef = doc(colRef, uid);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },

    async getAll(): Promise<AppUser[]> {
      const q = query(colRef);
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data());
    },

    async create(uid: string, data: Omit<AppUser, "uid">): Promise<void> {
      const docRef = doc(colRef, uid);
      await setDoc(docRef, data as AppUser);
    },

    async updateRole(uid: string, role: "user" | "admin"): Promise<void> {
      const docRef = doc(colRef, uid);
      await updateDoc(docRef, { role });
    },

    async update(uid: string, data: UpdateData<AppUser>): Promise<void> {
      const docRef = doc(colRef, uid);
      await updateDoc(docRef, data);
    },

    subscribeToRole(
      uid: string,
      callback: (role: "user" | "admin" | undefined) => void,
    ): () => void {
      const docRef = doc(colRef, uid);
      return onSnapshot(
        docRef,
        (snapshot) => {
          const data = snapshot.data();
          callback(data?.role);
        },
        () => {
          callback(undefined);
        },
      );
    },
  };
};
