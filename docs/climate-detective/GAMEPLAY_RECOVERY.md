# Climate Detective: Mission 01 Gameplay Recovery

Last updated: 2026-09-12

## Recovery scope

Mission 01 only. Expansion is frozen until the first investigation passes the
fresh-player gate below. Missions 02 and 03 remain in the repository as
existing content, but no new missions or curriculum modules should be added in
this recovery milestone.

## Reproduced failure

The existing Mission 01 flow was opened in the local preview at
`http://localhost:3001/` and replayed as a fresh player:

1. Enter Climate Detective.
2. Run to the 15 Jan 2018 clue.
3. Pin Surface pressure and Wind.
4. Enter Explain.
5. Add only `Pressure falls` and `A front approaches`.
6. Leave `YOUR FIELD NOTE` blank.

Observed result: `Move to forecast` was disabled, but the interface did not
say why. The source condition was only `chain.length < 2 || answer.trim().length
< 12`. A player could not see whether the missing requirement was a complete
chain, causal order, recognised concepts, or a written field note.

The investigation stage also presented every evidence card as a passive menu.
The map contained a hard-coded dashed `EASTERN FLOW` path while the selected
London observation showed a south-westerly wind. This made the map ambiguous
and did not make the player discover anything on the map.

## Recovery contract

Mission 01 must now make the map the primary investigation surface:

- Task 1: activate the real pressure field and identify the low-pressure
  centre affecting Britain;
- Task 2: activate Wind and inspect the observed point vector over London,
  with an explicit `FROM` convention;
- Task 3: activate Rainfall and inspect the observed wet-day signal over
  Britain;
- only then unlock the causal-chain workspace;
- keep discoveries in a notebook with strong / supporting evidence labels;
- show progressive hints and their effect on efficiency;
- show explicit lock reasons for every incomplete explanation;
- require a complete ordered causal chain and a non-empty field note before
  forecasting;
- allow a deliberately wrong chain to be repaired by removing and replacing a
  link;
- reveal the actual next-day data and explain the score.

## Data integrity decision

The pressure layer uses NASA POWER Daily Regional `PS` values from the MERRA-2
analysis at the API's native regional grid. The generated dataset records the
field coordinates, units, request dates, and source URL. Isobars and L/H
centres are derived from those values by deterministic marching-squares and
local-extrema functions. No decorative or hand-authored pressure lines are
permitted.

The five UK location vectors remain point samples. They are rendered as
meteorological wind vectors: the value is the direction the wind comes FROM;
the arrow points TO the opposite direction. The UI must say this beside the
map and in the legend.

The causal chain distinguishes observed/reanalysis values from explanatory
teaching links. The pressure field, point wind and rainfall are evidence. The
pressure-gradient, moist-air transport, rising-air and condensation links are
the player's deterministic explanation, not additional measurements.

## M26 V2 verification

Status: VERIFIED — DEPLOYED GAMEPLAY GATE PASSES

### Critical Task-1 Interaction Blocker

On 2026-09-12, a fresh player replayed the deployed Site version 114 and
clicked the visible L, H, London and nearby pressure contour with real browser
pointer coordinates. The UI stayed at `0/3 clues pinned`; no success, error,
selection or teaching feedback appeared. This invalidates the previous M26
PASS and blocks Mission 02 expansion.

Root cause identified from the deployed DOM and source:

1. `MapPanel` attaches `onPointerDown` to the whole SVG and calls
   `setPointerCapture()` for every pointer, including pointers beginning on
   pressure centres and location markers. That lets the pan surface swallow the
   child feature's click path.
2. The fallback `.climate-map-target` buttons calculate percentages from the
   1000×610 viewBox but do not account for the SVG's default
   `preserveAspectRatio="xMidYMid meet"` letterboxing. On the deployed 1917×900
   viewport the visible SVG L was around `(560,364)` while the invisible low
   target was around `(442,354)`. The fallback target therefore did not cover
   the visual marker.
3. The first-use pressure tutorial occupied the visible L position, adding a
   third obstruction before it was dismissed.

Affected elements: the SVG `g.climate-pressure-centre`, the parent map SVG
pointer handlers, the invisible `.climate-map-target.low/.high` fallback
buttons, and the absolute tutorial card.

Why automated tests missed it: the prior browser harness clicked the invisible
`.climate-map-target.low/.high` elements by selector rather than clicking the
visible SVG marker with browser coordinates. Its `errors: []` assertion only
checked console/page errors, so it could pass while a human click did nothing.

Fix required: keep the whole visible pressure marker group clickable, stop
pan capture on interactive descendants, align or remove the transformed
fallback overlay, move the tutorial away from the L, add wrong-click teaching
feedback, and assert the visible interaction state before continuing.

Regression test required: visible low circle, L text, 963 hPa text, marker edge,
H feedback, London feedback, contour feedback, touch/keyboard, `1/3` clue
transition and complete deployed Task 1 → Task 2 → Task 3 → Explain → Forecast
→ Reveal replay.

