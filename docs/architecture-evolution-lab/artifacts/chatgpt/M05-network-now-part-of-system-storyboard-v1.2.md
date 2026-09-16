# M05 — The Network Is Now Part of the System
## Architecture Evolution Lab — Storyboard / Content Design v1.2

> **Artifact:** `M05-network-now-part-of-system-storyboard-v1.2.md`  
> **Scope:** M05 only. Storyboard/data contract, not application code.  
> **Act:** Act I — One Machine, First Limits / Vertical Slice A  
> **Primary source:** `ccc115a/se`, `_more/mybook/向淘寶學習網站架構演進/1.2.md`  
> **Authoritative source blob SHA:** `00756d5a3a4054cd9592e19199c10626cdce993a`  
> **Accepted continuity:** `M04-disk-full-at-0200-storyboard-v1.1.md`; `M04-implementation-review-v2.md`; M04 implementation correctness PASS at `3bd2816`.  
> **Verification debt carried forward, not closed here:** real 390px, keyboard-only, touch, reduced-motion, and screen-reader evidence for M04 remain OPEN.

---

# 1. Mission objective and learner promise

## Mission objective

After M04, Atlas Market's Web/application and database resource domains are separated. A DB call that used to stay inside one host now crosses an internal TCP dependency.

A fictional operational report arrives:

> “Some shop requests that need the database stop making progress when the DB path disappears. Work begins to wait. What should the application do while that dependency is unavailable?”

The player must **prove the new dependency from evidence**, distinguish network-dependent waiting from unrelated causes, construct the causal chain, predict bounded and unbounded behaviours before seeing results, run a deterministic **2-second teaching-simulation DB outage**, and justify a bounded timeout/failure policy.

M05 teaches:

```text
Web and DB separated
→ DB call crosses a network dependency
→ dependency can become unavailable
→ callers may wait while work remains occupied
→ waiting needs a bound
→ timeout surfaces failure instead of waiting indefinitely
→ a retry can create another attempt and must itself be bounded
```

The mission deliberately stops before tuning pool size or database connection capacity.

## Learner promise

> “You will not be told that ‘networks are unreliable’ and asked to memorise it. You will predict what requests do during a controlled dependency outage, run the experiment, inspect the waiting work, then choose a bounded behaviour from evidence.”

## Learning objectives

By completion, the learner can:

1. explain why Web→DB is now a network dependency after M04 separation;
2. distinguish dependency waiting/timeout behaviour from M04 disk contention and from unsupported CPU/application guesses;
3. explain that a remote call can wait when its dependency is unavailable;
4. predict what an unbounded-wait policy does during a controlled outage;
5. explain that a bounded timeout returns control/error rather than allowing indefinite waiting;
6. explain that a retry is another attempt, not a guarantee of success;
7. justify a **bounded timeout + at most one bounded retry in this teaching model** without treating those simulated values as production recommendations;
8. explicitly defer pool-size/database-capacity tuning to M06.

## Success state

The player:

- satisfies the evidence gate;
- diagnoses `NETWORK_DEPENDENCY_WAITING`;
- attaches only inspected proof;
- builds the required causal chain;
- commits predictions for two policies before reveal;
- runs the deterministic 2-second outage;
- correctly interprets waiting, timeout/error, bounded retry, and fixed occupancy evidence;
- chooses `BOUNDED_TIMEOUT_ONE_RETRY` and justifies its mechanism and limits;
- scores deterministically;
- optionally reflects.

## Recoverable failure states

Wrong diagnosis, wrong causal order, wrong predictions, unbounded-wait selection, or retry-without-bounds reasoning are recoverable. Evidence already inspected remains available.

---

# 2. Exact source traceability and provenance

| Claim / mechanic | Provenance | Source basis / mission basis | M05 use and boundary |
|---|---|---|---|
| After separation, Web runs Tomcat and DB runs MySQL on another machine | `SOURCE_BACKED` | §1.2 split topology | Starting topology inherited from M04. |
| Web→DB uses internal TCP/JDBC | `SOURCE_BACKED` | §1.2 topology: JDBC over intranet/TCP | Central new dependency. |
| JDBC target changes from localhost to a remote internal IP | `SOURCE_BACKED` | §1.2 connection-string change | Evidence that the call crossed a host boundary. |
| Remote connection settings include timeout and connection-pool configuration | `SOURCE_BACKED` | §1.2 example properties | Establishes that remote dependency calls need connection behaviour; M05 does not turn example numbers into production recommendations. |
| Engineers must consider what happens if DB cannot be reached and how many retries to make | `SOURCE_BACKED` | §1.2 discussion after connection-string change | Supports timeout/retry investigation. |
| Network is no longer a reliable local call; it can time out/disconnect | `SOURCE_BACKED` | §1.2 explicit distributed-system observation | Core conceptual source. |
| Source example contains `jdbc.maxPoolSize=50` | `SOURCE_BACKED_SOURCE_EXAMPLE` | §1.2 example config | **Not used as M05 tuning target or simulated pool size.** Author-only provenance. |
| Source example contains `jdbc.timeout=3000` | `SOURCE_BACKED_SOURCE_EXAMPLE` | §1.2 example config | **Not used as the M05 recommended timeout.** Author-only provenance. |
| Source diagram contains MySQL `max_connections=500` | `SOURCE_BACKED_SOURCE_EXAMPLE` | §1.2 diagram | **Excluded from player-facing M05 runtime; M06 boundary.** |
| Source says intranet latency is about 0.5 ms | `SOURCE_BACKED_SOURCE_NUMBER` | §1.2 trade-off table | **Not used as M05 incident telemetry or diagnosis target.** |
| Atlas Market has a concrete dependency symptom | `FICTIONAL_SCENARIO` | Mission framing | Not historical Taobao incident. |
| Controlled DB path is unavailable for exactly 2 seconds | `TEACHING_SIMULATION` | Mission contract | Deterministic experiment, not historical telemetry. |
| Experiment starts with 4 request slots, 2 already occupied by DB-dependent requests | `TEACHING_SIMULATION` | Educational model | Fixed occupancy evidence only; not capacity tuning. |
| Unbounded policy keeps the 2 affected requests waiting throughout the 2-second experiment | `TEACHING_SIMULATION` | Deterministic policy model | Demonstrates retained blocked work. |
| Bounded policy timeout = 0.75 lab seconds | `TEACHING_SIMULATION` | Educational model | Chosen only so the bounded outcome occurs within the 2-second experiment; not production advice. |
| Bounded policy retry delay = 0.25 lab seconds and maximum retries = 1 | `TEACHING_SIMULATION` | Educational model | Demonstrates one bounded re-attempt; not production advice. |
| Dependency remains unavailable for the full 2 seconds | `TEACHING_SIMULATION` | Deterministic control | Ensures retry also fails deterministically. |
| Under bounded policy each affected request surfaces a dependency error after its bounded attempts | `TEACHING_SIMULATION` | Deterministic model | Teaches bounded failure rather than success. |
| Pool/slot count remains fixed during both runs | `TEACHING_SIMULATION` | Educational control | Evidence only. Player cannot tune it. |
| No production latency, availability, CPU, cost, or traffic values are claimed | `BOUNDARY` | Mission contract | Runtime must not imply simulated precision is historical. |

