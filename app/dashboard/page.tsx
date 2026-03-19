"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProblemCard } from "@/components/ProblemCard";
import { ProgressTracker } from "@/components/ProgressTracker";
import Link from "next/link";
import type { Problem, UserProgress } from "@/types";

function DashboardContent() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const makeTimeout = () =>
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Firestore timeout")), 5000),
        );

      setLoading(true);

      try {
        const problemsSnap = await Promise.race([
          getDocs(collection(db, "problems")),
          makeTimeout(),
        ]);
        const problemsList = problemsSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Problem,
        );
        if (cancelled) return;
        setProblems(problemsList);

        if (user) {
          const progressQuery = query(
            collection(db, "progress"),
            where("userId", "==", user.uid),
          );
          const progressSnap = await Promise.race([
            getDocs(progressQuery),
            makeTimeout(),
          ]);
          const progressList = progressSnap.docs.map(
            (d) => d.data() as UserProgress,
          );
          if (cancelled) return;
          setProgress(progressList);
        } else if (!cancelled) {
          setProgress([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const solvedIds = new Set(
    progress.filter((p) => p.solved).map((p) => p.problemId),
  );
  const attemptedCount = progress.filter((p) => p.attempted).length;

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">terminal</span>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Google Hackathon</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/analytics"
              className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">analytics</span>
              Analytics
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin
              </Link>
            )}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">person</span>
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.displayName}</span>
              <button
                onClick={signOut}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 mt-1">Track your coding progress and pick up where you left off.</p>
        </div>

        <ProgressTracker
          attempted={attemptedCount}
          solved={solvedIds.size}
          totalProblems={problems.length}
        />

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">assignment</span>
            Problems
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">inbox</span>
              <p className="text-slate-500">No problems available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {problems.map((problem) => (
                <ProblemCard
                  key={problem.id}
                  id={problem.id}
                  title={problem.title}
                  difficulty={problem.difficulty}
                  solved={solvedIds.has(problem.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
