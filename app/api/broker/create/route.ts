import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";
import { getWallet } from "@/lib/wallet";
import { createBroker } from "@/lib/broker";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const vaultId = body.vaultId as string | undefined;
    const coverAmount =
      (body.coverAmount as string) || "1000000"; // 1 XRP in drops
    if (!vaultId) {
      return NextResponse.json(
        { ok: false, error: "vaultId required" },
        { status: 400 }
      );
    }
    const client = await getClient();
    const wallet = await getWallet(client);
    const broker = await createBroker(client, wallet, vaultId, coverAmount);
    return NextResponse.json({ ok: true, broker });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
