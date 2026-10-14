import { useMemo } from "react";
import { useStream } from "../hooks/useStream";
import { percentile } from "../lib/stats";

export function StatsCards() {
  const { window: records } = useStream();
  const delays = useMemo(() => records.slice(-100).map((r) => r.delayMs), [records]);

  const p50 = percentile(delays, 50);
  const p95 = percentile(delays, 95);
  const p99 = percentile(delays, 99);
  const max = delays.length ? Math.max(...delays) : null;
  const spread = p50 !== null && p95 !== null ? p95 - p50 : null;

  const cards = [
    { label: "Blocks in window", value: String(delays.length) },
    { label: "p50", value: p50 !== null ? `${Math.round(p50)} ms` : "—" },
    { label: "p95", value: p95 !== null ? `${Math.round(p95)} ms` : "—" },
    { label: "p99", value: p99 !== null ? `${Math.round(p99)} ms` : "—" },
    { label: "Max", value: max !== null ? `${Math.round(max)} ms` : "—" },
    { label: "Spread (p95−p50)", value: spread !== null ? `${Math.round(spread)} ms` : "—" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="card p-4">
          <p className="text-[11px] uppercase tracking-wide text-[var(--color-graphite)]">{c.label}</p>
          <p className="font-mono-num text-xl font-semibold">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
