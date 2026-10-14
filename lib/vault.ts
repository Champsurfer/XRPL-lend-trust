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
  const tx: VaultCreate = {
    TransactionType: "VaultCreate",
    Account: wallet.classicAddress,
    Asset: { currency: "XRP" },
    Flags: 0, // closed-ended
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

