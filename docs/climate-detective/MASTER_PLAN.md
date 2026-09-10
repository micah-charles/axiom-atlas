# Climate Detective: A Year on Earth

## Product goal

Build a genuinely playable data-driven investigation game inside Axiom Atlas. The first release is a UK / North Atlantic historical-year vertical slice:

> Observe → Investigate → Explain → Predict → Advance time → Reveal → Score → Reflect

The game is not a climate dashboard. Real historical inputs create the mystery; deterministic mission rules turn those inputs into evidence and outcomes.

## Chosen integration surface

- Existing host: Axiom Atlas (`React 19 + TypeScript + Vinext/Vite`).
- New game module: `app/games/climate-detective/`.
- Host entry point: `app/MathLogicGame.tsx` adds a separate Climate Detective launch surface without changing the existing 15-world registry contract.
- Documentation and evidence: `docs/climate-detective/`.
- Hosting: reuse the existing Sites project recorded in `.openai/hosting.json`; do not create a second Site for the same checkout.

## First scenario decision

Candidate years were compared from downloaded NASA POWER daily/monthly inputs before the scenario was treated as final. The selected year is **2018**: it won the transparent event-selection heuristic after comparing 2010, 2013, 2018 and 2022, and the official Met Office account documents the late-February / early-March cold spell (“Beast from the East”), an unusually warm summer, and Atlantic storm/depression events.

## Vertical-slice scope

The first playable slice will include:

- published Natural Earth geographic boundaries for UK / Europe / North Atlantic context;
- one historical year and a compact static dataset generated from an authoritative API;
- daily temperature, pressure, wind, precipitation, seasonal context, anomaly vs a documented baseline, and one real North Atlantic SST point;
- a day / week / month clock with pause-on-event;
- three investigation events, including a cold-snap evidence mission, an Atlantic-depression forecast/reveal, and a warm-anomaly mission;
- evidence selection, causal-chain ordering with click/tap fallback, short written explanation evaluation, prediction controls, reveal comparison, and multi-dimensional scoring;
- end-of-year weather-report assessment;
- responsive desktop and 390×844 mobile layouts;
- deterministic pure functions and automated data/gameplay tests.

## Mission status

Legend: ⬜ not started · 🟨 in progress · 🟦 implemented / needs QA · ✅ verified · ⛔ blocked

### M00 — Repository & product discovery ✅

- [x] Inspect framework, routing, UI architecture, state, tests, build and Sites manifest.
- [x] Identify reusable Axiom Atlas shell, `useAudio`, progress persistence, responsive CSS and pure-engine conventions.
- [x] Choose non-invasive integration point that preserves 15-world / 600-mission tests.
- [x] Document architecture decision and known constraints.

### M01 — Authoritative data research ✅

- [x] Compare HadUK-Grid, ERA5, NASA POWER and NOAA OISST as candidate sources.
- [x] Record provider, dataset, URLs, licence, resolution, variables, units and coverage.
- [x] Download candidate-year inputs and generate comparison report.
- [x] Confirm final historical year from the report: 2018.

### M02 — Data model & ingestion pipeline ✅

- [x] Define observed/reanalysis, climatology, derived and teaching-model types.
- [x] Add reproducible NASA POWER + NOAA OISST fetch script.
- [x] Validate missing values, units, dates and coordinates before output.
- [x] Emit compact static game JSON and candidate-year report.
- [x] Add pipeline/data-contract tests.

### M03 — Real-world map 🟦

- [x] Use filtered Natural Earth 110m country boundaries.
- [x] Document public-domain provenance and equirectangular projection choice.
- [x] Render UK / Europe / North Atlantic context with selected locations.
- [x] Add zoom, pan and touch-friendly map controls.
- [ ] Add desktop/mobile evidence screenshots.

### M04 — Time engine 🟦

- [x] Model a date-indexed simulation clock.
- [x] Support day, week and month stepping plus run/pause.
- [x] Pause automatically on mission dates.
- [x] Keep actual historical state derived from the selected date.

### M05 — Seasonal Earth system 🟦

- [x] Derive daylight / solar-angle teaching values from date and latitude.
- [x] Show seasonal context separately from observations.
- [x] Explain axial tilt → solar angle → insolation → seasonal temperature response.

### M06 — Climate layer system 🟦

