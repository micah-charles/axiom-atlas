# M05 Playtest QA — The Network Is Now Part of the System

Date: 2026-09-16
Route: `/computer-science/architecture-lab/m05`
Branch: `feature/architecture-evolution-lab`

## Desktop fresh-player path

Tested in the local Chrome QA tab at `http://localhost:3001`.

1. Initial route rendered a fictional DB-dependent request symptom with a
   separate Web/DB topology, a neutral evidence case, and a locked gate.
2. Inspected E01–E06. The gate opened only after E01–E05 plus a comparator.
3. Classified the five dependency tokens and committed the correct map.
4. Chose `NETWORK_DEPENDENCY_WAITING` and cited inspected E01, E02 and E03.
5. Built the seven-claim causal chain using keyboard-safe Up/Down buttons and
   attached E01–E04 to the required links.
6. Committed all ten predictions—five assertions for each policy—while the
   result remained hidden.
7. Ran the identical `2-second` `TEACHING_SIMULATION` twice:
   - unbounded wait: affected work remained waiting and no error surfaced;
   - bounded timeout + one retry: an error surfaced, the retry failed, and
     fixed slots did not change.
8. Chose `BOUNDED_TIMEOUT_ONE_RETRY` and selected all five mechanism/boundary
   justifications.
9. Reached `MISSION COMPLETE` with `100/100`; both runs were reported as
   completed.

## Recovery path

On the first run I deliberately committed an incorrect causal ordering. The
mission stayed in the causal phase, preserved the evidence and links, showed
local feedback, and allowed correction. After correction the same path reached
`98/100`, with the two recovery cycles reflected in the efficiency score.

## Replay reset

From the completed state, `REPLAY M05` returned to the initial route with:

- `0/7 INSPECTED`;
- no dependency classification;
- no diagnosis/proof;
- no prediction or experiment result;
- no score or completion state.

## Render and interaction observations

- Desktop visual inspection: PASS. The mission hierarchy, neutral evidence
  cards, prediction-before-reveal state, qualitative result panels and final
  score are legible in the existing Architecture Evolution Lab visual system.
- Keyboard-safe causal reorder controls: exercised via semantic button labels;
  no drag interaction is required by the implementation.
- Tap-safe controls: the route uses button/radio/checkbox controls and has no
  hover-only dependency in the route code. A device-level touch trace is still
  open.
- Reduced motion: the route has a scoped `prefers-reduced-motion` rule and no
  required result depends on animation; a browser preference capture is still
  open.

## Responsive evidence captured

The gstack browser captured the route at a real `390 × 844` viewport after
waiting for the client to hydrate:

- fresh route: `../../../.gstack/qa-reports/m05-2026-09-16/screenshots/m05-390-initial.png`
- evidence gate open after E01–E06: `../../../.gstack/qa-reports/m05-2026-09-16/screenshots/m05-390-gate-open-v3.png`
- dependency-map recovery state after an intentionally incorrect placement:
  `../../../.gstack/qa-reports/m05-2026-09-16/screenshots/m05-390-recovery.png`

The 390px captures show the stacked mobile layout, readable objective and
controls, and a recoverable dependency-map state. No console errors were
reported during this capture. The full end-to-end mobile completion is not
claimed from these partial captures.

## Keyboard evidence captured

The desktop CUA trace exercised the fresh route with keyboard navigation for
the investigation gate, dependency classification, diagnosis proof and causal
reordering. Semantic labels and the keyboard-safe Up/Down controls were
reachable. The later prediction/result path was completed in the same route,
but not as a standalone keyboard-only run; that independent evidence remains
open.

## Post-review correction pass

ChatGPT's first committed-source review is recorded in
`../reviews/M05-implementation-review-v1.md`. The bounded correction pass:

- neutralises the fresh-player phrases `bound the waiting` and `explain why a
  bound changes the outcome` into neutral call-behaviour comparison language;
- strengthens the initial rendered-route regression to reject natural-language
  timeout/retry recommendations;
- adds committed engine regressions for prediction commitment, contradictory
  completion proof, and efficiency tiers. The original M05 gate/map/causal/
  prediction/result/policy/100-point tests were already present in
  `2e48a25`, contrary to the review's F02 summary.

Local verification after the correction: `npm test` PASS, including 177 core
tests and 9 rendered-route tests. ChatGPT's post-fix committed-source review is
recorded in `../reviews/M05-implementation-review-v2.md`: implementation
correctness PASS and gameplay PASS. Full verification remains CONDITIONAL
because the runtime evidence listed below is still open.

## Evidence still open

The following are not marked VERIFIED yet:

- standalone keyboard-only completion from fresh route;
- touch-specific trace;
- reduced-motion capture;
- screen-reader announcement transcript;
- full end-to-end 390px completion (partial captures are recorded above).

Independent committed-source implementation review is PASS for correctness and
playability; runtime evidence debt remains open.

## Related automated checks

- `npm run lint` — PASS
- `npm run test:core` — PASS, 177 tests
- `npm run build` — PASS; route `/computer-science/architecture-lab/m05` present
- `node --test tests/rendered-html.test.mjs` — PASS, 9 rendered-route tests
- initial rendered route answer-leak test — PASS; correct diagnosis/policy/result
  identifiers and natural-language timeout/retry recommendations are absent
  from the initial HTML shell
