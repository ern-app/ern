import anvil from "./contracts/31337";
import ethuiStackAnvil from "./contracts/15628905";
import { defineChain } from "viem";
import { foundry } from "wagmi/chains";

export const foundryExtended = defineChain({
  ...foundry,
  blockExplorers: {
    default: {
      name: "Ethui Explorer",
      url: "https://explorer.ethui.dev/rpc/d3M6Ly9sb2NhbGhvc3Q6ODU0NQ%3D%3D",
    },
  },
  multicall3: {
    address: anvil.multicall,
    blockCreated: 1,
  },
});

export const ethuiStackFoundry = defineChain({
  ...foundry,
  id: 15628905,
  name: "Ern Private testnet",
  rpcUrls: {
    default: {
      http: ["https://bityield.stacks.ethui.dev"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://explorer.ethui.dev/rpc/aHR0cHM6Ly9iaXR5aWVsZC5zdGFja3MuZXRodWkuZGV2",
    },
  },
  multicall3: {
    address: ethuiStackAnvil.multicall,
    blockCreated: 1,
  },
});

