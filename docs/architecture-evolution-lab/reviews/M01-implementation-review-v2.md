# M01 Implementation Review v2

## Axiom Atlas --- Architecture Evolution Lab

**Review target:** M01 only\
**Repository:** `micah-charles/axiom-atlas`\
**Branch/checkpoint reviewed:** `feature/architecture-evolution-lab`,
commit `0436276dbd51d811276cff620267c6edef0ce830`\
**Commit message:** `fix: close M01 architecture lab review gates`\
**Accepted contract:** M01 storyboard v1.3\
**Previous review:**
`docs/architecture-evolution-lab/reviews/M01-implementation-review-v1.md`

# Executive decisions

## A) M01 implementation decision: PASS

The five implementation findings F01--F05 from review v1 are closed in
the reviewed checkpoint. No new implementation blocker was found in the
corrected M01 game logic.

The M01 implementation is now suitable as the **design/implementation
baseline** for the next storyboard.

## B) M01 full verification decision: CONDITIONAL PASS

M01 is **not yet fully VERIFIED** because three explicitly required
runtime/accessibility checks remain open:

1.  real 390 px mobile viewport completion/capture;
2.  keyboard-only full mission completion;
3.  explicit `prefers-reduced-motion: reduce` run.

These are verification gaps, not currently demonstrated M01 logic
defects. They should remain tracked and must be completed before M01
receives an unconditional `VERIFIED` status.

## C) Safe to request the M02 storyboard now: YES

It is safe to **request and design the M02 storyboard now**, using this
corrected M01 implementation as the baseline, while the three M01
verification items remain open.

This does **not** mean M01 is fully verified, and it does not authorize
M02 implementation. The distinction should be explicit:

``` text
M01 implementation contract: PASS
M01 full runtime verification: CONDITIONAL PASS / pending 3 checks
M02 storyboard work: SAFE TO START
M02 implementation: should remain gated by the project's normal review process
```

The pending mobile/keyboard/reduced-motion evidence could require local
CSS/accessibility corrections, but none presently changes M01's
architecture causality, evidence model, choice semantics, request model,
scoring model, or source boundary. Therefore it does not block
content/storyboard planning for M02.

------------------------------------------------------------------------

# Evidence basis

This review did not accept the post-fix summary alone. The corrected
checkpoint was inspected directly.

## `engine.ts`

Direct inspection confirms:

-   E04 no longer reveals the failure-domain conclusion during evidence
    inspection.
-   `M01_TRACE` now has nine deterministic events.
-   The trace explicitly separates `JDBC product read` from
    `JDBC order write`.
-   The order write targets local MySQL.
-   The canonical evidence unlock predicate remains unchanged.
-   B and C remain preview-only with `requestMs: null`.
-   scoring now distinguishes `fitEvidence`, `fitClaim`, and the
    observed `tradeoff`.
-   full proportionality requires both evidence and the central fit
    claim.
-   full explanation requires fit evidence + fit claim + observed
    trade-off.

## `ArchitectureLabGame.tsx`

Direct inspection confirms:

-   only A exposes the request-run action;
-   the nine-step trace must be advanced to its last step before phase
    changes to failure;
-   failure precedes explanation;
-   Submit requires E01, E03, `fit`, E04, and `risk`;
-   completion reveals `Single-Node Monolith`;
-   completion describes the complete product-and-order path;
-   the final boundary copy acknowledges the observed shared failure
    fate without prescribing a later technology.

## Commit inspection

The checkpoint commit itself confirms the intended changes were applied
together: E04 wording, three additional order-path trace steps, revised
scoring, required `fit`, architecture reveal, revised ending, and
associated responsive styling.

Automated/local QA results supplied in the review request are recorded
as reported verification evidence rather than independently rerun here:

-   `npm run lint` PASS
-   `npm run test:core` PASS --- 160 tests
-   `npm run build` PASS
-   `npm test` PASS --- core + build + five rendered-route tests
-   corrected desktop interaction QA PASS

