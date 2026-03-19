"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { problemModel } from "@/lib/db";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CodeEditor } from "@/components/CodeEditor";
import type { Problem } from "@/types";

function CodeContent() {
  const params = useParams<{ problemId: string }>();
  const problemId = params.problemId;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);

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
      }
    }

    fetchProblem();
  }, [problemId]);

  function handleRun() {
    setRunning(true);
    setOutput("");

    const timeoutMs = 5000;

    // Run user code in a Web Worker for real timeout + isolation
    const workerCode = `
      self.onmessage = function(e) {
        const logs = [];
        const mockConsole = {
          log: (...args) => logs.push(args.map(String).join(" ")),
          error: (...args) => logs.push("ERROR: " + args.map(String).join(" ")),
          warn: (...args) => logs.push("WARN: " + args.map(String).join(" ")),
        };
        try {
          const fn = new Function("console", e.data);
          fn(mockConsole);
          self.postMessage({ success: true, logs });
        } catch (err) {
          self.postMessage({ success: false, error: err.message, logs });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));

    const timer = setTimeout(() => {
      worker.terminate();
      setOutput(
        "Error: Execution timed out (5s limit). Check for infinite loops.",
      );
      setRunning(false);
    }, timeoutMs);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      const { success, logs, error } = e.data;
      if (success) {
        setOutput(logs.join("\n") || "(no output)");
      } else {
        const logOutput = logs.length > 0 ? logs.join("\n") + "\n" : "";
        setOutput(logOutput + `Error: ${error}`);
      }
      setRunning(false);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      setOutput(`Error: ${e.message}`);
      setRunning(false);
    };

    worker.postMessage(code);
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            href={`/problem/${problemId}`}
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Problem
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            {problem.title} — Editor
          </h1>
        </div>
        <button
          onClick={handleRun}
          disabled={running}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          {running ? "Running..." : "Run Code"}
        </button>
      </header>

      <div className="flex-1">
        <CodeEditor
          value={code}
          onChange={setCode}
          language={problem.language}
        />
      </div>

      <div className="border-t border-gray-200 bg-gray-900 p-4">
        <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
          Console Output
        </h3>
        <pre className="min-h-[80px] whitespace-pre-wrap font-mono text-sm text-green-400">
          {output || "Run your code to see output here."}
        </pre>
      </div>
    </div>
  );
}

export default function CodePage() {
  return (
    <ProtectedRoute>
      <CodeContent />
    </ProtectedRoute>
  );
}
