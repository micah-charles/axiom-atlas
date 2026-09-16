# M04 — Disk Full at 02:00
## Architecture Evolution Lab — Storyboard / Content Design v1.1

> **Artifact:** `M04-disk-full-at-0200-storyboard-v1.1.md`  
> **Scope:** M04 only. Storyboard/data contract, not application code.  
> **Act:** Act I — One Machine, First Limits / Vertical Slice A  
> **Primary source:** `ccc115a/se`, `_more/mybook/向淘寶學習網站架構演進/1.2.md`  
> **Authoritative source blob SHA:** `00756d5a3a4054cd9592e19199c10626cdce993a`  
> **Accepted source review:** `docs/architecture-evolution-lab/reviews/source-review-m01-m06.md`  
> **Continuity:** M01 rational one-host start; M02 request diagnosis; M03 local assumptions. M03 implementation correctness is PASS; its separate 390px/reduced-motion/screen-reader/keyboard/touch evidence debt remains open and is not closed or redesigned here.

---

# 1. Mission objective and learner promise

## Mission objective

A working Atlas Market single-host shop suffers a storage incident at **02:00**. The player must prove from evidence that the new failure is **shared-disk capacity/resource contention**, distinguish that cause from plausible unrelated diagnoses, predict what a bounded intervention changes, run a deterministic comparison, and justify separating Web/application execution from the database as the proportionate response.

The mission teaches this causal chain:

```text
catalogue growth
→ more persistent database data on the shared host disk
→ shared disk reaches its capacity boundary
→ MySQL data, Tomcat log writes, and seller image writes contend for the same finite local resource
→ writes fail
→ isolate Web/application and DB resource domains
→ storage contention between those two workloads is reduced
→ a network dependency now exists
```

The final arrow is a **trade-off reveal only**. M04 does not teach how networks fail or how to remediate them.

## Learner promise

> “You will not be told to split the system because ‘two servers are better.’ You will first prove what resource is exhausted, predict what isolation changes, then test whether the evidence supports the intervention.”

## Learning objectives

By completion, the learner can:

1. distinguish a **capacity/resource-contention failure** from unrelated CPU, latency, DNS, or request-routing symptoms;
2. connect catalogue growth to persistent storage growth without inventing a historical growth rate;
3. explain why one finite disk shared by MySQL data, Tomcat logs, and local image writes creates coupled failure;
4. choose Web/DB separation because it addresses the demonstrated contention, not because distributed architecture is inherently superior;
5. state the trade-off: isolation improves, but the application/database call is no longer purely local;
6. avoid prematurely solving later network or connection-capacity problems.

## Success state

The player:

- inspects the required evidence;
- correctly diagnoses `SHARED_DISK_CAPACITY`;
- builds the required causal chain;
- predicts the effects of an intervention before seeing experiment results;
- runs the deterministic experiment;
- correctly interprets log/image/database placement outcomes;
- selects and justifies `WEB_DB_ISOLATION`;
- names the new network dependency as a trade-off **without proposing network remediation**;
- receives a deterministic score.

## Recoverable failure states

Wrong diagnosis, wrong causal order, wrong prediction, or disproportionate intervention does **not** dead-end the mission. The game returns local feedback and preserves already inspected evidence.

---

# 2. Source traceability and provenance

Atlas Market, its staff, exact clock time, evidence-card rendering, experiment controls, simulated disk units, and UI telemetry are educational fiction/simulation unless explicitly identified as source-backed.

| Claim / mechanic | Provenance | Exact source basis | Storyboard use / boundary |
|---|---|---|---|
| Product count grows from hundreds to tens of thousands | `SOURCE_BACKED` | §1.2 “商品從幾百件變成幾萬件” | Direction/order-of-magnitude wording only; no invented exact historical count. |
| MySQL data files fill the disk | `SOURCE_BACKED` | §1.2 “磁碟被 MySQL 的資料檔塞滿” | Central incident cause. |
| Tomcat cannot write logs | `SOURCE_BACKED` | §1.2 “Tomcat 連日誌都寫不進去” | Incident symptom/evidence. |
| Seller cannot upload a product image because there is no space | `SOURCE_BACKED` | §1.2 “賣家傳一張商品圖都沒地方放” | Incident symptom/evidence. |
| Web/application and DB on one machine compete for resources | `SOURCE_BACKED` | §1.2 identifies same-machine resource competition | Root architectural constraint. |
| Natural first split is DB on its own machine | `SOURCE_BACKED` | §1.2 “把資料庫搬出去，單獨給它一台機器” | Proportionate intervention after proof. |
| After split, Web runs Tomcat and DB machine runs MySQL | `SOURCE_BACKED` | §1.2 topology | Intervention topology. |
| Web→DB becomes an intranet TCP/JDBC dependency | `SOURCE_BACKED` | §1.2 topology and connection-string discussion | Trade-off reveal only. |
| Images remain on Web local disk after DB split | `SOURCE_BACKED` | §1.2 filesystem section | Result placement consequence; no later image-storage solution. |
| Compute/storage separation improves resource isolation | `SOURCE_BACKED` | §1.2 benefits/summary | Completion explanation. |
| Separation costs another machine and introduces network dependency | `SOURCE_BACKED` | §1.2 benefits/summary | Qualitative trade-off. |
| Source mentions ~0.5 ms intranet latency | `SOURCE_BACKED_SOURCE_NUMBER` | §1.2 benefits table | **Not used as player incident telemetry or M04 scoring input.** M04 does not teach latency. |
| Source examples include pool size 50, timeout 3000, max_connections 500 | `SOURCE_BACKED_SOURCE_EXAMPLES` | §1.2 connection-string/diagram | **Excluded from M04 player-facing runtime** because they belong to later connection/network lessons. |
| Incident occurs at exactly 02:00 | `FICTIONAL_SCENARIO` | Mission framing supplied by orchestration | Clock establishes operational urgency only. |
| Atlas Market characters/names/messages | `FICTIONAL_SCENARIO` | Not historical source | Narrative delivery only. |
| Disk capacity is represented as 100 lab storage units | `TEACHING_SIMULATION` | Not source measurement | Deterministic experiment; explicitly labelled LAB UNITS. |
| Baseline occupied storage = 70 lab units | `TEACHING_SIMULATION` | Not source measurement | Controlled comparison only. |
| Incident occupied storage = 100/100 lab units | `TEACHING_SIMULATION` | Not source measurement | Makes capacity boundary visible. |
| Simulated DB data allocation at incident = 76 units; images = 18; logs/other = 6 | `TEACHING_SIMULATION` | Not historical measurement | Sum = 100; used only to teach shared finite resource. |
| Proposed isolated Web disk = 30 lab units with images/logs occupying 24; isolated DB disk = 100 lab units with DB occupying 76 | `TEACHING_SIMULATION` | Not historical measurement | Demonstrates independent capacity domains; no claim these sizes are production recommendations. |
| “Write succeeds / write blocked” experiment outputs | `TEACHING_SIMULATION` grounded in source failure | Deterministic qualitative model | No fabricated real outage rates. |

