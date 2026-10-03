"use client";

import { useState } from "react";

type Mode = "login" | "signup" | "forgot" | "reset";

interface AuthFormProps {
  initialMode: "login" | "signup";
  onLoggedIn: (email: string) => void;
}

const inputClass =
  "mb-3 w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-sm outline-none focus:border-teal";
const submitClass =
  "w-full rounded-xl bg-coral py-2.5 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-60";
const linkClass = "text-xs font-medium text-teal hover:underline";

function PasswordField({
  value,
  onChange,
  placeholder,
  minLength,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mb-3">
      <input
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputClass} mb-0 pr-16`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-soft hover:text-teal"
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default function AuthForm({ initialMode, onLoggedIn }: AuthFormProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { ok, data } = await post("/api/auth/login", { email, password });
      if (!ok) {
        setError(data.error || "Incorrect email or password");
        return;
      }
      onLoggedIn(email);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { ok, data } = await post("/api/auth/signup", { email, password });
      if (!ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      onLoggedIn(email);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { ok, data } = await post("/api/auth/request-password-reset", { email });
      if (!ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setMessage(`If an account exists for ${email}, a reset code has been sent.`);
      setMode("reset");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError("Passwords don't match");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { ok, data } = await post("/api/auth/reset-password", { email, code, password: newPassword });
      if (!ok) {
        setError(data.error || "Incorrect or expired code");
        return;
      }
      onLoggedIn(email);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  if (mode === "login") {
    return (
      <form onSubmit={handleLogin}>
        <input
          type="email"
          required
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        <PasswordField value={password} onChange={setPassword} placeholder="Password" autoComplete="current-password" />
        {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
        <button type="submit" disabled={submitting} className={submitClass}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
        <div className="mt-3 flex items-center justify-between">
          <button type="button" onClick={() => switchMode("signup")} className={linkClass}>
            Need an account? Sign up
          </button>
          <button type="button" onClick={() => switchMode("forgot")} className={linkClass}>
            Forgot password?
          </button>
        </div>
      </form>
    );
  }

  if (mode === "signup") {
    return (
      <form onSubmit={handleSignup}>
        <input
          type="email"
          required
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        <PasswordField
          value={password}
          onChange={setPassword}
          placeholder="Create a password (min. 8 characters)"
          minLength={8}
          autoComplete="new-password"
        />
        <PasswordField
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirm password"
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
        <button type="submit" disabled={submitting} className={submitClass}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
        <div className="mt-3">
          <button type="button" onClick={() => switchMode("login")} className={linkClass}>
            Already have an account? Log in
          </button>
        </div>
      </form>
    );
  }

  if (mode === "forgot") {
    return (
      <form onSubmit={handleRequestReset}>
        <p className="mb-3 text-sm text-ink-soft">
          Enter your email and we&apos;ll send you a code to reset your password.
        </p>
        <input
          type="email"
          required
          maxLength={320}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
        {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
        <button type="submit" disabled={submitting} className={submitClass}>
          {submitting ? "Sending…" : "Send reset code"}
        </button>
        <div className="mt-3">
          <button type="button" onClick={() => switchMode("login")} className={linkClass}>
            Back to log in
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleConfirmReset}>
      {message && <p className="mb-3 text-sm text-teal">{message}</p>}
      <input
        type="text"
        inputMode="numeric"
        required
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="123456"
        className={`${inputClass} text-center text-lg tracking-[0.3em]`}
      />
      <PasswordField
        value={newPassword}
        onChange={setNewPassword}
        placeholder="New password (min. 8 characters)"
        minLength={8}
        autoComplete="new-password"
      />
      <PasswordField
        value={confirmNewPassword}
        onChange={setConfirmNewPassword}
        placeholder="Confirm new password"
        minLength={8}
        autoComplete="new-password"
      />
      {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
      <button type="submit" disabled={submitting} className={submitClass}>
        {submitting ? "Resetting…" : "Reset password & log in"}
      </button>
      <div className="mt-3">
        <button type="button" onClick={() => switchMode("login")} className={linkClass}>
          Back to log in
        </button>
      </div>
    </form>
  );
}
