import { NextRequest, NextResponse } from "next/server";
import { getVisitorFromRequest } from "@/lib/visitorAuth";

export async function GET(request: NextRequest) {
  const visitor = await getVisitorFromRequest(request);
  if (!visitor) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  return NextResponse.json({ email: visitor.email, notes: visitor.notes });
}
