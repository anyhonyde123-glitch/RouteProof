# RouteProof — Stellar Testnet deployment

Network: **Testnet**  
Passphrase: `Test SDF Network ; September 2015`  
Admin / deployer: `GC5VBHY5DWV7NTL4PCQL3XGOE4FY2DJHM2JYLRC6YS2IHYTPDZ4DOFIU`

## Contract addresses

| Contract | Address |
| --- | --- |
| Organization Registry | `CAZOCNOLQVYE4FYXJ6GFWAG4LV5ADTSTAS4PXUBVWDDA3INYMTEIERCJ` |
| Shipment | `CDOKVR24PMFM5WWFSC4BEIPXAASZKZLS53ENI6NAWYZF6BJC3DC4EN64` |
| Shipment Factory | `CAJZPPLCPGKIEUD6FJ2QGYGFQV7LHDCP6ANQ4IXSX3FO23O3UX3VBJ2U` |
| Handoff Proof | `CCUNFS7M3W4P4HN5CFU3UYYNP7OCL7NBPYEUMS3X44Y4XFNUL45ULGA3` |
| Inspection | `CCH7W77VHYABPGHSUSCUXJBNLCPQF7TBCHKRECFESBYY7A7H4VEPJVIK` |
| Settlement | `CAZTWBA6UO27JVVEWEZL2J6X53P2DTUPKNJQ25JKBD4FIWV3G2XHFW54` |

## Real deploy transaction hashes

| Step | Tx hash | Explorer |
| --- | --- | --- |
| Deploy registry | `f51ec89b0c79a180b5f0de4c144a1ca73e5a1574d8beafb93fb02ec829ee44a2` | [view](https://stellar.expert/explorer/testnet/tx/f51ec89b0c79a180b5f0de4c144a1ca73e5a1574d8beafb93fb02ec829ee44a2) |
| Deploy shipment | `e9eab77be710710ff35b1f5a7b4e1cda57dfa733ffd99a1a659b25ede65f755e` | [view](https://stellar.expert/explorer/testnet/tx/e9eab77be710710ff35b1f5a7b4e1cda57dfa733ffd99a1a659b25ede65f755e) |
| Deploy factory | `3f35c67fd989e5c90a4431d0e0484c4f328a9aa0da0d927bc0380baac5aaaa5f` | [view](https://stellar.expert/explorer/testnet/tx/3f35c67fd989e5c90a4431d0e0484c4f328a9aa0da0d927bc0380baac5aaaa5f) |
| Deploy handoff | `fb2718439bd6a40eca60a3546a9fcb8f74b0fc36eb3d4fe9a3cb6b7bc4a77a43` | [view](https://stellar.expert/explorer/testnet/tx/fb2718439bd6a40eca60a3546a9fcb8f74b0fc36eb3d4fe9a3cb6b7bc4a77a43) |
| Deploy inspection | `a9bd164c15d97b4048515d563a78b1f0ad92c0715d16e78d6748719c9c4ae729` | [view](https://stellar.expert/explorer/testnet/tx/a9bd164c15d97b4048515d563a78b1f0ad92c0715d16e78d6748719c9c4ae729) |
| Deploy settlement | `ce26a990ab4b10f0b3bd8000d6ba67ae5c30dc5ab4c23db17001481394a56f6a` | [view](https://stellar.expert/explorer/testnet/tx/ce26a990ab4b10f0b3bd8000d6ba67ae5c30dc5ab4c23db17001481394a56f6a) |
| Register org (live interaction) | `bc714f6a99ea80dd59fff5457f588f3ce472c58d4dafd319dcae3da4372560e4` | [view](https://stellar.expert/explorer/testnet/tx/bc714f6a99ea80dd59fff5457f588f3ce472c58d4dafd319dcae3da4372560e4) |

## Reproduce

```powershell
.\scripts\deploy-testnet.ps1
```

Copy generated env into `apps/web/.env.local`.
