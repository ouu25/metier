import { describe, it, expect } from "vitest";
import { createProvider } from "../../src/ai/provider.js";

describe("createProvider", () => {
  it("creates a claude provider", () => {
    const provider = createProvider("claude", "fake-key");
    expect(provider).toBeDefined();
    expect(provider.name).toBe("claude");
  });

  it("creates an openai provider", () => {
    const provider = createProvider("openai", "fake-key");
    expect(provider).toBeDefined();
    expect(provider.name).toBe("openai");
  });

  it("throws on unknown provider", () => {
    expect(() => createProvider("gemini" as any, "key")).toThrow(
      "Unsupported AI provider: gemini"
    );
  });

  it("throws on missing API key", () => {
    expect(() => createProvider("claude", "")).toThrow("API key is required");
  });
});
