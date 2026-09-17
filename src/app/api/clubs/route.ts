import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public: list every club for the map. Dataset is small enough that the
// client fetches it all once and filters/searches in the browser.
export async function GET() {
  const clubs = await prisma.club.findMany({
    where: { published: true },
    include: { media: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(clubs);
}
