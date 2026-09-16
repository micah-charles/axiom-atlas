# M08 — CPU Bottleneck — v2 visible-contract capture

## Capture status

ChatGPT reissued the storyboard after the bounded M08-F01/M08-F02 challenge.
The raw signed attachment endpoint remains blocked by Chrome, so this is a
transparent capture of the rendered artifact preview and audit output. It is
not claimed to be byte-identical to the remote download.

## Source and scope

- Primary source: `ccc115a/se`
- Path: `_more/mybook/向淘寶學習網站架構演進/1.3.md`
- Pinned source commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`
- Mission: M08 — CPU Bottleneck
- Scope: one bounded CPU investigation; M09–M13 remain deferred

## Corrections independently visible in the artifact

1. **Evidence gate is consistent.** E01–E07 are all mandatory before
   diagnosis. E07 is explicitly not optional, and the access rule, state
   guard, proof predicates, score, handoff, tests and audit use the same rule.
2. **Final diagnosis is a real state.** The initial hypothesis remains frozen
   for history and scoring. After reveal/reconciliation the player must keep
   or revise it, with visible labels `FROZEN INITIAL HYPOTHESIS` and
   `REVISION AFTER EVIDENCE`. An unchanged contradictory diagnosis cannot
   complete; a valid CPU revision can.
3. **Wrong paths remain playable.** The regression table includes wrong
   initial diagnosis, reveal/reconcile, revised CPU completion, clean 100/100,
   and replay/rerun clearing finalDiagnosis and result-dependent state.
4. **The actual artifact is expanded.** The preview contains the full
   M08-T001–M08-T045 acceptance matrix and the matching machine-readable
   registry, not placeholders.

## Deterministic proof contract

The artifact defines explicit predicates for CPU saturation, memory/GC, I/O
wait and insufficient evidence. The global guard requires all E01–E07 to be
inspected, proof to be a subset of inspected evidence, and at least three
distinct proof cards.

Canonical CPU predicate:

`(E01 OR E04) AND E03 AND E05`

Alternative predicates are deterministic, playable hypotheses rather than
claims that the current run proves those alternatives.

## Anchored audit reported against the actual final Markdown

```text
matrix_count=45
matrix_unique=45
registry_count=45
registry_unique=45
matrix_contiguous_M08-T001_to_M08-T045=True
registry_contiguous_M08-T001_to_M08-T045=True
matrix_equals_registry=True
regexes_anchored_and_nonempty=True
fresh_player_answer_leak=False
neutral_next_hook=True
all_E01_E07_required=True
E07_optional_text_remaining=False
four_diagnosis_proof_predicates_present=True
frozen_initial_hypothesis_present=True
post_reveal_finalDiagnosis_present=True
contradictory_final_completion_blocked=True
all_interventions_have_deterministic_results=True
wrong_paths_recoverable=True
score_total=100
replay_clears_all_mission_state_including_finalDiagnosis=True
runtime/accessibility evidence represented but not claimed captured
```

## Review boundary

This closes the storyboard blockers only. No M08 application code has been
implemented, and no runtime accessibility evidence is being claimed from the
ChatGPT artifact preview.
