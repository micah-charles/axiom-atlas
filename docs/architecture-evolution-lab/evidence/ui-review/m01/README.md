# M01 UI review packet

This folder captures the first playable Architecture Evolution Lab scenario, **M01 — Open the Shop**, from a clean replay through completion.

- Route: `/computer-science/architecture-lab`
- Branch: `feature/architecture-evolution-lab`
- Capture date: 2026-09-17
- Capture source: local Chrome tab at `http://localhost:3001`
- Browser zoom: 150% (deliberately captured to test the reported readability problem)
- Viewport: 1270 × 577 CSS pixels
- Scenario result: clean completion, 100/100

The sequence is a representative state capture, not a recording of every animation frame. It covers the screens a reviewer needs to judge hierarchy, copy density, interaction feedback, causal reasoning, failure reveal, and completion feedback.

| File | State | What to inspect |
| --- | --- | --- |
| `m01-01-fresh-investigation.jpg` | Fresh briefing / empty system | First-glance clarity, density, objective, evidence affordances |
| `m01-02-evidence-inspected-approaches-unlocked.jpg` | Evidence gate open | Whether inspection feels investigative or checklist-like |
| `m01-03-build-complete-topology.jpg` | Smallest complete topology | Diagram legibility and decision feedback |
| `m01-04-request-step-1.jpg` | Live request, step 1/9 | Simulation framing and next-action clarity |
| `m01-05-request-step-2.jpg` | Live request, step 2/9 | Progression and repeated layout |
| `m01-06-request-step-5.jpg` | Live request, step 5/9 | Mid-flow suspense and information density |
| `m01-07-request-step-9.jpg` | Live request, step 9/9 | Completion state before the reveal |
| `m01-08-failure-reveal.jpg` | Shared failure-domain reveal | Surprise, causal payoff, and trade-off communication |
| `m01-09-explanation-empty.jpg` | Explanation with no selections | Whether the task is understandable without answer leakage |
| `m01-10-explanation-ready.jpg` | Explanation ready to submit | Selection feedback and causal-chain readability |
| `m01-11-complete-100.jpg` | Mission complete | Score meaning, reflection, and motivation to continue |

## Review request

Review these screenshots together with the committed M01 implementation. Focus on text density, the 150% readability problem, whether the flow feels like a playable investigation rather than a worksheet, the suitability of the dark Axiom Atlas theme, opportunities for more vivid interaction, responsive/mobile implications, keyboard/touch affordances, and any accidental answer leakage.

The reviewer should return concrete, prioritized UI changes and an implementation-ready prototype direction before source changes are made.
