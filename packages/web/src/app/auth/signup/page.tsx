import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">
            Start tailoring your resume to every job.
          </p>
        </div>
        <AuthForm mode="signup" />
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
