import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { useStream } from "../hooks/useStream";
import { percentile } from "../lib/stats";

export function LatencyChart() {
  const { window: records } = useStream();

  const data = useMemo(() => {
    const last = records.slice(-100);
    return last.map((r, i) => {
      const windowSlice = last.slice(Math.max(0, i - 19), i + 1).map((x) => x.delayMs);
      return {
        slot: r.slot,
        delay: Math.round(r.delayMs),
        p50: Math.round(percentile(windowSlice, 50) ?? r.delayMs),
        p95: Math.round(percentile(windowSlice, 95) ?? r.delayMs),
      };
    });
  }, [records]);

  if (!data.length) {
    return (
      <div className="card flex h-64 items-center justify-center p-5 text-sm text-[var(--color-graphite)]">
        Waiting for the next block, about 12s…
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold">Latency — last {data.length} blocks</h3>
      <p className="text-xs text-[var(--color-graphite)]">p50 solid, p95 dashed (rolling window of 20)</p>
      <div className="mt-3 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#d3d6dc" strokeDasharray="3 3" />
            <XAxis dataKey="slot" tick={{ fontSize: 10 }} stroke="#3a3d44" />
            <YAxis tick={{ fontSize: 10 }} stroke="#3a3d44" />
            <Tooltip contentStyle={{ background: "#fff", border: "1px solid #c4c8cf", fontSize: 12 }} />
            <Line type="monotone" dataKey="delay" stroke="#aeb3bc" dot={{ r: 2, stroke: "#050506", strokeWidth: 1, fill: "#aeb3bc" }} strokeWidth={0} isAnimationActive={false} />
            <Line type="monotone" dataKey="p50" stroke="#050506" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line type="monotone" dataKey="p95" stroke="#3a3d44" strokeDasharray="6 4" dot={false} strokeWidth={1.5} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
