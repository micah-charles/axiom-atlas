# Climate Detective: Mission 01 Gameplay Recovery

Last updated: 2026-09-11

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

## Mission 01 acceptance checklist

- [ ] A new player sees the mission objective and the current task within ten
  seconds.
- [ ] The map visibly changes when Pressure, Wind, and Rainfall instruments are
  activated.
- [ ] Pressure contours are generated from the stored NASA POWER field and
  include an identifiable low centre.
- [ ] Wind arrows are actual point samples and state `FROM` versus arrow `TO`.
- [ ] Task 1, 2, and 3 are explicit, sequential, and notebook-driven.
- [ ] A wrong causal link can be removed and replaced without resetting the
  investigation.
- [ ] The explanation panel shows progress and lists exact lock reasons.
- [ ] Full chain + blank field note keeps forecasting locked with a visible
  reason.
- [ ] Full chain + valid field note unlocks forecasting.
- [ ] Hints are optional, useful, and reflected in the efficiency result.
- [ ] Run +24 hours reveals the actual historical next day and the scoring
  dimensions.
- [x] Browser E2E covers the happy path, wrong-link recovery, blank-note lock,
  and valid-note unlock in the local preview.
- [ ] Desktop and 390 × 844 visual evidence is captured and linked from
  `PROGRESS.md` as persistent files.

## Browser test contract

The browser test is intentionally written against player-visible labels and
roles rather than implementation selectors:

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

Status: LOCAL PASS / DEPLOYED VERIFICATION PENDING

The gate becomes VERIFIED only after implementation, automated tests, a
fresh-player browser run, desktop/mobile visual inspection, and persistent
evidence paths are recorded in `PROGRESS.md`. The local flow passed on
2026-09-11; the current recovery checkpoint still needs to be saved and
deployed to the private Site before the final status can change.
