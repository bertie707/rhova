import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: { club: { select: { name: true } }, visitor: { select: { email: true } } },
    orderBy: [{ approved: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(reviews);
}
