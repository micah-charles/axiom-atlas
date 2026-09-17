# M03 UI Review — Host Boundary Dependency Board

Date: 2026-09-17

## ChatGPT review decision

**Bounded visual revision accepted for implementation; M03 remains 🟨 IN
PROGRESS until runtime evidence is complete.**

ChatGPT reviewed the fresh M03 baseline and the committed source at `df17f2d`.
It could not render the PNG pixels directly through the GitHub connector, so the
review was grounded in the capture description and source/engine inspection.

## Storyline boundary

M01 opens the shop on one host. M02 diagnoses a slow request before redesign.
M03 asks whether the working shop is portable: inspect dependencies, classify
placement, predict the result of moving only application execution, run the
host-boundary experiment, and explain the coupling. M03 does not choose the
next architecture.

## Accepted design direction

- Make a Host-Boundary Dependency Board the persistent playable object.
- Keep fresh-state resource placements unresolved; do not show `APP · DB ·
  files · Session` as an already-known HOST 01 conclusion.
- Represent application, DB, images, Session, DNS and the application package
  with code-native SVG/CSS system objects.
- Let inspected evidence promote unknown tokens into concrete objects and keep
  classification gated until all five evidence items are inspected.
- Highlight HOST 02 as the prediction target without showing consequences.
- Reveal the application move only after the prediction gate. Keep DB, images
  and Session stationary so the experiment communicates the coupling.
- Keep the deterministic M03 engine, classification rules, prediction contract,
  result matching, causal links and scoring unchanged.
- Neutralise the pre-reveal copy so it says what will move, not what will fail.

## Implemented bounded revision

- Added `M03DependencyBoard` with inline SVG/CSS glyphs and a persistent host
  boundary.
- Added unknown/inspectable dependency tokens and outside-boundary DNS/package
  objects.
- Removed the fresh-state placement leak from the old host diagram.
- Added HOST 02 target highlighting for prediction/run and an actual moved-app
  state from reveal onward.
- Updated prediction/run copy to keep consequences hidden until the experiment.
- Added responsive host-board styles and reduced-motion-compatible CSS.

## Remaining verification gates

- complete fresh-player desktop flow through explanation;
- 390×844 completion;
- keyboard-only completion;
- touch interaction evidence;
- reduced-motion evidence;
- screen-reader/semantic evidence.

## Evidence

See `evidence/ui-review/m03-README.md` for the baseline, observe, inspection
and classification captures.
