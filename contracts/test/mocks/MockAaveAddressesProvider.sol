// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import {IAaveAddressesProvider} from "../../src/interfaces/IAaveAddressesProvider.sol";
import {IAavePool} from "../../src/interfaces/IAavePool.sol";

contract MockAaveAddressesProvider is IAaveAddressesProvider {
    IAavePool public POOL;

    constructor() {}

    function setPool(address _pool) external {
        POOL = IAavePool(_pool);
    }

    function getPool() external view returns (IAavePool) {
        return POOL;
    }
}
