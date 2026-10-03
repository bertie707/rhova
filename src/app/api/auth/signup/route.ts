import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createVisitorSessionToken, VISITOR_SESSION_COOKIE, passwordError } from "@/lib/visitorAuth";
import { checkRateLimit, recordFailedAttempt, SIGNUP_RATE_LIMIT } from "@/lib/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const rateLimitKey = `signup:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "global"}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  await recordFailedAttempt(rateLimitKey, SIGNUP_RATE_LIMIT);

  const { email, password } = await request.json();

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const passwordIssue = passwordError(password);
  if (passwordIssue) {
    return NextResponse.json({ error: passwordIssue }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.visitor.findUnique({ where: { email: normalizedEmail } });
  if (existing?.passwordHash) {
    return NextResponse.json(
      { error: "An account with that email already exists — try logging in instead." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 12);
  const visitor = existing
    ? await prisma.visitor.update({ where: { id: existing.id }, data: { passwordHash } })
    : await prisma.visitor.create({ data: { email: normalizedEmail, passwordHash } });

  const token = await createVisitorSessionToken(visitor.id);
  const response = NextResponse.json({ ok: true, email: visitor.email });
  response.cookies.set(VISITOR_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
