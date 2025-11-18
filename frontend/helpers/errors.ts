import {
  BaseError,
  ContractFunctionRevertedError,
  UserRejectedRequestError,
} from "viem";

/**
 * Extract clean, user-friendly error message from various error types
 * Handles viem errors, contract reverts, user rejections, and generic errors
 */
export function getErrorMessage(error: unknown): string {
  // User rejected the transaction
  if (error instanceof UserRejectedRequestError) {
    return "Transaction rejected";
  }

  // Viem base error - extract shortMessage
  if (error instanceof BaseError) {
    // Contract function reverted
    if (error instanceof ContractFunctionRevertedError) {
      const revertError = error as ContractFunctionRevertedError;
      if (revertError.data?.errorName) {
        return `Contract error: ${revertError.data.errorName}`;
      }
      return "Transaction reverted";
    }

    // Use viem's shortMessage if available
    if (error.shortMessage) {
      return error.shortMessage;
    }

    // Fallback to name or generic message
    if (error.name) {
      return error.name;
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    // Parse common error patterns
    const message = error.message;

    // User rejection variants
    if (
      message.includes("User rejected") ||
      message.includes("user rejected") ||
      message.includes("User denied")
    ) {
      return "Transaction rejected";
    }

    // Insufficient funds
    if (message.includes("insufficient funds")) {
      return "Insufficient funds for transaction";
    }

    // Network errors
    if (message.includes("network") || message.includes("fetch failed")) {
      return "Network error. Please try again";
    }

    // If message is reasonably short, use it
    if (message.length < 80) {
      return message;
    }

    // Try to extract first sentence
    const firstSentence = message.split(".")[0];
    if (firstSentence && firstSentence.length < 80) {
      return firstSentence;
    }

    // Last resort: truncate
    return `${message.substring(0, 77)}...`;
  }

  // Unknown error type
  return "Transaction failed. Please try again";
}
