#!/usr/bin/env bash

set -ue

# Watch for changes in the wagmi contracts and restart bot
exec watchexec \
  --watch packages/wagmi/contracts \
  --restart \
  --wrap-process=session \
  --exts ts \
  --shell=bash \
  -- 'clear && echo "🚀 Starting bot..." && sleep 3 && cd bot && npm run dev'
