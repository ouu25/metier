import { clsx } from "clsx";

interface KeywordChipsProps {
  matched: string[];
  missing: string[];
}

export function KeywordChips({ matched, missing }: KeywordChipsProps) {
  return (
    <div className="space-y-4">
      {matched.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Matched Keywords ({matched.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {matched.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
      {missing.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Missing Keywords ({missing.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {missing.map((kw) => (
              <span
                key={kw}
                className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-700"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
