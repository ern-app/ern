// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnLockPeriodTest is ErnBaseMockTest {
    using Strings for uint256;
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    function setUp() public override {
        super.setUp();
    }

    function testLockStatusAndUnlockTime() public {
        uint256 depositTime = block.timestamp;
        uint256 expectedLockPeriod = ern.lockPeriod(); // 48 hours
        uint256 expectedUnlockTime = depositTime + expectedLockPeriod;

        slog("- Deposit time: ", depositTime.toString());
        slog("- Lock period: ", (expectedLockPeriod / 1 days).toString(), " days");
        slog("- Expected unlock time: ", expectedUnlockTime.toString());

        // Initially user should not be locked (no deposit yet)
        assertFalse(ern.isLocked(A), "User should not be locked before deposit");
        assertEq(ern.unlockTime(A), 0 + expectedLockPeriod, "Unlock time should be 0 before deposit");

        // User deposits at timestamp T
        _performDeposit(A, MEDIUM_DEPOSIT);

        // Verify lock status immediately after deposit
        assertTrue(ern.isLocked(A), "User should be locked immediately after deposit");
        assertEq(ern.unlockTime(A), expectedUnlockTime, "Unlock time should be T + lockPeriod");

        slog("User locked immediately after deposit");

        // Test lock status during lock period (before expiry)
        uint256 timeBeforeExpiry = expectedUnlockTime - 1;
        vm.warp(timeBeforeExpiry);

        assertTrue(ern.isLocked(A), "User should still be locked before lock period expires");
        assertEq(ern.unlockTime(A), expectedUnlockTime, "Unlock time should remain constant");

        slog("User still locked 1 second before lock expiry");

        // Test lock status exactly at expiry time
        vm.warp(expectedUnlockTime);

        assertFalse(ern.isLocked(A), "User should not be locked exactly at unlock time");
        assertEq(ern.unlockTime(A), expectedUnlockTime, "Unlock time should remain the same");

        slog("User unlocked exactly at unlock time");

        // Test lock status after expiry
        vm.warp(expectedUnlockTime + 1 hours);

        assertFalse(ern.isLocked(A), "User should not be locked after lock period expires");
        assertEq(ern.unlockTime(A), expectedUnlockTime, "Unlock time should remain the same");

        slog("User remains unlocked after lock period");

        // Test multiple time points to ensure consistency
        uint256[] memory testTimes = new uint256[](5);
        testTimes[0] = depositTime + 1 days;
        testTimes[1] = depositTime + 3 days;
        testTimes[2] = depositTime + 6 days;
        testTimes[3] = expectedUnlockTime + 1 days;
        testTimes[4] = expectedUnlockTime + 1 weeks;

        for (uint256 i = 0; i < testTimes.length; i++) {
            vm.warp(testTimes[i]);
            bool shouldBeLocked = testTimes[i] < expectedUnlockTime;

            assertEq(
                ern.isLocked(A),
                shouldBeLocked,
                string(abi.encodePacked("Lock status incorrect at time: ", vm.toString(testTimes[i])))
            );

            assertEq(ern.unlockTime(A), expectedUnlockTime, "Unlock time should never change after deposit");
        }

        slog("Lock status consistent across multiple time points");
        slog("Lock status and unlock time test completed successfully");
    }

    function testMultipleDepositsResetLockPeriod() public {
        uint256 firstDepositAmount = 15_000e6; // 15k USDC
        uint256 secondDepositAmount = 10_000e6; // 10k USDC
        uint256 lockPeriod = ern.lockPeriod();

        slog("- First deposit: ", firstDepositAmount.decimal6(), " USDC");
        slog("- Second deposit: ", secondDepositAmount.decimal6(), " USDC");
        slog("- Lock period: ", (lockPeriod / 1 days).toString(), " days");

        // === Step 1: First deposit at time T1 ===
        uint256 firstDepositTime = block.timestamp;
        uint256 firstExpectedUnlockTime = firstDepositTime + lockPeriod;

        _performDeposit(A, firstDepositAmount);

        // Verify first deposit lock period
        assertTrue(ern.isLocked(A), "User should be locked after first deposit");
        assertEq(ern.unlockTime(A), firstExpectedUnlockTime, "First unlock time should be T1 + lockPeriod");
        assertEq(ern.balanceOf(A), firstDepositAmount, "User should have shares from first deposit");

        slog("First deposit completed at: ", firstDepositTime.toString());
        slog("First unlock time: ", firstExpectedUnlockTime.toString());

        // === Step 2: Wait some time but not full lock period ===
        uint256 waitTime = 1 days; // Wait 1 days (less than 2 day lock period)
        vm.warp(firstDepositTime + waitTime);

        // User should still be locked from first deposit
        assertTrue(ern.isLocked(A), "User should still be locked after partial wait");
        assertEq(ern.unlockTime(A), firstExpectedUnlockTime, "Unlock time should still be from first deposit");

        slog("After ", (waitTime / 1 days).toString(), " days - user still locked");

        // === Step 3: Second deposit at time T2 (before first lock expires) ===
        uint256 secondDepositTime = block.timestamp;
        uint256 secondExpectedUnlockTime = secondDepositTime + lockPeriod;

        // Verify we're making second deposit before first lock expires
        assertLt(secondDepositTime, firstExpectedUnlockTime, "Second deposit should be before first lock expires");
        assertGt(secondExpectedUnlockTime, firstExpectedUnlockTime, "Second unlock time should be later");

        _performDeposit(A, secondDepositAmount);

        // Verify second deposit reset the lock period
        assertTrue(ern.isLocked(A), "User should be locked after second deposit");
        assertEq(ern.unlockTime(A), secondExpectedUnlockTime, "Unlock time should be reset to T2 + lockPeriod");
        assertEq(
            ern.balanceOf(A),
            firstDepositAmount + secondDepositAmount,
            "User should have shares from both deposits"
        );

        slog("Second deposit completed at: ", secondDepositTime.toString());
        slog("Second unlock time: ", secondExpectedUnlockTime.toString());
        slog(
            "Lock period extended by: ",
            ((secondExpectedUnlockTime - firstExpectedUnlockTime) / 1 hours).toString(),
            " hours"
        );

        // === Step 4: Test lock status at original first unlock time ===
        vm.warp(firstExpectedUnlockTime);

        // User should STILL be locked because second deposit reset the period
        assertTrue(ern.isLocked(A), "User should still be locked at original first unlock time");
        assertEq(ern.unlockTime(A), secondExpectedUnlockTime, "Unlock time should remain second unlock time");

        slog("At original first unlock time - user still locked (period was reset)");

        // === Step 5: Test lock status before second unlock time ===
        vm.warp(secondExpectedUnlockTime - 1);

        assertTrue(ern.isLocked(A), "User should be locked 1 second before second unlock time");

        // === Step 6: Test lock status at second unlock time ===
        vm.warp(secondExpectedUnlockTime);

        assertFalse(ern.isLocked(A), "User should be unlocked at second unlock time");
        assertEq(ern.unlockTime(A), secondExpectedUnlockTime, "Unlock time should remain second unlock time");

        slog("User unlocked at second unlock time");

        // === Step 7: Test that withdrawal is now possible ===
        uint256 userUSDCBefore = usdc.balanceOf(A);
        uint256 withdrawAmount = 5_000e6; // Partial withdrawal

        // Should not revert (user is unlocked)
        vm.prank(A);
        ern.withdraw(withdrawAmount);

        // account for small fee
        assertApproxEqRel(
            usdc.balanceOf(A), userUSDCBefore + withdrawAmount, 0.0001e18, "User should receive withdrawn USDC"
        );
        assertEq(
            ern.balanceOf(A),
            firstDepositAmount + secondDepositAmount - withdrawAmount,
            "User shares should decrease"
        );

        slog("Withdrawal successful after lock period reset");

        // === Step 8: Verify lock period behavior with third deposit ===
        uint256 thirdDepositAmount = 5_000e6;
        uint256 thirdDepositTime = block.timestamp + 2 hours; // 2 hours after unlock

        vm.warp(thirdDepositTime);
        uint256 thirdExpectedUnlockTime = thirdDepositTime + lockPeriod;

        _performDeposit(A, thirdDepositAmount);

        // Lock period should reset again
        assertTrue(ern.isLocked(A), "User should be locked again after third deposit");
        assertEq(ern.unlockTime(A), thirdExpectedUnlockTime, "Unlock time should be reset to T3 + lockPeriod");

        slog("Third deposit also reset lock period correctly");

        slog("=== Multiple Deposits Reset Lock Period Test Summary ===");
        slog("- First deposit set lock until: ", firstExpectedUnlockTime.toString());
        slog("- Second deposit reset lock until: ", secondExpectedUnlockTime.toString());
        slog("- Third deposit reset lock until: ", thirdExpectedUnlockTime.toString());
        slog("- All lock period resets worked correctly");
        slog("Multiple deposits reset lock period test completed successfully");
    }

    function testMultipleUsersIndependentLocks() public {
        slog("\n=== Testing Independent Lock Periods for Multiple Users ===");

        uint256 depositAmount = MEDIUM_DEPOSIT;
        uint256 lockPeriod = ern.lockPeriod();

        // User A deposits at time T1
        uint256 userADepositTime = block.timestamp;
        _performDeposit(A, depositAmount);
        uint256 userAUnlockTime = userADepositTime + lockPeriod;

        // Wait 2 days
        vm.warp(block.timestamp + 1 days);

        // User B deposits at time T2
        uint256 userBDepositTime = block.timestamp;
        _performDeposit(B, depositAmount);
        uint256 userBUnlockTime = userBDepositTime + lockPeriod;

        // Both users should be locked but with different unlock times
        assertTrue(ern.isLocked(A), "User A should be locked");
        assertTrue(ern.isLocked(B), "User B should be locked");
        assertEq(ern.unlockTime(A), userAUnlockTime, "User A unlock time");
        assertEq(ern.unlockTime(B), userBUnlockTime, "User B unlock time");
        assertEq(userBUnlockTime - userAUnlockTime, 1 days, "Lock times should be 2 days apart");

        // Fast forward to User A unlock time
        vm.warp(userAUnlockTime);

        assertFalse(ern.isLocked(A), "User A should be unlocked");
        assertTrue(ern.isLocked(B), "User B should still be locked");

        // Fast forward to User B unlock time
        vm.warp(userBUnlockTime);

        assertFalse(ern.isLocked(A), "User A should remain unlocked");
        assertFalse(ern.isLocked(B), "User B should now be unlocked");

        slog("Independent lock periods working correctly for multiple users");
    }
}
