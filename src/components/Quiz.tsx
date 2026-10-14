import { useState } from "react";
import { emitMascotReaction } from "./MascotHero";
import { ShareCard } from "./ShareCard";
import { useStream } from "../hooks/useStream";
import { NETWORKS } from "../lib/networks";

interface Question {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
  source: { label: string; url: string };
}

const QUESTIONS: Question[] = [
  {
    q: "What does RLNC stand for?",
    options: [
      "Reliable Layered Node Consensus",
      "Random Linear Network Coding",
      "Randomized Ledger Node Cache",
      "Recursive Link Network Control",
    ],
    correct: 1,
    explanation: "RLNC = Random Linear Network Coding, the coding scheme behind mump2p.",
    source: { label: "docs: mump2p", url: "https://docs.getoptimum.xyz/docs/learn/overview/p2p" },
  },
  {
    q: "Does Optimum change Ethereum's consensus rules?",
    options: [
      "No — it only changes how data moves between nodes",
      "Yes — it replaces the validator set",
      "Yes — it changes block rewards",
      "Yes — it replaces GossipSub for good",
    ],
    correct: 0,
    explanation: "Optimum operates at the networking layer; consensus rules are untouched.",
    source: { label: "homepage FAQ", url: "https://www.getoptimum.xyz/" },
  },
  {
    q: "What keeps running next to mump2p on a validator?",
    options: [
      "Nothing; mump2p replaces everything",
      "A second consensus client",
      "GossipSub, in parallel",
      "An external RPC provider",
    ],
    correct: 2,
    explanation: "mump2p runs alongside GossipSub rather than replacing it outright.",
    source: { label: "homepage FAQ", url: "https://www.getoptimum.xyz/" },
  },
  {
    q: "To decode a message split into k fragments, a node needs…",
    options: [
      "All k originals, in order",
      "2k shards",
      "The publisher's private key",
      "Any k linearly independent coded shards",
    ],
    correct: 3,
    explanation: "RLNC lets a receiver decode from any k linearly independent coded pieces, not a specific set.",
    source: { label: "docs: mump2p", url: "https://docs.getoptimum.xyz/docs/learn/overview/p2p" },
  },
  {
    q: "Who runs Flexnodes at first?",
    options: ["Anyone with a phone", "Existing validator partners", "Only Optimum staff", "Centralized exchanges"],
    correct: 1,
    explanation: "Flexnodes launched as a controlled testnet for Optimum's validator partners.",
    source: { label: "Flexnodes blog", url: "https://www.getoptimum.xyz/blog/flexnodes-a-global-network-of-data-accelerators" },
  },
  {
    q: "Which control message tells peers to stop sending shards for an already-decoded message?",
    options: ["IDONTWANT", "IHAVE", "GRAFT", "PRUNE"],
    correct: 0,
    explanation: "IDONTWANT signals peers to stop sending shards for a message you've already decoded.",
    source: { label: "docs: mump2p", url: "https://docs.getoptimum.xyz/docs/learn/overview/p2p" },
  },
  {
    q: 'How does mump2p resist corrupted ("polluted") shards?',
    options: [
      "Proof of work",
      "Trusting every peer",
      "Source authentication: hash + publisher signature checked after decoding",
      "Manual review by Optimum",
    ],
    correct: 2,
    explanation: "Shards are verified via a hash and the publisher's signature after decoding to catch pollution.",
    source: { label: "docs: mump2p", url: "https://docs.getoptimum.xyz/docs/learn/overview/p2p" },
  },
];

export function Quiz() {
  const { network } = useStream();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = QUESTIONS[idx];

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === current.correct) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= QUESTIONS.length) {
      setFinished(true);
      emitMascotReaction(score >= 6 ? "cheer" : score >= 4 ? "ok" : "oops");
      return;
    }
    setIdx((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <div id="quiz" className="card p-6">
        <h2 className="text-xl font-semibold">Quiz complete</h2>
        <p className="mt-2 font-mono-num text-lg">
          Score: {score} / {QUESTIONS.length}
        </p>
        <button onClick={restart} className="btn-secondary mt-4 px-4 py-2 text-sm">
          Retake quiz
        </button>
        <ShareCard headline="Optimum Quiz" resultLine={`Score ${score} / ${QUESTIONS.length}`} network={NETWORKS[network].label} />
      </div>
    );
  }

  return (
    <div id="quiz" className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Optimum quiz</h2>
        <span className="font-mono-num text-sm text-[var(--color-graphite)]">
          {idx + 1} / {QUESTIONS.length}
        </span>
      </div>
      <p className="mt-4 font-medium">{current.q}</p>
      <div className="mt-3 grid gap-2">
        {current.options.map((opt, i) => {
          const isCorrect = i === current.correct;
          const isSelected = i === selected;
          let cls = "border-[var(--color-line)]";
          if (selected !== null) {
            if (isCorrect) cls = "border-black bg-[var(--color-silver-hi)]";
            else if (isSelected) cls = "border-black line-through text-[var(--color-graphite)]";
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className={`rounded-xl border px-4 py-2.5 text-left text-sm transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="mt-4 rounded-xl bg-[var(--color-paper-2)] p-4 text-sm">
          <p>{current.explanation}</p>
          <a className="mt-1 inline-block underline" href={current.source.url} target="_blank" rel="noreferrer">
            Source: {current.source.label}
          </a>
          <div>
            <button onClick={next} className="btn-primary mt-3 px-4 py-2 text-sm">
              {idx + 1 >= QUESTIONS.length ? "See final score" : "Next question"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
