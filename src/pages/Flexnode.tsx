import { useState } from "react";
import { FlexDiagram } from "../components/FlexDiagram";
import { ProbeRunner, ProbeResult } from "../components/ProbeRunner";
import { ReadinessChecklist, DEFAULT_THRESHOLDS, Thresholds } from "../components/ReadinessChecklist";
import { StabilityTest } from "../components/StabilityTest";
import { ShareCard } from "../components/ShareCard";
import { useStream } from "../hooks/useStream";
import { NETWORKS } from "../lib/networks";
import { percentile } from "../lib/stats";

interface Run {
  time: string;
  latency?: number;
  down?: number;
  up?: number;
  steadiness?: number;
}

export function Flexnode() {
  const { window: records, network } = useStream();
  const [thresholds, setThresholds] = useState<Thresholds>(DEFAULT_THRESHOLDS);
  const [measured, setMeasured] = useState<ProbeResult>({ ranAt: 0 });
  const [runs, setRuns] = useState<Run[]>([]);

  function onProbeComplete(r: ProbeResult) {
    setMeasured(r);
    setRuns((prev) => [
      ...prev,
      {
        time: new Date(r.ranAt).toLocaleTimeString(),
        latency: r.latencyMs,
        down: r.downMbps,
        up: r.upMbps,
        steadiness: r.stabilityPct,
      },
    ]);
  }

  const delays = records.slice(-100).map((r) => r.delayMs);
  const p50 = percentile(delays, 50);
  const p95 = percentile(delays, 95);
  const spread = p50 !== null && p95 !== null ? p95 - p50 : null;


  const passed = [
    measured.latencyMs !== undefined && measured.latencyMs <= thresholds.latencyMs,
    measured.jitterMs !== undefined && measured.jitterMs <= thresholds.jitterMs,
    measured.downMbps !== undefined && measured.downMbps >= thresholds.downMbps,
    measured.upMbps !== undefined && measured.upMbps >= thresholds.upMbps,
    measured.stabilityPct !== undefined && measured.stabilityPct >= thresholds.stabilityPct,
  ].filter(Boolean).length;

  function copyResults() {
    const text = runs.map((r) => JSON.stringify(r)).join("\n");
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(runs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flexnode-lab-runs.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Flexnode Lab</h1>
      <p className="mt-2 max-w-3xl text-[var(--color-graphite)]">
        Optimum's <strong>Flexnodes</strong> RLNC-encode block data and forward coded pieces immediately, then
        re-mix pieces they receive — validators pay for faster delivery, operators earn rewards in a "Latency
        Marketplace." Today it's a controlled testnet for validator partners; long term the goal is "any
        internet-connected device." Source:{" "}
        <a className="underline" href="https://www.getoptimum.xyz/blog/flexnodes-a-global-network-of-data-accelerators" target="_blank" rel="noreferrer">
          Flexnodes blog
        </a>
        . This page lets you measure your own connection — it does not run a Flexnode.
      </p>

      <div className="mt-8">
        <FlexDiagram />
      </div>

      <h2 className="mt-12 text-2xl font-semibold">Activity 1 — Full device check</h2>
      <p className="mt-1 text-sm text-[var(--color-graphite)]">How to use: it runs automatically. Wait ~15 s for your latency, jitter, download and upload. Edit the checklist numbers to set your own targets, then press Run again to retest.</p>
      <div className="mt-4 space-y-6">
        <ProbeRunner full onComplete={onProbeComplete} />
        <ReadinessChecklist thresholds={thresholds} setThresholds={setThresholds} measured={measured} />
      </div>

      <h2 className="mt-12 text-2xl font-semibold">Activity 2 — Steady Hands</h2>
      <p className="mt-1 text-sm text-[var(--color-graphite)]">How to use: keep this page open for 60 seconds while it pings the network. The flatter your line, the steadier your connection. Press Replay to beat your best.</p>
      <div className="mt-4">
        <StabilityTest latencyThreshold={thresholds.latencyMs} />
      </div>

      <h2 className="mt-12 text-2xl font-semibold">Activity 3 — Compare to the chain</h2>
      <p className="mt-1 text-sm text-[var(--color-graphite)]">How to use: open Monitor first and let it collect blocks. Then compare your jitter with how much real block arrival times vary.</p>
      <div className="card mt-4 p-5">
        {delays.length === 0 ? (
          <p className="text-sm text-[var(--color-graphite)]">Waiting for blocks…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Chain p50" value={p50 !== null ? `${Math.round(p50)} ms` : "—"} />
            <Stat label="Chain p95" value={p95 !== null ? `${Math.round(p95)} ms` : "—"} />
            <Stat label="Chain spread" value={spread !== null ? `${Math.round(spread)} ms` : "—"} />
            <Stat label="Your median RTT / jitter" value={measured.latencyMs !== undefined ? `${measured.latencyMs.toFixed(0)} / ${(measured.jitterMs ?? 0).toFixed(0)} ms` : "—"} />
          </div>
        )}
        <p className="mt-3 text-xs text-[var(--color-graphite)]">
          Flexnodes aim to shrink variance like this across the network — this comparison is illustrative, not
          a Flexnode measurement.
        </p>
      </div>

      <h2 className="mt-12 text-2xl font-semibold">Your runs</h2>
      <div className="card mt-4 p-5">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Latency</th>
                <th>Down</th>
                <th>Up</th>
                <th>Steadiness</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r, i) => (
                <tr key={i}>
                  <td className="font-mono-num">{r.time}</td>
                  <td className="font-mono-num">{r.latency !== undefined ? `${r.latency.toFixed(0)} ms` : "—"}</td>
                  <td className="font-mono-num">{r.down !== undefined ? `${r.down.toFixed(1)} Mbps` : "—"}</td>
                  <td className="font-mono-num">{r.up !== undefined ? `${r.up.toFixed(1)} Mbps` : "—"}</td>
                  <td className="font-mono-num">{r.steadiness !== undefined ? `${r.steadiness.toFixed(0)}%` : "—"}</td>
                </tr>
              ))}
              {runs.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-[var(--color-graphite)]">
                    Run the device check above to log your first run.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={copyResults} disabled={!runs.length} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">
            Copy my results
          </button>
          <button onClick={downloadJSON} disabled={!runs.length} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">
            Download JSON
          </button>
        </div>
      </div>

      <div className="card mt-8 p-5">
        <p className="text-sm">
          <strong>Status:</strong> Flexnodes are currently a controlled testnet. You can't run one from this
          site. Interest list:{" "}
          <a className="underline" href="https://www.getoptimum.xyz/blog/flexnodes-a-global-network-of-data-accelerators" target="_blank" rel="noreferrer">
            the blog
          </a>
          . Community tool — not an Optimum program. No earnings, APR, reward or token numbers are shown here.
        </p>
      </div>

      <ShareCard
        headline="Flexnode Lab device check"
        resultLine={`${passed}/5 checks passed · steadiness ${measured.stabilityPct !== undefined ? measured.stabilityPct.toFixed(0) + "%" : "—"}`}
        network={NETWORKS[network].label}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[var(--color-paper-2)] p-3">
      <p className="text-[11px] uppercase tracking-wide text-[var(--color-graphite)]">{label}</p>
      <p className="font-mono-num text-lg font-semibold">{value}</p>
    </div>
  );
}
