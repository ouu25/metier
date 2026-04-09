import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { writeFile } from "node:fs/promises";
import {
  ensureMetierDir,
  getProfilePath,
  saveApiKey,
  saveConfig,
  profileExists,
} from "../util/config.js";
import { success, info } from "../util/display.js";

export async function initCommand(): Promise<void> {
  const rl = createInterface({ input: stdin, output: stdout });

  info("Welcome to Metier! Let's set up your profile.\n");

  await ensureMetierDir();

  if (await profileExists()) {
    const overwrite = await rl.question(
      "Profile already exists. Overwrite? (y/N): "
    );
    if (overwrite.toLowerCase() !== "y") {
      info("Keeping existing profile.");
      rl.close();
      return;
    }
  }

  const name = await rl.question("Your full name: ");
  const email = await rl.question("Email: ");
  const phone = await rl.question("Phone (optional): ");
  const linkedin = await rl.question("LinkedIn URL (optional): ");

  const profile = {
    name,
    contact: {
      email,
      phone: phone || undefined,
      linkedin: linkedin || undefined,
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    certifications: [],
  };

  await writeFile(getProfilePath(), JSON.stringify(profile, null, 2));
  success(`Profile saved to ${getProfilePath()}`);
  info("Edit this file to add your experience, skills, and certifications.\n");

  const setupAi = await rl.question("Set up AI provider? (Y/n): ");
  if (setupAi.toLowerCase() !== "n") {
    const provider = await rl.question("Provider (claude/openai) [claude]: ");
    const providerName = provider === "openai" ? "openai" : "claude";
    const apiKey = await rl.question(`${providerName} API key: `);

    if (apiKey) {
      await saveApiKey(providerName, apiKey);
      await saveConfig({ ai_provider: providerName as "claude" | "openai" });
      success("API key saved.");
    } else {
      info("Skipping AI setup. You can add it later in ~/.metier/.env");
    }
  }

  console.log(
    "\nSetup complete!\n" +
      "Next steps:\n" +
      "  1. Edit ~/.metier/profile.json with your full resume\n" +
      "  2. Run: metier score <job-description.txt>\n" +
      "  3. Run: metier tailor <job-description.txt>\n"
  );

  rl.close();
}
