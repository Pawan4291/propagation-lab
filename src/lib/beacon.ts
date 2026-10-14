import { NetworkConfig, proxyUrl } from "./networks";

export interface GenesisInfo {
  genesisTime: number; // seconds
}

export async function fetchGenesis(net: NetworkConfig): Promise<GenesisInfo> {
  const res = await fetch(`${net.base}/eth/v1/beacon/genesis`, { cache: "no-store" });
  if (!res.ok) throw new Error(`genesis ${res.status}`);
  const json = await res.json();
  return { genesisTime: Number(json.data.genesis_time) };
}

export async function fetchSecondsPerSlot(net: NetworkConfig): Promise<number> {
  const res = await fetch(`${net.base}/eth/v1/config/spec`, { cache: "no-store" });
  if (!res.ok) throw new Error(`spec ${res.status}`);
  const json = await res.json();
  const v = json.data.SECONDS_PER_SLOT ?? json.data.seconds_per_slot;
  return Number(v) || 12;
}

export async function fetchGenesisViaProxy(net: NetworkConfig): Promise<GenesisInfo> {
  const res = await fetch(proxyUrl(net.id, "/eth/v1/beacon/genesis"), { cache: "no-store" });
  if (!res.ok) throw new Error(`genesis proxy ${res.status}`);
  const json = await res.json();
  return { genesisTime: Number(json.data.genesis_time) };
}

export async function fetchSecondsPerSlotViaProxy(net: NetworkConfig): Promise<number> {
  const res = await fetch(proxyUrl(net.id, "/eth/v1/config/spec"), { cache: "no-store" });
  if (!res.ok) throw new Error(`spec proxy ${res.status}`);
  const json = await res.json();
  const v = json.data.SECONDS_PER_SLOT ?? json.data.seconds_per_slot;
  return Number(v) || 12;
}

// Single round-trip latency sample against the genesis endpoint (used by probes & Steady Hands).
export async function pingGenesis(net: NetworkConfig): Promise<number> {
  const t0 = performance.now();
  const res = await fetch(`${net.base}/eth/v1/beacon/genesis`, { cache: "no-store" });
  if (!res.ok) throw new Error(`ping ${res.status}`);
  await res.text();
  return performance.now() - t0;
}
