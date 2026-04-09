import Link from "next/link";
import { FileText, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-500">Welcome to Metier. Get started below.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/app/tailor"
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition"
        >
          <FileText className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-gray-900">Tailor Resume</h2>
            <p className="mt-1 text-sm text-gray-500">
              Upload your resume and a job description to get an ATS score and tailored PDF.
            </p>
          </div>
        </Link>
        <Link
          href="/app/settings"
          className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition"
        >
          <Settings className="h-6 w-6 text-blue-600 mt-0.5" />
          <div>
            <h2 className="font-semibold text-gray-900">Settings</h2>
            <p className="mt-1 text-sm text-gray-500">
              Configure your AI provider and API key for resume rewriting.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
