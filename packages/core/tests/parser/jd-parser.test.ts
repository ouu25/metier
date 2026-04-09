import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseJobDescription } from "../../src/parser/jd-parser.js";
import { loadPack } from "../../src/pack/pack-loader.js";

const FIXTURES = resolve(fileURLToPath(import.meta.url), "../../../../../fixtures");

describe("parseJobDescription", () => {
  it("extracts keywords from a finance JD using industry pack", async () => {
    const text = await readFile(resolve(FIXTURES, "sample-jd-finance.txt"), "utf-8");
    const pack = await loadPack("finance");
    const jd = parseJobDescription(text, pack);

    expect(jd.raw_text).toBe(text);
    expect(jd.detected_industry).toBe("finance");
    expect(jd.extracted_keywords.hard_skills).toContain("SOX compliance");
    expect(jd.extracted_keywords.hard_skills).toContain("IFRS");
    expect(jd.extracted_keywords.certifications).toContain("ACCA");
    expect(jd.extracted_keywords.certifications).toContain("CPA");
    expect(jd.extracted_keywords.tools).toContain("SAP");
    expect(jd.extracted_keywords.tools).toContain("Power BI");
    expect(jd.extracted_keywords.soft_skills).toContain("stakeholder management");
  });

  it("extracts keywords without a pack (pack-independent extraction)", () => {
    const text = "We need a Python developer with 3 years experience in Django and REST APIs";
    const jd = parseJobDescription(text);

    expect(jd.raw_text).toBe(text);
    expect(jd.extracted_keywords.experience_years).toBe(3);
  });

  it("detects experience years from various formats", () => {
    const text1 = parseJobDescription("5+ years experience in compliance");
    expect(text1.extracted_keywords.experience_years).toBe(5);

    const text2 = parseJobDescription("Minimum 3 years of relevant experience");
    expect(text2.extracted_keywords.experience_years).toBe(3);
  });
});
