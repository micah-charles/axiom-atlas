# M03 --- Find the Three Local Assumptions

## Architecture Evolution Lab --- Storyboard / Content Design v1

> **Artifact type:** Mission storyboard / implementation contract, not
> application code.\
> **Scope:** M03 only. M04+ is explicitly deferred.\
> **Repository context:** `micah-charles/axiom-atlas`, branch
> `feature/architecture-evolution-lab`.\
> **Primary technical source:** `ccc115a/se` →
> `_more/mybook/向淘寶學習網站架構演進/1.1.md`\
> **Exact source blob SHA:** `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`\
> **Continuity:** M01 established the rational single-host starting
> point. M02 established the request path and latency diagnosis. M02
> implementation correctness is independently PASS at `778248c`; M02
> full verification remains **CONDITIONAL PASS** because real 390px,
> explicit reduced-motion, and screen-reader evidence remain open. This
> artifact does not close that debt.

------------------------------------------------------------------------

# 1. Mission header

  -----------------------------------------------------------------------
  Field                               Contract
  ----------------------------------- -----------------------------------
  Mission ID                          `M03`

  Title                               **Find the Three Local
                                      Assumptions**

  Act / chapter                       **Act I --- One Machine, First
                                      Limits**

  Primary source                      Section `1.1` only

  Learner                             Beginner--intermediate architecture
                                      learner

  Estimated first play                10--14 minutes

  Replay target                       4--6 minutes

  Starting architecture               Working Atlas Market single-host
                                      shop on `HOST_01`

  Observable problem                  The shop works on one host, but a
                                      proposed host-boundary change
                                      exposes hidden local coupling.

  Core learning objective             **A working application can contain
                                      hidden placement assumptions.
                                      Before changing a host boundary,
                                      identify which dependencies are
                                      tied to that host and predict what
                                      will fail if the boundary moves.**

  Required discoveries                Local DB endpoint/placement; local
                                      image files; in-memory Tomcat
                                      Session

  Factual authority                   Deterministic mission data derived
                                      from source; no LLM adjudication
  -----------------------------------------------------------------------

## 1.1 Learner promise

> "Atlas Market is working. Operations wants to prove that the
> application could be brought up on a replacement host. Nothing is
> visibly broken yet. Your job is to inspect the current system, find
> the dependencies that silently assume HOST 01, predict what survives a
> host change, and prove your reasoning with a controlled lab
> experiment."

The mission does **not** ask the learner to fix the architecture. It
asks the learner to discover coupling.

## 1.2 Learning objectives

By completion, the player can:

1.  distinguish "the shop works now" from "the shop is safe to move or
    reproduce elsewhere";
2.  derive placement dependencies from concrete evidence rather than
    architecture labels;
3.  identify the three source-backed local assumptions:
    -   application → MySQL through `localhost` / same-host placement;
    -   product images → local disk;
    -   Session → Tomcat process memory;
4.  predict consequences when application execution moves across a host
    boundary;
5.  explain why a dependency can be correct on HOST 01 yet unsafe to
    assume on another host;
6.  separate **dependency discovery** from **solution selection**.

------------------------------------------------------------------------

# 2. Source traceability and provenance boundary

The game must render provenance in inspectable evidence/result details.
It must not imply that fictional Atlas Market events, UI labels, or
experiment outcomes are historical Taobao measurements.

  -----------------------------------------------------------------------------------------------------
  Claim / mechanic           Provenance              Exact source support             Runtime treatment
  -------------------------- ----------------------- -------------------------------- -----------------
  Web/application/database   `SOURCE_BACKED`         §1.1                             Background
  run on one OS/host in the                          "單機站：所有東西塞進一台機器"   topology
  early single-node model                                                             

  Tomcat uses JDBC to access `SOURCE_BACKED`         §1.1 diagram and request         Evidence,
  local MySQL                                        description; Servlet note says   dependency mark,
                                                     JDBC directly connects to local  experiment
                                                     MySQL                            

  DB assumption is           `SOURCE_BACKED`         §1.1 explicitly identifies DB on Config evidence
  `localhost:3306`                                   local machine: `localhost:3306`  after inspection

  Product images are on      `SOURCE_BACKED`         §1.1 diagram and explicit        Resource evidence
  local disk                                         "圖片就在本地磁碟"               after inspection

  Session is in Tomcat       `SOURCE_BACKED`         §1.1 explicitly "Session 就在    Runtime evidence
  memory                                             Tomcat 記憶體裡"                 after inspection

  These are "three           `SOURCE_BACKED`         §1.1 explicitly calls out        **Completion
  single-machine                                     "三個單機假設"                   reveal only**,
  assumptions"                                                                        not opening
                                                                                      answer

  HOST 01 / HOST 02 names    `TEACHING_SIMULATION`   Not historical                   Neutral lab
                                                                                      identifiers

  Operations asks for a      `FICTIONAL_SCENARIO`    Not historical                   Mission incident
  replacement-host rehearsal                                                          

  Exact filenames,           `TEACHING_SIMULATION`   Not historical                   Concrete
  config-card formatting,                                                             inspectable
  browser identity, session                                                           evidence
  token                                                                               

  Deterministic "move app    `TEACHING_SIMULATION`   Educational manipulation of      Core experiment
  execution to HOST 02 while                         source-backed placement          
  leaving unmarked resources                         assumptions                      
  on HOST 01" experiment                                                              

  PASS/FAIL/STATE LOST       `TEACHING_SIMULATION`   Not production telemetry         Qualitative
  result labels                                                                       deterministic
                                                                                      outcomes only

  Score / mistakes /         `TEACHING_SIMULATION`   Game mechanic                    Never presented
  efficiency                                                                          as operational
                                                                                      metric

  External/shared-safe decoy `TEACHING_SIMULATION`   Added only to force              Must be clearly
  evidence                                           classification                   non-historical

  Any historical incident,   **NOT AUTHORIZED**      Not needed for M03               Do not invent
  outage, timing, traffic,                                                            
  cost or failure rate                                                                
  -----------------------------------------------------------------------------------------------------

## 2.1 Source wording safety

The source itself discusses later evolution and asks which assumption
may fail first. M03 must **not** turn that prompt into a prediction of
M04/M05/M06, and must not claim a historical order of failure.

The source establishes the assumptions. The mission establishes only a
controlled educational consequence of changing the host boundary.

------------------------------------------------------------------------

