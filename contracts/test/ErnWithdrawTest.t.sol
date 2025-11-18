// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {IErn} from "../src/interfaces/IErn.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnWithdrawTest is ErnBaseMockTest {
    using Strings for uint256;
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    function setUp() public override {
        super.setUp();
    }

    function testSuccessfulWithdrawAfterLockPeriod() public {
        // Setup: User deposits and waits for lock expiry
        _performDeposit(A, LARGE_DEPOSIT);
        _waitForLockExpiry();
        _assertUserLocked(A, false);

        // Perform withdrawal to different receiver
        _performWithdraw(A, PARTIAL_WITHDRAW);

        // Verify user reward tracking updated
        (uint256 lastCumulativeWbtcPerShare,,) = ern.users(A);
        assertEq(lastCumulativeWbtcPerShare, ern.cumulativeRewardPerShare(), "Reward tracking updated");

        // User should remain unlocked after withdrawal
        _assertUserLocked(A, false);

        // Verify system consistency
        _assertSystemConsistency();

        slog("Successful withdrawal test completed");
        slog("- Deposited: ", LARGE_DEPOSIT.decimal6(), " USDC");
        slog("- Withdrawn: ", PARTIAL_WITHDRAW.decimal6(), " USDC");
        slog("- Remaining shares: ", ern.balanceOf(A).decimal6());
    }

    function testFeeDuringLockPeriod() public {
        uint256 depositAmount = 1000 * 1e6; // 1000 USDC

        // User deposits USDC
        slog("User A depositing", depositAmount.decimal6(), "USDC...");
        vm.prank(A);
        ern.deposit(depositAmount);

        // Verify deposit was successful
        assertEq(ern.balanceOf(A), depositAmount, "User should have received shares");
        slog("Deposit completed at timestamp:", block.timestamp.toString());
        slog("Lock period ends at:", (block.timestamp + ern.lockPeriod()).toString());

        // Try to withdraw immediately (should fail)
        slog("Attempting immediate withdrawal (should fail)...");

        // Record state before failed withdrawal attempt
        uint256 userUSDCBeforeWithdraw = usdc.balanceOf(A);

        // a withdrawal fee is expected
        uint256 expectedWithdrawnAmount = depositAmount - (depositAmount * ern.withdrawFee()) / 10000;

        skip(ern.hardLockPeriod() + 1);

        vm.prank(A);
        ern.withdraw(depositAmount);

        // Verify state changes
        assertEq(
            usdc.balanceOf(A), userUSDCBeforeWithdraw + expectedWithdrawnAmount, "User USDC balance should have changed"
        );
        assertEq(ern.balanceOf(A), 0, "User shares should have changed");
        assertEq(ern.totalSupply(), 0, "Total supply should have changed ");
        assertEq(usdc.balanceOf(address(mockAavePool)), 0, "Aave pool balance should have changed");

        slog("Withdrawal succeeded with correct fee applied during lock period");
    }

    function testPartialWithdrawal() public {
        uint256 depositAmount = 30_000e6; // 30k USDC
        uint256 firstWithdrawAmount = 12_000e6; // 12k USDC
        uint256 secondWithdrawAmount = 8_000e6; // 8k USDC
        uint256 expectedRemainingShares = depositAmount - firstWithdrawAmount - secondWithdrawAmount; // 10k USDC

        slog("Initial deposit amount: ", depositAmount.decimal6(), " USDC");
        slog("First withdrawal amount: ", firstWithdrawAmount.decimal6(), " USDC");
        slog("Second withdrawal amount: ", secondWithdrawAmount.decimal6(), " USDC");
        slog("Expected remaining shares: ", expectedRemainingShares.decimal6(), " USDC");

        // Step 1: User deposits USDC
        vm.prank(A);
        ern.deposit(depositAmount);

        // Verify deposit was successful
        assertEq(ern.balanceOf(A), depositAmount, "User should have shares equal to deposit amount");
        assertTrue(ern.isLocked(A), "User should be locked after deposit");

        // Record initial state after deposit
        uint256 initialUserUSDC = usdc.balanceOf(A);

        slog("Deposit completed - User has", ern.balanceOf(A).decimal6(), " shares");
        slog("User USDC balance after deposit:", initialUserUSDC.decimal6(), " USDC");

        // Step 2: Wait for lock period to expire
        vm.warp(block.timestamp + ern.lockPeriod() + 1);
        assertFalse(ern.isLocked(A), "User should not be locked after lock period expires");

        slog("Lock period expired - proceeding with withdrawals");

        // Step 3: First partial withdrawal
        _testPartialWithdraw(A, firstWithdrawAmount, "First");

        // Step 4: Second partial withdrawal
        _testPartialWithdraw(A, secondWithdrawAmount, "Second");

        // Step 5: Verify final state
        uint256 totalWithdrawn = firstWithdrawAmount + secondWithdrawAmount;

        (, uint256 partialFee) = ern.applicableFee(A, totalWithdrawn);

        // User should have received total withdrawn amount
        assertEq(
            usdc.balanceOf(A),
            initialUserUSDC + totalWithdrawn - partialFee,
            "User should have received total withdrawn USDC"
        );

        // User should have remaining shares
        assertEq(ern.balanceOf(A), expectedRemainingShares, "User should have expected remaining shares");

        // Total supply should match remaining amount
        assertEq(
            ern.totalSupply(), expectedRemainingShares + partialFee, "Total supply should equal remaining shares"
        );

        // Ern should have remaining aUSDC
        assertEq(
            aUSDC.balanceOf(address(ern)),
            expectedRemainingShares + partialFee,
            "Ern should have remaining aUSDC matching shares"
        );

        // Assets should equal shares (1:1 ratio maintained)
        assertEq(ern.totalAssets(), ern.totalSupply(), "Assets should equal shares after partial withdrawals");

        // User should still not be locked (withdrawals don't reset lock)
        assertFalse(ern.isLocked(A), "User should remain unlocked after withdrawals");

        // Verify user reward tracking was updated on both withdrawals
        (uint256 lastCumulativeWbtcPerShare,,) = ern.users(A);
        assertEq(
            lastCumulativeWbtcPerShare,
            ern.cumulativeRewardPerShare(),
            "User reward tracking should be current after withdrawals"
        );

        slog("=== Final State Verification ===");
        slog("- Original deposit: ", depositAmount.decimal6(), " USDC");
        slog("- Total withdrawn: ", totalWithdrawn.decimal6(), " USDC");
        slog("- Remaining shares: ", ern.balanceOf(A).decimal6());
        slog("- Final USDC balance: ", usdc.balanceOf(A).decimal6(), " USDC");
        slog("- Ern aUSDC balance: ", aUSDC.balanceOf(address(ern)).decimal6());

        // Step 6: Test final withdrawal of remaining shares
        slog("--- Final Complete Withdrawal ---");

        uint256 finalWithdrawAmount = ern.balanceOf(A);
        uint256 userUSDCBeforeFinal = usdc.balanceOf(A);

        (, uint256 finalFee) = ern.applicableFee(A, finalWithdrawAmount);
        uint256 finalExpectedReceived = finalWithdrawAmount - finalFee;

        vm.expectEmit(true, true, true, true);
        emit IErn.Withdraw(A, finalExpectedReceived, finalFee);

        vm.prank(A);
        ern.withdraw(finalWithdrawAmount);

        // Verify complete withdrawal
        assertEq(ern.balanceOf(A), 0, "User should have no shares after final withdrawal");
        assertEq(
            ern.totalSupply(),
            0 + finalFee + partialFee,
            "Total supply should be zero + fees after final withdrawal"
        );
        assertEq(
            aUSDC.balanceOf(address(ern)),
            0 + finalFee + partialFee,
            "Ern should have no aUSDC + fees after final withdrawal"
        );
        assertEq(
            usdc.balanceOf(A),
            userUSDCBeforeFinal + finalExpectedReceived,
            "User should receive final USDC amount minus fee"
        );

        // Total received should equal original deposit
        assertEq(
            usdc.balanceOf(A),
            initialUserUSDC + depositAmount - finalFee - partialFee,
            "User should have received full original deposit back"
        );

        slog("Final withdrawal completed - user received all ", depositAmount.decimal6(), " USDC back");
        slog("Partial withdrawal test completed successfully");
    }

    // Helper function to reduce stack depth in partial withdrawal test
    function _testPartialWithdraw(address user, uint256 withdrawAmount, string memory withdrawType) private {
        // Record state before withdrawal
        uint256 userUSDCBefore = usdc.balanceOf(user);
        uint256 userSharesBefore = ern.balanceOf(user);
        uint256 totalSharesBefore = ern.totalSupply();
        uint256 ernAUSDCBefore = aUSDC.balanceOf(address(ern));

        // Calculate expected amount after fee
        (uint256 expectedReceived, uint256 fee) = ern.applicableFee(user, withdrawAmount);

        // Expect withdraw event
        vm.expectEmit(true, true, true, true);
        emit IErn.Withdraw(user, expectedReceived, fee);

        vm.prank(user);
        ern.withdraw(withdrawAmount);

        // Verify withdrawal results
        assertEq(
            usdc.balanceOf(user),
            userUSDCBefore + expectedReceived,
            string(abi.encodePacked("User should receive USDC minus fee for ", withdrawType, " withdrawal"))
        );

        assertEq(
            ern.balanceOf(user),
            userSharesBefore - withdrawAmount,
            string(abi.encodePacked("User shares should decrease by ", withdrawType, " withdrawal amount"))
        );

        assertEq(
            ern.totalSupply(),
            totalSharesBefore - expectedReceived,
            string(abi.encodePacked("Total shares should decrease by ", withdrawType, " withdrawal amount"))
        );

        assertEq(
            aUSDC.balanceOf(address(ern)),
            ernAUSDCBefore - expectedReceived,
            string(abi.encodePacked("Ern aUSDC should decrease by ", withdrawType, " withdrawal amount"))
        );

        // Verify assets/shares consistency
        assertEq(
            ern.totalAssets(),
            ern.totalSupply(),
            string(abi.encodePacked("Total assets should equal total shares after ", withdrawType, " withdrawal"))
        );

        slog(withdrawType, "withdrawal completed:");
        slog("- Withdrawn: ", withdrawAmount.decimal6(), " USDC");
        slog("- User USDC balance: ", usdc.balanceOf(user).decimal6(), " USDC");
        slog("- User remaining shares: ", ern.balanceOf(user).decimal6());
        slog("- Total shares remaining: ", ern.totalSupply().decimal6());
    }
}
