# Metier

> Your craft. Your career. Your toolkit.

AI-powered career toolkit that helps job seekers across **every industry** tailor resumes, score job matches, and prepare for interviews.

Unlike generic tools, Metier provides **industry-specific intelligence** through vertical packs — pre-built keyword libraries, scoring dimensions, and interview questions for Finance, Sales, Engineering, and more.

## Quick Start

```bash
# Install
npm install -g @metier/cli

# Set up your profile
metier init

# Score a job match
metier score job-description.txt

# Tailor your resume + generate PDF
metier tailor job-description.txt
```

## Features

- **Resume Tailoring** — Keyword-optimized resumes matched to each JD
- **ATS Scoring** — 0-100 match score with dimension breakdown
- **Industry Packs** — Pre-built intelligence for Finance, Sales, Engineering (more coming)
- **AI Rewrite** — Optional AI-powered resume optimization (bring your own API key)
- **PDF Generation** — Professional templates (Classic, Modern, Executive)

## Industry Packs

| Pack | Coverage | Resume Style |
|------|----------|-------------|
| Finance | Audit, compliance, risk, FP&A | Classic (conservative) |
| Sales | BD, account management, revenue | Executive |
| Engineering | Software, DevOps, system design | Modern |

More packs coming: Marketing, HR, Design, Legal, Healthcare, Operations, Data & Analytics.

## How It Works

```
Your Resume + Job Description
        ↓
  Industry Auto-Detection
        ↓
  Keyword Extraction & Matching
        ↓
  ATS Score (0-100) + Suggestions
        ↓
  [Optional] AI Resume Rewrite
        ↓
  PDF Generation
```

## CLI Commands

| Command | Description |
|---------|------------|
| `metier init` | Set up profile and API keys |
| `metier score <jd>` | Score resume-JD match |
| `metier tailor <jd>` | Tailor resume and generate PDF |
| `metier pack list` | List available industry packs |
| `metier pack info <name>` | Show pack details |

## AI Providers

Metier supports bring-your-own-key for:
- **Claude** (Anthropic)
- **OpenAI** (GPT-4o)

Configure during `metier init` or edit `~/.metier/.env`.

## License

MIT
