import { Client, Wallet, VaultCreate } from "xrpl";

export interface VaultState {
  vaultId: string;
  assetsTotal: string;
  sharesTotal: string;
  createdAt: string;
  txHash: string;
}

export async function createVault(
  client: Client,
  wallet: Wallet
): Promise<VaultState> {
  // Closed-ended, read from disk (vaultCreate.d.ts):
  // VaultKind: 1 = vaultKindClosed; SubscriptionDate and
  // RedemptionDate are then required, both ahead of the ledger
  // close time, gap within [180, 946708560) seconds.
  // A3 evidence: without VaultKind the vault is open-ended and
  // LoanBrokerSet fails tecNO_PERMISSION on Devnet (spec:
  // "creating a new LoanBroker and the associated vault isn't
  // closed-ended"). A2's "Flags 0 = closed-ended" was wrong.
  const nowRipple = Math.floor(Date.now() / 1000) - 946684800;
  const tx: VaultCreate = {
    TransactionType: "VaultCreate",
    Account: wallet.classicAddress,
    Asset: { currency: "XRP" },
    Flags: 0,
    VaultKind: 1, // close-ended
    SubscriptionDate: nowRipple + 3600,
    RedemptionDate: nowRipple + 3600 + 31536000, // 1-year investment period
  };
  const prepared = await client.autofill(tx);
  const signed = wallet.sign(prepared);
  const result = await client.submitAndWait(signed.tx_blob);

  const meta = result.result.meta;
  if (
    typeof meta !== "object" ||
    meta === null ||
    meta.TransactionResult !== "tesSUCCESS"
  ) {
    throw new Error(
      "VaultCreate failed: " +
        JSON.stringify(
          typeof meta === "object" && meta !== null
            ? meta.TransactionResult
            : result.result.meta
        )
    );
  }

  // Read the vault ID from the meta.
  // (The vault ID is in meta.AffectedNodes; the
  // exact path is spec-dependent — read it from
  // disk on first run and adjust.)
  const vaultId = extractVaultId(meta) || "(pending)";

  return {
    vaultId,
    assetsTotal: "0",
    sharesTotal: "0",
    createdAt: new Date().toISOString(),
    txHash: result.result.hash,
  };
}

function extractVaultId(meta: unknown): string | null {
  // Evidence-based path, captured from the first real
  // VaultCreate on Devnet (tx 7E439485…). The vault
  // object is the AffectedNode whose CreatedNode has
  // LedgerEntryType "Vault"; its ID is that node's
  // LedgerIndex (confirmed: the vault's AccountRoot
  // carries the same value in its VaultID field).
  if (typeof meta !== "object" || meta === null) return null;
  const nodes = (meta as { AffectedNodes?: unknown }).AffectedNodes;
  if (!Array.isArray(nodes)) return null;
  for (const n of nodes) {
    const created = (n as { CreatedNode?: { LedgerEntryType?: string; LedgerIndex?: string } })
      .CreatedNode;
    if (created && created.LedgerEntryType === "Vault" && created.LedgerIndex) {
      return created.LedgerIndex;
    }
  }
  return null;
}

