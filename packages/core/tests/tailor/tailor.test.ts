import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tailor } from "../../src/tailor/tailor.js";

const FIXTURES = resolve(fileURLToPath(import.meta.url), "../../../../../fixtures");

describe("tailor", () => {
  it("runs the full pipeline without AI (score only)", async () => {
    const resumeContent = await readFile(resolve(FIXTURES, "sample-resume.json"), "utf-8");
    const jdText = await readFile(resolve(FIXTURES, "sample-jd-finance.txt"), "utf-8");

    const result = await tailor({
      resumeContent,
      resumeFormat: "json",
      jdText,
      generatePdf: false,
    });

    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.score.overall).toBeLessThanOrEqual(100);
    expect(result.score.dimension_scores.length).toBeGreaterThan(0);
    expect(result.score.suggestions.length).toBeGreaterThan(0);
    expect(result.tailored_resume).toBeUndefined();
    expect(result.pdf_path).toBeUndefined();
  });

  it("auto-detects industry from JD", async () => {
    const resumeContent = await readFile(resolve(FIXTURES, "sample-resume.json"), "utf-8");
    const jdText = await readFile(resolve(FIXTURES, "sample-jd-finance.txt"), "utf-8");

    const result = await tailor({
      resumeContent,
      resumeFormat: "json",
      jdText,
      generatePdf: false,
    });

    expect(result.detected_industry).toBe("finance");
    expect(result.pack_name).toBe("Finance & Compliance");
  });
});
