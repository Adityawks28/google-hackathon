"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { progressModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { CodeEditor } from "@/components/CodeEditor";
import { ChatMessage } from "@/components/ChatMessage";
import { ProblemLayout } from "@/components/ProblemLayout";
import type { EvaluateResponse, Problem } from "@/types";
import { UseTutorReturn } from "@/hooks/useTutor";

function ProblemContent({ tutor, problem }: { tutor: UseTutorReturn; problem: Problem }) {
  const { user } = useAuth();
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  
  const [activeTab, setActiveTab] = useState<"brainstorm" | "code">("brainstorm");
  const [brainstormInput, setBrainstormInput] = useState("");
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [codingView, setCodingView] = useState<"code" | "chat">("code");
  const [helpInput, setHelpInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    brainstormHistory,
    helpHistory,
    hintLevel,
    loading,
    sessions,
    currentSessionId,
    sendBrainstormMessage,
    requestHelp,
    sendHelpMessage,
    startCoding,
    switchSession,
    createNewSession,
    deleteSession,
    updateSessionCode,
    setHintLevel,
    phase
  } = tutor;

  // Set initial tab based on phase when session loads
  useEffect(() => {
    if (phase === "code" || phase === "help") {
      setActiveTab("code");
    } else {
      setActiveTab("brainstorm");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId]);

  // Sync initial code/language
  useEffect(() => {
    if (currentSessionId && sessions.length > 0 && !code) {
      const session = sessions.find((s) => s.id === currentSessionId);
      if (session) {
        if (session.code) setCode(session.code);
        else if (problem) setCode(problem.starterCode);

        if (session.language) setSelectedLanguage(session.language);
        else if (problem) setSelectedLanguage(problem.language);
      }
    }
  }, [currentSessionId, sessions, problem, code]);

  // Persist code changes
  useEffect(() => {
    if (currentSessionId && code && selectedLanguage) {
      const timer = setTimeout(() => updateSessionCode(code, selectedLanguage), 1000);
      return () => clearTimeout(timer);
    }
  }, [code, selectedLanguage, currentSessionId, updateSessionCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [brainstormHistory, helpHistory, activeTab, codingView]);

  const handleLanguageChange = (newLanguage: string) => {
    if (!problem) return;
    setSelectedLanguage(newLanguage);
    if (newLanguage === problem.language) {
      setCode(problem.starterCode);
      return;
    }
    const functionName = problem.id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    switch (newLanguage) {
      case "python": setCode(`def ${functionName}(n):\n    # Your code here\n    pass`); break;
      case "java": setCode(`public class Solution {\n    public void ${functionName}(int n) {\n        // Your code here\n    }\n}`); break;
      case "cpp": setCode(`class Solution {\npublic:\n    void ${functionName}(int n) {\n        // Your code here\n    }\n};`); break;
      default: setCode("// Your code here");
    }
  };

  async function handleBrainstormSend() {
    if (!brainstormInput.trim() || loading) return;
    const message = brainstormInput;
    setBrainstormInput("");
    await sendBrainstormMessage(message);
  }

  async function handleStartCoding() {
    await startCoding();
    setActiveTab("code");
  }

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
        if (data.correct) await progressModel.markSolved(user.uid, problemId);
        else await progressModel.upsert(`${user.uid}_${problemId}`, { userId: user.uid, problemId, attempted: true, lastAttemptAt: Date.now() });
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
      await requestHelp(code, errorMsg, "I give up. Please explain the solution to me.");
      return;
    }
    const hintsFromProblem = problem?.hints || [];
    if (hintsFromProblem.length > 0) {
      const nextLevel = hintLevel + 1;
      setHintLevel(nextLevel);
      if (user) await progressModel.addHint(user.uid, problemId, nextLevel);
      return;
    }
    const errorMsg = correct === false ? feedback || "" : "";
    const guidance = await requestHelp(code, errorMsg);
    if (guidance) setCodingView("chat");
    if (guidance && user) await progressModel.addHint(user.uid, problemId, hintLevel + 1);
  }

  return (
    <div className="flex flex-1 flex-col bg-[#FFFBF9] rounded-2xl border border-[#FFFCFB]/10 shadow-sm overflow-hidden min-h-0">
      {/* Header Tabs */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-[#FFFCFB]/10 bg-[#FFFBF9] shrink-0">
        {/* Left: Brainstorm */}
        <button
          onClick={() => setActiveTab("brainstorm")}
          className={`flex items-center gap-3 transition-all ${
            activeTab === "brainstorm"
              ? "opacity-100 hover:opacity-80"
              : "opacity-40 grayscale-[0.5] hover:opacity-80 hover:grayscale-0"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${activeTab === "brainstorm" ? "bg-[#630000] shadow-[#630000]/20" : "bg-[#FFFBF9]-container-highest"}`}>
            <span className="material-symbols-outlined text-xl">psychology</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-[#630000]">Brainstorm</p>
            <p className="text-xs text-[#671818] flex items-center gap-1">
              {activeTab === "brainstorm" ? (
                <><span className="w-2 h-2 rounded-full bg-[#FFFCFB]" /> AI Assistant Online</>
              ) : "View History"}
            </p>
          </div>
        </button>

        {/* Divider */}
        <div className="flex-1 mx-8 border-t border-dashed border-[#FFFCFB]/10" />

        {/* Right: Coding */}
        <button
          onClick={() => setActiveTab("code")}
          className={`flex items-center gap-3 transition-all ${
            activeTab === "code"
              ? "opacity-100 hover:opacity-80"
              : "opacity-40 grayscale-[0.5] hover:opacity-80 hover:grayscale-0"
          }`}
        >
          <div className="text-right">
            <p className="font-bold text-[#630000]">&lt;&gt; Coding</p>
            <p className="text-xs text-[#671818] flex items-center gap-1 justify-end">
              {activeTab === "code" ? (
                <><span className="w-2 h-2 rounded-full bg-[#FFFCFB]" /> AI Assistant Online</>
              ) : "Jump to Code"}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${activeTab === "code" ? "bg-[#630000] shadow-[#630000]/20" : "bg-[#FFFBF9]-container-highest"}`}>
            <span className="material-symbols-outlined text-xl">code</span>
          </div>
        </button>
      </div>

      {/* Session Selector */}
      <div className="flex items-center justify-between border-b border-[#FFFCFB]/10 bg-[#FFFBF9]-container-low px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#671818]">Session:</span>
          <select
            value={currentSessionId || ""}
            onChange={(e) => switchSession(e.target.value)}
            className="rounded-md border-[#FFFCFB]/10 bg-[#FFFBF9] py-1 pl-2 pr-8 text-sm font-medium focus:border-[#630000] focus:ring-[#630000]"
          >
            {sessions.map((s) => (
              <option key={s.id || s.createdAt} value={s.id || ""}>
                {new Date(s.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                {s.id === currentSessionId ? " (current)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-4">
          {currentSessionId && sessions.length > 1 && (
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this session?")) {
                  deleteSession(currentSessionId);
                }
              }}
              className="flex items-center gap-1 text-xs font-bold text-[#9c0512] transition-colors hover:opacity-80"
            >
              <span className="material-symbols-outlined text-sm">delete</span> DELETE
            </button>
          )}
          <button onClick={() => createNewSession()} className="flex items-center gap-1 text-xs font-bold text-[#630000] transition-colors hover:text-[#630000]/80">
            <span className="material-symbols-outlined text-sm">add</span> NEW SESSION
          </button>
        </div>
      </div>

      {activeTab === "brainstorm" ? (
        <>
          <div className="flex-1 overflow-y-auto p-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2bfb9] [&::-webkit-scrollbar-thumb]:rounded-full min-h-0 bg-[#FFFBF9]-container-low/30">
            {brainstormHistory.length === 0 && (
              <div className="flex gap-3 mb-4">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FFFBF9]-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#671818] text-sm">smart_toy</span>
                </div>
                <div className="bg-[#FFFBF9]-container-high px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-[#671818] leading-relaxed">Before we start coding, let&apos;s think through this problem. How would you approach this?</p>
                </div>
              </div>
            )}
            {brainstormHistory.map((msg, i) => <ChatMessage key={i} role={msg.role} content={msg.content} />)}
            {loading && <ChatMessage role="assistant" content="Thinking..." />}
            <div ref={chatEndRef} />
          </div>
          <div className="p-6 bg-[#FFFBF9] border-t border-[#FFFCFB]/10 shrink-0">
            <div className="relative mb-4">
              <textarea
                value={brainstormInput}
                onChange={(e) => setBrainstormInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleBrainstormSend(); } }}
                placeholder="Type your approach here..."
                rows={3}
                className="w-full bg-[#FFFBF9]-container-high border border-[#FFFCFB]/10 rounded-xl py-4 pl-4 pr-24 focus:ring-2 focus:ring-[#630000]/20 focus:border-transparent resize-none text-sm text-[#1B1717]"
              />
              <button
                onClick={handleBrainstormSend}
                disabled={loading || !brainstormInput.trim()}
                className=" absolute right-3 bottom-3 bg-[#630000] text-[#FFFCFB] px-5 py-2 rounded-lg font-bold hover:bg-[#630000]/90 transition-all flex items-center gap-2 text-sm shadow-lg shadow-[#630000]/20 disabled:opacity-50"
              >
                Send <span className=" bg-[#630000] material-symbols-outlined text-sm">send</span>
              </button>
            </div>
            {phase === "brainstorm" && (
              <button
                onClick={handleStartCoding}
                className="w-full bg-[#630000] text-[#FFFCFB] font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-lg shadow-[#630000]/20"
              >
                Start Coding <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex border-b border-[#FFFCFB]/10 bg-[#FFFBF9] shrink-0">
            <button
              onClick={() => setCodingView("code")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${codingView === "code" ? "border-b-2 border-[#630000] text-[#630000]" : "text-[#671818] hover:text-[#630000]"}`}
            >
              <span className="material-symbols-outlined text-base">code</span> Code Editor
              <select value={selectedLanguage} onChange={(e) => { e.stopPropagation(); handleLanguageChange(e.target.value); }} className="ml-1.5 text-sm font-semibold opacity-50 bg-transparent border-none focus:ring-0 cursor-pointer outline-none hover:opacity-100 transition-opacity">
                <option value="javascript">javascript</option>
                <option value="python">python</option>
                <option value="java">java</option>
                <option value="cpp">cpp</option>
              </select>
            </button>
            <button
              onClick={() => setCodingView("chat")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${codingView === "chat" ? "border-b-2 border-[#630000] text-[#630000]" : "text-[#671818] hover:text-[#630000]"}`}
            >
              <span className="material-symbols-outlined text-base">chat</span> AI Chat
              {helpHistory.length > 0 && <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#630000]/10 text-xs font-bold text-[#630000]">{helpHistory.length}</span>}
            </button>
          </div>

          {codingView === "code" ? (
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex-1 bg-[#4A0000]">
                <CodeEditor value={code} onChange={setCode} language={selectedLanguage} />
              </div>
              {feedback && (
                <div className={`border-t px-5 py-3 shrink-0 ${correct ? "border-[#FFFCFB] bg-[#FFFCFB]-dim/20" : "border-[#FFFCFB] bg-[#FFFCFB]/20"}`}>
                  {correct ? (
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#00137f] text-2xl">check_circle</span><div><p className="text-base font-bold text-[#00137f]">Solved!</p><p className="text-sm text-[#00137f]/80">{feedback}</p></div></div>
                  ) : (
                    <div className="flex items-center gap-3"><span className="material-symbols-outlined text-[#9c0512]">cancel</span><div className="text-sm text-[#810100]"><span className="font-semibold">Not quite.</span> {feedback}</div></div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between border-t border-[#FFFCFB]/10 bg-[#FFFBF9] px-4 py-3 shrink-0">
                <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 bg-[#630000] hover:bg-[#630000]/90 text-[#FFFCFB] px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#630000]/20 disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">cloud_upload</span> {submitting ? "Evaluating..." : "Submit"}
                </button>
                <button onClick={handleGetHelp} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-[#630000]/10 hover:bg-[#630000]/20 text-[#630000] border border-[#630000]/30 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
                  <span className="material-symbols-outlined text-sm">lightbulb</span> {loading ? "Loading..." : hintLevel >= 3 ? "I Give Up - Teach Me" : `Review Hint ${hintLevel + 1}`}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 bg-[#FFFBF9]-container-low/30 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#e2bfb9] [&::-webkit-scrollbar-thumb]:rounded-full min-h-0">
                {helpHistory.length === 0 && (
                  <div className="flex gap-3 mb-4">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-[#FFFBF9]-container-highest flex items-center justify-center"><span className="material-symbols-outlined text-[#671818] text-sm">smart_toy</span></div>
                    <div className="text-white bg-[#FFFBF9]-container-high px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]"><p className="text-sm text-[#671818] leading-relaxed">Ask questions about your code or approach. You can also use &quot;Get Help&quot; on the Code tab for progressive hints.</p></div>
                  </div>
                )}
                {helpHistory.map((msg, i) => <ChatMessage key={i} role={msg.role} content={msg.content} />)}
                {loading && <ChatMessage role="assistant" content="Thinking..." />}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 bg-[#FFFBF9] border-t border-[#FFFCFB]/10 shrink-0">
                <div className="relative">
                  <textarea value={helpInput} onChange={(e) => setHelpInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleHelpSend(); } }} placeholder="Ask about your code..." rows={2} className="w-full bg-[#F5EFEE] border border-[#FFFCFB]/10 rounded-xl py-3 pl-4 pr-20 focus:ring-2 resize-none text-sm text-[#1B1717]" />
                  <button onClick={handleHelpSend} disabled={loading || !helpInput.trim()} className="absolute right-3 bottom-3 px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm ">
                    Send <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProblemPage() {
  return (
    <ProblemLayout>
      {(tutor, problem) => <ProblemContent tutor={tutor} problem={problem} />}
    </ProblemLayout>
  );
}
