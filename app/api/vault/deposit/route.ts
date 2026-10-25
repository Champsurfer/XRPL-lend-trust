import { NextResponse } from "next/server";
import { getClient } from "@/lib/client";
import { getWallet } from "@/lib/wallet";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vaultId, amount } = body;

    if (!vaultId || !amount) {
      return NextResponse.json(
        { ok: false, error: "vaultId and amount are required" },
        { status: 400 }
      );
    }

    const client = await getClient();
    const wallet = await getWallet(client);

    const tx = {
      TransactionType: "VaultDeposit" as const,
      Account: wallet.classicAddress,
      VaultID: vaultId,
      Amount: amount,
    };

    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    const meta = result.result.meta;
    if (
      typeof meta !== "object" ||
      meta === null ||
      meta.TransactionResult !== "tesSUCCESS"
    ) {
      throw new Error(
        "VaultDeposit failed: " +
          JSON.stringify(
            typeof meta === "object" && meta !== null
              ? meta.TransactionResult
              : result.result.meta
          )
      );
    }

    return NextResponse.json({
      ok: true,
      txHash: result.result.hash,
      vaultId,
      amount,
    });
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