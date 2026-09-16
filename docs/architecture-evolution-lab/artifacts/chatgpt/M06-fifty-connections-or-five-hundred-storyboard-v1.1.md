# M06 — Fifty Connections or Five Hundred?

## Architecture Evolution Lab — storyboard capture v1.1

> This is a local, reviewable capture of the v1.1 artifact shown in the
> selected ChatGPT conversation on 2026-09-16. The browser blocked the raw
> attachment download endpoint, so this file is not claimed to be the raw
> downloaded attachment.

## Bounded revision

M06 v1 was held because its internal audit used an empty-alternative regular
expression and therefore did not prove that the acceptance matrix and the
machine-readable registry were equal. v1.1 changes only that audit-integrity
check and the artifact/version metadata. The gameplay contract, provenance,
state machine, deterministic teaching simulation, scoring, accessibility
requirements, M05 continuity, M07+ boundary, and neutral M06-T050 hook are
unchanged from the v1 capture at:

`docs/architecture-evolution-lab/artifacts/chatgpt/M06-fifty-connections-or-five-hundred-storyboard-v1.md`

The artifact remains **DRAFT FOR REVIEW — NOT ACCEPTED** inside the ChatGPT
conversation; acceptance is recorded separately in the independent review.

## Corrected executable audit

The v1.1 artifact includes this anchored parser and equality check:

```python
import re

matrix_ids = re.findall(
    r'^\s{2}(M06-T\d{3})\s{2,}',
    md,
    flags=re.M,
)

registry_section = md.split("test_ids:", 1)[1].split("```", 1)[0]
registry_ids = re.findall(
    r'^\s*-\s*(M06-T\d{3})\s*$',
    registry_section,
    flags=re.M,
)

expected = [f"M06-T{i:03d}" for i in range(1, 51)]

assert len(matrix_ids) == 50
assert len(set(matrix_ids)) == 50
assert matrix_ids == expected
assert len(registry_ids) == 50
assert len(set(registry_ids)) == 50
assert registry_ids == expected
assert matrix_ids == registry_ids == expected
assert matrix_ids[-1] == "M06-T050"
```

## Validation evidence shown by ChatGPT

The corrected code executed against the final v1.1 artifact and reported:

```text
matrix_count=50
matrix_unique=50
registry_count=50
registry_unique=50
matrix_contiguous_M06-T001_to_M06-T050=True
registry_contiguous_M06-T001_to_M06-T050=True
matrix_equals_registry_equals_expected=True
M06-T050_present=True
M06-T050_acceptance="Inspect next-incident hook -> Hook is neutral and does not name/design M07 or reveal its diagnosis."
```

## Contract retained from v1

- Primary source: `ccc115a/se`, `_more/mybook/向淘寶學習網站架構演進/1.2.md`;
  blob `00756d5a3a4054cd9592e19199c10626cdce993a`.
- Source-backed examples remain `jdbc.maxPoolSize=50` and
  `max_connections=500`; neither is presented as a universal recommendation.
- Invented workload, queue, CPU, throughput, latency, error and score values
  remain explicitly `TEACHING_SIMULATION`.
- M05's separated Web/DB topology and bounded network-call policy remain
  inherited, not redesigned.
- The loop remains evidence-first:
  `OBSERVE → INVESTIGATE → DIAGNOSE → PREDICT_BASELINE → RUN_BASELINE →
  REVEAL_BASELINE → PREDICT_CHANGE → CHANGE_ONE_CONFIGURATION →
  RUN_CONTROLLED_EXPERIMENT → REVEAL → EXPLAIN → SCORE → COMPLETE`.
- All seven evidence cards E01–E07 are individually inspected before
  diagnosis; proof must be a subset of inspected evidence.
- Only the application pool candidate changes. Workload, DB ceiling, topology,
  DB model and M05 timeout/retry policy stay fixed.
- Candidates remain `SMALL_POOL=10`, `FIT_POOL=60`, and `LARGE_POOL=300`.
- Results remain hidden until the corresponding prediction is committed.
- The clean path remains 100/100; replay clears diagnosis, predictions,
  results, score and stale state.
- The route must support 390×844, keyboard-only use, touch, reduced motion and
  screen-reader announcements.
- M07+ topics remain out of scope. M06-T050 is a neutral next-incident hook.

## Review status

The artifact itself is not an implementation and does not authorize M06 code.
See `docs/architecture-evolution-lab/reviews/M06-storyboard-review-v1.1.md`
for the independent acceptance decision.