## Numeric provenance registry

Every numeric value that may appear in M05 runtime must carry a visible or programmatically associated provenance label.

| Value | Meaning | Provenance |
|---:|---|---|
| `2 seconds` | controlled DB outage duration | `TEACHING_SIMULATION` |
| `4 slots` | fixed request-slot model | `TEACHING_SIMULATION` |
| `2 occupied` | affected requests at experiment start | `TEACHING_SIMULATION` |
| `0.75 lab seconds` | bounded timeout | `TEACHING_SIMULATION` |
| `0.25 lab seconds` | retry delay | `TEACHING_SIMULATION` |
| `1 retry maximum` | bounded retry count | `TEACHING_SIMULATION` |

Source example numbers `0.5 ms`, `50`, `3000`, and `500` may exist in author/source-trace documentation, but **must not appear as M05 incident measurements, scoring targets, recommended settings, or player-adjustable controls**.

---

# 3. Continuity with M04

M04 established and justified:

```text
WEB HOST
  Tomcat
  local images

DB HOST
  MySQL

WEB → DB
  network dependency
```

M05 accepts that topology as prior state. It does **not** ask the player to re-prove the disk-full incident or choose Web/DB separation again.

Opening continuity copy:

> “The M04 isolation change worked for the shared-disk problem. One consequence remains: database calls now leave the Web host.”

M05's new question is:

> “What happens to in-flight Web work when that remote dependency is temporarily unavailable?”

M04's outstanding mobile/accessibility verification debt remains a project-level open item and is not silently converted to PASS by this storyboard.

---

# 4. Starting state

## Initially visible

- Web host and DB host;
- one neutral Web→DB dependency line;
- a fictional incident ticket;
- two request tokens shown as `WAITING FOR DEPENDENCY` only after the opening observation is activated;
- provenance legend;
- neutral evidence case;
- objective.

## Opening incident copy

> **Atlas Market operations · fictional scenario**  
> “A shop action reaches the Web application, but the DB-dependent step does not complete while the database path is unavailable. Two affected requests remain in progress. Investigate before changing connection behaviour.”

## Initially hidden

- root-cause label;
- outage duration;
- timeout/retry values;
- policy names;
- experiment outcomes;
- error outcome;
- score;
- correct causal order.

The opening must not say:

- “use a timeout”;
- “fail fast”;
- “retry once”;
- “2-second outage”;
- “the network is down”;
- “pool saturation”;
- “increase the pool.”

---

# 5. Neutral evidence catalogue

## E01 — Connection target

**Neutral title:** `Database target`  
**Preview:** “Inspect where the Web application sends its database call.”  
**Observation after inspection:** “The source changes the JDBC target from localhost to a remote internal address after Web/DB separation.”  
**Interpretation:** “The database call now crosses a host/network boundary.”  
**Provenance:** `SOURCE_BACKED`.

## E02 — Dependency state

**Neutral title:** `Call-state probe`  
**Preview:** “Inspect what the affected requests are doing.”  
**Observation:** “Teaching simulation: two DB-dependent requests are waiting for the dependency to complete.”  
**Interpretation:** “The work has not finished and remains occupied while the dependency does not answer.”  
**Provenance:** `TEACHING_SIMULATION`.

## E03 — Remote-call behaviour

**Neutral title:** `Connection behaviour note`  
**Preview:** “Inspect what changes when the DB is remote.”  
**Observation:** “The source explicitly introduces timeout/retry questions once the DB becomes a remote dependency.”  
**Interpretation:** “A remote call needs bounded failure behaviour; it cannot be treated exactly like an in-process/local operation.”  
**Provenance:** `SOURCE_BACKED`.

## E04 — Fixed occupancy probe

**Neutral title:** `Request-slot snapshot`  
**Preview:** “Inspect the controlled workload state.”  
**Observation:** “Teaching simulation: the lab has 4 fixed request slots; 2 are occupied by the affected DB-dependent requests.”  
**Interpretation:** “Waiting work continues to occupy fixed lab slots. The slot count is a control, not a tuning choice.”  
**Provenance:** `TEACHING_SIMULATION`.

## E05 — Local-work comparator

**Neutral title:** `Non-DB action comparator`  
**Preview:** “Inspect an action that does not require the DB dependency in this lab step.”  
**Observation:** “Teaching simulation: the comparator action does not wait on the DB path.”  
**Interpretation:** “The observed wait is associated with the DB-dependent path, not all Web work indiscriminately.”  
**Provenance:** `TEACHING_SIMULATION_NEGATIVE_CONTROL`.

## E06 — Disk comparator

**Neutral title:** `Prior-incident comparator`  
**Preview:** “Inspect whether the M04 storage symptom is present.”  
**Observation:** “This M05 scenario supplies no evidence of a full shared disk.”  
**Interpretation:** “Do not reuse M04's storage diagnosis for a different symptom.”  
**Provenance:** `TEACHING_SIMULATION_NEGATIVE_CONTROL`.

## E07 — CPU comparator

**Neutral title:** `Compute comparator`  
**Preview:** “Inspect whether this incident establishes CPU exhaustion.”  
**Observation:** “No CPU-exhaustion evidence is supplied in this mission.”  
**Interpretation:** “A CPU upgrade would be unsupported by the observed evidence.”  
**Provenance:** `TEACHING_SIMULATION_NEGATIVE_CONTROL`.

