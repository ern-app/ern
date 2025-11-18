// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {ErnWithPendingQueue} from "../../src/old/ErnWithPendingQueue.sol";
import {StringFormatting} from "../utils/StringFormatting.sol";
import {TestAccounts} from "../utils/TestAccounts.sol";
import {Logging} from "../utils/Logging.sol";

import {MockDex} from "../mocks/MockDex.sol";
import {MockAavePool, MockAToken} from "../mocks/MockAavePool.sol";
import {MockWBTC} from "../mocks/MockWBTC.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";

contract ErnWPQGasHarvestAnalysis is Logging, TestAccounts {
    using Strings for uint256;
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    uint256 lastHarvestTime = 0;
    uint256 hoursPassed = 0;

    // Action type constants
    uint256 constant ACTION_HARVEST = 0;
    uint256 constant ACTION_DEPOSIT = 1;
    uint256 constant ACTION_WITHDRAW = 2;
    uint256 constant ACTION_CLAIM = 3;

    // User selection constants
    uint256 constant USER_A = 0;
    uint256 constant USER_B = 1;
    uint256 constant USER_C = 2;
    uint256 constant USER_D = 3;

    // Contracts
    ErnWithPendingQueue public ern;
    MockDex public mockDex;
    MockAavePool public mockAavePool;

    // Tokens
    MockUSDC public usdc;
    MockWBTC public wbtc;
    MockAToken public aUSDC;

    // Test accounts
    address public owner = address(0x1);
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

    function setUp() public {
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

        // Deploy Ern contract
        ern = new ErnWithPendingQueue(
            ERC20(address(usdc)), // underlying
            ERC20(address(wbtc)), // wbtc
            mockAavePool, // aavePool (cast to IAavePool)
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
        deal(address(usdc), address(mockAavePool), 10_000_000e6);
        lastHarvestTime = block.timestamp;
    }

    function testHarvestGasUsageAnalysis() public {
        slog("=== Ern Harvest Gas Usage Analysis ===");
        slog("");

        // Header for CSV-like output
        slog("Users,GasUsed,GasPerUser,Status");

        for (uint256 i = 1; i <= 50; i++) {
            ErnWithPendingQueue bY = new ErnWithPendingQueue(
                ERC20(address(usdc)), // underlying
                ERC20(address(wbtc)), // wbtc
                mockAavePool, // aavePool (cast to IAavePool)
                mockDex // dex
            );

            _setupUsers(bY, i);

            // Measure gas usage of harvest
            uint256 gasBefore = gasleft();

            try bY.harvest(0) {
                uint256 gasUsed = gasBefore - gasleft();
                uint256 gasPerUser = gasUsed / i;

                slog(string.concat(i.toString(), ",", gasUsed.toString(), ",", gasPerUser.toString(), ",", "SUCCESS"));
            } catch Error(string memory reason) {
                slog(string.concat(i.toString(), ",", "0,0,FAILED:", reason));
            } catch {
                slog(string.concat(i.toString(), ",", "0,0,FAILED:Unknown"));
            }
        }

        slog("");
        slog("=== Analysis Complete ===");
    }

    function testHarvestFullCycleGasUsageAnalysis() public {
        slog("=== Ern Harvest Full Cycle Gas Usage Analysis ===");
        slog("");

        // Header for CSV-like output
        slog("Users,GasUsed,GasPerUser,Status");

        for (uint256 i = 1; i <= 50; i++) {
            ErnWithPendingQueue bY = new ErnWithPendingQueue(
                ERC20(address(usdc)), // underlying
                ERC20(address(wbtc)), // wbtc
                mockAavePool, // aavePool (cast to IAavePool)
                mockDex // dex
            );

            _setupUsers(bY, i);

            vm.startSnapshotGas("harvest_initial");
            try bY.harvest(0) {
                uint256 gasUsed = vm.stopSnapshotGas("harvest_initial");
                uint256 gasPerUser = gasUsed / i;

                slog(
                    string.concat(
                        "INITIAL,", i.toString(), ",", gasUsed.toString(), ",", gasPerUser.toString(), ",", "SUCCESS"
                    )
                );
            } catch Error(string memory reason) {
                vm.stopSnapshotGas("harvest_initial");
                slog(string.concat("INITIAL,", i.toString(), ",", "0,0,FAILED:", reason));
            } catch {
                vm.stopSnapshotGas("harvest_initial");
                slog(string.concat("INITIAL,", i.toString(), ",", "0,0,FAILED:Unknown"));
            }

            // Simulate yield generation by adding some yield to Aave
            uint256 yieldAmount = (i * SMALL_DEPOSIT * 5) / 100; // 5% yield
            mockAavePool.simulateYield(address(aUSDC), address(bY), yieldAmount);

            _setupUsers(bY, i);

            // CYCLE 2: Harvest with yield + new pending deposits
            vm.startSnapshotGas("harvest_with_yield");
            try bY.harvest(0) {
                uint256 gasUsed = vm.stopSnapshotGas("harvest_with_yield");
                uint256 gasPerUser = gasUsed / i;

                slog(
                    string.concat(
                        "YIELD,", i.toString(), ",", gasUsed.toString(), ",", gasPerUser.toString(), ",", "SUCCESS"
                    )
                );
            } catch Error(string memory reason) {
                vm.stopSnapshotGas("harvest_with_yield");
                slog(string.concat("YIELD,", i.toString(), ",", "0,0,FAILED:", reason));
            } catch {
                vm.stopSnapshotGas("harvest_with_yield");
                slog(string.concat("YIELD,", i.toString(), ",", "0,0,FAILED:Unknown"));
            }

            yieldAmount = (i * SMALL_DEPOSIT * 5) / 100; // 5% yield
            mockAavePool.simulateYield(address(aUSDC), address(bY), yieldAmount);

            _removeUsers(bY, i);

            // CYCLE 3: Harvest with pending withdrawals
            vm.startSnapshotGas("harvest_withdrawals");
            try bY.harvest(0) {
                uint256 gasUsed = vm.stopSnapshotGas("harvest_withdrawals");
                uint256 gasPerUser = gasUsed / i;

                slog(
                    string.concat(
                        "WITHDRAW,", i.toString(), ",", gasUsed.toString(), ",", gasPerUser.toString(), ",", "SUCCESS"
                    )
                );
            } catch Error(string memory reason) {
                vm.stopSnapshotGas("harvest_withdrawals");
                slog(string.concat("WITHDRAW,", i.toString(), ",", "0,0,FAILED:", reason));
            } catch {
                vm.stopSnapshotGas("harvest_withdrawals");
                slog(string.concat("WITHDRAW,", i.toString(), ",", "0,0,FAILED:Unknown"));
            }
        }

        slog("");
        slog("=== Analysis Complete ===");
    }

    function _setupUsers(ErnWithPendingQueue bY, uint256 nUsers) private {
        uint256 startingId = 0x1000; // Use uint256 instead of bytes32

        for (uint256 i = 0; i < nUsers; i++) {
            address user = address(uint160(startingId + i));

            // Give user tokens and approve
            usdc.mint(user, SMALL_DEPOSIT);
            vm.startPrank(user);
            usdc.approve(address(bY), type(uint256).max);
            bY.deposit(SMALL_DEPOSIT);
            vm.stopPrank();
        }

        // Advance time to meet harvest conditions
        vm.warp(block.timestamp + 1 days);
    }

    function _removeUsers(ErnWithPendingQueue bY, uint256 nUsers) private {
        uint256 startingId = 0x1000; // Use uint256 instead of bytes32

        for (uint256 i = 0; i < nUsers; i++) {
            address user = address(uint160(startingId + i));

            vm.startPrank(user);
            bY.withdraw(bY.balanceOf(user));
            vm.stopPrank();
        }

        // Advance time to meet harvest conditions
        vm.warp(block.timestamp + 1 days);
    }
}