- [x] Implement only supported evidence instruments: temperature, anomaly, pressure, wind, rainfall, SST and climate normal.
- [x] Add units, source, date and measured/reanalysis vs teaching-model labels.
- [x] Add readable legends and source/help affordances.

### M07 — Core game loop 🟦

- [x] Implement Observe → Investigate → Explain → Predict → Advance → Reveal → Score → Reflect.
- [x] Make mission objective visible within ten seconds.
- [x] Pause normal time while a mission is unresolved.
- [x] Stop expansion at the initial three-event slice; manual playtest remains the gate.

### M08 — Investigation events 🟦

- [x] Detect / define three data-backed events from the selected year.
- [x] Cold snap: pressure + easterly/northerly wind + falling temperature.
- [x] Atlantic depression: falling pressure + wind/rain evidence + forecast.
- [x] Warm anomaly: actual temperature vs monthly normal without claiming causation.

### M09 — Causal chain builder 🟦

- [x] Implement click/tap ordering fallback.
- [x] Keep chain definitions data-driven and reusable for a future drag enhancement.
- [x] Give partial feedback without revealing the full answer immediately.

### M10 — Natural-language / keyword answers 🟦

- [x] Define deterministic concept tokens.
- [x] Evaluate short text locally with normalization and concept matching.
- [x] Never use an LLM as the authority on climate facts.

### M11 — Forecast mechanic 🟦

- [x] Capture player forecast for temperature, pressure, wind and rainfall.
- [x] Advance the historical record by 24 hours for the reveal comparison.
- [x] Reveal actual values and compare with the forecast.

### M12 — Scoring 🟦

- [x] Score evidence, concepts, reasoning, prediction and efficiency.
- [x] Explain each score with the evidence used.
- [x] Keep scoring multi-dimensional rather than right/wrong.

### M13 — Investigation efficiency 🟦

- [x] Track selected evidence actions.
- [x] Reward relevant evidence while allowing reasonable exploration.

### M14 — Climate normal vs actual 🟦

- [x] Display actual, normal and anomaly together.
- [x] Keep season, weather event, anomaly and climate change conceptually separate.

### M15 — Weather report assessment 🟦

- [x] Create an end-of-year weather-report assessment using the investigated evidence.
- [x] Compare the mission forecast with a real next-day outcome.
- [x] Ask which evidence mattered and why.

### M16 — Knowledge organiser coverage 🟨

- [x] Create a first coverage matrix with explicit not-yet-covered concepts.
- [ ] Link completed concepts to missions and assessment.

### M17 — Microclimate mini-investigation ⬜

- [ ] Defer until the UK/global loop is stable.
- [ ] Use measured data or clearly labelled teaching simulation.

### M18 — Mystery year mode ⬜

- [ ] Defer as stretch milestone.

### M19 — UX / game feel ⬜

- [ ] Run a fresh-player pass after M07 and the first complete mission.
- [ ] Fail and repair any dashboard-like interaction.

### M20 — Mobile design ⬜

- [ ] Validate 390×844 and desktop layouts.
- [ ] Keep controls and evidence cards touch-safe.

### M21 — Scientific QA 🟨

- [x] Test units, date/time handling, missing values, normals, anomalies, wind conventions and provenance in automated checks.
- [ ] Complete manual scientific review of the event explanations and all source labels.

### M22 — Gameplay QA ⬜

- [ ] Test new-player clarity, meaningful decisions, wrong inference recovery, suspense and learning feedback.

### M23 — Evidence & screenshots 🟨

- [x] Store test results, sample mission output and data evidence.
- [x] Link evidence from `PROGRESS.md`.
- [ ] Capture desktop/mobile screenshots in Sites sandbox.

### M24 — Final vertical-slice gate 🟨

- [ ] Verify the complete 14-step gate in a fresh manual playthrough.
- [x] Keep the release report honest: the gate remains pending Sites/manual QA until evidence is recorded.

## Checkpoint rule

At each meaningful milestone: run tests, run the build, inspect output, record evidence, update `PROGRESS.md`, and commit a focused checkpoint when repository workflow permits.

## Stop-and-reassess gate

After M07 and the first complete investigation, stop expansion. Play the slice as a new player. If the interaction is primarily layer-reading rather than decision-making, improve M07–M13 before adding more events.