# 3. Starting state

## 3.1 Player-visible starting state

The fresh player sees:

-   `M03 — Find the Three Local Assumptions`;
-   status: **SHOP HEALTHY · REPLACEMENT-HOST REHEARSAL REQUESTED**;
-   `HOST_01` as the currently working shop;
-   a neutral `HOST_02` placeholder labelled **replacement host / empty
    lab target**;
-   a short operations message: \> "The shop works on HOST 01. Before
    maintenance, prove whether the application can run on HOST 02
    without silently depending on HOST 01."
-   a closed **Evidence Case** containing neutral cards;
-   a **Dependency Board** with two classification zones:
    -   `BOUND TO HOST_01`
    -   `NOT PROVEN LOCAL / DOES NOT DEPEND ON HOST_01`
-   experiment control locked with text: **"Inspect and mark
    dependencies before changing the boundary."**

## 3.2 What is intentionally not visible

The opening must not show:

-   the phrase "three local assumptions" as a countable answer hint in
    player instructions beyond the mission title;
-   `localhost:3306`;
-   "local image disk";
-   "Session in Tomcat memory";
-   colored lines already connecting all three dependencies to HOST 01;
-   a list of the three answers;
-   a failure-result preview;
-   a future solution;
-   a "correct architecture" recommendation.

The mission title may say **Find the Three Local Assumptions**, because
that is the locked mission title. The UI must not tell the player
*which* three they are.

## 3.3 Initial topology model

This is data, not a decorative diagram.

``` yaml
topology_initial:
  hosts:
    - id: HOST_01
      role: current_shop_host
      status: running
    - id: HOST_02
      role: replacement_lab_host
      status: empty
  runtime_components:
    - id: APP
      current_host: HOST_01
      label: Shop application / Tomcat
  resources:
    - id: R_DB
      visible_name_before_inspection: Resource A
      placement_reveal: HOST_01
    - id: R_MEDIA
      visible_name_before_inspection: Resource B
      placement_reveal: HOST_01
    - id: R_SESSION
      visible_name_before_inspection: Runtime state C
      placement_reveal: TOMCAT_MEMORY_ON_HOST_01
    - id: R_DNS
      visible_name_before_inspection: Entry service D
      placement_reveal: EXTERNAL_TO_HOST_01
  dependency_edges:
    - APP -> R_DB
    - APP -> R_MEDIA
    - BROWSER -> R_SESSION_via_APP
    - BROWSER -> R_DNS
```

`R_DNS` is a deliberate non-local comparator. It prevents the activity
from degenerating into "mark every card local."

------------------------------------------------------------------------

# 4. Deterministic playable loop and state machine

``` text
OBSERVE
working HOST_01 + replacement-host rehearsal request
  ↓
INVESTIGATE
inspect neutral evidence cards
  ↓
CLASSIFY
mark dependencies as HOST_01-bound or not proven local
  ↓
COMMIT
lock a dependency map before result reveal
  ↓
PREDICT
for each marked local dependency, predict what changes if APP runs on HOST_02
  ↓
RUN
move APP execution to HOST_02 in the teaching simulation
while original resources remain where evidence says they are
  ↓
REVEAL
DB access / image access / Session continuity consequences
  ↓
REPAIR REASONING
wrong marks remain editable; no future technology offered
  ↓
EXPLAIN
build causal dependency chain
  ↓
SCORE
deterministic rubric
  ↓
REFLECT
optional, unscored
  ↓
COMPLETE
reveal term: “three local assumptions”
```

## 4.1 Machine-readable phase model

``` yaml
phases:
  - OBSERVE
  - INVESTIGATE
  - CLASSIFY
  - PREDICT
  - EXPERIMENT_READY
  - EXPERIMENT_RESULT
  - EXPLAIN
  - COMPLETE
```

### Legal transitions

``` yaml
transitions:
  OBSERVE_to_INVESTIGATE:
    trigger: inspect_first_evidence

  INVESTIGATE_to_CLASSIFY:
    predicate: evidence_gate_open

  CLASSIFY_to_PREDICT:
    trigger: commit_dependency_map
    predicate: classification_gate_open

  PREDICT_to_EXPERIMENT_READY:
    trigger: commit_predictions
    predicate: prediction_gate_open

  EXPERIMENT_READY_to_EXPERIMENT_RESULT:
    trigger: run_host_boundary_experiment

  EXPERIMENT_RESULT_to_CLASSIFY:
    trigger: revise_map
    allowed_when: dependency_map_incorrect

  EXPERIMENT_RESULT_to_EXPLAIN:
    trigger: accept_findings
    predicate: all_required_local_dependencies_correct

  EXPLAIN_to_COMPLETE:
    trigger: submit_explanation
    predicate: explanation_complete_and_consistent
```

No random state affects correctness.

------------------------------------------------------------------------

# 5. Evidence catalogue and non-leaking gate

Evidence cards must use neutral titles before inspection. The
interpretation appears only after the player actively inspects the card.

## E01 --- Runtime configuration excerpt

**Closed label:** `E01 · Connection settings`\
**Pre-inspection preview:** "Application startup configuration. Inspect
values."\
**Observation after inspection:** A database connection value includes
host `localhost` and port `3306`.\
**Interpretation unlocked:** `localhost` resolves to the machine on
which the application is running. Therefore this connection assumes the
DB is reachable on the application's own host.\
**Provenance:** `SOURCE_BACKED` for `localhost:3306` local DB
assumption; visual config representation is `TEACHING_SIMULATION`.\
**Correct classification:** `BOUND_TO_HOST_01`.

Do not label the card "Local database."

## E02 --- Product rendering resource trace

**Closed label:** `E02 · Product asset trace`\
**Pre-inspection preview:** "Where did the page obtain its image
bytes?"\
**Observation after inspection:** The application reads an image path
from the machine filesystem, represented as
`/shop/images/item-1042.jpg`.\
**Interpretation unlocked:** The image bytes are being read from disk
attached to the current host, not from an external/shared service.\
**Provenance:** local image storage is `SOURCE_BACKED`; filename/path is
`TEACHING_SIMULATION`.\
**Correct classification:** `BOUND_TO_HOST_01`.

Do not label the card "Local disk images."

## E03 --- Session runtime inspection

