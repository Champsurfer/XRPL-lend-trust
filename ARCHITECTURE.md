# XRPLendTrust — Architecture

How XRPLendTrust works, from the ledger up.

---

## 1. The Stack

| Layer | Choice | Why |
|---|---|---|
| Runtime | Node.js 20+ | The hackathon's recommended language; matches the official XRP Ledger reference app |
| Framework | Next.js 16 (App Router) | Server and client in one project; clean routing; SSR where useful |
| UI | React 19 + TypeScript | Type safety on every ledger call; components that hold state honestly |
| Styling | Tailwind CSS | Fast iteration; no CSS framework to learn |
| XRPL client | `xrpl.js` v5.2+ | The official JavaScript client for the XRP Ledger |
| Network | XRPL Devnet | The Lending Protocol and Single Asset Vaults are live here before Mainnet |
| Data | The ledger is the source of truth | No local database. If it is not on-chain, it is not real |

No proprietary dependencies. No closed-source parts.

---

## 2. The Protocol

XRPLendTrust builds on two XRP Ledger amendments, both
in validator voting at the time of writing:

  - **XLS-65 — Single Asset Vault.** The on-chain vault
    that holds pooled liquidity. Depositors receive
    vault shares (MPTs) proportional to their deposit.
  - **XLS-66 — Lending Protocol.** The broker, loan,
    and payment primitives that sit on top of the
    vault. A broker manages credit; a borrower signs
    a loan; the vault's depositors are made whole on
    repayment.

The two standards interlock. A lending app is a vault
with a broker on top. XRPLendTrust is that app.

**Multi-Purpose Tokens (MPTs).** Vault shares are
issued as MPTs — the XRP Ledger's native token
standard for semi-fungible assets. MPTs embed
compliance controls (freeze, clawback, authorization,
metadata) at the protocol level. That is what makes
the vault institutional-grade: the compliance lives
in the asset, not in a smart contract.

---

## 3. The Transaction Flow
```
Liquidity Provider Loan Broker Borrower
│ │ │
│ 1. VaultDeposit │ │
├───────────────────────────►│ │
│ (receives MPT shares) │ │
│ │ │
│ │ 2. LoanBrokerSet │
│ │ (creates broker, │
│ │ first-loss capital) │
│ │ │
│ │ 3. LoanBrokerCover │
│ │ Deposit │
│ │ │
│ │ 4. LoanSet │
│ │ (broker signs first) │
│ ├────────────────────────►│
│ │ │
│ │ 5. LoanSet │
│ │ (borrower signs) │
│ │◄────────────────────────┤
│ │ │
│ │ 6. LoanPay │
│ │ (principal + interest) │
│ │◄────────────────────────┤
│ │ │
│ 7. VaultWithdraw │ │
│◄───────────────────────────┤ │
│ (deposit + share of │ │
│ interest, MPTs burned) │ │
```

**Every step is one transaction.** Every transaction
gets a hash. Every hash is verifiable on
`devnet.xrpl.org`.

---

## 4. The Data Model

There is no local database. The ledger holds the
truth. The app reads it and shows it.

**On-chain state, read by the app:**

  - **Vault** — `Vault` ledger object. Assets held,
    share token ID, total shares outstanding.
  - **Broker** — `LoanBroker` ledger object. First-loss
    capital, terms, outstanding loan count.
  - **Loans** — `Loan` ledger objects. Principal,
    interest rate, term, borrower, status.
  - **MPT shares** — `MPToken` objects held by
    depositors. The share balance per wallet.
  - **Wallet balances** — XRP and any issued asset
    balances for the connected wallet.

**The app's own state (in memory, not persisted):**

  - The connected wallet (address, not seed — the seed
    never leaves the browser or the server env).
  - The current view: which vault, which loan, which
    action.
  - The queue of pending transactions (sent, awaiting
    validation).

**The rule: if it is not on-chain, it is not real.**
The UI never shows a number it did not read from
Devnet.

---

## 5. The State Discipline

