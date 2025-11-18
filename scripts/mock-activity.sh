#!/usr/bin/env bash

set -ue

# Contract addresses
BY="0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"
APOOL="0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
ATOKEN="0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
TOKEN="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

# Configuration
DO_HARVEST=${DO_HARVEST:-1}  # 0 (false) or 1 (true)
DAYS=${DAYS:-100}              # Number of days to simulate
DAY_DURATION=$((24 * 60 * 60)) # 24 hours in seconds

# User accounts (excluding owner at index 0)
USERS=(
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc"
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
    "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955"
    "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f"
    "0xa0Ee7A142d267C1f36714E4a8F75612F20a79720"
)

USER_PRIVATE_KEYS=(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"
    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
    "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"
    "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e"
    "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356"
    "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97"
    "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6"
)

# Owner private key
OWNER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

# Deposit amounts in wei (10, 50, 100 tokens based on available balance of 100000000000)
DEPOSIT_AMOUNTS=("10000000000" "50000000000" "100000000000")

# Function to generate random number between 1-100
random_percent() {
    echo $((RANDOM % 100 + 1))
}

# Function to get user balance
get_balance() {
    local user=$1
    cast call $BY "balanceOf(address)" $user
}

# Function to perform deposit
perform_deposit() {
    local user_index=$1
    local user=${USERS[$user_index]}
    local user_private_key=${USER_PRIVATE_KEYS[$user_index]}
    local amount=${DEPOSIT_AMOUNTS[$((RANDOM % 3))]}
    
    echo -n " - User $((user_index + 1)) depositing $amount wei: "
    local result=$(cast send --json $BY --private-key $user_private_key "deposit(uint256)" $amount 2>/dev/null || echo '{"status":"0x0"}')
    local status=$(echo $result | jq -r '.status // "0x0"')
    if [ "$status" = "0x1" ]; then
        echo "✓"
    else
        echo "✗ failed"
    fi
}

# Function to perform withdraw
perform_withdraw() {
    local user_index=$1
    local user=${USERS[$user_index]}
    local user_private_key=${USER_PRIVATE_KEYS[$user_index]}
    local balance=$(get_balance $user)
    
    if [ "$balance" != "0" ]; then
        local balance_dec=$(cast to-dec $balance)
        local withdraw_type=$((RANDOM % 2))
        local amount
        
        if [ $withdraw_type -eq 0 ]; then
            # Partial withdrawal (50%)
            amount=$((balance_dec / 2))
            echo -n " - User $((user_index + 1)) withdrawing 50% ($amount wei): "
        else
            # Full withdrawal (100%)
            amount=$balance_dec
            echo -n " - User $((user_index + 1)) withdrawing 100% ($amount wei): "
        fi
        
        local result=$(cast send --json $BY --private-key $user_private_key "withdraw(uint256)" $amount 2>/dev/null || echo '{"status":"0x0"}')
        local status=$(echo $result | jq -r '.status // "0x0"')
        if [ "$status" = "0x1" ]; then
            echo "✓"
        else
            echo "✗ failed"
        fi
    else
        echo " - User $((user_index + 1)) has no balance to withdraw"
    fi
}

# Function to claim yield
claim_yield() {
    local user_index=$1
    local user_private_key=${USER_PRIVATE_KEYS[$user_index]}
    echo -n " - User $((user_index + 1)) claiming yield: "
    local result=$(cast send --json $BY --private-key $user_private_key "claimYield()" 2>/dev/null || echo '{"status":"0x0"}')
    local status=$(echo $result | jq -r '.status // "0x0"')
    if [ "$status" = "0x1" ]; then
        echo "✓"
    else
        echo "✗ failed"
    fi
}

# Function to simulate daily owner actions
perform_owner_actions() {
    local day=$1
    echo -e "=== Day $day: Owner actions ===\n"
    
    # Get total supply for yield calculation
    local total_supply=$(cast call $BY "totalSupply()")
    local total_supply_dec=$(cast to-dec $total_supply)
    
    if [ "$total_supply_dec" != "0" ]; then
        # Calculate 0.2% yield using integer arithmetic to avoid bc issues
        local yield_amount=$((total_supply_dec * 2 / 1000))
        
        # Ensure minimum yield of 1 if total supply > 0
        if [ "$yield_amount" -eq "0" ] && [ "$total_supply_dec" -gt "0" ]; then
            yield_amount=1
        fi
        
        echo -n " - Simulating yield: $yield_amount wei (0.2% of total supply: $total_supply_dec wei): "
        local result=$(cast send --json $APOOL --private-key $OWNER_PRIVATE_KEY "simulateYield(address,address,uint256)" $ATOKEN $BY $yield_amount 2>/dev/null || echo '{"status":"0x0"}')
        local status=$(echo $result | jq -r '.status // "0x0"')
        if [ "$status" = "0x1" ]; then
            echo "✓"
        else
            echo "✗ failed"
        fi
        
        # Harvest if enabled
        if [ $DO_HARVEST -eq 1 ]; then
            echo -n " - Harvesting yield: "
            local harvest_result=$(cast send --json $BY --private-key $OWNER_PRIVATE_KEY "harvest(uint256)" 0 2>/dev/null || echo '{"status":"0x0"}')
            local harvest_status=$(echo $harvest_result | jq -r '.status // "0x0"')
            if [ "$harvest_status" = "0x1" ]; then
                echo "✓"
            else
                echo "✗ failed"
            fi
        fi
    else
        echo "No total supply, skipping yield simulation"
    fi
    echo ""
}

