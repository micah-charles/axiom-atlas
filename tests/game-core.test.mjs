import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
import { ADVANCED_ACTS, ADVANCED_CAMPAIGN, ADVANCED_ENGINE_MANIFEST, ADVANCED_GOAL_TYPES, ADVANCED_INSTRUMENTS, ADVANCED_LEVEL_CATALOG, accumulateFlow, advancedActRule, advancedActUnlocked, advancedGoalSatisfied, advancedNotation, advancedSeedProfile, applyMatrix, closedPath, complexMultiply, constraintProgress, curl, dailyAdvancedExpedition, determinant, divergence, discreteSpectrum, evaluateConstraint, generateAdvancedExpedition, gaussianHeight, jacobian, lineIntegral, logisticMapStep, logisticTrajectory, lotkaVolterraStep, measurementInstrument, monteCarloEstimate, multiplyMatrix, polygonArea, polylineLength, seededChaosProfile, seededChaosTrajectory, seededCurveProfile, seededDynamicProfile, seededFieldProfile, seededFlowProfile, seededFlowReading, seededGraphEdges, seededGeometryTarget, seededGradientProfile, seededPopulationStep, seededProbabilityProfile, seededSignalDefaults, seededSignalProfile, seededSpringStep, seededTransformOutput, seededTransformProfile, seededVectorField, secantSlope, selectedPathWeight, shortestPath, springStep, surfaceFlux, surfaceFlux3D, tangentSlope, triangleArea, trapezoidIntegral, validateAdvancedLevelDefinition } from "../app/games/advanced-engines.ts";
import { addResource, advectParticles, createReservoir, entityById, moveEntity, reservoirFilled, stepScene } from "../app/games/simulation-systems.ts";
import { buildActualRevealBlocks, buildValleyRectangles, buildValleyTimeBlocks, estimateTargetCrossing, estimateValleyVolume, findActualTargetCrossing, resolveValleyOutcome, valleyActualVolume, valleyFlowRate, valleyRiverModel } from "../app/games/water-valley-engine.ts";
import { CLIMATE_DATA, CLIMATE_MISSIONS, CLIMATE_YEAR, causalOrderFeedback, causalPrefixLength, conceptsFromText, dayLengthHours, derivePressureCentres, evidenceValue, explanationLockReasons, locationById, pressureContourLabels, pressureContourLevels, pressureContourSegments, pressureHpa, scoreMission, seasonFor, shuffleCausalIds, solarAngle, windDirectionLabel } from "../app/games/climate-detective/engine.ts";
import { CORIOLIS_EXAMPLES, GLOBAL_CELLS, GLOBAL_LATITUDE_BANDS, GLOBAL_PRESSURE_BELTS, GLOBAL_SEASON_CONTEXT, GLOBAL_WIND_BELTS, atmosphericCellForLatitude, coriolisDeflection, coriolisMotionLatitudes, equalEarthPoint, isBritainMidLatitude, seasonalLatitude, windBeltForLatitude } from "../app/games/climate-detective/global-circulation.ts";
import { M01_EVIDENCE, M01_TRACE, approachResult, canUnlockApproaches, scoreExplanation } from "../app/games/architecture-lab/engine.ts";
import { M02_EVIDENCE, M02_EXPERIMENTS, M02_EXPLANATION_OPTIONS, M02_STAGE_ORDER, M02_TIMINGS, canCommitM02Diagnosis, canSubmitM02FinalDiagnosis, canUnlockM02Evidence, explanationIsComplete, explanationMatchesM02Diagnosis, experimentResult, m02RouteFeedback, predictionIsCorrect, scoreM02, timingTotal, validateM02Route } from "../app/games/architecture-lab/m02-engine.ts";
import { M03_EVIDENCE, M03_EXPLANATION_CONCEPTS, M03_EXPLANATION_LINKS, M03_INITIAL_MAP, M03_PREDICTIONS, M03_RESULTS, canCommitM03Map, canCommitM03Predictions, canCompleteM03, canMutateM03Classification, canUnlockM03Evidence, correctM03Map, correctM03ResultMatches, explanationLinksCorrect, explanationOrderCorrect, scoreM03, predictionIsCorrectM03 } from "../app/games/architecture-lab/m03-engine.ts";
import { M04_CAUSAL_CLAIMS, M04_EVIDENCE, M04_INITIAL_RESOURCE_MAP, M04_PREDICTIONS, M04_RESULT_CHECKS, canCommitM04Predictions, canCommitM04ResourceMap, canUnlockM04Evidence, causalLinksCorrectM04, causalOrderCorrectM04, correctM04ResourceMap, diagnosisProofIsEnough, interventionJustificationCorrectM04, resultChecksCorrectM04, scoreM04 } from "../app/games/architecture-lab/m04-engine.ts";
import { M05_INITIAL_DEPENDENCY_MAP, M05_PREDICTIONS, M05_REQUIRED_CAUSAL_ORDER, canUnlockM05Evidence, causalLinksCorrectM05, causalOrderCorrectM05, correctM05DependencyMap, diagnosisProofIsEnoughM05, m05ProofEvidenceEnough, policyJustificationCorrectM05, predictionsCorrectM05, resultChecksCorrectM05, scoreM05 } from "../app/games/architecture-lab/m05-engine.ts";

test("campaign is generated deterministically across five learning layers", () => {
  assert.equal(LEARNING_LAYERS.length, 5);
  assert.equal(BUBBLE_LEVELS.length, 40);
  assert.equal(TREE_LEVELS.length, 40);
  assert.equal(QUADRATIC_LEVELS.length, 40);
  assert.deepEqual(generateBubbleLevel(LEARNING_LAYERS[3], 4), generateBubbleLevel(LEARNING_LAYERS[3], 4));
  assert.notDeepEqual(generateEndlessLevel("bubble", 1).values, generateEndlessLevel("bubble", 2).values);
});

