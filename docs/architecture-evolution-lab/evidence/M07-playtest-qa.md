# M07 Playtest QA

Date: 2026-09-17
Route: `/computer-science/architecture-lab/m07`
Environment: local Vinext dev server at `http://localhost:3001`

## Desktop fresh-player flow

Result: **PASS for the complete desktop gameplay loop; full verification remains open**.

- A fresh route opens with a neutral slow-request incident. The diagnosis,
  run result and canonical causal chain are not present in the initial
  player-facing state.
- The evidence gate starts at `0/6 REQUIRED` and only opens after E01–E06
  across request, compute, memory/GC and wait/I/O families have been
  inspected. E07 remains an optional missing-history card.
- The diagnosis stage requires one hypothesis plus at least three inspected
  proof cards. A deliberately wrong `Memory / GC pressure is primary`
  hypothesis with E01/E03/E05 proof was accepted for play, rather than being
  silently converted into the canonical answer.
- A deliberately wrong but complete compute-run forecast (`LOW`, `LOW`,
  `HIGH`, `HIGH`) was accepted before reveal. The result stayed hidden until
  `RUN DIAGNOSTIC CHECK` was activated.
- The revealed deterministic result showed CPU `99% HIGH`, runnable queue
  `23 HIGH`, I/O wait `3% LOW`, and socket-read blocked `2/200 LOW`.
- Selecting `Confirmed` for every wrong forecast was rejected with
  `Reconciliation needs revision`. Correcting the four fields to
  `Not confirmed` reached the causal explanation stage.
- The wrong-path causal chain, evidence links, alternative and bounded
  conclusion completed the mission at `74/100` with diagnosis credit reduced
  to `5/15` and prediction credit at `0/15`. This proves that wrong reasoning
  can be recovered from and scored rather than being a dead end.
- Replay reset the mission to a fresh `0/6 REQUIRED` state with no stale
  diagnosis, prediction, reveal, reconciliation or score.

## Canonical clean path

- Replayed from a clean state and inspected E01–E06.
- Selected `Compute saturation is primary` with E01/E02/E04 proof.
- Chose the compute-and-wait run and predicted `HIGH`, `HIGH`, `LOW`, `LOW`.
- Revealed and reconciled all four fields as `Confirmed`.
- Reordered the causal claims to symptom → resource evidence → primary
  diagnosis → consequence.
- Attached E01/E02/E04/E06 to the required claims, selected both bounded
  alternatives, and selected the conclusion-limit statement.
- Completed at **100/100**: investigation 15, diagnosis 15, prediction 15,
  run discipline 10, reconciliation 15, alternatives 10, causal model 15,
  efficiency 5.

## Post-review bounded-correction regression

Result: **PASS for the corrected desktop state contract; full verification remains open**.

- The clean path was replayed after the correction and completed at exactly
  **100/100** with 5/5 efficiency.
- A wrong `Memory / GC pressure is primary` diagnosis still reached the
  explanation stage after a complete wrong prediction and correct
  reconciliation.
- The explanation stage visibly preserved the original choice as
  `FROZEN INITIAL HYPOTHESIS` and exposed a separate final-diagnosis choice.
  This is the new revision point required by M07-F02.
- Engine regressions independently reject contradictory final diagnosis state
  and accept a `CPU_SATURATION_PRIMARY` revision while retaining reduced
  initial-diagnosis credit.
- The proof-card loophole is covered by core regressions: E01 + E02 + E07 is
  rejected, while E01 + two resource-specific cards is accepted only when all
  proof cards were inspected.

## Visual inspection

- Wide desktop browser state was inspected at the fresh, prediction, reveal,
  reconciliation and completion stages.
- The UI keeps the result hidden before the run, labels deterministic teaching
  simulation values, exposes the fixed seed, and makes the next action clear
  at every stage.
- No screenshot file was persisted by the browser harness, so no nonexistent
  screenshot path is claimed here.

## Open verification evidence

- Mobile 390×844 runtime capture: **OPEN**.
- Standalone keyboard-only completion: **OPEN**.
- Touch trace: **OPEN**.
- Reduced-motion runtime capture: **OPEN**.
- Screen-reader announcement transcript: **OPEN**.

These are verification debts, not evidence of a known desktop gameplay defect.
