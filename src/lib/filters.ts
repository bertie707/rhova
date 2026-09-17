import type { ClubWithMedia } from "./types";

export interface FilterState {
  query: string;
  housing: boolean;
  job: boolean;
  minSkill: number;
}

export const initialFilterState: FilterState = {
  query: "",
  housing: false,
  job: false,
  minSkill: 0,
};

function matchesQuery(club: ClubWithMedia, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return true;
  const haystack = `${club.category} ${club.name} ${club.city} ${club.country} ${club.description}`.toLowerCase();
  return haystack.includes(trimmed.toLowerCase());
}

export function filterClubs(clubs: ClubWithMedia[], state: FilterState) {
  return clubs.filter(
    (club) =>
      matchesQuery(club, state.query) &&
      (!state.housing || club.housingHelp) &&
      (!state.job || club.jobHelp) &&
      (state.minSkill === 0 || club.skillLevel >= state.minSkill)
  );
}
