import { loadPack, loadAllPacks, createProvider, type ProviderName } from "@metier/core";
import { loadApiKey } from "../util/config.js";
import { info, error, success } from "../util/display.js";
import * as readline from "node:readline/promises";
import chalk from "chalk";

export async function interviewCommand(
  packName?: string
): Promise<void> {
  const packs = await loadAllPacks();

  if (!packName) {
    info("Available industries:");
    packs.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}`);
    });
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    const choice = await rl.question("\nSelect industry (number): ");
    rl.close();
    const idx = parseInt(choice, 10) - 1;
    if (idx < 0 || idx >= packs.length) {
      error("Invalid selection.");
      process.exit(1);
    }
    packName = packs[idx].aliases[0] ?? packs[idx].name.toLowerCase();
  }

  const pack = await loadPack(packName);
  info(`Industry: ${pack.name}\n`);

  const allQuestions: Array<{ text: string; type: string }> = [
    ...pack.interview_questions.technical.map((q) => ({
      text: q,
      type: "technical",
    })),
    ...pack.interview_questions.behavioral.map((q) => ({
      text: q,
      type: "behavioral",
    })),
    ...pack.interview_questions.case.map((q) => ({
      text: q,
      type: "case",
    })),
  ];

  console.log(chalk.bold("Questions:"));
  allQuestions.forEach((q, i) => {
    const typeColor =
      q.type === "technical"
        ? chalk.cyan
        : q.type === "behavioral"
          ? chalk.magenta
          : chalk.yellow;
    console.log(`  ${i + 1}. ${typeColor(`[${q.type}]`)} ${q.text}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const choice = await rl.question("\nSelect question (number): ");
  const idx = parseInt(choice, 10) - 1;
  if (idx < 0 || idx >= allQuestions.length) {
    error("Invalid selection.");
    rl.close();
    process.exit(1);
  }

  const selected = allQuestions[idx];

  const { provider, key } = await loadApiKey();
  if (!provider || !key) {
    error("AI provider required. Run 'metier init' to configure.");
    rl.close();
    process.exit(1);
  }

  const aiProvider = createProvider(provider as ProviderName, key);

  console.log(
    `\n${chalk.blue.bold("Interviewer:")} ${selected.text}\n`
  );
  const answer = await rl.question(chalk.green.bold("Your answer:\n> "));

  info("\nEvaluating your answer...\n");

  const feedback = await aiProvider.conductInterview(
    selected.text,
    selected.type as "technical" | "behavioral" | "case",
    answer,
    pack
  );

  console.log(
    `\n${chalk.bold("Score:")} ${feedback.overall_score >= 70 ? chalk.green(feedback.overall_score) : feedback.overall_score >= 40 ? chalk.yellow(feedback.overall_score) : chalk.red(feedback.overall_score)}/100\n`
  );

  console.log(chalk.bold("Dimensions:"));
  for (const dim of feedback.dimensions) {
    const dimColor =
      dim.score >= 70 ? chalk.green : dim.score >= 40 ? chalk.yellow : chalk.red;
    const bar =
      "█".repeat(Math.round(dim.score / 5)) +
      "░".repeat(20 - Math.round(dim.score / 5));
    console.log(`  ${dim.name.padEnd(25)} ${dimColor(bar)} ${dim.score}`);
  }

  if (feedback.strengths.length > 0) {
    console.log(`\n${chalk.green.bold("Strengths:")}`);
    feedback.strengths.forEach((s) => console.log(`  ${chalk.green("+")} ${s}`));
  }

  if (feedback.improvements.length > 0) {
    console.log(`\n${chalk.red.bold("To Improve:")}`);
    feedback.improvements.forEach((s) =>
      console.log(`  ${chalk.red("-")} ${s}`)
    );
  }

  console.log(`\n${chalk.blue.bold("Sample Answer:")}`);
  console.log(`  ${feedback.sample_answer}\n`);

  const followUp = await rl.question("Want a follow-up question? (y/n): ");
  if (followUp.toLowerCase() === "y") {
    info("Generating follow-up...\n");
    const followUpQ = await aiProvider.generateFollowUp(
      selected.text,
      answer,
      pack
    );
    console.log(`${chalk.blue.bold("Follow-up:")} ${followUpQ}\n`);

    const followUpAnswer = await rl.question(
      chalk.green.bold("Your answer:\n> ")
    );
    info("\nEvaluating...\n");

    const followUpFeedback = await aiProvider.conductInterview(
      followUpQ,
      selected.type as "technical" | "behavioral" | "case",
      followUpAnswer,
      pack
    );

    console.log(
      `\n${chalk.bold("Score:")} ${followUpFeedback.overall_score}/100\n`
    );
    if (followUpFeedback.strengths.length > 0) {
      console.log(chalk.green.bold("Strengths:"));
      followUpFeedback.strengths.forEach((s) =>
        console.log(`  ${chalk.green("+")} ${s}`)
      );
    }
    if (followUpFeedback.improvements.length > 0) {
      console.log(chalk.red.bold("To Improve:"));
      followUpFeedback.improvements.forEach((s) =>
        console.log(`  ${chalk.red("-")} ${s}`)
      );
    }
    console.log(`\n${chalk.blue.bold("Sample Answer:")}`);
    console.log(`  ${followUpFeedback.sample_answer}\n`);
  }

  rl.close();
  success("Practice session complete!");
}
