// SPDX-License-Identifier: BUSL-1.1

pragma solidity ^0.8.25;

import {IAggregatorV3} from "../../src/interfaces/IAggregatorV3.sol";

contract MockChainlinkOracle is IAggregatorV3 {
    int256 price;

    uint256 lastUpdateTime;

    constructor(int256 _price) {
        setPrice(_price);
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (0, price, 0, lastUpdateTime, 0);
    }

    function setPrice(int256 _price) public {
        price = _price;
    }

    function setUpdatedAt(uint256 _updatedAt) external {
        lastUpdateTime = _updatedAt;
    }
}
