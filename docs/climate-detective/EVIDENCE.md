# Climate Detective evidence ledger

## Automated evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Climate data generation | pass | `app/games/climate-detective/data/year-2018.json` and `candidate-year-report.json` |
| Candidate-year comparison | pass | `docs/climate-detective/CANDIDATE_YEAR_REPORT.md` |
| Core tests | pass | `npm run test:core` — 157 tests passed |
| Lint | pass | `npm run lint` |
| Production build | pass | `npm test` build stage; Vinext build completed |
| Rendered HTML smoke tests | pass | `npm test` — 2 tests passed |
| M26.1 rendered pointer/touch regression | pass | `verify-m26-1-pointer.cjs` — 10/10 checks passed |
| M28 global circulation unit/model rules | pass | `tests/game-core.test.mjs` — deterministic geometry, pressure belts, cells, Coriolis and wind-belt assertions |
| M28 local browser E2E | pass | `verify-m28-global-circulation.cjs` — desktop Guided/Explore + 390 × 844 mobile, 7 screenshots, `browser-console-m28.json` reports `errors: []` |

## Data evidence

- NASA POWER daily and climatology inputs are recorded in `DATA_SOURCES.md` and embedded in the generated dataset.
- NOAA NCEI OISST v2.1 supplies three North Atlantic SST event samples.
- Natural Earth 1:110m supplies the geographic boundaries in `data/natural-earth-uk-europe.json`.
- Selected year: 2018, chosen by a transparent event-selection heuristic after comparing 2010, 2013, 2018 and 2022.

## Mission 01 recovery evidence

- Local fresh-player browser flow passed at `http://localhost:3001/` on 2026-09-11.
- Guided map sequence passed: Pressure low centre → London wind → London rainfall.
- Deliberate wrong causal link produced `ORDER CHECK`; removing it allowed the five-link chain to be rebuilt.
- Complete chain with a blank note remained locked with visible chain/note/concept reasons.
- Valid field note unlocked forecast; Run +24 hours revealed 16 Jan 2018 and scored 11/14 in the tested pass.
- Browser console errors after the flow: none.
- The same recovery flow passed against the deployed private Site version 110; the reveal showed 16 Jan 2018 and scored 13/14 with an exact next-day forecast.
- The published year then completed Mission 02, Mission 03, and the end-of-year assessment; live browser console errors remained at zero.
- Desktop visual capture: CUA inline capture, 1280×900 viewport, 2026-09-11 (reveal state).
- Mobile visual capture: CUA inline capture, 390×844 viewport, 2026-09-11 (Mission 01 Pressure / Task 1 state).
- Wrong evidence smoke: selecting the H target produces a visible task-specific correction; the H is not pinned.
- Excessive evidence smoke: repeated selection of the L target remains deduplicated at 1/3 notebook clues.
- Hint smoke: the hint is visible and the deterministic scoring test confirms the efficiency reduction.
- Restart/reload smoke: Restart year returns to 1 Jan with empty progress; reload returns safely to the Atlas entry surface.
- Keyboard smoke: Tab reaches the instrument controls and Enter activates a focused map target; the target is exposed as an accessible button.

## M26 investigation gameplay and scientific visualisation V2

Status: VERIFIED — Gameplay E2E / Fresh-player gate PASSES

- Deployed fresh-player replay on 2026-09-12 against Site version 114 reproduced the user-visible failure: after Pressure activation, real pointer clicks on the visible L, H, London and a nearby contour left `0/3 clues pinned` with no feedback.
- Deployed DOM inspection found the visible SVG L around `(560,364)` and the transparent fallback low button around `(442,354)` at the same viewport; the fallback did not cover the visible marker. The parent SVG also captured every pointer for panning.
- Previous E2E was a false positive for this failure class because it selected `.climate-map-target.low/.high` by selector and only asserted `errors: []`; it did not click the visible SVG marker with pointer coordinates.
- M26.1 repaired the root cause: interactive SVG descendants stop pan capture, rendered feature groups own their hit areas, and the legacy HTML map-target overlay is removed.

