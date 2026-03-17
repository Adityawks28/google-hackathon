import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (!userDoc.exists()) return false;
    return userDoc.data().role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
