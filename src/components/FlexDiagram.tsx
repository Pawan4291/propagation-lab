import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function FlexDiagram() {
  const [mode, setMode] = useState<"whole" | "pieces">("pieces");

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">How block data can move</h3>
        <div className="flex gap-1 rounded-full border border-black p-0.5 text-xs font-semibold">
          <button
            onClick={() => setMode("whole")}
            className={`rounded-full px-3 py-1 ${mode === "whole" ? "bg-black text-white" : ""}`}
          >
            Wait for the whole block
          </button>
          <button
            onClick={() => setMode("pieces")}
            className={`rounded-full px-3 py-1 ${mode === "pieces" ? "bg-black text-white" : ""}`}
          >
            Forward pieces immediately
          </button>
        </div>
      </div>

      <svg viewBox="0 0 560 160" className="mt-4 w-full">
        <line x1="40" y1="30" x2="40" y2="130" stroke="#c4c8cf" />
        <line x1="280" y1="30" x2="280" y2="130" stroke="#c4c8cf" />
        <line x1="520" y1="30" x2="520" y2="130" stroke="#c4c8cf" />
        <text x="40" y="20" fontSize="11" textAnchor="middle" fill="#3a3d44">Publisher</text>
        <text x="280" y="20" fontSize="11" textAnchor="middle" fill="#3a3d44">Relay node</text>
        <text x="520" y="20" fontSize="11" textAnchor="middle" fill="#3a3d44">Receiver</text>

        <AnimatePresence mode="wait">
          {mode === "whole" ? (
            <motion.g key="whole" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.circle
                cy="80"
                r="9"
                fill="#aeb3bc"
                stroke="#050506"
                initial={{ cx: 40 }}
                animate={{ cx: [40, 280, 280, 520] }}
                transition={{ duration: 2.6, times: [0, 0.45, 0.55, 1], repeat: Infinity }}
              />
              <text x="160" y="105" fontSize="10" textAnchor="middle" fill="#3a3d44">whole block waits to assemble</text>
            </motion.g>
          ) : (
            <motion.g key="pieces" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={i}
                  cy={60 + i * 14}
                  r="6"
                  fill="#aeb3bc"
                  stroke="#050506"
                  initial={{ cx: 40 }}
                  animate={{ cx: [40, 520] }}
                  transition={{ duration: 1.6, delay: i * 0.18, repeat: Infinity, ease: "easeInOut" }}
                />
              ))}
              <text x="160" y="140" fontSize="10" textAnchor="middle" fill="#3a3d44">coded pieces re-mixed &amp; forwarded immediately</text>
            </motion.g>
          )}
        </AnimatePresence>
      </svg>
      <p className="mt-2 text-xs text-[var(--color-graphite)]">
        Explanatory diagram, not measured data. Illustrates the idea behind Optimum's mump2p / RLNC approach —
        see{" "}
        <a className="underline" href="https://docs.getoptimum.xyz/docs/learn/overview/p2p" target="_blank" rel="noreferrer">
          docs
        </a>
        . This site does not implement RLNC/erasure coding.
      </p>
    </div>
  );
}
