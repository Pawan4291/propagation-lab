import { Link } from "react-router-dom";
import { FlexDiagram } from "./FlexDiagram";
import { ProbeRunner, ProbeResult } from "./ProbeRunner";
import { useState } from "react";

export function FlexTeaser() {
  const [quick, setQuick] = useState<ProbeResult | null>(null);

  return (
    <section className="bg-[var(--color-silver-hi)] py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Flexnode Lab, teased</h2>
        <p className="mt-3 max-w-3xl text-[var(--color-graphite)]">
          Optimum describes <strong>Flexnodes</strong> as nodes that RLNC-encode block data and forward coded
          pieces immediately, then re-mix pieces they receive — validators pay for faster delivery, operators
          earn rewards in a "Latency Marketplace." Today it's a controlled testnet for Optimum's validator
          partners; the long-term goal is "any internet-connected device." Joining is via the blog's mailing
          list only. Source:{" "}
          <a
            className="underline"
            href="https://www.getoptimum.xyz/blog/flexnodes-a-global-network-of-data-accelerators"
            target="_blank"
            rel="noreferrer"
          >
            Flexnodes blog post
          </a>
          .
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <FlexDiagram />
          <ProbeRunner onComplete={setQuick} />
        </div>

        {quick && (
          <p className="mt-4 font-mono-num text-sm">
            Latency check: median {quick.latencyMs?.toFixed(0)} ms, jitter {quick.jitterMs?.toFixed(0)} ms.
          </p>
        )}

        <div className="mt-6 card p-5">
          <p className="text-sm">
            <strong>Status:</strong> Flexnodes are currently a controlled testnet. You can't run one from this
            site. Interest list:{" "}
            <a
              className="underline"
              href="https://www.getoptimum.xyz/blog/flexnodes-a-global-network-of-data-accelerators"
              target="_blank"
              rel="noreferrer"
            >
              the blog
            </a>
            . This is a community tool — not an Optimum program.
          </p>
        </div>

        <Link to="/flexnode" className="btn-secondary mt-6 inline-block px-5 py-2.5 text-sm">
          Open the full Flexnode Lab →
        </Link>
      </div>
    </section>
  );
}
