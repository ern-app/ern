// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IDex} from "@/interfaces/IDex.sol";
import {IAavePool} from "@/interfaces/IAavePool.sol";

contract ErnWithPendingQueue is ERC20, Ownable {
    using SafeERC20 for IERC20;

    /**
     * @notice User information for yield tracking
     * @param lastCumulativeWbtcPerShare Last recorded cumulative WBTC per share for the user
     * @param wbtcClaimed Total amount of WBTC claimed by the user
     */
    struct UserInfo {
        uint256 lastCumulativeWbtcPerShare;
        uint256 wbtcClaimed;
    }

    /**
     * @notice Pending operation information for a user
     * @param netAmount Net amount of pending operations (positive for deposit, negative for withdraw)
     * @param exists Whether the user has pending operations
     */
    struct PendingOperation {
        int256 netAmount;
        bool exists;
    }

    // --- Events ---

    /**
     * @notice Emitted when yield is harvested and converted to WBTC
     * @param underlyingYield Amount of Underlying yield harvested from Aave
     * @param wbtcBought Amount of WBTC received after swapping Underlying yield
     * @param feeTaken Amount of WBTC taken as protocol fee
     * @param cumulativeWbtcPerShare Updated cumulative WBTC per share after harvest
     */
    event Harvest(uint256 underlyingYield, uint256 wbtcBought, uint256 feeTaken, uint256 cumulativeWbtcPerShare);

    /**
     * @notice Emitted when a user claims their WBTC yield
     * @param user Address of the user claiming yield
     * @param amount Amount of WBTC claimed
     */
    event YieldClaimed(address indexed user, uint256 amount);

    /**
     * @notice Emitted when the protocol fee is updated
     * @param newHarvestFee New fee in basis points (1 bp = 0.01%)
     */
    event FeeUpdated(uint256 newHarvestFee);

    /**
     * @notice Emitted when the minimum yield amount is updated
     * @param newMinYieldAmount New minimum yield amount required for harvest
     */
    event MinYieldAmountUpdated(uint256 newMinYieldAmount);

    /**
     * @notice Emitted when the harvest time period is updated
     * @param newHarvestTimePeriod New time period for harvest restriction
     */
    event HarvestTimePeriodUpdated(uint256 newHarvestTimePeriod);

    /**
     * @notice Emitted when a user deposits underlying tokens
     * @param user Address of the user depositing
     * @param amount Amount of underlying tokens deposited
     */
    event Deposit(address indexed user, uint256 amount);

    /**
     * @notice Emitted when a user withdraws underlying tokens
     * @param user Address of the user withdrawing
     * @param amount Amount of underlying tokens withdrawn
     */
    event Withdraw(address indexed user, uint256 amount);

    /**
     * @notice Emitted when pending operations are processed during harvest
     * @param processedCount Number of users processed
     * @param totalNetDeposits Total net deposits processed
     * @param totalNetWithdraws Total net withdrawals processed
     */
    event PendingOperationsProcessed(uint256 processedCount, uint256 totalNetDeposits, uint256 totalNetWithdraws);

    /**
     * @notice Emitted when minimum amounts are updated
     * @param newMinDepositAmount New minimum deposit amount
     * @param newMinWithdrawAmount New minimum withdraw amount
     */
    event MinAmountsUpdated(uint256 newMinDepositAmount, uint256 newMinWithdrawAmount);

    // --- Immutable State ---
    IERC20 public immutable WBTC;
    IAavePool public immutable AAVE_POOL;
    IERC20 public immutable A_UNDERLYING;
    IERC20 public immutable UNDERLYING;
    IDex public immutable DEX;

    // --- Constants ---
    uint256 public constant MAX_HARVEST_FEE_BPS = 1000; // 10% max fee

    // --- Mutable State ---
    uint256 public harvestFee = 500; // 5% default fee
    uint256 public cumulativeWbtcPerShare;
    uint256 public lastHarvest;
    uint256 public minYieldAmount = 10e6; // Minimum yield amount (10 USDC with 6 decimals)
    uint256 public harvestTimePeriod = 24 hours; // Time period for harvest restriction

    // --- Pending Operations State ---
    uint256 public minDepositAmount = 100e6; // Minimum deposit amount (100 USDC)
    uint256 public minWithdrawAmount = 100e6; // Minimum withdraw amount (100 USDC)
    uint256 public maxPendingUsers = 1000; // Maximum pending users for gas safety
    address[] public pendingUsers; // Array of users with pending operations
    mapping(address => PendingOperation) public pendingOperations; // Net pending operations per user

    // --- User Data ---
    mapping(address => UserInfo) public users;

    // --- Errors ---
    error AmountCannotBeZero();
    error HarvestCooldownNotMet();
    error FeeTooHigh();
    error AddressCannotBeZero();
    error TokensAreLocked();
    error NoYieldToClaim();
    error TransferLocked();
    error HarvestConditionsNotMet();
    error MinYieldAmountTooLow();
    error MinYieldAmountTooHigh();
    error HarvestTimePeriodTooShort();
    error HarvestTimePeriodTooLong();
    error InsufficientAllowance();
    error AmountTooSmall();
    error TooManyPendingUsers();
    error InsufficientPendingBalance();

    constructor(ERC20 _underlying, ERC20 _wbtc, IAavePool _aavePool, IDex _dex)
        ERC20(string.concat("Shares of ", _underlying.name()), string.concat("sh", _underlying.symbol()))
        Ownable(msg.sender)
    {
        UNDERLYING = _underlying;
        AAVE_POOL = _aavePool;
        A_UNDERLYING = ERC20(AAVE_POOL.getReserveAToken(address(UNDERLYING)));
        WBTC = _wbtc;
        DEX = _dex;

        // Approve Aave pool to spend underlying tokens
        UNDERLYING.approve(address(_aavePool), type(uint256).max);
        // Approve DEX to spend underlying tokens for harvest swaps
        UNDERLYING.approve(address(_dex), type(uint256).max);

        lastHarvest = block.timestamp;
    }

    // --- View Functions ---

    function totalAssets() external view returns (uint256) {
        return A_UNDERLYING.balanceOf(address(this));
    }

    function claimableYield(address user) external view returns (uint256) {
        return _claimableYield(user);
    }

    function getPendingUsersCount() external view returns (uint256) {
        return pendingUsers.length;
    }

    function getPendingOperation(address user) external view returns (int256 netAmount, bool exists) {
        PendingOperation memory op = pendingOperations[user];
        return (op.netAmount, op.exists);
    }

    function estimateProcessingGas() external view returns (uint256) {
        return pendingUsers.length * 50000; // Rough estimate: 50k gas per user
    }

    // --- State-Changing Functions ---

    function deposit(uint256 amount) external {
        _requireAmountCannotBeZero(amount);
        if (amount < minDepositAmount) revert AmountTooSmall();

        // todo: we could consider only transferring the amount on harvest, but it probably grows the cost too much
        // Transfer underlying tokens from user
        UNDERLYING.safeTransferFrom(msg.sender, address(this), amount);

        // Add to pending operations
        _addToPendingOperations(msg.sender, int256(amount));

        emit Deposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        _requireAmountCannotBeZero(amount);
        if (amount < minWithdrawAmount) revert AmountTooSmall();

        // Check if user has enough shares (including pending operations)
        uint256 currentShares = balanceOf(msg.sender);
        PendingOperation memory pending = pendingOperations[msg.sender];
        int256 effectiveShares = int256(currentShares) + pending.netAmount;

        if (effectiveShares < int256(amount)) revert InsufficientPendingBalance();

        // Add to pending operations (negative for withdraw)
        _addToPendingOperations(msg.sender, -int256(amount));

        emit Withdraw(msg.sender, amount);
    }

    function claimYield() external {
        uint256 claimable = _claimableYield(msg.sender);
        if (claimable == 0) revert NoYieldToClaim();

        // Process yield claim
        _processYield(msg.sender, claimable);
    }

    function _processYield(address user, uint256 amount) internal {
        if (amount == 0) revert NoYieldToClaim();

        // Update user's last cumulative WBTC per share
        users[user].lastCumulativeWbtcPerShare = cumulativeWbtcPerShare;
        users[user].wbtcClaimed += amount;

        // Transfer WBTC to user
        WBTC.safeTransfer(user, amount);

        emit YieldClaimed(user, amount);
    }

    function harvest(uint256 minOut) external onlyOwner {
        uint256 currentBalance = A_UNDERLYING.balanceOf(address(this));
        uint256 totalSharesSupply = totalSupply();

        // Calculate potential yield amount
        uint256 yieldAmount = currentBalance > totalSharesSupply ? currentBalance - totalSharesSupply : 0;

        // Check if harvest conditions are met
        bool yieldSufficient = yieldAmount >= minYieldAmount;
        bool timePassed = block.timestamp >= lastHarvest + harvestTimePeriod;

        if (yieldSufficient || timePassed) {
            _performHarvest(minOut);
            _processPendingOperations(0);
        } else {
            revert HarvestConditionsNotMet();
        }
    }

    function emergencyProcessPending(uint256 maxUsers) external onlyOwner {
        _processPendingOperations(maxUsers);
    }

    function setHarvestFee(uint256 newHarvestFee) external onlyOwner {
        _requireValidFee(newHarvestFee);
        harvestFee = newHarvestFee;
        emit FeeUpdated(newHarvestFee);
    }

    function setMinYieldAmount(uint256 newMinYieldAmount) external onlyOwner {
        // Reasonable bounds: minimum 1 USDC (1e6), maximum 100,000 USDC (100000e6)
        if (newMinYieldAmount < 1e6) revert MinYieldAmountTooLow();
        if (newMinYieldAmount > 100000e6) revert MinYieldAmountTooHigh();

        minYieldAmount = newMinYieldAmount;
        emit MinYieldAmountUpdated(newMinYieldAmount);
    }

    function setMinAmounts(uint256 newMinDepositAmount, uint256 newMinWithdrawAmount) external onlyOwner {
        // Reasonable bounds: minimum 1 USDC (1e6), maximum 10,000 USDC (10000e6)
        if (newMinDepositAmount < 1e6 || newMinDepositAmount > 10000e6) revert AmountTooSmall();
        if (newMinWithdrawAmount < 1e6 || newMinWithdrawAmount > 10000e6) revert AmountTooSmall();

        minDepositAmount = newMinDepositAmount;
        minWithdrawAmount = newMinWithdrawAmount;
        emit MinAmountsUpdated(newMinDepositAmount, newMinWithdrawAmount);
    }

    function setMaxPendingUsers(uint256 newMaxPendingUsers) external onlyOwner {
        // Reasonable bounds: minimum 100, maximum 10,000
        if (newMaxPendingUsers < 100 || newMaxPendingUsers > 10000) revert AmountTooSmall();
        maxPendingUsers = newMaxPendingUsers;
    }

    function setHarvestTimePeriod(uint256 newHarvestTimePeriod) external onlyOwner {
        // Reasonable bounds: minimum 1 hour, maximum 30 days
        if (newHarvestTimePeriod < 1 hours) revert HarvestTimePeriodTooShort();
        if (newHarvestTimePeriod > 30 days) revert HarvestTimePeriodTooLong();

        harvestTimePeriod = newHarvestTimePeriod;
        emit HarvestTimePeriodUpdated(newHarvestTimePeriod);
    }

    // --- Internal Functions ---

    function _update(address from, address to, uint256 value) internal override {
        // Allow minting (from == address(0)) and burning (to == address(0))
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert TransferLocked();
        }

        super._update(from, to, value);
    }

    function _performHarvest(uint256 minOut) internal {
        uint256 currentBalance = A_UNDERLYING.balanceOf(address(this));
        uint256 totalSharesSupply = totalSupply();

        // Calculate yield (current aToken balance - total shares)
        if (currentBalance <= totalSharesSupply) return; // No yield to harvest

        uint256 yieldAmount = currentBalance - totalSharesSupply;

        // Withdraw yield from Aave
        AAVE_POOL.withdraw(address(UNDERLYING), yieldAmount, address(this));

        // Swap yield to WBTC
        uint256 wbtcReceived = DEX.exactInputSingle(
            IDex.ExactInputSingleParams({
                tokenIn: address(UNDERLYING),
                tokenOut: address(WBTC),
                fee: 3000, // 0.3% fee tier
                recipient: address(this),
                deadline: block.timestamp + 300, // 5 minutes
                amountIn: yieldAmount,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: 0
            })
        );

        // Take protocol fee
        uint256 protocolFee = (wbtcReceived * harvestFee) / 10000;
        uint256 userRewards = wbtcReceived - protocolFee - 1; // Reserve 1 wei for rounding

        // Send protocol fee to owner
        if (protocolFee > 0) {
            WBTC.safeTransfer(owner(), protocolFee);
        }

        // Update cumulative WBTC per share
        if (totalSharesSupply > 0) {
            cumulativeWbtcPerShare += (userRewards * 1e18) / totalSharesSupply;
        }

        lastHarvest = block.timestamp;

        emit Harvest(yieldAmount, wbtcReceived, protocolFee, cumulativeWbtcPerShare);
    }

    function _addToPendingOperations(address user, int256 amount) internal {
        PendingOperation storage op = pendingOperations[user];

        if (!op.exists) {
            // Check if we can add more pending users
            if (pendingUsers.length >= maxPendingUsers) revert TooManyPendingUsers();

            // Add user to pending list
            pendingUsers.push(user);
            op.exists = true;
        }

        // Update net amount
        op.netAmount += amount;

        // If net amount becomes zero, remove from pending
        if (op.netAmount == 0) {
            _removePendingUser(user);
        }
    }

    function _removePendingUser(address user) internal {
        PendingOperation storage op = pendingOperations[user];
        op.exists = false;
        op.netAmount = 0;

        // Find and remove user from array
        for (uint256 i = 0; i < pendingUsers.length; i++) {
            if (pendingUsers[i] == user) {
                pendingUsers[i] = pendingUsers[pendingUsers.length - 1];
                pendingUsers.pop();
                break;
            }
        }
    }

    // todo: There could be an opportunity here to solve withdrawals first with pending deposits
    function _processPendingOperations(uint256 maxUsers) internal {
        uint256 usersToProcess = pendingUsers.length;
        if (maxUsers > 0 && usersToProcess > maxUsers) {
            usersToProcess = maxUsers;
        }

        uint256 totalNetDeposits = 0;
        uint256 totalNetWithdraws = 0;
        uint256 supplyAmount = 0;

        // Process users from the end to avoid array shifting issues
        for (uint256 i = usersToProcess; i > 0; i--) {
            address user = pendingUsers[i - 1];
            PendingOperation memory op = pendingOperations[user];

            if (op.netAmount > 0) {
                // Net deposit
                uint256 depositAmount = uint256(op.netAmount);
                totalNetDeposits += depositAmount;

                // Process any claimable yield first
                uint256 claimable = _claimableYield(user);
                if (claimable > 0) {
                    _processYield(user, claimable);
                } else {
                    // Update user's last cumulative WBTC per share
                    _updateUserRewards(user);
                }

                // Supply to Aave
                supplyAmount += depositAmount;
                // Mint shares 1:1
                _mint(user, depositAmount);
            } else if (op.netAmount < 0) {
                //todo: considering min withdraw
                // Net withdraw
                uint256 withdrawAmount = uint256(-op.netAmount);
                totalNetWithdraws += withdrawAmount;

                // Process any claimable yield first
                uint256 claimable = _claimableYield(user);
                if (claimable > 0) {
                    _processYield(user, claimable);
                } else {
                    // Update user's last cumulative WBTC per share
                    _updateUserRewards(user);
                }

                // Burn shares
                _burn(user, withdrawAmount);

                // Withdraw from Aave
                AAVE_POOL.withdraw(address(UNDERLYING), withdrawAmount, user);
            }

            // Remove from pending
            delete pendingOperations[user];
        }

        // Remove processed users from array
        if (usersToProcess == pendingUsers.length) {
            // Clear entire array
            delete pendingUsers;
        } else {
            // Remove from the end
            for (uint256 i = 0; i < usersToProcess; i++) {
                pendingUsers.pop();
            }
        }
        AAVE_POOL.supply(address(UNDERLYING), supplyAmount, address(this), 0);
        emit PendingOperationsProcessed(usersToProcess, totalNetDeposits, totalNetWithdraws);
    }

    function _updateUserRewards(address user) internal {
        UserInfo storage userInfo = users[user];
        userInfo.lastCumulativeWbtcPerShare = cumulativeWbtcPerShare;
    }

    function _claimableYield(address user) private view returns (uint256) {
        UserInfo memory userInfo = users[user];
        uint256 userShares = balanceOf(user);

        if (userShares == 0) return 0;

        uint256 accumulatedWbtc = (cumulativeWbtcPerShare * userShares) / 1e18;
        uint256 userLastAccumulated = (userInfo.lastCumulativeWbtcPerShare * userShares) / 1e18;

        return accumulatedWbtc - userLastAccumulated;
    }

    function _requireAmountCannotBeZero(uint256 amount) private pure {
        if (!(amount > 0)) revert AmountCannotBeZero();
    }

    function _requireValidFee(uint256 _harvestFee) private pure {
        if (_harvestFee > MAX_HARVEST_FEE_BPS) revert FeeTooHigh();
    }
}
