import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import type { Resume } from "../types.js";

const TEMPLATES_DIR = resolve(
  fileURLToPath(import.meta.url),
  "../../../../../templates"
);

type TemplateStyle = "conservative" | "modern" | "executive";

const STYLE_TO_TEMPLATE: Record<TemplateStyle, string> = {
  conservative: "classic.html",
  modern: "modern.html",
  executive: "executive.html",
};

export async function generatePDF(
  resume: Resume,
  style: TemplateStyle,
  outputPath: string
): Promise<string> {
  const templateFile = STYLE_TO_TEMPLATE[style];
  const templatePath = resolve(TEMPLATES_DIR, templateFile);
  let html = await readFile(templatePath, "utf-8");

  html = renderTemplate(html, resume);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
  });
  await browser.close();

  return outputPath;
}

function renderTemplate(html: string, resume: Resume): string {
  const contactParts: string[] = [];
  if (resume.contact.email) contactParts.push(resume.contact.email);
  if (resume.contact.phone) contactParts.push(resume.contact.phone);
  if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
  if (resume.contact.location) contactParts.push(resume.contact.location);
  const contactLine = contactParts.join(" | ");

  html = html.replace(/\{\{name\}\}/g, escapeHtml(resume.name));
  html = html.replace(/\{\{contact_line\}\}/g, escapeHtml(contactLine));
  html = html.replace(/\{\{summary\}\}/g, escapeHtml(resume.summary));

  html = renderConditional(html, "summary", !!resume.summary);
  html = renderConditional(html, "certifications.length", resume.certifications.length > 0);

  html = renderEachBlock(html, "experience", resume.experience, (exp) => {
    return {
      "this.title": exp.title,
      "this.company": exp.company,
      "this.dates": exp.dates,
    };
  }, (exp) => exp.bullets);

  html = renderEachBlock(html, "education", resume.education, (edu) => {
    return {
      "this.degree": edu.degree,
      "this.institution": edu.institution,
      "this.dates": edu.dates,
    };
  });

  html = renderSimpleEach(html, "skills", resume.skills);
  html = renderSimpleEach(html, "certifications", resume.certifications);

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderConditional(html: string, name: string, condition: boolean): string {
  const regex = new RegExp(
    `\\{\\{#if ${escapeRegex(name)}\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`,
    "g"
  );
  return html.replace(regex, condition ? "$1" : "");
}

function renderEachBlock<T>(
  html: string,
  name: string,
  items: T[],
  fieldMapper: (item: T) => Record<string, string>,
  bulletGetter?: (item: T) => string[]
): string {
  const regex = new RegExp(
    `\\{\\{#each ${escapeRegex(name)}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`,
    "g"
  );

  return html.replace(regex, (_, template: string) => {
    return items
      .map((item) => {
        let result = template;
        const fields = fieldMapper(item);
        for (const [key, value] of Object.entries(fields)) {
          result = result.replace(
            new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, "g"),
            escapeHtml(value)
          );
        }
        if (bulletGetter) {
          const bullets = bulletGetter(item);
          result = renderSimpleEach(result, "this.bullets", bullets);
        }
        return result;
      })
      .join("\n");
  });
}

function renderSimpleEach(html: string, name: string, items: string[]): string {
  const regex = new RegExp(
    `\\{\\{#each ${escapeRegex(name)}\\}\\}([\\s\\S]*?)\\{\\{/each\\}\\}`,
    "g"
  );
  return html.replace(regex, (_, template: string) => {
    return items
      .map((item) => template.replace(/\{\{this\}\}/g, escapeHtml(item)))
      .join("\n");
  });
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
