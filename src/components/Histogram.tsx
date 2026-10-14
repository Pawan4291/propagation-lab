import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useStream } from "../hooks/useStream";
import { histogram } from "../lib/stats";

export function Histogram() {
  const { window: records } = useStream();
  const data = useMemo(() => histogram(records.map((r) => r.delayMs), 50), [records]);

  if (!data.length) {
    return (
      <div className="card flex h-56 items-center justify-center p-5 text-sm text-[var(--color-graphite)]">
        No blocks captured yet.
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold">Arrival histogram (50 ms bins)</h3>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#d3d6dc" strokeDasharray="3 3" />
            <XAxis dataKey="bin" tick={{ fontSize: 9 }} stroke="#3a3d44" />
            <YAxis tick={{ fontSize: 10 }} stroke="#3a3d44" allowDecimals={false} />
            <Bar dataKey="count" fill="#d3d6dc" stroke="#050506" strokeWidth={1} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
