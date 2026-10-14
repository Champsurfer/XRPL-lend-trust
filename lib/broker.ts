import {
  Client,
  Wallet,
  LoanBrokerSet,
  LoanBrokerCoverDeposit,
} from "xrpl";

export interface BrokerState {
  brokerId: string;
  vaultId: string;
  coverAvailable: string;
  coverRateMinimum: number;
  coverRateLiquidation: number;
  txHashCreate: string;
  txHashCover: string;
}

export async function createBroker(
  client: Client,
  wallet: Wallet,
  vaultId: string,
  coverAmount: string // drops, e.g. "1000000" = 1 XRP
): Promise<BrokerState> {
  // 1. LoanBrokerSet.
  // Fields read from disk (node_modules/xrpl/dist/npm/models/
  // transactions/loanBrokerSet.d.ts): VaultID required (64-hex);
  // LoanBrokerID, Data, ManagementFeeRate, DebtMaximum,
  // CoverRateMinimum, CoverRateLiquidation all optional. The
  // validator allows both cover rates zero or both non-zero.
  const setTx: LoanBrokerSet = {
    TransactionType: "LoanBrokerSet",
    Account: wallet.classicAddress,
    VaultID: vaultId,
    CoverRateMinimum: 0,
    CoverRateLiquidation: 0,
  };
  const prepared = await client.autofill(setTx);
  const signed = wallet.sign(prepared);
  const setResult = await client.submitAndWait(signed.tx_blob);
  const setMeta = setResult.result.meta;
  if (
    typeof setMeta !== "object" ||
    setMeta === null ||
    setMeta.TransactionResult !== "tesSUCCESS"
  ) {
    throw new Error(
      "LoanBrokerSet failed: " +
        JSON.stringify(
          typeof setMeta !== "object" || setMeta === null
            ? setResult.result.meta
            : setMeta.TransactionResult
        )
    );
  }

  const brokerId = extractBrokerId(setMeta);
  if (!brokerId) {
    // LoanBrokerCoverDeposit requires a 64-hex LoanBrokerID
    // (validated against isLedgerEntryId), so a "(pending)"
    // placeholder would fail. Surface the validated meta as
    // evidence instead — resolve the path, or name it as an
    // open item for A4.
    throw new Error(
      "LoanBrokerSet tesSUCCESS but broker ID not found in meta " +
        "— open item for A4. meta: " +
        JSON.stringify(setMeta)
    );
  }

  // 2. LoanBrokerCoverDeposit.
  // Fields read from disk (loanBrokerCoverDeposit.d.ts):
  // LoanBrokerID required (64-hex), Amount required
  // (drops string for XRP).
  const coverTx: LoanBrokerCoverDeposit = {
    TransactionType: "LoanBrokerCoverDeposit",
    Account: wallet.classicAddress,
    LoanBrokerID: brokerId,
    Amount: coverAmount,
  };
  const prepared2 = await client.autofill(coverTx);
  const signed2 = wallet.sign(prepared2);
  const coverResult = await client.submitAndWait(signed2.tx_blob);
  const coverMeta = coverResult.result.meta;
  if (
    typeof coverMeta !== "object" ||
    coverMeta === null ||
    coverMeta.TransactionResult !== "tesSUCCESS"
  ) {
    throw new Error(
      "LoanBrokerCoverDeposit failed: " +
        JSON.stringify(
          typeof coverMeta !== "object" || coverMeta === null
            ? coverResult.result.meta
            : coverMeta.TransactionResult
        )
    );
  }

  return {
    brokerId,
    vaultId,
    coverAvailable: coverAmount,
    coverRateMinimum: 0,
    coverRateLiquidation: 0,
    txHashCreate: setResult.result.hash,
    txHashCover: coverResult.result.hash,
  };
}

function extractBrokerId(meta: unknown): string | null {
  // Evidence-based path, same shape as A2's extractVaultId:
  // AffectedNode -> CreatedNode with LedgerEntryType "LoanBroker"
  // -> its LedgerIndex is the broker ID. ("LoanBroker" confirmed
  // from LoanBroker.d.ts on disk: LedgerEntryType: 'LoanBroker'.)
  // Verify against the first real validated meta on Devnet.
  if (typeof meta !== "object" || meta === null) return null;
  const nodes = (meta as { AffectedNodes?: unknown }).AffectedNodes;
  if (!Array.isArray(nodes)) return null;
  for (const n of nodes) {
    const created = (
      n as {
        CreatedNode?: { LedgerEntryType?: string; LedgerIndex?: string };
      }
    ).CreatedNode;
    if (
      created &&
      created.LedgerEntryType === "LoanBroker" &&
      created.LedgerIndex
    ) {
      return created.LedgerIndex;
    }
  }
  return null;
}
