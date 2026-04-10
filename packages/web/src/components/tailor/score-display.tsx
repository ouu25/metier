import type { ATSScore, SemanticScore } from "@metier/core";
import { clsx } from "clsx";

interface ScoreDisplayProps {
  score: ATSScore;
  semanticScore?: SemanticScore;
  industry?: string;
  packName?: string;
}

export function ScoreDisplay({
  score,
  semanticScore,
  industry,
  packName,
}: ScoreDisplayProps) {
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
        <p className={clsx("mt-2 text-5xl font-bold", color)}>
          {score.overall}
        </p>
        <p className="text-sm text-gray-400 mt-1">out of 100</p>
        {packName && (
          <p className="mt-3 text-xs text-gray-500">Industry: {packName}</p>
        )}
      </div>

      {semanticScore && <SemanticScoreCard score={semanticScore} />}

      {score.dimension_scores.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Dimension Breakdown
          </h4>
          {score.dimension_scores.map((dim) => (
            <div key={dim.name} className="flex items-center gap-3">
              <span className="w-40 text-xs text-gray-600 truncate">
                {dim.name}
              </span>
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
              <span className="w-8 text-xs text-gray-500 text-right">
                {dim.score}
              </span>
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

function SemanticScoreCard({ score }: { score: SemanticScore }) {
  const recColors: Record<string, string> = {
    strong_match: "text-green-700 bg-green-50 border-green-200",
    good_match: "text-blue-700 bg-blue-50 border-blue-200",
    stretch: "text-yellow-700 bg-yellow-50 border-yellow-200",
    weak_match: "text-red-700 bg-red-50 border-red-200",
  };

  const recLabels: Record<string, string> = {
    strong_match: "Strong Match",
    good_match: "Good Match",
    stretch: "Stretch",
    weak_match: "Weak Match",
  };

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-blue-800">AI Semantic Score</p>
        <span
          className={clsx(
            "rounded-full px-2 py-0.5 text-xs font-medium border",
            recColors[score.recommendation]
          )}
        >
          {recLabels[score.recommendation]}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-blue-700">
          {score.overall}
        </span>
        <span className="text-sm text-blue-400">/ 100</span>
        <span className="text-xs text-blue-400 ml-auto">
          confidence: {Math.round(score.confidence * 100)}%
        </span>
      </div>

      {score.keyword_synonyms.length > 0 && (
        <div>
          <p className="text-xs font-medium text-blue-700 mb-1">
            Synonyms Detected
          </p>
          <div className="flex flex-wrap gap-1">
            {score.keyword_synonyms.map((syn, i) => (
              <span
                key={i}
                className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
              >
                {syn.jd_term} &asymp; {syn.resume_term}
              </span>
            ))}
          </div>
        </div>
      )}

      {score.strengths.length > 0 && (
        <div>
          <p className="text-xs font-medium text-green-700 mb-1">Strengths</p>
          <ul className="space-y-0.5">
            {score.strengths.map((s, i) => (
              <li key={i} className="text-xs text-green-800">
                + {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.gaps.length > 0 && (
        <div>
          <p className="text-xs font-medium text-red-700 mb-1">Gaps</p>
          <ul className="space-y-0.5">
            {score.gaps.map((g, i) => (
              <li key={i} className="text-xs text-red-800">
                - {g}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
