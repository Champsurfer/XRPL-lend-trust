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

type Transaction = {
  time: string;
  type: string;
  hash: string;
};

export default function Home() {
  const [vaultPending, setVaultPending] = useState(false);
  const [vault, setVault] = useState<VaultState | null>(null);
  const [vaultAssets, setVaultAssets] = useState<string | null>(null);
  const [vaultShares, setVaultShares] = useState<string | null>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);
  
  const [depositPending, setDepositPending] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositError, setDepositError] = useState<string | null>(null);
  
  const [brokerPending, setBrokerPending] = useState(false);
  const [broker, setBroker] = useState<BrokerState | null>(null);
  const [brokerError, setBrokerError] = useState<string | null>(null);
  const [brokerCapital, setBrokerCapital] = useState<string | null>(null);
  
  const [loanPending, setLoanPending] = useState(false);
  const [loan, setLoan] = useState<LoanState | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);
  
  const [payPending, setPayPending] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  
  const [loanPrincipal, setLoanPrincipal] = useState("");
  const [loanRate, setLoanRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vaultReady, setVaultReady] = useState(false);

  function addTransaction(type: string, hash: string) {
    const time = new Date().toLocaleTimeString("en-ZA", {
      hour12: false,
      timeZone: "Africa/Johannesburg",
    });
    setTransactions((prev) => [{ time, type, hash }, ...prev].slice(0, 50));
  }

  async function createVault() {
    setVaultPending(true);
    setVaultError(null);
    try {
      const res = await fetch("/api/vault/create", { method: "POST" });
      const data = (await res.json()) as VaultResult;
      if (data.ok) {
        setVault(data.vault);
        setVaultAssets("0");
        setVaultShares("0");
        setVaultReady(false);
        addTransaction("VaultCreate", data.vault.txHash);
        setTimeout(() => setVaultReady(true), 12000);
      } else {
        setVaultError(data.error);
      }
    } catch (err) {
      setVaultError(err instanceof Error ? err.message : String(err));
    } finally {
      setVaultPending(false);
    }
  }

  async function depositVault() {
    if (!vault) return;
    setDepositPending(true);
    setDepositError(null);
    try {
      const res = await fetch("/api/vault/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultId: vault.vaultId, amount: depositAmount }),
      });
      const data = await res.json();
      if (data.ok) {
        setDepositAmount("");
        addTransaction("VaultDeposit", data.txHash || "(pending)");
        setVaultAssets(prev => prev ? (Number(prev) + Number(depositAmount)).toString() : depositAmount);
      } else {
        setDepositError(data.error || "deposit failed");
      }
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : String(err));
    } finally {
      setDepositPending(false);
    }
  }

  async function createBroker() {
    if (!vault) {
      alert("No vault ID. Create a vault first.");
      return;
    }
    setBrokerPending(true);
    setBrokerError(null);
    try {
      const res = await fetch("/api/broker/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vaultId: vault.vaultId, coverAmount: "1000000" }),
      });
      const data = (await res.json()) as BrokerResult;
      if (data.ok) {
        setBroker(data.broker);
        setBrokerCapital(data.broker.coverAvailable);
        addTransaction("LoanBrokerSet", data.broker.txHashCreate);
        addTransaction("LoanBrokerCoverDeposit", data.broker.txHashCover);
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
          principal: loanPrincipal || "1000000",
          rate: loanRate ? Number(loanRate) : 500,
          term: loanTerm ? Number(loanTerm) : 4,
        }),
      });
      const data = (await res.json()) as LoanResult;
      if (data.ok) {
        setLoan(data.loan);
        setLoanPrincipal("");
        setLoanRate("");
        setLoanTerm("");
        addTransaction("LoanSet", data.loan.txHashSet);
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
        addTransaction("LoanPay", data.pay.txHashPay);
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
    <div className="bg-deep-slate text-bone min-h-screen flex flex-col">
      <div className="border-b border-accent/30 bg-[#0F172A] py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock />
        </div>
        <div className="text-xs font-mono text-accent opacity-70">
          XRPLendTrust · Devnet
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* LEFT COLUMN - VAULT */}
        <div className="w-1/3 flex flex-col gap-3 min-w-0">
          <div className="border border-accent/30 rounded p-4 bg-[#1E293B]/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">
                The Vault
              </h2>
            </div>

            {vault ? (
              <>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Vault Assets</span>
                  <span className="font-mono">{vaultAssets ?? "0"} drops</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-3">
                  <span>Vault Shares</span>
                  <span className="font-mono">{vaultShares ?? "0"}</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Deposit amount (drops)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={depositPending}
                    className="flex-1 rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-2 text-sm"
                  />
                  <button
                    onClick={depositVault}
                    disabled={depositPending || !depositAmount}
                    className="rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50 hover:bg-[#B45309] transition"
                  >
                    {depositPending ? "Depositing…" : "Deposit"}
                  </button>
                </div>

                {depositError && (
                  <p className="mt-1 text-xs text-red-400">Error: {depositError}</p>
                )}

                <div className="mt-2 pt-2 border-t border-accent/20">
                  <p className="text-xs text-slate-400">
                    Vault ID:{" "}
                    <span className="font-mono text-xs break-all">{vault.vaultId}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Tx:{" "}
                    <a
                      href={`https://devnet.xrpl.org/transactions/${vault.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent underline font-mono text-xs"
                    >
                      {vault.txHash}
                    </a>
                  </p>
                </div>
              {vault && !vaultReady && (
                <p className="text-xs text-slate-500 mt-2">Vault created. Waiting for Investment phase (12s)...</p>
              )}
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">Vault is empty.</p>
                <button
                  onClick={createVault}
                  disabled={vaultPending}
                  className="w-full rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50 hover:bg-[#B45309] transition"
                >
                  {vaultPending ? "Creating…" : "Create Vault"}
                </button>
                {vaultError && (
                  <p className="mt-1 text-xs text-red-400">Error: {vaultError}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* CENTER COLUMN - LOAN DESK */}
        <div className="w-1/3 flex flex-col gap-3 min-w-0">
          <div className="border border-accent/30 rounded p-4 bg-[#1E293B]/50 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">
                Loan Desk
              </h2>
            </div>

            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>First-Loss Capital</span>
              <span className="font-mono">{brokerCapital ?? "0"} drops</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mb-3">
              <span>Loans Outstanding</span>
              <span className="font-mono">{loan ? "1" : "0"}</span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Principal"
                  value={loanPrincipal}
                  onChange={(e) => setLoanPrincipal(e.target.value)}
                  disabled={loanPending || !!loan}
                  className="rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Rate"
                  value={loanRate}
                  onChange={(e) => setLoanRate(e.target.value)}
                  disabled={loanPending || !!loan}
                  className="rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Term"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(e.target.value)}
                  disabled={loanPending || !!loan}
                  className="rounded bg-gray-800 text-white placeholder-gray-400 border border-gray-600 p-2 text-sm"
                />
              </div>
              
              {!broker && (
                <button
                  onClick={createBroker}
                  disabled={brokerPending}
                  className="w-full rounded bg-yellow-600 text-white px-4 py-2 text-sm font-semibold hover:bg-yellow-700 transition disabled:opacity-50"
                >
                  {brokerPending ? "Creating Broker…" : "Create Broker (1 XRP Cover)"}
                </button>
              )}

              <button
                onClick={createLoanRow}
                disabled={!broker || !vaultReady || loanPending || !!loan}
                className="w-full rounded bg-blue-600 text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loanPending ? "Creating loan…" : !vaultReady ? "Wait for Vault Phase..." : "Request Loan"}
              </button>
            </div>

            {brokerError && (
              <p className="mt-1 text-xs text-red-400">Error: {brokerError}</p>
            )}
            {loanError && (
              <p className="mt-1 text-xs text-red-400">Error: {loanError}</p>
            )}

            {loan ? (
              <div className="mt-3 pt-3 border-t border-accent/20">
                <p className="text-xs font-semibold text-bone mb-2">
                  Loan {loan.status === "repaid" ? "Repaid" : "Active"}
                </p>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Principal</span>
                  <span className="font-mono">{loan.principal} drops</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Rate</span>
                  <span className="font-mono">{loan.interestRate}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Term</span>
                  <span className="font-mono">{loan.term} payments</span>
                </div>

                {loan.status === "active" && (
                  <button
                    onClick={repayLoan}
                    disabled={payPending}
                    className="w-full mt-2 rounded bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50 hover:bg-[#B45309] transition"
                  >
                    {payPending ? "Repaying…" : "Repay"}
                  </button>
                )}
                {payError && (
                  <p className="mt-1 text-xs text-red-400">Error: {payError}</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-2">No active loans.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - LEDGER */}
        <div className="w-1/3 flex flex-col gap-3 min-w-0">
          <div className="border border-accent/30 rounded p-4 bg-[#1E293B]/50 flex flex-col gap-2 h-full">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">
                Ledger
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {transactions.length === 0 ? (
                <p className="text-xs text-slate-500">No transactions yet.</p>
              ) : (
                transactions.map((tx, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 px-2 py-1.5 rounded bg-[#0F172A]/30 border border-accent/10"
                  >
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>{tx.time}</span>
                      <span>{tx.type}</span>
                    </div>
                    <a
                      href={`https://devnet.xrpl.org/transactions/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent underline font-mono break-all hover:text-[#F59E0B] transition"
                    >
                      {tx.hash}
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}