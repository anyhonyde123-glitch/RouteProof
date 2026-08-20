# RouteProof

**Verifiable proof-of-handoff for logistics on Stellar Soroban.**

RouteProof lets logistics organizations create shipments and record cryptographically verifiable custody handoffs, inspections, and delivery events across the full shipment lifecycle — so disputes stop living in email threads and spreadsheets.

```
Sender → Carrier → Warehouse → Inspector → Receiver → Completed
```

---

## Problem

Handoff records are fragmented across carriers, warehouses, and inspectors. When freight is damaged, late, or missing, teams argue over **who held custody** and **when** — without a shared, immutable timeline.

## Solution

RouteProof records each critical custody transition on Stellar as a first-class on-chain event, with:

- Authorized participants (organization roles)
- Strict shipment state machine
- Handoff proofs with metadata hashes
- Inspection approve/reject
- Final settlement / completion

## Why Stellar

- Low-cost, fast finality for high-frequency logistics events
- Soroban smart contracts with strong auth and C2C composition
- Public verifiability without exposing private ERP data (hash-based proofs)

---

## Smart contract architecture

| Contract | Responsibility |
| --- | --- |
| `organization-registry` | Org registration, role bitmasks, verification |
| `shipment-factory` | Role-gated shipment creation entrypoint |
| `shipment` | Central lifecycle / participants / status |
| `handoff-proof` | Custody handoffs + duplicate prevention |
| `inspection` | Inspection submit / approve / reject |
| `settlement` | Delivered → Completed settlement |

### Contract-to-contract flow

```
OrganizationRegistry  ←── has_role
        ↑
ShipmentFactory ──create──► Shipment
                               ↑
HandoffProof ──advance_status──┤
Inspection ──advance_status────┤
Settlement ──advance_status────┘
```

### State machine

```
CREATED → PICKED_UP → IN_TRANSIT → WAREHOUSE_RECEIVED
  → INSPECTION_PENDING → INSPECTED → OUT_FOR_DELIVERY
  → DELIVERED → COMPLETED
```

Invalid transitions, unauthorized actors, duplicate handoffs, and double settlement are rejected on-chain.

### Roles (bitmask)

`Sender=1` · `Carrier=2` · `Warehouse=4` · `Inspector=8` · `Receiver=16`

---

## Repository layout

```
routeproof/
├── contracts/                 # Six Soroban crates
├── packages/integration-tests/
├── apps/web/                  # Next.js 15 frontend
├── scripts/                   # Build + Testnet deploy
├── docs/
└── .github/workflows/ci.yml
```

---

## Setup

### Prerequisites

- Rust stable + `wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) v25+
- Node.js 22+
- Freighter wallet (Testnet)

```bash
rustup target add wasm32v1-none
```

### Smart contracts

```bash
cargo test -p organization-registry -p shipment -p shipment-factory \
  -p handoff-proof -p inspection -p settlement --lib
cargo test -p routeproof-integration-tests
stellar contract build
```

### Frontend

```bash
cd apps/web
cp .env.example .env.local
# fill contract IDs from deploy output
npm install
npm run dev
```

### Testnet deploy (Windows)

```powershell
stellar keys generate deployer --network testnet --fund   # once
.\scripts\deploy-testnet.ps1
Copy-Item apps\web\.env.local.generated apps\web\.env.local
```

---

## Testnet deployment

| Contract | Address |
| --- | --- |
| Registry | `CAZOCNOLQVYE4FYXJ6GFWAG4LV5ADTSTAS4PXUBVWDDA3INYMTEIERCJ` |
| Shipment | `CDOKVR24PMFM5WWFSC4BEIPXAASZKZLS53ENI6NAWYZF6BJC3DC4EN64` |
| Factory | `CAJZPPLCPGKIEUD6FJ2QGYGFQV7LHDCP6ANQ4IXSX3FO23O3UX3VBJ2U` |
| Handoff | `CCUNFS7M3W4P4HN5CFU3UYYNP7OCL7NBPYEUMS3X44Y4XFNUL45ULGA3` |
| Inspection | `CCH7W77VHYABPGHSUSCUXJBNLCPQF7TBCHKRECFESBYY7A7H4VEPJVIK` |
| Settlement | `CAZTWBA6UO27JVVEWEZL2J6X53P2DTUPKNJQ25JKBD4FIWV3G2XHFW54` |

Network: **Testnet** · Passphrase: `Test SDF Network ; September 2015`

Example real deploy tx: [`f51ec89b…44a2`](https://stellar.expert/explorer/testnet/tx/f51ec89b0c79a180b5f0de4c144a1ca73e5a1574d8beafb93fb02ec829ee44a2) — full table in [`docs/TESTNET.md`](docs/TESTNET.md).

---

## CI/CD

GitHub Actions runs on push/PR:

1. Format + Clippy  
2. Contract unit + integration tests  
3. WASM build  
4. Frontend lint, typecheck, Vitest, production build  

---

## Demo workflow (~90 seconds)

1. Connect Freighter (Testnet)  
2. Register organizations / roles  
3. Create a shipment with five participants  
4. Record Pickup → Transit → Warehouse → Inspection → Delivery handoffs  
5. Settle completion  
6. Open `/verify/[id]` for public custody timeline  

---

## Screenshots

Add screenshots under `docs/screenshots/` for:

- Landing hero  
- Dashboard  
- Shipment timeline  
- Public verify page  
- CI green run  
- Test output  

---

## Known limitations

- Proof payloads are content hashes (off-chain blobs not stored on-chain)
- Mutual multi-party cancel patterns may require multiple signatures
- Event indexing is client-side via contract reads (no dedicated indexer yet)

## Roadmap (Green Belt ready)

- QR-based public verify  
- 10+ real logistics users  
- Indexer + analytics warehouse  
- Monitoring / alerts  
- Production mainnet hardening  

---

## License

Apache-2.0
