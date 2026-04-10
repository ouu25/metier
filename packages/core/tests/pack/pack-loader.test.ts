import { describe, it, expect } from "vitest";
import { loadPack, loadAllPacks, detectIndustry } from "../../src/pack/pack-loader.js";

describe("loadPack", () => {
  it("loads and validates the finance pack", async () => {
    const pack = await loadPack("finance");
    expect(pack.name).toBe("Finance & Compliance");
    expect(pack.aliases).toContain("audit");
    expect(pack.keywords.hard_skills.length).toBeGreaterThan(0);
    expect(pack.keywords.certifications).toContain("CPA");
    expect(pack.scoring_dimensions.reduce((sum, d) => sum + d.weight, 0)).toBeCloseTo(1.0);
    expect(pack.resume_style).toBe("conservative");
  });

  it("loads and validates the sales pack", async () => {
    const pack = await loadPack("sales");
    expect(pack.name).toBe("Sales & Business Development");
    expect(pack.resume_style).toBe("executive");
  });

  it("loads and validates the engineering pack", async () => {
    const pack = await loadPack("engineering");
    expect(pack.name).toBe("Software Engineering");
    expect(pack.resume_style).toBe("modern");
  });

  it("throws on nonexistent pack", async () => {
    await expect(loadPack("nonexistent")).rejects.toThrow("Pack not found: nonexistent");
  });
});

describe("loadAllPacks", () => {
  it("returns all available packs", async () => {
    const packs = await loadAllPacks();
    expect(packs.length).toBe(10);
    const names = packs.map((p) => p.name);
    expect(names).toContain("Finance & Compliance");
    expect(names).toContain("Sales & Business Development");
    expect(names).toContain("Software Engineering");
  });
});

describe("detectIndustry", () => {
  it("detects finance from JD text", () => {
    const text = "We are looking for an internal audit manager with SOX compliance experience and IFRS knowledge";
    expect(detectIndustry(text)).toBe("finance");
  });

  it("detects sales from JD text", () => {
    const text = "Seeking an enterprise account executive to manage pipeline and exceed quota targets using Salesforce";
    expect(detectIndustry(text)).toBe("sales");
  });

  it("detects engineering from JD text", () => {
    const text = "Senior backend engineer needed for microservices architecture with Kubernetes and CI/CD pipelines";
    expect(detectIndustry(text)).toBe("engineering");
  });

  it("returns undefined for unrecognizable text", () => {
    const text = "Lorem ipsum dolor sit amet";
    expect(detectIndustry(text)).toBeUndefined();
  });
});
