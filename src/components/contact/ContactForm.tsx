"use client";

import { useState, type FormEvent } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulated submission — wire to Supabase / email service as needed.
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  }

  if (submitted) {
    return (
      <div className="card flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-[#333]">Message Sent!</h3>
        <p className="mb-6 text-[#666]">
          Thank you for reaching out. We&apos;ll get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="rounded-lg bg-primary-dark px-5 py-2 text-sm font-medium text-white transition hover:bg-[#4338ca]"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-[#333]">Send Us a Message</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-[#333]">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="rounded-lg border border-black/40 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#333]">
              Your Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="rounded-lg border border-black/40 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className="text-sm font-medium text-[#333]">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            required
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="rounded-lg border border-black/40 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-sm font-medium text-[#333]">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="resize-y rounded-lg border border-black/40 px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={sending}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary-dark py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:opacity-70"
        >
          <Send className="h-4 w-4" />
          {sending ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
