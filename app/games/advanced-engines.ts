export type Vec2 = { x: number; y: number };
export type Vec3 = { x: number; y: number; z: number };
export type Matrix2 = [number, number, number, number];

export type AdvancedEngine = "curve" | "field" | "flow" | "dynamic" | "transformation" | "plane" | "signal" | "graph" | "probability" | "geometry";
export type AdvancedAct = "experience" | "control" | "measure" | "generalise" | "name";

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

export const ADVANCED_LEVEL_CATALOG: AdvancedLevelDefinition[] = [
  { id: "water-valley-01", world: "Water Valley", concept: "integration", engine: "curve", act: "experience", objective: "Fill the lower reservoir before the village gate opens.", tools: ["timeController", "measurementMarker", "riemannApproximation"], goal: { type: "accumulate", target: 420 }, revealNotationAfterCompletion: true },
  { id: "mountain-racer-01", world: "Mountain Racer", concept: "derivative", engine: "curve", act: "experience", objective: "Find the point where the road is steepest.", tools: ["movableProbe", "secantTool", "tangentTool"], goal: { type: "maxSlope", moveLimit: 14 }, revealNotationAfterCompletion: true },
  { id: "gradient-expedition-01", world: "Gradient Expedition", concept: "gradient", engine: "field", act: "control", objective: "Reach the summit using the fewest steps.", tools: ["altimeter", "directionalSlopeProbe", "compass"], goal: { type: "reachMaximum", moveLimit: 14 }, revealNotationAfterCompletion: true },
  { id: "gradient-expedition-02", world: "Gradient Expedition", concept: "partial derivatives", engine: "field", act: "measure", objective: "Compare east-west and north-south height changes at the same point.", tools: ["lockedHeading", "altimeter", "differenceMeter"], goal: { type: "comparePartialRates" }, revealNotationAfterCompletion: true },
  { id: "vector-field-01", world: "Vector Field", concept: "divergence", engine: "field", act: "measure", objective: "Locate the hidden air leak.", tools: ["particleTracer", "circularSensor"], goal: { type: "locateMaxDivergence" }, revealNotationAfterCompletion: true },
  { id: "vector-field-02", world: "Vector Field", concept: "curl", engine: "field", act: "measure", objective: "Find the strongest whirlpool.", tools: ["particleTracer", "floatingWheel"], goal: { type: "locateMaxCurl" }, revealNotationAfterCompletion: true },
  { id: "field-sailing-01", world: "Field Sailing", concept: "line integral", engine: "flow", act: "control", objective: "Reach the beacon while harvesting at least 500 energy.", tools: ["pathDrawer", "energyGauge"], goal: { type: "pathEnergy", target: 500 }, revealNotationAfterCompletion: true },
  { id: "solar-shield-01", world: "Solar Shield", concept: "surface integral", engine: "flow", act: "control", objective: "Generate 8 MW inside the safe orientation zone.", tools: ["panelRotator", "fluxGauge"], goal: { type: "flux", target: 8 }, revealNotationAfterCompletion: true },
  { id: "island-circulation-01", world: "Island Mystery", concept: "Stokes theorem", engine: "flow", act: "generalise", objective: "Infer the broken interior sensor from boundary circulation.", tools: ["boundaryRoute", "circulationGauge"], goal: { type: "stokesInference" }, revealNotationAfterCompletion: true },
  { id: "ecosystem-01", world: "Living Ecosystem", concept: "differential equations", engine: "dynamic", act: "experience", objective: "Keep rabbits between 200 and 500 for 60 months.", tools: ["foodControl", "habitatControl", "shockControl"], goal: { type: "stabilisePopulation", target: 60 }, revealNotationAfterCompletion: true },
  { id: "spring-bridge-01", world: "Spring Bridge", concept: "second-order differential equations", engine: "dynamic", act: "control", objective: "Settle the bridge in under 4 seconds without overshooting 5%.", tools: ["massControl", "stiffnessControl", "dampingControl"], goal: { type: "settleOscillation", target: 4 }, revealNotationAfterCompletion: true },
  { id: "chaos-observatory-01", world: "Chaos Observatory", concept: "chaotic dynamics", engine: "dynamic", act: "experience", objective: "Discover how a tiny parameter change reshapes the long-term orbit.", tools: ["growthDial", "orbitRecorder", "sensitivityMeter"], goal: { type: "compareTrajectories" }, revealNotationAfterCompletion: true },
  { id: "sound-observatory-01", world: "Sound Observatory", concept: "Fourier transform", engine: "signal", act: "measure", objective: "Remove machine noise while preserving the bird call.", tools: ["frequencyCrystals", "spectrumMeter"], goal: { type: "filterSignal" }, revealNotationAfterCompletion: true },
  { id: "crystal-chamber-01", world: "Crystal Chamber", concept: "matrix transformations", engine: "transformation", act: "control", objective: "Transform the blue symbol so it fits the doorway.", tools: ["rotationCrystal", "stretchCrystal", "shearCrystal"], goal: { type: "matchShape" }, revealNotationAfterCompletion: true },
  { id: "eigen-sanctum-01", world: "Eigen Sanctum", concept: "eigenvectors", engine: "transformation", act: "experience", objective: "Find the direction that survives the transformation.", tools: ["arrowProbes", "growthMeter"], goal: { type: "findInvariantDirection" }, revealNotationAfterCompletion: true },
  { id: "area-chamber-01", world: "Area Chamber", concept: "determinant", engine: "transformation", act: "measure", objective: "Measure how the transformation scales a unit square.", tools: ["unitSquare", "areaGauge"], goal: { type: "measureAreaScale" }, revealNotationAfterCompletion: true },
  { id: "teleport-gate-01", world: "Teleport Gate", concept: "Jacobian", engine: "transformation", act: "generalise", objective: "Calibrate the gate so a local reference grid aligns.", tools: ["zoomLens", "localGrid", "alignmentKnobs"], goal: { type: "localLinearise" }, revealNotationAfterCompletion: true },
  { id: "complex-plane-01", world: "Complex Plane", concept: "complex numbers", engine: "plane", act: "experience", objective: "Reach the crystal gate using multiplication portals.", tools: ["scalePortal", "rotationPortal", "complexCompass"], goal: { type: "reachGate" }, revealNotationAfterCompletion: true },
  { id: "complex-boss-01", world: "Complex Plane", concept: "Euler formula", engine: "plane", act: "name", objective: "Match circular motion to its sine and cosine projections.", tools: ["angleDial", "projectionMeter"], goal: { type: "matchWave" }, revealNotationAfterCompletion: true },
  { id: "network-garden-01", world: "Network Garden", concept: "graph paths", engine: "graph", act: "control", objective: "Connect the village gates using the shortest safe route.", tools: ["vertexPicker", "edgeToggler", "pathMeter"], goal: { type: "shortestPath", target: 7 }, revealNotationAfterCompletion: true },
  { id: "chance-casino-01", world: "Chance Casino", concept: "probability simulation", engine: "probability", act: "measure", objective: "Estimate the hidden bias from repeated draws.", tools: ["trialCounter", "outcomeSampler", "confidenceGauge"], goal: { type: "estimateProbability", target: .6 }, revealNotationAfterCompletion: true },
  { id: "geometry-workshop-01", world: "Geometry Workshop", concept: "geometry construction", engine: "geometry", act: "experience", objective: "Build a stable triangular bridge with the required area.", tools: ["vertexHandles", "angleGauge", "areaMeter"], goal: { type: "matchArea", target: 6 }, revealNotationAfterCompletion: true },
];

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

