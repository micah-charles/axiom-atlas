# M05 Implementation Review v2

## Review scope

**Mission:** M05 — The Network Is Now Part of the System  
**Repository:** `micah-charles/axiom-atlas`  
**Branch:** `feature/architecture-evolution-lab`  
**Post-fix commit reviewed:** `b75ddae6e79de8e8e42eecb8eb80f6c189a7ea05` — `fix: close M05 review gaps`  
**Parent implementation commit:** `2e48a252b80f2300126650250d2448aed7a99026`  
**Accepted contract:** `docs/architecture-evolution-lab/artifacts/chatgpt/M05-network-now-part-of-system-storyboard-v1.2.md`

Committed files re-audited:

- `app/games/architecture-lab/M05NetworkGame.tsx`
- `app/games/architecture-lab/m05-engine.ts`
- `tests/game-core.test.mjs`
- `tests/rendered-html.test.mjs`
- `docs/architecture-evolution-lab/PROGRESS.md`
- `docs/architecture-evolution-lab/evidence/M05-playtest-qa.md`

This review uses the pushed `b75ddae` tree and its parent/delta. It does not rely on the previous review summary as source of truth.

---

# Executive verdicts

| Decision | Verdict |
|---|---|
| **1. Implementation correctness** | **PASS** |
| **2. Genuinely playable required loop** | **PASS** |
| **3. Full verification** | **CONDITIONAL PASS** |
| **Storyboard v1.2 satisfied?** | **YES for implementation correctness; runtime verification debt remains OPEN** |

No new code defect was established in this re-review.

The two previous findings are closed:

- **M05-F01 — CLOSED:** fresh-player wording is now neutral and the rendered initial-route test rejects natural-language intervention leakage.
- **M05-F02 — CLOSED / previous review corrected:** the current committed tree contains M05 engine regressions. The first review incorrectly concluded they were absent. `b75ddae` additionally imports and tests stronger prediction/completion/efficiency invariants.

The open 390px, keyboard-only, touch, reduced-motion, and screen-reader items remain verification debt rather than implementation-correctness blockers.

---

# Previous finding status

| Finding | v2 status | Evidence |
|---|---|---|
| **M05-F01 — initial intervention-direction leak** | **CLOSED** | Fresh sidebar now says `explain which call behaviour changes the outcome` and `compare call behaviour`; rendered initial route rejects `bound the waiting`, `bound the wait`, `use a timeout`, `retry once`, and `bounded timeout`. |
| **M05-F02 — claimed missing M05 core regressions** | **CLOSED / v1 finding was factually incorrect** | Current `game-core.test.mjs` imports the M05 engine regression API, and project evidence records the original gate/map/causal/prediction/result/policy/100-point tests as already present in `2e48a25`; `b75ddae` adds `canCommitM05Predictions` / `canCompleteM05` coverage and additional efficiency/completion assertions. |

No `M05-F03+` finding is opened.

---

# M05-T001 — Fresh-player objective

## Verdict: PASS

The opening remains immediately understandable:

- Web and DB are already separated;
- the request reaches the Web app;
- its DB-dependent step does not complete;
- the player is asked to prove what the call is waiting on.

The post-fix sidebar is now neutral:

```text
Prove the dependency, predict both call policies,
and explain which call behaviour changes the outcome.
```

and:

```text
03 compare call behaviour
```

It no longer gives away the bounded-timeout intervention.

---

# M05-T002 — No initial answer leakage

## Verdict: PASS

The rendered initial-route regression now rejects:

```text
bound the waiting
bound the wait
use a timeout
retry once
bounded timeout
```

as well as internal correct-answer identifiers:

```text
NETWORK_DEPENDENCY_WAITING
BOUNDED_TIMEOUT_ONE_RETRY
2-second teaching-simulation DB outage
```

The actual `M05NetworkGame.tsx` opening copy at `b75ddae` no longer contains the v1 leak.

This closes M05-F01.

---

# M05-T003 — Provenance boundary

## Verdict: PASS

The mission continues to separate:

- source-backed topology/evidence;
- fictional Atlas Market incident framing;
- explicitly labelled teaching-simulation values.

No post-fix regression introduced production-history claims.

---

# M05-T004 — Evidence gate

## Verdict: PASS

`canUnlockM05Evidence()` still requires:

```text
E01 AND E02 AND E03 AND E04 AND E05
AND (E06 OR E07)
AND unique inspected count >= 6
```

The committed desktop QA records the gate opening only after E01–E05 plus a comparator.

---

# M05-T005 — No uninspected proof

