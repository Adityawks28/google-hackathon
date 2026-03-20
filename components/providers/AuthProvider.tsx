"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, signInWithGoogle, signOutUser } from "@/lib/firebase";
import { userModel } from "@/lib/db";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          setUser(firebaseUser);
          if (firebaseUser) {
            // Ensure user doc exists in Firestore
            try {
              let currentUser = await userModel.getById(firebaseUser.uid);
              if (!currentUser) {
                await userModel.create(firebaseUser.uid, {
                  email: firebaseUser.email ?? "",
                  displayName: firebaseUser.displayName ?? "",
                  role: "user",
                  createdAt: Date.now(),
                });
                currentUser = await userModel.getById(firebaseUser.uid);
              }

              // Auto-promotion logic: if email is in 'admins' collection, make them admin
              if (firebaseUser.email) {
                const isAuthorizedAdmin = await userModel.isAdminEmail(
                  firebaseUser.email,
                );
                if (isAuthorizedAdmin && currentUser?.role !== "admin") {
                  await userModel.updateRole(firebaseUser.uid, "admin");
                  console.log(`User ${firebaseUser.email} promoted to admin.`);
                }
              }
            } catch (error) {
              console.error("Error saving user doc:", error);
            }
          }
          setLoading(false);
        },
        (error) => {
          console.error("Auth state error:", error);
          setLoading(false);
        },
      );
      return unsubscribe;
    } catch (error) {
      console.error("Auth initialization error:", error);
      requestAnimationFrame(() => setLoading(false));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGoogle, signOut: signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
