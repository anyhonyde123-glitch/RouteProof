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

$Registry = "CAZOCNOLQVYE4FYXJ6GFWAG4LV5ADTSTAS4PXUBVWDDA3INYMTEIERCJ"
$Shipment = "CDOKVR24PMFM5WWFSC4BEIPXAASZKZLS53ENI6NAWYZF6BJC3DC4EN64"
$Factory = "CAJZPPLCPGKIEUD6FJ2QGYGFQV7LHDCP6ANQ4IXSX3FO23O3UX3VBJ2U"
$Handoff = "CCUNFS7M3W4P4HN5CFU3UYYNP7OCL7NBPYEUMS3X44Y4XFNUL45ULGA3"
$Inspection = "CCH7W77VHYABPGHSUSCUXJBNLCPQF7TBCHKRECFESBYY7A7H4VEPJVIK"
$Settlement = "CAZTWBA6UO27JVVEWEZL2J6X53P2DTUPKNJQ25JKBD4FIWV3G2XHFW54"
$Admin = (stellar keys address $Source).Trim()

# Prefer freshly deployed IDs from this run if aliases resolve; otherwise use last known Testnet IDs above.
try {
  $maybe = (stellar contract alias show rp-registry --network $Network 2>$null)
} catch { }

Write-Host "==> Using contract IDs:"
Write-Host "Registry=$Registry"
Write-Host "Shipment=$Shipment"
Write-Host "Factory=$Factory"
Write-Host "Handoff=$Handoff"
Write-Host "Inspection=$Inspection"
Write-Host "Settlement=$Settlement"

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
