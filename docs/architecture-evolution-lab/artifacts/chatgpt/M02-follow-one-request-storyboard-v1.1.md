# M02 --- Follow One Request

## Architecture Evolution Lab --- Storyboard / Content Design v1.1

> **Artifact type:** Mission storyboard / implementation contract, not
> application code.\
> **Scope:** M02 only. M03+ is explicitly deferred.\
> **Locked mission contract:** **A customer says the site feels slow,
> but the cause is unknown.** The player traces and measures one
> request, distinguishes DNS delay from server/application delay with a
> controlled experiment, identifies the actual slow segment, and learns
> that diagnosis must precede architecture change.

------------------------------------------------------------------------

# 1. Mission header

  ----------------------------------------------------------------------------------
  Field                               Value
  ----------------------------------- ----------------------------------------------
  Mission ID                          `M02`

  Title                               **Follow One Request**

  Act / chapter                       Act I --- One Machine, First Limits

  Primary source                      `ccc115a/se` →
                                      `_more/mybook/向淘寶學習網站架構演進/1.1.md`

  Exact source blob SHA               `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`

  Intended learner                    Beginner--intermediate

  Estimated play time                 10--14 min first run; 4--6 min replay

  Prerequisite                        M01 establishes the current single-host shop

  Learning objective                  **A "slow site" symptom can originate at
                                      different request layers; trace and measure
                                      the request, use a controlled experiment, and
                                      diagnose the responsible segment before
                                      proposing architecture change.**
  ----------------------------------------------------------------------------------

## 1.1 Player promise

> **"A customer says Atlas Market feels slow. You will follow one
> request, measure where its time is spent, run a controlled experiment,
> and prove whether the delay comes before the server or inside the
> server/application path."**

The player must make diagnostic commitments before seeing experimental
results.

------------------------------------------------------------------------

# 2. Locked playable loop

M02 must implement this exact learning loop:

``` text
OBSERVE
customer reports "slow" + baseline trace

→ INVESTIGATE
inspect request stages and measured timing evidence

→ EXPLAIN
commit to the suspected responsible layer/slow segment

→ PREDICT
state what should change under a controlled DNS or server-delay experiment

→ RUN
execute deterministic comparison condition

→ REVEAL
compare measured baseline and experiment

→ SCORE
diagnosis + causal reasoning + prediction + evidence use

→ REFLECT
optional unscored reflection
```

This is not a monitoring dashboard. At four points the player must act:

1.  order the request journey;
2.  identify the suspected slow segment;
3.  predict an experimental outcome;
4.  interpret measured before/after evidence.

------------------------------------------------------------------------

# 3. Source / fiction / teaching-simulation boundary

Every mission datum is one of three provenance classes.

## `SOURCE_BACKED`

Section 1.1 supports:

-   browser performs DNS resolution before connecting to Tomcat;
-   browser may use a DNS cache, otherwise DNS resolution proceeds
    through configured resolver infrastructure;
-   DNS returns the host IP;
-   browser then sends HTTP to the single host/Tomcat;
-   Tomcat parses/handles HTTP and invokes application logic;
-   application uses JDBC to read/write local MySQL;
-   HTML/response returns to the browser;
-   the source explicitly asks what a slow or polluted DNS step would
    look like and whether that is a Tomcat problem.

## `FICTIONAL_SCENARIO`

Invented only for Atlas Market gameplay:

-   customer;
-   request ID;
-   product ID/name;
-   support dialogue;
-   exact incident;
-   trace timestamp.

These are not Taobao history.

## `TEACHING_SIMULATION`

All measured latency values and controlled-condition effects:

-   DNS ms;
-   HTTP-connect ms;
-   Tomcat-processing ms;
-   JDBC-query ms;
-   response-transfer ms;
-   total request ms;
-   experimental delay values;
-   scoring weights;
-   incident selection.

Every timing display must carry a visible `LAB TIMING` / `SIMULATION`
label or equivalent.

**No timing value in this artifact is a historical or production
measurement.**

------------------------------------------------------------------------

# 4. Source traceability

  ------------------------------------------------------------------------------------------------------------
  Claim / mechanic   Provenance            Section 1.1 basis                                 M02 use
  ------------------ --------------------- ------------------------------------------------- -----------------
  DNS precedes       SOURCE_BACKED         DNS-flow section                                  Required first
  connection to                                                                              stage
  Tomcat                                                                                     

  DNS maps domain to SOURCE_BACKED         "域名翻譯成唯一的 IP"                             DNS timing
  IP                                                                                         segment

  Browser sends HTTP SOURCE_BACKED         DNS step 4                                        HTTP connection
  after address                                                                              segment
  resolution                                                                                 

  Tomcat handles     SOURCE_BACKED         Tomcat request section                            Server processing
  HTTP/application                                                                           segment
  work                                                                                       

  Application uses   SOURCE_BACKED         Tomcat request journey / Servlet example          JDBC query
  JDBC with MySQL                                                                            segment

  Response returns   SOURCE_BACKED         "再把 HTML 吐回去"                                Final response
  to browser                                                                                 segment

  DNS slowness can   SOURCE_BACKED         "DNS                                              Central
  look like site                           解析的每一步如果變慢...使用者會看到什麼現象？跟   diagnostic
  slowness                                 Tomcat 有關係嗎？"                                contrast

  Exact Atlas        FICTIONAL_SCENARIO    none                                              Playable story
  incident                                                                                   

  Exact latency      TEACHING_SIMULATION   none                                              Deterministic
  numbers                                                                                    measurement

  Controlled         TEACHING_SIMULATION   source supplies causal layers, not experiment     Diagnostic
  DNS/server delay                         values                                            experiment

  Scores             TEACHING_SIMULATION   none                                              Deterministic
                                                                                             assessment
  ------------------------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 5. Story setup

