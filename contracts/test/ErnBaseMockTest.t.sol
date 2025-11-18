// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {Ern} from "../src/Ern.sol";
import {IErn} from "../src/interfaces/IErn.sol";
import {MockDex} from "./mocks/MockDex.sol";
import {MockAavePool, MockAToken} from "./mocks/MockAavePool.sol";
import {MockAaveAddressesProvider} from "./mocks/MockAaveAddressesProvider.sol";
import {MockWBTC} from "./mocks/MockWBTC.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {TestAccounts} from "./utils/TestAccounts.sol";
import {Logging} from "./utils/Logging.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnBaseMockTest is TestAccounts, Logging {
    using Strings for uint256;
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    // Contracts
    Ern public ern;
    MockDex public mockDex;
    MockAavePool public mockAavePool;

    // Tokens
    MockUSDC public usdc;
    MockWBTC public wbtc;
    MockAToken public aUSDC;
    MockAaveAddressesProvider public mockAaveAddresses;

    // Test accounts
    address public owner = address(0x1);
    address public otherUser = address(0x2);
    // Test constants
    uint256 public constant INITIAL_USDC_BALANCE = 100_000e6; // 100k USDC per user
    uint256 public constant DEX_USDC_LIQUIDITY = 10_000_000e6; // 10M USDC for DEX liquidity
    uint256 public constant DEX_WBTC_LIQUIDITY = 250e8; // 250 WBTC for DEX liquidity
    uint256 public constant USDC_TO_WBTC_RATE = 25e12; // 1 USDC = 0.000025 WBTC (~$40k BTC)

    // Common test amounts
    uint256 public constant SMALL_DEPOSIT = 1_000e6; // 1k USDC
    uint256 public constant MEDIUM_DEPOSIT = 10_000e6; // 10k USDC
    uint256 public constant LARGE_DEPOSIT = 25_000e6; // 25k USDC
    uint256 public constant PARTIAL_WITHDRAW = 15_000e6; // 15k USDC

    // Test addresses
    address public constant TEST_RECEIVER = address(0x999);

    function setUp() public virtual {
        // Warp to a realistic timestamp to avoid edge case with timestamp=1
        vm.warp(1752681861); // Nov 2023 timestamp
        setupAccounts();

        // Set up test accounts
        vm.label(owner, "Owner");

        // Deploy tokens
        usdc = new MockUSDC();
        wbtc = new MockWBTC();
        aUSDC = new MockAToken("Aave USDC", "aUSDC");

        // Deploy mock contracts as owner
        vm.startPrank(owner);
        mockAavePool = new MockAavePool();
        mockDex = new MockDex();
        mockAavePool.setAToken(address(usdc), address(aUSDC));
        mockAaveAddresses = new MockAaveAddressesProvider();
        mockAaveAddresses.setPool(address(mockAavePool));

        // Deploy Ern contract
        ern = new Ern(
            ERC20(address(usdc)), // underlying
            ERC20(address(wbtc)), // wbtc
            mockAaveAddresses, // aavePool (cast to IAavePool)
            mockDex // dex
        );

        // Set up DEX exchange rate
        mockDex.setBidirectionalRate(address(usdc), address(wbtc), USDC_TO_WBTC_RATE);
        vm.stopPrank();

        // Provide significant liquidity to DEX for trading
        wbtc.mint(address(mockDex), DEX_WBTC_LIQUIDITY);
        usdc.mint(address(mockDex), DEX_USDC_LIQUIDITY);

        // Give users USDC
        for (uint256 i = 0; i < accountsList.length; i++) {
            usdc.mint(accountsList[i], INITIAL_USDC_BALANCE);
            vm.prank(accountsList[i]);
            usdc.approve(address(ern), type(uint256).max);
        }
    }

    function testSetup() public view {
        // Basic setup verification
        assertEq(ern.owner(), owner, "Owner should be set correctly");
        assertEq(address(ern.UNDERLYING()), address(usdc), "Underlying should be USDC");
        assertEq(address(ern.REWARD_TOKEN()), address(wbtc), "WBTC should be set correctly");
        assertEq(ern.harvestFee(), 500, "Default fee should be 5%");
        assertEq(ern.lockPeriod(), 48 hours, "Lock period should be 48 hours");

        // Check DEX setup
        assertEq(mockDex.getExchangeRate(address(usdc), address(wbtc)), USDC_TO_WBTC_RATE, "DEX rate should be set");

        // Check user balances for TestAccounts
        for (uint256 i = 0; i < accountsList.length; i++) {
            assertEq(usdc.balanceOf(accountsList[i]), INITIAL_USDC_BALANCE, "User should have USDC");
        }

        slog("All setup checks passed!");
    }

    // =============================================================================
    // COMMON HELPER FUNCTIONS
    // =============================================================================

    // Helper to perform deposit and verify basic invariants
    function _performDeposit(address user, uint256 amount) internal {
        uint256 userUSDCBefore = usdc.balanceOf(user);
        uint256 userSharesBefore = ern.balanceOf(user);
        uint256 totalSupplyBefore = ern.totalSupply();

        vm.expectEmit(true, true, true, true);
        emit IErn.Deposit(user, amount);

        vm.prank(user);
        ern.deposit(amount);

        // Verify basic invariants
        assertEq(usdc.balanceOf(user), userUSDCBefore - amount, "User USDC should decrease");
        assertEq(ern.balanceOf(user), userSharesBefore + amount, "User shares should increase");
        assertEq(ern.totalSupply(), totalSupplyBefore + amount, "Total supply should increase");
        assertTrue(ern.isLocked(user), "User should be locked after deposit");
    }

    // Helper to perform withdrawal and verify basic invariants
    function _performWithdraw(address spender, uint256 amount) internal {
        uint256 ownerSharesBefore = ern.balanceOf(spender);
        uint256 receiverUSDCBefore = usdc.balanceOf(spender);
        uint256 totalSupplyBefore = ern.totalSupply();

        // Calculate expected amount after fee
        (uint256 expectedAmountReceived, uint256 fee) = ern.applicableFee(spender, amount);

        vm.expectEmit(true, true, true, true);
        emit IErn.Withdraw(spender, expectedAmountReceived, fee);

        vm.prank(spender);
        ern.withdraw(amount);

        // Verify basic invariants
        assertEq(ern.balanceOf(spender), ownerSharesBefore - amount, "Owner shares should decrease");
        assertEq(
            usdc.balanceOf(spender),
            receiverUSDCBefore + expectedAmountReceived,
            "Receiver USDC should increase by amount minus fee"
        );
        assertEq(ern.totalSupply(), totalSupplyBefore - expectedAmountReceived, "Total supply should decrease");
    }

    // Helper to wait for lock period expiry
    function _waitForLockExpiry() internal {
        vm.warp(block.timestamp + ern.lockPeriod() + 1);
    }

    // Helper to verify user is properly locked
    function _assertUserLocked(address user, bool shouldBeLocked) internal view {
        if (shouldBeLocked) {
            assertTrue(ern.isLocked(user), "User should be locked");
        } else {
            assertFalse(ern.isLocked(user), "User should not be locked");
        }
    }

    // Helper to verify balance consistency across the system
    function _assertSystemConsistency() internal view {
        assertEq(ern.totalAssets(), ern.totalSupply(), "Total assets should equal total shares");
        assertEq(aUSDC.balanceOf(address(ern)), ern.totalSupply(), "aUSDC balance should equal total shares");
    }

    // Helper to verify no state changes occurred
    function _verifyNoStateChange(
        address user,
        uint256 expectedShares,
        uint256 expectedTotalSupply,
        uint256 expectedUSDC,
        string memory context
    ) internal view {
        assertEq(ern.balanceOf(user), expectedShares, string(abi.encodePacked(context, ": shares unchanged")));
        assertEq(ern.totalSupply(), expectedTotalSupply, string(abi.encodePacked(context, ": total supply unchanged")));
        assertEq(usdc.balanceOf(user), expectedUSDC, string(abi.encodePacked(context, ": USDC balance unchanged")));
    }
}

