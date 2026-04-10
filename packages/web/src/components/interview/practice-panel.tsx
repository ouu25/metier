"use client";

import { useState, useCallback } from "react";
import type { InterviewFeedback, QuestionType } from "@metier/core";
import { FeedbackDisplay } from "./feedback-display";
import {
  submitAnswer,
  requestFollowUp,
} from "@/lib/actions/interview";

interface PracticePanelProps {
  question: string;
  questionType: QuestionType;
  industry: string;
  onBack: () => void;
}

export function PracticePanel({
  question,
  questionType,
  industry,
  onBack,
}: PracticePanelProps) {
  const [currentQuestion, setCurrentQuestion] = useState(question);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!answer.trim()) return;
    setLoading(true);
    setError(null);
    setFeedback(null);

    const result = await submitAnswer({
      question: currentQuestion,
      questionType,
      answer,
      industry,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.feedback) {
      setFeedback(result.feedback);
    }
    setLoading(false);
  }, [currentQuestion, questionType, answer, industry]);

  const handleFollowUp = useCallback(async () => {
    setFollowUpLoading(true);
    const result = await requestFollowUp({
      question: currentQuestion,
      answer,
      industry,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.followUp) {
      setCurrentQuestion(result.followUp);
      setAnswer("");
      setFeedback(null);
    }
    setFollowUpLoading(false);
  }, [currentQuestion, answer, industry]);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="text-sm text-gray-500 hover:text-gray-700 transition"
      >
        &larr; Back to questions
      </button>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs font-medium text-blue-600 uppercase mb-1">
          Interviewer
        </p>
        <p className="text-sm text-blue-900">{currentQuestion}</p>
      </div>

      {!feedback && (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-y"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? "Evaluating..." : "Submit Answer"}
          </button>
        </>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {feedback && (
        <>
          <FeedbackDisplay feedback={feedback} />
          <div className="flex gap-3">
            <button
              onClick={handleFollowUp}
              disabled={followUpLoading}
              className="flex-1 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50 transition"
            >
              {followUpLoading ? "Generating..." : "Ask me a follow-up"}
            </button>
            <button
              onClick={onBack}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Back to questions
            </button>
          </div>
        </>
      )}
    </div>
  );
}
