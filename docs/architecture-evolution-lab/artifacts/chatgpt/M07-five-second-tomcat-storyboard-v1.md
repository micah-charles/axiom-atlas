# M07 — Five-Second Tomcat

## Architecture Evolution Lab — storyboard v1

**Capture status:** ChatGPT delivered the requested downloadable artifact and reported a passing pre-delivery audit. The browser download endpoint was blocked by Chrome in this environment, so this file is a transparent local review capture of the delivered contract, not a claim of byte-for-byte download fidelity.

**Mission:** M07 — Five-Second Tomcat
**Locked primary source:** `ccc115a/se`, `_more/mybook/向淘寶學習網站架構演進/1.3.md`
**Locked source commit:** `86f1816c44781a7e1f4efe72dac3b4f5114e5049`
**Scope:** one complete investigation; no M08–M12 implementation or player-facing design.

## 1. Mission intent

Teach one diagnostic habit: **“slow” is a symptom, not a diagnosis.** After the database has already been moved away from the application host, campaign warm-up makes Tomcat slow. CPU, memory/GC and I/O can share the same visible symptom, so the player must inspect competing evidence, commit a hypothesis, predict a diagnostic run, reveal deterministic evidence, reconcile the result, build a causal explanation, score, and replay.

Source-backed incident facts are the approximately 50 ms → 5 s slowdown, CPU reaching 100%, and Full GC freezing the site. Atlas Market, exact telemetry samples, timestamps, results, seed and score are deterministic teaching simulation unless explicitly marked source-backed.

## 2. Required playable loop

`OBSERVE → INVESTIGATE → FORM A DIAGNOSIS → PREDICT/CHOOSE A DIAGNOSTIC RUN → RUN → REVEAL → RECONCILE → EXPLAIN → SCORE → REPLAY`

Fresh state is neutral. The player must inspect CPU, memory/GC and I/O evidence before diagnosis. At least CPU saturation, memory/GC pressure and I/O blocking are plausible selectable hypotheses. A complete wrong hypothesis is legal, reaches reveal, and remains recoverable; prediction correctness must never be a reveal gate.

The final explanation separates:

`symptom → evidence → diagnosis → consequence`

and distinguishes primary signal, secondary symptom and missing evidence. The canonical deterministic teaching interpretation is compute saturation primary, with Full GC a real concurrent pause whose deeper memory cause is not established by the captured evidence.

## 3. First 10 seconds — neutral storyboard

Header: `M07 — FIVE-SECOND TOMCAT`
Status: `NEW INCIDENT`

> Campaign warm-up has started. Customers report that pages which were normally fast are now taking seconds.

Incident strip:

- Before: `~50 ms`
- During warm-up: `~5 s`
- Scope: `Tomcat request path`
- DB placement: `separate from the Web host`

Objective:

> Decide what kind of evidence would distinguish competing causes of “slow.” Inspect the host before you commit a diagnosis.

Neutral evidence families: `COMPUTE`, `MEMORY / GC`, `WAIT / I/O`. CTA: `INSPECT HOST EVIDENCE`. The initial shell must not expose the canonical diagnosis, winning run, final causal conclusion, remedy, or any later-mission design.

## 4. Evidence contract

The player must inspect E01–E06 before diagnosis. E07 is optional context.

| ID | Panel | Revealed observation | Unit | Provenance | Discipline |
|---|---|---|---|---|---|
| E01 | Request latency | Baseline ~50 ms; warm-up ~5 s | ms / s | SOURCE_BACKED approximate | symptom only |
| E02 | CPU utilisation | CPU reaches 100% during the incident window | % | SOURCE_BACKED | strong signal, not a universal remedy |
| E03 | GC event | Full GC coincides with a site freeze | event + pause | source event; exact timing simulated | causality unresolved |
| E04 | CPU run context | runnable queue 3 → 24; compute sample 96–100% | tasks, % | TEACHING_SIMULATION | supports compute pressure |
| E05 | Memory/GC context | heap 68 → 82%; Full-GC count +1; post-GC 69% | %, count | TEACHING_SIMULATION | retained-memory cause not established |
| E06 | I/O context | I/O wait 3%; socket-read blocked 2/200 threads | %, threads | TEACHING_SIMULATION | weak primary-I/O support |
| E07 | Missing capture | long-window retention history: NOT CAPTURED | — | TEACHING_SIMULATION missing | prevents overclaiming memory root cause |

