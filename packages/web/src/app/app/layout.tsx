import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { NavUser } from "@/components/layout/nav-user";

export const dynamic = "force-dynamic";

// Server actions under /app (tailor, interview) call the LLM and routinely
// take 30-60s. Default Vercel function cap (10s on free, 15s on Hobby)
// kills them mid-call and the UI hangs indefinitely. 60s is Hobby's
// ceiling; bump to 300 if/when on Pro.
export const maxDuration = 60;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex md:flex-col">
        <Sidebar />
        <NavUser email={user.email ?? ""} />
      </div>
      {/* Mobile: sidebar renders its own fixed overlay */}
      <div className="md:hidden">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pt-14 md:p-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
