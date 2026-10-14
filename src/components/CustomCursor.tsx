import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [big, setBig] = useState(false);
  const pos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine);
    if (!fine) return;

    function onMove(e: PointerEvent) {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      const target = e.target as HTMLElement;
      setBig(!!target.closest("a, button, input, [role=button], .cursor-grow"));
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    document.body.classList.add("cursor-enabled");
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.body.classList.remove("cursor-enabled");
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border-[1.5px] border-black transition-[width,height] duration-150 ease-out"
      style={{
        width: big ? 40 : 14,
        height: big ? 40 : 14,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.9)",
        background: big ? "rgba(5,5,6,0.06)" : "transparent",
      }}
    />
  );
}
