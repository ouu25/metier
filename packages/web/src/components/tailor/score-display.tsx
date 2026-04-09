import type { ATSScore } from "@metier/core";
import { clsx } from "clsx";

interface ScoreDisplayProps {
  score: ATSScore;
  industry?: string;
  packName?: string;
}

export function ScoreDisplay({ score, industry, packName }: ScoreDisplayProps) {
  const color =
    score.overall >= 70
      ? "text-green-600"
      : score.overall >= 40
        ? "text-yellow-600"
        : "text-red-600";

  const bgColor =
    score.overall >= 70
      ? "bg-green-50 border-green-200"
      : score.overall >= 40
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-6">
      <div className={clsx("rounded-xl border p-6 text-center", bgColor)}>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          ATS Match Score
        </p>
        <p className={clsx("mt-2 text-5xl font-bold", color)}>{score.overall}</p>
        <p className="text-sm text-gray-400 mt-1">out of 100</p>
        {packName && (
          <p className="mt-3 text-xs text-gray-500">
            Industry: {packName}
          </p>
        )}
      </div>

      {score.dimension_scores.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Dimension Breakdown</h4>
          {score.dimension_scores.map((dim) => (
            <div key={dim.name} className="flex items-center gap-3">
              <span className="w-40 text-xs text-gray-600 truncate">{dim.name}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all",
                    dim.score >= 70
                      ? "bg-green-500"
                      : dim.score >= 40
                        ? "bg-yellow-500"
                        : "bg-red-400"
                  )}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <span className="w-8 text-xs text-gray-500 text-right">{dim.score}</span>
            </div>
          ))}
        </div>
      )}

      {score.suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Suggestions</h4>
          <ul className="space-y-1">
            {score.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-600">
                <span className="text-yellow-500 shrink-0">&rarr;</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
