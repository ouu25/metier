import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Sign in to Metier</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your craft. Your career. Your toolkit.
          </p>
        </div>
        <AuthForm mode="login" />
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
