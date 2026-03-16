/**
 * Seed admin script — run this once to promote a user to admin.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts <user-uid>
 *
 * To find your UID:
 *   1. Sign in to the app with Google
 *   2. Open browser console and run: JSON.parse(Object.values(sessionStorage).find(v => v.includes('"uid"'))).uid
 *   3. Or check Firebase Console → Authentication → Users
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: npx tsx scripts/seed-admin.ts <user-uid>");
  process.exit(1);
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedAdmin() {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    await setDoc(userRef, { role: "admin" }, { merge: true });
    console.log(`Updated existing user ${uid} to admin.`);
  } else {
    await setDoc(userRef, {
      email: "admin@manual",
      displayName: "Admin",
      role: "admin",
      createdAt: Date.now(),
    });
    console.log(`Created new admin user doc for ${uid}.`);
  }

  console.log("Done! Refresh the app to see admin access.");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
