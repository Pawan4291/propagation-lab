import { useEffect, useRef, useState } from "react";
import { useStream } from "../hooks/useStream";
import { useRounds } from "../hooks/useRounds";
import { guessPoints, nextStreak, streakMultiplier } from "../lib/score";
import { percentile } from "../lib/stats";
import { emitMascotReaction } from "./MascotHero";
import { NETWORKS } from "../lib/networks";
import { ShareCard } from "./ShareCard";

interface Best {
  bestScore: number;
  bestAvgError: number | null;
}

function loadBest(): Best {
  try {
    const raw = localStorage.getItem("pl:guessBest");
    return raw ? JSON.parse(raw) : { bestScore: 0, bestAvgError: null };
  } catch {
    return { bestScore: 0, bestAvgError: null };
  }
}

export function GuessGame() {
  const { genesis, secPerSlot, clockOffsetMs, window: records, network } = useStream();
  const { rounds, addRound, resolveRound } = useRounds();
  const slotMs = secPerSlot * 1000;

  const [guessMs, setGuessMs] = useState(Math.round(slotMs / 3));
  const [lockedSlot, setLockedSlot] = useState<number | null>(null);
  const [currentSlot, setCurrentSlot] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [best, setBest] = useState<Best>(loadBest());
  const lastResolvedSlot = useRef<number | null>(null);

  // Track real current slot off the live clock.
  useEffect(() => {
    if (genesis === null) return;
    const id = window.setInterval(() => {
      const now = Date.now() + clockOffsetMs;
      const s = Math.floor((now - genesis * 1000) / slotMs);
      setCurrentSlot(s);
    }, 100);
    return () => window.clearInterval(id);
  }, [genesis, clockOffsetMs, slotMs]);

  // Resolve rounds when a new real block arrives for a locked slot.
  useEffect(() => {
    if (lockedSlot === null) return;
    const rec = records.find((r) => r.slot === lockedSlot);
    if (!rec || lastResolvedSlot.current === lockedSlot) return;
    lastResolvedSlot.current = lockedSlot;
    const error = Math.abs(guessMs - rec.delayMs);
    const points = guessPoints(error);
    const mult = streakMultiplier(streak);
    const finalPoints = Math.round(points * mult);
    resolveRound(lockedSlot, rec.delayMs, error, finalPoints);
    setScore((s) => s + finalPoints);
    setStreak((st) => nextStreak(st, error));
    emitMascotReaction(error <= 100 ? "cheer" : error <= 500 ? "ok" : "oops");
    setLockedSlot(null);
  }, [records, lockedSlot, guessMs, streak, resolveRound]);

  function lockIn() {
    if (currentSlot === null || lockedSlot !== null) return;
    // only valid if no block recorded yet for this slot
    if (records.some((r) => r.slot === currentSlot)) return;
    setLockedSlot(currentSlot);
    addRound({ slot: currentSlot, guessMs, actualMs: null, errorMs: null, points: null, lockedAt: Date.now() });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setGuessMs((g) => Math.max(0, g - 50));
    if (e.key === "ArrowRight") setGuessMs((g) => Math.min(slotMs, g + 50));
    if (e.key === "Enter") lockIn();
  }

  const resolvedRounds = rounds.filter((r) => r.errorMs !== null);
  const avgError = resolvedRounds.length
    ? resolvedRounds.reduce((a, r) => a + (r.errorMs ?? 0), 0) / resolvedRounds.length
    : null;

  useEffect(() => {
    if (!resolvedRounds.length) return;
    const improved = score > best.bestScore || (avgError !== null && (best.bestAvgError === null || avgError < best.bestAvgError));
    if (improved) {
      const next = { bestScore: Math.max(score, best.bestScore), bestAvgError: avgError };
      setBest(next);
      try {
        localStorage.setItem("pl:guessBest", JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, avgError]);

  const windowDelays = records.slice(-100).map((r) => r.delayMs);
  const p50 = percentile(windowDelays, 50);
  const p95 = percentile(windowDelays, 95);

  const isLocked = lockedSlot !== null;
  const alreadyArrived = currentSlot !== null && records.some((r) => r.slot === currentSlot);

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold">Guess the Block</h2>
      <p className="mt-1 text-sm text-[var(--color-graphite)]">
        A round = one slot. Place your marker for when you think the next real block will land, then lock in
        before it arrives. Error = |guess − actual|. Points = max(0, 100 − ⌊error/20⌋), boosted by your streak
        multiplier. Arrival times are real; the scoring rule is this game's own.
      </p>

      <div
        className="mt-5 cursor-grow"
        tabIndex={0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={slotMs}
        aria-valuenow={guessMs}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center justify-between text-xs font-mono-num text-[var(--color-graphite)]">
          <span>0 ms</span>
          <span>slot length {slotMs} ms</span>
        </div>
        <input
          type="range"
          min={0}
          max={slotMs}
          step={10}
          value={guessMs}
          disabled={isLocked}
          onChange={(e) => setGuessMs(Number(e.target.value))}
          className="mt-1 w-full"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono-num text-lg font-semibold">{guessMs} ms</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHint((h) => !h)} className="btn-secondary px-3 py-1.5 text-xs">
              {showHint ? "Hide hint" : "Hint"}
            </button>
            <button
              onClick={lockIn}
              disabled={isLocked || alreadyArrived || currentSlot === null}
              className="btn-primary px-4 py-1.5 text-sm disabled:opacity-40"
            >
              {isLocked ? "Locked — waiting for block…" : "Lock in"}
            </button>
          </div>
        </div>
        {showHint && (
          <p className="mt-2 text-xs text-[var(--color-graphite)] font-mono-num">
            Current window real p50: {p50 !== null ? Math.round(p50) : "—"} ms · p95: {p95 !== null ? Math.round(p95) : "—"} ms
          </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Score" value={String(score)} />
        <Stat label="Streak" value={`${streak} (×${streakMultiplier(streak).toFixed(1)})`} />
        <Stat label="Avg error" value={avgError !== null ? `${avgError.toFixed(0)} ms` : "—"} />
        <Stat label="Personal best" value={`${best.bestScore} pts`} />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Guess</th>
              <th>Actual</th>
              <th>Error</th>
              <th>Points</th>
              <th>Explorer</th>
            </tr>
          </thead>
          <tbody>
            {[...rounds]
              .slice(-20)
              .reverse()
              .map((r) => (
                <tr key={r.slot}>
                  <td className="font-mono-num">{r.slot}</td>
                  <td className="font-mono-num">{r.guessMs} ms</td>
                  <td className="font-mono-num">{r.actualMs !== null ? `${Math.round(r.actualMs)} ms` : "…"}</td>
                  <td className="font-mono-num">{r.errorMs !== null ? `${Math.round(r.errorMs)} ms` : "—"}</td>
                  <td className="font-mono-num">{r.points ?? "—"}</td>
                  <td>
                    <a className="underline" href={NETWORKS[network].explorer(r.slot)} target="_blank" rel="noreferrer">
                      view
                    </a>
                  </td>
                </tr>
              ))}
            {rounds.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-[var(--color-graphite)]">
                  No rounds yet — lock in a guess to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ShareCard
        headline="Guess the Block"
        resultLine={`Score ${score} · avg error ${avgError !== null ? avgError.toFixed(0) : "—"} ms`}
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
