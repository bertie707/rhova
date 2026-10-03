import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVisitorFromRequest, VISITOR_SESSION_COOKIE } from "@/lib/visitorAuth";

export async function GET(request: NextRequest) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  return NextResponse.json({ email: visitor.email, notes: visitor.notes });
}

// Self-service account deletion — permanently removes the visitor row and
// everything tied to it (favorites, reviews cascade via the schema).
export async function DELETE(request: NextRequest) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await prisma.visitor.delete({ where: { id: visitor.id } });

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(VISITOR_SESSION_COOKIE);
  return response;
}
