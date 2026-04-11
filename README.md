# Metier

> Your craft. Your career. Your toolkit.

AI-powered career toolkit that helps job seekers across **every industry** tailor resumes, score job matches, and prepare for interviews.

Unlike generic tools, Metier provides **industry-specific intelligence** through vertical packs — pre-built keyword libraries, scoring dimensions, and interview questions for 10 industries.

**Live:** [metier-if7awux77-hakus-projects-93e6783b.vercel.app](https://metier-if7awux77-hakus-projects-93e6783b.vercel.app)

## Features

- **Resume Tailoring** — Keyword-optimized resumes matched to each JD
- **ATS Scoring** — 0-100 match score with dimension breakdown
- **AI Rewrite** — Light or deep AI-powered resume optimization (bring your own API key)
- **Semantic Scoring** — AI-driven meaning-level match analysis beyond keywords
- **Interview Prep** — AI mock interviews with scoring, feedback, and follow-up questions
- **10 Industry Packs** — Pre-built intelligence with keywords, scoring, and interview questions
- **PDF Generation** — Professional templates (Classic, Modern, Executive)
- **Web App + CLI** — Use in the browser or terminal

## Industry Packs

| Pack | Coverage |
|------|----------|
| Finance | Audit, compliance, risk, FP&A |
| Sales | BD, account management, revenue |
| Engineering | Software, DevOps, system design |
| Marketing | Growth, SEO, campaigns |
| HR | Talent, L&D, compensation |
| Design | UX/UI, brand, creative |
| Legal | Contract, regulatory, IP |
| Healthcare | Clinical, pharma, health IT |
| Operations | Supply chain, logistics, lean |
| Data | Analytics, ML, data engineering |

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
  [Optional] AI Resume Rewrite (light/deep)
        ↓
  [Optional] Semantic Score
        ↓
  PDF Generation
        ↓
  Interview Prep with AI Feedback
```

## Web App

The web app at `/app` provides:

- **Dashboard** — Quick access to all features
- **Tailor Resume** — Upload resume, paste JD, get ATS score with tabbed results (Score/Diff/Keywords)
- **Interview Prep** — Browse questions by type (Technical/Behavioral/Case), practice with AI evaluation
- **Settings** — Configure AI provider and API key

Responsive design works on desktop and mobile.

## CLI

```bash
# Install
npm install -g @metier/cli

# Set up your profile
metier init

# Score a job match
metier score job-description.txt

# Tailor with AI rewrite
metier tailor job-description.txt --rewrite light
metier tailor job-description.txt --rewrite deep --semantic

# List industry packs
metier pack list

# Practice interview questions
metier interview finance
```

## AI Providers

Metier supports bring-your-own-key for:
- **Claude** (Anthropic)
- **OpenAI** (GPT-4o)

Configure during `metier init` or in the web app Settings page.

## Project Structure

```
packages/
  core/     # Shared engine: scoring, AI providers, pack loader, types
  web/      # Next.js web app with Supabase auth
  cli/      # Terminal interface
industry-packs/
  *.yaml    # 10 industry pack definitions
```

## Development

```bash
npm install          # Install dependencies
npx turbo build      # Build all packages
npx turbo test       # Run tests
```

## License

MIT