**Closed label:** `E03 · Browser state trace`\
**Pre-inspection preview:** "A returning shopper has an active browsing
state."\
**Observation after inspection:** The session object is shown inside the
Tomcat process memory of HOST 01.\
**Interpretation unlocked:** This browsing state exists in the running
Tomcat memory on HOST 01. A different process/host does not
automatically contain that memory.\
**Provenance:** Session in Tomcat memory is `SOURCE_BACKED`;
shopper/session identifier is `TEACHING_SIMULATION`.\
**Correct classification:** `BOUND_TO_HOST_01`.

Do not label the card "In-memory local Session."

## E04 --- DNS entry trace

**Closed label:** `E04 · Request entry trace`\
**Pre-inspection preview:** "Inspect what happens before HTTP reaches
the shop."\
**Observation after inspection:** DNS resolves the shop domain before
the browser sends HTTP. It is represented outside the HOST 01 box.\
**Interpretation unlocked:** In this mission model, DNS is an external
request-stage dependency, not evidence of application data/state stored
locally on HOST 01.\
**Provenance:** DNS-before-HTTP is `SOURCE_BACKED`; diagram placement is
`TEACHING_SIMULATION`.\
**Correct classification:** `NOT_PROVEN_LOCAL`.

This is a comparator, not an M02 latency reprise.

## E05 --- Application package manifest

**Closed label:** `E05 · Deployment package`\
**Pre-inspection preview:** "Inspect what the application package
contains."\
**Observation after inspection:** The application package contains
executable application code but the evidence does not show the DB
contents, product-image directory, or live Session memory travelling
with it.\
**Interpretation unlocked:** Moving executable code is not evidence that
its dependent state/resources move with it.\
**Provenance:** WAR/simple deployment concept is source-backed at
section 1.1; exact manifest is `TEACHING_SIMULATION`.\
**Correct classification:** supporting evidence, not one of the three
required local assumptions.

## 5.1 Evidence gate

The player must not be able to classify after inspecting only the three
answer-bearing cards in a pre-known sequence.

``` yaml
required_evidence:
  minimum_count: 4
  mandatory: [E05]
  required_groups:
    - one_of: [E01, E02]
    - one_of: [E03]
    - one_of: [E04]
  unlock_predicate: >
    inspected_count >= 4
    AND inspected(E05)
    AND (inspected(E01) OR inspected(E02))
    AND inspected(E03)
    AND inspected(E04)
```

This forces at least one comparator and the deployment-package
distinction before classification.

**Important:** all five cards remain inspectable; full score can reward
efficient evidence use but correctness cannot depend on guessing unseen
evidence.

------------------------------------------------------------------------

# 6. Core playable interaction --- dependency marking

## 6.1 Dependency Board

After the evidence gate opens, cards appear as draggable/selectable
tokens by **neutral evidence ID**, with their inspected observations
available on demand.

Two target zones:

-   **BOUND TO HOST 01**
-   **NOT PROVEN LOCAL TO HOST 01**

A third temporary state is:

-   **UNCLASSIFIED**

The player must classify `E01`, `E02`, `E03`, and `E04`. `E05` is
contextual evidence and is pinned beside the board rather than
classified.

## 6.2 Mouse / touch

Two supported interactions:

1.  drag token into a zone; or
2.  tap/click token, then tap/click a destination zone.

Drag must never be the only path.

## 6.3 Keyboard

-   `Tab` reaches every token and zone.
-   `Enter` or `Space` selects a token.
-   Arrow keys may move focus between zones, but are optional.
-   `Enter`/`Space` on a zone places the selected token.
-   A visible **Move** menu is acceptable as an equivalent keyboard
    path.
-   `Escape` cancels a pending move.
-   `Shift+Tab` works normally.
-   Commit button remains reachable after the board.

Each token exposes its current classification in accessible text, e.g.:
`E02 Product asset trace — classified Bound to HOST 01`.

## 6.4 Commit semantics

The player may freely edit before commit.

On **Commit dependency map**:

-   correctness is recorded for scoring;
-   no answer list is immediately shown;
-   if classification is incomplete, commit is blocked with: \> "Four
    inspected dependencies still need a placement judgment."
-   if complete, player advances to prediction even if some
    classifications are wrong.

This permits genuine hypothesis testing.

------------------------------------------------------------------------

# 7. Prediction step

Before running the host-boundary experiment, the player must predict
consequences.

The UI says:

> "The lab will start the application code on HOST 02. Evidence-backed
> resources remain where you observed them. Predict what the application
> can still reach or preserve."

No solution is proposed.

For each of the three **actual** local dependencies, prediction options
are neutral and causal:

### P01 --- Connection target

-   `WORKS_UNCHANGED`
-   `TARGET_NO_LONGER_MEANS_HOST_01`
-   `ALL_DATABASE_DATA_MOVES_WITH_APP`

Correct: `TARGET_NO_LONGER_MEANS_HOST_01`.

### P02 --- Product image read

-   `IMAGE_BYTES_AUTOMATICALLY_FOLLOW_APP`
-   `HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE`
-   `DNS_DOWNLOADS_THE_IMAGE`

Correct: `HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE`.

### P03 --- Existing browsing Session

-   `SESSION_MEMORY_AUTOMATICALLY_APPEARS_ON_HOST_02`
-   `EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02`
-   `MYSQL_RECREATES_IT_AUTOMATICALLY`

Correct: `EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02`.

The player is allowed to make wrong predictions. The experiment still
runs after all three predictions are committed. Prediction mistakes
affect score but do not dead-end the mission.

------------------------------------------------------------------------

# 8. Deterministic host-boundary experiment

## 8.1 Experiment definition

**Experiment ID:** `X01_MOVE_APP_EXECUTION`

Teaching setup:

``` yaml
before:
  APP: HOST_01
  DB: HOST_01
  IMAGE_FILES: HOST_01
  SESSION_MEMORY: TOMCAT_PROCESS_ON_HOST_01

intervention:
  move:
    APP: HOST_01 -> HOST_02
  keep_in_original_observed_place:
    - DB
    - IMAGE_FILES
    - SESSION_MEMORY
  do_not_change:
    - DNS_ENTRY_STAGE

after:
  APP: HOST_02
```

This is explicitly a **teaching simulation**, not a historical incident
and not a production migration procedure.

## 8.2 Deterministic result

### DB dependency

Observed before: `APP@HOST_01 → localhost:3306`

After application starts on HOST 02: `localhost` now denotes HOST 02
from that process's perspective.

