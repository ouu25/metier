import { describe, it, expect } from "vitest";
import { loadAllPacks, loadPack } from "@metier/core";

describe("pack commands logic", () => {
  it("lists all available packs", async () => {
    const packs = await loadAllPacks();
    expect(packs.length).toBe(3);
  });

  it("shows info for a specific pack", async () => {
    const pack = await loadPack("finance");
    expect(pack.name).toBe("Finance & Compliance");
    expect(pack.keywords.hard_skills.length).toBeGreaterThan(0);
    expect(pack.scoring_dimensions.length).toBeGreaterThan(0);
  });
});
