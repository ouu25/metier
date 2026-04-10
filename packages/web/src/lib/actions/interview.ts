"use server";

import {
  loadPack,
  loadAllPacks,
  createProvider,
  type ProviderName,
  type InterviewFeedback,
  type QuestionType,
} from "@metier/core";
import { createClient } from "@/lib/supabase/server";

export interface SubmitAnswerRequest {
  question: string;
  questionType: QuestionType;
  answer: string;
  industry: string;
}

export interface SubmitAnswerResponse {
  feedback?: InterviewFeedback;
  error?: string;
}

export interface FollowUpRequest {
  question: string;
  answer: string;
  industry: string;
}

export interface FollowUpResponse {
  followUp?: string;
  error?: string;
}

export interface PackQuestionsResponse {
  questions?: {
    technical: string[];
    behavioral: string[];
    case: string[];
  };
  packName?: string;
  error?: string;
}

async function getAiProvider() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: settings } = await supabase
    .from("user_settings")
    .select("ai_provider, api_key_encrypted")
    .eq("id", user.id)
    .single();

  if (!settings?.ai_provider || !settings?.api_key_encrypted) return null;

  return createProvider(
    settings.ai_provider as ProviderName,
    settings.api_key_encrypted
  );
}

export async function getPackQuestions(
  industry: string
): Promise<PackQuestionsResponse> {
  try {
    const pack = await loadPack(industry);
    return {
      questions: pack.interview_questions,
      packName: pack.name,
    };
  } catch {
    return { error: `Industry pack not found: ${industry}` };
  }
}

export async function getAvailableIndustries(): Promise<
  Array<{ value: string; label: string }>
> {
  const packs = await loadAllPacks();
  return packs.map((p) => ({
    value: p.aliases[0] ?? p.name.toLowerCase(),
    label: p.name,
  }));
}

export async function submitAnswer(
  request: SubmitAnswerRequest
): Promise<SubmitAnswerResponse> {
  try {
    const aiProvider = await getAiProvider();
    if (!aiProvider) {
      return { error: "AI provider not configured. Set up in Settings." };
    }

    const pack = await loadPack(request.industry);
    const feedback = await aiProvider.conductInterview(
      request.question,
      request.questionType,
      request.answer,
      pack
    );

    return { feedback };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Interview evaluation failed",
    };
  }
}

export async function requestFollowUp(
  request: FollowUpRequest
): Promise<FollowUpResponse> {
  try {
    const aiProvider = await getAiProvider();
    if (!aiProvider) {
      return { error: "AI provider not configured." };
    }

    const pack = await loadPack(request.industry);
    const followUp = await aiProvider.generateFollowUp(
      request.question,
      request.answer,
      pack
    );

    return { followUp };
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Follow-up generation failed",
    };
  }
}
