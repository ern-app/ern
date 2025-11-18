import { useChainId, useChains } from "wagmi";

export const useExplorerUrl = () => {
  const chains = useChains();
  const chainId = useChainId();

  const currentChain = chains.find((chain) => chain.id === chainId);
  const explorerUrl =
    currentChain?.blockExplorers?.default?.url || "https://etherscan.io";

  return explorerUrl;
};
