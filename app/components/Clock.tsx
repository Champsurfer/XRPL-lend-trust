"use client";

import { useEffect, useState } from "react";

type LedgerTime = {
  ok: boolean;
  ledgerIndex?: number;
  closeTimeISO?: string;
  error?: string;
};

export default function Clock() {
  const [browserNow, setBrowserNow] = useState<Date | null>(null);
  const [ledger, setLedger] = useState<LedgerTime | null>(null);
  const [mounted, setMounted] = useState(false);

  // Browser clock — the honest fallback. Ticks every second.
  useEffect(() => {
    setMounted(true);
    setBrowserNow(new Date());
    const id = setInterval(() => setBrowserNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Ledger clock — poll the real ledger time every 10 seconds.
  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const res = await fetch("/api/ledger/current", {
          cache: "no-store",
        });
        const data = (await res.json()) as LedgerTime;
        if (alive) setLedger(data);
      } catch (err) {
        if (alive) {
          setLedger({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
    }
    poll();
    const id = setInterval(poll, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  // Do not render time on the server — wrong by the time
  // it reaches the browser. This guard also prevents the
  // SSR/CSR mismatch.
  if (!mounted) {
    return (
      <div className="text-sm text-gray-500">Time: loading…</div>
    );
  }

  // Real ledger clock, when Devnet is reachable.
  if (ledger && ledger.ok && ledger.closeTimeISO) {
    const d = new Date(ledger.closeTimeISO);
    const time = d.toLocaleTimeString("en-ZA", {
      hour12: false,
      timeZone: "Africa/Johannesburg",
    });
    const date = d.toLocaleDateString("en-ZA", {
      timeZone: "Africa/Johannesburg",
    });
    return (
      <div className="text-sm text-gray-500">
        Ledger time (Devnet, ledger #{ledger.ledgerIndex}):{" "}
        <span className="font-mono text-gray-300">
          {date} {time} SAST
        </span>
      </div>
    );
  }

  // Fallback: the ledger is unreachable. Say so. Do not
  // pretend the browser clock is the ledger's time.
  const t = browserNow ?? new Date();
  const time = t.toLocaleTimeString("en-ZA", {
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });
  const date = t.toLocaleDateString("en-ZA", {
    timeZone: "Africa/Johannesburg",
  });
  return (
    <div className="text-sm text-gray-500">
      Local time (ledger unreachable):{" "}
      <span className="font-mono text-gray-300">
        {date} {time} SAST
      </span>
    </div>
  );
}