Result: `DB ACCESS: NOT PRESERVED BY APP MOVE`

Explanation: The source-backed connection assumption was local to the
application host. Moving the application does not make HOST 01's local
DB become HOST 02's `localhost`.

Do not say "install a remote DB," "replicate MySQL," etc.

### Image dependency

Observed before: `APP@HOST_01 → HOST_01 filesystem path`

After: the same observed file is not present on HOST 02 under the
experiment definition.

Result: `PRODUCT IMAGE READ: NOT PRESERVED BY APP MOVE`

Explanation: The image was evidenced on HOST 01's local disk. Moving
application execution alone does not move that file.

Do not recommend object storage/CDN/shared filesystem.

### Session dependency

Observed before: `Session → Tomcat process memory on HOST_01`

After: HOST 02 starts a different application process with no copy of
that existing in-memory object.

Result: `EXISTING SESSION STATE: NOT PRESERVED BY APP MOVE`

Explanation: Process memory is not automatically transferred across a
host boundary.

Do not recommend Redis/shared Session/session replication.

### DNS comparator

Result:
`ENTRY-STAGE CLASSIFICATION: NOT THE LOCAL STATE COUPLING UNDER TEST`

DNS is not "broken" by this experiment. It exists only to demonstrate
that not every dependency shown in the request journey is local
application state.

## 8.3 Result presentation

Use qualitative states, not invented performance metrics:

-   `PRESERVED`
-   `NOT PRESERVED`
-   `NOT THE LOCAL COUPLING UNDER TEST`

Never show invented milliseconds, throughput, outage duration, failure
percentages, cost, CPU, disk capacity, or connection counts.

## 8.4 Recovery

If dependency map was wrong:

> "Your experiment produced a result that does not match one or more
> placement judgments. Re-open the evidence and revise only the disputed
> dependencies."

The result panel highlights **which evidence conflicts with the player's
mark**, but does not auto-place all cards.

Example: \> "E04 was marked HOST 01-bound, but its inspected evidence
places the request-entry service outside HOST 01. Reconsider that
classification."

For an omitted/misclassified E01/E02/E03: \> "This dependency changed
when application execution crossed the host boundary. Which inspected
placement assumption explains that?"

Then return to `CLASSIFY` while preserving inspected evidence and
first-attempt scoring history.

------------------------------------------------------------------------

# 9. Causal explanation builder

The explanation is deterministic evidence-chip construction, not
free-form grading.

## 9.1 Required causal chain

Player assembles six concepts in causal order:

1.  `SHOP_WORKS_ON_HOST_01`
    -   "The current shop works while application and its local
        dependencies share HOST 01."
2.  `PLACEMENT_ASSUMPTIONS_EXIST`
    -   "Working behavior can rely on where data/state currently lives."
3.  `DB_LOCALHOST`
    -   "The DB connection assumes the database is local to the running
        application host."
4.  `IMAGE_LOCAL_DISK`
    -   "Product image bytes are read from HOST 01's local disk."
5.  `SESSION_PROCESS_MEMORY`
    -   "Existing Session state lives in Tomcat memory on HOST 01."
6.  `BOUNDARY_CHANGE_EXPOSES_COUPLING`
    -   "Moving application execution alone crosses the host boundary,
        so those local assumptions are no longer automatically
        satisfied."

## 9.2 Required evidence links

Before submit, the player must attach:

-   E01 → `DB_LOCALHOST`
-   E02 → `IMAGE_LOCAL_DISK`
-   E03 → `SESSION_PROCESS_MEMORY`
-   X01 result → `BOUNDARY_CHANGE_EXPOSES_COUPLING`

## 9.3 Explanation predicate

``` yaml
explanation_complete:
  required_concepts:
    - SHOP_WORKS_ON_HOST_01
    - PLACEMENT_ASSUMPTIONS_EXIST
    - DB_LOCALHOST
    - IMAGE_LOCAL_DISK
    - SESSION_PROCESS_MEMORY
    - BOUNDARY_CHANGE_EXPOSES_COUPLING
  required_order: true
  required_evidence_links:
    E01: DB_LOCALHOST
    E02: IMAGE_LOCAL_DISK
    E03: SESSION_PROCESS_MEMORY
    X01: BOUNDARY_CHANGE_EXPOSES_COUPLING
  final_dependency_map:
    E01: BOUND_TO_HOST_01
    E02: BOUND_TO_HOST_01
    E03: BOUND_TO_HOST_01
    E04: NOT_PROVEN_LOCAL
```

A player cannot complete by selecting correct vocabulary while retaining
a contradictory dependency map.

## 9.4 Optional reflection

After structured score:

> "What would you inspect first in a real application before moving it
> to another host?"

Free text is optional and **unscored**. Do not use an LLM to decide
correctness. The response may remain local/session-only or be discarded
on replay according to existing product conventions.

------------------------------------------------------------------------

# 10. Deterministic scoring

Total: **100 points**.

  ------------------------------------------------------------------------
  Category                                       Max Rule
  --------------------- ---------------------------- ---------------------
  Investigation                                   15 Evidence gate met
                                                     efficiently and
                                                     relevant evidence
                                                     inspected

  Dependency                                      30 7.5 each for
  classification                                     E01/E02/E03 local +
                                                     E04 non-local
                                                     comparator

  Prediction                                      15 5 each for
                                                     P01/P02/P03 correct
                                                     on first commit

  Experiment                                      15 Correctly reconciles
  interpretation                                     all three result
                                                     consequences with
                                                     evidence

  Causal explanation                              20 Ordered six-link
                                                     chain + required
                                                     evidence links +
                                                     consistent final map

  Investigation                                    5 No more than one
  efficiency                                         classification repair
                                                     and no repeated blind
                                                     commits
  ------------------------------------------------------------------------

## 10.1 Partial credit

### Investigation

-   all 5 evidence items inspected before classification: 15;
-   exactly 4 satisfying gate: 15;
-   gate satisfied only after returning from an incomplete attempt: 12;
-   cannot progress without gate.

Do not penalize a learner merely for inspecting all evidence.

### Dependency classification --- 30

Each final correct classification: 7.5.

First-attempt correctness is retained separately for feedback, but final
correctness is required to reach explanation.

### Prediction --- 15

Each first prediction: - correct: 5; - wrong then corrected by
reasoning/result: 3; - missing: 0.

### Experiment interpretation --- 15

