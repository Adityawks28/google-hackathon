"use client";

import { useEffect, useState, ReactNode } from "react";
import { useParams } from "next/navigation";
import { problemModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTutor, type UseTutorReturn } from "@/hooks/useTutor";
import type { Problem, MiniLessonConcept } from "@/types";
import ReactMarkdown from "react-markdown";
import { Header } from "@/components/Header";

function MiniLessonCard({
  concept,
  index,
}: {
  concept: MiniLessonConcept;
  index: number;
}) {
  const [open, setOpen] = useState(index === 0);
  const [showSymbols, setShowSymbols] = useState(false);
  const hasSymbols =
    concept.symbolBreakdown && concept.symbolBreakdown.length > 0;

  return (
    <div className="border border-[#FFFCFB]/10 rounded-xl overflow-hidden shadow-sm shadow-[#630000]/10 bg-[#FFFBF9]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#630000]/5 transition-colors"
      >
        <span className="flex items-center justify-center h-7 w-7 rounded-full bg-[#630000]/10 text-[#630000] text-xs font-bold shrink-0">
          {index + 1}
        </span>
        <span className="text-sm font-bold text-[#630000] flex-1">
          {concept.title}
        </span>
        <span
          className={`material-symbols-outlined text-[#671818] text-sm transition-transform ${open ? "rotate-180" : ""}`}
        >
          expand_more
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3">
          <p className="text-sm text-[#671818] leading-relaxed">
            {concept.explanation}
          </p>
          <pre className="bg-[#4A0000] text-[#FFFCFB] rounded-lg p-4 text-xs leading-relaxed overflow-x-auto">
            <code>{concept.codeExample}</code>
          </pre>

          {/* Expandable symbol breakdown */}
          {hasSymbols && (
            <div>
              <button
                onClick={() => setShowSymbols(!showSymbols)}
                className={`flex items-center gap-2 text-xs font-semibold transition-colors ${
                  showSymbols
                    ? "text-[#630000]"
                    : "text-[#671818] hover:text-[#630000]"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {showSymbols ? "visibility_off" : "visibility"}
                </span>
                {showSymbols
                  ? "Hide symbol breakdown"
                  : "Break down the symbols for me"}
              </button>
              {showSymbols && (
                <div className="mt-2 rounded-lg border border-[#630000]/20 bg-[#FFFBF9] overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[#630000]/20 bg-[#630000]/5">
                        <th className="px-3 py-2 text-left font-bold text-[#630000] w-1/3">
                          Symbol
                        </th>
                        <th className="px-3 py-2 text-left font-bold text-[#630000]">
                          What it means
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {concept.symbolBreakdown!.map((item, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0 ? "bg-[#FFFBF9]" : "bg-[#FFFCFB]"
                          }
                        >
                          <td className="px-3 py-2 font-mono font-bold text-[#630000]">
                            {item.symbol}
                          </td>
                          <td className="px-3 py-2 text-[#671818]">
                            {item.meaning}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ProblemLayoutProps {
  children: (
    tutor: UseTutorReturn,
    problem: Problem,
    onTabChange: (tab: "problem" | "lesson") => void,
  ) => ReactNode;
}

export function ProblemLayout({ children }: ProblemLayoutProps) {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [leftTab, setLeftTab] = useState<"problem" | "lesson">("problem");

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
          <p className="text-red-500 font-medium">
            {!problem ? "Problem not found." : "Failed to load problem."}
          </p>
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
    .filter(
      (msg) =>
        msg.role === "assistant" && msg.hintLevel !== null && msg.hintLevel > 0,
    )
    .reduce(
      (acc, msg) => {
        if (!acc[msg.hintLevel!]) {
          acc[msg.hintLevel!] = msg.content;
        }
        return acc;
      },
      {} as Record<number, string>,
    );

  const displayHints =
    hintsFromProblem.length > 0
      ? hintsFromProblem.slice(0, hintLevel).reduce(
          (acc, hint, i) => {
            acc[i + 1] = hint;
            return acc;
          },
          {} as Record<number, string>,
        )
      : hints;

  const hasMiniLesson = problem.miniLesson && problem.miniLesson.length > 0;

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-[#FFFCFB]">
        <Header />

        {/* Main Split View */}
        <main className="flex flex-1 overflow-hidden">
          {/* Left Panel: Problem Description / Mini Lesson */}
          <section className="w-1/2 flex flex-col pl-4 pr-2 py-4 bg-[#FFFCFB] overflow-hidden">
            <div className="flex flex-1 flex-col bg-[#FFFBF9] rounded-2xl border border-[#FFFCFB]/10 shadow-sm overflow-hidden min-h-0 relative">
              {/* Tab Switcher (only shown when mini lesson exists) */}
              {hasMiniLesson && (
                <div className="flex border-b border-[#FFFCFB]/10 bg-[#FFFBF9]/80 backdrop-blur-sm shrink-0">
                  <button
                    onClick={() => setLeftTab("problem")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      leftTab === "problem"
                        ? "border-b-2 border-[#630000] text-[#630000]"
                        : "text-[#671818] hover:text-[#630000]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      description
                    </span>
                    Problem
                  </button>
                  <button
                    onClick={() => setLeftTab("lesson")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                      leftTab === "lesson"
                        ? "border-b-2 border-[#630000] text-[#630000]"
                        : "text-[#671818] hover:text-[#630000]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      school
                    </span>
                    Mini Lesson
                    <span className="inline-flex h-5 px-1.5 items-center justify-center rounded-full bg-[#630000]/10 text-[10px] font-bold text-[#630000]">
                      {problem.miniLesson!.length}
                    </span>
                  </button>
                </div>
              )}

              {/* Mini Lesson Content */}
              {leftTab === "lesson" && hasMiniLesson && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-8 max-w-2xl mx-auto w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-extrabold text-[#630000]">
                        Before You Code
                      </h1>
                    </div>
                    <p className="text-sm text-[#671818] mb-8">
                      New to coding? No worries! Read through these concepts one
                      by one. Each one teaches you something you&apos;ll need
                      for this problem.
                    </p>
                    <div className="space-y-3">
                      {problem.miniLesson!.map((concept, i) => (
                        <MiniLessonCard key={i} concept={concept} index={i} />
                      ))}
                    </div>
                    <div className="mt-8 p-4 rounded-xl bg-[#630000]/10 border border-[#630000]/20">
                      <p className="text-sm text-[#630000] font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#630000] text-base">
                          check_circle
                        </span>
                        Done reading? Switch to the &quot;Problem&quot; tab and
                        try the Guided Mode in the code editor!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Section */}
              <div
                className={`${leftTab === "lesson" && hasMiniLesson ? "hidden" : ""} ${hintLevel > 0 ? "h-3/5" : "h-full"} overflow-y-auto custom-scrollbar`}
              >
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
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm font-fira-code break-all">
                              <span className="font-bold text-[#671818]">
                                Input:
                              </span>{" "}
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
              {hintLevel > 0 && leftTab === "problem" && (
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
                          <div
                            key={level}
                            className={`p-5 rounded-xl border border-[#630000]/20 bg-[#FFFBF9] shadow-sm ${Number(level) === hintLevel ? "animate-hint-flash" : ""}`}
                          >
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
            {children(tutor, problem, setLeftTab)}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
