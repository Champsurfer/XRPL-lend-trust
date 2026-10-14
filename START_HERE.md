# START HERE — the wake-up prompt for a new session

This is the front door for any AI session that picks up
XRPLendTrust cold. Paste the block at the bottom into a
fresh chat. It turns a new session into the builder.

This file does not hold the memory. It points at the two
files that do:

  - ONBOARD.md  — the rules, the discipline, the stack,
                  the protocol, how to open a chamber.
  - HANDOFF.md  — the thread. Newest entry at the top.
                  It names what is sealed and what is next.

Read those two. They are the memory. This file is the key.

---

## Where the build stands (as of 2026-10-14)

  Chamber A1 — The Scaffold — SEALED.

  Sealed before it:
    C0   ONBOARD.md + HANDOFF.md (the onboarding + thread)
    C1   README.md (the front door)
    C2   ARCHITECTURE.md (the technical map)
    C1-fix  README polish (email removed, headers added,
           ARCHITECTURE tidy)
    D-Video DEMO.md (the demo plan)
    A1   Next.js 16 scaffold — the first code

  On disk:
    Next.js 16.4.0 (App Router), React 19.3.0,
    TypeScript, Tailwind CSS, xrpl.js 5.3.0.
    app/page.tsx reads "XRPLendTrust".
    lib/vault.ts, lib/broker.ts, lib/loan.ts,
    lib/client.ts — comment-only placeholders.
    Build 0/0. Page loads (HTTP 200).
    Folder is under git. Tree clean.

  Next single action:
    Chamber A2 — The Vault.
    XLS-65 calls in lib/vault.ts:
    VaultCreate, VaultDeposit, VaultWithdraw.

## The rules in one breath

  Evidence only. Disk is truth. Read the file, not the
  memory of the file. One chamber, one thing. Back up
  before every write. Reconstruct after. Public-safe: no
  private names, no secrets, no email. Every chamber
  appends to HANDOFF.md, newest at the top, and commits.

## How to run it

  cd C:\Users\Warren Champion\Desktop\XRPL-lend-trust
  npm install       (already done; node_modules present)
  npm run dev       (http://localhost:3000)
  npm run build     (must stay 0 errors)

---

## PASTE THIS INTO A FRESH CHAT

> You are Cline, the builder of XRPLendTrust — a
> stand-alone XRP Ledger lending integration (XLS-65
> vaults, XLS-66 lending) on Devnet, built for the AI &
> Fintech XRPL Hackathon, Lending & Borrowing track.
>
> The project lives at:
>   C:\Users\Warren Champion\Desktop\XRPL-lend-trust\
>
> Before you do anything else, read these two files, in
> this order, in full:
>   1. C:\Users\Warren Champion\Desktop\XRPL-lend-trust\ONBOARD.md
>   2. C:\Users\Warren Champion\Desktop\XRPL-lend-trust\HANDOFF.md
>
> ONBOARD.md holds the rules and the discipline. HANDOFF.md
> holds the thread — the newest entry is the current
> chamber. Confirm you hold both. Name the working chamber
> from the newest HANDOFF entry. Point at the right skill
> before writing new code; if none applies, say so.
>
> The build is chamber by chamber. Evidence only — disk is
> truth. Public-safe: no private names, no secrets, no
> email. The next single action is Chamber A2 — The Vault.
> Do not start it until you have read ONBOARD.md and
> HANDOFF.md and confirmed the current state from disk.
>
> Trust, on the ledger.
