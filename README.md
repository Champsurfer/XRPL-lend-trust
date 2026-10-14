# XRPLendTrust

### `XRPL-lend-trust`

> A stand-alone XRP Ledger lending integration. Vaults, brokers, loans,
> and the trust that carries them. Built on XLS-65 and XLS-66.
> Devnet-ready.

---

## What This Is

XRPLendTrust is a working, stand-alone integration for the XRP Ledger's
Lending Protocol. It creates single-asset vaults, sets up loan brokers,
writes dual-signature loans, and settles payments — end to end, on the
XRPL Devnet, with real transactions and live state.

It is not a tutorial. It is not a mockup. It is a running system.

The XRP Ledger's Lending Protocol — XLS-65 (Single Asset Vaults) and
XLS-66 (Lending Protocol) — is the first native, uncollateralized credit
rail on a public blockchain. It is in validator voting now. When it
activates, institutions and individuals will be able to lend and borrow
against real-world underwriting, on-chain, without a bank in the middle.

XRPLendTrust is built for that moment.

---

## Why It Exists

Most of what exists today for XLS-65 and XLS-66 is scaffolding: a
reference app that demonstrates the primitives, a credit-scoring demo
that shows what a grade spectrum could look like. Useful, and correct.
But not a working system with a face.

XRPLendTrust is a working system with a face.

It shows the full lifecycle:

  - **Deposit** — a liquidity provider funds a vault.
  - **Broker** — a loan broker is created with first-loss capital.
  - **Loan** — a borrower requests a loan; both parties sign.
  - **Pay** — the borrower repays; the vault's depositors are made whole.
  - **Settle** — the loan closes cleanly, on-chain, with a hash you can
    verify.

Every transaction is real. Every hash is on Devnet. Nothing is mocked.

---

## What It Is Not

  - **Not Mainnet.** The Lending Protocol is still in validator voting.
    XRPLendTrust runs on Devnet only. No real funds are involved.
  - **Not a bank.** It does not hold custody, does not issue real credit,
    does not have regulatory approval anywhere in the world.
  - **Not production.** It is a demonstration of what the protocol makes
    possible. Treat it as a working proof, not a product.

---

## Quick Start

```bash
git clone https://github.com/[your-github-username]/XRPL-lend-trust.git
cd XRPL-lend-trust
npm install
npm run dev
```

Open http://localhost:3000.

The app connects to the XRPL Devnet. The first time you run it, the
setup wizard will:

Generate a Devnet wallet (or use one you provide).

Fund it from the XRPL Devnet faucet.

Set the trust line for the asset you want to vault.

Then you are ready to deposit, broker and lend.

Full setup instructions: see SETUP.md.

## Demo

A recorded walkthrough of XRPLendTrust, showing the full lifecycle from
deposit to settlement, is available here:

Video: [link to demo video]

The demo script and step-by-step reproduction instructions are in
DEMO.md.

## How It Works

At a high level:

text
```
  Liquidity Provider          Loan Broker               Borrower
        │                          │                       │
        │  VaultDeposit            │                       │
        ├─────────────────────────►│                       │
        │                          │  LoanBrokerSet        │
        │                          ├──────────────────────►│
        │                          │  LoanBrokerCoverDeposit
        │                          │                       │
        │                          │  LoanSet (broker sign)│
        │                          ├──────────────────────►│
        │                          │  LoanSet (borrower sign)
        │                          │◄──────────────────────┤
        │                          │                       │
        │                          │  LoanPay              │
        │                          │◄──────────────────────┤
        │  VaultWithdraw           │                       │
        │◄─────────────────────────┤                       │
```
The ledger is the source of truth. Every state on screen is read from
Devnet, not guessed locally. If the vault is empty, the UI says so. If
the wallet is unfunded, it says so. No confident zeros.

Full architecture: see ARCHITECTURE.md.

## Testing

bash
npm test
The test suite runs against XRPL Devnet. It creates a vault, sets up a
broker, writes a loan, pays it then settles it — and reports every
transaction hash so you can verify each step yourself.

A record of a complete Devnet run, with verifiable hashes, is in
proof/devnet-hashes.md.

Full testing guide: see TESTING.md.

## Protocol References

XRPLendTrust is built directly against the published XRPL standards:

XLS-65 — Single Asset Vault: the on-chain vault that holds
pooled liquidity.

XLS-66 — Lending Protocol: the broker, loan, and payment
primitives that sit on top of the vault.

Both are currently in validator voting on the XRP Ledger. Once active,
the same code runs on Mainnet without change.

XLS-65 specification

XLS-66 specification

## Stack

Next.js 16 (App Router), React 19, TypeScript

xrpl.js v5.2+ — the official XRP Ledger JavaScript client

Tailwind CSS — for the interface

Devnet — the test network where the Lending Protocol is live

No proprietary dependencies. No closed-source parts. Clone, read, run.

## License

XRPLendTrust is released under the MIT License for the public
submission. See LICENSE.

A separate private edition of this work is licensed under
AGPL-3.0. This public repository is a self-contained integration;
it does not include, depend on, or reference any private code.

## Status

Devnet-ready. Working proof of the XRP Ledger Lending Protocol,
built in preparation for the AI & Fintech XRPL Hackathon, 24–25 October
2026, Lending & Borrowing track.

Not Mainnet. Not production. Not a bank. A working demonstration of
what the protocol makes possible.

## Contact

Built in South Africa by Warren Champion.
For the XRP Ledger community.

Trust, on the ledger. Proposed name is : XRPLendTrust

