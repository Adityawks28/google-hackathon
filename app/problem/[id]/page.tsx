"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTutor } from "@/hooks/useTutor";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function ProblemRedirect() {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const { user } = useAuth();
  const router = useRouter();
  const { phase, isLoaded } = useTutor(problemId, user?.uid);

  useEffect(() => {
    if (isLoaded) {
      if (phase === "brainstorm") {
        router.replace(`/problem/brainstorm/${problemId}`);
      } else {
        router.replace(`/problem/code/${problemId}`);
      }
    }
  }, [phase, isLoaded, problemId, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function ProblemPage() {
  return (
    <ProtectedRoute>
      <ProblemRedirect />
    </ProtectedRoute>
  );
}