## Numeric provenance registry

Every number allowed in player-facing M04 must be tagged by the content/data model:

| Value | Meaning | Provenance tag |
|---:|---|---|
| `02:00` | fictional incident clock | `FICTIONAL_SCENARIO` |
| `100` | incident shared-disk capacity in lab units | `TEACHING_SIMULATION` |
| `70` | baseline occupied lab units | `TEACHING_SIMULATION` |
| `100` | incident occupied lab units | `TEACHING_SIMULATION` |
| `76` | simulated DB-data allocation | `TEACHING_SIMULATION` |
| `18` | simulated image allocation | `TEACHING_SIMULATION` |
| `6` | simulated logs/other allocation | `TEACHING_SIMULATION` |
| `30` | isolated Web disk capacity | `TEACHING_SIMULATION` |
| `24` | isolated Web occupied units | `TEACHING_SIMULATION` |
| `100` | isolated DB disk capacity | `TEACHING_SIMULATION` |
| `76` | isolated DB occupied units | `TEACHING_SIMULATION` |

Do not expose `0.5 ms`, `50`, `3000`, or `500` as M04 runtime values. They are source details deliberately deferred because M04 is not a network/connection-capacity lesson.

---

# 3. Starting state

## Narrative state

Atlas Market has continued operating on the rational one-host design introduced earlier. The catalogue has grown substantially. At fictional time **02:00**, an operator reports:

> “Sellers cannot add product images, and the application log has stopped recording new entries. The storefront had been working earlier. Find the shared cause before changing the architecture.”

The opening **must not** say:

- “disk full”;
- “MySQL filled the disk”;
- “split the DB”;
- “resource contention”;
- “compute-storage separation.”

Those are conclusions the player earns.

## Initial topology

The visible topology is intentionally small:

```text
HOST 01
├── Tomcat / application
├── MySQL
└── one shared local disk boundary
```

The opening topology may show the **single disk icon/boundary** but not its fullness, allocation breakdown, or diagnosis.

## Initially visible

- incident clock: `02:00 · FICTIONAL_SCENARIO`;
- seller upload failure report;
- logging failure report;
- HOST 01 topology;
- neutral evidence case;
- mission objective;
- source/fiction/simulation legend.

## Initially hidden

- disk utilisation;
- storage allocation;
- database-data growth evidence;
- root-cause label;
- intervention names;
- experiment result;
- Web/DB split topology;
- network-dependency trade-off;
- score.

---

# 4. Neutral evidence catalogue

Evidence cards use neutral IDs and titles. Correctness must never be encoded in colour, icon, ordering, or card title.

## E01 — Catalogue history

**Neutral title:** `Catalogue snapshot`  
**Preview:** “Compare the earlier shop with the current catalogue.”  
**After inspection observation:** “The source describes growth from hundreds of products to tens of thousands.”  
**Interpretation unlocked only after inspection:** “More persistent catalogue content can require more stored data; this does not by itself prove which resource is exhausted.”  
**Provenance:** `SOURCE_BACKED`  
**Role:** establishes growth pressure without giving root cause.

## E02 — Storage boundary

**Neutral title:** `HOST 01 storage probe`  
**Preview:** “Inspect the finite local resource shared by current processes.”  
**After inspection observation:** “Teaching simulation: occupied storage is 100 of 100 LAB UNITS.”  
**Interpretation:** “The simulated shared disk has no free capacity.”  
**Provenance:** `TEACHING_SIMULATION`, concept grounded by source disk-full incident.  
**Role:** mandatory root-cause evidence.

## E03 — Database file observation

**Neutral title:** `Persistent data directory`  
**Preview:** “Inspect what is consuming persistent storage.”  
**Observation:** “Source: MySQL data files filled the disk. Teaching simulation visualises DB data as 76 of the 100 occupied LAB UNITS.”  
**Interpretation:** “Database persistence is a major consumer of the same finite disk used by the application host.”  
**Provenance:** mixed: source fact + clearly labelled simulated allocation.  
**Role:** mandatory causal evidence.

## E04 — Application write observation

**Neutral title:** `Application write check`  
**Preview:** “Inspect a write the application attempted during the incident.”  
**Observation:** “Tomcat cannot write its log.”  
**Interpretation:** “The failure affects a write outside MySQL as well, consistent with a shared storage boundary rather than only a database query symptom.”  
**Provenance:** `SOURCE_BACKED`.  
**Role:** mandatory cross-workload evidence.

## E05 — Seller write observation

**Neutral title:** `Seller action check`  
**Preview:** “Inspect what happens when a seller adds a product image.”  
**Observation:** “The image cannot be stored because there is no disk space.”  
**Interpretation:** “A second non-database write is blocked by the same finite local resource.”  
**Provenance:** `SOURCE_BACKED`.  
**Role:** mandatory cross-workload evidence.

## E06 — CPU comparator

**Neutral title:** `Compute comparator`  
**Preview:** “Inspect whether this case establishes CPU exhaustion.”  
**Observation:** “This mission provides no evidence that CPU capacity is exhausted.”  
**Interpretation:** “Absence of CPU evidence means a CPU-upgrade diagnosis is unsupported by this incident.”  
**Provenance:** `TEACHING_SIMULATION / NEGATIVE_CONTROL`.  
**Role:** prevents “upgrade the server” guessing.

## E07 — Request-path comparator

**Neutral title:** `Entry-path comparator`  
**Preview:** “Inspect whether the incident evidence establishes DNS or HTTP-path failure.”  
**Observation:** “The incident evidence supplied here does not establish DNS resolution or HTTP routing failure.”  
**Interpretation:** “Do not reuse M02 latency/path diagnosis when the observed failures are storage writes.”  
**Provenance:** `TEACHING_SIMULATION / NEGATIVE_CONTROL`.  
**Role:** M02 anti-reprise comparator.