5 each for correctly matching: - DB consequence ↔ `localhost`
placement; - image consequence ↔ local filesystem; - Session consequence
↔ process memory.

### Explanation --- 20

-   six concepts correct order: 12;
-   four required evidence links: 8.

If final map is inconsistent, explanation submission is blocked.

### Efficiency --- 5

-   0 classification repair cycles: 5;
-   1: 4;
-   2: 3;
-   3+: 2.

No score below 100 prevents completion once the final causal model is
correct.

## 10.2 Completion semantics

**Success:** final map correct + experiment run + causal explanation
valid.\
**Recoverable failure:** wrong
classifications/predictions/interpretations.\
**No terminal fail screen.**

A learner can always recover to completion.

------------------------------------------------------------------------

# 11. Replay/reset contract

`Replay M03` must restore exactly:

``` yaml
phase: OBSERVE
inspected_evidence: []
dependency_map:
  E01: UNCLASSIFIED
  E02: UNCLASSIFIED
  E03: UNCLASSIFIED
  E04: UNCLASSIFIED
predictions: {}
experiment_run: false
experiment_result_revealed: false
interpretations: {}
explanation_concepts: []
explanation_links: {}
reflection: ""
classification_repairs: 0
first_attempt_classifications: null
first_attempt_predictions: null
score: null
```

Replay must not preserve:

-   revealed local-assumption labels;
-   experiment consequences;
-   previous correct placements;
-   score;
-   answer-highlight CSS state;
-   prior reflection.

Source/provenance labels remain part of static mission content.

------------------------------------------------------------------------

# 12. Screen-by-screen storyboard

## Screen S01 --- Mission briefing / working shop

**Objective:** establish "working now" versus "safe across host
boundary" without revealing the dependencies.

**Fresh-player first notice:**\
**"SHOP HEALTHY"** beside the operations request **"Prove the
application can run on a replacement host."**

**Desktop:** left mission brief; centre HOST 01 running; HOST 02 empty;
right Evidence Case closed/available.

**Mobile:** vertical order: 1. mission/problem; 2. HOST 01 / HOST 02
compact cards; 3. evidence action.

**Controls:** `Inspect evidence`.

**State labels:** `CURRENT: HOST_01`, `LAB TARGET: HOST_02`,
`NO CHANGE RUN YET`.

**Empty/error:** none.

**No leakage:** no localhost/image/session labels.

**Keyboard/touch:** button is native; no hover-only information.

**Reduced motion:** no animated host pulse required; static status
badge.

**Screen reader:** heading announces mission and operational change
before controls.

------------------------------------------------------------------------

## Screen S02 --- Evidence Case

**Objective:** derive placement from evidence.

**First notice:** five neutral evidence IDs, not three answer labels.

**Desktop:** evidence grid + sticky "What are you trying to learn?"
panel: \> "Which dependencies silently rely on HOST 01?"

**Mobile:** one-column cards; inspected detail expands inline.

**Controls:** Inspect E01--E05; collapse detail; continue when gate
opens.

**State:** `INSPECTED n/5`; gate text: \> "Gather enough evidence to
make a placement judgment."

**Error/recovery:** attempting Continue early focuses gate message and
lists missing *evidence categories*, not answers: \> "Inspect deployment
context, a placement clue, runtime state, and an external comparator."

**No leakage:** closed labels remain neutral.

**Reduced motion:** expansion instant.

**Screen reader:** `aria-expanded`; provenance read after
observation/interpretation.

------------------------------------------------------------------------

## Screen S03 --- Dependency Board

**Objective:** classify dependencies.

**First notice:** two clear zones and four neutral tokens.

**Desktop:** HOST 01 silhouette behind `BOUND TO HOST_01`; external
boundary beside second zone.

**Mobile:** do not use side-by-side narrow drop targets. Render each
token with a two-option segmented placement control or select/move menu.

**Controls:** drag + click/tap alternative + keyboard selection.

**Error:** incomplete commit: \> "Classify all four inspected
dependencies before committing."

**Wrong choices:** accepted as hypothesis; do not reveal correctness.

**No leakage:** no green/red feedback before experiment.

**Reduced motion:** placement snaps; no animated flying token.

**Screen reader:** announce new classification after each move.

------------------------------------------------------------------------

## Screen S04 --- Prediction Lab

**Objective:** force causal predictions before reveal.

**First notice:** intervention statement: \> "Only application execution
moves to HOST 02."

A mini before/after diagram shows APP changing host, while other
resources are represented by neutral IDs at their observed locations.

**Controls:** P01--P03 radio groups; Commit predictions.

**Error:** missing prediction keeps commit disabled with visible reason.

**Wrong prediction:** accepted; no correctness reveal yet.

**No leakage:** result panel absent.

**Mobile:** one prediction group per card.

**Reduced motion:** before/after is two static frames.

**Screen reader:** intervention description precedes prediction groups.

------------------------------------------------------------------------

## Screen S05 --- Run host-boundary experiment

**Objective:** perform deterministic intervention.

**First notice:** `CHANGE: APP HOST ONLY`.

**Controls:** `Run host-boundary experiment`.

**During run:** if motion allowed, a short non-essential trace may
highlight APP@HOST_01 then APP@HOST_02. If reduced motion, transition
immediately to result.

**Error:** cannot run twice before interpretation.

**Teaching-simulation label:** permanently visible.

**No operational metrics.**

------------------------------------------------------------------------

## Screen S06 --- Result / reconcile

**Objective:** compare predictions and actual dependency consequences.

**First notice:** three qualitative result rows plus DNS comparator.

Rows initially reveal one at a time by explicit `Reveal next result`
action or all at once after `Reveal results`; implementation may choose
one, but result order must be deterministic: 1. DB; 2. images; 3.
Session; 4. DNS comparator.

**Result text:** `NOT PRESERVED` for three local assumptions;
`NOT LOCAL COUPLING UNDER TEST` for E04.

**Player action:** match each result to its evidence reason.

**Wrong match:** local feedback: \> "That evidence describes a different
kind of state/placement. Re-open the inspected observation."

**If dependency map wrong:** `Revise dependency map`.

**No future fix suggestions.**

**Mobile:** results as stacked cards.

**Screen reader:** result status is text, never color-only.

------------------------------------------------------------------------

## Screen S07 --- Causal explanation

**Objective:** express the dependency model.

