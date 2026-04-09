import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import type { MetierConfig } from "@metier/core";

const METIER_DIR = join(homedir(), ".metier");
const CONFIG_PATH = join(METIER_DIR, "config.json");
const ENV_PATH = join(METIER_DIR, ".env");

export function getMetierDir(): string {
  return METIER_DIR;
}

export function getOutputDir(): string {
  return join(METIER_DIR, "output");
}

export function getProfilePath(): string {
  return join(METIER_DIR, "profile.json");
}

export async function ensureMetierDir(): Promise<void> {
  if (!existsSync(METIER_DIR)) {
    await mkdir(METIER_DIR, { recursive: true });
  }
  const outputDir = getOutputDir();
  if (!existsSync(outputDir)) {
    await mkdir(outputDir, { recursive: true });
  }
}

export async function loadConfig(): Promise<MetierConfig> {
  await ensureMetierDir();
  const defaults: MetierConfig = {
    output_dir: getOutputDir(),
    profile_path: getProfilePath(),
  };
  if (!existsSync(CONFIG_PATH)) return defaults;

  const content = await readFile(CONFIG_PATH, "utf-8");
  return { ...defaults, ...JSON.parse(content) };
}

export async function saveConfig(config: Partial<MetierConfig>): Promise<void> {
  await ensureMetierDir();
  const existing = await loadConfig();
  const merged = { ...existing, ...config };
  await writeFile(CONFIG_PATH, JSON.stringify(merged, null, 2));
}

export async function loadApiKey(): Promise<{ provider?: string; key?: string }> {
  if (!existsSync(ENV_PATH)) return {};
  const content = await readFile(ENV_PATH, "utf-8");
  const lines = content.split("\n");
  let provider: string | undefined;
  let key: string | undefined;

  for (const line of lines) {
    if (line.startsWith("AI_PROVIDER=")) provider = line.split("=")[1]?.trim();
    if (line.startsWith("ANTHROPIC_API_KEY=")) key = line.split("=")[1]?.trim();
    if (line.startsWith("OPENAI_API_KEY=")) key = line.split("=")[1]?.trim();
  }
  return { provider, key };
}

export async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  await ensureMetierDir();
  const keyName = provider === "claude" ? "ANTHROPIC_API_KEY" : "OPENAI_API_KEY";
  const content = `AI_PROVIDER=${provider}\n${keyName}=${apiKey}\n`;
  await writeFile(ENV_PATH, content);
}

export async function profileExists(): Promise<boolean> {
  return existsSync(getProfilePath());
}
