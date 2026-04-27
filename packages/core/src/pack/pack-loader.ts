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
      lower.includes(alias.toLowerCase())
    ).length;
    if (count > bestCount) {
      bestCount = count;
      bestMatch = name;
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
