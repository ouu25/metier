import type {
  Resume,
  JobDescription,
  IndustryPack,
  AIMessage,
  RewriteMode,
  RewriteSuggestions,
  SemanticScore,
  QuestionType,
  InterviewFeedback,
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
  ): Promise<RewriteSuggestions> {
    const prompt = buildRewritePrompt(base, jd, pack, mode);
    const response = await this.chat(
      [
        { role: "system", content: buildRewriteSystem(pack, mode) },
        { role: "user", content: prompt },
      ],
      { maxTokens: 4096 }
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
    opts: { maxTokens?: number } = {}
  ): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system");
    const userMsgs = messages.filter((m) => m.role !== "system");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 50_000);

    let response: Response;
    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: opts.maxTokens ?? 4096,
          system: systemMsg?.content ?? "",
          messages: userMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
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
      throw new Error(`Claude API error (${response.status}): ${error}`);
    }

    const data = (await response.json()) as {
      content: Array<{ text: string }>;
    };
    return data.content[0].text;
  }
}

function extractJson(text: string): string {
  const stripped = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");
  const match = stripped.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return match[0];
}

function buildRewriteSystem(pack: IndustryPack, mode: RewriteMode): string {
  return `You are an honest career advisor specializing in ${pack.name}.
Your job is NOT to rewrite the resume for the user. Your job is to produce a SHORT, ACTIONABLE change-list the user can review and apply themselves.

Return ONE valid JSON object and nothing else (no markdown fences, no commentary). The JSON must match exactly this shape:
{
  "verdict": "good_fit" | "stretch" | "skip",
  "verdict_reason": "<one sentence explaining the verdict, naming the hard-blockers if any>",
  "changes": [
    {
      "action": "add" | "replace" | "skip",
      "section": "summary" | "skills" | "experience" | "certifications",
      "jd_keyword": "<the JD term this change targets, if any>",
      "original": "<the exact original text being replaced — only when action is 'replace'>",
      "proposed": "<for 'add': the new text to insert; for 'replace': the replacement text; for 'skip': empty string>",
      "rationale": "<one sentence: why this change is justified by the original resume, OR why this missing keyword should be SKIPPED because the candidate has no supporting experience>"
    }
  ]
}

HARD RULES — violating any of these makes the suggestion useless:
- COVERAGE: for EVERY missing JD keyword in the user's list, output exactly one entry. Either it's defensible (action: add/replace with rationale) or it isn't (action: skip with rationale). Never silently drop a keyword.
- HONESTY: NEVER invent specific numbers, percentages, monetary amounts, headcounts, or incident counts. Only reuse numbers that already appear in the original resume.
- TERMINOLOGY-SWAP FIRST: if the candidate already does the thing under different wording, prefer "replace" over "add". Examples: "Internal Audit" → "Internal Audit & Control Testing"; "compliance training delivered" → "compliance training program management".
- CLIENT NAMES: never name a consulting client. Use generic descriptors ("a global pharmaceutical company", "a multinational FMCG client").
- ROLE FRAMING: advisory/consulting tenure stays advisory; never reframe as in-house compliance / audit / DPO.
- SKIP HONESTLY: when the candidate's resume shows no experience with a missing keyword (e.g. NIST/FedRAMP/HIPAA/SOC 2 when their work was finance compliance, not cybersecurity), use "skip" with rationale "no supporting experience" — do NOT stretch it onto skills as a vague "transferable skill".
- HIDDEN-SKILLS PASS: also scan the resume for existing strengths the JD wants but the skills line does not yet list (e.g. candidate's bullets describe compliance training but skills line omits "Compliance Training"). Propose those as "add" to skills with rationale citing the bullet.
- Mode: ${mode} — light = only terminology swaps and skills additions; deep = also bullet rephrasings (still no invented numbers).`;
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

  modeInstructions =
    mode === "light"
      ? "Mode: light. Suggest only terminology swaps in skills/summary and skill list additions. Do NOT propose changes to experience bullets."
      : "Mode: deep. May also propose 'replace' changes to specific experience bullets, as long as no numbers are invented and the rephrasing is supported by the original bullet's content.";

  const trimmedBase = {
    ...base,
    raw_text: base.raw_text ? base.raw_text.slice(0, 4000) : undefined,
  };
  const trimmedJd = jd.raw_text.slice(0, 2000);

  return `${modeInstructions}

Missing JD keywords to consider (some may genuinely lack supporting experience — output "skip" for those): ${missing.join(", ")}
Top JD skills to prioritize when ordering: ${topSkills.join(", ")}

Original resume (truncated):
${JSON.stringify(trimmedBase, null, 2)}

Job description (truncated):
${trimmedJd}

Now produce the change-list JSON.`;
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
