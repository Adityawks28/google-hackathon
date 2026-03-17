import Link from "next/link";

interface ProblemCardProps {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  solved: boolean;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  hard: "bg-red-100 text-red-700",
};

export function ProblemCard({
  id,
  title,
  difficulty,
  solved,
}: ProblemCardProps) {
  return (
    <Link
      href={`/problem/${id}`}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          {solved && (
            <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
              Solved
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${difficultyColors[difficulty]}`}
          >
            {difficulty}
          </span>
        </div>
      </div>
    </Link>
  );
}
