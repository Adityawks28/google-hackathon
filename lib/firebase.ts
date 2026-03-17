import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  Auth,
} from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
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
  }
  return _auth;
}

function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }
  return _db;
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
