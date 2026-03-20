"use client";

import { useEffect, useState, ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { problemModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTutor, type UseTutorReturn } from "@/hooks/useTutor";
import type { Problem } from "@/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

interface ProblemLayoutProps {
  children: (tutor: UseTutorReturn, problem: Problem) => ReactNode;
}

export function ProblemLayout({ children }: ProblemLayoutProps) {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const pathname = usePathname();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  const tutor: UseTutorReturn = useTutor(problemId, user?.uid);
  const { phase, hintLevel, helpHistory } = tutor;

  useEffect(() => {
    async function fetchProblem() {
      try {
        const data = await problemModel.getById(problemId);
        if (data) {
          setProblem(data);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        setFetchError(true);
      } finally {
        setLoadingProblem(false);
      }
    }

    fetchProblem();
  }, [problemId]);

  if (loadingProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (fetchError || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-3">
            error
          </span>
          <p className="text-red-500 font-medium">{!problem ? "Problem not found." : "Failed to load problem."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hintsFromProblem = problem?.hints || [];
  
  const hints = helpHistory
    .filter((msg) => msg.role === "assistant" && msg.hintLevel !== null && msg.hintLevel > 0)
    .reduce((acc, msg) => {
      if (!acc[msg.hintLevel!]) {
        acc[msg.hintLevel!] = msg.content;
      }
      return acc;
    }, {} as Record<number, string>);

  const displayHints = hintsFromProblem.length > 0 
    ? hintsFromProblem.slice(0, hintLevel).reduce((acc, hint, i) => {
        acc[i + 1] = hint;
        return acc;
      }, {} as Record<number, string>)
    : hints;

  const isBrainstorm = pathname?.includes("/brainstorm");

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-background-light">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-lg h-9 w-9 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">
                arrow_back
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold tracking-tight text-slate-900">
                {problem.title}
              </h2>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/problem/brainstorm/${problemId}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isBrainstorm
                  ? "bg-accent-purple text-white shadow-sm"
                  : "bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                psychology
              </span>
              Brainstorm
            </Link>
            <Link
              href={`/problem/code/${problemId}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                !isBrainstorm
                  ? "bg-primary text-white shadow-sm"
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                code
              </span>
              Coding
            </Link>
          </div>
        </header>

        {/* Main Split View */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left Panel: Problem Description */}
          <section className="w-1/2 flex flex-col border-r border-slate-200 bg-white overflow-hidden">
            {/* Problem Section */}
            <div className={`${hintLevel > 0 ? "h-3/5" : "h-full"} overflow-y-auto custom-scrollbar`}>
              <div className="p-8 max-w-2xl mx-auto w-full">
                <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
                  {problem.title}
                </h1>
                <div className="flex items-center gap-3 mb-8">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      problem.difficulty === "easy"
                        ? "bg-emerald-50 text-emerald-600"
                        : problem.difficulty === "medium"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-red-50 text-red-600"
                    }`}
                  >
                    {problem.difficulty.charAt(0).toUpperCase() +
                      problem.difficulty.slice(1)}
                  </span>
                </div>
                <div className="text-slate-600 leading-relaxed mb-8 prose prose-slate max-w-none">
                  <ReactMarkdown>{problem.description}</ReactMarkdown>
                </div>

                {/* Test Cases */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                    <span className="material-symbols-outlined text-primary">
                      rule
                    </span>
                    Test Cases
                  </h3>
                  <div className="space-y-3">
                    {problem.testCases.map((tc, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                      >
                        <p className="text-sm font-mono break-all">
                          <span className="font-bold text-slate-700">Input:</span>{" "}
                          <span className="text-slate-600">{tc.input}</span>
                        </p>
                        <p className="text-sm font-mono mt-1 break-all">
                          <span className="font-bold text-slate-700">
                            Expected:
                          </span>{" "}
                          <span className="text-accent-purple">
                            {tc.expectedOutput}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Revealed Hints Section */}
            {hintLevel > 0 && (
              <div className="h-2/5 border-t border-slate-200 bg-slate-50/50 overflow-y-auto custom-scrollbar">
                <div className="p-8 max-w-2xl mx-auto w-full">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900 mb-6">
                    <span className="material-symbols-outlined text-primary">
                      lightbulb
                    </span>
                    Revealed Hints
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(displayHints)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([level, content]) => (
                        <div key={level} className="p-5 rounded-xl border border-primary/20 bg-white shadow-sm">
                          <h4 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            Hint {level}
                          </h4>
                          <div className="text-sm text-slate-700 prose prose-slate max-w-none">
                            <ReactMarkdown>{content}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right Panel */}
          <section className="w-1/2 flex flex-col p-4 bg-background-light overflow-hidden">
            {children(tutor, problem)}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
