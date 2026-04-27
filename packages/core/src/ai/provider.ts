import type { AIProvider } from "../types.js";
import { ClaudeProvider } from "./claude.js";
import { OpenAIProvider } from "./openai.js";

export type ProviderName = "claude" | "openai" | "deepseek" | "minimax" | "gemini";

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
    case "deepseek":
      return new OpenAIProvider(
        apiKey,
        "https://api.deepseek.com/v1/chat/completions",
        "deepseek-v4-pro"
      );
    case "minimax":
      return new OpenAIProvider(
        apiKey,
        "https://api.minimax.chat/v1/text/chatcompletion_v2",
        "MiniMax-Text-01"
      );
    case "gemini":
      return new OpenAIProvider(
        apiKey,
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "gemini-2.0-flash"
      );
    default:
      throw new Error(`Unsupported AI provider: ${name}`);
  }
}
