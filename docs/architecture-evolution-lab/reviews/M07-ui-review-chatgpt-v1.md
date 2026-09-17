# M07 UI/gameplay review — ChatGPT v1 baseline

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Route: `/computer-science/architecture-lab/m07`

## Baseline verdict

The fresh M07 route is readable but still presents the investigation as a
stacked incident/evidence worksheet. ChatGPT accepted a bounded visual
revision centred on one persistent **Five-Second Request / Host Pressure
Board**. The board should make the core question visible: which resource
family best explains why the request stalls on the application host?

## Accepted design direction

The board should show:

- request symptom: `~50 ms normally → ~5 s incident`;
- one application-host object with three competing lanes: `COMPUTE`,
  `MEMORY / GC` and `WAIT / I/O`;
- progressively revealed measurements inside those lanes;
- the separate DB host as subdued topology context, not as a conclusion;
- diagnosis only after the evidence gate opens.

Do not draw a literal five-second decomposition because the engine does not
provide causal millisecond allocation. The board should communicate competing
resource-family support, not pretend to measure where each millisecond went.

## E01–E07 progression

- E01 unlocks the symptom strip and leaves all three cause lanes unresolved.
- E02 activates Compute and reveals CPU `100%`, without marking it primary.
- E03 activates Memory/GC with a neutral Full-GC event marker.
- E04 adds runnable work `3 → 24` and compute `96–100%`.
- E05 shows `68% → 82% → Full GC → 69%`, demonstrating a real GC event
  without proving sustained retention.
- E06 reveals I/O wait `3%` and socket blocked `2 / 200`, making that lane
  measured but comparatively weak.
- E07 is a first-class missing-data tile:
  `RETENTION HISTORY · NOT CAPTURED · UNKNOWN ≠ ZERO`.

## Diagnostic probes and prediction

Present the three existing run IDs as probe instruments attached to the
corresponding lanes. Before prediction/reveal, show only measurement scope:

- compute + wait: CPU, runnable, I/O, socket;
- GC + retention: GC, heap pre/post, retention;
- thread state: runnable, socket, file I/O, CPU.

The selected probe should accept qualitative forecast markers before the run.
After reveal, freeze the forecast and show predicted versus observed direction,
including the distinct `MISSING EVIDENCE` reconciliation state for
`NOT_CAPTURED`. Do not introduce telemetry before the deterministic result is
revealed.

## Fresh-state wording

The observed `~50 ms → ~5 s` is a symptom, not a leak. CPU and Full-GC labels
are acceptable as competing evidence-family names while their measurements are
hidden. Keep the DB-host continuity statement subordinate and never phrase it
as “DB healthy” or “DB excluded.” ChatGPT suggested the player-facing title
`M07 — FIVE-SECOND REQUEST` because `FIVE-SECOND TOMCAT` can sound like the
fault has already been identified.

## Acceptance criteria and open gates

Presentation is accepted when no fresh state marks CPU, GC or I/O as the
winner; inspected evidence progressively transforms the same board; E07 is
visibly missing rather than zero; probes expose scope without result values;
predictions are frozen before reveal; and all displayed measurements come from
`M07_RUN_RESULTS`.

The separate verification gates remain open for 390 × 844, keyboard-only,
touch, reduced-motion and screen-reader runtime evidence.

## Evidence note

The CUA browser returned a live screenshot and accessibility tree for the fresh
route, but no persistent PNG path was available to commit. No PNG is claimed
as repository evidence.
