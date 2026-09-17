import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toClubData } from "@/lib/clubValidation";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const data = toClubData(body);
    const club = await prisma.club.create({ data: { ...data, isSampleData: false } });
    return NextResponse.json(club, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid club data";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