Every screen shows honest state. This is the rule
that governs the UI:

  - **Empty vault** — the panel says *"Vault is empty."*
    It does not show a confident zero.
  - **Unfunded wallet** — the app says *"Wallet
    unfunded. Fund from the faucet?"* with one button.
  - **Failed transaction** — the app shows the reason.
    Not *"Error."* The actual `engine_result` from the
    ledger, in plain language.
  - **Pending transaction** — the row shows *"Pending"*
    with the hash, clickable.
  - **Validated transaction** — the row shows
    *"Validated"* with the hash, clickable.

A confident zero is a lie. XRPLendTrust does not lie.

---

## 6. The Wallet

XRPLendTrust uses a **server-held Devnet wallet** for
the demo, with the seed in an environment variable
that is never committed and never logged. The wallet
is a Devnet wallet only — it holds test XRP, not real
funds.

**What is not done:**

  - No private keys in the browser.
  - No seed in the UI.
  - No user wallet connection (Freighter, Xaman) in
    the demo — that is a later feature, named in the
    README as deferred.
  - No real funds. Ever.

---

## 7. The Security Model

  - **Devnet only.** The Lending Protocol is not on
    Mainnet. XRPLendTrust does not touch Mainnet.
  - **The seed is never exposed.** The wallet seed
    lives in the server environment. The app signs
    transactions server-side, then submits to the
    ledger.
  - **Every transaction is verifiable.** Every action
    produces a hash. Every hash opens on
    `devnet.xrpl.org`. A judge can verify every step.
  - **No secrets in the repo.** `.env` is gitignored.
    The README does not name any key, seed, or
    credential.
  - **The proof folder.** Every test run writes its
    transaction hashes to `proof/devnet-hashes.md`.
    The record of the demo is on disk, not in a
    screenshot.

---

## 8. The Directory Shape
XRPL-lend-trust/
├── README.md The front door
├── ARCHITECTURE.md This file
├── SETUP.md How to run it
├── TESTING.md How to prove it
├── DEMO.md The video plan
├── HELP/ Troubleshooting
├── LICENSE MIT
├── .gitignore No secrets
├── package.json
├── next.config.ts
├── app/ Next.js App Router
│ ├── page.tsx The dashboard
│ └── api/ Server routes for ledger calls
├── lib/
│ ├── vault.ts XLS-65 vault calls
│ ├── broker.ts XLS-66 broker calls
│ ├── loan.ts XLS-66 loan calls
│ └── client.ts The xrpl.js client setup
├── tests/
│ ├── unit/ Unit tests for each builder
│ └── integration/ Devnet integration tests
└── proof/
└── devnet-hashes.md Every transaction hash, verifiable

---

## 9. What Is Built, What Is Deferred

**Built (the chambers sealed so far):**
  - The project skeleton and README.
  - The demo plan.
  - The onboarding and handoff for AI sessions.
  - This architecture document.

**To be built (the chambers ahead):**
  - The Next.js scaffold (A1).
  - The vault integration — `VaultCreate`, `VaultDeposit`,
    `VaultWithdraw` (A2).
  - The broker integration — `LoanBrokerSet`,
    `LoanBrokerCoverDeposit` (A3).
  - The loan lifecycle — `LoanSet`, `LoanPay`,
    `LoanManage` (A4).
  - The client and dashboard (A5).
  - Tests and the proof folder (B1–B3).
  - The demo video (D1–D4).
  - The submission (E1–E3).

**Deferred (named honestly):**
  - User wallet connection (Freighter, Xaman).
  - Mainnet deployment — the protocol is not active
    on Mainnet yet.
  - Playlists, batch operations, and any feature
    beyond the core lifecycle.

---

## 10. The Closing

The ledger is the truth. The app reads it and shows
it honestly. Every transaction is verifiable. Every
state is named.

XRPLendTrust is a working system with a face. It is
what the Lending Protocol makes possible, built
before the room was furnished.

Trust, on the ledger.
