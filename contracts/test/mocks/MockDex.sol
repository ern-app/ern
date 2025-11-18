// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IDex} from "../../src/interfaces/IDex.sol";

/**
 * @title MockDex
 * @notice Mock DEX implementation for testing Ern with configurable exchange rates
 * @dev This mock DEX allows setting custom exchange rates and has infinite liquidity for testing
 */
contract MockDex is IDex, Ownable {
    using SafeERC20 for IERC20;

    // --- State Variables ---

    /// @notice Exchange rates mapping: tokenIn => tokenOut => rate (scaled by 1e18)
    /// @dev rate = how much tokenOut you get per 1 tokenIn (normalized to 18 decimals)
    /// @dev The rate accounts for decimal differences between tokens automatically
    mapping(address => mapping(address => uint256)) public exchangeRates;

    /// @notice Track total swapped amounts for testing/analytics
    mapping(address => mapping(address => uint256)) public totalSwapped;

    // --- Events ---

    event ExchangeRateUpdated(address indexed tokenIn, address indexed tokenOut, uint256 oldRate, uint256 newRate);

    event SwapExecuted(
        address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, address indexed to
    );

    // --- Errors ---

    error ExchangeRateNotSet();
    error InsufficientOutput();
    error InvalidTokenPair();
    error InsufficientLiquidity();

    constructor() Ownable(msg.sender) {}

    // --- Internal Helper Functions ---

    /**
     * @notice Normalize token amount to 18 decimals for calculation
     * @param token Token address
     * @param amount Amount in token's native decimals
     * @return normalized Amount normalized to 18 decimals
     */
    function _normalizeAmount(address token, uint256 amount) internal view returns (uint256 normalized) {
        uint8 decimals = IERC20Metadata(token).decimals();
        if (decimals == 18) {
            return amount;
        } else if (decimals < 18) {
            return amount * (10 ** (18 - decimals));
        } else {
            return amount / (10 ** (decimals - 18));
        }
    }

    /**
     * @notice Denormalize amount from 18 decimals to token's native decimals
     * @param token Token address
     * @param normalizedAmount Amount in 18 decimals
     * @return amount Amount in token's native decimals
     */
    function _denormalizeAmount(address token, uint256 normalizedAmount) internal view returns (uint256 amount) {
        uint8 decimals = IERC20Metadata(token).decimals();
        if (decimals == 18) {
            return normalizedAmount;
        } else if (decimals < 18) {
            return normalizedAmount / (10 ** (18 - decimals));
        } else {
            return normalizedAmount * (10 ** (decimals - 18));
        }
    }

    // --- Admin Functions ---

    /**
     * @notice Set exchange rate between two tokens
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param rate Exchange rate (how much tokenOut per 1 tokenIn, scaled by 1e18)
     * @dev Rate should represent: 1 tokenIn = rate * tokenOut (both in their native decimals)
     * @dev Example: if 1 USDC (6 decimals) = 0.000025 WBTC (8 decimals)
     * @dev Then rate = 25000000000000 (0.000025 * 1e18)
     * @dev The contract handles decimal normalization automatically
     */
    function setExchangeRate(address tokenIn, address tokenOut, uint256 rate) external onlyOwner {
        require(tokenIn != tokenOut, "Same token");
        require(rate > 0, "Rate must be > 0");

        uint256 oldRate = exchangeRates[tokenIn][tokenOut];
        exchangeRates[tokenIn][tokenOut] = rate;

        emit ExchangeRateUpdated(tokenIn, tokenOut, oldRate, rate);
    }

    /**
     * @notice Set exchange rate using actual token amounts (convenience function)
     * @param tokenIn Input token address
     * @param tokenOut Output token address  
     * @param amountIn Amount of tokenIn (in its native decimals)
     * @param amountOut Amount of tokenOut received for amountIn (in its native decimals)
     * @dev This calculates the rate automatically handling decimals
     * @dev Example: setRateFromAmounts(usdc, wbtc, 40000e6, 1e8) // 40,000 USDC = 1 WBTC
     */
    function setRateFromAmounts(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut) external onlyOwner {
        require(tokenIn != tokenOut, "Same token");
        require(amountIn > 0 && amountOut > 0, "Amounts must be > 0");

        // Normalize both amounts to 18 decimals
        uint256 normalizedAmountIn = _normalizeAmount(tokenIn, amountIn);
        uint256 normalizedAmountOut = _normalizeAmount(tokenOut, amountOut);
        
        // Calculate rate: how much normalized tokenOut per 1 normalized tokenIn
        uint256 rate = (normalizedAmountOut * 1e18) / normalizedAmountIn;
        
        uint256 oldRate = exchangeRates[tokenIn][tokenOut];
        exchangeRates[tokenIn][tokenOut] = rate;

        emit ExchangeRateUpdated(tokenIn, tokenOut, oldRate, rate);
    }

    /**
     * @notice Set bidirectional exchange rates (automatically calculates inverse)
     * @param tokenA First token
     * @param tokenB Second token
     * @param rateAtoB Rate from tokenA to tokenB (scaled by 1e18)
     * @dev The rate should represent: 1 tokenA = rateAtoB * tokenB (both in their native decimals)
     */
    function setBidirectionalRate(address tokenA, address tokenB, uint256 rateAtoB) external onlyOwner {
        require(tokenA != tokenB, "Same token");
        require(rateAtoB > 0, "Rate must be > 0");

        // Set A -> B rate
        exchangeRates[tokenA][tokenB] = rateAtoB;

        // Calculate B -> A rate (inverse)
        // Since our rates work on normalized amounts, we can use simple inverse
        exchangeRates[tokenB][tokenA] = (1e18 * 1e18) / rateAtoB;

        emit ExchangeRateUpdated(tokenA, tokenB, 0, rateAtoB);
        emit ExchangeRateUpdated(tokenB, tokenA, 0, (1e18 * 1e18) / rateAtoB);
    }

    /**
     * @notice Check liquidity availability (testing only)
     * @param token Token to check
     * @param amount Amount to check
     */
    function checkLiquidity(address token, uint256 amount) external view onlyOwner {
        require(IERC20(token).balanceOf(address(this)) >= amount, "Insufficient balance to provide");
    }

    // --- DEX Interface Implementation ---

    /**
     * @notice Swap exact input amount for output tokens
     * @param params The parameters necessary for the swap, encoded as ExactInputSingleParams
     * @return amountOut Actual amount of output tokens received
     */
    function exactInputSingle(IDex.ExactInputSingleParams calldata params)
        external
        override
        returns (uint256 amountOut)
    {
        require(params.tokenIn != params.tokenOut, "Invalid token pair");
        require(params.amountIn > 0, "Amount must be > 0");
        require(params.recipient != address(0), "Invalid recipient");
        require(block.timestamp <= params.deadline, "Transaction too old");

        // Get exchange rate
        uint256 rate = exchangeRates[params.tokenIn][params.tokenOut];
        if (rate == 0) revert ExchangeRateNotSet();

        // Normalize input amount to 18 decimals for calculation
        uint256 normalizedAmountIn = _normalizeAmount(params.tokenIn, params.amountIn);
        
        // Calculate normalized output amount
        uint256 normalizedAmountOut = (normalizedAmountIn * rate) / 1e18;
        
        // Denormalize to output token's decimals
        amountOut = _denormalizeAmount(params.tokenOut, normalizedAmountOut);

        // Check slippage protection
        if (amountOut < params.amountOutMinimum) revert InsufficientOutput();

        // Check if we have enough liquidity
        uint256 ourBalance = IERC20(params.tokenOut).balanceOf(address(this));
        if (ourBalance < amountOut) revert InsufficientLiquidity();

        // Execute swap
        IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);
        IERC20(params.tokenOut).safeTransfer(params.recipient, amountOut);

        // Update tracking
        totalSwapped[params.tokenIn][params.tokenOut] += params.amountIn;

        emit SwapExecuted(params.tokenIn, params.tokenOut, params.amountIn, amountOut, params.recipient);
    }

    // --- Legacy Compatibility Function ---

    /**
     * @notice Legacy swap function for backward compatibility
     * @param tokenIn Input token address
     * @param tokenOut Output token address
     * @param amountIn Exact amount of input tokens
     * @param minOut Minimum amount of output tokens (slippage protection)
     * @param to Recipient address
     * @return amountOut Actual amount of output tokens received
     */
    function swapExactInput(address tokenIn, address tokenOut, uint256 amountIn, uint256 minOut, address to)
        external
        returns (uint256 amountOut)
    {
        require(tokenIn != tokenOut, "Invalid token pair");
        require(amountIn > 0, "Amount must be > 0");
        require(to != address(0), "Invalid recipient");

        // Get exchange rate
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        if (rate == 0) revert ExchangeRateNotSet();

        // Normalize input amount to 18 decimals for calculation
        uint256 normalizedAmountIn = _normalizeAmount(tokenIn, amountIn);
        
        // Calculate normalized output amount
        uint256 normalizedAmountOut = (normalizedAmountIn * rate) / 1e18;
        
        // Denormalize to output token's decimals
        amountOut = _denormalizeAmount(tokenOut, normalizedAmountOut);

        // Check slippage protection
        if (amountOut < minOut) revert InsufficientOutput();

        // Check if we have enough liquidity
        uint256 ourBalance = IERC20(tokenOut).balanceOf(address(this));
        if (ourBalance < amountOut) revert InsufficientLiquidity();

        // Execute swap
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(to, amountOut);

        // Update tracking
        totalSwapped[tokenIn][tokenOut] += amountIn;

        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut, to);
    }

    // --- View Functions ---

    /**
     * @notice Preview swap output amount
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @param amountIn Input amount
     * @return amountOut Expected output amount
     */
    function previewSwap(address tokenIn, address tokenOut, uint256 amountIn)
        external
        view
        returns (uint256 amountOut)
    {
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        if (rate == 0) return 0;

        // Normalize input amount to 18 decimals for calculation
        uint256 normalizedAmountIn = _normalizeAmount(tokenIn, amountIn);
        
        // Calculate normalized output amount
        uint256 normalizedAmountOut = (normalizedAmountIn * rate) / 1e18;
        
        // Denormalize to output token's decimals
        amountOut = _denormalizeAmount(tokenOut, normalizedAmountOut);
    }

    /**
     * @notice Get current exchange rate
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @return rate Current exchange rate (scaled by 1e18)
     */
    function getExchangeRate(address tokenIn, address tokenOut) external view returns (uint256 rate) {
        return exchangeRates[tokenIn][tokenOut];
    }

    /**
     * @notice Get total amount swapped for a token pair
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @return total Total amount of tokenIn swapped for tokenOut
     */
    function getTotalSwapped(address tokenIn, address tokenOut) external view returns (uint256 total) {
        return totalSwapped[tokenIn][tokenOut];
    }

    /**
     * @notice Get the effective exchange rate in native token terms
     * @param tokenIn Input token
     * @param tokenOut Output token
     * @param amountIn Amount of tokenIn to use for rate calculation (in native decimals)
     * @return amountOut Amount of tokenOut that would be received (in native decimals)
     * @dev This shows the actual exchange rate accounting for decimal differences
     */
    function getEffectiveRate(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut) {
        uint256 rate = exchangeRates[tokenIn][tokenOut];
        if (rate == 0) return 0;

        // Normalize input amount to 18 decimals for calculation
        uint256 normalizedAmountIn = _normalizeAmount(tokenIn, amountIn);
        
        // Calculate normalized output amount
        uint256 normalizedAmountOut = (normalizedAmountIn * rate) / 1e18;
        
        // Denormalize to output token's decimals
        amountOut = _denormalizeAmount(tokenOut, normalizedAmountOut);
    }

    // --- Emergency Functions ---

    /**
     * @notice Emergency withdraw tokens (owner only)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     * @param to Recipient
     */
    function emergencyWithdraw(address token, uint256 amount, address to) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }
}
