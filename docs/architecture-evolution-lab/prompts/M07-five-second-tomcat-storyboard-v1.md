# M07 Storyboard Request — The 5-Second Tomcat

Create exactly one downloadable Markdown artifact named
`M07-five-second-tomcat-storyboard-v1.md` for the selected Architecture
Evolution Lab conversation.

This is a storyboard-only request. Do not implement code, do not modify the
repository, and do not design M08 or later missions.

## Locked source and scope

Primary source: `ccc115a/se`, `_more/mybook/向淘寶學習網站架構演進/1.3.md`,
source commit `86f1816c44781a7e1f4efe72dac3b4f5114e5049`.

Source-backed M07 incident: after the database was moved away, campaign
warm-up changes Tomcat response time from about 50 ms to about 5 s, CPU reaches
100%, and Full GC freezes the site. The chapter's core lesson is that CPU,
memory/GC and I/O bottlenecks can share the symptom “slow” but require different
evidence and remedies.

Keep M07 as one complete playable investigation. Defer the deep CPU lesson,
memory/Full-GC remediation, I/O lesson, thread-pool tuning and scale-up versus
scale-out to M08–M12. Atlas Market and all incident telemetry are fictional or
deterministic teaching simulation unless explicitly marked source-backed.

## Required player loop

The mission must support:

`OBSERVE → INVESTIGATE → FORM A DIAGNOSIS → PREDICT/CHOOSE A DIAGNOSTIC RUN → RUN → REVEAL → RECONCILE → EXPLAIN → SCORE → REPLAY`

The fresh player must see a neutral slow-incident objective. Do not reveal the
correct bottleneck, tool, or remedy in the opening copy. The player should be
able to inspect CPU, memory/GC and I/O evidence, compare at least two plausible
diagnoses, make a wrong but understandable choice, recover, and explain why a
shared “slow” symptom is not enough to identify the cause.

Use deterministic simulation values and explicit provenance labels. If the
source wording suggests CPU saturation and Full GC at the same time, design the
evidence so the player must distinguish primary signal, secondary symptom or
missing evidence rather than being handed an automatic answer. Do not claim
that a single observed metric proves a universal production remedy.

## Required artifact structure

Include:

1. source-trace table with exact source claims, source-backed versus fictional
   simulation labels, and adaptation boundaries;
2. player-facing storyboard with first 10 seconds, all states, UI copy,
   evidence cards/panels, hidden/revealed information, actions and recovery;
3. deterministic simulation/data contract with units, fixed seed, missing-value
   rules, result tables, state transitions and score arithmetic;
4. causal explanation builder that separates symptom → evidence → diagnosis →
   consequence and includes at least two plausible alternatives;
5. prediction/diagnostic-run mechanic where a complete wrong hypothesis reaches
   reveal and is reconciled after the run;
6. replay and stale-state invariants;
7. desktop, 390×844 mobile, keyboard, touch and reduced-motion requirements;
8. accessibility announcements and non-colour state cues;
9. implementation handoff: engine interfaces, route/component boundaries,
   test IDs, rendered-HTML no-leak checks and evidence paths;
10. `do_not_teach_yet` list explicitly keeping M08–M12 out of M07;
11. 40–50 granular acceptance criteria with stable IDs `M07-T001` onward;
12. a machine-readable `test_ids` registry containing exactly the same stable
    IDs in the same order, with no duplicates or empty regex alternatives;
13. a neutral next-incident hook that does not design or reveal M08.

Before delivering, run an anchored audit proving matrix/registry equality,
unique contiguous IDs, preservation of the neutral next hook, and no hidden
answer in the fresh-player copy. Return one downloadable Markdown artifact and
a concise summary/change log. Do not implement fixes or ask Codex to accept the
storyboard automatically.
