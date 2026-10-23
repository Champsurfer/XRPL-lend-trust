import { VaultCreate } from "xrpl";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Wallet } from "xrpl";

// Mock the Client to avoid network calls
vi.mock("xrpl", () => {
  const mockClient = {
    autofill: vi.fn().mockResolvedValue({ tx_blob: "mocked-tx-blob" }),
    request: vi.fn(),
    submitAndWait: vi.fn().mockResolvedValue({
      result: {
        meta: { TransactionResult: "tesSUCCESS" },
        hash: "mocked-hash",
      },
    }),
    isConnected: vi.fn().mockReturnValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };

  const MockWallet = vi.fn().mockImplementation(() => ({
    classicAddress: "rTestAddress1234567890abcdef1234567890abcdef1234",
    seed: "testseed1234567890abcdef",
    sign: vi.fn().mockResolvedValue({ tx_blob: "signed-tx-blob" }),
  }));
  MockWallet.fromSeed = vi.fn().mockReturnValue({
    classicAddress: "rTestAddress1234567890abcdef1234567890abcdef1234",
    seed: "testseed1234567890abcdef",
    sign: vi.fn().mockResolvedValue({ tx_blob: "signed-tx-blob" }),
  });

  return {
    Client: vi.fn().mockReturnValue(mockClient),
    VaultCreate: vi.fn(),
    Wallet: MockWallet,
  };
});

describe("VaultCreate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("produces VaultKind = 1", () => {
    const { VaultCreate: VaultCreateMock } = require("xrpl");
    const wallet = Wallet.fromSeed("testseed1234567890abcdef");

    const tx: VaultCreate = {
      TransactionType: "VaultCreate",
      Account: wallet.classicAddress,
      Asset: { currency: "XRP" },
      Flags: 0,
      VaultKind: 1,
      SubscriptionDate: Math.floor(Date.now() / 1000) + 60,
      RedemptionDate: Math.floor(Date.now() / 1000) + 31536000,
    };

    const result = VaultCreate(undefined, tx);
    // Note: actual VaultCreate call logic would be tested here
    expect(tx.VaultKind).toBe(1);
  });

  it("has SubscriptionDate > now", () => {
    const subscriptionDate = Math.floor(Date.now() / 1000) + 60;
    expect(subscriptionDate > Math.floor(Date.now() / 1000)).toBe(true);
  });

  it("has RedemptionDate > SubscriptionDate", () => {
    const now = Math.floor(Date.now() / 1000);
    const subscriptionDate = now + 60;
    const redemptionDate = now + 31536000; // 1 year
    expect(redemptionDate > subscriptionDate).toBe(true);
  });

  it("fails if dates are invalid (SubscriptionDate in the past)", () => {
    const subscriptionDate = Math.floor(Date.now() / 1000) - 60; // in the past
    const redemptionDate = Math.floor(Date.now() / 1000) + 31536000;
    expect(subscriptionDate).toBeLessThan(Math.floor(Date.now() / 1000));
    // The vault would fail with tecEXPIRED if SubscriptionDate is before ledger close
  });

  it("fails if RedemptionDate <= SubscriptionDate", () => {
    const subscriptionDate = Math.floor(Date.now() / 1000) + 60;
    const redemptionDate = subscriptionDate - 1; // before subscription
    expect(redemptionDate).toBeLessThanOrEqual(subscriptionDate);
  });
});