export type AdvancedSeedProfile = { seed: number; variant: number; amplitude: number; probability: number; fieldStrength: number; rotation: number; scale: number; edgeBias: number };
export function advancedSeedProfile(seed: number): AdvancedSeedProfile {
  const value = Math.abs(Math.floor(seed));
  return { seed: value, variant: value % 7 + 1, amplitude: 14 + value % 18, probability: Math.min(.85, .45 + (value % 9) * .04), fieldStrength: 1 + (value % 7) * .25, rotation: value % 90, scale: 1 + (value % 5) * .25, edgeBias: value % 5 };
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

export function secantSlope(value: (x: number) => number, a: number, b: number): number { return (value(b) - value(a)) / (b - a); }
export function tangentSlope(value: (x: number) => number, x: number, epsilon = 1e-4): number { return secantSlope(value, x - epsilon, x + epsilon); }
export function gaussianHeight(point: Vec2, peak: Vec2 = { x: 0, y: 0 }, spread = 4): number { const dx = point.x - peak.x; const dy = point.y - peak.y; return Math.exp(-(dx * dx + dy * dy) / spread); }

export type VectorField = (point: Vec2) => Vec2;
export function divergence(field: VectorField, point: Vec2, epsilon = 1e-3): number { const x = { x: point.x + epsilon, y: point.y }; const xm = { x: point.x - epsilon, y: point.y }; const y = { x: point.x, y: point.y + epsilon }; const ym = { x: point.x, y: point.y - epsilon }; return (field(x).x - field(xm).x + field(y).y - field(ym).y) / (2 * epsilon); }
export function curl(field: VectorField, point: Vec2, epsilon = 1e-3): number { const x = { x: point.x + epsilon, y: point.y }; const xm = { x: point.x - epsilon, y: point.y }; const y = { x: point.x, y: point.y + epsilon }; const ym = { x: point.x, y: point.y - epsilon }; return (field(x).y - field(xm).y - field(y).x + field(ym).x) / (2 * epsilon); }
export function lineIntegral(field: VectorField, path: Vec2[]): number { let total = 0; for (let i = 1; i < path.length; i++) { const a = path[i - 1]; const b = path[i]; const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; const dx = b.x - a.x; const dy = b.y - a.y; const vector = field(midpoint); total += vector.x * dx + vector.y * dy; } return total; }
export function polylineLength(path: Vec2[]): number { let total = 0; for (let i = 1; i < path.length; i++) total += Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y); return total; }
export function surfaceFlux(field: VectorField, normal: Vec2, area: number): number { return (field({ x: 0, y: 0 }).x * normal.x + field({ x: 0, y: 0 }).y * normal.y) * area; }
export function surfaceFlux3D(field: (point: Vec3) => Vec3, normal: Vec3, area: number, point: Vec3 = { x: 0, y: 0, z: 0 }): number { const vector = field(point); return (vector.x * normal.x + vector.y * normal.y + vector.z * normal.z) * area; }
export function closedPath(path: Vec2[]): Vec2[] { if (path.length < 2) return path; const first = path[0]; const last = path[path.length - 1]; return first.x === last.x && first.y === last.y ? path : [...path, first]; }
export type SeededFlowMode = "line integral" | "surface integral" | "Stokes theorem";
export function seededFlowReading(mode: SeededFlowMode, strength: number, route: Vec2[], control = 0, seed = 0): number {
  if (mode === "line integral") return lineIntegral(() => ({ x: strength, y: 0 }), route) * 25;
  if (mode === "surface integral") {
    const radians = control * Math.PI / 180;
    return surfaceFlux3D(() => ({ x: strength, y: 1.5, z: 6 + Math.abs(seed) % 4 }), { x: Math.sin(radians), y: 0, z: Math.cos(radians) }, 1);
  }
  return lineIntegral(point => ({ x: -point.y * strength, y: point.x * strength }), closedPath(route));
}

