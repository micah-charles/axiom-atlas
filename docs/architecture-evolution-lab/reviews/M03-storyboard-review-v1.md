# M03 Storyboard Review v1

Date: 2026-09-16
Artifact: `M03-find-three-local-assumptions-storyboard-v1.md`
Artifact SHA-256: `9a858dd05d144eae732500433a9d752f047fafdfbf8c27044767d6cb13e3f12e`
Source artifact: `/Users/charlestan/Downloads/M03-find-three-local-assumptions-storyboard-v1.md`

## Verdict

**REVISION REQUIRED — do not implement M03 from v1 yet.**

The storyboard is strong on scope control, source/simulation provenance,
the three required local assumptions, deterministic host-boundary
experiment, recoverable mistakes, causal explanation, and M04–M06
deferral. It is not yet safe to accept because its evidence gate and
classification semantics leave an answer-leak path.

## Contract review

| Area | Result | Evidence |
|---|---|---|
| M03-only scope / no code | PASS | Sections 1, 14, 16 |
| Three source-backed local assumptions | PASS | Sections 2, E01–E03 |
| Neutral evidence before inspection | PASS in intent | Sections 5, 12 |
| Host-boundary experiment | PASS | Section 8 / X01 |
| Deterministic state, score, replay | PASS | Sections 4, 10, 11 |
| Recoverable wrong reasoning | PASS | Sections 8.4, 10.2 |
| M04–M06 and future-solution boundary | PASS | Section 14 |
| Accessibility/mobile acceptance plan | PASS as contract | Section 15 |
| Evidence-first integrity | **FAIL** | Finding M03-SB-F01 below |

## Finding M03-SB-F01 — uninspected answer-bearing card can still be classified

The v1 evidence gate unlocks with:

```text
E05 + E03 + E04 + (E01 OR E02)
```

However, the classification screen requires classification of E01–E04,
while the storyboard does not require the missing E01/E02 card to have
been inspected before classification or commit. A player can therefore
inspect E01, E03, E04, E05, skip E02, and still place/classify E02 as
`BOUND_TO_HOST_01` by guessing. This conflicts with the stated rule that
correctness must not depend on guessing unseen evidence and weakens the
fresh-player evidence-first gate.

### Required bounded revision

Revise the storyboard consistently so that:

1. E01, E02, E03, E04, and E05 are all inspected before the dependency
   board unlocks, or at minimum E01–E04 are all inspected before any of
   those four can be classified or committed. The safer recommendation
   is to require all five because E05 is the explicit deployment-context
   comparator.
2. The machine-readable `required_evidence` contract, S02 gate text,
   T004 examples, and implementation handoff YAML all agree with that
   rule.
3. A player cannot classify or commit an uninspected E01–E04 item.
4. Add or update a stable acceptance test proving the missing-card path
   remains locked and does not reveal the answer.
5. Update the scoring/efficiency wording so it does not claim that
   optional omission of E01 or E02 can earn full investigation credit.

Keep unchanged: M03-only scope, the three assumptions, X01, no future
technology recommendations, deterministic scoring/replay, and the
accessibility/mobile requirements.

## Gate decision

M03 storyboard v1 is **not accepted** for implementation. Request a
single bounded revision from ChatGPT, then review the downloaded v1.1
artifact against this finding before proceeding.

## v1.1 follow-up review

The downloaded v1.1 artifact resolves M03-SB-F01 correctly: the gate is
now `inspected_count == 5`, E01–E05 are all mandatory, and
`M03-T005A` rejects classification/commit for an uninspected item. The
scope, provenance, host-boundary experiment, deterministic explanation,
and M04–M06 boundary remain intact.

One consistency issue remains before acceptance:

- The new stable acceptance test `M03-T005A` is present in the detailed
  acceptance section and change log, but the machine-readable `test_ids`
  registry still lists only `M03-T001`–`M03-T026`.

Request one narrow v1.2 editorial revision: add `M03-T005A` to the
`test_ids` registry and make no other scope or gameplay changes. The v1.1
artifact SHA-256 is
`367252e5f5be751aad663192c8877583ce203935ff00e08321b4259b553e2293`.
