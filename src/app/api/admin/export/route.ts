import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Lets the admin pull a full backup/portable copy of everything they've
// entered by hand — there's no other way to get this data back out.
export async function GET() {
  const clubs = await prisma.club.findMany({
    include: { media: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "asc" },
  });

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(clubs, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="rhova-export-${date}.json"`,
    },
  });
}
