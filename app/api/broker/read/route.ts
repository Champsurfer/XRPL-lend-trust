import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const brokerId = url.searchParams.get("id");
    if (!brokerId) {
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const client = await getClient();
    const response = await client.request({
      command: "ledger_entry",
      index: brokerId,
      ledger_index: "validated",
    });
    if (!response.result.node) {
      return NextResponse.json(
        { ok: false, error: "broker not found on the validated ledger" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      ok: true,
      broker: response.result.node,
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
