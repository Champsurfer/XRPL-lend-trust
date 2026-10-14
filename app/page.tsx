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

type LoanState = {
  loanId: string;
  brokerId: string;
  vaultId: string;
  principal: string;
  interestRate: number;
  term: number;
  borrower: string;
  status: string;
  txHashSet: string;
  txHashPay: string | null;
  brokerSignature: string;
  borrowerSignature: string;
};

type LoanResult = { ok: true; loan: LoanState } | { ok: false; error: string };

type PayResult = {
  ok: true;
  pay: { txHashPay: string; amount: string; status: string };
} | { ok: false; error: string };

export default function Home() {
  const [pending, setPending] = useState(false);
  const [vault, setVault] = useState<VaultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brokerPending, setBrokerPending] = useState(false);
  const [broker, setBroker] = useState<BrokerState | null>(null);
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const [loanPending, setLoanPending] = useState(false);
  const [loan, setLoan] = useState<LoanState | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);
  const [payPending, setPayPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

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

  async function createLoanRow() {
    if (!broker) return;
    setLoanPending(true);
    setLoanError(null);
    setPayError(null);
    try {
      const res = await fetch("/api/loan/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brokerId: broker.brokerId,
          vaultId: broker.vaultId,
        }),
      });
      const data = (await res.json()) as LoanResult;
      if (data.ok) {
        setLoan(data.loan);
      } else {
        setLoanError(data.error);
      }
    } catch (err) {
      setLoanError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoanPending(false);
    }
  }

  async function repayLoan() {
    if (!loan) return;
    setPayPending(true);
    setPayError(null);
    try {
      const res = await fetch("/api/loan/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanId: loan.loanId }),
      });
      const data = (await res.json()) as PayResult;
      if (data.ok) {
        setLoan({ ...loan, status: data.pay.status, txHashPay: data.pay.txHashPay });
      } else {
        setPayError(data.error);
      }
    } catch (err) {
      setPayError(err instanceof Error ? err.message : String(err));
    } finally {
      setPayPending(false);
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

      <button
        onClick={createLoanRow}
        disabled={!broker || loanPending}
        className="mt-6 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
      >
        {loanPending ? "Creating loan…" : "Create Loan"}
      </button>

      {loanError && (
        <p className="mt-4 text-sm text-red-400">Error: {loanError}</p>
      )}

      {loan && (
        <div className="mt-4 max-w-3xl rounded border border-gray-700 p-4 text-sm text-gray-300">
          <p className="font-semibold text-gray-100">
            Loan {loan.status === "repaid" ? "Repaid" : loan.status === "failed" ? "Failed" : "Active"}
          </p>
          <p>Loan ID: {loan.loanId}</p>
          <p>
            Principal: {loan.principal} drops (
            {Number(loan.principal) / 1_000_000} XRP) · Rate:{" "}
            {loan.interestRate} · Term: {loan.term} payments
          </p>
          <p>Borrower: {loan.borrower}</p>
          <p className="mt-2 text-xs text-gray-500">Broker signature:</p>
          <p className="break-all font-mono text-xs text-gray-400">
            {loan.brokerSignature || "(none)"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Borrower signature:</p>
          <p className="break-all font-mono text-xs text-gray-400">
            {loan.borrowerSignature || "(none)"}
          </p>
          <p className="mt-2">
            Set tx:{" "}
            <a
              className="text-gray-300 underline"
              href={`https://devnet.xrpl.org/transactions/${loan.txHashSet}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {loan.txHashSet}
            </a>
          </p>
          {loan.txHashPay && (
            <p>
              Pay tx:{" "}
              <a
                className="text-gray-300 underline"
                href={`https://devnet.xrpl.org/transactions/${loan.txHashPay}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {loan.txHashPay}
              </a>
            </p>
          )}
          {loan.status === "active" && (
            <button
              onClick={repayLoan}
              disabled={payPending}
              className="mt-3 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {payPending ? "Repaying…" : "Repay"}
            </button>
          )}
          {payError && (
            <p className="mt-2 text-sm text-red-400">Error: {payError}</p>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        {loan
          ? `Loan: ${loan.loanId} — ${loan.status}`
          : "Loan: (none)"}
      </div>
    </main>
  );
}


