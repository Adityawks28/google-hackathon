import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { getTypedCollection } from "@/lib/db/utils";
import { UserSession, ChatMessage, TutorPhase } from "@/types";

export const getSessionCollection = (db: Firestore) =>
  getTypedCollection<UserSession>("user_sessions", db);

export const SessionModel = (db: Firestore) => {
  const colRef = getSessionCollection(db);

  return {
    async getById(
      userId: string,
      problemId: string,
    ): Promise<UserSession | null> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },

    async upsert(
      userId: string,
      problemId: string,
      data: Partial<UserSession>,
    ): Promise<void> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      await setDoc(
        docRef,
        { ...data, userId, problemId, updatedAt: Date.now() },
        { merge: true },
      );
    },

    async setPhase(
      userId: string,
      problemId: string,
      phase: TutorPhase,
    ): Promise<void> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      await setDoc(docRef, { phase, updatedAt: Date.now() }, { merge: true });
    },

    async addMessage(
      userId: string,
      problemId: string,
      mode: "brainstorm" | "help",
      message: ChatMessage,
    ): Promise<void> {
      const id = `${userId}_${problemId}`;
      const docRef = doc(colRef, id);
      const field =
        mode === "brainstorm" ? "brainstormMessages" : "helpMessages";

      await setDoc(
        docRef,
        {
          userId,
          problemId,
          updatedAt: Date.now(),
          [field]: arrayUnion(message),
        },
        { merge: true },
      );
    },
  };
};
