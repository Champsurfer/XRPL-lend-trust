import { getClient, disconnectClient } from "../lib/client";
import { describe, it, expect, beforeEach } from "vitest";

describe("Client management", () => {
  beforeEach(() => {
    // Clear any cached client before each test
    // @ts-expect-error - testing internal state
    globalThis._testClient = null;
  });

  it("getClient returns connected Client", () => {
    const client = getClient();
    // In test environment, client should be created and connected
    expect(client).toBeDefined();
    expect(client.isConnected()).toBe(true);
  });

  it("disconnectClient closes connection", async () => {
    const client = getClient();
    await disconnectClient();
    // After disconnect, client should be null/reset
    expect(client.isConnected()).toBe(false);
  });

  it("getClient can be called multiple times and returns same client", () => {
    const client1 = getClient();
    const client2 = getClient();
    // Should return the same cached client
    expect(client1).toBe(client2);
  });
});