"use client";

import { useState } from "react";

interface LoginFormProps {
  onLoggedIn: (email: string) => void;
}

export default function LoginForm({ onLoggedIn }: LoginFormProps) {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Something went wrong");
        return;
      }
      setDevCode(body.devCode ?? null);
      setStep("code");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Incorrect or expired code");
        return;
      }
      onLoggedIn(email);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={handleRequestCode}>
        <p className="mb-3 text-sm text-ink-soft">
          Log in with just your email. We&apos;ll send you a one-time code, no password needed.
        </p>
        <input
          type="email"
          required
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mb-3 w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-sm outline-none focus:border-teal"
        />
        {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-coral py-2.5 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode}>
      <p className="mb-1 text-sm text-ink-soft">
        Enter the code sent to <strong className="text-ink">{email}</strong>.
      </p>
      <button
        type="button"
        onClick={() => setStep("email")}
        className="mb-3 text-xs font-medium text-teal hover:underline"
      >
        Use a different email
      </button>
      {devCode && (
        <p className="mb-3 rounded-lg bg-gold/20 px-3 py-2 text-xs text-ink">
          Dev mode: your code is <strong>{devCode}</strong> (shown here until real email sending is set up)
        </p>
      )}
      <input
        type="text"
        inputMode="numeric"
        required
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="123456"
        className="mb-3 w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-teal"
      />
      {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-coral py-2.5 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {submitting ? "Checking…" : "Verify & log in"}
      </button>
    </form>
  );
}
