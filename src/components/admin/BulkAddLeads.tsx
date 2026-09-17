"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BulkAddLeads() {
  const router = useRouter();
  const [category, setCategory] = useState("rugby");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, category }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error || "Something went wrong");
        return;
      }
      setResult(
        `Added ${body.added} club${body.added === 1 ? "" : "s"}` +
          (body.skippedDuplicates > 0 ? ` (skipped ${body.skippedDuplicates} already in the list)` : "")
      );
      setText("");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-mist-deep p-5">
      <h2 className="mb-2 font-serif text-base font-bold">Paste a batch of clubs</h2>
      <p className="mb-3 text-xs text-ink-soft">
        One club per line: name, city, country, email, website (website optional). Separate fields
        with commas or paste straight from a spreadsheet (tabs work too).
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 flex items-center gap-2">
          <label className="text-xs font-semibold text-ink-soft">Category</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            maxLength={60}
            className="rounded-lg border border-mist-deep px-2.5 py-1 text-sm outline-none focus:border-teal"
          />
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"Heriot's Rugby Club, Edinburgh, Scotland, secretary@heriots-rugby.example, heriots-rugby.example\nGlasgow Hawks RFC, Glasgow, Scotland, info@glasgowhawks.example"}
          className="mb-3 w-full rounded-xl border border-mist-deep px-3.5 py-2.5 font-mono text-xs outline-none focus:border-teal"
        />
        {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
        {result && <p className="mb-3 text-sm text-teal">{result}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add to list"}
        </button>
      </form>
    </section>
  );
}
