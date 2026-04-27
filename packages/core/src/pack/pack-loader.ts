import type { IndustryPack } from "../types.js";
import { PACKS } from "./packs.generated.js";

export async function loadPack(name: string): Promise<IndustryPack> {
  const pack = PACKS[name];
  if (!pack) {
    throw new Error(`Pack not found: ${name}`);
  }
  validatePack(pack, name);
  return pack;
}

export async function loadAllPacks(): Promise<IndustryPack[]> {
  return Object.values(PACKS);
}

export function detectIndustry(text: string): string | undefined {
  const lower = text.toLowerCase();
  let bestMatch: string | undefined;
  let bestCount = 0;

  for (const [name, pack] of Object.entries(PACKS)) {
    const count = pack.aliases.filter((alias) =>
      aliasMatches(alias, lower)
    ).length;
    if (count > bestCount) {
      bestCount = count;
      bestMatch = name;
    }
  }

  return bestCount > 0 ? bestMatch : undefined;
}

function aliasMatches(alias: string, lowerText: string): boolean {
  const lowerAlias = alias.toLowerCase();
  // Non-ASCII (CJK, accents): plain substring is fine — those scripts
  // don't suffer from English short-abbreviation noise like "UI" matching
  // "build" or "BI" matching "ability".
  if (!/^[\x00-\x7F]+$/.test(lowerAlias)) {
    return lowerText.includes(lowerAlias);
  }
  // ASCII: require a left word boundary so 2-letter aliases ("UI", "BI",
  // "IP", "BD", "HR") don't match incidental substrings, and "design" no
  // longer matches "redesigned" prefixes. Right side is open so conjugations
  // ("auditor", "compliances", "designs") still count.
  const escaped = lowerAlias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?:^|[^a-z0-9])${escaped}`);
  return re.test(lowerText);
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
