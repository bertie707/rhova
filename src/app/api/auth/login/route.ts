import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createVisitorSessionToken, VISITOR_SESSION_COOKIE } from "@/lib/visitorAuth";
import { checkRateLimit, recordFailedAttempt, clearRateLimit, LOGIN_RATE_LIMIT } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const rateLimitKey = `visitor-login:${normalizedEmail}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const visitor = await prisma.visitor.findUnique({ where: { email: normalizedEmail } });
  const matches = visitor?.passwordHash ? await compare(password, visitor.passwordHash) : false;

  if (!visitor || !matches) {
    await recordFailedAttempt(rateLimitKey, LOGIN_RATE_LIMIT);
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  await clearRateLimit(rateLimitKey);

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
