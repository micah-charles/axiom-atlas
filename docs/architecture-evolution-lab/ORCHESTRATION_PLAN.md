# Architecture Evolution Lab — Orchestration Plan

## Purpose

This folder is the working control plane for turning
`GAME_DESIGN_BIBLE_v1.0.md` into a playable Axiom Atlas module. The Bible is
the design baseline, not proof that a mission is scientifically or
pedagogically complete. Every mission must pass source review, storyboard
review, implementation, gameplay QA, and evidence capture in that order.

The orchestration loop is:

```text
Bible + primary source
        ↓
mission contract and evidence plan
        ↓
focused ChatGPT storyboard request
        ↓
downloaded versioned artifact
        ↓
Codex source/gameplay review
        ↓
challenge request to ChatGPT
        ↓
revised storyboard + diff
        ↓
Git checkpoint
        ↓
implementation
        ↓
automated tests + browser playtest + evidence
        ↓
verified mission
```

No ChatGPT-generated document is treated as accepted merely because it is
polished or downloadable. No mission is implemented before its acceptance
contract is complete.

## Current repository fit

Discovered on 2026-09-16:

- React 19 + TypeScript on Vinext/Vite, using the existing `app/` route
  architecture.
- Existing platform routes: `/`, `/math-logic`, `/geography`, and the
  Climate Detective routes underneath `/geography/climate-detective`.
- Shared visual foundation is in `app/globals.css` and shared Atlas
  components are under `app/components/atlas/`.
- Existing Math & Logic state and world registry must remain isolated from
  the new module.
- Existing checks are ESLint, Node core tests, Vinext production build, and
  rendered HTML checks.
- Existing hosting metadata is `.openai/hosting.json`; current repository
  remote is `https://github.com/micah-charles/axiom-atlas.git`.
- Current repository release is `0.3.0` (Geography).

Proposed integration point:

```text
/
├── /math-logic
├── /geography
└── /computer-science
    └── /architecture-lab
```

The Architecture Lab should get its own realm/module route and data-driven
mission engine. It should not be inserted into the Math world registry or
reopen the Climate Detective route coupling.

## Scope gates

### Gate 0 — Design and provenance lock

Before any code:

- [x] Import the Bible into the repository.
- [x] Record the Bible SHA-256 in `SOURCE_REGISTER.md`.
- [x] Establish the 79-mission inventory in `MISSION_MATRIX.md`.
- [x] Define the ChatGPT artifact/review protocol.
- [ ] Verify the exact source sections for Vertical Slice A against the
  primary source repository.
- [ ] Approve the first storyboard prompt and target ChatGPT conversation.

### Gate A — Vertical Slice A: first six missions

Implement only Missions 1–6:

1. Open the Shop
2. Follow One Request
3. Find the Three Local Assumptions
4. Disk Full at 02:00
5. The Network Is Now Part of the System
6. Fifty Connections or Five Hundred?

The gate passes only when a fresh player can observe the system, inspect
evidence, choose among plausible changes, run a simulation, see the trade-off,
and explain why the next problem appears. A technology glossary or static
diagram is not sufficient.

### Gate B — Vertical Slice B: data pressure and cache

Missions 14–16 validate traffic animation, database pressure, cache-aside, and
cache failure modes. Start only after Gate A is a playable and enjoyable loop.

### Gate C — Deployment evolution

Missions 46–53 validate environment drift, Docker, Compose, state, and the
cluster boundary.

### Gate D — Control-loop scaling

Missions 62–65 validate probes, HPA, queue-driven scaling, and resource/cost
ceilings.

### Full curriculum gate

Only after A–D are independently fun and verified should the remaining mission
storyboards be generated in batches. The 79-mission count is a destination,
not a reason to skip vertical-slice learning.

## Mission production contract

Each mission gets a stable file under `missions/` and a versioned ChatGPT
artifact under `artifacts/chatgpt/`. The mission file must contain:

1. mission ID/title and act/chapter;
2. exact primary-source section(s) and source excerpt notes;
3. source-derived incident versus fictional framing;
4. starting topology and system state;
5. business situation and trigger;
6. observable symptoms and available evidence;
7. at least two plausible interventions;
8. deterministic simulation inputs and expected directional outputs;
9. root cause and the learner's causal explanation;
10. consequences/trade-offs for every major action;
11. misconceptions and `do_not_teach_yet` boundaries;
12. mobile interaction and accessibility requirements;
13. success/scoring rules and recovery path;
14. next-incident hook;
15. test cases and screenshot/evidence plan;
16. review history and acceptance decision.

## ChatGPT orchestration loop

### 1. Prepare

Codex reads the Bible, the exact primary-source section, current repository
architecture, and the relevant previous mission. It writes a focused brief;
it does not ask ChatGPT to write the whole game.

### 2. Request

Using the existing user-selected ChatGPT conversation, send one mission-sized
prompt. The prompt must name the mission, source sections, required output
schema, non-goals, and explicit provenance rules. Ask for a downloadable
Markdown artifact named with mission ID and revision, for example
`M01-open-the-shop-storyboard-v1.md`.

Sending a message is an external action. Before the first send in a batch,
show the user the exact prompt and confirm the target conversation. Do not
send credentials, hidden browser data, or unrelated conversation content.

### 3. Capture

Download or copy the returned artifact without overwriting earlier revisions.
Record timestamp, ChatGPT conversation, revision, source references, and
artifact hash in the mission file. A response that is only visible in the
chat is not yet a committed storyboard artifact.

### 4. Review

Codex checks:

- source fidelity and whether claims are marked as simulation;
- causal correctness and missing prerequisites;
- evidence-before-answer sequencing;
- whether wrong but plausible choices have meaningful consequences;
- whether the loop is playable rather than a reading exercise;
- whether metrics are deterministic and testable;
- whether mobile/accessibility details are actionable;
- whether the next incident follows from the intervention.

Review findings are recorded in `reviews/` and linked from the mission file.

### 5. Challenge

If review finds a gap, send ChatGPT a bounded challenge containing the exact
finding, evidence, and requested revision. Ask it to revise only the affected
mission and to preserve correct material. Never ask it to silently rewrite all
79 missions after a local finding.

### 6. Accept and checkpoint

When the storyboard meets the contract, commit the immutable artifact and
review record. Then implement the smallest code slice, run tests/build, use
the browser to play the mission as a fresh player, capture evidence, and
update `PROGRESS.md`. Only then can the mission become `✅ VERIFIED`.

## Decision gates requiring the user

Pause and ask for a decision if:

- the primary source and Bible materially disagree;
- the source licence or attribution is unclear;
- a simplification would teach a false causal relationship;
- a mission needs a new dependency or major route architecture change;
- ChatGPT returns an artifact that cannot be downloaded or versioned;
- a message would publish, delete, merge, or otherwise affect an external
  system beyond the requested Git checkpoint;
- the vertical slice fails the fresh-player game gate.

## Immediate next actions

1. Verify the source repository's exact sections for Missions 1–6.
2. Prepare the first ChatGPT prompt for Mission 1 and show it for approval.
3. After the first artifact arrives, review it before asking for Mission 2.
