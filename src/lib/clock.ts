// Measures the offset between the visitor's device clock and a trusted time source.
// Falls back to 0 (device clock) if the trace endpoint is unreachable.

export async function measureClockOffset(): Promise<{ offsetMs: number; measured: boolean }> {
  const samples: number[] = [];
  for (let i = 0; i < 3; i++) {
    try {
      const t0 = Date.now();
      const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
      const t1 = Date.now();
      const text = await res.text();
      const m = text.match(/ts=([0-9.]+)/);
      if (!m) continue;
      const serverMs = parseFloat(m[1]) * 1000;
      const rtt = t1 - t0;
      const offset = serverMs + rtt / 2 - t1;
      samples.push(offset);
    } catch {
      // ignore, try next sample
    }
  }
  if (samples.length === 0) return { offsetMs: 0, measured: false };
  samples.sort((a, b) => a - b);
  const mid = samples[Math.floor(samples.length / 2)];
  return { offsetMs: mid, measured: true };
}
