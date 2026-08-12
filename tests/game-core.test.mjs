import test from "node:test";
import assert from "node:assert/strict";
import {
  BUBBLE_LEVELS, QUADRATIC_LEVELS, TREE_LEVELS, beginTreeStep, bubbleDecision,
  commit, createBubbleState, createHistory, createTreeState, formatQuadratic,
  inorderIds, isStableBubbleResult, quadraticMatches, quadraticY, redo,
  treeChoose, treeTraverse, undo,
} from "../app/lib/game-core.ts";
import { LEARNING_LAYERS, generateBubbleLevel, generateEndlessLevel } from "../app/lib/campaign.ts";
import { FAMILY_CAMPAIGN_COUNT, FAMILY_LEVELS, generateFamilyEndless, generateFamilyLevel } from "../app/games/family-generator.ts";
import { FAMILY_WORLD_IDS, WORLD_IDS, WORLD_META } from "../app/games/world-registry.ts";
import { GAME_FRAMEWORKS, validateModeSelection } from "../app/games/mode-frameworks.ts";
import { ADVANCED_ACTS, ADVANCED_CAMPAIGN, ADVANCED_LEVEL_CATALOG, advancedActUnlocked, applyMatrix, closedPath, complexMultiply, curl, determinant, divergence, discreteSpectrum, gaussianHeight, jacobian, lineIntegral, logisticMapStep, logisticTrajectory, lotkaVolterraStep, monteCarloEstimate, multiplyMatrix, polygonArea, polylineLength, secantSlope, selectedPathWeight, shortestPath, springStep, surfaceFlux, surfaceFlux3D, tangentSlope, triangleArea, trapezoidIntegral } from "../app/games/advanced-engines.ts";

test("campaign is generated deterministically across five learning layers", () => {
  assert.equal(LEARNING_LAYERS.length, 5);
  assert.equal(BUBBLE_LEVELS.length, 40);
  assert.equal(TREE_LEVELS.length, 40);
  assert.equal(QUADRATIC_LEVELS.length, 40);
  assert.deepEqual(generateBubbleLevel(LEARNING_LAYERS[3], 4), generateBubbleLevel(LEARNING_LAYERS[3], 4));
  assert.notDeepEqual(generateEndlessLevel("bubble", 1).values, generateEndlessLevel("bubble", 2).values);
});

test("Atlas contains 15 registered playable worlds and 600 structured missions", () => {
  assert.equal(WORLD_IDS.length, 15);
  assert.equal(new Set(WORLD_IDS).size, 15);
  assert.equal(Object.keys(WORLD_META).length, 15);
  assert.equal(FAMILY_WORLD_IDS.length, 12);
  assert.equal(FAMILY_CAMPAIGN_COUNT + BUBBLE_LEVELS.length + TREE_LEVELS.length + QUADRATIC_LEVELS.length, 600);
});

test("GM family worlds each use a distinct interaction framework", () => {
  const frameworks = FAMILY_WORLD_IDS.filter(world => world !== "lab").map(world => GAME_FRAMEWORKS[world]);
  assert.equal(new Set(frameworks.map(framework => framework.board)).size, frameworks.length);
  for (const framework of frameworks) {
    assert.ok(framework.mechanic.length > 0);
    assert.ok(framework.feedback.length > 0);
    assert.ok(framework.success.length > 0);
  }
});

test("mode validators enforce each framework's interaction contract", () => {
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.probability, ["NORTH"], ["NORTH"]), true);
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.probability, ["NORTH", "EAST"], ["NORTH"]), false);
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.optimisation, ["CONSTRAINT", "TRADE-OFF", "BEST PLAN"], ["CONSTRAINT", "TRADE-OFF", "BEST PLAN"]), true);
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.optimisation, ["TRADE-OFF", "CONSTRAINT", "BEST PLAN"], ["CONSTRAINT", "TRADE-OFF", "BEST PLAN"]), false);
});

