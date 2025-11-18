// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ern} from "../src/Ern.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnDepositTest is ErnBaseMockTest {
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    function setUp() public override {
        super.setUp();
    }

    function testBasicDeposit() public {
        // Test basic deposit functionality with all invariants
        // Record initial state
        uint256 initialTotalAssets = ern.totalAssets();
        _assertUserLocked(A, false);

        // Perform deposit
        _performDeposit(A, MEDIUM_DEPOSIT);

        // Verify lock period is set correctly
        assertEq(ern.unlockTime(A), block.timestamp + ern.lockPeriod(), "Unlock time should be set correctly");

        // Verify user reward tracking initialization
        (uint256 lastCumulativeWbtcPerShare, uint256 wbtcClaimed, uint256 depositTimestamp) = ern.users(A);
        assertEq(lastCumulativeWbtcPerShare, ern.cumulativeRewardPerShare(), "Reward tracking initialized");
        assertEq(wbtcClaimed, 0, "No WBTC claimed initially");
        assertEq(depositTimestamp, block.timestamp, "Deposit timestamp should be set correctly");

        // Verify total assets increased correctly
        assertEq(ern.totalAssets(), initialTotalAssets + MEDIUM_DEPOSIT, "Total assets increased");

        // Verify system consistency
        _assertSystemConsistency();

        slog(" - Basic deposit test completed successfully");
    }

    function testMultipleUsers() public {
        // Test multiple users depositing with different amounts and timing
        uint256 userAAmount = 15_000e6; // 15k USDC
        uint256 userBAmount = 25_000e6; // 25k USDC

        // Verify initial state
        _assertUserLocked(A, false);
        _assertUserLocked(B, false);

        // User A deposits first
        uint256 userADepositTime = block.timestamp;
        _performDeposit(A, userAAmount);
        assertEq(ern.unlockTime(A), userADepositTime + ern.lockPeriod(), "User A unlock time correct");

        // Wait and User B deposits
        vm.warp(block.timestamp + 1 hours);
        uint256 userBDepositTime = block.timestamp;
        _performDeposit(B, userBAmount);
        assertEq(ern.unlockTime(B), userBDepositTime + ern.lockPeriod(), "User B unlock time correct");

        // Verify proportional ownership
        uint256 totalShares = ern.totalSupply();
        uint256 userAPercentage = (ern.balanceOf(A) * 100) / totalShares;
        uint256 userBPercentage = (ern.balanceOf(B) * 100) / totalShares;

        assertEq(userAPercentage, 37, "User A should own ~37% of shares"); // 15k/40k = 37.5%
        assertEq(userBPercentage, 62, "User B should own ~62% of shares"); // 25k/40k = 62.5%

        // Verify different unlock times
        assertEq(ern.unlockTime(B) - ern.unlockTime(A), 1 hours, "Lock times 1 hour apart");

        // Verify reward tracking for both users
        (uint256 userALastCumulative,,) = ern.users(A);
        (uint256 userBLastCumulative,,) = ern.users(B);
        assertEq(userALastCumulative, ern.cumulativeRewardPerShare(), "User A reward tracking initialized");
        assertEq(userBLastCumulative, ern.cumulativeRewardPerShare(), "User B reward tracking initialized");

        // Verify system consistency
        _assertSystemConsistency();

        slog("Multiple users deposit test completed");
        slog("- User A: ", userAAmount.decimal6(), " USDC, ", userAPercentage.percent2(), "%");
        slog("- User B: ", userBAmount.decimal6(), " USDC, ", userBPercentage.percent2(), "%");
    }

    function testRevertOnZeroAmount() public {
        uint256 userSharesBefore = ern.balanceOf(A);
        uint256 totalSupplyBefore = ern.totalSupply();
        uint256 userUSDCBefore = usdc.balanceOf(A);

        vm.expectRevert(Ern.AmountCannotBeZero.selector);
        vm.prank(A);
        ern.deposit(0);

        _verifyNoStateChange(A, userSharesBefore, totalSupplyBefore, userUSDCBefore, "Zero amount deposit");
        _assertUserLocked(A, false);

        slog("Zero amount deposit correctly reverted");
    }
}
