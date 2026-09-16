# M02 Implementation Review v1

**Scope:** M02 — Follow One Request  
**Reviewed checkpoint:** `fc561bc` on `feature/architecture-evolution-lab`  
**External artifact SHA-256:** `9949cbe93844c02610c91a4c514723313cb38a495e9fefe4ae87cf2112b0a2e0`  
**Source artifact:** `/Users/charlestan/Downloads/M02-implementation-review-v1.md`

## Decision

**Implementation correctness: REVISION REQUIRED**

**Full verification: CONDITIONAL / OPEN**

**Safe to request M03 storyboard: NO.**

The core M02 loop is genuinely playable and the deterministic timing model is coherent. The review found three bounded issues that must be closed before the next storyboard:

- **M02-F01 — E04 diagnosis gate missing.** The route evidence gate can open with E01 + E02 + E03, and diagnosis can then be committed without inspecting the measured baseline probe E04.
- **M02-F02 — final diagnosis loophole.** A player can submit a wrong final segment with arbitrary evidence, then select the prewritten DNS explanation claim and complete the mission. Final diagnosis, explanation, and score must agree.
- **M02-F03 — route feedback too generic.** HTTP-before-DNS, JDBC-before-Tomcat, and response-before-query need distinct local feedback without revealing the full route.

## Positive checks

- Five-stage route and fixed timing profiles match accepted M02 v1.1.
- Diagnosis is committed before experiment results are revealed.
- Prediction must be correct before a control result runs.
- DNS-only and Tomcat-only controls produce the intended same-total/different-layer comparison.
- M02 is a real interaction loop: evidence → route → baseline → diagnosis → prediction → experiment → comparison → final diagnosis → causal explanation.
- M03 local-assumptions content and later infrastructure recommendations are absent from the player-facing M02 loop.
- Desktop playtest, wrong-path recovery, clean 100/100 run, replay, and keyboard activation smoke were positive.

## Verification still open

- real 390px CSS-pixel completion;
- explicit `prefers-reduced-motion: reduce` completion;
- screen-reader focus and announcement run.

These remain verification debt, not permission to bypass the three state-machine fixes above.

## Required bounded fixes

1. Enforce `baseline complete AND E04 inspected` before diagnosis commit.
2. Require final diagnosis `DNS_RESOLUTION`, at least one experiment, and both baseline-measurement and controlled-comparison evidence before entering explanation.
3. Bind explanation completion and diagnosis scoring to the validated final diagnosis.
4. Return stable misconception-specific route feedback IDs/messages.

## Re-review gate

After fixes, add regressions for all four conditions, rerun lint/tests, complete desktop fresh-player and wrong-final-diagnosis recovery paths, and obtain an implementation `PASS` before requesting M03.
