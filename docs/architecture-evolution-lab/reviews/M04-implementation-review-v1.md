# M04 Implementation Review v1

## Scope

**Mission:** M04 — Disk Full at 02:00  
**Repository:** `micah-charles/axiom-atlas`  
**Branch:** `feature/architecture-evolution-lab`  
**Reviewed commit:** `71c87b7a7fb898a792647b65198a4e74ad438328` — `feat: add M04 disk capacity investigation`  
**Accepted contract:** `docs/architecture-evolution-lab/artifacts/chatgpt/M04-disk-full-at-0200-storyboard-v1.1.md`

Reviewed committed source/artifacts:

- `app/games/architecture-lab/m04-engine.ts`
- `app/games/architecture-lab/M04DiskFullGame.tsx`
- `app/computer-science/architecture-lab/m04/page.tsx`
- `tests/game-core.test.mjs`
- `tests/rendered-html.test.mjs`
- `docs/architecture-evolution-lab/evidence/M04-playtest-qa.md`

No code was modified. No M05+ storyboard/content was designed.

# Executive verdict

## Implementation correctness: **REVISION REQUIRED**

The M04 implementation is broadly strong and genuinely playable. The evidence gate, diagnosis proof, shared-resource map, causal order/evidence links, prediction-before-reveal, deterministic qualitative experiment, intervention alternatives, trade-off stop boundary, exact 100-point clean score, efficiency tiers, replay, and rendered initial-route no-leak test are all represented in committed code/tests.

However, one contract-blocking implementation gap remains:

- **M04-F01 — uninspected evidence can still be used as diagnosis proof.**

The accepted storyboard explicitly requires that an uninspected evidence ID cannot be attached as diagnosis or causal proof. The engine helper `m04ProofEvidenceEnough()` validates the presence of E02 plus two of E03/E04/E05, but it does not validate that those proof IDs are part of `inspected`. The UI’s proof-selection logic also operates from the inspected evidence panel state rather than a state-level invariant. This means the engine/data contract does not independently enforce the no-unseen-proof rule, and tests do not cover that acceptance criterion.

This is bounded. No redesign is required.

## Full verification: **CONDITIONAL PASS**

Committed QA documents show:

- desktop clean path PASS at 100/100;
- wrong CPU diagnosis recovery PASS;
- replay reset PASS;
- lint/test/build PASS as documented;
- rendered-route coverage exists.

The committed QA explicitly leaves these as open evidence debt:

- real 390 × 844 clean/recovery;
- keyboard-only completion;
- touch completion;
- reduced-motion completion;
- screen-reader announcement transcript.

Those remain OPEN and are not treated as verified from code alone.

## Genuinely playable: **PASS**

M04 is not a static card quiz/dashboard. The player must inspect evidence, classify shared-resource consumers, commit a diagnosis, order/link a causal chain, predict outcomes, run an explicit controlled comparison, reconcile results, select an intervention, justify the trade-off, and replay/recover from wrong reasoning.

## Safe to proceed to M05 storyboard: **NO — not yet**

Close M04-F01 with a bounded state-level guard and regression test, then re-review the committed delta. The accessibility/mobile debt can remain separately tracked as full-verification debt once implementation correctness passes.

---

# 1. Initial OBSERVE state / answer leakage

## Verdict: **PASS**

The committed rendered-route test checks that the initial M04 route contains:

- the M04 mission identity;
- failed-write incident wording;
- `DIAGNOSIS LOCKED`;
- Atlas Market fiction boundary;

and does **not** contain:

- `SHARED_DISK_CAPACITY`;
- `MySQL filled the disk`;
- `Isolate Web and DB`.

The component opening copy similarly frames the incident as two failed writes and asks the learner to prove the shared cause.

The source/fiction/simulation distinction is visible in evidence-card provenance and incident framing.

No blocking answer leakage found in the initial route.

---

# 2. Evidence gate and no-unseen-proof rule

## Evidence gate: **PASS**

The engine defines:

```text
required E01–E05
+
at least one comparator E06/E07
+
unique count >= 6
```

`canUnlockM04Evidence()` implements exactly that.

The component derives the same gate before exposing the resource/diagnosis flow.

The core test verifies:

