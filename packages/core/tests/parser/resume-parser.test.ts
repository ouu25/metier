import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseResume } from "../../src/parser/resume-parser.js";

const FIXTURES = resolve(fileURLToPath(import.meta.url), "../../../../../fixtures");

describe("parseResume", () => {
  it("parses a JSON resume file", async () => {
    const content = await readFile(resolve(FIXTURES, "sample-resume.json"), "utf-8");
    const resume = await parseResume(content, "json");
    expect(resume.name).toBe("Emily Lawson");
    expect(resume.contact.email).toBe("emily.lawson@example.com");
    expect(resume.experience).toHaveLength(2);
    expect(resume.experience[0].company).toBe("Brightwave Software");
    expect(resume.skills).toContain("demand generation");
    expect(resume.certifications).toContain("Google Analytics Certified");
  });

  it("parses plain text resume into structured format", async () => {
    const text = `
John Smith
john@example.com | +1 555-0100 | linkedin.com/in/johnsmith

Summary
Experienced sales executive with 10 years in enterprise SaaS.

Experience
Acme Corp - Senior Account Executive - 2020-2024
- Exceeded quota by 130% for 3 consecutive years
- Managed $5M pipeline

Education
Harvard Business School - MBA - 2018-2020

Skills
Salesforce, pipeline management, negotiation

Certifications
Salesforce Certified
`;
    const resume = await parseResume(text.trim(), "text");
    expect(resume.name).toBe("John Smith");
    expect(resume.contact.email).toBe("john@example.com");
    expect(resume.experience.length).toBeGreaterThanOrEqual(1);
    expect(resume.skills.length).toBeGreaterThan(0);
  });

  it("returns empty fields for unparseable text", async () => {
    const resume = await parseResume("random gibberish without structure", "text");
    expect(resume.name).toBe("");
    expect(resume.experience).toHaveLength(0);
  });
});
