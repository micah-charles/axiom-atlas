# M06 UI/gameplay review — ChatGPT v1 baseline

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Route: `/computer-science/architecture-lab/m06`

## Baseline verdict

The fresh M06 route was understandable but still read primarily as an
evidence worksheet. ChatGPT accepted a bounded visual/gameplay revision built
around a persistent **Admission Flow / Queue Pressure Board**. The board is
the main playable object; evidence cards progressively reveal its signals and
candidate experiments change its admission gate without exposing the answer
before the player acts.

## Accepted design direction

- Show an application-pool admission gate feeding a database-capacity boundary.
- Keep the source facts visible as neutral values: application pool `50` and
  database ceiling `500`; do not call either the bottleneck before evidence.
- Represent queue positions as `APP WAIT` and `DB CONTENTION` lanes.
- Use an instrument rail for `DB CPU`, `THROUGHPUT`, `P95` and `ERRORS`; the
  signals become active progressively and their results remain hidden until a
  controlled run is revealed.
- Preserve the fixed workload as a compact experimental strip:
  `240 requests · 12 s · 20 req/s · seed 20260916`.
- Render the three candidate pool sizes (`10`, `60`, `300`) as visual gate
  cartridges. Width changes are observable; measured results remain hidden
  until the player runs the candidate.
- Replace the prediction select with accessible segmented controls while
  preserving the existing deterministic prediction IDs and scoring contract.
- After reveal, show `PREDICTION → MEASURED` qualitative markers so the player
  can compare a forecast with the result.

## Fresh-state leakage to remove

- Rename `Application-pool wait` to the neutral `Waiting-work probe`; the old
  label disclosed the location of the answer.
- Replace `winning pool` with `candidate results remain hidden`; no candidate
  should be described as the winner before the player tests it.
- Do not show diagnosis, useful concurrency or measured candidate metrics in
  the fresh state.

## Scientific/gameplay constraint

The board is a presentation layer over the existing M06 engine. It must not
invent a new model or change the deterministic result tables. The UI may show
qualitative state labels, but they must be derived from the same engine truth
used by scoring. Runtime/accessibility evidence remains a separate gate and
must not be silently treated as complete by a visual pass.

## Evidence note

The CUA browser returned live screenshots for the baseline, but no persistent
PNG path was available to commit. The baseline is therefore recorded from the
live visual state, accessibility tree and the review response; no PNG is
claimed as repository evidence.
