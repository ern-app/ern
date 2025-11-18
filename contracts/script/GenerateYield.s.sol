// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {Ern} from "../src/Ern.sol";
import {MockAavePool, MockAToken} from "../test/mocks/MockAavePool.sol";

/**
 * @title GenerateYield
 * @notice Script to generate yield on demand for testing Ern harvesting
 * @dev This script simulates yield generation by minting aTokens to Ern contracts
 *
 * Usage:
 *   forge script script/GenerateYield.s.sol --broadcast --rpc-url http://localhost:8545
 *
 * With custom yield amount:
 *   forge script script/GenerateYield.s.sol --broadcast --rpc-url http://localhost:8545 --sig "run(uint256)" 50000000000
 */
contract GenerateYield is Script {
    // Default yield amounts (can be overridden)
    uint256 public constant DEFAULT_USDC_YIELD = 500e6; // 500 USDC
    uint256 public constant DEFAULT_USDT_YIELD = 400e6; // 400 USDT

    // Ern contract addresses from wagmi deployment file
    address constant ERN_USDC = 0xc6e7DF5E7b4f2A278906862b61205850344D4e7d;
    address constant ERN_USDT = 0x59b670e9fA9D0A427751Af201D676719a970857b;

    function run() public {
        run(DEFAULT_USDC_YIELD, DEFAULT_USDT_YIELD);
    }

    function run(uint256 yieldAmount) public {
        run(yieldAmount, yieldAmount);
    }

    function run(uint256 usdcYieldAmount, uint256 usdtYieldAmount) public {
        vm.startBroadcast();

        // Get contract addresses dynamically from Ern contracts
        Ern ernUSDC = Ern(ERN_USDC);
        Ern ernUSDT = Ern(ERN_USDT);

        address aavePool = address(ernUSDC.getAavePool());
        address aUSDC = address(ernUSDC.getAaveUnderlying());
        address aUSDT = address(ernUSDT.getAaveUnderlying());

        console.log("=== Generating Yield On Demand ===");
        console.log("Ern USDC Contract:", ERN_USDC);
        console.log("Ern USDT Contract:", ERN_USDT);
        console.log("Aave Pool:", aavePool);
        console.log("aUSDC Token:", aUSDC);
        console.log("aUSDT Token:", aUSDT);
        console.log("USDC Yield Amount:", usdcYieldAmount);
        console.log("USDT Yield Amount:", usdtYieldAmount);

        // Check current balances before yield generation
        uint256 usdcBalanceBefore = MockAToken(aUSDC).balanceOf(ERN_USDC);
        uint256 usdtBalanceBefore = MockAToken(aUSDT).balanceOf(ERN_USDT);

        console.log("=== Before Yield Generation ===");
        console.log("USDC aToken balance:", usdcBalanceBefore);
        console.log("USDT aToken balance:", usdtBalanceBefore);

        // Generate yield for USDC Ern contract
        if (usdcYieldAmount > 0) {
            console.log("Generating", usdcYieldAmount, "USDC yield...");
            MockAavePool(aavePool).simulateYield(aUSDC, ERN_USDC, usdcYieldAmount);
        }

        // Generate yield for USDT Ern contract
        if (usdtYieldAmount > 0) {
            console.log("Generating", usdtYieldAmount, "USDT yield...");
            MockAavePool(aavePool).simulateYield(aUSDT, ERN_USDT, usdtYieldAmount);
        }

        // Check balances after yield generation
        uint256 usdcBalanceAfter = MockAToken(aUSDC).balanceOf(ERN_USDC);
        uint256 usdtBalanceAfter = MockAToken(aUSDT).balanceOf(ERN_USDT);

        console.log("=== After Yield Generation ===");
        console.log("USDC aToken balance:", usdcBalanceAfter);
        console.log("USDT aToken balance:", usdtBalanceAfter);
        console.log("USDC yield added:", usdcBalanceAfter - usdcBalanceBefore);
        console.log("USDT yield added:", usdtBalanceAfter - usdtBalanceBefore);

        // Check if contracts can harvest
        (bool canHarvestUSDC, uint256 usdcYield) = ernUSDC.canHarvest();
        (bool canHarvestUSDT, uint256 usdtYield) = ernUSDT.canHarvest();

        console.log("=== Harvest Status ===");
        console.log("USDC can harvest:", canHarvestUSDC);
        console.log("USDC harvestable yield:", usdcYield);
        console.log("USDT can harvest:", canHarvestUSDT);
        console.log("USDT harvestable yield:", usdtYield);

        console.log("=== Yield Generation Complete ===");
        console.log("Bot should now be able to harvest the generated yield!");

        vm.stopBroadcast();
    }

    /**
     * @notice Generate yield for USDC Ern contract only
     * @param yieldAmount Amount of USDC yield to generate
     */
    function generateUSDCYield(uint256 yieldAmount) public {
        vm.startBroadcast();

        Ern ernUSDC = Ern(ERN_USDC);
        address aavePool = address(ernUSDC.getAavePool());
        address aUSDC = address(ernUSDC.getAaveUnderlying());

        console.log("Generating", yieldAmount, "USDC yield for Ern USDC contract...");
        MockAavePool(aavePool).simulateYield(aUSDC, ERN_USDC, yieldAmount);

        (bool canHarvest, uint256 harvestableYield) = ernUSDC.canHarvest();
        console.log("Can harvest:", canHarvest);
        console.log("Harvestable yield:", harvestableYield);

        vm.stopBroadcast();
    }

    /**
     * @notice Generate yield for USDT Ern contract only
     * @param yieldAmount Amount of USDT yield to generate
     */
    function generateUSDTYield(uint256 yieldAmount) public {
        vm.startBroadcast();

        Ern ernUSDT = Ern(ERN_USDT);
        address aavePool = address(ernUSDT.getAavePool());
        address aUSDT = address(ernUSDT.getAaveUnderlying());

        console.log("Generating", yieldAmount, "USDT yield for Ern USDT contract...");
        MockAavePool(aavePool).simulateYield(aUSDT, ERN_USDT, yieldAmount);

        (bool canHarvest, uint256 harvestableYield) = ernUSDT.canHarvest();
        console.log("Can harvest:", canHarvest);
        console.log("Harvestable yield:", harvestableYield);

        vm.stopBroadcast();
    }
}

