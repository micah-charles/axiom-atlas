import levelData from "./advanced-levels.json" with { type: "json" };

export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };
export type Matrix2 = [number, number, number, number];

export type AdvancedEngine = "curve" | "field" | "flow" | "dynamic" | "transformation" | "plane" | "signal" | "graph" | "probability" | "geometry";
export type AdvancedAct = "experience" | "control" | "measure" | "generalise" | "name";
export type AdvancedEngineManifestEntry = { id: AdvancedEngine; systems: string[]; concepts: string[] };
export const ADVANCED_ENGINE_MANIFEST: AdvancedEngineManifestEntry[] = [
  { id: "curve", systems: ["RateCurve", "Accumulator", "SecantProbe"], concepts: ["integration", "derivative"] },
  { id: "field", systems: ["VectorField", "MeasurementSensor", "GradientTerrain"], concepts: ["gradient", "partial derivatives", "divergence", "curl"] },
  { id: "flow", systems: ["PathDrawer", "FluxGauge", "BoundaryRoute"], concepts: ["line integral", "surface integral", "Stokes theorem"] },
  { id: "dynamic", systems: ["TimeController", "StateStepper", "TrajectoryPlot"], concepts: ["differential equations", "second-order differential equations", "chaotic dynamics"] },
  { id: "transformation", systems: ["MatrixOperator", "GridDeformer", "InvariantProbe"], concepts: ["matrix transformations", "eigenvectors", "determinant", "Jacobian"] },
  { id: "plane", systems: ["ComplexPlane", "PortalOperator", "ProjectionMeter"], concepts: ["complex numbers", "Euler formula"] },
  { id: "signal", systems: ["Waveform", "Spectrum", "Filter"], concepts: ["Fourier transform"] },
  { id: "graph", systems: ["VertexGraph", "PathSolver", "WeightMeter"], concepts: ["graph paths"] },
  { id: "probability", systems: ["TrialSampler", "EstimateGauge", "OutcomeStream"], concepts: ["probability simulation"] },
  { id: "geometry", systems: ["ConstructionPlane", "VertexHandles", "AreaGauge"], concepts: ["geometry construction"] },
];

export type AdvancedLevelDefinition = {
  id: string;
  world: string;
  concept: string;
  engine: AdvancedEngine;
  act: AdvancedAct;
  objective: string;
  tools: string[];
  goal: { type: string; target?: number; moveLimit?: number };
  revealNotationAfterCompletion: boolean;
  seed?: number;
  dailyKey?: string;
};

/** Campaign content is data-first: the JSON pack can grow without changing engine code. */
export const ADVANCED_LEVEL_CATALOG: AdvancedLevelDefinition[] = levelData as AdvancedLevelDefinition[];
export type AdvancedInstrumentDefinition = { id: string; engine: AdvancedEngine; label: string; unit: string };
const instrumentLabel = (id: string): string => id.replace(/([A-Z])/g, " $1").replace(/^./, character => character.toUpperCase());
/** Tools in level JSON are resolved through one instrument registry instead of bespoke UI strings. */
export const ADVANCED_INSTRUMENTS: Record<string, AdvancedInstrumentDefinition> = Object.fromEntries(
  ADVANCED_LEVEL_CATALOG.flatMap(level => level.tools.map(id => [id, { id, engine: level.engine, label: instrumentLabel(id), unit: "reading" }] as const)),
);
export function measurementInstrument(id: string): AdvancedInstrumentDefinition | undefined { return ADVANCED_INSTRUMENTS[id]; }

export const ADVANCED_ACTS: { id: AdvancedAct; label: string; instruction: string; verb: string; minimumObservations: number; revealNotation: boolean }[] = [
  { id: "experience", label: "Act 1 · Experience", instruction: "Observe the phenomenon before naming it.", verb: "Observe", minimumObservations: 1, revealNotation: false },
  { id: "control", label: "Act 2 · Control", instruction: "Change one system input and watch the world respond.", verb: "Adjust", minimumObservations: 2, revealNotation: false },
  { id: "measure", label: "Act 3 · Measure", instruction: "Use an instrument to compare numerical readings.", verb: "Measure", minimumObservations: 3, revealNotation: false },
  { id: "generalise", label: "Act 4 · Generalise", instruction: "Apply the same rule in a new situation.", verb: "Transfer", minimumObservations: 3, revealNotation: false },
  { id: "name", label: "Act 5 · Name", instruction: "Reveal the formal notation after the discovery.", verb: "Name", minimumObservations: 3, revealNotation: true },
];