## 5.1 Fictional incident

Customer **Mina Rao** reports:

> "The product page eventually loads, but today it feels slow."

Support character Maya says:

> "We know the symptom. We don't know the layer. Don't redesign anything
> yet --- follow one request."

Request:

``` text
REQ-M02-184-A
GET https://shop.atlas.test/item?id=184
```

Product/customer/request identifiers are fictional.

## 5.2 Critical narrative rule

No character says:

-   "DNS is slow";
-   "Tomcat is slow";
-   "the database is slow";
-   "scale the server";
-   or any equivalent answer

before the player commits to a diagnosis.

------------------------------------------------------------------------

# 6. Request model

M02 measures five diagnostic segments.

``` yaml
stage_order:
  - DNS_RESOLUTION
  - HTTP_CONNECTION
  - TOMCAT_PROCESSING
  - JDBC_MYSQL_QUERY
  - RESPONSE
```

Human-readable:

``` text
Browser
  ↓
DNS resolution
  ↓
HTTP connection to Tomcat
  ↓
Tomcat/application processing
  ↓
JDBC query to MySQL
  ↓
response to browser
```

## Teaching simplification

This five-segment trace is an educational decomposition of the source
request journey. It is not a claim that all real web timing tools
universally divide requests into these exact five buckets.

M02 may mention that the product page uses the current shop's existing
resources, but it must **not investigate or score the three local
assumptions**. Local DB/image/Session placement belongs to later
curriculum.

------------------------------------------------------------------------

# 7. Deterministic incident data

The canonical M02 incident is a **DNS-delay incident**. The answer is
hidden until commitment/experiment.

## 7.1 Reference healthy condition

All values below are `TEACHING_SIMULATION`.

  Segment               Healthy lab value
  ------------------- -------------------
  DNS resolution                    20 ms
  HTTP connection                   30 ms
  Tomcat processing                 90 ms
  JDBC/MySQL query                  70 ms
  Response                          40 ms
  **Total**                    **250 ms**

## 7.2 Incident baseline

  Segment               Baseline incident
  ------------------- -------------------
  DNS resolution               **420 ms**
  HTTP connection                   30 ms
  Tomcat processing                 90 ms
  JDBC/MySQL query                  70 ms
  Response                          40 ms
  **Total**                    **650 ms**

The UI initially shows the total `650 ms` and stage markers, but **does
not immediately reveal the complete stage timing table**.

The player must inspect evidence to unlock segment measurements.

## 7.3 Controlled experiments

Two experiment cards exist so the player can reason about both layers.

### X01 --- DNS-delay control

Teaching simulation:

``` yaml
condition: DNS_DELAY_CONTROL
DNS_RESOLUTION: 820
HTTP_CONNECTION: 30
TOMCAT_PROCESSING: 90
JDBC_MYSQL_QUERY: 70
RESPONSE: 40
TOTAL: 1050
```

Interpretation:

> Only DNS was deliberately changed; downstream server/application
> timings remain fixed.

### X02 --- Server-processing-delay control

Teaching simulation:

``` yaml
condition: SERVER_DELAY_CONTROL
DNS_RESOLUTION: 20
HTTP_CONNECTION: 30
TOMCAT_PROCESSING: 490
JDBC_MYSQL_QUERY: 70
RESPONSE: 40
TOTAL: 650
```

Interpretation:

> Only Tomcat/application processing was deliberately changed; DNS
> remains healthy.

The same `650 ms` total can therefore be produced by two different layer
profiles.

This is the central teaching contrast.

------------------------------------------------------------------------

# 8. Why two controlled conditions matter

The player must learn:

``` text
"650 ms total"
does NOT imply
"the server is slow"
```

Canonical comparison:

``` text
DNS-delay incident:
420 + 30 + 90 + 70 + 40 = 650 ms

server-delay control:
20 + 30 + 490 + 70 + 40 = 650 ms
```

Same symptom/total, different cause.

The mission therefore rewards **segment evidence**, not total latency
alone.

------------------------------------------------------------------------

# 9. Evidence

## E01 --- Customer symptom

> Product page total: **650 ms LAB TIMING**. Customer reports "slow."

Interpretation:

> Total time proves the symptom but not the responsible layer.

Provenance: fictional report + simulated timing.

## E02 --- Request ordering clue

> The browser must obtain an address before it can make the HTTP
> connection to Tomcat.

Provenance: SOURCE_BACKED.

## E03 --- Server path clue

> Once HTTP reaches Tomcat, application work can use JDBC to query MySQL
> before the response is produced.

