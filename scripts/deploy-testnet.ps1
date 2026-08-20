# Deploy RouteProof to Stellar Testnet and initialize the protocol graph.
param(
  [string]$Network = "testnet",
  [string]$Source = "deployer"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> Building contracts"
stellar contract build

$Wasm = Join-Path $Root "target\wasm32v1-none\release"

function Deploy([string]$WasmName, [string]$Alias) {
  $path = Join-Path $Wasm "$WasmName.wasm"
  if (-not (Test-Path $path)) { throw "Missing $path" }
  Write-Host "--> Deploying $Alias"
  stellar contract deploy --wasm $path --source-account $Source --network $Network --alias $Alias
}

Deploy "organization_registry" "rp-registry"
Deploy "shipment" "rp-shipment"
Deploy "shipment_factory" "rp-factory"
Deploy "handoff_proof" "rp-handoff"
Deploy "inspection" "rp-inspection"
Deploy "settlement" "rp-settlement"

$Registry = (stellar contract id --alias rp-registry --network $Network).Trim()
$Shipment = (stellar contract id --alias rp-shipment --network $Network).Trim()
$Factory = (stellar contract id --alias rp-factory --network $Network).Trim()
$Handoff = (stellar contract id --alias rp-handoff --network $Network).Trim()
$Inspection = (stellar contract id --alias rp-inspection --network $Network).Trim()
$Settlement = (stellar contract id --alias rp-settlement --network $Network).Trim()
$Admin = (stellar keys address $Source).Trim()

Write-Host "==> Initializing protocol (admin=$Admin)"

stellar contract invoke --id $Registry --source-account $Source --network $Network -- initialize --admin $Admin
stellar contract invoke --id $Shipment --source-account $Source --network $Network -- `
  initialize --admin $Admin --registry $Registry --factory $Factory --handoff $Handoff --inspection $Inspection --settlement $Settlement
stellar contract invoke --id $Factory --source-account $Source --network $Network -- `
  initialize --admin $Admin --registry $Registry --shipment $Shipment
stellar contract invoke --id $Handoff --source-account $Source --network $Network -- `
  initialize --admin $Admin --registry $Registry --shipment $Shipment
stellar contract invoke --id $Inspection --source-account $Source --network $Network -- `
  initialize --admin $Admin --registry $Registry --shipment $Shipment
stellar contract invoke --id $Settlement --source-account $Source --network $Network -- `
  initialize --admin $Admin --shipment $Shipment

$EnvOut = Join-Path $Root "apps\web\.env.local.generated"
@"
NEXT_PUBLIC_STELLAR_NETWORK=$Network
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_REGISTRY_ID=$Registry
NEXT_PUBLIC_SHIPMENT_ID=$Shipment
NEXT_PUBLIC_FACTORY_ID=$Factory
NEXT_PUBLIC_HANDOFF_ID=$Handoff
NEXT_PUBLIC_INSPECTION_ID=$Inspection
NEXT_PUBLIC_SETTLEMENT_ID=$Settlement
"@ | Set-Content -Path $EnvOut -Encoding UTF8

Write-Host "==> Wrote $EnvOut"
Write-Host "REGISTRY=$Registry"
Write-Host "SHIPMENT=$Shipment"
Write-Host "FACTORY=$Factory"
Write-Host "HANDOFF=$Handoff"
Write-Host "INSPECTION=$Inspection"
Write-Host "SETTLEMENT=$Settlement"
