import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toSubmissionClubData } from "@/lib/clubValidation";
import { checkRateLimit, recordFailedAttempt, CLUB_SUBMIT_RATE_LIMIT } from "@/lib/rateLimit";

// Public: a club submits itself via /list-your-club. Always lands
// unpublished/unverified with source "self_submitted" — see
// toSubmissionClubData — for an admin to review in the same queue as
// admin-added drafts.
export async function POST(request: NextRequest) {
  const rateLimitKey = `club-submit:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "global"}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many submissions. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  // Count every attempt, not just failures, so a scripted flood of bot
  // submissions gets throttled just as fast as repeated bad input.
  await recordFailedAttempt(rateLimitKey, CLUB_SUBMIT_RATE_LIMIT);

  const body = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  // Honeypot: real visitors never see or fill in this field. A bot that
  // fills every field will trip this — return a normal-looking success so
  // it doesn't learn to route around the check, but create nothing.
  const honeypot = (body as Record<string, unknown>).website;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return NextResponse.json({ id: "ok" }, { status: 201 });
  }

  try {
    const data = toSubmissionClubData(body);
    const club = await prisma.club.create({ data });
    return NextResponse.json({ id: club.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid club data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
