## Ern

This repository contains the smart contracts for the Ern protocol, which is designed to use returns of yield farming strategies and DCA into Bitcoin or other reward tokens.

Two distinct approaches are implemented: [Ern](./src/Ern.sol) and [ErnWithPendingQueue](./src/ErnWithPendingQueue.sol).

### Ern

The standard Ern contract implements an immediate execution model for deposits and withdrawals.

#### How it works:
1. **Deposits**: Users deposit underlying tokens (e.g., USDC) which are immediately supplied to Aave to earn yield
2. **Share Minting**: Shares are minted 1:1 with deposited amount and represent the user's stake
3. **Lock Period**: Deposits are locked for 48 hours to prevent gaming the harvest mechanism. Period is renewed on each deposit.
4. **Yield Generation**: Deposited funds earn yield on Aave through interest accumulation
5. **Harvest**: When conditions are met (sufficient yield OR time period passed), the protocol:
   - Withdraws excess yield from Aave
   - Swaps yield to reward tokens (Bitcoin/WBTC) via DEX
   - Takes protocol fee and distributes rewards proportionally to shareholders
6. **Yield Claims**: Users can claim their accumulated reward tokens at any time
7. **Withdrawals**: After lock period, users can withdraw their underlying tokens 1:1 with shares.
   - Withdrawals are processed immediately, burning shares and withdrawing from Aave

#### Pros:
- **Simple and predictable**: Immediate execution makes user experience straightforward
- **No batching complexity**: Each deposit/withdraw is a single operation, implicit yield claim.
- **Capital efficient**: No funds sit idle - all deposits immediately start earning yield
- **Lower gas costs per harvest**: Constant gas cost for harvest regardless of user count

#### Cons:
- **Unfair reward distribution**: Each Deposit benefits from yield of the pending harvest window.
- **Loss of pending rewards**: If a user withdraws before the next harvest, they lose any rewards that have not been harvested yet.
- **Lock period friction**: 7-day lock may deter some users
- **MEV vulnerability**: Immediate execution could be front-run during harvest periods

### ErnWithPendingQueue

The pending queue version implements a delayed execution model to ensure fairness. 

#### How it works:
1. **Deposits**: Users deposit underlying tokens which are held in a pending queue rather than immediately supplied to Aave
2. **Withdrawals**: Users request withdrawals which are also queued rather than immediately executed
3. **Net Position Tracking**: The contract tracks net pending operations per user (deposits minus withdrawals)
4. **Batch Processing**: During harvest, all pending operations are processed in a single batch:
   - Net deposits are supplied to Aave and shares are minted
   - Net withdrawals are processed by burning shares and withdrawing from Aave
   - Yield is harvested and distributed
5. **Minimum Amounts**: Enforces minimum deposit/withdraw amounts to prevent spam and optimize batch efficiency
6. **Queue Limits**: Maximum pending users limit prevents unbounded gas consumption
7. **Emergency withdraw**: User forfeits pending window rewards and burn their shares.

#### Pros:
- **Fairness**: Contributions match returns.
- **No lock period**: More flexible for users who want quicker access to funds
- **Netting efficiency**: Deposits and withdrawals can offset each other, reducing Aave interactions (not yet optimized)
- **Operation flexibility**: Users can modify pending operations before they're processed

#### Cons:
- **Delayed execution**: Users must wait for next harvest for operations to complete, although they do not require additional action.
- **Capital inefficiency**: Pending deposits don't earn yield until processed
- **Complex state management**: More intricate logic increases potential for bugs
- **Bot gas costs**: Each operation involves pending queue management. This could make the bot unprofitable during high gas prices. *
- **Uncertainty**: Users don't know exactly when their operations will be processed
- **Queue limits**: May reject operations when pending queue is full
- **Minimum amounts**: Higher barriers to entry for small users
- **Griefing potential**: Users could potentially spam the queue with low-value operations to disrupt others. *

*Some potential mitigations include:
- Implementing minimum deposit/withdraw amounts
- Deposit/ Withdraw fees to compensate bot operations
- ...
