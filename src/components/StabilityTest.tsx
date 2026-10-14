import { useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useStream } from "../hooks/useStream";
import { NETWORKS } from "../lib/networks";
import { pingGenesis } from "../lib/beacon";
import { stdev } from "../lib/stats";

interface BestResult {
  steadiness: number;
  median: number;
  at: number;
}

export function StabilityTest({ latencyThreshold }: { latencyThreshold: number }) {
  const { network } = useStream();
  const [samples, setSamples] = useState<{ i: number; ms: number }[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const stopRef = useRef(false);
  const [best, setBest] = useState<BestResult | null>(() => {
    try {
      const raw = localStorage.getItem("pl:steadyHands");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  async function start() {
    setSamples([]);
    setDone(false);
    setRunning(true);
    stopRef.current = false;
    const net = NETWORKS[network];
    for (let i = 0; i < 30 && !stopRef.current; i++) {
      try {
        const ms = await pingGenesis(net);
        setSamples((prev) => [...prev, { i: i + 1, ms }]);
      } catch {
        /* skip failed ping */
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    setRunning(false);
    setDone(true);
  }

  const values = samples.map((s) => s.ms);
  const med = values.length ? [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] : null;
  const jit = stdev(values);
  const worst = values.length ? Math.max(...values) : null;
  const steadiness = values.length && med !== null ? (values.filter((v) => v <= med * 1.5).length / values.length) * 100 : null;

  function finalizeBest() {
    if (steadiness === null || med === null) return;
    if (!best || steadiness > best.steadiness) {
      const next = { steadiness, median: med, at: Date.now() };
      setBest(next);
      try {
        localStorage.setItem("pl:steadyHands", JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }

  if (done && steadiness !== null) finalizeBest();

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Steady Hands — 60 second challenge</h3>
        <button onClick={start} disabled={running} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
          {running ? `Pinging… (${samples.length}/30)` : done ? "Replay" : "Start"}
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--color-graphite)]">
        Every 2 seconds, one real request goes to the public beacon node's genesis endpoint and we record the
        round-trip time. This measures your connection to a public node, not a Flexnode.
      </p>
      <div className="mt-4 h-40 w-full">
        {values.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={samples}>
              <CartesianGrid stroke="#d3d6dc" strokeDasharray="3 3" />
              <XAxis dataKey="i" tick={{ fontSize: 10 }} stroke="#3a3d44" />
              <YAxis tick={{ fontSize: 10 }} stroke="#3a3d44" />
              <Line type="monotone" dataKey="ms" stroke="#050506" dot={{ r: 2 }} strokeWidth={1.5} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-graphite)]">
            Press Start to begin 30 real pings.
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Median RTT" value={med !== null ? `${med.toFixed(0)} ms` : "—"} />
        <Stat label="Jitter" value={jit !== null ? `${jit.toFixed(0)} ms` : "—"} />
        <Stat label="Worst spike" value={worst !== null ? `${worst.toFixed(0)} ms` : "—"} />
        <Stat label="Steadiness (pings within 1.5× your median)" value={steadiness !== null ? `${steadiness.toFixed(0)}%` : "—"} />
      </div>
      {best && (
        <p className="mt-3 text-xs text-[var(--color-graphite)] font-mono-num">
          Personal best steadiness: {best.steadiness.toFixed(0)}% (median {best.median.toFixed(0)} ms)
        </p>
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
