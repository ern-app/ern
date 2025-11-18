// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";

contract ErnIntegrationTest is ErnBaseMockTest {
    function setUp() public override {
        super.setUp();
    }

    function testIntegration_FullUserJourney() public {
        // console.log("\n=== Testing Full User Journey ===");

        // uint256 depositAmount = 50_000e6; // 50k USDC
        // uint256 yieldAmount = 5_000e6; // 5k USDC yield

        // // Step 1: User deposits USDC, receives shares
        // console.log("Step 1: User deposits USDC");
        // uint256 initialUserUSDC = usdc.balanceOf(A);

        // _performDeposit(A, depositAmount, A);

        // assertEq(ern.balanceOf(A), depositAmount, "User should receive shares equal to deposit");
        // assertEq(usdc.balanceOf(A), initialUserUSDC - depositAmount, "User USDC should decrease");
        // assertTrue(ern.isLocked(A), "User should be locked after deposit");

        // console.log("  - Deposited:", depositAmount / 1e6, "USDC");
        // console.log("  - Received:", ern.balanceOf(A) / 1e6, "shares");

        // // Step 2: Yield accumulates in Aave over time
        // console.log("Step 2: Yield accumulates in Aave");
        // vm.warp(block.timestamp + 30 days); // Simulate 30 days passing

        // mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        // uint256 totalAssets = ern.totalAssets();
        // assertEq(totalAssets, depositAmount + yieldAmount, "Total assets should include yield");

        // console.log("  - Yield accumulated:", yieldAmount / 1e6, "USDC");
        // console.log("  - Total assets now:", totalAssets / 1e6, "USDC");

        // // Step 3: Harvest converts yield to WBTC and distributes rewards
        // console.log("Step 3: Owner harvests yield");
        // uint256 ownerWBTCBefore = wbtc.balanceOf(owner);

        // uint256 expectedWBTCReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
        // uint256 expectedProtocolFee = (expectedWBTCReceived * ern.harvestFee()) / 10000;
        // uint256 expectedUserRewards = expectedWBTCReceived - expectedProtocolFee;

        // vm.prank(owner);
        // ern.harvest(0);

        // uint256 ownerWBTCAfter = wbtc.balanceOf(owner);
        // assertEq(ownerWBTCAfter - ownerWBTCBefore, expectedProtocolFee, "Owner should receive protocol fee");

        // console.log("  - WBTC from swap:", expectedWBTCReceived);
        // console.log("  - Protocol fee:", expectedProtocolFee);
        // console.log("  - User rewards:", expectedUserRewards);

        // // Step 4: User claims their WBTC rewards
        // console.log("Step 4: User claims WBTC rewards");
        // uint256 userWBTCBefore = wbtc.balanceOf(A);
        // uint256 claimableAmount = ern.claimableYield(A);

        // assertEq(claimableAmount, expectedUserRewards, "User should be able to claim all user rewards");

        // vm.prank(A);
        // ern.claimYield();

        // uint256 userWBTCAfter = wbtc.balanceOf(A);
        // assertEq(userWBTCAfter - userWBTCBefore, expectedUserRewards, "User should receive expected WBTC");
        // assertEq(ern.claimableYield(A), 0, "User should have no more claimable yield");

        // console.log("  - User claimed:", expectedUserRewards, "WBTC");

        // // Step 5: User waits for lock period to expire
        // console.log("Step 5: Wait for lock period to expire");
        // uint256 unlockTime = ern.unlockTime(A);

        // vm.warp(unlockTime + 1);
        // assertFalse(ern.isLocked(A), "User should be unlocked");

        // console.log("  - Lock period expired at:", unlockTime);
        // console.log("  - User is now unlocked");

        // // Step 6: User withdraws their original USDC deposit
        // console.log("Step 6: User withdraws USDC deposit");
        // uint256 userUSDCBeforeWithdraw = usdc.balanceOf(A);
        // uint256 sharesToWithdraw = ern.balanceOf(A);

        // vm.prank(A);
        // ern.withdraw(sharesToWithdraw, A, A);

        // uint256 userUSDCAfterWithdraw = usdc.balanceOf(A);
        // assertEq(ern.balanceOf(A), 0, "User should have no shares left");
        // assertEq(userUSDCAfterWithdraw - userUSDCBeforeWithdraw, depositAmount, "User should receive original deposit");

        // console.log("  - Withdrawn:", depositAmount / 1e6, "USDC");
        // console.log("  - User final USDC:", userUSDCAfterWithdraw / 1e6);
        // console.log("  - User final WBTC:", userWBTCAfter);

        // // Verify final state
        // assertEq(ern.totalSupply(), 0, "No shares should remain");
        // assertEq(ern.totalAssets(), 0, "No assets should remain");

        // console.log("Full user journey completed successfully!");
        // console.log("Summary:");
        // console.log("- User deposited 50k USDC, earned", expectedUserRewards, "WBTC, withdrew 50k USDC");
        // console.log("- Protocol earned", expectedProtocolFee, "WBTC in fees");
    }

    function testIntegration_MultipleUsersMultipleHarvests() public {
        // console.log("\n=== Testing Multiple Users Multiple Harvests ===");

        // // Setup: Multiple users deposit at different times
        // console.log("Setup: Multiple users deposit");

        // // User A deposits 30k USDC at time T0
        // uint256 userADeposit = 30_000e6;
        // _performDeposit(A, userADeposit, A);
        // console.log("- User A deposited:", userADeposit / 1e6, "USDC at T0");

        // // Wait 10 days, User B deposits 20k USDC
        // vm.warp(block.timestamp + 10 days);
        // uint256 userBDeposit = 20_000e6;
        // _performDeposit(B, userBDeposit, B);
        // console.log("- User B deposited:", userBDeposit / 1e6, "USDC at T+10 days");

        // uint256 totalDepositsAfterB = userADeposit + userBDeposit; // 50k USDC

        // // First harvest cycle after 20 days total
        // console.log("\nFirst Harvest Cycle (T+20 days):");
        // vm.warp(block.timestamp + 10 days); // Total 20 days from start

        // uint256 firstYield = 2_500e6; // 2.5k USDC
        // mockAavePool.simulateYield(address(aUSDC), address(ern), firstYield);

        // vm.prank(owner);
        // ern.harvest(0);

        // // Calculate and verify first harvest rewards
        // uint256 firstWBTC = mockDex.previewSwap(address(usdc), address(wbtc), firstYield);
        // uint256 firstProtocolFee = (firstWBTC * ern.harvestFee()) / 10000;
        // uint256 firstUserRewards = firstWBTC - firstProtocolFee;

        // uint256 userAFirstRewards = (firstUserRewards * userADeposit) / totalDepositsAfterB;
        // uint256 userBFirstRewards = (firstUserRewards * userBDeposit) / totalDepositsAfterB;

        // assertApproxEqAbs(ern.claimableYield(A), userAFirstRewards, 1, "User A first harvest rewards");
        // assertApproxEqAbs(ern.claimableYield(B), userBFirstRewards, 1, "User B first harvest rewards");

        // console.log("- Yield:", firstYield / 1e6, "USDC -> WBTC:", firstWBTC);
        // console.log("- User A claimable:", ern.claimableYield(A));
        // console.log("- User B claimable:", ern.claimableYield(B));

        // // User A claims, User B waits
        // vm.prank(A);
        // ern.claimYield();

        // console.log("- User A claimed rewards");

        // // User C joins with 40k USDC deposit
        // vm.warp(block.timestamp + 15 days); // Total 35 days from start
        // uint256 userCDeposit = 40_000e6;
        // _performDeposit(C, userCDeposit, C);
        // console.log("- User C deposited:", userCDeposit / 1e6, "USDC at T+35 days");

        // uint256 totalDepositsAfterC = totalDepositsAfterB + userCDeposit; // 90k USDC

        // // Second harvest cycle
        // console.log("\nSecond Harvest Cycle (T+50 days):");
        // vm.warp(block.timestamp + 15 days); // Total 50 days from start

        // uint256 secondYield = 4_500e6; // 4.5k USDC
        // mockAavePool.simulateYield(address(aUSDC), address(ern), secondYield);

        // vm.prank(owner);
        // ern.harvest(0);

        // // Calculate second harvest rewards
        // uint256 secondWBTC = mockDex.previewSwap(address(usdc), address(wbtc), secondYield);
        // uint256 secondProtocolFee = (secondWBTC * ern.harvestFee()) / 10000;
        // uint256 secondUserRewards = secondWBTC - secondProtocolFee;

        // // User A should have rewards from second harvest only (already claimed first)
        // uint256 userASecondRewards = (secondUserRewards * userADeposit) / totalDepositsAfterC;
        // // User B should have rewards from both harvests (didn't claim first)
        // uint256 userBSecondRewards = (secondUserRewards * userBDeposit) / totalDepositsAfterC;
        // uint256 userBTotalRewards = userBFirstRewards + userBSecondRewards;
        // // User C should have rewards from second harvest only
        // uint256 userCSecondRewards = (secondUserRewards * userCDeposit) / totalDepositsAfterC;

        // assertApproxEqAbs(ern.claimableYield(A), userASecondRewards, 1, "User A second harvest rewards");
        // assertApproxEqAbs(ern.claimableYield(B), userBTotalRewards, 1, "User B accumulated rewards");
        // assertApproxEqAbs(ern.claimableYield(C), userCSecondRewards, 1, "User C second harvest rewards");

        // console.log("- Yield:", secondYield / 1e6, "USDC -> WBTC:", secondWBTC);
        // console.log("- User A claimable:", ern.claimableYield(A));
        // console.log("- User B claimable:", ern.claimableYield(B));
        // console.log("- User C claimable:", ern.claimableYield(C));

        // // All users claim their rewards
        // vm.prank(A);
        // ern.claimYield();

        // vm.prank(B);
        // ern.claimYield();

        // vm.prank(C);
        // ern.claimYield();

        // console.log("- All users claimed their rewards");

        // // Verify all rewards were distributed correctly
        // assertEq(ern.claimableYield(A), 0, "User A should have no claimable");
        // assertEq(ern.claimableYield(B), 0, "User B should have no claimable");
        // assertEq(ern.claimableYield(C), 0, "User C should have no claimable");

        // console.log("Multiple users multiple harvests completed successfully!");
    }

    function testIntegration_EdgeCaseScenarios() public {
        // console.log("\n=== Testing Edge Case Scenarios ===");

        // // Test 1: Very small deposits
        // console.log("Test 1: Very small deposit (1 wei)");
        // uint256 tinyDeposit = 1; // 1 wei

        // // Give user some minimal USDC
        // usdc.mint(D, 1000);
        // vm.prank(D);
        // usdc.approve(address(ern), 1000);

        // vm.prank(D);
        // ern.deposit(tinyDeposit, D);

        // assertEq(ern.balanceOf(D), tinyDeposit, "Tiny deposit should work");
        // console.log("- 1 wei deposit successful");

        // // Test 2: Multiple users depositing in same block
        // console.log("Test 2: Multiple users same block deposits");
        // uint256 sameBlockDeposit = 1_000e6;

        // // Don't advance time - all in same block
        // vm.prank(A);
        // ern.deposit(sameBlockDeposit, A);

        // vm.prank(B);
        // ern.deposit(sameBlockDeposit, B);

        // vm.prank(C);
        // ern.deposit(sameBlockDeposit, C);

        // // All should have same unlock time
        // uint256 expectedUnlockTime = block.timestamp + ern.lockPeriod();
        // assertEq(ern.unlockTime(A), expectedUnlockTime, "User A unlock time");
        // assertEq(ern.unlockTime(B), expectedUnlockTime, "User B unlock time");
        // assertEq(ern.unlockTime(C), expectedUnlockTime, "User C unlock time");

        // console.log("- Same block deposits successful");

        // // Test 3: Harvest with minimal yield
        // console.log("Test 3: Harvest with minimal yield");
        // uint256 minimalYield = 1e6; // 1 USDC
        // mockAavePool.simulateYield(address(aUSDC), address(ern), minimalYield);

        // vm.prank(owner);
        // ern.harvest(0);

        // // Should not revert and should distribute minimal rewards
        // uint256 totalClaimable = ern.claimableYield(A) + ern.claimableYield(B) + ern.claimableYield(C) + ern.claimableYield(D);
        // assertGt(totalClaimable, 0, "Minimal yield should create claimable rewards");

        // console.log("- Minimal yield harvest successful");

        // // Test 4: User deposits right before lock expiry
        // console.log("Test 4: Deposit right before lock expiry");

        // // Fast forward to 1 second before A's lock expires
        // uint256 userAUnlockTime = ern.unlockTime(A);
        // vm.warp(userAUnlockTime - 1);

        // assertTrue(ern.isLocked(A), "User A should still be locked");

        // // User A makes another deposit
        // uint256 lastMinuteDeposit = 500e6;
        // vm.prank(A);
        // ern.deposit(lastMinuteDeposit, A);

        // // Lock should be reset
        // uint256 newUnlockTime = block.timestamp + ern.lockPeriod();
        // assertEq(ern.unlockTime(A), newUnlockTime, "Lock should be reset");
        // assertTrue(ern.isLocked(A), "User A should be locked again");

        // console.log("- Last minute deposit reset lock correctly");

        // console.log("All edge case scenarios passed!");
    }

    function testIntegration_ComplexRewardTracking() public {
        // console.log("\n=== Testing Complex Reward Tracking ===");

        // // Scenario: Multiple deposits, withdrawals, and claims across harvest cycles

        // // User A deposits 20k USDC
        // _performDeposit(A, 20_000e6, A);

        // // First harvest
        // mockAavePool.simulateYield(address(aUSDC), address(ern), 1_000e6);
        // vm.prank(owner);
        // ern.harvest(0);

        // uint256 userAFirstClaimable = ern.claimableYield(A);
        // console.log("After first harvest, User A claimable:", userAFirstClaimable);

        // // User B joins
        // _performDeposit(B, 30_000e6, B);

        // // User A claims partial rewards
        // vm.prank(A);
        // ern.claimYield();

        // // Second harvest
        // mockAavePool.simulateYield(address(aUSDC), address(ern), 2_000e6);
        // vm.prank(owner);
        // ern.harvest(0);

        // // Both users should have claimable from second harvest
        // uint256 userASecondClaimable = ern.claimableYield(A);
        // uint256 userBSecondClaimable = ern.claimableYield(B);

        // console.log("After second harvest:");
        // console.log("- User A claimable:", userASecondClaimable);
        // console.log("- User B claimable:", userBSecondClaimable);

        // // User A withdraws half their position after lock expires
        // _waitForLockExpiry();
        // uint256 userAShares = ern.balanceOf(A);

        // vm.prank(A);
        // ern.withdraw(userAShares / 2, A, A);

        // // Third harvest
        // mockAavePool.simulateYield(address(aUSDC), address(ern), 1_500e6);
        // vm.prank(owner);
        // ern.harvest(0);

        // // Rewards should be proportional to remaining positions
        // uint256 userAThirdClaimable = ern.claimableYield(A);
        // uint256 userBThirdClaimable = ern.claimableYield(B);

        // console.log("After third harvest (A withdrew half):");
        // console.log("- User A claimable:", userAThirdClaimable);
        // console.log("- User B claimable:", userBThirdClaimable);

        // // Verify User A's total claimable includes previous unclaimed + new rewards
        // uint256 expectedUserATotal = userASecondClaimable + userAThirdClaimable;
        // assertEq(ern.claimableYield(A), expectedUserATotal, "User A total claimable");

        // console.log("Complex reward tracking verified successfully!");
    }
}