**First notice:** prompt: \> "Why did a working shop become unsafe when
only the application crossed the host boundary?"

**Controls:** order six causal chips; attach evidence to four required
claims.

**Wrong order:** identify first broken causal transition only, not full
solution: \> "This claim uses a placement consequence before
establishing where that dependency lived."

**Keyboard:** select chip → Move up/down buttons; attach-evidence
dropdown/button.

**Touch:** tap + move controls; drag optional.

**Reduced motion:** no reorder animation.

**Screen reader:** each chip announces position, e.g. `3 of 6`.

------------------------------------------------------------------------

## Screen S08 --- Score / completion / reflection

**Objective:** consolidate without prescribing architecture.

**First notice:** \> **"Three local assumptions identified."**

Only now may the completion panel explicitly summarize:

-   DB endpoint/placement assumes local host;
-   product images live on local disk;
-   Session lives in Tomcat memory.

Then: \> "The shop was not 'wrong' on HOST 01. The experiment showed
that these assumptions are coupled to the current host boundary."

**Score:** category breakdown with partial-credit explanations.

**Reflection:** optional free text.

**Completion boundary:** no future-technology card, no solution
recommendation, no required next-mission button.

**Allowed closing hook:** \> "You now know what is coupled. This mission
does not decide how to redesign it."

------------------------------------------------------------------------

# 13. Misconceptions to challenge

  -----------------------------------------------------------------------
  Misconception                       M03 response
  ----------------------------------- -----------------------------------
  "If the shop works, it is           Working on one placement does not
  portable."                          prove independence from that
                                      placement.

  "Moving the application means its   Experiment separates executable
  data/state moves too."              placement from dependent
                                      resources/state.

  "Every dependency in the request    DNS comparator demonstrates
  path is local."                     otherwise.

  "localhost means the original       `localhost` is relative to the
  server wherever the app runs."      machine/process environment making
                                      the connection.

  "Session is just in the browser."   Source-backed mission evidence
                                      places server Session state in
                                      Tomcat memory.

  "Finding coupling means the         M01 already established the
  original design was bad."           single-node design as proportionate
                                      for its constraints.

  "Once coupling is found, choose the M03 stops before solution
  biggest distributed solution."      selection.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 14. Explicit M04 / M05 / M06 deferral

This section is an author/implementation boundary, not player-facing
lesson content.

## M04 content not taught here

Do not introduce a disk-full incident, disk-capacity telemetry, storage
exhaustion, capacity threshold, or storage remediation.

M03 may say "image bytes are on local disk" only to establish
**placement coupling**.

## M05 content not taught here

Do not introduce network outages, network latency diagnosis, packet
loss, remote-call reliability, bandwidth, topology redesign, or network
remediation.

M03's host-boundary experiment is an abstract deterministic placement
experiment. It is not a network-failure mission.

## M06 content not taught here

Do not introduce DB connection-pool exhaustion, connection limits,
concurrency/capacity telemetry, saturation, or connection scaling.

M03 may inspect the DB endpoint only to establish **localhost/local
placement**.

## Forbidden player-facing recommendations

Do not recommend or teach:

`Redis`, shared Session stores, load balancers, Kubernetes, containers,
microservices, queues, Kafka, database replicas, sharding, CDN, object
storage, distributed filesystems, autoscaling, or equivalent later
architecture solutions.

If any such strings are retained in author documentation, tests, or
boundary metadata, they must not enter the M03 player-facing runtime
message registry.

------------------------------------------------------------------------

# 15. Acceptance test plan

Stable IDs are mandatory.

## M03-T001 --- Fresh-player first notice

Given fresh state, within 10 seconds the player can identify: - shop
currently works; - HOST 02 is a replacement lab target; - task is to
investigate hidden host dependency.

Must **not** see the three answers.

**Capture:** `M03-T001-fresh-desktop.png`.

## M03-T002 --- No opening answer leakage

Runtime opening strings must not contain answer-revealing combinations
such as: - `localhost:3306`; - `local disk images`; -
`Session in Tomcat memory`; - a prefilled list of all three assumptions.

Mission title "Three Local Assumptions" is allowed.

## M03-T003 --- Evidence inspection provenance

Each E01--E05 reveals observation, interpretation, and provenance only
after inspection.

## M03-T004 --- Evidence gate

Verify:

``` text
minimum 4
AND E05
AND (E01 OR E02)
AND E03
AND E04
```

Examples: - E01+E03+E04 → locked; - E01+E03+E04+E05 → open; -
E02+E03+E04+E05 → open; - E01+E02+E03+E05 → locked because comparator
E04 absent.

## M03-T005 --- Classification requires all four

Commit blocked until E01--E04 each have a classification.

## M03-T006 --- Correct dependency map

Expected final map:

``` text
E01 BOUND_TO_HOST_01
E02 BOUND_TO_HOST_01
E03 BOUND_TO_HOST_01
E04 NOT_PROVEN_LOCAL
```

## M03-T007 --- Wrong classification does not reveal full answer

A wrong commit advances to prediction/experiment without immediately
painting all correct placements.

## M03-T008 --- Prediction-before-result

Experiment consequences must not be visible until P01--P03 are
committed.

## M03-T009 --- Deterministic DB boundary result

After X01, DB access is `NOT_PRESERVED` because `localhost` on HOST 02
no longer denotes the original HOST 01 local DB placement.

No future solution appears.

## M03-T010 --- Deterministic image boundary result

After X01, image read is `NOT_PRESERVED` because the observed file
remains on HOST 01.

## M03-T011 --- Deterministic Session boundary result

After X01, existing Session state is `NOT_PRESERVED` because the
observed state lives in HOST 01 Tomcat process memory.

## M03-T012 --- DNS comparator

E04/result must not be classified as one of the three local
state/resource assumptions.

## M03-T013 --- Wrong-map recovery

Player can return from result to classification with evidence retained;
first-attempt score history remains; no dead end.

## M03-T014 --- Explanation consistency

Completion blocked unless: - final dependency map is correct; - all six
causal concepts are present in order; - E01/E02/E03/X01 links are
correct.

## M03-T015 --- Deterministic score

Same action history produces same category scores and total.

## M03-T016 --- Replay reset

Replay restores the exact reset contract and hides all revealed
answers/results.

## M03-T017 --- No M02 latency reprise

No timing diagnosis, latency total, DNS-delay experiment, or
server-delay comparison is required for completion.

