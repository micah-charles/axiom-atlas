import test from "node:test";
import assert from "node:assert/strict";
import {
  BUBBLE_LEVELS, QUADRATIC_LEVELS, TREE_LEVELS, beginTreeStep, bubbleDecision,
  commit, createBubbleState, createHistory, createTreeState, formatQuadratic,
  inorderIds, isStableBubbleResult, quadraticMatches, quadraticY, redo,
  treeChoose, treeTraverse, undo,
} from "../app/lib/game-core.ts";
import { LEARNING_LAYERS, generateBubbleLevel, generateEndlessLevel } from "../app/lib/campaign.ts";
import { FAMILY_CAMPAIGN_COUNT, FAMILY_LEVELS, WORLD_NOTATION, generateFamilyEndless, generateFamilyLevel } from "../app/games/family-generator.ts";
import { FAMILY_WORLD_IDS, WORLD_IDS, WORLD_META } from "../app/games/world-registry.ts";
import { GAME_FRAMEWORKS, modeSelectionMessage, modeSelectionState, validateModeSelection } from "../app/games/mode-frameworks.ts";
import { angleFromToken, arithmeticChain, expectedValueFromFact, functionTrace, vectorWalk } from "../app/games/mode-engines.ts";
import { ADVANCED_ACTS, ADVANCED_CAMPAIGN, ADVANCED_LEVEL_CATALOG, advancedActRule, advancedActUnlocked, advancedNotation, advancedSeedProfile, applyMatrix, closedPath, complexMultiply, curl, dailyAdvancedExpedition, determinant, divergence, discreteSpectrum, generateAdvancedExpedition, gaussianHeight, jacobian, lineIntegral, logisticMapStep, logisticTrajectory, lotkaVolterraStep, monteCarloEstimate, multiplyMatrix, polygonArea, polylineLength, seededChaosProfile, seededChaosTrajectory, seededCurveProfile, seededDynamicProfile, seededFieldProfile, seededFlowProfile, seededFlowReading, seededGraphEdges, seededGradientProfile, seededPopulationStep, seededProbabilityProfile, seededSignalProfile, seededSpringStep, seededTransformOutput, secantSlope, selectedPathWeight, shortestPath, springStep, surfaceFlux, surfaceFlux3D, tangentSlope, triangleArea, trapezoidIntegral } from "../app/games/advanced-engines.ts";

test("campaign is generated deterministically across five learning layers", () => {
  assert.equal(LEARNING_LAYERS.length, 5);
  assert.equal(BUBBLE_LEVELS.length, 40);
  assert.equal(TREE_LEVELS.length, 40);
  assert.equal(QUADRATIC_LEVELS.length, 40);
  assert.deepEqual(generateBubbleLevel(LEARNING_LAYERS[3], 4), generateBubbleLevel(LEARNING_LAYERS[3], 4));
  assert.notDeepEqual(generateEndlessLevel("bubble", 1).values, generateEndlessLevel("bubble", 2).values);
});

test("default progress includes a separate daily challenge record", async () => {
  const { DEFAULT_PROGRESS } = await import("../app/lib/game-core.ts");
  assert.equal(DEFAULT_PROGRESS.dailyChallenge, null);
  assert.equal(DEFAULT_PROGRESS.dailyStreak, 0);
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
  assert.equal(new Set(frameworks.map(framework => framework.control)).size, frameworks.length);
  for (const framework of frameworks) {
    assert.ok(framework.mechanic.length > 0);
    assert.ok(framework.feedback.length > 0);
    assert.ok(framework.success.length > 0);
    assert.ok(framework.controlPrompt.length > 0);
  }
});

test("mode validators enforce each framework's interaction contract", () => {
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.probability, ["NORTH"], ["NORTH"]), true);
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.probability, ["NORTH", "EAST"], ["NORTH"]), false);
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.optimisation, ["CONSTRAINT", "TRADE-OFF", "BEST PLAN"], ["CONSTRAINT", "TRADE-OFF", "BEST PLAN"]), true);
  assert.equal(validateModeSelection(GAME_FRAMEWORKS.optimisation, ["TRADE-OFF", "CONSTRAINT", "BEST PLAN"], ["CONSTRAINT", "TRADE-OFF", "BEST PLAN"]), false);
});

test("mode selections provide progressive, world-specific feedback", () => {
  assert.equal(modeSelectionState([], ["A"]), "empty");
  assert.equal(modeSelectionState(["A"], ["A", "B"]), "progress");
  assert.equal(modeSelectionState(["A", "B"], ["A", "B"]), "complete");
  assert.equal(modeSelectionState(["B"], ["A", "B"]), "wrong");
  assert.match(modeSelectionMessage(GAME_FRAMEWORKS.arithmetic, "wrong"), /operator/i);
  assert.match(modeSelectionMessage(GAME_FRAMEWORKS.coordinates, "wrong"), /vector/i);
});

