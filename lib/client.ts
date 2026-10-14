import { Client } from "xrpl";

let client: Client | null = null;

export async function getClient(): Promise<Client> {
  if (!client) {
    client = new Client(
      process.env.XRPL_NETWORK_URL ||
        "wss://s.devnet.rippletest.net:51233"
    );
  }
  if (!client.isConnected()) {
    await client.connect();
  }
  return client;
}

export async function disconnectClient(): Promise<void> {
  if (client && client.isConnected()) {
    await client.disconnect();
    client = null;
  }
}

