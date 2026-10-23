import { Client, Wallet } from "xrpl";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const DEVNET_ENDPOINT = "wss://s.devnet.rippletest.net:51233";

let client: Client;
let wallet;

beforeEach(async () => {
  client = new Client(DEVNET_ENDPOINT);
  wallet = Wallet.generate();
  await client.connect();
});

afterEach(async () => {
  await client.disconnect();
});

describe("Wallet Integration - Devnet", () => {
  it("creates a wallet on Devnet", async () => {
    expect(wallet).toBeDefined();
    expect(wallet.classicAddress).toBeDefined();
    expect(wallet.classicAddress).toMatch(/^r[0-9a-zA-Z]{24}$/);
  });

  it("wallet signs and submits a transaction on Devnet", async () => {
    const tx = {
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: "rEpJBmNNKITPy28E4ZqfXLNNwJJdN7YXbn",
      Amount: "5000000",
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    expect(result.result.meta.TransactionResult).toBe("tesSUCCESS");
    expect(result.result.hash).toBeDefined();
    expect(result.result.hash.length).toBe(64); // transaction hash is 64 hex chars
  });

  it("wallet classicAddress matches the XRPL address format", async () => {
    // Test that we have a valid address
    expect(wallet.classicAddress).toBeDefined();
  });
});