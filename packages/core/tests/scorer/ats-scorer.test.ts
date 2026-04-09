import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreATS } from "../../src/scorer/ats-scorer.js";
import { parseResume } from "../../src/parser/resume-parser.js";
import { parseJobDescription } from "../../src/parser/jd-parser.js";
import { loadPack } from "../../src/pack/pack-loader.js";

const FIXTURES = resolve(fileURLToPath(import.meta.url), "../../../../../fixtures");

describe("scoreATS", () => {
  it("scores a well-matched finance resume highly", async () => {
    const resume = await parseResume(
      JSON.stringify({
        name: "Test Finance Pro",
        contact: { email: "test@example.com" },
        summary: "Experienced compliance manager with SOX and IFRS expertise.",
        experience: [
          {
            company: "Acme Corp",
            title: "Compliance Manager",
            dates: "2018-2025",
            bullets: [
              "Led SOX compliance program across 5 regions",
              "Managed internal audit for regulatory reporting",
              "Conducted risk assessments using SAP and Power BI",
            ],
          },
        ],
        education: [{ institution: "LSE", degree: "MSc Finance", dates: "2016-2018" }],
        skills: ["SOX compliance", "IFRS", "GAAP", "risk assessment", "stakeholder management", "internal audit", "SAP", "Power BI"],
        certifications: ["ACCA", "CPA"],
      }),
      "json"
    );
    const jdText = await readFile(resolve(FIXTURES, "sample-jd-finance.txt"), "utf-8");
    const pack = await loadPack("finance");
    const jd = parseJobDescription(jdText, pack);
    const score = scoreATS(resume, jd, pack);

    expect(score.overall).toBeGreaterThan(50);
    expect(score.matched_keywords.length).toBeGreaterThan(0);
    expect(score.matched_keywords).toContain("SOX compliance");
    expect(score.matched_keywords).toContain("ACCA");
    expect(score.dimension_scores.length).toBe(pack.scoring_dimensions.length);
    expect(score.dimension_scores.every((d) => d.score >= 0 && d.score <= 100)).toBe(true);
  });

  it("scores a mismatched resume low", async () => {
    const resume = await parseResume(
      JSON.stringify({
        name: "Test User",
        contact: {},
        summary: "I like cooking and gardening",
        experience: [],
        education: [],
        skills: ["cooking", "gardening"],
        certifications: [],
      }),
      "json"
    );
    const jdText = await readFile(resolve(FIXTURES, "sample-jd-finance.txt"), "utf-8");
    const pack = await loadPack("finance");
    const jd = parseJobDescription(jdText, pack);
    const score = scoreATS(resume, jd, pack);

    expect(score.overall).toBeLessThan(20);
    expect(score.missing_keywords.length).toBeGreaterThan(score.matched_keywords.length);
  });

  it("provides actionable suggestions for missing keywords", async () => {
    const resumeContent = await readFile(resolve(FIXTURES, "sample-resume.json"), "utf-8");
    const jdText = await readFile(resolve(FIXTURES, "sample-jd-finance.txt"), "utf-8");

    const resume = await parseResume(resumeContent, "json");
    const pack = await loadPack("finance");
    const jd = parseJobDescription(jdText, pack);
    const score = scoreATS(resume, jd, pack);

    expect(score.suggestions.length).toBeGreaterThan(0);
    expect(score.missing_keywords.length).toBeGreaterThan(0);
    for (const missing of score.missing_keywords.slice(0, 3)) {
      const hasSuggestion = score.suggestions.some((s) =>
        s.toLowerCase().includes(missing.toLowerCase())
      );
      expect(hasSuggestion).toBe(true);
    }
  });
});