export const ADVANCED_NOTATION: Record<string, string> = {
  integration: "∫ₐᵇ f(t) dt", derivative: "f′(x)", gradient: "∇f", "partial derivatives": "∂f/∂x, ∂f/∂y", divergence: "∇·F", curl: "∇×F", "line integral": "∫C F·dr", "surface integral": "∬S F·n dS", "Stokes theorem": "∮∂S F·dr = ∬S (∇×F)·n dS", "differential equations": "dR/dt = aR − bRF", "second-order differential equations": "mx″ + cx′ + kx = 0", "chaotic dynamics": "xₙ₊₁ = r xₙ(1 − xₙ)", "Fourier transform": "F(ω) = ∫ f(t)e⁻ⁱωt dt", "matrix transformations": "v′ = Av", eigenvectors: "Av = λv", determinant: "det(A)", Jacobian: "J(x,y)", "complex numbers": "z = a + bi", "Euler formula": "eⁱθ = cos θ + i sin θ", "graph paths": "d(v) = minₚ w(p)", "probability simulation": "P(A) = limₙ→∞ successes/n", "geometry construction": "A = ½bh",
};

export function advancedNotation(concept: string): string { return ADVANCED_NOTATION[concept] ?? "Formal rule recorded"; }

export function validateAdvancedLevelDefinition(level: AdvancedLevelDefinition): boolean {
  const acts: AdvancedAct[] = ["experience", "control", "measure", "generalise", "name"];
  const validGoal = Boolean(level.goal && typeof level.goal.type === "string" && (!("target" in level.goal) || typeof level.goal.target === "number") && (!("moveLimit" in level.goal) || typeof level.goal.moveLimit === "number"));
  return Boolean(level.id && level.world && level.concept && ADVANCED_ENGINE_MANIFEST.some(engine => engine.id === level.engine && engine.concepts.includes(level.concept)) && acts.includes(level.act) && level.objective && Array.isArray(level.tools) && level.tools.length && level.tools.every(tool => typeof tool === "string" && tool.length > 0 && measurementInstrument(tool)?.engine === level.engine) && validGoal && level.revealNotationAfterCompletion === true);
}

export function advancedGoalSatisfied(goal: AdvancedLevelDefinition["goal"], value: number, tolerance = .08): boolean {
  if (!Number.isFinite(value) || typeof goal.target !== "number") return false;
  if (goal.type === "accumulate" || goal.type === "pathEnergy") return value >= goal.target;
  if (goal.type === "shortestPath") return value <= goal.target;
  const allowed = goal.type === "flux" ? Math.max(1, goal.target * .18) : tolerance;
  return Math.abs(value - goal.target) <= allowed;
}

export function advancedActRule(act: AdvancedAct): { verb: string; minimumObservations: number; revealNotation: boolean } { const rule = ADVANCED_ACTS.find(candidate => candidate.id === act); return rule ? { verb: rule.verb, minimumObservations: rule.minimumObservations, revealNotation: rule.revealNotation } : { verb: "Observe", minimumObservations: 1, revealNotation: false }; }

export const ADVANCED_CAMPAIGN: AdvancedLevelDefinition[] = ADVANCED_LEVEL_CATALOG.flatMap(level => ADVANCED_ACTS.map(act => ({
  ...level,
  id: `${level.id}-${act.id}`,
  act: act.id,
  objective: `${act.label}: ${level.objective}`,
})));

export function generateAdvancedExpedition(seed: number, concept?: string, act: AdvancedAct = "experience"): AdvancedLevelDefinition {
  const chosen = concept ? ADVANCED_LEVEL_CATALOG.find(level => level.concept === concept) : ADVANCED_LEVEL_CATALOG[Math.abs(Math.floor(seed)) % ADVANCED_LEVEL_CATALOG.length];
  const base = chosen ?? ADVANCED_LEVEL_CATALOG[0];
  const actDefinition = ADVANCED_ACTS.find(candidate => candidate.id === act) ?? ADVANCED_ACTS[0];
  const profile = advancedSeedProfile(seed); const variant = profile.variant;
  const target = typeof base.goal.target === "number" ? Number((base.goal.target * (0.85 + variant * 0.05)).toFixed(3)) : base.goal.target;
  return { ...base, id: `${base.id}-${actDefinition.id}-endless-${Math.abs(Math.floor(seed))}`, act: actDefinition.id, seed: Math.floor(seed), objective: `${actDefinition.label}: ${base.objective} Variant ${variant}.`, goal: { ...base.goal, ...(target === undefined ? {} : { target }) } };
}

