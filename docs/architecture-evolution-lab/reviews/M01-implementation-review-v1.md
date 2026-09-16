# M01 Implementation Review v1

## Axiom Atlas --- Architecture Evolution Lab

**Review scope:** Implemented M01 only, on
`feature/architecture-evolution-lab`\
**Route:** `/computer-science/architecture-lab`\
**Accepted contract:** `M01-open-the-shop-storyboard-v1.3.md`\
**Primary technical source:** `ccc115a/se`,
`_more/mybook/向淘寶學習網站架構演進/1.1.md`\
**Verified source blob SHA:** `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`

# Decision

## REVISION REQUIRED

The implemented slice is structurally strong and already satisfies
several of the hardest M01 requirements: the evidence gate is correct,
B/C are genuinely preview-only, the initial canvas is empty, only A can
execute the request trace, the failure-domain consequence is visible,
and source-backed versus simulated values are visibly distinguished.

However, M01 should **not be marked VERIFIED and M02 should not start
yet**. There are four contract/gameplay inconsistencies that should be
corrected first, two of which affect the core learning loop:

1.  **The mission promises a product request and an order, but the
    executable simulation proves only the product-read path.**
2.  **The causal builder can be completed and score 100/100 without
    selecting the central "this design fits the present need" causal
    link.**
3.  **E04 reveals "shared failure fate" during investigation, before the
    host-failure reveal that is supposed to make the player discover
    that consequence.**
4.  **The accepted delayed "Single-Node Monolith" identification is
    never actually shown after success.**

A fifth issue is verification rather than implementation: **mobile M01
remains unverified until a real 390 px viewport run/capture is
completed.**

These are bounded M01 fixes. No M02 design is needed to resolve them.

------------------------------------------------------------------------

# 1. Evidence reviewed

## Repository implementation

### `app/games/architecture-lab/engine.ts`

Verified directly on `feature/architecture-evolution-lab`:

-   `M01_EVIDENCE` contains E01--E04.
-   `canUnlockApproaches()` uses a `Set`, requires at least three unique
    evidence IDs, requires E01, and requires E03 or E04.
-   A has `READY_TO_SERVE`, cost 4, complexity 2, setup 3, request 80
    ms.
-   B has `PREVIEW_BLOCKED_UNRESOLVED_PLACEMENT` and `requestMs: null`.
-   C has `PREVIEW_BLOCKED_OVERBUILT_AND_UNRESOLVED` and
    `requestMs: null`.
-   D fails the functional requirement.
-   `M01_TRACE` contains six deterministic steps.
-   `scoreExplanation()` scores E01/E03 as fit, E04 as state, and the
    separately supplied failure acknowledgement as reliability.

### `app/games/architecture-lab/ArchitectureLabGame.tsx`

Verified directly on the feature branch:

-   Briefing exposes objective and fiction/simulation boundary.
-   No architecture verdict is initially displayed.
-   Topology is empty before an approach is selected.
-   Evidence cards reveal observation/interpretation after inspection.
-   Approaches render only when the evidence gate opens.
-   Only A renders `Run customer request`.
-   B/C render preview results and no latency metrics.
-   A advances deterministically through the six trace entries.
-   Host failure is shown before the explanation phase.
-   Explanation submit requires E01, E03, E04 and `risk`.
-   Completion renders category scores and total.
-   Replay reloads M01.
-   Runtime completion hook does not prescribe a later technology.

### Route

`app/computer-science/architecture-lab/page.tsx` is isolated and simply
mounts the Architecture Lab game.

## Verification claims supplied with the review request

The following are treated as reported QA/build evidence, not
independently rerun by this reviewer:

-   `npm run lint` PASS
-   `npm run test:core` PASS, 160 tests
-   `npm run build` PASS
-   `npm test` PASS
-   desktop visual inspection PASS
-   real 390 px viewport capture pending

This distinction matters: repository code was inspected directly; local
runtime/build claims were supplied by the implementation run.

------------------------------------------------------------------------

