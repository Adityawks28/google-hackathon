"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { problemModel, progressModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CodeEditor } from "@/components/CodeEditor";
import { ChatMessage } from "@/components/ChatMessage";
import { useTutor } from "@/hooks/useTutor";
import type { Problem, EvaluateResponse } from "@/types";
import Link from "next/link";

function ProblemContent() {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [brainstormInput, setBrainstormInput] = useState("");
  const [codingView, setCodingView] = useState<"code" | "chat">("code");
  const [helpInput, setHelpInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    phase,
    brainstormHistory,
    helpHistory,
    hintLevel,
    loading,
    sendBrainstormMessage,
    startCoding,
    requestHelp,
    sendHelpMessage,
  } = useTutor(problemId);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const data = await problemModel.getById(problemId);
        if (data) {
          setProblem(data);
          setCode(data.starterCode);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [brainstormHistory, helpHistory]);

  async function handleBrainstormSend() {
    if (!brainstormInput.trim() || loading) return;
    const message = brainstormInput;
    setBrainstormInput("");
    await sendBrainstormMessage(message);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId }),
      });
      const data: EvaluateResponse = await res.json();
      setCorrect(data.correct);
      setFeedback(data.feedback);

      if (user) {
        try {
          if (data.correct) {
            await progressModel.markSolved(user.uid, problemId);
          } else {
            await progressModel.upsert(`${user.uid}_${problemId}`, {
              userId: user.uid,
              problemId,
              attempted: true,
              lastAttemptAt: Date.now(),
            });
          }
        } catch (progressError) {
          console.error("Error saving progress:", progressError);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      setFeedback("Failed to evaluate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHelpSend() {
    if (!helpInput.trim() || loading) return;
    const message = helpInput;
    setHelpInput("");
    await sendHelpMessage(message, code);
  }

  async function handleGetHelp() {
    const guidance = await requestHelp(code, "");
    if (guidance) setCodingView("chat");
    if (guidance && user) {
      try {
        await progressModel.addHint(user.uid, problemId, hintLevel + 1);
      } catch (hintError) {
        console.error("Error saving hint progress:", hintError);
      }
    }
  }

  if (loadingProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-3">error</span>
          <p className="text-red-500 font-medium">Failed to load problem.</p>
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

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-slate-500">Problem not found.</p>
      </div>
    );
  }

  const phaseConfig = {
    brainstorm: { label: "Brainstorm", color: "bg-accent-purple/10 text-accent-purple" },
    code: { label: "Coding", color: "bg-blue-100 text-blue-700" },
    help: { label: `Help (Level ${hintLevel})`, color: "bg-orange-100 text-orange-700" },
  };

  const currentPhase = phaseConfig[phase];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center rounded-lg h-9 w-9 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500">arrow_back</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <span className="material-symbols-outlined text-primary text-lg">code</span>
            </div>
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              {problem.title}
            </h2>
            <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${currentPhase.color}`}>
              {currentPhase.label}
            </span>
          </div>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel: Problem Description */}
        <section className="w-1/2 flex flex-col border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar">
          <div className="p-8 max-w-2xl mx-auto w-full">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">{problem.title}</h1>
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
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">
              {problem.description}
            </p>

            {/* Test Cases */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <span className="material-symbols-outlined text-primary">rule</span>
                Test Cases
              </h3>
              <div className="space-y-3">
                {problem.testCases.map((tc, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <p className="text-sm font-mono">
                      <span className="font-bold text-slate-700">Input:</span>{" "}
                      <span className="text-slate-600">{tc.input}</span>
                    </p>
                    <p className="text-sm font-mono mt-1">
                      <span className="font-bold text-slate-700">Expected:</span>{" "}
                      <span className="text-accent-purple">{tc.expectedOutput}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Right Panel */}
        <section className="w-1/2 flex flex-col">
          {/* ===== PHASE 1: BRAINSTORM ===== */}
          {phase === "brainstorm" && (
            <div className="flex flex-1 flex-col bg-background-light">
              {/* Chat Header */}
              <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-200 bg-white">
                <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-xl">psychology</span>
                </div>
                <div>
                  <p className="font-bold text-slate-900">Brainstorm</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    AI Assistant Online
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {brainstormHistory.length === 0 && (
                  <div className="flex gap-3 mb-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                      <span className="material-symbols-outlined text-slate-500 text-sm">smart_toy</span>
                    </div>
                    <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        Before we start coding, let&apos;s think through this problem. How would you approach this?
                      </p>
                    </div>
                  </div>
                )}

                {brainstormHistory.map((msg, i) => (
                  <ChatMessage key={i} role={msg.role} content={msg.content} />
                ))}

                {loading && (
                  <ChatMessage role="assistant" content="Thinking..." />
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 bg-white border-t border-slate-200">
                <div className="relative mb-4">
                  <textarea
                    value={brainstormInput}
                    onChange={(e) => setBrainstormInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleBrainstormSend();
                      }
                    }}
                    placeholder="Type your approach here..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-4 pr-24 focus:ring-2 focus:ring-accent-purple focus:border-transparent resize-none text-sm text-slate-800"
                  />
                  <button
                    onClick={handleBrainstormSend}
                    disabled={loading || !brainstormInput.trim()}
                    className="absolute right-3 bottom-3 bg-accent-purple text-white px-5 py-2 rounded-lg font-bold hover:bg-accent-purple/90 transition-all flex items-center gap-2 text-sm shadow-lg shadow-accent-purple/20 disabled:opacity-50"
                  >
                    Send
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
                <button
                  onClick={startCoding}
                  className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-lg shadow-accent-blue/20"
                >
                  Start Coding
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* ===== PHASE 2 & 3: CODE + HELP ===== */}
          {(phase === "code" || phase === "help") && (
            <div className="flex flex-1 flex-col">
              {/* Tab Toggle: Code / Chat */}
              <div className="flex border-b border-slate-200 bg-white shrink-0">
                <button
                  onClick={() => setCodingView("code")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    codingView === "code"
                      ? "border-b-2 border-primary text-primary"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">code</span>
                  Code Editor
                </button>
                <button
                  onClick={() => setCodingView("chat")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    codingView === "chat"
                      ? "border-b-2 border-primary text-primary"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  AI Chat
                  {helpHistory.length > 0 && (
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {helpHistory.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Code View */}
              {codingView === "code" && (
                <>
                  <div className="flex-1 bg-code-bg">
                    <CodeEditor
                      value={code}
                      onChange={setCode}
                      language={problem.language}
                    />
                  </div>

                  {/* Feedback Banner */}
                  {feedback && (
                    <div
                      className={`border-t px-5 py-3 ${
                        correct
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      {correct ? (
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-emerald-600 text-2xl">
                            check_circle
                          </span>
                          <div>
                            <p className="text-base font-bold text-emerald-800">Solved!</p>
                            <p className="text-sm text-emerald-700">{feedback}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-red-500">cancel</span>
                          <div className="text-sm text-red-800">
                            <span className="font-semibold">Not quite.</span> {feedback}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-sm">cloud_upload</span>
                        {submitting ? "Evaluating..." : "Submit"}
                      </button>
                    </div>
                    <button
                      onClick={handleGetHelp}
                      disabled={loading || hintLevel >= 3}
                      className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">lightbulb</span>
                      {loading
                        ? "Loading..."
                        : hintLevel >= 3
                          ? "Max help reached"
                          : hintLevel === 0
                            ? "Get Help"
                            : hintLevel === 1
                              ? "More Help"
                              : "I Give Up — Teach Me"}
                    </button>
                  </div>
                </>
              )}

              {/* Chat View */}
              {codingView === "chat" && (
                <>
                  {/* Chat Header */}
                  <div className="px-6 py-3 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">smart_toy</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">AI Tutor</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Online
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-background-light custom-scrollbar">
                    {helpHistory.length === 0 && (
                      <div className="flex gap-3 mb-4">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-500 text-sm">smart_toy</span>
                        </div>
                        <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                          <p className="text-sm text-slate-800 leading-relaxed">
                            Ask questions about your code or approach. You can also use &quot;Get Help&quot; on the Code tab for progressive hints.
                          </p>
                        </div>
                      </div>
                    )}

                    {helpHistory.map((msg, i) => (
                      <ChatMessage key={i} role={msg.role} content={msg.content} />
                    ))}

                    {loading && (
                      <ChatMessage role="assistant" content="Thinking..." />
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                    <div className="relative">
                      <textarea
                        value={helpInput}
                        onChange={(e) => setHelpInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleHelpSend();
                          }
                        }}
                        placeholder="Ask about your code..."
                        rows={2}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-20 focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm text-slate-800"
                      />
                      <button
                        onClick={handleHelpSend}
                        disabled={loading || !helpInput.trim()}
                        className="absolute right-3 bottom-3 bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 text-sm disabled:opacity-50"
                      >
                        Send
                        <span className="material-symbols-outlined text-sm">send</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function ProblemPage() {
  return (
    <ProtectedRoute>
      <ProblemContent />
    </ProtectedRoute>
  );
}
