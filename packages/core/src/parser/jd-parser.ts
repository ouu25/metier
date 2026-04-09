import type { JobDescription, ExtractedKeywords, IndustryPack } from "../types.js";
import { detectIndustry } from "../pack/pack-loader.js";

export function parseJobDescription(
  text: string,
  pack?: IndustryPack
): JobDescription {
  const detected = detectIndustry(text);
  const extracted = extractKeywords(text, pack);

  return {
    raw_text: text,
    detected_industry: detected,
    extracted_keywords: extracted,
  };
}

function extractKeywords(
  text: string,
  pack?: IndustryPack
): ExtractedKeywords {
  const lower = text.toLowerCase();

  const result: ExtractedKeywords = {
    hard_skills: [],
    soft_skills: [],
    certifications: [],
    tools: [],
    experience_years: extractExperienceYears(text),
  };

  if (!pack) return result;

  result.hard_skills = pack.keywords.hard_skills.filter((kw) =>
    lower.includes(kw.toLowerCase())
  );
  result.soft_skills = pack.keywords.soft_skills.filter((kw) =>
    lower.includes(kw.toLowerCase())
  );
  result.certifications = pack.keywords.certifications.filter((kw) =>
    lower.includes(kw.toLowerCase())
  );
  result.tools = pack.keywords.tools.filter((kw) =>
    lower.includes(kw.toLowerCase())
  );

  return result;
}

function extractExperienceYears(text: string): number | undefined {
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|relevant)/i,
    /minimum\s+(\d+)\s*years?/i,
    /(\d+)\s*-\s*\d+\s*years?/i,
    /at\s+least\s+(\d+)\s*years?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseInt(match[1], 10);
  }
  return undefined;
}