export function dailyAdvancedExpedition(date = new Date()): AdvancedLevelDefinition {
  const daySeed = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86_400_000;
  return { ...generateAdvancedExpedition(daySeed, undefined, "measure"), dailyKey: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}` };
}

export type AdvancedSeedProfile = { seed: number; variant: number; amplitude: number; probability: number; fieldStrength: number; rotation: number; scale: number; edgeBias: number; surfaceHeight: number; chaosInitial: number; chaosGrowth: number };
export function advancedSeedProfile(seed: number): AdvancedSeedProfile {
  const value = Math.abs(Math.floor(seed));
  return { seed: value, variant: value % 7 + 1, amplitude: 14 + value % 18, probability: Math.min(.85, .45 + (value % 9) * .04), fieldStrength: 1 + (value % 7) * .25, rotation: value % 90, scale: 1 + (value % 5) * .25, edgeBias: value % 5, surfaceHeight: 6 + value % 4, chaosInitial: .12 + (value % 20) / 100, chaosGrowth: 3.2 + (value % 70) / 100 };
}

export function advancedActUnlocked(campaign: AdvancedLevelDefinition[], completed: Record<string, unknown>, level: AdvancedLevelDefinition): boolean {
  const actIndex = ADVANCED_ACTS.findIndex(act => act.id === level.act);
  if (actIndex <= 0) return true;
  const prior = campaign.find(candidate => candidate.concept === level.concept && candidate.act === ADVANCED_ACTS[actIndex - 1].id);
  return !prior || Boolean(completed[prior.id]);
}

export function trapezoidIntegral(rate: (t: number) => number, start: number, end: number, slices: number): number {
  const n = Math.max(1, Math.floor(slices)); const width = (end - start) / n; let total = 0;
  for (let i = 0; i < n; i++) total += (rate(start + i * width) + rate(start + (i + 1) * width)) * width / 2;
  return total;
}
export function accumulateFlow(rate: (t: number) => number, start: number, end: number, slices: number, reservoir = 0): number { return reservoir + trapezoidIntegral(rate, start, end, slices); }

export function secantSlope(value: (x: number) => number, a: number, b: number): number { return (value(b) - value(a)) / (b - a); }
export function tangentSlope(value: (x: number) => number, x: number, epsilon = 1e-4): number { return secantSlope(value, x - epsilon, x + epsilon); }
export function gaussianHeight(point: Vec2, peak: Vec2 = { x: 0, y: 0 }, spread = 4): number { const dx = point.x - peak.x; const dy = point.y - peak.y; return Math.exp(-(dx * dx + dy * dy) / spread); }
export type SeededGradientProfile = { peak: Vec2; spread: number; heading: number };
export function seededGradientProfile(seed: number): SeededGradientProfile { const value = Math.abs(Math.floor(seed)); return { peak: { x: (value % 5) - 2, y: (Math.floor(value / 5) % 5) - 2 }, spread: 3 + value % 4, heading: value % 360 }; }
export type SeededCurveProfile = { amplitude: number; ratePhase: number; slopePhase: number };
export function seededCurveProfile(seed: number): SeededCurveProfile { const value = Math.abs(Math.floor(seed)); return { amplitude: advancedSeedProfile(seed).amplitude, ratePhase: value % 6, slopePhase: value % 4 }; }

export type VectorField = (point: Vec2) => Vec2;
export type SeededFieldProfile = { center: Vec2; strength: number };
export function seededFieldProfile(seed: number): SeededFieldProfile { const value = Math.abs(Math.floor(seed)); return { center: { x: (value % 5) - 2, y: (Math.floor(value / 5) % 5) - 2 }, strength: 1 + (value % 6) * .35 }; }
export type SeededFieldMode = "divergence" | "curl";
export function seededVectorField(seed: number, mode: SeededFieldMode): VectorField { const { center, strength } = seededFieldProfile(seed); return point => { const dx = point.x - center.x; const dy = point.y - center.y; return mode === "curl" ? { x: -dy * strength, y: dx * strength } : { x: dx * strength, y: dy * strength }; }; }
export function divergence(field: VectorField, point: Vec2, epsilon = 1e-3): number { const x = { x: point.x + epsilon, y: point.y }; const xm = { x: point.x - epsilon, y: point.y }; const y = { x: point.x, y: point.y + epsilon }; const ym = { x: point.x, y: point.y - epsilon }; return (field(x).x - field(xm).x + field(y).y - field(ym).y) / (2 * epsilon); }
export function curl(field: VectorField, point: Vec2, epsilon = 1e-3): number { const x = { x: point.x + epsilon, y: point.y }; const xm = { x: point.x - epsilon, y: point.y }; const y = { x: point.x, y: point.y + epsilon }; const ym = { x: point.x, y: point.y - epsilon }; return (field(x).y - field(xm).y - field(y).x + field(ym).x) / (2 * epsilon); }
export function lineIntegral(field: VectorField, path: Vec2[]): number { let total = 0; for (let i = 1; i < path.length; i++) { const a = path[i - 1]; const b = path[i]; const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; const dx = b.x - a.x; const dy = b.y - a.y; const vector = field(midpoint); total += vector.x * dx + vector.y * dy; } return total; }
export function polylineLength(path: Vec2[]): number { let total = 0; for (let i = 1; i < path.length; i++) total += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); return total; }
export function surfaceFlux(field: VectorField, normal: Vec2, area: number): number { return (field({ x: 0, y: 0 }).x * normal.x + field({ x: 0, y: 0 }).y * normal.y) * area; }
export function surfaceFlux3D(field: (point: Vec3) => Vec3, normal: Vec3, area: number, point: Vec3 = { x: 0, y: 0, z: 0 }): number { const vector = field(point); return (vector.x * normal.x + vector.y * normal.y + vector.z * normal.z) * area; }
export function closedPath(path: Vec2[]): Vec2[] { if (path.length < 2) return path; const first = path[0]; const last = path[path.length - 1]; return first.x === last.x && first.y === last.y ? path : [...path, first]; }
export type SeededFlowMode = "line integral" | "surface integral" | "Stokes theorem";
export type SeededFlowProfile = { strength: number; surfaceHeight: number };
export function seededFlowProfile(seed: number): SeededFlowProfile { const profile = advancedSeedProfile(seed); return { strength: profile.fieldStrength, surfaceHeight: profile.surfaceHeight }; }
export function seededFlowReading(mode: SeededFlowMode, strength: number, route: Vec2[], control = 0, seed = 0): number {
  if (mode === "line integral") return lineIntegral(() => ({ x: strength, y: 0 }), route) * 25;
  if (mode === "surface integral") {
    const radians = control * Math.PI / 180;
    return surfaceFlux3D(() => ({ x: strength, y: 1.5, z: seededFlowProfile(seed).surfaceHeight }), { x: Math.sin(radians), y: 0, z: Math.cos(radians) }, 1);
  }
  return lineIntegral(point => ({ x: -point.y * strength, y: point.x * strength }), closedPath(route));
}

export type PopulationState = { rabbits: number; foxes: number };
export function lotkaVolterraStep(state: PopulationState, dt: number, params = { birth: 1, predation: .01, growth: .005, death: .8 }): PopulationState { const rabbits = state.rabbits + (params.birth * state.rabbits - params.predation * state.rabbits * state.foxes) * dt; const foxes = state.foxes + (params.growth * state.rabbits * state.foxes - params.death * state.foxes) * dt; return { rabbits: Math.max(0, rabbits), foxes: Math.max(0, foxes) }; }
export type SpringState = { position: number; velocity: number };
export function springStep(state: SpringState, dt: number, mass: number, stiffness: number, damping: number): SpringState { const acceleration = (-stiffness * state.position - damping * state.velocity) / mass; return { position: state.position + state.velocity * dt, velocity: state.velocity + acceleration * dt }; }
export function logisticMapStep(value: number, growth: number): number { return growth * value * (1 - value); }
export function logisticTrajectory(seed: number, growth: number, steps: number): number[] { const values: number[] = []; let value = Math.max(0, Math.min(1, seed)); for (let index = 0; index < Math.max(0, steps); index++) { values.push(value); value = logisticMapStep(value, growth); } return values; }
export type SeededDynamicProfile = { population: PopulationState; spring: SpringState; predation: number; death: number; mass: number; stiffness: number };
export function seededDynamicProfile(seed: number): SeededDynamicProfile { const value = Math.abs(Math.floor(seed)); return { population: { rabbits: 300 + value % 120, foxes: 20 + value % 12 }, spring: { position: 1 + (value % 4) * .2, velocity: 0 }, predation: .006 + (value % 5) * .002, death: .7 + (value % 4) * .08, mass: 1 + (value % 3) * .4, stiffness: 2 + (value % 5) * .6 }; }
export function seededPopulationStep(state: PopulationState, control: number, seed: number, dt = .1): PopulationState { const profile = seededDynamicProfile(seed); return lotkaVolterraStep(state, dt, { birth: control, predation: profile.predation, growth: .005, death: profile.death }); }
export function seededSpringStep(state: SpringState, damping: number, seed: number, dt = .1): SpringState { const profile = seededDynamicProfile(seed); return springStep(state, dt, profile.mass, profile.stiffness, damping); }
export function seededChaosTrajectory(seed: number, growth: number, steps = 30): number[] { return logisticTrajectory(.12 + (Math.abs(seed) % 20) / 100, growth, steps); }
export type SeededChaosProfile = { initial: number; defaultGrowth: number };
export function seededChaosProfile(seed: number): SeededChaosProfile { const profile = advancedSeedProfile(seed); return { initial: profile.chaosInitial, defaultGrowth: profile.chaosGrowth }; }

export function multiplyMatrix(a: Matrix2, b: Matrix2): Matrix2 { return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]]; }
export function applyMatrix(matrix: Matrix2, point: Vec2): Vec2 { return { x: matrix[0] * point.x + matrix[1] * point.y, y: matrix[2] * point.x + matrix[3] * point.y }; }
export function determinant(matrix: Matrix2): number { return matrix[0] * matrix[3] - matrix[1] * matrix[2]; }
export function jacobian(field: (point: Vec2) => Vec2, point: Vec2, epsilon = 1e-4): Matrix2 { const px = field({ x: point.x + epsilon, y: point.y }); const mx = field({ x: point.x - epsilon, y: point.y }); const py = field({ x: point.x, y: point.y + epsilon }); const my = field({ x: point.x, y: point.y - epsilon }); return [(px.x - mx.x) / (2 * epsilon), (py.x - my.x) / (2 * epsilon), (px.y - mx.y) / (2 * epsilon), (py.y - my.y) / (2 * epsilon)]; }
export function complexMultiply(a: Vec2, b: Vec2): Vec2 { return { x: a.x * b.x - a.y * b.y, y: a.x * b.y + a.y * b.x }; }
export type SeededTransformMode = "complex numbers" | "Euler formula" | "eigenvectors" | "Jacobian" | "determinant" | "matrix transformations";
export type SeededTransformProfile = { angle: number; scale: number };
export function seededTransformProfile(seed: number): SeededTransformProfile { const profile = advancedSeedProfile(seed); return { angle: profile.rotation, scale: profile.scale }; }
export function seededTransformOutput(mode: SeededTransformMode, angle: number, scale: number): { output: Vec2; measure: number; target: number } {
  const radians = angle * Math.PI / 180;
  const output = mode === "complex numbers" || mode === "Euler formula" ? { x: Math.cos(radians) * scale, y: Math.sin(radians) * scale } : { x: Math.cos(radians) * scale + .2 * Math.sin(radians), y: Math.sin(radians) * scale };
  const magnitude = Math.hypot(output.x, output.y);
  const measure = mode === "eigenvectors" ? Math.abs(Math.atan2(output.y, output.x) - radians) * 180 / Math.PI : mode === "Jacobian" ? magnitude : mode === "determinant" ? scale : magnitude;
  const target = mode === "eigenvectors" ? 0 : mode === "Jacobian" ? 1 : mode === "determinant" ? 1.5 : mode === "complex numbers" ? 2 : 1;
  return { output, measure, target };
}

export function discreteSpectrum(samples: number[]): number[] { const n = samples.length; return Array.from({ length: n }, (_, k) => { let real = 0; let imaginary = 0; for (let t = 0; t < n; t++) { const angle = 2 * Math.PI * k * t / n; real += samples[t] * Math.cos(angle); imaginary -= samples[t] * Math.sin(angle); } return Math.hypot(real, imaginary) / n; }); }
export type SeededSignalDefaults = { birdTarget: number; machine: number };
export function seededSignalDefaults(seed: number): SeededSignalDefaults { const value = Math.abs(Math.floor(seed)); return { birdTarget: 50 + (value % 10) * 8, machine: 20 + (value % 7) * 9 }; }
export type SeededSignalProfile = { birdTarget: number; machine: number; residualNoise: number; purity: number; samples: number[]; spectrum: number[] };
export function seededSignalProfile(seed: number, bird: number, filterStrength: number): SeededSignalProfile {
  const value = Math.abs(Math.floor(seed)); const { birdTarget, machine } = seededSignalDefaults(seed); const residualNoise = machine * (1 - filterStrength / 100); const samples = Array.from({ length: 16 }, (_, index) => Math.sin(index * bird / 35) + residualNoise / 100 * Math.sin(index * (5 + value % 4) / 3)); const spectrum = discreteSpectrum(samples); const purity = Math.max(0, Math.min(100, 100 - residualNoise * .75 - Math.abs(bird - birdTarget) * .08)); return { birdTarget, machine, residualNoise, purity, samples, spectrum };
}
export type GraphEdge = { from: number; to: number; weight: number };
export function shortestPath(nodeCount: number, edges: GraphEdge[], start: number, end: number): number { const distances = Array.from({ length: nodeCount }, () => Infinity); distances[start] = 0; for (let pass = 0; pass < nodeCount - 1; pass++) for (const edge of edges) distances[edge.to] = Math.min(distances[edge.to], distances[edge.from] + edge.weight); return distances[end]; }
export function selectedPathWeight(nodeCount: number, edges: GraphEdge[], selectedIndices: number[], start: number, end: number): number { return shortestPath(nodeCount, selectedIndices.map(index => edges[index]).filter((edge): edge is GraphEdge => Boolean(edge)), start, end); }
export function seededGraphEdges(seed: number): GraphEdge[] { const value = Math.abs(Math.floor(seed)); const bias = advancedSeedProfile(seed).edgeBias; return [{ from: 0, to: 1, weight: 1 + bias % 4 }, { from: 1, to: 3, weight: 2 + (value >> 1) % 5 }, { from: 0, to: 2, weight: 1 + (value >> 2) % 4 }, { from: 2, to: 3, weight: 3 + (value >> 3) % 6 }, { from: 1, to: 2, weight: 1 + (value >> 4) % 4 }]; }
export function monteCarloEstimate(trials: number, sample: () => boolean): number { let successes = 0; for (let index = 0; index < Math.max(1, trials); index++) if (sample()) successes++; return successes / Math.max(1, trials); }
export type SeededProbabilityProfile = { target: number; estimate: number; outcomes: boolean[]; accurate: boolean };
export function seededProbabilityProfile(seed: number, trials: number, offset = 0): SeededProbabilityProfile {
  const value = Math.abs(Math.floor(seed)); const target = advancedSeedProfile(seed).probability; const outcomes = Array.from({ length: Math.max(1, Math.floor(trials)) }, (_, index) => ((index + offset + value) % 10) < Math.round(target * 10)); const estimate = outcomes.filter(Boolean).length / outcomes.length; return { target, estimate, outcomes, accurate: Math.abs(estimate - target) < .08 };
}
export function triangleArea(a: Vec2, b: Vec2, c: Vec2): number { return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2); }
export function seededGeometryTarget(seed: number, fallback = 6): number { return fallback + (Math.abs(Math.floor(seed)) % 3) * .5; }
export function polygonArea(path: Vec2[]): number { if (path.length < 3) return 0; let twiceArea = 0; for (let index = 0; index < path.length; index++) { const current = path[index]; const next = path[(index + 1) % path.length]; twiceArea += current.x * next.y - next.x * current.y; } return Math.abs(twiceArea) / 2; }
