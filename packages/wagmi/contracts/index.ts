import type { Address } from "viem";
import { useChainId } from "wagmi";
import anvil from "./31337";
import ethuiStack from "./15628905";
import mainnet from "./1";

interface Contracts {
  ernUSDC: Address;
  ernUSDT: Address;
  USDC: Address;
  USDT: Address;
  wBTC: Address;
  oracleUSDC: Address;
  oracleUSDT: Address;
  oracleWBTC: Address;
  multicall: Address;
}

export const multicallAbi = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "target", type: "address" },
          { internalType: "bytes", name: "callData", type: "bytes" },
        ],
        internalType: "struct Multicall.Call[]",
        name: "calls",
        type: "tuple[]",
      },
    ],
    name: "aggregate",
    outputs: [
      { internalType: "uint256", name: "blockNumber", type: "uint256" },
      { internalType: "bytes[]", name: "returnData", type: "bytes[]" },
    ],
    stateMutability: "payable",
    type: "function",
  }
];

export type Underlying = "USDC" | "USDT";

const Addresses: Record<number, Contracts> = {
  31337: anvil,
  15628905: ethuiStack,
  1: mainnet

} as const;

export function getContractAddress(
  chainId: number,
  contractName: keyof Contracts,
): Address {
  const chainAddresses = Addresses[chainId];

  if (!chainAddresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const address = chainAddresses[contractName];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      `Contract ${contractName} not deployed on chain ${chainId}`,
    );
  }

  return address;
}

export function useContract(
  contractName: keyof Contracts,
): Address | undefined {
  const chainId = useChainId();

  try {
    return getContractAddress(chainId, contractName);
  } catch (error) {
    // Return undefined if contract is not deployed or chain is unsupported
    // This allows components to handle the undefined case gracefully
    console.warn(
      `Contract ${contractName} not available on chain ${chainId}:`,
      error,
    );
    return undefined;
  }
}

export function useContracts(): Contracts {
  const chainId = useChainId();

  return Addresses[chainId] || Addresses[1];
}
