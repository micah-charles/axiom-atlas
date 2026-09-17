# M05 visual-loop evidence

Mission: `M05 — The Network Is Now Part of the System`  
Route: `/computer-science/architecture-lab/m05`  
Implementation commits: `fae5017`, `fde87ce`

## Evidence captured

- Fresh state inspected after reload at the desktop readability target.
- The persistent Request Flight + Slot Pressure Board was inspected through
  evidence, dependency mapping, diagnosis and explanation.
- The local route completed the full flow: evidence E01–E06, dependency map,
  diagnosis, causal chain, prediction matrix, unbounded run/reveal, bounded
  run/reveal, policy selection and justification.
- Final local state reached `MISSION COMPLETE` and `LAB SCORE 100/100`.
- The bounded reveal was visually inspected after the state-precedence fix.

## Bounded reveal evidence

The corrected board showed all of these at the same time:

- `REQ-A` and `REQ-B`: `TIMEOUT / RETRY`;
- `4 fixed slots · caller returned`;
- DB call state: `ERROR AFTER BOUNDED ATTEMPTS`;
- DB: `UNAVAILABLE`;
- result banner: `CONTROL RETURNED WITH ERROR`;
- explanatory text: policy changed caller behaviour, not dependency health.

## Capture note

The CUA browser session returned live screenshot bytes but did not expose a
repository file path for saving PNG evidence. The live accessibility tree,
visual inspection and deterministic completion state are recorded instead; no
PNG is claimed as committed evidence.

## Verification status

Presentation: **PASS**  
Full mission verification: **PENDING**

Open runtime evidence: 390 × 844, keyboard-only, touch, reduced-motion and
screen-reader gates.

