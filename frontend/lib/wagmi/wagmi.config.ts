import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { erc20Abi } from "@/abis/erc20";
import { ernAbi } from "@/abis/ern";
import { iAggregatorV3Abi } from "@/abis/i-aggregator-v3";
import { mockATokenAbi } from "@/abis/mock-a-token";
import { mockAavePoolAbi } from "@/abis/mock-aave-pool";
import { multicallAbi } from "@/abis/multicall";

export default defineConfig({
  out: "wagmi.generated.ts",
  contracts: [
    { name: "Ern", abi: ernAbi },
    { name: "ERC20", abi: erc20Abi },
    { name: "IAggregatorV3", abi: iAggregatorV3Abi },
    { name: "MockAavePool", abi: mockAavePoolAbi },
    { name: "MockAToken", abi: mockATokenAbi },
    { name: "Multicall", abi: multicallAbi },
  ],
  plugins: [react()],
});
