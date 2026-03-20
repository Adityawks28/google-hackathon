"use client";

import { useState } from "react";
import { problemModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { AdminRoute } from "@/components/AdminRoute";
import type { TestCase, MiniLessonConcept, SymbolBreakdown } from "@/types";
import Link from "next/link";

function UploadContent() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [starterCode, setStarterCode] = useState("");
  const [beginnerStarterCode, setBeginnerStarterCode] = useState("");
  const [miniLessonConcepts, setMiniLessonConcepts] = useState<
    MiniLessonConcept[]
  >([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy",
  );
  const [language, setLanguage] = useState("javascript");
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expectedOutput: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function addMiniLessonConcept() {
    setMiniLessonConcepts([
      ...miniLessonConcepts,
      { title: "", explanation: "", codeExample: "", symbolBreakdown: [] },
    ]);
  }

  function updateMiniLessonConcept(
    index: number,
    field: "title" | "explanation" | "codeExample",
    value: string,
  ) {
    const updated = [...miniLessonConcepts];
    updated[index] = { ...updated[index], [field]: value };
    setMiniLessonConcepts(updated);
  }

  function removeMiniLessonConcept(index: number) {
    setMiniLessonConcepts(miniLessonConcepts.filter((_, i) => i !== index));
  }

  function addSymbolBreakdown(conceptIndex: number) {
    const updated = [...miniLessonConcepts];
    const symbols = updated[conceptIndex].symbolBreakdown || [];
    updated[conceptIndex] = {
      ...updated[conceptIndex],
      symbolBreakdown: [...symbols, { symbol: "", meaning: "" }],
    };
    setMiniLessonConcepts(updated);
  }

  function updateSymbolBreakdown(
    conceptIndex: number,
    symbolIndex: number,
    field: keyof SymbolBreakdown,
    value: string,
  ) {
    const updated = [...miniLessonConcepts];
    const symbols = [...(updated[conceptIndex].symbolBreakdown || [])];
    symbols[symbolIndex] = { ...symbols[symbolIndex], [field]: value };
    updated[conceptIndex] = {
      ...updated[conceptIndex],
      symbolBreakdown: symbols,
    };
    setMiniLessonConcepts(updated);
  }

  function removeSymbolBreakdown(conceptIndex: number, symbolIndex: number) {
    const updated = [...miniLessonConcepts];
    const symbols = (updated[conceptIndex].symbolBreakdown || []).filter(
      (_, i) => i !== symbolIndex,
    );
    updated[conceptIndex] = {
      ...updated[conceptIndex],
      symbolBreakdown: symbols,
    };
    setMiniLessonConcepts(updated);
  }

  function addTestCase() {
    setTestCases([...testCases, { input: "", expectedOutput: "" }]);
  }

  function updateTestCase(index: number, field: keyof TestCase, value: string) {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  }

  function removeTestCase(index: number) {
    if (testCases.length <= 1) return;
    setTestCases(testCases.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      await problemModel.create({
        title,
        description,
        starterCode,
        beginnerStarterCode: beginnerStarterCode || null,
        miniLesson: miniLessonConcepts.length > 0 ? miniLessonConcepts : null,
        testCases,
        difficulty,
        language,
        createdBy: user.uid,
        createdAt: Date.now(),
        referenceSolution: null,
        hints: null,
      });
      setSaved(true);
      setTitle("");
      setDescription("");
      setStarterCode("");
      setBeginnerStarterCode("");
      setMiniLessonConcepts([]);
      setTestCases([{ input: "", expectedOutput: "" }]);
    } catch (error) {
      console.error("Error saving problem:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:underline"
          >
            &larr; Dashboard
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">
            Create Problem
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {saved && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            Problem created successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (Markdown supported)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Starter Code
            </label>
            <textarea
              value={starterCode}
              onChange={(e) => setStarterCode(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Beginner Starter Code{" "}
              <span className="text-gray-400 font-normal">
                (optional — guided mode scaffold for beginners)
              </span>
            </label>
            <textarea
              value={beginnerStarterCode}
              onChange={(e) => setBeginnerStarterCode(e.target.value)}
              rows={6}
              placeholder={
                "Provide step-by-step scaffolded code with TODO comments and syntax hints for absolute beginners"
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mini Lesson Concepts{" "}
              <span className="text-gray-400 font-normal">
                (optional — teach beginners the syntax they need)
              </span>
            </label>
            <div className="space-y-4">
              {miniLessonConcepts.map((concept, i) => (
                <div
                  key={i}
                  className="rounded-md border border-gray-200 bg-gray-50 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">
                      Concept {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMiniLessonConcept(i)}
                      className="text-sm text-red-500 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    value={concept.title}
                    onChange={(e) =>
                      updateMiniLessonConcept(i, "title", e.target.value)
                    }
                    placeholder='Title (e.g., "What is a for loop?")'
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    value={concept.explanation}
                    onChange={(e) =>
                      updateMiniLessonConcept(i, "explanation", e.target.value)
                    }
                    placeholder="Simple explanation in plain English..."
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    value={concept.codeExample}
                    onChange={(e) =>
                      updateMiniLessonConcept(i, "codeExample", e.target.value)
                    }
                    placeholder="Small code example with comments..."
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none"
                  />
                  {/* Symbol Breakdowns */}
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-500">
                      Symbol Breakdowns (optional)
                    </span>
                    <div className="space-y-1 mt-1">
                      {(concept.symbolBreakdown || []).map((sb, si) => (
                        <div key={si} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={sb.symbol}
                            onChange={(e) =>
                              updateSymbolBreakdown(
                                i,
                                si,
                                "symbol",
                                e.target.value,
                              )
                            }
                            placeholder="Symbol (e.g., ===)"
                            className="w-1/3 rounded-md border border-gray-300 px-2 py-1 font-mono text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={sb.meaning}
                            onChange={(e) =>
                              updateSymbolBreakdown(
                                i,
                                si,
                                "meaning",
                                e.target.value,
                              )
                            }
                            placeholder="What it means..."
                            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => removeSymbolBreakdown(i, si)}
                            className="text-xs text-red-500 hover:bg-red-50 px-1 rounded"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => addSymbolBreakdown(i)}
                      className="mt-1 text-xs text-blue-600 hover:underline"
                    >
                      + Add Symbol
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMiniLessonConcept}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              + Add Concept
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as "easy" | "medium" | "hard")
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Language
              </label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Test Cases
            </label>
            <div className="space-y-3">
              {testCases.map((tc, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    type="text"
                    value={tc.input}
                    onChange={(e) => updateTestCase(i, "input", e.target.value)}
                    placeholder="Input"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={tc.expectedOutput}
                    onChange={(e) =>
                      updateTestCase(i, "expectedOutput", e.target.value)
                    }
                    placeholder="Expected Output"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeTestCase(i)}
                    className="rounded-md px-2 py-2 text-sm text-red-500 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTestCase}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              + Add Test Case
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Create Problem"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <AdminRoute>
      <UploadContent />
    </AdminRoute>
  );
}
