import { compare } from "bcryptjs";
import { hmacSign } from "./hmac";

export const SESSION_COOKIE = "gyc_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cookie value is `${expiresAt}.${signature}` — stateless, no session table needed.
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await hmacSign(String(expiresAt));
  return `${expiresAt}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiresAtRaw, signature] = token.split(".");
  if (!expiresAtRaw || !signature) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = await hmacSign(expiresAtRaw);
  return expected === signature;
}

// ADMIN_PASSWORD_HASH is a bcrypt hash, not the password itself — generate
// one with `npm run hash-password`, see scripts/hash-password.ts.
export async function checkAdminPassword(password: string): Promise<boolean> {
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedHash) throw new Error("ADMIN_PASSWORD_HASH env var is not set");
  return compare(password, expectedHash);
}
