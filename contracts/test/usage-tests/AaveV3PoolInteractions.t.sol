// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {TestAccounts} from "../utils/TestAccounts.sol";
import {IPool as IAaveV3Pool} from "aave-v3-origin/src/contracts/interfaces/IPool.sol";
import {IAToken} from "aave-v3-origin/src/contracts/interfaces/IAToken.sol";
import {DataTypes} from "aave-v3-origin/src/contracts/protocol/libraries/types/DataTypes.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console2 as console} from "forge-std/console2.sol";

contract AaveV3PoolInteractions is TestAccounts {
    IAaveV3Pool aaveV3Pool = IAaveV3Pool(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2);
    ERC20 usdc = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    ERC20 usdt = ERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);

    function setUp() public {
        try vm.envString("MAINNET_RPC_URL") returns (string memory rpcUrl) {
            uint256 forkId = vm.createFork(rpcUrl);
            vm.rollFork(forkId, 22_930_454); // cache to make fork tests faster
            vm.selectFork(forkId);
        } catch {
            vm.skip(true);
        }

        setupAccounts();

        deal(address(usdc), A, 10_000 * (10 ** usdc.decimals()));
    }

    /// @notice Test basic supply flow - demonstrates how to supply assets to Aave V3
    /// This test shows:
    /// 1. Initial user balance
    /// 2. Approval of tokens to the pool
    /// 3. Supply operation
    /// 4. aToken minting and balance changes
    function test_SupplyFlow_BasicUSDCSupply() public {
        uint256 supplyAmount = 1000 * (10 ** usdc.decimals()); // 1000 USDC

        console.log("=== AAVE V3 SUPPLY FLOW TEST ===");
        console.log("Supplying %s USDC to Aave V3 Pool", supplyAmount);

        // 1. Check initial balances
        uint256 initialUSDCBalance = usdc.balanceOf(A);
        console.log("Initial USDC balance of user A: %s", initialUSDCBalance);

        // Get aToken address for USDC
        address aUSDCAddress = aaveV3Pool.getReserveAToken(address(usdc));
        IERC20 aUSDC = IERC20(aUSDCAddress);
        uint256 initialATokenBalance = aUSDC.balanceOf(A);
        console.log("Initial aUSDC balance of user A: %s", initialATokenBalance);

        // 2. Approve the pool to spend USDC
        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), supplyAmount);
        console.log("Approved %s USDC to Aave V3 Pool", supplyAmount);

        // 3. Supply USDC to the pool
        aaveV3Pool.supply(
            address(usdc), // asset to supply
            supplyAmount, // amount to supply
            A, // on behalf of (recipient of aTokens)
            0 // referral code
        );
        console.log("Supply transaction completed");
        vm.stopPrank();

        // 4. Verify the results
        uint256 finalUSDCBalance = usdc.balanceOf(A);
        uint256 finalATokenBalance = aUSDC.balanceOf(A);

        console.log("Final USDC balance of user A: %s", finalUSDCBalance);
        console.log("Final aUSDC balance of user A: %s", finalATokenBalance);

        // Assertions
        assertEq(finalUSDCBalance, initialUSDCBalance - supplyAmount, "USDC balance should decrease by supply amount");
        assertGt(finalATokenBalance, initialATokenBalance, "aUSDC balance should increase");

        console.log("Supply flow completed successfully");
        console.log("USDC transferred from user: %s", (initialUSDCBalance - finalUSDCBalance));
        console.log("aUSDC received by user: %s", (finalATokenBalance - initialATokenBalance));
    }

    /// @notice Test withdraw flow - demonstrates how to withdraw assets from Aave V3
    /// This test shows:
    /// 1. Supply assets first
    /// 2. Check aToken balance
    /// 3. Withdraw operation (partial and full)
    /// 4. Balance changes and aToken burning
    function test_WithdrawFlow_PartialAndFullWithdraw() public {
        uint256 supplyAmount = 2000 * (10 ** usdc.decimals()); // 2000 USDC
        uint256 partialWithdrawAmount = 500 * (10 ** usdc.decimals()); // 500 USDC

        console.log("=== AAVE V3 WITHDRAW FLOW TEST ===");

        // First, supply some USDC to have something to withdraw
        address aUSDCAddress = aaveV3Pool.getReserveAToken(address(usdc));
        IERC20 aUSDC = IERC20(aUSDCAddress);

        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), supplyAmount);
        aaveV3Pool.supply(address(usdc), supplyAmount, A, 0);
        vm.stopPrank();

        console.log("Initial supply completed: %s USDC", supplyAmount);

        // Wait a bit to accrue some interest (simulate time passage)
        vm.warp(block.timestamp + 1 days);

        // Check balances before withdrawal
        uint256 usdcBalanceBeforeWithdraw = usdc.balanceOf(A);
        uint256 aTokenBalanceBeforeWithdraw = aUSDC.balanceOf(A);

        console.log("Before withdraw - USDC balance: %s", usdcBalanceBeforeWithdraw);
        console.log("Before withdraw - aUSDC balance: %s", aTokenBalanceBeforeWithdraw);

        // 1. Perform partial withdrawal
        console.log("\n--- Partial Withdrawal ---");
        vm.startPrank(A);
        uint256 actualWithdrawn1 = aaveV3Pool.withdraw(
            address(usdc), // asset to withdraw
            partialWithdrawAmount, // amount to withdraw
            A // recipient
        );
        vm.stopPrank();

        uint256 usdcBalanceAfterPartial = usdc.balanceOf(A);
        uint256 aTokenBalanceAfterPartial = aUSDC.balanceOf(A);

        console.log("Partial withdraw completed: %s USDC", actualWithdrawn1);
        console.log("After partial withdraw - USDC balance: %s", usdcBalanceAfterPartial);
        console.log("After partial withdraw - aUSDC balance: %s", aTokenBalanceAfterPartial);

        // 2. Perform full withdrawal (withdraw remaining balance)
        console.log("\n--- Full Withdrawal ---");

        vm.startPrank(A);
        uint256 actualWithdrawn2 = aaveV3Pool.withdraw(
            address(usdc),
            type(uint256).max, // Use max uint256 to withdraw all available
            A
        );
        vm.stopPrank();

        uint256 finalUSDCBalance = usdc.balanceOf(A);
        uint256 finalATokenBalance = aUSDC.balanceOf(A);

        console.log("Full withdraw completed: %s USDC", actualWithdrawn2);
        console.log("Final USDC balance: %s", finalUSDCBalance);
        console.log("Final aUSDC balance: %s", finalATokenBalance);

        // Assertions
        assertGt(actualWithdrawn1, 0, "Partial withdrawal should return positive amount");
        assertGt(actualWithdrawn2, 0, "Full withdrawal should return positive amount");
        assertEq(finalATokenBalance, 0, "aToken balance should be zero after full withdrawal");

        // Total withdrawn should be close to supply amount plus interest
        uint256 totalWithdrawn = actualWithdrawn1 + actualWithdrawn2;
        assertGe(
            totalWithdrawn, supplyAmount, "Total withdrawn should be at least the supplied amount (including interest)"
        );

        console.log("Withdraw flow completed successfully");
        console.log("Total USDC withdrawn: %s (including interest)", totalWithdrawn);
        console.log("Interest earned: %s USDC", (totalWithdrawn - supplyAmount));
    }

    /// @notice Test supply and withdraw with different users to show isolation
    /// This test demonstrates:
    /// 1. Multiple users can supply independently
    /// 2. Each user gets their own aTokens
    /// 3. Withdrawals don't affect other users
    function test_MultiUserSupplyWithdrawFlow() public {
        uint256 supplyAmountA = 1000 * (10 ** usdc.decimals());
        uint256 supplyAmountB = 1500 * (10 ** usdc.decimals());

        console.log("=== MULTI-USER SUPPLY/WITHDRAW FLOW TEST ===");

        // Give some USDC to user B as well
        deal(address(usdc), B, 5000 * (10 ** usdc.decimals()));

        address aUSDCAddress = aaveV3Pool.getReserveAToken(address(usdc));
        IERC20 aUSDC = IERC20(aUSDCAddress);

        // User A supplies
        console.log("User A supplying %s USDC", supplyAmountA);
        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), supplyAmountA);
        aaveV3Pool.supply(address(usdc), supplyAmountA, A, 0);
        vm.stopPrank();

        uint256 aTokenBalanceA_afterSupply = aUSDC.balanceOf(A);

        // User B supplies
        console.log("User B supplying %s USDC", supplyAmountB);
        vm.startPrank(B);
        usdc.approve(address(aaveV3Pool), supplyAmountB);
        aaveV3Pool.supply(address(usdc), supplyAmountB, B, 0);
        vm.stopPrank();

        uint256 aTokenBalanceB_afterSupply = aUSDC.balanceOf(B);
        uint256 aTokenBalanceA_afterB_supply = aUSDC.balanceOf(A);

        console.log("User A aUSDC balance after both supplies: %s", aTokenBalanceA_afterB_supply);
        console.log("User B aUSDC balance after supply: %s", aTokenBalanceB_afterSupply);

        // Simulate time passage for interest accrual
        vm.warp(block.timestamp + 48 hours);

        // User A withdraws half their position
        uint256 withdrawAmountA = supplyAmountA / 2;
        console.log("\nUser A withdrawing %s USDC", withdrawAmountA);

        uint256 usdcBalanceA_beforeWithdraw = usdc.balanceOf(A);
        uint256 aTokenBalanceB_beforeA_withdraw = aUSDC.balanceOf(B);

        vm.startPrank(A);
        uint256 actualWithdrawnA = aaveV3Pool.withdraw(address(usdc), withdrawAmountA, A);
        vm.stopPrank();

        uint256 usdcBalanceA_afterWithdraw = usdc.balanceOf(A);
        uint256 aTokenBalanceA_afterWithdraw = aUSDC.balanceOf(A);
        uint256 aTokenBalanceB_afterA_withdraw = aUSDC.balanceOf(B);

        console.log("User A USDC balance after withdraw: %s", usdcBalanceA_afterWithdraw);
        console.log("User A aUSDC balance after withdraw: %s", aTokenBalanceA_afterWithdraw);
        console.log("User B aUSDC balance (should be unchanged): %s", aTokenBalanceB_afterA_withdraw);

        // Assertions
        assertEq(
            aTokenBalanceA_afterSupply,
            aTokenBalanceA_afterB_supply,
            "User A aToken balance should not change when User B supplies"
        );

        assertEq(
            aTokenBalanceB_beforeA_withdraw,
            aTokenBalanceB_afterA_withdraw,
            "User B aToken balance should not change when User A withdraws"
        );

        assertGt(usdcBalanceA_afterWithdraw, usdcBalanceA_beforeWithdraw, "User A should receive USDC from withdrawal");

        console.log("Multi-user flow completed successfully");
        console.log("User A actual withdrawal: %s USDC", actualWithdrawnA);
    }

    /// @notice Test edge cases and error conditions
    /// This test demonstrates:
    /// 1. Attempting to withdraw more than available
    /// 2. Supply with zero amount
    /// 3. Withdraw with zero balance
    function test_EdgeCases_SupplyWithdrawErrorConditions() public {
        console.log("=== EDGE CASES AND ERROR CONDITIONS TEST ===");

        address aUSDCAddress = aaveV3Pool.getReserveAToken(address(usdc));
        IERC20 aUSDC = IERC20(aUSDCAddress);
        uint8 decimals = usdc.decimals();

        // Test 1: Try to withdraw when no balance
        console.log("Test 1: Attempting to withdraw with zero aToken balance");
        vm.startPrank(B); // User B has no aTokens
        vm.expectRevert(bytes4(0x47bc4b2c)); // NotEnoughAvailableUserBalance()
        aaveV3Pool.withdraw(address(usdc), 100 * (10 ** decimals), B);
        vm.stopPrank();
        console.log("Correctly reverted when attempting to withdraw with zero balance");

        // Test 2: Supply zero amount (should work but no effect)
        console.log("\nTest 2: Supplying zero amount");
        uint256 initialBalance = aUSDC.balanceOf(A);
        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), 0);
        vm.expectRevert(bytes4(0x2c5211c6)); // IInvalidAmount()
        aaveV3Pool.supply(address(usdc), 0, A, 0);
        vm.stopPrank();
        uint256 finalBalance = aUSDC.balanceOf(A);
        assertEq(initialBalance, finalBalance, "Zero supply should not change balance");
        console.log("Zero amount supply handled correctly");

        // Test 3: Supply and then try to withdraw more than available
        console.log("\nTest 3: Supply then attempt to withdraw more than available");
        uint256 supplyAmount = 10 * (10 ** decimals);

        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), supplyAmount);
        aaveV3Pool.supply(address(usdc), supplyAmount, A, 0);

        // Try to withdraw more than supplied
        uint256 excessiveWithdrawAmount = supplyAmount * 2;
        vm.expectRevert(bytes4(0x47bc4b2c)); // Should revert NotEnoughAvailableUserBalance()
        aaveV3Pool.withdraw(address(usdc), excessiveWithdrawAmount, A);
        vm.stopPrank();
        console.log("Correctly reverted when attempting to withdraw more than available");

        console.log("All edge case tests completed successfully");
    }

    /// @notice Test interest accrual and compound interest mechanics
    /// This test demonstrates:
    /// 1. How interest accrues over time in Aave V3
    /// 2. How to calculate earned interest
    /// 3. Withdrawing principal while leaving interest to compound
    /// 4. How remaining interest continues to grow
    function test_InterestAccrualAndCompounding() public {
        uint256 principalAmount = 5000 * (10 ** usdc.decimals()); // 5000 USDC
        uint256 targetInterestThreshold = 50 * (10 ** usdc.decimals()); // 50 USDC minimum interest

        console.log("=== AAVE V3 INTEREST ACCRUAL AND COMPOUNDING TEST ===");
        console.log("Principal amount: %s USDC", principalAmount / (10 ** usdc.decimals()));
        console.log("Target interest threshold: %s USDC", targetInterestThreshold / (10 ** usdc.decimals()));

        address aUSDCAddress = aaveV3Pool.getReserveAToken(address(usdc));
        IERC20 aUSDC = IERC20(aUSDCAddress);

        // 1. Supply the principal amount
        console.log("\n--- Initial Supply ---");
        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), principalAmount);
        aaveV3Pool.supply(address(usdc), principalAmount, A, 0);
        vm.stopPrank();

        console.log("Initial aUSDC balance: %s", aUSDC.balanceOf(A));
        console.log("Supply completed at timestamp: %s", block.timestamp);

        // 2. Create some borrowing activity to generate higher interest rates
        console.log("\n--- Simulating Market Activity ---");
        _simulateMarketActivity();

        // 3. Wait for interest to accrue and check periodically
        uint256 timeElapsed = _waitForInterestAccrual(aUSDC, principalAmount, targetInterestThreshold);

        // 4. Withdraw only the principal, leaving the interest
        console.log("\n--- Withdrawing Principal Only ---");

        vm.startPrank(A);
        uint256 principalWithdrawn = aaveV3Pool.withdraw(address(usdc), principalAmount, A);
        vm.stopPrank();

        uint256 remainingBalance = aUSDC.balanceOf(A);

        console.log("Principal withdrawn: %s USDC", principalWithdrawn / (10 ** usdc.decimals()));
        console.log("Remaining aUSDC balance (interest): %s", remainingBalance);

        // 5. Let the remaining interest compound for more time
        console.log("\n--- Interest Compounding Phase ---");

        // Wait another 60 days for more compounding
        vm.warp(block.timestamp + 60 days);
        _simulateMarketActivity();

        uint256 compoundedBalance = aUSDC.balanceOf(A);

        console.log("Interest balance before compounding: %s", remainingBalance);
        console.log("Interest balance after 60 more days: %s", compoundedBalance);

        // 6. Finally withdraw all remaining interest
        console.log("\n--- Final Interest Withdrawal ---");

        vm.startPrank(A);
        uint256 finalInterestWithdrawn = aaveV3Pool.withdraw(address(usdc), type(uint256).max, A);
        vm.stopPrank();

        console.log("Final interest withdrawn: %s USDC", finalInterestWithdrawn / (10 ** usdc.decimals()));
        console.log("Final aUSDC balance: %s", aUSDC.balanceOf(A));

        // Assertions
        assertGe(principalWithdrawn, principalAmount, "Should withdraw at least principal");
        assertGt(compoundedBalance, remainingBalance, "Interest should compound");
        assertGt(finalInterestWithdrawn, 0, "Should earn interest");
        assertEq(aUSDC.balanceOf(A), 0, "All aTokens should be withdrawn");

        // Calculate and display final results
        _displayFinalResults(principalAmount, principalWithdrawn, finalInterestWithdrawn, timeElapsed);
    }

    /// @notice Helper function to wait for interest accrual until threshold is reached
    function _waitForInterestAccrual(IERC20 aUSDC, uint256 principalAmount, uint256 targetThreshold)
        internal
        returns (uint256 timeElapsed)
    {
        uint256 currentInterest = 0;
        timeElapsed = 0;
        uint256 timeStep = 30 days;

        console.log("\n--- Interest Accrual Phase ---");
        while (currentInterest < targetThreshold && timeElapsed < 365 days) {
            vm.warp(block.timestamp + timeStep);
            timeElapsed += timeStep;

            // Calculate current interest by checking withdrawal value
            currentInterest = _calculateCurrentInterest(aUSDC, principalAmount);

            console.log("Time elapsed: %s days", timeElapsed / 1 days);
            console.log("Interest earned: %s USDC", currentInterest / (10 ** usdc.decimals()));

            if (currentInterest >= targetThreshold) {
                console.log("Target interest threshold reached!");
                break;
            }

            _simulateMarketActivity();
        }
    }

    /// @notice Helper function to calculate current interest earned
    function _calculateCurrentInterest(IERC20 aUSDC, uint256 principalAmount) internal returns (uint256) {
        uint256 currentBalance = aUSDC.balanceOf(A);
        if (currentBalance == 0) return 0;

        // Test exchange rate with small withdrawal
        vm.startPrank(A);
        uint256 testAmount = 1 * (10 ** usdc.decimals());
        uint256 testWithdraw = aaveV3Pool.withdraw(address(usdc), testAmount, A);
        // Put it back
        usdc.approve(address(aaveV3Pool), testWithdraw);
        aaveV3Pool.supply(address(usdc), testWithdraw, A, 0);
        vm.stopPrank();

        // Calculate total value
        uint256 totalValue = (currentBalance * testWithdraw) / testAmount;
        return totalValue > principalAmount ? totalValue - principalAmount : 0;
    }

    /// @notice Helper function to display final results
    function _displayFinalResults(
        uint256 principalAmount,
        uint256 principalWithdrawn,
        uint256 finalInterestWithdrawn,
        uint256 timeElapsed
    ) internal view {
        uint256 totalReceived = principalWithdrawn + finalInterestWithdrawn;
        uint256 totalInterest = totalReceived - principalAmount;

        console.log("\n=== FINAL RESULTS ===");
        console.log("Original principal: %s USDC", principalAmount / (10 ** usdc.decimals()));
        console.log("Total USDC received: %s USDC", totalReceived / (10 ** usdc.decimals()));
        console.log("Total interest earned: %s USDC", totalInterest / (10 ** usdc.decimals()));
        console.log("Interest rate earned: %s%%", (totalInterest * 10000) / principalAmount / 100);
        console.log("Time to reach threshold: %s days", timeElapsed / 1 days);
        console.log("Interest accrual and compounding test completed successfully!");
    }

    /// @notice Helper function to simulate market activity and maintain interest rates
    /// Creates borrowing activity to ensure there are interest rates in the pool
    function _simulateMarketActivity() internal {
        // Create some borrowing activity with user C to generate interest rates
        deal(address(usdc), C, 1000 * (10 ** usdc.decimals()));

        vm.startPrank(C);
        // Supply some collateral
        usdc.approve(address(aaveV3Pool), 500 * (10 ** usdc.decimals()));
        aaveV3Pool.supply(address(usdc), 500 * (10 ** usdc.decimals()), C, 0);

        // Enable USDC as collateral
        aaveV3Pool.setUserUseReserveAsCollateral(address(usdc), true);

        // Try to borrow some USDT to create borrowing demand
        try aaveV3Pool.borrow(
            address(usdt), 100 * (10 ** usdt.decimals()), uint256(DataTypes.InterestRateMode.VARIABLE), 0, C
        ) {
            console.log("Successfully created borrowing activity");
        } catch {
            console.log("Borrowing failed (expected in some market conditions)");
        }
        vm.stopPrank();

        // Also add some supply from user D to create more liquidity
        deal(address(usdc), D, 2000 * (10 ** usdc.decimals()));
        vm.startPrank(D);
        usdc.approve(address(aaveV3Pool), 1000 * (10 ** usdc.decimals()));
        aaveV3Pool.supply(address(usdc), 1000 * (10 ** usdc.decimals()), D, 0);
        vm.stopPrank();
    }

    /// @notice Test to demonstrate the CORRECT way to calculate interest without withdrawals
    /// This shows how to separate principal from interest for daily yield extraction
    /// Key insight: scaledBalance * liquidityIndex / 1e27 = total value (principal + interest)
    function test_ATokenExchangeRateMechanism() public {
        uint256 supplyAmount = 1000 * (10 ** usdc.decimals()); // 1000 USDC

        console.log("=== AAVE V3 INTEREST CALCULATION WITHOUT WITHDRAWALS ===");
        console.log("This demonstrates how to track principal vs interest for daily extraction\n");

        address aUSDCAddress = aaveV3Pool.getReserveAToken(address(usdc));
        IERC20 aUSDC = IERC20(aUSDCAddress);

        // Import the IAToken interface to access scaledBalanceOf
        IAToken aUSDCToken = IAToken(aUSDCAddress);

        // 1. Initial supply
        console.log("--- Initial Supply ---");
        vm.startPrank(A);
        usdc.approve(address(aaveV3Pool), supplyAmount);
        aaveV3Pool.supply(address(usdc), supplyAmount, A, 0);
        vm.stopPrank();

        uint256 initialScaledBalance = aUSDCToken.scaledBalanceOf(A);
        uint256 initialLiquidityIndex = aaveV3Pool.getReserveNormalizedIncome(address(usdc));
        uint256 initialATokenBalance = aUSDC.balanceOf(A);

        console.log("Initial USDC supplied: %s", supplyAmount / (10 ** usdc.decimals()));
        console.log("Initial scaled balance: %s", initialScaledBalance / (10 ** usdc.decimals()));
        console.log("Initial liquidity index: %s", initialLiquidityIndex);
        console.log("Initial aToken balance: %s", initialATokenBalance / (10 ** usdc.decimals()));
        console.log(
            "Verification: scaled * index / 1e27 = %s\n",
            (initialScaledBalance * initialLiquidityIndex / 1e27) / (10 ** usdc.decimals())
        );

        // 2. Create market activity and track interest over time
        console.log("--- Creating Market Activity & Time Passage ---");
        _simulateMarketActivity();

        for (uint256 i = 1; i <= 3; i++) {
            vm.warp(block.timestamp + 30 days);
            _simulateMarketActivity();

            uint256 currentScaledBalance = aUSDCToken.scaledBalanceOf(A);
            uint256 currentLiquidityIndex = aaveV3Pool.getReserveNormalizedIncome(address(usdc));
            uint256 currentATokenBalance = aUSDC.balanceOf(A);

            // Calculate total value using the formula
            uint256 totalValue = (currentScaledBalance * currentLiquidityIndex) / 1e27;

            // Calculate principal (original deposited amount)
            uint256 principalValue = (initialScaledBalance * initialLiquidityIndex) / 1e27;

            // Calculate interest earned
            uint256 interestEarned = totalValue - principalValue;

            console.log("After %s days:", i * 30);
            console.log("  Scaled balance: %s (should stay constant)", currentScaledBalance / (10 ** usdc.decimals()));
            console.log("  Liquidity index: %s", currentLiquidityIndex);
            console.log("  aToken balance: %s", currentATokenBalance / (10 ** usdc.decimals()));
            console.log("  Calculated total value: %s USDC", totalValue / (10 ** usdc.decimals()));
            console.log("  Principal (constant): %s USDC", principalValue / (10 ** usdc.decimals()));
            console.log("  Interest earned: %s USDC", interestEarned / (10 ** usdc.decimals()));
            console.log("  Interest as %% of principal: %s%%\n", (interestEarned * 10000) / principalValue / 100);
        }

        console.log("--- Final Verification ---");

        // Final withdrawal to verify our calculations are correct
        vm.startPrank(A);
        uint256 finalWithdrawn = aaveV3Pool.withdraw(address(usdc), type(uint256).max, A);
        vm.stopPrank();

        uint256 finalScaledBalance = aUSDCToken.scaledBalanceOf(A);
        uint256 finalLiquidityIndex = aaveV3Pool.getReserveNormalizedIncome(address(usdc));
        uint256 calculatedFinalValue = (initialScaledBalance * finalLiquidityIndex) / 1e27;

        console.log("Final withdrawal: %s USDC", finalWithdrawn / (10 ** usdc.decimals()));
        console.log("Calculated final value: %s USDC", calculatedFinalValue / (10 ** usdc.decimals()));
        console.log("Final scaled balance: %s (should be 0)", finalScaledBalance);
        console.log(
            "Difference: %s USDC",
            (
                finalWithdrawn > calculatedFinalValue
                    ? finalWithdrawn - calculatedFinalValue
                    : calculatedFinalValue - finalWithdrawn
            ) / (10 ** usdc.decimals())
        );

        // todo: validate insights
        // scaledBalanceOf(user) = scaled amount (stays constant after deposit)
        // getReserveNormalizedIncome(asset) = current liquidity index
        // totalValue = scaledBalance * currentLiquidityIndex / 1e27
        // principalValue = scaledBalance * initialLiquidityIndex / 1e27
        // interestEarned = totalValue - principalValue
        // You can calculate daily interest without any withdrawals!

        // Assertions
        assertGt(finalWithdrawn, supplyAmount, "Should earn interest");
        assertEq(aUSDC.balanceOf(A), 0, "All aTokens should be withdrawn");

        // Verify our calculation is close to actual withdrawal (within 1 USDC)
        uint256 difference = finalWithdrawn > calculatedFinalValue
            ? finalWithdrawn - calculatedFinalValue
            : calculatedFinalValue - finalWithdrawn;
        assertLt(difference, 1 * (10 ** usdc.decimals()), "Calculation should be accurate within 1 USDC");
    }
}
