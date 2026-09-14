# Axiom Atlas Realm Architecture Progress

Last updated: 2026-09-14
Current milestone: M04 validation and private Site release — IN PROGRESS
Current blocker: None
Next action: Publish the validated route slice to the existing private Site.

## Mission status

- M00 Repository and product discovery ✅
- M01 Platform entrance and shared navigation ✅
- M02 Math & Logic realm ✅
- M03 Geography realm and Climate landing ✅
- M04 Validation and hosting 🟨

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

The existing Climate Detective evidence remains valid and is not replaced by
this navigation work. Deployment evidence will be added after the private Site
version succeeds.
