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
  --rpc-url https://bityield.stacks.ethui.dev \
  --broadcast \
  --mnemonics "$MNEMONIC" \
  --sender "$DEPLOYER"
result=$?

cd packages/wagmi
npx wagmi generate

if [ $result -eq 0 ]; then
  clear
fi
cat contracts/15628905.ts
