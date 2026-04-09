import { describe, it, expect } from "vitest";
import { readFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generatePDF } from "../../src/pdf/pdf-generator.js";
import { parseResume } from "../../src/parser/resume-parser.js";

const FIXTURES = resolve(fileURLToPath(import.meta.url), "../../../../../fixtures");
const OUTPUT = resolve(fileURLToPath(import.meta.url), "../../../../../test-output.pdf");

describe("generatePDF", () => {
  it("generates a PDF file from a resume", async () => {
    const content = await readFile(resolve(FIXTURES, "sample-resume.json"), "utf-8");
    const resume = await parseResume(content, "json");

    const path = await generatePDF(resume, "conservative", OUTPUT);
    expect(path).toBe(OUTPUT);

    const stat = await readFile(OUTPUT);
    expect(stat.length).toBeGreaterThan(0);
    expect(stat.toString("utf-8", 0, 4)).toBe("%PDF");

    await unlink(OUTPUT);
  }, 30000);
});
