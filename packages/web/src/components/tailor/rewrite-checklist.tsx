"use client";

import { useState } from "react";
import type { RewriteSuggestions, RewriteChange } from "@metier/core";
import { clsx } from "clsx";

interface RewriteChecklistProps {
  suggestions: RewriteSuggestions;
}

const VERDICT_LABEL: Record<RewriteSuggestions["verdict"], string> = {
  good_fit: "Good fit",
  stretch: "Stretch",
  skip: "Likely skip",
};

const VERDICT_CLASS: Record<RewriteSuggestions["verdict"], string> = {
  good_fit: "bg-green-100 text-green-800 border-green-200",
  stretch: "bg-amber-100 text-amber-800 border-amber-200",
  skip: "bg-red-100 text-red-800 border-red-200",
};

const ACTION_LABEL: Record<RewriteChange["action"], string> = {
  add: "Add",
  replace: "Replace",
  skip: "Skip",
};

const ACTION_CLASS: Record<RewriteChange["action"], string> = {
  add: "bg-blue-50 text-blue-700 border-blue-200",
  replace: "bg-purple-50 text-purple-700 border-purple-200",
  skip: "bg-gray-100 text-gray-600 border-gray-200",
};

export function RewriteChecklist({ suggestions }: RewriteChecklistProps) {
  const [done, setDone] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  const actionable = suggestions.changes.filter((c) => c.action !== "skip");
  const skipped = suggestions.changes.filter((c) => c.action === "skip");

  return (
    <div className="space-y-5">
      <div
        className={clsx(
          "rounded-lg border px-4 py-3 text-sm",
          VERDICT_CLASS[suggestions.verdict]
        )}
      >
        <div className="font-medium">
          Verdict: {VERDICT_LABEL[suggestions.verdict]}
        </div>
        <div className="mt-1 text-xs">{suggestions.verdict_reason}</div>
      </div>

      {actionable.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Apply to your CV ({actionable.length})
          </h4>
          {actionable.map((change, i) => (
            <ChangeRow
              key={i}
              change={change}
              checked={done.has(i)}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      )}

      {skipped.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500">
            JD keywords to skip ({skipped.length})
          </h4>
          {skipped.map((change, i) => (
            <SkipRow key={i} change={change} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChangeRow({
  change,
  checked,
  onToggle,
}: {
  change: RewriteChange;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={clsx(
        "flex gap-3 rounded-lg border px-4 py-3 transition",
        checked ? "border-gray-200 bg-gray-50 opacity-60" : "border-gray-200 bg-white"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-gray-300"
      />
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={clsx(
              "rounded border px-2 py-0.5 font-medium uppercase tracking-wide",
              ACTION_CLASS[change.action]
            )}
          >
            {ACTION_LABEL[change.action]}
          </span>
          <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-600">
            {change.section}
          </span>
          {change.jd_keyword && (
            <span className="text-gray-500">→ {change.jd_keyword}</span>
          )}
        </div>
        {change.original && (
          <div className="text-sm text-gray-500 line-through">
            {change.original}
          </div>
        )}
        <div
          className={clsx(
            "text-sm",
            checked ? "text-gray-500 line-through" : "text-gray-900"
          )}
        >
          {change.proposed}
        </div>
        <div className="text-xs italic text-gray-500">{change.rationale}</div>
      </div>
    </div>
  );
}

function SkipRow({ change }: { change: RewriteChange }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded border border-gray-200 bg-white px-2 py-0.5 font-medium uppercase tracking-wide text-gray-600">
          Skip
        </span>
        {change.jd_keyword && (
          <span className="font-medium text-gray-700">{change.jd_keyword}</span>
        )}
      </div>
      <div className="mt-1 text-xs italic text-gray-500">{change.rationale}</div>
    </div>
  );
}