## Verdict: PASS

The engine-level invariant remains:

```text
proof ⊆ inspected
```

plus:

```text
E01
E02
one of E03/E04
```

`diagnosisProofIsEnoughM05()` composes this with `NETWORK_DEPENDENCY_WAITING`.

This is not merely a UI affordance.

---

# M05-T006–T009 — Diagnosis, recovery, dependency map

## Verdict: PASS

The required dependency map remains:

```text
JDBC_DB_CALL → CROSSES_DB_NETWORK_DEPENDENCY
AFFECTED_SHOP_REQUEST → CROSSES_DB_NETWORK_DEPENDENCY
COMPARATOR_LOCAL_ACTION → DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP
DISK_FULL_HYPOTHESIS → UNSUPPORTED_CAUSE
CPU_EXHAUSTION_HYPOTHESIS → UNSUPPORTED_CAUSE
```

Wrong map and wrong diagnosis routes remain recoverable and preserve the investigation.

No post-fix state change alters these mechanics.

---

# M05-T010 — Seven-link causal model and evidence links

## Verdict: PASS

The engine still defines the seven accepted causal claims:

```text
WEB_DB_ARE_SEPARATE
→ DB_CALL_CROSSES_NETWORK_DEPENDENCY
→ DEPENDENCY_BECOMES_UNAVAILABLE
→ DB_DEPENDENT_REQUEST_WAITS
→ WAITING_WORK_REMAINS_OCCUPIED
→ BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
→ RETRY_IS_ANOTHER_BOUNDED_ATTEMPT
```

Required evidence links remain exact:

```text
E01 → DB_CALL_CROSSES_NETWORK_DEPENDENCY
E02 → DB_DEPENDENT_REQUEST_WAITS
E03 → BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
E04 → WAITING_WORK_REMAINS_OCCUPIED
```

The UI keeps keyboard-safe Up/Down reorder controls and explicit selects for evidence linking.

---

# M05-T011 — Exactly ten predictions before either reveal

## Verdict: PASS

The engine contains exactly ten prediction IDs:

- five for Condition A;
- five for Condition B.

The five dimensions are:

1. affected work waiting;
2. error surfaced;
3. retry guarantees success;
4. slot count changes;
5. dependency recovers.

The post-fix test suite now imports `canCommitM05Predictions`, and project evidence records added prediction-commitment invariant coverage.

Normal UI progression still requires all ten choices before `run-unbounded`.

No reveal screen is reachable before prediction commit.

---

# M05-T012–T016 — Deterministic 2-second experiment and qualitative results

## Verdict: PASS

Both runs use the same teaching-simulation control:

```text
same topology
same starting requests
same fixed slot count
same dependency outage
same 2-second lab window
```

Only the call policy changes.

## Condition A

Qualitative result remains:

```text
affected work still waiting
no dependency error surfaced
dependency did not recover
fixed slots unchanged
```

## Condition B

Policy remains:

```text
timeout at 0.75 lab seconds
retry after 0.25 lab seconds
maximum retries = 1
```

Result remains:

```text
error surfaced after bounded attempts
retry also failed
dependency remained unavailable
slot count unchanged
```

The runtime explicitly says the values are `TEACHING_SIMULATION` / not production recommendations.

Retry is not represented as guaranteed recovery.

---

# M05-T017–T020 — Policy decision and bounded behaviour

## Verdict: PASS

Decision alternatives remain:

- unbounded wait;
- bounded timeout + one retry;
- retry until success;
- increase request slots.

Only the bounded timeout + one bounded retry path can complete with all five required justifications.

Capacity is still held fixed and is not turned into the mission’s architecture decision.

---

# M05-T021 — No fake production precision

## Verdict: PASS

All runtime numeric values continue to be explicitly labelled educational simulation values.

No source example value is presented as Atlas Market telemetry or a production recommendation.

---

# M05-T022 — Exact 100-point score

## Verdict: PASS

The scoring model remains:

```text
15 investigation
15 diagnosis/proof
10 classification
15 causal
10 prediction
15 experiment
10 policy
5 boundary
5 efficiency
= 100
```

Committed QA records a clean desktop path reaching `100/100`.

The current post-review test pass is documented as 177 core tests and 9 rendered-route tests.

---

# M05-T023 — Efficiency tiers

## Verdict: PASS

The engine still uses:

```text
0 recovery cycles → 5
1 → 4
2 → 3
3+ → 2
```

`b75ddae` explicitly adds stronger efficiency invariant coverage according to the committed QA/progress notes.

