import { NextResponse } from "next/server";
import { getWearableCatalog, type PlatziProduct } from "@/lib/platzi";

interface StyleRequest {
  interests: string[];
  favoriteColor: string;
  favoriteSeason: string;
  currentSeason: string;
  moodOccasion: string;
}

interface ModelPick {
  id: number;
  reason: string;
}

interface ModelResponse {
  stylistNote: string;
  picks: ModelPick[];
}

function buildSystemPrompt(catalog: PlatziProduct[]): string {
  const catalogSummary = catalog.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    category: p.category?.name,
  }));

  return `You are a personal stylist for an online clothing shop. You do not filter by rigid categories — you read a person's stated interests, colors, seasons, and mood/occasion, and pick items that actually fit that context.

Here is the current catalog (id, title, price, category):
${JSON.stringify(catalogSummary)}

Return ONLY a JSON object (no markdown fences, no prose outside the JSON) matching exactly this shape:

{
  "stylistNote": "<one warm, specific sentence describing the vibe you're going for based on their context>",
  "picks": [
    { "id": <a product id that exists in the catalog above>, "reason": "<one specific sentence on why this fits their context>" }
  ]
}

Pick 4 to 6 items. Every "id" MUST be one of the ids from the catalog above — never invent an id. Prefer variety across categories where it makes sense for the occasion.`;
}

export async function POST(request: Request) {
  let body: StyleRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { interests, favoriteColor, favoriteSeason, currentSeason, moodOccasion } = body;

  if (!interests?.length || !moodOccasion?.trim()) {
    return NextResponse.json(
      { error: "Tell us at least one interest and what you're feeling like today." },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }

  let catalog: PlatziProduct[];
  try {
    catalog = await getWearableCatalog();
  } catch {
    return NextResponse.json(
      { error: "Could not load the product catalog. Try again in a moment." },
      { status: 502 }
    );
  }

  if (catalog.length === 0) {
    return NextResponse.json(
      { error: "The catalog is empty right now — nothing to recommend." },
      { status: 502 }
    );
  }

  const userMessage = `Interests: ${interests.join(", ")}
Favorite color: ${favoriteColor || "no strong preference"}
Favorite season: ${favoriteSeason || "not specified"}
Current season: ${currentSeason || "not specified"}
Mood / occasion right now: ${moodOccasion}`;

  let anthropicRes: Response;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: buildSystemPrompt(catalog),
        messages: [{ role: "user", content: userMessage }],
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the AI service. Try again in a moment." },
      { status: 502 }
    );
  }

  if (!anthropicRes.ok) {
    return NextResponse.json(
      { error: `AI service returned an error (${anthropicRes.status}).` },
      { status: 502 }
    );
  }

  const data = await anthropicRes.json();
  const rawText = data?.content?.find(
    (block: { type: string }) => block.type === "text"
  )?.text;

  if (!rawText) {
    return NextResponse.json(
      { error: "AI service returned an unexpected response shape." },
      { status: 502 }
    );
  }

  let modelResponse: ModelResponse;
  try {
    modelResponse = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Could not parse the AI's response as structured data." },
      { status: 502 }
    );
  }

  // Never trust the model for price/image/title — only for which id + why.
  // Look up the real product record for every pick, and silently drop any
  // id the model may have hallucinated instead of erroring the whole request.
  const catalogById = new Map(catalog.map((p) => [p.id, p]));
  const picks = (modelResponse.picks ?? [])
    .filter((pick) => catalogById.has(pick.id))
    .map((pick) => ({
      product: catalogById.get(pick.id)!,
      reason: pick.reason,
    }));

  if (picks.length === 0) {
    return NextResponse.json(
      { error: "The AI didn't return any valid picks. Try rephrasing your mood/occasion." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    stylistNote: modelResponse.stylistNote,
    picks,
  });
}
