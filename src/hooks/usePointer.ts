import { useEffect, useRef, useState } from "react";

// Tracks normalized pointer position (-1..1) relative to viewport center, with lerp smoothing.
export function usePointer() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const idleTimer = useRef<number | null>(null);
  const [idle, setIdle] = useState(true);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function onMove(e: PointerEvent) {
      if (e.pointerType === "touch") return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      target.current = { x: nx, y: ny };
      setIdle(false);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setIdle(true), 2000);
    }

    window.addEventListener("pointermove", onMove, { passive: true });

    function loop() {
      setPos((prev) => {
        if (reduced) return target.current;
        const lerp = 0.12;
        return {
          x: prev.x + (target.current.x - prev.x) * lerp,
          y: prev.y + (target.current.y - prev.y) * lerp,
        };
      });
      raf.current = requestAnimationFrame(loop);
    }
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, []);

  return { pos, idle };
}