## Required evidence gate

Diagnosis unlocks only after the player has inspected all five causal evidence cards plus at least one comparator:

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

No uninspected evidence can be selected as a causal proof token. The diagnosis UI remains locked until this predicate is true.

---

# 5. Deterministic phases and legal transitions

```text
OBSERVE
  ↓ inspect first evidence
INVESTIGATE
  ↓ evidence gate satisfied
DIAGNOSE
  ↓ diagnosis committed
BUILD_CAUSE
  ↓ causal chain valid
PREDICT
  ↓ all intervention predictions committed
RUN
  ↓ explicit Run experiment
REVEAL
  ↓ result interpretation committed
INTERVENE
  ↓ intervention + justification committed
TRADE_OFF
  ↓ trade-off identified
SCORE
  ↓ reflection optional
COMPLETE
```

## Machine predicates

### INVESTIGATE → DIAGNOSE

Exactly the `required_evidence.unlock_predicate` above.

### DIAGNOSE → BUILD_CAUSE

Player must commit exactly one diagnosis:

- `SHARED_DISK_CAPACITY`
- `CPU_CAPACITY`
- `REQUEST_PATH_FAILURE`
- `APPLICATION_LOGGER_ONLY`

A wrong diagnosis is allowed to commit. It receives local feedback requiring the player to cite evidence; the correct answer is not automatically highlighted.

To proceed, diagnosis must ultimately equal `SHARED_DISK_CAPACITY` and include evidence tokens `E02` plus at least two of `[E03,E04,E05]`.

### BUILD_CAUSE → PREDICT

Required causal order:

```text
CATALOGUE_GROWS
→ PERSISTENT_DB_DATA_GROWS
→ DB_AND_APP_WRITES_SHARE_FINITE_DISK
→ SHARED_DISK_REACHES_CAPACITY
→ TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE
```

Required evidence links:

```text
CATALOGUE_GROWS                  ← E01
PERSISTENT_DB_DATA_GROWS         ← E03
SHARED_DISK_REACHES_CAPACITY     ← E02
TOMCAT_LOG...                    ← E04 AND E05
```

### PREDICT → RUN

Player must predict outcomes for two controlled conditions:

1. `SAME_SHARED_DISK`
2. `WEB_DB_ISOLATED_DISKS`

Predictions cover:

- DB persistent writes;
- Tomcat log writes;
- seller image writes;
- whether Web and DB still contend for the exact same disk capacity boundary.

No result is shown before all predictions are committed.

### RUN → REVEAL

Explicit `Run controlled comparison` action only.

### REVEAL → INTERVENE

Player must correctly match experiment results to the causal claim:

```text
shared condition:
  disk boundary exhausted
  log write blocked
  image write blocked

isolated condition:
  DB uses DB disk boundary
  Tomcat logs use Web disk boundary
  seller image uses Web disk boundary
  Web and DB no longer consume the exact same disk capacity pool
```

This does **not** claim the isolated architecture can never fill either disk. It only demonstrates isolation of the specific shared resource.

### INTERVENE → TRADE_OFF

Choose one:

- `WEB_DB_ISOLATION` — move MySQL to its own machine/resource domain; Tomcat remains on Web machine; images remain local to Web machine.
- `BIGGER_SINGLE_HOST_DISK` — add capacity but retain one shared contention/failure domain.
- `CPU_UPGRADE_ONLY` — does not address proven disk exhaustion.
- `LOGGER_CHANGE_ONLY` — does not restore seller image storage or remove shared disk pressure.

The correct proportionate intervention is `WEB_DB_ISOLATION`.

The player must justify it with:

```text
PROVEN_CAUSE = shared finite disk
MECHANISM = DB and Web/application writes consume same disk resource
INTERVENTION_EFFECT = give DB and Web/application separate resource domains
LIMIT = each new domain remains finite
TRADE_OFF = Web-to-DB access is now a network dependency
```

### TRADE_OFF → SCORE

Player chooses the one supported new consequence:

`WEB_DB_NETWORK_DEPENDENCY_EXISTS`

No timeout/retry/latency/packet-loss remediation content follows.

---

# 6. Core playable interaction

M04 is not “read cards, choose the correct architecture.”

The player manipulates a causal/resource model.

## Interaction A — Evidence case

Inspect cards individually. Before inspection, each shows only neutral title/preview/provenance category marker.

## Interaction B — Resource-boundary board

After the evidence gate, the player places observed write consumers into a finite resource boundary:

Tokens:

- MySQL persistent data
- Tomcat logs
- seller image write
- CPU comparator
- request-path comparator

Zones:

- `SHARED LOCAL DISK`
- `NOT SHOWN TO CONSUME THIS DISK`

Keyboard/tap interaction:

1. select token;
2. select zone;
3. state announces placement.

No drag is required.

Correct resource map:

```text
SHARED LOCAL DISK:
  MySQL persistent data
  Tomcat logs
  seller image write

NOT SHOWN TO CONSUME THIS DISK:
  CPU comparator
  request-path comparator
```

The board does not reveal correctness immediately. It feeds the diagnosis/experiment.

## Interaction C — Causal builder

Five shuffled causal claims must be reordered with Up/Down controls and linked to evidence.

## Interaction D — Intervention prediction

Before the experiment, show two unlabeled topology conditions:

### Condition A

```text
HOST 01
  Tomcat
  MySQL
  shared disk
```

### Condition B

```text
WEB HOST
  Tomcat
  Web local disk

DB HOST
  MySQL
  DB local disk

Web ↔ DB dependency line
```

At this point the second condition is labelled neutrally as:

> `Condition B · separated resource boundaries`

Do not yet label it “the answer” or “recommended architecture.”

The player predicts which writes share capacity in each condition.

## Interaction E — Run

Animate or step through deterministic qualitative writes:

```text
1. DB persistence request
2. Tomcat log write
3. seller image write
4. resource-boundary comparison
```

Reduced-motion mode replaces movement/fill animation with immediate ordered state cards.

## Interaction F — Intervention decision

Only after result reconciliation does the action tray expose intervention names.

---

# 7. Deterministic intervention experiment

## Simulation model

All quantities below are **TEACHING_SIMULATION LAB UNITS**, never historical measurements.

