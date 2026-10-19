import { Quiz } from "../components/Quiz";
import { ClaimsTable } from "../components/ClaimsTable";

const SOURCES = [
  { label: "Optimum site", url: "https://www.getoptimum.xyz/" },
  { label: "Product", url: "https://www.getoptimum.xyz/product" },
  { label: "Docs — intro", url: "https://docs.getoptimum.xyz/docs/learn/overview/intro" },
  { label: "Docs — mump2p", url: "https://docs.getoptimum.xyz/docs/learn/overview/p2p" },
  { label: "Gateway", url: "https://getoptimum.github.io/optimum-gateway/versions/latest/" },
  { label: "Gateway metrics", url: "https://getoptimum.github.io/optimum-gateway/versions/latest/metrics" },
  { label: "Block stream", url: "https://getoptimum.github.io/optimum-gateway/versions/latest/block-stream" },
  { label: "Blog", url: "https://www.getoptimum.xyz/blog" },
  { label: "Flexnodes post", url: "https://www.getoptimum.xyz/blog/flexnodes-a-global-network-of-data-accelerators" },
  { label: "Beacon propagation launch", url: "https://www.getoptimum.xyz/blog/free-and-faster-ethereum-beacon-block-propagation" },
  { label: "Cost of Uncertainty (PBS)", url: "https://www.getoptimum.xyz/blog/the-cost-of-uncertainty-in-ethereums-pbs-hot-path" },
  { label: "Hoodi 6x results", url: "https://www.getoptimum.xyz/blog/behind-the-metrics-mump2ps-6x-latency-win-on-ethereum-hoodi-testnet" },
  { label: "Staking revenue study", url: "https://www.getoptimum.xyz/blog/optimizing-a-100b-market-effects-of-latency-reduction-on-eth-staking-revenue" },
  { label: "Paper (arXiv 2508.04833)", url: "https://arxiv.org/html/2508.04833v1" },
  { label: "Paper (arXiv 2603.20426)", url: "https://arxiv.org/abs/2603.20426" },
  { label: "X / Twitter", url: "https://x.com/get_optimum" },
  { label: "Discord", url: "https://discord.gg/getoptimum" },
  { label: "GitHub", url: "https://github.com/getoptimum" },
  { label: "Brand assets (link only)", url: "https://getoptimum.notion.site/Optimum-Brand-Assets-1a6fe54341398098843bc5847670e5ed" },
  { label: "Beacon APIs spec", url: "https://ethereum.github.io/beacon-APIs/" },
];

export function Method() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Method</h1>
      <p className="mt-2 text-[var(--color-graphite)]">
        How this site measures things, what the quiz tests, and why Optimum's own numbers are never plotted
        against ours.
      </p>

      <section className="mt-8 card p-5">
        <h2 className="font-semibold">Definitions</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li className="font-mono-num">slot start = genesis_time + slot × SECONDS_PER_SLOT</li>
          <li className="font-mono-num">delay = browser receive time − slot start</li>
        </ul>
      </section>

      <section className="mt-6 card p-5">
        <h2 className="font-semibold">Caveats</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
          <li>Measured at a public node as seen from your browser — includes your connection's latency to that node.</li>
          <li>Uses your device's clock unless a clock offset was successfully measured against a trusted time source.</li>
          <li>Fallback polling adds up to ~250 ms of quantisation versus the real-time event stream.</li>
          <li>
            This measures today's normal gossip path, <strong>not mump2p</strong> — Optimum's own propagation
            data isn't public.
          </li>
          <li>Game reward rules (points, streaks, cutoffs) are stylized and stated openly; they are not real MEV economics.</li>
          <li>"What-if" toggles shift real measurements for illustration — they are not measurements themselves.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">Why Optimum's numbers aren't plotted against ours</h2>
        <p className="mt-2 text-sm text-[var(--color-graphite)]">
          Optimum's published figures describe network propagation time (publisher → nodes). This site's
          metric is arrival time after slot start at one public node, as seen by a browser — a mix of proposer
          timing, propagation, and the visitor's own last-mile latency. They are different quantities, so
          Optimum's numbers appear here only as cited text.
        </p>
      </section>

      <section className="mt-6">
        <ClaimsTable />
      </section>

      <section className="mt-10">
        <Quiz />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Sources</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="card block px-4 py-2.5 text-sm underline"
            >
              {s.label}
            </a>
          ))}
        </div>
      </section>

      <p className="mt-10 text-xs text-[var(--color-graphite)]">
        Community build, not affiliated with, endorsed by, or sponsored by Optimum. Built by{" "}
        <a className="underline font-semibold" href="https://x.com/Pawan2001564157" target="_blank" rel="noreferrer">
          Pawan
        </a>
        .
      </p>
    </div>
  );
}
