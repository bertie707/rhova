"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COST_TIERS, SKILL_LABELS } from "@/lib/types";
import type { ClubInput, ClubWithMedia } from "@/lib/types";
import DestinationGuideEditor from "./DestinationGuideEditor";

interface ClubFormProps {
  mode: "create" | "edit";
  clubId?: string;
  initial?: ClubWithMedia;
}

const emptyForm: ClubInput = {
  name: "",
  category: "",
  city: "",
  country: "",
  latitude: 0,
  longitude: 0,
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
  nearby: "",
  safetyNotes: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  lastContactedAt: null,
  verified: false,
  destinationGuide: "",
  published: false,
};

function toFormState(club?: ClubWithMedia): ClubInput {
  if (!club) return emptyForm;
  return {
    name: club.name,
    category: club.category,
    city: club.city,
    country: club.country,
    latitude: club.latitude,
    longitude: club.longitude,
    description: club.description,
    skillLevel: club.skillLevel,
    housingHelp: club.housingHelp,
    jobHelp: club.jobHelp,
    ageRangeMin: club.ageRangeMin,
    ageRangeMax: club.ageRangeMax,
    costTier: club.costTier,
    costDetail: club.costDetail,
    carNeeded: club.carNeeded,
    carNote: club.carNote,
    socialScene: club.socialScene,
    typicalWeek: club.typicalWeek,
    placementLength: club.placementLength,
    intakeTiming: club.intakeTiming,
    languageNeeded: club.languageNeeded,
    visaNote: club.visaNote,
    nearby: club.nearby,
    safetyNotes: club.safetyNotes,
    contactName: club.contactName,
    contactPhone: club.contactPhone,
    contactEmail: club.contactEmail,
    lastContactedAt: club.lastContactedAt
      ? new Date(club.lastContactedAt).toISOString().slice(0, 10)
      : null,
    verified: club.verified,
    destinationGuide: club.destinationGuide,
    published: club.published,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 rounded-2xl border border-mist-deep p-5">
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

// Fields extraction can fill in — everything except location (latitude/
// longitude) and the two admin-only flags (verified/isSampleData), which
// need a human to actually confirm rather than an LLM's best guess.
const EXTRACTABLE_STRING_FIELDS: (keyof ClubInput)[] = [
  "name",
  "category",
  "city",
  "country",
  "description",
  "costTier",
  "costDetail",
  "carNote",
  "socialScene",
  "typicalWeek",
  "placementLength",
  "intakeTiming",
  "languageNeeded",
  "visaNote",
  "nearby",
  "safetyNotes",
  "contactName",
  "contactPhone",
  "contactEmail",
];
const EXTRACTABLE_BOOLEAN_FIELDS: (keyof ClubInput)[] = ["housingHelp", "jobHelp", "carNeeded"];
const EXTRACTABLE_INT_FIELDS: (keyof ClubInput)[] = ["skillLevel", "ageRangeMin", "ageRangeMax"];

function pickExtractedFields(raw: unknown): Partial<ClubInput> {
  if (typeof raw !== "object" || raw === null) return {};
  const input = raw as Record<string, unknown>;
  const fields: Partial<ClubInput> = {};

  for (const key of EXTRACTABLE_STRING_FIELDS) {
    const value = input[key];
    if (typeof value === "string" && value.trim() !== "") (fields[key] as string) = value;
  }
  for (const key of EXTRACTABLE_BOOLEAN_FIELDS) {
    const value = input[key];
    if (typeof value === "boolean") (fields[key] as boolean) = value;
  }
  for (const key of EXTRACTABLE_INT_FIELDS) {
    const value = input[key];
    if (typeof value === "number" && Number.isInteger(value)) (fields[key] as number) = value;
  }
  if (typeof input.lastContactedAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.lastContactedAt)) {
    fields.lastContactedAt = input.lastContactedAt;
  }

  return fields;
}

function ExtractFromNotes({ onExtracted }: { onExtracted: (fields: Partial<ClubInput>) => void }) {
  const [notes, setNotes] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleExtract() {
    if (!notes.trim()) return;
    setExtracting(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: notes }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Something went wrong");
        return;
      }
      const fields = pickExtractedFields(body.fields);
      const filledCount = Object.keys(fields).length;
      if (filledCount === 0) {
        setError("Couldn't find anything usable in that text");
        return;
      }
      onExtracted(fields);
      setMessage(`Filled ${filledCount} field${filledCount === 1 ? "" : "s"} below — review before saving.`);
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setExtracting(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-mist-deep p-5">
      <h2 className="mb-2 font-serif text-base font-bold">Fill from notes</h2>
      <p className="mb-3 text-xs text-ink-soft">
        Paste an email thread, call notes, or the club&apos;s own website copy — Claude will draft
        as many fields below as it can. Location, verification, and anything it can&apos;t find are
        left for you to fill in by hand.
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        placeholder="Spoke to Dave at Heriot's RFC on Tuesday — they take beginners, no car needed since it's a 10 min walk from the hostel, roughly NZ$250/week for food..."
        className="mb-3 w-full rounded-xl border border-mist-deep px-3.5 py-2.5 text-xs outline-none focus:border-teal"
      />
      {error && <p className="mb-3 text-sm text-coral-deep">{error}</p>}
      {message && <p className="mb-3 text-sm text-teal">{message}</p>}
      <button
        type="button"
        onClick={handleExtract}
        disabled={extracting || !notes.trim()}
        className="rounded-full border border-teal px-5 py-2.5 text-sm font-semibold text-teal hover:bg-teal hover:text-white disabled:opacity-60"
      >
        {extracting ? "Extracting…" : "Extract with Claude"}
      </button>
    </section>
  );
}

export default function ClubForm({ mode, clubId, initial }: ClubFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<ClubInput>(() => toFormState(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ClubInput>(key: K, value: ClubInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function applyExtracted(fields: Partial<ClubInput>) {
    setForm((prev) => ({ ...prev, ...fields }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = mode === "create" ? "/api/admin/clubs" : `/api/admin/clubs/${clubId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {
      setSaving(false);
      setError("Couldn't reach the server. Check your connection and try again.");
      return;
    }

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Something went wrong");
      return;
    }

    const club = await res.json();
    if (mode === "create") {
      router.push(`/admin/clubs/${club.id}/edit`);
    } else {
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <ExtractFromNotes onExtracted={applyExtracted} />

      <Section title="Basics">
        <FieldWrap>
          <label className={labelClass}>Name</label>
          <input required maxLength={200} className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Category / sport</label>
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
        <FieldWrap>
          <label className={labelClass}>Latitude</label>
          <input
            required
            type="number"
            step="any"
            min={-90}
            max={90}
            className={inputClass}
            value={form.latitude}
            onChange={(e) => set("latitude", Number(e.target.value))}
          />
        </FieldWrap>
        <FieldWrap>
          <label className={labelClass}>Longitude</label>
          <input
            required
            type="number"
            step="any"
            min={-180}
            max={180}
            className={inputClass}
            value={form.longitude}
            onChange={(e) => set("longitude", Number(e.target.value))}
          />
        </FieldWrap>
        <FieldWrap full>
          <label className={labelClass}>Description</label>
          <textarea
            required
            rows={3}
            maxLength={4000}
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
            Helps with housing
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
            Helps with a job
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

      <Section title="Practicalities">
        <FieldWrap>
          <label className={labelClass}>Cost of living tier</label>
          <select
            className={inputClass}
            value={form.costTier}
            onChange={(e) => set("costTier", e.target.value)}
          >
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
        <FieldWrap full>
          <label className={labelClass}>Nearby / things to do</label>
          <textarea
            required
            rows={2}
            maxLength={2000}
            className={inputClass}
            value={form.nearby}
            onChange={(e) => set("nearby", e.target.value)}
          />
        </FieldWrap>
        <FieldWrap full>
          <label className={labelClass}>Safety notes</label>
          <textarea
            required
            rows={2}
            maxLength={2000}
            className={inputClass}
            value={form.safetyNotes}
            onChange={(e) => set("safetyNotes", e.target.value)}
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

      <Section title="Verification">
        <FieldWrap>
          <label className={labelClass}>Last contacted</label>
          <input
            type="date"
            className={inputClass}
            value={form.lastContactedAt ?? ""}
            onChange={(e) => set("lastContactedAt", e.target.value || null)}
          />
        </FieldWrap>
        <FieldWrap>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal"
              checked={form.verified}
              onChange={(e) => set("verified", e.target.checked)}
            />
            Verified: I&apos;ve actually spoken to this club
          </label>
        </FieldWrap>
        <FieldWrap full>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-teal"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
            />
            Published: visible on the public map
          </label>
          {!form.published && (
            <p className="mt-1 text-xs text-ink-soft">
              Unchecked — this listing is saved and editable here, but won&apos;t show up on the public
              map until you check this box.
            </p>
          )}
        </FieldWrap>
      </Section>

      <DestinationGuideEditor
        value={form.destinationGuide}
        onChange={(value) => set("destinationGuide", value)}
        clubContext={{
          name: form.name,
          city: form.city,
          country: form.country,
          category: form.category,
          description: form.description,
        }}
      />

      {error && <p className="mb-4 text-sm text-coral-deep">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white hover:bg-coral-deep disabled:opacity-60"
      >
        {saving ? "Saving…" : mode === "create" ? "Create club" : "Save changes"}
      </button>
    </form>
  );
}