Provenance: SOURCE_BACKED.

## E04 --- Baseline segment probe

On inspection, reveals:

``` text
DNS             420 ms
HTTP connect     30 ms
Tomcat           90 ms
JDBC/MySQL       70 ms
Response         40 ms
```

All visibly marked `LAB TIMING`.

Provenance: TEACHING_SIMULATION over source-backed stages.

## E05 --- Diagnostic principle

> A delay before Tomcat receives the request is not automatically
> Tomcat/application processing time.

Provenance: source-backed causal distinction; does not state which stage
is slow in this incident.

------------------------------------------------------------------------

# 10. Evidence gate

``` yaml
required_evidence:
  minimum_count: 3
  mandatory: [E01, E02]
  one_of: [E03, E04, E05]
  unlock_predicate: >
    inspected_count >= 3
    AND inspected(E01)
    AND inspected(E02)
    AND (inspected(E03) OR inspected(E04) OR inspected(E05))
```

This unlocks the request-ordering interaction.

E04 is required later before the player may submit the slow-segment
diagnosis.

------------------------------------------------------------------------

# 11. Playable request-order mechanic

Five unordered cards:

``` text
DNS RESOLUTION
HTTP CONNECTION
TOMCAT PROCESSING
JDBC / MYSQL QUERY
RESPONSE
```

Canonical order:

``` yaml
canonical_stage_order:
  - DNS_RESOLUTION
  - HTTP_CONNECTION
  - TOMCAT_PROCESSING
  - JDBC_MYSQL_QUERY
  - RESPONSE
```

Desktop: horizontal timeline.

Mobile: vertical timeline.

Keyboard and touch alternatives are mandatory; drag is optional.

## Recoverable wrong path examples

### WP01 --- HTTP before DNS

Feedback:

> "In this lab request the browser has no usable cached address yet.
> What must happen before it knows where to connect?"

### WP02 --- JDBC before Tomcat

Feedback:

> "Who issues the JDBC query in this source architecture --- the
> customer's browser, or application logic after HTTP reaches Tomcat?"

### WP03 --- Response before query

Feedback:

> "Your response is leaving before the product data step has completed."

No feedback displays the whole correct route.

------------------------------------------------------------------------

# 12. Baseline trace

After correct ordering, the player runs:

> **Measure baseline request**

Trace progresses manually through the five stages.

Initially the timeline shows stage names, then reveals each simulated
measurement as the request advances.

At completion:

``` text
TOTAL: 650 ms — LAB TIMING
```

The game asks:

> **Which segment is the strongest suspect in this actual incident?**

Choices:

-   DNS resolution
-   HTTP connection
-   Tomcat processing
-   JDBC/MySQL query
-   Response
-   Total alone is enough to blame the server

Correct diagnosis for canonical incident: `DNS_RESOLUTION`.

The player must commit before experiments reveal comparative results.

------------------------------------------------------------------------

# 13. Diagnosis commitment

``` yaml
diagnosis:
  id: D01_SLOW_SEGMENT
  requires:
    - baseline_trace_complete
    - inspected(E04)
  options:
    - DNS_RESOLUTION
    - HTTP_CONNECTION
    - TOMCAT_PROCESSING
    - JDBC_MYSQL_QUERY
    - RESPONSE
    - TOTAL_BLAMES_SERVER
  canonical: DNS_RESOLUTION
  commit_before_experiment: true
```

Wrong diagnosis is permitted and recoverable.

The game records first diagnosis for scoring, but does not immediately
say "correct/incorrect".

Neutral commitment copy:

> **Diagnosis recorded. Now design a comparison that could support or
> challenge it.**

------------------------------------------------------------------------

# 14. Prediction before experiment

The player chooses one of two controlled experiment cards:

``` text
X01 Add DNS-only delay
X02 Add Tomcat-processing-only delay
```

Before Run, the player must predict what will happen.

## For X01

Required prediction choices:

1.  DNS timing changes; server/application segments stay approximately
    the same. **Correct**
2.  Tomcat timing must rise because total time rises.
3.  JDBC timing must rise whenever DNS is slower.

## For X02

Required prediction choices:

1.  Tomcat-processing timing changes; DNS stays approximately the same.
    **Correct**
2.  DNS must rise because the whole site feels slower.
3.  All segments rise together.

No result is shown until prediction is committed.

------------------------------------------------------------------------

# 15. Experiment execution

The player must run **at least one controlled experiment**, producing at
least two comparable runs:

``` text
baseline + X01
or
baseline + X02
```

For full experimental-reasoning credit, the player runs **both** X01 and
X02.

## 15.1 X01 result

``` text
BASELINE             DNS CONTROL
DNS       420 ms  →  820 ms
HTTP       30 ms  →   30 ms
Tomcat     90 ms  →   90 ms
JDBC       70 ms  →   70 ms
Response   40 ms  →   40 ms
TOTAL     650 ms  → 1050 ms
```

Reveal:

> "Changing DNS changed the pre-server segment without changing
> Tomcat/JDBC timings."

## 15.2 X02 result