test("advanced mathematics catalog is data-driven across reusable engines", () => {
  assert.ok(ADVANCED_LEVEL_CATALOG.length >= 17);
  assert.equal(ADVANCED_ACTS.length, 5);
  assert.equal(ADVANCED_CAMPAIGN.length, ADVANCED_LEVEL_CATALOG.length * 5);
  assert.equal(new Set(ADVANCED_CAMPAIGN.map(level => level.id)).size, ADVANCED_CAMPAIGN.length);
  assert.ok(ADVANCED_CAMPAIGN.every(level => level.objective.includes("Act ")));
  const integrationActs = ADVANCED_CAMPAIGN.filter(level => level.concept === "integration");
  assert.equal(advancedActUnlocked(ADVANCED_CAMPAIGN, {}, integrationActs[0]), true);
  assert.equal(advancedActUnlocked(ADVANCED_CAMPAIGN, {}, integrationActs[1]), false);
  assert.equal(advancedActUnlocked(ADVANCED_CAMPAIGN, { [integrationActs[0].id]: { stars: 3 } }, integrationActs[1]), true);
  assert.ok(new Set(ADVANCED_LEVEL_CATALOG.map(level => level.engine)).size >= 7);
  assert.ok(ADVANCED_LEVEL_CATALOG.every(level => level.tools.length > 0 && level.revealNotationAfterCompletion));
});

test("advanced pure engines model accumulation, limits, fields, dynamics, transforms, and signals", () => {
  assert.equal(Math.round(trapezoidIntegral(x => x, 0, 2, 100)), 2);
  assert.equal(secantSlope(x => x * x, 1, 3), 4);
  assert.ok(Math.abs(tangentSlope(x => x * x, 2) - 4) < .01);
  assert.equal(gaussianHeight({ x: 0, y: 0 }), 1);
  const radial = (point) => ({ x: point.x, y: point.y });
  assert.ok(divergence(radial, { x: 1, y: 1 }) > 1.9);
  assert.ok(Math.abs(curl(point => ({ x: -point.y, y: point.x }), { x: 1, y: 1 }) - 2) < .01);
  assert.equal(lineIntegral(() => ({ x: 1, y: 0 }), [{ x: 0, y: 0 }, { x: 3, y: 0 }]), 3);
  assert.equal(polylineLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 8 }]), 9);
  assert.equal(surfaceFlux(() => ({ x: 0, y: 8 }), { x: 0, y: 1 }, 1), 8);
  assert.equal(surfaceFlux3D(() => ({ x: 2, y: 3, z: 8 }), { x: 0, y: 0, z: 1 }, 1), 8);
  assert.equal(surfaceFlux3D(() => ({ x: 2, y: 3, z: 8 }), { x: 1, y: 0, z: 0 }, 2), 4);
  assert.equal(closedPath([{ x: 0, y: 0 }, { x: 1, y: 0 }]).length, 3);
  assert.ok(lotkaVolterraStep({ rabbits: 300, foxes: 20 }, .1).rabbits > 0);
  assert.ok(Math.abs(springStep({ position: 1, velocity: 0 }, .01, 1, 1, .1).position - 1) < .01);
  const rotation = [0, -1, 1, 0]; const stretch = [2, 0, 0, 1];
  assert.deepEqual(multiplyMatrix(rotation, stretch), [0, -1, 2, 0]);
  assert.equal(determinant(stretch), 2);
  assert.deepEqual(applyMatrix(rotation, { x: 1, y: 0 }), { x: 0, y: 1 });
  assert.deepEqual(jacobian(point => ({ x: point.x * 2, y: point.y * 3 }), { x: 1, y: 1 }).map(value => Math.round(value)), [2, 0, 0, 3]);
  assert.deepEqual(complexMultiply({ x: 1, y: 0 }, { x: 0, y: 1 }), { x: 0, y: 1 });
  assert.ok(discreteSpectrum([1, 1, 1, 1])[0] > .9);
  assert.equal(shortestPath(3, [{ from: 0, to: 1, weight: 2 }, { from: 1, to: 2, weight: 3 }, { from: 0, to: 2, weight: 8 }], 0, 2), 5);
  assert.equal(selectedPathWeight(3, [{ from: 0, to: 1, weight: 2 }, { from: 1, to: 2, weight: 3 }, { from: 0, to: 2, weight: 8 }], [0, 1], 0, 2), 5);
  assert.equal(selectedPathWeight(3, [{ from: 0, to: 1, weight: 2 }, { from: 1, to: 2, weight: 3 }, { from: 0, to: 2, weight: 8 }], [0], 0, 2), Infinity);
  assert.equal(monteCarloEstimate(10, () => true), 1);
  assert.equal(triangleArea({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 0, y: 3 }), 6);
  assert.equal(triangleArea({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 3 }), 6);
  assert.equal(polygonArea([{ x: -2, y: -1 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: -2, y: 1 }]), 8);
  assert.ok(logisticMapStep(.5, 2) > 0);
  assert.equal(logisticTrajectory(.5, 2, 4).length, 4);
});

