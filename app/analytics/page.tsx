"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Link from "next/link";

const stats = [
  {
    label: "Problems Solved",
    value: "42",
    icon: "task_alt",
    trend: "+12% this week",
    trendUp: true,
  },
  {
    label: "Success Rate",
    value: "84%",
    icon: "percent",
    trend: "+5% vs avg",
    trendUp: true,
  },
  {
    label: "Avg. Time / Problem",
    value: "24m",
    icon: "timer",
    trend: "-2m improvement",
    trendUp: false,
  },
  {
    label: "Brainstorm Score",
    value: "780",
    icon: "psychology",
    trend: "Top 5%",
    trendUp: true,
  },
];

const weeklyData = [
  { week: "Week 1", count: 5, height: "20%" },
  { week: "Week 2", count: 12, height: "45%" },
  { week: "Week 3", count: 8, height: "35%" },
  { week: "Week 4", count: 18, height: "70%" },
  { week: "Week 5", count: 24, height: "90%" },
  { week: "Week 6", count: 14, height: "55%" },
  { week: "Week 7", count: 20, height: "75%" },
];

const topics = [
  { name: "Arrays & Hashing", solved: 18, total: 20, percent: 90 },
  { name: "Strings", solved: 12, total: 15, percent: 80 },
  { name: "Dynamic Programming", solved: 5, total: 12, percent: 41 },
  { name: "Trees & Graphs", solved: 7, total: 10, percent: 70 },
  { name: "Math & Geometry", solved: 15, total: 18, percent: 83 },
];

const submissions = [
  {
    name: "Network Delay Time",
    difficulty: "medium" as const,
    language: "Python3",
    solved: true,
    date: "2 hours ago",
  },
  {
    name: "Valid Anagram",
    difficulty: "easy" as const,
    language: "Java",
    solved: true,
    date: "5 hours ago",
  },
  {
    name: "Median of Two Sorted Arrays",
    difficulty: "hard" as const,
    language: "C++",
    solved: false,
    date: "Yesterday",
  },
  {
    name: "Longest Palindromic Substring",
    difficulty: "medium" as const,
    language: "TypeScript",
    solved: true,
    date: "2 days ago",
  },
  {
    name: "Merge K Sorted Lists",
    difficulty: "hard" as const,
    language: "Go",
    solved: true,
    date: "3 days ago",
  },
];

const difficultyColors = {
  easy: "bg-emerald-100 text-emerald-700",
  medium: "bg-orange-100 text-orange-700",
  hard: "bg-red-100 text-red-700",
};

function AnalyticsContent() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background-light">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">
                terminal
              </span>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Google Hackathon
              </h2>
            </div>
            <nav className="hidden md:flex items-center gap-6 ml-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm font-medium text-primary border-b-2 border-primary pb-1">
                Analytics
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">
                person
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700">
              {user?.displayName}
            </span>
            <button
              onClick={signOut}
              className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Sample data banner */}
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-3">
          <span className="material-symbols-outlined text-amber-600">info</span>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Sample data.</span> This page shows
            placeholder stats — real analytics coming soon.
          </p>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-slate-500 mt-1">
            Track your coding progress, accuracy, and technical growth.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-sm font-medium">
                  {stat.label}
                </p>
                <span className="material-symbols-outlined text-primary">
                  {stat.icon}
                </span>
              </div>
              <p className="text-slate-900 text-3xl font-bold">{stat.value}</p>
              <p
                className={`text-sm font-medium flex items-center gap-1 ${
                  stat.trendUp ? "text-green-600" : "text-orange-600"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {stat.trendUp ? "trending_up" : "trending_down"}
                </span>
                {stat.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-slate-900 text-lg font-bold mb-6">
              Problems Solved Over Time
            </h3>
            <div className="h-64 w-full relative">
              <div className="absolute inset-0 flex items-end justify-between px-2">
                {weeklyData.map((week) => (
                  <div
                    key={week.week}
                    className="w-[10%] bg-primary/60 hover:bg-primary rounded-t-lg relative group transition-colors cursor-pointer"
                    style={{ height: week.height }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {week.count}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 w-full h-px bg-slate-200" />
            </div>
            <div className="flex justify-between mt-4 text-xs font-medium text-slate-500">
              {weeklyData.map((week) => (
                <span key={week.week}>{week.week}</span>
              ))}
            </div>
          </div>

          {/* Topic Progress */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-slate-900 text-lg font-bold mb-6">
              Performance by Topic
            </h3>
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-900">
                      {topic.name}
                    </span>
                    <span className="text-slate-500">
                      {topic.solved}/{topic.total} Solved
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${topic.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Submissions Table */}
        <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-slate-900 text-lg font-bold">
              Recent Submissions
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Problem Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {submissions.map((sub) => (
                  <tr
                    key={sub.name}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {sub.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold capitalize ${difficultyColors[sub.difficulty]}`}
                      >
                        {sub.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600">
                      {sub.language}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {sub.solved ? (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <span className="material-symbols-outlined text-sm">
                            check_circle
                          </span>
                          Solved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 font-semibold">
                          <span className="material-symbols-outlined text-sm">
                            cancel
                          </span>
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {sub.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 px-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-white mt-8">
        <p className="text-sm text-slate-500">&copy; 2024 Google Hackathon</p>
        <div className="flex gap-6">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-primary"
          >
            Dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}