``` text
HEALTHY REFERENCE     SERVER CONTROL
DNS        20 ms  →   20 ms
HTTP       30 ms  →   30 ms
Tomcat     90 ms  →  490 ms
JDBC       70 ms  →   70 ms
Response   40 ms  →   40 ms
TOTAL     250 ms  →  650 ms
```

Reveal:

> "A server-processing delay can produce the same 650 ms total while DNS
> remains healthy."

This makes the distinction observable rather than lectured.

------------------------------------------------------------------------

# 16. Final evidence comparison

After ≥1 experiment:

> **Revisit the actual incident. Which segment is responsible for its
> extra delay?**

Player selects a segment and must select evidence:

-   baseline segment measurement;
-   controlled experiment result;
-   causal layer statement.

Correct:

``` text
Actual incident slow segment = DNS_RESOLUTION
```

Required explanation distinction:

> DNS latency occurs before the HTTP request reaches Tomcat;
> Tomcat/application latency occurs after the server receives the
> request. A slow total alone cannot distinguish them.

------------------------------------------------------------------------

# 17. Causal explanation builder

Structured, deterministic, scored.

Player assembles:

### SYMPTOM

`The customer experiences a 650 ms page request`

### ORDER

`DNS occurs before the HTTP connection to Tomcat`

### BASELINE EVIDENCE

`DNS consumes 420 ms in the incident`

### EXPERIMENT

Either:

`changing DNS changes DNS/total without changing Tomcat/JDBC`

or:

`changing Tomcat processing can reproduce the same total while DNS stays healthy`

### DIAGNOSIS

`the actual incident's slow segment is DNS resolution`

### PRINCIPLE

`same visible symptom can originate in different request layers`

### ACTION RULE

`diagnose the layer before changing architecture`

## Submission predicate

``` yaml
explanation_required:
  mandatory:
    - SYMPTOM_650
    - DNS_BEFORE_HTTP
    - BASELINE_DNS_420
    - INCIDENT_DNS_DIAGNOSIS
    - SAME_SYMPTOM_DIFFERENT_LAYER
    - DIAGNOSE_BEFORE_ARCHITECTURE_CHANGE
  experiment_evidence:
    minimum_count: 1
    allowed:
      - DNS_CONTROL_ISOLATES_DNS
      - SERVER_CONTROL_ISOLATES_TOMCAT
  unlock_predicate: >
    all_mandatory_selected
    AND experiment_evidence_count >= 1
    AND experiment_runs >= 1
```

Optional free text comes after scoring.

------------------------------------------------------------------------

# 18. Scoring

Total: **100**

  ------------------------------------------------------------------------
  Category                                       Max Deterministic rule
  --------------------- ---------------------------- ---------------------
  Investigation                                   15 15 if evidence gate
                                                     reached with exactly
                                                     3 unique inspections
                                                     and E04 inspected
                                                     before diagnosis; 12
                                                     for 4; 10 for 5

  Request ordering                                20 20 first-valid; 16
                                                     after 1 repair; 12
                                                     after 2; 8 after 3+

  Baseline diagnosis                              20 20 if first committed
                                                     diagnosis is DNS; 12
                                                     after one wrong
                                                     diagnosis; 8 after 2+

  Experimental                                    15 15 correct first
  prediction                                         prediction; 10 second
                                                     attempt; 6 after 2+

  Controlled comparison                           15 15 both experiments
                                                     run/interpreted; 12
                                                     one experiment
                                                     correctly interpreted

  Causal explanation                              15 15 complete
                                                     structured
                                                     explanation; partial
                                                     values below
  ------------------------------------------------------------------------

## Causal explanation partial scoring

``` yaml
causal_explanation:
  symptom_and_order: 3
  baseline_evidence: 3
  experiment_evidence: 3
  correct_incident_layer: 3
  diagnosis_before_change_principle: 3
```

## Completion

No minimum numeric score.

Required:

``` yaml
mission_complete_if:
  route_validated: true
  baseline_trace_complete: true
  diagnosis_committed: true
  experiment_runs: ">= 1"
  experiment_prediction_committed: true
  final_slow_segment_identified: true
  explanation_unlock_predicate: true
```

Mistakes reduce score but do not create game-over.

------------------------------------------------------------------------

# 19. State machine

``` yaml
initial_state: OBSERVE

states:
  - OBSERVE
  - INVESTIGATE
  - ROUTE_BUILD
  - ROUTE_REPAIR
  - BASELINE_TRACE
  - DIAGNOSE
  - PREDICT
  - EXPERIMENT_RUN
  - RESULT_REVEAL
  - FINAL_DIAGNOSIS
  - EXPLAIN
  - SCORE
  - REFLECT
  - COMPLETE

transitions:
  OBSERVE:
    inspect_evidence: INVESTIGATE

  INVESTIGATE:
    if_evidence_gate_true: ROUTE_BUILD

  ROUTE_BUILD:
    submit_valid_route: BASELINE_TRACE
    submit_invalid_route: ROUTE_REPAIR

  ROUTE_REPAIR:
    repair: ROUTE_BUILD

  BASELINE_TRACE:
    final_stage_measured: DIAGNOSE

  DIAGNOSE:
    commit_diagnosis: PREDICT

  PREDICT:
    choose_experiment_and_commit_prediction: EXPERIMENT_RUN

  EXPERIMENT_RUN:
    finish_controlled_run: RESULT_REVEAL

  RESULT_REVEAL:
    run_second_experiment: PREDICT
    continue: FINAL_DIAGNOSIS

  FINAL_DIAGNOSIS:
    identify_slow_segment: EXPLAIN

  EXPLAIN:
    if_explanation_complete: SCORE

  SCORE:
    continue: REFLECT

  REFLECT:
    skip_or_submit: COMPLETE

  COMPLETE:
    replay: OBSERVE
```

