import type { InterviewFeedback } from "@metier/core";
import { clsx } from "clsx";

interface FeedbackDisplayProps {
  feedback: InterviewFeedback;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
  const color =
    feedback.overall_score >= 70
      ? "text-green-600"
      : feedback.overall_score >= 40
        ? "text-yellow-600"
        : "text-red-600";

  const bgColor =
    feedback.overall_score >= 70
      ? "bg-green-50 border-green-200"
      : feedback.overall_score >= 40
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div className="space-y-4">
      <div className={clsx("rounded-xl border p-4 text-center", bgColor)}>
        <p className="text-xs font-medium text-gray-500 uppercase">
          Interview Score
        </p>
        <p className={clsx("mt-1 text-4xl font-bold", color)}>
          {feedback.overall_score}
        </p>
        <p className="text-xs text-gray-400">out of 100</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Dimensions</h4>
        {feedback.dimensions.map((dim) => (
          <div key={dim.name} className="flex items-center gap-3">
            <span className="w-36 text-xs text-gray-600 truncate">
              {dim.name}
            </span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full rounded-full",
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

      {feedback.strengths.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-1">
            Strengths
          </h4>
          <ul className="space-y-1">
            {feedback.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-800">
                + {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feedback.improvements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-1">
            To Improve
          </h4>
          <ul className="space-y-1">
            {feedback.improvements.map((s, i) => (
              <li key={i} className="text-sm text-red-800">
                - {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
        <h4 className="text-sm font-medium text-blue-800 mb-1">
          Sample Answer
        </h4>
        <p className="text-sm text-blue-900">{feedback.sample_answer}</p>
      </div>
    </div>
  );
}
