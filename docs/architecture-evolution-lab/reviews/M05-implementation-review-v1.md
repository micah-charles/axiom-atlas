# M05 Implementation Review v1

## Review scope

**Mission:** M05 — The Network Is Now Part of the System  
**Repository:** `micah-charles/axiom-atlas`  
**Branch:** `feature/architecture-evolution-lab`  
**Committed implementation reviewed:** `2e48a252b80f2300126650250d2448aed7a99026` — `feat: add M05 network dependency investigation`  
**Accepted contract:** `docs/architecture-evolution-lab/artifacts/chatgpt/M05-network-now-part-of-system-storyboard-v1.2.md`

Committed files inspected:

- `app/games/architecture-lab/m05-engine.ts`
- `app/games/architecture-lab/M05NetworkGame.tsx`
- `app/computer-science/architecture-lab/m05/page.tsx`
- `app/globals.css`
- `tests/game-core.test.mjs`
- `tests/rendered-html.test.mjs`
- `docs/architecture-evolution-lab/evidence/M05-playtest-qa.md`

This review inspected the source at commit `2e48a25`, rather than relying on conversation summaries or progress notes. No application code was modified and no M06+ content was designed.

---

# Executive decisions

| Decision | Verdict |
|---|---|
| **1. Implementation correctness** | **REVISION REQUIRED** |
| **2. Genuinely playable required loop** | **PASS** |
| **3. Full verification** | **CONDITIONAL PASS** |
| **M05 storyboard v1.2 satisfied as committed?** | **NO — two bounded contract gaps remain** |

The implementation is structurally strong and the central game loop is real. The evidence gate, inspected-proof invariant, dependency map, seven-link causal model, ten prediction controls (five assertions per policy), two explicit runs, deterministic qualitative outcomes, bounded timeout + one retry conclusion, 100-point scoring model, replay reset, and M06 boundary are all substantially present.

Two bounded findings prevent an implementation-correctness PASS:

1. **M05-F01 — initial player-facing copy leaks the intervention direction before investigation.**
2. **M05-F02 — the committed core test suite contains no M05 engine regressions despite the accepted M05-Txxx contract requiring deterministic engine/state assertions.**

The open 390px/keyboard/touch/reduced-motion/screen-reader evidence remains verification debt and is reported separately; it is not used to manufacture an implementation defect.

---

# Finding table

| ID | Severity | Status | Area |
|---|---|---|---|
| **M05-F01** | Contract-blocking, bounded | OPEN | Initial no-answer-leak |
| **M05-F02** | Contract-blocking, bounded | OPEN | Deterministic regression coverage |

---

# M05-F01 — Initial runtime leaks “bound the waiting” before investigation

## Severity

**Contract-blocking, bounded**

## Contract

The accepted v1.2 opening explicitly keeps the following hidden initially:

- timeout/retry values;
- policy names;
- correct policy/result.

Its S01 contract says there must be **no timeout/retry recommendation** at the fresh-player opening, and M05-T002 requires no initial answer leakage.

## Committed evidence

`M05NetworkGame.tsx`, in the always-visible mission sidebar, renders before evidence inspection:

```text
OBJECTIVE
Prove the dependency, predict both call policies, and explain why a bound changes the outcome.
```

and:

```text
03 bound the waiting
```

The same initial component also titles the page:

```text
The wait is part of the system.
```

The first title is acceptable as symptom framing. The two explicit “bound” statements are not neutral investigation framing: they disclose the intervention direction before the player has inspected E01–E05 or diagnosed the dependency.

The rendered-route regression currently checks only that internal identifiers such as:

```text
NETWORK_DEPENDENCY_WAITING
BOUNDED_TIMEOUT_ONE_RETRY
2-second teaching-simulation DB outage
```

are absent. It therefore passes while missing the visible natural-language leak.

## Impact

The player is told the lesson’s intervention direction before proving the diagnosis. That weakens:

```text
OBSERVE → INVESTIGATE → DIAGNOSE → EXPLAIN
```

because “bound the waiting” is already presented as the mission goal.

This is especially relevant because E03 is intentionally allowed to introduce bounded remote-call behaviour **after inspection**. The opening should not pre-empt that discovery.

## Bounded fix

Change only fresh-player/always-visible opening copy to neutral wording, for example semantically:

```text
Prove the dependency, predict both call behaviours, and explain what changes the outcome.
```

and replace:

```text
03 bound the waiting
```

with a neutral action such as:

```text
03 compare call behaviour
```

Do not change later evidence, prediction, experiment, decision, or completion language.

