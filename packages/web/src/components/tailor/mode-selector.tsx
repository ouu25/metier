"use client";

import { clsx } from "clsx";

interface ModeSelectorProps {
  rewriteMode: "off" | "light" | "deep";
  onRewriteModeChange: (mode: "off" | "light" | "deep") => void;
  enableSemantic: boolean;
  onSemanticChange: (enabled: boolean) => void;
  hasAiKey: boolean;
}

const modes = [
  { value: "off" as const, label: "Off" },
  { value: "light" as const, label: "Light" },
  { value: "deep" as const, label: "Deep" },
];

export function ModeSelector({
  rewriteMode,
  onRewriteModeChange,
  enableSemantic,
  onSemanticChange,
  hasAiKey,
}: ModeSelectorProps) {
  if (!hasAiKey) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-sm text-gray-500">
          Configure an AI provider in{" "}
          <a href="/app/settings" className="text-blue-600 hover:underline">
            Settings
          </a>{" "}
          to unlock AI rewriting and enhanced scoring.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI Rewrite
        </label>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {modes.map((m) => (
            <button
              key={m.value}
              onClick={() => onRewriteModeChange(m.value)}
              className={clsx(
                "flex-1 px-4 py-2 text-sm font-medium transition",
                rewriteMode === m.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-gray-400">
          {rewriteMode === "off" && "Score only — no AI changes to your resume"}
          {rewriteMode === "light" &&
            "Inject missing keywords, keep structure unchanged"}
          {rewriteMode === "deep" &&
            "Full rewrite — summary, bullets, skills reordered for max match"}
        </p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={enableSemantic}
          onChange={(e) => onSemanticChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-700">AI-Enhanced Scoring</span>
        <span className="text-xs text-gray-400">
          (semantic matching, synonym detection)
        </span>
      </label>
    </div>
  );
}
