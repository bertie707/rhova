import type { ClubInput, ClubSubmissionInput } from "@/lib/types";
import type { Prisma } from "@prisma/client";
import { parseDestinationGuide, serializeDestinationGuide, cleanDestinationGuide } from "@/lib/destinationGuide";

const MAX_DESTINATION_GUIDE_LENGTH = 20000;

const REQUIRED_STRINGS: (keyof ClubInput)[] = [
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

// Short fields default to 200 chars; free-text fields get more room.
const MAX_LENGTHS: Partial<Record<keyof ClubInput, number>> = {
  description: 4000,
  socialScene: 2000,
  typicalWeek: 2000,
  visaNote: 2000,
  nearby: 2000,
  safetyNotes: 2000,
  costDetail: 500,
  carNote: 500,
  placementLength: 300,
  intakeTiming: 300,
  languageNeeded: 300,
  category: 60,
  contactEmail: 320, // RFC 5321 max
};
const DEFAULT_MAX_LENGTH = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toClubData(body: unknown): Prisma.ClubUncheckedCreateInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }
  const input = body as Record<string, unknown>;

  for (const key of REQUIRED_STRINGS) {
    const value = input[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Field "${key}" is required`);
    }
    const maxLength = MAX_LENGTHS[key] ?? DEFAULT_MAX_LENGTH;
    if (value.length > maxLength) {
      throw new Error(`Field "${key}" must be ${maxLength} characters or fewer`);
    }
  }

  if (!EMAIL_PATTERN.test(input.contactEmail as string)) {
    throw new Error("Contact email must be a valid email address");
  }

  const latitude = Number(input.latitude);
  const longitude = Number(input.longitude);
  const skillLevel = Number(input.skillLevel);
  const ageRangeMin = Number(input.ageRangeMin);
  const ageRangeMax = Number(input.ageRangeMax);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw new Error("Latitude must be a number between -90 and 90");
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Longitude must be a number between -180 and 180");
  }
  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 5) {
    throw new Error("Skill level must be an integer between 1 and 5");
  }
  if (
    !Number.isInteger(ageRangeMin) ||
    !Number.isInteger(ageRangeMax) ||
    ageRangeMin < 0 ||
    ageRangeMax < 0 ||
    ageRangeMin > 120 ||
    ageRangeMax > 120
  ) {
    throw new Error("Age range must be whole numbers between 0 and 120");
  }
  if (ageRangeMin > ageRangeMax) {
    throw new Error("Minimum age can't be greater than maximum age");
  }

  const lastContactedAt =
    typeof input.lastContactedAt === "string" && input.lastContactedAt
      ? new Date(input.lastContactedAt)
      : null;

  let destinationGuide = "";
  if (typeof input.destinationGuide === "string" && input.destinationGuide.trim()) {
    if (input.destinationGuide.length > MAX_DESTINATION_GUIDE_LENGTH) {
      throw new Error(`Field "destinationGuide" must be ${MAX_DESTINATION_GUIDE_LENGTH} characters or fewer`);
    }
    // Round-trip through parse+clean so malformed JSON, unknown fields, and
    // incomplete in-progress FAQ rows can never reach the public renderer.
    destinationGuide = serializeDestinationGuide(cleanDestinationGuide(parseDestinationGuide(input.destinationGuide)));
  }

  return {
    name: input.name as string,
    category: (input.category as string).toLowerCase().trim(),
    city: input.city as string,
    country: input.country as string,
    latitude,
    longitude,
    description: input.description as string,
    skillLevel,
    housingHelp: Boolean(input.housingHelp),
    jobHelp: Boolean(input.jobHelp),
    ageRangeMin,
    ageRangeMax,
    costTier: input.costTier as string,
    costDetail: input.costDetail as string,
    carNeeded: Boolean(input.carNeeded),
    carNote: input.carNote as string,
    socialScene: input.socialScene as string,
    typicalWeek: input.typicalWeek as string,
    placementLength: input.placementLength as string,
    intakeTiming: input.intakeTiming as string,
    languageNeeded: input.languageNeeded as string,
    visaNote: input.visaNote as string,
    nearby: input.nearby as string,
    safetyNotes: input.safetyNotes as string,
    contactName: input.contactName as string,
    contactPhone: input.contactPhone as string,
    contactEmail: input.contactEmail as string,
    lastContactedAt,
    verified: Boolean(input.verified),
    destinationGuide,
    published: Boolean(input.published),
  };
}

// Fields a club can fill in on the public /list-your-club form. Excludes
// nearby/safetyNotes (admin-researched) and location (an admin sets exact
// coordinates when verifying) — those get defaults below rather than being
// required, since a club owner can't reasonably supply them.
const SUBMISSION_REQUIRED_STRINGS: (keyof ClubSubmissionInput)[] = [
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
  "contactName",
  "contactPhone",
  "contactEmail",
];

// Builds a Club row from a public self-submission. Unlike toClubData, this
// never trusts the caller for verified/published/source — those are always
// forced to the "new, unreviewed, self-submitted" state regardless of what
// the request body contains.
export function toSubmissionClubData(body: unknown): Prisma.ClubUncheckedCreateInput {
  if (typeof body !== "object" || body === null) {
    throw new Error("Request body must be an object");
  }
  const input = body as Record<string, unknown>;

  for (const key of SUBMISSION_REQUIRED_STRINGS) {
    const value = input[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Field "${key}" is required`);
    }
    const maxLength = MAX_LENGTHS[key as keyof ClubInput] ?? DEFAULT_MAX_LENGTH;
    if (value.length > maxLength) {
      throw new Error(`Field "${key}" must be ${maxLength} characters or fewer`);
    }
  }

  if (!EMAIL_PATTERN.test(input.contactEmail as string)) {
    throw new Error("Contact email must be a valid email address");
  }

  const skillLevel = Number(input.skillLevel);
  const ageRangeMin = Number(input.ageRangeMin);
  const ageRangeMax = Number(input.ageRangeMax);

  if (!Number.isInteger(skillLevel) || skillLevel < 1 || skillLevel > 5) {
    throw new Error("Skill level must be an integer between 1 and 5");
  }
  if (
    !Number.isInteger(ageRangeMin) ||
    !Number.isInteger(ageRangeMax) ||
    ageRangeMin < 0 ||
    ageRangeMax < 0 ||
    ageRangeMin > 120 ||
    ageRangeMax > 120
  ) {
    throw new Error("Age range must be whole numbers between 0 and 120");
  }
  if (ageRangeMin > ageRangeMax) {
    throw new Error("Minimum age can't be greater than maximum age");
  }

  return {
    name: input.name as string,
    category: (input.category as string).toLowerCase().trim(),
    city: input.city as string,
    country: input.country as string,
    latitude: 0,
    longitude: 0,
    description: input.description as string,
    skillLevel,
    housingHelp: Boolean(input.housingHelp),
    jobHelp: Boolean(input.jobHelp),
    ageRangeMin,
    ageRangeMax,
    costTier: input.costTier as string,
    costDetail: input.costDetail as string,
    carNeeded: Boolean(input.carNeeded),
    carNote: input.carNote as string,
    socialScene: input.socialScene as string,
    typicalWeek: input.typicalWeek as string,
    placementLength: input.placementLength as string,
    intakeTiming: input.intakeTiming as string,
    languageNeeded: input.languageNeeded as string,
    visaNote: input.visaNote as string,
    nearby: "",
    safetyNotes: "",
    contactName: input.contactName as string,
    contactPhone: input.contactPhone as string,
    contactEmail: input.contactEmail as string,
    lastContactedAt: null,
    verified: false,
    destinationGuide: "",
    published: false,
    source: "self_submitted",
    isSampleData: false,
  };
}
