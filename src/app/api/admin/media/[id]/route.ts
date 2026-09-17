import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.media.delete({ where: { id } });

  await del(media.url).catch(() => {
    // Blob already missing — nothing more to clean up.
  });

  return NextResponse.json({ ok: true });
}
