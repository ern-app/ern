#!/usr/bin/env bash

set -ue

exec watchexec \
  --watch contracts \
  --restart \
  --wrap-process=none \
  --exts sol,toml ./scripts/anvil-deploy.sh
