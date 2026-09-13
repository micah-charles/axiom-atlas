# Climate Detective Progress

Last updated: 2026-09-13
Current milestone: M28 Global Atmospheric Circulation Interactive Reference — VERIFIED
Current blocker: none; Mission 01 and M27 remain protected baselines
Next action: keep Mission 02 expansion frozen and reassess the next curriculum milestone separately

## Mission status

- M00 Repository discovery ✅
- M01 Data research ✅
- M02 Data pipeline ✅
- M03 Map 🟦
- M04 Time engine 🟦
- M05 Seasonal Earth system 🟦
- M06 Climate layers 🟦
- M07 Core game loop 🟦
- M08 Investigation events 🟦
- M09 Causal chain builder 🟦
- M10 Written answers 🟦
- M11 Forecast mechanic 🟦
- M12 Scoring 🟦
- M13 Investigation efficiency 🟦
- M14 Normal vs actual 🟦
- M15 Weather report 🟦
- M16 Knowledge coverage 🟨
- M17 Microclimate ⬜
- M18 Mystery year ⬜
- M19 Game feel ⬜
- M20 Mobile ⬜
- M21 Scientific QA 🟨
- M22 Gameplay QA ⬜
- M23 Evidence 🟨
- M24 Vertical-slice gate 🟨
- M25 Mission 01 gameplay recovery ✅
- M26 Investigation gameplay & scientific visualisation V2 ✅
- M26.1 Critical map interaction recovery ✅
- M27 Causal storytelling map ✅
- M28 Global atmospheric circulation interactive reference ✅

## Current work

The vertical slice lives in `app/games/climate-detective/` and launches as a separate Climate Detective surface from the Atlas map. Existing 15-world registry and advanced-world infrastructure remain unchanged. M25 Mission 01 recovery, M26.1 visible-pointer recovery and M27 causal storytelling remain verified. Mission 02 expansion remains frozen for the required stop-and-reassess.

M28 is now scoped as a reusable reference opened from Mission 01. It will use
Natural Earth global country geometry with an Equal Earth projection. Its
idealised pressure belts, circulation cells and wind belts will be stored as a
teaching model, separate from the NASA POWER/MERRA-2 historical weather data.
The first implementation preserves Mission 01 state while open and returns to
the same causal map evidence. A real-user replay found that production version
119 rendered the selected `NH · toward equator` Coriolis arrow upward, even
though its copy correctly described motion from 30°N toward the equator. The
root cause was hard-coded SVG y-coordinates (and a mirrored Southern Hemisphere
curve rule), not the climate model. The corrected implementation derives
endpoints from the selected latitudes, adds a visible route label, and passes
geometry assertions for all four examples. Production version 120 has now
passed the same four live SVG direction checks and the contextual-link replay.
No new mission expansion was started.

## Completed since last checkpoint