### Condition A — current shared host

```yaml
shared_disk:
  capacity: 100
  db_data: 76
  product_images: 18
  logs_and_other: 6
  occupied: 100
  free: 0
```

Deterministic result:

```yaml
db_existing_data:
  present: true
tomcat_new_log_write:
  result: BLOCKED_NO_FREE_SPACE
seller_new_image_write:
  result: BLOCKED_NO_FREE_SPACE
resource_contention:
  web_and_db_share_same_capacity_boundary: true
```

The experiment does not model corruption, crash mechanics, filesystem internals, or exact database behaviour beyond the teaching claim that the disk has no free capacity and new writes cannot obtain space.

### Condition B — separated Web/DB resource domains

```yaml
web_host_disk:
  capacity: 30
  images_logs_other: 24
  free: 6

db_host_disk:
  capacity: 100
  db_data: 76
  free: 24

placement:
  tomcat: WEB_HOST
  mysql: DB_HOST
  images: WEB_HOST_LOCAL_DISK
```

Deterministic result:

```yaml
tomcat_new_log_write:
  result: SPACE_AVAILABLE_IN_LAB_MODEL
seller_new_image_write:
  result: SPACE_AVAILABLE_IN_LAB_MODEL
db_persistent_write:
  result: SPACE_AVAILABLE_IN_LAB_MODEL
resource_contention:
  web_and_db_share_same_capacity_boundary: false
new_dependency:
  web_to_db: NETWORK
```

## Critical interpretation

The experiment proves:

> Separating the Web/application and DB resource domains removes **this specific shared-disk contention** in the controlled model.

It does not prove:

- either disk has infinite capacity;
- the architecture is universally “better”;
- networks are reliable;
- image storage is solved for future Web scale-out;
- DB connection capacity is solved.

---

# 8. Plausible wrong paths and recoverable feedback

## Wrong diagnosis D02 — CPU capacity

Why tempting: “The site is bigger, so perhaps the server needs more compute.”

Feedback after commitment:

> “Growth can create compute pressure, but which inspected evidence demonstrates CPU exhaustion here? Compare that with the two failed write operations.”

Do not say “disk full is correct” until the player reconstructs the evidence.

## Wrong diagnosis D03 — request-path failure

Why tempting: M02 taught request-layer diagnosis.

Feedback:

> “A request-path problem can make a site unavailable, but this incident contains two concrete storage-write failures. Which shared resource can explain both?”

## Wrong intervention I02 — bigger single-host disk

Why tempting: it directly increases the exhausted resource and can be a valid short-term capacity response.

Result classification: `PARTIAL / TEMPORARY_RELIEF`.

Feedback:

> “More capacity can restore headroom in this model, but Tomcat, MySQL, logs, and images still consume one shared disk boundary. The demonstrated coupling remains.”

This is not treated as a silly answer. Award partial proportionality credit.

## Wrong intervention I03 — CPU upgrade only

Result: `DOES_NOT_ADDRESS_PROVEN_CAUSE`.

Feedback:

> “The evidence did not establish CPU exhaustion, and changing CPU capacity does not create free disk space in this experiment.”

## Wrong intervention I04 — logger change only

Result: `SYMPTOM_NARROWING_NOT_ROOT_CAUSE`.

Feedback:

> “Changing one log-writing behaviour does not explain or restore the seller image write, and MySQL still shares the finite disk.”

---

# 9. Causal explanation builder

## Required structured explanation

The final explanation uses deterministic chips, not free-form text as factual authority.

### Required concepts

```text
C01 CATALOGUE_GROWS
C02 PERSISTENT_DB_DATA_GROWS
C03 DB_AND_APP_WRITES_SHARE_FINITE_DISK
C04 SHARED_DISK_REACHES_CAPACITY
C05 MULTIPLE_WRITES_FAIL
C06 WEB_DB_ISOLATION_SEPARATES_RESOURCE_DOMAINS
C07 NETWORK_DEPENDENCY_IS_INTRODUCED
```

Canonical order:

```text
C01 → C02 → C03 → C04 → C05 → C06 → C07
```

### Required evidence links

```text
E01 → C01
E03 → C02
E02 → C04
E04 → C05
E05 → C05
X01 experiment comparison → C06
X02 topology result → C07
```

### Required final claims

- Root cause: shared finite disk capacity.
- Evidence: MySQL data filled the disk; Tomcat log and seller image writes cannot obtain space.
- Intervention mechanism: separate Web/application and DB resource domains.
- Trade-off: Web→DB becomes a network dependency.
- Boundary: network behaviour itself is not investigated in M04.

## Optional reflection

Unscored free text:

> “What evidence changed your mind, and why is ‘buy a bigger server’ different from removing the shared-resource coupling?”

Reflection is not sent to an LLM for factual grading.

---

# 10. Deterministic 100-point scoring

| Category | Points | Deterministic rule |
|---|---:|---|
| Investigation | 15 | required evidence gate satisfied = 15; otherwise cannot progress |
| Diagnosis | 15 | shared disk = 10; required proof links E02 + two of E03/E04/E05 = 5 |
| Resource map | 10 | 2 points each for MySQL/log/image/CPU/path placement |
| Causal chain | 15 | canonical order = 10; required evidence links = 5 |
| Prediction | 10 | five prediction assertions × 2 |
| Experiment interpretation | 10 | shared-condition result = 4; isolated-resource result = 4; “finite, not magically solved” boundary = 2 |
| Intervention | 15 | Web/DB isolation = 10; mechanism justification = 5. Bigger single disk = max 6 in this category; CPU/logger-only = max 2 |
| Trade-off/boundary | 5 | network dependency = 3; explicitly does not prescribe M05/M06 remedy = 2 |
| Investigation/recovery efficiency | 5 | 0 wrong committed diagnosis/intervention cycles=5; 1=4; 2=3; 3+=2 |
| **Total** | **100** | deterministic sum |

## Wrong prediction scoring

Predictions are graded after reveal. Wrong predictions reduce score but do not prevent completion once the player correctly interprets the measured result.

## Completion gate versus score

A player may complete below 100 after recovery. Completion requires correct final causal model and intervention, not a perfect first attempt.

A perfect clean path is exactly `100/100`.

---

# 11. Replay / reset contract

`Replay M04` resets:

