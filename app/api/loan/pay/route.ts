import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";
import { getBorrowerWallet } from "@/lib/wallet";
import { payLoan } from "@/lib/loan";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const loanId = body.loanId as string | undefined;
    if (!loanId) {
      return NextResponse.json(
        { ok: false, error: "loanId required" },
        { status: 400 }
      );
    }
    const client = await getClient();
    const borrowerWallet = await getBorrowerWallet(client);
    const pay = await payLoan(client, borrowerWallet, loanId);
    return NextResponse.json({ ok: true, pay });
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
