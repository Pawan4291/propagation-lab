import { emitMascotReaction } from "./MascotHero";
import { useEffect, useRef } from "react";

export interface Thresholds {
  latencyMs: number;
  jitterMs: number;
  downMbps: number;
  upMbps: number;
  stabilityPct: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  latencyMs: 150,
  jitterMs: 50,
  downMbps: 25,
  upMbps: 10,
  stabilityPct: 95,
};

interface Measured {
  latencyMs?: number;
  jitterMs?: number;
  downMbps?: number;
  upMbps?: number;
  stabilityPct?: number;
}

export function ReadinessChecklist({
  thresholds,
  setThresholds,
  measured,
}: {
  thresholds: Thresholds;
  setThresholds: (t: Thresholds) => void;
  measured: Measured;
}) {
  const rows: { key: keyof Thresholds; label: string; unit: string; value?: number; pass: (v: number, t: number) => boolean }[] = [
    { key: "latencyMs", label: "Latency ≤", unit: "ms", value: measured.latencyMs, pass: (v, t) => v <= t },
    { key: "jitterMs", label: "Jitter ≤", unit: "ms", value: measured.jitterMs, pass: (v, t) => v <= t },
    { key: "downMbps", label: "Download ≥", unit: "Mbps", value: measured.downMbps, pass: (v, t) => v >= t },
    { key: "upMbps", label: "Upload ≥", unit: "Mbps", value: measured.upMbps, pass: (v, t) => v >= t },
    { key: "stabilityPct", label: "Stability ≥", unit: "%", value: measured.stabilityPct, pass: (v, t) => v >= t },
  ];

  const passed = rows.filter((r) => r.value !== undefined && r.pass(r.value, thresholds[r.key])).length;
  const announced = useRef(-1);

  useEffect(() => {
    const anyMeasured = rows.some((r) => r.value !== undefined);
    if (!anyMeasured) return;
    if (announced.current === passed) return;
    announced.current = passed;
    emitMascotReaction(passed === 5 ? "cheer" : passed >= 3 ? "ok" : "oops");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passed]);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Readiness checklist</h3>
        <span className="font-mono-num text-sm font-semibold">{passed} / 5 checks passed</span>
      </div>
      <p className="mt-1 text-xs text-[var(--color-graphite)]">
        These are your own thresholds — not Optimum's requirements. Edit them freely.
      </p>
      <div className="mt-4 space-y-3">
        {rows.map((r) => {
          const ok = r.value !== undefined && r.pass(r.value, thresholds[r.key]);
          return (
            <div key={r.key} className="flex flex-wrap items-center gap-3 border-b border-[var(--color-line)] pb-3 last:border-0">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-black text-xs"
                aria-hidden
              >
                {r.value === undefined ? "–" : ok ? "✓" : "✕"}
              </span>
              <span className="w-28 text-sm">{r.label}</span>
              <input
                type="number"
                value={thresholds[r.key]}
                onChange={(e) => setThresholds({ ...thresholds, [r.key]: Number(e.target.value) })}
                className="w-20 rounded-md border border-[var(--color-line)] px-2 py-1 text-sm font-mono-num"
              />
              <span className="text-xs text-[var(--color-graphite)]">{r.unit}</span>
              <span className="ml-auto font-mono-num text-sm">
                {r.value !== undefined ? `measured: ${r.value.toFixed(1)} ${r.unit}` : "not measured yet"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