- Local fresh-player V2 browser run passed on 2026-09-12 against `http://localhost:3001/`; browser console ledger reports `errors: []`.
- Task 1 begins with an investigation objective rather than naming the L; the deterministic hint ladder was verified in order: compare values → follow decreasing values → look west → L marker.
- Pressure source check passed: 2,028 points on 15 Jan 2018, NASA POWER `PS`, MERRA-2 analysis, kPa source values displayed as hPa after explicit conversion. The game continues to label this as surface-pressure data, not sea-level pressure.
- Contour check passed: levels are generated from the focused Britain / North Atlantic low-elevation field at a 4 hPa interval; labels are derived from actual marching-squares segments. The tested level sequence is 96.4–101.6 kPa in 0.4 kPa steps.
- Duplicate-marker check passed: the rendered SVG contains exactly one L and one H centre; the legacy HTML target overlay is absent, so there is one rendered target per feature.
- Post-selection check passed: the selected L emits explicit `Pressure decreases toward 963 hPa` feedback and highlights the nearby derived contours only after the correct discovery.
- Map recovery check passed: a wrong H remains unpinned; wrong Aberdeen selections in Wind and Rainfall show task-specific recovery messages before London pins the correct clues.
- Rendered-pointer regression passed locally 10/10: L circle, L text, 963 hPa label, marker edge, H, London, contour, keyboard, mobile pointer and mobile touch.
- No-hint Mission 01 path passed: 11/14, complete causal chain, field note, forecast, +24-hour historical reveal. The full local year reached 3/3 cases and the end-of-year weather report with 31 points.
- Reveal-state check passed after clearing the selected pressure centre before changing dates: the 16 Jan 2018 actual field shows its own contours and H/L markers without stale selected contours from 15 Jan.
- Desktop and mobile visual inspection passed for the fresh objective, Pressure OFF/ON, Hint 4, selected low, clues complete, Wind, Rainfall, Explain incomplete/feedback, Forecast, Prediction, Reveal, and 390 × 844 Pressure tutorial states.
- Final deployed Chrome replay passed against Site version 116: L circle, H, London, contour, visible Wind/Rain targets, wrong-order recovery, field note, forecast and historical reveal; final result was 12/14 with actual 16 Jan 2018 data.
- App source checkpoint `ffdda035fe8aa3c8afde34871f4e1bc3dab42241` was published as private Site version 114; deployment `appgdep_6aa53d31c3308191a9934757577e4fd5` succeeded at `https://the-axiom-atlas.ckstks246335.chatgpt.site`.
- Exact verified commit `b115812063c78d435defd043037df837574683f6` was published as private Site version 112; deployment `succeeded`, production URL remained `https://the-axiom-atlas.ckstks246335.chatgpt.site`, and owner-only custom access remained one allowed user with no groups.
- Final app commit `a2716f522291005deedae24d50faa679d04ee184` was published as private Site version 116; deployment `appgdep_6aa586a993588191bcb11c64978c6a22` succeeded, production URL remained `https://the-axiom-atlas.ckstks246335.chatgpt.site`, and owner-only custom access remained one allowed user with no groups.

## M27 causal storytelling map

Status: VERIFIED — local browser E2E and deployed fresh-player gate pass.

- Audit result: the former animated `climate-event-pulse` was a UI decoration
  without a legend or scientific meaning, so it was removed. Observation
  locations remain legitimate map symbols and are labelled in the legend.
- The five causal links use semantic IDs and a seeded Fisher–Yates order per
  Explain attempt. The order remains stable while the player builds the chain;
  tests cover multiple seeds and reject the old full answer order.
- Local Explain pass: step 1 reveals the field-derived Atlantic low and nearby
  4 hPa contours; step 2 reveals 14/15/16 Jan London pressure samples and the
  derived low-centre trail; step 3 keeps measured wind vectors visible with
  explicit FROM/arrow TO wording; step 4 adds a labelled Atlantic air path as
  a data-backed interpretation; step 5 adds measured rainfall plus the
  SVG/CSS conceptual moist-air-rise → cooling → condensation → rain inset.
- Local Explain pass also verified Story So Far 0/5 → 5/5, completed-link
  focus, Replay, Previous/Next, wrong-order recovery, removable links, and
  deterministic formative field-note feedback.
- Local browser harness `verify-m27-story.cjs` passed the player path with
  10 screenshots and `browser-console-m27.json` reporting `errors: []`.
- Local Forecast → Reveal pass verified the bridge copy, historical next-day
  data and the same causal story visuals alongside the Reveal record. The
  Reveal story trend remains anchored to 14–16 Jan 2018 while the map record
  correctly advances to 16 Jan.
- Deployed Site version 117 was replayed in the authenticated Chrome Site tab
  from the Atlas entry: real Pressure → Wind → Rainfall discovery, shuffled
  Explain options, deliberate wrong-order feedback, remove/rebuild, causal
  story completion, focus, Replay, field note, Forecast and Reveal all passed.
- Version 117 contains exact source commit
  `85cd9b311d5e75ce611fee884cbfa117b4c006a4`; deployment
  `appgdep_6aa59b292c4c81919ae47dfffc921374` completed with status
  `succeeded` at `https://the-axiom-atlas.ckstks246335.chatgpt.site`.
- Deployed Reveal showed `16 Jan 2018`, `4.0°C`, `985 hPa`, `0.4 mm`, the
  supported `14 Jan → 15 Jan → 16 Jan` pressure trend, the measured wind/rain
  overlays, the Atlantic interpretation and the rainfall teaching inset.
