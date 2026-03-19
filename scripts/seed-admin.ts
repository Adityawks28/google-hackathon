/**
 * Seed admin script — run this once to promote a user to admin.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts <user-uid>
 */

import { userModel } from "@/lib/db";

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: npx tsx scripts/seed-admin.ts <user-uid>");
  process.exit(1);
}

async function seedAdmin() {
  const user = await userModel.getById(uid);

  if (user) {
    await userModel.updateRole(uid, "admin");
    console.log(`Updated existing user ${uid} to admin.`);
  } else {
    await userModel.create(uid, {
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
