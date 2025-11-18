import { useChainId } from "wagmi";
import { Addresses } from "./constants";
import type { ContractsT } from "./types";

export const useContracts = (): ContractsT => {
  const chainId = useChainId();

  return Addresses[chainId] || Addresses[1];
};
