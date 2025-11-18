// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnDepositTest is ErnBaseMockTest {
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    function setUp() public override {
        super.setUp();
        deal(address(usdc), address(mockAavePool), 10_000_000e6);
    }

    struct TestState {
        uint256 totalAssets;
        uint256 wbtcPerShare;
        uint256 wbtBalance;
        uint256 ownerWbtcBalance;
        uint256 wbtcABalance;
        uint256 wbtcBBalance;
        uint256 wbtcCBalance;
        uint256 wbtcDBalance;
    }

    function testFullCycle() public {
        // Record initial state
        TestState memory initialState;
        initialState.totalAssets = ern.totalAssets();
        initialState.wbtcPerShare = ern.cumulativeRewardPerShare();
        initialState.wbtBalance = wbtc.balanceOf(address(ern));
        initialState.ownerWbtcBalance = wbtc.balanceOf(owner);
        initialState.wbtcABalance = wbtc.balanceOf(A);
        initialState.wbtcBBalance = wbtc.balanceOf(B);
        initialState.wbtcCBalance = wbtc.balanceOf(C);
        initialState.wbtcDBalance = wbtc.balanceOf(D);

        // Perform deposit
        _performDeposit(A, SMALL_DEPOSIT);
        _performDeposit(B, MEDIUM_DEPOSIT);
        _performDeposit(C, MEDIUM_DEPOSIT);
        _performDeposit(D, LARGE_DEPOSIT);

        _simulateYield();
        // warp 48 hours + 1 hour
        vm.warp(block.timestamp + 48 hours + 1 hours);
        vm.prank(owner);
        ern.harvest(0);

        uint256 intermediateWbtcBalance = wbtc.balanceOf(address(ern));

        // implicit claim and withdraw
        _performWithdraw(A, ern.balanceOf(A));
        _performWithdraw(B, ern.balanceOf(B));
        _performWithdraw(C, ern.balanceOf(C));
        _performWithdraw(D, ern.balanceOf(D));

        // Check final state
        TestState memory finalState;
        finalState.totalAssets = ern.totalAssets();
        finalState.wbtcPerShare = ern.cumulativeRewardPerShare();
        finalState.wbtBalance = wbtc.balanceOf(address(ern));
        finalState.ownerWbtcBalance = wbtc.balanceOf(owner);
        finalState.wbtcABalance = wbtc.balanceOf(A);
        finalState.wbtcBBalance = wbtc.balanceOf(B);
        finalState.wbtcCBalance = wbtc.balanceOf(C);
        finalState.wbtcDBalance = wbtc.balanceOf(D);

        uint256 expectedIntermediateWbtc =
            finalState.wbtcABalance + finalState.wbtcBBalance + finalState.wbtcCBalance + finalState.wbtcDBalance;

        // todo: pending update, now owner keeps a small withdraw fee
        // assertEq(finalState.totalAssets, 0, "Total assets should be zero after full cycle");
        assertGt(finalState.wbtcPerShare, initialState.wbtcPerShare, "WBTC per share should increase after yield");
        assertApproxEqAbs(finalState.wbtBalance, 0, 10, "WBTC balance of Ern should be zero after full cycle");
        assertGt(
            finalState.ownerWbtcBalance,
            initialState.ownerWbtcBalance,
            "Owner WBTC balance should increase after full cycle"
        );
        assertApproxEqRel(
            intermediateWbtcBalance,
            expectedIntermediateWbtc,
            0.001e18,
            "Intermediate WBTC balance should equal sum of user balances"
        );
    }

    function testTwoPhasedDepositsAndSingleHarvest() public {
        TestState memory initialState;
        initialState.totalAssets = ern.totalAssets();
        initialState.wbtcPerShare = ern.cumulativeRewardPerShare();
        initialState.wbtBalance = wbtc.balanceOf(address(ern));
        initialState.ownerWbtcBalance = wbtc.balanceOf(owner);
        initialState.wbtcABalance = wbtc.balanceOf(A);
        initialState.wbtcBBalance = wbtc.balanceOf(B);

        // First phase deposits
        _performDeposit(A, 2 * MEDIUM_DEPOSIT);
        _simulateYield();

        _performDeposit(B, MEDIUM_DEPOSIT);

        vm.warp(block.timestamp + 48 hours + 1 hours);
        vm.prank(owner);
        ern.harvest(0);

        // implicit claim and withdraw
        _performWithdraw(A, ern.balanceOf(A));
        _performWithdraw(B, ern.balanceOf(B));

        // Check final state
        TestState memory finalState;
        finalState.totalAssets = ern.totalAssets();
        finalState.wbtcPerShare = ern.cumulativeRewardPerShare();
        finalState.wbtBalance = wbtc.balanceOf(address(ern));
        finalState.ownerWbtcBalance = wbtc.balanceOf(owner);
        finalState.wbtcABalance = wbtc.balanceOf(A);
        finalState.wbtcBBalance = wbtc.balanceOf(B);
    }

    function testPreemptiveWithdraw() public {
        TestState memory initialState;
        initialState.totalAssets = ern.totalAssets();
        initialState.wbtcPerShare = ern.cumulativeRewardPerShare();
        initialState.wbtBalance = wbtc.balanceOf(address(ern));
        initialState.ownerWbtcBalance = wbtc.balanceOf(owner);
        initialState.wbtcABalance = wbtc.balanceOf(A);
        initialState.wbtcBBalance = wbtc.balanceOf(B);

        // First phase deposits
        _performDeposit(A, MEDIUM_DEPOSIT);
        _performDeposit(B, MEDIUM_DEPOSIT);
        _simulateYield();

        vm.warp(block.timestamp + 48 hours + 1 hours);

        // implicit claim and withdraw
        _performWithdraw(A, ern.balanceOf(A));

        vm.prank(owner);
        ern.harvest(0);

        _performWithdraw(B, ern.balanceOf(B));

        // Check final state
        TestState memory finalState;
        finalState.totalAssets = ern.totalAssets();
        finalState.wbtcPerShare = ern.cumulativeRewardPerShare();
        finalState.wbtBalance = wbtc.balanceOf(address(ern));
        finalState.ownerWbtcBalance = wbtc.balanceOf(owner);
        finalState.wbtcABalance = wbtc.balanceOf(A);
        finalState.wbtcBBalance = wbtc.balanceOf(B);
    }

    function testTwoCyclesPreemptiveWithdraw() public {
        TestState memory initialState;
        initialState.totalAssets = ern.totalAssets();
        initialState.wbtcPerShare = ern.cumulativeRewardPerShare();
        initialState.wbtBalance = wbtc.balanceOf(address(ern));
        initialState.ownerWbtcBalance = wbtc.balanceOf(owner);
        initialState.wbtcABalance = wbtc.balanceOf(A);
        initialState.wbtcBBalance = wbtc.balanceOf(B);

        // First phase deposits
        _performDeposit(A, MEDIUM_DEPOSIT);
        _performDeposit(B, MEDIUM_DEPOSIT);
        _simulateYield();

        vm.warp(block.timestamp + 48 hours + 1 hours);

        vm.prank(owner);
        ern.harvest(0);

        vm.prank(A);
        ern.claimYield();
        vm.prank(B);
        ern.claimYield();

        _simulateYield();

        vm.warp(block.timestamp + 48 hours + 1 hours);

        // Check final state
        TestState memory intermediateState;
        intermediateState.totalAssets = ern.totalAssets();
        intermediateState.wbtcPerShare = ern.cumulativeRewardPerShare();
        intermediateState.wbtBalance = wbtc.balanceOf(address(ern));
        intermediateState.ownerWbtcBalance = wbtc.balanceOf(owner);
        intermediateState.wbtcABalance = wbtc.balanceOf(A);
        intermediateState.wbtcBBalance = wbtc.balanceOf(B);

        _performWithdraw(A, ern.balanceOf(A));

        vm.prank(owner);
        ern.harvest(0);

        _performWithdraw(B, ern.balanceOf(B));

        // Check final state
        TestState memory finalState;
        finalState.totalAssets = ern.totalAssets();
        finalState.wbtcPerShare = ern.cumulativeRewardPerShare();
        finalState.wbtBalance = wbtc.balanceOf(address(ern));
        finalState.ownerWbtcBalance = wbtc.balanceOf(owner);
        finalState.wbtcABalance = wbtc.balanceOf(A);
        finalState.wbtcBBalance = wbtc.balanceOf(B);
    }

    function _simulateYield() internal {
        uint256 totalSupply = ern.totalSupply();
        if (totalSupply > 0) {
            uint256 yieldAmount = (totalSupply * 5) / 100; // 5% yield
            mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);
        }
    }
}
