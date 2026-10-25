import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";

export async function GET() {
  try {
    const client = await getClient();
    const response = await client.request({
      command: "ledger",
      ledger_index: "current",
    });
    return NextResponse.json({
      ok: true,
      ledgerIndex: response.result.ledger_index,
      closeTime: response.result.ledger.close_time,
      closeTimeISO: new Date(
        (response.result.ledger.close_time + 946684800) * 1000
      ).toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error ? err.message : String(err),
      },
      { status: 200 }
    );
  }
}