## M03-T018 --- M04/M05/M06 boundary

Player-facing runtime completion contains no: - disk-full/capacity
incident; - network-failure lesson; - DB connection-capacity lesson.

## M03-T019 --- Forbidden future solutions

Inspect the **player-facing M03 runtime message registry/fixtures
only**, not the entire storyboard/repository.

Forbidden recommendation patterns include player-facing
imperative/recommendation forms containing the later-solution terms
listed in §14, e.g.: - `use Redis`; - `add a load balancer`; -
`move images to object storage`; - `deploy Kubernetes`; -
`shard/replicate the database`.

Allowed occurrences: - author boundary documentation; - source-trace
notes; - test documentation explicitly asserting absence; - code
identifiers used only for forbidden-string tests.

Expected runtime boundary output: \> "You now know what is coupled. This
mission does not decide how to redesign it."

## M03-T020 --- Keyboard-only completion

Complete the entire mission without pointer drag: - evidence; -
classification; - predictions; - experiment; - reconciliation; -
explanation; - score/replay.

Capture recording: `M03-T020-keyboard.webm`.

## M03-T021 --- Real 390px viewport

At **390 CSS px**: - no critical horizontal page overflow; - all
evidence text readable; - no dependency classification requires drag; -
HOST 01/HOST 02 distinction remains understandable; - prediction groups
fit; - result statuses are text-visible; - explanation reorder controls
fit; - score and replay reachable.

Capture: - `M03-T021-390-evidence.png` - `M03-T021-390-classify.png` -
`M03-T021-390-result.png` - `M03-T021-390-explain.png`.

## M03-T022 --- Reduced motion

With `prefers-reduced-motion: reduce`: - no information depends on
movement; - host change becomes an immediate discrete state
transition; - results/scoring identical; - no auto-scrolling animation
required.

Recording: `M03-T022-reduced-motion.webm`.

## M03-T023 --- Screen reader semantics

Verify: - headings/regions; - inspected/collapsed state; - provenance; -
classification state; - prediction groups; - experiment intervention; -
result statuses; - explanation positions; - errors and completion
announcements.

No color-only local/non-local or pass/fail encoding.

## M03-T024 --- Touch path

At mobile viewport, complete with tap controls only. Drag is optional.

## M03-T025 --- Source/simulation labels

Host IDs, experiment and qualitative result must be identifiable as
fiction/simulation; the three underlying local assumptions must be
identifiable as source-backed.

## M03-T026 --- No next-mission requirement

M03 completion must not depend on a next-mission button or M04 route.

------------------------------------------------------------------------

# 16. Implementation handoff --- data contract

This is a data-oriented proposal, not application code.

``` yaml
mission:
  id: M03
  title: Find the Three Local Assumptions
  act: ACT_I_ONE_MACHINE_FIRST_LIMITS
  scope: M03_ONLY

source:
  repository: ccc115a/se
  path: _more/mybook/向淘寶學習網站架構演進/1.1.md
  blob_sha: 9ddbabbd0fe6693b7c8c60479f0c2f37803233fd
  source_register: docs/architecture-evolution-lab/SOURCE_REGISTER.md

continuity:
  prerequisite_concepts:
    - M01_SINGLE_NODE_IS_RATIONAL_START
    - M02_REQUEST_PATH
  m02_implementation_commit: 778248c
  m02_implementation_correctness: PASS
  m02_full_verification: CONDITIONAL_PASS
  m02_open_verification:
    - REAL_390PX
    - REDUCED_MOTION
    - SCREEN_READER

provenance_types:
  - SOURCE_BACKED
  - FICTIONAL_SCENARIO
  - TEACHING_SIMULATION

states:
  - OBSERVE
  - INVESTIGATE
  - CLASSIFY
  - PREDICT
  - EXPERIMENT_READY
  - EXPERIMENT_RESULT
  - EXPLAIN
  - COMPLETE

evidence:
  E01:
    neutral_label: Connection settings
    reveals: DB_HOST_LOCALHOST_3306
    provenance: SOURCE_BACKED
    expected_classification: BOUND_TO_HOST_01
  E02:
    neutral_label: Product asset trace
    reveals: IMAGE_FILE_ON_HOST_01_DISK
    provenance: SOURCE_BACKED
    expected_classification: BOUND_TO_HOST_01
  E03:
    neutral_label: Browser state trace
    reveals: SESSION_IN_TOMCAT_MEMORY_HOST_01
    provenance: SOURCE_BACKED
    expected_classification: BOUND_TO_HOST_01
  E04:
    neutral_label: Request entry trace
    reveals: DNS_EXTERNAL_REQUEST_STAGE
    provenance: SOURCE_BACKED
    expected_classification: NOT_PROVEN_LOCAL
  E05:
    neutral_label: Deployment package
    reveals: APP_CODE_MOVE_DOES_NOT_PROVE_DEPENDENT_STATE_MOVE
    provenance: TEACHING_SIMULATION
    classification_required: false

required_evidence:
  minimum_count: 4
  mandatory: [E05, E03, E04]
  one_of: [E01, E02]
  unlock_predicate: >
    inspected_count >= 4
    AND inspected(E05)
    AND (inspected(E01) OR inspected(E02))
    AND inspected(E03)
    AND inspected(E04)

classification:
  required_items: [E01, E02, E03, E04]
  allowed_values:
    - UNCLASSIFIED
    - BOUND_TO_HOST_01
    - NOT_PROVEN_LOCAL
  correct:
    E01: BOUND_TO_HOST_01
    E02: BOUND_TO_HOST_01
    E03: BOUND_TO_HOST_01
    E04: NOT_PROVEN_LOCAL
  commit_requires_all_classified: true
  reveal_correctness_before_experiment: false

predictions:
  P01:
    dependency: E01
    correct: TARGET_NO_LONGER_MEANS_HOST_01
  P02:
    dependency: E02
    correct: HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE
  P03:
    dependency: E03
    correct: EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02
  commit_requires: [P01, P02, P03]

experiment:
  id: X01_MOVE_APP_EXECUTION
  provenance: TEACHING_SIMULATION
  intervention:
    move_app: HOST_01_TO_HOST_02
    preserve_observed_resource_placements: true
  results:
    E01: NOT_PRESERVED
    E02: NOT_PRESERVED
    E03: NOT_PRESERVED
    E04: NOT_LOCAL_COUPLING_UNDER_TEST
  numeric_metrics: forbidden
  deterministic: true

explanation:
  required_order:
    - SHOP_WORKS_ON_HOST_01
    - PLACEMENT_ASSUMPTIONS_EXIST
    - DB_LOCALHOST
    - IMAGE_LOCAL_DISK
    - SESSION_PROCESS_MEMORY
    - BOUNDARY_CHANGE_EXPOSES_COUPLING
  required_links:
    E01: DB_LOCALHOST
    E02: IMAGE_LOCAL_DISK
    E03: SESSION_PROCESS_MEMORY
    X01: BOUNDARY_CHANGE_EXPOSES_COUPLING
  require_final_map_correct: true
  free_text_reflection:
    enabled: true
    scored: false

scoring:
  max: 100
  investigation: 15
  classification: 30
  prediction: 15
  experiment_interpretation: 15
  causal_explanation: 20
  efficiency: 5
  deterministic: true

completion:
  reveal_term: THREE_LOCAL_ASSUMPTIONS
  reveal_items:
    - DB_LOCALHOST
    - IMAGE_LOCAL_DISK
    - SESSION_TOMCAT_MEMORY
  closing_boundary: >
    You now know what is coupled. This mission does not decide how to redesign it.
  next_mission_button_required: false

do_not_teach_yet:
  - DISK_FULL_CAPACITY_INCIDENT
  - NETWORK_FAILURE_LESSON
  - DB_CONNECTION_CAPACITY
  - REDIS
  - SHARED_SESSION_STORE
  - LOAD_BALANCER
  - KUBERNETES
  - CONTAINERS
  - MICROSERVICES
  - QUEUES
  - KAFKA
  - DB_REPLICATION
  - DB_SHARDING
  - CDN
  - OBJECT_STORAGE
  - DISTRIBUTED_FILESYSTEM
  - AUTOSCALING

test_ids:
  - M03-T001
  - M03-T002
  - M03-T003
  - M03-T004
  - M03-T005
  - M03-T006
  - M03-T007
  - M03-T008
  - M03-T009
  - M03-T010
  - M03-T011
  - M03-T012
  - M03-T013
  - M03-T014
  - M03-T015
  - M03-T016
  - M03-T017
  - M03-T018
  - M03-T019
  - M03-T020
  - M03-T021
  - M03-T022
  - M03-T023
  - M03-T024
  - M03-T025
  - M03-T026
```

