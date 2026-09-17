# M01 UI / Gameplay Review — ChatGPT visual direction v3

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Implementation baseline reviewed: `34dfe21`  
Scope: M01 — Open the Shop only

## Review request

ChatGPT was asked to review the M01 v2 screen flow and propose a more playful,
visual, game-like presentation. The request specifically called for visible
server/technology objects, moving data, and a concrete incident in which a host
goes offline. The review was design-only: ChatGPT was not asked to edit the
repository.

ChatGPT generated a UI prototype in the selected conversation. The exact image
model label was not exposed by the browser, so this record does not claim that
the prototype was produced by a specific “Image 2.5” or “Image 2.0” model.
The prototype was used as visual direction, not as production UI artwork.

## Accepted visual direction

The dark Axiom Atlas palette remains suitable, but it now has a clearer visual
grammar:

| Signal | Meaning |
| --- | --- |
| Cyan | live / observed system flow |
| Gold | player focus, decision, or active packet |
| Green | verified success |
| Red | real incident, failure, or unavailable service |

The topology is the game board. Evidence, candidate choice, request trace,
prediction, failure reveal and explanation support what the player sees on that
board. Functional UI remains code-native SVG/CSS rather than raster art.

## Implemented v3 changes

- Added recognisable inline SVG objects for Browser, DNS resolver, HOST 01,
  Tomcat, MySQL, local Images and in-memory Session.
- Made DNS explicit in the request path instead of leaving it as an implied
  label.
- Added a blueprint-style topology canvas with directional edges and a moving
  `GET` packet during the nine-step request trace.
- Added a separate neutral `TEST CANDIDATE` action. Selecting a topology no
  longer reveals the result before the player commits to testing it.
- Added active node/edge highlighting and a semantic legend for observed flow,
  player focus and incident state.
- Added a visible failure animation/state: HOST 01 becomes red and offline,
  the packet is dropped, Browser and DNS remain online, and the four local
  services become unreachable or lost.
- Kept failure predictions outcome-only: shop unavailable, shop remains
  available, or only stored data remains available.
- Shortened the causal-builder copy and kept distractor claims available so the
  player must assemble the explanation rather than read the answer.
- Added a polite live status announcement for the host-failure reveal and
  removed redundant SVG accessibility text where equivalent HTML labels exist.
- Added reduced-motion CSS fallbacks for packet and failure animation.

## Browser evidence

The fresh local Chrome run completed the full M01 loop:

1. inspect three evidence cards;
2. choose the available-host candidate while it is still neutral;
3. test the candidate and receive the result;
4. run the request through Browser → DNS → Tomcat → MySQL/Images → Browser;
5. predict the HOST 01 failure outcome;
6. reveal the failure and inspect the changed service states;
7. assemble the five-part causal explanation;
8. submit and reach the completion screen at `100/100`.

Captured evidence:

- `evidence/ui-review/m01-v3-simulate-step-1.png`
- `evidence/ui-review/m01-v3-predict-failure.png`
- `evidence/ui-review/m01-v3-host-failure.png`
- `evidence/ui-review/m01-v3-visual-direction.png` — local visual-direction
  reference generated for the implementation pass.

## Remaining verification debt

This review does not promote M01 to VERIFIED. The shared verification gate
still needs dedicated 390px/mobile, touch, keyboard-only, reduced-motion and
screen-reader evidence. The desktop gameplay and rendered regression suite are
passing.

