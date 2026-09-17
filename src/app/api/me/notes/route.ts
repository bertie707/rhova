import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorFromRequest } from "@/lib/visitorAuth";

const MAX_NOTES_LENGTH = 5000;

export async function PATCH(request: NextRequest) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { notes } = await request.json();
  if (typeof notes !== "string" || notes.length > MAX_NOTES_LENGTH) {
    return NextResponse.json(
      { error: `Notes must be text, ${MAX_NOTES_LENGTH} characters or fewer` },
      { status: 400 }
    );
  }

  await prisma.visitor.update({ where: { id: visitor.id }, data: { notes } });
  return NextResponse.json({ ok: true });
}
