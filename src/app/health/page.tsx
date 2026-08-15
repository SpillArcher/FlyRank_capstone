import { getBaseUrl } from "@/lib/get-base-url";

interface HealthPayload {
  status: string;
  environment: string;
  timestamp: string;
}

async function getHealth(): Promise<HealthPayload> {
  const res = await fetch(`${getBaseUrl()}/api/health`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

export default async function HealthPage() {
  const health = await getHealth();

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <p className="font-mono text-sm uppercase tracking-widest text-signal">
        System
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink">
        Health check
      </h1>
      <dl className="mt-8 grid max-w-md gap-4 font-mono text-sm">
        <div className="flex justify-between border-b border-border pb-2">
          <dt className="text-ink/60">Status</dt>
          <dd className="text-success">{health.status}</dd>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <dt className="text-ink/60">Environment</dt>
          <dd>{health.environment}</dd>
        </div>
        <div className="flex justify-between border-b border-border pb-2">
          <dt className="text-ink/60">Checked at</dt>
          <dd>{health.timestamp}</dd>
        </div>
      </dl>
    </section>
  );
}
