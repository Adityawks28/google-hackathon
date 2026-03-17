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
  const [filter, setFilter] = useState<"all" | "easy" | "medium" | "hard">(
    "all",
  );

  useEffect(() => {
    async function fetchData() {
      // Timeout to prevent hanging if Firestore rules block the request
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Firestore timeout")), 5000),
      );

      try {
        const problemsSnap = await Promise.race([
          getDocs(collection(db, "problems")),
          timeout,
        ]);
        const problemsList = problemsSnap.docs.map(
          (d) => ({ id: d.id, ...d.data() }) as Problem,
        );
        setProblems(problemsList);

        if (user) {
          const progressQuery = query(
            collection(db, "progress"),
            where("userId", "==", user.uid),
          );
          const progressSnap = await Promise.race([
            getDocs(progressQuery),
            timeout,
          ]);
          const progressList = progressSnap.docs.map(
            (d) => d.data() as UserProgress,
          );
          setProgress(progressList);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const solvedIds = new Set(
    progress.filter((p) => p.solved).map((p) => p.problemId),
  );
  const attemptedCount = progress.filter((p) => p.attempted).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Google Hackathon</h1>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Admin
              </Link>
            )}
            <span className="text-sm text-gray-600">{user?.displayName}</span>
            <button
              onClick={signOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <ProgressTracker
          attempted={attemptedCount}
          solved={solvedIds.size}
          totalProblems={problems.length}
        />

        <div className="mb-4 mt-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Problems</h2>
          <div className="flex gap-2">
            {(["all", "easy", "medium", "hard"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  filter === level
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading problems...</p>
        ) : problems.length === 0 ? (
          <p className="text-gray-500">
            No problems available yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-3">
            {problems
              .filter((p) => filter === "all" || p.difficulty === filter)
              .map((problem) => (
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
