"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { QuestionCard } from "@/components/interview/question-card";
import { PracticePanel } from "@/components/interview/practice-panel";
import {
  getPackQuestions,
  getAvailableIndustries,
  type PackQuestionsResponse,
} from "@/lib/actions/interview";
import { checkAiKey } from "@/lib/actions/tailor";
import type { QuestionType } from "@metier/core";

type Tab = "technical" | "behavioral" | "case";

export default function InterviewPage() {
  const searchParams = useSearchParams();
  const initialIndustry = searchParams.get("industry") ?? "";

  const [industry, setIndustry] = useState(initialIndustry);
  const [industries, setIndustries] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [questions, setQuestions] = useState<PackQuestionsResponse | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<Tab>("technical");
  const [hasAiKey, setHasAiKey] = useState(false);
  const [practiceQuestion, setPracticeQuestion] = useState<{
    text: string;
    type: QuestionType;
  } | null>(null);

  useEffect(() => {
    getAvailableIndustries().then(setIndustries);
    checkAiKey().then(setHasAiKey);
  }, []);

  useEffect(() => {
    if (industry) {
      getPackQuestions(industry).then(setQuestions);
    }
  }, [industry]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "technical", label: "Technical" },
    { key: "behavioral", label: "Behavioral" },
    { key: "case", label: "Case Study" },
  ];

  if (practiceQuestion) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Mock Interview
        </h1>
        <PracticePanel
          question={practiceQuestion.text}
          questionType={practiceQuestion.type}
          industry={industry}
          onBack={() => setPracticeQuestion(null)}
        />
      </div>
    );
  }

  const currentQuestions = questions?.questions?.[activeTab] ?? [];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Interview Prep</h1>
      <p className="mt-2 text-gray-500">
        Browse interview questions by industry, then practice with AI feedback.
      </p>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="">Select an industry...</option>
          {industries.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </select>
      </div>

      {questions?.questions && (
        <div className="mt-6">
          <div className="flex border-b border-gray-200 mb-4">
            {tabs.map((t) => (
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

          <div className="space-y-2">
            {currentQuestions.map((q, i) => (
              <QuestionCard
                key={i}
                question={q}
                index={i}
                hasAiKey={hasAiKey}
                onPractice={() =>
                  setPracticeQuestion({ text: q, type: activeTab })
                }
              />
            ))}
            {currentQuestions.length === 0 && (
              <p className="text-sm text-gray-400 py-4 text-center">
                No questions in this category.
              </p>
            )}
          </div>
        </div>
      )}

      {!industry && (
        <div className="mt-12 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16">
          <p className="text-sm text-gray-400">
            Select an industry to see interview questions.
          </p>
        </div>
      )}
    </div>
  );
}
