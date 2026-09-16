# M05 Storyboard Review — v1.2

Date: 2026-09-16
Mission: M05 — The Network Is Now Part of the System
Artifact: artifacts/chatgpt/M05-network-now-part-of-system-storyboard-v1.2.md
Artifact SHA-256: e56ab13a9d93313f2cff5be5d484957664c5a2fe990f1e996cc073993184fe02
Source: ccc115a/se, _more/mybook/向淘寶學習網站架構演進/1.2.md, blob 00756d5a3a4054cd9592e19199c10626cdce993a

## Review history

M05 v1 was held for a duplicate evidence-capture item and a required
machine-readable consistency audit. v1.1 closed those editorial/registry
issues, but its prediction matrix had four rows while the scoring contract
claimed five assertions × two points. v1.2 adds one meaningful deterministic
prediction—whether the DB dependency recovers during the controlled outage—
and carries that assertion through the matrix, both results, acceptance
contract, YAML and scoring changelog.

## Contract checks

| Check | Result | Evidence |
|---|---|---|
| M05-only scope and source traceability | PASS | Scope header and exact source path/blob SHA |
| M04 continuity without redesign | PASS | Separated Web/DB topology is inherited; separation is not a player choice |
| Opening avoids policy/result leakage | PASS | Starting-state hidden list; no timeout, retry count, outage duration, policy result or score initially |
| Source / fiction / teaching-simulation boundary | PASS | Provenance table and numeric registry label source-backed, fictional and teaching-simulation claims |
| Evidence-first gate | PASS | E01–E05 plus E06 or E07, minimum six unique inspected cards |
| No unseen evidence proof | PASS | Gate, diagnosis predicate and M05-T005 require proof subset of inspected evidence |
| Diagnosis and causal chain | PASS | Network-dependency diagnosis, seven causal concepts, stable evidence links |
| Prediction before reveal | PASS | Five explicit policy assertions are committed before either experiment result |
| Deterministic outage experiment | PASS | Both policies use the same labelled 2-second teaching simulation and fixed occupancy |
| Bounded timeout/retry interpretation | PASS | Unbounded work remains waiting; bounded policy surfaces an error; retry does not guarantee recovery |
| M06 and later-solution deferral | PASS | Capacity controls are fixed; deferred topics are author-only metadata/runtime-boundary checks |
| Scoring and recovery | PASS | Categories sum to 100; perfect path is exactly 100; wrong paths are recoverable |
| Replay and accessibility contract | PASS | Reset, keyboard, tap, 390px, reduced-motion and screen-reader acceptance tests are explicit |
| Stable acceptance registry | PASS | Detailed headings M05-T001..M05-T040 and YAML registry each contain exactly 40 unique IDs in order |
| Evidence-capture checklist | PASS | Items are unique and sequential from 1 through 23 |

## Verdict

ACCEPTED — storyboard contract only.

M05 is ready for implementation planning. This does not claim M05 is
implemented or verified. Implementation must produce the listed evidence,
run tests/build, and pass independent committed-source review. The carried
M01–M04 mobile/accessibility evidence debt remains open and is not silently
converted to VERIFIED by accepting this storyboard.

## Evidence

- Downloaded artifact: /Users/charlestan/Downloads/M05-network-now-part-of-system-storyboard-v1.2.md
- v1 SHA-256: f33d9b6f4a14fd60820c144474971ddd56b27a111e76919818e4edb07f227a1b
- v1.1 SHA-256: 41bc5a3afae03cd9807cdb8a67a3cf5295ff1f260bce95425c06593d46b491ca
- v1.2 SHA-256: e56ab13a9d93313f2cff5be5d484957664c5a2fe990f1e996cc073993184fe02
- Registry validation: 40 detailed IDs, 40 registry IDs, 40 unique each; set equality PASS
- Prediction validation: five matrix assertions, five YAML assertions, 10 prediction points; exact score total 100
