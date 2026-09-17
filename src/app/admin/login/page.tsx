"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let res: Response;
    try {
      res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
    } catch {
      setSubmitting(false);
      setError("Couldn't reach the server. Check your connection and try again.");
      return;
    }

    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Incorrect password");
      return;
    }
    router.push(searchParams.get("next") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_8px_28px_rgba(20,40,35,0.15)]"
      >
        <div className="mb-1 flex items-center">
          <span className="font-serif text-lg font-bold wordmark-velvet">Rhova</span>
        </div>
        <p className="mb-6 text-sm text-ink-soft">Admin access</p>

        <label className="mb-1.5 block text-xs font-semibold text-ink-soft">Password</label>
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-mist-deep px-3.5 py-2.5 pr-16 text-sm outline-none focus:border-teal"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft hover:text-teal"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-coral-deep">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-coral py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-deep disabled:opacity-60"
        >
          {submitting ? "Checking…" : "Log in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