- phase → `OBSERVE`;
- inspected evidence → empty;
- resource map → unclassified;
- diagnosis → null;
- diagnosis evidence links → empty;
- causal order → deterministic shuffled initial order;
- causal links → empty;
- predictions → empty;
- experiment run flag → false;
- revealed results → hidden;
- result matches → empty;
- intervention → null;
- intervention justification → empty;
- trade-off → null;
- wrong-commit counters → 0;
- score → hidden;
- reflection → empty.

Replay must not:

- mutate source/provenance;
- carry previous correctness highlighting;
- expose the intervention early;
- navigate to another mission.

---

# 12. Screen-by-screen storyboard

## S01 — Incident briefing

**First notice:** `02:00 · seller image write failed · application log write failed.`

**Objective:** establish concrete incident without naming cause.

**Desktop:** left mission brief; centre HOST 01 topology; right neutral incident ticket.  
**390px:** single-column order: title → incident → topology → objective → evidence CTA.

**Controls:** `Begin investigation`.

**Accessibility:** heading hierarchy; incident text in normal DOM; no information encoded only in red.

**Reduced motion:** no pulsing alarm. Static `INCIDENT OPEN` label.

**Must remain undisclosed:** disk fullness, MySQL cause, separation.

---

## S02 — Evidence case

**Objective:** inspect required evidence.

**Desktop:** evidence grid + persistent neutral HOST 01 sketch.  
**390px:** one card per row; sticky progress may be used only if it does not cover content.

**State label:** `INVESTIGATE · n/7 INSPECTED`.

**Locked feedback:** “Diagnosis requires E01–E05 and at least one comparator.”

**Keyboard/touch:** each card is a native button; Enter/Space/tap inspects.

**Screen reader:** card announces ID, neutral title, inspection state; newly revealed observation/provenance follows button in reading order.

**No answer leakage:** uninspected cards expose no hidden interpretation through accessible name/title attributes.

---

## S03 — Diagnosis + resource map

**Objective:** classify the observed shared resource and choose a diagnosis.

**Layout:** resource-boundary board plus diagnosis tray.

**Controls:** select token → select zone; radio/button diagnosis options; evidence-link selectors.

**Wrong state:** local feedback only; no auto-placement.

**390px:** token list above zones; never require side-by-side drag.

**First notice:** “Which observations share one finite resource?”

---

## S04 — Causal builder

**Objective:** explain why catalogue growth can lead to multiple write failures.

**Controls:** Up/Down for each causal chip; evidence-link selects.

**Error:** identify the broken causal relation, not the correct full sequence.

**Reduced motion:** reorder instantly; focus remains on moved item.

**Screen reader:** announce “moved to position N of 5.”

---

## S05 — Predict controlled comparison

**Objective:** commit expectations before result.

Show Condition A and neutral Condition B.

**Controls:** radio choices for each outcome.

**No reveal:** Run button disabled until all predictions exist.

**Player-facing numeric labels:** every lab-unit value, if visible here, carries `TEACHING SIMULATION · LAB UNITS`.

---

## S06 — Run experiment

**Objective:** compare resource boundaries.

**Standard motion:** four short deterministic steps; no decorative long animation.  
**Reduced motion:** immediate ordered list with same four semantic steps.

**Controls:** `Run controlled comparison`; after run, `Review measured result`.

No network timing animation.

---

## S07 — Reveal and reconcile

**Objective:** connect result to cause.

Show qualitative results prominently:

```text
CURRENT SHARED CONDITION
Log write: BLOCKED
Image write: BLOCKED
Web + DB same disk boundary: YES

SEPARATED RESOURCE CONDITION
Log write: SPACE AVAILABLE IN LAB MODEL
Image write: SPACE AVAILABLE IN LAB MODEL
Web + DB same disk boundary: NO
```

Numeric lab units may appear in expandable provenance details only.

**Boundary callout:** “This controlled result demonstrates resource isolation, not infinite capacity.”

---

## S08 — Intervention decision

**Objective:** choose proportionate action.

Cards appear only now:

- isolate Web and DB resource domains;
- increase one shared disk;
- CPU upgrade only;
- logger-only change.

Each card states mechanism, not score.

Wrong choices are recoverable.

---

## S09 — Trade-off

After Web/DB isolation is justified:

```text
Web host: Tomcat + local images
DB host: MySQL
Web → DB: network dependency
```

Player chooses the correct trade-off statement.

Only permitted network wording:

> “The application now depends on reaching the database across a network.”

Then:

> “M04 stops here. Network failure behaviour is not investigated in this mission.”

---

## S10 — Score and reflection

Show category score, not just total.

Completion label:

> `Architecture intervention justified: Web/DB resource isolation`

Do not say “final architecture” or imply all scaling problems are solved.

Optional unscored reflection.

Controls: `Replay M04`; navigation to M04+ is **not** a design requirement.

---

# 13. Misconceptions to challenge

1. **“Growth means buy a faster CPU.”**  
   Resource type must follow evidence.

2. **“A full disk is only a database problem.”**  
   Shared capacity can block unrelated writers on the same resource.

3. **“A bigger disk removes the architecture problem.”**  
   It adds headroom but retains the demonstrated shared-resource coupling.

4. **“Two machines are automatically better.”**  
   Separation is justified here because a specific shared-resource failure was proven.

5. **“If the experiment succeeds, storage can never fill again.”**  
   False. Each isolated resource remains finite.

6. **“Moving the DB also moves product images.”**  
   Source says images remain on Web local disk after this split.

7. **“A new network dependency means M04 should configure retries/timeouts.”**  
   Explicitly deferred.

---

# 14. Explicit M05 / M06 and later-topic deferral

## M05 deferral

M04 may reveal only:

```text
Web → DB is now a network dependency.
```

M04 must not teach, simulate, score, or recommend:

- network outage;
- packet loss;
- timeout behaviour;
- retry strategy;
- network latency diagnosis;
- firewall debugging;
- IP-change handling;
- network remediation.

## M06 deferral

M04 must not teach, simulate, score, or recommend:

- connection pool sizing;
- `maxPoolSize`;
- MySQL `max_connections`;
- connection saturation;
- pool exhaustion;
- tuning pool/database connection counts.

## Other forbidden player-facing solutions

Do not introduce:

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
- distributed filesystems;
- autoscaling.

Local images may appear only because they are part of the source incident and remain on the Web host after the M04 split.

---

