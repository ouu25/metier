import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tailor, createProvider, type ProviderName } from "@metier/core";
import { getProfilePath, getOutputDir, loadApiKey } from "../util/config.js";
import { displayScore, success, error, info } from "../util/display.js";

export async function tailorCommand(
  jdPath: string,
  options: { industry?: string; noAi?: boolean; noPdf?: boolean }
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

  const resumeContent = await readFile(profilePath, "utf-8");
  const jdText = await readFile(jdPath, "utf-8");

  let aiProvider = undefined;
  if (!options.noAi) {
    const { provider, key } = await loadApiKey();
    if (provider && key) {
      aiProvider = createProvider(provider as ProviderName, key);
      info(`Using AI provider: ${provider}`);
    } else {
      info("No AI provider configured. Generating score only.");
      info("Run 'metier init' to set up AI, or use --no-ai to suppress this message.\n");
    }
  }

  const generatePdf = !options.noPdf;
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputPath = join(getOutputDir(), `tailored-${timestamp}.pdf`);

  info("Analyzing and tailoring resume...\n");

  const result = await tailor({
    resumeContent,
    resumeFormat: "json",
    jdText,
    industry: options.industry,
    generatePdf,
    outputPath,
    aiProvider,
  });

  if (result.detected_industry) {
    info(`Detected industry: ${result.pack_name} (${result.detected_industry})`);
  }

  displayScore(result.score);

  if (result.tailored_resume) {
    success("Resume tailored with AI keyword injection.");
  }

  if (result.pdf_path) {
    success(`PDF generated: ${result.pdf_path}`);
  }
}
