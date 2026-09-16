# Architecture Evolution Lab Mission Matrix

This is the control ledger for the 79 core missions. A row is not a mission
implementation. It becomes actionable only after its exact source section,
evidence plan, storyboard, review, and implementation gate are complete.

Legend: ⬜ NOT STARTED · 🟨 IN PROGRESS · 🟦 IMPLEMENTED / NEEDS QA · ✅ VERIFIED · ⛔ BLOCKED

## Act I — One Machine, First Limits

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M01 | Open the Shop | 1.1 | A | 🟦 |
| M02 | Follow One Request | 1.1 | A | 🟦 |
| M03 | Find the Three Local Assumptions | 1.1 | A | 🟦 |
| M04 | Disk Full at 02:00 | 1.2 | A | 🟦 |
| M05 | The Network Is Now Part of the System | 1.2 | A | 🟦 |
| M06 | Fifty Connections or Five Hundred? | 1.2 | A | 🟦 |
| M07 | The 5-Second Tomcat | 1.3 | Later | 🟨 |
| M08 | CPU Bottleneck | 1.3 | Later | ⬜ |
| M09 | Memory and Full GC | 1.3 | Later | ⬜ |
| M10 | CPU Is Idle, Yet the Site Is Slow | 1.3 | Later | ⬜ |
| M11 | Thread Pool Trade-off | 1.3 | Later | ⬜ |
| M12 | Bigger Machine or More Machines? | 1.4 | Later | ⬜ |
| M13 | Amdahl's Wall | 1.4 | Later | ⬜ |
| M14 | Database Becomes the Hotspot | 2.1 | B | ⬜ |
| M15 | Cache-Aside | 2.1 | B | ⬜ |
| M16 | The Four Cache Disasters | 2.3–2.4 | B | ⬜ |

## Act II — Scale Out and Data Growth

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M17 | Add the Second Web Server | 3.1 | Later | ⬜ |
| M18 | The Vanishing Shopping Cart | 3.2 | Later | ⬜ |
| M19 | Sticky Sessions: The Fast Fix | 3.2 | Later | ⬜ |
| M20 | Move Session Out | 3.2 | Later | ⬜ |
| M21 | JWT: Stateless Does Not Mean No State | 3.2 | Later | ⬜ |
| M22 | L4 vs L7 Traffic | 3.3 | Later | ⬜ |
| M23 | The Front Door Is a Single Point | 3.3–3.4 | Later | ⬜ |
| M24 | Users Are Far Away | 3.4 | Later | ⬜ |
| M25 | Reads and Writes Fight | 4.1 | Later | ⬜ |
| M26 | I Paid, Why Can't I See It? | 4.1 | Later | ⬜ |
| M27 | One Database, Too Many Businesses | 4.2 | Later | ⬜ |
| M28 | The Giant Orders Table | 4.3 | Later | ⬜ |
| M29 | Hot Shard | 4.3 | Later | ⬜ |
| M30 | Half an Order | 4.4 | Later | ⬜ |
| M31 | Where Did My JOIN Go? | 4.4 | Later | ⬜ |

## Act III — Services and Distributed Failure

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M32 | The Monolith Team Collision | 5.1 | Later | ⬜ |
| M33 | Extract Product Service | 5.1 | Later | ⬜ |
| M34 | Shared Capability Becomes RPC | 5.2 | Later | ⬜ |
| M35 | Where Is Inventory Service? | 5.3 | Later | ⬜ |
| M36 | Slow Logistics, Dead Store | 5.4 | Later | ⬜ |
| M37 | Rate Limit the Flood | 5.4 | Later | ⬜ |
| M38 | Circuit Break the Bad Dependency | 5.4 | Later | ⬜ |
| M39 | Degrade to Save Checkout | 5.4 | Later | ⬜ |
| M40 | One Database Cannot Serve Every Workload | 6.1 | Later | ⬜ |
| M41 | Build Product Search with Elasticsearch | 6.1 | Later | ⬜ |
| M42 | Search Shows Yesterday's Title | 6.1 | Later | ⬜ |
| M43 | Midnight ×100 | 6.2 | Later | ⬜ |
| M44 | Duplicate Message | 6.2 | Later | ⬜ |
| M45 | Order, Stock and Transactional Messages | 6.2 / 4.4 | Later | ⬜ |

## Act IV — Containerisation

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M46 | Works on My Machine | 6.4 | C | ⬜ |
| M47 | Release Server 17 | 6.4 | C | ⬜ |
| M48 | Package the Environment | 7.1–7.3 | C | ⬜ |
| M49 | Image Is Not Container | 7.2 | C | ⬜ |
| M50 | Write the Dockerfile | 7.3 | C | ⬜ |
| M51 | Four Services, One Command | 7.4 | C | ⬜ |
| M52 | Network and Persistent Data | 8.1–8.2 | C | ⬜ |
| M53 | From 4 Containers to 4,000 | 8.3 | C | ⬜ |

## Act V — Kubernetes and Elasticity

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M54 | Declare 200 Replicas | 9.1–9.3 | Later | ⬜ |
| M55 | Control Plane and Workers | 9.2 | Later | ⬜ |
| M56 | Pod, ReplicaSet, Deployment | 9.3 | Later | ⬜ |
| M57 | Release Without Midnight Downtime | 9.4 | Later | ⬜ |
| M58 | Stable Name for Moving Pods | 10.1 | Later | ⬜ |
| M59 | The External Front Door | 10.2 | Later | ⬜ |
| M60 | Service-to-Service Governance | 10.3 | Later | ⬜ |
| M61 | Configuration and Storage | 10.4 | Later | ⬜ |
| M62 | Alive Is Not Ready | 11.1 | D | ⬜ |
| M63 | The Campaign Autoscaler | 11.2 | D | ⬜ |
| M64 | CPU Looks Fine, Queue Is Exploding | 11.2 / 6.2 | D | ⬜ |
| M65 | Pods Need Nodes, Nodes Need Limits | 11.2–11.4 | D | ⬜ |

## Act VI — Rethinking Cloud Native

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M66 | We Split Too Far | 12.1 | Later | ⬜ |
| M67 | Merge or Keep Separate? | 12.2 | Later | ⬜ |
| M68 | Event Work Without Permanent Servers | 12.3–12.4 | Later | ⬜ |
| M69 | Git Is the Deployment Record | 13.1 | Later | ⬜ |
| M70 | 99.99% → 99.5% at Midnight | 13.2 | Later | ⬜ |
| M71 | Reliability Has a Price | 13.3–13.4 | Later | ⬜ |

## Act VII — AI Workloads

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M72 | Add an AI Shopping Assistant | 14.1 | Later | ⬜ |
| M73 | GPU Is Not Ordinary CPU | 14.2–14.5 | Later | ⬜ |
| M74 | Deploy Inference as a Service | 14.3–14.5 | Later | ⬜ |
| M75 | Ten Thousand Agents Need a Runway | 15.2 | Later | ⬜ |
| M76 | Same User, Different Worker | 15.2–15.4 | Later | ⬜ |
| M77 | Route Models, Limit Tokens, Queue Work | 16.1–16.4 | Later | ⬜ |

## Act VIII — Architecture Judgment

| ID | Mission | Source | Slice | Status |
|---|---|---|---|---|
| M78 | The Architecture Time Machine | 17.2–17.4 / B.1 | Later | ⬜ |
| M79 | Build the Smallest Architecture That Works | 17.3–17.4 | Later | ⬜ |
