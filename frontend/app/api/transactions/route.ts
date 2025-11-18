import { type NextRequest, NextResponse } from "next/server";
import {
  type Address,
  createPublicClient,
  http,
  type Log as ViemLog,
} from "viem";
import { getLogs } from "viem/actions";
import { mainnet } from "viem/chains";
import { ethuiStackFoundry, foundryExtended } from "@/lib/wagmi/chains";
import { erc20Abi, ernAbi } from "@/lib/wagmi/wagmi.generated";

type SerializedTransaction = {
  id: string;
  hash: string;
  action: "deposit" | "withdraw" | "earnings" | "approval";
  asset: string;
  assetIcon: string;
  value: string;
  date: string; // ISO string
  blockNumber: string; // bigint as string
  user: string;
  amount: string; // bigint as string
  tokenAddress: string;
  fee?: string; // bigint as string
  spender?: string;
};

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
    const address = searchParams.get("address");
    const chainId = searchParams.get("chainId");
    const ernUSDC = searchParams.get("ernUSDC");
    const ernUSDT = searchParams.get("ernUSDT");
    const usdcToken = searchParams.get("usdcToken");
    const usdtToken = searchParams.get("usdtToken");

    if (
      !address ||
      !chainId ||
      !ernUSDC ||
      !ernUSDT ||
      !usdcToken ||
      !usdtToken
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // Get appropriate chain and RPC URL
    const chainIdNum = Number.parseInt(chainId);
    let chain: any;
    let rpcUrl: any;

    if (chainIdNum === 1) {
      chain = mainnet;
      rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
    } else if (chainIdNum === 31337) {
      chain = foundryExtended;
      rpcUrl = "http://localhost:8545";
    } else if (chainIdNum === 15628905) {
      chain = ethuiStackFoundry;
      rpcUrl = "https://bityield.stacks.ethui.dev";
    } else {
      return NextResponse.json({ error: "Unsupported chain" }, { status: 400 });
    }

    const publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    });

    // Calculate block range for last 30 days
    // Assume ~12 seconds per block
    const toBlock = await publicClient.getBlockNumber();
    const daysAgo = 30;
    const blocksPerDay = (24 * 60 * 60) / 12;
    const estimatedBlocksAgo = BigInt(Math.floor(daysAgo * blocksPerDay));
    const fromBlock =
      toBlock > estimatedBlocksAgo ? toBlock - estimatedBlocksAgo : 0n;

    const allTransactions: SerializedTransaction[] = [];

    const vaultContracts = {
      USDC: ernUSDC as Address,
      USDT: ernUSDT as Address,
    };

    const tokenContracts = {
      USDC: usdcToken as Address,
      USDT: usdtToken as Address,
    };

    // Fetch vault events
    for (const [tokenSymbol, vaultAddress] of Object.entries(vaultContracts)) {
      try {
        // Deposit events
        const depositLogs = await getLogs(publicClient, {
          address: vaultAddress,
          event: ernAbi.find((e) => e.type === "event" && e.name === "Deposit"),
          args: { user: address as Address },
          fromBlock: BigInt(fromBlock),
          toBlock,
        });

        for (const log of depositLogs) {
          allTransactions.push(
            processTransactionEvent(log, "deposit", tokenSymbol, vaultAddress),
          );
        }

        // Withdraw events
        const withdrawLogs = await getLogs(publicClient, {
          address: vaultAddress,
          event: ernAbi.find(
            (e) => e.type === "event" && e.name === "Withdraw",
          ),
          args: { user: address as Address },
          fromBlock: BigInt(fromBlock),
          toBlock,
        });

        for (const log of withdrawLogs) {
          const logWithArgs = log as any;
          allTransactions.push(
            processTransactionEvent(
              log,
              "withdraw",
              tokenSymbol,
              vaultAddress,
              {
                fee: logWithArgs.args?.fee as bigint,
              },
            ),
          );
        }

        // Yield claim events
        const yieldLogs = await getLogs(publicClient, {
          address: vaultAddress,
          event: ernAbi.find(
            (e) => e.type === "event" && e.name === "YieldClaimed",
          ),
          args: { user: address as Address },
          fromBlock: BigInt(fromBlock),
          toBlock,
        });

        for (const log of yieldLogs) {
          allTransactions.push(
            processTransactionEvent(log, "earnings", "wBTC", vaultAddress),
          );
        }
      } catch (error) {
        console.error(`Error fetching ${tokenSymbol} events:`, error);
      }
    }

    // Fetch approval events from tokens
    for (const [tokenSymbol, tokenAddress] of Object.entries(tokenContracts)) {
      try {
        const approvalLogs = await getLogs(publicClient, {
          address: tokenAddress,
          event: erc20Abi.find(
            (e) => e.type === "event" && e.name === "Approval",
          ),
          args: {
            owner: address as Address,
            spender: [ernUSDC, ernUSDT] as Address[],
          },
          fromBlock: BigInt(fromBlock),
          toBlock,
        });

        for (const log of approvalLogs) {
          const logWithArgs = log as any;
          allTransactions.push(
            processTransactionEvent(
              log,
              "approval",
              tokenSymbol,
              tokenAddress,
              {
                spender: logWithArgs.args?.spender as string,
              },
            ),
          );
        }
      } catch (error) {
        console.error(`Error fetching ${tokenSymbol} approvals:`, error);
      }
    }

    const sortedTransactions = allTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return NextResponse.json(
      { transactions: sortedTransactions },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=60", // Cache for 1 minute
        },
      },
    );
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction history" },
      { status: 500 },
    );
  }
}

function processTransactionEvent(
  event: ViemLog,
  action: "deposit" | "withdraw" | "earnings" | "approval",
  tokenSymbol: string,
  tokenAddress: string,
  additionalData?: { fee?: bigint; spender?: string },
): SerializedTransaction {
  const eventWithArgs = event as any;
  const amount = eventWithArgs.args?.amount ?? eventWithArgs.args?.value;
  const date = eventWithArgs.blockTimestamp
    ? new Date(Number(eventWithArgs.blockTimestamp) * 1000)
    : new Date();

  const baseTransaction = {
    id: `${eventWithArgs.transactionHash}-${eventWithArgs.logIndex}`,
    hash: eventWithArgs.transactionHash,
    action,
    asset: tokenSymbol,
    assetIcon: tokenSymbol,
    value: amount?.toString() || "0",
    date: date.toISOString(),
    blockNumber: eventWithArgs.blockNumber.toString(),
    user: (eventWithArgs.args?.user ?? eventWithArgs.args?.owner) as string,
    amount: amount?.toString() || "0",
    tokenAddress,
  };

  if (action === "approval" && additionalData?.spender) {
    return {
      ...baseTransaction,
      spender: additionalData.spender,
    };
  }

  if (action === "withdraw" && additionalData?.fee) {
    return {
      ...baseTransaction,
      fee: additionalData.fee.toString(),
    };
  }

  return baseTransaction;
}
