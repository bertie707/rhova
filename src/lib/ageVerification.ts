// Shared by both the signup form (client) and the signup API route
// (server) — kept dependency-free so it's safe to import from either.
export const MIN_SIGNUP_AGE = 16;

export function isOldEnough(dateOfBirth: string): boolean {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return false;

  const today = new Date();
  const cutoff = new Date(today.getFullYear() - MIN_SIGNUP_AGE, today.getMonth(), today.getDate());
  return dob <= cutoff;
}

// For the date input's `max` attribute — the latest birth date that's
// still at least MIN_SIGNUP_AGE years ago, so the picker itself steers
// people away from an under-age date rather than only rejecting on submit.
export function latestAllowedDateOfBirth(): string {
  const today = new Date();
  const cutoff = new Date(today.getFullYear() - MIN_SIGNUP_AGE, today.getMonth(), today.getDate());
  return cutoff.toISOString().slice(0, 10);
}
