# The XRPLendTrust User Manual

## The Golden Rule

You must follow the order. The protocol has strict rules. You cannot skip steps.

---

## Step 1: Create the Vault

**Where:** The Vault column (left).

**What to enter:** You do not enter an amount here. Just click **Create Vault**.

**What happens:** The app creates an empty vault on Devnet. It starts a timer. For the first 12 seconds, the vault is in the Subscription phase.

**Why:** The protocol requires a subscription window to allow liquidity providers to deposit before the lending begins.

---

## Step 2: Fund the Vault (Deposit)

**Where:** The Vault column.

**What to enter:** Type `10000000` (which is 10 XRP in drops).

**When:** You must do this within the first 12 seconds after creating the vault.

**Why:** The protocol only allows deposits during the Subscription phase. Once the 12 seconds are up, the vault moves to the Investment phase, and deposits are locked out.

**What happens:** The Vault Assets update to 10,000,000 drops.

---

## Step 3: Create the Broker

**Where:** The Loan Desk column (center).

**What to enter:** You do not enter an amount. Just click **Create Broker (1 XRP Cover)**.

**When:** You can do this at any time after the vault exists. It does not depend on the timer.

**Why:** The broker manages the loans and provides the "First-Loss Capital" (the 1 XRP cover) that protects the depositors if a borrower defaults.

**What happens:** The app creates the broker, deposits 1 XRP of cover, and the "First-Loss Capital" updates to 1,000,000 drops.

---

## Step 4: Request the Loan

**Where:** The Loan Desk column.

**What to enter:**

- Principal: `1000000` (1 XRP)
- Rate: `500` (5%)
- Term: `4` (4 payment intervals)

**When:** You must wait at least 12 seconds after creating the vault. The vault must be in the Investment phase. The "Request Loan" button is disabled until the timer expires.

**Why:** The protocol does not allow loans during the Subscription phase. The app logic protects the vault by disabling the button until the Investment phase begins.

**What happens:** The loan is created, signed by the broker and the borrower, and becomes Active.

---

## Step 5: Repay the Loan

**Where:** The Loan Desk column.

**What to enter:** Nothing. Just click **Repay** on the Active Loan card.

**When:** After the loan is active.

**What happens:** The borrower repays the principal plus interest to the vault. The loan status changes to "Repaid".