"use server";

import {
  tailor,
  createProvider,
  type TailorOutput,
  type ProviderName,
  type RewriteMode,
} from "@metier/core";
import { createClient } from "@/lib/supabase/server";

export interface TailorRequest {
  resumeContent: string;
  resumeFormat: "json" | "text";
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

export async function checkAiKey(): Promise<boolean> {
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

    const rewriteMode: RewriteMode | undefined =
      request.rewriteMode && request.rewriteMode !== "off"
        ? (request.rewriteMode as RewriteMode)
        : undefined;

    const result = await tailor({
      resumeContent: request.resumeContent,
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
