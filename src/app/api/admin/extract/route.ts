import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";

// Turns pasted free text — an email thread, call notes, a club's own website
// copy — into a draft of the (long) club form, so the admin can review and
// correct instead of typing every field by hand.

const MAX_TEXT_LENGTH = 20000;

const EXTRACT_TOOL_NAME = "extract_club_info";

const EXTRACT_TOOL: Anthropic.Tool = {
  name: EXTRACT_TOOL_NAME,
  description:
    "Record the club details found in the pasted text. Use an empty string, false, or the given default for anything not mentioned — never invent specifics that aren't in the text.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string", description: "Club name. \"\" if not mentioned." },
      category: { type: "string", description: "Sport, lowercase, e.g. \"rugby\". \"\" if not mentioned." },
      city: { type: "string", description: "\"\" if not mentioned." },
      country: { type: "string", description: "\"\" if not mentioned." },
      description: { type: "string", description: "A short 1-3 sentence overview of the club. \"\" if not enough to summarize." },
      skillLevel: {
        type: "integer",
        enum: [1, 2, 3, 4, 5],
        description: "1=complete beginner welcome, 5=high performance. Default 1 if not mentioned.",
      },
      housingHelp: { type: "boolean", description: "Default false if not mentioned." },
      jobHelp: { type: "boolean", description: "Default false if not mentioned." },
      ageRangeMin: { type: "integer", description: "Default 18 if not mentioned." },
      ageRangeMax: { type: "integer", description: "Default 25 if not mentioned." },
      costTier: {
        type: "string",
        enum: ["Low", "Moderate", "High"],
        description: "Cost of living tier. Default \"Moderate\" if not mentioned.",
      },
      costDetail: { type: "string", description: "\"\" if not mentioned." },
      carNeeded: { type: "boolean", description: "Default false if not mentioned." },
      carNote: { type: "string", description: "\"\" if not mentioned." },
      socialScene: { type: "string", description: "\"\" if not mentioned." },
      typicalWeek: { type: "string", description: "\"\" if not mentioned." },
      placementLength: { type: "string", description: "\"\" if not mentioned." },
      intakeTiming: { type: "string", description: "\"\" if not mentioned." },
      languageNeeded: { type: "string", description: "\"\" if not mentioned." },
      visaNote: { type: "string", description: "\"\" if not mentioned." },
      nearby: { type: "string", description: "\"\" if not mentioned." },
      safetyNotes: { type: "string", description: "\"\" if not mentioned." },
      contactName: { type: "string", description: "\"\" if not mentioned." },
      contactPhone: { type: "string", description: "\"\" if not mentioned." },
      contactEmail: { type: "string", description: "\"\" if not mentioned." },
      lastContactedAt: {
        type: ["string", "null"],
        description: "Date (YYYY-MM-DD) the club was last spoken to, resolved from relative phrases like \"yesterday\" or \"last Tuesday\" using today's date given below. Null if not mentioned.",
      },
    },
    required: [
      "name",
      "category",
      "city",
      "country",
      "description",
      "skillLevel",
      "housingHelp",
      "jobHelp",
      "ageRangeMin",
      "ageRangeMax",
      "costTier",
      "costDetail",
      "carNeeded",
      "carNote",
      "socialScene",
      "typicalWeek",
      "placementLength",
      "intakeTiming",
      "languageNeeded",
      "visaNote",
      "nearby",
      "safetyNotes",
      "contactName",
      "contactPhone",
      "contactEmail",
      "lastContactedAt",
    ],
    additionalProperties: false,
  },
};

export async function POST(request: NextRequest) {
  const { text } = await request.json();

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Paste some notes first" }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `That's too long — keep pasted notes under ${MAX_TEXT_LENGTH} characters` },
      { status: 400 }
    );
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    const response = await anthropic.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: `You extract structured club listing data from messy, real-world source text (emails, call notes, website copy) for a gap-year sports-club directory. Today's date is ${today}. Only use the ${EXTRACT_TOOL_NAME} tool — never guess at facts the text doesn't support.`,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: "tool", name: EXTRACT_TOOL_NAME },
      messages: [{ role: "user", content: text }],
    });

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );
    if (!toolUse) {
      return NextResponse.json({ error: "Claude didn't return structured data — try again" }, { status: 502 });
    }

    return NextResponse.json({ fields: toolUse.input });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "Anthropic API key is missing or invalid" }, { status: 500 });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Rate limited by the Anthropic API — try again shortly" }, { status: 429 });
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json({ error: `Anthropic API error: ${err.message}` }, { status: 502 });
    }
    return NextResponse.json({ error: "Couldn't reach the extraction service" }, { status: 502 });
  }
}
