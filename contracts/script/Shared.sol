// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {Script} from "forge-std/Script.sol";
import {Ern} from "../src/Ern.sol";

contract Shared is Script {
    struct Contract {
        string name;
        address addr;
    }

    struct Contracts {
        Ern ernUSDC;
        Ern ernUSDT;
        address usdc;
        address usdt;
        address wbtc;
        address oracleUSDC;
        address oracleUSDT;
        address oracleWBTC;
        address multicall;
    }

    function output(Contracts memory contracts) internal {
        string memory file = string.concat("./packages/wagmi/contracts/", vm.toString(block.chainid), ".ts");

        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeFile(file, "import { getAddress } from \"viem\";\n");
        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeLine(file, "");
        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeLine(file, "export default {");
        writeContractLine(file, "ernUSDC", address(contracts.ernUSDC));
        writeContractLine(file, "ernUSDT", address(contracts.ernUSDT));
        writeContractLine(file, "USDC", contracts.usdc);
        writeContractLine(file, "USDT", contracts.usdt);
        writeContractLine(file, "wBTC", contracts.wbtc);
        writeContractLine(file, "oracleUSDC", contracts.oracleUSDC);
        writeContractLine(file, "oracleUSDT", contracts.oracleUSDT);
        writeContractLine(file, "oracleWBTC", contracts.oracleWBTC);
        writeContractLine(file, "multicall", contracts.multicall);
        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeLine(file, "};");
    }

    function writeContractLine(string memory file, string memory name, address addr) internal {
        // forge-lint: disable-next-line(unsafe-cheatcode)
        vm.writeLine(file, string.concat("  ", name, ": getAddress(\"", vm.toString(addr), "\"),"));
    }
}