export type PopulationState = { rabbits: number; foxes: number };
export function lotkaVolterraStep(state: PopulationState, dt: number, params = { birth: 1, predation: .01, growth: .005, death: .8 }): PopulationState { const rabbits = state.rabbits + (params.birth * state.rabbits - params.predation * state.rabbits * state.foxes) * dt; const foxes = state.foxes + (params.growth * state.rabbits * state.foxes - params.death * state.foxes) * dt; return { rabbits: Math.max(0, rabbits), foxes: Math.max(0, foxes) }; }
export type SpringState = { position: number; velocity: number };
export function springStep(state: SpringState, dt: number, mass: number, stiffness: number, damping: number): SpringState { const acceleration = (-stiffness * state.position - damping * state.velocity) / mass; return { position: state.position + state.velocity * dt, velocity: state.velocity + acceleration * dt }; }
export function logisticMapStep(value: number, growth: number): number { return growth * value * (1 - value); }
export function logisticTrajectory(seed: number, growth: number, steps: number): number[] { const values: number[] = []; let value = Math.max(0, Math.min(1, seed)); for (let index = 0; index < Math.max(0, steps); index++) { values.push(value); value = logisticMapStep(value, growth); } return values; }
export function seededPopulationStep(state: PopulationState, control: number, seed: number, dt = .1): PopulationState { return lotkaVolterraStep(state, dt, { birth: control, predation: .006 + (Math.abs(seed) % 5) * .002, growth: .005, death: .7 + (Math.abs(seed) % 4) * .08 }); }
export function seededSpringStep(state: SpringState, damping: number, seed: number, dt = .1): SpringState { return springStep(state, dt, 1 + (Math.abs(seed) % 3) * .4, 2 + (Math.abs(seed) % 5) * .6, damping); }
export function seededChaosTrajectory(seed: number, growth: number, steps = 30): number[] { return logisticTrajectory(.12 + (Math.abs(seed) % 20) / 100, growth, steps); }

