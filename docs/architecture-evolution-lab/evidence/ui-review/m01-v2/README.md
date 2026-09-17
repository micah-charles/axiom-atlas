# M01 Architecture Lab UI Review, v2

Second-pass screenshots for the first playable Architecture Evolution Lab scenario, captured after the first ChatGPT UI review.

- Branch: `feature/architecture-evolution-lab`
- Local route: `http://localhost:3001/computer-science/architecture-lab`
- Capture date: 2026-09-17
- Browser viewport: 1270 × 577
- Browser scale: 150% readability pass
- Clean path: 100/100

## Changes under review

- Evidence observations are hidden until a player inspects a card.
- Candidate topology choices use neutral test language instead of pre-marking the proportionate answer.
- The request trace shows future steps as locked, while the active target is highlighted.
- The player must predict the failure before pulling HOST 01 and seeing the reveal.
- The causal explanation now has a visible claim chain and plausible-but-unsupported distractors.
- Completion leads with the architecture reveal and score, with detailed scoring collapsed.
- M01-only typography is enlarged for the 150% readability gate without changing later missions.

## Captures

| File | State |
| --- | --- |
| `m01-v2-01-fresh-investigation.jpg` | Fresh briefing; evidence observations hidden |
| `m01-v2-02-evidence-revealed.jpg` | Four evidence cards inspected |
| `m01-v2-03-candidate-topology.jpg` | Candidate A selected without a pre-highlighted answer |
| `m01-v2-04-request-step-1.jpg` | Request starts; future steps locked |
| `m01-v2-05-request-step-5.jpg` | Mid-request; only reached steps are explained |
| `m01-v2-06-predict-failure.jpg` | Prediction gate before the failure reveal |
| `m01-v2-07-failure-reveal.jpg` | Predicted failure compared with reality |
| `m01-v2-08-explanation-empty.jpg` | Causal builder before claims are selected |
| `m01-v2-09-explanation-ready.jpg` | Five-claim explanation chain assembled |
| `m01-v2-10-complete-score.jpg` | Completion reveal with collapsed score breakdown |

## QA note

The screenshots are viewport captures, not full-page captures. Some states begin at the current scroll offset because the browser focuses the newly active primary action, so the evidence folder preserves the actual interaction viewport as experienced during the run.
