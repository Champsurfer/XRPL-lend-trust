import { Wallet, Client } from "xrpl";

export async function getWallet(
  client: Client
): Promise<Wallet> {
  const seed = process.env.XRPL_WALLET_SEED;
  if (seed && seed.length > 0) {
    return Wallet.fromSeed(seed);
  }
  // No seed in env — generate, fund, and print once.
  const { wallet, balance } = await client.fundWallet();
  console.warn(
    "NEW DEVNET WALLET — save this seed in .env:",
    wallet.seed
  );
  console.warn("Funded balance:", balance);
  return wallet;
}