# 2. Contract compliance matrix

  -------------------------------------------------------------------------------------------
  Requirement             Review                  Evidence / finding
  ----------------------- ----------------------- -------------------------------------------
  M01-only scope          PASS                    No M02+ implementation found in reviewed
                                                  M01 slice.

  Empty initial topology  PASS                    `Topology empty={approach === null}` and
                                                  empty-canvas copy are used before
                                                  selection.

  Evidence before answer  PASS with one           Gate works correctly, but E04 prematurely
                          disclosure issue        reveals the reliability consequence; see
                                                  F03.

  Canonical evidence      PASS                    `unique.size >= 3 && E01 && (E03 || E04)`
  predicate                                       exactly implements the accepted predicate.

  Unique evidence count   PASS                    `Set(inspected)` prevents duplicates from
                                                  opening the gate.

  B preview-only          PASS                    No Run button, `requestMs: null`,
                                                  unresolved placement explicitly stated.

  C preview-only          PASS                    Same; neutral "multi-node managed platform"
                                                  label is preserved.

  Only A executes request PASS                    `startRequest()` returns unless
                                                  `approach === "A"`.

  DNS simulation-only     PASS                    DNS exists in `M01_TRACE`, not
                                                  `TARGET_NODES`/assembled topology.

  Source/simulation       PASS                    Briefing/footer distinguish source section
  boundary                                        from lab costs/timings/indicators.

  Deterministic request   PASS, but incomplete    Six fixed steps are deterministic;
  trace                   mission proof           order-write proof is absent.

  Host-failure reveal     PASS                    Simulation completes into `failure`, then
  before explanation                              acknowledgement moves to `explain`.

  Causal explanation      REVISION REQUIRED       Required evidence/risk buttons exist, but
  required                                        central causal "fit" button is not required
                                                  or scored.

  Delayed Single-Node     REVISION REQUIRED       The label is not revealed at all.
  Monolith reveal                                 

  No premature later      PASS                    Completion stops at shared failure domain
  solution                                        and does not recommend
                                                  Redis/LB/Kubernetes/etc.

  Mobile/touch            PENDING                 CSS is reported present; actual 390 px
  verification                                    capture and interaction run are still
                                                  required.

  Reduced-motion          NOT ESTABLISHED         The reviewed component advances by explicit
  verification                                    steps rather than moving packets, which is
                                                  inherently low-motion, but an explicit
                                                  reduced-motion acceptance run was not
                                                  supplied.
  -------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 3. Findings

## F01 --- HIGH --- The executable mission does not prove the promised order path

### What the player is told

The objective says:

> "Serve one product request and one order..."

### What the engine actually simulates

The six trace steps are:

1.  DNS lookup
2.  HTTP request
3.  Application processing / Session
4.  JDBC **product read**
5.  Local image read
6.  Response

The JDBC step text says "reads product and order data," but that is not
an order submission. It conflates reading data with proving that an
order can be written.

### Why this matters

The accepted storyboard defines two functional capabilities: product
serving and order writing. The game-design rule is **problem → evidence
→ diagnosis → intervention → consequence**. A claimed capability should
be demonstrated by the simulation rather than asserted in prose.

At present, the objective promises two user operations but the game only
lets the player causally observe one.

This is a small implementation change but a core simulation-integrity
issue.

### Exact fix

Keep the existing product-request trace, then add a short deterministic
order submission/write after the product response, for example:

``` text
Product request:
DNS → HTTP/Tomcat → Session → JDBC product read/MySQL → local image → response

Order action:
Browser submits order → Tomcat → JDBC order write → local MySQL → order confirmation
```

It does not need another large animation. A two- or three-step "Place
order" continuation is enough.

Required acceptance:

-   completion/failure phase cannot be reached until both
    `product_request_success == true` and `order_write_success == true`;
-   the order operation must be described as a **write**, not "read
    product and order data";
-   B/C remain preview-only;
-   no new technology is introduced.

Suggested tests:

-   `M01-T021-ORDER-WRITE-PATH`
-   assert order write target = local MySQL;
-   assert deterministic replay produces the same result.

------------------------------------------------------------------------

## F02 --- HIGH --- The causal explanation can omit its central causal link and still score 100

### Implementation behaviour

The UI offers:

``` text
BECAUSE
[small workload + quick launch]
[complete HTTP → data path]

→ THIS DESIGN
[fits the present need]

→ BUT
[everything shares one host]
[one host failure stops the shop]
```

This is good game design visually.

However, Submit is disabled only until:

-   E01 selected;
-   E03 selected;
-   E04 selected;
-   `risk` selected.

It **does not require `fit`**.

`scoreExplanation()` also ignores `fit`. Therefore a player can leave
the entire middle causal proposition unselected and still receive:

