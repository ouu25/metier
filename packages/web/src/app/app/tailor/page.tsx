"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { InputFormat } from "@metier/core";
import { ResumeUpload } from "@/components/tailor/resume-upload";
import { JdInput } from "@/components/tailor/jd-input";
import { ScoreDisplay } from "@/components/tailor/score-display";
import { KeywordChips } from "@/components/tailor/keyword-chips";
import { ModeSelector } from "@/components/tailor/mode-selector";
import { ResumeDiff } from "@/components/tailor/resume-diff";
import {
  runTailor,
  checkAiKey,
  type TailorResponse,
} from "@/lib/actions/tailor";

type Tab = "score" | "diff" | "keywords";

export default function TailorPage() {
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [resumeFormat, setResumeFormat] = useState<InputFormat>("text");
  const [jdText, setJdText] = useState<string | null>(null);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rewriteMode, setRewriteMode] = useState<"off" | "light" | "deep">(
    "off"
  );
  const [enableSemantic, setEnableSemantic] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("score");

  useEffect(() => {
    checkAiKey().then(setHasAiKey);
  }, []);

  const handleResumeReady = useCallback(
    (content: string, format: InputFormat) => {
      setResumeContent(content);
      setResumeFormat(format);
    },
    []
  );

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
      rewriteMode,
      enableSemanticScore: enableSemantic,
    });

    if (response.error) {
      setError(response.error);
    } else {
      setResult(response);
      if (response.result?.tailored_resume) {
        setActiveTab("diff");
      }
    }

    setLoading(false);
  }, [resumeContent, resumeFormat, jdText, rewriteMode, enableSemantic]);

  const canAnalyze = resumeContent && jdText && !loading;
  const hasDiff =
    result?.result?.tailored_resume && result?.result?.original_resume;

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "score", label: "Score", show: true },
    { key: "diff", label: "Diff", show: !!hasDiff },
    { key: "keywords", label: "Keywords", show: true },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">Tailor Resume</h1>
      <p className="mt-2 text-gray-500">
        Upload your resume and paste a job description to get your ATS match
        score.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Left: Inputs */}
        <div className="space-y-6">
          <ResumeUpload onResumeReady={handleResumeReady} />
          <JdInput onJdReady={handleJdReady} />

          <ModeSelector
            rewriteMode={rewriteMode}
            onRewriteModeChange={setRewriteMode}
            enableSemantic={enableSemantic}
            onSemanticChange={setEnableSemantic}
            hasAiKey={hasAiKey}
          />

          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading
              ? rewriteMode !== "off"
                ? "Rewriting with AI..."
                : "Analyzing..."
              : "Analyze Match"}
          </button>

          {error && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {result?.result && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {tabs
                  .filter((t) => t.show)
                  .map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                        activeTab === t.key
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
              </div>

              {/* Tab Content */}
              {activeTab === "score" && (
                <ScoreDisplay
                  score={result.result.score}
                  semanticScore={result.result.semantic_score}
                  industry={result.result.detected_industry}
                  packName={result.result.pack_name}
                />
              )}
              {activeTab === "diff" && hasDiff && (
                <ResumeDiff
                  original={result.result.original_resume!}
                  rewritten={result.result.tailored_resume!}
                />
              )}
              {activeTab === "keywords" && (
                <KeywordChips
                  matched={result.result.score.matched_keywords}
                  missing={result.result.score.missing_keywords}
                />
              )}
              {result.result.detected_industry && (
                <Link
                  href={`/app/interview?industry=${result.result.detected_industry}`}
                  className="block mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 transition text-center"
                >
                  Prepare for Interview &rarr;
                </Link>
              )}
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
