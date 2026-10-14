import { useState } from "react";
import { useStream } from "../hooks/useStream";
import { NETWORKS } from "../lib/networks";
import { measureLatency, measureDownload, measureUpload, getConnectionInfo } from "../lib/netprobe";

export interface ProbeResult {
  latencyMs?: number;
  jitterMs?: number;
  downMbps?: number;
  upMbps?: number;
  stabilityPct?: number;
  connection?: { effectiveType?: string; downlink?: number; rtt?: number } | null;
  speedUnreachable?: boolean;
  ranAt: number;
}

export function ProbeRunner({
  full = false,
  onComplete,
}: {
  full?: boolean;
  onComplete: (r: ProbeResult) => void;
}) {
  const { network, window: records } = useStream();
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState("");
  const [result, setResult] = useState<ProbeResult | null>(null);
  const [errorNote, setErrorNote] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setErrorNote(null);
    const net = NETWORKS[network];
    const r: ProbeResult = { ranAt: Date.now() };

    try {
      setStep("Measuring latency (10 requests)…");
      const lat = await measureLatency(net, 10);
      r.latencyMs = lat.median;
      r.jitterMs = lat.jitter;
    } catch {
      setErrorNote("Latency endpoint unreachable from your network.");
      setRunning(false);
      setStep("");
      return;
    }

    if (full) {
      try {
        setStep("Measuring download speed…");
        r.downMbps = await measureDownload();
      } catch {
        r.speedUnreachable = true;
      }
      try {
        setStep("Measuring upload speed…");
        r.upMbps = await measureUpload();
      } catch {
        r.speedUnreachable = true;
      }
      setStep("Checking stream stability…");
      const slotsSpan = records.length > 1 ? records[records.length - 1].slot - records[0].slot + 1 : 0;
      r.stabilityPct = slotsSpan > 0 ? Math.min(100, (records.length / slotsSpan) * 100) : undefined;
      r.connection = getConnectionInfo();
      if (r.speedUnreachable) {
        setErrorNote("Speed endpoints unreachable from your network — showing latency + stability only.");
      }
    }

    setStep("");
    setRunning(false);
    setResult(r);
    onComplete(r);
  }

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{full ? "Run my full device check" : "Quick latency check"}</h3>
        <button onClick={run} disabled={running} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
          {running ? "Running…" : result ? "Run again" : "Run check"}
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--color-graphite)]">
        Real measurements against the public {NETWORKS[network].label} beacon node and Cloudflare's speed
        endpoints. {records.length < 5 ? "Blocks captured so far: " + records.length + "." : ""}
      </p>
      {running && <p className="mt-3 font-mono-num text-sm">{step}</p>}
      {errorNote && <p className="mt-3 text-sm text-[var(--color-graphite)]">{errorNote}</p>}
      {result && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Latency (median)" value={result.latencyMs !== undefined ? `${result.latencyMs.toFixed(0)} ms` : "—"} />
          <Stat label="Jitter" value={result.jitterMs !== undefined ? `${result.jitterMs.toFixed(0)} ms` : "—"} />
          {full && <Stat label="Download" value={result.downMbps !== undefined ? `${result.downMbps.toFixed(1)} Mbps` : "—"} />}
          {full && <Stat label="Upload" value={result.upMbps !== undefined ? `${result.upMbps.toFixed(1)} Mbps` : "—"} />}
          {full && <Stat label="Stability" value={result.stabilityPct !== undefined ? `${result.stabilityPct.toFixed(0)}%` : "—"} />}
          {full && result.connection && (
            <Stat label="Browser estimate" value={`${result.connection.effectiveType ?? "?"} · ${result.connection.downlink ?? "?"}Mbps`} />
          )}
        </div>
      )}
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
