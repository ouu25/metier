import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tailor } from "@metier/core";
import { getProfilePath } from "../util/config.js";
import { displayScore, error, info } from "../util/display.js";

export async function scoreCommand(jdPath: string, options: { industry?: string }): Promise<void> {
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

  info("Analyzing job description...\n");

  const result = await tailor({
    resumeContent,
    resumeFormat: "json",
    jdText,
    industry: options.industry,
    generatePdf: false,
  });

  if (result.detected_industry) {
    info(`Detected industry: ${result.pack_name} (${result.detected_industry})`);
  }

  displayScore(result.score);
}
