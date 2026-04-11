"use client";

import { useState } from "react";
import { scrapeJd } from "@/lib/actions/scrape-jd";

interface JdInputProps {
  onJdReady: (text: string) => void;
}

export function JdInput({ onJdReady }: JdInputProps) {
  const [text, setText] = useState("");
  const [scraping, setScraping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    setText(value);
    setError(null);
    if (value.trim().length > 50) {
      onJdReady(value);
    }
  }

  async function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData.getData("text").trim();

    if (!pasted.match(/^https?:\/\/.+/)) return;

    // User pasted a URL — scrape it
    e.preventDefault();
    setText(pasted);
    setError(null);
    setScraping(true);

    const result = await scrapeJd(pasted);

    if (result.error) {
      setError(result.error);
      setText(pasted);
    } else if (result.text) {
      setText(result.text);
      onJdReady(result.text);
    }
    setScraping(false);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Job Description</h3>
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onPaste={handlePaste}
        placeholder="Paste a job URL or the full job description..."
        rows={10}
        disabled={scraping}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      />
      {scraping && (
        <p className="text-xs text-blue-600">Extracting job description from URL...</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      <p className="text-xs text-gray-400">
        Paste a LinkedIn/Indeed URL or the full JD text. Industry will be auto-detected.
      </p>
    </div>
  );
}