export function multiplyMatrix(a: Matrix2, b: Matrix2): Matrix2 { return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]]; }
export function applyMatrix(matrix: Matrix2, point: Vec2): Vec2 { return { x: matrix[0] * point.x + matrix[1] * point.y, y: matrix[2] * point.x + matrix[3] * point.y }; }
export function determinant(matrix: Matrix2): number { return matrix[0] * matrix[3] - matrix[1] * matrix[2]; }
export function jacobian(field: (point: Vec2) => Vec2, point: Vec2, epsilon = 1e-4): Matrix2 { const px = field({ x: point.x + epsilon, y: point.y }); const mx = field({ x: point.x - epsilon, y: point.y }); const py = field({ x: point.x, y: point.y + epsilon }); const my = field({ x: point.x, y: point.y - epsilon }); return [(px.x - mx.x) / (2 * epsilon), (py.x - my.x) / (2 * epsilon), (px.y - mx.y) / (2 * epsilon), (py.y - my.y) / (2 * epsilon)]; }
export function complexMultiply(a: Vec2, b: Vec2): Vec2 { return { x: a.x * b.x - a.y * b.y, y: a.x * b.y + a.y * b.x }; }
export type SeededTransformMode = "complex numbers" | "Euler formula" | "eigenvectors" | "Jacobian" | "determinant" | "matrix transformations";
export function seededTransformOutput(mode: SeededTransformMode, angle: number, scale: number): { output: Vec2; measure: number; target: number } {
  const radians = angle * Math.PI / 180;
  const output = mode === "complex numbers" || mode === "Euler formula" ? { x: Math.cos(radians) * scale, y: Math.sin(radians) * scale } : { x: Math.cos(radians) * scale + .2 * Math.sin(radians), y: Math.sin(radians) * scale };
  const magnitude = Math.hypot(output.x, output.y);
  const measure = mode === "eigenvectors" ? Math.abs(Math.atan2(output.y, output.x) - radians) * 180 / Math.PI : mode === "Jacobian" ? magnitude : mode === "determinant" ? scale : magnitude;
  const target = mode === "eigenvectors" ? 0 : mode === "Jacobian" ? 1 : mode === "determinant" ? 1.5 : mode === "complex numbers" ? 2 : 1;
  return { output, measure, target };
}

