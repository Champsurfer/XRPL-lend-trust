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

export default function Home() {
  const [pending, setPending] = useState(false);
  const [vault, setVault] = useState<VaultState | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    </main>
  );
}


