# Ern Protocol

## Project Overview

Ern is a DeFi yield farming protocol that deposits stablecoins (USDC/USDT) into Aave to earn yield, then converts that yield into Bitcoin (WBTC) rewards for users. The protocol consists of smart contracts written in Solidity and a React frontend for user interaction.

## Repository Structure

This is a monorepo with the following structure:

```
├── contracts/           # Solidity smart contracts
├── frontend/           # React frontend application (npm workspace)
├── figma/              # UI design screenshots from Figma
├── dependencies/       # Foundry dependencies
├── scripts/           # Shell scripts for deployment/development
└── out/              # Foundry compilation artifacts
```

## Design

The `figma/` directory contains UI design screenshots from Figma showing the latest design specifications:

- `start.png` - Initial landing page before wallet connection
- `after-connect.png` - Main dashboard after wallet connection
- `claim-yield.png` - Yield claiming interface
- `withdraw.png` - Withdrawal interface

These screenshots serve as the design reference for frontend development and should be consulted when implementing or updating UI components.

## Smart Contracts

### Architecture

The protocol implements two distinct approaches:

1. **Ern** (`contracts/src/Ern.sol`) - Immediate execution model
2. **ErnWithPendingQueue** (`contracts/src/ErnWithPendingQueue.sol`) - Batched execution model (deprecated)

Both contracts integrate with:
- **Aave V3** for yield generation
- **Uniswap V3** for token swapping 
- **OpenZeppelin** contracts for security standards

### Key Contracts

- `contracts/src/Ern.sol` - Main vault contract with immediate execution
- `contracts/src/ErnWithPendingQueue.sol` - Alternative implementation with pending operations
- `contracts/src/interfaces/IErn.sol` - Main interface definition
- `contracts/src/interfaces/IAavePool.sol` - Aave integration interface
- `contracts/src/interfaces/IDex.sol` - DEX integration interface

### Ern (Immediate Execution)

**How it works:**
1. Users deposit USDC/USDT → immediately supplied to Aave
2. Shares minted 1:1 with deposit amount
3. 7-day lock period prevents gaming harvest mechanism
4. Periodic harvests convert Aave yield to WBTC rewards
5. Users can claim accumulated WBTC rewards anytime
6. Withdrawals possible after lock period

**Pros:**
- Simple, predictable UX
- Capital efficient (funds immediately earning)
- Lower gas costs per harvest

**Cons:**
- Unfair reward distribution for deposits during harvest windows
- Users lose pending rewards on early withdrawal
- 7-day lock period friction

### Development & Testing

**Foundry Configuration:**
- Source: `contracts/`
- Dependencies: Aave V3, OpenZeppelin, Uniswap V3
- Comprehensive test suite covering integration, mocking, and gas analysis
- Fork testing against mainnet

**Key Scripts:**
- `npm run eth-deploy` - Deploy contracts
- `npm run eth-watch` - Watch and recompile contracts

## Frontend Application

### Technology Stack

- **React 19** with TypeScript
- **TanStack Router** for file-based routing
- **TanStack Query** for server state management
- **Viem + Wagmi** for type-safe Ethereum contract interactions
- **RainbowKit** for wallet connections
- **Tailwind CSS** with Shadcn/UI components
- **Vite** for build tooling
- **Vitest** for testing

### Architecture

```
frontend/src/
├── components/          # React components
│   ├── forms/          # Deposit/withdraw forms
│   └── ui/             # Shadcn/UI components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configuration
├── routes/             # TanStack Router routes
└── generated.ts        # Wagmi generated contracts
```

### Key Features

- **Wallet Integration:** RainbowKit + Wagmi for multi-wallet support
- **Smart Contract Integration:** Type-safe contract interactions via Viem + Wagmi with auto-generated hooks
- **Multi-chain Support:** Mainnet, Sepolia, local Foundry
- **Responsive Design:** Tailwind CSS with gradient backgrounds
- **Real-time Updates:** TanStack Query for contract state synchronization

### Development

**Available Scripts:**
- `npm run dev` - Start development server on port 3000
- `npm run build` - Production build with TypeScript checking
- `npm run test` - Run Vitest tests
- `npm run lint` - Biome linting
- `npm run format` - Biome formatting

### Frontend Development Guidelines

**Component Architecture:**
- **Small, reusable components** - Prefer composable, single-purpose components over large monolithic ones
- **Consistent styling** - Use Tailwind CSS variables for colors instead of hardcoded values
- **Design reference** - Follow Figma designs in the `figma/` directory closely

**Styling Standards:**
- Define color schemes as CSS custom properties or Tailwind config variables
- Maintain uniform spacing, typography, and component patterns
- Use consistent naming conventions for component props and CSS classes
- Leverage Shadcn/UI components as the foundation for custom components

**Code Structure:**
- Keep components focused on a single responsibility
- Extract common styling patterns into reusable utility classes
- Use TypeScript interfaces for component props to ensure type safety
- Follow the existing project structure in `frontend/src/components/`

## Configuration Files

### TypeScript

- **Root tsconfig.json:** Global TypeScript configuration
- **Frontend tsconfig.json:** Workspace-specific config with `@/*` path mapping

### Build Tools

- **Vite:** Frontend build tool with React, TailwindCSS, and TanStack Router plugins
- **Foundry:** Smart contract compilation and testing (foundry.toml)
- **Biome:** Code formatting and linting for TypeScript/JavaScript

### Development Environment

- **mprocs.yaml:** Multi-process configuration for running anvil, frontend, and contract watching
- **components.json:** Shadcn/UI configuration with New York style

## Development Workflow

### Setup

```bash
npm install
```

### Smart Contract Development

```bash
# Start local blockchain
anvil --host 0.0.0.0

# Deploy contracts
npm run eth-deploy

# Run tests
forge test
```

### Frontend Development

```bash
# Start frontend (in workspace)
npm run dev --workspace=frontend

# Or run everything with mprocs
mprocs
```

### Testing

- **Smart Contracts:** Foundry test suite with fork tests, mocks, and gas analysis
- **Frontend:** Vitest with React Testing Library
- **Integration:** End-to-end testing across contract + frontend

## Key Commands for Development

- `npm run lint && npm run fix` - Lint and fix formatting issues
- `forge test` - Run smart contract tests
- `npm run test` - Run frontend tests
- `mprocs` - Start all development processes (anvil + frontend + contract watcher)

## Architecture Decisions

1. **Monorepo with npm workspaces** for coordinated frontend/contract development
2. **Two contract implementations** to explore different UX/fairness tradeoffs  
3. **Foundry** for robust smart contract testing and deployment
4. **Modern React stack** with type safety and developer experience focus
5. **Multi-chain support** from the start for deployment flexibility
6. **Comprehensive testing** at both contract and frontend levels
