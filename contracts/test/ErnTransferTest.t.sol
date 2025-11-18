// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ern} from "../src/Ern.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";

contract ErnTransferTest is ErnBaseMockTest {
    function setUp() public override {
        // Call the base setup
        super.setUp();
    }

    function testDirectTransferBlocked() public {
        // A deposits to get some shares
        uint256 depositAmount = 1000e6;
        vm.prank(A);
        ern.deposit(depositAmount);

        // Verify A has shares
        assertEq(ern.balanceOf(A), depositAmount, "User A should have shares");
        assertEq(ern.balanceOf(B), 0, "User B should have no shares");

        // Attempt direct transfer - should revert
        vm.prank(A);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transfer(B, 500e6);
    }

    function testTransferFromBlocked() public {
        // A deposits to get some shares
        uint256 depositAmount = 1000e6;
        vm.prank(A);
        ern.deposit(depositAmount);

        // A approves B to spend their shares
        vm.prank(A);
        ern.approve(B, 500e6);

        // Verify allowance is set
        assertEq(ern.allowance(A, B), 500e6, "Allowance should be set");

        // Attempt transferFrom - should revert
        vm.prank(B);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transferFrom(A, B, 500e6);
    }

    function testMintingStillWorks() public {
        // Verify deposit (which calls _mint internally) still works
        uint256 depositAmount = 1000e6;
        vm.prank(A);
        ern.deposit(depositAmount);

        assertEq(ern.balanceOf(A), depositAmount, "Minting should work");
        assertEq(ern.totalSupply(), depositAmount, "Total supply should increase");
    }

    function testBurningStillWorks() public {
        // A deposits first
        uint256 depositAmount = 1000e6;
        vm.prank(A);
        ern.deposit(depositAmount);

        // Fast forward past lock period
        vm.warp(block.timestamp + 8 days);

        // Withdraw (which calls _burn internally) should work
        vm.prank(A);
        ern.withdraw(500e6);

        assertApproxEqRel(ern.balanceOf(A), 500e6, 0.01e18, "Burning should work");
        assertApproxEqRel(ern.totalSupply(), 500e6, 0.01e18, "Total supply should decrease");
    }

    function testAllowanceStillWorks() public {
        // A deposits to get some shares
        uint256 depositAmount = 1000e6;
        vm.prank(A);
        ern.deposit(depositAmount);

        // Approvals should still work (just transfers are blocked)
        vm.prank(A);
        ern.approve(B, 500e6);

        assertEq(ern.allowance(A, B), 500e6, "Allowance should work");

        // But transferFrom should still be blocked
        vm.prank(B);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transferFrom(A, B, 500e6);
    }

    function testZeroTransferBlocked() public {
        // A deposits to get some shares
        uint256 depositAmount = 1000e6;
        vm.prank(A);
        ern.deposit(depositAmount);

        // Even zero transfers should be blocked
        vm.prank(A);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transfer(B, 0);
    }

    function testMultipleUsersCannotTransferToEachOther() public {
        // Both users deposit
        uint256 depositAmount = 1000e6;

        vm.prank(A);
        ern.deposit(depositAmount);

        vm.prank(B);
        ern.deposit(depositAmount);

        // A cannot transfer to B
        vm.prank(A);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transfer(B, 100e6);

        // B cannot transfer to A
        vm.prank(B);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transfer(A, 100e6);

        // A cannot transfer to C
        vm.prank(A);
        vm.expectRevert(Ern.TransferLocked.selector);
        ern.transfer(C, 100e6);
    }
}