---

# M05-T024 — Contradictory-state prevention

## Verdict: PASS

The current engine exposes `canCompleteM05()` and the post-fix core suite now imports it.

The completion predicate requires:

- evidence gate;
- correct dependency map;
- correct diagnosis + inspected proof;
- correct causal order;
- exact causal links;
- correct prediction model;
- both experiment runs;
- correct result reconciliation;
- correct final policy + justifications.

The correction pass explicitly records added contradictory-completion proof coverage.

There is therefore now committed regression coverage around the stricter completion invariant that was only discussed in v1.

---

# M05-T025 — Replay

## Verdict: PASS

Replay still resets all mutable M05 state:

- phase;
- inspected evidence;
- dependency map;
- token selection;
- diagnosis/proof;
- causal order/links;
- predictions;
- result checks;
- run flags;
- final policy;
- justifications;
- recovery count;
- feedback.

Committed desktop QA records a return to `0/7 INSPECTED` with no result/score state.

---

# M05-T026 — Genuine gameplay

## Verdict: PASS

The mission remains genuinely playable:

```text
Observe
→ Investigate evidence
→ Map dependency
→ Diagnose + prove
→ Explain causal chain
→ Predict ten outcomes
→ Run unbounded
→ Reconcile
→ Run bounded
→ Reconcile
→ Decide
→ Justify
→ Score
→ Replay
```

It is not a static topology explanation or card quiz.

The post-fix commit changes only neutral opening copy plus tests/docs; it does not collapse or bypass the game loop.

---

# M05-T027 — Keyboard path

## Implementation structure: PASS
## Runtime verification: OPEN

Native buttons, radios, checkboxes, selects, and labelled Up/Down controls provide a keyboard-capable design.

However, the committed evidence explicitly says a standalone keyboard-only fresh-route trace is still open.

Therefore:

```text
code/semantics: acceptable
full acceptance evidence: OPEN
```

---

# M05-T028 — Touch path

## Implementation structure: PASS
## Runtime verification: OPEN

Core interactions are tap/click controls and no drag is required.

The committed QA still lists a touch-specific trace as open.

---

# M05-T029 — Real 390px

## Verdict: OPEN verification debt

The responsive structure exists in code/CSS, but committed QA still says:

```text
real 390px viewport capture, including one recovery path — OPEN
```

This re-review does not convert responsive CSS into runtime proof.

---

# M05-T030 — Reduced motion

## Implementation semantics: PASS
## Runtime verification: OPEN

A scoped `prefers-reduced-motion: reduce` rule exists and the experiment outcome does not depend on animation.

A reduced-motion capture/run remains explicitly open.

---

# M05-T031 — Screen reader

## Implementation semantics: PASS
## Runtime verification: OPEN

Positive semantics include:

- native fieldsets/legends;
- radio and checkbox inputs;
- `aria-pressed`;
- labelled reorder buttons;
- alert/status feedback;
- `aria-live="polite"` mission surface.

But the committed QA still lists the screen-reader announcement transcript as open.

---

# M05-T032–T034 — Runtime boundary

## Verdict: PASS

The player-facing M05 runtime does not provide controls or recommendations for:

- connection-pool sizing;
- `max_connections`;
- DB-capacity tuning;
- throughput tuning.

The capacity option shown in the decision stage is explicitly framed as changing capacity rather than the call policy under test and cannot complete the mission.

No later architecture solutions are introduced as completion requirements.

The runtime-scoped forbidden-content principle remains correct: tests should inspect player-facing runtime strings/fixtures, not author documentation that necessarily names deferred topics.

---

# M05-T035 — Rendered initial route

## Verdict: PASS

The rendered route asserts:

- M05 identity;
- neutral remote-call symptom;
- diagnosis locked;
- Atlas Market fictional boundary.

It now also rejects both internal identifiers and natural-language intervention recommendations.

This is stronger than the `2e48a25` regression.

---

# M05-T036 — Qualitative primary result

## Verdict: PASS

Primary result language remains:

```text
still waiting
error surfaced
retry failed
dependency unavailable
slots unchanged
```

Numeric timing is secondary and explicitly simulation-labelled.

---

# M05-T037 — M04 continuity without redesign

## Verdict: PASS

M05 still starts from already-separated Web/DB hosts.

The player does not choose Web/DB separation again.

---

# M05-T038 — Source-example isolation

## Verdict: PASS

The player-facing M05 flow does not repurpose source example values such as:

```text
0.5ms
50
3000
500
```

as incident measurements, scoring targets, or production controls.

