import { useCallback, useState } from "react";

export interface GuessRound {
  slot: number;
  guessMs: number;
  actualMs: number | null;
  errorMs: number | null;
  points: number | null;
  lockedAt: number;
}

// Keeps Guess-the-Block rounds keyed by slot, in memory for the session.
export function useRounds() {
  const [rounds, setRounds] = useState<GuessRound[]>([]);

  const addRound = useCallback((round: GuessRound) => {
    setRounds((prev) => [...prev.filter((r) => r.slot !== round.slot), round].slice(-200));
  }, []);

  const resolveRound = useCallback((slot: number, actualMs: number, errorMs: number, points: number) => {
    setRounds((prev) => prev.map((r) => (r.slot === slot ? { ...r, actualMs, errorMs, points } : r)));
  }, []);

  return { rounds, addRound, resolveRound };
}
