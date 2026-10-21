import { getWallet } from "../lib/wallet";
import { describe, it, expect, beforeEach } from "vitest";

describe("Wallet management", () => {
  beforeEach(() => {
    // Clear any cached state before each test
    // @ts-expect-error - testing internal state
    globalThis._testWalletSeed = undefined;
  });

  it("getWallet returns Wallet from valid seed", () => {
    // Use a valid seed format - 256-bit seed
    const seed = "sEdSe1234567890abcdef1234567890abcdef1234567890";
    const wallet = getWallet({} as any, seed);
    expect(wallet).toBeDefined();
    expect(wallet.classicAddress).toBeDefined();
  });

  it("getWallet throws if seed is invalid", () => {
    // Invalid seed - empty or wrong format should throw
    expect(() => getWallet({} as any, "")).toThrow();
    expect(() => getWallet({} as any, "short")).toThrow();
  });

  it("getWallet with no seed in env generates a new wallet", () => {
    // When no seed is provided, should generate and fund a wallet
    // This is tested by checking the function behavior
    const result = getWallet({} as any);
    expect(result).toBeDefined();
    expect(result.classicAddress).toBeDefined();
  });
});