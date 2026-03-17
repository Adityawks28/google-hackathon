interface ProgressTrackerProps {
  attempted: number;
  solved: number;
  totalProblems: number;
}

export function ProgressTracker({
  attempted,
  solved,
  totalProblems,
}: ProgressTrackerProps) {
  const percentage =
    totalProblems > 0 ? Math.round((solved / totalProblems) * 100) : 0;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">
        Your Progress
      </h3>

      <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>{solved} solved</span>
        <span>{attempted} attempted</span>
        <span>{totalProblems} total</span>
      </div>
    </div>
  );
}
