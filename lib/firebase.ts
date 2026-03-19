import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  Auth,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import {
  getStorage,
  connectStorageEmulator,
  FirebaseStorage,
} from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "localhost",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-google-hackathon",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "demo-google-hackathon.appspot.com",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef123456",
};

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

let _authEmulatorConnected = false;
let _dbEmulatorConnected = false;
let _storageEmulatorConnected = false;

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

  // Use emulators if not production; handles undefined NODE_ENV in CI/local.
  if (process.env.NODE_ENV !== "production" && !_authEmulatorConnected) {
    connectAuthEmulator(_auth, "http://127.0.0.1:9099");
    _authEmulatorConnected = true;
  }

  return _auth;
}

function getFirebaseDb(): Firestore {
  if (!_db) {
    _db = getFirestore(getFirebaseApp());
  }

  // Use emulators if not production; handles undefined NODE_ENV in CI/local.
  if (process.env.NODE_ENV !== "production" && !_dbEmulatorConnected) {
    connectFirestoreEmulator(_db, "127.0.0.1", 8080);
    _dbEmulatorConnected = true;
  }

  return _db;
}

export function getFirebaseStorage() {
  if (typeof window === "undefined") {
    return undefined as unknown as FirebaseStorage;
  }

  if (!_storage) {
    _storage = getStorage(getFirebaseApp());
  }

  // Use emulators if not production; handles undefined NODE_ENV in CI/local.
  if (process.env.NODE_ENV !== "production" && !_storageEmulatorConnected) {
    connectStorageEmulator(_storage, "127.0.0.1", 9199);
    _storageEmulatorConnected = true;
  }

  return _storage;
}

// Use getters to ensure Firebase is initialized only when needed
// TODO: Tech Debt - API routes and server scripts currently use the Firebase client SDK (app, db).
// Ideally, server-side data access should be migrated to use `firebase-admin` for proper server auth and pooling.
export const app = getFirebaseApp();
export const auth =
  typeof window !== "undefined"
    ? getFirebaseAuth()
    : (undefined as unknown as Auth);
export const db = getFirebaseDb();

export async function signInWithGoogle() {
  const googleProvider = new GoogleAuthProvider();
  const result = await signInWithPopup(getFirebaseAuth(), googleProvider);

  return result.user;
}

export async function signOutUser() {
  await firebaseSignOut(getFirebaseAuth());
}
