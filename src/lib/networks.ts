export type NetworkId = "mainnet" | "hoodi";

export interface NetworkConfig {
  id: NetworkId;
  label: string;
  base: string;
  explorer: (slot: number) => string;
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    base: "https://ethereum-beacon-api.publicnode.com",
    explorer: (slot) => `https://beaconcha.in/slot/${slot}`,
  },
  hoodi: {
    id: "hoodi",
    label: "Hoodi",
    base: "https://ethereum-hoodi-beacon-api.publicnode.com",
    explorer: (slot) => `https://hoodi.beaconcha.in/slot/${slot}`,
  },
};

export const DEFAULT_NETWORK: NetworkId = "mainnet";

// Fallback proxy base (Vercel serverless function). Only used if direct access fails.
export function proxyUrl(net: NetworkId, path: string): string {
  return `/api/beacon?net=${net}&path=${encodeURIComponent(path)}`;
}
