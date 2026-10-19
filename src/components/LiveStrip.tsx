import { useMemo } from "react";
import { useStream } from "../hooks/useStream";
import { percentile } from "../lib/stats";

export function LiveStrip() {
  const { window: records } = useStream();

  const { last, p50, count } = useMemo(() => {
    const last50 = records.slice(-50).map((r) => r.delayMs);
    return {
      last: records[records.length - 1] ?? null,
      p50: percentile(last50, 50),
      count: records.length,
    };
  }, [records]);

  if (!last) {
    return (
      <div className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm text-[var(--color-graphite)] font-mono-num">
        Waiting for the next block, about 12s…
      </div>
    );
  }

  return (
    <div className="flex w-fit max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-3xl border border-[var(--color-line)] bg-white px-5 py-2.5 text-center text-sm font-mono-num">
      <span>
        Last block: <strong>+{Math.round(last.delayMs)} ms</strong> after slot start
      </span>

      <span>
        Median of last 50: <strong>{p50 !== null ? Math.round(p50) : "—"} ms</strong>
      </span>

      <span>
        Blocks seen: <strong>{count}</strong>
      </span>
    </div>
  );
}
