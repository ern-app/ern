// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Shared} from "./Shared.sol";

import {IDex} from "../src/interfaces/IDex.sol";
import {IAavePool} from "../src/interfaces/IAavePool.sol";
import {IAaveAddressesProvider} from "../src/interfaces/IAaveAddressesProvider.sol";
import {Ern} from "../src/Ern.sol";

contract Mainnet is Shared {
    address public deployer;

    IAaveAddressesProvider aaveAddresses = IAaveAddressesProvider(0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e);
    IAavePool aavePool = IAavePool(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2);
    IDex dex = IDex(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    ERC20 wbtc = ERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
    ERC20 usdc = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    ERC20 usdt = ERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);

    address wbtcOracle = 0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c;
    address usdtOracle = 0x3E7d1eAB13ad0104d2750B8863b489D65364e32D;
    address usdcOracle = 0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6;

    address harvester = 0xAFdB4EefD19314133780DDa7883F6D886225e892;

    function run() external {
        require(aaveAddresses.getPool() == aavePool);

        Contracts memory contracts;
        contracts.usdc = address(usdc);
        contracts.usdt = address(usdt);
        contracts.wbtc = address(wbtc);
        contracts.oracleUSDC = usdcOracle;
        contracts.oracleUSDT = usdtOracle;
        contracts.oracleWBTC = wbtcOracle;

        vm.startBroadcast();
        contracts.ernUSDC = new Ern(usdc, wbtc, aaveAddresses, dex);
        contracts.ernUSDT = new Ern(usdt, wbtc, aaveAddresses, dex);
        contracts.ernUSDC.addHarvester(harvester);
        contracts.ernUSDT.addHarvester(harvester);
        vm.stopBroadcast();

        output(contracts);
    }
}
