// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Vm} from "forge-std/Vm.sol";

import {Ern} from "../src/Ern.sol";
import {IErn} from "../src/interfaces/IErn.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnHarvestTest is ErnBaseMockTest {
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    // Helper struct to avoid stack too deep
    struct HarvestResults {
        uint256 totalDeposits;
        uint256 yieldAmount;
        uint256 expectedWbtcReceived;
        uint256 expectedProtocolFee;
        uint256 expectedUserRewards;
        uint256 newCumulativeWbtcPerShare;
    }

    function setUp() public override {
        super.setUp();
    }

    function testOwnerHarvestWithYield() public {
        // Setup deposits and yield
        uint256 totalDeposits = _setupHarvestTest();
        uint256 yieldAmount = 5_000e6; // 5k USDC yield

        // Simulate yield and perform harvest
        HarvestResults memory results = _performHarvest(totalDeposits, yieldAmount);

        // Test user claiming
        _testUserYieldClaiming(results);

        // Test no-op harvest
        _testNoYieldHarvest();

        slog("Owner harvest with yield test completed successfully");
    }

    function testNoYieldToHarvest() public {
        // Setup deposits but no yield
        _setupHarvestTest();

        uint256 ownerWBTCBefore = wbtc.balanceOf(owner);
        uint256 cumulativeBefore = ern.cumulativeRewardPerShare();

        // Attempt harvest with no yield
        vm.expectRevert(Ern.HarvestConditionsNotMet.selector);
        vm.prank(owner);
        ern.harvest(0);

        // Verify no changes occurred
        assertEq(wbtc.balanceOf(owner), ownerWBTCBefore, "Owner WBTC unchanged");
        assertEq(ern.cumulativeRewardPerShare(), cumulativeBefore, "Cumulative unchanged");

        slog("No yield harvest correctly reverted");
    }

    function testSlippageProtection() public {
        // Setup deposits and yield
        _setupHarvestTest();
        uint256 yieldAmount = 3_000e6;

        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        // Get expected WBTC output
        uint256 expectedWBTC = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);

        // Test with unreasonably high minOut (should fail)
        vm.expectRevert(); // DEX will revert on insufficient output
        vm.prank(owner);
        ern.harvest(expectedWBTC * 2); // Ask for 2x expected output

        // Test with reasonable minOut (should succeed)
        uint256 reasonableMinOut = (expectedWBTC * 95) / 100; // 5% slippage tolerance
        vm.prank(owner);
        ern.harvest(reasonableMinOut);

        slog("Slippage protection working correctly");
    }

    // Helper function to setup harvest test deposits
    function _setupHarvestTest() private returns (uint256 totalDeposits) {
        uint256 userADeposit = LARGE_DEPOSIT; // 25k USDC
        uint256 userBDeposit = MEDIUM_DEPOSIT; // 10k USDC
        totalDeposits = userADeposit + userBDeposit; // 35k USDC

        slog("- User A deposit: ", userADeposit.decimal6(), " USDC");
        slog("- User B deposit: ", userBDeposit.decimal6(), " USDC");

        // Users deposit USDC
        _performDeposit(A, userADeposit);
        _performDeposit(B, userBDeposit);

        // Verify initial state
        assertEq(ern.totalSupply(), totalDeposits, "Total supply should equal total deposits");
        assertEq(aUSDC.balanceOf(address(ern)), totalDeposits, "Ern should have aUSDC equal to deposits");
        _assertSystemConsistency();
    }

    // Helper function to perform harvest and return results
    function _performHarvest(uint256 totalDeposits, uint256 yieldAmount)
        private
        returns (HarvestResults memory results)
    {
        slog("- Simulated yield: ", yieldAmount.decimal6(), " USDC");

        // Record initial state
        uint256 initialCumulativeWbtcPerShare = ern.cumulativeRewardPerShare();
        uint256 initialOwnerWBTC = wbtc.balanceOf(owner);

        // Simulate yield accumulation in Aave
        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        // Verify yield was generated
        uint256 aUSDCBalance = aUSDC.balanceOf(address(ern));
        assertEq(aUSDCBalance, totalDeposits + yieldAmount, "aUSDC balance should include yield");
        assertGt(aUSDCBalance, ern.totalSupply(), "Yield should be available for harvest");
        slog("- aUSDC balance after yield: ", aUSDCBalance.decimal6(), " USDC");

        // Calculate expected results
        results.totalDeposits = totalDeposits;
        results.yieldAmount = yieldAmount;
        results.expectedWbtcReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
        results.expectedProtocolFee = (results.expectedWbtcReceived * ern.harvestFee()) / 10000;
        results.expectedUserRewards = results.expectedWbtcReceived - results.expectedProtocolFee;

        slog("- Expected WBTC from swap: ", results.expectedWbtcReceived.decimal8(), " WBTC");
        slog("- Expected protocol fee: ", results.expectedProtocolFee.decimal8(), " WBTC");
        slog("- Expected user rewards: ", results.expectedUserRewards.decimal8(), " WBTC");

        // Calculate expected cumulative increase
        uint256 expectedCumulativeIncrease = (results.expectedUserRewards * 1e18) / totalDeposits;

        // Owner performs harvest - expect the event but don't check exact cumulative value due to rounding
        vm.recordLogs();

        vm.prank(owner);
        ern.harvest(0); // Accept any slippage for test

        // Verify harvest event was emitted with correct yield and fee values
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bool harvestEventFound = false;
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == keccak256("Harvest(uint256,uint256,uint256,uint256)")) {
                (uint256 logYield, uint256 logRewardBought, uint256 logFeeTaken, uint256 logCumulative) =
                    abi.decode(logs[i].data, (uint256, uint256, uint256, uint256));

                assertEq(logYield, yieldAmount, "Harvest event yield amount should match");
                assertEq(logRewardBought, results.expectedWbtcReceived, "Harvest event reward bought should match");
                assertEq(logFeeTaken, results.expectedProtocolFee, "Harvest event fee taken should match");
                // Allow small rounding difference in cumulative (within 0.01%)
                assertApproxEqRel(
                    logCumulative,
                    expectedCumulativeIncrease,
                    1e14,
                    "Harvest event cumulative should be close to expected"
                );
                harvestEventFound = true;
                break;
            }
        }
        assertTrue(harvestEventFound, "Harvest event should have been emitted");

        // Verify harvest results
        assertEq(
            wbtc.balanceOf(owner), initialOwnerWBTC + results.expectedProtocolFee, "Owner should receive protocol fee"
        );

        results.newCumulativeWbtcPerShare = ern.cumulativeRewardPerShare();
        assertApproxEqRel(
            results.newCumulativeWbtcPerShare,
            initialCumulativeWbtcPerShare + expectedCumulativeIncrease,
            1e14,
            "Cumulative WBTC per share should increase by approximately expected amount"
        );

        assertEq(ern.lastHarvest(), block.timestamp, "Last harvest timestamp should be updated");
        assertEq(
            aUSDC.balanceOf(address(ern)),
            ern.totalSupply(),
            "aUSDC balance should equal total supply after harvest"
        );
        _assertSystemConsistency();
    }

    // Helper function to test user yield claiming
    function _testUserYieldClaiming(HarvestResults memory results) private {
        // Calculate expected claimable amounts for each user
        uint256 userAExpectedClaimable = (results.expectedUserRewards * LARGE_DEPOSIT) / results.totalDeposits;
        uint256 userBExpectedClaimable = (results.expectedUserRewards * MEDIUM_DEPOSIT) / results.totalDeposits;

        uint256 userAActualClaimable = ern.claimableYield(A);
        uint256 userBActualClaimable = ern.claimableYield(B);

        // Allow for small rounding differences (within 1 wei)
        assertApproxEqAbs(
            userAActualClaimable, userAExpectedClaimable, 1, "User A claimable amount should be proportional"
        );
        assertApproxEqAbs(
            userBActualClaimable, userBExpectedClaimable, 1, "User B claimable amount should be proportional"
        );
        assertApproxEqAbs(
            userAActualClaimable + userBActualClaimable,
            results.expectedUserRewards,
            2,
            "Total claimable should equal user rewards"
        );

        slog("- User A can claim: ", userAActualClaimable.decimal8(), " WBTC");
        slog("- User B can claim: ", userBActualClaimable.decimal8(), " WBTC");

        // Test actual yield claiming
        uint256 userAWBTCBefore = wbtc.balanceOf(A);

        vm.expectEmit(true, true, true, true);
        emit IErn.YieldClaimed(A, userAActualClaimable);

        vm.prank(A);
        ern.claimYield();

        // Verify User A received WBTC
        assertEq(wbtc.balanceOf(A), userAWBTCBefore + userAActualClaimable, "User A should receive claimable WBTC");
        assertEq(ern.claimableYield(A), 0, "User A should have no more claimable yield");

        // Verify User A's tracking was updated
        (uint256 userALastCumulative, uint256 userAWbtcClaimed,) = ern.users(A);
        assertEq(userALastCumulative, results.newCumulativeWbtcPerShare, "User A cumulative tracking updated");
        assertEq(userAWbtcClaimed, userAActualClaimable, "User A claimed amount tracked");

        slog("- User A claimed: ", userAActualClaimable.decimal8(), " WBTC");
        slog("- owner WBTC: ", wbtc.balanceOf(owner).decimal8(), " WBTC");
    }

    // Helper function to test harvest with no yield
    function _testNoYieldHarvest() private {
        uint256 ownerWBTCBefore = wbtc.balanceOf(owner);
        uint256 cumulativeBefore = ern.cumulativeRewardPerShare();

        // Attempt harvest with no new yield (should return early)
        vm.expectRevert(Ern.HarvestConditionsNotMet.selector);
        vm.prank(owner);
        ern.harvest(0);

        // Verify no changes occurred
        assertEq(wbtc.balanceOf(owner), ownerWBTCBefore, "Owner WBTC unchanged on no-yield harvest");
        assertEq(ern.cumulativeRewardPerShare(), cumulativeBefore, "Cumulative unchanged on no-yield harvest");
    }
}
