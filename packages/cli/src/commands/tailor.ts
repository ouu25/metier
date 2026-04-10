import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  tailor,
  createProvider,
  type ProviderName,
  type RewriteMode,
} from "@metier/core";
import { getProfilePath, getOutputDir, loadApiKey } from "../util/config.js";
import {
  displayScore,
  displaySemanticScore,
  displayRewriteSummary,
  success,
  error,
  info,
} from "../util/display.js";

export async function tailorCommand(
  jdPath: string,
  options: {
    industry?: string;
    noAi?: boolean;
    noPdf?: boolean;
    rewrite?: string;
    semantic?: boolean;
  }
): Promise<void> {
  const profilePath = getProfilePath();
  if (!existsSync(profilePath)) {
    error("No profile found. Run 'metier init' first.");
    process.exit(1);
  }

  if (!existsSync(jdPath)) {
    error(`JD file not found: ${jdPath}`);
    process.exit(1);
  }

  // Validate rewrite mode
  if (options.rewrite && !["light", "deep"].includes(options.rewrite)) {
    error("--rewrite must be 'light' or 'deep'");
    process.exit(1);
  }

  const resumeContent = await readFile(profilePath, "utf-8");
  const jdText = await readFile(jdPath, "utf-8");

  // --rewrite and --semantic imply AI is needed
  const needsAi = !options.noAi || options.rewrite || options.semantic;

  let aiProvider = undefined;
  if (needsAi) {
    const { provider, key } = await loadApiKey();
    if (provider && key) {
      aiProvider = createProvider(provider as ProviderName, key);
      info(`Using AI provider: ${provider}`);
    } else if (options.rewrite || options.semantic) {
      error(
        "AI provider required for --rewrite and --semantic. Run 'metier init' to configure."
      );
      process.exit(1);
    } else {
      info("No AI provider configured. Generating score only.");
      info(
        "Run 'metier init' to set up AI, or use --no-ai to suppress this message.\n"
      );
    }
  }

  const generatePdf = !options.noPdf;
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .slice(0, 19);
  const outputPath = join(getOutputDir(), `tailored-${timestamp}.pdf`);

  const rewriteMode = options.rewrite as RewriteMode | undefined;

  info(
    rewriteMode
      ? `Analyzing and rewriting resume (${rewriteMode} mode)...\n`
      : "Analyzing and tailoring resume...\n"
  );

  const result = await tailor({
    resumeContent,
    resumeFormat: "json",
    jdText,
    industry: options.industry,
    generatePdf,
    outputPath,
    aiProvider,
    rewriteMode,
    enableSemanticScore: !!options.semantic,
  });

  if (result.detected_industry) {
    info(
      `Detected industry: ${result.pack_name} (${result.detected_industry})`
    );
  }

  displayScore(result.score);

  if (result.semantic_score) {
    displaySemanticScore(result.semantic_score);
  }

  if (result.tailored_resume && result.original_resume) {
    displayRewriteSummary(
      result.original_resume,
      result.tailored_resume,
      rewriteMode ?? "light"
    );
  }

  if (result.pdf_path) {
    success(`PDF generated: ${result.pdf_path}`);
  }
}
