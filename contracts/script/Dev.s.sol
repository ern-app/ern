// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {StdCheats} from "forge-std/StdCheats.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {Shared} from "./Shared.sol";
import {Ern} from "../src/Ern.sol";

import {MockDex} from "../test/mocks/MockDex.sol";
import {MockUSDC} from "../test/mocks/MockUSDC.sol";
import {MockUSDT} from "../test/mocks/MockUSDT.sol";
import {MockWBTC} from "../test/mocks/MockWBTC.sol";
import {MockAavePool, MockAToken} from "../test/mocks/MockAavePool.sol";
import {MockAaveAddressesProvider} from "../test/mocks/MockAaveAddressesProvider.sol";
import {Accounts} from "../test/utils/Accounts.sol";
import {MockChainlinkOracle} from "../test/mocks/MockChainlinkOracle.sol";
import {Multicall3} from "../test/Multicall3.sol";

contract Dev is Shared, StdCheats {
    address public deployer;

    uint256 constant INITIAL_USDC_BALANCE = 100_000e6; // 100k USDC per user

    uint256 constant DEX_USDC_LIQUIDITY = 10_000_000e6; // 10M USDC for DEX liquidity
    uint256 constant DEX_USDT_LIQUIDITY = 10_000_000e6; // 10M USDC for DEX liquidity
    uint256 constant DEX_WBTC_LIQUIDITY = 250e8; // 250 WBTC for DEX liquidity

    uint256 constant POOL_USDC_LIQUIDITY = 10_000_000e6; // 10M USDC for DEX liquidity
    uint256 constant POOL_USDT_LIQUIDITY = 10_000_000e6; // 10M USDC for DEX liquidity

    uint256 constant USDC_TO_WBTC_RATE = 8_500_000_000_000; // 1 USDC = 0.0000085 WBTC (~$120k BTC)
    uint256 constant USDT_TO_WBTC_RATE = 8_500_000_000_000; // 1 USDC = 0.0000085 WBTC (~$120k BTC)

    address constant HARVESTER = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;

    struct Mocks {
        MockDex dex;
        MockAaveAddressesProvider aaveAddresses;
        MockAavePool aavePool;
        MockAToken aUSDC;
        MockAToken aUSDT;
    }

    function run() public {
        Accounts anvilAccounts = new Accounts();

        (Contracts memory contracts, Mocks memory mocks) = deploy();
        setupLiquidity(contracts, mocks);
        fundAnvilAccounts(anvilAccounts, contracts);
        makeDeposits(contracts, mocks, anvilAccounts);
        output(contracts);
    }

    function deploy() internal returns (Contracts memory contracts, Mocks memory mocks) {
        vm.startBroadcast();
        contracts.usdc = address(new MockUSDC());
        contracts.usdt = address(new MockUSDT());
        contracts.wbtc = address(new MockWBTC());
        mocks.aUSDC = new MockAToken("Aave USDC", "aUSDC");
        mocks.aUSDT = new MockAToken("Aave USDT", "aUSDT");
        mocks.aavePool = new MockAavePool();
        mocks.aaveAddresses = new MockAaveAddressesProvider();
        mocks.aaveAddresses.setPool(address(mocks.aavePool));
        mocks.dex = new MockDex();
        contracts.oracleUSDC = address(new MockChainlinkOracle(int256(1e8 - 1)));
        contracts.oracleUSDT = address(new MockChainlinkOracle(int256(1e8 - 2)));
        contracts.oracleWBTC = address(new MockChainlinkOracle(int256(112_754e8)));
        contracts.multicall = address(new Multicall3());

        mocks.aavePool.setAToken(address(contracts.usdc), address(mocks.aUSDC));
        mocks.aavePool.setAToken(address(contracts.usdt), address(mocks.aUSDT));

        mocks.dex.setBidirectionalRate(address(contracts.usdc), address(contracts.wbtc), USDC_TO_WBTC_RATE);
        mocks.dex.setBidirectionalRate(address(contracts.usdt), address(contracts.wbtc), USDT_TO_WBTC_RATE);

        MockWBTC(contracts.wbtc).mint(address(mocks.dex), DEX_WBTC_LIQUIDITY);
        MockUSDC(contracts.usdc).mint(address(mocks.dex), DEX_USDC_LIQUIDITY);
        MockUSDT(contracts.usdc).mint(address(mocks.dex), DEX_USDT_LIQUIDITY);

        MockUSDC(contracts.usdc).mint(address(mocks.aavePool), POOL_USDC_LIQUIDITY);
        MockUSDT(contracts.usdt).mint(address(mocks.aavePool), POOL_USDT_LIQUIDITY);

        contracts.ernUSDC =
            new Ern(ERC20(address(contracts.usdc)), ERC20(address(contracts.wbtc)), mocks.aaveAddresses, mocks.dex);

        contracts.ernUSDT =
            new Ern(ERC20(address(contracts.usdt)), ERC20(address(contracts.wbtc)), mocks.aaveAddresses, mocks.dex);

        contracts.ernUSDC.addHarvester(HARVESTER);
        contracts.ernUSDT.addHarvester(HARVESTER);
        vm.stopBroadcast();
    }

    function setupLiquidity(Contracts memory contracts, Mocks memory mocks) internal {
        mocks.aavePool.setAToken(address(contracts.usdc), address(mocks.aUSDC));
        mocks.aavePool.setAToken(address(contracts.usdt), address(mocks.aUSDT));
    }

    function fundAnvilAccounts(Accounts accounts, Contracts memory contracts) internal {
        vm.startBroadcast();
        for (uint256 i = 0; i < accounts.getAccountsCount(); i++) {
            address account = vm.addr(uint256(accounts.accountsPks(i)));
            MockUSDC(contracts.usdc).mint(account, INITIAL_USDC_BALANCE);
            MockUSDT(contracts.usdt).mint(account, INITIAL_USDC_BALANCE);
        }
        vm.stopBroadcast();
    }

    function makeDeposits(Contracts memory contracts, Mocks memory mocks, Accounts accounts) internal {
        vm.startBroadcast(accounts.accountsPks(0));

        // make a USDC deposit
        MockUSDC(contracts.usdc).approve(address(contracts.ernUSDC), 50_000e6);
        contracts.ernUSDC.deposit(50_000e6);
        // mocks.aavePool.simulateYield(address(mocks.aUSDC), address(contracts.ernUSDC), 20_000e6);

        // make a USDC deposit
        MockUSDT(contracts.usdt).approve(address(contracts.ernUSDT), 45_000e6);
        contracts.ernUSDT.deposit(45_000e6);
        // mocks.aavePool.simulateYield(address(mocks.aUSDT), address(contracts.ernUSDT), 18_000e6);

        vm.stopBroadcast();
    }
}