-   Diagnosis 25
-   Proportionality 25
-   Reliability 20
-   Explanation 20
-   Efficiency 10

= **100/100**.

### Why this matters

The accepted M01 learning objective is not merely "spot four facts." It
is to explain:

``` text
current constraints
→ proportionate single-host choice
→ works now
→ but shares one failure domain
```

The current scoring system visually presents that causal chain but
mathematically scores an evidence checklist. That is exactly the kind of
"false game/simulation" the Bible rules are intended to avoid.

### Exact fix

Make `fit` a required semantic component.

Minimum fix:

``` text
submit enabled only if:
E01 && E03 && fit && E04 && risk && failureAcknowledged
```

Update scoring so full proportionality/explanation credit requires
`fit`.

For example:

``` text
fitEvidence = E01 && E03
fitClaim = selected("fit")
tradeoff = E04 && selected("risk") && failureAcknowledged

full diagnosis: fitEvidence
full proportionality: fitEvidence && fitClaim
full reliability: tradeoff
full explanation: fitEvidence && fitClaim && tradeoff
```

Partial credit should remain possible if the player has evidence but
misses the causal connector.

Add a regression test:

> Selecting E01 + E03 + E04 + risk without `fit` must not complete M01
> and must not score 100.

------------------------------------------------------------------------

## F03 --- MEDIUM --- E04 reveals the host-failure lesson before the player performs the failure experiment

### Current E04 interpretation

> "Local disk, local data and in-memory Session can be co-located now,
> but create shared failure fate."

### Why this conflicts with the accepted storyboard

The accepted investigation phase is supposed to establish the **local
assumptions**. The host-failure experiment then reveals their common
blast radius.

The current E04 interpretation gives away "shared failure fate" before
the experiment. This weakens the causal discovery:

``` text
inspect local placement
→ build
→ run
→ fail host
→ discover shared failure fate
```

into:

``` text
read answer
→ later watch answer demonstrated
```

The mission still has gameplay, but this sentence reduces the value of
the failure reveal.

### Exact fix

Change E04 interpretation to something non-revealing, such as:

> "These resources can be kept local for the first release, creating
> several local assumptions in the design."

Do not use "failure fate," "single point of failure," "whole shop
stops," or equivalent reliability-result wording in E04.

The failure screen should remain the first explicit reveal that all four
capabilities share the host's fate.

------------------------------------------------------------------------

## F04 --- MEDIUM --- The architecture name is never revealed after discovery

### Accepted behaviour

The storyboard intentionally delays the term **Single-Node Monolith**
until the player has investigated, assembled, and proven the
proportional design.

That delay is pedagogically useful: architecture vocabulary labels a
discovered structure rather than replacing reasoning.

### Current implementation

The completion screen says:

> "The shop works --- and now you can name its boundary."

But it never actually names the architecture.

### Exact fix

After successful product + order proof, or on the final result screen
after explanation, add:

> **Architecture identified: Single-Node Monolith**

Optionally pair it with:

> One Linux host contains the application, database, local images and
> in-memory Session.

Do not reveal the label in the briefing, evidence cards, or approach
labels.

This preserves the accepted "concept first, vocabulary second" rule.

------------------------------------------------------------------------

## F05 --- LOW --- The completion hook repeats a failure question that the player has already answered

### Current hook

> "What happens if this one machine dies?"

But the immediately preceding mission flow has already made the player
remove/fail the host and shown exactly what happens.

### Why it matters

This makes the ending feel as if the game forgot the experiment the
player just performed.

### Exact fix

Use the accepted non-prescriptive hook instead:

> **The shop is live. Everything important still shares one host, so
> simplicity and shared failure fate now coexist.**

If a forward-looking sentence is desired, keep it abstract and do not
prescribe M02:

> "The assumptions that made this design simple are now visible."

Do not ask the already-resolved host-death question again.

------------------------------------------------------------------------

# 4. Technical/scientific accuracy review

## DNS --- PASS

Representing DNS as a request-environment step rather than a component
the player deploys is appropriate for M01. The source explicitly places
DNS resolution before the HTTP connection and describes the single-node
case as resolving the domain to one IP.

The implementation's simplified "DNS lookup → one host address" is
suitable for this mission. It intentionally does not teach resolver
caches/recursive DNS details.

## HTTP/Tomcat --- PASS

