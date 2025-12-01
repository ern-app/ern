import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createPublicClient, http, webSocket } from "viem";
import { fallback } from "wagmi";
import { mainnet } from "wagmi/chains";
import { ethuiStackFoundry, foundryExtended } from "./chains";

const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
let projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

if (vercelEnv === "production") {
  if (!projectId) {
    throw new Error("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID is not set");
  }
} else {
  projectId = "none";
}

const getChains = () => {
  // Production: Only Ethereum mainnet
  if (vercelEnv === "production") {
    return [mainnet] as const;
  }

  // Preview/Staging: Only private testnet
  if (vercelEnv === "preview" || vercelEnv === "staging") {
    return [ethuiStackFoundry] as const;
  }

  // Development: Support local Foundry + private testnet
  return [foundryExtended, ethuiStackFoundry] as const;
};

const chains = getChains();

const getTransports = () => {
  const transports: Record<number, ReturnType<typeof http>> = {};

  for (const chain of chains) {
    if (chain.id === mainnet.id) {
      transports[chain.id] = fallback([
        http("https://eth.llamarpc.com"),
        webSocket("wss://eth.drpc.org"),
        http("https://ethereum-rpc.publicnode.com"),
      ]);
    } else {
      transports[chain.id] = http();
    }
  }

  return transports;
};

const transports = getTransports();

export const wagmiConfig = getDefaultConfig({
  appName: "Ern",
  projectId,
  chains,
  transports,
  ssr: true,
});

export const publicClient = createPublicClient({
  chain: chains[0],
  transport: transports[chains[0].id],
});