Strengthen the rendered initial-route/runtime-string regression to reject natural-language recommendation patterns such as:

```text
bound the waiting
bound the wait
use a timeout
retry once
bounded timeout
```

in the initial player-facing fixture while still allowing author-only documentation and later-phase runtime strings.

---

# M05-F02 — No committed M05 core regressions for the engine contract

## Severity

**Contract-blocking, bounded**

## Evidence

At `2e48a25`, `tests/game-core.test.mjs` imports the M05 engine symbols:

```text
M05_INITIAL_DEPENDENCY_MAP
M05_PREDICTIONS
M05_REQUIRED_CAUSAL_ORDER
canUnlockM05Evidence
causalLinksCorrectM05
causalOrderCorrectM05
correctM05DependencyMap
diagnosisProofIsEnoughM05
m05ProofEvidenceEnough
policyJustificationCorrectM05
predictionsCorrectM05
resultChecksCorrectM05
scoreM05
```

but the committed test body proceeds from M04 tests into Climate Detective tests without M05 engine test cases.

The QA note reports `npm run test:core — PASS, 176 tests`, but that proves the existing suite passed; it does not provide the missing M05 contract regressions.

## Contract impact

The implementation contains correct-looking deterministic helpers, but key accepted invariants are not locked by committed regression tests, including:

- M05-T004 evidence gate;
- M05-T005 uninspected-proof rejection;
- M05-T009 dependency classification;
- M05-T010 seven-link causal order/evidence links;
- M05-T011 prediction completeness before reveal at the engine/state-contract level;
- M05-T013–T016 result semantics;
- M05-T020 policy justification;
- M05-T022 exact 100-point score;
- M05-T023 efficiency tiers;
- M05-T024 contradictory-state/completion consistency;
- M05-T038 source-example isolation where implemented as runtime/static assertions.

This matters because M05 is explicitly specified as deterministic and non-LLM-authoritative.

## Bounded fix

Add M05-only core regressions using the already implemented engine API. At minimum assert:

1. evidence gate:
   - E01–E05 only → false;
   - +E06 → true;
   - +E07 → true;
   - missing mandatory evidence → false;

2. inspected proof:
   - correct inspected E01/E02/E03 → true;
   - proof containing an uninspected required token → false;
   - wrong diagnosis → false;

3. dependency map:
   - canonical map → true;
   - at least one plausible wrong map → false;

4. causal contract:
   - seven canonical claims;
   - canonical order true;
   - wrong order false;
   - exact E01–E04 links true;

5. prediction contract:
   - exactly 10 controls = five assertions × two policies;
   - incomplete prediction map cannot commit;
   - canonical prediction set is correct;

6. result contract:
   - required qualitative result checks are deterministic;

7. policy:
   - bounded timeout + one retry + all five justifications → true;
   - unbounded/retry-until-success/capacity alternative → false;

8. scoring:
   - clean canonical state = exactly 100;
   - efficiency = 5/4/3/2 for 0/1/2/3+ recoveries;
   - unseen proof cannot receive full diagnosis score;
   - contradictory final state cannot satisfy `canCompleteM05()`.

No gameplay redesign is required.

---

# Contract-by-contract review

## M05-T001 — Fresh-player objective within 10 seconds

**PASS with F01 wording correction required**

The opening clearly identifies:

- separated Web/DB topology;
- a DB-dependent request that does not complete;
- an investigation objective.

A fresh player can identify the problem quickly. The issue is not discoverability; it is that the objective prematurely states the intervention direction.

---

## M05-T002 — No initial answer leakage

**FAIL — M05-F01**

The initial sidebar contains “explain why a bound changes the outcome” and “bound the waiting.”

The existing rendered-route test is too narrow to catch that natural-language leak.

---

## M05-T003 — Provenance boundary

**PASS**

The component visibly distinguishes:

- fictional Atlas Market operations report;
- source 1.2 topology;
- teaching-simulation values.

Evidence records in `m05-engine.ts` also carry explicit provenance strings.

---

## M05-T004 — Evidence gate

**IMPLEMENTATION PASS / REGRESSION GAP**

`canUnlockM05Evidence()` requires:

```text
E01 + E02 + E03 + E04 + E05
AND E06 or E07
AND at least 6 unique inspected IDs
```

This matches v1.2.

No committed M05 core regression currently locks it. See M05-F02.

---

## M05-T005 — No uninspected proof

**IMPLEMENTATION PASS / REGRESSION GAP**

`m05ProofEvidenceEnough(proof, inspected)` first enforces:

```text
every proof ID ∈ inspected
```

