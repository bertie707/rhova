import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(leads);
}

interface ParsedRow {
  name: string;
  city: string;
  country: string;
  email: string;
  website: string | null;
}

function parseBulkText(text: string): ParsedRow[] {
  const rows: ParsedRow[] = [];

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;

    const separator = line.includes("\t") ? "\t" : ",";
    const fields = line.split(separator).map((f) => f.trim());
    const [name, city, country, email, website] = fields;

    if (!name || !email || !email.includes("@")) continue; // skip header rows / junk lines

    rows.push({
      name: name.slice(0, 200),
      city: (city || "").slice(0, 200),
      country: (country || "").slice(0, 200),
      email: email.slice(0, 320),
      website: website ? website.slice(0, 500) : null,
    });
  }

  return rows;
}

export async function POST(request: NextRequest) {
  const { text, category } = await request.json();

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Paste some club data first" }, { status: 400 });
  }

  const rows = parseBulkText(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "Couldn't find any valid rows. Expected one club per line, fields separated by commas or tabs, with a real email address" },
      { status: 400 }
    );
  }

  const existing = await prisma.lead.findMany({ select: { email: true } });
  const existingEmails = new Set(existing.map((l) => l.email.toLowerCase()));
  const newRows = rows.filter((r) => !existingEmails.has(r.email.toLowerCase()));

  if (newRows.length > 0) {
    await prisma.lead.createMany({
      data: newRows.map((r) => ({ ...r, category: typeof category === "string" && category ? category : "rugby" })),
    });
  }

  return NextResponse.json({
    added: newRows.length,
    skippedDuplicates: rows.length - newRows.length,
  });
}
