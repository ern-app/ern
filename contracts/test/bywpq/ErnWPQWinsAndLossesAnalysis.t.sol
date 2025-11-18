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

contract ErnWPQWinsAndLossesAnalysis is Logging, TestAccounts {
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

    function testGenerateRandomWPQBehaviour() public {
        slog("=== Ern Random Behavior Analysis ===");
        slog("Generating 500 random actions with daily yield simulation...");
        slog("");

        // Setup: Initial deposits for users to have some positions
        _setupInitialDeposits();

        uint256 nInteractions = 1000;
        bytes32 seed = keccak256(abi.encodePacked(block.timestamp + 2, block.prevrandao));

        _logStateCSVHeader();
        _logInitialState();

        for (uint256 i = 0; i < nInteractions; i++) {
            seed = keccak256(abi.encodePacked(seed, i));
            _performRandomAction(seed, i + 1);
        }

        _fullRoundHarvest(nInteractions + 1);
        _logStateCSV("Final State full harvest");
        slog("=== Analysis Complete ===");
        string memory completionMsg = string.concat("CSV data generated for ", nInteractions.toString(), " actions");
        slog(completionMsg);
    }

    function _performRandomAction(bytes32 seed, uint256 actionNumber) internal {
        // Advance time randomly (4, 8, 16, or 24 hours)
        uint256 timeAdvance = _getRandomTimeAdvance(seed);
        vm.warp(block.timestamp + timeAdvance);
        hoursPassed += timeAdvance / 1 hours;

        // Determine if harvest is possible and likely
        bool canHarvest = _canOwnerHarvest();
        uint256 actionSeed = uint256(keccak256(abi.encodePacked(seed, "action")));
        string memory actionMessage;
        if (canHarvest) {
            // 90% chance to harvest when possible
            // Simulate daily yield (5% of total supply)
            _simulateDailyYield();
            actionMessage = _performHarvest(actionNumber);
        } else {
            // Perform other actions with specified probabilities
            bytes32 userActionSeed = keccak256(abi.encodePacked(actionSeed, "userAction"));
            actionMessage = _performUserAction(userActionSeed, actionNumber);
        }

        _logStateCSV(actionMessage);
    }

    function _setupInitialDeposits() internal {
        slog("Setting up initial user deposits...");

        // Give users some initial positions
        _performDeposit(A, MEDIUM_DEPOSIT); // User A: 10k USDC
        _performDeposit(B, SMALL_DEPOSIT); // User B: 1k USDC
        _performDeposit(C, LARGE_DEPOSIT); // User C: 25k USDC
        _performDeposit(D, SMALL_DEPOSIT); // User D: 1k USDC

        // Wait for lock period to expire for testing
        vm.warp(block.timestamp + 8 days);

        slog("Initial deposits completed. Users unlocked.");
    }

    function _getRandomTimeAdvance(bytes32 seed) internal pure returns (uint256) {
        uint256 timeSeed = uint256(keccak256(abi.encodePacked(seed, "time"))) % 4;
        if (timeSeed == 0) return 4 hours;
        if (timeSeed == 1) return 8 hours;
        if (timeSeed == 2) return 16 hours;
        return 24 hours; // timeSeed == 3
    }

    function _simulateDailyYield() internal {
        uint256 totalSupply = ern.totalSupply();
        if (totalSupply > 0) {
            uint256 yieldAmount = (totalSupply * 1) / 1000; // 0.1% yield
            mockAavePool.simulateYield(address(aUSDC), address(ern), yieldAmount);
        }

        // Replenish user balances periodically to keep the simulation going
        _replenishUserBalances();
    }

    function _replenishUserBalances() internal {
        // Give users more USDC if they're running low
        address[4] memory users = [A, B, C, D];
        for (uint256 i = 0; i < users.length; i++) {
            if (usdc.balanceOf(users[i]) < SMALL_DEPOSIT) {
                deal(address(usdc), users[i], INITIAL_USDC_BALANCE);
            }
        }
    }

    function _canOwnerHarvest() internal view returns (bool) {
        return block.timestamp >= lastHarvestTime + 24 hours;
    }

    function _performHarvest(uint256 actionNumber) internal returns (string memory) {
        lastHarvestTime = block.timestamp;
        vm.prank(owner);
        try ern.harvest(0) {
            string memory logMessage = string.concat("Action ", actionNumber.toString(), ": Owner harvested");
            slog(logMessage);
            return logMessage;
        } catch {
            string memory logMessage = string.concat("Action ", actionNumber.toString(), ": Owner could not harvest");
            slog(logMessage);
            // Harvest might fail if no yield available, that's ok
            return logMessage;
        }
    }

    function _performUserAction(bytes32 seed, uint256 actionNumber) internal returns (string memory) {
        // Determine action type (Withdraw: 10%, Deposit: 25%, Claim: 65%)
        uint256 actionType = _getRandomActionType(seed);

        // Determine user (A: 40%, B: 25%, C: 25%, D: 10%)
        address user = _getRandomUser(seed);
        string memory userName = _getUserName(user);

        if (actionType == ACTION_WITHDRAW) {
            return _performRandomWithdraw(seed, user, userName, actionNumber);
        } else if (actionType == ACTION_DEPOSIT) {
            return _performRandomDeposit(seed, user, userName, actionNumber);
        } else {
            // ACTION_CLAIM
            return _performRandomClaim(user, userName, actionNumber);
        }
    }

    function _getRandomActionType(bytes32 seed) internal pure returns (uint256) {
        uint256 actionSeed = uint256(keccak256(abi.encodePacked(seed, "actionType"))) % 100;
        if (actionSeed < 10) return ACTION_WITHDRAW; // 10%
        if (actionSeed < 35) return ACTION_DEPOSIT; // 25%
        return ACTION_CLAIM; // 65%
    }

    function _getRandomUser(bytes32 seed) internal view returns (address) {
        uint256 userSeed = uint256(keccak256(abi.encodePacked(seed, "user"))) % 100;
        if (userSeed < 40) return A; // 40%
        if (userSeed < 65) return B; // 25%
        if (userSeed < 90) return C; // 25%
        return D; // 10%
    }

    function _getUserName(address user) internal view returns (string memory) {
        if (user == A) return "A";
        if (user == B) return "B";
        if (user == C) return "C";
        if (user == D) return "D";
        return "Unknown";
    }

    function _performRandomWithdraw(bytes32 seed, address user, string memory userName, uint256 actionNumber)
        internal
        returns (string memory)
    {
        uint256 userShares = ern.balanceOf(user);

        // Determine if partial (50%) or full (100%) withdrawal
        uint256 withdrawSeed = uint256(keccak256(abi.encodePacked(seed, "withdraw"))) % 2;
        uint256 withdrawAmount = withdrawSeed == 0 ? userShares / 2 : userShares;

        if (withdrawAmount == 0) return "No shares to withdraw";

        vm.prank(user);
        try ern.withdraw(withdrawAmount) {
            string memory withdrawType = withdrawSeed == 0 ? "partial" : "full";
            string memory logMessage = string.concat(
                "Action ",
                actionNumber.toString(),
                ": User ",
                userName,
                " ",
                withdrawType,
                " withdrawal (",
                withdrawAmount.decimal6(),
                " shares)"
            );
            slog(logMessage);
            return logMessage;
        } catch {
            // Withdrawal might fail, that's ok
            return "Failed to withdraw shares";
        }
    }

    function _performRandomDeposit(bytes32 seed, address user, string memory userName, uint256 actionNumber)
        internal
        returns (string memory)
    {
        // Check if user has enough balance for any deposit
        uint256 userBalance = usdc.balanceOf(user);
        if (userBalance < SMALL_DEPOSIT) return "Skipping small deposit"; // Skip if not enough for smallest deposit

        // Determine deposit size (Small, Medium, Large with equal probability)
        uint256 depositSeed = uint256(keccak256(abi.encodePacked(seed, "deposit"))) % 3;
        uint256 depositAmount;
        string memory depositSize;

        if (depositSeed == 0) {
            depositAmount = SMALL_DEPOSIT;
            depositSize = "small";
        } else if (depositSeed == 1) {
            depositAmount = MEDIUM_DEPOSIT;
            depositSize = "medium";
        } else {
            depositAmount = LARGE_DEPOSIT;
            depositSize = "large";
        }

        // Adjust deposit amount if user doesn't have enough balance
        if (depositAmount > userBalance) {
            if (userBalance >= MEDIUM_DEPOSIT) {
                depositAmount = MEDIUM_DEPOSIT;
                depositSize = "medium";
            } else if (userBalance >= SMALL_DEPOSIT) {
                depositAmount = SMALL_DEPOSIT;
                depositSize = "small";
            } else {
                return "Not enough balance for any meaningful deposit"; // Not enough balance for any meaningful deposit
            }
        }

        _performDeposit(user, depositAmount);
        string memory logMessage = string.concat(
            "Action ",
            actionNumber.toString(),
            ": User ",
            userName,
            " ",
            depositSize,
            " deposit (",
            depositAmount.decimal6(),
            " USDC)"
        );
        slog(logMessage);
        return logMessage;
    }

    function _performRandomClaim(address user, string memory userName, uint256 actionNumber)
        internal
        returns (string memory)
    {
        uint256 claimable = ern.claimableYield(user);
        if (claimable == 0) return "No claimable yield";

        try vm.prank(user) {
            ern.claimYield();
        } catch {
            // Claim might fail, that's ok
            return "Failed to claim yield";
        }

        string memory logMessage = string.concat(
            "Action ", actionNumber.toString(), ": User ", userName, " claimed yield (", claimable.decimal8(), " WBTC)"
        );
        slog(logMessage);
        return logMessage;
    }

    function _performDeposit(address user, uint256 amount) internal {
        vm.prank(user);
        ern.deposit(amount);
    }

    function _logStateCSVHeader() internal {
        string memory TIMESTAMP = '"Action","Timestamp","Hours Passed",';
        string memory BY_PART = '"Total Shares","Pool usdc","BY aUSDC","BY WBTC","Cumulative/Share","Owner WBTC",';
        string memory USER_SHARES = '"A Shares","B Shares","C Shares","D Shares",';
        string memory USER_WBTC = '"A WBTC","B WBTC","C WBTC","D WBTC"\n';
        // slog(string.concat(TIMESTAMP, BY_PART, USER_SHARES, USER_WBTC));
        vm.writeFile("activityWPQRun.csv", string.concat(TIMESTAMP, BY_PART, USER_SHARES, USER_WBTC));
    }

    function _logInitialState() internal {
        slog("=== Initial State ===");
        _logStateCSV("Initial State");
    }

    function _fullRoundHarvest(uint256 actionNumber) internal {
        slog(string.concat("Action ", actionNumber.toString(), ": Full Round Harvest"));
        vm.prank(A);
        try ern.claimYield() {} catch {}
        vm.prank(B);
        try ern.claimYield() {} catch {}
        vm.prank(C);
        try ern.claimYield() {} catch {}
        vm.prank(D);
        try ern.claimYield() {} catch {}
    }

    function _logStateCSV(string memory action) public {
        string memory timestamp = string.concat(block.timestamp.toString(), ",", hoursPassed.toString(), ",");

        string memory byPart = string.concat(
            ern.totalSupply().toString(),
            ",",
            usdc.balanceOf(address(mockAavePool)).decimal6(),
            ",",
            aUSDC.balanceOf(address(ern)).decimal6(),
            ",",
            wbtc.balanceOf(address(ern)).decimal8(),
            ",",
            ern.cumulativeWbtcPerShare().toString(),
            ",",
            wbtc.balanceOf(address(owner)).decimal8(),
            ","
        );

        string memory userShares = string.concat(
            ern.balanceOf(A).toString(),
            ",",
            ern.balanceOf(B).toString(),
            ",",
            ern.balanceOf(C).toString(),
            ",",
            ern.balanceOf(D).toString(),
            ","
        );

        string memory userWBTC = string.concat(
            wbtc.balanceOf(A).decimal8(),
            ",",
            wbtc.balanceOf(B).decimal8(),
            ",",
            wbtc.balanceOf(C).decimal8(),
            ",",
            wbtc.balanceOf(D).decimal8(),
            ","
        );

        string memory userClaimable = string.concat(
            ern.claimableYield(A).decimal8(),
            ",",
            ern.claimableYield(B).decimal8(),
            ",",
            ern.claimableYield(C).decimal8(),
            ",",
            ern.claimableYield(D).decimal8()
        );

        // slog(string.concat(timestamp, byPart, userShares, userWBTC));
        vm.writeLine(
            "activityWPQRun.csv",
            string.concat("\"", action, "\",", timestamp, byPart, userShares, userWBTC, userClaimable)
        );
    }
}
