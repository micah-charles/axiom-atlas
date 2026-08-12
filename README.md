# Axiom Atlas

**Explore. Discover. Think. Master.**

Axiom Atlas is a mathematics and logic adventure game. It turns mathematical rules into tactile puzzles, so players learn by experimenting, making decisions, noticing patterns, and building intuition.

Learning mathematics should feel like a meaningful adventure rather than completing homework. Every puzzle is designed to strengthen reasoning, perseverance, curiosity, and creativity.

## Current experience

The first release contains four playable realms:

- **Core Interaction Lab** — learn the direct-manipulation language used throughout the Atlas.
- **Bubble Village** — practise neighbour comparisons, swaps, stable ordering, and bubble-sort reasoning.
- **Tree Garden** — grow a binary search tree through left/right choices, then perform in-order traversal.
- **Parabola Valley** — move vertices, stretch curves, and connect graph shape to quadratic equations.

Each major realm uses five learning layers:

1. **Discover** — experiment before the rule is explained.
2. **Guided** — receive short prompts that connect actions to concepts.
3. **Practice** — build fluency with varied configurations.
4. **Challenge** — solve under move and mistake constraints.
5. **Master** — no hints and precise decisions; an error restarts the run.

The campaign currently provides 120 deterministic generated levels—40 per major realm—plus endless expeditions. Levels are generated from world rules, learning-layer configuration, and seeds rather than maintained as a large hardcoded puzzle list. The same seed always produces the same level, making puzzles reproducible and testable.

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

## Planned worlds and modes

The current release establishes the campaign foundation for future worlds such as Arithmetic Valley, Geometry Kingdom, Algebra Academy, Probability Port, Logic Forest, Computer Science City, and Infinity Observatory.

Planned platform features include:

- story campaigns and larger handcrafted puzzle packs;
- daily challenges, tournaments, and community events;
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
