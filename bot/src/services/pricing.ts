import type { Address } from "viem";
import type { Config } from "../config";
import {
  MOCK_REWARD_TOKEN_PRICE_USD,
  MOCK_STABLECOIN_PRICE_USD,
} from "../constants";
import { createLogger } from "../logger";

export interface TokenPriceResponse {
  data?: Array<{
    prices?: Array<{ currency: string; value: string }>;
  }>;
}

export class PricingService {
  private config: Config;
  private logger: ReturnType<typeof createLogger>;

  constructor({ config, id }: { config: Config; id: string }) {
    this.logger = createLogger(id, "pricing");
    this.config = config;
  }

  async getUnderlyingPrice(token: Address): Promise<number> {
    if (this.config.mockPrices) {
      this.logger.debug(
        `mocking token price as ${MOCK_STABLECOIN_PRICE_USD} USD`,
      );
      return MOCK_STABLECOIN_PRICE_USD;
    }

    return this.getRealPrice(token);
  }

  async getRewardPrice(token: Address): Promise<number> {
    if (this.config.mockPrices) {
      this.logger.debug(
        `mocking reward token price as ${MOCK_REWARD_TOKEN_PRICE_USD.toLocaleString()} USD`,
      );
      return MOCK_REWARD_TOKEN_PRICE_USD;
    }

    return this.getRealPrice(token);
  }

  private async getRealPrice(token: Address): Promise<number> {
    try {
      const response = await fetch(
        `https://api.g.alchemy.com/prices/v1/${this.config.alchemy.apiKey}/tokens/by-address`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            addresses: [{ network: "eth-mainnet", address: token }],
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as TokenPriceResponse;
      const usdPrice = data?.data?.[0]?.prices?.find(
        (p) => p.currency === "usd",
      );

      if (!usdPrice || !usdPrice.value) {
        throw new Error(`No USD price found`);
      }

      const price = parseFloat(usdPrice.value);
      if (Number.isNaN(price) || price <= 0) {
        throw new Error(`Invalid price: ${usdPrice.value}`);
      }

      this.logger.info(`Price fetched`, { token, price });
      return price;
    } catch (error) {
      this.logger.error(`Price fetch failed: ${token}`, error);
      throw error;
    }
  }
}
