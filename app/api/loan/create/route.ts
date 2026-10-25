import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";
import { getWallet, getBorrowerWallet } from "@/lib/wallet";
import { createLoan } from "@/lib/loan";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const brokerId = body.brokerId as string | undefined;
    const vaultId = body.vaultId as string | undefined;
    const principal = (body.principal as string) || "1000000"; // 1 XRP
    const rate = typeof body.rate === "number" ? body.rate : 500;
    const term = typeof body.term === "number" ? body.term : 4;

    if (
      isNaN(Number(principal)) ||
      (typeof body.rate !== "undefined" && typeof body.rate !== "number") ||
      (typeof body.term !== "undefined" && typeof body.term !== "number")
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid input: principal, rate, and term must be numbers." },
        { status: 400 }
      );
    }

    if (!brokerId || !vaultId) {
      return NextResponse.json(
        { ok: false, error: "brokerId and vaultId are required" },
        { status: 400 }
      );
    }

    const client = await getClient();
    const brokerWallet = await getWallet(client);
    const borrowerWallet = await getBorrowerWallet(client);
    
    const loan = await createLoan(
      client,
      brokerWallet,
      borrowerWallet,
      brokerId,
      vaultId,
      principal,
      rate,
      term
    );

    return NextResponse.json({ ok: true, loan });
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