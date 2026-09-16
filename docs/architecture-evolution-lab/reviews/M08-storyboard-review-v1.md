# M08 Storyboard Review v1

Date: 2026-09-17
Mission: M08 — CPU Bottleneck
Primary source: `ccc115a/se` `_more/mybook/向淘寶學習網站架構演進/1.3.md`
Source commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`
Artifact: `artifacts/chatgpt/M08-cpu-bottleneck-storyboard-v1.md`

## Review decision

**REVISION REQUIRED — do not implement M08 yet.**

The storyboard is strong in source scope, deterministic simulation, neutral
opening, intervention result table, accessibility contract and acceptance-ID
discipline. Two contract inconsistencies remain in the actual visible design.

## Independent checks

| Check | Result | Evidence |
|---|---|---|
| Source path and commit | PASS | Matches the local M08 source lock |
| One bounded CPU investigation | PASS | Observe → investigate → hypothesis → controlled change → reveal → explain → score → replay |
| Fresh-player neutrality | PASS | Opening copy hides CPU diagnosis, intervention and result |
| Source/simulation provenance | PASS | Source claims and deterministic Atlas Market telemetry are distinguished |
| Units and missing values | PASS | Load average, CPU %, latency and `NOT_CAPTURED` are separated |
| Deterministic result table | PASS | Seed `20260917`; three explicit intervention rows |
| Wrong prediction recovery | PASS | Complete wrong prediction reaches reveal/reconciliation |
| Score/replay contract | PASS | Exact 100-point table and reset list are present |
| Mobile/accessibility handoff | PASS | 390×844, keyboard, touch, reduced-motion, screen-reader and non-colour requirements present |
| Acceptance IDs | PASS | ChatGPT reported 45 contiguous IDs and exact registry equality; raw attachment download was blocked |
| Evidence gate consistency | **FAIL** | E07 is optional in the access rules but I/O evidence is required by M08-T005 and the intended cross-family investigation |
| Diagnosis/final explanation consistency | **FAIL** | Wrong initial diagnosis can remain frozen while the canonical CPU causal chain completes; no explicit final-diagnosis/revision state |

## M08-F01 — I/O evidence is simultaneously optional and required

**Severity:** Medium — contract determinism

The artifact says E01–E06 are mandatory and E07 I/O is optional, but its
acceptance contract says diagnosis remains locked until load, Java CPU,
queue/latency, hot-stack, memory/GC **and I/O** cards are inspected. The
required gameplay contract also says the player must compare memory/GC and I/O
alternatives before deciding.

This leaves two incompatible implementations:

1. allow diagnosis after E01–E06 without inspecting E07; or
2. require E07 even though the evidence access rule says optional.

### Required bounded correction

Choose one rule and make every section agree. Recommended rule: E01–E07 are
required for the M08 cross-family gate, with E07 explicitly labelled a required
I/O comparator; or, if E07 stays optional, change M08-T005 and every related
acceptance/score statement so the I/O alternative is explicitly optional and
does not silently affect diagnosis eligibility.

Update the evidence access rules, diagnosis guard, acceptance matrix,
test_ids-adjacent handoff language, and self-audit so they all use the same
rule. Add a regression ID if the accepted matrix changes, then update the
registry in the same order and rerun equality/contiguity checks.

## M08-F02 — Frozen wrong diagnosis can contradict the final CPU explanation

**Severity:** High — learning/state integrity

The artifact allows a complete wrong diagnosis to continue and later requires a
canonical CPU causal chain. However, it does not define a post-reveal
`finalDiagnosis` or explicit revision state.

Therefore a player can plausibly:

1. select `MEMORY_GC_PRIMARY` or `IO_WAIT_PRIMARY`;
2. choose `ADD_MEMORY` or another wrong path;
3. run, reveal and reconcile the result;
4. build the canonical CPU chain;
5. complete without explicitly revising the diagnosis.

That contradicts the mission's own claim that the original hypothesis remains
meaningful history while the final explanation reflects evidence. M07 required
this exact consistency gate, so M08 must not regress it.

### Required bounded correction

Add a separate post-reveal `finalDiagnosis`/revision contract:

- preserve the initial diagnosis and proof for diagnosis-history and scoring;
- after reconciliation, initialize or require a visible final diagnosis;
- label an unchanged value as `FROZEN INITIAL HYPOTHESIS` and a changed value as
  `REVISION AFTER EVIDENCE`;
- require the final diagnosis to agree with the canonical causal explanation;
- block contradictory completion while keeping wrong-path playability;
- clear final-diagnosis state on rerun and replay;
- add regressions for wrong initial diagnosis + unchanged final diagnosis
  (reject), wrong initial diagnosis + revised CPU final diagnosis (accept),
  clean CPU path (exact 100/100), and replay reset.

## Non-blocking observations

- Alternative diagnosis proof predicates are less explicit than the CPU proof
  predicate. The revision should define deterministic inspected-proof rules for
  CPU, memory/GC, I/O and insufficient-evidence choices so implementation does
  not invent asymmetric gates.
- The artifact's `RECONCILE → EXPLAIN` guard says reconciliation must be
  “correct”. Keep this as a player-action requirement, but retain specific
  feedback and recovery for incorrect reconciliation rather than making a
  wrong prediction a dead end.
- The source-shaped labels and result numbers are appropriate only while they
  remain visibly `TEACHING_SIMULATION`; this must be tested in rendered UI.

## Decision

Do not implement M08 from v1. Request one bounded storyboard revision that
closes M08-F01 and M08-F02, preserves the 45-ID discipline unless a justified
new test is added, and reruns the final anchored audit against the actual
artifact rather than the response summary.
