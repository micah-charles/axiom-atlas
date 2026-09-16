# M08 Desktop Playtest QA

Date: 2026-09-17
Route: `http://localhost:3001/computer-science/architecture-lab/m08`
Viewport: Chrome desktop CUA session
Status: Desktop gameplay PASS; full verification still pending

## Canonical path

- Fresh route opened with neutral incident copy and no diagnosis/result table
  leakage.
- Begin investigation exposed seven evidence cards.
- All E01–E07 cards were inspected; the UI showed `7/7 REQUIRED` and did not
  unlock diagnosis earlier.
- CPU hypothesis was submitted with E01, E03 and E05 proof.
- `SIMPLIFY_COMPUTE` was selected.
- Predictions were committed before reveal: CPU LOW, queue LOW, latency LOW,
  throughput HIGH.
- Reveal displayed the fixed result row: 72% CPU, 8 queued requests, 340 ms
  p95, 172 req/s.
- All four outcomes were reconciled explicitly.
- The causal chain was reordered to demand → compute work → CPU saturation →
  queueing.
- The final diagnosis remained visibly `FROZEN INITIAL HYPOTHESIS`.
- Both bounded-conclusion checks were selected.
- Completion displayed `100/100`, with all score categories at their maximum.

## Wrong-path recovery

- Fresh replay started with `MEMORY_GC_PRIMARY`, using valid memory proof.
- The complete wrong hypothesis reached prediction, run, reveal and
  reconciliation rather than dead-ending.
- After reconciliation, the player selected CPU as
  `REVISION AFTER EVIDENCE`.
- Completion was allowed only after the causal chain and bounded explanation
  matched CPU.
- The final score was `90/100`: the initial diagnosis stayed frozen at 5/15,
  proving that revision does not rewrite diagnosis history.

## Result

PASS for the desktop gameplay contract and source-level M08 invariants.
Mobile 390px completion, standalone keyboard-only completion, touch,
reduced-motion and screen-reader evidence remain open and must be captured
before M08 can become VERIFIED.
