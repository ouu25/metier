"use server";

import { createClient } from "@/lib/supabase/server";

export interface UserSettings {
  ai_provider: string | null;
  api_key_encrypted: string | null;
  default_industry: string | null;
}

export async function getSettings(): Promise<UserSettings | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_settings")
    .select("ai_provider, api_key_encrypted, default_industry")
    .eq("id", user.id)
    .single();

  return data;
}

export async function saveSettings(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const ai_provider = formData.get("ai_provider") as string;
  const api_key = formData.get("api_key") as string;
  const default_industry = formData.get("default_industry") as string;

  const { error } = await supabase.from("user_settings").upsert({
    id: user.id,
    ai_provider: ai_provider || null,
    api_key_encrypted: api_key || null,
    default_industry: default_industry || null,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };
  return {};
}
