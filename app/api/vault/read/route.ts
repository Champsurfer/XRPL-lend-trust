import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const client = await getClient();
    const response = await client.request({
      command: "ledger_entry",
      index: id,
      ledger_index: "validated",
    });
    if (!response.result.node) {
      return NextResponse.json(
        { ok: false, error: "vault not found on the validated ledger" },
        { status: 404 }
      );
    }
    const node = response.result.node as unknown as Record<string, unknown>;
    return NextResponse.json({
      ok: true,
      vault: {
        vaultId: id,
        assetsTotal: (node.AssetBalance as string | undefined) || "0",
        sharesTotal: "0",
        createdAt: "",
        txHash: "",
      },
    });
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