The browser-to-Tomcat HTTP step is consistent with the source's
conceptual request path. Omitting Apache as a required separate player
component is acceptable because the source itself allows Apache/Tomcat
as the web entry and the accepted M01 contract standardised on Tomcat.

## Session --- PASS with wording caution

"Session in Tomcat memory" is faithful to the source's local
assumptions.

When the host is removed, saying active in-memory Sessions are
lost/unavailable is appropriate for the lab model. Avoid implying that
every Tomcat deployment universally stores Session this way; M01 is
specifically modelling the source's starting assumptions.

## JDBC/MySQL --- PASS with F01 correction

Tomcat → JDBC → local MySQL is technically faithful.

The current label "JDBC product read" is correct for the product-page
path. The detail "reads product and order data" is misleading in context
because an order operation should be a write. Fixing F01 resolves this.

## Local images --- PASS

Local product-image disk is source-backed and correctly included inside
the host failure domain.

## Failure domain --- PASS

For this modeled topology, losing the single host makes Tomcat, local
MySQL, local images, and in-memory Session unavailable. The "one shared
failure domain" lesson is technically sound.

## Simulation metrics --- PASS

The UI labels cost, setup, latency and total score as lab/simulation
values. No reviewed runtime code presents 80 ms or the cost units as
historical Taobao measurements.

## Scoring --- TECHNICALLY DETERMINISTIC, PEDAGOGICALLY INCOMPLETE

The score is deterministic, but F02 means it does not yet faithfully
score the causal explanation shown by the UI.

------------------------------------------------------------------------

# 5. Is this a real game decision or a dashboard?

## Decision: Mostly real game interaction --- not merely a dashboard --- but one scoring flaw weakens it

The player genuinely has to:

1.  investigate evidence;
2.  satisfy a nontrivial unlock predicate;
3.  choose among four plausible architecture paths;
4.  discover that B/C cannot yet prove a complete topology;
5.  execute A;
6.  step through a deterministic request;
7.  observe a host-failure consequence;
8.  construct an explanation.

That is materially stronger than a dashboard or passive architecture
slideshow.

The most important game-quality weakness is F02: the final
causal-builder UI currently looks more demanding than its actual
state/scoring rule. Fixing that makes the interaction mechanically match
its pedagogical promise.

F01 is the second simulation-integrity issue: "serve an order" should be
an observable action, not text attached to a product read.

------------------------------------------------------------------------

# 6. Desktop readiness

## Desktop: CONDITIONALLY READY

Based on the reported desktop QA plus direct inspection of the
interaction logic, there is no desktop-blocking structural problem.

The four content/gameplay fixes above should be made before M01 is
called final, but they do not require a visual redesign.

After fixes, rerun:

-   fresh-player gate path;
-   B preview;
-   C preview;
-   A product request;
-   A order write;
-   host failure;
-   explanation missing `fit`;
-   full explanation;
-   replay;
-   runtime boundary fixture.

------------------------------------------------------------------------

# 7. Mobile and accessibility verification required for M01 VERIFIED

## Mobile status: NOT YET VERIFIED

Responsive CSS existing at breakpoints is not equivalent to a successful
mobile interaction test.

A real **390 px CSS viewport** run/capture is still required.

### Required mobile acceptance pass

At 390 px width verify:

1.  Mission title/objective and fiction/source boundary are readable
    without horizontal page overflow.
2.  E01--E04 cards are fully reachable and inspectable.
3.  Gate status remains visible enough that the learner understands why
    approaches are locked.
4.  All A/B/C/D choice copy is readable; B/C remain clearly
    preview-only.
5.  No required interaction depends on hover.
6.  A's Run button is reachable without canvas overlap.
7.  Every request-trace step can be read and advanced.
8.  Host-failure topology and consequence text fit without clipped
    critical information.
9.  All causal-builder choices are visible and tappable.
10. Submit disabled/enabled state is understandable.
11. Score/result and Replay are reachable.
12. Touch targets are at least approximately 44×44 CSS px where required
    by the storyboard.
13. No sticky/fixed element hides the primary action.
14. No horizontal scrolling is required to understand the topology.
15. Orientation change or viewport-height reduction does not trap the
    player.

### Required capture set

