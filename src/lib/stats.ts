export function percentile(values: number[], p: number): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  const frac = idx - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

export function mean(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function stdev(values: number[]): number | null {
  if (values.length < 2) return values.length === 1 ? 0 : null;
  const m = mean(values)!;
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function histogram(values: number[], binMs: number): { bin: number; count: number }[] {
  if (!values.length) return [];
  const max = Math.max(...values);
  const bins: Record<number, number> = {};
  const numBins = Math.max(1, Math.ceil((max + 1) / binMs));
  for (let i = 0; i < numBins; i++) bins[i * binMs] = 0;
  for (const v of values) {
    const b = Math.floor(v / binMs) * binMs;
    bins[b] = (bins[b] ?? 0) + 1;
  }
  return Object.entries(bins)
    .map(([bin, count]) => ({ bin: Number(bin), count }))
    .sort((a, b) => a.bin - b.bin);
}

export function lateShare(values: number[], cutoffMs: number): number {
  if (!values.length) return 0;
  const late = values.filter((v) => v > cutoffMs).length;
  return late / values.length;
}

// margins = cutoff - arrival (shifted by `shift` ms, which may be 0)
export function margins(arrivals: number[], cutoffMs: number, shiftMs = 0): number[] {
  return arrivals.map((a) => cutoffMs - (a - shiftMs));
}
