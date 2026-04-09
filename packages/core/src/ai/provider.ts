import type { AIProvider } from "../types.js";
import { ClaudeProvider } from "./claude.js";
import { OpenAIProvider } from "./openai.js";

export type ProviderName = "claude" | "openai";

export interface NamedAIProvider extends AIProvider {
  name: ProviderName;
}

export function createProvider(
  name: ProviderName,
  apiKey: string
): NamedAIProvider {
  if (!apiKey) throw new Error("API key is required");

  switch (name) {
    case "claude":
      return new ClaudeProvider(apiKey);
    case "openai":
      return new OpenAIProvider(apiKey);
    default:
      throw new Error(`Unsupported AI provider: ${name}`);
  }
}
