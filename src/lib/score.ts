// Pure scoring functions for the games. Stylized rules; stated openly in the UI.

export function guessPoints(errorMs: number): number {
  return Math.max(0, 100 - Math.floor(errorMs / 20));
}

export function nextStreak(prevStreak: number, errorMs: number): number {
  return errorMs <= 250 ? prevStreak + 1 : 0;
}

export function streakMultiplier(streak: number): number {
  return 1 + 0.1 * Math.min(streak, 10);
}

export function duelPoints(cutoffMs: number, arrivalMs: number): number {
  if (arrivalMs <= cutoffMs) return Math.round(cutoffMs / 100);
  return 0;
}

// Given a list of real arrival times (ms after slot start), find the cutoff
// (within the given candidate range/step) that maximizes total duel points.
export function bestCutoff(
  arrivals: number[],
  min = 500,
  max = 6000,
  step = 50
): { cutoff: number; points: number; missRate: number } {
  let best = { cutoff: min, points: -1, missRate: 1 };
  for (let c = min; c <= max; c += step) {
    let points = 0;
    let misses = 0;
    for (const a of arrivals) {
      const p = duelPoints(c, a);
      points += p;
      if (p === 0) misses++;
    }
    if (points > best.points) {
      best = { cutoff: c, points, missRate: arrivals.length ? misses / arrivals.length : 1 };
    }
  }
  return best;
}