export function discreteSpectrum(samples: number[]): number[] { const n = samples.length; return Array.from({ length: n }, (_, k) => { let real = 0; let imaginary = 0; for (let t = 0; t < n; t++) { const angle = 2 * Math.PI * k * t / n; real += samples[t] * Math.cos(angle); imaginary -= samples[t] * Math.sin(angle); } return Math.hypot(real, imaginary) / n; }); }
export type SeededSignalProfile = { birdTarget: number; machine: number; residualNoise: number; purity: number; samples: number[]; spectrum: number[] };
export function seededSignalProfile(seed: number, bird: number, filterStrength: number): SeededSignalProfile {
  const value = Math.abs(Math.floor(seed)); const birdTarget = 50 + (value % 10) * 8; const machine = 20 + (value % 7) * 9; const residualNoise = machine * (1 - filterStrength / 100); const samples = Array.from({ length: 16 }, (_, index) => Math.sin(index * bird / 35) + residualNoise / 100 * Math.sin(index * (5 + value % 4) / 3)); const spectrum = discreteSpectrum(samples); const purity = Math.max(0, Math.min(100, 100 - residualNoise * .75 - Math.abs(bird - birdTarget) * .08)); return { birdTarget, machine, residualNoise, purity, samples, spectrum };
}
export type GraphEdge = { from: number; to: number; weight: number };
export function shortestPath(nodeCount: number, edges: GraphEdge[], start: number, end: number): number { const distances = Array.from({ length: nodeCount }, () => Infinity); distances[start] = 0; for (let pass = 0; pass < nodeCount - 1; pass++) for (const edge of edges) distances[edge.to] = Math.min(distances[edge.to], distances[edge.from] + edge.weight); return distances[end]; }
export function selectedPathWeight(nodeCount: number, edges: GraphEdge[], selectedIndices: number[], start: number, end: number): number { return shortestPath(nodeCount, selectedIndices.map(index => edges[index]).filter((edge): edge is GraphEdge => Boolean(edge)), start, end); }
export function seededGraphEdges(seed: number): GraphEdge[] { const value = Math.abs(Math.floor(seed)); return [{ from: 0, to: 1, weight: 1 + value % 4 }, { from: 1, to: 3, weight: 2 + (value >> 1) % 5 }, { from: 0, to: 2, weight: 1 + (value >> 2) % 4 }, { from: 2, to: 3, weight: 3 + (value >> 3) % 6 }, { from: 1, to: 2, weight: 1 + (value >> 4) % 4 }]; }
export function monteCarloEstimate(trials: number, sample: () => boolean): number { let successes = 0; for (let index = 0; index < Math.max(1, trials); index++) if (sample()) successes++; return successes / Math.max(1, trials); }
export type SeededProbabilityProfile = { target: number; estimate: number; outcomes: boolean[]; accurate: boolean };
export function seededProbabilityProfile(seed: number, trials: number, offset = 0): SeededProbabilityProfile {
  const value = Math.abs(Math.floor(seed)); const target = Math.min(.85, .45 + (value % 9) * .04); const outcomes = Array.from({ length: Math.max(1, Math.floor(trials)) }, (_, index) => ((index + offset + value) % 10) < Math.round(target * 10)); const estimate = outcomes.filter(Boolean).length / outcomes.length; return { target, estimate, outcomes, accurate: Math.abs(estimate - target) < .08 };
}
export function triangleArea(a: Vec2, b: Vec2, c: Vec2): number { return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2); }
export function polygonArea(path: Vec2[]): number { if (path.length < 3) return 0; let twiceArea = 0; for (let index = 0; index < path.length; index++) { const current = path[index]; const next = path[(index + 1) % path.length]; twiceArea += current.x * next.y - next.x * current.y; } return Math.abs(twiceArea) / 2; }
