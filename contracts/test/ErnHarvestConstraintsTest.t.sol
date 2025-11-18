// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ern} from "../src/Ern.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";

contract ErnHarvestConstraintsTest is ErnBaseMockTest {
    function setUp() public override {
        super.setUp();
    }

    function testSetMinYieldAmount_ValidValues() public {
        vm.startPrank(owner);

        // Test minimum valid value (1 USDC)
        ern.setMinYieldAmount(1e6);
        assertEq(ern.minYieldAmount(), 1e6);

        // Test maximum valid value (100,000 USDC)
        ern.setMinYieldAmount(100000e6);
        assertEq(ern.minYieldAmount(), 100000e6);

        // Test middle value (1,000 USDC)
        ern.setMinYieldAmount(1000e6);
        assertEq(ern.minYieldAmount(), 1000e6);

        vm.stopPrank();
    }

    function testSetMinYieldAmount_RevertTooLow() public {
        vm.prank(owner);
        vm.expectRevert(Ern.MinYieldAmountTooLow.selector);
        ern.setMinYieldAmount(1e6 - 1);
    }

    function testSetMinYieldAmount_RevertTooHigh() public {
        vm.prank(owner);
        vm.expectRevert(Ern.MinYieldAmountTooHigh.selector);
        ern.setMinYieldAmount(100000e6 + 1);
    }

    function testSetHarvestTimePeriod_ValidValues() public {
        vm.startPrank(owner);

        // Test minimum valid value (1 hour)
        ern.setHarvestTimePeriod(1 hours);
        assertEq(ern.harvestTimePeriod(), 1 hours);

        // Test maximum valid value (30 days)
        ern.setHarvestTimePeriod(30 days);
        assertEq(ern.harvestTimePeriod(), 30 days);

        // Test middle value (12 hours)
        ern.setHarvestTimePeriod(12 hours);
        assertEq(ern.harvestTimePeriod(), 12 hours);

        vm.stopPrank();
    }

    function testSetHarvestTimePeriod_RevertTooShort() public {
        vm.prank(owner);
        vm.expectRevert(Ern.HarvestTimePeriodTooShort.selector);
        ern.setHarvestTimePeriod(1 hours - 1);
    }

    function testSetHarvestTimePeriod_RevertTooLong() public {
        vm.prank(owner);
        vm.expectRevert(Ern.HarvestTimePeriodTooLong.selector);
        ern.setHarvestTimePeriod(30 days + 1);
    }

    function testHarvestConditions_YieldSufficient() public {
        // Setup deposit
        usdc.mint(A, 1000e6);
        vm.startPrank(A);
        usdc.approve(address(ern), 1000e6);
        ern.deposit(1000e6);
        vm.stopPrank();

        // Set minimum yield to 50 USDC
        vm.prank(owner);
        ern.setMinYieldAmount(50e6);

        // Simulate 100 USDC yield (above minimum)
        mockAavePool.simulateYield(address(aUSDC), address(ern), 100e6);

        // Harvest should work immediately because yield is sufficient
        vm.prank(owner);
        ern.harvest(0);
    }

    function testHarvestConditions_TimePassed() public {
        // Setup deposit
        usdc.mint(A, 1000e6);
        vm.startPrank(A);
        usdc.approve(address(ern), 1000e6);
        ern.deposit(1000e6);
        vm.stopPrank();

        // Set minimum yield to 100 USDC and time period to 2 hours
        vm.startPrank(owner);
        ern.setMinYieldAmount(100e6);
        ern.setHarvestTimePeriod(2 hours);
        vm.stopPrank();

        // Simulate only 10 USDC yield (below minimum)
        mockAavePool.simulateYield(address(aUSDC), address(ern), 10e6);

        // Should fail immediately
        vm.prank(owner);
        vm.expectRevert(Ern.HarvestConditionsNotMet.selector);
        ern.harvest(0);

        // Advance time by 2 hours
        vm.warp(block.timestamp + 2 hours);

        // Should work now because time has passed
        vm.prank(owner);
        ern.harvest(0);
    }

    function testHarvestConditions_NeitherConditionMet() public {
        // Setup deposit
        usdc.mint(A, 1000e6);
        vm.startPrank(A);
        usdc.approve(address(ern), 1000e6);
        ern.deposit(1000e6);
        vm.stopPrank();

        // Set minimum yield to 100 USDC and time period to 24 hours
        vm.startPrank(owner);
        ern.setMinYieldAmount(100e6);
        ern.setHarvestTimePeriod(24 hours);
        vm.stopPrank();

        // Simulate only 10 USDC yield (below minimum) and don't advance time
        mockAavePool.simulateYield(address(aUSDC), address(ern), 10e6);

        // Should fail because neither condition is met
        vm.prank(owner);
        vm.expectRevert(Ern.HarvestConditionsNotMet.selector);
        ern.harvest(0);
    }
}
