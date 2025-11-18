import type {
  AlchemyCurrentPriceResponseT,
  AlchemyHistoricalResponseT,
} from "./types";

export async function fetchHistoricalPriceData(
  startDate: Date,
  endDate: Date,
  interval: string,
  symbol: string,
): Promise<AlchemyHistoricalResponseT> {
  try {
    const params = new URLSearchParams({
      symbol,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      interval,
    });

    const response = await fetch(`/api/price/historical?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return {
      symbol: "BTC",
      currency: "usd",
      data: [],
    };
  }
}

export async function fetchCurrentPrice(
  symbol: string,
): Promise<AlchemyCurrentPriceResponseT | undefined> {
  try {
    const params = new URLSearchParams({ symbol });

    const response = await fetch(`/api/price/current?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: AlchemyCurrentPriceResponseT = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching current price:", error);
    return undefined;
  }
}