------------------------------------------------------------------------

# Previous finding closure

## F01 --- Product request + order path

### Previous problem

The objective promised a product request and an order, but the
executable trace proved only a product read.

### Post-fix finding: CLOSED

The trace now contains:

1.  DNS lookup
2.  HTTP request
3.  application/session
4.  JDBC product read → local MySQL
5.  local image read
6.  product response
7.  order submit
8.  JDBC order write → local MySQL
9.  order confirmation

This fixes the key semantic distinction between reading product data and
writing an order.

The phase transition is also deterministic: `advanceTrace()` advances
until the final trace index; only an advance from the last trace entry
moves the game into the failure phase. Therefore the normal UI
completion path cannot skip the order portion.

### Technical assessment

PASS. The path is appropriately simplified for M01 while preserving the
important read/write distinction.

------------------------------------------------------------------------

## F02 --- Missing central fit claim could still earn 100

### Previous problem

The visual causal chain included "fits the present need," but the player
could omit it and still submit/score 100.

### Post-fix finding: CLOSED

The Submit predicate now requires:

``` text
E01
AND E03
AND fit
AND E04
AND risk
```

The score separately computes:

``` text
fitEvidence = E01 AND E03
fitClaim = fit
tradeoff = E04 AND risk AND failureAcknowledged
```

Full proportionality requires `fitEvidence && fitClaim`.

Full explanation requires `fitEvidence && fitClaim && tradeoff`.

Therefore E01 + E03 + E04 + risk without `fit` cannot submit through the
UI and cannot obtain full proportionality/explanation credit through the
scoring function.

### Technical assessment

PASS. The mechanical rule now matches the visual causal builder.

------------------------------------------------------------------------

## F03 --- E04 revealed the failure lesson before the experiment

### Previous problem

E04 explicitly told the player that co-location creates "shared failure
fate," weakening the later host-failure discovery.

### Post-fix finding: CLOSED

E04 now says that local disk, local data, and in-memory Session can be
co-located for the first release, "creating several local assumptions in
the design."

That is the correct level of disclosure.

The explicit reliability conclusion appears later in the failure phase:

``` text
One shared failure domain
Shop HTTP unavailable
database unavailable
images unavailable
active sessions lost
```

### Pedagogical assessment

PASS. The causal sequence is restored:

``` text
observe local assumptions
→ choose/build
→ prove useful path
→ remove host
→ discover shared failure fate
→ explain trade-off
```

------------------------------------------------------------------------

## F04 --- Delayed architecture vocabulary was never revealed

### Previous problem

The game delayed `Single-Node Monolith` correctly but then never named
it.

### Post-fix finding: CLOSED

The completion phase now displays:

``` text
ARCHITECTURE IDENTIFIED
Single-Node Monolith
One Linux host contains the application, local MySQL,
local images and in-memory Session.
```

The term is not used to give away the answer in the pre-decision
evidence/choice flow.

### Pedagogical assessment

PASS. This now follows the intended rule:

``` text
reason about structure first
→ prove it
→ observe its boundary
→ attach formal architecture vocabulary
```

------------------------------------------------------------------------

## F05 --- Ending repeated an already answered host-death question

### Previous problem

The completion hook asked what happens if the machine dies after the
player had already run that experiment.

### Post-fix finding: CLOSED

The ending now states:

> The shop is live. Everything important still shares one host, so
> simplicity and shared failure fate now coexist.

and:

> The assumptions that made this design simple are now visible.

It neither repeats the resolved question nor recommends the next
architecture technology.

### Boundary assessment

PASS. This is a good handoff state for a curriculum: it carries forward
an observed constraint without solving a future mission.

------------------------------------------------------------------------

