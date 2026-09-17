import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUSES } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status, notes } = await request.json();

  const data: { status?: string; notes?: string } = {};

  if (status !== undefined) {
    if (typeof status !== "string" || !LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = status;
  }
  if (notes !== undefined) {
    if (typeof notes !== "string" || notes.length > 2000) {
      return NextResponse.json({ error: "Notes must be 2000 characters or fewer" }, { status: 400 });
    }
    data.notes = notes;
  }

  const lead = await prisma.lead.update({ where: { id }, data });
  return NextResponse.json(lead);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
