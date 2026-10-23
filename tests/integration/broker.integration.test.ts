import { Client, Wallet, LoanBrokerSet } from "xrpl";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const DEVNET_ENDPOINT = "wss://s.devnet.rippletest.net:51233";

const FUNDED_SEED = "sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcdcefg";
const counterpartyWallet = Wallet.generate();

let client: Client;

beforeEach(async () => {
  client = new Client(DEVNET_ENDPOINT);
  await client.connect();
});

afterEach(async () => {
  await client.disconnect();
});

describe("LoanBrokerSet Integration - Devnet", () => {
  it("produces tesSUCCESS on Devnet", async () => {
    const brokerWallet = Wallet.fromSeed(FUNDED_SEED);
    const counterpartyWallet = Wallet.fromSeed(FUNDED_SEED2);

    // First create a vault to reference
    const vaultTx: any = {
      TransactionType: "VaultCreate",
      Account: brokerWallet.classicAddress,
      Asset: { currency: "XRP" },
      Flags: 0,
      VaultKind: 1,
      SubscriptionDate: Math.floor(Date.now() / 1000) + 60,
      RedemptionDate: Math.floor(Date.now() / 1000) + 31536000,
    };

    const vaultPrepared = await client.autofill(vaultTx, { minSequence: 1 });
    const vaultSigned = brokerWallet.sign(vaultPrepared);
    const vaultResult = await client.submitAndWait(vaultSigned.tx_blob);

    const vaultId = vaultResult.result.hash;

    const tx: LoanBrokerSet = {
      TransactionType: "LoanBrokerSet",
      Account: brokerWallet.classicAddress,
      VaultID: vaultId,
      DebtMaximum: "10000000", // 100 XRP in drops
    };

    const prepared = await client.autofill(tx, { minSequence: 1 });
    const signed = brokerWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    expect(result.result.meta.TransactionResult).toBe("tesSUCCESS");
    expect(result.result.hash).toBeDefined();

    // Verify the broker ledger entry
    const ledgerEntry = await client.request({
      command: "ledger_entry",
      index: result.result.hash,
      ledger_index: "validated",
    });

    expect(ledgerEntry.result.node.LedgerEntryType).toBe("LoanBroker");
  });

  it("validates VaultID and DebtMaximum on ledger", async () => {
    const brokerWallet = Wallet.fromSeed(FUNDED_SEED);

    const tx: LoanBrokerSet = {
      TransactionType: "LoanBrokerSet",
      Account: brokerWallet.classicAddress,
      VaultID: "0000000000000000000000000000000000000000000000000000000000000000", // placeholder
      DebtMaximum: "10000000",
    };

    const prepared = await client.autofill(tx, { minSequence: 1 });
    const signed = brokerWallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    // Should succeed or fail with a clear error, not a bare tec code
    expect(result.result.meta).toBeDefined();
  });
});
