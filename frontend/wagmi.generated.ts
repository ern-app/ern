import {
  createUseReadContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
  createUseWriteContract,
} from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Ern
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ernAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_underlying", internalType: "contract ERC20", type: "address" },
      { name: "_rewardToken", internalType: "contract ERC20", type: "address" },
      {
        name: "_aavePool",
        internalType: "contract IAavePool",
        type: "address",
      },
      { name: "_dex", internalType: "contract IDex", type: "address" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "AAVE_POOL",
    outputs: [
      { name: "", internalType: "contract IAavePool", type: "address" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "A_UNDERLYING",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "DEX",
    outputs: [{ name: "", internalType: "contract IDex", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_HARVEST_FEE_BPS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "MAX_WITHDRAW_FEE_BPS",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "REWARD_TOKEN",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "UNDERLYING",
    outputs: [{ name: "", internalType: "contract IERC20", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "newHarvester", internalType: "address", type: "address" },
    ],
    name: "addHarvester",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "user", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "applicableFee",
    outputs: [
      { name: "amountAfterFee", internalType: "uint256", type: "uint256" },
      { name: "feeAmount", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "canHarvest",
    outputs: [
      { name: "", internalType: "bool", type: "bool" },
      { name: "", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "claimYield",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "claimYieldOnBehalf",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "claimableYield",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "cumulativeRewardPerShare",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "deposit",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "hardLockPeriod",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "minOut", internalType: "uint256", type: "uint256" }],
    name: "harvest",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "harvestCooldown",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "harvestFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "harvestTimePeriod",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "isHardLocked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "isHarvester",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "isLocked",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lastHarvest",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "lockPeriod",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "minYieldAmount",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "owner",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "oldHarvester", internalType: "address", type: "address" },
    ],
    name: "removeHarvester",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newHarvestFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setHarvestFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      {
        name: "newHarvestTimePeriod",
        internalType: "uint256",
        type: "uint256",
      },
    ],
    name: "setHarvestTimePeriod",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newMinYieldAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "setMinYieldAmount",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "newWithdrawFee", internalType: "uint256", type: "uint256" },
    ],
    name: "setWithdrawFee",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalAssets",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "user", internalType: "address", type: "address" }],
    name: "unlockTime",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "users",
    outputs: [
      {
        name: "lastCumulativeRewardPerShare",
        internalType: "uint256",
        type: "uint256",
      },
      { name: "rewardClaimed", internalType: "uint256", type: "uint256" },
      { name: "depositTimestamp", internalType: "uint256", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "amount", internalType: "uint256", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "withdrawFee",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Deposit",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newHarvestFee",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "FeeUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "underlyingYield",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "rewardBought",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "feeTaken",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      {
        name: "cumulativeRewardPerShare",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Harvest",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newHarvestTimePeriod",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "HarvestTimePeriodUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newHarvester",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "isAuthorized",
        internalType: "bool",
        type: "bool",
        indexed: false,
      },
    ],
    name: "HarvesterUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "newMinYieldAmount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "MinYieldAmountUpdated",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "previousOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "newOwner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
    ],
    name: "OwnershipTransferred",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
      { name: "fee", internalType: "uint256", type: "uint256", indexed: false },
    ],
    name: "Withdraw",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "user", internalType: "address", type: "address", indexed: true },
      {
        name: "amount",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "YieldClaimed",
  },
  { type: "error", inputs: [], name: "AddressCannotBeZero" },
  { type: "error", inputs: [], name: "AmountCannotBeZero" },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
  { type: "error", inputs: [], name: "FeeTooHigh" },
  { type: "error", inputs: [], name: "HarvestConditionsNotMet" },
  { type: "error", inputs: [], name: "HarvestCooldownNotMet" },
  { type: "error", inputs: [], name: "HarvestTimePeriodTooLong" },
  { type: "error", inputs: [], name: "HarvestTimePeriodTooShort" },
  { type: "error", inputs: [], name: "HarvestingNotAllowed" },
  { type: "error", inputs: [], name: "InsufficientAllowance" },
  { type: "error", inputs: [], name: "MinYieldAmountTooHigh" },
  { type: "error", inputs: [], name: "MinYieldAmountTooLow" },
  { type: "error", inputs: [], name: "NoYieldToClaim" },
  {
    type: "error",
    inputs: [{ name: "owner", internalType: "address", type: "address" }],
    name: "OwnableInvalidOwner",
  },
  {
    type: "error",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "OwnableUnauthorizedAccount",
  },
  {
    type: "error",
    inputs: [{ name: "token", internalType: "address", type: "address" }],
    name: "SafeERC20FailedOperation",
  },
  { type: "error", inputs: [], name: "TokensAreLocked" },
  { type: "error", inputs: [], name: "TransferLocked" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IAggregatorV3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iAggregatorV3Abi = [
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", internalType: "uint80", type: "uint80" },
      { name: "answer", internalType: "int256", type: "int256" },
      { name: "startedAt", internalType: "uint256", type: "uint256" },
      { name: "updatedAt", internalType: "uint256", type: "uint256" },
      { name: "answeredInRound", internalType: "uint80", type: "uint80" },
    ],
    stateMutability: "view",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockAToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockATokenAbi = [
  {
    type: "constructor",
    inputs: [
      { name: "_name", internalType: "string", type: "string" },
      { name: "_symbol", internalType: "string", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "owner", internalType: "address", type: "address" },
      { name: "spender", internalType: "address", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [{ name: "account", internalType: "address", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
    stateMutability: "pure",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [],
    name: "name",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", internalType: "string", type: "string" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "from", internalType: "address", type: "address" },
      { name: "to", internalType: "address", type: "address" },
      { name: "value", internalType: "uint256", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", internalType: "bool", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      {
        name: "owner",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "spender",
        internalType: "address",
        type: "address",
        indexed: true,
      },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Approval",
  },
  {
    type: "event",
    anonymous: false,
    inputs: [
      { name: "from", internalType: "address", type: "address", indexed: true },
      { name: "to", internalType: "address", type: "address", indexed: true },
      {
        name: "value",
        internalType: "uint256",
        type: "uint256",
        indexed: false,
      },
    ],
    name: "Transfer",
  },
  {
    type: "error",
    inputs: [
      { name: "spender", internalType: "address", type: "address" },
      { name: "allowance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientAllowance",
  },
  {
    type: "error",
    inputs: [
      { name: "sender", internalType: "address", type: "address" },
      { name: "balance", internalType: "uint256", type: "uint256" },
      { name: "needed", internalType: "uint256", type: "uint256" },
    ],
    name: "ERC20InsufficientBalance",
  },
  {
    type: "error",
    inputs: [{ name: "approver", internalType: "address", type: "address" }],
    name: "ERC20InvalidApprover",
  },
  {
    type: "error",
    inputs: [{ name: "receiver", internalType: "address", type: "address" }],
    name: "ERC20InvalidReceiver",
  },
  {
    type: "error",
    inputs: [{ name: "sender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSender",
  },
  {
    type: "error",
    inputs: [{ name: "spender", internalType: "address", type: "address" }],
    name: "ERC20InvalidSpender",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MockAavePool
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const mockAavePoolAbi = [
  {
    type: "function",
    inputs: [{ name: "", internalType: "address", type: "address" }],
    name: "aTokens",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [{ name: "asset", internalType: "address", type: "address" }],
    name: "getReserveAToken",
    outputs: [{ name: "", internalType: "address", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "aToken", internalType: "address", type: "address" },
    ],
    name: "setAToken",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "aToken", internalType: "address", type: "address" },
      { name: "recipient", internalType: "address", type: "address" },
      { name: "yieldAmount", internalType: "uint256", type: "uint256" },
    ],
    name: "simulateYield",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "onBehalfOf", internalType: "address", type: "address" },
      { name: "", internalType: "uint16", type: "uint16" },
    ],
    name: "supply",
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    inputs: [
      { name: "asset", internalType: "address", type: "address" },
      { name: "amount", internalType: "uint256", type: "uint256" },
      { name: "to", internalType: "address", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
    stateMutability: "nonpayable",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Multicall
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const multicallAbi = [
  {
    type: "function",
    inputs: [
      {
        name: "calls",
        internalType: "struct Multicall.Call[]",
        type: "tuple[]",
        components: [
          { name: "target", internalType: "address", type: "address" },
          { name: "callData", internalType: "bytes", type: "bytes" },
        ],
      },
    ],
    name: "aggregate",
    outputs: [
      { name: "blockNumber", internalType: "uint256", type: "uint256" },
      { name: "returnData", internalType: "bytes[]", type: "bytes[]" },
    ],
    stateMutability: "payable",
  },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: "totalSupply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: "transferFrom",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: "approve",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: "transfer" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: "Approval",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: "Transfer",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__
 */
export const useReadErn = /*#__PURE__*/ createUseReadContract({ abi: ernAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"AAVE_POOL"`
 */
export const useReadErnAavePool = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "AAVE_POOL",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"A_UNDERLYING"`
 */
export const useReadErnAUnderlying = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "A_UNDERLYING",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"DEX"`
 */
export const useReadErnDex = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "DEX",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"MAX_HARVEST_FEE_BPS"`
 */
export const useReadErnMaxHarvestFeeBps = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "MAX_HARVEST_FEE_BPS",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"MAX_WITHDRAW_FEE_BPS"`
 */
export const useReadErnMaxWithdrawFeeBps = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "MAX_WITHDRAW_FEE_BPS",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"REWARD_TOKEN"`
 */
export const useReadErnRewardToken = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "REWARD_TOKEN",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"UNDERLYING"`
 */
export const useReadErnUnderlying = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "UNDERLYING",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadErnAllowance = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"applicableFee"`
 */
export const useReadErnApplicableFee = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "applicableFee",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErnBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"canHarvest"`
 */
export const useReadErnCanHarvest = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "canHarvest",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"claimableYield"`
 */
export const useReadErnClaimableYield = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "claimableYield",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"cumulativeRewardPerShare"`
 */
export const useReadErnCumulativeRewardPerShare =
  /*#__PURE__*/ createUseReadContract({
    abi: ernAbi,
    functionName: "cumulativeRewardPerShare",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadErnDecimals = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"hardLockPeriod"`
 */
export const useReadErnHardLockPeriod = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "hardLockPeriod",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"harvestCooldown"`
 */
export const useReadErnHarvestCooldown = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "harvestCooldown",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"harvestFee"`
 */
export const useReadErnHarvestFee = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "harvestFee",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"harvestTimePeriod"`
 */
export const useReadErnHarvestTimePeriod = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "harvestTimePeriod",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"isHardLocked"`
 */
export const useReadErnIsHardLocked = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "isHardLocked",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"isHarvester"`
 */
export const useReadErnIsHarvester = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "isHarvester",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"isLocked"`
 */
export const useReadErnIsLocked = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "isLocked",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"lastHarvest"`
 */
export const useReadErnLastHarvest = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "lastHarvest",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"lockPeriod"`
 */
export const useReadErnLockPeriod = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "lockPeriod",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"minYieldAmount"`
 */
export const useReadErnMinYieldAmount = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "minYieldAmount",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"name"`
 */
export const useReadErnName = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"owner"`
 */
export const useReadErnOwner = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "owner",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadErnSymbol = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"totalAssets"`
 */
export const useReadErnTotalAssets = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "totalAssets",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErnTotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "totalSupply",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"unlockTime"`
 */
export const useReadErnUnlockTime = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "unlockTime",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"users"`
 */
export const useReadErnUsers = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "users",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"withdrawFee"`
 */
export const useReadErnWithdrawFee = /*#__PURE__*/ createUseReadContract({
  abi: ernAbi,
  functionName: "withdrawFee",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__
 */
export const useWriteErn = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"addHarvester"`
 */
export const useWriteErnAddHarvester = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "addHarvester",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteErnApprove = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"claimYield"`
 */
export const useWriteErnClaimYield = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "claimYield",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"claimYieldOnBehalf"`
 */
export const useWriteErnClaimYieldOnBehalf =
  /*#__PURE__*/ createUseWriteContract({
    abi: ernAbi,
    functionName: "claimYieldOnBehalf",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"deposit"`
 */
export const useWriteErnDeposit = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "deposit",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"harvest"`
 */
export const useWriteErnHarvest = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "harvest",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"removeHarvester"`
 */
export const useWriteErnRemoveHarvester = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "removeHarvester",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteErnRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ernAbi,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setHarvestFee"`
 */
export const useWriteErnSetHarvestFee = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "setHarvestFee",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setHarvestTimePeriod"`
 */
export const useWriteErnSetHarvestTimePeriod =
  /*#__PURE__*/ createUseWriteContract({
    abi: ernAbi,
    functionName: "setHarvestTimePeriod",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setMinYieldAmount"`
 */
export const useWriteErnSetMinYieldAmount =
  /*#__PURE__*/ createUseWriteContract({
    abi: ernAbi,
    functionName: "setMinYieldAmount",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setWithdrawFee"`
 */
export const useWriteErnSetWithdrawFee = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "setWithdrawFee",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErnTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErnTransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "transferFrom",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteErnTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: ernAbi,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteErnWithdraw = /*#__PURE__*/ createUseWriteContract({
  abi: ernAbi,
  functionName: "withdraw",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__
 */
export const useSimulateErn = /*#__PURE__*/ createUseSimulateContract({
  abi: ernAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"addHarvester"`
 */
export const useSimulateErnAddHarvester =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "addHarvester",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErnApprove = /*#__PURE__*/ createUseSimulateContract({
  abi: ernAbi,
  functionName: "approve",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"claimYield"`
 */
export const useSimulateErnClaimYield = /*#__PURE__*/ createUseSimulateContract(
  { abi: ernAbi, functionName: "claimYield" },
);

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"claimYieldOnBehalf"`
 */
export const useSimulateErnClaimYieldOnBehalf =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "claimYieldOnBehalf",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"deposit"`
 */
export const useSimulateErnDeposit = /*#__PURE__*/ createUseSimulateContract({
  abi: ernAbi,
  functionName: "deposit",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"harvest"`
 */
export const useSimulateErnHarvest = /*#__PURE__*/ createUseSimulateContract({
  abi: ernAbi,
  functionName: "harvest",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"removeHarvester"`
 */
export const useSimulateErnRemoveHarvester =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "removeHarvester",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateErnRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "renounceOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setHarvestFee"`
 */
export const useSimulateErnSetHarvestFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "setHarvestFee",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setHarvestTimePeriod"`
 */
export const useSimulateErnSetHarvestTimePeriod =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "setHarvestTimePeriod",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setMinYieldAmount"`
 */
export const useSimulateErnSetMinYieldAmount =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "setMinYieldAmount",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"setWithdrawFee"`
 */
export const useSimulateErnSetWithdrawFee =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "setWithdrawFee",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErnTransfer = /*#__PURE__*/ createUseSimulateContract({
  abi: ernAbi,
  functionName: "transfer",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErnTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateErnTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: ernAbi,
    functionName: "transferOwnership",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link ernAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateErnWithdraw = /*#__PURE__*/ createUseSimulateContract({
  abi: ernAbi,
  functionName: "withdraw",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__
 */
export const useWatchErnEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: ernAbi,
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErnApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "Approval",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchErnDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "Deposit",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"FeeUpdated"`
 */
export const useWatchErnFeeUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "FeeUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"Harvest"`
 */
export const useWatchErnHarvestEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "Harvest",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"HarvestTimePeriodUpdated"`
 */
export const useWatchErnHarvestTimePeriodUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "HarvestTimePeriodUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"HarvesterUpdated"`
 */
export const useWatchErnHarvesterUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "HarvesterUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"MinYieldAmountUpdated"`
 */
export const useWatchErnMinYieldAmountUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "MinYieldAmountUpdated",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchErnOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "OwnershipTransferred",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErnTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "Transfer",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"Withdraw"`
 */
export const useWatchErnWithdrawEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "Withdraw",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link ernAbi}__ and `eventName` set to `"YieldClaimed"`
 */
export const useWatchErnYieldClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: ernAbi,
    eventName: "YieldClaimed",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAggregatorV3Abi}__
 */
export const useReadIAggregatorV3 = /*#__PURE__*/ createUseReadContract({
  abi: iAggregatorV3Abi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAggregatorV3Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadIAggregatorV3Decimals = /*#__PURE__*/ createUseReadContract(
  { abi: iAggregatorV3Abi, functionName: "decimals" },
);

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link iAggregatorV3Abi}__ and `functionName` set to `"latestRoundData"`
 */
export const useReadIAggregatorV3LatestRoundData =
  /*#__PURE__*/ createUseReadContract({
    abi: iAggregatorV3Abi,
    functionName: "latestRoundData",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__
 */
export const useReadMockAToken = /*#__PURE__*/ createUseReadContract({
  abi: mockATokenAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"allowance"`
 */
export const useReadMockATokenAllowance = /*#__PURE__*/ createUseReadContract({
  abi: mockATokenAbi,
  functionName: "allowance",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadMockATokenBalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: mockATokenAbi,
  functionName: "balanceOf",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"decimals"`
 */
export const useReadMockATokenDecimals = /*#__PURE__*/ createUseReadContract({
  abi: mockATokenAbi,
  functionName: "decimals",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"name"`
 */
export const useReadMockATokenName = /*#__PURE__*/ createUseReadContract({
  abi: mockATokenAbi,
  functionName: "name",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"symbol"`
 */
export const useReadMockATokenSymbol = /*#__PURE__*/ createUseReadContract({
  abi: mockATokenAbi,
  functionName: "symbol",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadMockATokenTotalSupply = /*#__PURE__*/ createUseReadContract(
  { abi: mockATokenAbi, functionName: "totalSupply" },
);

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockATokenAbi}__
 */
export const useWriteMockAToken = /*#__PURE__*/ createUseWriteContract({
  abi: mockATokenAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"approve"`
 */
export const useWriteMockATokenApprove = /*#__PURE__*/ createUseWriteContract({
  abi: mockATokenAbi,
  functionName: "approve",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"burn"`
 */
export const useWriteMockATokenBurn = /*#__PURE__*/ createUseWriteContract({
  abi: mockATokenAbi,
  functionName: "burn",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"mint"`
 */
export const useWriteMockATokenMint = /*#__PURE__*/ createUseWriteContract({
  abi: mockATokenAbi,
  functionName: "mint",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useWriteMockATokenTransfer = /*#__PURE__*/ createUseWriteContract({
  abi: mockATokenAbi,
  functionName: "transfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteMockATokenTransferFrom =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockATokenAbi,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockATokenAbi}__
 */
export const useSimulateMockAToken = /*#__PURE__*/ createUseSimulateContract({
  abi: mockATokenAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"approve"`
 */
export const useSimulateMockATokenApprove =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockATokenAbi,
    functionName: "approve",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"burn"`
 */
export const useSimulateMockATokenBurn =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockATokenAbi,
    functionName: "burn",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"mint"`
 */
export const useSimulateMockATokenMint =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockATokenAbi,
    functionName: "mint",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateMockATokenTransfer =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockATokenAbi,
    functionName: "transfer",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockATokenAbi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateMockATokenTransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockATokenAbi,
    functionName: "transferFrom",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockATokenAbi}__
 */
export const useWatchMockATokenEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: mockATokenAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockATokenAbi}__ and `eventName` set to `"Approval"`
 */
export const useWatchMockATokenApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockATokenAbi,
    eventName: "Approval",
  });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link mockATokenAbi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchMockATokenTransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: mockATokenAbi,
    eventName: "Transfer",
  });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockAavePoolAbi}__
 */
export const useReadMockAavePool = /*#__PURE__*/ createUseReadContract({
  abi: mockAavePoolAbi,
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"aTokens"`
 */
export const useReadMockAavePoolATokens = /*#__PURE__*/ createUseReadContract({
  abi: mockAavePoolAbi,
  functionName: "aTokens",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"getReserveAToken"`
 */
export const useReadMockAavePoolGetReserveAToken =
  /*#__PURE__*/ createUseReadContract({
    abi: mockAavePoolAbi,
    functionName: "getReserveAToken",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockAavePoolAbi}__
 */
export const useWriteMockAavePool = /*#__PURE__*/ createUseWriteContract({
  abi: mockAavePoolAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"setAToken"`
 */
export const useWriteMockAavePoolSetAToken =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockAavePoolAbi,
    functionName: "setAToken",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"simulateYield"`
 */
export const useWriteMockAavePoolSimulateYield =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockAavePoolAbi,
    functionName: "simulateYield",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"supply"`
 */
export const useWriteMockAavePoolSupply = /*#__PURE__*/ createUseWriteContract({
  abi: mockAavePoolAbi,
  functionName: "supply",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"withdraw"`
 */
export const useWriteMockAavePoolWithdraw =
  /*#__PURE__*/ createUseWriteContract({
    abi: mockAavePoolAbi,
    functionName: "withdraw",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockAavePoolAbi}__
 */
export const useSimulateMockAavePool = /*#__PURE__*/ createUseSimulateContract({
  abi: mockAavePoolAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"setAToken"`
 */
export const useSimulateMockAavePoolSetAToken =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockAavePoolAbi,
    functionName: "setAToken",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"simulateYield"`
 */
export const useSimulateMockAavePoolSimulateYield =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockAavePoolAbi,
    functionName: "simulateYield",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"supply"`
 */
export const useSimulateMockAavePoolSupply =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockAavePoolAbi,
    functionName: "supply",
  });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link mockAavePoolAbi}__ and `functionName` set to `"withdraw"`
 */
export const useSimulateMockAavePoolWithdraw =
  /*#__PURE__*/ createUseSimulateContract({
    abi: mockAavePoolAbi,
    functionName: "withdraw",
  });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link multicallAbi}__
 */
export const useWriteMulticall = /*#__PURE__*/ createUseWriteContract({
  abi: multicallAbi,
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link multicallAbi}__ and `functionName` set to `"aggregate"`
 */
export const useWriteMulticallAggregate = /*#__PURE__*/ createUseWriteContract({
  abi: multicallAbi,
  functionName: "aggregate",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link multicallAbi}__
 */
export const useSimulateMulticall = /*#__PURE__*/ createUseSimulateContract({
  abi: multicallAbi,
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link multicallAbi}__ and `functionName` set to `"aggregate"`
 */
export const useSimulateMulticallAggregate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: multicallAbi,
    functionName: "aggregate",
  });
