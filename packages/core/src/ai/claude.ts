import type {
  Resume,
  JobDescription,
  IndustryPack,
  AIMessage,
  RewriteMode,
  SemanticScore,
} from "../types.js";
import type { NamedAIProvider } from "./provider.js";

export class ClaudeProvider implements NamedAIProvider {
  readonly name = "claude" as const;
  private apiKey: string;
  private baseUrl = "https://api.anthropic.com/v1/messages";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async rewriteResume(
    base: Resume,
    jd: JobDescription,
    pack: IndustryPack,
    mode: RewriteMode
  ): Promise<Resume> {
    const prompt = buildRewritePrompt(base, jd, pack, mode);
    const response = await this.chat([
      { role: "system", content: buildRewriteSystem(pack, mode) },
      { role: "user", content: prompt },
    ]);
    return JSON.parse(extractJson(response));
  }

  async semanticScore(
    resume: Resume,
    jd: JobDescription,
    pack: IndustryPack
  ): Promise<SemanticScore> {
    const prompt = buildSemanticPrompt(resume, jd, pack);
    const response = await this.chat([
      {
        role: "system",
        content:
          "You are an expert ATS analyst. Analyze resume-to-JD match semantically. Return valid JSON only.",
      },
      { role: "user", content: prompt },
    ]);
    return JSON.parse(extractJson(response));
  }

  async evaluateJob(
    jd: JobDescription,
    resume: Resume,
    pack: IndustryPack
  ): Promise<string> {
    const prompt = buildEvaluatePrompt(jd, resume, pack);
    return this.chat([
      {
        role: "system",
        content: "You are a career advisor. Provide concise analysis.",
      },
      { role: "user", content: prompt },
    ]);
  }

  private async chat(messages: AIMessage[]): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system");
    const userMsgs = messages.filter((m) => m.role !== "system");

    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemMsg?.content ?? "",
        messages: userMsgs.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error (${response.status}): ${error}`);
    }

    const data = (await response.json()) as {
      content: Array<{ text: string }>;
    };
    return data.content[0].text;
  }
}

function extractJson(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return match[0];
}

function buildRewriteSystem(pack: IndustryPack, mode: RewriteMode): string {
  return `You are a professional resume writer specializing in ${pack.name}.
You MUST return valid JSON matching this schema:
{"name","contact":{"email?","phone?","linkedin?","location?"},"summary","experience":[{"company","title","dates","bullets":[]}],"education":[{"institution","degree","dates"}],"skills":[],"certifications":[]}

RULES:
- NEVER fabricate experience, companies, degrees, or certifications
- NEVER change: name, contact info, company names, job titles, dates, education institutions
- Mode: ${mode}`;
}

function buildRewritePrompt(
  base: Resume,
  jd: JobDescription,
  pack: IndustryPack,
  mode: RewriteMode
): string {
  const missing = [
    ...jd.extracted_keywords.hard_skills,
    ...jd.extracted_keywords.tools,
  ]
    .filter(
      (kw) =>
        !JSON.stringify(base)
          .toLowerCase()
          .includes(kw.toLowerCase())
    )
    .slice(0, 15);

  const topSkills = jd.extracted_keywords.hard_skills.slice(0, 10);

  let modeInstructions: string;

  if (mode === "light") {
    modeInstructions = `Make MINIMAL changes only:
- Inject these missing keywords into existing bullets where truthful: ${missing.join(", ")}
- Reorder skills to prioritize: ${topSkills.join(", ")}
- Adjust summary to naturally include top missing keywords
- Do NOT rewrite bullets from scratch — only insert keywords where they fit naturally`;
  } else {
    modeInstructions = `Rewrite for MAXIMUM ATS match:
- Rewrite summary (2-3 sentences) targeting this specific role
- Rewrite each bullet using format: "Action verb + what + quantified result"
- Reorder experience to lead with most relevant role
- Expand skills list with likely skills inferred from experience
- Prioritize skills matching: ${topSkills.join(", ")}
- Missing keywords to inject: ${missing.join(", ")}`;
  }

  return `${modeInstructions}

Current resume:
${JSON.stringify(base, null, 2)}

Job description:
${jd.raw_text}`;
}

function buildSemanticPrompt(
  resume: Resume,
  jd: JobDescription,
  pack: IndustryPack
): string {
  return `Analyze how well this resume matches this job description.
Industry: ${pack.name}

Consider:
- Semantic equivalents (e.g., "project management" ≈ "managed projects")
- Transferable skills from adjacent domains
- Experience depth vs. JD requirements
- Cultural/soft skill signals

Return JSON:
{
  "overall": <0-100>,
  "confidence": <0.0-1.0>,
  "keyword_synonyms": [{"jd_term": "...", "resume_term": "..."}],
  "strengths": ["..."],
  "gaps": ["..."],
  "recommendation": "strong_match|good_match|stretch|weak_match"
}

Resume:
${JSON.stringify(resume, null, 2)}

Job Description:
${jd.raw_text}`;
}

function buildEvaluatePrompt(
  jd: JobDescription,
  resume: Resume,
  pack: IndustryPack
): string {
  return `Evaluate how well this candidate matches this job.
Industry: ${pack.name}
Resume: ${JSON.stringify(resume, null, 2)}
Job Description: ${jd.raw_text}
Provide: match assessment, strengths, gaps, and recommendation (apply / skip / stretch).`;
}
