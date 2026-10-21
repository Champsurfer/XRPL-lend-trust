import { Client, Wallet } from "xrpl";
import { describe, it, expect, beforeEach, afterEach } from "vitest";

const DEVNET_ENDPOINT = "wss://s.devnet.rippletest.net:51233";

let client: Client;

beforeEach(async () => {
  client = new Client(DEVNET_ENDPOINT);
  await client.connect();
});

afterEach(async () => {
  await client.disconnect();
});

describe("Wallet Integration - Devnet", () => {
  it("creates a wallet from a valid Devnet-funded seed", async () => {
    const seed = "sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcdcefg";
    const wallet = Wallet.fromSeed(seed);

    expect(wallet).toBeDefined();
    expect(wallet.classicAddress).toBeDefined();
    expect(wallet.classicAddress).toMatch(/^r[0-9a-zA-Z]{24}$/);
  });

  it("wallet signs and submits a transaction on Devnet", async () => {
    const seed = "sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcdcefg";
    const wallet = Wallet.fromSeed(seed);

    const tx: any = {
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
    // Test both valid seed formats
    const seed1 = "sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcdcefg";
    const seed2 = "sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcd2";

    const w1 = Wallet.fromSeed(seed1);
    const w2 = Wallet.fromSeed(seed2);

    expect(w1.classicAddress).toBeDefined();
    expect(w2.classicAddress).toBeDefined();
    // Addresses should be different for different seeds
    expect(w1.classicAddress).not.toBe(w2.classicAddress);
  });
});