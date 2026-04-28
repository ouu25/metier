"use server";

import {
  tailor,
  createProvider,
  type TailorOutput,
  type ProviderName,
  type RewriteMode,
  type InputFormat,
} from "@metier/core";
import { Buffer } from "node:buffer";
import { createClient } from "@/lib/supabase/server";

export interface TailorRequest {
  resumeContent: string;
  resumeFormat: InputFormat;
  jdText: string;
  industry?: string;
  generatePdf: boolean;
  rewriteMode?: "off" | "light" | "deep";
  enableSemanticScore?: boolean;
}

export interface TailorResponse {
  result?: TailorOutput;
  error?: string;
  hasAiKey?: boolean;
}

function getDefaultProvider() {
  const provider = process.env.DEFAULT_AI_PROVIDER as ProviderName | undefined;
  const key = process.env.DEFAULT_AI_KEY;
  if (provider && key) {
    return createProvider(provider, key);
  }
  return null;
}

export async function checkAiKey(): Promise<boolean> {
  // If server has a default key, AI is always available
  if (getDefaultProvider()) return true;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("user_settings")
    .select("ai_provider, api_key_encrypted")
    .eq("id", user.id)
    .single();

  return !!(data?.ai_provider && data?.api_key_encrypted);
}

export async function runTailor(
  request: TailorRequest
): Promise<TailorResponse> {
  try {
    let aiProvider = undefined;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: settings } = await supabase
        .from("user_settings")
        .select("ai_provider, api_key_encrypted")
        .eq("id", user.id)
        .single();

      if (settings?.ai_provider && settings?.api_key_encrypted) {
        aiProvider = createProvider(
          settings.ai_provider as ProviderName,
          settings.api_key_encrypted
        );
      }
    }

    // Fallback to server default if user has no key
    if (!aiProvider) {
      aiProvider = getDefaultProvider() ?? undefined;
    }

    const resumeContent =
      request.resumeFormat === "pdf" || request.resumeFormat === "docx"
        ? Buffer.from(request.resumeContent, "base64")
        : request.resumeContent;

    const rewriteMode: RewriteMode | undefined =
      request.rewriteMode && request.rewriteMode !== "off"
        ? (request.rewriteMode as RewriteMode)
        : undefined;

    const result = await tailor({
      resumeContent,
      resumeFormat: request.resumeFormat,
      jdText: request.jdText,
      industry: request.industry,
      generatePdf: false,
      aiProvider,
      rewriteMode,
      enableSemanticScore: request.enableSemanticScore,
    });

    return { result, hasAiKey: !!aiProvider };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Tailoring failed" };
  }
}