### Resolution verified on 2026-09-12

The deployed blocker is resolved in app commit
`a2716f522291005deedae24d50faa679d04ee184` (private Site version 116,
deployment `appgdep_6aa586a993588191bcb11c64978c6a22`). The fix has four parts:

1. SVG pan capture now exits when the pointer begins inside a pressure centre,
   location marker, Wind/Rain feature or contour.
2. Pressure centres contain a transparent 120×60 SVG hit area around the
   visible circle, symbol and hPa label; Wind and Rain features have equivalent
   rendered SVG hit areas. The visible groups remain keyboard buttons.
3. The tutorial is centred away from the low marker, and the map plus Task 1
   copy explicitly says that weather features can be selected for investigation.
4. The legacy absolute HTML map-target overlay was removed entirely. There is
   now one rendered SVG target per map feature, avoiding duplicate markers,
   mismatched letterboxed coordinates and selector-based false positives.

The pressure investigation now opens with `Find the pressure system` and lets
the player read the field before the L answer is named. A contextual tutorial
explains that the lines join places with equal surface pressure, and the four
optional hints progress from comparing values to the L marker. Contour labels
are generated from the stored field's actual 4 hPa levels. Selecting the real L
adds a single selected SVG centre, explicit decrease-toward-centre feedback,
and a highlight on the nearby derived contour segments. The legacy HTML target
layer is no longer rendered; keyboard and touch use the same visible SVG
feature groups as pointer input.

Local V2 browser and visual QA passed on 2026-09-12. The no-hint Mission 01
path scored 11/14 and the full-year path reached the end-of-year assessment;
wrong H, wrong Wind point and wrong Rainfall point recovery were also tested.
The Reveal transition now clears the selected 15 Jan pressure centre before
rendering the actual 16 Jan field, so highlighted contours cannot leak across
dates. The dedicated rendered-pointer suite passed 10/10 locally, including
mobile touch. The final deployed Chrome replay reached Reveal with `12/14`.

## Mission 01 acceptance checklist

- [x] A new player sees the mission objective and the current task within ten
  seconds.
- [x] The map visibly changes when Pressure, Wind, and Rainfall instruments are
  activated.
- [x] Pressure contours are generated from the stored NASA POWER field and
  include an identifiable low centre.
- [x] Wind arrows are actual point samples and state `FROM` versus arrow `TO`.
- [x] Task 1, 2, and 3 are explicit, sequential, and notebook-driven.
- [x] A wrong causal link can be removed and replaced without resetting the
  investigation.
- [x] The explanation panel shows progress and lists exact lock reasons.
- [x] Full chain + blank field note keeps forecasting locked with a visible
  reason.
- [x] Full chain + valid field note unlocks forecasting.
- [x] Hints are optional, useful, and reflected in the efficiency result.
- [x] Run +24 hours reveals the actual historical next day and the scoring
  dimensions.
- [x] Browser E2E covers visible map targets, wrong H/London/contour recovery,
  Wind/Rain wrong-point recovery, wrong-link recovery, blank-note lock,
  valid-note unlock, forecast and reveal in the local preview and deployed
  private Site.
- [x] Desktop and 390 × 844 visual evidence is captured and linked from
  `PROGRESS.md` as persistent files.

## Browser test contract

The browser test is intentionally written against player-visible labels and
roles, with map clicks performed from the rendered feature geometry rather than
the removed fallback controls:

1. Enter Climate Detective and run to the first clue.
2. Confirm `TASK 1 OF 3` and no passive evidence-card menu.
3. Activate Pressure, click the real low centre, and continue.
4. Activate Wind, inspect London, and continue.
5. Activate Rainfall, inspect Britain, and continue to Explain.
6. Add a wrong link, confirm the order warning, remove it, and complete the
   correct chain.
7. Confirm a blank field note keeps `Move to forecast` disabled and exposes the
   field-note reason.
8. Enter a valid note, confirm the button becomes enabled, forecast, run +24
   hours, and inspect the reveal.

## Recovery gate

Status: VERIFIED

The gate is VERIFIED: implementation, automated tests, fresh-player browser
runs, desktop/mobile visual inspection, and persistent evidence paths are all
recorded in `PROGRESS.md`. Local recovery and the final deployed Site replay
passed on 2026-09-12. The full-year capture also reached the end-of-year
assessment; future mission expansion remains intentionally frozen after this
checkpoint.

## M26 gate

Status: VERIFIED

The previous local/deployed PASS was correctly invalidated by the real-user
pointer failure above. M26.1 repaired the root cause, removed the legacy
fallback overlay, passed the 10-check local rendered-pointer suite, and passed
the final deployed Chrome replay against version 116. M26 can return to
VERIFIED; Mission 02 expansion remains frozen by the stop-and-reassess rule.
