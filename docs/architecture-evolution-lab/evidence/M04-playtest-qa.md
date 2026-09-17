# M04 Playtest QA — Disk Full at 02:00

Date: 2026-09-16
Route: /computer-science/architecture-lab/m04
Environment: local Chrome via CUA, desktop viewport
Mission status: 🟦 IMPLEMENTED / NEEDS QA

## Desktop clean path — PASS

Fresh route state showed:

- fictional 02:00 incident;
- seller image-write failure and application-log-write failure;
- neutral evidence cards;
- diagnosis locked until E01–E05 plus a comparator;
- no initial SHARED_DISK_CAPACITY, MySQL-filled-disk, or Web/DB-isolation answer text.

Completed interaction:

1. inspected all seven evidence cards;
2. mapped DB/log/image to the shared disk and CPU/request path to the negative-control zone;
3. cited E02 plus E03/E04 and committed shared-disk diagnosis;
4. reordered the five causal claims and attached E01–E05;
5. committed five predictions while the result remained hidden;
6. ran the shared-versus-isolated controlled comparison;
7. reconciled blocked shared writes, available isolated writes, and finite boundaries;
8. selected Web/DB isolation with mechanism justification;
9. selected the Web-to-DB network dependency trade-off;
10. reached MISSION COMPLETE with 100/100.

AX accessibility-state inspection confirmed the complete screen exposed:

INVESTIGATION 15/15 · DIAGNOSIS 15/15 · RESOURCE MAP 10/10 · CAUSAL CHAIN 15/15 · PREDICTION 10/10 · EXPERIMENT 10/10 · INTERVENTION 15/15 · TRADE-OFF 5/5 · EFFICIENCY 5/5 · LAB SCORE 100/100.

Visual inspection: PASS. The completion screen keeps the causal conclusion,
finite-capacity boundary, Web-local image placement and network-dependency
stop boundary visible. A clean-path completion screenshot was captured during
the CUA playtest.

## Wrong-path recovery — PASS

Replayed M04, selected CPU capacity, cited E02/E03/E04, and committed. The
mission stayed in the diagnosis phase and returned local evidence-based
feedback rather than revealing the entire answer or dead-ending.

After revising to shared-disk diagnosis, the same run completed with 99/100
and EFFICIENCY 4/5. Inspected evidence and progress were preserved.

## Replay reset — PASS

Replay returned to the initial incident/evidence state with empty inspection
progress, hidden result and no score.

## Automated verification

- npm run lint — PASS
- npm run test:core — PASS, 173 tests
- npm run build — PASS; /computer-science/architecture-lab/m04 emitted
- npm test — PASS after the final feedback/resource-map/trade-off correction;
  173 core tests + production build + 8 rendered-route tests

## Committed-source review — v1

ChatGPT reviewed commit `71c87b7a7fb898a792647b65198a4e74ad438328` against the
accepted M04 storyboard and returned `REVISION REQUIRED` for one bounded issue:
the engine proof predicate did not independently enforce `proof ⊆ inspected`.
The review artifact is tracked at
`reviews/M04-implementation-review-v1.md` (SHA-256:
`7b212a6b9fdc91e05aacee49ebd9a84428718476836b08d5ced7ca4dc790a09e`).

The issue is now fixed in the working tree with an inspection-aware proof
predicate and direct regression coverage; a committed-source re-review is
required before M04 can advance.

## Committed-source re-review — v2

ChatGPT inspected commit `3bd2816b23bcd68b1a8f62338e40750b8eeed407` and
returned `PASS` for implementation correctness, `PASS` for genuinely
playable, and `CONDITIONAL PASS` for full verification. M04-F01 is closed:
the engine now enforces `proof ⊆ inspected` through diagnosis commit,
completion, and scoring paths, with direct regression coverage. The review
artifact is tracked at `reviews/M04-implementation-review-v2.md` (SHA-256:
`a3b8f404f9430efeb883c8326df28b3fb6a72898e11934e590a8c39fad0b58e6`).

The reviewer kept real 390px, keyboard-only, touch, reduced-motion and
screen-reader evidence explicitly OPEN. M05 storyboard work is unlocked, but
M04 remains 🟦 IMPLEMENTED / NEEDS QA rather than VERIFIED.

## Open evidence debt

The following remain open before M04 can become VERIFIED:

- real 390 × 844 viewport clean and recovery captures;
- explicit keyboard-only completion log/capture;
- touch-path completion capture;
- reduced-motion completion capture;
- screen-reader announcement transcript;

The independent committed-source implementation review is closed by
`reviews/M04-implementation-review-v2.md`; the five runtime/accessibility
items above remain open.
