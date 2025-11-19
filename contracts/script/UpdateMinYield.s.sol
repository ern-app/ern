// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {Ern} from "../src/Ern.sol";

/**
 * @title UpdateMinYield
 * @notice Script to update minYieldAmount parameter on deployed Ern contracts
 * @dev This script calls setMinYieldAmount on both USDC and USDT Ern contracts
 *
 * Usage (Mainnet):
 *   forge script script/UpdateMinYield.s.sol --broadcast --rpc-url mainnet --verify
 *
 * Dry run (no broadcast):
 *   forge script script/UpdateMinYield.s.sol --rpc-url mainnet
 */
contract UpdateMinYield is Script {
    // Mainnet Ern contract addresses (from frontend/lib/wagmi/1.ts)
    address constant ERN_USDC = 0x226455A82E30Ff05E68B37b99C59e503104bA84B;
    address constant ERN_USDT = 0x87f0E6f65CCf64d6D504C9DB95F390d2aCb033B5;

    // New minimum yield amount: $1 (1e6 for 6-decimal stablecoins)
    uint256 constant NEW_MIN_YIELD_AMOUNT = 1e6;

    function run() public {
        console.log("=== Updating minYieldAmount ===");
        console.log("Target value: $1 (1e6)");
        console.log("");

        vm.startBroadcast();

        // Get Ern contract instances
        Ern ernUSDC = Ern(ERN_USDC);
        Ern ernUSDT = Ern(ERN_USDT);

        // Log current values
        console.log("USDC Ern Contract:", ERN_USDC);
        console.log("Current minYieldAmount:", ernUSDC.minYieldAmount());

        console.log("");
        console.log("USDT Ern Contract:", ERN_USDT);
        console.log("Current minYieldAmount:", ernUSDT.minYieldAmount());
        console.log("");

        // Update minYieldAmount for both contracts
        console.log("Updating USDC minYieldAmount to", NEW_MIN_YIELD_AMOUNT);
        ernUSDC.setMinYieldAmount(NEW_MIN_YIELD_AMOUNT);

        console.log("Updating USDT minYieldAmount to", NEW_MIN_YIELD_AMOUNT);
        ernUSDT.setMinYieldAmount(NEW_MIN_YIELD_AMOUNT);

        console.log("");
        console.log("=== Update Complete ===");

        // Verify new values
        console.log("USDC new minYieldAmount:", ernUSDC.minYieldAmount());
        console.log("USDT new minYieldAmount:", ernUSDT.minYieldAmount());

        vm.stopBroadcast();
    }
}
