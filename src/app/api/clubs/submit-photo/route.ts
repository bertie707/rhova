import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, recordFailedAttempt, UPLOAD_RATE_LIMIT } from "@/lib/rateLimit";

const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15MB — plenty for a phone photo
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function extensionFor(file: File): string {
  const fromName = path.extname(file.name);
  if (fromName) return fromName;
  if (file.type.startsWith("image/")) return "." + file.type.split("/")[1];
  return "";
}

// Public: attaches a photo to a club the visitor just self-submitted via
// /list-your-club. Unlike /api/upload (admin-only, any club), this only
// accepts photos for clubs that are still an unpublished self-submission —
// once an admin publishes or otherwise takes ownership of the row, this
// endpoint can no longer touch it, so it can't be used to deface a live or
// admin-managed listing.
export async function POST(request: NextRequest) {
  const rateLimitKey = `club-submit-photo:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "global"}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  await recordFailedAttempt(rateLimitKey, UPLOAD_RATE_LIMIT);

  const formData = await request.formData();
  const file = formData.get("file");
  const clubId = formData.get("clubId");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (typeof clubId !== "string" || !clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large (15MB max)" }, { status: 400 });
  }

  const extension = extensionFor(file).toLowerCase();
  if (!file.type.startsWith("image/") || !ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club || club.source !== "self_submitted" || club.published) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  const filename = `${crypto.randomUUID()}${extension}`;
  const blob = await put(`uploads/${clubId}/${filename}`, file, {
    access: "public",
    contentType: file.type,
  });

  const mediaCount = await prisma.media.count({ where: { clubId } });
  const media = await prisma.media.create({
    data: {
      clubId,
      type: "photo",
      url: blob.url,
      order: mediaCount,
    },
  });

  return NextResponse.json(media, { status: 201 });
}
