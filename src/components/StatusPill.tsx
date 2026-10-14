import { useStream } from "../hooks/useStream";

const labels: Record<string, string> = {
  sse: "live · SSE",
  poll: "live · polling",
  proxy: "live · proxy",
};

export function StatusPill() {
  const { status, source, error } = useStream();

  let text = "connecting…";
  let dotColor = "#aeb3bc";
  if (error) {
    text = "offline";
    dotColor = "#050506";
  } else if (status === "live" && source) {
    text = labels[source] ?? "live";
    dotColor = "#050506";
  } else if (status === "reconnecting") {
    text = "reconnecting…";
    dotColor = "#6b7079";
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-2.5 py-1 text-[11px] font-mono-num">
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
      {text}
    </span>
  );
}
