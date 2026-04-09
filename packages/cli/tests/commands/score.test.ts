import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tailor } from "@metier/core";
import { readFile } from "node:fs/promises";

const FIXTURES = resolve(fileURLToPath(import.meta.url), "../../../../../fixtures");

describe("score command logic", () => {
  it("scores a JD file against the saved profile", async () => {
    const resumeContent = await readFile(
      resolve(FIXTURES, "sample-resume.json"),
      "utf-8"
    );
    const jdText = await readFile(
      resolve(FIXTURES, "sample-jd-finance.txt"),
      "utf-8"
    );

    const result = await tailor({
      resumeContent,
      resumeFormat: "json",
      jdText,
      generatePdf: false,
    });

    expect(result.score.overall).toBeGreaterThanOrEqual(0);
    expect(result.score.overall).toBeLessThanOrEqual(100);
    expect(result.detected_industry).toBe("finance");
  });
});