------------------------------------------------------------------------

# 20. Screen-by-screen storyboard

## S01 --- Slow-site report / OBSERVE

First notice:

> **"The page feels slow."**

Below:

``` text
REQ-M02-184-A
Total observed: 650 ms
LAB TIMING
Cause: UNKNOWN
```

Primary action: `Inspect request`

No slow segment is highlighted.

Mobile: request card first; provenance legend directly below.

Reduced motion: no auto-moving packet.

------------------------------------------------------------------------

## S02 --- Evidence / INVESTIGATE

Evidence cards E01--E05.

Visible gate:

> `Inspect ≥3 · E01 + E02 required`

Stage measurements are not all dumped into a dashboard. E04 must be
intentionally inspected to obtain baseline segment timing.

Keyboard: evidence cards are buttons with pressed/inspected state.

------------------------------------------------------------------------

## S03 --- Order the journey

Unordered five cards.

Desktop: horizontal numbered slots.

390px mobile: vertical slots.

Controls must support:

-   tap card → tap slot;
-   keyboard select/move;
-   optional drag/drop.

Wrong routes receive local feedback only.

------------------------------------------------------------------------

## S04 --- Baseline trace

Manual `Advance measurement`.

Each stage reveals:

-   stage name;
-   source-role description;
-   `LAB TIMING`;
-   measured value.

Final view:

``` text
650 ms total
Cause still not declared
```

Primary action: `Make diagnosis`.

------------------------------------------------------------------------

## S05 --- Commit diagnosis

Player sees measured five-segment baseline and chooses suspected slow
segment.

No correctness marker yet.

After commit:

> "Recorded. Now test whether your explanation behaves as predicted."

------------------------------------------------------------------------

## S06 --- Choose experiment + PREDICT

Two cards:

-   `Add DNS-only delay`
-   `Add Tomcat-processing-only delay`

Each explicitly says `LAB CONTROL`.

Player selects experiment and prediction before Run activates.

------------------------------------------------------------------------

## S07 --- RUN experiment

Manual trace or controlled measurement animation.

Important: no result is known until Run.

Reduced motion: stage table updates discretely; animation
optional/nonessential.

------------------------------------------------------------------------

## S08 --- REVEAL comparison

Side-by-side desktop; stacked mobile.

Must emphasize **changed segment vs unchanged segments**, not just
total.

Example:

``` text
DNS 420 → 820  CHANGED
Tomcat 90 → 90 UNCHANGED
JDBC 70 → 70   UNCHANGED
```

Player may run second experiment.

------------------------------------------------------------------------

## S09 --- Identify actual slow segment

Return to actual incident.

Question:

> "Given the baseline and controlled evidence, which segment explains
> the actual incident?"

Requires segment selection + evidence selection.

Wrong answer:

> "That layer can make a site slow, but compare its measured value in
> the actual incident with the controlled runs."

No answer auto-fill.

------------------------------------------------------------------------

## S10 --- Causal explanation

Seven concept groups from section 17.

Mobile: vertical chain.

Screen must visibly separate:

``` text
BEFORE SERVER
DNS

SERVER / APPLICATION PATH
HTTP → Tomcat → JDBC/MySQL → response
```

This distinction is conceptual, not an infrastructure redesign.

------------------------------------------------------------------------

## S11 --- SCORE

Show six scoring categories.

Key feedback:

> **Same symptom, different possible layer. You diagnosed before
> changing architecture.**

If initial diagnosis was wrong:

> "Your first diagnosis was different, but the controlled comparison let
> you correct it."

------------------------------------------------------------------------

## S12 --- REFLECT / COMPLETE

Optional:

> "What evidence would you ask for first next time someone only says
> 'the site is slow'?"

Unscored.

Completion boundary:

> **A latency symptom is not an architecture diagnosis. First locate the
> slow segment in the request path.**

No next technology.

No M03 content.

------------------------------------------------------------------------

# 21. Wrong-diagnosis recovery

## WD01 --- Blame Tomcat because "website = server"

After experiment:

> "Tomcat can cause the same user-visible symptom. But what was Tomcat's
> measured time in the actual incident?"

Player reselects evidence.

## WD02 --- Blame JDBC because database work sounds expensive

> "A database query can be slow. Compare the incident's JDBC segment
> with the segment that dominates this trace."

## WD03 --- Blame total time

> "Total latency tells you the customer waited. It does not identify
> which layer consumed the time."

All are plausible and recoverable.

------------------------------------------------------------------------

# 22. M03 boundary / deferred content

M02 may show only enough context to make the request path coherent:

-   Tomcat processes the request;
-   JDBC accesses MySQL;
-   response returns.

M02 must **not require, reveal as its lesson, investigate, or score**:

-   localhost database as an evolution problem;
-   local product images as an evolution problem;
-   in-memory Session as an evolution problem;
-   "three local assumptions";
-   shared failure-fate analysis;
-   splitting/moving those resources.

These are explicitly deferred.

``` yaml
deferred_from_M02:
  - THREE_LOCAL_ASSUMPTIONS_INVESTIGATION
  - LOCALHOST_DB_EVOLUTION
  - LOCAL_IMAGE_EVOLUTION
  - IN_MEMORY_SESSION_EVOLUTION
```

------------------------------------------------------------------------

# 23. Later-technology non-goals

Do not recommend or teach:

``` text
Redis
load balancers
Kubernetes
microservices
queues
Kafka
AMQP
database replicas
sharding
CDN
distributed storage
service discovery
autoscaling
horizontal scaling
```

M02 ends with diagnosis, not remediation architecture.

------------------------------------------------------------------------

# 24. Implementation handoff

``` yaml
mission:
  id: M02
  slug: follow-one-request
  version: 1.1
  title: Follow One Request

  source:
    repo: ccc115a/se
    path: _more/mybook/向淘寶學習網站架構演進/1.1.md
    blob_sha: 9ddbabbd0fe6693b7c8c60479f0c2f37803233fd

  contract:
    symptom: SITE_FEELS_SLOW
    cause_initially_known: false
    lesson: DIAGNOSE_LAYER_BEFORE_ARCHITECTURE_CHANGE

  stage_order:
    - DNS_RESOLUTION
    - HTTP_CONNECTION
    - TOMCAT_PROCESSING
    - JDBC_MYSQL_QUERY
    - RESPONSE

  evidence:
    ids: [E01, E02, E03, E04, E05]
    required_evidence:
      minimum_count: 3
      mandatory: [E01, E02]
      one_of: [E03, E04, E05]
      unlock_predicate: >
        inspected_count >= 3
        AND inspected(E01)
        AND inspected(E02)
        AND (inspected(E03) OR inspected(E04) OR inspected(E05))
    diagnosis_requires: [E04]

  timings:
    provenance: TEACHING_SIMULATION
    unit: ms

    healthy:
      DNS_RESOLUTION: 20
      HTTP_CONNECTION: 30
      TOMCAT_PROCESSING: 90
      JDBC_MYSQL_QUERY: 70
      RESPONSE: 40
      TOTAL: 250

    incident_baseline:
      DNS_RESOLUTION: 420
      HTTP_CONNECTION: 30
      TOMCAT_PROCESSING: 90
      JDBC_MYSQL_QUERY: 70
      RESPONSE: 40
      TOTAL: 650

    dns_delay_control:
      DNS_RESOLUTION: 820
      HTTP_CONNECTION: 30
      TOMCAT_PROCESSING: 90
      JDBC_MYSQL_QUERY: 70
      RESPONSE: 40
      TOTAL: 1050

    server_delay_control:
      DNS_RESOLUTION: 20
      HTTP_CONNECTION: 30
      TOMCAT_PROCESSING: 490
      JDBC_MYSQL_QUERY: 70
      RESPONSE: 40
      TOTAL: 650

  diagnosis:
    actual_incident_slow_segment: DNS_RESOLUTION
    commit_before_experiment: true
    first_commit_scored: true
    correction_allowed: true

  experiments:
    minimum_runs: 1
    full_credit_runs: 2
    prediction_required_before_each_run: true
    ids:
      - X01_DNS_DELAY_CONTROL
      - X02_SERVER_DELAY_CONTROL

  explanation:
    mandatory:
      - SYMPTOM_650
      - DNS_BEFORE_HTTP
      - BASELINE_DNS_420
      - INCIDENT_DNS_DIAGNOSIS
      - SAME_SYMPTOM_DIFFERENT_LAYER
      - DIAGNOSE_BEFORE_ARCHITECTURE_CHANGE
    experiment_evidence:
      minimum_count: 1
      one_of:
        - DNS_CONTROL_ISOLATES_DNS
        - SERVER_CONTROL_ISOLATES_TOMCAT
    free_text:
      required: false
      scored: false

  scoring:
    investigation: 15
    request_ordering: 20
    baseline_diagnosis: 20
    experimental_prediction: 15
    controlled_comparison: 15
    causal_explanation: 15
    total: 100

  completion:
    route_validated: true
    baseline_trace_complete: true
    diagnosis_committed: true
    experiment_runs_minimum: 1
    prediction_committed: true
    final_slow_segment_identified: true
    explanation_complete: true

  replay_reset:
    - evidence
    - route
    - repairs
    - baseline_trace
    - diagnosis
    - predictions
    - experiments
    - comparison
    - final_diagnosis
    - explanation
    - score
    - reflection

  deferred:
    - THREE_LOCAL_ASSUMPTIONS_INVESTIGATION
    - LOCALHOST_DB_EVOLUTION
    - LOCAL_IMAGE_EVOLUTION
    - IN_MEMORY_SESSION_EVOLUTION

  future_infrastructure_recommendations_allowed: false
```