- Inspected package scripts, Vinext/Vite build, React entry point, existing game engines, world registry, tests, CSS and Sites manifest.
- Chosen 2018 after the data-selection report and official Met Office cross-check.
- Researched NASA POWER for daily/monthly meteorological data and NOAA OISST for North Atlantic SST.
- Created the master implementation plan and granular mission checklist.
- Compared 2010, 2013, 2018 and 2022 with the reproducible candidate-year heuristic; 2018 scored highest.
- Generated 365 daily rows for five UK locations, monthly normals/anomalies, three mission event records and three NOAA OISST samples.
- Added the real Natural Earth map, date-indexed clock, evidence instruments, causal chain, deterministic written-answer evaluator, forecast reveal and multi-dimensional scoring.
- Added climate-specific tests and completed lint, build and rendered HTML smoke checks.
- Reproduced and repaired the Mission 01 forecast lock with exact visible reasons.
- Added a NASA POWER regional surface-pressure field, deterministic contours and L/H centres, without decorative isobars.
- Replaced passive Mission 01 evidence browsing with sequential Pressure → Wind → Rainfall map tasks.
- Added strong/supporting notebook evidence, FROM/TO wind convention, causal-chain recovery, hint accounting and field-note validation.
- Completed a fresh-player local browser pass including deliberate wrong-link recovery, blank-note lock, valid-note unlock and historical reveal.
- Completed the same Mission 01 recovery flow against the deployed private Site version 110; console errors were absent and the reveal scored 13/14 with an exact next-day forecast.
- Continued the published 2018 year through Mission 02, Mission 03, and the end-of-year weather report; the final assessment showed 3/3 cases solved and 33 field points.
- Added deterministic coverage for wrong evidence, deduplicated excessive evidence, and hint efficiency scoring.
- Added a reproducible isolated browser capture harness and persistent visual evidence for the recovery states and year-end assessment.
- Fixed the final assessment banner so the end-of-year report is not mislabeled as the previous mission.
- Read the M26 V2 mission and added its granular implementation checklist before code changes.
- Verified that the visible duplicate `L/H` markers come from one SVG centre plus one HTML hit-target overlay; the data engine itself returns one low and one high centre.
- Verified that the stored 15 Jan 2018 pressure field contains 2,028 NASA POWER `PS` points and that the displayed 963 hPa / 1018 hPa values are derived from the field, not authored display values.
- Removed the duplicate visible pressure markers while retaining transparent keyboard/touch hit targets.
- Added field-derived 4 hPa contour levels and representative labels, plus post-discovery contour highlighting and a surface-pressure reading tutorial.
- Replaced answer-following Task 1 copy with a progressive no-hint → Hint 4 ladder.
- Completed fresh-player browser and visual QA: wrong H, four pressure hints, correct L, wrong Wind point, correct London wind, wrong Rainfall point, correct London rainfall, causal-order repair, blank-note lock, forecast and historical reveal.
- Confirmed the no-hint Mission 01 path scores 11/14; the full local year reaches 3/3 cases, the end assessment, and 31 points with zero browser console errors.
- Fixed the Reveal transition so the selected pressure centre is cleared before the map advances to 16 Jan 2018; the actual next-day field now displays without stale selected contours from 15 Jan.
- Replayed the complete M26 browser capture after the Reveal fix: 17 persistent PNGs, desktop/mobile states, full-year assessment, and `browser-console.json` with `errors: []`; source checkpoint is `739fe84d06fcf3dc6672f1c0175620e59ebd5989`.
- Published the exact verified commit `b115812063c78d435defd043037df837574683f6` to the existing private Site as version 112; deployment status succeeded and the live URL remained `https://the-axiom-atlas.ckstks246335.chatgpt.site`.
- Reopened M26 after a real-user deployed replay showed `0/3 clues pinned` remained unchanged after clicking the visible L, H, London and nearby contour.
- Confirmed on deployed version 114 that the visible SVG pressure centre receives the browser hit, while the invisible HTML target is positioned at a different coordinate because the SVG uses default `preserveAspectRatio` letterboxing; the parent SVG also captures every pointer on `pointerdown` for panning.
- Recorded M26.1 as the active blocker; no Mission 02 expansion is being started.
- Added an interactive-descendant guard so the SVG pan surface cannot capture pointer input that begins on a map feature.
- Replaced the mismatched fallback hit geometry with rendered SVG hit areas: the visible pressure group has a 120×60 viewBox target, and Wind/Rain signals have full feature hit areas with keyboard activation.
- Moved the pressure tutorial away from the low centre, added the visible map interaction instruction, and added wrong H, London and contour teaching feedback.
- Removed the legacy HTML map-target overlays entirely, so the accessibility tree and pointer path contain one rendered target per feature.
- Added `verify-m26-1-pointer.cjs`: visible circle, L text, 963 hPa label, edge, H, London, contour, keyboard, mobile pointer and mobile touch checks all pass.
- Replayed the complete local flow through Task 1 → Task 2 → Task 3 → Explain → Forecast → Reveal and the full 2018 year; the end assessment reached 3/3 cases and 31 points with zero browser console errors.
- Published exact app source commit `a2716f522291005deedae24d50faa679d04ee184` as private Site version 116; deployment `appgdep_6aa586a993588191bcb11c64978c6a22` succeeded.
- Replayed version 116 in the deployed Chrome tab with real pointer coordinates: L circle, H, London, contour, Wind, Rain, wrong-order recovery, forecast and reveal all produced visible results.
- Started M27 after a local Explain audit: the former animated event pulse was an unexplained circle and has been removed; legitimate observation locations remain labelled in the map legend.
- Added one-per-attempt semantic causal shuffling, deterministic prefix progression, targeted wrong-order feedback, formative field-note feedback and a visible Forecast bridge.
- Added progressive story visuals: data-derived low and contours, daily pressure trend/low-centre trail, measured wind FROM/TO vectors, labelled Atlantic air-mass interpretation, and a clearly marked SVG/CSS teaching-model rainfall inset.
- Added Story So Far, completed-link focus, Replay, Previous and Next controls; added reduced-motion protection for automatic replay and anchored the Explain story dates to 14–16 Jan 2018 during Reveal.
- Local M27 Explain → Forecast → Reveal visual pass completed; deployed version 117 replay also passed with the same causal visuals beside the actual historical Reveal.
- Read and accepted the M28 scope: interactive global atmospheric circulation,
  progressive Guided/Explore modes, Coriolis demos, wind FROM convention,
  Britain context, and a real 15 Jan 2018 bridge; the supplied mock-up remains
  a design reference only.