Missing-value rules:

1. Missing is `NOT_CAPTURED`, never zero, false or inferred healthy.
2. Missing evidence reconciles as `MISSING_EVIDENCE`, not Confirmed or Not confirmed.
3. A missing field contributes no positive proof.
4. The UI uses text and an icon, never colour alone.
5. Engine data uses `null` plus `quality: "NOT_CAPTURED"`; null is never coerced to zero.

## 5. Competing diagnoses

| ID | Player label | Evidence that could support it | Evidence that could weaken it |
|---|---|---|---|
| `CPU_SATURATION_PRIMARY` | Compute saturation is the primary bottleneck | 100% CPU and high runnable work | low CPU with high blocked I/O or stronger retained-memory evidence |
| `MEMORY_GC_PRIMARY` | Memory/GC pressure is the primary bottleneck | repeated Full GC, rising retained post-GC floor, retention evidence | isolated GC with post-GC recovery and sustained compute pressure |
| `IO_WAIT_PRIMARY` | I/O waiting is the primary bottleneck | high wait and many blocked socket/disk threads with CPU not saturated | sustained CPU saturation with low wait/blocking |
| `INSUFFICIENT_EVIDENCE` | Evidence is still insufficient | concurrent signals remain ambiguous | a run cleanly distinguishes alternatives |

Commit requires one diagnosis, at least three proof cards, E01 plus two resource-specific cards, and all required evidence. Correctness is not a gate. The original hypothesis is frozen for scoring and history.

## 6. Predict and run

Neutral run cards, shown in deterministic shuffled order:

- `RUN_COMPUTE_WAIT_SAMPLE` — sample CPU %, runnable queue and I/O wait.
- `RUN_GC_RETENTION_SAMPLE` — sample Full-GC delta, pause and pre/post-GC heap.
- `RUN_THREAD_WAIT_SAMPLE` — sample runnable, socket-read blocked and file-I/O blocked.

Before running, the player predicts every applicable field using `LOW / MEDIUM / HIGH / NOT_OBSERVED`. A wrong complete prediction is accepted. Results remain hidden until the prediction is frozen and the run is committed.

Fixed experiment identity:

```yaml
mission_id: M07
simulation_kind: TEACHING_SIMULATION
seed: 20260916
incident_window_seconds: 30
sample_interval_seconds: 5
tomcat_threads_context_only: 200
missing:
  numeric_value: null
  quality: NOT_CAPTURED
```

Canonical result tables:

| Run | Result |
|---|---|
| `RUN_COMPUTE_WAIT_SAMPLE` | CPU 99% HIGH; runnable queue 23 HIGH; I/O wait 3% LOW; socket-read blocked 2/200 LOW |
| `RUN_GC_RETENTION_SAMPLE` | Full-GC delta +1 OBSERVED; pause 1800 ms HIGH; heap pre-GC 82% HIGH; heap post-GC 69% MEDIUM; long-window retention NOT_CAPTURED |
| `RUN_THREAD_WAIT_SAMPLE` | runnable tasks 24 HIGH; socket-read blocked 2/200 LOW; file-I/O blocked 1/200 LOW; CPU 100% HIGH |

Repeated execution with seed `20260916` must produce equivalent semantic results; animation timing cannot alter values.

## 7. Reveal, reconcile and recover

For every predicted field the UI shows:

`YOUR PREDICTION | OBSERVED | YOUR RECONCILIATION`

The player explicitly chooses `CONFIRMED`, `NOT_CONFIRMED` or `MISSING_EVIDENCE`. The engine maps matching qualitative direction to Confirmed, differing direction to Not confirmed, and `NOT_CAPTURED` to Missing evidence. Incorrect reconciliation gives local feedback and does not end the mission.

Recovery rules:

- A wrong diagnosis or weak run remains playable.
- The previous hypothesis remains in history.
- Selecting a new run clears stale prediction, reveal and reconciliation state for that run.
- A revised diagnosis is labelled as a revision after evidence.
- The final explanation must mention an alternative that was weakened or unresolved.

## 8. Causal explanation builder

Four columns are required: `SYMPTOM`, `EVIDENCE`, `DIAGNOSIS`, `CONSEQUENCE`.