# Function to simulate user activity for one day
simulate_day_activity() {
    local day=$1
    echo -e "=== Day $day: User activity ===\n"
    
    # At most 4 interactions total across all users
    local total_interactions=$((RANDOM % 5))  # 0-4 interactions
    
    for ((i=0; i<total_interactions; i++)); do
        # Randomly select a user
        local user_index=$((RANDOM % ${#USERS[@]}))
        local action_roll=$(random_percent)
        
        if [ $action_roll -le 2 ]; then
            # 2% probability - withdraw
            perform_withdraw $user_index
        elif [ $action_roll -le 12 ]; then
            # 10% probability - deposit (2% + 10% = 12%)
            perform_deposit $user_index
        elif [ $action_roll -le 37 ]; then
            # 25% probability - claim yield (12% + 25% = 37%)
            claim_yield $user_index
        fi
        
        # Small delay between actions
        sleep 1
    done
    echo ""
}

# Function to advance time
advance_time() {
    # echo "Advancing time by $DAY_DURATION seconds"
    local time_increased=$(cast rpc evm_increaseTime $DAY_DURATION)
    local mine_result=$(cast rpc evm_mine)
}

# Function to check initial balances
check_initial_balances() {
    echo -e "=== Checking initial TOKEN balances ===\n"
    
    for user_index in "${!USERS[@]}"; do
        local user=${USERS[$user_index]}
        local token_balance=$(cast call $TOKEN "balanceOf(address)" $user)
        local by_balance=$(get_balance $user)

        echo " - User $((user_index + 1)) ($user): TOKEN balance = $(cast to-dec $token_balance) wei, BY balance = $(cast to-dec $by_balance) wei"
    done
    echo ""
}

# Function to perform initial deposits for all users
perform_initial_deposits() {
    echo -e "==================== DAY 0 - INITIAL SETUP ====================\n"
    
    # Check initial balances
    check_initial_balances
    
    echo -e "=== Performing initial approvals and deposits for all users ===\n"
    
    for user_index in "${!USERS[@]}"; do
        local user=${USERS[$user_index]}
        local user_private_key=${USER_PRIVATE_KEYS[$user_index]}
        local amount=${DEPOSIT_AMOUNTS[$((RANDOM % 3))]}
        echo " - User $((user_index + 1))"
        # First approve unlimited spending
        echo -n "    - approving unlimited TOKEN spending for BY contract: "
        local approve_result=$(cast send --json $TOKEN --private-key $user_private_key "approve(address,uint256)" $BY "115792089237316195423570985008687907853269984665640564039457584007913129639935" 2>/dev/null || echo '{"status":"0x0"}')
        local approve_status=$(echo $approve_result | jq -r '.status // "0x0"')
        if [ "$approve_status" = "0x1" ]; then
            echo "✓"
        else
            echo "✗ failed"
        fi
        
        # Then perform initial deposit
        echo -n "     - making initial deposit of $amount wei: "
        local deposit_result=$(cast send --json $BY --private-key $user_private_key "deposit(uint256)" $amount 2>/dev/null || echo '{"status":"0x0"}')
        local deposit_status=$(echo $deposit_result | jq -r '.status // "0x0"')
        if [ "$deposit_status" = "0x1" ]; then
            echo "✓"
        else
            echo "✗ failed"
        fi
        
        # Small delay between operations
        sleep 1
    done
    echo ""
}

# Main simulation loop
echo "Starting mock activity simulation for $DAYS days"
echo "DO_HARVEST=$DO_HARVEST"
echo "Each day duration: $DAY_DURATION seconds"
echo ""

# Perform initial deposits for all users
perform_initial_deposits

for ((day=1; day<=DAYS; day++)); do
    echo -e "==================== DAY $day ====================\n"
    
    # Simulate user activity
    simulate_day_activity $day
    
    # Owner actions at end of day
    perform_owner_actions $day
    
    # Advance time (except for last day)
    if [ $day -lt $DAYS ]; then
        advance_time
        echo -e "Waiting 5 seconds before next day...\n"
        sleep 5
    fi
done

echo "Mock activity simulation completed!"