import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, checkAdminPassword, createSessionToken } from "@/lib/auth";
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from "@/lib/rateLimit";

function clientKey(request: NextRequest): string {
  // Best-effort client identifier for rate limiting. Falls back to a single
  // shared bucket if no proxy header is present (e.g. plain local dev),
  // which still protects against brute force — it just blocks everyone
  // together rather than per-IP.
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "global";
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  const rateLimit = await checkRateLimit(key);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { password } = await request.json();

  if (typeof password !== "string" || !(await checkAdminPassword(password))) {
    await recordFailedAttempt(key);
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  await clearRateLimit(key);

  const token = await createSessionToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
