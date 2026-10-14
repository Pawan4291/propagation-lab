export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-[var(--color-silver)]">
      <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-[var(--color-graphite)] sm:px-6">
        <p className="font-semibold text-[var(--color-ink)]">Propagation Lab</p>
        <p className="mt-2 max-w-2xl">
          A community build exploring Ethereum's real block timing. Not affiliated with, endorsed by, or
          sponsored by Optimum. Optimum's published figures appear only as cited text — see{" "}
          <a className="underline" href="/method">
            Method
          </a>{" "}
          for sources and caveats. No data is simulated: every timing number comes from a beacon node event
          received by your browser, or a measurement your browser ran.
        </p>
        <p className="mt-4">
          Built by <strong>Pawan4291</strong> ·{" "}
          <a className="underline" href="https://github.com/Pawan4291" target="_blank" rel="noreferrer">
            github.com/Pawan4291
          </a>
        </p>
        <p className="mt-2 text-xs">
          Optimum:{" "}
          <a className="underline" href="https://www.getoptimum.xyz/" target="_blank" rel="noreferrer">
            getoptimum.xyz
          </a>{" "}
          ·{" "}
          <a className="underline" href="https://x.com/get_optimum" target="_blank" rel="noreferrer">
            X
          </a>{" "}
          ·{" "}
          <a className="underline" href="https://discord.gg/getoptimum" target="_blank" rel="noreferrer">
            Discord
          </a>{" "}
          ·{" "}
          <a className="underline" href="https://github.com/getoptimum" target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
