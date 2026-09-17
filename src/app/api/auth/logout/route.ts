import { NextResponse } from "next/server";
import { VISITOR_SESSION_COOKIE } from "@/lib/visitorAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(VISITOR_SESSION_COOKIE);
  return response;
}
