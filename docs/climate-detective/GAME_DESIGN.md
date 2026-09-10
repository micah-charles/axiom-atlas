# Climate Detective game design

## Player promise

Something in Britain changes. The player must find the evidence, build the best explanation, predict the next day, and then watch the historical record reveal what happened.

## First screen

The first viewport is a mission surface, not a dashboard:

- left: “Mission 01 — The eastern door” and one clear objective;
- centre: a real UK / North Atlantic map with a moving date marker and selected location;
- bottom: timeline controls and an event track;
- right: compact live readout and evidence drawer.

The player can start with one action: **Run to next clue**. The game pauses when a data-backed event is reached.

## Core loop

1. Observe the changing map and timeline.
2. Investigate evidence cards. Evidence actions are recorded.
3. Explain by ordering causal cards and writing a short explanation.
4. Predict the next 24 hours where the mission asks for it.
5. Advance the historical clock.
6. Reveal actual data beside the forecast.
7. Score evidence, concepts, reasoning, prediction and efficiency.
8. Reflect with one sentence: “The evidence that mattered most was …”

## First three events

### Event 1 — The Atlantic conveyor / depression and forecast

The first interruption is a pressure fall with wind and rainfall evidence. The player predicts the next 24 hours, then compares the forecast with the historical record.

### Event 2 — The eastern door / cold snap

The player sees a sharp temperature fall around the late-February / early-March 2018 cold spell. The useful evidence is a pressure change, easterly wind and air-mass source hint, plus the temperature anomaly.

Target causal chain:

`pressure pattern → easterly / northerly flow → colder continental / polar air → temperature fall`

### Event 3 — Warm is not the same as unusual

The player compares an actual summer reading with the monthly normal. The mission teaches the difference between seasonal warmth and an anomaly. It does not claim that one hot day proves climate change.

## Interaction rules

- Every evidence card shows variable, value, unit, date, source and “why this matters”.
- Click/tap ordering is always available; drag is an enhancement.
- Wrong reasoning receives partial feedback and can be revised.
- Reasonable exploration is not harshly punished.
- Forecast scoring compares direction and magnitude bands, not false precision.

## Score

Maximum 14 points:

| Dimension | Points | Meaning |
| --- | ---: | --- |
| Evidence | 0–3 | selected relevant signals |
| Concepts | 0–3 | identified physical processes |
| Reasoning | 0–3 | causal order and written explanation |
| Forecast | 0–3 | useful next-day direction / magnitude |
| Efficiency | 0–2 | found the explanation with focused actions |

## Accessibility and responsive behaviour

- comfortable buttons and sliders on 390×844;
- evidence drawer collapses below the map on mobile;
- no hover-only meaning;
- keyboard ordering buttons and `aria-live` outcome updates;
- reduced motion follows the Atlas setting.

## Coverage matrix (first slice)

| Concept | Mission | Evidence | Player action | Assessment | Status |
| --- | --- | --- | --- | --- | --- |
| Latitude | 03 seasonal context | map latitude, solar angle | interpret seasonal baseline | warm/anomaly reflection | planned |
| Earth's tilt | 03 | solar-angle teaching model | order causal chain | written concept match | planned |
| Insolation | 03 | daylight / solar angle | choose relevant evidence | reasoning score | planned |
| High / low pressure | 01 / 02 | pressure trace | select evidence | evidence score | planned |
| Air mass | 01 | wind direction / source region | explain cold snap | reasoning score | planned |
| Maritime influence | 02 | Atlantic position / SST | compare route evidence | reflection | planned |
| Frontal rainfall | 02 | rain + pressure / wind | forecast rainfall | forecast score | planned |
| Climate normal vs actual | 03 | actual / normal / anomaly | classify event | assessment | planned |
| Climate change / greenhouse influence | later | attribution sources | not forced into first year | future assessment | not yet covered |
| Relief / convectional rainfall | later | local data needed | deferred | deferred | not yet covered |
| Tri-cellular model / Hadley / Ferrel / Polar / ITCZ | later | global teaching model | deferred | deferred | not yet covered |
| Microclimates / urban surfaces / buildings / aspect / relief / vegetation / water | M17 | local observations | deferred | deferred | not yet covered |
| Ocean currents / altitude / albedo / Milankovitch cycles | later | additional scenarios | deferred | deferred | not yet covered |