then requires E01 + E02 + one of E03/E04.

`diagnosisProofIsEnoughM05()` composes this with the correct diagnosis.

The invariant is therefore engine-level, not merely a disabled UI.

No M05 core regression currently proves the unseen-evidence rejection. See M05-F02.

---

## M05-T006–T009 — Diagnosis, recovery, dependency map

**PASS**

The dependency map requires:

```text
JDBC_DB_CALL → CROSSES_DB_NETWORK_DEPENDENCY
AFFECTED_SHOP_REQUEST → CROSSES_DB_NETWORK_DEPENDENCY
COMPARATOR_LOCAL_ACTION → DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP
DISK_FULL_HYPOTHESIS → UNSUPPORTED_CAUSE
CPU_EXHAUSTION_HYPOTHESIS → UNSUPPORTED_CAUSE
```

Wrong maps preserve progress and return local feedback.

Wrong diagnoses similarly increment recovery and remain editable.

The M04 and CPU alternatives are plausible rather than joke answers.

---

## M05-T010 — Seven-link causal explanation

**PASS**

The engine defines seven causal claims:

```text
WEB_DB_ARE_SEPARATE
DB_CALL_CROSSES_NETWORK_DEPENDENCY
DEPENDENCY_BECOMES_UNAVAILABLE
DB_DEPENDENT_REQUEST_WAITS
WAITING_WORK_REMAINS_OCCUPIED
BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
RETRY_IS_ANOTHER_BOUNDED_ATTEMPT
```

and exact evidence links:

```text
E01 → DB_CALL_CROSSES_NETWORK_DEPENDENCY
E02 → DB_DEPENDENT_REQUEST_WAITS
E03 → BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
E04 → WAITING_WORK_REMAINS_OCCUPIED
```

The UI uses explicit Up/Down controls rather than drag-only ordering.

---

## M05-T011 — Five predictions per policy before reveal

**PASS**

`M05_PREDICTIONS` contains ten controls:

```text
5 Condition A assertions
+
5 Condition B assertions
```

The five assertion dimensions are:

1. affected work waiting;
2. error surfaced;
3. retry guarantees success;
4. fixed slot count changes;
5. dependency recovers.

`commitPredictions()` requires all ten choices before entering `run-unbounded`.

Neither reveal is reachable through the normal UI before this commit.

Wrong predictions are allowed as genuine predictions and reduce score; the player can still learn from the reveal.

---

# Deterministic outage experiment

## Same 2-second teaching simulation

**PASS**

Both run screens explicitly use the same separated topology and dependency outage.

Condition A says the DB dependency remains unavailable for the full 2-second lab window.

Condition B explicitly says:

```text
Keep the outage, topology, starting occupancy and fixed slot count identical.
Change only the call policy.
```

The numeric values are labelled `TEACHING_SIMULATION` / “not production recommendations.”

## Unbounded result

**PASS**

Condition A reveals qualitatively:

- affected work still waiting at 2.00 lab seconds;
- no dependency error surfaced;
- dependency remained unavailable;
- fixed slots unchanged.

## Bounded result

**PASS**

Condition B uses:

```text
timeout 0.75 lab seconds
retry delay 0.25 lab seconds
maximum retries 1
```

and reveals:

- error surfaced after bounded attempts;
- one retry occurred;
- retry also failed;
- dependency remained unavailable;
- slot count did not change.

Retry is explicitly described as not guaranteeing success.

---

# M05-T017–T020 — Policy alternatives and final decision

**PASS**

The four decision cards are:

- Keep waiting;
- Bound the call + retry once;
- Retry until success;
- Increase request slots.

The latter three alternatives are not collapsed into a vocabulary quiz: they correspond to competing operational intuitions.

Full policy completion requires:

```text
BOUNDED_TIMEOUT_ONE_RETRY
+
all five justification concepts
```

Capacity is explicitly held outside the intervention question.

---

# M05-T021 / T036 / T038 — Numeric and source-example provenance

**PASS in inspected runtime**

Player-facing numeric experiment values are explicitly described as teaching simulation / not production recommendations.

The source example values `0.5 ms`, `50`, `3000`, and `500` were not found in the inspected M05 player-facing component as incident telemetry or controls.

Primary result language is qualitative; timeline numbers are secondary.

---

# M05-T022 — Exact 100-point clean score

**IMPLEMENTATION PASS / REGRESSION GAP**

The score components sum to exactly:

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

`scoreM05()` awards prediction as one point for each of ten correct policy-specific choices, which is equivalent to the v1.2 10-point prediction category.

The committed QA records a desktop clean path reaching `100/100`.

