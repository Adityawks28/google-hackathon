"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { checkIsAdmin } from "@/lib/admin";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdmin = useCallback(async (uid: string) => {
    const admin = await checkIsAdmin(uid);
    setIsAdmin(admin);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Derive state without calling setState synchronously in effect body
      const id = requestAnimationFrame(() => {
        setIsAdmin(false);
        setLoading(false);
      });
      return () => cancelAnimationFrame(id);
    }

    checkAdmin(user.uid);
  }, [user, authLoading, checkAdmin]);

  return { isAdmin, loading };
}
