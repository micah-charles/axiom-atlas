# Architecture Evolution Lab Review Protocol

This protocol is the acceptance contract between the Bible, ChatGPT
storyboards, Codex implementation, and player evidence.

## Review order

Review in this order; do not jump straight to visual polish:

1. provenance;
2. causal correctness;
3. evidence and interaction;
4. consequence and trade-off;
5. pedagogy and misconception control;
6. implementation feasibility;
7. fresh-player game feel;
8. automated/manual evidence.

## Storyboard review questions

### Provenance

- Is every technical claim linked to an exact primary-source section?
- Is the fictional Atlas Market framing visibly separate from source fact?
- Are all simulated values labelled as educational approximations?

### Causality

- Is there a measurable problem before a technology is introduced?
- Can the player identify the bottleneck from evidence rather than a label?
- Are alternative interventions plausible, and do they produce different
  consequences?
- Does a successful change expose a new limitation or trade-off?

### Gameplay

- What does the player do in the first 10 seconds?
- What evidence can be inspected, and what is hidden until investigation?
- Can a player make a wrong but understandable choice?
- Does the simulation visibly change after the choice?
- Is the explanation step causal rather than a vocabulary quiz?
- Can the player recover without reading a lecture first?

### Product and UX

- Is the objective visible at all times?
- Are topology, metrics, logs/traces, action tray, and compare state readable?
- Does the mobile tabs model work without losing causal context?
- Are colour, motion, text, and icons all used for state communication?
- Are reduced-motion and keyboard/touch paths specified?

### Engineering

- Can the mission be represented as data rather than a bespoke page?
- Are simulation rules deterministic and unit-testable?
- Are state transitions, scoring, and persistence explicit?
- Is the implementation isolated from existing Math and Climate engines?
- Are render/build/browser evidence paths named before implementation?

## Challenge message template

```text
Revise only [MISSION ID] in the current Architecture Evolution Lab Bible work.

Review finding:
[one precise problem]

Evidence:
[source section, storyboard paragraph, or failed acceptance check]

Required correction:
[what must change]

Preserve:
[already-correct material]

Return:
1. a revised downloadable Markdown artifact named [filename];
2. a short change log;
3. a source-trace table;
4. any unresolved decision requiring human approval.

Do not invent historical incidents, hide the answer before investigation, or
expand this revision to other missions.
```

## Acceptance statuses

- `⬜ NOT STARTED`: no accepted storyboard or implementation.
- `🟨 IN PROGRESS`: prompt, review, or implementation is active.
- `🟦 IMPLEMENTED / NEEDS QA`: code exists but acceptance evidence is missing.
- `✅ VERIFIED`: source, tests, visual inspection, fresh-player gate, and
  evidence all pass.
- `⛔ BLOCKED`: a documented source, licence, architecture, or product
  decision prevents safe progress.

## Required evidence per verified mission

- source-trace record;
- accepted storyboard and revision history;
- unit tests for simulation/scoring rules;
- lint/build/test output;
- desktop screenshot or recording;
- mobile screenshot or recording;
- fresh-player notes including first action, wrong choice, recovery, and
  explanation;
- Git commit hash.
