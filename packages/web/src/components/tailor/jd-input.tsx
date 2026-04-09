"use client";

import { useState } from "react";

interface JdInputProps {
  onJdReady: (text: string) => void;
}

export function JdInput({ onJdReady }: JdInputProps) {
  const [text, setText] = useState("");

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Job Description</h3>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value.trim().length > 50) {
            onJdReady(e.target.value);
          }
        }}
        placeholder="Paste the full job description here..."
        rows={10}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
      <p className="text-xs text-gray-400">
        Paste the complete JD for best results. Industry will be auto-detected.
      </p>
    </div>
  );
}
