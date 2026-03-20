"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChatMessage } from "@/components/ChatMessage";
import { ProblemLayout } from "@/components/ProblemLayout";
import { UseTutorReturn } from "@/hooks/useTutor";

function BrainstormContent({ tutor }: { tutor: UseTutorReturn }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const [brainstormInput, setBrainstormInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const {
    brainstormHistory,
    loading,
    isLoaded,
    sessions,
    currentSessionId,
    sendBrainstormMessage,
    startCoding,
    switchSession,
    createNewSession,
    phase,
  } = tutor;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [brainstormHistory]);

  async function handleBrainstormSend() {
    if (!brainstormInput.trim() || loading) return;
    const message = brainstormInput;
    setBrainstormInput("");
    await sendBrainstormMessage(message);
  }

  async function handleStartCoding() {
    await startCoding();
    router.push(`/problem/code/${problemId}`);
  }

  return (
    <div className="flex flex-1 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0">
      {/* Chat Header */}
      <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-200 bg-white shrink-0">
        <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-xl">
            psychology
          </span>
        </div>
        <div>
          <p className="font-bold text-slate-900">Brainstorm</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            AI Assistant Online
          </p>
        </div>
      </div>

      {/* Session Selector */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-2 shrink-0">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar min-h-0 bg-slate-50/30">
        {brainstormHistory.length === 0 && (
          <div className="flex gap-3 mb-4">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-500 text-sm">
                smart_toy
              </span>
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none max-w-[80%]">
              <p className="text-sm text-slate-800 leading-relaxed">
                Before we start coding, let&apos;s think through this
                problem. How would you approach this?
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
      <div className="p-6 bg-white border-t border-slate-200 shrink-0">
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
            <span className="material-symbols-outlined text-sm">
              send
            </span>
          </button>
        </div>
        <button
          onClick={handleStartCoding}
          className="w-full bg-accent-blue hover:bg-accent-blue/90 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:-translate-y-0.5 shadow-lg shadow-accent-blue/20"
        >
          Start Coding
          <span className="material-symbols-outlined">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}

export default function BrainstormPage() {
  return (
    <ProblemLayout>
      {(tutor) => <BrainstormContent tutor={tutor} />}
    </ProblemLayout>
  );
}
