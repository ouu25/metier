import type { Resume, ContactInfo, Experience, Education } from "../types.js";

export type InputFormat = "json" | "text" | "pdf" | "docx";

export async function parseResume(
  content: string | Buffer,
  format: InputFormat
): Promise<Resume> {
  switch (format) {
    case "json":
      return parseJsonResume(content as string);
    case "text":
      return parseTextResume(content as string);
    case "pdf":
      return parsePdfResume(content as Buffer);
    case "docx":
      return parseDocxResume(content as Buffer);
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

function parseJsonResume(content: string): Resume {
  const data = JSON.parse(content);
  return {
    name: data.name ?? "",
    contact: data.contact ?? {},
    summary: data.summary ?? "",
    experience: data.experience ?? [],
    education: data.education ?? [],
    skills: data.skills ?? [],
    certifications: data.certifications ?? [],
  };
}

function parseTextResume(text: string): Resume {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    return emptyResume();
  }

  const name = extractName(lines);
  const contact = extractContact(lines);
  const sections = splitSections(lines);
  const summary = (sections.summary ?? []).join(" ");
  const experience = parseExperienceSection(sections.experience ?? []);
  const education = parseEducationSection(sections.education ?? []);
  const skills = parseSkillsLine(sections.skills ?? []);
  const certifications = parseSkillsLine(sections.certifications ?? []);

  return { name, contact, summary, experience, education, skills, certifications };
}

async function parsePdfResume(buffer: Buffer): Promise<Resume> {
  // Import the inner module directly: pdf-parse's index.js runs a debug
  // block that reads a bundled test PDF, which crashes on Vercel serverless
  // because the test fixture isn't included in the deployment bundle.
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
  const data = await pdfParse(buffer);
  return parseTextResume(data.text);
}

async function parseDocxResume(buffer: Buffer): Promise<Resume> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return parseTextResume(result.value);
}

function emptyResume(): Resume {
  return {
    name: "",
    contact: {},
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  };
}

function extractName(lines: string[]): string {
  for (const line of lines) {
    if (line.includes("@") || line.includes("+") || line.startsWith("http")) continue;
    if (isSectionHeader(line)) continue;
    // A name: 1-4 words, each starting with an uppercase letter
    if (/^[A-Z][a-zA-Z\-'\.]+(?:\s+[A-Z][a-zA-Z\-'\.]+){0,3}$/.test(line)) {
      return line;
    }
    break;
  }
  return "";
}

function extractContact(lines: string[]): ContactInfo {
  const contact: ContactInfo = {};
  for (const line of lines.slice(0, 5)) {
    const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) contact.email = emailMatch[0];

    const phoneMatch = line.match(/\+?[\d\s\-()]{7,}/);
    if (phoneMatch) contact.phone = phoneMatch[0].trim();

    const linkedinMatch = line.match(/linkedin\.com\/in\/[\w-]+/);
    if (linkedinMatch) contact.linkedin = linkedinMatch[0];
  }
  return contact;
}

const SECTION_HEADERS = [
  "summary", "profile", "objective",
  "experience", "work experience", "employment",
  "education", "academic",
  "skills", "technical skills", "core competencies",
  "certifications", "certificates", "qualifications",
];

function isSectionHeader(line: string): boolean {
  return SECTION_HEADERS.includes(line.toLowerCase().replace(/[:#\-]/g, "").trim());
}

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let current = "_header";
  sections[current] = [];

  for (const line of lines) {
    const cleaned = line.toLowerCase().replace(/[:#\-]/g, "").trim();
    const matched = SECTION_HEADERS.find((h) => cleaned === h || cleaned.startsWith(h));
    if (matched) {
      current = matched.split(" ")[0];
      if (current === "work" || current === "employment") current = "experience";
      if (current === "technical" || current === "core") current = "skills";
      if (current === "certificates" || current === "qualifications") current = "certifications";
      if (current === "profile" || current === "objective") current = "summary";
      sections[current] = [];
    } else {
      if (!sections[current]) sections[current] = [];
      sections[current].push(line);
    }
  }
  return sections;
}

function parseExperienceSection(lines: string[]): Experience[] {
  const experiences: Experience[] = [];
  let current: Partial<Experience> | null = null;

  for (const line of lines) {
    const headerMatch = line.match(/^(.+?)\s*[-–|]\s*(.+?)\s*[-–|]\s*(\d{4}.*)$/);
    if (headerMatch) {
      if (current && current.company) {
        experiences.push(current as Experience);
      }
      current = {
        company: headerMatch[1].trim(),
        title: headerMatch[2].trim(),
        dates: headerMatch[3].trim(),
        bullets: [],
      };
    } else if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
      if (current) {
        current.bullets = current.bullets ?? [];
        current.bullets.push(line.replace(/^[-•*]\s*/, "").trim());
      }
    }
  }
  if (current && current.company) {
    experiences.push(current as Experience);
  }
  return experiences;
}

function parseEducationSection(lines: string[]): Education[] {
  const education: Education[] = [];
  for (const line of lines) {
    const match = line.match(/^(.+?)\s*[-–|]\s*(.+?)\s*[-–|]\s*(\d{4}.*)$/);
    if (match) {
      education.push({
        institution: match[1].trim(),
        degree: match[2].trim(),
        dates: match[3].trim(),
      });
    }
  }
  return education;
}

function parseSkillsLine(lines: string[]): string[] {
  return lines
    .join(", ")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