```text
E01–E05 only → false
E01–E05 + E06 → true
```

Duplicate comparator inspection does not create a false unlock.

## Uninspected evidence as proof: **FAIL — M04-F01**

The accepted contract requires:

> “An uninspected evidence ID cannot be attached as a diagnosis or causal proof token.”

The current proof helper is:

```text
m04ProofEvidenceEnough(proof)
```

and checks only:

```text
E02
+
at least two of E03/E04/E05
```

It does not accept or compare against the `inspected` set.

The completion helper likewise calls:

```text
diagnosisProofIsEnough(diagnosis, proof)
```

without an inspection-state parameter.

Therefore the core engine does not prove the invariant:

```text
proof ⊆ inspected
```

The current tests verify the proof composition but not the inspection relationship.

### Bounded fix

Make the diagnosis-proof gate inspection-aware, for example semantically:

```text
proof ⊆ inspected
AND E02 ∈ proof
AND count(E03,E04,E05 in proof) >= 2
```

The exact API shape is implementation choice; the invariant is the contract.

Add a regression equivalent to:

```text
inspected = [E01,E02,E03,E06]
proof = [E02,E03,E04]
→ diagnosis proof rejected because E04 is uninspected
```

and:

```text
inspected = [E01,E02,E03,E04,E06]
proof = [E02,E03,E04]
→ accepted
```

No gameplay/UI redesign is required.

---

# 3. Diagnosis and recoverable wrong reasoning

## Verdict: **PASS, subject to F01 proof-state fix**

The engine requires `SHARED_DISK_CAPACITY` for a valid diagnosis and the correct proof composition.

The component’s wrong-diagnosis path is recoverable: it increments `recoveryCycles`, preserves evidence/progress, and returns local feedback rather than auto-revealing the full answer.

The committed QA explicitly documents a wrong CPU diagnosis, recovery, and completion at 99/100.

The request-path alternative is present as a plausible diagnosis and the comparator E07 supports local feedback without replaying M02 as the central mechanic.

---

# 4. Resource map and causal explanation

## Resource map: **PASS**

The correct map is encoded as:

```text
MySQL persistent data → SHARED_LOCAL_DISK
Tomcat log write      → SHARED_LOCAL_DISK
Seller image write    → SHARED_LOCAL_DISK
CPU comparator        → NOT_SHOWN_TO_CONSUME_THIS_DISK
Request-path comparator → NOT_SHOWN_TO_CONSUME_THIS_DISK
```

`correctM04ResourceMap()` implements this exactly.

A wrong map is recoverable; `commitCause()` returns the learner to the resource phase rather than dead-ending.

## Causal order: **PASS**

The canonical five-step chain is implemented:

```text
CATALOGUE_GROWS
→ PERSISTENT_DB_DATA_GROWS
→ DB_AND_APP_WRITES_SHARE_FINITE_DISK
→ SHARED_DISK_REACHES_CAPACITY
→ TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE
```

## Evidence links: **PASS**

`causalLinksCorrectM04()` requires exactly:

```text
E01 → CATALOGUE_GROWS
E03 → PERSISTENT_DB_DATA_GROWS
E02 → SHARED_DISK_REACHES_CAPACITY
E04 → blocked writes
E05 → blocked writes
```

This matches the accepted storyboard.

---

# 5. Prediction-before-reveal

## Verdict: **PASS**

The component has distinct `predict`, `run`, and `reveal` phases.

`canCommitM04Predictions()` requires all five prediction assertions.

The experiment result does not appear until:

```text
predictions committed
→ phase run
→ explicit runExperiment()
→ phase reveal
```

The core tests verify incomplete prediction state cannot commit.

No early Condition A/B outcome leak was found in the inspected state flow.

---

# 6. Deterministic controlled experiment

## Verdict: **PASS**

The committed mission models:

### Shared condition

- shared capacity exhausted;
- log write blocked;
- image write blocked;
- shared Web/DB disk boundary remains true.

### Isolated condition

- tested writes have lab-model space;
- Web and DB no longer share the exact same disk capacity boundary;
- finite-capacity boundary remains explicit.

The result checks are qualitative:

- shared writes blocked;
- isolated writes available;
- finite boundary.

