# M06 Playtest QA

Date: 2026-09-16
Route: `/computer-science/architecture-lab/m06`
Environment: local Vinext dev server at `http://localhost:3001`

## Desktop fresh-player flow

Result: **PASS for the revised desktop gameplay loop; full verification remains open**.

- Fresh route opens with a neutral incident. The opening asks the player to
  determine how the two limits relate and what changes when one admission
  setting changes; the correct diagnosis, `FIT_POOL`, result table, and final
  conclusion are not present in the initial player-facing state.
- All seven evidence cards can be inspected and the evidence gate remains
  locked at `0/7` until all unique cards are opened.
- A wrong M05 diagnosis with valid-looking proof is rejected with recoverable
  feedback; the player remains in the diagnosis phase.
- The correct diagnosis requires proof from E01, E02, a queue/pressure card,
  and an outcome card.
- Baseline predictions are required before reveal. A DOM check found
  `hidden_result_tables_before_commit=0` before the baseline prediction commit.
- A complete but deliberately wrong baseline hypothesis (`LOW` for all five
  measures) was accepted, reached the baseline reveal, and exposed the fixed
  result instead of disclosing the answer before the run.
- A complete but deliberately wrong SMALL hypothesis (`LOW` for all five
  measures) was accepted, ran, reached the result reveal, and was reconciled
  with `Not confirmed` for the mismatched measures and `Confirmed` for the
  matching measures.
- Small (10), fit (60), and large (300) candidates were each predicted, run,
  revealed, and reconciled. The visible deterministic results matched the M06
  contract: 10/60/300 pool sizes, 14/3/0 app wait, 0/2/38 DB queue,
  60/78/99% DB CPU, 10/18/15 req/s throughput, 420/190/880 ms p95, and
  0/0/8% errors.
- The seven-link causal chain, E01–E06 evidence links, and model-bound trade-off
  completed the mission. The deliberately exercised wrong diagnosis,
  wrong-baseline hypothesis, wrong-SMALL hypothesis, and result reconciliation
  path produced a recoverable final score of `90/100`; the pure engine's clean
  canonical path remains tested at `100/100`.
- Replay reset the mission to `0/7 INSPECTED` with no stale candidate, result,
  score, or completion state.

## Revision checks after ChatGPT committed-source review

ChatGPT's review of pushed commit `39f358e` returned two bounded blockers:

- Fresh-player conclusion leakage.
- Prediction correctness used as the reveal gate.

Both are corrected in the working tree: the opening is neutral, the rendered
HTML test rejects the former conclusion wording, prediction commits require
completeness only, and result reconciliation now compares the frozen
pre-reveal hypothesis with the revealed candidate record. `Not confirmed` is a
valid learning outcome rather than a failed transition.

The browser run above verified the important regression: wrong complete
hypotheses can reach reveal and reconcile, while the final score reflects their
accuracy. Radio inputs now also expose explicit `value` attributes.

## Visual inspection

- Wide desktop screenshot was inspected through the browser automation session.
- Evidence cards form a readable 4+3 grid; source-example values, simulation
  labels, objective panel, and locked result state are visually distinct.
- No screenshot file was persisted by the browser harness, so no nonexistent
  screenshot path is claimed here.

## Open verification evidence

- Mobile 390×844 runtime capture: **OPEN**.
- Standalone keyboard-only completion: **OPEN**.
- Touch trace: **OPEN**.
- Reduced-motion runtime capture: **OPEN**.
- Screen-reader announcement transcript: **OPEN**.

These are verification debts, not evidence of a known gameplay defect.
