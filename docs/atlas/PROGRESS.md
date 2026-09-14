# Axiom Atlas Realm Architecture Progress

Last updated: 2026-09-14
Current milestone: Architecture slice released — COMPLETE
Current blocker: None
Next action: Continue Climate Detective gameplay QA from the existing
investigation engine, beginning with the fresh-player / M07 gate.

## Mission status

- M00 Repository and product discovery ✅
- M01 Platform entrance and shared navigation ✅
- M02 Math & Logic realm ✅
- M03 Geography realm and Climate landing ✅
- M04 Validation and hosting ✅

## Decisions

- Reuse the existing private Sites project and repository; do not create a
  duplicate Site.
- Use app-router folders for ownership instead of adding a client-side router.
- Keep `MathLogicGame` as the Math client engine, but mount it from
  `/math-logic` and remove its Climate screen.
- Keep `ClimateDetectiveGame` unchanged as a game engine and mount it from a
  dedicated investigation route.
- Use the supplied storyboard as hierarchy and visual direction, not a
  pixel-perfect target.

## Evidence

Evidence:

- `npm run lint` passed on 2026-09-14.
- `npm test` passed: 157 core tests, production Vinext build, and 4 rendered
  route tests.
- Local browser inspection covered `/`, `/math-logic`, `/geography`, the
  Climate Detective landing route, and the investigation route. Desktop and
  narrow/mobile layouts were inspected for orientation, clipping, navigation,
  and preservation of the existing investigation surface.
- Investigation route metadata now identifies the page as
  `Climate Detective · Investigation · Axiom Atlas`.
- Production smoke checks passed for all five route surfaces on the existing
  private Site: https://the-axiom-atlas.ckstks246335.chatgpt.site
- Private Site version 123 deployed successfully from commit
  `d7995b27f3e486597ff8489616ab47233084262a`.

The existing Climate Detective evidence remains valid and is not replaced by
this navigation work.

Known problems:

- The new platform/realm artwork is intentionally CSS-driven and reuses the
  existing atlas asset language; it is not a pixel-perfect copy of the
  storyboard.
- Future Geography modules are present as non-clickable placeholders only.

Next three actions:

1. Run a fresh-player gameplay pass through the first Climate Detective case.
2. Re-audit pressure/wind/seasonal teaching copy against the sourced data.
3. Only then expand the Geography mission catalogue.
