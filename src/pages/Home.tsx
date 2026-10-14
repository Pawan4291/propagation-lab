import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MascotHero } from "../components/MascotHero";
import { LiveStrip } from "../components/LiveStrip";
import { FlexTeaser } from "../components/FlexTeaser";
import { CustomCursor } from "../components/CustomCursor";

const PLAY_CARDS = [
  { to: "/flexnode", title: "Flexnode Lab", desc: "Full device check, Steady Hands challenge, compare to the chain." },
  { to: "/monitor", title: "Guess the Block", desc: "Predict when the next real block lands. Build a streak." },
  { to: "/deadline", title: "Cutoff Duel", desc: "Pick a cutoff each slot, live or replayed on real blocks." },
  { to: "/method#quiz", title: "Optimum Quiz", desc: "7 questions on mump2p, RLNC, and Flexnodes." },
];

export function Home() {
  return (
    <div>
      <CustomCursor />
      <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-[clamp(44px,9vw,96px)] font-semibold leading-[0.98] tracking-tight">
              Play with Ethereum's real block timing.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-[var(--color-graphite)]">
              Live blocks. Real measurements. Zero simulation.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/flexnode" className="btn-primary cursor-grow px-6 py-3 text-sm">
                Check my device
              </Link>
              <Link to="/monitor" className="btn-secondary cursor-grow px-6 py-3 text-sm">
                Play Guess the Block
              </Link>
            </div>
            <div className="mt-8">
              <LiveStrip />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.1 }}>
            <MascotHero size={420} />
          </motion.div>
        </div>
      </section>

      <FlexTeaser />

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pick something to play</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLAY_CARDS.map((c, i) => (
              <motion.div
                key={c.to}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <Link to={c.to} className="card cursor-grow block h-full p-5 transition-transform hover:-translate-y-1">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="mt-2 text-sm text-[var(--color-graphite)]">{c.desc}</p>
                  <span className="mt-4 inline-block text-sm font-semibold">Play →</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
