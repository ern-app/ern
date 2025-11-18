// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Strings} from "openzeppelin-contracts/contracts/utils/Strings.sol";

import {Ern} from "../src/Ern.sol";
import {IDex} from "../src/interfaces/IDex.sol";
import {IAavePool} from "../src/interfaces/IAavePool.sol";
import {IAaveAddressesProvider} from "../src/interfaces/IAaveAddressesProvider.sol";
import {TestAccounts} from "./utils/TestAccounts.sol";
import {Logging} from "./utils/Logging.sol";
import {StringFormatting} from "./utils/StringFormatting.sol";

contract ErnBaseForkTest is TestAccounts, Logging {
    using Strings for uint256;
    using StringFormatting for uint256;
    using StringFormatting for string;
    using StringFormatting for bytes;

    // Contracts
    Ern public ern;

    // Tokens
    IAavePool aavePool = IAavePool(0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2);
    IAaveAddressesProvider aaveAddresses = IAaveAddressesProvider(0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e);
    IDex dex = IDex(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    ERC20 wbtc = ERC20(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599);
    ERC20 usdc = ERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    ERC20 aUSDC;

    // Test accounts
    address public owner = address(0x1);
    // Test constants
    uint256 public constant INITIAL_USDC_BALANCE = 100_000e6; // 100k USDC per user

    // Common test amounts
    uint256 public constant SMALL_DEPOSIT = 1_000e6; // 1k USDC
    uint256 public constant MEDIUM_DEPOSIT = 10_000e6; // 10k USDC
    uint256 public constant LARGE_DEPOSIT = 25_000e6; // 25k USDC
    uint256 public constant PARTIAL_WITHDRAW = 15_000e6; // 15k USDC

    // Test addresses
    address public constant TEST_RECEIVER = address(0x999);

    function setUp() public virtual {
        // Warp to a realistic timestamp to avoid edge case with timestamp=1
        try vm.envString("MAINNET_RPC_URL") returns (string memory rpcUrl) {
            uint256 forkId = vm.createFork(rpcUrl);
            vm.rollFork(forkId, 22_930_454); // cache to make fork tests faster
            vm.selectFork(forkId);
        } catch {
            vm.skip(true);
        }

        setupAccounts();

        vm.label(address(wbtc), "WBTC");
        vm.label(address(usdc), "USDC");
        vm.label(owner, "Owner");
        vm.label(address(aavePool), "Aave Pool");
        vm.label(address(dex), "Swap Router");

        aUSDC = ERC20(aavePool.getReserveAToken(address(usdc)));

        // Deploy mock contracts as owner
        vm.prank(owner);

        // Deploy Ern contract
        ern = new Ern(
            ERC20(address(usdc)), // underlying
            ERC20(address(wbtc)), // wbtc
            aaveAddresses, // aavePool (cast to IAavePool)
            dex // dex
        );

        // Give users USDC
        for (uint256 i = 0; i < accountsList.length; i++) {
            deal(address(usdc), accountsList[i], INITIAL_USDC_BALANCE);
            vm.prank(accountsList[i]);
            usdc.approve(address(ern), type(uint256).max);
        }
    }

    function testTokenNameAndSymbol() public view {
        assertEq(ern.name(), "ern Aave Ethereum USDC to Wrapped BTC");
        assertEq(ern.symbol(), "ern-aEthUSDC-WBTC");
    }

    function testSetup() public view {
        // Basic setup verification
        assertEq(ern.owner(), owner, "Owner should be set correctly");
        assertEq(address(ern.UNDERLYING()), address(usdc), "Underlying should be USDC");
        assertEq(address(ern.REWARD_TOKEN()), address(wbtc), "WBTC should be set correctly");
        assertEq(ern.harvestFee(), 500, "Default fee should be 5%");
        assertEq(ern.lockPeriod(), 48 hours, "Lock period should be 48 hours");

        // Check user balances for TestAccounts
        for (uint256 i = 0; i < accountsList.length; i++) {
            assertEq(usdc.balanceOf(accountsList[i]), INITIAL_USDC_BALANCE, "User should have USDC");
        }

        slog("All setup checks passed!");
    }
}
