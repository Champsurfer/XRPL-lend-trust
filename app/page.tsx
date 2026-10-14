"use client";

import { useState } from "react";
import Clock from "./components/Clock";

type VaultState = {
  vaultId: string;
  assetsTotal: string;
  sharesTotal: string;
  createdAt: string;
  txHash: string;
};

type VaultResult = { ok: true; vault: VaultState } | { ok: false; error: string };

type BrokerState = {
  brokerId: string;
  vaultId: string;
  coverAvailable: string;
  coverRateMinimum: number;
  coverRateLiquidation: number;
  txHashCreate: string;
  txHashCover: string;
};

type BrokerResult = { ok: true; broker: BrokerState } | { ok: false; error: string };

export default function Home() {
  const [pending, setPending] = useState(false);
  const [vault, setVault] = useState<VaultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brokerPending, setBrokerPending] = useState(false);
  const [broker, setBroker] = useState<BrokerState | null>(null);
  const [brokerError, setBrokerError] = useState<string | null>(null);

  async function createVault() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/vault/create", { method: "POST" });
      const data = (await res.json()) as VaultResult;
      if (data.ok) {
        setVault(data.vault);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  async function createBroker() {
    if (!vault) return;
    setBrokerPending(true);
    setBrokerError(null);
    try {
      const res = await fetch("/api/broker/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultId: vault.vaultId }),
      });
      const data = (await res.json()) as BrokerResult;
      if (data.ok) {
        setBroker(data.broker);
      } else {
        setBrokerError(data.error);
      }
    } catch (err) {
      setBrokerError(err instanceof Error ? err.message : String(err));
    } finally {
      setBrokerPending(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Clock />
      <h1 className="mt-8 text-4xl font-bold">XRPLendTrust</h1>
      <p className="mt-4 text-lg text-gray-500">Trust, on the ledger.</p>

      <button
        onClick={createVault}
        disabled={pending}
        className="mt-8 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {pending ? "Creating vault…" : "Create Vault"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-400">Error: {error}</p>
      )}

      {vault && (
        <div className="mt-4 text-sm text-gray-400">
          <p>
            Vault created. tx:{" "}
            <a
              className="text-gray-300 underline"
              href={`https://devnet.xrpl.org/transactions/${vault.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {vault.txHash}
            </a>
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {vault
          ? `Vault: ${vault.vaultId}`
          : "Vault: (none)"}
      </div>

      <button
        onClick={createBroker}
        disabled={!vault || brokerPending}
        className="mt-6 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {brokerPending ? "Creating broker…" : "Create Broker"}
      </button>

      {brokerError && (
        <p className="mt-4 text-sm text-red-400">Error: {brokerError}</p>
      )}

      {broker && (
        <div className="mt-4 text-sm text-gray-400">
          <p>
            Broker created. Set tx:{" "}
            <a
              className="text-gray-300 underline"
              href={`https://devnet.xrpl.org/transactions/${broker.txHashCreate}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {broker.txHashCreate}
            </a>
          </p>
          <p>
            Cover tx:{" "}
            <a
              className="text-gray-300 underline"
              href={`https://devnet.xrpl.org/transactions/${broker.txHashCover}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {broker.txHashCover}
            </a>
          </p>
          <p>
            First-loss capital held: {broker.coverAvailable} drops (
            {Number(broker.coverAvailable) / 1_000_000} XRP)
          </p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {broker
          ? `Broker: ${broker.brokerId} — cover ${broker.coverAvailable} drops`
          : "Broker: (none)"}
      </div>
    </main>
  );
}


