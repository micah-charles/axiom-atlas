# M06 Playtest QA

Date: 2026-09-16
Route: `/computer-science/architecture-lab/m06`
Environment: local Vinext dev server at `http://localhost:3001`

## Desktop fresh-player flow

Result: **PASS for the desktop gameplay loop**.

- Fresh route opens with a neutral incident. The correct diagnosis,
  `FIT_POOL`, result table, and final conclusion are not present in the initial
  player-facing state.
- All seven evidence cards can be inspected and the evidence gate remains
  locked at `0/7` until all unique cards are opened.
- A wrong M05 diagnosis with valid-looking proof is rejected with recoverable
  feedback; the player remains in the diagnosis phase.
- The correct diagnosis requires proof from E01, E02, a queue/pressure card,
  and an outcome card.
- Baseline predictions are required before reveal. A DOM check found
  `hidden_result_tables_before_commit=0` before the baseline prediction commit.
- A wrong small-pool prediction is rejected before the experiment runs.
- Small (10), fit (60), and large (300) candidates were each predicted, run,
  revealed, and reconciled. The visible deterministic results matched the M06
  contract: 10/60/300 pool sizes, 14/3/0 app wait, 0/2/38 DB queue,
  60/78/99% DB CPU, 10/18/15 req/s throughput, 420/190/880 ms p95, and
  0/0/8% errors.
- The seven-link causal chain, E01–E06 evidence links, and model-bound trade-off
  completed the mission. The deliberately exercised wrong diagnosis,
  wrong-prediction, and one premature reconciliation attempts produced a
  recoverable final score of `97/100`; the pure engine's clean path remains
  tested at `100/100`.
- Replay reset the mission to `0/7 INSPECTED` with no stale candidate, result,
  score, or completion state.

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
