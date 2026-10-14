import { useEffect, useRef, useState } from "react";
import { usePointer } from "../hooks/usePointer";

type ReactLevel = "cheer" | "ok" | "oops";

export function MascotHero({ size = 360 }: { size?: number }) {
  const { pos, idle } = usePointer();
  const [pulse, setPulse] = useState(false);
  const [bounce, setBounce] = useState<ReactLevel | null>(null);
  const reduced = useRef(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    function onBlock() {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 600);
    }
    function onReact(e: Event) {
      const level = (e as CustomEvent).detail?.level as ReactLevel;
      setBounce(level);
      window.setTimeout(() => setBounce(null), 700);
    }
    window.addEventListener("block:new", onBlock);
    window.addEventListener("mascot:react", onReact);
    return () => {
      window.removeEventListener("block:new", onBlock);
      window.removeEventListener("mascot:react", onReact);
    };
  }, []);

  const rotateY = reduced.current ? 0 : pos.x * 10;
  const rotateX = reduced.current ? 0 : -pos.y * 8;
  const px = reduced.current ? 0 : pos.x * 14;
  const py = reduced.current ? 0 : pos.y * 14;

  const bounceTransform =
    bounce === "cheer"
      ? "translateY(-18px) scale(1.05)"
      : bounce === "oops"
      ? "translateX(-6px) rotate(-4deg)"
      : bounce === "ok"
      ? "translateY(-8px)"
      : "none";

  return (
    <div
      className="relative mx-auto flex items-center justify-center"
      style={{ width: size, height: size, perspective: 900 }}
    >
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(closest-side, #ffffff, #d3d6dc 55%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-2 left-1/2 h-8 w-40 -translate-x-1/2 rounded-full bg-black/15 blur-xl"
      />
      <img
        src="/mascot.png"
        alt="Propagation Lab mascot"
        className={`relative z-10 w-[72%] select-none ${idle && !reduced.current ? "animate-floaty" : ""} ${pulse ? "pulse-glow rounded-full" : ""}`}
        style={{
          transform: `translate3d(${px}px, ${py}px, 0) rotateY(${rotateY}deg) rotateX(${rotateX}deg) ${bounceTransform}`,
          transition: bounce ? "transform 0.35s ease" : "transform 0.08s linear",
          willChange: "transform",
        }}
        draggable={false}
      />
    </div>
  );
}

export function emitMascotReaction(level: ReactLevel) {
  window.dispatchEvent(new CustomEvent("mascot:react", { detail: { level } }));
}
