"use server";

import {
  tailor,
  createProvider,
  type TailorOutput,
  type ProviderName,
} from "@metier/core";
import { createClient } from "@/lib/supabase/server";

export interface TailorRequest {
  resumeContent: string;
  resumeFormat: "json" | "text";
  jdText: string;
  industry?: string;
  generatePdf: boolean;
}

export interface TailorResponse {
  result?: TailorOutput;
  error?: string;
}

export async function runTailor(request: TailorRequest): Promise<TailorResponse> {
  try {
    // Load user's AI settings if authenticated
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

    const result = await tailor({
      resumeContent: request.resumeContent,
      resumeFormat: request.resumeFormat,
      jdText: request.jdText,
      industry: request.industry,
      generatePdf: false, // PDF generation handled separately for web
      aiProvider,
    });

    return { result };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Tailoring failed" };
  }
}
