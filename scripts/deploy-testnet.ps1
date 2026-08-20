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

function Get-ContractId([string]$Alias) {
  $id = (stellar contract id $Alias --network $Network 2>$null)
  if (-not $id) {
    throw "Failed to resolve contract ID for alias '$Alias' on $Network"
  }
  return $id.Trim()
}

function Deploy([string]$WasmName, [string]$Alias) {
  $path = Join-Path $Wasm "$WasmName.wasm"
  if (-not (Test-Path $path)) { throw "Missing $path" }
  Write-Host "--> Deploying $Alias ($WasmName)"
  stellar contract deploy --wasm $path --source-account $Source --network $Network --alias $Alias | Out-Host
  return Get-ContractId $Alias
}

$Registry = Deploy "organization_registry" "rp-registry"
$Shipment = Deploy "shipment" "rp-shipment"
$Factory = Deploy "shipment_factory" "rp-factory"
$Handoff = Deploy "handoff_proof" "rp-handoff"
$Inspection = Deploy "inspection" "rp-inspection"
$Settlement = Deploy "settlement" "rp-settlement"
$Admin = (stellar keys address $Source).Trim()

Write-Host "==> Using contract IDs:"
Write-Host "Registry=$Registry"
Write-Host "Shipment=$Shipment"
Write-Host "Factory=$Factory"
Write-Host "Handoff=$Handoff"
Write-Host "Inspection=$Inspection"
Write-Host "Settlement=$Settlement"

Write-Host "==> Initializing protocol graph"
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
Write-Host "Copy to apps\web\.env.local and update docs/TESTNET.md with the new contract IDs."
