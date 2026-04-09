"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface NavUserProps {
  email: string;
}

export function NavUser({ email }: NavUserProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 border-t border-gray-200 px-5 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
        {email[0].toUpperCase()}
      </div>
      <span className="flex-1 truncate text-sm text-gray-600">{email}</span>
      <button
        onClick={handleSignOut}
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
        title="Sign out"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
