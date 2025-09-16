import { type NextRequest, NextResponse } from "next/server";
import { BANKS } from "@/lib/bank-config";
import type { TransactionsResponse } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bankId = searchParams.get("bankId") || "babu-rao-ganpatrao";

  const bank = BANKS.find((b) => b.id === bankId);
  if (!bank) {
    return NextResponse.json({ error: "Bank not found" }, { status: 404 });
  }

  console.log(
    `[v0] Fetching transactions from ${bank.name} at ${bank.url}/api/v1/transaction/all`
  );

  try {
    // Try to fetch from the actual bank API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${bank.url}/api/v1/transaction/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TransactionsResponse = await response.json();
    console.log(
      `[v0] Successfully fetched ${data.data?.length || 0} transactions from ${
        bank.name
      }`
    );

    return NextResponse.json({
      ...data,
      isLive: true,
      bankName: bank.name,
    });
  } catch (error) {
    console.log(
      `[v0] Failed to fetch from ${bank.name}, using mock data:`,
      error
    );

    // Return mock data when the actual API is not available

    return NextResponse.json({
      status: "Success",
      message: "Transactions fetched successfully (Demo Mode)",
      data: [],
      isLive: false,
      bankName: bank.name,
    });
  }
}