------------------------------------------------------------------------

# 25. Determinism rules

-   canonical incident is always the DNS-delay incident;
-   all timing values are fixed;
-   baseline always totals 650 ms;
-   X01 always changes DNS only;
-   X02 always changes Tomcat processing only;
-   server-control total is deliberately also 650 ms;
-   route validation is deterministic;
-   first diagnosis is recorded before experimental result;
-   experiment result cannot be revealed before prediction;
-   identical actions produce identical score;
-   no LLM is used for correctness;
-   replay fully resets mission progress.

------------------------------------------------------------------------

# 26. Acceptance tests

## M02-T001 --- Fresh-player slow symptom

Fresh player sees within 10 seconds:

-   customer says site feels slow;
-   `650 ms LAB TIMING`;
-   cause `UNKNOWN`;
-   no highlighted culprit;
-   provenance boundary;
-   primary investigation action.

Capture: `M02-T001-slow-report.png`

## M02-T002 --- No premature answer

Before diagnosis commitment:

-   no UI text states DNS is the incident cause;
-   no slow segment is preselected;
-   experiment results are hidden.

## M02-T003 --- Exact stage order

Only this route validates:

``` text
DNS_RESOLUTION
HTTP_CONNECTION
TOMCAT_PROCESSING
JDBC_MYSQL_QUERY
RESPONSE
```

## M02-T004 --- Evidence gate

False:

``` text
E01
E01+E02
E02+E03+E04
```

True:

``` text
E01+E02+E03
E01+E02+E04
E01+E02+E05
```

Unique inspections only.

## M02-T005 --- Baseline timing

After baseline trace:

``` text
DNS 420
HTTP 30
Tomcat 90
JDBC 70
Response 40
Total 650
```

Every value visibly marked simulation/lab timing.

## M02-T006 --- Baseline diagnosis requires timing evidence

D01 cannot be submitted until E04 inspected and baseline trace
completed.

## M02-T007 --- Diagnosis committed before experiment

Experiment Run remains locked until:

-   diagnosis committed;
-   experiment selected;
-   prediction committed.

## M02-T008 --- DNS-delay experiment

X01 deterministically yields:

``` text
820,30,90,70,40 = 1050
```

Only DNS differs from corresponding incident downstream timings.

## M02-T009 --- Server-delay experiment

X02 deterministically yields:

``` text
20,30,490,70,40 = 650
```

DNS remains healthy while Tomcat processing produces the same total
symptom.

## M02-T010 --- Compare at least two runs

Completion requires:

``` text
baseline + at least one controlled experiment
```

A single baseline alone cannot complete M02.

## M02-T011 --- Prediction required

No experiment result can be revealed without a committed prediction.

## M02-T012 --- Correct DNS prediction

For X01, correct prediction states:

> DNS changes while Tomcat/JDBC remain unchanged.

## M02-T013 --- Correct server prediction

For X02, correct prediction states:

> Tomcat processing changes while DNS remains unchanged.

## M02-T014 --- Wrong diagnosis recovery: Tomcat

If first diagnosis = Tomcat:

-   no game-over;
-   first-diagnosis score reduced;
-   experiment remains available;
-   final diagnosis can be corrected to DNS;
-   completion remains possible.

## M02-T015 --- Wrong diagnosis recovery: JDBC

Same recovery semantics; feedback uses measured segment evidence.

## M02-T016 --- Total-is-not-layer misconception

Choosing total as proof of server fault must trigger:

> total shows waiting, not responsible layer

or semantically equivalent runtime copy.

## M02-T017 --- Slow-segment identification

After controlled evidence, canonical final incident diagnosis is:

``` text
DNS_RESOLUTION
```

Must require evidence selection, not segment click alone.

## M02-T018 --- DNS is not application latency

Causal explanation cannot complete without the distinction:

``` text
DNS occurs before HTTP reaches Tomcat;
Tomcat/application processing occurs after server receipt.
```

## M02-T019 --- Same-total contrast

When X02 is run, UI must make visible:

``` text
incident total = 650
server-control total = 650
different dominant segments
```

This must not be hidden behind total-only visualization.

## M02-T020 --- Perfect score

Perfect path produces exactly 100:

``` text
15 + 20 + 20 + 15 + 15 + 15
```

## M02-T021 --- Partial-credit completion

One wrong route and/or wrong initial diagnosis lowers score but does not
prevent successful completion after correction.

## M02-T022 --- Replay/reset

Replay clears all mutable M02 state and returns to unknown-cause
opening.

## M02-T023 --- M03 content absent

Player-facing runtime must not teach or score:

``` text
three local assumptions
localhost DB as evolution problem
local images as evolution problem
in-memory Session as evolution problem
```

References in developer-only deferred metadata/tests are allowed.

## M02-T024 --- No future infrastructure recommendation

Runtime completion stops at:

``` text
diagnose the slow request layer before architecture change
```

No Redis/load balancer/Kubernetes/microservices/queue/etc
recommendation.

## M02-T025 --- Keyboard-only completion

Complete entire mission using keyboard:

-   evidence;
-   route ordering;
-   baseline trace;
-   diagnosis;
-   experiment choice;
-   prediction;
-   run;
-   comparison;
-   final diagnosis/evidence;
-   explanation;
-   score;
-   replay.

Visible focus; no trap; no drag-only action.

Capture: `M02-T025-keyboard.mp4`

## M02-T026 --- 390px mobile completion

Real 390 CSS px viewport:

-   no critical horizontal overflow;
-   route becomes vertical;
-   timing comparison remains readable;
-   experiment controls fit;
-   changed/unchanged states not colour-only;
-   final explanation usable;
-   score/replay reachable.

Captures:

``` text
M02-T026-mobile-observe.png
M02-T026-mobile-route.png
M02-T026-mobile-baseline.png
M02-T026-mobile-experiment.png
M02-T026-mobile-compare.png
M02-T026-mobile-score.png
```

## M02-T027 --- Reduced-motion completion

With `prefers-reduced-motion: reduce`:

-   no information depends on moving request packet;
-   timings update discretely;
-   changed segments have textual/static indicators;
-   scoring/results identical.

Capture: `M02-T027-reduced-motion.mp4`

## M02-T028 --- Source/fiction/simulation labels

Verify:

-   Atlas customer/request are fictional;
-   latency values are teaching simulation;
-   request-stage causality is source-backed;
-   no simulated number is called historical/production measurement.

## M02-T029 --- Deterministic replay

Two clean runs with identical inputs/actions produce identical:

-   timings;
-   experiment results;
-   feedback;
-   final diagnosis;
-   score.

## M02-T030 --- Runtime answer-leak fixture

Inspect player-facing message registry only.

Before `diagnosis_committed`:

``` yaml
incident_answer_reveal_count: 0
experiment_result_reveal_count: 0
```

Developer metadata and test expectations are excluded.

------------------------------------------------------------------------

# 27. Implementation evidence package

``` text
M02-T001-slow-report.png
M02-T005-baseline.png
M02-T008-dns-control.png
M02-T009-server-control.png
M02-T014-wrong-diagnosis-recovery.png
M02-T017-final-diagnosis.png
M02-T019-same-total-different-layer.png
M02-T020-score-100.png
M02-T022-replay.mp4
M02-T025-keyboard.mp4
M02-T026-mobile-*.png
M02-T027-reduced-motion.mp4
M02-T030-answer-leak-check.txt
```

------------------------------------------------------------------------

# 28. Reviewer checklist

A future implementation review should ask:

1.  Is "site feels slow, cause unknown" the first problem?
2.  Does the player order the exact request stages?
3.  Are timings central evidence rather than optional decoration?
4.  Does the player commit a diagnosis before experiment results?
5.  Must the player predict the controlled outcome?
6.  Are baseline and ≥1 controlled condition compared?
7.  Can DNS delay and Tomcat delay create distinguishable profiles?
8.  Does the server-delay control deliberately demonstrate the same 650
    ms total with a different cause?
9.  Must the player identify the actual incident's slow segment?
10. Must the explanation distinguish DNS latency from application
    latency?
11. Are all numbers clearly simulation?
12. Is M03's local-assumptions lesson absent?
13. Does the mission stop before architecture remediation?
14. Are replay, keyboard, mobile and reduced-motion paths testable and
    deterministic?

------------------------------------------------------------------------

# 29. Open questions

**None requiring human approval.**

The bounded revision resolves the mission contract:

-   canonical symptom is unknown-cause slowness;
-   canonical incident is a simulated DNS-delay case;
-   baseline + controlled experiment are mandatory;
-   both DNS-only and server-only controls are available;
-   same-total/different-layer contrast is explicit;
-   M03-level local-boundary investigation is deferred;
-   no later architecture solution is introduced.

------------------------------------------------------------------------

# 30. Change log

## v1.1 --- bounded contract correction

-   Reframed M02 around the locked **"customer says the site feels slow;
    cause unknown"** incident.
-   Made timing evidence central rather than optional.
-   Replaced the v1 local-dependency/local-assumptions endgame with
    latency diagnosis.
-   Defined exact five-stage order: DNS → HTTP connection → Tomcat
    processing → JDBC/MySQL query → response.
-   Added deterministic healthy, incident-baseline, DNS-delay-control
    and server-delay-control timing profiles.
-   Added the deliberate **same 650 ms total / different cause**
    comparison.
-   Added mandatory baseline slow-segment diagnosis before experiment
    results.
-   Added prediction-before-run mechanics.
-   Required baseline + at least one controlled experiment for
    completion; both controls earn full comparison credit.
-   Added final evidence-backed identification of the actual slow
    segment.
-   Added required causal explanation that DNS latency occurs before
    Tomcat/application processing and that diagnosis precedes
    architecture change.
-   Deferred the three-local-assumptions investigation and related
    scoring to later curriculum.
-   Preserved provenance, unordered route building, recoverable wrong
    paths, deterministic scoring/replay, keyboard/mobile/reduced-motion
    requirements and later-technology boundary.
-   Replaced acceptance suite with M02-T001--M02-T030 focused on latency
    diagnosis, controlled experiments, answer leakage and M03 absence.
-   No application code or M03+ storyboard content added.