- Confirmed the current checkout has no global geometry asset. Extended the
  existing Natural Earth preparation script to emit the complete 1:110m
  admin-0 world geometry alongside the regional Mission 01 subset.
- Selected Equal Earth for the teaching map to avoid Web Mercator’s misleading
  polar distortion; the projection decision and source provenance remain
  documented in the M28 plan and data-source notes.
- Added `global-circulation.ts` as a separate deterministic teaching model for
  latitude bands, idealised pressure belts, Hadley/Ferrel/Polar cells, Coriolis
  deflection examples, and wind belts with explicit FROM → TO conventions.
- Added `GlobalWindSystems.tsx` with a six-stage Guided lesson, controlled
  Explore mode, Coriolis OFF/ON demo, optional Predict the Wind challenge,
  clickable wind-belt cards, Britain/North Atlantic context, and a historical
  15 Jan 2018 bridge that keeps model and daily weather provenance separate.
- Added the Mission 01 map launch control and causal-story contextual links;
  closing the reference preserves Explain progress and highlights the real
  historical FROM SW wind evidence.
- Added M28 unit coverage and `verify-m28-global-circulation.cjs`; local
  desktop + 390 × 844 browser replay passed with eight screenshots and zero
  console/page errors.
- Added an explicit M28 stage-5 reading guide: the curved yellow arrow is one
  selected pressure-gradient teaching example, while horizontal arrows are
  the broad surface wind belts; the copy states that corresponding branches
  exist in both hemispheres. The browser harness asserts these labels.
- Added an NH winter/summer context control. It illustrates a small broad
  seasonal migration of the idealised pressure, cell and wind-belt layers,
  labels the shift as a teaching model, and keeps daily UK wind tied to the
  weather-scale pressure pattern.
- Published the exact tested M28 app commit `ef28acb827e930fe8191390046a2ceab97fc7ac9`
  as private Site version 119; the deployment succeeded at
  `https://the-axiom-atlas.ckstks246335.chatgpt.site`.
- Replayed production version 119 from a fresh Atlas entry: the global launch
  control, all six Guided stages, Northern westerly belt card, historical
  bridge, Explore mode, Mission 01 visible L/Wind/Rainfall targets, Explain
  contextual link, and return-state highlight all passed in the authenticated
  Chrome Site tab.
- Recorded a real-user M28 regression: on production version 119, selecting
  `NH · toward equator` showed the map arrow travelling upward from the
  subtropical belt toward the subpolar belt. This was a visual direction bug;
  the intended scientific statement remained `30°N → equator`.
- Fixed the Coriolis map and demo arrows to use latitude-derived endpoints and
  hemisphere-aware screen deflection. Added four deterministic latitude-route
  unit assertions and rendered SVG endpoint assertions to the browser harness.
- Local corrected replay passed with the new
  `evidence/m28-global-02-coriolis-nh-equatorward.png`; corrected production
  replay passed in Site version 120.
- Published exact corrected app source commit
  `5d5d6829ea7f89611c5e6cca989375e775faa45d` as private Site version 120;
  deployment `appgdep_6aa7187e0968819198e5a19a1629b622` succeeded at
  `https://the-axiom-atlas.ckstks246335.chatgpt.site`.
