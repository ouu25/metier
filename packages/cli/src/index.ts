#!/usr/bin/env node
import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import { scoreCommand } from "./commands/score.js";
import { tailorCommand } from "./commands/tailor.js";
import { packListCommand, packInfoCommand } from "./commands/pack.js";

const program = new Command();

program
  .name("metier")
  .description("AI-powered career toolkit for every industry")
  .version("0.1.0");

program
  .command("init")
  .description("Set up your Metier profile and API keys")
  .action(initCommand);

program
  .command("score <jd-file>")
  .description("Score how well your resume matches a job description")
  .option("-i, --industry <name>", "Override industry detection")
  .action(scoreCommand);

program
  .command("tailor <jd-file>")
  .description("Tailor your resume to a job description and generate PDF")
  .option("-i, --industry <name>", "Override industry detection")
  .option("--no-ai", "Skip AI rewriting, score only")
  .option("--no-pdf", "Skip PDF generation")
  .option("--rewrite <mode>", "AI rewrite mode: light or deep")
  .option("--semantic", "Enable AI semantic scoring")
  .action(tailorCommand);

const packCmd = program
  .command("pack")
  .description("Manage industry packs");

packCmd
  .command("list")
  .description("List all available industry packs")
  .action(packListCommand);

packCmd
  .command("info <name>")
  .description("Show details of a specific industry pack")
  .action(packInfoCommand);

program.parse();
