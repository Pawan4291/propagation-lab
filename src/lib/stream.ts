import { NetworkConfig, proxyUrl } from "./networks";
import { BlockRecord } from "./csv";

export type StreamSource = "sse" | "poll" | "proxy";
export type StreamStatus = "connecting" | "live" | "reconnecting" | "error";

export interface StreamCallbacks {
  onRecord: (rec: BlockRecord) => void;
  onStatus: (status: StreamStatus, source: StreamSource) => void;
}

export interface StreamHandle {
  stop: () => void;
}

// Starts the best available stream for a network: SSE -> polling -> proxy polling.
export function startStream(
  net: NetworkConfig,
  genesisTime: number,
  secondsPerSlot: number,
  clockOffsetMs: number,
  cb: StreamCallbacks
): StreamHandle {
  let stopped = false;
  let es: EventSource | null = null;
  let pollTimer: number | null = null;
  let watchdog: number | null = null;
  let backoff = 1000;
  let lastKey = "";
  const seen = new Set<string>();

  const makeRecord = (slot: number, root: string, source: StreamSource): BlockRecord | null => {
    const receivedAt = Date.now() + clockOffsetMs;
    const delayMs = receivedAt - (genesisTime + slot * secondsPerSlot) * 1000;
    if (delayMs < -300 || delayMs >= secondsPerSlot * 1000 + 2000) return null;
    const key = `${slot}:${root}`;
    if (seen.has(key)) return null;
    seen.add(key);
    if (seen.size > 500) {
      const first = seen.values().next().value;
      if (first) seen.delete(first);
    }
    return { slot, root, delayMs, receivedAt, source };
  };

  function resetWatchdog() {
    if (watchdog) window.clearTimeout(watchdog);
    watchdog = window.setTimeout(() => {
      if (stopped) return;
      cb.onStatus("reconnecting", "sse");
      closeSSE();
      scheduleReconnect();
    }, 30000);
  }

  function closeSSE() {
    if (es) {
      es.close();
      es = null;
    }
  }

  function scheduleReconnect() {
    if (stopped) return;
    window.setTimeout(() => {
      if (!stopped) startSSE();
    }, backoff);
    backoff = Math.min(backoff * 2, 15000);
  }

  function startSSE() {
    if (stopped) return;
    cb.onStatus("connecting", "sse");
    try {
      es = new EventSource(`${net.base}/eth/v1/events?topics=head`);
    } catch {
      startPolling("poll");
      return;
    }
    let gotFirst = false;
    es.addEventListener("head", (evt: MessageEvent) => {
      try {
        const receivedAt = Date.now() + clockOffsetMs;
        const d = JSON.parse(evt.data);
        const slot = Number(d.slot);
        const root = String(d.block);
        const delayMs = receivedAt - (genesisTime + slot * secondsPerSlot) * 1000;
        if (delayMs < -300 || delayMs >= secondsPerSlot * 1000 + 2000) return;
        const key = `${slot}:${root}`;
        if (seen.has(key)) return;
        seen.add(key);
        gotFirst = true;
        backoff = 1000;
        cb.onStatus("live", "sse");
        cb.onRecord({ slot, root, delayMs, receivedAt, source: "sse" });
        resetWatchdog();
      } catch {
        /* ignore malformed event */
      }
    });
    es.onerror = () => {
      if (stopped) return;
      if (!gotFirst) {
        closeSSE();
        startPolling("poll");
        return;
      }
      cb.onStatus("reconnecting", "sse");
    };
    resetWatchdog();
  }

  async function pollOnce(source: StreamSource) {
    try {
      const url = source === "proxy" ? proxyUrl(net.id, "/eth/v1/beacon/headers/head") : `${net.base}/eth/v1/beacon/headers/head`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.status === 429) {
        pollDelay = Math.min(pollDelay * 2, 1000);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
      pollDelay = Math.max(250, pollDelay - 50);
      const json = await res.json();
      const slot = Number(json.data.header.message.slot);
      const root = String(json.data.root);
      const key = `${slot}:${root}`;
      if (key === lastKey) return;
      const isFirst = lastKey === "";
      lastKey = key;
      const rec = isFirst ? null : makeRecord(slot, root, source);
      cb.onStatus("live", source);
      if (rec) cb.onRecord(rec);
    } catch {
      cb.onStatus("reconnecting", source);
    }
  }

  let pollDelay = 250;
  function startPolling(source: StreamSource) {
    if (stopped) return;
    cb.onStatus("connecting", source);
    const tick = async () => {
      if (stopped) return;
      await pollOnce(source);
      pollTimer = window.setTimeout(tick, pollDelay);
    };
    tick();
  }

  startSSE();

  return {
    stop() {
      stopped = true;
      closeSSE();
      if (pollTimer) window.clearTimeout(pollTimer);
      if (watchdog) window.clearTimeout(watchdog);
    },
  };
}
