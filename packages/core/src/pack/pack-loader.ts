import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import type { IndustryPack } from "../types.js";

const PACKS_DIR = resolve(
  fileURLToPath(import.meta.url),
  "../../../../../industry-packs"
);

export async function loadPack(name: string): Promise<IndustryPack> {
  const filePath = join(PACKS_DIR, `${name}.yaml`);
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    throw new Error(`Pack not found: ${name}`);
  }
  const pack = yaml.load(content) as IndustryPack;
  validatePack(pack, name);
  return pack;
}

export async function loadAllPacks(): Promise<IndustryPack[]> {
  const files = await readdir(PACKS_DIR);
  const yamlFiles = files.filter((f: string) => f.endsWith(".yaml"));
  const packs: IndustryPack[] = [];
  for (const file of yamlFiles) {
    const name = file.replace(".yaml", "");
    packs.push(await loadPack(name));
  }
  return packs;
}

export function detectIndustry(text: string): string | undefined {
  const packAliases: Record<string, string[]> = {
    finance: [
      "audit", "compliance", "financial", "risk", "internal control",
      "treasury", "fp&a", "accounting", "gaap", "ifrs", "sox",
      "合规", "财务", "审计", "finanz", "comptabilité", "監査",
    ],
    sales: [
      "sales", "business development", "account management", "revenue",
      "quota", "pipeline", "lead generation", "bd",
      "销售", "営業", "vertrieb", "ventes",
    ],
    engineering: [
      "software engineer", "developer", "devops", "backend", "frontend",
      "full stack", "sre", "microservices", "ci/cd",
      "工程师", "エンジニア", "entwickler", "développeur",
    ],
  };

  const lower = text.toLowerCase();
  let bestMatch: string | undefined;
  let bestCount = 0;

  for (const [industry, aliases] of Object.entries(packAliases)) {
    const count = aliases.filter((alias) => lower.includes(alias.toLowerCase())).length;
    if (count > bestCount) {
      bestCount = count;
      bestMatch = industry;
    }
  }

  return bestCount > 0 ? bestMatch : undefined;
}

function validatePack(pack: IndustryPack, name: string): void {
  if (!pack.name) throw new Error(`Pack ${name}: missing 'name'`);
  if (!pack.aliases || pack.aliases.length === 0)
    throw new Error(`Pack ${name}: missing 'aliases'`);
  if (!pack.keywords) throw new Error(`Pack ${name}: missing 'keywords'`);
  if (!pack.scoring_dimensions || pack.scoring_dimensions.length === 0)
    throw new Error(`Pack ${name}: missing 'scoring_dimensions'`);

  const totalWeight = pack.scoring_dimensions.reduce((s, d) => s + d.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    throw new Error(
      `Pack ${name}: scoring dimension weights sum to ${totalWeight}, expected 1.0`
    );
  }
}
