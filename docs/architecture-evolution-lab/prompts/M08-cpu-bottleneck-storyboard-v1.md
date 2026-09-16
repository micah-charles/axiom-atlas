# M08 Storyboard Request — CPU Bottleneck

Create exactly one downloadable Markdown artifact named
`M08-cpu-bottleneck-storyboard-v1.md` for the selected Architecture Evolution
Lab ChatGPT conversation.

This is a storyboard-only request. Do not implement code, do not modify the
repository, do not create a pull request, and do not design M09 or later
missions. Return one downloadable artifact plus a concise visible summary and
change log. Do not ask Codex to accept the storyboard automatically.

## Current orchestration state

M07 — The 5-Second Tomcat — has a committed implementation on the feature
branch at commit `e8fb33abffd1818e24ef5a74e7a276e0005b6afb`. Its implementation
correctness and playable loop were accepted by the prior committed-source
review. Full runtime verification remains conditional because mobile,
keyboard-only, touch, reduced-motion and screen-reader evidence is still open.
That evidence debt does not authorize M08 code; this request is only to
produce and review the next storyboard contract.

## Locked primary source and scope

Primary source repository: `ccc115a/se`

Exact source path: `_more/mybook/向淘寶學習網站架構演進/1.3.md`

Pinned source commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`

Source URL:
https://github.com/ccc115a/se/blob/86f1816c44781a7e1f4efe72dac3b4f5114e5049/_more/mybook/%E5%90%91%E6%B7%98%E5%AF%B6%E5%AD%B8%E7%BF%92%E7%B6%B2%E7%AB%99%E6%9E%B6%E6%BC%94%E9%80%B2/1.3.md

M08 title: **CPU Bottleneck**.

Source-backed scope:

- high load;
- Java consuming CPU;
- a hot stack in rendering/serialisation or comparable compute work;
- CPU saturation causing request queueing and slower response;
- possible responses of simplifying computation, reducing reflection/template
  work, or upgrading CPU;
- the trap that adding memory does not fix CPU saturation.

The section also describes memory/Full GC and I/O as alternative resource
families. Use those only as bounded comparison evidence and recovery paths.
Do not turn this into M09, M10, M11, M12 or M13.

Atlas Market, incident values, telemetry, experiment outcomes and UI wording
are fictional/deterministic teaching simulation unless directly marked
source-backed. Never imply invented measurements came from a live server.

## Required player experience

Design one complete investigation, not a dashboard and not a collection of
quiz screens. The player must experience:

`OBSERVE → INVESTIGATE → FORM A HYPOTHESIS → PREDICT / CHOOSE A CONTROLLED CHANGE → RUN → REVEAL → RECONCILE → EXPLAIN → SCORE → REPLAY`

The fresh player should understand the objective within ten seconds, but the
opening must not name CPU as the answer or recommend a remedy. The player must
be able to inspect evidence before committing to a diagnosis.

Required investigation shape:

1. A slow incident interrupts a busy Atlas Market campaign.
2. The player compares request load, Java CPU, response queueing and at least
   one hot-stack/compute clue.
3. The player also sees enough memory/GC and I/O evidence to reject plausible
   alternatives without learning their later missions in depth.
4. The player forms a diagnosis before selecting an intervention or experiment.
5. The player predicts an observable result, then runs the controlled teaching
   simulation.
6. The reveal shows what changed and why; it must not silently correct the
   player's reasoning.
7. A wrong-but-complete path reaches reveal, gives specific feedback, and can
   recover without a forced restart.
8. The explanation builder distinguishes symptom → evidence → mechanism →
   intervention → consequence/trade-off.
9. The player can replay from a clean state with no stale selected cards,
   diagnosis, prediction, run result, score or reveal text.

Do not make “increase CPU” the only accepted answer. Make the player reason
about a bounded workload and compare at least two defensible interventions,
with explicit assumptions and trade-offs. Do not teach capacity planning,
thread-pool sizing or horizontal scaling here.

## Required artifact structure

Include all of the following in the artifact:

1. **Source-trace table** — exact source claims, source-backed versus fictional
   simulation labels, and adaptation boundaries.
2. **Mission contract** — objective, first 10 seconds, trigger, success,
   failure/recovery, and the exact M09–M13 boundary.
3. **Player-facing storyboard** — every state from fresh open to replay, with
   UI copy, actions, hidden/revealed information, affordances and transitions.
4. **Evidence model** — load, Java CPU, queue/latency, hot stack, memory/GC and
   I/O comparison cards; for each, state what it proves, what it cannot prove,
   whether it is initially hidden, and how it is accessed.
5. **Hypothesis and causal-chain interaction** — diagnosis choices plus a
   non-MCQ explanation builder with click/tap and keyboard alternatives.
6. **Prediction/controlled-run contract** — fixed inputs, permitted
   interventions, exact result table, missing-value/error semantics, and
   before/after reveal copy. A complete wrong choice must be observable and
   recoverable.
7. **Deterministic simulation contract** — seed, state machine, units, value
   ranges, rounding, provenance labels, no silent interpolation, and replay
   reset invariants.
8. **Scoring** — exact arithmetic for evidence, diagnosis, causal reasoning,
   prediction, intervention fit, efficiency and recovery. Explain partial credit
   and avoid rewarding blind guessing.
9. **Accessibility and responsive contract** — desktop and 390×844 layout,
   keyboard-only path, touch targets, focus order, live announcements,
   non-colour state cues and reduced-motion behaviour.
10. **Implementation handoff** — engine interfaces, component/route boundary,
    data-testid contract, rendered-HTML no-leak checks, unit/integration test
    cases and evidence paths.
11. **`do_not_teach_yet` list** — explicitly keeping M09–M13 out of M08.
12. **40–50 granular acceptance criteria** with stable IDs `M08-T001` onward.
13. **Machine-readable `test_ids` registry** containing exactly the same IDs in
    exactly the same order, with no duplicates and no empty regex alternatives.
14. **Neutral next-incident hook** — a short continuation hook that does not
    reveal or design M09.

## Scientific/technical truth constraints

- Distinguish load average from CPU utilisation and label the units.
- Do not conflate “Java uses CPU” with proof that every request is CPU-bound;
  require the hot-stack/compute evidence and the controlled run.
- Do not present the source's illustrative values as measured Atlas Market
  telemetry.
- Do not claim that adding memory fixes a CPU bottleneck.
- Do not teach “more threads is better”, connection pools, scale-out or Amdahl
  in this mission.
- Use explicit `OBSERVED SOURCE CLAIM`, `TEACHING SIMULATION`, and
  `DERIVED/SCORING` labels where appropriate.
- Define how unavailable evidence behaves; do not replace missing values with
  invented zeros or silently interpolate a diagnostic signal.

## Audit before delivery

Before returning the artifact, run an anchored self-audit proving:

- acceptance matrix IDs and `test_ids` registry are exactly equal;
- IDs are unique and contiguous;
- every registry regex is non-empty and anchored to a stable UI contract;
- fresh-player copy does not contain the diagnosis or intervention answer;
- the artifact does not design M09–M13;
- every intervention has a deterministic result and a recoverable wrong path;
- score arithmetic totals correctly and replay clears all mission state;
- all five runtime/accessibility evidence classes are represented in the
  handoff, without claiming they have already been captured.

Return exactly one downloadable Markdown artifact named
`M08-cpu-bottleneck-storyboard-v1.md`, followed by a concise visible summary
and change log. Do not write code or modify the repository.
