"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, signInWithGoogle, signOutUser } from "@/lib/firebase";

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
              const userRef = doc(db, "users", firebaseUser.uid);
              const userSnap = await getDoc(userRef);
              if (!userSnap.exists()) {
                await setDoc(userRef, {
                  email: firebaseUser.email ?? "",
                  displayName: firebaseUser.displayName ?? "",
                  role: "user",
                  createdAt: Date.now(),
                });
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
        }
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
