import type { Club, Media } from "@prisma/client";

export type ClubWithMedia = Club & { media: Media[] };

export const LEAD_STATUSES = [
  "not_contacted",
  "emailed",
  "replied",
  "not_interested",
  "called",
  "added",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  not_contacted: "Not contacted",
  emailed: "Emailed",
  replied: "Replied",
  not_interested: "Not interested",
  called: "Called",
  added: "Added to site",
};

export interface PublicReview {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
}

export const SKILL_LABELS: Record<number, string> = {
  1: "Complete beginner welcome",
  2: "Some experience useful",
  3: "Club-level experience expected",
  4: "Competitive / representative level",
  5: "High performance",
};

export const COST_TIERS = ["Low", "Moderate", "High"] as const;
export type CostTier = (typeof COST_TIERS)[number];

export const CLUB_SOURCES = ["admin", "self_submitted"] as const;
export type ClubSource = (typeof CLUB_SOURCES)[number];

export const CLUB_SOURCE_LABELS: Record<ClubSource, string> = {
  admin: "Added by admin",
  self_submitted: "Self-submitted",
};

// Fields a club can fill in themselves on the public /list-your-club form.
// Everything else on Club (location, verification, destination guide, etc.)
// is admin-only and gets sensible defaults until an admin fills it in.
export interface ClubSubmissionInput {
  name: string;
  category: string;
  city: string;
  country: string;
  description: string;
  skillLevel: number;
  housingHelp: boolean;
  jobHelp: boolean;
  ageRangeMin: number;
  ageRangeMax: number;
  costTier: string;
  costDetail: string;
  carNeeded: boolean;
  carNote: string;
  socialScene: string;
  typicalWeek: string;
  placementLength: string;
  intakeTiming: string;
  languageNeeded: string;
  visaNote: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  // Honeypot: real visitors never see or fill this in. Any non-empty value
  // means the submission came from a bot.
  website: string;
}

export interface ClubInput {
  name: string;
  category: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  skillLevel: number;
  housingHelp: boolean;
  jobHelp: boolean;
  ageRangeMin: number;
  ageRangeMax: number;
  costTier: string;
  costDetail: string;
  carNeeded: boolean;
  carNote: string;
  socialScene: string;
  typicalWeek: string;
  placementLength: string;
  intakeTiming: string;
  languageNeeded: string;
  visaNote: string;
  nearby: string;
  safetyNotes: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  lastContactedAt: string | null;
  verified: boolean;
  destinationGuide: string;
  published: boolean;
}
