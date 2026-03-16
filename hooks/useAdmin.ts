"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { checkIsAdmin } from "@/lib/admin";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    checkIsAdmin(user.uid).then((admin) => {
      setIsAdmin(admin);
      setLoading(false);
    });
  }, [user, authLoading]);

  return { isAdmin, loading };
}
