import { userModel } from "@/lib/db";

export async function checkIsAdmin(uid: string): Promise<boolean> {
  try {
    const user = await userModel.getById(uid);
    return user?.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}
