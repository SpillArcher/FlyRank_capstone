"use client";

import { useState } from "react";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  price: number;
  images: string[];
  category: { id: number; name: string };
}

interface Pick {
  product: Product;
  reason: string;
}

interface StyleResult {
  stylistNote: string;
  picks: Pick[];
}

const INTEREST_OPTIONS = [
  "Streetwear",
  "Minimalist",
  "Athletic",
  "Formal",
  "Outdoors",
  "Vintage",
];

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Navy",
  "Red",
  "Green",
  "Earth tones",
];

const SEASONS = ["Spring", "Summer", "Fall", "Winter"];

function detectCurrentSeason(): string {
  const month = new Date().getMonth(); // 0 = Jan
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

export default function StyleQuiz() {
  const [interests, setInterests] = useState<string[]>([]);
  const [favoriteColor, setFavoriteColor] = useState("");
  const [favoriteSeason, setFavoriteSeason] = useState("");
  const [currentSeason, setCurrentSeason] = useState(detectCurrentSeason());
  const [moodOccasion, setMoodOccasion] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StyleResult | null>(null);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/style", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          interests,
          favoriteColor,
          favoriteSeason,
          currentSeason,
          moodOccasion,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setResult(data);
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  const isLoading = status === "loading";
  const canSubmit = interests.length > 0 && moodOccasion.trim().length > 0;

  return (
    <div className="flex flex-col gap-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <fieldset>
          <legend className="font-mono text-sm uppercase tracking-widest text-signal">
            Interests
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                aria-pressed={interests.includes(interest)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  interests.includes(interest)
                    ? "border-accent bg-accent text-white"
                    : "border-border text-ink/70 hover:border-signal"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-mono text-sm uppercase tracking-widest text-signal">
            Favorite color
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFavoriteColor(color)}
                aria-pressed={favoriteColor === color}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  favoriteColor === color
                    ? "border-accent bg-accent text-white"
                    : "border-border text-ink/70 hover:border-signal"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-mono text-sm uppercase tracking-widest text-signal">
              Favorite season
            </span>
            <select
              value={favoriteSeason}
              onChange={(e) => setFavoriteSeason(e.target.value)}
              className="rounded-md border border-border bg-paper p-2 text-sm text-ink"
            >
              <option value="">Pick one</option>
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-sm uppercase tracking-widest text-signal">
              Current season
            </span>
            <select
              value={currentSeason}
              onChange={(e) => setCurrentSeason(e.target.value)}
              className="rounded-md border border-border bg-paper p-2 text-sm text-ink"
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-sm uppercase tracking-widest text-signal">
            What do you feel like today?
          </span>
          <input
            type="text"
            value={moodOccasion}
            onChange={(e) => setMoodOccasion(e.target.value)}
            placeholder="e.g. confident, going to a fancy dinner"
            className="rounded-md border border-border bg-paper p-3 text-sm text-ink"
            disabled={isLoading}
          />
        </label>

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="self-start rounded-md bg-accent px-6 py-2.5 font-mono text-sm uppercase tracking-wide text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Styling…" : "Style me"}
        </button>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </form>

      <div aria-live="polite">
        {result && (
          <div className="flex flex-col gap-6">
            <p className="font-display text-2xl text-ink">
              {result.stylistNote}
            </p>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.picks.map((pick) => (
                <li
                  key={pick.product.id}
                  className="flex flex-col gap-2 rounded-lg border border-border p-3"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image
                      src={pick.product.images[0]}
                      alt={pick.product.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <p className="font-display text-base text-ink">
                    {pick.product.title}
                  </p>
                  <p className="font-mono text-sm text-signal">
                    ${pick.product.price}
                  </p>
                  <p className="text-sm text-ink/70">{pick.reason}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
