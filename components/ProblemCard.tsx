import Link from "next/link";

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  solved: boolean;
}

const difficultyConfig = {
  easy: { color: "bg-emerald-100 text-emerald-700", label: "Easy" },
  medium: { color: "bg-orange-100 text-orange-700", label: "Medium" },
  hard: { color: "bg-red-100 text-red-700", label: "Hard" },
};

export function ProblemCard({ id, title, difficulty, solved }: ProblemCardProps) {
  const { color, label } = difficultyConfig[difficulty];

  return (
    <Link
      href={`/problem/${id}`}
      className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            solved ? "bg-emerald-100" : "bg-slate-100"
          }`}
        >
          <span
            className={`material-symbols-outlined text-lg ${
              solved ? "text-emerald-600" : "text-slate-400"
            }`}
          >
            {solved ? "check_circle" : "code"}
          </span>
        </div>
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-3">
        {solved && (
          <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            Solved
          </span>
        )}
        <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${color}`}>
          {label}
        </span>
      </div>
    </Link>
  );
}
