import type {
  Resume,
  JobDescription,
  IndustryPack,
  AIMessage,
  RewriteMode,
  SemanticScore,
  QuestionType,
  InterviewFeedback,
} from "../types.js";
import type { NamedAIProvider } from "./provider.js";

export class OpenAIProvider implements NamedAIProvider {
  readonly name = "openai" as const;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(apiKey: string, baseUrl?: string, model?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl ?? "https://api.openai.com/v1/chat/completions";
    this.model = model ?? "gpt-4o";
  }

  async rewriteResume(
    base: Resume,
    jd: JobDescription,
    pack: IndustryPack,
    mode: RewriteMode
  ): Promise<Resume> {
    const prompt = buildRewritePrompt(base, jd, pack, mode);
    const response = await this.chat(
      [
        { role: "system", content: buildRewriteSystem(pack, mode) },
        { role: "user", content: prompt },
      ],
      { maxTokens: 8192, jsonMode: true }
    );
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

  async conductInterview(
    question: string,
    questionType: QuestionType,
    answer: string,
    pack: IndustryPack
  ): Promise<InterviewFeedback> {
    const response = await this.chat([
      {
        role: "system",
        content: `You are a senior interviewer for a ${pack.name} role. Be professional but supportive. Return valid JSON only.`,
      },
      {
        role: "user",
        content: buildInterviewPrompt(question, questionType, answer),
      },
    ]);
    return JSON.parse(extractJson(response));
  }

  async generateFollowUp(
    question: string,
    answer: string,
    pack: IndustryPack
  ): Promise<string> {
    const response = await this.chat([
      {
        role: "system",
        content: `You are a senior interviewer for a ${pack.name} role. Generate ONE follow-up question that probes deeper into the candidate's answer. Return just the question text, no JSON, no quotes.`,
      },
      {
        role: "user",
        content: `Original question: "${question}"\n\nCandidate's answer: "${answer}"\n\nAsk a follow-up question:`,
      },
    ]);
    return response.trim();
  }

  private async chat(
    messages: AIMessage[],
    opts: { maxTokens?: number; jsonMode?: boolean } = {}
  ): Promise<string> {
    const body: Record<string, unknown> = {
      model: this.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      max_tokens: opts.maxTokens ?? 4096,
    };
    if (opts.jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);

    let response: Response;
    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        throw new Error(
          "AI provider timed out after 50s. Try a shorter resume/JD or switch to a faster model."
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0].message.content;
  }
}

function extractJson(text: string): string {
  const stripped = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return match[0];
}

function buildRewriteSystem(pack: IndustryPack, mode: RewriteMode): string {
  return `You are a professional resume writer specializing in ${pack.name}.
You MUST return ONE valid JSON object and nothing else (no markdown fences, no commentary).

The JSON must have exactly these keys with these types:
- "name": string
- "contact": object with optional "email", "phone", "linkedin", "location" string fields
- "summary": string
- "experience": array of { "company": string, "title": string, "dates": string, "bullets": string[] }
- "education": array of { "institution": string, "degree": string, "dates": string }
- "skills": string[]
- "certifications": string[]

RULES:
- NEVER fabricate experience, companies, degrees, or certifications
- NEVER change: name, contact info, company names, job titles, dates, education institutions
- NEVER invent specific numbers, percentages, monetary amounts, headcounts, or incident counts. Only keep quantified results that already appear in the original resume; if the original is unquantified, leave it unquantified.
- NEVER name a consulting client. Refer to clients with generic descriptors only ("a global pharmaceutical company", "a multinational FMCG client", "a leading consumer healthcare firm"). This applies even if the client is mentioned in the JD or job context.
- Treat advisory/consulting tenure as advisory work — never reframe it as an in-house compliance, audit, or DPO position.
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

  // Truncate (don't strip) raw_text and JD to balance context vs latency.
  // Stripping raw_text entirely meant the model couldn't see real bullets
  // and its rewrites became trivial; including the full payload pushed
  // response time past Vercel's 60s function cap. 4000 chars covers a
  // typical full resume; 2000 covers a JD's responsibilities + reqs.
  const trimmedBase = {
    ...base,
    raw_text: base.raw_text ? base.raw_text.slice(0, 4000) : undefined,
  };
  const trimmedJd = jd.raw_text.slice(0, 2000);

  return `${modeInstructions}

Current resume:
${JSON.stringify(trimmedBase, null, 2)}

Job description:
${trimmedJd}`;
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

function buildInterviewPrompt(
  question: string,
  questionType: QuestionType,
  answer: string
): string {
  return `Question type: ${questionType}
Question: "${question}"

Candidate's answer:
"${answer}"

Evaluate this interview answer and return JSON:
{
  "overall_score": <0-100>,
  "dimensions": [
    {"name": "Content Depth", "score": <0-100>},
    {"name": "Structure & Clarity", "score": <0-100>},
    {"name": "Specificity", "score": <0-100>},
    {"name": "Technical Accuracy", "score": <0-100>}
  ],
  "strengths": ["specific strength 1", "specific strength 2"],
  "improvements": ["specific improvement 1", "specific improvement 2"],
  "sample_answer": "A strong answer would be: ..."
}`;
}
