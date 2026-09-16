# M03 Browser Playtest QA

Date: 2026-09-16
Route: `http://localhost:3001/computer-science/architecture-lab/m03`
Storyboard: `artifacts/chatgpt/M03-find-three-local-assumptions-storyboard-v1.2.md`

## Automated evidence

- `npm run lint` — PASS
- `npm run test:core` — PASS, 170 tests
- `npm run build` — PASS; `/computer-science/architecture-lab/m03` emitted
- `npm test` — PASS, 170 core tests + build + 7 rendered-route tests

## Desktop fresh-player flow

- Fresh route presents `SHOP HEALTHY · REHEARSAL REQUESTED`, HOST 01 as the
  working shop, HOST 02 as the empty replacement target, and neutral E01–E05
  evidence cards.
- After E01–E04 only, the evidence gate remains locked at 4/5.
- After E05, the dependency board unlocks.
- Intentional wrong map (E01 non-local and E04 host-bound) is accepted as a
  hypothesis, but the revealed result blocks acceptance and offers recoverable
  map revision.
- Result text is absent before prediction commit; all three predictions are
  required before the host-boundary experiment can run.
- Corrected map plus correct evidence matches reaches causal explanation.
- Causal claims can be reordered with explicit up/down controls and each
  required evidence link is selected with a native combobox.
- Clean path reaches `100/100` and `Three local assumptions identified.`
- `Replay M03` clears revealed findings and returns to `Evidence gate locked ·
  inspect 5 more cards.`

## Accessibility and responsive follow-up

- Interaction controls use native buttons, radio inputs, select elements and
  explicit labels; drag is not required for the implemented path.
- Visual status is repeated as text, not colour alone.
- Reduced-motion CSS disables transitions/animations for the M03 shell.
- Real 390px viewport, reduced-motion interaction recording, screen-reader
  recording and a complete keyboard-only recording remain open evidence gates;
  the local browser helper did not expose a viewport-resize method during this
  pass.

## Current verdict

M03 desktop gameplay and deterministic contract: **PASS**.

M03 full verification: **CONDITIONAL PASS / NEEDS QA** until the mobile,
reduced-motion, screen-reader and explicit keyboard evidence captures are
recorded.

The independent implementation review initially found two bounded scoring
formula mismatches (M03-F01/F02). Both are corrected in commit `3cc3dfb` and
closed by committed-source review v2. Implementation correctness is now PASS;
the mobile/accessibility evidence gates remain open.
