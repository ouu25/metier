import Link from "next/link";
import { FileText, Settings, MessageSquare, BarChart3 } from "lucide-react";

const cards = [
  {
    href: "/app/tailor",
    icon: FileText,
    title: "Tailor Resume",
    description:
      "Upload your resume and a job description to get an ATS score and tailored PDF.",
    color: "text-blue-600 bg-blue-50",
  },
  {
    href: "/app/interview",
    icon: MessageSquare,
    title: "Interview Prep",
    description:
      "Practice with AI-powered mock interviews tailored to your target industry.",
    color: "text-purple-600 bg-purple-50",
  },
  {
    href: "/app/settings",
    icon: Settings,
    title: "Settings",
    description: "Configure your AI provider and API key for AI features.",
    color: "text-gray-600 bg-gray-100",
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-500">Welcome to Metier. Get started below.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {card.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <div className="flex items-start gap-4">
          <BarChart3 className="h-6 w-6 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Quick Start</h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed">
              Upload your resume on the{" "}
              <Link href="/app/tailor" className="text-blue-600 underline">
                Tailor
              </Link>{" "}
              page to get your ATS match score. Then head to{" "}
              <Link href="/app/interview" className="text-blue-600 underline">
                Interview Prep
              </Link>{" "}
              to practice industry-specific questions with AI feedback.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
