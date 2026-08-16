import StyleQuiz from "@/components/style-quiz";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="font-mono text-sm uppercase tracking-widest text-signal">
        AI Stylist
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-5xl font-semibold text-ink">
        Dressed for how you actually feel.
      </h1>
      <p className="mt-6 max-w-xl text-ink/70">
        Skip the filters. Tell us your interests, your colors, and what
        today feels like — the AI does the rest, picking from real items in
        the catalog and explaining why each one fits.
      </p>
      <div className="mt-16">
        <StyleQuiz />
      </div>
    </section>
  );
}
