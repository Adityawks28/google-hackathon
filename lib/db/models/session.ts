import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { getTypedCollection } from "@/lib/db/utils";
import { UserSession, ChatMessage, TutorPhase } from "@/types";

export const getSessionCollection = (db: Firestore) =>
  getTypedCollection<UserSession>("user_sessions", db);

export const SessionModel = (db: Firestore) => {
  const colRef = getSessionCollection(db);

  return {
    async getById(sessionId: string): Promise<UserSession | null> {
      const docRef = doc(colRef, sessionId);
      const snapshot = await getDoc(docRef);
      return snapshot.exists() ? snapshot.data() : null;
    },

    async listByUserIdAndProblemId(
      userId: string,
      problemId: string,
    ): Promise<UserSession[]> {
      const q = query(
        colRef,
        where("userId", "==", userId),
        where("problemId", "==", problemId),
        orderBy("createdAt", "desc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data());
    },

    async create(userId: string, problemId: string): Promise<UserSession> {
      const timestamp = Date.now();
      const id = `${userId}_${problemId}_${timestamp}`;
      const newSession: UserSession = {
        userId,
        problemId,
        brainstormMessages: [],
        helpMessages: [],
        phase: "brainstorm",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const docRef = doc(colRef, id);
      await setDoc(docRef, newSession);
      return { ...newSession, id };
    },

    async upsert(sessionId: string, data: Partial<UserSession>): Promise<void> {
      const docRef = doc(colRef, sessionId);
      await setDoc(docRef, { ...data, updatedAt: Date.now() }, { merge: true });
    },

    async setPhase(sessionId: string, phase: TutorPhase): Promise<void> {
      const docRef = doc(colRef, sessionId);
      await setDoc(docRef, { phase, updatedAt: Date.now() }, { merge: true });
    },

    async addMessage(
      sessionId: string,
      mode: "brainstorm" | "help",
      message: ChatMessage,
    ): Promise<void> {
      const docRef = doc(colRef, sessionId);
      const field =
        mode === "brainstorm" ? "brainstormMessages" : "helpMessages";

      await setDoc(
        docRef,
        {
          updatedAt: Date.now(),
          [field]: arrayUnion(message),
        },
        { merge: true },
      );
    },
  };
};
