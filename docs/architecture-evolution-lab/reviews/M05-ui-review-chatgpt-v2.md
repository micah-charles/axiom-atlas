# M05 UI/gameplay review — ChatGPT v2

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Implementation commit reviewed: `fae5017`  
Route: `/computer-science/architecture-lab/m05`

## Verdict

**Presentation verdict: REVISION REQUIRED.**

The persistent Request Flight + Slot Pressure Board was accepted. The fresh
state no longer exposed the dependency answer, and the unbounded result was
clear. One contradiction remained in the bounded phase.

## Finding

The board used `E02`-derived waiting state before applying the bounded run or
reveal state. As a result, the bounded result banner could say
`CONTROL RETURNED WITH ERROR` while the board still showed:

- `REQ-A` / `REQ-B` as `WAITING`;
- `NO COMPLETION OBSERVED`;
- occupied-slot wording that implied the pre-run state.

This was a presentation-state bug, not an engine-truth bug.

## Required correction

Bounded run/reveal and final decision/complete states must take precedence over
evidence-derived waiting state:

- requests: `TIMEOUT / RETRY`;
- slots: `4 fixed slots · caller returned`;
- DB call state: `ERROR AFTER BOUNDED ATTEMPTS`;
- result banner: caller control returned while the dependency remains
  unavailable.

The responsive, keyboard, touch, reduced-motion and screen-reader gates remain
open until tested at runtime.