Canonical simulated explanation:

`~5 s slow symptom → sustained high CPU + high runnable work → compute saturation primary → work queues lengthen and response latency rises`

Parallel branch:

`Full GC observed → 1800 ms pause + post-GC recovery + retention history missing → real concurrent pause; deeper memory cause not established`

Alternative comparison:

`I/O-primary → low I/O wait + few blocked-I/O threads → not supported as primary in this deterministic run`

Acceptance requires the symptom card, two independent evidence cards, diagnosis, consequence, alternative comparison, an equivalent of “slow alone is not a diagnosis,” no universal remedy, and no M08–M12 solution content.

## 9. Score and replay

Clean canonical path totals exactly 100 points:

| Category | Points |
|---|---:|
| Investigation | 15 |
| Evidence-backed diagnosis | 15 |
| Pre-run prediction | 15 |
| Diagnostic-run discipline | 10 |
| Reconciliation | 15 |
| Alternative discrimination | 10 |
| Causal explanation | 15 |
| Efficiency | 5 |
| **Total** | **100** |

Wrong-but-recovered play remains completable. Accuracy and recovery are scored from frozen pre-reveal state; recovery never rewrites history.

Replay clears inspected evidence, expanded cards, diagnosis/proof/history, run selection and predictions, results, reconciliation, recovery count, causal links, score, completion state and live-region feedback. Fresh replay is semantically equivalent to first launch.

## 10. Scope boundaries and implementation handoff

`do_not_teach_yet`:

- M08: deep CPU diagnosis/remediation.
- M09: memory and Full-GC remediation.
- M10: I/O remediation.
- M11: Tomcat thread-pool trade-off.
- M12: scale-up versus scale-out.

Suggested pure engine: `app/games/architecture-lab/m07-engine.ts` — evidence/provenance, hypotheses, runs/results, missing values, completeness, deterministic reconciliation, causal validation, scoring, completion predicate and reset helpers. No React, DOM, animation, storage or routing.

Suggested component: `app/games/architecture-lab/M07TomcatGame.tsx` — phase rendering, accessible evidence disclosure, controls, responsive layout, run/reveal/recovery UX, causal builder, live regions and replay. It must not duplicate engine truth.

Required paths include `tests/game-core.test.mjs`, `tests/rendered-html.test.mjs`, M07 desktop/mobile/keyboard/touch/reduced-motion/screen-reader evidence records, and a committed-source implementation review. Initial rendered HTML must reject canonical answer tokens, serialized hidden result tables and answer-bearing content; CSS-hidden answers do not satisfy the check.

Completion exposes only a neutral hook: `INCIDENT CLOSED — ANOTHER SIGNAL ARRIVES`, explaining that later evidence differs without naming the next mission or diagnosis.

## 11. Acceptance matrix

