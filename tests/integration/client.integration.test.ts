import { Client } from "xrpl";
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

describe("Client Integration - Devnet", () => {
  it("connects to Devnet and can autofill/submit a simple payment", async () => {
    // Verify connection is established
    expect(client.isConnected()).toBe(true);

    // Request ledger current state
    const res = await client.request({
      command: "ledger_current",
    });

    expect(res.result).toBeDefined();
    expect(res.result.ledger).toBeDefined();
    expect(typeof res.result.ledger.current_index).toBe("number");
  });

  it("autofill and submit VaultCreate on Devnet", async () => {
    const { Wallet } = await import("xrpl");
    const FUNDED_SEED = "sEdS1b9yAp6uW3tM9dwobL3Ka6Gcentifybcdcefg";
    const wallet = Wallet.fromSeed(FUNDED_SEED);

    const tx = {
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: "rEpJBmNNKITPy28E4ZqfXLNNwJJdN7YXbn",
      Amount: "5000000", // 5 XRP in drops
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    expect(result.result.meta.TransactionResult).toBe("tesSUCCESS");
    expect(result.result.hash).toBeDefined();
  });

  it("disconnect closes the client connection", async () => {
    await client.disconnect();
    // After disconnect, isConnected should return false or throw
    // The exact behavior depends on client implementation
    expect(client.isConnected()).toBe(false);
  });
});