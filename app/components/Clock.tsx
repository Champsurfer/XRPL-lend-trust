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
    // Built from the parts, not toLocaleDateString — the local
    // format adds leading zeros. "1/10/2026", not "2026/10/01".
    const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return (
      <div className="clock-clock clock-clock--live">
        <div className="text-sm text-gray-500">
          Ledger time (Devnet, ledger #{ledger.ledgerIndex}):{" "}
          <span className="font-mono text-gray-300">
            {date} {time} SAST
          </span>
        </div>
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
  const date = `${t.getDate()}/${t.getMonth() + 1}/${t.getFullYear()}`;
  // A fetch that answered with an error is the red state; no
  // answer yet is the amber fallback.
  const stateClass =
    ledger && ledger.ok === false && ledger.error
      ? "clock-clock clock-clock--error"
      : "clock-clock clock-clock--fallback";
  const label =
    ledger && ledger.ok === false && ledger.error
      ? "Local time (ledger error)"
      : "Local time (ledger unreachable)";
  return (
    <div className={stateClass}>
      <div className="text-sm text-gray-500">
        {label}:{" "}
        <span className="font-mono text-gray-300">
          {date} {time} SAST
        </span>
      </div>
    </div>
  );
}