- The deployed map was visually inspected after Reveal in the authenticated
  Chrome tab; the owner-only custom access policy remained one allowed user
  (`Charles Tan`) with no groups. The headless harness remains a local test
  because a separate unauthenticated browser context cannot enter this private
  Site; deployed behavior was verified through the real authenticated browser.
- Scientific boundary: pressure contours and low-centre trail are derived from
  NASA POWER/MERRA-2 `PS`; wind and rainfall are historical daily rows; the
  Atlantic path and vertical rainfall sequence are explicitly labelled derived
  or teaching-model interpretations. No synthetic front is rendered.
- M27 persistent screenshots are in `evidence/m27-*.png`; the deployed browser
  replay was inspected inline in the authenticated Site tab. M27 now passes the
  requested causal-story acceptance gate.

## M28 global atmospheric circulation interactive reference

Status: 🟦 IMPLEMENTED / NEEDS DEPLOYED QA

- Local Mission 01 Explain opens the `🌍 Global wind systems` control beside
  the map zoom controls. The causal cards `Pressure differences strengthen the
  wind` and `Moist maritime air arrives` also expose a contextual `Why is the
  wind from SW?` link.
- Guided lesson passes through six stages: unequal heating, pressure belts,
  three cells, Coriolis deflection, prevailing wind belts, and Britain’s
  Northern mid-latitude westerly context.
- The map uses generated Natural Earth 1:110m world geometry with the
  documented Equal Earth teaching projection. Country boundaries are geographic
  context; pressure belts, cells, Coriolis arrows and wind belts are labelled as
  an idealised climate model.
- The wind-belt inspection card explicitly reports `FROM west → TO east`,
  `30–60°N`, `Subtropical High → Subpolar Low`, and `Ferrel Cell` for the
  Northern mid-latitude westerlies.
- The stage-6 bridge shows the real Mission 01 record for 15 Jan 2018:
  NASA POWER PS-derived `989 hPa`, historical `FROM SW` at `9.3 m/s`,
  `7.1 mm/day`, and NOAA OISST North Atlantic `10.9°C`. The bridge explains
  that the global model is background context while the weather-scale pressure
  field sets the exact day’s flow.
- Local browser replay passed contextual-link return-state preservation at
  `STORY SO FAR · 4/5`, Guided and Explore toggles, the optional wind challenge,
  keyboard Enter/Escape, reduced-motion media, and the 390 × 844 mobile
  viewport. CUA visual inspection confirmed the historical/model separation and
  readable mobile layout.
- Persistent M28 screenshots are in `evidence/m28-global-*.png`; the browser
  ledger is `evidence/browser-console-m28.json`.
- Deployed Site replay and keyboard/reduced-motion audit remain required before
  M28 can be marked VERIFIED.

## Persistent visual evidence

- Capture harness: `scripts/climate-detective/capture-recovery-evidence.cjs`.
- Rendered-pointer harness: `scripts/climate-detective/verify-m26-1-pointer.cjs`; pointer coordinates are derived from visible SVG geometry and application handlers are never invoked directly.
- Desktop Pressure layer: `evidence/mission-01-pressure-desktop.png`.
- Fresh-player objective: `evidence/mission-01-fresh-player-objective-desktop.png`.
- Pressure OFF: `evidence/mission-01-pressure-off-desktop.png`.
- Pressure ON with tutorial, labels and derived contour legend: `evidence/mission-01-pressure-on-desktop.png`.
- Task 1 Hint 4: `evidence/mission-01-task1-hint4-desktop.png`.
- Selected low-pressure centre and highlighted contours: `evidence/mission-01-pressure-low-selected-desktop.png`.
- All three clues pinned: `evidence/mission-01-clues-complete-desktop.png`.
- Desktop Wind layer: `evidence/mission-01-wind-desktop.png`.
- Desktop Rainfall layer: `evidence/mission-01-rainfall-desktop.png`.
- Incomplete Explain state: `evidence/mission-01-explain-incomplete-desktop.png`.
- Explain order feedback: `evidence/mission-01-explain-feedback-desktop.png`.
- Locked Forecast: `evidence/mission-01-forecast-locked-desktop.png`.
- Unlocked Forecast: `evidence/mission-01-forecast-unlocked-desktop.png`.
- Prediction: `evidence/mission-01-prediction-desktop.png`.
- Historical Reveal: `evidence/mission-01-reveal-desktop.png`.
- Mobile 390 × 844 Pressure state: `evidence/mission-01-pressure-mobile.png`.
- End-of-year assessment: `evidence/year-end-assessment-desktop.png`.
- Browser console ledger: `evidence/browser-console.json` (`errors: []`).

Mission 01 recovery evidence remains recorded. M25, M26, M26.1 and M27 are
`✅ VERIFIED` after their respective deployed replays. The broader M24 release
gate and future mission expansion remain separately tracked and intentionally
frozen.