A direct committed M05 core assertion for the canonical 100-point state is missing. See M05-F02.

---

# M05-T023 — Efficiency tiers

**IMPLEMENTATION PASS / REGRESSION GAP**

The engine implements:

```text
0 recoveries → 5
1 → 4
2 → 3
3+ → 2
```

This matches the accepted contract.

Direct M05 regression assertions are absent.

---

# M05-T024 — Contradictory-state prevention

**PASS in normal UI; engine completion predicate is strong**

`canCompleteM05()` requires:

- evidence gate;
- correct dependency map;
- correct diagnosis + inspected proof;
- correct causal order;
- exact causal links;
- correct predictions;
- both runs;
- all result checks;
- correct bounded policy + justifications.

The UI itself progresses through the legal phase sequence and cannot normally jump directly to later screens.

One nuance: the UI allows an incorrect prediction to remain as the learner’s historical prediction and still continue after reveal, which is appropriate for a prediction mechanic and is reflected in score. The engine's `canCompleteM05()` is stricter than the UI completion path because it requires predictions to be correct. That helper is not used by `commitPolicy()`.

This does **not** currently create a visible contradiction in the accepted player loop, because M05-T024's completion wording focuses on final diagnosis, causal model, experiment reconciliation and bounded policy rather than retroactively forcing a prediction to become correct. However, the mismatch should be locked intentionally in tests so a future implementation agent does not treat `canCompleteM05()` and UI completion as interchangeable.

This is covered by the bounded regression request in M05-F02 rather than opened as a separate gameplay defect.

---

# M05-T025 — Replay

**PASS**

Replay resets:

- phase;
- inspected evidence;
- map/token selection;
- diagnosis/proof;
- causal order/links;
- predictions;
- result checks;
- run flags;
- policy/justifications;
- recovery count;
- feedback.

The committed QA records replay returning to `0/7 INSPECTED` with no result or score.

---

# M05-T026 — Genuine gameplay/state-machine integrity

## Verdict: **PASS**

This is not a dashboard.

The player must perform distinct actions:

```text
OBSERVE
→ inspect evidence
→ classify dependency tokens
→ diagnose + cite proof
→ reorder seven causal claims
→ attach evidence links
→ make ten predictions
→ explicitly run Condition A
→ reconcile Condition A
→ explicitly run Condition B
→ reconcile Condition B
→ choose a policy
→ select five justification concepts
→ score/replay
```

The controlled comparison changes only the call policy, which makes the causal intervention legible.

---

# Runtime boundary — M05-T032/T033/T034/T040

## Verdict: **PASS in inspected player-facing runtime**

The M05 component does not introduce later architecture solutions.

Pool size and database capacity appear only as explicit “not tuned here” boundary language.

There is no player-facing control for:

- pool size;
- database max connections;
- connection-capacity tuning;
- throughput tuning.

No later architecture solution is required by completion.

The accepted runtime-scoped testing principle remains correct: forbidden-content checks must inspect the player-facing runtime fixture/registry, not grep author documentation that necessarily names deferred topics.

No M06 content is proposed by this review.

---

# Rendered initial route

## Verdict: **PARTIAL — structural PASS, leakage assertion insufficient**

`tests/rendered-html.test.mjs` verifies:

- route 200;
- M05 identity;
- remote-call symptom;
- diagnosis locked;
- Atlas Market fiction boundary;
- absence of internal diagnosis/policy/result identifiers.

That is useful.

It does **not** catch the actual natural-language intervention leak in the sidebar. M05-F01 therefore remains open.

---

# Accessibility and responsive review

## Native keyboard/tap structure

**CODE STRUCTURE: PASS**

The mission uses native:

- `button`;
- `radio`;
- `checkbox`;
- `select`;

controls.

Causal reordering uses explicit Up/Down buttons with `aria-label`s. No drag operation is required.

The QA note says the causal reorder controls were exercised and describes the route as button/radio/checkbox based.

## 390px

**OPEN EVIDENCE DEBT**

CSS has a `max-width:760px` M05 breakpoint that stacks:

- observe grid;
- dependency board;
- result grid;
- policy grid;
- topology;
- score layout.

This supports the intended responsive structure, but a real 390px clean/recovery capture is explicitly still open in committed QA.

Do not mark M05-T029 verified yet.

## Keyboard-only

**OPEN EVIDENCE DEBT**

Native semantics strongly support a keyboard path, but the committed QA explicitly says a standalone fresh-route keyboard-only trace remains open.

Do not mark M05-T027 fully verified.

## Touch

