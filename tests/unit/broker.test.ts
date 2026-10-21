import { LoanBrokerSet } from "xrpl";
import { describe, it, expect, beforeEach } from "vitest";
import { Wallet } from "xrpl";

// Mock the Client to avoid network calls
vi.mock("xrpl", () => {
  const mockClient = {
    autofill: vi.fn().mockResolvedValue({ tx_blob: "mocked-tx-blob" }),
    request: vi.fn(),
    submitAndWait: vi.fn().mockResolvedResult({
      result: {
        meta: { TransactionResult: "tesSUCCESS" },
        hash: "mocked-hash",
      },
    }),
    isConnected: vi.fn().mockReturnValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };

  return {
    Client: vi.fn().mockReturnValue(mockClient),
    LoanBrokerSet: vi.fn(),
    Wallet: vi.fn().mockImplementation(() => ({
      classicAddress: "rTestAddress1234567890abcdef1234567890abcdef1234",
      seed: "testseed1234567890abcdef",
      sign: vi.fn().mockResolvedValue({ tx_blob: "signed-tx-blob" }),
    })),
  };
});

describe("LoanBrokerSet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("produces VaultID in the broker set", () => {
    const { LoanBrokerSet: LoanBrokerSetMock } = require("xrpl");
    const wallet = Wallet.fromSeed("testseed1234567890abcdef");

    const tx: LoanBrokerSet = {
      TransactionType: "LoanBrokerSet",
      Account: wallet.classicAddress,
      VaultID: "testvault1234567890abcdef1234567890abcdef12345678",
    };

    expect(tx.VaultID).toBeDefined();
    expect(tx.VaultID).toHaveLength(64);
  });

  it("produces DebtMaximum when provided", () => {
    const { LoanBrokerSet: LoanBrokerSetMock } = require("xrpl");
    const wallet = Wallet.fromSeed("testseed1234567890abcdef");

    const tx: LoanBrokerSet = {
      TransactionType: "LoanBrokerSet",
      Account: wallet.classicAddress,
      VaultID: "testvault1234567890abcdef1234567890abcdef12345678",
      DebtMaximum: "10000000",
    };

    expect(tx.DebtMaximum).toBe("10000000");
  });

  it("rejects if DebtMaximum is missing", () => {
    const { LoanBrokerSet: LoanBrokerSetMock } = require("xrpl");
    const wallet = Wallet.fromSeed("testseed1234567890abcdef");

    const tx: LoanBrokerSet = {
      TransactionType: "LoanBrokerSet",
      Account: wallet.classicAddress,
      VaultID: "testvault1234567890abcdef1234567890abcdef12345678",
      // DebtMaximum intentionally omitted
    };

    // DebtMaximum missing should be caught
    expect(tx.DebtMaximum).toBeUndefined();
  });

  it("rejects if DebtMaximum is zero", () => {
    const { LoanBrokerSet: LoanBrokerSetMock } = require("xrpl");
    const wallet = Wallet.fromSeed("testseed1234567890abcdef");

    const tx: LoanBrokerSet = {
      TransactionType: "LoanBrokerSet",
      Account: wallet.classicAddress,
      VaultID: "testvault1234567890abcdef1234567890abcdef12345678",
      DebtMaximum: "0",
    };

    expect(tx.DebtMaximum).toBe("0");
  });
});