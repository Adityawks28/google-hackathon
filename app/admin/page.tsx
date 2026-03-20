"use client";

import { useEffect, useState } from "react";
import { problemModel, userModel } from "@/lib/db";
import { useAuth } from "@/hooks/useAuth";
import { AdminRoute } from "@/components/AdminRoute";
import { seedProblems } from "@/lib/lessons";
import type { Problem, AppUser } from "@/types";
import Link from "next/link";

import { Header } from "@/components/Header";

function AdminContent() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<"problems" | "users">("problems");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [problemsList, usersList] = await Promise.all([
        problemModel.getAll(),
        userModel.getAll(),
      ]);
      setProblems(problemsList);
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedProblems() {
    if (!user) return;
    setSeeding(true);
    try {
      for (const problem of seedProblems) {
        await problemModel.create(
          {
            ...problem,
            createdBy: user.uid,
            createdAt: Date.now(),
          },
          problem.id,
        );
      }
      await fetchData();
    } catch (error) {
      console.error("Error seeding problems:", error);
    } finally {
      setSeeding(false);
    }
  }

  async function handleDeleteProblem(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to delete this problem? This cannot be undone.",
      )
    )
      return;
    try {
      await problemModel.delete(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting problem:", error);
    }
  }

  async function handleToggleAdmin(uid: string, currentRole: string) {
    const newRole = (currentRole === "admin" ? "user" : "admin") as
      | "user"
      | "admin";
    try {
      await userModel.updateRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)),
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  }

  async function handleGenerateSolution(problemId: string) {
    try {
      const res = await fetch("/api/generate-sol", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-uid": user?.uid ?? "",
        },
        body: JSON.stringify({ problemId }),
      });
      const data = await res.json();
      if (data.solution) {
        alert("Solution generated and saved!");
      } else {
        alert("Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating solution:", error);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFCFB]-light">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-200 p-1">
          <button
            onClick={() => setActiveTab("problems")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "problems"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Problems ({problems.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Users ({users.length})
          </button>
        </div>

        {/* Problems Tab */}
        {activeTab === "problems" && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={handleSeedProblems}
                disabled={seeding}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {seeding ? "Seeding..." : "Seed Starter Problems"}
              </button>
              <Link
                href="/upload"
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Create New Problem
              </Link>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : problems.length === 0 ? (
              <p className="text-gray-500">
                No problems yet. Click &quot;Seed Starter Problems&quot; to add
                FizzBuzz, Reverse String, and Two Sum.
              </p>
            ) : (
              <div className="space-y-2">
                {problems.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{p.title}</h3>
                      <p className="text-sm text-gray-500">
                        {p.difficulty} &middot; {p.language} &middot;{" "}
                        {p.testCases?.length || 0} test cases
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateSolution(p.id)}
                        className="rounded-md bg-purple-100 px-3 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-200"
                      >
                        Generate Solution
                      </button>
                      <Link
                        href={`/problem/${p.id}`}
                        className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDeleteProblem(p.id)}
                        className="rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.uid}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {u.displayName || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {u.role}
                      </span>
                      {u.uid !== user?.uid && (
                        <button
                          onClick={() => handleToggleAdmin(u.uid, u.role)}
                          className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                        >
                          {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminRoute>
      <AdminContent />
    </AdminRoute>
  );
}
