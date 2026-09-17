import { NextRequest } from "next/server";
import { hmacSign } from "./hmac";
import { prisma } from "./prisma";

export const VISITOR_SESSION_COOKIE = "gyc_visitor_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtpCode(): string {
  // 6 digits, zero-padded — crypto.getRandomValues avoids Math.random()'s
  // weaker guarantees, though this is a low-stakes code either way (short
  // TTL, rate-limited, and no real money/PII behind it).
  const bytes = crypto.getRandomValues(new Uint32Array(1));
  return String(bytes[0] % 1_000_000).padStart(6, "0");
}

export async function createVisitorSessionToken(visitorId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${visitorId}.${expiresAt}`;
  const signature = await hmacSign(payload);
  return `${payload}.${signature}`;
}

async function verifyVisitorSessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [visitorId, expiresAtRaw, signature] = token.split(".");
  if (!visitorId || !expiresAtRaw || !signature) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

  const expected = await hmacSign(`${visitorId}.${expiresAtRaw}`);
  return expected === signature ? visitorId : null;
}

export async function getVisitorFromRequest(request: NextRequest) {
  const token = request.cookies.get(VISITOR_SESSION_COOKIE)?.value;
  const visitorId = await verifyVisitorSessionToken(token);
  if (!visitorId) return null;
  return prisma.visitor.findUnique({ where: { id: visitorId } });
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export function isOtpExpired(expiresAt: Date | null): boolean {
  return !expiresAt || expiresAt.getTime() < Date.now();
}
