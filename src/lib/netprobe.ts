import { NetworkConfig } from "./networks";
import { pingGenesis } from "./beacon";

export interface LatencyResult {
  samples: number[];
  median: number;
  min: number;
  max: number;
  jitter: number; // stdev
}

export async function measureLatency(net: NetworkConfig, count = 10): Promise<LatencyResult> {
  const samples: number[] = [];
  for (let i = 0; i < count; i++) {
    try {
      const ms = await pingGenesis(net);
      samples.push(ms);
    } catch {
      // skip failed sample
    }
  }
  if (!samples.length) throw new Error("latency endpoint unreachable");
  const sorted = [...samples].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, samples.length - 1);
  return {
    samples,
    median,
    min: Math.min(...samples),
    max: Math.max(...samples),
    jitter: Math.sqrt(variance),
  };
}

export async function measureDownload(bytes = 25_000_000, capSeconds = 8): Promise<number> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), capSeconds * 1000 + 500);
  const t0 = performance.now();
  let received = 0;
  try {
    const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok || !res.body) throw new Error("download unreachable");
    const reader = res.body.getReader();
    while (true) {
      const elapsed = (performance.now() - t0) / 1000;
      if (elapsed > capSeconds) break;
      const { done, value } = await reader.read();
      if (done) break;
      received += value?.length ?? 0;
    }
    try {
      reader.cancel();
    } catch {
      /* noop */
    }
  } finally {
    clearTimeout(timeout);
  }
  const seconds = Math.min((performance.now() - t0) / 1000, capSeconds);
  if (received === 0 || seconds <= 0) throw new Error("download unreachable");
  return (received * 8) / seconds / 1_000_000; // Mbps
}

export async function measureUpload(mb = 5, capSeconds = 6): Promise<number> {
  const payload = new Uint8Array(mb * 1_000_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), capSeconds * 1000 + 500);
  const t0 = performance.now();
  try {
    const res = await fetch("https://speed.cloudflare.com/__up", {
      method: "POST",
      body: payload,
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error("upload unreachable");
  } finally {
    clearTimeout(timeout);
  }
  const seconds = Math.min((performance.now() - t0) / 1000, capSeconds);
  return (payload.byteLength * 8) / seconds / 1_000_000; // Mbps
}

export function getConnectionInfo(): { effectiveType?: string; downlink?: number; rtt?: number } | null {
  const nav = navigator as unknown as { connection?: { effectiveType?: string; downlink?: number; rtt?: number } };
  if (!nav.connection) return null;
  const { effectiveType, downlink, rtt } = nav.connection;
  return { effectiveType, downlink, rtt };
}
