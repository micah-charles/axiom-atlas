# M01 UI review — ChatGPT v2

Date: 2026-09-17  
Reviewed commit: `4195f09` on `origin/feature/architecture-evolution-lab`  
Reviewer: ChatGPT, via the selected `maths / logic game` conversation  
Evidence packet: [`evidence/ui-review/m01-v2/`](../evidence/ui-review/m01-v2/README.md)

## Overall verdict

M01 v2 is a meaningful improvement over `e8a07ef`. Evidence now behaves like
evidence, future request steps are hidden, the failure reveal has a
prediction/reveal beat, completion hierarchy is better, and M01 typography is
larger. The experience has moved from a polished worksheet toward an actual
investigation, but it is not yet the final interaction template: candidate A
still looks superior before the request test, and the causal builder still
signals which claims are unsupported and validates inclusion more than chain
construction.

Scores: visual clarity **8/10** · gameplay **7.5/10** · readability **7/10** ·
presentation **8.5/10**.

The reviewer noted that the GitHub connector exposed JPGs as binary/base64 and
could not render their pixels directly. Pixel-level claims were therefore not
made; the review used the committed capture descriptions and the source/CSS.

## V1 finding status

1. **Uninspected evidence hides observation and interpretation — CLOSED.**
   `EvidenceCard` shows a neutral inspection prompt until `inspected=true`;
   observation, interpretation and source are conditional. Captures 01 and 02
   document the hidden/revealed states.
2. **Candidate topologies are neutral before testing — PARTIAL.** The old
   `proportionate` styling and “complete request path” copy are gone, and
   unselected cards are neutral. However, selecting A before running the request
   immediately applies `arch-result good`, shows the smallest complete-path
   message and exposes metrics/run, while B/C/D show blocking verdicts. This
   still evaluates the choice too early.
3. **Future request steps are locked — CLOSED, minor caveat.** Future rows show
   only generic locked placeholders; reached/current rows reveal details, and a
   progress rail plus active-node highlighting makes the current target legible.
   DNS is the one target without a matching topology node.
4. **Prediction before HOST 01 failure — CLOSED.** `predictFailure` requires a
   selected prediction before `Pull HOST 01`; the reveal compares the stored
   prediction with reality and gives correct/revise feedback.
5. **Causal explanation is construction rather than selecting every answer —
   PARTIAL.** A visible `YOUR CHAIN` and distractors improve the interaction,
   but the distractors are labelled `PLAUSIBLE, BUT UNSUPPORTED`, which leaks
   the answer. Submission checks that the five canonical IDs are included; it
   does not validate order/compatibility and contradictory extras only reduce
   efficiency.
6. **Completion leads with discovery and boundary — CLOSED.** `Single-Node
   Monolith` is primary, total score is concise, and the category breakdown is
   inside a collapsed details control.
7. **150% readability — PARTIAL.** Main interaction copy is substantially
   larger and controls are at least 48px high. The packet records a clean
   100/100 desktop run at `1270×577` and 150%, but the reviewer could not certify
   pixels through the connector. Trace targets remain around `.58rem` and
   topology service metadata around `.4rem`; the evidence phase is also taller.

## Screen review

- **Fresh investigation:** genuine reveal action and neutral empty topology;
  persistent briefing remains copy-heavy.
- **Evidence reveal:** observation → interpretation → provenance is a useful
  state change, although interpretation still steers the architecture choice.
- **Candidate choice:** visually improved, but the largest remaining issue;
  selection should be separated from explicit candidate evaluation/testing.
- **Request trace:** locked future steps and active target are strong closure;
  the repeated Advance interaction is acceptable for M01, with DNS representation
  as a polish item.
- **Prediction:** materially improves suspense; prediction choices should state
  outcomes only and reveal the causal reason after the pull.
- **Failure reveal:** now a proper prediction-versus-reality feedback loop.
- **Causal builder:** visible chain and alternatives help, but labels and
  inclusion-only validation keep it partly checklist-like.
- **Completion:** strong improvement; architecture discovery, score and boundary
  now have the right hierarchy.

## Remaining priorities

1. Add a neutral `TEST CANDIDATE` commit step; reveal candidate quality only
   after the request test, including B/C/D outcomes.
2. Replace labelled unsupported distractors with a neutral claim pool and
   validate an ordered `evidence → fit → trade-off` chain. Contradictory claims
   should block clean completion or require reconciliation.
3. Make failure prediction choices outcome-only; teach the reason in the reveal.
4. Raise remaining `.58rem` trace targets and `.4rem` topology metadata.
5. Reduce evidence-phase vertical weight by collapsing inspected cards to a
   one-line captured summary with an Expand control.
6. Give DNS a compact resolver badge/node during request step 1.
7. Keep the near-black/cyan/gold/red semantic palette; changing it would not
   solve the remaining issues.

## Accessibility and 150% gate

| Check | Status |
|---|---|
| Evidence hiding and future-step hiding in source | PASS |
| Main interaction typography / 48px primary controls | PASS |
| 150% desktop interaction at 1270×577 | PARTIAL PASS — clean run is documented, but no pixel-level connector inspection |
| No horizontal overflow / no clipping at 150% | PARTIAL / not independently verified |
| 390×844 full completion | OPEN |
| Touch completion | OPEN |
| Standalone keyboard-only completion | OPEN |
| Reduced-motion runtime | OPEN |
| Screen-reader runtime | OPEN |
| Full accessibility verification | OPEN |

## Review decision

M01 v2 is good enough to serve as the **visual/presentation baseline** for
later missions, so later storyboard work need not wait for another full M01
redesign. It is not yet safe to copy the interaction mechanics wholesale:
candidate testing must become neutral until explicit evaluation, and causal
explanation must validate a constructed chain. The visual identity should stay
near-black/cyan/gold. Full verification remains open for 390px, touch,
standalone keyboard, reduced motion and screen reader.

