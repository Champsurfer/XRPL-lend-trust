import { Wallet } from "xrpl";
import { getWallet } from "../../lib/wallet";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("xrpl", () => {
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
    Wallet: MockWallet,
  };
});

describe("Wallet management", () => {
  beforeEach(() => {
    // Clear any cached state before each test
    // @ts-expect-error - testing internal state
    globalThis._testWalletSeed = undefined;
    // Ensure no env seed forces the fundWallet path
    delete process.env.XRPL_WALLET_SEED;
  });

  it("getWallet returns Wallet from valid seed in env", async () => {
    // Use a valid seed format - 256-bit seed
    process.env.XRPL_WALLET_SEED = "sEdSe1234567890abcdef1234567890abcdef1234567890";
    const wallet = await getWallet({} as any);
    expect(wallet).toBeDefined();
    expect(wallet.classicAddress).toBeDefined();
    delete process.env.XRPL_WALLET_SEED;
  });

  it("getWallet with no seed in env generates a new wallet", async () => {
    // When no seed is provided, should generate and fund a wallet
    delete process.env.XRPL_WALLET_SEED;
    const mockClient = {
      fundWallet: vi.fn().mockResolvedValue({
        wallet: Wallet.fromSeed("sEdSe1234567890abcdef1234567890abcdef1234567890"),
        balance: "1000",
      }),
    };
    const result = await getWallet(mockClient as any);
    expect(result).toBeDefined();
    expect(result.classicAddress).toBeDefined();
  });
});