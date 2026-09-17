# M06 visual-loop evidence

Mission: `M06 — Fifty Connections or Five Hundred?`  
Route: `/computer-science/architecture-lab/m06`  
Implementation commit: `37a1795`

## Evidence captured

- Fresh M06 baseline was reviewed before implementation; the accepted bounded
  direction is recorded in `reviews/M06-ui-review-chatgpt-v1.md`.
- The implementation adds a persistent Admission Flow / Queue Pressure Board
  with an application admission gate, DB capacity boundary, queue lanes and
  instrument rail.
- E01–E07 were inspected in a fresh local route and visibly progressed the
  same board from source facts and unknown signals to an inspectable system
  model.
- Candidates `10`, `60` and `300` were each predicted, run and revealed using
  the existing deterministic M06 result tables.
- The local route reached `MISSION COMPLETE` and `LAB SCORE 100/100` after the
  causal explanation was completed.
- ChatGPT's post-implementation review is recorded in
  `reviews/M06-ui-review-chatgpt-v2.md` and returned presentation PASS.

## Board evidence

The replay confirmed the intended bounded teaching pattern:

- small pool → upstream application wait;
- moderate pool → useful region in this fixed teaching model;
- large pool → DB contention, latency and errors.

The prediction controls preserve the existing IDs and the reveal compares the
player's qualitative forecast with the measured result. No decorative
telemetry was introduced before a run.

## Capture note

The CUA browser session returned live screenshot bytes but did not expose a
repository file path for saving PNG evidence. The live visual state,
accessibility tree and deterministic completion state are recorded instead; no
PNG is claimed as committed evidence.

## Verification status

Presentation: **PASS**  
Full mission verification: **PENDING**

Open runtime evidence: 390 × 844, keyboard-only, touch, reduced-motion and
screen-reader gates.
