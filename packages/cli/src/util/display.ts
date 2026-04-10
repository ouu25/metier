import chalk from "chalk";
import type { ATSScore, SemanticScore, Resume } from "@metier/core";

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

export function displaySemanticScore(score: SemanticScore): void {
  const recLabels: Record<string, string> = {
    strong_match: "Strong Match",
    good_match: "Good Match",
    stretch: "Stretch",
    weak_match: "Weak Match",
  };

  const recColor =
    score.recommendation === "strong_match"
      ? chalk.green
      : score.recommendation === "good_match"
        ? chalk.blue
        : score.recommendation === "stretch"
          ? chalk.yellow
          : chalk.red;

  console.log(
    `\n${chalk.bold("AI Semantic Score:")} ${recColor(score.overall + "/100")} (confidence: ${Math.round(score.confidence * 100)}%)`
  );
  console.log(
    `${chalk.bold("Recommendation:")} ${recColor(recLabels[score.recommendation])}\n`
  );

  if (score.strengths.length > 0) {
    console.log(chalk.green.bold("Strengths:"));
    for (const s of score.strengths) {
      console.log(`  ${chalk.green("+")} ${s}`);
    }
    console.log();
  }

  if (score.gaps.length > 0) {
    console.log(chalk.red.bold("Gaps:"));
    for (const g of score.gaps) {
      console.log(`  ${chalk.red("-")} ${g}`);
    }
    console.log();
  }

  if (score.keyword_synonyms.length > 0) {
    console.log(chalk.bold("Synonyms detected:"));
    console.log(
      `  ${score.keyword_synonyms.map((s) => `"${s.jd_term}" ≈ "${s.resume_term}"`).join(", ")}\n`
    );
  }
}

export function displayRewriteSummary(
  original: Resume,
  rewritten: Resume,
  mode: string
): void {
  console.log(chalk.bold(`\nResume rewritten (${mode} mode). Key changes:`));

  if (original.summary !== rewritten.summary) {
    console.log(`  Summary: ${chalk.yellow("modified")}`);
  }

  let changedBullets = 0;
  let totalBullets = 0;
  for (let i = 0; i < rewritten.experience.length; i++) {
    const orig = original.experience[i];
    for (let j = 0; j < rewritten.experience[i].bullets.length; j++) {
      totalBullets++;
      if (orig?.bullets[j] !== rewritten.experience[i].bullets[j]) {
        changedBullets++;
      }
    }
  }
  console.log(
    `  Experience bullets: ${chalk.yellow(`${changedBullets} of ${totalBullets} rewritten`)}`
  );

  const addedSkills = rewritten.skills.filter(
    (s) => !original.skills.includes(s)
  );
  if (addedSkills.length > 0) {
    console.log(
      `  Skills: reordered, ${chalk.yellow(`${addedSkills.length} added`)}`
    );
  } else if (
    original.skills.join(",") !== rewritten.skills.join(",")
  ) {
    console.log(`  Skills: ${chalk.yellow("reordered")}`);
  }

  console.log();
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
