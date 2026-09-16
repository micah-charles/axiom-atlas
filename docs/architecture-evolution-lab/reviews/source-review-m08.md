# M08 Primary-Source Review

Date: 2026-09-17
Mission: M08 — CPU Bottleneck
Repository: `ccc115a/se`
Source path: `_more/mybook/向淘寶學習網站架構演進/1.3.md`
Source commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`

## Verification

The exact source blob was checked at the pinned commit before the M08
storyboard request. Public source URL:

https://github.com/ccc115a/se/blob/86f1816c44781a7e1f4efe72dac3b4f5114e5049/_more/mybook/%E5%90%91%E6%B7%98%E5%AF%B6%E5%AD%B8%E7%BF%92%E7%B6%B2%E7%AB%99%E6%9E%B6%E6%BC%94%E9%80%B2/1.3.md

## Source-backed contract

Section 1.3 opens with a campaign warm-up incident: Tomcat response time
changes from about 50 ms to about 5 s, CPU reaches 100%, and Full GC later
freezes the site. Restarting helps temporarily. This is shared incident
context, not a complete CPU diagnosis by itself.

The CPU-specific source claims are:

- A CPU bottleneck can present as high load and Java using all available CPU.
- `top` and `jstack` are named as diagnostic tools.
- A hot stack in serialisation, encryption, or comparable computation is
  evidence for compute work consuming CPU.
- Short-term responses listed are simplifying template logic, reducing
  reflection, and upgrading CPU.
- When compute is saturated, requests queue and response time increases.
- Adding memory does not repair a CPU-saturation cause.

The source also says slow symptoms can instead come from memory/GC or I/O.
Those are comparison evidence and recovery branches for M07, but their deep
remediation belongs to M09 and M10. Thread-pool sizing and scale-up versus
scale-out are later concerns and must not become M08's lesson.

## Adaptation boundaries

The Atlas Market, request load, CPU counters, stack samples, response times,
interventions and outcomes must be labelled fictional or deterministic
teaching simulation. Do not present invented values as production telemetry.
Do not claim that one metric proves a universal capacity recommendation.

M08 may simplify the CPU path into a controlled experiment, but it must keep
the causal distinction explicit:

`request surge / compute-heavy work → CPU saturation → queueing → slower response`

The player should compare at least one plausible memory/GC explanation and one
plausible I/O explanation, then use evidence and an experiment to distinguish
them. The game must not treat the source's simultaneous CPU and Full GC wording
as proof that every symptom has one cause.

## Required handoff boundary

`do_not_teach_yet`:

- M09: Session/heap growth, Full-GC remediation and OOM.
- M10: low CPU with blocked I/O and socket-read diagnosis.
- M11: `maxThreads` / `acceptCount` tuning trade-offs.
- M12: vertical scale-up versus horizontal scale-out.
- M13: Amdahl's law and the shared serial fraction.

M08's next hook may say that another incident will test a different resource,
but it must not reveal the diagnosis or design the next mission.

## Acceptance implications

- Fresh opening is a neutral slow-incident brief, not a CPU answer.
- Evidence must expose load, Java CPU use and a compute-heavy hot stack without
  making the remedy automatic.
- A complete wrong diagnosis must reach an observable experiment/reveal and be
  recoverable.
- The player must make a prediction or choose a controlled intervention before
  the result is revealed.
- The result must distinguish a CPU-bound run from memory/GC and I/O outcomes.
- “Add memory” must be a recoverable misconception, not a silent dead end.
- The causal explanation must separate symptom, evidence, mechanism,
  intervention and consequence/trade-off.
- Units, fixed seed, missing-data rules, score arithmetic and replay invariants
  must be explicit and testable.
