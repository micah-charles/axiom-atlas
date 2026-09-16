# M07 Primary-Source Review

Date: 2026-09-16
Repository: `ccc115a/se`
Source path: `_more/mybook/向淘寶學習網站架構演進/1.3.md`
Source commit: `86f1816c44781a7e1f4efe72dac3b4f5114e5049`

## Source-backed contract

The source chapter is titled “Application-server performance bottlenecks:
CPU, memory and I/O competition.” Its opening incident reports a campaign
warm-up changing Tomcat response time from about 50 ms to about 5 s, CPU
reaching 100%, and Full GC freezing the site. Restarting temporarily helps.

The source says the application server has three competing resource families:

- CPU: rendering/serialization work can saturate compute and lengthen queues.
- Memory: large Session/cache objects can cause frequent Full GC or OOM.
- I/O: slow DB/image reads can leave CPU idle while threads block.

The central learning claim is that “slow” is a shared symptom, not a diagnosis;
the evidence and remedy differ by bottleneck. The source names `top`, `jstat`
and `jstack` as diagnostic tools and presents Tomcat `maxThreads` / `acceptCount`
as a later thread-pool trade-off. It closes by establishing the physical ceiling
of a single machine and the next scale-up/scale-out question.

## Adaptation boundaries for M07

M07 should be one playable diagnostic investigation, not five lessons. It may
teach the player to distinguish CPU, memory/GC and I/O evidence, but it must
defer the deep CPU lesson (M08), memory/Full-GC remediation (M09), I/O lesson
(M10), thread-pool trade-off (M11), and scale-up versus scale-out (M12).

Atlas Market, incident telemetry, timings, counters and outcomes must be
labelled fictional or deterministic teaching simulation. The source's examples
must not be presented as measured production telemetry or universal tuning
advice.

## Acceptance implications

- Fresh state must show the slow incident and a neutral objective, not the
  diagnosis or remedy.
- Evidence must let the player compare CPU, memory/GC and I/O signals before
  choosing a diagnosis.
- At least two plausible wrong diagnoses must be recoverable and produce
  understandable consequences.
- The causal explanation must distinguish symptom, evidence and root cause;
  it must not collapse “CPU 100%” and “Full GC” into an unsupported automatic
  diagnosis.
- The mission needs a deterministic, testable model and an explicit next hook
  that does not implement M08–M12.
- Any command names shown in the game are teaching-model instruments, not a
  request for students to operate a real production server.

## Source URL

https://github.com/ccc115a/se/blob/main/_more/mybook/%E5%90%91%E6%B7%98%E5%AF%B6%E5%AD%B8%E7%BF%92%E7%B6%B2%E7%AB%99%E6%9E%B6%E6%A7%8B%E6%BC%94%E9%80%B2/1.3.md
