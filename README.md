# Axiom Atlas

**Explore. Discover. Think. Master.**

Axiom Atlas is a mathematics and logic adventure game. It turns mathematical rules into tactile puzzles, so players learn by experimenting, making decisions, noticing patterns, and building intuition.

Learning mathematics should feel like a meaningful adventure rather than completing homework. Every puzzle is designed to strengthen reasoning, perseverance, curiosity, and creativity.

## Current experience

The Atlas contains 15 playable worlds:

- **Core Interaction Lab** — learn the direct-manipulation language used throughout the Atlas.
- **Bubble Village** — practise neighbour comparisons, swaps, stable ordering, and bubble-sort reasoning.
- **Tree Garden** — grow a binary search tree through left/right choices, then perform in-order traversal.
- **Parabola Valley** — move vertices, stretch curves, and connect graph shape to quadratic equations.
- **Arithmetic Forge** — construct operation chains that transform ingots into exact targets.
- **Fraction Harbor** — load ships using equivalent fractions and exact proportions.
- **Equation Citadel** — apply inverse operations while keeping both sides balanced.
- **Geometry Kingdom** — rotate and place beams to satisfy geometric constraints.
- **Probability Port** — compare chance, reward, and expected value across risky routes.
- **Logic Forest** — test guardian statements and deduce the only consistent path.
- **Pattern Observatory** — construct patterns, symmetry, and recurrences among the stars.
- **Coordinate Expedition** — navigate a living grid with vectors, portals, and movement.
- **Graph Laboratory** — make data visible by plotting, connecting, and interpolating.
- **Function Factory** — compose and invert transformation machines.
- **Optimisation Valley** — balance workers, budgets, logistics, and competing constraints.

Every world uses five learning layers:

1. **Discover** — experiment before the rule is explained.
2. **Guided** — receive short prompts that connect actions to concepts.
3. **Practice** — build fluency with varied configurations.
4. **Challenge** — solve under move and mistake constraints.
5. **Master** — no hints and precise decisions; an error restarts the run.

The campaign provides 600 deterministic generated missions—40 per world—plus endless expeditions. Levels are generated from puzzle-family rules, learning-layer configuration, and seeds rather than maintained as a large hardcoded puzzle list. The same seed always produces the same mission, making every puzzle reproducible and testable.

The GM05–GM15 worlds are not reskins of one question panel. Each has a distinct interaction framework and control surface: arithmetic operator pad, equation inverse rail, geometry angle dial, logic consistency gates, fraction cargo cards, probability route cards, pattern star tiles, coordinate direction pad, graph station links, function machine rack, or optimisation plan cards. Shared campaign services handle progression and persistence, while each framework owns its board language, control prompt, feedback model, success condition, and post-completion rule reveal.

## Design principles

- Mathematical rules become game mechanics.
- Exploration and observation come before formal explanation.
- Mistakes are visible, meaningful, and useful for learning.
- Hints guide reasoning instead of revealing answers.
- Progression rewards knowledge, precision, and discovery.
- Mouse, keyboard, touch, pen, and responsive layouts are first-class inputs.

## Learning scope

The long-term Atlas can grow across:

- number sense, arithmetic, fractions, decimals, percentages, ratios, algebra, geometry, graphs, probability, statistics, trigonometry, calculus, number theory, and proof;
- deduction, induction, pattern recognition, Boolean logic, graph theory, constraints, optimisation, and critical thinking;
- algorithms, binary numbers, recursion, data structures, graph search, and computational thinking;
- rotation, symmetry, navigation, perspective, construction, and tessellation;
- observation, hypothesis, experiment, evidence, analysis, and prediction.

## Advanced simulation worlds

The Atlas now contains a live, pure, data-driven implementation of the advanced-games proposal in `docs/new-games.md`. `app/games/advanced-engines.ts` provides ten reusable engines—curve, field, flow, dynamic systems, transformation, plane, signal, graph, probability, and geometry—rather than one bespoke component per concept.

The catalog currently covers 22 mathematical concepts, including Water Valley integration, Mountain Racer derivatives, gradient expeditions, partial derivatives, vector fields, line and surface integrals, Stokes’ theorem, ecosystems, springs, chaotic dynamics, Fourier filtering, matrix transformations, eigenvectors, determinants, Jacobians, complex portals, Euler’s formula, graph paths, probability simulation, and geometry construction. Each definition expands into five data-driven acts:

1. **Experience** — observe the phenomenon before terminology.
2. **Control** — change an input and see the system respond.
3. **Measure** — use instruments and compare quantities.
4. **Generalise** — apply the same idea in a new situation.
5. **Name** — reveal the formal notation after discovery.

That produces 110 advanced campaign records. Acts are generated from the catalog, passed into the selected world, persisted as mastery records, and unlocked sequentially per concept. **New expedition** generates a deterministic seeded variant and routes it through the correct dedicated simulation. **Daily challenge** derives a shared UTC-day seed, so the same day produces the same mission for every player. The existing GM01–GM15 campaign remains separate, with its own 600 deterministic missions and five learning layers.

## Planned modes

Planned platform features include:

- story campaigns and larger handcrafted puzzle packs;
- tournaments and community events (daily challenges are live in Advanced Worlds);
- sandbox puzzle creation, sharing, remixing, and rating;
- classroom assignments, teacher review, and progress reports;
- parent dashboards and personalised practice;
- an adaptive tutor that asks guiding questions instead of revealing answers;
- accessibility options including colour-blind modes, dyslexia-friendly presentation, narration, controller, keyboard, mouse, touch, tablet, and mobile support.

## Technology

- React 19 and TypeScript
- Vinext/Vite build pipeline
- Deterministic, pure game engines in `app/lib/game-core.ts`
- Seeded campaign generators in `app/lib/campaign.ts`
- Responsive CSS with reduced-motion support
- Cloudflare-compatible Sites deployment
- Optional Drizzle/D1 project structure for future persistence

## Run locally

Requirements: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run lint
npm test
npm run build
```

Open the local address printed by the development server. Progress and settings are currently stored privately in the browser.

## Project structure

```text
app/
  MathLogicGame.tsx       # world map, campaign UI, and play surfaces
  globals.css              # visual system and responsive layouts
  lib/game-core.ts         # pure puzzle state machines
  lib/campaign.ts          # learning layers and seeded level generation
  games/world-registry.ts  # 15-world metadata and identifiers
  games/mode-frameworks.ts # distinct GM05–GM15 interaction contracts
  games/mode-engines.ts    # pure arithmetic, vector, route, angle, and function calculations
  games/advanced-engines.ts # ten reusable engines, 22 concepts, seed profiles, and generated five-act data
  games/family-generator.ts # 11 seeded puzzle-family generators
tests/
  game-core.test.mjs       # mechanics and generator coverage
  rendered-html.test.mjs   # production render checks
public/
  manifest.webmanifest     # installable web-app metadata
```

## Why it matters

Many learners lose confidence when mathematics is presented as disconnected exercises. Axiom Atlas makes mathematical reasoning something players can explore, manipulate, and remember. The goal is not only higher scores, but a generation of curious thinkers who see mathematics as a powerful language for understanding and shaping the world.

## Roadmap

1. Expand the current worlds with richer events, characters, and challenge modifiers.
2. Add more generated families and larger handcrafted story arcs.
3. Introduce daily challenges, teacher tools, and learner analytics.
4. Add community-created puzzles, multiplayer modes, and adaptive worlds.

## License

MIT License.

> Every puzzle solved reveals a new way to think.