test("advanced level JSON schema is shipped beside the data engine", () => {
  const schema = JSON.parse(readFileSync(new URL("../app/games/advanced-level.schema.json", import.meta.url), "utf8"));
  assert.equal(schema.title, "Axiom Atlas Advanced Level");
  assert.ok(schema.required.includes("engine") && schema.required.includes("goal"));
  assert.deepEqual(schema.properties.goal.properties.type.enum, ADVANCED_GOAL_TYPES);
  const levels = JSON.parse(readFileSync(new URL("../app/games/advanced-levels.json", import.meta.url), "utf8"));
  assert.equal(levels.length, ADVANCED_LEVEL_CATALOG.length);
  assert.equal(levels[0].id, "water-valley-01");
  assert.equal(levels.at(-1).id, "geometry-workshop-01");
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
  assert.ok(ADVANCED_LEVEL_CATALOG.every(level => level.tools.every(tool => measurementInstrument(tool)?.engine === level.engine)));
  assert.equal(measurementInstrument("timeController")?.label, "Time Controller");
  assert.ok(Object.keys(ADVANCED_INSTRUMENTS).length >= 30);
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
  assert.ok(advancedSeedProfile(12).surfaceHeight >= 6 && advancedSeedProfile(12).chaosInitial > 0 && advancedSeedProfile(12).chaosGrowth > 3);
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
  assert.equal(probability.target, advancedSeedProfile(42).probability);
  assert.ok(probability.target >= .45 && probability.target <= .85);
  assert.equal(probability.estimate, probability.outcomes.filter(Boolean).length / 20);
  const graph = seededGraphEdges(42);
  assert.equal(graph.length, 5);
  assert.ok(graph.every(edge => edge.weight > 0));
  assert.equal(graph[0].weight, 1 + advancedSeedProfile(42).edgeBias % 4);
  assert.equal(shortestPath(4, graph, 0, 3), shortestPath(4, seededGraphEdges(42), 0, 3));
  assert.deepEqual(seededFieldProfile(42), seededFieldProfile(42));
  assert.ok(seededFieldProfile(42).strength >= 1);
  assert.equal(seededVectorField(42, "curl")({ x: 0, y: 0 }).x, seededVectorField(42, "curl")({ x: 0, y: 0 }).x);
  assert.notDeepEqual(seededVectorField(42, "curl")({ x: 1, y: 1 }), seededVectorField(42, "divergence")({ x: 1, y: 1 }));
  assert.deepEqual(seededGradientProfile(42), seededGradientProfile(42));
  assert.ok(seededGradientProfile(42).spread >= 3 && seededGradientProfile(42).heading >= 0);
  assert.deepEqual(seededCurveProfile(42), seededCurveProfile(42));
  assert.ok(seededCurveProfile(42).amplitude >= 14);
  assert.deepEqual(seededChaosProfile(42), seededChaosProfile(42));
  assert.equal(seededChaosTrajectory(42, seededChaosProfile(42).defaultGrowth)[0], seededChaosProfile(42).initial);
  assert.equal(accumulateFlow(() => 2, 0, 3, 3, 5), 11);
  const dynamics = seededDynamicProfile(42);
  assert.deepEqual(dynamics, seededDynamicProfile(42));
  assert.ok(dynamics.population.rabbits > dynamics.population.foxes && dynamics.mass > 0 && dynamics.stiffness > 0);
  assert.deepEqual(seededFlowProfile(42), seededFlowProfile(42));
  assert.ok(seededFlowProfile(42).strength >= 1 && seededFlowProfile(42).surfaceHeight >= 6);
  assert.deepEqual(seededTransformProfile(42), seededTransformProfile(42));
  assert.ok(seededTransformProfile(42).angle >= 0 && seededTransformProfile(42).scale >= 1);
  assert.equal(seededGeometryTarget(42), seededGeometryTarget(42));
  assert.ok(seededGeometryTarget(42) >= 6);
  assert.deepEqual(seededSignalDefaults(42), seededSignalDefaults(42));
  assert.ok(seededSignalDefaults(42).birdTarget >= 50 && seededSignalDefaults(42).machine >= 20);
  assert.equal(advancedGoalSatisfied({ type: "accumulate", target: 10 }, 10), true);
  assert.equal(advancedGoalSatisfied({ type: "pathEnergy", target: 10 }, 9), false);
  assert.equal(advancedGoalSatisfied({ type: "matchArea", target: 6 }, 6.05), true);
  assert.equal(advancedGoalSatisfied({ type: "shortestPath", target: 7 }, 6), true);
  assert.equal(advancedGoalSatisfied({ type: "shortestPath", target: 7 }, 8), false);
  assert.equal(evaluateConstraint(12, { comparator: "atLeast", target: 10 }), true);
  assert.equal(evaluateConstraint(12, { comparator: "atMost", target: 10 }), false);
  assert.equal(evaluateConstraint(10.04, { comparator: "within", target: 10, tolerance: .05 }), true);
  assert.ok(constraintProgress(5, { comparator: "atLeast", target: 10 }) < 1);
  assert.ok(ADVANCED_LEVEL_CATALOG.every(validateAdvancedLevelDefinition));
  assert.ok(ADVANCED_CAMPAIGN.every(validateAdvancedLevelDefinition));
  assert.equal(ADVANCED_ENGINE_MANIFEST.length, 10);
  assert.ok(ADVANCED_LEVEL_CATALOG.every(level => ADVANCED_ENGINE_MANIFEST.some(engine => engine.id === level.engine && engine.concepts.includes(level.concept))));
  assert.equal(validateAdvancedLevelDefinition({ id: "bad", world: "", concept: "", engine: "curve", act: "experience", objective: "", tools: [], goal: { type: "x" }, revealNotationAfterCompletion: false }), false);
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

test("shared scene and resource systems are deterministic and reusable", () => {
  const scene = { time: 0, entities: [{ id: "ship", position: { x: 0, y: 0 }, velocity: { x: 1, y: 0 }, mass: 2 }] };
  const moved = stepScene(scene, .5, () => ({ x: 2, y: 0 }));
  assert.equal(moved.time, .5);
  assert.deepEqual(entityById(moved, "ship")?.position, { x: .75, y: 0 });
  assert.deepEqual(moveEntity(moved, "ship", { x: 4, y: 2 }).entities[0].position, { x: 4, y: 2 });
  assert.deepEqual(advectParticles([{ id: "p", position: { x: 1, y: 2 }, velocity: { x: 0, y: 0 } }], () => ({ x: 2, y: -1 }), .5)[0].position, { x: 2, y: 1.5 });
  const reservoir = addResource(createReservoir(10, 2), 12);
  assert.deepEqual(reservoir, { capacity: 10, current: 10 });
  assert.equal(reservoirFilled(reservoir), true);
});

test("M05 enforces the inspected evidence gate and dependency diagnosis", () => {
  assert.equal(canUnlockM05Evidence(["E01", "E02", "E03", "E04", "E05", "E06"]), true);
  assert.equal(canUnlockM05Evidence(["E01", "E02", "E03", "E04", "E05"]), false);
  assert.equal(m05ProofEvidenceEnough(["E01", "E02", "E03"], ["E01", "E02", "E03"]), true);
  assert.equal(m05ProofEvidenceEnough(["E01", "E02", "E04"], ["E01", "E02"]), false);
  assert.equal(diagnosisProofIsEnoughM05("NETWORK_DEPENDENCY_WAITING", ["E01", "E02", "E03"], ["E01", "E02", "E03"]), true);
  assert.equal(diagnosisProofIsEnoughM05("M04_DISK_CONTENTION", ["E01", "E02", "E03"], ["E01", "E02", "E03"]), false);
});

test("M05 classifies the dependency map, causal chain, predictions and policy deterministically", () => {
  const map = { ...M05_INITIAL_DEPENDENCY_MAP, JDBC_DB_CALL: "CROSSES_DB_NETWORK_DEPENDENCY", AFFECTED_SHOP_REQUEST: "CROSSES_DB_NETWORK_DEPENDENCY", COMPARATOR_LOCAL_ACTION: "DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP", DISK_FULL_HYPOTHESIS: "UNSUPPORTED_CAUSE", CPU_EXHAUSTION_HYPOTHESIS: "UNSUPPORTED_CAUSE" };
  assert.equal(correctM05DependencyMap(map), true);
  assert.equal(causalOrderCorrectM05([...M05_REQUIRED_CAUSAL_ORDER]), true);
  assert.equal(causalLinksCorrectM05({ E01: "DB_CALL_CROSSES_NETWORK_DEPENDENCY", E02: "DB_DEPENDENT_REQUEST_WAITS", E03: "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR", E04: "WAITING_WORK_REMAINS_OCCUPIED" }), true);
  const predictions = Object.fromEntries(M05_PREDICTIONS.map(item => [item.id, item.correct]));
  assert.equal(predictionsCorrectM05(predictions), true);
  assert.equal(predictionsCorrectM05({ ...predictions, B_ERROR_SURFACED: "NO" }), false);
  assert.equal(policyJustificationCorrectM05("BOUNDED_TIMEOUT_ONE_RETRY", ["REMOTE_CALL_CAN_WAIT", "WAIT_MUST_HAVE_A_BOUND", "TIMEOUT_SURFACES_CONTROLLED_ERROR", "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT", "FIXED_SLOT_COUNT_WAS_NOT_TUNED"]), true);
});

test("M05 result checks and scoring preserve the exact 100-point clean path", () => {
  const map = { ...M05_INITIAL_DEPENDENCY_MAP, JDBC_DB_CALL: "CROSSES_DB_NETWORK_DEPENDENCY", AFFECTED_SHOP_REQUEST: "CROSSES_DB_NETWORK_DEPENDENCY", COMPARATOR_LOCAL_ACTION: "DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP", DISK_FULL_HYPOTHESIS: "UNSUPPORTED_CAUSE", CPU_EXHAUSTION_HYPOTHESIS: "UNSUPPORTED_CAUSE" };
  const predictions = Object.fromEntries(M05_PREDICTIONS.map(item => [item.id, item.correct]));
  const checks = { A_WAITING_AT_END: "CONFIRMED", A_NO_ERROR: "CONFIRMED", A_NO_RECOVERY: "CONFIRMED", B_ERROR_SURFACED: "CONFIRMED", B_RETRY_FAILED: "CONFIRMED", FIXED_SLOTS: "CONFIRMED" };
  const justifications = ["REMOTE_CALL_CAN_WAIT", "WAIT_MUST_HAVE_A_BOUND", "TIMEOUT_SURFACES_CONTROLLED_ERROR", "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT", "FIXED_SLOT_COUNT_WAS_NOT_TUNED"];
  assert.equal(resultChecksCorrectM05(checks), true);
  const score = scoreM05({ inspected: ["E01", "E02", "E03", "E04", "E05", "E06"], map, diagnosis: "NETWORK_DEPENDENCY_WAITING", proof: ["E01", "E02", "E03"], causalOrder: [...M05_REQUIRED_CAUSAL_ORDER], causalLinks: { E01: "DB_CALL_CROSSES_NETWORK_DEPENDENCY", E02: "DB_DEPENDENT_REQUEST_WAITS", E03: "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR", E04: "WAITING_WORK_REMAINS_OCCUPIED" }, predictions, checks, policy: "BOUNDED_TIMEOUT_ONE_RETRY", justifications, recoveryCycles: 0 });
  assert.deepEqual(score, { investigation: 15, diagnosis: 15, classification: 10, causal: 15, prediction: 10, experiment: 15, policy: 10, boundary: 5, efficiency: 5, total: 100 });
});

test("Water Valley turns hidden river functions into visible accumulation blocks", () => {
  const models = Array.from({ length: 5 }, (_, index) => valleyRiverModel(index, 42, 420));
  assert.deepEqual(models.map(model => model.id), ["linear", "quadratic", "wave", "flood", "mixed"]);
  assert.ok(models.every(model => model.formula.startsWith("Flow(t) = ")));
  assert.equal(valleyFlowRate(20, 42, 420, 2), valleyFlowRate(20, 42, 420, 2));
  const readings = Array.from({ length: 31 }, (_, index) => index * 2).map(time => ({ time, rate: valleyFlowRate(time, 42, 420, 2) }));
  const coarse = buildValleyRectangles(readings, 56, 10);
  const fine = buildValleyRectangles(readings, 56, 2);
  assert.equal(coarse.length, 6);
  assert.equal(fine.length, 28);
  assert.equal(coarse[0].volume, coarse[0].height * coarse[0].width);
  assert.equal(estimateValleyVolume(readings, 56, 10), coarse.reduce((sum, block) => sum + block.volume, 0));
  const actual = valleyActualVolume(56, 42, 420, .1, 2);
  assert.ok(Math.abs(estimateValleyVolume(readings, 56, 2) - actual) < Math.abs(estimateValleyVolume(readings, 56, 10) - actual));
  assert.equal(resolveValleyOutcome(420, 420), "success");
  assert.equal(resolveValleyOutcome(390, 420), "shortage");
  assert.equal(resolveValleyOutcome(450, 420), "flood");
});

test("Water Valley real-time blocks and hidden target crossing remain deterministic", () => {
  const blocks = buildValleyTimeBlocks([{ time: 2.4, rate: 5.8 }], 7.5, 5);
  assert.equal(blocks[0].state, "complete-measured");
  assert.equal(blocks[1].state, "filling");
  assert.equal(blocks[2].state, "waiting");
  assert.equal(blocks[0].source, "measured");
  assert.ok(blocks[0].volume > 0);
  assert.ok(estimateTargetCrossing([{ time: 2, rate: 6 }, { time: 28, rate: 10 }], 420, 60));
  const crossing = findActualTargetCrossing(420, 42, 4);
  assert.ok(crossing !== null && crossing > 0 && crossing < 60);
  assert.ok(valleyActualVolume(60, 42, 420, .05, 4) > 420);
  const reveal = buildActualRevealBlocks(crossing, 42, 420, 4);
  assert.ok(reveal.at(-1).end <= crossing);
  assert.ok(Math.abs(reveal.reduce((sum, block) => sum + block.volume, 0) - valleyActualVolume(crossing, 42, 420, .05, 4)) < .2);
});

test("Climate Detective ships a complete, sourced 2018 daily dataset", () => {
  assert.equal(CLIMATE_YEAR, 2018);
  assert.equal(CLIMATE_DATA.baseline.period, "2001-2020");
  assert.equal(CLIMATE_DATA.source.timeStandard, "UTC");
  assert.equal(CLIMATE_DATA.locations.length, 5);
  assert.equal(CLIMATE_DATA.oceanSource.provider, "NOAA NCEI");
  assert.equal(CLIMATE_DATA.selectedEvents.year, 2018);
  for (const location of CLIMATE_DATA.locations) {
    assert.equal(location.daily.length, 365);
    assert.equal(location.daily[0].date, "2018-01-01");
    assert.equal(location.daily.at(-1).date, "2018-12-31");
    assert.ok(location.daily.every(row => Object.values(row).every(value => value !== -999 && value !== -9999)));
    assert.ok(location.daily.every(row => row.evidenceQuality.complete));
  }
  assert.deepEqual(CLIMATE_MISSIONS.map(mission => mission.id), ["depression", "cold-snap", "warm-anomaly"]);
});

test("Architecture Lab M01 keeps the evidence gate deterministic", () => {
  assert.equal(M01_EVIDENCE.length, 4);
  assert.equal(canUnlockApproaches(["E01"]), false);
  assert.equal(canUnlockApproaches(["E01", "E03"]), false);
  assert.equal(canUnlockApproaches(["E02", "E03", "E04"]), false);
  assert.equal(canUnlockApproaches(["E01", "E02", "E03"]), true);
  assert.equal(canUnlockApproaches(["E01", "E02", "E04"]), true);
  assert.equal(canUnlockApproaches(["E01", "E03", "E04", "E03"]), true);
});

test("Architecture Lab M01 prevents unresolved previews from claiming a request", () => {
  assert.equal(approachResult("A").status, "READY_TO_SERVE");
  assert.equal(approachResult("A").requestMs, 80);
  assert.equal(approachResult("B").status, "PREVIEW_BLOCKED_UNRESOLVED_PLACEMENT");
  assert.equal(approachResult("B").requestMs, null);
  assert.equal(approachResult("C").status, "PREVIEW_BLOCKED_OVERBUILT_AND_UNRESOLVED");
  assert.equal(approachResult("C").requestMs, null);
  assert.equal(approachResult("D").status, "FUNCTIONAL_REQUIREMENT_MISSING");
  assert.equal(M01_TRACE.length, 9);
  assert.equal(M01_TRACE.find(step => step.event === "JDBC order write")?.target, "MySQL");
  assert.equal(M01_TRACE.at(-1)?.event, "Order confirmation");
});

test("Architecture Lab M01 scoring rewards fit plus observed failure domain", () => {
  const strong = scoreExplanation(["E01", "E03", "fit", "E04", "risk"], true);
  const missingFit = scoreExplanation(["E01", "E03", "E04", "risk"], true);
  const weak = scoreExplanation(["E01"], false);
  assert.equal(strong.total, 100);
  assert.ok(missingFit.total < 100);
  assert.ok(strong.total > weak.total);
  assert.equal(weak.reliability, 0);
});

test("Architecture Lab M02 keeps the slow-site evidence gate deterministic", () => {
  assert.equal(M02_EVIDENCE.length, 5);
  assert.deepEqual(M02_STAGE_ORDER, ["DNS_RESOLUTION", "HTTP_CONNECTION", "TOMCAT_PROCESSING", "JDBC_MYSQL_QUERY", "RESPONSE"]);
  assert.equal(canUnlockM02Evidence(["E01"]), false);
  assert.equal(canUnlockM02Evidence(["E01", "E02"]), false);
  assert.equal(canUnlockM02Evidence(["E01", "E02", "E03"]), true);
  assert.equal(canUnlockM02Evidence(["E01", "E02", "E03", "E03"]), true);
  assert.equal(canUnlockM02Evidence(["E01", "E03", "E04"]), false);
});

test("Architecture Lab M02 orders the request and exposes fixed teaching timings", () => {
  assert.equal(validateM02Route(M02_STAGE_ORDER), true);
  assert.equal(validateM02Route(["HTTP_CONNECTION", ...M02_STAGE_ORDER.slice(0, 4)]), false);
  assert.equal(timingTotal("healthy"), 250);
  assert.equal(timingTotal("incident_baseline"), 650);
  assert.equal(timingTotal("dns_delay_control"), 1050);
  assert.equal(timingTotal("server_delay_control"), 650);
  assert.equal(M02_TIMINGS.incident_baseline.DNS_RESOLUTION, 420);
  assert.equal(M02_TIMINGS.incident_baseline.TOMCAT_PROCESSING, 90);
});

test("Architecture Lab M02 keeps route feedback local and misconception-specific", () => {
  assert.equal(m02RouteFeedback(["HTTP_CONNECTION", "DNS_RESOLUTION", "TOMCAT_PROCESSING", "JDBC_MYSQL_QUERY", "RESPONSE"]).id, "HTTP_BEFORE_DNS");
  assert.match(m02RouteFeedback(["HTTP_CONNECTION", "DNS_RESOLUTION", "TOMCAT_PROCESSING", "JDBC_MYSQL_QUERY", "RESPONSE"]).message, /HTTP/i);
  assert.equal(m02RouteFeedback(["DNS_RESOLUTION", "JDBC_MYSQL_QUERY", "HTTP_CONNECTION", "TOMCAT_PROCESSING", "RESPONSE"]).id, "JDBC_BEFORE_TOMCAT");
  assert.equal(m02RouteFeedback(["DNS_RESOLUTION", "HTTP_CONNECTION", "TOMCAT_PROCESSING", "RESPONSE", "JDBC_MYSQL_QUERY"]).id, "RESPONSE_BEFORE_DATA");
});

test("Architecture Lab M02 separates route evidence from diagnosis evidence", () => {
  assert.equal(canCommitM02Diagnosis(["E01", "E02", "E03"], true, "DNS_RESOLUTION"), false);
  assert.equal(canCommitM02Diagnosis(["E01", "E02", "E04"], false, "DNS_RESOLUTION"), false);
  assert.equal(canCommitM02Diagnosis(["E01", "E02", "E04"], true, "DNS_RESOLUTION"), true);
});

test("Architecture Lab M02 requires a correct final diagnosis and measured comparisons", () => {
  assert.equal(canSubmitM02FinalDiagnosis("TOMCAT_PROCESSING", ["BASELINE_MEASUREMENT", "CONTROLLED_COMPARISON"], 2), false);
  assert.equal(canSubmitM02FinalDiagnosis("DNS_RESOLUTION", ["BASELINE_MEASUREMENT", "DNS_BEFORE_HTTP"], 1), false);
  assert.equal(canSubmitM02FinalDiagnosis("DNS_RESOLUTION", ["BASELINE_MEASUREMENT", "CONTROLLED_COMPARISON"], 1), true);
  assert.equal(explanationMatchesM02Diagnosis("TOMCAT_PROCESSING", ["INCIDENT_DNS_DIAGNOSIS"]), false);
  assert.equal(explanationMatchesM02Diagnosis("DNS_RESOLUTION", ["INCIDENT_DNS_DIAGNOSIS"]), true);
});

test("Architecture Lab M02 controlled experiments distinguish DNS from server delay", () => {
  const dns = experimentResult("X01_DNS_DELAY_CONTROL");
  const server = experimentResult("X02_SERVER_DELAY_CONTROL");
  assert.equal(dns.values.DNS_RESOLUTION, 820);
  assert.equal(dns.values.TOMCAT_PROCESSING, dns.comparisonValues.TOMCAT_PROCESSING);
  assert.equal(server.values.TOMCAT_PROCESSING, 490);
  assert.equal(server.values.DNS_RESOLUTION, server.comparisonValues.DNS_RESOLUTION);
  assert.equal(dns.total, 1050);
  assert.equal(server.total, 650);
  assert.equal(predictionIsCorrect("X01_DNS_DELAY_CONTROL", M02_EXPERIMENTS.X01_DNS_DELAY_CONTROL.correctPrediction), true);
  assert.equal(predictionIsCorrect("X01_DNS_DELAY_CONTROL", "TOMCAT_RISES_WITH_TOTAL"), false);
  assert.equal(predictionIsCorrect("X02_SERVER_DELAY_CONTROL", M02_EXPERIMENTS.X02_SERVER_DELAY_CONTROL.correctPrediction), true);
});

test("Architecture Lab M02 requires the causal distinction and scores recovery", () => {
  assert.equal(M02_EXPLANATION_OPTIONS.length, 6);
  assert.equal(explanationIsComplete(M02_EXPLANATION_OPTIONS.map(option => option.id)), true);
  const perfect = scoreM02({
    inspected: ["E01", "E02", "E04"], routeRepairs: 0, firstDiagnosis: "DNS_RESOLUTION", finalDiagnosis: "DNS_RESOLUTION",
    predictionMistakes: 0, experimentsRun: 2, explanation: M02_EXPLANATION_OPTIONS.map(option => option.id),
  });
  assert.equal(perfect.total, 100);
  const recovered = scoreM02({
    inspected: ["E01", "E02", "E03", "E04"], routeRepairs: 1, firstDiagnosis: "TOMCAT_PROCESSING", finalDiagnosis: "DNS_RESOLUTION",
    predictionMistakes: 1, experimentsRun: 1, explanation: ["DNS_BEFORE_HTTP", "INCIDENT_DNS_DIAGNOSIS"],
  });
  assert.ok(recovered.total < 100 && recovered.total > 0);
  const contradictoryFinal = scoreM02({
    inspected: ["E01", "E02", "E04"], routeRepairs: 0, firstDiagnosis: "DNS_RESOLUTION", finalDiagnosis: "TOMCAT_PROCESSING",
    predictionMistakes: 0, experimentsRun: 2, explanation: M02_EXPLANATION_OPTIONS.map(option => option.id),
  });
  assert.equal(contradictoryFinal.diagnosis, 0);
});

test("Architecture Lab M03 requires all five evidence cards before classification", () => {
  assert.equal(M03_EVIDENCE.length, 5);
  assert.equal(canUnlockM03Evidence(["E01", "E03", "E04", "E05"]), false);
  assert.equal(canUnlockM03Evidence(["E01", "E02", "E03", "E04", "E05"]), true);
  assert.equal(canMutateM03Classification(["E01", "E03", "E04", "E05"], "E02"), false);
  const completeEvidence = ["E01", "E02", "E03", "E04", "E05"];
  assert.equal(canMutateM03Classification(completeEvidence, "E02"), true);
  assert.equal(canCommitM03Map(completeEvidence, { ...M03_INITIAL_MAP, E01: "BOUND_TO_HOST_01", E02: "BOUND_TO_HOST_01", E03: "BOUND_TO_HOST_01", E04: "NOT_PROVEN_LOCAL" }), true);
});

test("Architecture Lab M03 keeps the host-boundary experiment deterministic", () => {
  const map = { ...M03_INITIAL_MAP, E01: "BOUND_TO_HOST_01", E02: "BOUND_TO_HOST_01", E03: "BOUND_TO_HOST_01", E04: "NOT_PROVEN_LOCAL" };
  assert.equal(correctM03Map(map), true);
  assert.equal(correctM03Map({ ...map, E04: "BOUND_TO_HOST_01" }), false);
  assert.deepEqual(M03_RESULTS.map(result => result.evidence), ["E01", "E02", "E03", "E04"]);
  assert.equal(correctM03ResultMatches({ DB: "E01", IMAGES: "E02", SESSION: "E03", DNS: "E04" }), true);
  assert.equal(correctM03ResultMatches({ DB: "E02", IMAGES: "E01", SESSION: "E03", DNS: "E04" }), false);
  assert.equal(M03_PREDICTIONS.length, 3);
  assert.equal(predictionIsCorrectM03("P01", "TARGET_NO_LONGER_MEANS_HOST_01"), true);
  assert.equal(predictionIsCorrectM03("P01", "WORKS_UNCHANGED"), false);
  assert.equal(canCommitM03Predictions({ P01: "TARGET_NO_LONGER_MEANS_HOST_01", P02: "HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE", P03: "EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02" }), true);
});

test("Architecture Lab M03 requires a consistent causal explanation and scores recovery", () => {
  const map = { ...M03_INITIAL_MAP, E01: "BOUND_TO_HOST_01", E02: "BOUND_TO_HOST_01", E03: "BOUND_TO_HOST_01", E04: "NOT_PROVEN_LOCAL" };
  const predictions = { P01: "TARGET_NO_LONGER_MEANS_HOST_01", P02: "HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE", P03: "EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02" };
  const matches = { DB: "E01", IMAGES: "E02", SESSION: "E03", DNS: "E04" };
  const order = M03_EXPLANATION_CONCEPTS.map(item => item.id);
  const links = { E01: "DB_LOCALHOST", E02: "IMAGE_LOCAL_DISK", E03: "SESSION_PROCESS_MEMORY", X01: "BOUNDARY_CHANGE_EXPOSES_COUPLING" };
  assert.equal(explanationOrderCorrect(order), true);
  assert.equal(explanationLinksCorrect(links), true);
  assert.equal(canCompleteM03({ inspected: ["E01", "E02", "E03", "E04", "E05"], map, predictions, matches, explanationOrder: order, explanationLinks: links }), true);
  assert.equal(M03_EXPLANATION_LINKS.length, 4);
  assert.equal(scoreM03({ inspected: ["E01", "E02", "E03", "E04", "E05"], map, predictions, matches, explanationOrder: order, explanationLinks: links, classificationRepairs: 0 }).total, 100);
  assert.ok(scoreM03({ inspected: ["E01", "E02", "E03", "E04", "E05"], map: { ...map, E03: "NOT_PROVEN_LOCAL" }, predictions, matches, explanationOrder: order, explanationLinks: links, classificationRepairs: 1 }).total < 100);
  const interpretationBase = { inspected: ["E01", "E02", "E03", "E04", "E05"], map, predictions, explanationOrder: order, explanationLinks: links, classificationRepairs: 0 };
  assert.equal(scoreM03({ ...interpretationBase, matches: { DB: "E01", IMAGES: "E02", SESSION: "E03", DNS: "E99" } }).experiment, 15);
  assert.equal(scoreM03({ ...interpretationBase, matches: { DB: "E01", IMAGES: "E02", SESSION: "E99", DNS: "E04" } }).experiment, 10);
  assert.equal(scoreM03({ ...interpretationBase, matches: { DB: "E01", IMAGES: "E02", SESSION: "E03", DNS: "E04" }, classificationRepairs: 0 }).efficiency, 5);
  assert.equal(scoreM03({ ...interpretationBase, matches, classificationRepairs: 1 }).efficiency, 4);
  assert.equal(scoreM03({ ...interpretationBase, matches, classificationRepairs: 2 }).efficiency, 3);
  assert.equal(scoreM03({ ...interpretationBase, matches, classificationRepairs: 3 }).efficiency, 2);
  assert.equal(scoreM03({ ...interpretationBase, matches, classificationRepairs: 99 }).efficiency, 2);
});

test("Architecture Lab M04 keeps the evidence gate and resource proof deterministic", () => {
  assert.equal(M04_EVIDENCE.length, 7);
  assert.equal(canUnlockM04Evidence(["E01", "E02", "E03", "E04", "E05"]), false);
  assert.equal(canUnlockM04Evidence(["E01", "E02", "E03", "E04", "E05", "E06"]), true);
  assert.equal(canUnlockM04Evidence(["E01", "E02", "E03", "E04", "E05", "E06", "E06"]), true);
  const correctMap = {
    ...M04_INITIAL_RESOURCE_MAP,
    MYSQL_PERSISTENT_DATA: "SHARED_LOCAL_DISK",
    TOMCAT_LOG_WRITE: "SHARED_LOCAL_DISK",
    SELLER_IMAGE_WRITE: "SHARED_LOCAL_DISK",
    CPU_COMPARATOR: "NOT_SHOWN_TO_CONSUME_THIS_DISK",
    REQUEST_PATH_COMPARATOR: "NOT_SHOWN_TO_CONSUME_THIS_DISK",
  };
  assert.equal(canCommitM04ResourceMap(correctMap), true);
  assert.equal(correctM04ResourceMap(correctMap), true);
  assert.equal(correctM04ResourceMap({ ...correctMap, SELLER_IMAGE_WRITE: "NOT_SHOWN_TO_CONSUME_THIS_DISK" }), false);
  assert.equal(diagnosisProofIsEnough("SHARED_DISK_CAPACITY", ["E02", "E03", "E04"], ["E01", "E02", "E03", "E04", "E06"]), true);
  assert.equal(diagnosisProofIsEnough("SHARED_DISK_CAPACITY", ["E02", "E03"], ["E01", "E02", "E03", "E06"]), false);
  assert.equal(diagnosisProofIsEnough("SHARED_DISK_CAPACITY", ["E02", "E03", "E04"], ["E01", "E02", "E03", "E06"]), false);
  assert.equal(diagnosisProofIsEnough("CPU_CAPACITY", ["E02", "E03", "E04"], ["E01", "E02", "E03", "E04", "E06"]), false);
});

test("Architecture Lab M04 requires prediction before reveal and reconciles measured results", () => {
  assert.equal(M04_PREDICTIONS.length, 5);
  const predictions = { A_DB_WRITE: "BLOCKED", A_LOG_WRITE: "BLOCKED", A_IMAGE_WRITE: "BLOCKED", B_WRITES_AVAILABLE: "AVAILABLE", B_SAME_BOUNDARY: "SEPARATE" };
  assert.equal(canCommitM04Predictions({ A_DB_WRITE: "BLOCKED" }), false);
  assert.equal(canCommitM04Predictions(predictions), true);
  assert.equal(M04_RESULT_CHECKS.length, 3);
  assert.equal(resultChecksCorrectM04({ SHARED_WRITES_BLOCKED: "CONFIRMED", ISOLATED_WRITES_AVAILABLE: "CONFIRMED", FINITE_BOUNDARY: "CONFIRMED" }), true);
  assert.equal(resultChecksCorrectM04({ SHARED_WRITES_BLOCKED: "NOT_CONFIRMED", ISOLATED_WRITES_AVAILABLE: "CONFIRMED", FINITE_BOUNDARY: "CONFIRMED" }), false);
});

test("Architecture Lab M04 requires the causal chain, proportionate intervention, and exact scoring tiers", () => {
  const map = {
    ...M04_INITIAL_RESOURCE_MAP,
    MYSQL_PERSISTENT_DATA: "SHARED_LOCAL_DISK",
    TOMCAT_LOG_WRITE: "SHARED_LOCAL_DISK",
    SELLER_IMAGE_WRITE: "SHARED_LOCAL_DISK",
    CPU_COMPARATOR: "NOT_SHOWN_TO_CONSUME_THIS_DISK",
    REQUEST_PATH_COMPARATOR: "NOT_SHOWN_TO_CONSUME_THIS_DISK",
  };
  const predictions = { A_DB_WRITE: "BLOCKED", A_LOG_WRITE: "BLOCKED", A_IMAGE_WRITE: "BLOCKED", B_WRITES_AVAILABLE: "AVAILABLE", B_SAME_BOUNDARY: "SEPARATE" };
  const checks = { SHARED_WRITES_BLOCKED: "CONFIRMED", ISOLATED_WRITES_AVAILABLE: "CONFIRMED", FINITE_BOUNDARY: "CONFIRMED" };
  const order = M04_CAUSAL_CLAIMS.map(item => item.id);
  const links = { E01: "CATALOGUE_GROWS", E02: "SHARED_DISK_REACHES_CAPACITY", E03: "PERSISTENT_DB_DATA_GROWS", E04: "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE", E05: "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE" };
  assert.equal(causalOrderCorrectM04(order), true);
  assert.equal(causalLinksCorrectM04(links), true);
  assert.equal(interventionJustificationCorrectM04("WEB_DB_ISOLATION", ["PROVEN_SHARED_DISK", "SEPARATE_RESOURCE_DOMAINS", "FINITE_DOMAINS"]), true);
  assert.equal(interventionJustificationCorrectM04("BIGGER_SINGLE_HOST_DISK", ["PROVEN_SHARED_DISK", "SEPARATE_RESOURCE_DOMAINS", "FINITE_DOMAINS"]), false);
  const base = { inspected: ["E01", "E02", "E03", "E04", "E05", "E06"], map, diagnosis: "SHARED_DISK_CAPACITY", proof: ["E02", "E03", "E04"], predictions, checks, causalOrder: order, causalLinks: links, intervention: "WEB_DB_ISOLATION", justifications: ["PROVEN_SHARED_DISK", "SEPARATE_RESOURCE_DOMAINS", "FINITE_DOMAINS"], tradeoff: true };
  assert.equal(scoreM04({ ...base, recoveryCycles: 0 }).total, 100);
  assert.equal(scoreM04({ ...base, intervention: "BIGGER_SINGLE_HOST_DISK", recoveryCycles: 2 }).intervention, 6);
  assert.equal(scoreM04({ ...base, recoveryCycles: 0 }).efficiency, 5);
  assert.equal(scoreM04({ ...base, recoveryCycles: 1 }).efficiency, 4);
  assert.equal(scoreM04({ ...base, recoveryCycles: 2 }).efficiency, 3);
  assert.equal(scoreM04({ ...base, recoveryCycles: 3 }).efficiency, 2);
  assert.equal(scoreM04({ ...base, recoveryCycles: 99 }).efficiency, 2);
});

test("Climate Detective uses deterministic concepts, seasonal geometry, and evidence units", () => {
  const london = locationById("london");
  const winterDaylight = dayLengthHours(london.latitude, "2018-01-15");
  const summerDaylight = dayLengthHours(london.latitude, "2018-07-26");
  assert.ok(summerDaylight > winterDaylight);
  assert.ok(solarAngle(london.latitude, "2018-07-26") > solarAngle(london.latitude, "2018-01-15"));
  assert.equal(seasonFor("2018-03-18"), "spring");
  assert.equal(seasonFor("2018-07-26"), "summer");
  assert.equal(pressureHpa(london.daily[0]), Number((london.daily[0].pressureKpa * 10).toFixed(1)));
  assert.match(windDirectionLabel(90), /easterly sector/);
  assert.match(windDirectionLabel(270), /westerly sector/);
  assert.match(windDirectionLabel(180), /mixed sector/);
  const coldRow = london.daily.find(row => row.date === "2018-03-18");
  assert.ok(coldRow);
  const sst = evidenceValue("sst", coldRow, london.daily[0], london, "2018-03-18");
  assert.match(sst.value, /°C/);
  assert.ok(conceptsFromText("The pressure fell as an easterly air mass arrived from the continent.").includes("PRESSURE"));
  assert.ok(conceptsFromText("The pressure fell as an easterly air mass arrived from the continent.").includes("CONTINENTALITY"));
  assert.ok(conceptsFromText("Earth's axial tilt gives a higher solar angle and longer daylight.").includes("AXIAL_TILT"));
});

test("Climate Detective scoring rewards evidence, causal order, concepts, and forecasts", () => {
  const mission = CLIMATE_MISSIONS.find(item => item.id === "depression");
  const london = locationById("london");
  const actual = london.daily.find(row => row.date === mission.date);
  const following = london.daily[london.daily.indexOf(actual) + 1];
  assert.ok(mission && actual && following);
  const strong = scoreMission(
    mission,
    mission.evidence,
    mission.chain.map(step => step.id),
    "Falling pressure brings a front and rising air, causing rainfall as the Atlantic air mass arrives.",
    { temperature: "steady", pressure: following.pressureKpa < actual.pressureKpa ? "falling" : "rising", wind: following.windSpeed > actual.windSpeed ? "stronger" : "lighter", rain: following.precipitation > actual.precipitation ? "wetter" : "drier" },
    actual,
    following,
  );
  assert.equal(strong.evidence, 3);
  assert.equal(strong.concepts, 3);
  assert.equal(strong.reasoning, 3);
  assert.ok(strong.total >= 11);
  const weak = scoreMission(mission, ["temperature"], ["front-arrives"], "It changes.", { temperature: "steady", pressure: "steady", wind: "steady", rain: "steady" }, actual, following);
  assert.ok(weak.total < strong.total);
});

test("Climate Detective scoring handles wrong, excessive, and hinted investigations", () => {
  const mission = CLIMATE_MISSIONS.find(item => item.id === "depression");
  const london = locationById("london");
  const actual = london.daily.find(row => row.date === mission.date);
  const following = london.daily[london.daily.indexOf(actual) + 1];
  assert.ok(mission && actual && following);
  const chain = mission.chain.map(step => step.id);
  const answer = "Falling pressure brings maritime Atlantic air upward; rising air condenses and brings rain.";
  const forecast = { temperature: "steady", pressure: "rising", wind: "lighter", rain: "drier" };
  const focused = scoreMission(mission, ["pressure", "wind", "rain"], chain, answer, forecast, actual, following, 0);
  const hinted = scoreMission(mission, ["pressure", "wind", "rain"], chain, answer, forecast, actual, following, 1);
  const wrong = scoreMission(mission, ["sst"], ["low-pressure-centre"], "It changes.", forecast, actual, following, 0);
  const excessive = scoreMission(mission, mission.evidence, chain, answer, forecast, actual, following, 2);
  assert.equal(focused.efficiency, 2);
  assert.equal(hinted.efficiency, 1);
  assert.ok(wrong.evidence < focused.evidence);
  assert.equal(excessive.evidence, 3);
  assert.equal(excessive.efficiency, 0);
});

test("Climate Detective pressure field is real, gridded, and contourable", () => {
  const field = CLIMATE_DATA.pressureField;
  assert.equal(field.provider, "NASA POWER");
  assert.equal(field.parameter, "PS");
  assert.equal(field.units, "kPa");
  assert.deepEqual(field.resolution, { latitudeDegrees: 0.5, longitudeDegrees: 0.625, note: "native regional API grid; tiles de-duplicated at shared boundaries" });
  const points = field.values["2018-01-15"];
  assert.equal(points.length, 2028);
  assert.ok(points.every(point => Number.isFinite(point.pressureKpa) && Number.isFinite(point.surfaceElevation)));
  const segments = pressureContourSegments(field, "2018-01-15", [98, 100, 102]);
  assert.ok(segments.length > 0);
  assert.ok(segments.every(segment => segment.a.longitude >= -20 && segment.a.longitude <= 12 && segment.b.latitude >= 45 && segment.b.latitude <= 64));
  const levels = pressureContourLevels(field, "2018-01-15", 4);
  assert.deepEqual(levels, [96.4, 96.8, 97.2, 97.6, 98, 98.4, 98.8, 99.2, 99.6, 100, 100.4, 100.8, 101.2, 101.6]);
  const labels = pressureContourLabels(field, "2018-01-15", levels);
  assert.ok(labels.length > 0);
  assert.ok(labels.every(label => levels.includes(label.levelKpa)));
  assert.equal(new Set(labels.map(label => label.levelKpa)).size, labels.length);
  assert.equal(pressureContourLabels(field, "2018-01-15", [98], 1).length, 1);
  const centres = derivePressureCentres(field, "2018-01-15");
  assert.deepEqual(centres.map(centre => centre.kind), ["L", "H"]);
  assert.equal(new Set(centres.map(centre => `${centre.kind}:${centre.longitude}:${centre.latitude}`)).size, centres.length);
  assert.ok(centres.every(centre => Number.isFinite(centre.pressureKpa)));
});

test("Climate Detective causal cards shuffle without changing semantic IDs", () => {
  const mission = CLIMATE_MISSIONS[0];
  const ids = mission.chain.map(step => step.id);
  const orders = [1, 2, 3, 4, 5].map(seed => shuffleCausalIds(ids, seed));
  assert.ok(orders.every(order => order.length === ids.length));
  assert.ok(orders.every(order => new Set(order).size === ids.length));
  assert.ok(orders.every(order => order.some((id, index) => id !== ids[index])));
  assert.ok(new Set(orders.map(order => order.join("|"))).size > 1);
  assert.ok(orders.every(order => causalPrefixLength(mission, order) < ids.length));
  assert.match(causalOrderFeedback(mission, ["rising-condensation"]), /rainfall|rising air/i);
  assert.match(causalOrderFeedback(mission, ["low-pressure-centre", "falling-pressure", "pressure-gradient", "rising-condensation"]), /rainfall|rising air/i);
});

test("Climate Detective exposes exact explanation lock reasons", () => {
  const mission = CLIMATE_MISSIONS[0];
  const blank = explanationLockReasons(mission, mission.chain.slice(0, 2).map(step => step.id), "", false);
  assert.ok(blank.some(reason => /three map tasks/i.test(reason)));
  assert.ok(blank.some(reason => /causal chain/i.test(reason)));
  assert.ok(blank.some(reason => /field note/i.test(reason)));
  const ready = explanationLockReasons(mission, mission.chain.map(step => step.id), "Falling pressure brings maritime Atlantic air upward; rising air condenses and brings rain.", true);
  assert.deepEqual(ready, []);
});

test("M28 global circulation model stays separate, ordered, and deterministic", () => {
  const world = JSON.parse(readFileSync(new URL("../app/games/climate-detective/data/natural-earth-world.json", import.meta.url), "utf8"));
  assert.ok(world.features.length >= 170);
  assert.ok(world.features.some(feature => feature.properties.ADMIN === "United Kingdom"));
  assert.deepEqual(GLOBAL_LATITUDE_BANDS.map(band => band.latitude), [90, 60, 30, 0, -30, -60, -90]);
  assert.deepEqual(GLOBAL_PRESSURE_BELTS.map(belt => belt.centreLatitude), [75, 60, 30, 0, -30, -60, -75]);
  assert.equal(GLOBAL_CELLS.length, 6);
  assert.equal(coriolisDeflection("north"), "right");
  assert.equal(coriolisDeflection("south"), "left");
  assert.equal(windBeltForLatitude(20)?.id, "north-trade-winds");
  assert.equal(windBeltForLatitude(45)?.id, "north-westerlies");
  assert.equal(windBeltForLatitude(-20)?.id, "south-trade-winds");
  assert.equal(windBeltForLatitude(-45)?.id, "south-westerlies");
  assert.equal(windBeltForLatitude(75)?.id, "north-polar-easterlies");
  assert.equal(atmosphericCellForLatitude(55)?.name, "Ferrel Cell");
  assert.equal(atmosphericCellForLatitude(-75)?.name, "Polar Cell");
  assert.equal(isBritainMidLatitude(55), true);
  assert.equal(isBritainMidLatitude(45), false);
  assert.equal(GLOBAL_WIND_BELTS.find(belt => belt.id === "north-westerlies")?.fromDirection, "west");
  assert.equal(GLOBAL_WIND_BELTS.find(belt => belt.id === "north-trade-winds")?.toDirection, "south-west");
  assert.equal(CORIOLIS_EXAMPLES.find(example => example.id === "south-equatorward")?.deflection, "left");
  assert.deepEqual(coriolisMotionLatitudes("north-equatorward"), { startLatitude: 30, endLatitude: 0 });
  assert.deepEqual(coriolisMotionLatitudes("north-poleward"), { startLatitude: 30, endLatitude: 60 });
  assert.deepEqual(coriolisMotionLatitudes("south-equatorward"), { startLatitude: -30, endLatitude: 0 });
  assert.deepEqual(coriolisMotionLatitudes("south-poleward"), { startLatitude: -30, endLatitude: -60 });
  assert.equal(GLOBAL_SEASON_CONTEXT["nh-winter"].shortLabel, "NH winter");
  assert.equal(seasonalLatitude(30, "nh-winter"), 25);
  assert.equal(seasonalLatitude(-30, "nh-winter"), -35);
  assert.equal(seasonalLatitude(0, "nh-summer"), 3);
  for (const [longitude, latitude] of [[-180, 90], [0, 0], [180, -90]]) {
    const point = equalEarthPoint(longitude, latitude, 1200, 520);
    assert.ok(point.x >= 24 && point.x <= 1176 && point.y >= 24 && point.y <= 496);
  }
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
