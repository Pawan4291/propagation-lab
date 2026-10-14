import { useEffect, useRef, useState } from "react";
import { useStream } from "../hooks/useStream";

// A live ring showing ms elapsed since the current slot's start.
export function SlotClock({ size = 220 }: { size?: number }) {
  const { genesis, secPerSlot, clockOffsetMs } = useStream();
  const [elapsed, setElapsed] = useState(0);
  const [slot, setSlot] = useState<number | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (genesis === null) return;
    function tick() {
      const now = Date.now() + clockOffsetMs;
      const totalMs = now - genesis! * 1000;
      const slotMs = secPerSlot * 1000;
      const currentSlot = Math.floor(totalMs / slotMs);
      setSlot(currentSlot);
      setElapsed(totalMs - currentSlot * slotMs);
      raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [genesis, secPerSlot, clockOffsetMs]);

  const slotMs = secPerSlot * 1000;
  const frac = Math.min(1, elapsed / slotMs);
  const r = size / 2 - 10;
  const circumference = 2 * Math.PI * r;

  if (genesis === null) {
    return (
      <div
        className="flex items-center justify-center rounded-full border border-[var(--color-line)] text-xs text-[var(--color-graphite)]"
        style={{ width: size, height: size }}
      >
        loading clock…
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#d3d6dc" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#050506"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - frac)}
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono-num">
        <span className="text-2xl font-semibold">{Math.round(elapsed)} ms</span>
        <span className="text-xs text-[var(--color-graphite)]">slot {slot}</span>
      </div>
    </div>
  );
}
