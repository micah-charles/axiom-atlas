# Axiom Atlas Realm Architecture Plan

## Product direction

Axiom Atlas is an interactive learning universe. The platform entrance owns
subject realms; each realm owns modules or worlds; each module owns missions.
The first architecture slice keeps the existing Math engines and Climate
Detective engine intact while moving navigation ownership to routes.

## Current-state discovery (M00)

- Framework: React 19 + TypeScript on Vinext/Vite with the `app/` router.
- Shared styling: `app/globals.css`, with an established dark atlas visual
  language and responsive/reduced-motion rules.
- Math registry: `app/games/world-registry.ts` owns the 15 world IDs and
  metadata. It must remain the source of truth for the Math realm.
- Math state: `MathLogicGame` owns local screen state and persists progress to
  `axiom-progress-v1`; this key and progress shape are preserved.
- Climate state: `ClimateDetectiveGame` owns the historical data, missions,
  evidence, forecasting and scoring engine. It remains a client game surface.
- Existing coupling: the root route renders `MathLogicGame`; its `Screen`
  union and `WorldMap` also own the Climate Detective launch path.
- Tests: Node core tests plus production HTML render checks; lint and Vinext
  build are the release checks.
- Hosting: existing private Sites project is reused through `.openai/hosting.json`.

## Route architecture

```text
/
├── /math-logic
├── /geography
└── /geography/climate-detective
    └── /investigation
```

Server-rendered route shells provide orientation and navigation. The existing
Math and Climate client engines are mounted only at their owned routes.

## Visual thesis

Keep the premium dark Axiom Atlas foundation, but make the platform entrance
feel like a constellation of learning realms. Math uses indigo, violet and
gold; Geography uses ocean blue, teal and cyan; Climate Detective retains its
weather-scale evidence palette. Typography remains serif for place/world
titles and sans/mono for controls and metadata.

## Mission checklist

### M00 — Repository and product discovery ✅

- [x] Inspect framework, routes, state, registries, tests and hosting.
- [x] Identify Climate Detective coupling points.
- [x] Preserve `axiom-progress-v1` and existing engines.
- [x] Record the route and component ownership decision.

### M01 — Platform entrance and shared navigation ✅

- [x] Build scalable Axiom Atlas entrance at `/`.
- [x] Add shared header and breadcrumbs.
- [x] Add Math & Logic and Geography realm cards.
- [x] Add responsive/mobile layouts and accessible focus states.

### M02 — Math & Logic realm ✅

- [x] Move the existing Math map to `/math-logic`.
- [x] Keep registry-driven 15 worlds and Advanced Worlds.
- [x] Remove Climate Detective from the Math map.
- [x] Verify progress, settings, daily challenge and world navigation.

### M03 — Geography realm and Climate landing ✅

- [x] Build `/geography` with Climate Detective as the only active module.
- [x] Add non-clickable future module placeholders.
- [x] Build `/geography/climate-detective` landing page.
- [x] Add `/geography/climate-detective/investigation` entry route.

### M04 — Validation and hosting ✅

- [x] Run lint, core tests, production build and render tests.
- [x] Browser-check `/`, `/math-logic`, `/geography`, landing and investigation.
- [x] Check desktop and narrow/mobile layouts for clipping, orientation and route ownership.
- [x] Push exact validated source, save and deploy a private Site version.

## Release evidence

- Validated source checkpoint: `d7995b27f3e486597ff8489616ab47233084262a`.
- Private Site version 123 deployed successfully.
- Production route smoke checks passed for the platform entrance, Math realm,
  Geography realm, Climate Detective landing, and investigation route.

## Guardrails

- Do not rewrite Math or Climate game engines.
- Do not delete local progress or change its storage key.
- Do not make future Geography modules clickable.
- Do not introduce dependencies for routing or imagery.
- Do not report the architecture slice complete until route and regression
  checks pass.
