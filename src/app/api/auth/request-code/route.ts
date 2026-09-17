import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, otpExpiryDate } from "@/lib/visitorAuth";
import { checkRateLimit, recordFailedAttempt, OTP_REQUEST_RATE_LIMIT } from "@/lib/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const rateLimitKey = `otp-request:${normalizedEmail}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  await recordFailedAttempt(rateLimitKey, OTP_REQUEST_RATE_LIMIT);

  const code = generateOtpCode();
  const expiresAt = otpExpiryDate();

  await prisma.visitor.upsert({
    where: { email: normalizedEmail },
    create: { email: normalizedEmail, otpCode: code, otpExpiresAt: expiresAt },
    update: { otpCode: code, otpExpiresAt: expiresAt },
  });

  // TEMP: no real email-sending service is configured yet, so the code is
  // returned directly instead of emailed. Remove `devCode` from this
  // response once that's wired up — see the schema.prisma note on
  // Visitor.otpCode for the same flag.
  return NextResponse.json({ ok: true, devCode: code });
}
