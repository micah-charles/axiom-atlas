# M01 Fresh-player QA — implementation checkpoint

Date: 2026-09-16

Route: `http://localhost:3001/computer-science/architecture-lab`

Status: **PASS for desktop interaction flow; NEEDS mobile visual QA**

## Manual flow

- [x] Fresh load shows `Open the shop`, a visible objective, source/simulation boundary, and no architecture verdict.
- [x] Initial system panel is a genuinely empty architecture canvas.
- [x] Inspecting only E01 + E03 does not unlock approaches.
- [x] Inspecting E01 + E02 + E03 unlocks approaches.
- [x] Choice B is labelled preview-only, has no request button, and emits no latency.
- [x] Choice C is labelled preview-only, has no request button, and emits no latency.
- [x] Choice A exposes the complete topology and starts the request trace.
- [x] Request trace advances through DNS, HTTP/Tomcat, local MySQL/JDBC, local images, and response.
- [x] Host failure reveals the shared failure domain and makes the services unavailable.
- [x] Causal explanation requires fit evidence and the observed failure-domain consequence.
- [x] Strong explanation completes with `100/100` lab points.
- [x] Replay/recovery controls remain available at completion.

## Automated evidence

- `npm run lint` — PASS
- `npm run test:core` — PASS, 160 tests
- `npm run build` — PASS; route emitted at `/computer-science/architecture-lab`
- `npm test` — PASS, including rendered route shell checks

## Visual evidence

- Desktop initial-state screenshot was visually inspected in the Chrome CUA
  session: two-column brief/evidence/system layout, readable empty canvas, no
  premature target topology.
- The headless `browse` helper was installed but could not start its daemon
  because no port was available in its five-attempt range. The CUA screenshot
  path does not persist the PNG into the repository in this environment.
- Mobile-specific CSS is present for the 760px and 430px breakpoints, but a
  real 390px viewport capture remains outstanding and blocks `✅ VERIFIED`.

## Reassessment

The flow is a playable investigation rather than a static architecture poster:
evidence gates the choices, choices change the available simulation, the
request trace creates a visible result, and the failure drill is required before
the explanation can complete. Do not request M02 until mobile QA is captured
and the fresh-player interaction is rechecked after any visual changes.
