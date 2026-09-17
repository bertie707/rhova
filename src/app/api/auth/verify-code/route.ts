import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createVisitorSessionToken, isOtpExpired, VISITOR_SESSION_COOKIE } from "@/lib/visitorAuth";
import { checkRateLimit, recordFailedAttempt, clearRateLimit, OTP_VERIFY_RATE_LIMIT } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const { email, code } = await request.json();

  if (typeof email !== "string" || typeof code !== "string") {
    return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const rateLimitKey = `otp-verify:${normalizedEmail}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const visitor = await prisma.visitor.findUnique({ where: { email: normalizedEmail } });

  if (!visitor || !visitor.otpCode || isOtpExpired(visitor.otpExpiresAt) || visitor.otpCode !== code.trim()) {
    await recordFailedAttempt(rateLimitKey, OTP_VERIFY_RATE_LIMIT);
    return NextResponse.json({ error: "Incorrect or expired code" }, { status: 401 });
  }

  await clearRateLimit(rateLimitKey);
  await prisma.visitor.update({
    where: { id: visitor.id },
    data: { otpCode: null, otpExpiresAt: null },
  });

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
