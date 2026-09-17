import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorFromRequest } from "@/lib/visitorAuth";
import { checkRateLimit, recordFailedAttempt, UPLOAD_RATE_LIMIT } from "@/lib/rateLimit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reviews = await prisma.review.findMany({
    where: { clubId: id, approved: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, authorName: true, rating: true, text: true, createdAt: true },
  });
  return NextResponse.json(reviews);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Log in to leave a review" }, { status: 401 });

  // Re-use the upload limiter's shape for review-spam throttling.
  const rateLimitKey = `review:${visitor.id}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many reviews submitted. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }
  await recordFailedAttempt(rateLimitKey, UPLOAD_RATE_LIMIT);

  const { id: clubId } = await params;
  const { authorName, rating, text } = await request.json();

  if (typeof authorName !== "string" || !authorName.trim() || authorName.length > 100) {
    return NextResponse.json({ error: "Name is required (100 characters or fewer)" }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim() || text.length > 2000) {
    return NextResponse.json({ error: "Review text is required (2000 characters or fewer)" }, { status: 400 });
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  const review = await prisma.review.create({
    data: {
      clubId,
      visitorId: visitor.id,
      authorName: authorName.trim(),
      rating,
      text: text.trim(),
      approved: false,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
