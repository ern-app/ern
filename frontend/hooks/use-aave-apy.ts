import { useQuery } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

type APYSampleT = {
  __typename: string;
  avgRate: {
    __typename: string;
    value: string;
    formatted: string;
    raw: string;
    decimals: number;
  };
  date: string;
};

type GraphQLResponseT = {
  data?: {
    value: APYSampleT[];
  };
  errors?: Array<{ message: string }>;
};

type ReserveResponseT = {
  data?: {
    reserve?: {
      supplyInfo?: {
        apy?: {
          value?: string;
          formatted?: string;
        };
      };
    };
  };
  errors?: Array<{ message: string }>;
};

export type AaveAPYDataT = {
  latest: {
    usdc: { apy: number } | undefined;
    usdt: { apy: number } | undefined;
  };
  highest: number | undefined;
};

// ============================================================================
// Constants
// ============================================================================

const AAVE_GRAPHQL_ENDPOINT = "https://api.v3.aave.com/graphql";
const AAVE_MARKET_ADDRESS = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
const CHAIN_ID = 1;
const WINDOW_PERIOD = "LAST_YEAR";
const CACHE_TIME = 1000 * 60 * 60; // 1 hour

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

// ============================================================================
// GraphQL Queries
// ============================================================================

const RESERVE_QUERY = `
  query Reserve($request: ReserveRequest!) {
    reserve(request: $request) {
      __typename
      supplyInfo {
        __typename
        apy {
          __typename
          value
          formatted
          raw
          decimals
        }
      }
    }
  }
`;

const SUPPLY_APY_HISTORY_QUERY = `
  query SupplyAPYHistory($request: SupplyAPYHistoryRequest!) {
    value: supplyAPYHistory(request: $request) {
      ...APYSample
    }
  }
  fragment APYSample on APYSample {
    __typename
    avgRate {
      ...PercentValue
    }
    date
  }
  fragment PercentValue on PercentValue {
    __typename
    raw
    decimals
    value
    formatted
  }
`;

// ============================================================================
// API Calls
// ============================================================================

const fetchReserveAPY = async (
  underlyingToken: string,
): Promise<{ apy: number } | undefined> => {
  const response = await fetch(AAVE_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      operationName: "Reserve",
      query: RESERVE_QUERY,
      variables: {
        request: {
          chainId: CHAIN_ID,
          market: AAVE_MARKET_ADDRESS,
          underlyingToken,
        },
      },
    }),
  });

  if (!response.ok) {
    console.error("[Aave GraphQL] Reserve query failed:", response.statusText);
    return undefined;
  }

  const result: ReserveResponseT = await response.json();
  if (result.errors) {
    console.error("[Aave GraphQL] Reserve GraphQL errors:", result.errors);
    return undefined;
  }

  const formatted = parseFloat(
    result.data?.reserve?.supplyInfo?.apy?.formatted || "0",
  );

  if (!Number.isNaN(formatted) && formatted > 0) {
    return { apy: formatted };
  }

  return undefined;
};

const fetchSupplyAPYHistory = async (
  underlyingToken: string,
  window: string = WINDOW_PERIOD,
): Promise<APYSampleT[]> => {
  const response = await fetch(AAVE_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      operationName: "SupplyAPYHistory",
      query: SUPPLY_APY_HISTORY_QUERY,
      variables: {
        request: {
          chainId: CHAIN_ID,
          market: AAVE_MARKET_ADDRESS,
          underlyingToken,
          window,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch APY history: ${response.statusText}`);
  }

  const result: GraphQLResponseT = await response.json();

  if (result.errors) {
    console.error("[Aave GraphQL] GraphQL errors:", result.errors);
    throw new Error(
      `GraphQL errors: ${result.errors.map((e) => e.message).join(", ")}`,
    );
  }

  if (!result.data?.value) {
    throw new Error("No data returned from GraphQL query!");
  }

  return result.data.value;
};

// ============================================================================
// Data Fetching
// ============================================================================

const fetchAaveAPYData = async (): Promise<AaveAPYDataT> => {
  const [currentUSDC, currentUSDT, usdcHistory, usdtHistory] =
    await Promise.all([
      fetchReserveAPY(USDC_ADDRESS),
      fetchReserveAPY(USDT_ADDRESS),
      fetchSupplyAPYHistory(USDC_ADDRESS, WINDOW_PERIOD),
      fetchSupplyAPYHistory(USDT_ADDRESS, WINDOW_PERIOD),
    ]);

  // Extract highest APY from history
  const allAPYs: number[] = [];
  [...usdcHistory, ...usdtHistory].forEach((sample) => {
    const formatted = parseFloat(sample.avgRate.formatted || "0");

    if (!Number.isNaN(formatted) && formatted > 0) {
      allAPYs.push(formatted);
    }
  });
  const highest = allAPYs.length > 0 ? Math.max(...allAPYs) : undefined;

  return {
    latest: {
      usdc: currentUSDC,
      usdt: currentUSDT,
    },
    highest,
  };
};

// ============================================================================
// Hooks
// ============================================================================

export const useAaveAPYData = () => {
  return useQuery({
    queryKey: ["aave-apy-data"],
    queryFn: fetchAaveAPYData,
    staleTime: CACHE_TIME,
    refetchInterval: CACHE_TIME,
  });
};
