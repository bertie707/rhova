"use client";

import { useRef, useState } from "react";
import { COST_TIERS, SKILL_LABELS } from "@/lib/types";
import type { ClubSubmissionInput } from "@/lib/types";

const emptyForm: ClubSubmissionInput = {
  name: "",
  category: "",
  city: "",
  country: "",
  description: "",
  skillLevel: 1,
  housingHelp: false,
  jobHelp: false,
  ageRangeMin: 18,
  ageRangeMax: 25,
  costTier: "Moderate",
  costDetail: "",
  carNeeded: false,
  carNote: "",
  socialScene: "",
  typicalWeek: "",
  placementLength: "",
  intakeTiming: "",
  languageNeeded: "",
  visaNote: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  website: "",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-2xl border border-mist-deep bg-white p-5">
      <h2 className="mb-4 font-serif text-base font-bold">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function FieldWrap({ full, children }: { full?: boolean; children: React.ReactNode }) {
  return <div className={full ? "sm:col-span-2" : ""}>{children}</div>;
}

const inputClass =
  "w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-sm outline-none focus:border-teal";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-soft";

export default function ListYourClubForm() {
  const [form, setForm] = useState<ClubSubmissionInput>(emptyForm);
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ClubSubmissionInput>(key: K, value: ClubSubmissionInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    let res: Response;
    try {
      res = await fetch("/api/clubs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      setSubmitting(false);
      setError("Couldn't reach the server. Check your connection and try again.");
      return;
    }

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setSubmitting(false);
      setError(body.error || "Something went wrong");
      return;
    }

    // Honeypot trips return a fake-success id of "ok" with no real club —
    // there's nothing to upload photos to, so skip straight to the thank-you.
    if (body.id && body.id !== "ok" && photos.length > 0) {
      for (const file of photos) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("clubId", body.id);
        try {
          await fetch("/api/clubs/submit-photo", { method: "POST", body: formData });
        } catch {
          // Photo upload failing shouldn't block the submission from
          // completing — the admin can still follow up for photos.
        }
      }
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-mist-deep bg-white p-8 text-center">
        <h2 className="mb-2 font-serif text-xl font-bold text-teal">Thanks!</h2>
        <p className="text-sm text-ink-soft">We&apos;ll be in touch once we&apos;ve had a look.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Section title="About your club">
        <FieldWrap>
          <label className={labelClass}>Club name</label>
          <input required maxLength={200} className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Sport / category</label>
          <input
            required
            maxLength={60}
            placeholder="rugby"
            className={inputClass}
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>City</label>
          <input required maxLength={200} className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Country</label>
          <input required maxLength={200} className={inputClass} value={form.country} onChange={(e) => set("country", e.target.value)} />
        </FieldWrap>
        <FieldWrap full>
          <label className={labelClass}>Tell us about the club</label>
          <textarea
            required
            rows={3}
            maxLength={4000}
            placeholder="Who you are, what makes a gap-year visitor's time with you special..."
            className={inputClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </FieldWrap>
      </Section>

      <Section title="Skill & support">
        <FieldWrap full>
          <label className={labelClass}>Skill level required: {SKILL_LABELS[form.skillLevel]}</label>
          <input
            type="range"
            min={1}
            max={5}
            value={form.skillLevel}
            onChange={(e) => set("skillLevel", Number(e.target.value))}
            className="w-full accent-teal"
          />
        </FieldWrap>
        <FieldWrap>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal"
              checked={form.housingHelp}
              onChange={(e) => set("housingHelp", e.target.checked)}
            />
            We help with housing
          </label>
        </FieldWrap>
        <FieldWrap>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal"
              checked={form.jobHelp}
              onChange={(e) => set("jobHelp", e.target.checked)}
            />
            We help with a job
          </label>
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Typical age (min)</label>
          <input
            required
            type="number"
            min={0}
            max={120}
            className={inputClass}
            value={form.ageRangeMin}
            onChange={(e) => set("ageRangeMin", Number(e.target.value))}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Typical age (max)</label>
          <input
            required
            type="number"
            min={0}
            max={120}
            className={inputClass}
            value={form.ageRangeMax}
            onChange={(e) => set("ageRangeMax", Number(e.target.value))}
          />
        </FieldWrap>
      </Section>

      <Section title="Cost & logistics">
        <FieldWrap>
          <label className={labelClass}>Cost of living tier</label>
          <select className={inputClass} value={form.costTier} onChange={(e) => set("costTier", e.target.value)}>
            {COST_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Cost detail</label>
          <input
            required
            maxLength={500}
            placeholder="~NZ$220-280/week for food & incidentals"
            className={inputClass}
            value={form.costDetail}
            onChange={(e) => set("costDetail", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal"
              checked={form.carNeeded}
              onChange={(e) => set("carNeeded", e.target.checked)}
            />
            Car needed
          </label>
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Car note</label>
          <input
            required
            maxLength={500}
            placeholder="Walkable, buses cover the rest"
            className={inputClass}
            value={form.carNote}
            onChange={(e) => set("carNote", e.target.value)}
          />
        </FieldWrap>
      </Section>

      <Section title="Life & culture">
        <FieldWrap full>
          <label className={labelClass}>Social scene</label>
          <textarea
            required
            rows={2}
            maxLength={2000}
            className={inputClass}
            value={form.socialScene}
            onChange={(e) => set("socialScene", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap full>
          <label className={labelClass}>A typical week</label>
          <textarea
            required
            rows={2}
            maxLength={2000}
            className={inputClass}
            value={form.typicalWeek}
            onChange={(e) => set("typicalWeek", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Placement length</label>
          <input
            required
            maxLength={300}
            placeholder="One season (Apr-Sep)"
            className={inputClass}
            value={form.placementLength}
            onChange={(e) => set("placementLength", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Intake timing</label>
          <input
            required
            maxLength={300}
            placeholder="Rolling"
            className={inputClass}
            value={form.intakeTiming}
            onChange={(e) => set("intakeTiming", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Language needed</label>
          <input
            required
            maxLength={300}
            className={inputClass}
            value={form.languageNeeded}
            onChange={(e) => set("languageNeeded", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Visa note</label>
          <input
            required
            maxLength={2000}
            className={inputClass}
            value={form.visaNote}
            onChange={(e) => set("visaNote", e.target.value)}
          />
        </FieldWrap>
      </Section>

      <Section title="Contact">
        <FieldWrap>
          <label className={labelClass}>Contact name</label>
          <input
            required
            maxLength={200}
            className={inputClass}
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Contact phone</label>
          <input
            required
            maxLength={200}
            className={inputClass}
            value={form.contactPhone}
            onChange={(e) => set("contactPhone", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap full>
          <label className={labelClass}>Contact email</label>
          <input
            required
            type="email"
            maxLength={320}
            className={inputClass}
            value={form.contactEmail}
            onChange={(e) => set("contactEmail", e.target.value)}
          />
        </FieldWrap>
      </Section>

      <section className="mb-8 rounded-2xl border border-mist-deep bg-white p-5">
        <h2 className="mb-2 font-serif text-base font-bold">Photos</h2>
        <p className="mb-3 text-xs text-ink-soft">
          A few photos of the club, the setup, or the town help a lot — optional, but it makes a big
          difference.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
          className="block text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-teal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-teal/90"
        />
        {photos.length > 0 && (
          <p className="mt-2 text-xs text-ink-soft">{photos.length} photo(s) selected</p>
        )}
      </section>

      {/* Honeypot — visually hidden from real visitors, left for bots that
          fill in every field they can find. Any value here silently drops
          the submission server-side. */}
      <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      {error && <p className="mb-4 text-sm text-coral-deep">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit your club"}
      </button>
    </form>
  );
}
