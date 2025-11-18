import { publicClient } from "@/lib/wagmi/wagmi";

export const getBlockNumberByDate = async (
  targetDate: Date,
): Promise<bigint> => {
  const targetDateUTC = new Date(
    targetDate.getTime() + targetDate.getTimezoneOffset() * 60000,
  );
  const targetTimestamp = Math.floor(targetDateUTC.getTime() / 1000);

  const currentBlock = await publicClient.getBlockNumber();
  const currentBlockInfo = await publicClient.getBlock({
    blockNumber: currentBlock,
  });

  // If target date is in the future, return current block
  if (currentBlockInfo.timestamp < BigInt(targetTimestamp)) {
    return currentBlock;
  }

  let low = 0n;
  let high = currentBlock;
  let result = currentBlock;

  // Binary search to find the first block with timestamp >= targetTimestamp
  while (low <= high) {
    const mid = (low + high) / 2n;
    const block = await publicClient.getBlock({ blockNumber: mid });

    if (block.timestamp >= BigInt(targetTimestamp)) {
      result = mid; // This is a valid candidate
      high = mid - 1n; // Look for earlier blocks
    } else {
      low = mid + 1n; // Need to look later
    }
  }

  return result;
};
