# M02 UI Review — Follow One Request

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Baseline: `79c4ff8`  
Reviewer: selected ChatGPT conversation (`maths / logic game - 淘寶架構課程介紹`)

## Review status

**Design decision: ACCEPTED WITH CORRECTION**

The first ChatGPT response drifted into M01 and proposed Host 01 failure,
redundant-tier preview, and an M01 topology board. That response was rejected
and challenged in the same conversation. The corrected response explicitly
states that it cannot produce a reliable M02 image in the current surface, so
no M02 image is treated as evidence. Its M02-specific design decisions are
accepted as the review input.

## M02 visual direction

M02 is a latency troubleshooting console, not an architecture-topology screen
and not a row of evidence cards. The playable board is one request moving
through:

`Browser → DNS Resolver → HTTP/Tomcat → JDBC/MySQL → Response`

The persistent question is: **Where did this request spend its time?** The
visual must not ask the player to choose an architecture before the diagnosis.

## Accepted decisions

- Make the request trace the main game board.
- Represent Browser, DNS Resolver, Tomcat/Application, JDBC, MySQL and the
  response packet as code-native SVG/CSS objects.
- Link each object to a latency bar, milliseconds value and cumulative total.
- Reveal timing one stage at a time during the baseline trace; do not expose
  the incident cause before the player has measured the route.
- Use the existing deterministic timing profiles and experiment rules in
  `m02-engine.ts`; the presentation must not invent values or diagnosis rules.
- Keep the palette functional: cyan = observed flow, gold = player focus or
  active segment, green = verified comparison, red = actual incident only.
- Keep the existing controlled experiment and prediction gate. A hypothesis is
  a hypothesis until the experiment produces evidence.
- At comparison/reveal, show changed versus unchanged segment bars so the
  player can see why DNS or Tomcat was isolated.
- For mobile, keep the trace horizontal and scrollable, with timing segments
  stacked below it rather than reproducing a desktop card grid.
- Use accessible text equivalents for every visual stage and keep controls at
  least 44px where the existing mission already provides interaction.
- Use `prefers-reduced-motion` to replace animation with immediate active-stage
  and changed-bar states.
- No raster illustration is required for this functional screen. Optional
  atmosphere must never carry the instructional meaning.

## Implemented in this checkpoint

Added `M02RequestBoard` and `M02StageGlyph` to the M02 presentation. The board
now renders before the phase-specific controls and remains bound to the
existing phase/engine state:

- observe/investigate: route visible, timing hidden, total marked cause-unknown;
- baseline: one measured stage is revealed at a time;
- diagnose/predict/run: incident baseline bars remain visible, experiment
  result remains hidden;
- result/final/explain/complete: the selected control and comparison are shown
  with changed/unchanged segments.

This is a bounded presentation revision; no M02 engine truth or scoring rule
was changed.

## Still open

- The ChatGPT image-generation surface did not accept the committed baseline
  PNG because its upload control is disabled in this browser surface.
- A fresh local screenshot packet is required after implementation at desktop
  150%, 390px, keyboard-only, touch and reduced-motion settings.
- The M02 mission remains `IMPLEMENTED / FULL VERIFICATION PENDING` until those
  runtime gates are captured and reviewed.
