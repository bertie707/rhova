import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import path from "path";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, recordFailedAttempt, UPLOAD_RATE_LIMIT } from "@/lib/rateLimit";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // 50MB, generous for phone video clips
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".mov", ".webm"]);

function extensionFor(file: File): string {
  const fromName = path.extname(file.name);
  if (fromName) return fromName;
  if (file.type.startsWith("image/")) return "." + file.type.split("/")[1];
  if (file.type.startsWith("video/")) return "." + file.type.split("/")[1];
  return "";
}

export async function POST(request: NextRequest) {
  const rateLimitKey = `upload:${request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "global"}`;
  const rateLimit = await checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Too many uploads. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }
  // Count every attempt (not just failures) toward the volume cap — uploads
  // are storage/disk-cost, so even successful ones should be throttled.
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
    return NextResponse.json({ error: "File too large (50MB max)" }, { status: 400 });
  }

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const extension = extensionFor(file).toLowerCase();
  if (!isImage && !isVideo) {
    return NextResponse.json({ error: "Only image or video files are allowed" }, { status: 400 });
  }
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json({ error: "Unsupported file extension" }, { status: 400 });
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) {
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
      type: isImage ? "photo" : "video",
      url: blob.url,
      order: mediaCount,
    },
  });

  return NextResponse.json(media, { status: 201 });
}
