# Architecture

See root README for product overview.

## Authorization matrix

| Action | Auth |
| --- | --- |
| register org | account |
| create shipment | creator + role checks via factory |
| mark in transit | carrier |
| record handoff | actor matching stage parties |
| submit inspection | shipment inspector |
| settle | receiver (or admin) |
| advance_status | handoff / inspection / settlement contracts only |

## Storage

- Instance: config, admin, counters  
- Persistent: orgs, shipments, handoffs, inspections, settlements  
- TTL extended on write  

## Frontend layers

- UI components (presentational)
- Features (domain screens)
- Hooks (wallet / actions / toast)
- lib/contracts + lib/stellar (blockchain I/O)
- lib/errors (humanized failures)