- Replayed production version 120 from a fresh Climate Detective entry:
  opened Global Wind Systems, reached the Coriolis stage, inspected all four
  example routes, and confirmed `NH · toward equator` renders `30°N → equator`
  with SVG y increasing from `155.79` to `260`. The other routes also matched
  their selected hemisphere and pole/equator direction. Mission 01 contextual
  return-state was preserved after closing the reference.
- Published the tested arrow-semantics clarity patch `fc83387ff8145dd626d5583a6bada0a674ee2e19`
  as private Site version 121; deployment
  `appgdep_6aa7216c2b188191801de866aee7bdc8` succeeded at the existing Site URL.
- Fresh production v121 replay reached stage 5 and visibly confirmed the
  `HOW TO READ THE ARROWS` guide, including the distinction between the
  selected curved H → L teaching path and horizontal wind-belt arrows and the
  statement that corresponding branches exist in both hemispheres.
- Published exact M27 commit `85cd9b311d5e75ce611fee884cbfa117b4c006a4` as private Site version 117; deployment `appgdep_6aa59b292c4c81919ae47dfffc921374` succeeded and owner-only access remained unchanged.
- Started M27 after a local Explain audit: the former animated event pulse was an unexplained circle and has been removed; legitimate observation locations remain labelled in the map legend.
- Added one-per-attempt semantic causal shuffling, deterministic prefix progression, targeted wrong-order feedback, formative field-note feedback and a visible Forecast bridge.
- Added progressive story visuals: data-derived low and contours, daily pressure trend/low-centre trail, measured wind FROM/TO vectors, labelled Atlantic air-mass interpretation, and a clearly marked SVG/CSS teaching-model rainfall inset.
- Added Story So Far, completed-link focus, Replay, Previous and Next controls; added reduced-motion protection for automatic replay and anchored the Explain story dates to 14–16 Jan 2018 during Reveal.
- Local M27 Explain → Forecast → Reveal visual pass completed; deployed M27 replay and persistent evidence remain pending.

## Tests

- `npm run test:core`: 157 tests passed, including M28 geometry/model rules,
  Climate Detective data/rules, causal-story shuffle/prefix feedback,
  recovery-lock, and wrong/excessive/hint scoring tests.
- `npm run lint`: passed.
- `npm test` build stage: Vinext build completed; only a non-fatal >500 kB chunk warning remains.
- `npm test` rendered HTML stage: 2 tests passed.
- `node scripts/climate-detective/verify-m26-1-pointer.cjs`: 10/10 rendered-pointer, keyboard and touch checks passed locally.
- `node scripts/climate-detective/capture-recovery-evidence.cjs`: complete local Mission 01 + full-year flow passed; `browser-console.json` reports `errors: []`.
- `node scripts/climate-detective/verify-m27-story.cjs`: desktop causal-story, wrong-order repair, focus/replay, field note, Forecast → Reveal, 390 × 844 reduced-motion flow passed; 10 screenshots captured; `browser-console-m27.json` reports `errors: []`.
- `node scripts/climate-detective/verify-m28-global-circulation.cjs`: local
  desktop Guided/Explore, Coriolis demo, wind-belt selection, historical
  bridge, Explain return-state, keyboard Enter/Escape, reduced-motion media,
  390 × 844 mobile flow passed; nine M28 PNGs captured; the harness now
  checks all four rendered Coriolis motion directions and the wind-belt
  arrow-reading guide;
  `browser-console-m28.json` reports `errors: []`.
- Deployed Site version 120: production CUA replay and live SVG inspection
  passed all four Coriolis routes and the Mission 01 contextual-link return
  path; no production console/page error was observed.
- Deployed Site version 121: fresh Climate Detective entry and stage-5 visual
  copy check passed; the new wind-belt reading guide was present and no
  production page error was observed.
- Deployed Site version 122: fresh Climate Detective entry, stage-5 NH winter
  state, and NH summer toggle/visual copy check passed; no production page
  error was observed.
- Deployed Chrome replay: version 116 reached Reveal with `16 Jan 2018`, actual `4.0°C / 985 hPa / 0.4 mm`, and `12/14`.
- M28 verification checkpoint: core tests, lint, build,
  keyboard/reduced-motion checks, local browser harness, corrected local visual
  inspection, and the deployed version 120 fresh-player replay all pass. The
  prior deployed version 119 replay passed interaction coverage but failed the
  newly observed visual-direction gate; version 120 fixes and verifies it.