---

# M05-T039 — Wrong-path recovery preserves investigation

## Verdict: PASS

Wrong causal/diagnosis routes retain prior evidence and allow correction.

Committed QA explicitly records a wrong causal-order recovery ending at `98/100`.

---

# M05-T040 — Stop boundary

## Verdict: PASS

M05 completion stops after bounded network-call behaviour and reflection/score/replay.

This review does not propose or design M06.

---

# Re-review of M05-F02 and the committed test tree

The v1 review stated that `tests/game-core.test.mjs` contained no M05 engine tests.

That conclusion should be withdrawn.

The current committed source and the project’s correction record establish that:

1. M05 engine symbols were already imported in `2e48a25`;
2. the project had existing M05 gate/map/causal/prediction/result/policy/100-point regressions in the implementation commit;
3. `b75ddae` expands the imports to include:
   - `canCommitM05Predictions`;
   - `canCompleteM05`;
4. the post-review correction explicitly adds:
   - prediction commitment coverage;
   - contradictory completion/proof coverage;
   - efficiency-tier coverage;
5. committed QA records:
   - `npm run test:core` PASS, 177 tests;
   - `npm run build` PASS;
   - rendered route suite PASS, 9 tests.

The initial review’s F02 was therefore based on incomplete file visibility/search, not the actual committed test tree.

## M05-F02 status

# CLOSED

No further test-suite finding is opened.

---

# Current evidence status

Committed `M05-playtest-qa.md` documents:

- desktop fresh-player PASS;
- evidence gate behaviour;
- correct dependency map;
- correct diagnosis/proof;
- seven-claim causal path;
- all ten predictions before reveal;
- both deterministic 2-second runs;
- final bounded policy;
- clean `100/100`;
- wrong-path recovery;
- replay reset;
- lint PASS;
- 177 core tests PASS;
- build PASS;
- 9 rendered-route tests PASS.

This review treats those as **committed project evidence**.

I did not independently execute the local browser/npm suite in this review environment.

---

# Full-verification debt

The following remain explicitly OPEN:

| Verification item | Status |
|---|---|
| Real 390px clean + recovery capture | **OPEN** |
| Fresh-route keyboard-only trace | **OPEN** |
| Touch-specific trace | **OPEN** |
| Reduced-motion execution/capture | **OPEN** |
| Screen-reader announcement transcript | **OPEN** |

These do not overturn the implementation-correctness PASS.

---

# Final decision table

| Area | Decision |
|---|---|
| M05-F01 initial natural-language leak | **CLOSED** |
| M05-F02 test-suite finding | **CLOSED / v1 finding corrected** |
| Fresh-player objective | PASS |
| Initial no-leak route | PASS |
| Provenance | PASS |
| Evidence gate | PASS |
| Inspected-proof invariant | PASS |
| Dependency map | PASS |
| Diagnosis recovery | PASS |
| Seven causal claims/links | PASS |
| Ten predictions | PASS |
| Prediction before reveal | PASS |
| Same deterministic 2-second simulation | PASS |
| Qualitative unbounded result | PASS |
| Bounded timeout + one retry | PASS |
| Retry not guaranteed | PASS |
| Fixed occupancy boundary | PASS |
| Exact 100 score | PASS |
| Efficiency tiers | PASS |
| Contradictory completion prevention | PASS |
| Replay | PASS |
| Runtime M06/later-topic boundary | PASS |
| Rendered initial route | PASS |
| Genuine gameplay | PASS |
| Real 390px evidence | OPEN |
| Keyboard-only evidence | OPEN |
| Touch evidence | OPEN |
| Reduced-motion evidence | OPEN |
| Screen-reader evidence | OPEN |
| **Implementation correctness** | **PASS** |
| **Genuinely playable** | **PASS** |
| **Full verification** | **CONDITIONAL PASS** |
| **Storyboard v1.2 implementation contract satisfied** | **YES** |

---

# Final verdict

## Implementation correctness: **PASS**

The bounded post-review correction closes the only genuine v1 code/content finding, and the previous test-suite finding is corrected based on the actual committed source.

## Genuinely playable: **PASS**

The full Observe → Investigate → Diagnose → Explain → Predict → Run unbounded → Reveal → Run bounded → Reveal → Decide → Score loop remains intact and evidence-driven.

## Full verification: **CONDITIONAL PASS**

The implementation contract is satisfied, but the real 390px, keyboard-only, touch, reduced-motion, and screen-reader evidence items remain open and must not be silently marked verified.

No M06 design or recommendation is included in this review.