test("GM world calculations live in pure reusable mode engines", () => {
  assert.equal(arithmeticChain(3, ["×2", "+4"]), 10);
  assert.deepEqual(vectorWalk(["EAST", "NORTH", "VECTOR (2,-1)"]), { x: 3, y: 0 });
  assert.equal(angleFromToken("ROTATE 90°"), 90);
  assert.equal(expectedValueFromFact("EAST: 50% × 70"), 35);
  assert.equal(functionTrace(["×2", "+3"]), "×2 → +3");
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
  assert.deepEqual(advancedActRule("experience"), { verb: "Observe", minimumObservations: 1, revealNotation: false });
  assert.deepEqual(advancedActRule("name"), { verb: "Name", minimumObservations: 3, revealNotation: true });
  assert.equal(advancedNotation("integration"), "∫ₐᵇ f(t) dt");
  assert.equal(advancedNotation("complex numbers"), "z = a + bi");
  assert.deepEqual(generateAdvancedExpedition(12, "integration", "measure"), generateAdvancedExpedition(12, "integration", "measure"));
  assert.notEqual(generateAdvancedExpedition(12, "integration", "measure").id, generateAdvancedExpedition(13, "integration", "measure").id);
  assert.equal(generateAdvancedExpedition(12, "integration", "measure").act, "measure");
  const daily = dailyAdvancedExpedition(new Date("2026-08-13T12:00:00Z"));
  assert.deepEqual(daily, dailyAdvancedExpedition(new Date("2026-08-13T23:59:59Z")));
  assert.notEqual(daily.id, dailyAdvancedExpedition(new Date("2026-08-14T00:00:00Z")).id);
  assert.equal(daily.dailyKey, "2026-08-13");
  assert.deepEqual(advancedSeedProfile(12), advancedSeedProfile(12));
  assert.notEqual(advancedSeedProfile(12).probability, advancedSeedProfile(13).probability);
  assert.ok(advancedSeedProfile(12).amplitude > 0 && advancedSeedProfile(12).scale >= 1);
  assert.ok(ADVANCED_CAMPAIGN.every(level => ADVANCED_ACTS.some(act => act.id === level.act)));
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
  assert.equal(seededFlowReading("line integral", 2, [{ x: 0, y: 0 }, { x: 2, y: 0 }]), 100);
  assert.equal(seededFlowReading("Stokes theorem", 1, [{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }]), 8);
  assert.ok(seededFlowReading("surface integral", 2, [], 0, 1) > 0);
  assert.ok(seededPopulationStep({ rabbits: 300, foxes: 20 }, 1, 42).rabbits > 0);
  assert.ok(Number.isFinite(seededSpringStep({ position: 1, velocity: 0 }, .4, 42).position));
  assert.equal(seededChaosTrajectory(42, 3.7).length, 30);
  const transformed = seededTransformOutput("complex numbers", 90, 2);
  assert.ok(Math.abs(transformed.output.x) < .001 && Math.abs(transformed.output.y - 2) < .001);
  assert.equal(seededTransformOutput("determinant", 0, 1.5).target, 1.5);
  const signal = seededSignalProfile(42, 82, 100);
  assert.equal(signal.samples.length, 16);
  assert.equal(signal.residualNoise, 0);
  assert.equal(signal.purity, 100 - Math.abs(82 - signal.birdTarget) * .08);
  const probability = seededProbabilityProfile(42, 20);
  assert.equal(probability.outcomes.length, 20);
  assert.ok(probability.target >= .45 && probability.target <= .85);
  assert.equal(probability.estimate, probability.outcomes.filter(Boolean).length / 20);
  const graph = seededGraphEdges(42);
  assert.equal(graph.length, 5);
  assert.ok(graph.every(edge => edge.weight > 0));
  assert.equal(shortestPath(4, graph, 0, 3), shortestPath(4, seededGraphEdges(42), 0, 3));
  assert.deepEqual(seededFieldProfile(42), seededFieldProfile(42));
  assert.ok(seededFieldProfile(42).strength >= 1);
  assert.deepEqual(seededGradientProfile(42), seededGradientProfile(42));
  assert.ok(seededGradientProfile(42).spread >= 3);
  assert.deepEqual(seededCurveProfile(42), seededCurveProfile(42));
  assert.ok(seededCurveProfile(42).amplitude >= 14);
  assert.deepEqual(seededChaosProfile(42), seededChaosProfile(42));
  assert.equal(seededChaosTrajectory(42, seededChaosProfile(42).defaultGrowth)[0], seededChaosProfile(42).initial);
  const dynamics = seededDynamicProfile(42);
  assert.deepEqual(dynamics, seededDynamicProfile(42));
  assert.ok(dynamics.population.rabbits > dynamics.population.foxes && dynamics.mass > 0 && dynamics.stiffness > 0);
  assert.deepEqual(seededFlowProfile(42), seededFlowProfile(42));
  assert.ok(seededFlowProfile(42).strength >= 1 && seededFlowProfile(42).surfaceHeight >= 6);
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
      assert.equal(level.notation, WORLD_NOTATION[world]);
      assert.ok(level.notation.length > 0, `${level.id} needs a rule reveal`);
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