## Evidence gate

```yaml
required_evidence:
  minimum_count: 6
  mandatory: [E01, E02, E03, E04, E05]
  one_of: [E06, E07]
  unlock_predicate: >
    inspected(E01)
    AND inspected(E02)
    AND inspected(E03)
    AND inspected(E04)
    AND inspected(E05)
    AND (inspected(E06) OR inspected(E07))
    AND unique_inspected_count >= 6
```

Rules:

- diagnosis is locked until the predicate is true;
- uninspected evidence cannot be selected as proof;
- evidence correctness is not encoded in card colour/order/icon;
- E04 does not allow the player to change slot count.

---

# 6. Deterministic phases and legal transitions

```text
OBSERVE
  ↓ Begin investigation
INVESTIGATE
  ↓ evidence gate satisfied
DIAGNOSE
  ↓ correct diagnosis + inspected proof
BUILD_CAUSE
  ↓ canonical causal order + links
PREDICT
  ↓ all policy predictions committed
RUN_UNBOUNDED
  ↓ explicit run
REVEAL_UNBOUNDED
  ↓ result reconciliation
RUN_BOUNDED
  ↓ explicit run
REVEAL_BOUNDED
  ↓ result reconciliation
DECIDE
  ↓ bounded policy + justification
SCORE
  ↓ optional reflection
COMPLETE
```

## INVESTIGATE → DIAGNOSE

Requires exact evidence gate.

## DIAGNOSE → BUILD_CAUSE

Diagnosis choices:

- `NETWORK_DEPENDENCY_WAITING`
- `M04_DISK_CONTENTION`
- `CPU_EXHAUSTION`
- `APPLICATION_CODE_STUCK_WITHOUT_DEPENDENCY_EVIDENCE`

Correct diagnosis:

```text
NETWORK_DEPENDENCY_WAITING
```

Required inspected proof:

```text
mandatory: E01, E02
one_of: E03, E04
```

Machine predicate:

```text
diagnosis == NETWORK_DEPENDENCY_WAITING
AND proof ⊆ inspected
AND E01 ∈ proof
AND E02 ∈ proof
AND (E03 ∈ proof OR E04 ∈ proof)
```

Wrong diagnoses commit to local recoverable feedback; they do not reveal the full chain.

## BUILD_CAUSE → PREDICT

Canonical causal order:

```text
WEB_DB_ARE_SEPARATE
→ DB_CALL_CROSSES_NETWORK_DEPENDENCY
→ DEPENDENCY_BECOMES_UNAVAILABLE
→ DB_DEPENDENT_REQUEST_WAITS
→ WAITING_WORK_REMAINS_OCCUPIED
→ BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
```

Required links:

```text
E01 → DB_CALL_CROSSES_NETWORK_DEPENDENCY
E02 → DB_DEPENDENT_REQUEST_WAITS
E04 → WAITING_WORK_REMAINS_OCCUPIED
E03 → BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
```

## PREDICT → RUN_UNBOUNDED

Player must predict all required outcomes for both policies before **either** result is visible.

## RUN_UNBOUNDED → REVEAL_UNBOUNDED

Explicit run starts a 2-second teaching-simulation outage under `UNBOUNDED_WAIT`.

## REVEAL_UNBOUNDED → RUN_BOUNDED

Player reconciles three measured claims before continuing.

## RUN_BOUNDED → REVEAL_BOUNDED

Same 2-second dependency outage, same starting occupancy, only policy changes.

## REVEAL_BOUNDED → DECIDE

Player reconciles bounded results.

## DECIDE → SCORE

Correct final choice:

```text
BOUNDED_TIMEOUT_ONE_RETRY
```

with required justification:

```text
REMOTE_CALL_CAN_WAIT
WAIT_MUST_HAVE_A_BOUND
TIMEOUT_SURFACES_CONTROLLED_ERROR
RETRY_IS_ANOTHER_BOUNDED_ATTEMPT
FIXED_SLOT_COUNT_WAS_NOT_TUNED
```

---

# 7. Core playable interaction

## A. Dependency-path board

Player classifies tokens into:

```text
CROSSES_DB_NETWORK_DEPENDENCY
DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP
UNSUPPORTED_CAUSE
```

Tokens:

- JDBC DB call
- affected shop request
- comparator local action
- disk-full hypothesis
- CPU-exhaustion hypothesis

Interaction: select token → select zone. No drag required.

## B. Causal-chain builder

Six shuffled causal chips. Up/Down controls and keyboard equivalents.

## C. Policy prediction matrix

Before running anything, player predicts:

| Question | Unbounded wait | Bounded timeout + one retry |
|---|---|---|
| Does affected work remain waiting throughout the 2-second lab window? | player predicts | player predicts |
| Is a dependency error surfaced within the lab window? | player predicts | player predicts |
| Does retry guarantee success? | player predicts | player predicts |
| Is slot count changed? | player predicts | player predicts |
| Does the DB dependency recover during this controlled outage? | player predicts | player predicts |

No correctness or result values are shown until prediction commit.

## D. Two controlled runs

The player must run **both** conditions. The topology and starting requests are identical. Only call policy differs.

## E. Result reconciliation

After each run, player matches observed result cards to causal claims.

## F. Final policy decision

Policy cards appear only after both runs:

1. `UNBOUNDED_WAIT`
2. `BOUNDED_TIMEOUT_ONE_RETRY`
3. `RETRY_UNTIL_SUCCESS`
4. `INCREASE_REQUEST_SLOTS`

The last option is a plausible temptation but explicitly rejected because M05 did not diagnose capacity/tuning as the intervention.

---

# 8. Deterministic 2-second outage experiment

All values are `TEACHING_SIMULATION`.

## Common initial condition

```yaml
dependency:
  db_path: UNAVAILABLE
  outage_duration_lab_seconds: 2.0

request_slots:
  total_fixed: 4
  occupied_by_affected_requests_at_t0: 2

affected_requests:
  count: 2

control:
  slot_count_adjustable: false
  db_capacity_adjustable: false
  topology_adjustable: false
```

## Condition A — UNBOUNDED_WAIT

Policy:

```yaml
timeout: NONE_WITHIN_LAB_WINDOW
retry: NONE
```

