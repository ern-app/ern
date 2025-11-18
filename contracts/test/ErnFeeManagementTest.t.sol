// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ern} from "../src/Ern.sol";
import {IErn} from "../src/interfaces/IErn.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnFeeManagementTest is ErnBaseMockTest {
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    function setUp() public override {
        super.setUp();
    }

    function testOwnerCanUpdateFee() public {
        uint256 newHarvestFee = 750; // 7.5% fee
        uint256 initialFee = ern.harvestFee();

        slog("- Initial fee: ", initialFee.percent2());
        slog("- New fee: ", newHarvestFee.percent2());
        slog("- Max allowed fee: ", ern.MAX_HARVEST_FEE_BPS().percent2());

        // Verify new fee is within limits
        assertLt(newHarvestFee, ern.MAX_HARVEST_FEE_BPS(), "New fee should be within max limit");
        assertGt(newHarvestFee, initialFee, "New fee should be higher for test purposes");

        // Owner updates fee with event emission
        vm.expectEmit(true, true, true, true);
        emit IErn.FeeUpdated(newHarvestFee);

        vm.prank(owner);
        ern.setHarvestFee(newHarvestFee);

        // Verify fee was updated
        assertEq(ern.harvestFee(), newHarvestFee, "Fee should be updated to new value");

        slog("Fee updated successfully from ", initialFee.percent2(), " to ", newHarvestFee.percent2());

        // Test that subsequent harvest uses new fee rate
        _testNewFeeInHarvest(newHarvestFee);

        // Test setting fee to minimum (0%)
        _testMinimumFee();

        // Test setting fee to maximum allowed
        _testMaximumFee();

        slog("Owner fee update test completed successfully");
    }

    function testRevertOnExcessiveFee() public {
        uint256 maxAllowedFee = ern.MAX_HARVEST_FEE_BPS();
        uint256 excessiveFee = maxAllowedFee + 1;

        slog("- Max allowed fee: ", maxAllowedFee.percent2());
        slog("- Excessive fee attempt: ", excessiveFee.percent2());

        // Attempt to set fee above maximum should revert
        vm.expectRevert(Ern.FeeTooHigh.selector);
        vm.prank(owner);
        ern.setHarvestFee(excessiveFee);

        // Fee should remain unchanged
        assertEq(ern.harvestFee(), 500, "Fee should remain at initial value"); // Default 5%

        // Test with much higher excessive fee
        uint256 veryExcessiveFee = 5000; // 50%
        vm.expectRevert(Ern.FeeTooHigh.selector);
        vm.prank(owner);
        ern.setHarvestFee(veryExcessiveFee);

        slog("Excessive fee correctly reverted");
    }

    function testOnlyOwnerCanSetFee() public {
        uint256 newFee = 300; // 3%
        uint256 initialFee = ern.harvestFee();

        // Non-owner users should not be able to set fee
        vm.expectRevert();
        vm.prank(A);
        ern.setHarvestFee(newFee);

        vm.expectRevert();
        vm.prank(B);
        ern.setHarvestFee(newFee);

        // Fee should remain unchanged
        assertEq(ern.harvestFee(), initialFee, "Fee should remain unchanged from non-owner attempts");

        // Owner should be able to set fee
        vm.prank(owner);
        ern.setHarvestFee(newFee);

        assertEq(ern.harvestFee(), newFee, "Owner should be able to set fee");

        slog("Only owner can set fee verification passed");
    }

    function testFeeImpactOnHarvest() public {
        // Setup deposits
        uint256 depositAmount = 20_000e6; // 20k USDC
        _performDeposit(A, depositAmount);

        // Test with different fee rates
        uint256[] memory feeRates = new uint256[](4);
        feeRates[0] = 0; // 0%
        feeRates[1] = 250; // 2.5%
        feeRates[2] = 500; // 5%
        feeRates[3] = 1000; // 10%

        for (uint256 i = 0; i < feeRates.length; i++) {
            slog("--- Testing fee rate: ", feeRates[i].percent2(), " ---");

            // Set new fee rate
            vm.prank(owner);
            ern.setHarvestFee(feeRates[i]);

            // Simulate yield
            uint256 yieldAmount = 2_000e6; // 2k USDC
            mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

            // Record balances before harvest
            uint256 ownerWBTCBefore = wbtc.balanceOf(owner);

            // Calculate expected values
            uint256 expectedWBTCReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
            uint256 expectedProtocolFee = (expectedWBTCReceived * feeRates[i]) / 10000;
            uint256 expectedUserRewards = expectedWBTCReceived - expectedProtocolFee;

            // Perform harvest
            vm.prank(owner);
            ern.harvest(0);

            // Verify fee distribution
            uint256 ownerWBTCAfter = wbtc.balanceOf(owner);
            uint256 actualProtocolFee = ownerWBTCAfter - ownerWBTCBefore;

            assertEq(actualProtocolFee, expectedProtocolFee, "Protocol fee should match expected");

            // Verify user can claim expected rewards
            uint256 userClaimable = ern.claimableYield(A);
            assertApproxEqAbs(userClaimable, expectedUserRewards, 1, "User rewards should match expected");

            slog("  Expected protocol fee: ", expectedProtocolFee.percent2());
            slog("  Actual protocol fee: ", actualProtocolFee.percent2());
            slog("  User claimable: ", userClaimable.percent2());

            // User claims to reset state for next iteration
            if (userClaimable > 0) {
                vm.prank(A);
                ern.claimYield();
            }
        }

        slog("Fee impact on harvest test completed");
    }

    function testEventEmission() public {
        uint256[] memory testFees = new uint256[](3);
        testFees[0] = 0; // 0%
        testFees[1] = 250; // 2.5%
        testFees[2] = 1000; // 10%

        for (uint256 i = 0; i < testFees.length; i++) {
            slog("Testing fee update to: ", testFees[i].percent2());

            // Expect event emission
            vm.expectEmit(true, true, true, true);
            emit IErn.FeeUpdated(testFees[i]);

            vm.prank(owner);
            ern.setHarvestFee(testFees[i]);

            assertEq(ern.harvestFee(), testFees[i], "Fee should be updated");
        }

        slog("Fee update event emission test completed");
    }

    // Helper function to test new fee rate in actual harvest
    function _testNewFeeInHarvest(uint256 expectedHarvestFee) private {
        // Setup deposit for harvest test
        uint256 testDepositAmount = 10_000e6; // 10k USDC
        _performDeposit(B, testDepositAmount);

        // Simulate yield
        uint256 yieldAmount = 1_000e6; // 1k USDC
        mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);

        // Calculate expected protocol fee with new rate
        uint256 expectedWBTCReceived = mockDex.previewSwap(address(usdc), address(wbtc), yieldAmount);
        uint256 expectedProtocolFee = (expectedWBTCReceived * expectedHarvestFee) / 10000;

        uint256 ownerWBTCBefore = wbtc.balanceOf(owner);

        // Perform harvest
        vm.prank(owner);
        ern.harvest(0);

        // Verify new fee rate was applied
        uint256 actualProtocolFee = wbtc.balanceOf(owner) - ownerWBTCBefore;
        assertEq(actualProtocolFee, expectedProtocolFee, "Harvest should use new fee rate");

        slog("  New fee rate applied correctly in harvest");
        slog("  Expected protocol fee: ", expectedProtocolFee.percent2());
        slog("  Actual protocol fee: ", actualProtocolFee.percent2());
    }

    // Helper function to test setting minimum fee (0%)
    function _testMinimumFee() private {
        vm.expectEmit(true, true, true, true);
        emit IErn.FeeUpdated(0);

        vm.prank(owner);
        ern.setHarvestFee(0);

        assertEq(ern.harvestFee(), 0, "Fee should be set to 0%");
        slog("  Minimum fee (0%) set successfully");
    }

    // Helper function to test setting maximum allowed fee
    function _testMaximumFee() private {
        uint256 maxFee = ern.MAX_HARVEST_FEE_BPS();

        vm.expectEmit(true, true, true, true);
        emit IErn.FeeUpdated(maxFee);

        vm.prank(owner);
        ern.setHarvestFee(maxFee);

        assertEq(ern.harvestFee(), maxFee, "Fee should be set to maximum allowed");
        slog("  Maximum fee (", maxFee.percent2(), ") set successfully");
    }
}