# Re-check of previously accepted M01 invariants

  ----------------------------------------------------------------------------
  Invariant               v2 status               Review note
  ----------------------- ----------------------- ----------------------------
  M01-only scope          PASS                    No M02 content is needed for
                                                  these corrections.

  Empty initial topology  PASS                    Existing implementation
                                                  preserved.

  Evidence before         PASS                    Existing gate preserved.
  approach choice                                 

  Minimum 3 unique        PASS                    `Set`-based count preserved.
  evidence cards                                  

  E01 mandatory           PASS                    Predicate preserved.

  E03 or E04 mandatory    PASS                    Predicate preserved.
  alternative                                     

  B preview-only          PASS                    `requestMs: null`;
                                                  unresolved placement remains
                                                  explicit.

  C preview-only          PASS                    Neutral multi-node
                                                  managed-platform wording
                                                  remains.

  Only A executes         PASS                    Run handler guards
                                                  `approach === "A"`.

  DNS not assembled as a  PASS                    DNS exists in trace, not
  host component                                  target host nodes.

  Product request proof   PASS                    Explicit product
                                                  read/image/response.

  Order proof             PASS                    Explicit
                                                  submit/write/confirmation.

  Host failure before     PASS                    Phase order preserved.
  explanation                                     

  Causal fit claim        PASS                    Required by Submit and full
  required                                        scoring.

  Failure consequence     PASS                    E04 + risk + acknowledged
  required                                        failure feed full scoring.

  Delayed formal label    PASS                    Single-Node Monolith appears
                                                  on completion.

  Source/simulation       PASS                    Existing boundary remains
  distinction                                     intact.

  No premature later      PASS                    Final boundary stops at the
  technology                                      observed problem.
  recommendation                                  

  Replay                  PASS                    Existing M01 replay
                                                  retained.
  ----------------------------------------------------------------------------

------------------------------------------------------------------------

# New issue search

## No new M01 implementation blocker found

The post-fix changes do not introduce a new architecture or scientific
error in the reviewed logic.

### DNS

Still correctly modeled as a pre-HTTP request step rather than an
assembled node.

### HTTP/Tomcat

The product and order actions both pass through the application path.
This is appropriate for the educational abstraction.

### Session

In-memory Session remains explicitly tied to the modeled
Tomcat/local-host assumption, consistent with the source scenario.

### MySQL

The game now correctly distinguishes a product read from an order write.

### Local image storage

Still correctly modeled as host-local storage and included in the host
blast radius.

### Failure-domain reveal

Still technically correct for this topology: losing the only host
removes the application, database availability, local image access, and
in-memory Session state.

### Determinism

The nine-entry trace remains a fixed sequence; no stochastic result has
been introduced.

### Simulation labels

Lab cost/setup/path metrics remain simulation values rather than
historical production measurements.

------------------------------------------------------------------------

# One non-blocking wording observation

The A approach's pre-run copy still calls the topology a "complete
request path" and the button says `Run customer request`, while the
actual trace now covers both product retrieval and order submission.

This is not technically wrong: an order submission is also an HTTP
customer request/action, and the objective above already says product
request + order.

For maximum clarity, a later polish pass could rename the action to
something like:

``` text
Run shop journey
```

or:

``` text
Test product + order path
```

This is **not a blocker**, should not reopen F01, and is not required
before requesting M02.

------------------------------------------------------------------------

# Full verification status

## CONDITIONAL PASS

The implementation logic can pass while full verification remains
conditional. These should not be conflated.

### Open V01 --- Real 390 px viewport

**Status:** PENDING

Required evidence remains a real browser rendering at approximately 390
CSS px width, not merely inspection of responsive CSS.

At minimum capture/verify:

-   briefing;
-   evidence inspection/gate;
-   approaches;
-   nine-step trace;
-   failure screen;
-   causal builder;
-   completion screen.

Check:

-   no critical horizontal overflow;
-   no clipped topology meaning;
-   buttons remain reachable;
-   trace remains understandable;
-   all causal choices are tappable;
-   completion/replay are reachable;
-   no fixed/sticky element obscures actions.

### Open V02 --- Keyboard-only completion

