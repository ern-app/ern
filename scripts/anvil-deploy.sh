#!/usr/bin/env bash

export MNEMONIC="test test test test test test test test test test test junk"
export DEPLOYER="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# forge soldeer update
#
export FOUNDRY_PROFILE=deploy

forge build
cast rpc anvil_reset
sleep 0.2
forge script Dev \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --mnemonics "$MNEMONIC" \
  --sender "$DEPLOYER"
result=$?

cast rpc evm_increaseTime $((7 * 24 * 3600)) > /dev/null
cast rpc evm_mine > /dev/null

cd packages/wagmi
npx wagmi generate

cd ../../frontend
npm run wagmi:gen

# if [ $result -eq 0 ]; then
#   clear
# fi
# cat ../../packages/wagmi/contracts/31337.ts
