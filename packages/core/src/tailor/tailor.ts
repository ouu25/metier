import type { Resume, TailorResult, IndustryPack } from "../types.js";
import type { InputFormat } from "../parser/resume-parser.js";
import type { NamedAIProvider } from "../ai/provider.js";
import { parseResume } from "../parser/resume-parser.js";
import { parseJobDescription } from "../parser/jd-parser.js";
import { loadPack, detectIndustry } from "../pack/pack-loader.js";
import { scoreATS } from "../scorer/ats-scorer.js";
import { generatePDF } from "../pdf/pdf-generator.js";

export interface TailorOptions {
  resumeContent: string | Buffer;
  resumeFormat: InputFormat;
  jdText: string;
  industry?: string;
  generatePdf?: boolean;
  outputPath?: string;
  aiProvider?: NamedAIProvider;
}

export interface TailorOutput extends TailorResult {
  detected_industry?: string;
  pack_name?: string;
}

export async function tailor(options: TailorOptions): Promise<TailorOutput> {
  const resume = await parseResume(options.resumeContent, options.resumeFormat);

  const industry = options.industry ?? detectIndustry(options.jdText);
  let pack: IndustryPack | undefined;
  if (industry) {
    try {
      pack = await loadPack(industry);
    } catch {
      // Pack not found, proceed without
    }
  }

  const jd = parseJobDescription(options.jdText, pack);

  const score = pack
    ? scoreATS(resume, jd, pack)
    : {
        overall: 0,
        matched_keywords: [],
        missing_keywords: [],
        dimension_scores: [],
        suggestions: ["Could not detect industry. Specify --industry flag."],
      };

  const result: TailorOutput = {
    score,
    detected_industry: industry,
    pack_name: pack?.name,
  };

  if (options.aiProvider && pack) {
    result.tailored_resume = await options.aiProvider.rewriteResume(resume, jd, pack);
  }

  if (options.generatePdf && pack) {
    const finalResume = result.tailored_resume ?? resume;
    const outputPath = options.outputPath ?? `tailored-${Date.now()}.pdf`;
    result.pdf_path = await generatePDF(finalResume, pack.resume_style, outputPath);
  }

  return result;
}
