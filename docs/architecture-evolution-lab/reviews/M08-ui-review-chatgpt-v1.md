# M08 UI/gameplay review — ChatGPT v1 baseline

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Route: `/computer-science/architecture-lab/m08`

## Baseline verdict

The fresh M08 route is readable but still presents the investigation as a
stacked evidence worksheet. ChatGPT accepted a bounded revision centred on one
persistent **Campaign Work / Queue Pressure Board**. The board should make the
load-to-outcome relationship playable:

`incoming demand → work inside the host → resource pressure → unfinished queue → customer latency`.

## Fresh-state leaks to remove

- The player-facing title `M08 — CPU BOTTLENECK` names the diagnosis before
  evidence. Use a neutral title such as `M08 — CAMPAIGN UNDER LOAD`.
- The continuity card says the mission tests “one bounded CPU hypothesis.”
  Replace it with a bounded resource hypothesis and keep Memory/GC and I/O as
  live alternatives until evidence discriminates.
- Fresh state must not visually show CPU as the bottleneck, even though the
  evidence labels `Java CPU` and `Hot compute stack` are acceptable as names of
  things to inspect.

## Accepted board direction

The persistent object should include:

- campaign demand entering the application host;
- request work / rendering and serialisation;
- CPU and scheduler pressure;
- unfinished-work queue;
- customer outcome metrics;
- real Memory/GC and Wait/I/O comparator lanes.

The fresh board is a system under investigation. It must not begin as
`compute → CPU saturation → queue`; that causal chain is earned later.

## E01–E07 progression

- E01 reveals `180 req/s` demand while leaving cause unresolved.
- E02 activates runnable pressure: load average `14.2 / 8 logical CPUs`.
- E03 reveals Java CPU `96%`, marked as a strong signal but not yet proven.
- E04 reveals `31` queued requests and customer p95 `920 ms`.
- E05 connects pressure to work: rendering/serialisation is `62%` of samples.
- E06 keeps Memory/GC as a real measured comparator: heap `71%`, Full GC `0`
  captured; weakens memory-primary for this run without declaring memory
  universally healthy.
- E07 keeps I/O as a real measured comparator: I/O wait `4%`, reads blocked
  `3 / 200`; comparatively weak for this run.

## Controlled interventions

Show each intervention as a module attached to the part it changes:

- `SIMPLIFY_COMPUTE` → rendering/serialisation work;
- `UPGRADE_CPU` → processor capacity;
- `ADD_MEMORY` → heap capacity.

Keep demand `180 req/s`, incident window and seed fixed. Before RUN, show no
result values or success styling. After reveal, display only the authoritative
engine results: simplify `72 / 8 / 340 / 172`, upgrade `67 / 11 / 410 / 168`,
add memory `95 / 29 / 890 / 151`.

## Prediction and reconciliation

Move the four qualitative forecasts onto the board instruments: CPU, queue,
p95 latency and throughput. Introduce the baseline references (`96%`, `31`,
`920 ms`, `160 req/s`) at prediction time only. Freeze the forecast before
RUN, then show predicted versus observed direction after reveal. Reconciliation
remains an explicit player judgement; a wrong prediction is recoverable but
cannot be marked confirmed.

## Acceptance criteria and open gates

Presentation is accepted when the fresh state does not name CPU as the answer;
demand, CPU, queue, Memory/GC and I/O values appear only after their evidence;
E05 visibly connects CPU pressure to compute work; interventions visibly
modify one bounded aspect; predictions precede result values; and the final
conclusion is scoped to this fixed teaching model.

The separate verification gates remain open for 390 × 844, keyboard-only,
touch, reduced-motion and screen-reader runtime evidence.

## Evidence note

The CUA browser returned a live screenshot and accessibility tree for the fresh
route, but no persistent PNG path was available to commit. No PNG is claimed
as repository evidence.
