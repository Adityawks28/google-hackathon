/**
 * Seed admin script — run this to promote a user or email to admin.
 *
 * Usage (Promote UID):
 *   npx tsx scripts/seed-admin.ts uid <user-uid>
 *
 * Usage (Promote Email):
 *   npx tsx scripts/seed-admin.ts email <user-email>
 */

import { userModel } from "@/lib/db";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const type = process.argv[2];
const identifier = process.argv[3];

if (!type || !identifier || (type !== "uid" && type !== "email")) {
  console.error("Usage:");
  console.error("  npx tsx scripts/seed-admin.ts uid <user-uid>");
  console.error("  npx tsx scripts/seed-admin.ts email <user-email>");
  process.exit(1);
}

async function seedAdmin() {
  if (type === "uid") {
    const user = await userModel.getById(identifier);
    if (user) {
      await userModel.updateRole(identifier, "admin");
      console.log(`Updated existing user ${identifier} to admin.`);
    } else {
      await userModel.create(identifier, {
        email: "admin@manual",
        displayName: "Admin",
        role: "admin",
        createdAt: Date.now(),
      });
      console.log(`Created new admin user doc for ${identifier}.`);
    }
  } else {
    // Promote by email in the 'admins' collection
    const adminDocRef = doc(db, "admins", identifier);
    await setDoc(adminDocRef, {
      enabled: true,
      addedAt: Date.now(),
    });
    console.log(`Email ${identifier} added to 'admins' collection.`);
    console.log(
      "The user will be promoted to admin automatically on their next sign-in.",
    );
  }

  console.log("Done!");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
