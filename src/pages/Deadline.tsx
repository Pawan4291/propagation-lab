import { CutoffDuel } from "../components/CutoffDuel";

export function Deadline() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Deadline Lab</h1>
      <p className="mt-2 max-w-2xl text-[var(--color-graphite)]">
        Cutoff Duel — play it live against the current slot, or replay it instantly over real blocks you've
        already captured this session.
      </p>
      <div className="mt-8">
        <CutoffDuel />
      </div>
    </div>
  );
}
