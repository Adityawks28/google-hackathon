"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CodeEditor } from "@/components/CodeEditor";
import { HintPanel } from "@/components/HintPanel";
import { useTutor } from "@/hooks/useTutor";
import type { Problem, EvaluateResponse } from "@/types";
import Link from "next/link";

function ProblemContent() {
  const params = useParams<{ id: string }>();
  const problemId = params.id;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(true);

  const {
    hintLevel,
    loading: hintLoading,
    sendCode,
    requestHint,
  } = useTutor(problemId);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const docSnap = await getDoc(doc(db, "problems", problemId));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Problem;
          setProblem(data);
          setCode(data.starterCode);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoadingProblem(false);
      }
    }

    fetchProblem();
  }, [problemId]);

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
    } catch (error) {
      console.error("Submit error:", error);
      setFeedback("Failed to evaluate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleHint() {
    const nextLevel = await requestHint();
    const guidance = await sendCode(code, "");
    if (guidance) {
      setHints((prev) => {
        const updated = [...prev];
        updated[nextLevel - 1] = guidance;
        return updated;
      });
    }
  }

  if (loadingProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Back
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            {problem.title}
          </h1>
        </div>
        <Link
          href={`/chat/${problemId}`}
          className="rounded-md bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Open Chat Tutor
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — problem description */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white p-6">
          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-semibold">{problem.title}</h2>
            <p className="whitespace-pre-wrap text-gray-700">
              {problem.description}
            </p>
            <h3 className="mt-4 text-sm font-semibold text-gray-500">
              Test Cases
            </h3>
            <ul className="space-y-1">
              {problem.testCases.map((tc, i) => (
                <li key={i} className="text-sm text-gray-600">
                  Input: <code>{tc.input}</code> &rarr; Expected:{" "}
                  <code>{tc.expectedOutput}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right panel — editor + hints */}
        <div className="flex w-1/2 flex-col">
          <div className="flex-1">
            <CodeEditor
              value={code}
              onChange={setCode}
              language={problem.language}
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`border-t px-4 py-3 text-sm ${
                correct
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {correct ? "Correct! " : "Not quite. "}
              {feedback}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-gray-200 bg-white px-4 py-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Evaluating..." : "Submit"}
            </button>
            <button
              onClick={handleHint}
              disabled={hintLoading || hintLevel >= 3}
              className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
            >
              {hintLoading ? "Loading..." : "Get Hint"}
            </button>
          </div>

          {/* Hint panel */}
          {hints.length > 0 && (
            <div className="border-t border-gray-200 p-4">
              <HintPanel
                hints={hints}
                currentLevel={hintLevel}
                onRequestHint={handleHint}
              />
            </div>
          )}
        </div>
      </div>
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
