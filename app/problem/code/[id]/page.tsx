"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { progressModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { CodeEditor } from "@/components/CodeEditor";
import { ChatMessage } from "@/components/ChatMessage";
import { ProblemLayout } from "@/components/ProblemLayout";
import type { EvaluateResponse, Problem } from "@/types";
import { UseTutorReturn } from "@/hooks/useTutor";

function CodeContent({
  tutor,
  problem,
}: {
  tutor: UseTutorReturn;
  problem: Problem;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [codingView, setCodingView] = useState<"code" | "chat">("code");
  const [helpInput, setHelpInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [guidedMode, setGuidedMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    helpHistory,
    hintLevel,
    loading,
    isLoaded,
    phase,
    sessions,
    currentSessionId,
    requestHelp,
    sendHelpMessage,
    switchSession,
    createNewSession,
    updateSessionCode,
    setHintLevel,
  } = tutor;

  // Sync initial code/language
  useEffect(() => {
    if (currentSessionId && sessions.length > 0 && !code) {
      const session = sessions.find((s) => s.id === currentSessionId);
      if (session) {
        if (session.code) {
          setCode(session.code);
        } else if (problem) {
          setCode(problem.starterCode);
        }

        if (session.language) {
          setSelectedLanguage(session.language);
        } else if (problem) {
          setSelectedLanguage(problem.language);
        }
      }
    }
  }, [currentSessionId, sessions, problem, code]);

  // Persist code changes
  useEffect(() => {
    if (currentSessionId && code && selectedLanguage) {
      const timer = setTimeout(() => {
        updateSessionCode(code, selectedLanguage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [code, selectedLanguage, currentSessionId, updateSessionCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [helpHistory]);

  const handleGuidedModeToggle = (enabled: boolean) => {
    setGuidedMode(enabled);
    if (!problem) return;
    // Only swap code if it's still the starter code (user hasn't typed their own)
    const isOnStarterCode =
      code === problem.starterCode ||
      code === problem.beginnerStarterCode ||
      !code.trim();
    if (isOnStarterCode) {
      if (enabled && problem.beginnerStarterCode) {
        setCode(problem.beginnerStarterCode);
      } else {
        setCode(problem.starterCode);
      }
    }
  };

  const handleLanguageChange = (newLanguage: string) => {
    if (!problem) return;
    setSelectedLanguage(newLanguage);

    // If switching back to the problem's default language, use its starter code
    if (newLanguage === problem.language) {
      setCode(problem.starterCode);
      return;
    }

    // Generate a simple skeleton for other languages
    const functionName = problem.id.replace(/-([a-z])/g, (g) =>
      g[1].toUpperCase(),
    );
    switch (newLanguage) {
      case "python":
        setCode(`def ${functionName}(n):\n    # Your code here\n    pass`);
        break;
      case "java":
        setCode(
          `public class Solution {\n    public void ${functionName}(int n) {\n        // Your code here\n    }\n}`,
        );
        break;
      case "cpp":
        setCode(
          `class Solution {\npublic:\n    void ${functionName}(int n) {\n        // Your code here\n    }\n};`,
        );
        break;
      default:
        setCode("// Your code here");
    }
  };

  async function handleSubmit() {
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, problemId, language: selectedLanguage }),
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
    if (hintLevel >= 3) {
      setCodingView("chat");
      const errorMsg = correct === false ? feedback || "" : "";
      const message = "I give up. Please explain the solution to me.";
      await requestHelp(code, errorMsg, message);
      return;
    }

    const hintsFromProblem = problem?.hints || [];

    // If static hints are available, just show the next one
    if (hintsFromProblem.length > 0) {
      const nextLevel = hintLevel + 1;
      setHintLevel(nextLevel);
      if (user) {
        try {
          await progressModel.addHint(user.uid, problemId, nextLevel);
        } catch (hintError) {
          console.error("Error saving hint progress:", hintError);
        }
      }
      return;
    }

    const errorMsg = correct === false ? feedback || "" : "";
    const guidance = await requestHelp(code, errorMsg);
    if (guidance) setCodingView("chat");
    if (guidance && user) {
      try {
        await progressModel.addHint(user.uid, problemId, hintLevel + 1);
      } catch (hintError) {
        console.error("Error saving hint progress:", hintError);
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
      {/* Session Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Session:
          </span>
          <select
            value={currentSessionId || ""}
            onChange={(e) => switchSession(e.target.value)}
            className="rounded-md border-slate-200 bg-white py-1 pl-2 pr-8 text-sm font-medium focus:border-primary focus:ring-primary"
          >
            {sessions.map((s) => (
              <option key={s.id || s.createdAt} value={s.id || ""}>
                {new Date(s.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {s.id === currentSessionId ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => createNewSession()}
          className="flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary/80"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          NEW SESSION
        </button>
      </div>

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
          <select
            value={selectedLanguage}
            onChange={(e) => {
              e.stopPropagation();
              handleLanguageChange(e.target.value);
            }}
            className="ml-1.5 text-sm font-semibold opacity-50 bg-transparent border-none focus:ring-0 cursor-pointer outline-none hover:opacity-100 transition-opacity"
          >
            <option value="javascript">javascript</option>
            <option value="python">python</option>
            <option value="java">java</option>
            <option value="cpp">cpp</option>
          </select>
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
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 bg-code-bg">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={selectedLanguage}
            />
          </div>

          {/* Feedback Banner */}
          {feedback && (
            <div
              className={`border-t px-5 py-3 shrink-0 ${
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
                    <p className="text-base font-bold text-emerald-800">
                      Solved!
                    </p>
                    <p className="text-sm text-emerald-700">{feedback}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">
                    cancel
                  </span>
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
                <span className="material-symbols-outlined text-sm">
                  cloud_upload
                </span>
                {submitting ? "Evaluating..." : "Submit"}
              </button>
              {problem.beginnerStarterCode && (
                <button
                  onClick={() => handleGuidedModeToggle(!guidedMode)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                    guidedMode
                      ? "bg-amber-50 text-amber-700 border-amber-300"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Guided mode provides step-by-step scaffolding for beginners"
                >
                  <span className="material-symbols-outlined text-sm">
                    {guidedMode ? "assistant" : "school"}
                  </span>
                  {guidedMode ? "Guided Mode ON" : "Guided Mode"}
                </button>
              )}
            </div>
            <button
              onClick={handleGetHelp}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">
                lightbulb
              </span>
              {loading
                ? "Loading..."
                : hintLevel >= 3
                  ? "I Give Up - Teach Me"
                  : `Review Hint ${hintLevel + 1}`}{" "}
            </button>
          </div>
        </div>
      )}

      {/* Chat View */}
      {codingView === "chat" && (
        <div className="flex flex-1 flex-col min-h-0">
          {/* Chat Header */}
          <div className="px-6 py-3 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">
                smart_toy
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">AI Tutor</p>
              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Online
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar min-h-0">
            {helpHistory.length === 0 && (
              <div className="flex gap-3 mb-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-500 text-sm">
                    smart_toy
                  </span>
                </div>
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-slate-800 leading-relaxed">
                    Ask questions about your code or approach. You can also use
                    &quot;Get Help&quot; on the Code tab for progressive hints.
                  </p>
                </div>
              </div>
            )}

            {helpHistory.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}

            {loading && <ChatMessage role="assistant" content="Thinking..." />}

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
        </div>
      )}
    </div>
  );
}

export default function CodePage() {
  return (
    <ProblemLayout>
      {(tutor, problem) => <CodeContent tutor={tutor} problem={problem} />}
    </ProblemLayout>
  );
}
