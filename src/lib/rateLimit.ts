// Postgres-backed rate limiter (via the RateLimitAttempt table) — a shared
// store is required once this runs as serverless functions on Vercel: an
// in-memory Map only rate-limits within a single instance, and a repeated
// guess against /admin or /list-your-club can simply land on a fresh
// instance with no memory of prior attempts.
import { prisma } from "./prisma";

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockMs: number;
}

export const LOGIN_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  blockMs: 15 * 60 * 1000,
};

export const UPLOAD_RATE_LIMIT: RateLimitConfig = {
  windowMs: 5 * 60 * 1000,
  maxAttempts: 40,
  blockMs: 2 * 60 * 1000,
};

// Self-submitting a club: generous enough for a club fixing a typo and
// resubmitting, strict enough to blunt a scripted flood of fake listings.
export const CLUB_SUBMIT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000,
  maxAttempts: 8,
  blockMs: 60 * 60 * 1000,
};

// Requesting a code: generous enough for someone who fat-fingers their email
// once or twice, strict enough to stop using this as an email bomb.
export const OTP_REQUEST_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  blockMs: 15 * 60 * 1000,
};

// Verifying a code: a 6-digit code is only 1M combinations, so this has to
// be tight — 5 guesses per code before the whole thing locks out.
export const OTP_VERIFY_RATE_LIMIT: RateLimitConfig = {
  windowMs: 10 * 60 * 1000,
  maxAttempts: 5,
  blockMs: 15 * 60 * 1000,
};

export async function checkRateLimit(key: string): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  const entry = await prisma.rateLimitAttempt.findUnique({ where: { key } });
  if (!entry) return { allowed: true };

  const now = Date.now();
  if (entry.blockedUntil && entry.blockedUntil.getTime() > now) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.blockedUntil.getTime() - now) / 1000) };
  }

  return { allowed: true };
}

export async function recordFailedAttempt(key: string, config: RateLimitConfig = LOGIN_RATE_LIMIT): Promise<void> {
  const now = Date.now();
  const entry = await prisma.rateLimitAttempt.findUnique({ where: { key } });

  if (!entry || now - entry.firstAttemptAt.getTime() > config.windowMs) {
    await prisma.rateLimitAttempt.upsert({
      where: { key },
      create: { key, count: 1, firstAttemptAt: new Date(now), blockedUntil: null },
      update: { count: 1, firstAttemptAt: new Date(now), blockedUntil: null },
    });
    return;
  }

  const count = entry.count + 1;
  const blockedUntil = count >= config.maxAttempts ? new Date(now + config.blockMs) : null;
  await prisma.rateLimitAttempt.update({
    where: { key },
    data: { count, blockedUntil },
  });
}

export async function clearRateLimit(key: string): Promise<void> {
  await prisma.rateLimitAttempt.deleteMany({ where: { key } });
}