This matches the mission’s central shared-resource lesson.

No network timing, packet loss, timeout, retry, or connection-pool lesson is introduced in the M04 experiment.

---

# 7. Intervention and trade-off

## Intervention stage: **PASS**

The intervention cards are defined after the evidence/experiment path and include:

- Web/DB isolation;
- bigger single-host disk;
- CPU-only;
- logger-only.

The score engine gives:

```text
WEB_DB_ISOLATION → 10 base intervention points
BIGGER_SINGLE_HOST_DISK → 6
CPU/logger-only → 2
```

and adds the 5-point justification only when Web/DB isolation is paired with the required shared-disk/separate-domain/finite-domain reasoning.

Thus the bigger shared disk is treated as plausible partial relief rather than a silly answer.

## Images remain Web-local: **PASS**

The separated topology explicitly renders:

```text
WEB HOST
Tomcat
Local images · Web disk

DB HOST
MySQL
Persistent data · DB disk
```

No object-storage/CDN/distributed-storage solution is introduced.

## Trade-off: **PASS**

The allowed trade-off is the network dependency.

The player must choose the network consequence before completion.

The mission stops there and does not teach M05 network failure/remediation or M06 connection-capacity tuning.

---

# 8. Scoring, efficiency, and completion

## Exact clean score: **PASS**

The committed core test verifies a clean path totals exactly 100.

The scoring categories align with the accepted rubric:

- investigation 15;
- diagnosis 15;
- resource map 10;
- causal 15;
- prediction 10;
- experiment 10;
- intervention 15 total including justification;
- trade-off 5;
- efficiency 5.

## Efficiency tiers: **PASS**

The engine uses:

```text
0 → 5
1 → 4
2 → 3
3+ → 2
```

and core tests explicitly verify 0,1,2,3,99.

## Completion integrity: **PASS except F01 proof-inspection invariant**

`canCompleteM04()` requires:

- evidence gate;
- correct map;
- correct diagnosis proof;
- all predictions correct;
- all result checks correct;
- causal order;
- causal links;
- justified Web/DB isolation;
- correct trade-off.

The only blocking inconsistency is that diagnosis proof correctness is not inspection-aware.

---

# 9. Replay/reset

## Verdict: **PASS**

`replay()` resets:

- phase;
- inspected evidence;
- resource map;
- selected token;
- diagnosis;
- proof;
- causal order/links;
- predictions;
- result checks;
- intervention;
- justifications;
- trade-off;
- recovery cycles;
- feedback.

This matches the required mission reset semantics.

The committed QA independently documents replay returning to the initial incident/evidence state with hidden result and no score.

---

# 10. Player-facing scope / later-solution leakage

## Verdict: **PASS in inspected M04 runtime**

No player-facing later architecture solution was found in the inspected M04 component/engine.

The completion/intervention path stays with:

```text
shared disk evidence
→ Web/DB resource isolation
→ network dependency
→ stop
```

No M05 network failure lesson or M06 pool/max_connections lesson is introduced.

No load balancer, Redis, Kubernetes, container, microservice, queue/Kafka, replica, sharding, CDN, object-storage/distributed-storage, or autoscaling recommendation is part of the M04 runtime flow.

---

# 11. Rendered-route and regression coverage

## Rendered initial route: **PASS**

`tests/rendered-html.test.mjs` includes a dedicated M04 test that:

- renders `/computer-science/architecture-lab/m04`;
- checks status 200;
- asserts M04 identity;
- asserts failed-write incident;
- asserts diagnosis locked;
- asserts fiction boundary;
- asserts no initial root-cause/intervention answer strings.

## Core regression coverage: **PASS with one missing acceptance regression**

The committed M04 core tests cover:

- evidence gate;
- map correctness;
- diagnosis proof composition;
- prediction completeness;
- result checks;
- causal order;
- causal evidence links;
- intervention justification;
- perfect 100 score;
- bigger-disk partial intervention score;
- efficiency tiers.

Missing bounded regression:

- proof IDs must be a subset of inspected evidence.

That corresponds directly to M04-F01.

---

# 12. Test/build evidence honesty

The committed playtest QA document records:

