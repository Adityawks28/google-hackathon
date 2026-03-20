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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Your Progress</h3>
        <span className="text-2xl font-black text-primary">{percentage}%</span>
      </div>

      <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-3 rounded-xl bg-emerald-50">
          <span className="text-xl font-bold text-emerald-700">{solved}</span>
          <span className="text-xs font-medium text-emerald-600">Solved</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50">
          <span className="text-xl font-bold text-blue-700">{attempted}</span>
          <span className="text-xs font-medium text-blue-600">Attempted</span>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50">
          <span className="text-xl font-bold text-slate-700">
            {totalProblems}
          </span>
          <span className="text-xs font-medium text-slate-500">Total</span>
        </div>
      </div>
    </div>
  );
}
