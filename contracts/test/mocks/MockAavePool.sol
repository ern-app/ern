// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IAavePool} from "../../src/interfaces/IAavePool.sol";

/**
 * @title MockAavePool
 * @notice Simplified mock of Aave V3 Pool for testing
 * @dev Only implements the minimal functions needed for Ern testing
 */
contract MockAavePool is IAavePool {
    // Mapping from underlying asset to aToken
    mapping(address => address) public aTokens;

    /**
     * @notice Set the aToken address for an underlying asset
     * @param asset Underlying asset address
     * @param aToken Corresponding aToken address
     */
    function setAToken(address asset, address aToken) external {
        aTokens[asset] = aToken;
    }

    function getReserveAToken(address asset) external view returns (address) {
        return aTokens[asset];
    }

    /**
     * @notice Supply assets to Aave (mint aTokens 1:1)
     * @param asset The address of the underlying asset to supply
     * @param amount The amount to be supplied
     * @param onBehalfOf The address that will receive the aTokens
     */
    function supply(address asset, uint256 amount, address onBehalfOf, uint16) external override {
        address aToken = aTokens[asset];
        require(aToken != address(0), "aToken not set");

        // Transfer underlying from user to pool
        IERC20(asset).transferFrom(msg.sender, address(this), amount);

        // Mint aTokens 1:1 to the user
        MockAToken(aToken).mint(onBehalfOf, amount);
    }

    /**
     * @notice Withdraw assets from Aave (burn aTokens and return underlying)
     * @param asset The address of the underlying asset to withdraw
     * @param amount The amount to be withdrawn
     * @param to Address that will receive the underlying
     * @return The final amount withdrawn
     */
    function withdraw(address asset, uint256 amount, address to) external override returns (uint256) {
        address aToken = aTokens[asset];
        require(aToken != address(0), "aToken not set");

        // Burn aTokens from caller
        MockAToken(aToken).burn(msg.sender, amount);

        // Transfer underlying to recipient
        IERC20(asset).transfer(to, amount);

        return amount;
    }

    /**
     * @notice Simulate yield generation by minting extra aTokens
     * @param aToken The aToken to mint yield for
     * @param recipient The address to receive the yield
     * @param yieldAmount The amount of yield to generate
     */
    function simulateYield(address aToken, address recipient, uint256 yieldAmount) external {
        MockAToken(aToken).mint(recipient, yieldAmount);
    }
}

/**
 * @title MockAToken
 * @notice Simple mock aToken that can be minted/burned
 */
contract MockAToken is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        _burn(from, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 6; // Most stablecoins use 6 decimals
    }
}