Deterministic timeline:

```text
t=0.00  DB path unavailable; R1/R2 wait
t=0.75  R1/R2 still waiting
t=1.00  R1/R2 still waiting
t=2.00  experiment window ends; R1/R2 still waiting
```

Qualitative reveal:

```text
affected requests: STILL WAITING
dependency error surfaced during window: NO
affected slots retained at end: YES
slot count changed: NO
dependency recovered during controlled outage: NO
```

Do not call this a historical production hang duration.

## Condition B — BOUNDED_TIMEOUT_ONE_RETRY

Policy:

```yaml
attempt_timeout_lab_seconds: 0.75
retry_delay_lab_seconds: 0.25
maximum_retries: 1
```

Dependency remains unavailable for the full 2 seconds.

Deterministic timeline:

```text
t=0.00  attempt 1 begins
t=0.75  attempt 1 times out
t=1.00  one retry begins
t=1.75  retry times out
t=1.75  dependency error returned; affected work leaves waiting state
t=2.00  experiment window ends
```

Qualitative reveal:

```text
affected requests: ERROR SURFACED WITHIN LAB WINDOW
indefinite waiting at end: NO
retry guaranteed success: NO
slot count changed: NO
dependency recovered: NO
```

## Scientific/teaching boundary

The lab intentionally abstracts away:

- TCP handshake internals;
- JDBC-driver implementation details;
- OS socket state;
- thread implementation;
- production scheduler timing;
- real retry backoff design;
- production timeout selection.

The mission teaches the **causal policy distinction**, not exact network-stack mechanics.

---

# 9. Plausible wrong paths and recovery

## D02 — M04 disk contention

Why tempting: it caused the previous incident.

Feedback:

> “That was the previous proven cause. Which M05 evidence shows a full disk now, and which evidence instead shows that this call leaves the Web host?”

## D03 — CPU exhaustion

Why tempting: blocked work can be mistaken for busy compute.

Feedback:

> “Waiting work can occupy a request slot without proving CPU exhaustion. Which inspected item establishes the dependency boundary?”

## Policy P01 — Unbounded wait

Why tempting: “If the DB comes back, waiting avoids returning an error.”

Feedback after experiment:

> “The 2-second lab window ended with the affected work still waiting. This policy avoided an immediate error, but it did not bound how long the caller could remain occupied.”

Partial credit: recognizes that waiting may preserve the chance of eventual completion, but fails boundedness.

## Policy P03 — Retry until success

Why tempting: retries can survive a brief transient outage.

Feedback:

> “A retry is another dependency attempt. If the dependency remains unavailable, unlimited retries can extend the same waiting problem. What bounds the attempts?”

## Policy P04 — Increase request slots

Why tempting: more slots appear to reduce immediate crowding.

Feedback:

> “The experiment held slot count fixed so you could isolate call behaviour. Increasing capacity does not answer how long one remote call is allowed to wait. Capacity tuning is outside this mission.”

No M06 solution is revealed.

---

# 10. Causal explanation builder

## Required concepts

```text
C01 WEB_DB_SEPARATED
C02 DB_CALL_IS_REMOTE_DEPENDENCY
C03 DEPENDENCY_CAN_BE_UNAVAILABLE
C04 REQUEST_CAN_WAIT_FOR_REMOTE_CALL
C05 WAITING_WORK_REMAINS_OCCUPIED
C06 TIMEOUT_BOUNDS_WAIT_AND_SURFACES_ERROR
C07 RETRY_IS_ANOTHER_BOUNDED_ATTEMPT
```

Canonical final order:

```text
C01 → C02 → C03 → C04 → C05 → C06 → C07
```

Required evidence/result links:

```text
E01 → C02
E02 → C04
E04 → C05
E03 → C06
X01_UNBOUNDED_RESULT → C05
X02_BOUNDED_RESULT → C06
X03_RETRY_RESULT → C07
```

Final structured claim:

> “Because the DB call now crosses a network dependency, an unavailable dependency can leave DB-dependent work waiting. In the lab, an unbounded policy retained waiting work through the experiment. A bounded timeout returned control with an error, and one bounded retry created one additional attempt without guaranteeing success.”

## Optional reflection

Unscored free text:

> “Why can returning an error be healthier than waiting forever, even though an error is visible to the user?”

No LLM is the factual grader.

---

# 11. Deterministic 100-point scoring

| Category | Points | Rule |
|---|---:|---|
| Investigation | 15 | evidence gate satisfied |
| Diagnosis/proof | 15 | correct diagnosis 10 + inspected proof predicate 5 |
| Dependency classification | 10 | five tokens × 2 |
| Causal explanation | 15 | canonical order 10 + required evidence links 5 |
| Prediction | 10 | five deterministic prediction assertions × 2 |
| Experiment interpretation | 15 | unbounded result 5 + bounded timeout result 5 + retry/no-guarantee/fixed-capacity boundary 5 |
| Policy decision | 10 | bounded timeout + one retry = 7; complete mechanism justification = 3 |
| Boundary awareness | 5 | explicitly keeps pool/DB capacity fixed and does not prescribe M06 tuning |
| Efficiency | 5 | 0 recovery cycles=5; 1=4; 2=3; 3+=2 |
| **Total** | **100** | exact deterministic sum |

## Partial credit

- `UNBOUNDED_WAIT`: max 3/10 policy points if learner correctly explains its consequence but still selects it.
- `RETRY_UNTIL_SUCCESS`: max 4/10 if learner recognizes transient-recovery intuition but omits a bound.
- `INCREASE_REQUEST_SLOTS`: max 1/10; it does not address the causal call-policy question.

## Completion versus score

Completion requires the final correct causal model and bounded policy. A learner may recover and complete below 100.

Perfect clean path = exactly `100/100`.

---

# 12. Replay/reset contract

Replay resets:

```text
phase = OBSERVE
inspected = []
dependency_map = unclassified
diagnosis = null
proof = []
causal_order = deterministic_initial_shuffle
causal_links = {}
predictions = {}
unbounded_run = false
unbounded_results = hidden
unbounded_matches = {}
bounded_run = false
bounded_results = hidden
bounded_matches = {}
policy = null
justifications = []
recovery_cycles = 0
score = hidden
reflection = ""
feedback = ""
```

Replay preserves:

- source registry;
- provenance definitions;
- mission content;
- M04 continuity fact.

Replay must not expose prior correctness highlights.

---

# 13. Screen-by-screen storyboard

## S01 — M04 consequence / M05 incident

**First thing noticed:** two hosts, one Web→DB dependency line, and a concrete waiting DB-call symptom.

**Desktop:** topology left; incident centre; objective/right provenance.  
**390px:** title → incident → topology → objective → Begin.

**No leak:** no timeout/retry recommendation, outage duration, or policy result.

**Reduced motion:** static dependency line; no pulsing “network failure.”

---

## S02 — Evidence investigation

Evidence cards E01–E07.

**State:** `INVESTIGATE · n/7`.

**Gate text:** “Inspect E01–E05 and at least one comparator.”

**Keyboard/tap:** native buttons; Enter/Space/tap.

**Screen reader:** inspection state and newly revealed observation/provenance announced. Hidden interpretation must not exist in accessible names before inspection.

---

## S03 — Dependency classification and diagnosis

Player maps five tokens and commits diagnosis + proof.

**Fresh notice:** “Which work actually crosses the DB dependency?”

**Wrong state:** local feedback; preserve evidence/map.

**390px:** token selector above three vertically stacked zones.

---

## S04 — Causal builder

Six pre-experiment causal chips, reordered with Up/Down.

**Screen reader:** “Moved to position N of 6.”

**Error:** identify broken relationship only; do not reveal full order.

---

## S05 — Prediction matrix

Both policies described neutrally:

- `Policy A: no timeout during this lab window`
- `Policy B: bounded attempt + one bounded retry`

Simulation values shown only with `TEACHING SIMULATION`.

Run controls remain disabled until all predictions are committed.

---

## S06 — Run A: unbounded wait

Explicit `Run Policy A` button.

Standard motion: short ordered timeline.  
Reduced motion: immediate semantic event list.

At end, result reconciliation asks player what remained waiting and whether an error surfaced.

---

## S07 — Run B: bounded timeout/retry

Explicit `Run Policy B`.

Timeline uses lab seconds with simulation label.

Player reconciles:

- timeout;
- one retry;
- second timeout;
- surfaced error;
- fixed slot count;
- dependency did not recover during the controlled outage.

---

## S08 — Compare policies

Side-by-side desktop; stacked 390px.

Primary language qualitative:

```text
Policy A
WAITING AT END: YES
ERROR SURFACED: NO

Policy B
WAITING AT END: NO
ERROR SURFACED: YES
RETRY GUARANTEED SUCCESS: NO
```

Expandable detail may show simulated timeline.

---

## S09 — Policy decision

Cards:

- unbounded wait;
- bounded timeout + one retry;
- retry until success;
- increase request slots.

The player selects policy and mechanism chips.

No M06 tuning control exists.

---

## S10 — Score / reflection

Show category breakdown and total.

Completion copy:

> `Network-dependent call behaviour justified: bounded waiting with a bounded retry in this teaching model.`

Boundary copy:

> “The request-slot count and database capacity were held fixed. Their sizing is not investigated in M05.”

Optional reflection; Replay button.

No M06 next-mission button is required.

---

# 14. Misconceptions

1. **“Remote DB call behaves exactly like localhost.”**  
   Separation introduces a dependency boundary.

2. **“Waiting means CPU is busy.”**  
   Waiting work and CPU exhaustion are not equivalent evidence.

3. **“No error is better than an error.”**  
   An unbounded wait can retain work indefinitely; a bounded error returns control.

4. **“Retries make failure disappear.”**  
   A retry is another attempt; it can fail too.

5. **“More retries are always safer.”**  
   Without a bound, retries can extend dependency waiting.

6. **“Increase the pool/slots.”**  
   M05 holds capacity fixed to isolate network-call behaviour.

7. **“0.75 seconds is the correct production timeout.”**  
   False. It is a teaching-simulation value chosen for this deterministic 2-second experiment.

8. **“The source's 3000 timeout is the Atlas Market answer.”**  
   False. It is a source example, not an M05 production recommendation.

---

# 15. Explicit M06 and later-topic deferral

## M06 content forbidden from player-facing M05 runtime

Do not teach, score, recommend, or allow adjustment of:

- connection-pool sizing;
- `maxPoolSize`;
- MySQL `max_connections`;
- pool exhaustion as a capacity-tuning lesson;
- DB connection saturation;
- throughput tuning;
- optimal slot count;
- pool-size versus DB-capacity trade-offs.

M05 may show **fixed occupancy** only to demonstrate that waiting work remains occupied. The count is immutable in the experiment.

## Later architecture solutions forbidden

Do not introduce or recommend:

- load balancers;
- Redis/shared Session;
- Kubernetes;
- containers;
- microservices;
- queues/Kafka;
- replicas;
- sharding;
- CDN;
- object storage;
- distributed storage;
- autoscaling.

M05 does not redesign M04 topology.

---

# 16. Stable acceptance tests

## M05-T001 — Fresh-player objective

Within 10 seconds a fresh player can state: “A Web request is waiting on the now-remote DB dependency; I need to investigate what the call should do.”

## M05-T002 — No initial answer leakage

Initial visible/accessibility runtime contains no timeout recommendation, retry count, outage duration, correct policy label, or result.

## M05-T003 — Provenance boundary

Source-backed, fictional-scenario, and teaching-simulation content are distinguishable.

## M05-T004 — Evidence gate

```text
E01–E05 only → LOCKED
E01–E05 + E06 → OPEN
E01–E05 + E07 → OPEN
missing any E01–E05 even with both comparators → LOCKED
```

## M05-T005 — No uninspected proof

Every proof ID must belong to `inspected`. A crafted proof containing unseen E03/E04 is rejected by engine-level validation, scoring, and completion.

## M05-T006 — Correct diagnosis proof

`NETWORK_DEPENDENCY_WAITING` requires inspected E01 + E02 + at least one of E03/E04.

## M05-T007 — M04 diagnosis recovery

Disk-contention diagnosis receives local recoverable feedback without re-running the M04 lesson.

## M05-T008 — CPU diagnosis recovery

CPU diagnosis receives local feedback that waiting does not establish CPU exhaustion.

## M05-T009 — Dependency classification

Correct token classification is deterministic and recoverable.