for (const world of FAMILY_WORLD_IDS) {
  test(`${WORLD_META[world].name} has 40 deterministic, buildable missions`, () => {
    const levels = FAMILY_LEVELS[world];
    assert.equal(levels.length, 40);
    assert.deepEqual(new Set(levels.map(level => level.layer)), new Set(LEARNING_LAYERS.map(layer => layer.id)));
    assert.equal(new Set(levels.map(level => level.id)).size, 40);
    for (const level of levels) {
      assert.ok(level.solution.length > 0, `${level.id} needs a solution`);
      assert.ok(level.solution.every(token => level.tokens.includes(token)), `${level.id} must expose every solution token`);
      assert.deepEqual(level, generateFamilyLevel(world, LEARNING_LAYERS[level.layerIndex], level.sequence));
    }
    assert.notEqual(generateFamilyEndless(world, 1).seed, generateFamilyEndless(world, 2).seed);
  });
}

test("command history is deterministic and reversible", () => {
  const start = createHistory({ value: 1 });
  const changed = commit(start, "CHANGE", { value: 2 });
  assert.equal(changed.present.value, 2);
  assert.equal(undo(changed).present.value, 1);
  assert.equal(redo(undo(changed)).present.value, 2);
});

for (const level of BUBBLE_LEVELS) {
  test(`Bubble engine completes ${level.id} with a sorted stable multiset`, () => {
    let state = createBubbleState(level.values);
    let guard = 0;
    while (!state.complete && guard++ < 200) {
      const left = state.items[state.cursor];
      const right = state.items[state.cursor + 1];
      state = bubbleDecision(state, left.value > right.value ? "swap" : "keep");
    }
    assert.ok(state.complete);
    assert.deepEqual(state.items.map(x => x.value), [...level.values].sort((a, b) => a - b));
    assert.ok(isStableBubbleResult(state.items));
    assert.equal(state.mistakes, 0);
  });
}

test("Bubble rejects a wrong decision without advancing scanner", () => {
  const state = createBubbleState([7, 3, 5]);
  const rejected = bubbleDecision(state, "keep");
  assert.equal(rejected.cursor, state.cursor);
  assert.equal(rejected.comparisons, 0);
  assert.equal(rejected.mistakes, 1);
});

function growTree(values) {
  let state = beginTreeStep(createTreeState(values));
  let guard = 0;
  while (state.phase === "insert" && guard++ < 200) {
    const node = state.nodes[state.currentNodeId];
    state = treeChoose(state, state.activeValue < node.value ? "left" : "right");
  }
  return state;
}

for (const level of TREE_LEVELS) {
  test(`BST engine grows and traverses ${level.id}`, () => {
    let state = growTree(level.values);
    assert.equal(state.phase, "traverse");
    const ids = inorderIds(state);
    assert.deepEqual(ids.map(id => state.nodes[id].value), [...level.values].sort((a, b) => a - b));
    for (const id of ids) state = treeTraverse(state, id);
    assert.equal(state.phase, "complete");
    assert.equal(state.mistakes, 0);
  });
}

test("BST duplicate policy routes equal values right", () => {
  const state = growTree([3, 3]);
  const root = state.nodes[state.rootId];
  assert.ok(root.right);
  assert.equal(root.left, null);
});

test("Quadratic state is the single source of graph and equation truth", () => {
  const state = { a: -2, h: 3, k: 4 };
  assert.equal(formatQuadratic(state), "y = −2(x − 3)² + 4");
  assert.equal(quadraticY(state, 3), 4);
  assert.equal(quadraticY(state, 4), 2);
  assert.ok(quadraticMatches(state, { ...state }));
  assert.ok(!quadraticMatches(state, { ...state, h: 2 }));
});

for (const level of QUADRATIC_LEVELS) {
  test(`Quadratic target ${level.id} is exactly matchable`, () => {
    assert.ok(quadraticMatches(level.target, level.target));
    assert.ok(Number.isFinite(quadraticY(level.target, -8)));
    assert.ok(Number.isFinite(quadraticY(level.target, 8)));
  });
}