# 15. Stable acceptance tests

## M04-T001 — Fresh-player first action

Within 10 seconds, a fresh player can identify the incident as two failed writes and find `Begin investigation`. Opening copy does not name disk-full or Web/DB separation.

## M04-T002 — Fiction/source/simulation boundary

Opening and evidence surfaces distinguish `SOURCE_BACKED`, `FICTIONAL_SCENARIO`, and `TEACHING_SIMULATION`.

## M04-T003 — No answer leakage

Before inspection/diagnosis commit, runtime does not expose “MySQL filled disk,” `SHARED_DISK_CAPACITY`, “split database,” or equivalent answer text in visible or accessible hidden strings.

## M04-T004 — Evidence gate

Diagnosis remains locked unless E01–E05 and at least one of E06/E07 are inspected.

Examples:

```text
E01+E02+E03+E04+E05           → LOCKED
E01+E02+E03+E04+E05+E06       → OPEN
E01+E02+E03+E04+E05+E07       → OPEN
E02+E03+E04+E05+E06+E07       → LOCKED (E01 missing)
```

## M04-T005 — No unseen evidence proof

An uninspected evidence ID cannot be attached as a diagnosis or causal proof token.

## M04-T006 — Shared-disk diagnosis

Final diagnosis requires `SHARED_DISK_CAPACITY`, E02, and at least two of E03/E04/E05.

## M04-T007 — CPU wrong-path recovery

CPU diagnosis receives evidence-local recovery and does not reveal the full correct chain.

## M04-T008 — Request-path wrong-path recovery

Request-path diagnosis is rejected based on storage-write evidence without replaying M02 latency mechanics.

## M04-T009 — Resource map

MySQL data, Tomcat logs, and image write map to the shared disk; negative controls do not.

## M04-T010 — Causal chain

Canonical five-link pre-intervention causal order and required evidence links are deterministic.

## M04-T011 — Prediction-before-reveal

No Condition A/B outcome is visible until all required predictions are committed and Run is activated.

## M04-T012 — Shared-condition deterministic result

At 100/100 teaching lab units, log and new image writes are `BLOCKED_NO_FREE_SPACE`.

## M04-T013 — Isolated-condition deterministic result

In the teaching model, Web and DB use distinct disk capacity boundaries and the three tested writes report available space.

## M04-T014 — Finite-capacity boundary

Result explicitly states that isolation does not make either resource infinite.

## M04-T015 — Bigger-disk intervention

Increasing one shared disk is classified as plausible temporary relief but retains the shared resource boundary and cannot receive full intervention credit.

## M04-T016 — CPU intervention

CPU-only intervention cannot receive root-cause resolution credit.

## M04-T017 — Logger-only intervention

Logger-only intervention cannot receive root-cause resolution credit because image/storage evidence remains unexplained.

## M04-T018 — Web/DB isolation

Full intervention credit requires separate Web/DB resource domains and mechanism justification tied to proven shared-disk contention.

## M04-T019 — Images remain Web-local

Post-intervention topology keeps product images on Web local disk. No later image-storage solution is introduced.

## M04-T020 — Network consequence boundary

Completion may state Web→DB is a network dependency but contains no timeout/retry/packet-loss/latency/remediation lesson.

## M04-T021 — M06 boundary

Runtime contains no connection-pool/max_connections tuning lesson or recommendation.

## M04-T022 — Later-solution boundary

Player-facing runtime contains none of the forbidden later architecture solutions listed in §14.

## M04-T023 — Deterministic scoring

Perfect clean path = exactly 100. Bigger-single-disk intervention cannot score full intervention points. Efficiency tiers are 0→5, 1→4, 2→3, 3+→2.

## M04-T024 — Wrong reasoning recovery

A wrong diagnosis/intervention can be revised without losing inspected evidence or rerunning unrelated earlier phases.

## M04-T025 — Replay reset

Replay restores the exact initial state and hides all result/correctness state.

## M04-T026 — Keyboard-only completion

All investigation, classification, reorder, prediction, run, reconciliation, intervention, trade-off, completion, and replay actions are possible using keyboard only. No drag is required.

## M04-T027 — Touch completion

All required actions work by tap with targets usable at a real 390px viewport; no hover dependency.

## M04-T028 — Real 390px layout

At 390 CSS px width:

- no horizontal page scroll;
- no clipped controls/text;
- evidence cards are readable;
- resource zones stack vertically;
- causal reorder controls remain reachable;
- prediction labels wrap;
- score table remains readable;
- wrong-path recovery and replay can be completed.

Capture both clean path and one wrong-path recovery.

## M04-T029 — Reduced motion

With `prefers-reduced-motion: reduce`, experiment meaning remains complete without animated movement/fill. Focus does not jump unexpectedly.

## M04-T030 — Screen reader

Screen-reader path announces:

- evidence inspection state;
- evidence-gate state;
- token placement;
- wrong-path feedback;
- prediction commitment;
- experiment results;
- intervention selection;
- score/completion.

Hidden answer text must not leak before reveal.

## M04-T031 — Numeric provenance

Every runtime numeric incident/simulation value has an adjacent or programmatically associated provenance label. No simulated value is described as historical/production measurement.

## M04-T032 — Rendered route

M04 route renders mission title, source/simulation boundary, incident briefing, evidence gate, and no later-solution recommendation in initial HTML/runtime fixture.

## M04-T033 — Qualitative result language

Primary result UI uses qualitative outcomes (`BLOCKED`, `SPACE AVAILABLE IN LAB MODEL`, shared boundary yes/no). Numeric lab units remain explicitly simulation-labelled.

## M04-T034 — No M03 reprise

M04 does not ask the player to rediscover localhost/images/Session as the central lesson. The new evidence mechanic is shared-disk capacity/contention.

## M04-T035 — Completion boundary

Completion explains resource isolation plus the new network dependency and stops. It does not auto-launch, require, or design M05.

---

# 16. Implementation handoff YAML / data contract

This is a data proposal, not application code.

