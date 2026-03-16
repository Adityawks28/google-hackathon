"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ChatMessage } from "@/components/ChatMessage";
import { useTutor } from "@/hooks/useTutor";

function ChatContent() {
  const params = useParams<{ problemId: string }>();
  const problemId = params.problemId;
  const { history, loading, sendCode } = useTutor(problemId);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    const message = input;
    setInput("");
    await sendCode(message, "");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href={`/problem/${problemId}`} className="text-sm text-blue-600 hover:underline">
            &larr; Back to Problem
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">AI Tutor Chat</h1>
        </div>
        <Link
          href={`/code/${problemId}`}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Open Editor
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {history.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-center text-gray-400">
              Describe what you&apos;re stuck on, paste your code, or ask a
              question. The tutor will guide you without giving direct answers.
            </p>
          </div>
        )}

        <div className="mx-auto max-w-2xl space-y-4">
          {history.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your problem or paste your code..."
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="self-end rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}