**OPEN EVIDENCE DEBT**

The interaction model is tap-compatible and has no drag-only dependency, but no touch-specific trace is committed.

Do not mark M05-T028 fully verified.

## Reduced motion

**OPEN EVIDENCE DEBT**

`globals.css` contains a scoped:

```css
@media(prefers-reduced-motion:reduce)
```

rule for `.arch-m05-shell` that removes transition/animation and hover transform.

The M05 result semantics do not depend on animation.

However, no explicit reduced-motion execution/capture is committed. M05-T030 remains open verification debt.

## Screen reader

**OPEN EVIDENCE DEBT**

Positive code evidence includes:

- semantic fieldsets/legends for predictions/results;
- radio/checkbox/select controls;
- `aria-pressed` selection state;
- labelled causal movement buttons;
- alert/status feedback;
- `aria-live="polite"` on the main mission area.

But a real announcement transcript is explicitly open in QA. M05-T031 remains unverified.

---

# Committed verification evidence

The committed `M05-playtest-qa.md` records:

- desktop fresh-player path completed;
- E01–E06 evidence gate behaviour observed;
- correct dependency map/diagnosis/proof;
- seven-claim causal chain;
- all ten predictions committed before result;
- both 2-second controlled runs;
- final bounded policy;
- `100/100`;
- wrong causal-order recovery to `98/100`;
- replay reset;
- `npm run lint` PASS;
- `npm run test:core` PASS, 176 tests;
- `npm run build` PASS;
- rendered-route tests PASS.

This review treats those as **committed project evidence**.

I did **not** independently execute the local npm/build/browser suite in this review environment, so I do not re-label those runs as independently reproduced.

The committed source itself was independently inspected at `2e48a25`.

---

# Acceptance-status summary

| Contract area | Status |
|---|---|
| Fresh objective | PASS, wording fix needed |
| Initial no-leak | **FAIL — F01** |
| Provenance | PASS |
| E01–E05 + comparator gate | PASS implementation |
| No-uninspected-proof | PASS implementation |
| Dependency map | PASS |
| Diagnosis recovery | PASS |
| Seven causal claims/links | PASS |
| Five predictions per policy | PASS |
| Prediction before reveal | PASS |
| Same 2-second simulation | PASS |
| Unbounded qualitative result | PASS |
| Bounded timeout + one retry | PASS |
| Retry not guaranteed | PASS |
| Fixed occupancy not tunable | PASS |
| Policy alternatives | PASS |
| Exact 100 scoring model | PASS implementation |
| Efficiency tiers | PASS implementation |
| Replay | PASS |
| Genuine gameplay | PASS |
| M06/later boundary | PASS |
| Rendered route | PASS structurally; leak coverage incomplete |
| M05 core regression suite | **FAIL — F02** |
| 390px real evidence | OPEN |
| Keyboard-only full trace | OPEN |
| Touch trace | OPEN |
| Reduced-motion execution | OPEN |
| Screen-reader transcript | OPEN |

---

# Required bounded correction set

## For M05-F01

In `M05NetworkGame.tsx`:

- neutralise only fresh/always-visible sidebar wording;
- do not alter later evidence, experiment, decision, or completion;
- extend initial rendered/runtime leakage checks to natural-language policy recommendations.

## For M05-F02

In `tests/game-core.test.mjs`:

- add focused M05 engine regressions for gate, inspected proof, map, causal order/links, ten prediction controls, results, policy, exact score, efficiency and completion consistency;
- do not redesign the engine or mission.

---

# Final verdicts

## 1. Implementation correctness

# **REVISION REQUIRED**

The mission implementation is close, but M05-F01 violates the accepted evidence-before-answer opening and M05-F02 leaves the deterministic contract without committed M05 engine regressions.

## 2. Genuinely playable required loop

# **PASS**

The implemented flow genuinely executes:

```text
Observe
→ Investigate
→ Diagnose
→ Explain
→ Predict
→ Run unbounded
→ Reveal
→ Run bounded
→ Reveal
→ Decide
→ Score
```

with real player decisions, recoverable reasoning, and controlled causal comparison.

## 3. Full verification

# **CONDITIONAL PASS**

Desktop committed QA is strong, but real:

- 390px;
- keyboard-only;
- touch;
- reduced-motion;
- screen-reader

evidence remains explicitly OPEN.

## Does M05 storyboard v1.2 remain satisfied?

# **NO — bounded revision required**

The architecture/gameplay contract is substantially implemented, but the two bounded findings above must close before the implementation can be declared fully faithful to v1.2.

This review does not propose or design M06.
