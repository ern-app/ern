// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {console} from "forge-std/console.sol";

import {Ern} from "../src/Ern.sol";
import {IErn} from "../src/interfaces/IErn.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";

contract ErnYieldClaimTest is ErnBaseMockTest {
    function setUp() public override {
        super.setUp();
    }

    function testUserClaimsAccumulatedRewards() public {
        // Setup deposits
        uint256 depositAmount = 20_000e6; // 20k USDC
        _performDeposit(A, depositAmount);

        // Simulate yield and harvest
        uint256 yieldAmount = 2_000e6; // 2k USDC yield
        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        uint256 ownerWBTCBefore = wbtc.balanceOf(owner);
        uint256 userAWBTCBefore = wbtc.balanceOf(A);

        // Owner harvests
        vm.prank(owner);
        ern.harvest(0);

        // Calculate expected user rewards
        uint256 totalWBTCReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
        uint256 protocolFee = (totalWBTCReceived * ern.harvestFee()) / 10000;
        uint256 userRewards = totalWBTCReceived - protocolFee;

        // Verify owner received fee
        assertEq(wbtc.balanceOf(owner), ownerWBTCBefore + protocolFee, "Owner should receive protocol fee");

        // Check claimable amount
        uint256 claimableAmount = ern.claimableYield(A);
        // minus some dust amount
        assertApproxEqAbs(claimableAmount, userRewards, 10, "User should be able to claim all user rewards");

        // User claims yield
        vm.expectEmit(true, true, true, true);
        emit IErn.YieldClaimed(A, claimableAmount);

        vm.prank(A);
        ern.claimYield();

        // Verify user received WBTC
        assertEq(wbtc.balanceOf(A), userAWBTCBefore + claimableAmount, "User should receive WBTC");
        assertEq(ern.claimableYield(A), 0, "User should have no more claimable yield");

        // Verify user tracking updated
        (uint256 lastCumulative, uint256 wbtcClaimed,) = ern.users(A);
        assertEq(lastCumulative, ern.cumulativeRewardPerShare(), "User cumulative tracking updated");
        assertEq(wbtcClaimed, claimableAmount, "User claimed amount tracked");

        console.log("User successfully claimed accumulated rewards");
    }

    function testUserClaimsAccumulatedRewardsOnBehalf() public {
        // Setup deposits
        uint256 depositAmount = 20_000e6; // 20k USDC
        _performDeposit(A, depositAmount);

        // Simulate yield and harvest
        uint256 yieldAmount = 2_000e6; // 2k USDC yield
        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        uint256 ownerWBTCBefore = wbtc.balanceOf(owner);
        uint256 userAWBTCBefore = wbtc.balanceOf(A);

        // Owner harvests
        vm.prank(owner);
        ern.harvest(0);

        // Calculate expected user rewards
        uint256 totalWBTCReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
        uint256 protocolFee = (totalWBTCReceived * ern.harvestFee()) / 10000;
        uint256 userRewards = totalWBTCReceived - protocolFee;

        // Verify owner received fee
        assertEq(wbtc.balanceOf(owner), ownerWBTCBefore + protocolFee, "Owner should receive protocol fee");

        // Check claimable amount
        uint256 claimableAmount = ern.claimableYield(A);
        // minus some dust amount
        assertApproxEqAbs(claimableAmount, userRewards, 10, "User should be able to claim all user rewards");

        // User claims yield
        vm.expectEmit(true, true, true, true);
        emit IErn.YieldClaimed(A, claimableAmount);

        vm.prank(B);
        ern.claimYieldOnBehalf(A);

        // Verify user received WBTC
        assertEq(wbtc.balanceOf(A), userAWBTCBefore + claimableAmount, "User should receive WBTC");
        assertEq(ern.claimableYield(A), 0, "User should have no more claimable yield");

        // Verify user tracking updated
        (uint256 lastCumulative, uint256 wbtcClaimed,) = ern.users(A);
        assertEq(lastCumulative, ern.cumulativeRewardPerShare(), "User cumulative tracking updated");
        assertEq(wbtcClaimed, claimableAmount, "User claimed amount tracked");

        console.log("User successfully claimed accumulated rewards");
    }

    function testMultipleUsersProportionalRewards() public {
        // User A deposits 60%, User B deposits 40%
        uint256 userADeposit = 30_000e6; // 30k USDC (60%)
        uint256 userBDeposit = 20_000e6; // 20k USDC (40%)
        uint256 totalDeposits = userADeposit + userBDeposit; // 50k USDC

        _performDeposit(A, userADeposit);
        _performDeposit(B, userBDeposit);

        // Simulate yield and harvest
        uint256 yieldAmount = 5_000e6; // 5k USDC yield
        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        vm.prank(owner);
        ern.harvest(0);

        // Calculate expected rewards
        uint256 totalWBTCReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
        uint256 protocolFee = (totalWBTCReceived * ern.harvestFee()) / 10000;
        uint256 totalUserRewards = totalWBTCReceived - protocolFee;

        uint256 userAExpectedRewards = (totalUserRewards * userADeposit) / totalDeposits;
        uint256 userBExpectedRewards = (totalUserRewards * userBDeposit) / totalDeposits;

        // Check claimable amounts
        uint256 userAClaimable = ern.claimableYield(A);
        uint256 userBClaimable = ern.claimableYield(B);

        assertApproxEqAbs(userAClaimable, userAExpectedRewards, 1, "User A should get 60% of rewards");
        assertApproxEqAbs(userBClaimable, userBExpectedRewards, 1, "User B should get 40% of rewards");

        // Both users claim
        vm.prank(A);
        ern.claimYield();

        vm.prank(B);
        ern.claimYield();

        // Verify both received proportional amounts
        assertApproxEqAbs(wbtc.balanceOf(A), userAExpectedRewards, 1, "User A received correct proportion");
        assertApproxEqAbs(wbtc.balanceOf(B), userBExpectedRewards, 1, "User B received correct proportion");

        console.log("Multiple users received proportional rewards correctly");
    }

    function testRevertWhenNoYieldToClaim() public {
        // User deposits but no harvest has occurred
        _performDeposit(A, MEDIUM_DEPOSIT);

        // User tries to claim yield with no accumulated rewards
        vm.expectRevert(Ern.NoYieldToClaim.selector);
        vm.prank(A);
        ern.claimYield();

        // User with no deposit tries to claim
        vm.expectRevert(Ern.NoYieldToClaim.selector);
        vm.prank(B);
        ern.claimYield();

        console.log("Correctly reverted when no yield to claim");
    }

    function testMultipleHarvestCycles() public {
        // User deposits
        uint256 depositAmount = 15_000e6; // 15k USDC
        _performDeposit(A, depositAmount);

        // First harvest cycle
        uint256 firstYield = 1_500e6; // 1.5k USDC
        mockAavePool.simulateYield(address(aUSDC), address(ern), firstYield);

        vm.prank(owner);
        ern.harvest(0);

        uint256 firstClaimable = ern.claimableYield(A);
        assertGt(firstClaimable, 0, "Should have claimable from first harvest");

        // User claims partial rewards
        vm.prank(A);
        ern.claimYield();

        uint256 userWBTCAfterFirst = wbtc.balanceOf(A);
        assertEq(userWBTCAfterFirst, firstClaimable, "User received first harvest rewards");
        assertEq(ern.claimableYield(A), 0, "No claimable after claim");

        // Second harvest cycle
        uint256 secondYield = 2_000e6; // 2k USDC
        mockAavePool.simulateYield(address(aUSDC), address(ern), secondYield);

        vm.prank(owner);
        ern.harvest(0);

        uint256 secondClaimable = ern.claimableYield(A);
        assertGt(secondClaimable, 0, "Should have claimable from second harvest");

        // User claims second round of rewards
        vm.prank(A);
        ern.claimYield();

        uint256 userWBTCAfterSecond = wbtc.balanceOf(A);
        assertEq(userWBTCAfterSecond, userWBTCAfterFirst + secondClaimable, "User received second harvest rewards");

        // Verify cumulative tracking
        (uint256 lastCumulative, uint256 totalClaimed,) = ern.users(A);
        assertEq(lastCumulative, ern.cumulativeRewardPerShare(), "Cumulative tracking current");
        assertEq(totalClaimed, firstClaimable + secondClaimable, "Total claimed tracked correctly");

        console.log("Multiple harvest cycles handled correctly");
    }

    function testAfterWithdrawalNoClaims() public {
        // User deposits
        uint256 depositAmount = 20_000e6; // 20k USDC
        _performDeposit(A, depositAmount);

        // Harvest occurs
        uint256 yieldAmount = 2_000e6; // 2k USDC
        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        vm.prank(owner);
        ern.harvest(0);

        uint256 claimableBeforeWithdraw = ern.claimableYield(A);
        assertGt(claimableBeforeWithdraw, 0, "Should have claimable yield");

        // Wait for lock period and withdraw half
        _waitForLockExpiry();
        uint256 withdrawAmount = depositAmount / 2;

        vm.prank(A);
        ern.withdraw(withdrawAmount);

        // Claimable amount should remain the same after withdrawal
        uint256 claimableAfterWithdraw = ern.claimableYield(A);
        assertEq(claimableAfterWithdraw, 0, "Shouldn't have any more claims if he doesn't contribute");
    }
}
