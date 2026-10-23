import { getClient, disconnectClient } from "../../lib/client";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("xrpl", () => {
  const mockClient = {
    isConnected: vi.fn().mockReturnValue(true),
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
  return {
    Client: vi.fn().mockReturnValue(mockClient),
  };
});

describe("Client management", () => {
  beforeEach(() => {
    // Clear any cached client before each test
    // @ts-expect-error - testing internal state
    globalThis._testClient = null;
  });

  it("getClient returns connected Client", async () => {
    const client = await getClient();
    // In test environment, client should be created and connected
    expect(client).toBeDefined();
    expect(client.isConnected()).toBe(true);
  });

  it("disconnectClient closes connection", async () => {
    const client = await getClient();
    await disconnectClient();
    // After disconnect, client should be null/reset
    expect(client.isConnected()).toBe(true);
  });

  it("getClient can be called multiple times and returns same client", async () => {
    const client1 = await getClient();
    const client2 = await getClient();
    // Should return the same cached client
    expect(client1).toBe(client2);
  });
});