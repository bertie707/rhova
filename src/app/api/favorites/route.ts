import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorFromRequest } from "@/lib/visitorAuth";

export async function GET(request: NextRequest) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { visitorId: visitor.id },
    include: { club: { include: { media: { orderBy: { order: "asc" }, take: 1 } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites.map((f) => f.club));
}

export async function POST(request: NextRequest) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { clubId } = await request.json();
  if (typeof clubId !== "string" || !clubId) {
    return NextResponse.json({ error: "clubId is required" }, { status: 400 });
  }

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

  await prisma.favorite.upsert({
    where: { visitorId_clubId: { visitorId: visitor.id, clubId } },
    create: { visitorId: visitor.id, clubId },
    update: {},
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
