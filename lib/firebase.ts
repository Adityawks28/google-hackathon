import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  Auth,
  connectAuthEmulator,
} from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "google-hackathon",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;

function getFirebaseApp(): FirebaseApp {
  if (!_app) {
    _app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return _app;
}

function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getFirebaseApp());
    if (process.env.NODE_ENV === "development") {
      connectAuthEmulator(_auth, "http://127.0.0.1:9099");
    }
  }

  return _auth;
}

function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
    if (process.env.NODE_ENV === "development") {
      connectFirestoreEmulator(_db, "127.0.0.1", 8080);
    }
  }
  return _db;
}

export function getFirebaseStorage() {
  const storage = getStorage(getFirebaseApp());
  if (process.env.NODE_ENV === "development") {
    connectStorageEmulator(storage, "127.0.0.1", 9199);
  }

  return storage;
}

// Use getter properties so Firebase only initializes when accessed client-side
export const app = typeof window !== "undefined" ? getFirebaseApp() : (undefined as unknown as FirebaseApp);
export const auth = typeof window !== "undefined" ? getFirebaseAuth() : (undefined as unknown as Auth);
export const db = typeof window !== "undefined" ? getFirebaseDb() : (undefined as unknown as Firestore);

export async function signInWithGoogle() {
  const googleProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(getFirebaseAuth(), googleProvider);

  return result.user;
}

export async function signOutUser() {
  await firebaseSignOut(getFirebaseAuth());
}
