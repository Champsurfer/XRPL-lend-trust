# XRPLendTrust — Onboarding for AI Sessions

You are building XRPLendTrust. Read this file before
you do anything else. Then read HANDOFF.md for the
current state. Then read the README.md for the
project's face.

## What XRPLendTrust Is

A working, stand-alone XRP Ledger lending integration.
Vaults, brokers, loans, and payments on XLS-65 and
XLS-66, on Devnet. Built in preparation for the
AI & Fintech XRPL Hackathon, 24–25 October 2026,
Lending & Borrowing track.

## The Rules That Govern This Build

  Rule 1  — Evidence only. Disk is truth. Read the
            file, not the memory of the file.
  Rule 2  — Read in full before writing. No skimming.
  Rule 3  — Every chamber gets a record. Write the
            Rule 13 entry when the chamber seals.
  Rule 4  — Back up before every write. Every file
            that is edited gets a .bak alongside it
            under 06_SYSTEM\rollback\.
  Rule 5  — Reconstruct after writing. Reverse the
            edit in memory from the backup. The
            reversed bytes must hash to the backup.
  Rule 6  — One chamber, one thing. Do not stack
            work. Do not expand scope.
  Rule 7  — Honest state. If a feature does not
            exist, the README must not promise it.
            A confident zero is a lie.
  Rule 8  — No loops. If a command fails, read the
            error and report. Do not retry blind.

## Token Discipline

  - Read the tail of a file, not the whole file.
  - Never paste a full stream.
  - Read only what the task requires.
  - No external calls without the Architect's word.

## The Discipline, Applied Here

The discipline that governs every chamber in this
project:

  1. One next thing. Not five. One.
  2. Small writes. Under 200 lines per chamber.
  3. Quote, do not paraphrase.
  4. Name the full path when naming a file.
  5. Back up before every write.
  6. Reconstruct after writing. Prove the change
     against the backup hash.
  7. Disk is truth. The record is the memory.
  8. Every chamber writes its record.

## The Current State

Read HANDOFF.md. The newest entry is the most recent
chamber. The file lists what is sealed and what is
open. Do not start a new chamber until the previous
one is sealed.

## The Stack

  - Next.js 16 (App Router), React 19, TypeScript
  - xrpl.js v5.2+ (the official XRP Ledger JS client)
  - Tailwind CSS
  - Devnet (wss://s.devnet.rippletest.net:51233)

## The Protocol

  XLS-65 — Single Asset Vault. On-chain vault that
           holds pooled liquidity.
  XLS-66 — Lending Protocol. Broker, loan, payment
           primitives on top of the vault.

Both are in validator voting. Both are live on
Devnet. Build against Devnet only.

## What Not to Include

  - No private names. No codewords, op names, or
    document names from outside this project.
    Nothing that would let a reader trace this
    build back to a private house.
  - No secrets. No API keys, no cookies, no wallet
    seeds, no personal data beyond the Architect's
    first name, city and the project name.
  - No promises the build cannot deliver. If a
    feature is deferred, name the deferral.

## How to Open a Chamber

  1. Read ONBOARD.md (this file).
  2. Read HANDOFF.md — the newest entry.
  3. Read the file the chamber touches.
  4. Name the chamber. Point at the skill, if any.
  5. Back up. Write. Reconstruct. Record.
  6. Append the chamber to HANDOFF.md.
  7. Stop. Wait for the Architect's word.

## The Public Face

README.md is the front door. DEMO.md is the video
plan. Both are public-safe. Both ship in the repo.

## The Closing

The work is honest. The record is current. The build
is the proof.

Trust, on the ledger.
