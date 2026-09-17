# M07 visual-loop evidence

Mission: `M07 — The 5-Second Tomcat`  
Route: `/computer-science/architecture-lab/m07`  
Implementation commit: `70b4c63`

## Evidence captured

- Fresh M07 baseline was reviewed before implementation; the accepted bounded
  direction is recorded in `reviews/M07-ui-review-chatgpt-v1.md`.
- The implementation adds a persistent Five-Second Request / Host Pressure
  Board with one request symptom, three resource-family lanes and scope-only
  diagnostic probes.
- E01–E07 were inspected in a fresh local route. The board showed the source-
  backed symptom, CPU/runnable evidence, the real but bounded GC event and
  recovery, weak I/O support, and explicit `NOT CAPTURED / UNKNOWN ≠ ZERO`.
- The Compute + wait probe was selected; qualitative predictions were locked
  before reveal, the deterministic result was revealed, and the frozen forecast
  was reconciled against the measured fields.
- The causal chain, evidence links, alternative comparison and conclusion were
  completed; the local route reached `MISSION COMPLETE` and `LAB SCORE 100/100`.
- ChatGPT's post-implementation review is recorded in
  `reviews/M07-ui-review-chatgpt-v2.md` and returned presentation PASS.

## Board evidence

The replay confirmed the intended separation:

- symptom: `~50 ms → ~5 s`;
- evidence families: Compute, Memory / GC, Wait / I/O;
- missing evidence: `RETENTION HISTORY · NOT CAPTURED`;
- probe scope before result;
- prediction frozen before reveal;
- observed value and qualitative direction after reveal.

No engine IDs, run definitions, result tables, reconciliation rules or scoring
semantics were changed.

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
