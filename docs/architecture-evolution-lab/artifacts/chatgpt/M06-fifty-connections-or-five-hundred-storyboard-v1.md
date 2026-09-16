# M06 — Fifty Connections or Five Hundred?

## Architecture Evolution Lab — storyboard capture v1

> Mission-sized storyboard artifact generated in the selected ChatGPT
> conversation on 2026-09-16. Status in the source artifact: **DRAFT FOR
> REVIEW. NOT ACCEPTED.**

This file records the complete contract visible in the ChatGPT artifact
preview. The browser blocked the raw attachment download endpoint, so this is
a faithful local capture of the reviewed content, not a claim that the raw
attachment was downloaded unchanged.

## Provenance and scope

- Primary source: `ccc115a/se`, `_more/mybook/向淘寶學習網站架構演進/1.2.md`
- Source blob: `00756d5a3a4054cd9592e19199c10626cdce993a`
- Source-backed examples: `jdbc.maxPoolSize=50` and MySQL
  `max_connections=500`; neither is a universal recommendation.
- Fictional framing: Atlas Market load lab.
- All invented workload, queue, CPU, throughput, latency, error and score
  values are `TEACHING_SIMULATION`.

## Learner objective

M05 already established separated Web/Tomcat and MySQL hosts, a JDBC network
dependency, and bounded timeout/retry behaviour. M06 does not redesign M05.
The player investigates how application-pool admission interacts with DB
capacity and discovers:

```text
concurrent DB demand
→ app pool admission
→ DB capacity / useful concurrency
→ queue location and DB contention
→ latency, throughput and errors
```

The required loop is:

```text
OBSERVE → INVESTIGATE → DIAGNOSE → PREDICT →
CHANGE_ONE_CONFIGURATION → RUN_CONTROLLED_EXPERIMENT → REVEAL →
EXPLAIN → SCORE → REPLAY
```

The neutral opening must not reveal the diagnosis, the winning candidate, or
the result table. The initial CTA is `INVESTIGATE CAPACITY`.

## Evidence and diagnosis contract

Seven evidence cards are mandatory and must be individually inspected:

| ID | Evidence | Provenance / role |
|---|---|---|
| E01 | Application `maxPoolSize=50` | `SOURCE_BACKED_SOURCE_EXAMPLE`, not recommendation |
| E02 | MySQL `max_connections=500` | `SOURCE_BACKED_SOURCE_EXAMPLE`, not target utilisation |
| E03 | App-pool wait queue | `TEACHING_SIMULATION` |
| E04 | DB CPU pressure signal | `TEACHING_SIMULATION`, not M07 CPU tuning |
| E05 | p95 request latency in ms | `TEACHING_SIMULATION` |
| E06 | Completed throughput and errors | `TEACHING_SIMULATION` |
| E07 | Fixed workload and seed | `240 / 12s = 20 req/s`, seed `20260916`, simulation |

Diagnosis controls remain locked until all seven unique cards are inspected.
The correct diagnosis is `CONNECTION_ADMISSION_MISMATCH`, with proof requiring
E01, E02, one of E03/E04, one of E05/E06, and `proof ⊆ inspected`. Wrong M05,
M04 and Web-CPU hypotheses remain recoverable and do not reveal the answer.

## State machine and reveal guards

```text
OBSERVE
→ INVESTIGATE
→ DIAGNOSE
→ PREDICT_BASELINE
→ RUN_BASELINE
→ REVEAL_BASELINE
→ PREDICT_CHANGE
→ CHANGE_ONE_CONFIGURATION
→ RUN_CONTROLLED_EXPERIMENT
→ REVEAL
→ EXPLAIN
→ SCORE
→ COMPLETE
```

The player predicts five qualitative baseline dimensions before the first
reveal, then five relative dimensions before the changed-run reveal. Changing
the candidate invalidates stale predictions. Results are not exposed in the
DOM, live region or hidden table before the corresponding prediction commit.

## Candidate configurations

Only the app-pool size changes between runs. Workload, DB ceiling, topology,
DB model and M05 timeout/retry policy remain fixed.

| Candidate | Pool size | Intended trade-off |
|---|---:|---|
| `SMALL_POOL` | 10 | App-side queueing, moderate DB pressure, underused useful capacity |
| `FIT_POOL` | 60 | Best fit for this fixed teaching model; not universal advice |
| `LARGE_POOL` | 300 | Less app waiting but DB contention, latency and errors increase |

## Deterministic teaching simulation

Fixed controls: 240 requests, 12 seconds, 20 requests/s offered demand, DB
ceiling 500 (source example), efficient-concurrency knee 80 (simulation), and
seed 20260916. Canonical result values:

