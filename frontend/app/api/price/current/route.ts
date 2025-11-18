import { type NextRequest, NextResponse } from "next/server";
import type { AlchemyCurrentPriceResponseT } from "@/lib/alchemy/types";

export async function GET(request: NextRequest) {
  try {
    const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
    console.log("her");

    if (!ALCHEMY_API_KEY) {
      return NextResponse.json(
        { error: "Alchemy API key not configured" },
        { status: 500 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "Missing symbol parameter" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?symbols=${symbol}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data: AlchemyCurrentPriceResponseT = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600", // 1 hour
      },
    });
  } catch (error) {
    console.error("Error fetching current price:", error);
    return NextResponse.json(
      { error: "Failed to fetch current price" },
      { status: 500 },
    );
  }
}
