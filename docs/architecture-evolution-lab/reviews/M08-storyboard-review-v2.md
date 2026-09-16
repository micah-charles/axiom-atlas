# M08 Storyboard Review v2

Date: 2026-09-17  
Mission: M08 — CPU Bottleneck  
Primary source: `ccc115a/se` `_more/mybook/向淘寶學習網站架構演進/1.3.md`  
Source commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`  
Artifact capture: `artifacts/chatgpt/M08-cpu-bottleneck-storyboard-v2-visible-contract.md`

## Review decision

**ACCEPTED FOR IMPLEMENTATION PLANNING — M08 storyboard v2.**

The two v1 blockers are closed in the actual rendered artifact preview. The
acceptance is for the storyboard contract; M08 code and runtime verification
remain outstanding.

## Independent checks

| Check | Result | Evidence |
|---|---|---|
| Source path and pinned commit | PASS | Matches `reviews/source-review-m08.md` |
| One bounded CPU investigation | PASS | Observe → investigate → hypothesis → controlled change → reveal → reconcile → explain → score → replay |
| Fresh-player neutrality | PASS | Audit reports `fresh_player_answer_leak=False`; no answer terms in the opening copy |
| E01–E07 evidence gate | PASS | Artifact says all seven are mandatory; audit reports `all_E01_E07_required=True` and `E07_optional_text_remaining=False` |
| Proof predicates | PASS | CPU, memory/GC, I/O and insufficient-evidence predicates are explicit |
| Final diagnosis consistency | PASS | Frozen initial hypothesis, post-reveal finalDiagnosis/revision state and contradictory-completion block are present |
| Wrong-path recovery | PASS | Regression cases cover unchanged wrong final diagnosis rejection and revised CPU acceptance |
| Deterministic intervention results | PASS | `SIMPLIFY_COMPUTE`, `UPGRADE_CPU` and `ADD_MEMORY` have fixed result rows |
| Score/replay contract | PASS | Score total is 100; replay/rerun clears finalDiagnosis and dependent state |
| Acceptance IDs | PASS | 45 unique contiguous matrix IDs equal the 45-item registry |
| Neutral next-incident hook | PASS | Hook is player-facing and does not reveal deferred mission internals |
| Mobile/accessibility contract | PASS, not runtime evidence | Requirements are represented; artifact does not claim they were captured |

## M08-F01 — closed

The v1 contradiction between an optional E07 card and an I/O-dependent
cross-family investigation is removed. The v2 artifact requires E01–E07
before diagnosis everywhere, including the player flow, transition guard,
acceptance rows, handoff and audit.

## M08-F02 — closed

The v2 artifact preserves the initial diagnosis as immutable history, then
requires an explicit post-reveal final diagnosis. It labels unchanged versus
revised hypotheses, keeps wrong paths playable through reveal/reconciliation,
rejects a contradictory unchanged final diagnosis, accepts a valid CPU
revision, and clears finalDiagnosis on rerun/replay.

## Decision

M08 is unlocked for implementation planning on
`feature/architecture-evolution-lab`. Do not mark it VERIFIED until the pure
engine, rendered route, tests, desktop/mobile playtest and accessibility
evidence satisfy the storyboard contract.