- `npm run lint` PASS;
- `npm run test:core` PASS, 173 tests;
- `npm run build` PASS;
- `npm test` PASS, 173 core + production build + 8 rendered-route tests;
- desktop clean path PASS at 100/100;
- wrong CPU diagnosis recovery PASS;
- replay reset PASS.

This review records those as **committed/documented project evidence**.

I do not claim to have independently rerun the local Node/build/browser suite in this review session.

The GitHub commit and source were independently inspected.

---

# 13. Genuine gameplay/state-machine integrity

## Verdict: **PASS**

M04 has a real evidence-driven game loop:

```text
observe incident
→ inspect neutral evidence
→ classify resource consumers
→ commit diagnosis/proof
→ construct causal chain
→ predict two conditions
→ run controlled comparison
→ reconcile results
→ choose intervention
→ justify trade-off
→ score
→ replay/recover
```

Wrong diagnosis and intervention paths are recoverable and affect efficiency rather than producing a terminal fail state.

This is not a passive dashboard or architecture-card quiz.

---

# 14. Accessibility/mobile verification

## Implementation structure: **CONDITIONAL PASS**

The component uses native interactive controls and does not require drag for the core path. Feedback uses alert/status roles, and mission state is textual rather than color-only.

However, the user explicitly requested that these not be considered verified from code alone.

The committed QA itself records all of the following as open:

### M04-V01 — Real 390 × 844 clean/recovery
**OPEN**

Need actual viewport evidence for:
- clean completion;
- at least one wrong-path recovery;
- no horizontal overflow;
- readable evidence/resource/causal/prediction/result/intervention/score states.

### M04-V02 — Keyboard-only completion
**OPEN**

Native controls suggest a viable path, but explicit end-to-end evidence is not yet committed.

### M04-V03 — Touch completion
**OPEN**

Tap/click controls exist structurally; real touch-path evidence is still open.

### M04-V04 — Reduced motion
**OPEN**

Need an explicit run with `prefers-reduced-motion: reduce`.

### M04-V05 — Screen reader
**OPEN**

Need an announcement transcript/checklist for evidence state, gate, resource placement, errors, predictions, results, intervention and completion.

These are full-verification debts, not newly established implementation defects.

---

# 15. Blocking finding

## M04-F01 — No state-level “proof must be inspected” invariant

**Severity:** blocking but narrowly bounded

### Evidence

The engine’s proof predicate checks the proof IDs themselves but not their membership in `inspected`.

### Contract affected

- M04-T005 — No unseen evidence proof.
- Final diagnosis/completion integrity.

### Exact bounded fix

Make proof validation inspection-aware and use that invariant in both diagnosis commit and completion.

Semantically:

```text
every proof ID ∈ inspected
AND E02 present
AND at least two of E03/E04/E05 present
```

Add direct engine regression tests for unseen-proof rejection and inspected-proof acceptance.

Do not change:
- evidence gate;
- gameplay phases;
- scoring weights;
- experiment;
- intervention;
- M05/M06 boundary.

---

# Final decision table

| Area | Decision |
|---|---|
| Initial no-leak state | PASS |
| Provenance boundary | PASS |
| Evidence gate | PASS |
| No-unseen-proof invariant | **REVISION REQUIRED — M04-F01** |
| Diagnosis/recovery | PASS subject to F01 |
| Resource map | PASS |
| Causal order/evidence links | PASS |
| Prediction-before-reveal | PASS |
| Deterministic experiment | PASS |
| Intervention alternatives | PASS |
| Web/DB isolation/trade-off | PASS |
| Images remain Web-local | PASS |
| Exact 100-point clean score | PASS |
| Efficiency tiers | PASS |
| Replay | PASS |
| Rendered initial route test | PASS |
| Core regression coverage | PASS except F01 |
| Genuine gameplay | PASS |
| M05/M06/later-solution boundary | PASS |
| Implementation correctness | **REVISION REQUIRED** |
| Full verification | **CONDITIONAL PASS** |
| 390px evidence | OPEN |
| Keyboard evidence | OPEN |
| Touch evidence | OPEN |
| Reduced-motion evidence | OPEN |
| Screen-reader evidence | OPEN |
| Safe to request M05 storyboard | **NO — close M04-F01 first** |
