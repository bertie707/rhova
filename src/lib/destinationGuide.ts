// Shared shape for the AI-researched destination guide stored (as JSON) in
// Club.destinationGuide. GUIDE_SECTIONS is the single source of truth for
// section keys/headings — used by the admin editor, the generation tool
// schema, and the public panel so all three stay in sync.

export const GUIDE_SECTIONS = [
  { key: "whereYouAre", heading: "Where you are" },
  { key: "settlingIn", heading: "Settling in for the placement" },
  { key: "clubScene", heading: "The club scene here" },
  { key: "meetingPeople", heading: "Meeting people" },
  { key: "eatingWell", heading: "Eating well (and cheap)" },
  { key: "thingsToDo", heading: "Things to do nearby" },
  { key: "exploringFurther", heading: "Exploring further afield" },
  { key: "money", heading: "Money" },
  { key: "weatherAndNature", heading: "Weather & nature" },
  { key: "stayingSafe", heading: "Staying safe" },
] as const;

export type GuideSectionKey = (typeof GUIDE_SECTIONS)[number]["key"];

export interface GuideFaqItem {
  question: string;
  answer: string;
}

export interface DestinationGuide {
  sections: Partial<Record<GuideSectionKey, string>>;
  faq: GuideFaqItem[];
}

export const EMPTY_GUIDE: DestinationGuide = { sections: {}, faq: [] };

const SECTION_KEYS = new Set<string>(GUIDE_SECTIONS.map((s) => s.key));

// Lossless parse — keeps whatever is stored, including in-progress empty
// strings, so the admin editor round-trips exactly what's being typed.
// Used directly by the editor; callers that need a clean public-facing
// result (saving, public rendering) should also run cleanDestinationGuide.
export function parseDestinationGuide(raw: string): DestinationGuide {
  if (!raw) return { sections: {}, faq: [] };
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return { sections: {}, faq: [] };
    const input = parsed as Record<string, unknown>;

    const sections: Partial<Record<GuideSectionKey, string>> = {};
    if (typeof input.sections === "object" && input.sections !== null) {
      for (const [key, value] of Object.entries(input.sections as Record<string, unknown>)) {
        if (SECTION_KEYS.has(key) && typeof value === "string") {
          sections[key as GuideSectionKey] = value;
        }
      }
    }

    const faq: GuideFaqItem[] = [];
    if (Array.isArray(input.faq)) {
      for (const item of input.faq) {
        if (
          typeof item === "object" &&
          item !== null &&
          typeof (item as Record<string, unknown>).question === "string" &&
          typeof (item as Record<string, unknown>).answer === "string"
        ) {
          faq.push({
            question: (item as Record<string, unknown>).question as string,
            answer: (item as Record<string, unknown>).answer as string,
          });
        }
      }
    }

    return { sections, faq };
  } catch {
    return { sections: {}, faq: [] };
  }
}

// Lossless stringify — mirrors parseDestinationGuide, keeps in-progress
// empty entries so the editor's onChange doesn't erase what's being typed.
export function serializeDestinationGuide(guide: DestinationGuide): string {
  if (Object.keys(guide.sections).length === 0 && guide.faq.length === 0) return "";
  return JSON.stringify(guide);
}

// Drops empty sections and incomplete FAQ rows — apply this before saving
// to the database or rendering the public panel, never in the live editor.
export function cleanDestinationGuide(guide: DestinationGuide): DestinationGuide {
  const sections: Partial<Record<GuideSectionKey, string>> = {};
  for (const { key } of GUIDE_SECTIONS) {
    const value = guide.sections[key];
    if (value && value.trim()) sections[key] = value;
  }
  const faq = guide.faq.filter((item) => item.question.trim() && item.answer.trim());
  return { sections, faq };
}
