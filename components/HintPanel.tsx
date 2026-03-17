"use client";

interface HintPanelProps {
  hints: string[];
  currentLevel: number;
  onRequestHint: () => void;
}

export function HintPanel({
  hints,
  currentLevel,
  onRequestHint,
}: HintPanelProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-800">Hints</h3>

      {hints.length === 0 && currentLevel === 0 && (
        <p className="mb-3 text-sm text-gray-500">
          Stuck? Request a hint to get a nudge in the right direction.
        </p>
      )}

      <div className="space-y-3">
        {hints.slice(0, currentLevel).map((hint, index) => (
          <div
            key={index}
            className="rounded-md border-l-4 border-blue-400 bg-blue-50 p-3 text-sm text-gray-700"
          >
            <span className="mb-1 block text-xs font-medium text-blue-600">
              Hint {index + 1}
            </span>
            {hint}
          </div>
        ))}
      </div>

      {currentLevel < 3 && (
        <button
          onClick={onRequestHint}
          className="mt-3 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          {currentLevel === 0
            ? "Get a Hint"
            : `Get Hint ${currentLevel + 1} of 3`}
        </button>
      )}

      {currentLevel >= 3 && (
        <p className="mt-3 text-xs text-gray-400">
          All hints used. Try discussing with the AI tutor in the chat!
        </p>
      )}
    </div>
  );
}
