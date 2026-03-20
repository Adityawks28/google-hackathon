"use client";

import { useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";
import { problemModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTutor, type UseTutorReturn } from "@/hooks/useTutor";
import type { Problem } from "@/types";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Header } from "@/components/Header";

interface ProblemLayoutProps {
  children: (tutor: UseTutorReturn, problem: Problem) => ReactNode;
}

export function ProblemLayout({ children }: ProblemLayoutProps) {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  
  const tutor: UseTutorReturn = useTutor(problemId, user?.uid);
  const { hintLevel, helpHistory } = tutor;

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
      <div className="flex min-h-screen items-center justify-center bg-[#FFFCFB]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#630000] border-t-transparent" />
      </div>
    );
  }

  if (fetchError || !problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFCFB]">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-3">
            error
          </span>
          <p className="text-red-500 font-medium">{!problem ? "Problem not found." : "Failed to load problem."}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-[#630000] px-5 py-2 text-sm font-bold text-[#FFFCFB] hover:bg-[#630000]/90 transition-colors"
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

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#FFFCFB]">
        <Header />

        {/* Main Split View */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left Panel: Problem Description */}
          <section className="w-1/2 flex flex-col pl-4 pr-2 py-4 bg-[#FFFCFB] overflow-hidden">
            <div className="flex flex-1 flex-col bg-[#FFFBF9] rounded-2xl border border-[#FFFCFB]/10 shadow-sm overflow-hidden min-h-0 relative">
              <Link
                href="/dashboard"
                className="absolute top-4 left-4 z-10 flex items-center justify-center rounded-lg h-9 w-9 bg-[#FFFBF9]/80 backdrop-blur-sm border border-[#FFFCFB]/10 text-[#671818] hover:bg-[#FFFBF9]-container-high transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined">
                  arrow_back
                </span>
              </Link>
              {/* Problem Section */}
              <div className={`${hintLevel > 0 ? "h-3/5" : "h-full"} overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2bfb9] [&::-webkit-scrollbar-thumb]:rounded-full`}>
                <div className="p-8 max-w-2xl mx-auto w-full">
                  <h1 className="text-3xl font-newsreader font-extrabold tracking-tight text-[#630000] mb-4">
                    {problem.title}
                  </h1>
                  <div className="flex items-center gap-3 mb-8">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        problem.difficulty === "easy"
                          ? "bg-[#FFDCD6] text-[#783126]"
                          : problem.difficulty === "medium"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-red-50 text-red-600"
                      }`}
                    >
                      {problem.difficulty.charAt(0).toUpperCase() +
                        problem.difficulty.slice(1)}
                    </span>
                  </div>
                  <div className="text-[#671818] leading-relaxed mb-8 prose prose-slate max-w-none">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>

                  {/* Test Cases */}
                  <div className="">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-[#630000] mb-6">
                      <span className="material-symbols-outlined text-[#630000]">
                        rule
                      </span>
                      Test Cases
                    </h3>
                    <div className="space-y-4">
                      {problem.testCases.map((tc, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-xl border border-[#630000]/20 bg-[#FFFBF9] shadow-sm"
                        >
                          <h4 className="text-sm font-bold text-[#630000] mb-2 uppercase tracking-wider flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#630000]" />
                            Test Case {i + 1}
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm font-fira-code break-all">
                              <span className="font-bold text-[#671818]">Input:</span>{" "}
                              <span className="text-[#671818]">{tc.input}</span>
                            </p>
                            <p className="text-sm font-fira-code break-all">
                              <span className="font-bold text-[#671818]">
                                Expected:
                              </span>{" "}
                              <span className="text-[#630000] font-bold">
                                {tc.expectedOutput}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Revealed Hints Section */}
              {hintLevel > 0 && (
                <div className="h-2/5 border-t border-[#FFFCFB]/10 bg-[#FFFBF9]-container-low/50 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2bfb9] [&::-webkit-scrollbar-thumb]:rounded-full">
                  <div className="p-8 max-w-2xl mx-auto w-full">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-[#630000] mb-6">
                      <span className="material-symbols-outlined text-[#630000]">
                        lightbulb
                      </span>
                      Revealed Hints
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(displayHints)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([level, content]) => (
                          <div key={level} className="p-5 rounded-xl border border-[#630000]/20 bg-[#FFFBF9] shadow-sm">
                            <h4 className="text-sm font-bold text-[#630000] mb-2 uppercase tracking-wider flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-[#630000]" />
                              Hint {level}
                            </h4>
                            <div className="text-sm text-[#671818] prose prose-slate max-w-none">
                              <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Panel */}
          <section className="w-1/2 flex flex-col pl-2 pr-4 py-4 bg-[#FFFCFB] overflow-hidden">
            {children(tutor, problem)}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