```yaml
mission:
  id: M04
  slug: disk-full-at-0200
  title: "Disk Full at 02:00"
  act: "Act I — One Machine, First Limits"
  slice: "Vertical Slice A"
  source:
    repository: ccc115a/se
    path: "_more/mybook/向淘寶學習網站架構演進/1.2.md"
    blob_sha: "00756d5a3a4054cd9592e19199c10626cdce993a"
    accepted_review: "docs/architecture-evolution-lab/reviews/source-review-m01-m06.md"

  provenance_types:
    - SOURCE_BACKED
    - SOURCE_BACKED_SOURCE_NUMBER
    - SOURCE_BACKED_SOURCE_EXAMPLES
    - FICTIONAL_SCENARIO
    - TEACHING_SIMULATION
    - TEACHING_SIMULATION_NEGATIVE_CONTROL

  initial:
    phase: OBSERVE
    incident_clock:
      value: "02:00"
      provenance: FICTIONAL_SCENARIO
    reveal_root_cause: false
    reveal_interventions: false
    reveal_tradeoff: false

  phases:
    - OBSERVE
    - INVESTIGATE
    - DIAGNOSE
    - BUILD_CAUSE
    - PREDICT
    - RUN
    - REVEAL
    - INTERVENE
    - TRADE_OFF
    - SCORE
    - COMPLETE

  evidence:
    required_evidence:
      minimum_count: 6
      mandatory: [E01, E02, E03, E04, E05]
      one_of: [E06, E07]
      unlock_predicate: "inspected(E01) AND inspected(E02) AND inspected(E03) AND inspected(E04) AND inspected(E05) AND (inspected(E06) OR inspected(E07)) AND unique_inspected_count >= 6"
    prohibit_uninspected_proof_links: true

  diagnoses:
    - SHARED_DISK_CAPACITY
    - CPU_CAPACITY
    - REQUEST_PATH_FAILURE
    - APPLICATION_LOGGER_ONLY
  correct_diagnosis: SHARED_DISK_CAPACITY
  diagnosis_proof:
    mandatory: [E02]
    minimum_from: [E03, E04, E05]
    minimum_from_count: 2

  resource_map:
    SHARED_LOCAL_DISK:
      - MYSQL_PERSISTENT_DATA
      - TOMCAT_LOG_WRITE
      - SELLER_IMAGE_WRITE
    NOT_SHOWN_TO_CONSUME_THIS_DISK:
      - CPU_COMPARATOR
      - REQUEST_PATH_COMPARATOR

  causal_pre_intervention:
    canonical_order:
      - CATALOGUE_GROWS
      - PERSISTENT_DB_DATA_GROWS
      - DB_AND_APP_WRITES_SHARE_FINITE_DISK
      - SHARED_DISK_REACHES_CAPACITY
      - TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE
    evidence_links:
      CATALOGUE_GROWS: [E01]
      PERSISTENT_DB_DATA_GROWS: [E03]
      SHARED_DISK_REACHES_CAPACITY: [E02]
      TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE: [E04, E05]

  experiment:
    provenance: TEACHING_SIMULATION
    prediction_required_before_run: true
    conditions:
      CURRENT_SHARED:
        shared_disk:
          capacity_lab_units: 100
          db_data: 76
          product_images: 18
          logs_and_other: 6
          occupied: 100
      WEB_DB_ISOLATED:
        web_disk:
          capacity_lab_units: 30
          occupied_lab_units: 24
        db_disk:
          capacity_lab_units: 100
          occupied_lab_units: 76
        placement:
          tomcat: WEB_HOST
          mysql: DB_HOST
          images: WEB_HOST_LOCAL_DISK
    deterministic_results:
      CURRENT_SHARED:
        tomcat_log_write: BLOCKED_NO_FREE_SPACE
        seller_image_write: BLOCKED_NO_FREE_SPACE
        same_web_db_disk_boundary: true
      WEB_DB_ISOLATED:
        tomcat_log_write: SPACE_AVAILABLE_IN_LAB_MODEL
        seller_image_write: SPACE_AVAILABLE_IN_LAB_MODEL
        db_write: SPACE_AVAILABLE_IN_LAB_MODEL
        same_web_db_disk_boundary: false
        web_to_db_dependency: NETWORK

  interventions:
    WEB_DB_ISOLATION:
      final_status: SUCCEEDS_FOR_PROVEN_SHARED_RESOURCE_CAUSE
    BIGGER_SINGLE_HOST_DISK:
      final_status: PARTIAL_TEMPORARY_RELIEF
    CPU_UPGRADE_ONLY:
      final_status: DOES_NOT_ADDRESS_PROVEN_CAUSE
    LOGGER_CHANGE_ONLY:
      final_status: SYMPTOM_NARROWING_NOT_ROOT_CAUSE

  required_final_intervention: WEB_DB_ISOLATION

  tradeoff:
    required: WEB_DB_NETWORK_DEPENDENCY_EXISTS
    stop_after_observation: true

  final_explanation:
    canonical_order:
      - C01_CATALOGUE_GROWS
      - C02_PERSISTENT_DB_DATA_GROWS
      - C03_DB_AND_APP_WRITES_SHARE_FINITE_DISK
      - C04_SHARED_DISK_REACHES_CAPACITY
      - C05_MULTIPLE_WRITES_FAIL
      - C06_WEB_DB_ISOLATION_SEPARATES_RESOURCE_DOMAINS
      - C07_NETWORK_DEPENDENCY_IS_INTRODUCED
    evidence_links:
      E01: C01_CATALOGUE_GROWS
      E03: C02_PERSISTENT_DB_DATA_GROWS
      E02: C04_SHARED_DISK_REACHES_CAPACITY
      E04: C05_MULTIPLE_WRITES_FAIL
      E05: C05_MULTIPLE_WRITES_FAIL
      X01: C06_WEB_DB_ISOLATION_SEPARATES_RESOURCE_DOMAINS
      X02: C07_NETWORK_DEPENDENCY_IS_INTRODUCED

  scoring:
    maximum: 100
    categories:
      investigation: 15
      diagnosis: 15
      resource_map: 10
      causal_chain: 15
      prediction: 10
      experiment_interpretation: 10
      intervention: 15
      tradeoff_boundary: 5
      efficiency: 5
    efficiency:
      repairs_0: 5
      repairs_1: 4
      repairs_2: 3
      repairs_3_plus: 2

  replay:
    resets_all_mutable_m04_state: true
    preserves_source_registry: true

  do_not_teach_yet:
    - NETWORK_FAILURE
    - TIMEOUTS
    - RETRIES
    - PACKET_LOSS
    - NETWORK_LATENCY_DIAGNOSIS
    - NETWORK_REMEDIATION
    - CONNECTION_POOL_TUNING
    - MAX_CONNECTIONS_TUNING
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
  - M04-T001
  - M04-T002
  - M04-T003
  - M04-T004
  - M04-T005
  - M04-T006
  - M04-T007
  - M04-T008
  - M04-T009
  - M04-T010
  - M04-T011
  - M04-T012
  - M04-T013
  - M04-T014
  - M04-T015
  - M04-T016
  - M04-T017
  - M04-T018
  - M04-T019
  - M04-T020
  - M04-T021
  - M04-T022
  - M04-T023
  - M04-T024
  - M04-T025
  - M04-T026
  - M04-T027
  - M04-T028
  - M04-T029
  - M04-T030
  - M04-T031
  - M04-T032
  - M04-T033
  - M04-T034
  - M04-T035
```

