# RouteProof — Stellar Testnet deployment

Network: **Testnet**  
Passphrase: `Test SDF Network ; September 2015`  
Admin / deployer: `GC5VBHY5DWV7NTL4PCQL3XGOE4FY2DJHM2JYLRC6YS2IHYTPDZ4DOFIU`

## Contract addresses (current)

| Contract | Address |
| --- | --- |
| Organization Registry | `CBEXUO3HHZPXW53ASP7YVSPKHE2VJ22ZSIDUKEWWYOSOQNC6VRSE6GG3` |
| Shipment | `CASDW56YOVZVLKGG6XOK5S7YZS6VUQCJ6TA24OE22NP2SKFIDSSACYCH` |
| Shipment Factory | `CAB4GA22LSWQ3SMEWLCTQLYVQNG36MPCZIT4Z4OREGHBCZJK57ZUK22L` |
| Handoff Proof | `CC6GQZELGLUQTL3LD3QQ4ZGDQH5DHRLHXRWTXA5EGZWWPDI3FDKK4P2W` |
| Inspection | `CDKYWMFYXYRS5YLPEWMTILU26ZFSC66L2BHINVWWZQB5GYGIOIOKLKYA` |
| Settlement | `CCNK2HTS7OVGMA32HP6JVSMIWMB4XSX2OHKUA45FLRWZWV2HPGF7KIA7` |

## Real transaction hashes

| Step | Tx hash | Explorer |
| --- | --- | --- |
| Deploy registry | `8b9aea54f4c918dcb7d0244daa4aa76ea42aa8fd43564d1a1c8aa5e8e86d73d0` | [view](https://stellar.expert/explorer/testnet/tx/8b9aea54f4c918dcb7d0244daa4aa76ea42aa8fd43564d1a1c8aa5e8e86d73d0) |
| Deploy shipment | `c3292ea339899418d0b5154f56570ae85f976fdde79b196af057e99f2b8286de` | [view](https://stellar.expert/explorer/testnet/tx/c3292ea339899418d0b5154f56570ae85f976fdde79b196af057e99f2b8286de) |
| Deploy factory | `d8e8da0c9a82b6b9804826dd2b614780cc84f46212eef50557f0207a38c34f73` | [view](https://stellar.expert/explorer/testnet/tx/d8e8da0c9a82b6b9804826dd2b614780cc84f46212eef50557f0207a38c34f73) |
| Register org (live) | `4cdac45aa84b8c7cab36b1cf4bd818971267a5115e89909b18479820d3b381e4` | [view](https://stellar.expert/explorer/testnet/tx/4cdac45aa84b8c7cab36b1cf4bd818971267a5115e89909b18479820d3b381e4) |

## Reproduce

```powershell
.\scripts\deploy-testnet.ps1
Copy-Item apps\web\.env.local.generated apps\web\.env.local
```
