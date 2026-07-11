"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 px-5 py-2 font-bold uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 hover:bg-white hover:text-primary disabled:opacity-70"
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
