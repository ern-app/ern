// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestAccounts} from "../utils/TestAccounts.sol";
import {Logging} from "../utils/Logging.sol";
import {StringFormatting} from "../utils/StringFormatting.sol";

import {ISwapRouter} from "@uniswap-v3-periphery-1.4.4/contracts/interfaces/ISwapRouter.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {console2 as console} from "forge-std/console2.sol";

contract UniswapV3SwapRouterUsage is TestAccounts, Logging {
    using StringFormatting for uint256;
    using StringFormatting for string;

    ISwapRouter swapRouter = ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    ERC20 wbtc = ERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
    ERC20 usdc = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    ERC20 usdt = ERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);

    // Common fee tiers for USDC/WBTC pair
    uint24 constant FEE_LOW = 500; // 0.05%
    uint24 constant FEE_MEDIUM = 3000; // 0.30%
    uint24 constant FEE_HIGH = 10000; // 1.00%

    function setUp() public {
        try vm.envString("MAINNET_RPC_URL") returns (string memory rpcUrl) {
            uint256 forkId = vm.createFork(rpcUrl);
            vm.rollFork(forkId, 22_930_454); // cache to make fork tests faster
            vm.selectFork(forkId);
        } catch {
            vm.skip(true);
        }

        setupAccounts();

        vm.label(address(wbtc), "WBTC");
        vm.label(address(usdc), "USDC");
        vm.label(address(usdt), "USDT");

        deal(address(usdc), A, 10_000 * (10 ** usdc.decimals()));
        deal(address(wbtc), A, 10 * (10 ** wbtc.decimals())); // 10 WBTC
    }

    /// @notice Test basic USDC to WBTC swap flow
    /// This test shows:
    /// 1. Initial token balances
    /// 2. Token approval to the router
    /// 3. Exact input swap operation
    /// 4. Balance changes and exchange rates
    function test_SwapFlow_BasicUSDCToWBTC() public {
        uint256 usdcAmountIn = 1000 * (10 ** usdc.decimals()); // 1000 USDC
        uint256 minWbtcOut = 0; // Accept any amount for this test

        console.log("=== UNISWAP V3 USDC -> WBTC SWAP TEST ===");
        console.log("Swapping USDC for WBTC: ", usdcAmountIn.decimal6());

        // 1. Check initial balances
        uint256 initialUSDCBalance = usdc.balanceOf(A);
        uint256 initialWBTCBalance = wbtc.balanceOf(A);

        console.log("Initial USDC balance: %s", initialUSDCBalance.decimal6());
        console.log("Initial WBTC balance: %s", initialWBTCBalance.decimal8());

        // 2. Approve the router to spend USDC
        vm.startPrank(A);
        usdc.approve(address(swapRouter), usdcAmountIn);
        console.log("Approved %s USDC to SwapRouter", usdcAmountIn.decimal6());

        // 3. Execute the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(usdc),
            tokenOut: address(wbtc),
            fee: FEE_MEDIUM, // 0.3% fee tier
            recipient: A,
            deadline: block.timestamp + 300,
            amountIn: usdcAmountIn,
            amountOutMinimum: minWbtcOut,
            sqrtPriceLimitX96: 0
        });

        uint256 wbtcReceived = swapRouter.exactInputSingle(params);
        console.log("Swap transaction completed");
        vm.stopPrank();

        // 4. Verify the results
        uint256 finalUSDCBalance = usdc.balanceOf(A);
        uint256 finalWBTCBalance = wbtc.balanceOf(A);

        console.log("Final USDC balance: %s", finalUSDCBalance.decimal6());
        console.log("Final WBTC balance: %s", finalWBTCBalance.decimal8());
        console.log("WBTC received: %s", wbtcReceived.decimal8());

        // Assertions
        assertEq(finalUSDCBalance, initialUSDCBalance - usdcAmountIn, "USDC balance should decrease by input amount");
        assertEq(finalWBTCBalance, initialWBTCBalance + wbtcReceived, "WBTC balance should increase by output amount");
        assertGt(wbtcReceived, 0, "Should receive some WBTC");

        // Calculate effective exchange rate
        uint256 exchangeRate = (usdcAmountIn * (10 ** wbtc.decimals())) / (wbtcReceived);
        console.log("Effective exchange rate: 1 WBTC = %s USDC", exchangeRate.decimal6());

        console.log("USDC -> WBTC swap completed successfully");
    }

    /// @notice Test basic WBTC to USDC swap flow (reverse direction)
    /// This test shows:
    /// 1. Swapping in the opposite direction
    /// 2. How decimal differences affect calculations
    /// 3. Slippage protection with minimum output
    function test_SwapFlow_BasicWBTCToUSDC() public {
        uint256 wbtcAmountIn = 1 * (10 ** (wbtc.decimals() - 2)); // 0.01 WBTC
        uint256 minUsdcOut = 300 * (10 ** usdc.decimals()); // Expect at least 300 USDC

        console.log("=== UNISWAP V3 WBTC -> USDC SWAP TEST ===");
        console.log("Swapping %s WBTC for USDC", wbtcAmountIn.decimal8());

        // 1. Check initial balances
        uint256 initialWBTCBalance = wbtc.balanceOf(A);
        uint256 initialUSDCBalance = usdc.balanceOf(A);

        console.log("Initial WBTC balance: %s", initialWBTCBalance.decimal8());
        console.log("Initial USDC balance: %s", initialUSDCBalance.decimal6());

        // 2. Approve the router to spend WBTC
        vm.startPrank(A);
        wbtc.approve(address(swapRouter), wbtcAmountIn);
        console.log("Approved %s WBTC to SwapRouter", wbtcAmountIn.decimal8());

        // 3. Execute the swap with slippage protection
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(wbtc),
            tokenOut: address(usdc),
            fee: FEE_MEDIUM, // 0.3% fee tier
            recipient: A,
            deadline: block.timestamp + 300,
            amountIn: wbtcAmountIn,
            amountOutMinimum: minUsdcOut,
            sqrtPriceLimitX96: 0
        });

        uint256 usdcReceived = swapRouter.exactInputSingle(params);
        console.log("Swap transaction completed");
        vm.stopPrank();

        // 4. Verify the results
        uint256 finalWBTCBalance = wbtc.balanceOf(A);
        uint256 finalUSDCBalance = usdc.balanceOf(A);

        console.log("Final WBTC balance: %s", finalWBTCBalance.decimal8());
        console.log("Final USDC balance: %s", finalUSDCBalance.decimal6());
        console.log("USDC received: %s", usdcReceived.decimal6());

        // Assertions
        assertEq(finalWBTCBalance, initialWBTCBalance - wbtcAmountIn, "WBTC balance should decrease by input amount");
        assertEq(finalUSDCBalance, initialUSDCBalance + usdcReceived, "USDC balance should increase by output amount");
        assertGe(usdcReceived, minUsdcOut, "Should receive at least minimum USDC amount");

        // Calculate effective exchange rate
        uint256 exchangeRate = (usdcReceived * (10 ** wbtc.decimals())) / (wbtcAmountIn);
        console.log("Effective exchange rate: 1 WBTC = %s USDC", exchangeRate.decimal6());

        console.log("WBTC -> USDC swap completed successfully");
    }

    /// @notice Test different fee tiers and their impact on swaps
    /// This test demonstrates:
    /// 1. How different fee tiers affect swap outcomes
    /// 2. Trade-offs between fees and liquidity
    /// 3. How to choose optimal fee tiers
    function test_FeeTiers_CompareSwapOutcomes() public {
        uint256 usdcAmountIn = 500 * (10 ** usdc.decimals()); // 500 USDC

        console.log("=== FEE TIER COMPARISON TEST ===");
        console.log("Testing swap of %s USDC across different fee tiers", usdcAmountIn.decimal6());

        // Test each fee tier
        uint24[3] memory feeTiers = [FEE_LOW, FEE_MEDIUM, FEE_HIGH];
        string[3] memory feeNames = ["0.05%", "0.30%", "1.00%"];

        for (uint256 i = 0; i < feeTiers.length; i++) {
            console.log("\n--- Testing %s fee tier ---", feeNames[i]);

            vm.startPrank(A);
            usdc.approve(address(swapRouter), usdcAmountIn);

            try swapRouter.exactInputSingle(
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: address(usdc),
                    tokenOut: address(wbtc),
                    fee: feeTiers[i],
                    recipient: A,
                    deadline: block.timestamp + 300,
                    amountIn: usdcAmountIn,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                })
            ) returns (uint256 wbtcReceived) {
                console.log("Fee tier %s: Received %s WBTC", feeNames[i], wbtcReceived);

                // Calculate effective price including fees
                uint256 effectivePrice =
                    (usdcAmountIn * (10 ** wbtc.decimals())) / (wbtcReceived * (10 ** usdc.decimals()));
                console.log("Effective price (1 WBTC = X USDC): %s", effectivePrice);

                // Swap back to restore balance for next test
                wbtc.approve(address(swapRouter), wbtcReceived);
                swapRouter.exactInputSingle(
                    ISwapRouter.ExactInputSingleParams({
                        tokenIn: address(wbtc),
                        tokenOut: address(usdc),
                        fee: feeTiers[i],
                        recipient: A,
                        deadline: block.timestamp + 300,
                        amountIn: wbtcReceived,
                        amountOutMinimum: 0,
                        sqrtPriceLimitX96: 0
                    })
                );
            } catch Error(string memory reason) {
                console.log("Fee tier %s failed: %s", feeNames[i], reason);
            } catch {
                console.log("Fee tier %s failed: Unknown error (likely no liquidity)", feeNames[i]);
            }
            vm.stopPrank();
        }

        console.log("\nFee tier comparison completed");
    }

    /// @notice Test slippage protection and minimum output amounts
    /// This test demonstrates:
    /// 1. How to set appropriate slippage protection
    /// 2. What happens when minimum output is not met
    /// 3. Market impact of larger trades
    function test_SlippageProtection_MinimumOutputValidation() public {
        uint256 usdcAmountIn = 2000 * (10 ** usdc.decimals()); // 2000 USDC

        console.log("=== SLIPPAGE PROTECTION TEST ===");
        console.log("Testing slippage protection with %s USDC swap", usdcAmountIn.decimal6());

        // First, do a test swap to get expected output
        vm.startPrank(A);
        usdc.approve(address(swapRouter), usdcAmountIn);

        uint256 expectedWbtc = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: usdcAmountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Test swap completed - expected WBTC: %s", expectedWbtc);

        // Swap back to restore balance
        wbtc.approve(address(swapRouter), expectedWbtc);
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(wbtc),
                tokenOut: address(usdc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: expectedWbtc,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
        vm.stopPrank();

        console.log("Balance restored for slippage tests");

        // Test 1: Reasonable slippage (5%)
        console.log("\n--- Test 1: 5%% slippage tolerance ---");
        uint256 minWbtc5Percent = (expectedWbtc * 95) / 100;

        vm.startPrank(A);
        usdc.approve(address(swapRouter), usdcAmountIn);

        uint256 wbtcReceived1 = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: usdcAmountIn,
                amountOutMinimum: minWbtc5Percent,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("5%% slippage test passed - received: %s WBTC", wbtcReceived1);

        // Restore balance
        wbtc.approve(address(swapRouter), wbtcReceived1);
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(wbtc),
                tokenOut: address(usdc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: wbtcReceived1,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
        vm.stopPrank();

        // Test 2: Unreasonable slippage (expect revert)
        console.log("\n--- Test 2: Unreasonable slippage (should revert) ---");
        uint256 unreasonableMinWbtc = expectedWbtc * 2; // Expect double the WBTC

        vm.startPrank(A);
        usdc.approve(address(swapRouter), usdcAmountIn);

        vm.expectRevert();
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: usdcAmountIn,
                amountOutMinimum: unreasonableMinWbtc,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Unreasonable slippage correctly reverted");
        vm.stopPrank();

        console.log("Slippage protection tests completed successfully");
    }

    /// @notice Test large swap impact and price movement
    /// This test demonstrates:
    /// 1. How large swaps affect token prices
    /// 2. Price impact calculations
    /// 3. Comparing small vs large swap efficiency
    function test_PriceImpact_LargeVsSmallSwaps() public {
        console.log("=== PRICE IMPACT COMPARISON TEST ===");

        // Small swap baseline
        uint256 smallSwapAmount = 100 * (10 ** usdc.decimals()); // 100 USDC

        console.log("--- Small swap baseline (%s USDC) ---", smallSwapAmount.decimal6());

        vm.startPrank(A);
        usdc.approve(address(swapRouter), smallSwapAmount);

        uint256 smallSwapWbtc = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: smallSwapAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        uint256 smallSwapRate = (smallSwapAmount * (10 ** wbtc.decimals())) / (smallSwapWbtc * (10 ** usdc.decimals()));
        console.log("Small swap rate: 1 WBTC = %s USDC", smallSwapRate);
        console.log("Small swap received: %s WBTC", smallSwapWbtc);

        // Restore balance
        wbtc.approve(address(swapRouter), smallSwapWbtc);
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(wbtc),
                tokenOut: address(usdc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: smallSwapWbtc,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
        vm.stopPrank();

        // Large swap test
        uint256 largeSwapAmount = 5000 * (10 ** usdc.decimals()); // 5000 USDC

        console.log("\n--- Large swap test (%s USDC) ---", largeSwapAmount.decimal6());

        vm.startPrank(A);
        usdc.approve(address(swapRouter), largeSwapAmount);

        uint256 largeSwapWbtc = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: largeSwapAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        uint256 largeSwapRate = (largeSwapAmount * (10 ** wbtc.decimals())) / (largeSwapWbtc * (10 ** usdc.decimals()));
        console.log("Large swap rate: 1 WBTC = %s USDC", largeSwapRate);
        console.log("Large swap received: %s WBTC", largeSwapWbtc);

        // Calculate price impact
        uint256 priceImpactBps = largeSwapRate > smallSwapRate
            ? ((largeSwapRate - smallSwapRate) * 10000) / smallSwapRate
            : ((smallSwapRate - largeSwapRate) * 10000) / smallSwapRate;

        console.log("Price impact: %s basis points", priceImpactBps);

        // Restore balance
        wbtc.approve(address(swapRouter), largeSwapWbtc);
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(wbtc),
                tokenOut: address(usdc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: largeSwapWbtc,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
        vm.stopPrank();

        // Efficiency comparison
        uint256 smallSwapEfficiency = (smallSwapWbtc * 10000) / smallSwapAmount; // WBTC per 10k USDC
        uint256 largeSwapEfficiency = (largeSwapWbtc * 10000) / largeSwapAmount;

        console.log("\n--- Efficiency Analysis ---");
        console.log("Small swap efficiency: %s WBTC per 10k USDC", smallSwapEfficiency);
        console.log("Large swap efficiency: %s WBTC per 10k USDC", largeSwapEfficiency);

        if (largeSwapEfficiency < smallSwapEfficiency) {
            uint256 efficiencyLoss = ((smallSwapEfficiency - largeSwapEfficiency) * 10000) / smallSwapEfficiency;
            console.log("Large swap efficiency loss: %s basis points", efficiencyLoss);
        }

        console.log("Price impact analysis completed");
    }

    /// @notice Test deadline and expired transaction handling
    /// This test demonstrates:
    /// 1. How deadline protection works
    /// 2. What happens with expired transactions
    /// 3. Best practices for deadline setting
    function test_DeadlineProtection_ExpiredTransactions() public {
        uint256 usdcAmountIn = 500 * (10 ** usdc.decimals());

        console.log("=== DEADLINE PROTECTION TEST ===");

        // Test 1: Valid deadline (future)
        console.log("--- Test 1: Valid future deadline ---");

        vm.startPrank(A);
        usdc.approve(address(swapRouter), usdcAmountIn);

        uint256 futureDeadline = block.timestamp + 300; // 5 minutes in future

        uint256 wbtcReceived = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: futureDeadline,
                amountIn: usdcAmountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Future deadline swap successful - received: %s WBTC", wbtcReceived);

        // Restore balance
        wbtc.approve(address(swapRouter), wbtcReceived);
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(wbtc),
                tokenOut: address(usdc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: wbtcReceived,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );
        vm.stopPrank();

        // Test 2: Expired deadline (should revert)
        console.log("\n--- Test 2: Expired deadline (should revert) ---");

        vm.startPrank(A);
        usdc.approve(address(swapRouter), usdcAmountIn);

        uint256 pastDeadline = block.timestamp - 1; // 1 second in the past

        vm.expectRevert();
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: pastDeadline,
                amountIn: usdcAmountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Expired deadline correctly reverted");
        vm.stopPrank();

        console.log("Deadline protection tests completed successfully");
    }

    /// @notice Test round-trip swaps and arbitrage opportunities
    /// This test demonstrates:
    /// 1. Round-trip swap efficiency
    /// 2. How fees compound in multiple swaps
    /// 3. Arbitrage detection between different paths
    function test_RoundTripSwaps_ArbitrageAnalysis() public {
        uint256 initialUsdcAmount = 1000 * (10 ** usdc.decimals()); // 1000 USDC

        console.log("=== ROUND-TRIP SWAP ANALYSIS ===");
        console.log("Starting with %s USDC", initialUsdcAmount.decimal6());

        uint256 startingUsdcBalance = usdc.balanceOf(A);

        vm.startPrank(A);

        // Step 1: USDC -> WBTC
        console.log("\n--- Step 1: USDC -> WBTC ---");
        usdc.approve(address(swapRouter), initialUsdcAmount);

        uint256 wbtcReceived = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: initialUsdcAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Received %s WBTC for %s USDC", wbtcReceived, initialUsdcAmount.decimal6());

        // Step 2: WBTC -> USDC (complete round trip)
        console.log("\n--- Step 2: WBTC -> USDC (Round Trip) ---");
        wbtc.approve(address(swapRouter), wbtcReceived);

        uint256 finalUsdcReceived = swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(wbtc),
                tokenOut: address(usdc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: wbtcReceived,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        vm.stopPrank();

        uint256 finalUsdcBalance = usdc.balanceOf(A);
        uint256 netLoss = startingUsdcBalance - finalUsdcBalance;

        console.log("Final USDC received: %s", finalUsdcReceived.decimal6());
        console.log("Net loss from round trip: %s USDC", netLoss.decimal6());

        // Calculate round-trip efficiency
        uint256 efficiencyBps = (finalUsdcReceived * 10000) / initialUsdcAmount;
        uint256 lossBps = 10000 - efficiencyBps;

        console.log("Round-trip efficiency: %s.%s%%", efficiencyBps / 100, efficiencyBps % 100);
        console.log("Round-trip loss: %s basis points", lossBps);

        // Assertions
        assertLt(finalUsdcBalance, startingUsdcBalance, "Should lose some USDC due to fees and slippage");
        assertGt(efficiencyBps, 9800, "Should retain at least 98% of value"); // Reasonable expectation

        console.log("Round-trip swap analysis completed");
    }

    /// @notice Test error conditions and edge cases
    /// This test demonstrates:
    /// 1. Insufficient balance errors
    /// 2. Zero amount swaps
    /// 3. Invalid token pair scenarios
    function test_ErrorConditions_EdgeCases() public {
        console.log("=== ERROR CONDITIONS AND EDGE CASES TEST ===");

        // Test 1: Insufficient balance
        console.log("--- Test 1: Insufficient balance ---");
        uint256 excessiveAmount = usdc.balanceOf(A) + 1000 * (10 ** usdc.decimals());

        vm.startPrank(A);
        usdc.approve(address(swapRouter), excessiveAmount);

        vm.expectRevert();
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: excessiveAmount,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Insufficient balance correctly reverted");
        vm.stopPrank();

        // Test 2: Zero amount swap
        console.log("\n--- Test 2: Zero amount swap ---");

        vm.startPrank(A);
        usdc.approve(address(swapRouter), 0);

        vm.expectRevert();
        swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(wbtc),
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: 0,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        );

        console.log("Zero amount swap correctly reverted");
        vm.stopPrank();

        // Test 3: Same token swap (if it would be possible)
        console.log("\n--- Test 3: Same token swap attempt ---");

        vm.startPrank(A);
        usdc.approve(address(swapRouter), 100 * (10 ** usdc.decimals()));

        // This would revert with pool not found or similar
        try swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: address(usdc),
                tokenOut: address(usdc), // Same token
                fee: FEE_MEDIUM,
                recipient: A,
                deadline: block.timestamp + 300,
                amountIn: 100 * (10 ** usdc.decimals()),
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            })
        ) {
            console.log("Unexpected: Same token swap succeeded");
        } catch {
            console.log("Same token swap correctly failed");
        }
        vm.stopPrank();

        console.log("Error conditions testing completed");
    }
}

