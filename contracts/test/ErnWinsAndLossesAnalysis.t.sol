// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnWinsAndLossesAnalysis is ErnBaseMockTest {
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

    function setUp() public override {
        super.setUp();
        deal(address(usdc), address(mockAavePool), 10_000_000e6);
        lastHarvestTime = block.timestamp;
    }

    function testGenerateRandomBehaviour( /* uint256 z */ ) public {
        // vm.assume(z < type(uint256).max - block.timestamp - 1);
        slog("=== Ern Random Behavior Analysis ===");
        slog("Generating 500 random actions with daily yield simulation...");
        slog("");

        // Setup: Initial deposits for users to have some positions
        _setupInitialDeposits();

        uint256 nInteractions = 2000;
        bytes32 seed = keccak256(abi.encodePacked(block.timestamp + 10, /*z*/ block.prevrandao));

        _logStateCSVHeader();
        _logInitialState();

        for (uint256 i = 0; i < nInteractions; i++) {
            seed = keccak256(abi.encodePacked(seed, i));
            _performRandomAction(seed, i + 1);
        }

        _fullRoundHarvest(nInteractions + 1);
        _logStateCSV();
        slog("=== Analysis Complete ===");
        string memory completionMsg = string.concat("CSV data generated for ", nInteractions.toString(), " actions");
        slog(completionMsg);
    }

    function _performRandomAction(bytes32 seed, uint256 actionNumber) internal {
        // Advance time randomly (4, 8, 16, or 24 hours)
        uint256 timeAdvance = _getRandomTimeAdvance(seed);
        vm.warp(block.timestamp + timeAdvance);
        hoursPassed += timeAdvance / 1 hours;

        // Simulate daily yield (5% of total supply)

        // Determine if harvest is possible and likely
        bool canHarvest = _canOwnerHarvest();
        uint256 actionSeed = uint256(keccak256(abi.encodePacked(seed, "action")));

        if (canHarvest) {
            _simulateDailyYield();
            _performHarvest(actionNumber);
        } else {
            // Perform other actions with specified probabilities
            bytes32 userActionSeed = keccak256(abi.encodePacked(actionSeed, "userAction"));
            _performUserAction(userActionSeed, actionNumber);
        }

        _logStateCSV();
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

    function _performHarvest(uint256 actionNumber) internal {
        lastHarvestTime = block.timestamp;
        vm.prank(owner);
        try ern.harvest(0) {
            string memory logMessage = string.concat("Action ", actionNumber.toString(), ": Owner harvested");
            slog(logMessage);
        } catch {
            string memory logMessage = string.concat("Action ", actionNumber.toString(), ": Owner could not harvest");
            slog(logMessage);
            // Harvest might fail if no yield available, that's ok
        }
    }

    function _performUserAction(bytes32 seed, uint256 actionNumber) internal {
        // Determine action type (Withdraw: 10%, Deposit: 25%, Claim: 65%)
        uint256 actionType = _getRandomActionType(seed);

        // Determine user (A: 40%, B: 25%, C: 25%, D: 10%)
        address user = _getRandomUser(seed);
        string memory userName = _getUserName(user);

        if (actionType == ACTION_WITHDRAW) {
            _performRandomWithdraw(seed, user, userName, actionNumber);
        } else if (actionType == ACTION_DEPOSIT) {
            _performRandomDeposit(seed, user, userName, actionNumber);
        } else {
            // ACTION_CLAIM
            _performRandomClaim(user, userName, actionNumber);
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
    {
        uint256 userShares = ern.balanceOf(user);
        if (userShares == 0 || ern.isLocked(user)) return;

        // Determine if partial (50%) or full (100%) withdrawal
        uint256 withdrawSeed = uint256(keccak256(abi.encodePacked(seed, "withdraw"))) % 2;
        uint256 withdrawAmount = withdrawSeed == 0 ? userShares / 2 : userShares;

        if (withdrawAmount == 0) return;

        try vm.prank(user) {
            ern.withdraw(withdrawAmount);
        } catch {
            // Withdrawal might fail, that's ok
            return;
        }

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
    }

    function _performRandomDeposit(bytes32 seed, address user, string memory userName, uint256 actionNumber) internal {
        // Check if user has enough balance for any deposit
        uint256 userBalance = usdc.balanceOf(user);
        if (userBalance < SMALL_DEPOSIT) return; // Skip if not enough for smallest deposit

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
                return; // Not enough balance for any meaningful deposit
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
    }

    function _performRandomClaim(address user, string memory userName, uint256 actionNumber) internal {
        uint256 claimable = ern.claimableYield(user);
        if (claimable == 0) return;

        try vm.prank(user) {
            ern.claimYield();
        } catch {
            // Claim might fail, that's ok
            return;
        }

        string memory logMessage = string.concat(
            "Action ", actionNumber.toString(), ": User ", userName, " claimed yield (", claimable.decimal8(), " WBTC)"
        );
        slog(logMessage);
    }

    function _logStateCSVHeader() internal {
        string memory TIMESTAMP = '"Timestamp","Hours Passed",';
        string memory BY_PART = '"Total Shares","Pool usdc","BY aUSDC","BY WBTC","Cumulative/Share","Owner WBTC",';
        string memory USER_SHARES = '"A Shares","B Shares","C Shares","D Shares",';
        string memory USER_WBTC = '"A WBTC","B WBTC","C WBTC","D WBTC"\n';
        // slog(string.concat(TIMESTAMP, BY_PART, USER_SHARES, USER_WBTC));
        vm.writeFile("activityRun.csv", string.concat(TIMESTAMP, BY_PART, USER_SHARES, USER_WBTC));
    }

    function _logInitialState() internal {
        slog("=== Initial State ===");
        _logStateCSV();
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

    function _logStateCSV() public {
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
            ern.cumulativeRewardPerShare().toString(),
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
            wbtc.balanceOf(D).decimal8()
        );

        // slog(string.concat(timestamp, byPart, userShares, userWBTC));
        vm.writeLine("activityRun.csv", string.concat(timestamp, byPart, userShares, userWBTC));
    }
}
