# M08 visual-loop evidence

Mission: `M08 — Campaign Under Load`  
Route: `/computer-science/architecture-lab/m08`  
Implementation commit: `efc4ff2`

## Evidence captured

- Fresh M08 baseline was reviewed before implementation; the accepted bounded
  direction is recorded in `reviews/M08-ui-review-chatgpt-v1.md`.
- The implementation adds a persistent Campaign Work / Queue Pressure Board
  with demand, compute, queue, customer outcome, Memory / GC and Wait / I/O
  evidence objects.
- E01–E07 were inspected in sequence. The fresh board kept the diagnosis
  unresolved until the relevant evidence was opened.
- The CPU hypothesis and `SIMPLIFY_COMPUTE` intervention were selected only
  after the evidence phase.
- The four-part forecast was frozen before the controlled run; the observed
  CPU, queue, latency and throughput values were revealed afterwards and
  reconciled against the forecast.
- The causal chain, evidence links, alternative comparison and bounded
  conclusion were completed; the local route reached `MISSION COMPLETE` and
  `LAB SCORE 100/100`.
- ChatGPT's post-implementation review is recorded in
  `reviews/M08-ui-review-chatgpt-v2.md` and returned presentation PASS.

## Board evidence

The replay confirmed the intended separation:

- symptom: campaign demand enters the application and unfinished work grows;
- evidence families: demand, compute, queue/customer outcome, Memory / GC and
  Wait / I/O;
- probe/intervention scope is visible before result;
- prediction is frozen before reveal;
- observed values and qualitative direction appear after the controlled run;
- the final conclusion preserves the distinction between measured evidence and
  bounded teaching inference.

No engine IDs, run definitions, result tables, reconciliation rules or scoring
semantics were changed by the presentation work.

## Capture note

The CUA browser session returned live screenshot bytes during the completion
capture but did not expose a repository file path for saving PNG evidence. The
live visual state, accessibility tree and deterministic completion state are
recorded instead; no PNG is claimed as committed evidence.

## Verification status

Presentation: **PASS**  
Full mission verification: **PENDING**

Open runtime evidence: 390 × 844, keyboard-only, touch, reduced-motion and
screen-reader gates.
