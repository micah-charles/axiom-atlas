# M03 UI review evidence

Route: `http://localhost:3001/computer-science/architecture-lab/m03`  
Branch: `feature/architecture-evolution-lab`

| Capture | State | What it verifies |
| --- | --- | --- |
| `m03-current-before.png` | fresh observe baseline | previous text/card-heavy flow; HOST 01 still listed with APP · DB · files · Session |
| `m03-after-observe.png` | fresh observe after revision | persistent host-boundary board; application is visible but dependency placements are unresolved |
| `m03-after-inspection.png` | all five evidence inspected | DNS and app package become visible system objects; classification remains locked until the explicit board action |
| `m03-after-classify.png` | correct dependency map | DB, Images and Session appear as HOST 01 objects; E04 is shown in the outside/not-proven-local shelf |
| live CUA viewport capture | pre-reveal run state | HOST 02 is an explicit target; the application is the only object marked to move and consequences remain hidden |
| live CUA viewport capture | reveal state | Application is shown on HOST 02 while DB, Images and Session remain on HOST 01; the qualitative result asks the player to reconcile each consequence with evidence |

The M03 gameplay contract remains:

`inspect dependencies → classify placement → predict host-boundary outcome → run experiment → explain coupling`

This packet is desktop evidence at the current 150% readability target. The
pre-reveal and reveal states were inspected live through the browser automation
viewport; the current browser backend returned those captures as transient
image bytes rather than writing them into the repository. The M03 mobile,
keyboard-only, touch, reduced-motion and screen-reader gates remain open until
a mission-specific flow is exercised.

Presentation review result: PASS after commit `811c31d`. Full mission status
remains NEEDS QA until the separate runtime/accessibility evidence is captured.