## M05-T010 — Causal chain

Canonical causal order and exact evidence links are required.

## M05-T011 — Prediction-before-reveal

Both policy prediction sets, comprising exactly five deterministic assertions each, must be committed before either controlled result can reveal. The fifth assertion is whether the DB dependency recovers during the controlled outage.

## M05-T012 — Two-second provenance

Every display/announcement of the 2-second outage is associated with `TEACHING_SIMULATION`; it is never described as historical production telemetry.

## M05-T013 — Unbounded deterministic result

Under the 2-second outage, both affected requests remain waiting at experiment end; no dependency error is surfaced in the lab window; fixed slot count is unchanged; the DB dependency does not recover.

## M05-T014 — Bounded deterministic timeline

Attempt 1 times out at 0.75 lab seconds; retry begins after 0.25 lab seconds; retry times out at 1.75 lab seconds; error is surfaced before the 2-second window ends; the DB dependency remains unavailable for the full controlled outage.

## M05-T015 — Retry does not guarantee success

Because the dependency remains unavailable, the one retry also fails. Runtime never implies retry guarantees recovery.

## M05-T016 — Fixed occupancy evidence

The experiment can show 4 fixed slots / 2 initially occupied only as teaching-simulation evidence; the player cannot change capacity.

## M05-T017 — Unbounded policy partial path

Unbounded wait is plausible and recoverable but cannot receive full policy credit.

## M05-T018 — Unlimited retry recovery

`RETRY_UNTIL_SUCCESS` receives bounded feedback about repeated dependency attempts and cannot receive full policy credit.

## M05-T019 — Capacity-change recovery

`INCREASE_REQUEST_SLOTS` is rejected as outside the causal policy question without teaching M06 tuning.

## M05-T020 — Correct bounded policy

Full policy credit requires bounded timeout + one bounded retry plus all required mechanism/limit justification chips.

## M05-T021 — No fake production precision

Runtime never presents 2s, 0.75s, 0.25s, 4, or 2 as production measurements/recommendations.

## M05-T022 — Exact 100-point score

Perfect clean path = exactly 100/100.

## M05-T023 — Efficiency tiers

Recovery cycles score exactly 0→5, 1→4, 2→3, 3+→2.

## M05-T024 — Completion consistency

Completion requires correct final diagnosis, causal model, experiment reconciliation, and bounded policy. Contradictory final state cannot complete.

## M05-T025 — Replay

Replay resets all mutable M05 state and hides prior results/score/correctness.

## M05-T026 — Genuine gameplay

Automated/state tests demonstrate that result/reveal/decision cannot be reached by merely opening cards or skipping predictions/runs.

## M05-T027 — Keyboard-only path

All actions are possible with keyboard only; no drag is required; focus remains usable after reorder/reveal/recovery.

## M05-T028 — Touch path

All required actions can be completed by tap with no hover-only dependency.

## M05-T029 — Real 390px

At 390 CSS px:

- no horizontal page scroll;
- topology and evidence stack;
- dependency zones remain usable;
- prediction table becomes readable stacked cards if necessary;
- timelines wrap;
- policy cards and score remain readable;
- clean path and one wrong-path recovery complete.

## M05-T030 — Reduced motion

With `prefers-reduced-motion: reduce`, both experiment timelines remain semantically complete without movement animation.

## M05-T031 — Screen reader

Screen reader announces evidence state/gate, classification, diagnosis feedback, causal reorder, prediction commitment, experiment events/results, policy choice, score, and completion without early answer leakage.

## M05-T032 — M06 runtime boundary

Player-facing M05 runtime contains no pool-size/max_connections tuning lesson, adjustable capacity control, or connection-capacity recommendation.

## M05-T033 — Later-solution runtime boundary

Player-facing runtime contains no forbidden later architecture recommendation listed in §15.

## M05-T034 — Runtime-scoped forbidden check

Forbidden-content test inspects the player-facing M05 runtime string registry/fixture, **not this storyboard**, because author-only provenance and deferral documentation necessarily name excluded topics.

## M05-T035 — Rendered initial route

Rendered M05 route contains mission identity, separated Web/DB topology, neutral DB-call symptom and provenance boundary, but no correct diagnosis/policy/result strings.

## M05-T036 — Qualitative primary result

Primary result UI says waiting/error/retry/fixed-capacity outcomes qualitatively; numeric timeline details are secondary and simulation-labelled.

## M05-T037 — M04 continuity without redesign

M05 begins from the accepted separated topology and never asks the player to choose Web/DB separation again.

## M05-T038 — Source-example isolation

Source numbers 0.5ms/50/3000/500 do not appear as M05 incident telemetry, scoring targets, production advice, or adjustable controls.

## M05-T039 — Wrong-path recovery preserves investigation

Wrong diagnosis/policy recovery preserves inspected evidence and completed experiment evidence unless Replay is explicitly chosen.

## M05-T040 — Stop boundary

Completion stops after bounded network-call behaviour and reflection. No M06 mission content or next architecture solution is required.

---

# 17. Implementation handoff YAML