---

# 17. Reviewer checklist

- [ ] M04 only; no M05+ design.
- [ ] Source path and blob SHA exactly match the contract.
- [ ] Opening does not reveal disk-full or Web/DB separation.
- [ ] Atlas Market and 02:00 are labelled fictional.
- [ ] All lab-unit values are labelled teaching simulation.
- [ ] Source-backed growth/disk/log/image claims are not presented as invented metrics.
- [ ] Evidence gate requires E01–E05 plus E06 or E07.
- [ ] Uninspected evidence cannot be used as proof.
- [ ] Player must prove shared disk before intervention names appear.
- [ ] CPU/request-path alternatives are plausible and recoverable.
- [ ] Bigger shared disk receives partial, not absurd-zero, credit.
- [ ] Deterministic experiment compares one shared disk with separated Web/DB resource domains.
- [ ] Images remain Web-local after the split.
- [ ] Result does not imply infinite storage.
- [ ] Web/DB isolation is justified by demonstrated resource contention.
- [ ] Network dependency is revealed only as a consequence.
- [ ] No M05 failure/timeouts/retries/packet-loss/latency/remediation teaching.
- [ ] No M06 pool/max_connections teaching.
- [ ] No later architecture solutions leak into player-facing runtime.
- [ ] Perfect path deterministically scores 100.
- [ ] Recovery can complete below 100.
- [ ] Replay resets all mutable M04 state.
- [ ] Keyboard and tap paths require no drag.
- [ ] Real 390px, reduced-motion, and screen-reader criteria are testable.
- [ ] Numeric provenance is machine-testable.
- [ ] Runtime-scoped forbidden-content tests do not grep author-only provenance/deferral documentation.
- [ ] Machine-readable `test_ids` contains every detailed stable acceptance ID and no orphan.

---

# 18. Required evidence captures after implementation

These are implementation-verification requirements, not claims that they already exist.

1. `M04-01-fresh-desktop.png` — opening, no root-cause leakage.
2. `M04-02-evidence-gate-locked.png` — E01–E05 inspected without comparator; diagnosis locked.
3. `M04-03-evidence-gate-open.png` — required evidence satisfied.
4. `M04-04-wrong-cpu-recovery.png` — local recoverable feedback.
5. `M04-05-shared-resource-map.png` — committed resource hypothesis before reveal.
6. `M04-06-prediction-before-run.png` — predictions committed, result still hidden.
7. `M04-07-shared-condition-result.png`.
8. `M04-08-isolated-condition-result.png`.
9. `M04-09-bigger-disk-partial.png`.
10. `M04-10-web-db-isolation-completion.png`.
11. `M04-11-score-100.png`.
12. `M04-12-replay-reset.png`.
13. `M04-13-390px-clean-path.png`.
14. `M04-14-390px-wrong-path-recovery.png`.
15. `M04-15-keyboard-only.webm` or equivalent test log/capture.
16. `M04-16-touch-path.webm` or equivalent.
17. `M04-17-reduced-motion.webm` or equivalent state capture.
18. `M04-18-screen-reader.md` — announcement transcript/checklist.
19. `M04-19-runtime-boundary.txt` — runtime string fixture proving M05/M06/later-solution recommendations are absent.
20. `M04-20-numeric-provenance.txt` — runtime numeric fixture showing provenance association.

---

# 19. Runtime boundary fixture

Forbidden-content tests must inspect **player-facing M04 runtime strings**, not this storyboard as a whole, because this document necessarily names deferred topics.

## Allowed runtime network consequence

Patterns equivalent to:

```text
network dependency
Web must reach the DB across a network
M04 stops here
```

## Forbidden runtime recommendation/lesson patterns

M04 runtime must not recommend, configure, or explain:

```text
retry / retries
timeout tuning
packet loss
network remediation
connection pool sizing
max_connections
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
distributed filesystem
autoscaling
```

A developer-only `do_not_teach_yet` registry and test documentation may contain these strings.

---

# 20. Open questions

**None requiring human approval before implementation.**

The source and mission contract settle:

- the incident cause;
- the Web/DB isolation intervention;
- image placement after the split;
- the network-dependency trade-off boundary;
- M05/M06 deferral;
- simulation-only numeric treatment.

Implementation may choose visual styling consistent with the existing Architecture Evolution Lab design system without changing the mechanics or provenance contract.

---

# 21. Change log

## v1 — 2026-09-16

Initial M04 storyboard.

- Anchored mission to source section 1.2 blob `00756d5a3a4054cd9592e19199c10626cdce993a`.
- Defined an evidence-first shared-disk capacity investigation rather than a passive topology lesson.
- Added mandatory proof before Web/DB separation is named.
- Added plausible CPU, request-path, bigger-disk, and logger-only alternatives with recoverable feedback.
- Added deterministic shared-versus-isolated resource experiment using explicitly labelled teaching-simulation lab units.
- Preserved source-backed local image placement after Web/DB separation.
- Added causal explanation, prediction-before-reveal, deterministic 100-point scoring, replay, mobile/keyboard/touch/reduced-motion/screen-reader requirements.
- Explicitly stopped the mission at the newly introduced network dependency and deferred M05 network behaviour and M06 connection-capacity tuning.
- Added stable acceptance registry `M04-T001`–`M04-T035`.
- Added runtime-scoped boundary and numeric-provenance verification requirements.

## v1.1 — 2026-09-16

- Corrected the machine-readable `test_ids` registry so `M04-T001` through `M04-T035` each appear exactly once, in order, with no duplicate or omission. No gameplay, scope, provenance, scoring, phase, evidence-gate, or deferral changes.