-   `M01-mobile-390-brief.png`
-   `M01-mobile-390-evidence-gate.png`
-   `M01-mobile-390-approaches.png`
-   `M01-mobile-390-request.mp4`
-   `M01-mobile-390-failure.png`
-   `M01-mobile-390-explanation.png`
-   `M01-mobile-390-complete.png`

## Keyboard

The implementation uses native buttons/links, which is a good baseline.
A final keyboard-only run should still verify logical focus order
through evidence → approach → simulation → failure → explanation.

## Reduced motion

The M01 request is advanced manually step-by-step and does not rely on
moving packets for comprehension, so the core implementation is already
compatible with reduced-motion intent.

Nevertheless, the final acceptance run should enable
`prefers-reduced-motion: reduce` and verify that global/shared CSS
animations or transitions do not create unnecessary motion and that no
state becomes invisible.

------------------------------------------------------------------------

# 8. Exact pre-M02 fix list

## Must fix

### FIX-01 --- Add deterministic order-write proof

Owner area: `engine.ts` + M01 game flow.

Acceptance: - product request remains deterministic; - order submission
visibly writes to local MySQL; - M01 cannot complete functional proof
without both; - B/C remain non-executable previews.

### FIX-02 --- Make `fit` causally required and scored

Owner area: explanation submit predicate + scoring.

Acceptance: - E01+E03+E04+risk without `fit` cannot produce
completion/100; - full chain produces full explanation score; - partial
credit remains useful.

### FIX-03 --- Remove reliability answer from E04 investigation copy

Owner area: `M01_EVIDENCE`.

Acceptance: - E04 describes local assumptions/co-location; - explicit
shared failure fate first appears in the failure experiment.

### FIX-04 --- Reveal the architecture name after discovery

Owner area: result/completion copy.

Acceptance: - "Single-Node Monolith" absent before successful
architecture proof; - visible after proof/explanation.

### FIX-05 --- Replace stale next-hook question

Owner area: completion copy.

Acceptance: - ending acknowledges the failure experiment already
happened; - no later solution is prescribed; - M01-T020 runtime boundary
remains PASS.

## Must verify

### VERIFY-01 --- Real 390 px mobile run

Use the capture set in section 7.

### VERIFY-02 --- Keyboard-only completion

No mouse/touch required.

### VERIFY-03 --- Reduced-motion run

Core information must remain identical.

### VERIFY-04 --- Regression suite

Rerun lint, core tests, build, full tests, and route render checks after
fixes.

------------------------------------------------------------------------

# 9. Source-fidelity assessment

The implemented technical model is substantially faithful to source
section 1.1:

-   small early workload;
-   single Linux host;
-   Tomcat;
-   local MySQL;
-   local images;
-   in-memory Session;
-   DNS before HTTP;
-   Tomcat/JDBC/MySQL request path;
-   no redundancy;
-   one-host failure blast radius.

The implementation also correctly avoids claiming that Atlas Market is
historical Taobao and labels lab metrics as simulations.

The main source-fidelity issue is not an invented historical fact; it is
**simulation completeness**: the source describes JDBC reads/writes and
orders in MySQL, while the game objective promises an order but
currently demonstrates only a product read.

------------------------------------------------------------------------

# 10. Safe-to-start-M02 decision

## NO --- do not start M02 yet

This is not because M01 needs a redesign. The architecture and
interaction model are sound.

M02 should wait because M01 is the foundation for the Lab's core
contract:

> evidence → decision → executable consequence → causal explanation

F01 and F02 currently leave two gaps in that foundation: one promised
business operation is asserted rather than simulated, and one required
causal proposition is displayed but not mechanically required.

The recommended gate to begin M02 is:

``` text
FIX-01 through FIX-05 complete
AND 390 px mobile acceptance complete
AND keyboard/reduced-motion acceptance complete
AND regression suite PASS
→ M01 VERIFIED
→ safe to start M02
```

No M02 content needs to be designed while completing this gate.

------------------------------------------------------------------------

# Final verdict

**REVISION REQUIRED**

**Architecture/game foundation:** strong\
**Evidence gate:** correct\
**B/C preview semantics:** correct\
**Source/simulation boundary:** correct\
**Technical topology:** sound for M01\
**Core gameplay:** real, but needs two causal/simulation corrections\
**Desktop:** conditionally ready\
**Mobile:** verification pending\
**Safe to start M02:** **No; finish the bounded M01 fixes and
mobile/accessibility verification first.**
