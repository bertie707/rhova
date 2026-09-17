import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorFromRequest } from "@/lib/visitorAuth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clubId: string }> }
) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { clubId } = await params;
  await prisma.favorite
    .delete({ where: { visitorId_clubId: { visitorId: visitor.id, clubId } } })
    .catch(() => null);

  return NextResponse.json({ ok: true });
}