```yaml
mission:
  id: M05
  slug: network-now-part-of-system
  title: "The Network Is Now Part of the System"
  source:
    repository: ccc115a/se
    path: "_more/mybook/向淘寶學習網站架構演進/1.2.md"
    blob_sha: "00756d5a3a4054cd9592e19199c10626cdce993a"

  continuity:
    prior_mission: M04
    inherited_topology: WEB_HOST_TO_DB_HOST_NETWORK_DEPENDENCY
    redesign_m04: false
    prior_verification_debt_remains_open:
      - 390px
      - keyboard
      - touch
      - reduced_motion
      - screen_reader

  phases:
    - OBSERVE
    - INVESTIGATE
    - DIAGNOSE
    - BUILD_CAUSE
    - PREDICT
    - RUN_UNBOUNDED
    - REVEAL_UNBOUNDED
    - RUN_BOUNDED
    - REVEAL_BOUNDED
    - DECIDE
    - SCORE
    - COMPLETE

  required_evidence:
    minimum_count: 6
    mandatory: [E01, E02, E03, E04, E05]
    one_of: [E06, E07]
    unlock_predicate: "inspected(E01) AND inspected(E02) AND inspected(E03) AND inspected(E04) AND inspected(E05) AND (inspected(E06) OR inspected(E07)) AND unique_inspected_count >= 6"
    prohibit_uninspected_proof: true

  diagnosis:
    choices:
      - NETWORK_DEPENDENCY_WAITING
      - M04_DISK_CONTENTION
      - CPU_EXHAUSTION
      - APPLICATION_CODE_STUCK_WITHOUT_DEPENDENCY_EVIDENCE
    correct: NETWORK_DEPENDENCY_WAITING
    proof:
      mandatory: [E01, E02]
      one_of: [E03, E04]
      predicate: "proof_subset_of_inspected AND proof(E01) AND proof(E02) AND (proof(E03) OR proof(E04))"

  causal:
    canonical_order:
      - WEB_DB_ARE_SEPARATE
      - DB_CALL_CROSSES_NETWORK_DEPENDENCY
      - DEPENDENCY_BECOMES_UNAVAILABLE
      - DB_DEPENDENT_REQUEST_WAITS
      - WAITING_WORK_REMAINS_OCCUPIED
      - BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR
    links:
      E01: DB_CALL_CROSSES_NETWORK_DEPENDENCY
      E02: DB_DEPENDENT_REQUEST_WAITS
      E04: WAITING_WORK_REMAINS_OCCUPIED
      E03: BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR

  experiment:
    provenance: TEACHING_SIMULATION
    predictions_required_before_any_reveal: true
    prediction_assertions:
      - AFFECTED_WORK_WAITING_AT_END
      - DEPENDENCY_ERROR_SURFACED_WITHIN_WINDOW
      - RETRY_GUARANTEES_SUCCESS
      - SLOT_COUNT_CHANGED
      - DEPENDENCY_RECOVERED_DURING_OUTAGE
    prediction_assertion_count: 5
    prediction_points_each: 2
    outage_duration_lab_seconds: 2.0
    fixed_request_slots: 4
    initially_occupied_affected_slots: 2
    capacity_controls_enabled: false

    condition_a:
      id: UNBOUNDED_WAIT
      timeout_within_lab_window: false
      retries: 0
      result:
        affected_requests_waiting_at_end: true
        dependency_error_surfaced: false
        slot_count_changed: false
        dependency_recovered: false

    condition_b:
      id: BOUNDED_TIMEOUT_ONE_RETRY
      attempt_timeout_lab_seconds: 0.75
      retry_delay_lab_seconds: 0.25
      maximum_retries: 1
      result:
        first_timeout_at: 0.75
        retry_starts_at: 1.00
        second_timeout_at: 1.75
        dependency_error_surfaced_at: 1.75
        affected_requests_waiting_at_end: false
        retry_guarantees_success: false
        slot_count_changed: false
        dependency_recovered: false

  policies:
    - UNBOUNDED_WAIT
    - BOUNDED_TIMEOUT_ONE_RETRY
    - RETRY_UNTIL_SUCCESS
    - INCREASE_REQUEST_SLOTS
  correct_policy: BOUNDED_TIMEOUT_ONE_RETRY

  final_justification:
    required:
      - REMOTE_CALL_CAN_WAIT
      - WAIT_MUST_HAVE_A_BOUND
      - TIMEOUT_SURFACES_CONTROLLED_ERROR
      - RETRY_IS_ANOTHER_BOUNDED_ATTEMPT
      - FIXED_SLOT_COUNT_WAS_NOT_TUNED

  scoring:
    maximum: 100
    investigation: 15
    diagnosis_proof: 15
    dependency_classification: 10
    causal_explanation: 15
    prediction: 10
    experiment_interpretation: 15
    policy_decision: 10
    boundary_awareness: 5
    efficiency: 5
    efficiency_tiers:
      repairs_0: 5
      repairs_1: 4
      repairs_2: 3
      repairs_3_plus: 2

  replay:
    resets_all_mutable_m05_state: true
    preserves_source_and_continuity: true

  do_not_teach_yet:
    - CONNECTION_POOL_SIZING
    - MAX_POOL_SIZE_TUNING
    - MYSQL_MAX_CONNECTIONS_TUNING
    - CONNECTION_SATURATION_CAPACITY
    - THROUGHPUT_TUNING
    - LOAD_BALANCERS
    - REDIS
    - KUBERNETES
    - CONTAINERS
    - MICROSERVICES
    - QUEUES
    - KAFKA
    - REPLICAS
    - SHARDING
    - CDN
    - OBJECT_STORAGE
    - DISTRIBUTED_STORAGE
    - AUTOSCALING

test_ids:
  - M05-T001
  - M05-T002
  - M05-T003
  - M05-T004
  - M05-T005
  - M05-T006
  - M05-T007
  - M05-T008
  - M05-T009
  - M05-T010
  - M05-T011
  - M05-T012
  - M05-T013
  - M05-T014
  - M05-T015
  - M05-T016
  - M05-T017
  - M05-T018
  - M05-T019
  - M05-T020
  - M05-T021
  - M05-T022
  - M05-T023
  - M05-T024
  - M05-T025
  - M05-T026
  - M05-T027
  - M05-T028
  - M05-T029
  - M05-T030
  - M05-T031
  - M05-T032
  - M05-T033
  - M05-T034
  - M05-T035
  - M05-T036
  - M05-T037
  - M05-T038
  - M05-T039
  - M05-T040
```

---

# 18. Reviewer checklist

- [ ] M05 only; no M06+ design.
- [ ] Exact source path/blob SHA retained.
- [ ] M04 separated topology is continuity, not re-taught as a choice.
- [ ] Opening has a DB-call symptom but does not reveal timeout/retry answer.
- [ ] Source/fiction/simulation boundaries are explicit.
- [ ] Every numeric runtime value has provenance.
- [ ] Source example numbers are not repurposed as production recommendations.
- [ ] Evidence gate requires E01–E05 plus E06 or E07.
- [ ] Proof is engine-level subset of inspected evidence.
- [ ] Waiting/remote dependency is proven before policy selection.
- [ ] Predictions are committed before either result.
- [ ] Prediction contract contains exactly five deterministic assertions: waiting-at-end, error-surfaced, retry-guarantee, slot-count-change, and dependency-recovery.
- [ ] Both experiment runs use the same deterministic 2-second outage.
- [ ] Unbounded run retains waiting work.
- [ ] Bounded run surfaces an error after bounded attempts.
- [ ] Retry never guarantees success.
- [ ] Fixed occupancy is evidence only, not a capacity-tuning control.
- [ ] Wrong diagnosis/policy is recoverable.
- [ ] Perfect path scores exactly 100.
- [ ] Replay clears all mutable state.
- [ ] Keyboard/tap path requires no drag.
- [ ] Real 390px acceptance is explicit.
- [ ] Reduced-motion and screen-reader acceptance are explicit.
- [ ] M06 pool/DB-capacity tuning is absent from player-facing runtime.
- [ ] Later architecture solutions are absent.
- [ ] Runtime forbidden-content check is scoped to runtime strings, not author documentation.
- [ ] Detailed acceptance IDs exactly equal machine-readable registry IDs.
- [ ] No duplicate or orphan test IDs.

