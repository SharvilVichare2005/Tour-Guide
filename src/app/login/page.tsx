"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createSupabaseClient();
      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        router.push("/home");
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: email.split("@")[0] } },
        });
        if (authError) throw authError;

        if (data.user) {
          await supabase.from("profiles").insert([
            {
              id: data.user.id,
              username: email.split("@")[0],
              full_name: "",
              avatar_url: "",
            },
          ]);
        }

        setInfo("Account created! Please check your email for verification.");
        setMode("signin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-cardLg">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light/20">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-[#333]">
            {mode === "signin" ? "Welcome to LocalGuide" : "Create an Account"}
          </h1>
          <p className="mt-1 text-sm text-[#666]">
            {mode === "signin"
              ? "Enter your credentials to access your account"
              : "Sign up to start exploring places around you"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{info}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#333]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-[#333]">
                Password
              </label>
              <button type="button" className="text-xs text-primary-dark hover:underline">
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-black/15 px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
            {loading
              ? mode === "signin" ? "Signing in…" : "Signing up…"
              : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs uppercase text-[#999]">
          <span className="h-px flex-1 bg-black/10" />
          Or continue with
          <span className="h-px flex-1 bg-black/10" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {["Google", "Apple", "Facebook"].map((provider) => (
            <button
              key={provider}
              type="button"
              className="rounded-lg border border-black/15 bg-primary-dark py-2 text-xs font-medium text-white transition hover:bg-black"
            >
              {provider}
            </button>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-[#333]">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="font-semibold text-primary-dark hover:underline"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
