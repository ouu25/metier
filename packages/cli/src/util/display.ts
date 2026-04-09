import chalk from "chalk";
import type { ATSScore } from "@metier/core";

export function displayScore(score: ATSScore): void {
  const color =
    score.overall >= 70
      ? chalk.green
      : score.overall >= 40
        ? chalk.yellow
        : chalk.red;

  console.log(`\n${chalk.bold("ATS Score:")} ${color(score.overall + "/100")}\n`);

  if (score.matched_keywords.length > 0) {
    console.log(chalk.green.bold("Matched Keywords:"));
    console.log(`  ${score.matched_keywords.join(", ")}\n`);
  }

  if (score.missing_keywords.length > 0) {
    console.log(chalk.red.bold("Missing Keywords:"));
    console.log(`  ${score.missing_keywords.join(", ")}\n`);
  }

  if (score.dimension_scores.length > 0) {
    console.log(chalk.bold("Dimension Scores:"));
    for (const dim of score.dimension_scores) {
      const dimColor =
        dim.score >= 70 ? chalk.green : dim.score >= 40 ? chalk.yellow : chalk.red;
      const bar = "█".repeat(Math.round(dim.score / 5)) + "░".repeat(20 - Math.round(dim.score / 5));
      console.log(`  ${dim.name.padEnd(25)} ${dimColor(bar)} ${dim.score}`);
    }
    console.log();
  }

  if (score.suggestions.length > 0) {
    console.log(chalk.bold("Suggestions:"));
    for (const suggestion of score.suggestions) {
      console.log(`  ${chalk.yellow("→")} ${suggestion}`);
    }
    console.log();
  }
}

export function success(msg: string): void {
  console.log(chalk.green("✓") + " " + msg);
}

export function error(msg: string): void {
  console.log(chalk.red("✗") + " " + msg);
}

export function info(msg: string): void {
  console.log(chalk.blue("ℹ") + " " + msg);
}
