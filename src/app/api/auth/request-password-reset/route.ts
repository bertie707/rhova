import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, otpExpiryDate } from "@/lib/visitorAuth";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit, recordFailedAttempt, OTP_REQUEST_RATE_LIMIT } from "@/lib/rateLimit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (typeof email !== "string" || !EMAIL_PATTERN.test(email) || email.length > 320) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  const normalizedEmail = email.trim().toLowerCase();

  const rateLimitKey = `password-reset-request:${normalizedEmail}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many requests. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  await recordFailedAttempt(rateLimitKey, OTP_REQUEST_RATE_LIMIT);

  const visitor = await prisma.visitor.findUnique({ where: { email: normalizedEmail } });

  // Always respond the same way whether or not the account exists, so this
  // can't be used to check which emails have a Rhova account.
  if (visitor) {
    const code = generateOtpCode();
    const expiresAt = otpExpiryDate();
    await prisma.visitor.update({
      where: { id: visitor.id },
      data: { otpCode: code, otpExpiresAt: expiresAt },
    });
    await sendPasswordResetEmail(normalizedEmail, code);
  }

  return NextResponse.json({ ok: true });
}
