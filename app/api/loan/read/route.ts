import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";
import { readLoan } from "@/lib/loan";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "id required" },
        { status: 400 }
      );
    }
    const client = await getClient();
    try {
      const node = await readLoan(client, id);
      return NextResponse.json({ ok: true, loan: node });
    } catch {
      return NextResponse.json(
        { ok: false, error: "Loan not found" },
        { status: 404 }
      );
    }
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
