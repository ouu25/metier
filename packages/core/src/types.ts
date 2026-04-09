// packages/core/src/types.ts

export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface Experience {
  company: string;
  title: string;
  dates: string;
  bullets: string[];
}

export interface Education {
  institution: string;
  degree: string;
  dates: string;
  details?: string[];
}

export interface Resume {
  name: string;
  contact: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: string[];
}

export interface KeywordSet {
  hard_skills: string[];
  soft_skills: string[];
  certifications: string[];
  tools: string[];
}

export interface ScoringDimension {
  name: string;
  weight: number;
}

export interface JobPortal {
  name: string;
  url: string;
}

export interface InterviewQuestions {
  technical: string[];
  behavioral: string[];
  case: string[];
}

export interface IndustryPack {
  name: string;
  aliases: string[];
  keywords: KeywordSet;
  scoring_dimensions: ScoringDimension[];
  job_portals: JobPortal[];
  interview_questions: InterviewQuestions;
  resume_style: "conservative" | "modern" | "executive";
}

export interface JobDescription {
  raw_text: string;
  title?: string;
  company?: string;
  location?: string;
  extracted_keywords: ExtractedKeywords;
  detected_industry?: string;
}

export interface ExtractedKeywords {
  hard_skills: string[];
  soft_skills: string[];
  certifications: string[];
  tools: string[];
  experience_years?: number;
}

export interface ATSScore {
  overall: number; // 0-100
  matched_keywords: string[];
  missing_keywords: string[];
  dimension_scores: DimensionScore[];
  suggestions: string[];
}

export interface DimensionScore {
  name: string;
  score: number; // 0-100
  weight: number;
}

export interface TailorResult {
  score: ATSScore;
  tailored_resume?: Resume;
  pdf_path?: string;
}

export interface MetierConfig {
  ai_provider?: "claude" | "openai";
  api_key?: string;
  default_industry?: string;
  output_dir: string;
  profile_path: string;
}

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  rewriteResume(
    base: Resume,
    jd: JobDescription,
    pack: IndustryPack
  ): Promise<Resume>;
  evaluateJob(
    jd: JobDescription,
    resume: Resume,
    pack: IndustryPack
  ): Promise<string>;
}
