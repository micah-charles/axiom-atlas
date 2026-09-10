# Climate Detective

This folder contains the first playable Climate Detective vertical slice for Axiom Atlas.

- Scenario: UK / North Atlantic, historical year 2018.
- Runtime: `ClimateDetectiveGame.tsx`.
- Pure data and game rules: `engine.ts`.
- Static inputs: `data/year-2018.json` and `data/natural-earth-uk-europe.json`.
- Rebuild inputs: `scripts/climate-detective/ingest-nasa-power.mjs` and `scripts/climate-detective/prepare-natural-earth.mjs`.

The generated dataset is intentionally committed with source metadata so the hosted game does not depend on a live data request. Refreshing data is an explicit build-time operation; review the candidate-year report before changing `historicalYear`.

The module is launched from the Atlas map as a separate surface. It does not add a world to the existing 15-world registry, preserving the Atlas campaign contract.
