export interface BlockRecord {
  slot: number;
  root: string;
  delayMs: number;
  receivedAt: number;
  source: "sse" | "poll" | "proxy";
}

export function toCSV(rows: BlockRecord[]): string {
  const header = "slot,root,delay_ms,received_at_iso,source";
  const lines = rows.map(
    (r) =>
      `${r.slot},${r.root},${Math.round(r.delayMs)},${new Date(r.receivedAt).toISOString()},${r.source}`
  );
  return [header, ...lines].join("\n");
}

export function downloadText(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
