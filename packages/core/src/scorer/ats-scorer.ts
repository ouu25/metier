import type {
  Resume,
  JobDescription,
  IndustryPack,
  ATSScore,
  DimensionScore,
} from "../types.js";

export function scoreATS(
  resume: Resume,
  jd: JobDescription,
  pack: IndustryPack
): ATSScore {
  const resumeText = buildResumeText(resume);
  const resumeLower = resumeText.toLowerCase();

  const allJdKeywords = [
    ...jd.extracted_keywords.hard_skills,
    ...jd.extracted_keywords.soft_skills,
    ...jd.extracted_keywords.certifications,
    ...jd.extracted_keywords.tools,
  ];

  const matched: string[] = [];
  const missing: string[] = [];

  for (const kw of allJdKeywords) {
    if (resumeLower.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  }

  const dimensionScores = scoreDimensions(resume, jd, pack, resumeLower);

  const overall = Math.round(
    dimensionScores.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  const suggestions = generateSuggestions(missing, jd, resume);

  return {
    overall: Math.min(100, Math.max(0, overall)),
    matched_keywords: matched,
    missing_keywords: missing,
    dimension_scores: dimensionScores,
    suggestions,
  };
}

function buildResumeText(resume: Resume): string {
  const parts = [
    resume.summary,
    ...resume.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
    ...resume.education.map((e) => `${e.degree} ${e.institution}`),
    ...resume.skills,
    ...resume.certifications,
  ];
  return parts.join(" ");
}

function scoreDimensions(
  resume: Resume,
  jd: JobDescription,
  pack: IndustryPack,
  resumeLower: string
): DimensionScore[] {
  return pack.scoring_dimensions.map((dim) => {
    const score = scoreSingleDimension(dim.name, resume, jd, pack, resumeLower);
    return { name: dim.name, score, weight: dim.weight };
  });
}

function scoreSingleDimension(
  name: string,
  resume: Resume,
  jd: JobDescription,
  pack: IndustryPack,
  resumeLower: string
): number {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes("technical") || normalizedName.includes("skill")) {
    return keywordOverlapScore(
      [...jd.extracted_keywords.hard_skills, ...jd.extracted_keywords.tools],
      resumeLower
    );
  }

  if (normalizedName.includes("certification")) {
    return keywordOverlapScore(jd.extracted_keywords.certifications, resumeLower);
  }

  if (normalizedName.includes("soft skill")) {
    return keywordOverlapScore(jd.extracted_keywords.soft_skills, resumeLower);
  }

  if (normalizedName.includes("experience") || normalizedName.includes("industry")) {
    const yearsRequired = jd.extracted_keywords.experience_years ?? 3;
    const totalYears = estimateYearsFromExperience(resume);
    const yearScore = Math.min(100, (totalYears / yearsRequired) * 100);
    return Math.round(yearScore);
  }

  if (normalizedName.includes("seniority")) {
    const totalYears = estimateYearsFromExperience(resume);
    const required = jd.extracted_keywords.experience_years ?? 3;
    return totalYears >= required ? 80 : Math.round((totalYears / required) * 60);
  }

  if (normalizedName.includes("regulatory") || normalizedName.includes("knowledge")) {
    return keywordOverlapScore(jd.extracted_keywords.hard_skills, resumeLower);
  }

  if (normalizedName.includes("revenue") || normalizedName.includes("track record")) {
    const quantMatches = resumeLower.match(/\d+%|\$[\d,]+|[\d,]+\s*(revenue|arr|pipeline)/gi);
    return quantMatches ? Math.min(100, quantMatches.length * 25) : 20;
  }

  if (normalizedName.includes("methodology")) {
    return keywordOverlapScore(jd.extracted_keywords.hard_skills, resumeLower);
  }

  if (normalizedName.includes("depth") || normalizedName.includes("design")) {
    return keywordOverlapScore(jd.extracted_keywords.hard_skills, resumeLower);
  }

  if (normalizedName.includes("tool") || normalizedName.includes("proficiency")) {
    return keywordOverlapScore(jd.extracted_keywords.tools, resumeLower);
  }

  const allKw = [
    ...jd.extracted_keywords.hard_skills,
    ...jd.extracted_keywords.soft_skills,
  ];
  return keywordOverlapScore(allKw, resumeLower);
}

function keywordOverlapScore(keywords: string[], resumeLower: string): number {
  if (keywords.length === 0) return 50;
  const matched = keywords.filter((kw) => resumeLower.includes(kw.toLowerCase()));
  return Math.round((matched.length / keywords.length) * 100);
}

function estimateYearsFromExperience(resume: Resume): number {
  let total = 0;
  for (const exp of resume.experience) {
    const match = exp.dates.match(/(\d{4})\s*[-–]\s*(\d{4}|present)/i);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2].toLowerCase() === "present"
        ? new Date().getFullYear()
        : parseInt(match[2], 10);
      total += end - start;
    }
  }
  return total;
}

function generateSuggestions(
  missing: string[],
  jd: JobDescription,
  resume: Resume
): string[] {
  const suggestions: string[] = [];

  for (const kw of missing) {
    suggestions.push(`Add "${kw}" — mentioned in JD but missing from your resume`);
  }

  if (jd.extracted_keywords.experience_years) {
    const totalYears = estimateYearsFromExperience(resume);
    if (totalYears < jd.extracted_keywords.experience_years) {
      suggestions.push(
        `JD requires ${jd.extracted_keywords.experience_years}+ years experience. Highlight relevant experience to show depth.`
      );
    }
  }

  return suggestions;
}
