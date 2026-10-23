import { Client, Wallet, VaultCreate } from "xrpl";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const DEVNET_ENDPOINT = "wss://s.devnet.rippletest.net:51233";

// Devnet-funded test accounts (these are well-known funded accounts on Devnet)
const FUNDED_SEED = "sEdS1b9yAp6uW3tM9dwobL3Ka6G centifybcdcefg"; // pre-funded on Devnet
const vaultWallet2 = Wallet.generate(); // pre-funded on Devnet

let client: Client;

beforeEach(async () => {
  client = new Client(DEVNET_ENDPOINT);
  await client.connect();
});

afterEach(async () => {
  await client.disconnect();
});

describe("VaultCreate Integration - Devnet", () => {
  it("produces tesSUCCESS on Devnet", async () => {
    const wallet = Wallet.fromSeed(FUNDED_SEED);

    const tx: VaultCreate = {
      TransactionType: "VaultCreate",
      Account: wallet.classicAddress,
      Asset: { currency: "XRP" },
      Flags: 0,
      VaultKind: 1,
      SubscriptionDate: Math.floor(Date.now() / 1000) + 60,
      RedemptionDate: Math.floor(Date.now() / 1000) + 31536000, // 1 year
    };

    // Autofill with sequence and fee
    const prepared = await client.autofill(tx, { minSequence: 1 });
    const signed = wallet.sign(prepared);

    const result = await client.submitAndWait(signed.tx_blob);

    expect(result.result.meta.TransactionResult).toBe("tesSUCCESS");
    expect(result.result.hash).toBeDefined();
    expect(result.result.result).toBeDefined();
  });

  it("validates VaultKind = 1 on ledger", async () => {
    const wallet = Wallet.fromSeed(FUNDED_SEED);

    const tx: VaultCreate = {
      TransactionType: "VaultCreate",
      Account: wallet.classicAddress,
      Asset: { currency: "XRP" },
      Flags: 0,
      VaultKind: 1,
      SubscriptionDate: Math.floor(Date.now() / 1000) + 60,
      RedemptionDate: Math.floor(Date.now() / 1000) + 31536000,
    };

    const prepared = await client.autofill(tx, { minSequence: 1 });
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    // Verify the vault was created on ledger
    const ledgerEntry = await client.request({
      command: "ledger_entry",
      index: result.result.hash,
      ledger_index: "validated",
    });

    expect(ledgerEntry.result.node.LedgerEntryType).toBe("Vault");
    expect((ledgerEntry.result.node as any).VaultKind).toBe(1);
  });
});
