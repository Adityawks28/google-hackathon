"use client";

import { useEffect, useState } from "react";
import { problemModel, progressModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProblemCard } from "@/components/ProblemCard";
import { ProgressTracker } from "@/components/ProgressTracker";
import Link from "next/link";
import type { Problem, UserProgress } from "@/types";

import { Header } from "@/components/Header";

function DashboardContent() {
  const { user } = useAuth();
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
        const problemsList = (await Promise.race([
          problemModel.getAll(),
          makeTimeout(),
        ])) as Problem[];
        if (cancelled) return;
        setProblems(problemsList);

        if (user) {
          const progressList = (await Promise.race([
            progressModel.getByUserId(user.uid),
            makeTimeout(),
          ])) as UserProgress[];
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
      <Header />

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Dashboard
          </h2>
          <p className="text-slate-500 mt-1">
            Track your coding progress and pick up where you left off.
          </p>
        </div>

        <ProgressTracker
          attempted={attemptedCount}
          solved={solvedIds.size}
          totalProblems={problems.length}
        />

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              assignment
            </span>
            Problems
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-slate-200 bg-white">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">
                inbox
              </span>
              <p className="text-slate-500">
                No problems available yet. Check back soon!
              </p>
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