------------------------------------------------------------------------

# 17. Reviewer checklist

A reviewer should reject the implementation if any answer is **No**.

### Source fidelity

-   [ ] Are E01, E02 and E03 grounded in section 1.1?
-   [ ] Is Atlas Market clearly fictional?
-   [ ] Is X01 clearly teaching simulation?
-   [ ] Are there no invented historical operational metrics/incidents?

### Gameplay

-   [ ] Does the player investigate before seeing the answer?
-   [ ] Must the player classify rather than simply press "show
    assumptions"?
-   [ ] Is E04 a meaningful non-local comparator?
-   [ ] Are wrong classifications recoverable?
-   [ ] Must predictions be committed before experiment results?
-   [ ] Does X01 produce deterministic causal evidence?
-   [ ] Must final explanation agree with the final dependency map?

### Answer leakage

-   [ ] Are E01--E03 labels neutral before inspection?
-   [ ] Does the opening avoid listing the three answers?
-   [ ] Is the phrase-level completion reveal delayed until after
    investigation/experiment?
-   [ ] Are wrong choices not instantly replaced with the full correct
    map?

### Scope

-   [ ] Is M02 latency diagnosis not repeated as the central mechanic?
-   [ ] Is disk-full/capacity content absent?
-   [ ] Is network-failure content absent?
-   [ ] Is connection-capacity content absent?
-   [ ] Are future architecture solutions absent from the player-facing
    completion loop?
-   [ ] Is no M04+ route/button required for M03 completion?

### Accessibility / verification

-   [ ] Is drag optional?
-   [ ] Can keyboard-only complete every interaction?
-   [ ] Does real 390px QA exist?
-   [ ] Does reduced-motion QA exist?
-   [ ] Does screen-reader QA exist?
-   [ ] Are statuses not color-only?
-   [ ] Is replay verified clean?

------------------------------------------------------------------------

# 18. Required implementation evidence captures

After implementation, preserve:

``` text
M03-T001-fresh-desktop.png
M03-T006-correct-map-desktop.png
M03-T007-wrong-map-no-answer-leak.png
M03-T009-db-result.png
M03-T010-image-result.png
M03-T011-session-result.png
M03-T013-recovery.png
M03-T014-explanation.png
M03-T020-keyboard.webm
M03-T021-390-evidence.png
M03-T021-390-classify.png
M03-T021-390-result.png
M03-T021-390-explain.png
M03-T022-reduced-motion.webm
M03-T023-screen-reader-notes.md
M03-T024-touch-path.webm
M03-T016-replay-reset.png
```

------------------------------------------------------------------------

# 19. Open questions

**None requiring human approval before implementation.**

The source and orchestration contract already settle:

-   the three required local assumptions;
-   the M03 learning boundary;
-   the need for evidence-first discovery;
-   deterministic host-boundary testing;
-   no future-solution recommendation;
-   accessibility/mobile verification requirements;
-   M04/M05/M06 deferral.

Implementation may choose cosmetic layout details provided the
acceptance predicates and no-leakage rules remain unchanged.

------------------------------------------------------------------------

# 20. Change log

## v1

Initial M03 storyboard.

-   Locked scope to **M03 --- Find the Three Local Assumptions** only.
-   Traced all three required assumptions to source section 1.1 / blob
    `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`.
-   Preserved Atlas Market fiction and teaching-simulation boundaries.
-   Designed evidence-first classification with neutral card labels and
    a DNS comparator.
-   Added a deterministic application-host-boundary experiment without
    operational telemetry.
-   Added recoverable wrong classification and prediction paths.
-   Added a structured causal explanation builder with evidence links.
-   Added deterministic 100-point scoring and exact replay contract.
-   Added stable acceptance tests `M03-T001`--`M03-T026`.
-   Explicitly retained M02's open 390px/reduced-motion/screen-reader
    verification debt.
-   Explicitly deferred M04 disk-capacity, M05 network, M06
    connection-capacity, and all later solution technologies.
-   Required no next-mission button and provided no M04+ storyboard
    content.