| ID | Area | Acceptance criterion |
|---|---|---|
| M07-T001 | Source trace | Source path and locked commit are preserved; no silent substitution. |
| M07-T002 | Source trace | Source-backed incident facts are separated from teaching-simulation values. |
| M07-T003 | Fresh state | Opening names only the severe Tomcat slowdown, not cause/tool/remedy. |
| M07-T004 | Fresh state | Initial HTML has no canonical diagnosis, winning run, conclusion or M08 topic. |
| M07-T005 | Observe | First 10 seconds communicate 50 ms → ~5 s without interpreting cause. |
| M07-T006 | Investigate | CPU evidence is independently inspectable and not an auto-submitted diagnosis. |
| M07-T007 | Investigate | Memory/GC evidence distinguishes observations from causal interpretation. |
| M07-T008 | Investigate | I/O evidence includes an explicit negative or missing signal where appropriate. |
| M07-T009 | Investigate | At least one signal from CPU, memory/GC and I/O is inspected before diagnosis. |
| M07-T010 | Evidence | Every panel labels units, provenance and source/simulation status. |
| M07-T011 | Evidence | Missing telemetry renders as NOT OBSERVED / NOT CAPTURED, never zero. |
| M07-T012 | Diagnosis | CPU, memory/GC and I/O are selectable plausible diagnoses. |
| M07-T013 | Diagnosis | Commit requires a complete evidence-backed hypothesis, not the canonical answer. |
| M07-T014 | Diagnosis | A wrong complete diagnosis proceeds to prediction/run. |
| M07-T015 | Run choice | Player predicts what a selected diagnostic run should show before reveal. |
| M07-T016 | Run choice | At least two plausible runs are available without marking one correct. |
| M07-T017 | Run | A committed diagnostic run is deterministic for seed 20260916. |
| M07-T018 | Reveal | Run result remains hidden until diagnosis and prediction/choice are committed. |
| M07-T019 | Reconcile | Wrong hypotheses reach reveal and reconcile deterministically. |
| M07-T020 | Reconcile | Reconciliation compares the frozen pre-reveal hypothesis. |
| M07-T021 | Reconcile | A wrong run can be recovered from without restarting the mission. |
| M07-T022 | Reconcile | CPU + Full GC is classified as primary/secondary/missing evidence, not automatic proof. |
| M07-T023 | Causal builder | Builder separates Symptom → Evidence → Diagnosis → Consequence. |
| M07-T024 | Causal builder | Canonical CPU explanation requires multiple evidence types. |
| M07-T025 | Causal builder | Memory/GC alternative remains plausible until evidence weakens it. |
| M07-T026 | Causal builder | I/O alternative remains plausible until evidence weakens it. |
| M07-T027 | Learning goal | Completion teaches that “slow” is a symptom, not a diagnosis. |
| M07-T028 | Scope | No metric is presented as proving a universal production remedy. |
| M07-T029 | Score | Clean canonical state scores exactly 100/100. |
| M07-T030 | Score | Wrong-but-recovered hypotheses lose intended credit but remain completable. |
| M07-T031 | Replay | Replay clears evidence, hypotheses, predictions, results, explanation and score. |
| M07-T032 | Rerun | Changing a run invalidates stale result and reconciliation state. |
| M07-T033 | M06 continuity | M07 inherits separated DB/application context without reopening M06 tuning. |
| M07-T034 | Boundary | Deep CPU remediation is explicitly deferred to M08. |
| M07-T035 | Boundary | Memory/Full-GC remediation is explicitly deferred to M09. |
| M07-T036 | Boundary | I/O remediation is explicitly deferred to M10. |
| M07-T037 | Boundary | Thread-pool trade-off is explicitly deferred to M11. |
| M07-T038 | Boundary | Scale-up versus scale-out is explicitly deferred to M12. |
| M07-T039 | Responsive | 390×844 supports complete mission without horizontal scrolling. |
| M07-T040 | Keyboard | Standalone keyboard-only completion has visible focus and logical order. |
| M07-T041 | Touch | Touch targets and tap/move alternatives support complete touch play. |
| M07-T042 | Motion | Reduced motion removes nonessential transitions while preserving feedback. |
| M07-T043 | Accessibility | Meaning is not colour-only and phase/result changes are announced. |
| M07-T044 | Handoff | Pure engine/UI boundaries, tests, evidence paths and no-leak checks are defined. |
| M07-T045 | Next hook | Completion exposes a neutral next-incident hook without designing M08. |

## 12. Machine-readable registry

```yaml
test_ids:
  - M07-T001
  - M07-T002
  - M07-T003
  - M07-T004
  - M07-T005
  - M07-T006
  - M07-T007
  - M07-T008
  - M07-T009
  - M07-T010
  - M07-T011
  - M07-T012
  - M07-T013
  - M07-T014
  - M07-T015
  - M07-T016
  - M07-T017
  - M07-T018
  - M07-T019
  - M07-T020
  - M07-T021
  - M07-T022
  - M07-T023
  - M07-T024
  - M07-T025
  - M07-T026
  - M07-T027
  - M07-T028
  - M07-T029
  - M07-T030
  - M07-T031
  - M07-T032
  - M07-T033
  - M07-T034
  - M07-T035
  - M07-T036
  - M07-T037
  - M07-T038
  - M07-T039
  - M07-T040
  - M07-T041
  - M07-T042
  - M07-T043
  - M07-T044
  - M07-T045
```

**ChatGPT-delivered audit summary:** matrix count 45; matrix unique 45; registry count 45; registry unique 45; both contiguous M07-T001…M07-T045; matrix equals registry; fresh-copy forbidden answer tokens absent; neutral next hook; no empty regex alternatives.