**Status:** PENDING

Native `button` and `Link` usage is a positive code-level indicator, but
it does not substitute for an end-to-end keyboard run.

Verify:

``` text
briefing/evidence
→ approaches
→ A
→ all nine trace advances
→ failure acknowledgement
→ five explanation selections
→ submit
→ completion/replay
```

with keyboard only.

Also verify visible focus, logical focus order, and no keyboard trap.

### Open V03 --- Explicit reduced-motion run

**Status:** PENDING

The code/commit includes a `prefers-reduced-motion: reduce` rule for the
primary-button hover transform, and the core trace itself is manual
state progression rather than an animation-dependent simulation.

That is encouraging but not equivalent to runtime verification.

Run with reduced motion enabled and verify:

-   no required information depends on animation;
-   global/shared animations do not impair M01;
-   all state transitions remain understandable;
-   no interaction disappears.

------------------------------------------------------------------------

# Exact remaining blockers

## Blockers to `M01 VERIFIED`

Only these three evidence items remain:

``` text
V01 real 390 px viewport completion/capture
V02 keyboard-only end-to-end completion
V03 explicit reduced-motion end-to-end run
```

If any reveals a real defect, fix that defect and rerun the affected
check plus regression tests.

## Blockers to requesting M02 storyboard

**None.**

The remaining items test presentation/accessibility of the
already-accepted M01 interaction. They do not currently create ambiguity
about the architecture-learning contract that an M02 storyboard would
inherit.

------------------------------------------------------------------------

# Baseline rules M02 storyboard may now inherit

This section does not design M02. It records only the stable baseline
established by M01 so that a future M02 request does not accidentally
regress it.

The M01 baseline now demonstrates that Architecture Evolution Lab
missions should preserve:

``` text
problem
→ inspect evidence
→ infer rather than reveal answer
→ choose a proportionate intervention
→ execute only sufficiently specified topology
→ observe deterministic technical consequence
→ reveal trade-off
→ require causal explanation
→ name the architecture/concept after understanding
→ stop before prescribing the next solution
```

It also establishes these implementation/content disciplines:

-   source-backed facts, fictional framing, and simulation values remain
    distinct;
-   later technology is not rewarded before a current problem requires
    it;
-   preview branches cannot silently execute incomplete topology;
-   simulated business capability should be visibly demonstrated, not
    merely asserted;
-   scoring must measure the causal reasoning shown by the UI;
-   a mission's final boundary can become input to later curriculum
    without pre-solving that curriculum.

These are baseline constraints, not M02 content.

------------------------------------------------------------------------

# Recommended project status

Use three separate status labels rather than forcing one label to
represent everything:

``` text
M01 STORYBOARD: ACCEPTED v1.3
M01 IMPLEMENTATION: PASS @ 0436276
M01 FULL VERIFICATION: CONDITIONAL PASS — V01/V02/V03 pending
M02 STORYBOARD REQUEST: UNBLOCKED
```

Do **not** mark M01 `VERIFIED` until V01--V03 are actually completed.

If the project's progress file uses `🟦 IMPLEMENTED / NEEDS QA`, that
remains an accurate status while these checks are open.

------------------------------------------------------------------------

# Final decision

## A) M01 implementation

**PASS**

All previous implementation findings F01--F05 are closed. No new
implementation blocker was identified.

## B) M01 full verification

**CONDITIONAL PASS**

Desktop corrected behaviour and reported automated verification are
satisfactory, but real 390 px mobile, keyboard-only, and explicit
reduced-motion evidence remain open.

## C) Safe to request M02 storyboard

**YES**

The corrected M01 is now stable enough to serve as the
architecture/game-design baseline for **requesting and reviewing an M02
storyboard**.

This permission should not be misread as declaring M01 fully verified or
as permission to skip the outstanding M01 accessibility/mobile QA. The
three verification items should continue in parallel and be closed
before M01 receives final `VERIFIED` status.
