import chalk from "chalk";
import { loadAllPacks, loadPack } from "@metier/core";
import { error, info } from "../util/display.js";

export async function packListCommand(): Promise<void> {
  const packs = await loadAllPacks();

  console.log(chalk.bold("\nAvailable Industry Packs:\n"));
  console.log(
    chalk.gray("Name".padEnd(30) + "Style".padEnd(15) + "Keywords".padEnd(10) + "Portals")
  );
  console.log(chalk.gray("─".repeat(65)));

  for (const pack of packs) {
    const totalKeywords =
      pack.keywords.hard_skills.length +
      pack.keywords.soft_skills.length +
      pack.keywords.certifications.length +
      pack.keywords.tools.length;

    console.log(
      pack.name.padEnd(30) +
        pack.resume_style.padEnd(15) +
        String(totalKeywords).padEnd(10) +
        String(pack.job_portals.length)
    );
  }
  console.log();
}

export async function packInfoCommand(name: string): Promise<void> {
  let pack;
  try {
    pack = await loadPack(name);
  } catch {
    error(`Pack not found: ${name}`);
    info("Run 'metier pack list' to see available packs.");
    process.exit(1);
  }

  console.log(chalk.bold(`\n${pack.name}`));
  console.log(chalk.gray(`Style: ${pack.resume_style}\n`));

  console.log(chalk.bold("Hard Skills:"));
  console.log(`  ${pack.keywords.hard_skills.join(", ")}\n`);

  console.log(chalk.bold("Soft Skills:"));
  console.log(`  ${pack.keywords.soft_skills.join(", ")}\n`);

  console.log(chalk.bold("Certifications:"));
  console.log(`  ${pack.keywords.certifications.join(", ")}\n`);

  console.log(chalk.bold("Tools:"));
  console.log(`  ${pack.keywords.tools.join(", ")}\n`);

  console.log(chalk.bold("Scoring Dimensions:"));
  for (const dim of pack.scoring_dimensions) {
    console.log(`  ${dim.name.padEnd(25)} weight: ${dim.weight}`);
  }
  console.log();

  console.log(chalk.bold("Job Portals:"));
  for (const portal of pack.job_portals) {
    console.log(`  ${portal.name}: ${chalk.blue(portal.url)}`);
  }
  console.log();
}
