import {
  Client,
  Wallet,
  LoanSet,
  LoanPay,
  LoanManage,
  LoanPayFlags,
  signLoanSetByCounterparty,
} from "xrpl";

export interface LoanState {
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
  // Signatures shown on the row (both are public on-ledger hex).
  brokerSignature: string;
  borrowerSignature: string;
}

// Payment schedule constants. Fields read from disk
// (node_modules/xrpl/dist/npm/models/transactions/loanSet.d.ts):
// there is NO "Term" field. The term the brief names maps to
// PaymentTotal (payment count); PaymentInterval (seconds between
// payments, validator MIN 60) and GracePeriod (must not exceed
// PaymentInterval) complete the schedule.
const PAYMENT_INTERVAL = 2592000; // 30 days in seconds
const GRACE_PERIOD = 86400; // 1 day, <= PAYMENT_INTERVAL
const MIN_PAYMENT_INTERVAL = 60; // validator floor (loanSet.js on disk)

export async function createLoan(
  client: Client,
  brokerWallet: Wallet,
  borrowerWallet: Wallet,
  brokerId: string,
  vaultId: string,
  principalDrops: string,
  interestRate: number,
  term: number
): Promise<LoanState> {
  // DUAL-SIGNATURE FLOW — confirmed from disk in
  // node_modules/xrpl/dist/npm/Wallet/counterpartySigner.js:
  //   1. Broker signs the LoanSet first (signLoanSetByCounterparty
  //      throws "must be first signed by first party" without it).
  //   2. Borrower signs the SAME decoded tx via
  //      signLoanSetByCounterparty -> CounterpartySignature added.
  //   3. The combined blob is submitted. This is NOT a top-level
  //      SignerList multisign — it is XLS-66's nested
  //      CounterpartySignature structure.
  // SCHEDULE FIT — tecNO_PERMISSION cause 3: the final scheduled
  // payment (origination + PaymentInterval * PaymentTotal) must land
  // at least 60s before the vault's RedemptionDate (go-xrpl:
  // finalPayment + vault.LoanRedemptionBuffer > RedemptionDate).
  // Ruling: shorten the term first, then the interval (validator
  // MIN 60). If no legal schedule fits the window, fail loudly —
  // the vault needs a longer RedemptionDate, not another retry.
  const vaultNode = (
    await client.request({
      command: "ledger_entry",
      index: vaultId,
      ledger_index: "validated",
    })
  ).result.node as { SubscriptionDate?: number; RedemptionDate?: number };
  const nowRipple = Math.floor(Date.now() / 1000) - 946684800;
  if (
    typeof vaultNode.SubscriptionDate === "number" &&
    typeof vaultNode.RedemptionDate === "number" &&
    (nowRipple < vaultNode.SubscriptionDate ||
      nowRipple >= vaultNode.RedemptionDate)
  ) {
    // Mirrors the server rule: loans originate only in the Investment
    // phase — fail with a clear message instead of a bare tecNO_PERMISSION.
    throw new Error(
      "vault not in Investment phase (now " +
        nowRipple +
        ", SubscriptionDate " +
        vaultNode.SubscriptionDate +
        ", RedemptionDate " +
        vaultNode.RedemptionDate +
        ")"
    );
  }
  const guard = 60; // seconds of latency slack (build → validated close)
  let interval = PAYMENT_INTERVAL;
  let total = term;
  if (typeof vaultNode.RedemptionDate === "number") {
    const usable = vaultNode.RedemptionDate - 60 - nowRipple - guard;
    if (
      nowRipple + guard + interval * total >=
      vaultNode.RedemptionDate - 60
    ) {
      const maxTotal = Math.floor(usable / interval);
      if (maxTotal >= 1) {
        total = Math.min(total, maxTotal); // 1. shorten the term
      } else {
        interval = Math.floor(usable / Math.max(total, 1)); // 2. the interval
        if (interval < MIN_PAYMENT_INTERVAL) {
          interval = MIN_PAYMENT_INTERVAL;
          total = Math.min(term, Math.floor(usable / MIN_PAYMENT_INTERVAL));
        }
        if (interval < MIN_PAYMENT_INTERVAL || total < 1) {
          throw new Error(
            "vault redemption window too short for any legal payment " +
              "schedule (usable " +
              usable +
              "s) — create a vault with a longer RedemptionDate"
          );
        }
      }
    }
  }
  const grace = Math.min(GRACE_PERIOD, interval);

  const baseTx: LoanSet = {
    TransactionType: "LoanSet",
    Account: brokerWallet.classicAddress,
    LoanBrokerID: brokerId,
    PrincipalRequested: principalDrops,
    Counterparty: borrowerWallet.classicAddress,
    InterestRate: interestRate,
    PaymentTotal: total,
    PaymentInterval: interval,
    GracePeriod: grace,
  };

  const prepared = await client.autofill(baseTx);

  // 1. Broker signs first.
  const brokerSigned = brokerWallet.sign(prepared);

  // 2. Borrower counterparty-signs the same blob.
  const counterpartySigned = signLoanSetByCounterparty(
    borrowerWallet,
    brokerSigned.tx_blob
  );

  // 3. Submit the combined transaction.
  const setResult = await client.submitAndWait(counterpartySigned.tx_blob);
  const meta = setResult.result.meta;
  if (
    typeof meta !== "object" ||
    meta === null ||
    meta.TransactionResult !== "tesSUCCESS"
  ) {
    throw new Error(
      "LoanSet failed: " +
        JSON.stringify(
          typeof meta !== "object" || meta === null ? meta : meta.TransactionResult
        ) +
        " meta: " +
        JSON.stringify(meta)
    );
  }

  const loanId = extractLoanId(meta);
  if (!loanId) {
    // LoanPay requires a 64-hex LoanID (isLedgerEntryId, proven
    // from loanPay.js on disk) — a placeholder would fail there.
    // Surface the validated meta instead of guessing.
    throw new Error(
      "LoanSet tesSUCCESS but loan ID not found in meta. meta: " +
        JSON.stringify(meta)
    );
  }

  const brokerSig =
    (counterpartySigned.tx.TxnSignature as string | undefined) || "";
  const cps = counterpartySigned.tx.CounterpartySignature;
  const borrowerSig = cps
    ? ((cps.TxnSignature as string | undefined) ||
      (cps.Signers?.[0]?.Signer?.TxnSignature as string | undefined) ||
      "")
    : "";

  return {
    loanId,
    brokerId,
    vaultId,
    principal: principalDrops,
    interestRate,
    term: total, // effective payment count (fit may shorten it)
    borrower: borrowerWallet.classicAddress,
    status: "active",
    txHashSet: setResult.result.hash,
    txHashPay: null,
    brokerSignature: brokerSig,
    borrowerSignature: borrowerSig,
  };
}

