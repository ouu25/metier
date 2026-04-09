"use client";

import { useState, useCallback } from "react";
import { ResumeUpload } from "@/components/tailor/resume-upload";
import { JdInput } from "@/components/tailor/jd-input";
import { ScoreDisplay } from "@/components/tailor/score-display";
import { KeywordChips } from "@/components/tailor/keyword-chips";
import { runTailor, type TailorResponse } from "@/lib/actions/tailor";

export default function TailorPage() {
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [resumeFormat, setResumeFormat] = useState<"json" | "text">("text");
  const [jdText, setJdText] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResumeReady = useCallback((content: string, format: "json" | "text") => {
    setResumeContent(content);
    setResumeFormat(format);
  }, []);

  const handleJdReady = useCallback((text: string) => {
    setJdText(text);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeContent || !jdText) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await runTailor({
      resumeContent,
      resumeFormat,
      jdText,
      generatePdf: false,
    });

    if (response.error) {
      setError(response.error);
    } else {
      setResult(response);
    }

    setLoading(false);
  }, [resumeContent, resumeFormat, jdText]);

  const canAnalyze = resumeContent && jdText && !loading;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Tailor Resume</h1>
      <p className="mt-2 text-gray-500">
        Upload your resume and paste a job description to get your ATS match score.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Left: Inputs */}
        <div className="space-y-8">
          <ResumeUpload onResumeReady={handleResumeReady} />
          <JdInput onJdReady={handleJdReady} />

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Analyzing..." : "Analyze Match"}
          </button>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-8">
          {result?.result && (
            <>
              <ScoreDisplay
                score={result.result.score}
                industry={result.result.detected_industry}
                packName={result.result.pack_name}
              />
              <KeywordChips
                matched={result.result.score.matched_keywords}
                missing={result.result.score.missing_keywords}
              />
            </>
          )}
          {!result && !loading && (
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-20">
              <p className="text-sm text-gray-400">
                Results will appear here after analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
