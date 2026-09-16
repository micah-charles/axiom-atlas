# M08 — CPU Bottleneck

## Capture status

ChatGPT delivered the requested downloadable artifact and reported an
anchored audit pass. The signed attachment endpoint was blocked by Chrome
(`ERR_BLOCKED_BY_CLIENT`) when Codex attempted to download it, so this file is
a transparent local review capture of the visible artifact contract. It is not
represented as byte-identical to the remote attachment.

The visible artifact was delivered with the same filename after one bounded
revision that removed deferred-mission vocabulary from the player-facing next
hook. ChatGPT reported:

- 45 unique contiguous acceptance IDs, M08-T001 through M08-T045;
- exact matrix/registry equality;
- fresh-player answer-leak audit pass;
- neutral next-hook audit pass;
- deterministic intervention results;
- recoverable wrong paths;
- exact score total 100;
- replay-reset contract pass;
- runtime/accessibility evidence represented but not claimed captured.

## Locked source and scope

- Primary source: `ccc115a/se`
- Path: `_more/mybook/向淘寶學習網站架構演進/1.3.md`
- Commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`
- Mission: M08 — CPU Bottleneck
- Scope boundary: no M09–M13 player-facing design or implementation

Source-backed claims in the visible artifact: high load, Java consuming CPU,
hot rendering/serialisation work, queueing under CPU saturation, bounded
responses such as simplifying computation or upgrading CPU, and the warning
that adding memory does not fix CPU saturation. Atlas Market telemetry and
intervention values are labelled deterministic teaching simulation.

## Visible storyboard contract

Required loop:

`OBSERVE → INVESTIGATE → FORM A HYPOTHESIS → PREDICT / CHOOSE A CONTROLLED CHANGE → RUN → REVEAL → RECONCILE → EXPLAIN → SCORE → REPLAY`

Fresh copy is neutral: a busy campaign produces slower pages and longer waits;
the player must determine which resource family limits progress. Diagnosis,
interventions, results and causal answer are hidden until their phases.

Evidence shown in the artifact:

| ID | Evidence | Visible teaching value |
|---|---|---|
| E01 | Request load: 180 req/s | High offered demand, not a diagnosis |
| E02 | Load average: 14.2 on 8 logical CPUs | Runnable pressure, distinct from CPU utilisation |
| E03 | Java CPU: 96% | Strong compute signal, not sufficient alone |
| E04 | Queue/latency: 31 queued; p95 920 ms | User-visible consequence |
| E05 | Hot compute stack: 62% render/serialise sample | Links Java CPU to compute work |
| E06 | Memory/GC: heap 71%; 0 Full GC | Weakens memory-primary for this run |
| E07 | I/O: 4% wait; 3/200 blocked reads | Weakens I/O-primary for this run |

The visible artifact says E01–E06 are mandatory and E07 is optional. It also
states that diagnosis requires load, Java CPU, queue/latency, hot-stack,
memory/GC and I/O evidence. This contradiction is recorded in the review.

CPU proof is shown as symptom/load plus E03 plus E05. The artifact states
that wrong diagnoses can proceed, but does not define equally explicit proof
predicates for every alternative diagnosis.

Interventions and deterministic visible result table:

| Intervention | Java CPU | Queue | p95 latency | Useful throughput | Hot compute share |
|---|---:|---:|---:|---:|---:|
| `SIMPLIFY_COMPUTE` | 72% | 8 req | 340 ms | 172 req/s | 39% |
| `UPGRADE_CPU` | 67% | 11 req | 410 ms | 168 req/s | 62% |
| `ADD_MEMORY` | 95% | 29 req | 890 ms | 151 req/s | 62% |

Simulation seed shown: `20260917`. Missing values use `null` plus
`NOT_CAPTURED`; no zero fallback or interpolation. Scoring is specified as an
exact 100-point total with evidence, diagnosis, causal reasoning, prediction,
intervention fit, reconciliation, trade-off and efficiency categories.

The artifact specifies desktop, 390×844, keyboard-only, touch, reduced-motion,
screen-reader and non-colour requirements, plus a pure engine/component/route
handoff and rendered no-leak tests.

## Acceptance registry capture

The visible artifact reported the exact contiguous registry:

`M08-T001 … M08-T045`

The acceptance table includes fresh neutrality, provenance, evidence gates,
distinct units, CPU proof, wrong-path playability, interventions, prediction,
run/reveal/reconciliation, causal builder, scoring, replay/rerun, M07
continuity, M09–M13 boundary, responsive/accessibility, handoff and neutral
next hook criteria.

## Review status

**NOT ACCEPTED.** See `reviews/M08-storyboard-review-v1.md` for the two blocking
consistency findings and the bounded revision request.
