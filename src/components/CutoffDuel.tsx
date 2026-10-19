import { useEffect, useMemo, useRef, useState } from "react";
import { useStream } from "../hooks/useStream";
import { duelPoints, bestCutoff } from "../lib/score";
import { margins } from "../lib/stats";
import { emitMascotReaction } from "./MascotHero";
import { ShareCard } from "./ShareCard";
import { NETWORKS } from "../lib/networks";

interface Best {
  bestPoints: number;
}

function loadBest(): Best {
  try {
    const raw = localStorage.getItem("pl:duelBest");
    return raw ? JSON.parse(raw) : { bestPoints: 0 };
  } catch {
    return { bestPoints: 0 };
  }
}

export function CutoffDuel() {
  const { genesis, secPerSlot, clockOffsetMs, window: records, network } = useStream();
  const slotMs = secPerSlot * 1000;
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [cutoff, setCutoff] = useState(Math.round(slotMs / 3));
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [lockedSlot, setLockedSlot] = useState<number | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [misses, setMisses] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [accel, setAccel] = useState(false);
  const [accelMs, setAccelMs] = useState(150);
  const [replayResult, setReplayResult] = useState<null | { points: number; missRate: number; margins: number[] }>(null);
  const [replayWhatIf, setReplayWhatIf] = useState<null | { points: number; missRate: number }>(null);
  const lastResolved = useRef<number | null>(null);
  const [best, setBest] = useState<Best>(loadBest());

  useEffect(() => {
    if (genesis === null) return;
    const id = window.setInterval(() => {
      const now = Date.now() + clockOffsetMs;
      setCurrentSlot(Math.floor((now - genesis * 1000) / slotMs));
    }, 100);
    return () => window.clearInterval(id);
  }, [genesis, clockOffsetMs, slotMs]);

  useEffect(() => {
    if (lockedSlot === null) return;
    const rec = records.find((r) => r.slot === lockedSlot);
    if (!rec || lastResolved.current === lockedSlot) return;
    lastResolved.current = lockedSlot;
    const pts = duelPoints(cutoff, rec.delayMs);
    setTotalPoints((p) => p + pts);
    setRounds((r) => r + 1);
    if (pts === 0) setMisses((m) => m + 1);
    emitMascotReaction(pts > cutoff / 150 ? "cheer" : pts > 0 ? "ok" : "oops");
    setLockedSlot(null);
  }, [records, lockedSlot, cutoff]);

  function lockLive() {
    if (currentSlot === null || lockedSlot !== null) return;
    if (records.some((r) => r.slot === currentSlot)) return;
    setLockedSlot(currentSlot);
  }

  const capturedArrivals = useMemo(() => records.map((r) => r.delayMs), [records]);

  function runReplay() {
    if (capturedArrivals.length < 10) return;
    let points = 0;
    let miss = 0;
    const realMargins = margins(capturedArrivals, cutoff, 0);
    for (const a of capturedArrivals) {
      const p = duelPoints(cutoff, a);
      points += p;
      if (p === 0) miss++;
    }
    setReplayResult({ points, missRate: miss / capturedArrivals.length, margins: realMargins });

    if (accel) {
      let wPoints = 0;
      let wMiss = 0;
      for (const a of capturedArrivals) {
        const shifted = Math.max(0, a - accelMs);
        const p = duelPoints(cutoff, shifted);
        wPoints += p;
        if (p === 0) wMiss++;
      }
      setReplayWhatIf({ points: wPoints, missRate: wMiss / capturedArrivals.length });
    } else {
      setReplayWhatIf(null);
    }

    if (points > best.bestPoints) {
      const next = { bestPoints: points };
      setBest(next);
      try {
        localStorage.setItem("pl:duelBest", JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  }

  function findBest() {
    if (capturedArrivals.length < 10) return;
    const b = bestCutoff(capturedArrivals, 500, 6000, 50);
    setCutoff(b.cutoff);
  }

  const isLocked = lockedSlot !== null;
  const alreadyArrived = currentSlot !== null && records.some((r) => r.slot === currentSlot);
  const missRateLive = rounds > 0 ? misses / rounds : 0;

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold">Cutoff Duel</h2>
      <p className="mt-1 text-sm text-[var(--color-graphite)]">
        Proposers and attesters hedge because block arrival is uncertain — waiting longer can mean more
        reward, but waiting too long means missing the cutoff (
        <a className="underline" href="https://www.getoptimum.xyz/blog/the-cost-of-uncertainty-in-ethereums-pbs-hot-path" target="_blank" rel="noreferrer">
          Optimum's "Cost of Uncertainty" post
        </a>
        ). Here: set a cutoff (500–6000 ms). If the real block arrives at or before it you score
        round(cutoff/100) points; later scores 0 and counts as a miss. Arrival times are real; the reward rule
                is this game's own, not real MEV economics.
      </p>
      <p className="mt-2 text-sm font-semibold">
        How to play: pick Live (play the current slot) or Replay (instant, over blocks you've captured).
        Move the slider to set your cutoff, lock it in or press Run replay, then compare points and miss rate.
        Tick "Accelerated what-if" to see how earlier arrivals would change your score.
      </p>

      <div className="mt-4 flex gap-2">
        <button onClick={() => setMode("live")} className={`btn-secondary px-4 py-1.5 text-sm ${mode === "live" ? "bg-black text-white" : ""}`}>
          Live
        </button>
        <button onClick={() => setMode("replay")} className={`btn-secondary px-4 py-1.5 text-sm ${mode === "replay" ? "bg-black text-white" : ""}`}>
          Replay ({capturedArrivals.length}/10 captured)
        </button>
      </div>

      <div className="mt-5">
        <label className="text-xs text-[var(--color-graphite)]">Cutoff (ms after slot start)</label>
        <input
          type="range"
          min={500}
          max={6000}
          step={50}
          value={cutoff}
          onChange={(e) => setCutoff(Number(e.target.value))}
          disabled={mode === "live" && isLocked}
          className="mt-1 w-full"
        />
        <span className="font-mono-num text-lg font-semibold">{cutoff} ms</span>
      </div>

      {mode === "live" ? (
        <div className="mt-4 flex items-center gap-3">
          <button onClick={lockLive} disabled={isLocked || alreadyArrived || currentSlot === null} className="btn-primary px-4 py-2 text-sm disabled:opacity-40">
            {isLocked ? "Locked — waiting for block…" : "Lock cutoff for this slot"}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={accel} onChange={(e) => setAccel(e.target.checked)} />
              Accelerated what-if
            </label>
            {accel && (
              <>
                <input type="range" min={0} max={500} value={accelMs} onChange={(e) => setAccelMs(Number(e.target.value))} />
                <span className="font-mono-num text-sm">{accelMs} ms earlier</span>
                <span className="rounded-full border border-black px-2 py-0.5 text-[10px] font-semibold">
                  WHAT-IF — shifts real measurements, not a measurement
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={runReplay} disabled={capturedArrivals.length < 10} className="btn-primary px-4 py-2 text-sm disabled:opacity-40">
              Run replay
            </button>
            <button onClick={findBest} disabled={capturedArrivals.length < 10} className="btn-secondary px-4 py-2 text-sm disabled:opacity-40">
              Find best cutoff for this window
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {mode === "live" ? (
          <>
            <Stat label="Total points" value={String(totalPoints)} />
            <Stat label="Rounds" value={String(rounds)} />
            <Stat label="Miss rate" value={`${(missRateLive * 100).toFixed(0)}%`} />
            <Stat label="Personal best" value={`${best.bestPoints} pts`} />
          </>
        ) : (
          <>
            <Stat label="Replay points" value={replayResult ? String(replayResult.points) : "—"} />
            <Stat label="Miss rate" value={replayResult ? `${(replayResult.missRate * 100).toFixed(0)}%` : "—"} />
            <Stat label="Smallest margin" value={replayResult ? `${Math.min(...replayResult.margins).toFixed(0)} ms` : "—"} />
            <Stat label="Personal best" value={`${best.bestPoints} pts`} />
          </>
        )}
      </div>

      {mode === "replay" && replayWhatIf && replayResult && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-[var(--color-paper-2)] p-3">
            <p className="font-semibold">Real</p>
            <p className="font-mono-num">{replayResult.points} pts · {(replayResult.missRate * 100).toFixed(0)}% miss</p>
          </div>
          <div className="rounded-xl bg-[var(--color-paper-2)] p-3">
            <p className="font-semibold">What-if (−{accelMs} ms)</p>
            <p className="font-mono-num">{replayWhatIf.points} pts · {(replayWhatIf.missRate * 100).toFixed(0)}% miss</p>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--color-graphite)]">
        Most blocks usually arrive well before a ⅓-slot cutoff, so the interesting part is the spread of
        margins (cutoff − arrival), not just the average.
      </p>

      <ShareCard
        headline="Cutoff Duel"
        resultLine={mode === "live" ? `${totalPoints} pts over ${rounds} rounds` : `${replayResult?.points ?? 0} pts in replay`}
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
