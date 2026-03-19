"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { userModel } from "@/lib/db";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const prevUid = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      prevUid.current = null;
      // Use a microtask to avoid synchronous setState in effect
      const id = setTimeout(() => {
        setIsAdmin(false);
        setLoading(false);
      }, 0);
      return () => clearTimeout(id);
    }

    // Subscribe to user doc for role changes
    const unsubscribe = userModel.subscribeToRole(user.uid, (role) => {
      setIsAdmin(role === "admin");
      setLoading(false);
    });

    prevUid.current = user.uid;
    return unsubscribe;
  }, [user, authLoading]);

  return { isAdmin, loading };
}
