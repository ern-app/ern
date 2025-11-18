#!/usr/bin/env bash

export MNEMONIC="test test test test test test test test test test test junk"
export DEPLOYER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

set -ue

echo "🌾 Starting yield generator..."
echo "📊 Generating 500 USDC + 400 USDT yield every 30 seconds"
echo "⏰ Press Ctrl+C to stop"

# Wait for contracts to be deployed before starting
echo "⏳ Waiting 5 seconds for contracts to be deployed..."
sleep 5

while true; do
    echo ""
    echo "🔄 $(date): Generating 500 USDC + 400 USDT yield..."
    
    # Advance block timestamp by 24 hours (86400 seconds)
    echo "⏰ Advancing block timestamp by 24 hours..."
    if cast rpc evm_increaseTime 86400 --rpc-url http://localhost:8545 >/dev/null 2>&1; then
        echo "✅ Timestamp advanced successfully"
    else
        echo "⚠️  Could not advance timestamp (continuing anyway)"
    fi
    
    # Run the forge script to generate yield using default amounts
    if forge script contracts/script/GenerateYield.s.sol \
        --broadcast \
        --rpc-url http://localhost:8545 \
        --mnemonics "$MNEMONIC" \
        --sender "$DEPLOYER" \
        --sig "run()" \
        --silent; then
        echo "✅ Yield generated successfully"
    else
        echo "❌ Failed to generate yield (contracts may not be deployed yet)"
    fi
    
    echo "💤 Waiting 30 seconds before next yield generation..."
    sleep 30
done
