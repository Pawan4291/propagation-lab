const CLAIMS = [
  {
    claim: "~150 ms average block propagation on Hoodi vs ~1 s for GossipSub",
    source: { label: "Hoodi 6x results blog", url: "https://www.getoptimum.xyz/blog/behind-the-metrics-mump2ps-6x-latency-win-on-ethereum-hoodi-testnet" },
  },
  {
    claim: "6–20× faster block/blob delivery and ~90–95% bandwidth reduction vs GossipSub",
    source: { label: "getoptimum.xyz homepage", url: "https://www.getoptimum.xyz/" },
  },
  {
    claim: "Benchmark network p50 ≈ 66 ms / p95 ≈ 179 ms, ~7× lower variance",
    source: { label: "\"Cost of Uncertainty\" PBS post", url: "https://www.getoptimum.xyz/blog/the-cost-of-uncertainty-in-ethereums-pbs-hot-path" },
  },
];

export function ClaimsTable() {
  return (
    <div className="card p-5">
      <h3 className="font-semibold">Optimum's published figures</h3>
      <p className="mt-1 text-xs text-[var(--color-graphite)]">
        Each row is Optimum's claim, measured differently from this site (see §7 in Method below) — cited as
        text only, never plotted against our measurements.
      </p>
      <ul className="mt-3 space-y-3">
        {CLAIMS.map((c) => (
          <li key={c.claim} className="rounded-xl bg-[var(--color-paper-2)] p-3 text-sm">
            <p>{c.claim}</p>
            <p className="mt-1 text-xs text-[var(--color-graphite)]">
              Optimum's claim, different measurement —{" "}
              <a className="underline" href={c.source.url} target="_blank" rel="noreferrer">
                {c.source.label}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
