import type { Resume, JobDescription, IndustryPack, AIMessage } from "../types.js";
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
    pack: IndustryPack
  ): Promise<Resume> {
    const prompt = buildRewritePrompt(base, jd, pack);
    const response = await this.chat([
      { role: "system", content: "You are a professional resume writer. Output valid JSON only." },
      { role: "user", content: prompt },
    ]);
    return JSON.parse(response);
  }

  async evaluateJob(
    jd: JobDescription,
    resume: Resume,
    pack: IndustryPack
  ): Promise<string> {
    const prompt = buildEvaluatePrompt(jd, resume, pack);
    return this.chat([
      { role: "system", content: "You are a career advisor. Provide concise analysis." },
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

    const data = (await response.json()) as { content: Array<{ text: string }> };
    return data.content[0].text;
  }
}

function buildRewritePrompt(base: Resume, jd: JobDescription, pack: IndustryPack): string {
  return `Rewrite this resume to better match the job description.
Inject these missing keywords naturally: ${jd.extracted_keywords.hard_skills.join(", ")}.
Industry: ${pack.name}.
Keep the same structure. Return valid JSON matching this schema:
{name, contact, summary, experience: [{company, title, dates, bullets}], education, skills, certifications}

Current resume:
${JSON.stringify(base, null, 2)}

Job description:
${jd.raw_text}`;
}

function buildEvaluatePrompt(jd: JobDescription, resume: Resume, pack: IndustryPack): string {
  return `Evaluate how well this candidate matches this job.
Industry: ${pack.name}
Resume: ${JSON.stringify(resume, null, 2)}
Job Description: ${jd.raw_text}
Provide: match assessment, strengths, gaps, and recommendation (apply / skip / stretch).`;
}
