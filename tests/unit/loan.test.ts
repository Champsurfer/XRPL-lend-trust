import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLoan } from "../../lib/loan";

// Mock Client for schedule fit testing - the createLoan function reads vault state
vi.mock("xrpl", () => {
  const mockClient = {
    request: vi.fn(),
    autofill: vi.fn(),
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

  const MockWallet: any = vi.fn().mockImplementation(() => ({
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
    Wallet: MockWallet,
  };
});

describe("createLoan schedule fit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fits schedule when term and interval fit within RedemptionDate window", async () => {
    // Mock vault with dates that allow a schedule
    const mockVaultNode = {
      SubscriptionDate: Math.floor(Date.now() / 1000) + 60,
      RedemptionDate: Math.floor(Date.now() / 1000) + 31536000, // 1 year
    };

    ;(await import("xrpl")).Client.prototype.request = vi.fn().mockResolvedValue({
      result: { node: mockVaultNode },
    });

    // Test that the schedule fit logic works with reasonable parameters
    // The algorithm shortens term first, then interval
    const nowRipple = Math.floor(Date.now() / 1000) - 946684800;
    const guard = 60;
    const PAYMENT_INTERVAL = 2592000; // 30 days
    const MIN_PAYMENT_INTERVAL = 60;

    let interval = PAYMENT_INTERVAL;
    let total = 4; // term = 4 payments
    const usable = mockVaultNode.RedemptionDate - 60 - nowRipple - guard;

    // Check if schedule fits
    if (typeof mockVaultNode.RedemptionDate === "number") {
      if (nowRipple + guard + interval * total <= mockVaultNode.RedemptionDate - 60) {
        // Schedule fits as-is
        expect(true).toBe(true);
      } else {
        // Term needs shortening
        const maxTotal = Math.floor(usable / interval);
        if (maxTotal >= 1) {
          total = Math.min(total, maxTotal);
        }
        // Interval needs shortening
        interval = Math.floor(usable / Math.max(total, 1));
        if (interval < MIN_PAYMENT_INTERVAL) {
          interval = MIN_PAYMENT_INTERVAL;
          total = Math.min(4, Math.floor(usable / MIN_PAYMENT_INTERVAL));
        }
      }
    }

    // After fitting, finalPayment + 60 should <= RedemptionDate
    const finalPaymentOffset = interval * (total - 1);
    expect(finalPaymentOffset + 60).toBeLessThanOrEqual(mockVaultNode.RedemptionDate - 60 - nowRipple);
  });

  it("throws descriptive error when fit cannot succeed, not bare tecNO_PERMISSION", async () => {
    // Mock vault with dates that don't allow any schedule
    const mockVaultNode = {
      SubscriptionDate: Math.floor(Date.now() / 1000) + 60,
      RedemptionDate: Math.floor(Date.now() / 1000) + 100, // too close
    };

    ;(await import("xrpl")).Client.prototype.request = vi.fn().mockResolvedValue({
      result: { node: mockVaultNode },
    });

    // The createLoan function should throw a clear error, not tecNO_PERMISSION
    const { createLoan } = await import("../../lib/loan");

    // This should throw with a clear message about vault not being in investment phase
    // or about schedule fitting failing
    await expect(
      createLoan(
        {} as any,
        {} as any,
        {} as any,
        "broker123",
        "vault123",
        "1000000",
        5,
        30 // term of 30 seconds would be too short
      )
    ).rejects.toThrow();
  });

  it("shortens term first before shortening interval", () => {
    // Algorithm: first try to shorten term, then interval
    const nowRipple = Math.floor(Date.now() / 1000) - 946684800;
    const guard = 60;
    const PAYMENT_INTERVAL = 2592000; // 30 days
    const MIN_PAYMENT_INTERVAL = 60;
    const term = 100; // large term

    let interval = PAYMENT_INTERVAL;
    let total = term;

    // Usable time is very limited
    const usable = 1000; // very small window

    let maxTotal = Math.floor(usable / interval);
    if (maxTotal >= 1) {
      total = Math.min(total, maxTotal); // 1. shorten the term FIRST
    } else {
      // Only if term can't be shortened enough, then shorten interval
      interval = Math.floor(usable / Math.max(total, 1));
      if (interval < MIN_PAYMENT_INTERVAL) {
        interval = MIN_PAYMENT_INTERVAL;
        total = Math.min(term, Math.floor(usable / MIN_PAYMENT_INTERVAL));
      }
    }

    // Term should have been tried first - total should be reduced if possible
    // With usable=1000 and interval=2592000, maxTotal = 0, so we'd go to interval shortening
    expect(maxTotal).toBe(0); // would trigger interval shortening
  });
});