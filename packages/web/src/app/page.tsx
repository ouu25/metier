import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Metier
        </h1>
        <p className="mt-2 text-lg text-gray-500">
          Your craft. Your career. Your toolkit.
        </p>
        <p className="mt-6 text-gray-600 leading-relaxed">
          AI-powered career toolkit with industry-specific intelligence.
          Tailor resumes, score job matches, and prepare for interviews
          across Finance, Sales, Engineering, and more.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
