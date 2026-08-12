export type Vec2 = { x: number; y: number };
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
};

export const ADVANCED_LEVEL_CATALOG: AdvancedLevelDefinition[] = [
  { id: "water-valley-01", world: "Water Valley", concept: "integration", engine: "curve", act: "experience", objective: "Fill the lower reservoir before the village gate opens.", tools: ["timeController", "measurementMarker", "riemannApproximation"], goal: { type: "accumulate", target: 420 }, revealNotationAfterCompletion: true },
  { id: "mountain-racer-01", world: "Mountain Racer", concept: "derivative", engine: "curve", act: "experience", objective: "Find the point where the road is steepest.", tools: ["movableProbe", "secantTool", "tangentTool"], goal: { type: "maxSlope", moveLimit: 14 }, revealNotationAfterCompletion: true },
  { id: "gradient-expedition-01", world: "Gradient Expedition", concept: "gradient", engine: "field", act: "control", objective: "Reach the summit using the fewest steps.", tools: ["altimeter", "directionalSlopeProbe", "compass"], goal: { type: "reachMaximum", moveLimit: 14 }, revealNotationAfterCompletion: true },
  { id: "vector-field-01", world: "Vector Field", concept: "divergence", engine: "field", act: "measure", objective: "Locate the hidden air leak.", tools: ["particleTracer", "circularSensor"], goal: { type: "locateMaxDivergence" }, revealNotationAfterCompletion: true },
  { id: "vector-field-02", world: "Vector Field", concept: "curl", engine: "field", act: "measure", objective: "Find the strongest whirlpool.", tools: ["particleTracer", "floatingWheel"], goal: { type: "locateMaxCurl" }, revealNotationAfterCompletion: true },
  { id: "field-sailing-01", world: "Field Sailing", concept: "line integral", engine: "flow", act: "control", objective: "Reach the beacon while harvesting at least 500 energy.", tools: ["pathDrawer", "energyGauge"], goal: { type: "pathEnergy", target: 500 }, revealNotationAfterCompletion: true },
  { id: "solar-shield-01", world: "Solar Shield", concept: "surface integral", engine: "flow", act: "control", objective: "Generate 8 MW inside the safe orientation zone.", tools: ["panelRotator", "fluxGauge"], goal: { type: "flux", target: 8 }, revealNotationAfterCompletion: true },
  { id: "island-circulation-01", world: "Island Mystery", concept: "Stokes theorem", engine: "flow", act: "generalise", objective: "Infer the broken interior sensor from boundary circulation.", tools: ["boundaryRoute", "circulationGauge"], goal: { type: "stokesInference" }, revealNotationAfterCompletion: true },
  { id: "ecosystem-01", world: "Living Ecosystem", concept: "differential equations", engine: "dynamic", act: "experience", objective: "Keep rabbits between 200 and 500 for 60 months.", tools: ["foodControl", "habitatControl", "shockControl"], goal: { type: "stabilisePopulation", target: 60 }, revealNotationAfterCompletion: true },
  { id: "spring-bridge-01", world: "Spring Bridge", concept: "second-order differential equations", engine: "dynamic", act: "control", objective: "Settle the bridge in under 4 seconds without overshooting 5%.", tools: ["massControl", "stiffnessControl", "dampingControl"], goal: { type: "settleOscillation", target: 4 }, revealNotationAfterCompletion: true },
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

export const ADVANCED_ACTS: { id: AdvancedAct; label: string; instruction: string }[] = [
  { id: "experience", label: "Act 1 · Experience", instruction: "Observe the phenomenon before naming it." },
  { id: "control", label: "Act 2 · Control", instruction: "Change one system input and watch the world respond." },
  { id: "measure", label: "Act 3 · Measure", instruction: "Use an instrument to compare numerical readings." },
  { id: "generalise", label: "Act 4 · Generalise", instruction: "Apply the same rule in a new situation." },
  { id: "name", label: "Act 5 · Name", instruction: "Reveal the formal notation after the discovery." },
];

export const ADVANCED_CAMPAIGN: AdvancedLevelDefinition[] = ADVANCED_LEVEL_CATALOG.flatMap(level => ADVANCED_ACTS.map(act => ({
  ...level,
  id: `${level.id}-${act.id}`,
  act: act.id,
  objective: `${act.label}: ${level.objective}`,
})));

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
export function closedPath(path: Vec2[]): Vec2[] { if (path.length < 2) return path; const first = path[0]; const last = path[path.length - 1]; return first.x === last.x && first.y === last.y ? path : [...path, first]; }

export type PopulationState = { rabbits: number; foxes: number };
export function lotkaVolterraStep(state: PopulationState, dt: number, params = { birth: 1, predation: .01, growth: .005, death: .8 }): PopulationState { const rabbits = state.rabbits + (params.birth * state.rabbits - params.predation * state.rabbits * state.foxes) * dt; const foxes = state.foxes + (params.growth * state.rabbits * state.foxes - params.death * state.foxes) * dt; return { rabbits: Math.max(0, rabbits), foxes: Math.max(0, foxes) }; }
export type SpringState = { position: number; velocity: number };
export function springStep(state: SpringState, dt: number, mass: number, stiffness: number, damping: number): SpringState { const acceleration = (-stiffness * state.position - damping * state.velocity) / mass; return { position: state.position + state.velocity * dt, velocity: state.velocity + acceleration * dt }; }

export function multiplyMatrix(a: Matrix2, b: Matrix2): Matrix2 { return [a[0] * b[0] + a[1] * b[2], a[0] * b[1] + a[1] * b[3], a[2] * b[0] + a[3] * b[2], a[2] * b[1] + a[3] * b[3]]; }
export function applyMatrix(matrix: Matrix2, point: Vec2): Vec2 { return { x: matrix[0] * point.x + matrix[1] * point.y, y: matrix[2] * point.x + matrix[3] * point.y }; }
export function determinant(matrix: Matrix2): number { return matrix[0] * matrix[3] - matrix[1] * matrix[2]; }
export function complexMultiply(a: Vec2, b: Vec2): Vec2 { return { x: a.x * b.x - a.y * b.y, y: a.x * b.y + a.y * b.x }; }

export function discreteSpectrum(samples: number[]): number[] { const n = samples.length; return Array.from({ length: n }, (_, k) => { let real = 0; let imaginary = 0; for (let t = 0; t < n; t++) { const angle = 2 * Math.PI * k * t / n; real += samples[t] * Math.cos(angle); imaginary -= samples[t] * Math.sin(angle); } return Math.hypot(real, imaginary) / n; }); }
export type GraphEdge = { from: number; to: number; weight: number };
export function shortestPath(nodeCount: number, edges: GraphEdge[], start: number, end: number): number { const distances = Array.from({ length: nodeCount }, () => Infinity); distances[start] = 0; for (let pass = 0; pass < nodeCount - 1; pass++) for (const edge of edges) distances[edge.to] = Math.min(distances[edge.to], distances[edge.from] + edge.weight); return distances[end]; }
export function monteCarloEstimate(trials: number, sample: () => boolean): number { let successes = 0; for (let index = 0; index < Math.max(1, trials); index++) if (sample()) successes++; return successes / Math.max(1, trials); }
export function triangleArea(a: Vec2, b: Vec2, c: Vec2): number { return Math.abs((a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2); }
