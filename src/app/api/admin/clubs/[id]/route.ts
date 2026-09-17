import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClubData } from "@/lib/clubValidation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const club = await prisma.club.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } } },
  });
  if (!club) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(club);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  try {
    const data = toClubData(body);
    const club = await prisma.club.update({ where: { id }, data });
    return NextResponse.json(club);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid club data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.club.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
