"use client";

import { useState } from "react";
import {
  GUIDE_SECTIONS,
  parseDestinationGuide,
  serializeDestinationGuide,
  type DestinationGuide,
} from "@/lib/destinationGuide";

interface ClubContext {
  name: string;
  city: string;
  country: string;
  category: string;
  description: string;
}

interface DestinationGuideEditorProps {
  value: string;
  onChange: (value: string) => void;
  clubContext: ClubContext;
}

const inputClass =
  "w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-sm outline-none focus:border-teal";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-soft";

export default function DestinationGuideEditor({ value, onChange, clubContext }: DestinationGuideEditorProps) {
  const guide = parseDestinationGuide(value);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = clubContext.city.trim() !== "" && clubContext.country.trim() !== "";

  function update(next: DestinationGuide) {
    onChange(serializeDestinationGuide(next));
  }

  function setSection(key: string, text: string) {
    update({ ...guide, sections: { ...guide.sections, [key]: text } });
  }

  function setFaqItem(index: number, field: "question" | "answer", text: string) {
    const faq = guide.faq.map((item, i) => (i === index ? { ...item, [field]: text } : item));
    update({ ...guide, faq });
  }

  function addFaqItem() {
    update({ ...guide, faq: [...guide.faq, { question: "", answer: "" }] });
  }

  function removeFaqItem(index: number) {
    update({ ...guide, faq: guide.faq.filter((_, i) => i !== index) });
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/destination-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clubContext),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Something went wrong");
        return;
      }
      const raw = body.guide as Record<string, unknown>;
      const sections: DestinationGuide["sections"] = {};
      for (const { key } of GUIDE_SECTIONS) {
        const val = raw[key];
        if (typeof val === "string" && val.trim()) sections[key] = val;
      }
      const faq: DestinationGuide["faq"] = Array.isArray(raw.faq)
        ? raw.faq
            .filter(
              (item): item is { question: string; answer: string } =>
                typeof item === "object" &&
                item !== null &&
                typeof (item as Record<string, unknown>).question === "string" &&
                typeof (item as Record<string, unknown>).answer === "string"
            )
            .map((item) => ({ question: item.question, answer: item.answer }))
        : [];
      update({ sections, faq });
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-mist-deep p-5">
      <h2 className="mb-2 font-serif text-base font-bold">Destination guide</h2>
      <p className="mb-3 text-xs text-ink-soft">
        Claude researches the area with web search and drafts the guide travellers see when they tap
        &quot;more detail&quot; on the public listing. Review and edit everything below before saving —
        nothing here goes live until you do.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={generating || !canGenerate}
        title={canGenerate ? undefined : "Fill in city and country first"}
        className="mb-4 rounded-full border border-teal px-5 py-2.5 text-sm font-semibold text-teal hover:bg-teal hover:text-white disabled:opacity-60"
      >
        {generating ? "Researching…" : "Generate destination guide"}
      </button>
      {error && <p className="mb-4 text-sm text-coral-deep">{error}</p>}

      <div className="grid grid-cols-1 gap-4">
        {GUIDE_SECTIONS.map(({ key, heading }) => (
          <div key={key}>
            <label className={labelClass}>{heading}</label>
            <textarea
              rows={3}
              maxLength={3000}
              placeholder="Not generated yet — click Generate above, or write it yourself."
              className={inputClass}
              value={guide.sections[key] ?? ""}
              onChange={(e) => setSection(key, e.target.value)}
            />
          </div>
        ))}

        <div>
          <label className={labelClass}>Quick answers (FAQ)</label>
          <div className="flex flex-col gap-3">
            {guide.faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-mist-deep p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    placeholder="Question"
                    maxLength={200}
                    className={inputClass}
                    value={item.question}
                    onChange={(e) => setFaqItem(i, "question", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeFaqItem(i)}
                    aria-label="Remove question"
                    className="shrink-0 rounded-full px-2.5 py-1 text-sm text-coral-deep hover:bg-mist"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="Answer"
                  maxLength={1000}
                  className={inputClass}
                  value={item.answer}
                  onChange={(e) => setFaqItem(i, "answer", e.target.value)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addFaqItem}
              className="rounded-full bg-mist px-4 py-2 text-xs font-semibold hover:bg-mist-deep"
            >
              + Add a question
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
