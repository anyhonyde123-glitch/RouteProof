#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo "==> Building RouteProof WASM contracts"
stellar contract build
ls -lh target/wasm32v1-none/release/{organization_registry,shipment,shipment_factory,handoff_proof,inspection,settlement}.wasm 2>/dev/null \
  || ls -lh target/wasm32v1-none/release/*.wasm
echo "==> Done"
