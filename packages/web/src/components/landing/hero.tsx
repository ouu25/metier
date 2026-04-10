import Link from "next/link";
import { FileText, BarChart3, BriefcaseBusiness, MessageSquare } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Resume Tailoring",
    description: "Keyword-optimized resumes matched to each job description.",
  },
  {
    icon: BarChart3,
    title: "ATS Scoring",
    description: "0-100 match score with dimension breakdown and suggestions.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Industry Packs",
    description: "Pre-built intelligence for 10 industries with keywords and scoring.",
  },
  {
    icon: MessageSquare,
    title: "Interview Prep",
    description: "AI mock interviews with scoring, feedback, and follow-up questions.",
  },
];

const packs = [
  { name: "Finance", desc: "Audit, compliance, risk, FP&A" },
  { name: "Sales", desc: "BD, account mgmt, revenue" },
  { name: "Engineering", desc: "Software, DevOps, design" },
  { name: "Marketing", desc: "Growth, SEO, campaigns" },
  { name: "HR", desc: "Talent, L&D, compensation" },
  { name: "Design", desc: "UX/UI, brand, creative" },
  { name: "Legal", desc: "Contract, regulatory, IP" },
  { name: "Healthcare", desc: "Clinical, pharma, health IT" },
  { name: "Operations", desc: "Supply chain, logistics, lean" },
  { name: "Data", desc: "Analytics, ML, data engineering" },
];

export function Hero() {
  return (
    <>
      <section className="flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 text-center sm:text-6xl">
          Metier
        </h1>
        <p className="mt-3 text-xl text-gray-500">
          Your craft. Your career. Your toolkit.
        </p>
        <p className="mt-6 max-w-xl text-center text-gray-600 leading-relaxed">
          AI-powered career toolkit with industry-specific intelligence.
          Tailor resumes, score job matches, and prepare for interviews
          across every industry.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition text-center"
          >
            Get Started Free
          </Link>
          <a
            href="https://github.com/ouu25/metier"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition text-center"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">10 Industry Packs</h2>
        <p className="mt-2 text-gray-500">
          Pre-built keyword libraries, scoring dimensions, and interview questions.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {packs.map((pack) => (
            <div
              key={pack.name}
              className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">{pack.name}</h3>
              <p className="mt-0.5 text-xs text-gray-500">{pack.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