---

# 19. Required evidence captures after implementation

1. `M05-01-fresh-desktop.png` — neutral opening/no answer leak.
2. `M05-02-evidence-gate-locked.png`.
3. `M05-03-evidence-gate-open.png`.
4. `M05-04-uninspected-proof-rejected.png` or deterministic test evidence.
5. `M05-05-wrong-disk-diagnosis-recovery.png`.
6. `M05-06-dependency-map.png`.
7. `M05-07-causal-builder.png`.
8. `M05-08-predictions-committed-results-hidden.png`.
9. `M05-09-unbounded-run-result.png`.
10. `M05-10-bounded-run-result.png`.
11. `M05-11-policy-comparison.png`.
12. `M05-12-wrong-unbounded-policy-recovery.png`.
13. `M05-13-score-100.png`.
14. `M05-14-replay-reset.png`.
15. `M05-15-390px-clean.png`.
16. `M05-16-390px-recovery.png`.
17. `M05-17-keyboard-only.webm` or equivalent trace.
18. `M05-18-touch.webm` or equivalent trace.
19. `M05-19-reduced-motion.webm` or equivalent.
20. `M05-20-screen-reader.md` — announcement transcript.
21. `M05-21-runtime-boundary.txt` — M06/later-solution runtime fixture.
22. `M05-22-numeric-provenance.txt`.
23. `M05-23-rendered-route.txt` — initial route assertions.

---

# 20. Runtime-scoped forbidden-content contract

This storyboard necessarily names deferred topics. Tests must **not grep the whole artifact**.

Inspect only player-facing runtime strings/fixtures.

## Allowed player-facing concepts

```text
network dependency
unavailable dependency
waiting
timeout
bounded wait
retry
one bounded retry
error surfaced
fixed request slots
teaching simulation
```

## Forbidden recommendation/lesson patterns in M05 runtime

```text
increase maxPoolSize
decrease maxPoolSize
optimal pool size
max_connections
connection saturation tuning
DB connection capacity tuning
throughput tuning
load balancer
Redis
Kubernetes
container
microservice
queue
Kafka
replica
shard
CDN
object storage
distributed storage
autoscaling
```

Developer-only source trace, `do_not_teach_yet`, acceptance tests, and reviewer documentation may contain these terms.

---

# 21. Open questions

**None requiring human approval before implementation.**

The contract already settles:

- M04 topology continuity;
- the 2-second deterministic outage;
- fixed occupancy as evidence rather than tuning;
- bounded timeout/retry as the M05 intervention;
- retry failure under the controlled outage;
- M06 capacity-tuning deferral;
- provenance of every number.

Visual styling may follow the existing Architecture Evolution Lab system without changing these mechanics.

---

# 22. Change log

## v1.2 — 2026-09-16

Bounded prediction-contract correction.

- Selected **Resolution B**: retained Prediction at 10 points and added a fifth meaningful deterministic prediction, `Does the DB dependency recover during this controlled outage?`.
- The fifth assertion is observable in both controlled runs because the common experiment holds the DB dependency unavailable for the full 2-second teaching-simulation window.
- Updated the prediction matrix, result/reconciliation language, acceptance wording, YAML experiment contract, and reviewer checklist.
- Confirmed Prediction remains exactly `5 assertions × 2 points = 10`, preserving the exact 100-point total.
- Re-audited stable acceptance headings and `test_ids`: exactly `M05-T001` through `M05-T040`, once each.
- Re-audited YAML mission phases and M06/later-topic boundary; no scope or gameplay expansion was introduced.

## v1.1 — 2026-09-16

Bounded editorial/consistency revision only.

- Normalized the required evidence-capture list to one unique item 17 and sequential numbering through item 23.
- Re-audited stable acceptance headings: `M05-T001` through `M05-T040` occur exactly once each as detailed acceptance headings.
- Re-audited the machine-readable `test_ids` registry: exactly the same 40 stable IDs, once each, with no missing, duplicate, or orphan ID.
- Re-audited mission phases: the YAML phase registry contains only the actual M05 state-machine phases from `OBSERVE` through `COMPLETE`.
- Confirmed deferred M06/later topics remain author-only boundary metadata and are not player-facing phases or controls.
- Confirmed forbidden-content validation remains runtime-scoped: tests inspect player-facing runtime strings/fixtures rather than grepping storyboard author documentation.
- No gameplay, source provenance, scoring, evidence-gate, experiment, or scope semantics changed.

## v1 — 2026-09-16

Initial M05 storyboard.

- Anchored M05 to source §1.2 blob `00756d5a3a4054cd9592e19199c10626cdce993a`.
- Continued directly from M04's accepted Web/DB separation and network-dependency consequence.
- Built an evidence-first playable loop around remote dependency waiting, timeout, bounded retry, and error surfacing.
- Added two deterministic controlled runs using the same explicitly simulated 2-second DB outage.
- Added fixed request-slot occupancy strictly as non-adjustable evidence, not M06 capacity tuning.
- Added plausible unbounded-wait, unlimited-retry, and capacity-change wrong paths with recovery.
- Added deterministic causal explanation, 100-point scoring, replay, provenance, 390px, keyboard, touch, reduced-motion, and screen-reader contracts.
- Explicitly deferred pool sizing, `max_connections`, connection-capacity/throughput tuning, and all later architecture solutions.
- Added stable acceptance IDs `M05-T001` through `M05-T040`.
- Added runtime-scoped forbidden-content and numeric-provenance contracts.
