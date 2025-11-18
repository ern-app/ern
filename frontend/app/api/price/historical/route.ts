import { type NextRequest, NextResponse } from "next/server";
import type { AlchemyHistoricalResponseT } from "@/lib/alchemy/types";

export async function GET(request: NextRequest) {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

    if (!ALCHEMY_API_KEY) {
      return NextResponse.json(
        { error: "Alchemy API key not configured" },
        { status: 500 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");
    const interval = searchParams.get("interval");

    if (!symbol || !startTime || !endTime || !interval) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/historical`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          startTime,
          endTime,
          interval,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data: AlchemyHistoricalResponseT = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=2592000, s-maxage=2592000", // 1 month
      },
    });
  } catch (error) {
    console.error("Error fetching historical price data:", error);
    return NextResponse.json(
      {
        symbol: "BTC",
        currency: "usd",
        data: [],
      } as AlchemyHistoricalResponseT,
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=2592000, s-maxage=2592000", // 1 month
        },
      },
    );
  }
}
