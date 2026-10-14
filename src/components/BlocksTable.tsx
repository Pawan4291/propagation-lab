import { useStream } from "../hooks/useStream";
import { NETWORKS } from "../lib/networks";
import { toCSV, downloadText } from "../lib/csv";

export function BlocksTable() {
  const { window: records, network, source } = useStream();
  const last15 = [...records].slice(-15).reverse();

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">Last 15 blocks</h3>
        <button
          onClick={() => downloadText(`propagation-lab-${network}.csv`, toCSV(records))}
          disabled={!records.length}
          className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
        >
          Download CSV
        </button>
      </div>
      {source === "proxy" && (
        <p className="mt-2 text-xs text-[var(--color-graphite)]">Measured via proxy — adds latency.</p>
      )}
      <div className="mt-3 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Slot</th>
              <th>Delay</th>
              <th>Received</th>
              <th>Source</th>
              <th>Explorer</th>
            </tr>
          </thead>
          <tbody>
            {last15.map((r) => (
              <tr key={`${r.slot}-${r.root}`}>
                <td className="font-mono-num">{r.slot}</td>
                <td className="font-mono-num">{Math.round(r.delayMs)} ms</td>
                <td className="font-mono-num">{new Date(r.receivedAt).toLocaleTimeString()}</td>
                <td>{r.source}</td>
                <td>
                  <a className="underline" href={NETWORKS[network].explorer(r.slot)} target="_blank" rel="noreferrer">
                    view
                  </a>
                </td>
              </tr>
            ))}
            {last15.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-[var(--color-graphite)]">
                  Waiting for the next block, about 12s…
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