export async function payLoan(
  client: Client,
  borrowerWallet: Wallet,
  loanId: string
): Promise<{ txHashPay: string; amount: string; status: string }> {
  // Read the Loan ledger object first for the outstanding value
  // (Loan.d.ts: TotalValueOutstanding) — evidence, not arithmetic.
  const node = await readLoan(client, loanId);
  const outstanding = (node as { TotalValueOutstanding?: unknown })
    .TotalValueOutstanding;
  if (typeof outstanding !== "string" && typeof outstanding !== "number") {
    throw new Error(
      "TotalValueOutstanding missing on Loan: " + JSON.stringify(node)
    );
  }
  const amount = String(outstanding);

  // Fields from loanPay.d.ts: LoanID (64-hex, validator-enforced),
  // Amount required, Flags — exactly one of late/full/overpayment.
  // The borrower signs: Account is the counterparty of LoanSet.
  const payTx: LoanPay = {
    TransactionType: "LoanPay",
    Account: borrowerWallet.classicAddress,
    LoanID: loanId,
    Amount: amount,
    Flags: LoanPayFlags.tfLoanFullPayment,
  };
  const prepared = await client.autofill(payTx);
  const signed = borrowerWallet.sign(prepared);
  const payResult = await client.submitAndWait(signed.tx_blob);
  const meta = payResult.result.meta;
  if (
    typeof meta !== "object" ||
    meta === null ||
    meta.TransactionResult !== "tesSUCCESS"
  ) {
    throw new Error(
      "LoanPay failed: " +
        JSON.stringify(
          typeof meta !== "object" || meta === null ? meta : meta.TransactionResult
        ) +
        " meta: " +
        JSON.stringify(meta)
    );
  }
  return {
    txHashPay: payResult.result.hash,
    amount,
    status: "repaid",
  };
}

export async function readLoan(
  client: Client,
  loanId: string
): Promise<unknown> {
  const res = await client.request({
    command: "ledger_entry",
    index: loanId,
    ledger_index: "validated",
  });
  return res.result.node;
}

export async function manageLoan(
  client: Client,
  wallet: Wallet,
  loanId: string,
  flags: {
    tfLoanDefault?: boolean;
    tfLoanImpair?: boolean;
    tfLoanUnimpair?: boolean;
  }
): Promise<string> {
  // LoanManage typed from loanManage.d.ts: LoanID required,
  // exactly one flag (tfLoanDefault 65536 / tfLoanImpair 131072 /
  // tfLoanUnimpair 26144 — validator forbids more than one).
  // Not wired to the page — the lifecycle hook for a later chamber.
  const tx: LoanManage = {
    TransactionType: "LoanManage",
    Account: wallet.classicAddress,
    LoanID: loanId,
    Flags: flags,
  };
  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const res = await client.submitAndWait(signed.tx_blob);
  const meta = res.result.meta;
  if (
    typeof meta !== "object" ||
    meta === null ||
    meta.TransactionResult !== "tesSUCCESS"
  ) {
    throw new Error(
      "LoanManage failed: " +
        JSON.stringify(
          typeof meta !== "object" || meta === null ? meta : meta.TransactionResult
        )
    );
  }
  return res.result.hash;
}

function extractLoanId(meta: unknown): string | null {
  // Same evidence shape as A2's extractVaultId and A3's
  // extractBrokerId: AffectedNodes -> CreatedNode with
  // LedgerEntryType "Loan" -> LedgerIndex is the loan ID.
  // ("Loan" confirmed from Loan.d.ts: LedgerEntryType: 'Loan'.)
  // Verified against the first real validated meta on Devnet.
  if (typeof meta !== "object" || meta === null) return null;
  const nodes = (meta as { AffectedNodes?: unknown }).AffectedNodes;
  if (!Array.isArray(nodes)) return null;
  for (const n of nodes) {
    const created = (
      n as {
        CreatedNode?: { LedgerEntryType?: string; LedgerIndex?: string };
      }
    ).CreatedNode;
    if (created && created.LedgerEntryType === "Loan" && created.LedgerIndex) {
      return created.LedgerIndex;
    }
  }
  return null;
}


