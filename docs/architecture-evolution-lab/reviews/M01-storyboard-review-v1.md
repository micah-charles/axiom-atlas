# M01 Storyboard Review — v1

Date: 2026-09-16  
Artifact: `artifacts/chatgpt/M01-open-the-shop-storyboard-v1.md`  
Artifact SHA-256: `91f814d9a10dbef79c00ba98ed6e3522f55a325d2ff3880bc7fe4bb4f6ce3a87`  
Review status: **CONDITIONAL PASS — REVISION REQUIRED**

This is a storyboard/content-design review only. It is not an implementation
or gameplay verification, and M01 must not be marked `VERIFIED` from this
artifact alone.

## Review matrix

| Area | Status | Finding |
|---|---|---|
| Provenance | PASS | The artifact names `ccc115a/se`, section `1.1`, and blob SHA `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`. Source-backed facts, fictional framing, and lab values are separated. |
| Causal correctness | CONDITIONAL | The single-host causal chain and failure blast radius are coherent. The semantics of the overbuilt branches are internally inconsistent and need an explicit execution status. |
| Evidence before answer | PASS | The empty canvas, four evidence items, threshold, delayed architecture name, request replay, and failure drill preserve discovery. |
| Gameplay loop | PASS AT STORYBOARD LEVEL | The player investigates, assembles, runs, compares, explains, and recovers. This still needs a fresh-player browser test after implementation. |
| Scoring | PASS WITH CLARIFICATION | The dimensions and partial credit are useful. The mission-object evidence-gate YAML needs a less ambiguous shape. |
| Mobile/accessibility | PASS AT STORYBOARD LEVEL | Keyboard, touch, mobile-sheet, focus, and reduced-motion requirements are actionable. |
| Boundary control | CONDITIONAL | The `do_not_teach_yet` intent is right, but the proposed M01-T020 test must not grep the whole storyboard or metadata. |
| Implementation readiness | NOT READY | Three open questions and the branch-status ambiguity must be resolved before code is written. |

## Required corrections

### M01-R1 — Make Choice B/C execution semantics explicit

The artifact says:

- Choice B has unresolved Session/image/database placement but
  `serves_current_workload: true` and acceptance test M01-T009 says it can
  serve the shop.
- Choice C leaves application/database placement high-level but
  `serves_current_workload: true` and M01-T010 says it is capable.

Those statements are not safe implementation contracts. A topology with
unresolved state and data placement cannot silently receive a successful
end-to-end request. It would either be an incomplete preview or it needs an
explicit, visible simulation abstraction.

Recommended v1.1 direction: mark B and C as `preview_only` until their
required placement is explicitly resolved; let the player inspect the extra
complexity, receive partial credit for the underlying reliability intuition,
and recover to A. If the author keeps them executable, the artifact must
define every required state/data placement and label the result as a lab
abstraction rather than hiding the missing architecture.

The revised artifact must update the choice rules, result states, recovery
copy, M01-T009, M01-T010, and any scoring language consistently.

### M01-R2 — Scope M01-T020 to player-facing runtime content

The test currently says to search rendered mission content for strings such as
`add Redis`, `add a load balancer`, `split the database`, and Kubernetes
implementation guidance. The storyboard itself necessarily contains those
terms in provenance, boundary, alternative-choice, and test sections. A naive
global search would therefore fail a correct build.

M01-T020 v1.1 must specify:

1. the exact runtime/player-facing content fixture or message registry to
   inspect;
2. forbidden recommendation patterns in that fixture;
3. allowed occurrences in developer metadata, source trace, locked-choice
   labels, and test documentation;
4. the expected boundary output file.

The test should assert that the trade-off ends at the observed problem and
does not recommend the next solution. It should not ban the storyboard from
discussing what M01 deliberately does not teach.

### M01-R3 — Resolve the three open questions before implementation

The recommended decisions for the next revision are:

- DNS: simulation-only request step in M01; keep it external/conceptual in the
  target topology but do not add it as an initial component the player must
  assemble.
- Explanation: require the deterministic evidence-chip causal builder; allow
  optional free text only as an unscored reflection after the structured score.
- Overbuilt label: use a neutral player-facing label such as
  `multi-node managed platform`; keep Kubernetes in source/author notes and
  locked high-level boundary text, not as a lesson in M01.

If ChatGPT chooses different decisions, it must explain the pedagogical and
technical consequences and update every dependent screen, state, test, and
mission-object field.

### M01-R4 — Make the evidence gate machine-readable

The prose correctly requires E01 plus one of E03/E04 and a minimum of three
items, but the YAML shape:

```yaml
mandatory_any:
  - [E01]
  - [E03, E04]
```

is ambiguous to a data loader. Replace it with an unambiguous structure, for
example:

```yaml
required_evidence:
  minimum_count: 3
  mandatory: [E01]
  one_of: [E03, E04]
```

Then specify the deterministic unlock predicate in the implementation handoff
and acceptance test.

## What is accepted from v1

The following material should be preserved in v1.1:

- M01-only scope and the exact source trace;
- the fictional Atlas Market boundary;
- the empty initial topology and delayed `Single-Node Monolith` reveal;
- the four evidence items plus optional source lens;
- the request trace and host-failure drill;
- the proportional single-host choice as a rational, not universally correct,
  decision;
- partial credit and recovery without a lecture-first hard fail;
- mobile, keyboard, touch, reduced-motion, and screenshot evidence plans.

## Acceptance gate for v1.1

Accept the revised storyboard when:

- B/C have explicit, internally consistent runtime states;
- the evidence gate is machine-readable;
- M01-T020 is scoped to player-facing runtime strings;
- DNS, free-text reflection, and overbuilt naming are resolved;
- no M02+ implementation lesson is added;
- the source trace and provenance boundaries remain intact.

After that acceptance, checkpoint the immutable v1.1 artifact and review, then
start implementation of the smallest M01 slice. Do not request M02 until the
implemented M01 passes the fresh-player gate.
