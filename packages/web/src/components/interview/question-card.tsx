"use client";

interface QuestionCardProps {
  question: string;
  index: number;
  hasAiKey: boolean;
  onPractice: () => void;
}

export function QuestionCard({
  question,
  index,
  hasAiKey,
  onPractice,
}: QuestionCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex items-start justify-between gap-4">
      <div className="flex gap-3">
        <span className="text-xs font-medium text-gray-400 mt-0.5">
          {index + 1}
        </span>
        <p className="text-sm text-gray-700">{question}</p>
      </div>
      {hasAiKey ? (
        <button
          onClick={onPractice}
          className="shrink-0 rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition"
        >
          Practice
        </button>
      ) : (
        <span className="shrink-0 text-xs text-gray-400">
          AI key required
        </span>
      )}
    </div>
  );
}
