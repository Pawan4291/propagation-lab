import { SlotClock } from "../components/SlotClock";
import { GuessGame } from "../components/GuessGame";
import { StatsCards } from "../components/StatsCards";
import { LatencyChart } from "../components/LatencyChart";
import { Histogram } from "../components/Histogram";
import { BlocksTable } from "../components/BlocksTable";

export function Monitor() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Monitor</h1>
      <p className="mt-2 max-w-2xl text-[var(--color-graphite)]">
        Live analytics over real beacon blocks, plus Guess the Block below.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <div className="flex justify-center lg:justify-start">
          <SlotClock />
        </div>
        <GuessGame />
      </div>

      <div className="mt-12 space-y-6">
        <StatsCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <LatencyChart />
          <Histogram />
        </div>
        <BlocksTable />
      </div>
    </div>
  );
}
