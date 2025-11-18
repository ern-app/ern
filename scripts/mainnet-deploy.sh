#!/bin/sh

forge script contracts/script/Mainnet.s.sol:Mainnet \
  --rpc-url $MAINNET_RPC_URL \
  --private-key $MAINNET_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY 