## Evidence

- Official source notes: `docs/climate-detective/DATA_SOURCES.md`
- Scientific decisions: `docs/climate-detective/SCIENTIFIC_ASSUMPTIONS.md`
- Gameplay brief: `docs/climate-detective/GAME_DESIGN.md`
- Candidate-year decision: `docs/climate-detective/CANDIDATE_YEAR_REPORT.md`
- Evidence ledger: `docs/climate-detective/EVIDENCE.md`
- Generated dataset: `app/games/climate-detective/data/year-2018.json`
- Recovery contract and acceptance checklist: `docs/climate-detective/GAMEPLAY_RECOVERY.md`
- Local browser captures: desktop fresh-player/V2 flow and mobile 390×844 Task 1 pressure state, 2026-09-12.
- Deployed Site: `https://the-axiom-atlas.ckstks246335.chatgpt.site` — version 116, exact app commit `a2716f522291005deedae24d50faa679d04ee184`, deployment `appgdep_6aa586a993588191bcb11c64978c6a22` succeeded 2026-09-12; owner-only custom access preserved.
- Additional browser smoke: wrong H target feedback, duplicate clue deduplication, hint, Restart, reload, and keyboard map-target activation, 2026-09-11.
- Persistent screenshot set: `docs/climate-detective/evidence/` (17 PNGs plus `browser-console.json`; latest local capture completed with `errors: []`).
- M28 local screenshots: `evidence/m28-global-01-stage-heating.png`,
  `m28-global-02-coriolis-nh-equatorward.png`, `m28-global-02-coriolis.png`,
  `m28-global-03-westerlies.png`,
  `m28-global-04-historical-bridge.png`, `m28-global-05-context-return.png`,
  `m28-global-06-explore.png`, and `evidence/m28-global-07-mobile.png`;
  console ledger is `evidence/browser-console-m28.json` with `errors: []`.
- M26 V2 evidence: `docs/climate-detective/evidence/` contains fresh objective, Pressure OFF/ON, Hint 4, selected-low, clues-complete, Wind, Rainfall, Explain incomplete/feedback, Forecast locked/unlocked, Prediction, Reveal, mobile and year-end screenshots; `browser-console.json` records `errors: []`.
- M26.1 pointer evidence: `verify-m26-1-pointer.cjs` records 10/10 local checks; deployed replay recorded visible-coordinate results for L circle, L text, 963 hPa label, marker edge, H, London, contour, Wind, Rain, keyboard, Task 1–3 and Reveal.
- App source checkpoint `ffdda035fe8aa3c8afde34871f4e1bc3dab42241` was published as private Site version 114; deployment succeeded at `https://the-axiom-atlas.ckstks246335.chatgpt.site`.

## Known problems

- The current atmospheric data is NASA POWER/MERRA-2 gridded analysis rather than a station observation or operational forecast; the UI labels this explicitly.
- ERA5 is deferred because the CDS download path requires account-backed access in this environment.
- The M26.1 interaction blocker is resolved and the deployed Gameplay E2E / Fresh-player gate is verified. The earlier `errors: []` result remains documented as a false positive because it proved console silence, not visible pointer success.
- The broader M24 release gate, curriculum coverage and future mission expansion remain separately tracked and frozen.
- M27 verified gate: a fresh deployed player saw each causal reveal, recovered from wrong order, used focus/replay, completed the field note and reached the historical Reveal with the same story visuals.
- M28 is verified locally and in deployed private Site version 122. The
  reference uses an intentionally idealised, static circulation teaching model;
  it does not claim to be a daily observed global wind analysis, and
  friction/geostrophic dynamics are named as weather-scale factors rather than
  animated as a full solver. Production version 119 remains recorded as the
  superseded arrow-direction regression.

## Decisions needed

- None at this checkpoint. A decision gate will be raised only if authoritative data or licensing materially conflict.

## Next three actions

1. Keep the M07 stop-and-reassess rule active before adding further missions.
2. Review the deployed M28 reference with a real learner or teacher.
3. Choose the next curriculum milestone only after that gameplay review.
