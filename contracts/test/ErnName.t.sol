// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {Ern} from "../src/Ern.sol";
import {ErnBaseMockTest} from "./ErnBaseMockTest.t.sol";

contract ErnNameTest is ErnBaseMockTest {
    function testName() public view {
        assertEq(ern.name(), "ern Aave USDC to Wrapped BTC", "wrong name");
    }

    function testSymbol() public view {
        assertEq(ern.symbol(), "ern-aUSDC-WBTC", "wrong symbol");
    }
}
