import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { GUIDE_SECTIONS } from "@/lib/destinationGuide";

// Drafts an area/travel guide for a club's city by having Claude research it
// with web search, then hands the structured result to the admin form for
// review and editing — nothing here is ever shown to the public directly.

const RECORD_TOOL_NAME = "record_destination_guide";
const MAX_ITERATIONS = 6;

const sectionProperties = Object.fromEntries(
  GUIDE_SECTIONS.map(({ key, heading }) => [
    key,
    {
      type: "string",
      description: `One or two flowing paragraphs for the "${heading}" section. Empty string if you couldn't find anything reliable and specific enough for this exact place.`,
    },
  ])
);

const RECORD_TOOL: Anthropic.Tool = {
  name: RECORD_TOOL_NAME,
  description: "Record the finished destination guide once you're done researching.",
  strict: true,
  input_schema: {
    type: "object",
    properties: {
      ...sectionProperties,
      faq: {
        type: "array",
        description:
          "Short, quick-hit practical Q&A pairs (tap water, plug type, which side of the road, tipping, shop hours, local slang, etc.) — the silly-but-useful stuff.",
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            answer: { type: "string" },
          },
          required: ["question", "answer"],
          additionalProperties: false,
        },
      },
    },
    required: [...GUIDE_SECTIONS.map((s) => s.key), "faq"],
    additionalProperties: false,
  },
};

const SYSTEM_PROMPT = `You research and write short local/travel guides for gap-year sports-club placements, for the "${RECORD_TOOL_NAME}" tool's fixed sections.

Use the web_search tool for anything specific to this exact city/area that you're not already confident about — nearest supermarkets, current typical prices, transport specifics, current safety context. You may answer well-known general facts about the country directly without searching (which side of the road, plug type, emergency number, tipping norms) — these are common FAQ material.

This informs a real traveller going to a real place. Never state a specific business name, exact price, or safety claim you haven't found via search or don't have solid general knowledge of. If you can't find anything reliable and specific enough for a section, leave that section as an empty string rather than inventing or generalizing vaguely — a missing section is better than a wrong one.

When you're done researching, call ${RECORD_TOOL_NAME} exactly once with the finished guide. Do not call it more than once.`;

export async function POST(request: NextRequest) {
  const { name, city, country, category, description } = await request.json();

  if (typeof city !== "string" || !city.trim() || typeof country !== "string" || !country.trim()) {
    return NextResponse.json({ error: "Fill in city and country first" }, { status: 400 });
  }

  const userPrompt = [
    `Club/placement: ${typeof name === "string" && name.trim() ? name : "(unnamed)"}`,
    `Sport/category: ${typeof category === "string" && category.trim() ? category : "(unspecified)"}`,
    `Location: ${city}, ${country}`,
    typeof description === "string" && description.trim() ? `Existing description: ${description}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  let messages: Anthropic.MessageParam[] = [{ role: "user", content: userPrompt }];

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await anthropic.messages.create({
        model: "claude-opus-5",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8 }, RECORD_TOOL],
        messages,
      });

      if (response.stop_reason === "pause_turn") {
        messages = [...messages, { role: "assistant", content: response.content }];
        continue;
      }

      const recordCall = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use" && block.name === RECORD_TOOL_NAME
      );
      if (recordCall) {
        return NextResponse.json({ guide: recordCall.input });
      }

      // Claude called web_search (auto-executed server-side already) but
      // didn't finish with the record tool yet — nudge it to keep going.
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );
      if (toolUseBlocks.length === 0) break;
      messages = [...messages, { role: "assistant", content: response.content }];
    }

    return NextResponse.json(
      { error: "Claude didn't finish researching in time — try again" },
      { status: 502 }
    );
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
    return NextResponse.json({ error: "Couldn't reach the research service" }, { status: 502 });
  }
}
