# M02 Storyboard Review — v1.1

## Scope

- Mission: M02 — Follow One Request
- Source: `1.1.md`
- Review type: storyboard/content-contract gate
- Reviewer: Codex orchestration pass
- Review date: 2026-09-16

## Revision history

### v1 — REVISION REQUIRED

Artifact: `artifacts/chatgpt/M02-follow-one-request-storyboard-v1.md`

SHA-256: `c5fe7bce6e020260317ec4bbce35395b7d9f7cea993654ceaa1b9c8532a60074`

The artifact was structurally detailed, but it drifted from the locked M02
mission contract. Timing was optional, there was no required DNS-delay versus
server-delay experiment, and the full local-boundary investigation was pulled
forward from M03.

### v1.1 — ACCEPTED

Artifact: `artifacts/chatgpt/M02-follow-one-request-storyboard-v1.1.md`

SHA-256: `bd7c39068186d19474afde3488dd965d8bdfe3eff56d5ca29a4e6dfa4f521c23`

## Gate decision

**ACCEPTED — M02 storyboard is ready for implementation.**

## Verification matrix

| Requirement | Result | Evidence |
|---|---|---|
| Observable slow-site problem with unknown cause | PASS | S01 and locked contract make the customer symptom the first problem. |
| Source / fiction / teaching-simulation boundary | PASS | Provenance classes and source traceability table; all timings labelled simulated. |
| Exact request journey | PASS | DNS → HTTP → Tomcat → JDBC/MySQL → response is a deterministic five-stage route. |
| Timing as central evidence | PASS | Fixed healthy, incident-baseline, DNS-control and server-control profiles. |
| Player diagnosis before answer reveal | PASS | Diagnosis is committed before experiment results are revealed. |
| DNS delay vs server delay experiment | PASS | X01 and X02 have deterministic before/after profiles and predictions. |
| Actual slow segment identification | PASS | Final diagnosis requires evidence selection and resolves the incident to DNS. |
| Causal explanation and scoring | PASS | Six-category 100-point deterministic score and explanation predicate. |
| Recoverable wrong reasoning | PASS | Wrong route and wrong diagnosis paths preserve completion with reduced credit. |
| M03 boundary | PASS | Local assumptions are explicitly deferred and tested absent from player-facing runtime. |
| Later-technology boundary | PASS | Redis, load balancers, Kubernetes, microservices, queues and related remediation are non-goals. |
| Replay and determinism | PASS | Reset contract and deterministic replay tests are specified. |
| Accessibility / responsive / motion requirements | PASS | Keyboard-only, 390px mobile, reduced-motion and provenance tests are specified. |

## Implementation constraints carried forward

1. Treat the timing values as teaching simulation, never as production or
   historical measurements.
2. Do not reveal the incident's DNS diagnosis before the player commits and
   runs at least one controlled experiment.
3. Keep the route builder and experiment prediction as real player decisions;
   do not collapse them into an explanatory animation.
4. Do not include M03 local-assumption discovery in M02's runtime completion
   or scoring.
5. Preserve keyboard/touch alternatives and the reduced-motion static-state
   equivalent during implementation.

## Next gate

Implement M02 only. Run core tests, build, rendered-route tests, and fresh
player QA before requesting the independent ChatGPT implementation review.
Do not request M03 until the M02 implementation review is at least PASS and
its gameplay/accessibility evidence has been recorded.
