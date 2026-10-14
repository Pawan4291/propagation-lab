import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { NETWORKS, NetworkId, DEFAULT_NETWORK } from "../lib/networks";
import { fetchGenesis, fetchSecondsPerSlot, fetchGenesisViaProxy, fetchSecondsPerSlotViaProxy } from "../lib/beacon";
import { measureClockOffset } from "../lib/clock";
import { startStream, StreamStatus, StreamSource } from "../lib/stream";
import { BlockRecord } from "../lib/csv";

interface StreamState {
  network: NetworkId;
  setNetwork: (n: NetworkId) => void;
  status: StreamStatus;
  source: StreamSource | null;
  window: BlockRecord[];
  genesis: number | null;
  secPerSlot: number;
  clockOffsetMs: number;
  clockMeasured: boolean;
  error: string | null;
  reconnects: number;
}

const StreamCtx = createContext<StreamState | null>(null);

const WINDOW_SIZE = 300;

export function StreamProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<NetworkId>(() => {
    try {
      return (localStorage.getItem("pl:network") as NetworkId) || DEFAULT_NETWORK;
    } catch {
      return DEFAULT_NETWORK;
    }
  });
  const [status, setStatus] = useState<StreamStatus>("connecting");
  const [source, setSource] = useState<StreamSource | null>(null);
  const [windowRecords, setWindowRecords] = useState<BlockRecord[]>([]);
  const [genesis, setGenesis] = useState<number | null>(null);
  const [secPerSlot, setSecPerSlot] = useState<number>(12);
  const [clockOffsetMs, setClockOffsetMs] = useState(0);
  const [clockMeasured, setClockMeasured] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reconnects, setReconnects] = useState(0);
  const handleRef = useRef<{ stop: () => void } | null>(null);
  const prevStatusRef = useRef<StreamStatus>("connecting");

  const setNetwork = useCallback((n: NetworkId) => {
    setNetworkState(n);
    try {
      localStorage.setItem("pl:network", n);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setWindowRecords([]);
    setError(null);
    setStatus("connecting");
    setSource(null);
    if (handleRef.current) {
      handleRef.current.stop();
      handleRef.current = null;
    }

    (async () => {
      const net = NETWORKS[network];
      const { offsetMs, measured } = await measureClockOffset();
      if (cancelled) return;
      setClockOffsetMs(offsetMs);
      setClockMeasured(measured);

      let genesisTime: number;
      let spSlot: number;
      try {
        [genesisTime, spSlot] = await Promise.all([
          fetchGenesis(net).then((g) => g.genesisTime),
          fetchSecondsPerSlot(net),
        ]);
      } catch {
        try {
          [genesisTime, spSlot] = await Promise.all([
            fetchGenesisViaProxy(net).then((g) => g.genesisTime),
            fetchSecondsPerSlotViaProxy(net),
          ]);
        } catch {
          if (!cancelled) setError("Could not reach the beacon node or the proxy.");
          return;
        }
      }
      if (cancelled) return;
      setGenesis(genesisTime);
      setSecPerSlot(spSlot);

      const handle = startStream(net, genesisTime, spSlot, offsetMs, {
        onRecord: (rec) => {
          if (cancelled) return;
          setWindowRecords((prev) => {
            if (prev.some((p) => p.slot === rec.slot && p.root === rec.root)) return prev;
            const next = [...prev, rec].sort((a, b) => a.slot - b.slot);
            return next.slice(-WINDOW_SIZE);
          });
          window.dispatchEvent(new CustomEvent("block:new", { detail: rec }));
        },
        onStatus: (st, src) => {
          if (cancelled) return;
          if (st === "reconnecting" && prevStatusRef.current === "live") {
            setReconnects((r) => r + 1);
          }
          prevStatusRef.current = st;
          setStatus(st);
          setSource(src);
        },
      });
      handleRef.current = handle;
    })();

    return () => {
      cancelled = true;
      if (handleRef.current) {
        handleRef.current.stop();
        handleRef.current = null;
      }
    };
  }, [network]);

  const value: StreamState = {
    network,
    setNetwork,
    status,
    source,
    window: windowRecords,
    genesis,
    secPerSlot,
    clockOffsetMs,
    clockMeasured,
    error,
    reconnects,
  };

  return <StreamCtx.Provider value={value}>{children}</StreamCtx.Provider>;
}

export function useStreamContext(): StreamState {
  const ctx = useContext(StreamCtx);
  if (!ctx) throw new Error("useStreamContext must be used within StreamProvider");
  return ctx;
}
