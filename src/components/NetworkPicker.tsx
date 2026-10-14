import { useStream } from "../hooks/useStream";
import { NETWORKS, NetworkId } from "../lib/networks";

export function NetworkPicker() {
  const { network, setNetwork } = useStream();
  return (
    <select
      value={network}
      onChange={(e) => setNetwork(e.target.value as NetworkId)}
      className="rounded-full border-[1.5px] border-black bg-white px-3 py-1.5 text-xs font-semibold"
      aria-label="Select network"
    >
      {Object.values(NETWORKS).map((n) => (
        <option key={n.id} value={n.id}>
          {n.label}
        </option>
      ))}
    </select>
  );
}