| Candidate | App wait | DB contention | DB CPU | Throughput | p95 | Errors |
|---|---:|---:|---:|---:|---:|---:|
| `SMALL_POOL` | 14 req | 0 req | 60% | 10 req/s | 420 ms | 0% |
| `FIT_POOL` | 3 req | 2 req | 78% | 18 req/s | 190 ms | 0% |
| `LARGE_POOL` | 0 req | 38 req | 99% | 15 req/s | 880 ms | 8% |

Every value in this table is `TEACHING_SIMULATION`. The directional
invariants are explicit: throughput is highest at the fit candidate; DB CPU,
DB contention, latency and errors rise in the oversubscribed case; and larger
pool size does not imply larger throughput.

## Causal explanation

The player orders and links:

```text
CONCURRENT_DB_DEMAND_ARRIVES
→ APP_POOL_ADMITS_DB_WORK
→ DB_CAPACITY_LIMITS_USEFUL_CONCURRENCY
→ EXCESS_WORK_QUEUES_AT_A_BOUNDARY
→ TOO_MUCH_DB_CONCURRENCY_INCREASES_CONTENTION
→ QUEUEING_AND_CONTENTION_CHANGE_LATENCY
→ THROUGHPUT_HAS_A_USEFUL_REGION_NOT_A_MONOTONIC_MAXIMUM
```

Required links are E01→pool admission, E02→DB capacity, E03→queue boundary,
E04→contention, E05→latency, and E06→non-monotonic throughput. The final
explanation must state the small/fit/large trade-off and must not claim that
60 is always optimal or that the app should consume all 500 DB connections.

## Scoring, recovery and replay

| Category | Points |
|---|---:|
| Investigation | 15 |
| Diagnosis and proof | 15 |
| Baseline prediction | 10 |
| Controlled change | 10 |
| Changed-run prediction | 10 |
| Experiment reconciliation | 15 |
| Causal explanation | 15 |
| Trade-off and boundary | 5 |
| Efficiency | 5 |
| **Total** | **100** |

Efficiency is 5/4/3/2 for 0/1/2/3+ recoveries. A wrong candidate or wrong
reconciliation is recoverable, but requires a new prediction before rerun. The
clean canonical path is 100/100; the specified one-recovery example is
94/100. Replay returns to `0/7 INSPECTED` with no diagnosis, prediction,
result, score or stale run state.

Completion rejects unseen proof, reveal-before-predict, stale predictions,
changed DB ceiling/workload/M05 policy, an unrun `FIT_POOL`, a non-canonical
causal chain, or a score inherited from an earlier state.

## Accessibility, QA and runtime boundary

The storyboard requires a usable 390×844 route, keyboard-only completion,
tap-safe controls without drag-only interactions, reduced-motion semantics,
screen-reader labels/live announcements, provenance text that is not colour
only, and committed desktop/mobile/accessibility evidence before verification.

M06 is limited to application DB connection admission versus DB capacity. It
does not teach or expose M07 CPU/thread/memory/GC lessons, replicas, caches,
load balancers, queues/Kubernetes, sharding, local-image migration, or a
hidden M05 redesign. The next-incident hook remains neutral.

## Acceptance registry

The artifact preview contains 50 acceptance rows and an exact registry with
the same contiguous IDs:

```yaml
test_ids:
  - M06-T001
  - M06-T002
  - M06-T003
  - M06-T004
  - M06-T005
  - M06-T006
  - M06-T007
  - M06-T008
  - M06-T009
  - M06-T010
  - M06-T011
  - M06-T012
  - M06-T013
  - M06-T014
  - M06-T015
  - M06-T016
  - M06-T017
  - M06-T018
  - M06-T019
  - M06-T020
  - M06-T021
  - M06-T022
  - M06-T023
  - M06-T024
  - M06-T025
  - M06-T026
  - M06-T027
  - M06-T028
  - M06-T029
  - M06-T030
  - M06-T031
  - M06-T032
  - M06-T033
  - M06-T034
  - M06-T035
  - M06-T036
  - M06-T037
  - M06-T038
  - M06-T039
  - M06-T040
  - M06-T041
  - M06-T042
  - M06-T043
  - M06-T044
  - M06-T045
  - M06-T046
  - M06-T047
  - M06-T048
  - M06-T049
  - M06-T050
```

The acceptance matrix covers fresh opening/provenance, E01–E07, evidence and
prediction gates, each candidate and canonical result, one-variable diff,
reconciliation, causal chain, score/recovery/replay, rendered leakage,
mobile/accessibility evidence, M05 continuity, M07+ boundary, wrong-path
recovery and the neutral next-incident hook.

## Review status

This artifact is **DRAFT FOR REVIEW**. No M06 implementation is authorised
until an independent review accepts the contract.
