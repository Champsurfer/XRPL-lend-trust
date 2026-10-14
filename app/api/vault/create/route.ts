import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";
import { getWallet } from "@/lib/wallet";
import { createVault } from "@/lib/vault";

export async function POST() {
  try {
    const client = await getClient();
    const wallet = await getWallet(client);
    const vault = await createVault(client, wallet);
    return NextResponse.json({ ok: true, vault });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
