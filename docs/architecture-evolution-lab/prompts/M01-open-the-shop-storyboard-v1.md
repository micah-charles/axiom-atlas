# ChatGPT storyboard request — M01 Open the Shop v1

You are the storyboard/content-design agent for Axiom Atlas's new
**Architecture Evolution Lab**. Work on exactly one mission: **M01 — Open the
Shop**. Do not design M02–M79 and do not write React, TypeScript, or production
code.

## Product and source boundary

The player works for the fictional company **Atlas Market**. The game teaches
architecture through a causal chain:

```text
problem → evidence → diagnosis → intervention → trade-off → next problem
```

The primary technical source is:

- repository: https://github.com/ccc115a/se
- exact section: `_more/mybook/向淘寶學習網站架構演進/1.1.md`
- direct source page:
  https://github.com/ccc115a/se/blob/main/_more/mybook/向淘寶學習網站架構演進/1.1.md
- source blob SHA recorded by the orchestrator:
  `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`

The source supports an early shop with a few hundred products, fewer than 100
concurrent users, a single Linux host running Web/application/database
components, the DNS → HTTP → Tomcat → JDBC → MySQL request path, local image
storage, and in-memory Session. It presents a single-node monolith as a
rational fast/cheap starting point with no redundancy and a limited ceiling.

Do not claim that Atlas Market is a literal reconstruction of historical
Taobao. Use the source for technical causality, while clearly labelling Atlas
Market characters, incidents, metrics, timings, costs, and dashboards as
fictional or educational simulation values unless the source explicitly
supports the claim.

## Mission intent

M01 must make the player assemble the smallest useful online shop. The player
should discover that a single-node monolith is appropriate under the stated
constraints, while also noticing that one host is one failure domain and will
become the next problem. The mission must not reward adding Kubernetes,
sharding, load balancing, or other later technology before a present problem
requires it.

## Required deliverable

Return a downloadable Markdown artifact named exactly:

`M01-open-the-shop-storyboard-v1.md`

Also include a short change log after the artifact or in a separate response
section. The artifact must be detailed enough for another agent to implement
the mission without guessing.

## Required artifact structure

### 1. Mission header

Include mission ID, title, act/chapter, source sections, intended learner
level, estimated play time, and one-sentence learning objective.

### 2. Source traceability

Create a table with:

| Claim or mechanic | Source fact or game simulation | Exact source section | Notes |
|---|---|---|---|

Do not use unsourced historical claims. Explicitly list every value that is
simulation-only.

### 3. Story beats

Write the player-facing sequence with Atlas Market characters providing
evidence rather than lectures:

1. arrival and business constraint;
2. current system context;
3. player investigation;
4. architecture assembly;
5. request simulation;
6. decision/result;
7. trade-off reveal;
8. next-incident hook.

For each beat specify the character, visible text, player action, unlocked
evidence, and what must remain undisclosed.

### 4. Screen-by-screen storyboard

Specify desktop and mobile layouts for:

- mission briefing;
- architecture canvas;
- evidence drawer/panel;
- action tray;
- live request simulation;
- before/after comparison;
- explanation and result screen.

For every screen include objective, controls, state labels, empty/error state,
keyboard/touch operation, reduced-motion behaviour, and the first thing a
fresh player should notice.

### 5. Starting system and topology

Define the initial topology as data, not a decorative diagram. Include nodes,
edges, request path, local resources, and the failure blast radius. Keep the
initial system intentionally small and consistent with source section 1.1.

### 6. Evidence and investigation

Define at least four inspectable evidence items. The player must infer the
architecture from constraints and evidence rather than click a button labelled
“single-node monolith”. For each evidence item specify its observation,
interpretation, access interaction, and whether it is source-backed or
simulated.

### 7. Choices and deterministic simulation

Provide at least three plausible player actions, including the proportional
single-node choice and at least two premature/overbuilt alternatives. For each
choice specify:

- what changes in the topology;
- deterministic inputs and rules;
- expected directional metrics;
- cost/complexity/reliability consequence;
- whether it succeeds, partially succeeds, or fails;
- how the player recovers.

Do not make the wrong answers silly. The player should be able to understand
why an overbuilt choice is tempting and why it is disproportionate here.

### 8. Explanation and scoring

Define a causal explanation interaction, not a vocabulary-only multiple-choice
quiz. The player must explain why the chosen architecture fits the current
constraints and what it leaves unsolved. Score separately:

- diagnosis;
- proportionality/cost;
- reliability awareness;
- explanation;
- investigation efficiency.

Give useful partial-credit feedback and a recovery path.

### 9. Misconceptions and boundaries

List misconceptions to challenge, including “the biggest architecture is
always best” and “single-node means incorrect”. Define `do_not_teach_yet` so
the mission does not teach later scaling solutions before the next incident.

### 10. Implementation handoff

Provide a data-oriented mission object proposal containing IDs, states,
evidence, actions, simulation inputs, success rules, scoring, next hook,
source references, and test IDs. Do not write application code.

### 11. Test and evidence plan

Write acceptance tests for:

- fresh-player first action within 10 seconds;
- initial topology and request path;
- correct proportional choice;
- each plausible wrong choice and its consequence;
- deterministic replay;
- explanation/scoring;
- keyboard/touch/mobile path;
- reduced-motion path.

Name the screenshots or recordings that should be captured after
implementation.

### 12. Open questions

End with only genuinely unresolved decisions. Do not ask the orchestrator to
decide items that the source and mission contract already settle.

## Non-negotiable constraints

- One mission only: M01.
- No code implementation.
- No invented Taobao history.
- No unsupported production numbers presented as facts.
- No answer reveal before investigation.
- No expansion to the full 79-mission curriculum.
- Preserve the distinction between source fact, fictional framing, and game
  simulation.
