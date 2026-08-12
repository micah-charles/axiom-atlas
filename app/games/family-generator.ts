import { LEARNING_LAYERS } from "../lib/campaign.ts";
import type { LearningLayer, LearningLayerId } from "../lib/campaign.ts";
import { FAMILY_WORLD_IDS } from "./world-registry.ts";
import type { WorldId } from "./world-registry.ts";

export type FamilyWorldId = Exclude<WorldId, "bubble" | "tree" | "parabola">;

export type FamilyLevel = {
  id: string;
  world: FamilyWorldId;
  layer: LearningLayerId;
  layerIndex: number;
  sequence: number;
  seed: number;
  name: string;
  subtitle: string;
  targetMoves: number;
  hintLimit: number;
  mistakeLimit?: number;
  generated: true;
  prompt: string;
  instruction: string;
  startLabel: string;
  targetLabel: string;
  tokens: string[];
  solution: string[];
  hint: string;
  visual: "dock" | "forge" | "cargo" | "balance" | "beam" | "routes" | "guardians" | "metro" | "robot" | "ruins" | "cipher" | "proof";
  facts?: string[];
};

const SALTS: Record<FamilyWorldId, number> = {
  lab: 0x1ab, arithmetic: 0xa71, fractions: 0xf12, equations: 0xe91,
  geometry: 0x6e0, probability: 0xb4b, logic: 0x1061, graphs: 0x6a4,
  algorithms: 0xa160, sequences: 0x5e9, ciphers: 0xc1f, infinity: 0x1f1,
};

const NAMES: Record<FamilyWorldId, string[]> = {
  lab: ["First Contact", "Magnetic Dock", "Split Signal", "Weight of Equality", "Trace Protocol", "Rotation Gate", "Connection Field", "Prediction Chamber"],
  arithmetic: ["Ember Chain", "Hammer Rhythm", "Molten Target", "Prime Anvil", "Bracket Crucible", "Negative Flame", "Power Bellows", "Masterwork"],
  fractions: ["First Cargo", "Equal Holds", "Tide Ratio", "Shared Vessel", "Percent Passage", "Improper Waters", "Scaled Fleet", "Harbormaster"],
  equations: ["Balanced Gate", "Twin Towers", "Unknown Guard", "Inverse Key", "Variable Rampart", "Bracket Bastion", "Inequality Wall", "Citadel Crown"],
  geometry: ["Bridge Beam", "Angle Keep", "Mirror Hall", "Area Court", "Rotation Tower", "Circle Foundry", "Vector Road", "Royal Span"],
  probability: ["First Voyage", "Risky Cargo", "Fair Dice", "Weather Route", "Expected Fortune", "Sampling Bay", "Variance Storm", "Captain's Wager"],
  logic: ["Whispering Path", "Two Guardians", "Truth Grove", "XOR Clearing", "Implication Trail", "Constraint Hollow", "Deduction Maze", "Oracle Tree"],
  graphs: ["First Line", "Transfer Point", "Weighted Route", "Broken Track", "Breadth Line", "Depth Tunnel", "Spanning Network", "Metro Crown"],
  algorithms: ["First Robot", "Parcel Turn", "Loop District", "Conditional Crossroad", "Function Block", "Search Grid", "Recursive Tower", "Automation Core"],
  sequences: ["First Stones", "Sunstep Pattern", "Geometric Dunes", "Fibonacci Shrine", "Pascal Ruin", "Difference Temple", "Recurrence Vault", "Desert Law"],
  ciphers: ["First Shift", "Caesar Current", "Binary Beacon", "Modulo Reef", "XOR Tide", "Prime Key", "Frequency Storm", "Private Isle"],
  infinity: ["First Lemma", "Prime Signal", "Limit Lens", "Fractal Mirror", "Combinatoric Sky", "Paradox Field", "Proof Chamber", "Infinite Synthesis"],
};

function hashText(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

function rng(seed: number) {
  let state = seed >>> 0;
  return () => { state += 0x6d2b79f5; let value = state; value = Math.imul(value ^ value >>> 15, value | 1); value ^= value + Math.imul(value ^ value >>> 7, value | 61); return ((value ^ value >>> 14) >>> 0) / 4294967296; };
}

function integer(random: () => number, min: number, max: number) { return Math.floor(random() * (max - min + 1)) + min; }
function unique(values: string[]) { return [...new Set(values)]; }
function seedFor(world: FamilyWorldId, layer: LearningLayerId, sequence: number, run = 0) { return (SALTS[world] ^ hashText(layer) ^ Math.imul(sequence + 1, 2654435761) ^ Math.imul(run + 1, 2246822519)) >>> 0; }
function shuffle<T>(items: T[], random: () => number) { for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } return items; }

type PuzzleShape = Omit<FamilyLevel, "id" | "world" | "layer" | "layerIndex" | "sequence" | "seed" | "name" | "subtitle" | "targetMoves" | "hintLimit" | "mistakeLimit" | "generated">;

function puzzle(world: FamilyWorldId, layer: LearningLayer, sequence: number, random: () => number): PuzzleShape {
  const depth = Math.min(3, 1 + Math.floor((layer.order + sequence) / 4));
  if (world === "lab") {
    const actions = ["TAP", "DRAG", "ROTATE", "CONNECT", "SPLIT", "COMBINE", "TRACE", "PREDICT"];
    const solution = actions.slice(sequence % 4, sequence % 4 + depth);
    return { prompt: "Wake the Axiom Core", instruction: "Build the interaction protocol shown by the signal rings.", startLabel: "CORE ASLEEP", targetLabel: solution.join(" → "), tokens: shuffle(unique([...solution, ...actions.slice(0, 5)]), random), solution, hint: "Read the rings from the centre outward.", visual: "dock" };
  }
  if (world === "arithmetic") {
    const start = integer(random, 2, 9); const op1 = integer(random, 0, 1) ? `+${integer(random, 2, 8)}` : `×${integer(random, 2, 4)}`; const after1 = op1[0] === "+" ? start + Number(op1.slice(1)) : start * Number(op1.slice(1)); const op2 = layer.order > 2 ? `−${integer(random, 1, Math.max(1, after1 - 2))}` : `+${integer(random, 1, 6)}`; const target = op2[0] === "−" ? after1 - Number(op2.slice(1)) : after1 + Number(op2.slice(1)); const solution = [op1, op2];
    return { prompt: `Forge ${target}`, instruction: "Send the starting ingot through the machine chain.", startLabel: String(start), targetLabel: String(target), tokens: shuffle(unique([...solution, "+1", "×2", "−2", "+5"]), random), solution, hint: `The first machine turns ${start} into ${after1}.`, visual: "forge" };
  }
  if (world === "fractions") {
    const denominators = [4, 6, 8, 10, 12]; const d = denominators[(sequence + layer.order) % denominators.length]; const n = integer(random, 1, d - 1); const multiplier = integer(random, 2, 4); const answer = `${n * multiplier}/${d * multiplier}`; const solution = [answer];
    return { prompt: `Load cargo equal to ${n}/${d}`, instruction: "Choose the differently divided hold with exactly the same capacity.", startLabel: `${n}/${d}`, targetLabel: "EQUIVALENT HOLD", tokens: shuffle(unique([answer, `${n}/${d * multiplier}`, `${n + 1}/${d}`, `${n * multiplier + 1}/${d * multiplier}`]), random), solution, hint: "Multiply the numerator and denominator by the same number.", visual: "cargo", facts: [`${Math.round(n / d * 100)}% of the hold`] };
  }
  if (world === "equations") {
    const x = integer(random, 2, 12); const coefficient = layer.order >= 3 ? integer(random, 2, 4) : 1; const add = integer(random, 2, 9); const total = coefficient * x + add; const solution = coefficient === 1 ? [`−${add}`] : [`−${add}`, `÷${coefficient}`];
    return { prompt: `${coefficient === 1 ? "x" : coefficient + "x"} + ${add} = ${total}`, instruction: "Apply inverse operations to both towers without breaking equality.", startLabel: "BALANCED", targetLabel: `x = ${x}`, tokens: shuffle(unique([...solution, `+${add}`, `×${coefficient}`, "÷2", "−1"]), random), solution, hint: `Undo +${add} first, on both sides.`, visual: "balance" };
  }
  if (world === "geometry") {
    const target = [30, 45, 60, 90, 120, 135][(sequence + layer.order) % 6]; const solution = [`ROTATE ${target}°`];
    return { prompt: `Complete the ${target}° span`, instruction: "Rotate the beam until its angle locks into the bridge socket.", startLabel: "0°", targetLabel: `${target}°`, tokens: shuffle([solution[0], `ROTATE ${Math.max(15, target - 15)}°`, `ROTATE ${Math.min(165, target + 15)}°`, `REFLECT ${target}°`], random), solution, hint: "Match the beam to the illuminated guide line.", visual: "beam" };
  }
  if (world === "probability") {
    const routes = [{ name: "NORTH", p: 70, reward: 40 }, { name: "EAST", p: 50, reward: 70 }, { name: "SOUTH", p: 20, reward: 180 }].map((route, i) => ({ ...route, reward: route.reward + (sequence % 3) * (i + 2) })); const best = [...routes].sort((a, b) => b.p * b.reward - a.p * a.reward)[0]; const solution = [best.name];
    return { prompt: "Choose the strongest long-run route", instruction: "Compare success chance × reward, then launch one ship.", startLabel: "CARGO READY", targetLabel: "BEST EXPECTED VALUE", tokens: shuffle(routes.map(r => r.name), random), solution, hint: `${best.name} has the greatest probability-weighted reward.`, visual: "routes", facts: routes.map(r => `${r.name}: ${r.p}% × ${r.reward}`) };
  }
  if (world === "logic") {
    const safe = ["BLUE", "GREEN", "GOLD"][(sequence + layer.order) % 3]; const solution = [safe]; const other = safe === "BLUE" ? "GREEN" : "BLUE";
    return { prompt: "Find the safe path", instruction: "One guardian tells truth; the other lies. Deduce the only consistent gate.", startLabel: "A: “The safe path is " + safe + ".”", targetLabel: "B: “A is lying.”", tokens: shuffle(["BLUE", "GREEN", "GOLD"], random), solution, hint: `The silver-leaf guardian is truthful, so test ${safe}.`, visual: "guardians", facts: ["The truthful guardian wears a silver leaf.", "Guardian A wears the silver leaf.", `The third path is not ${other}.`] };
  }
  if (world === "graphs") {
    const variant = sequence % 3; const solution = variant === 0 ? ["B", "E", "F"] : variant === 1 ? ["D", "E", "F"] : ["B", "C", "F"];
    const maps = [
      ["A–B 2 · B–E 2 · E–F 1", "A–D 4 · D–E 3", "B–C 4 · C–F 4"],
      ["A–D 1 · D–E 2 · E–F 2", "A–B 4 · B–C 3 · C–F 2", "B–E 5"],
      ["A–B 1 · B–C 2 · C–F 1", "A–D 3 · D–E 3 · E–F 2", "B–E 6"],
    ];
    return { prompt: "Route A → F", instruction: "Build the minimum-time journey one station at a time.", startLabel: "A", targetLabel: "F", tokens: shuffle(["B", "C", "D", "E", "F"], random), solution, hint: `The fastest first transfer is ${solution[0]}.`, visual: "metro", facts: maps[variant] };
  }
  if (world === "algorithms") {
    const patterns = [["MOVE", "MOVE", "PICK"], ["MOVE", "TURN", "MOVE", "DROP"], ["REPEAT 3", "TURN", "PICK"]]; const solution = patterns[sequence % patterns.length].slice(0, Math.min(patterns[sequence % patterns.length].length, depth + 1));
    return { prompt: "Deliver the parcel", instruction: "Program the robot with the shortest valid command stream.", startLabel: "ROBOT", targetLabel: "PARCEL BAY", tokens: shuffle(unique([...solution, "MOVE", "TURN", "PICK", "DROP", "REPEAT 3"]), random), solution, hint: `The first command is ${solution[0]}.`, visual: "robot" };
  }
  if (world === "sequences") {
    const kind = sequence % 4;
    let series: number[]; let rule: string;
    if (kind === 0) { const step = integer(random, 2, 7); const first = integer(random, 1, 8); series = Array.from({ length: 5 }, (_, i) => first + step * i); rule = `Add ${step}`; }
    else if (kind === 1) { const factor = integer(random, 2, 3); const first = integer(random, 1, 3); series = Array.from({ length: 5 }, (_, i) => first * factor ** i); rule = `Multiply by ${factor}`; }
    else if (kind === 2) { const a = integer(random, 1, 4); const b = integer(random, 2, 5); series = [a, b]; while (series.length < 5) series.push(series.at(-1)! + series.at(-2)!); rule = "Add the previous two stones"; }
    else { const offset = integer(random, 0, 3); series = Array.from({ length: 5 }, (_, i) => (i + 1) ** 2 + offset); rule = `Square numbers${offset ? `, then add ${offset}` : ""}`; }
    const answer = String(series[4]); const solution = [answer];
    return { prompt: `${series.slice(0, 4).join("  ·  ")}  ·  ?`, instruction: "Place the missing stone into the ruin mechanism.", startLabel: kind === 0 ? "ARITHMETIC" : kind === 1 ? "GEOMETRIC" : kind === 2 ? "RECURRENCE" : "VISUAL SQUARES", targetLabel: "RESTORE PATTERN", tokens: shuffle(unique([answer, String(series[3] + 1), String(Math.max(0, series[4] - 2)), String(series[3] * 2)]), random), solution, hint: rule + ".", visual: "ruins" };
  }
  if (world === "ciphers") {
    if (sequence === 4) {
      const solution = ["BINARY", "HI"];
      return { prompt: "01101000 01101001", instruction: "Choose the number system, then transmit the decoded message.", startLabel: "8-BIT SIGNAL", targetLabel: "PLAINTEXT", tokens: shuffle(["BINARY", "DECIMAL", "HI", "AX"], random), solution, hint: "Read each group as an 8-bit character.", visual: "cipher" };
    }
    if (sequence === 5) {
      const solution = ["MOD 26", "KEY 7"];
      return { prompt: "Rotate 33 positions", instruction: "Reduce the rotation, then set the equivalent alphabet key.", startLabel: "33", targetLabel: "KEY 7", tokens: shuffle(["MOD 26", "MOD 10", "KEY 7", "KEY 6"], random), solution, hint: "33 leaves remainder 7 after complete turns of 26.", visual: "cipher" };
    }
    if (sequence === 6) {
      const solution = ["XOR", "1010"];
      return { prompt: "1111 ⊕ 0101", instruction: "Select the bitwise gate, then transmit its result.", startLabel: "1111 / 0101", targetLabel: "BIT STREAM", tokens: shuffle(["XOR", "AND", "1010", "0101"], random), solution, hint: "XOR lights a bit when the inputs differ.", visual: "cipher" };
    }
    const shift = 1 + (sequence + layer.order) % 8; const plain = ["AXIOM", "LOGIC", "PRIME", "GRAPH"][sequence % 4]; const encoded = [...plain].map(char => String.fromCharCode(65 + (char.charCodeAt(0) - 65 + shift) % 26)).join(""); const solution = [`SHIFT −${shift}`, plain];
    return { prompt: `Intercepted: ${encoded}`, instruction: "Set the inverse shift, then transmit the decoded word.", startLabel: encoded, targetLabel: "PLAINTEXT", tokens: shuffle(unique([`SHIFT −${shift}`, `SHIFT +${shift}`, plain, "MATHS", "ATLAS"]), random), solution, hint: `The sender shifted every letter forward by ${shift}.`, visual: "cipher" };
  }
  const conclusions = ["Even + even is even", "There are infinitely many primes", "A tree with n nodes has n−1 edges", "The angles of a triangle total 180°"];
  const conclusion = conclusions[sequence % conclusions.length]; const solution = ["GIVEN", "OBSERVATION", "LEMMA", "CONCLUSION"];
  return { prompt: `Prove: ${conclusion}`, instruction: "Arrange the proof lenses so every claim follows from the last.", startLabel: "QUESTION", targetLabel: conclusion, tokens: shuffle([...solution], random), solution, hint: "A proof begins with what is given and ends with the conclusion.", visual: "proof" };
}

export function generateFamilyLevel(world: FamilyWorldId, layer: LearningLayer, sequence: number, run = 0): FamilyLevel {
  const seed = seedFor(world, layer.id, sequence, run); const random = rng(seed); const shape = puzzle(world, layer, sequence, random);
  return { id: `${world}-${layer.id}-${String(sequence + 1).padStart(2, "0")}${run ? `-${run}` : ""}`, world, layer: layer.id, layerIndex: layer.order - 1, sequence, seed, name: NAMES[world][sequence % 8], subtitle: layer.promise, targetMoves: shape.solution.length, hintLimit: layer.hintLimit, mistakeLimit: layer.mistakeLimit, generated: true, ...shape };
}

export const FAMILY_LEVELS = Object.fromEntries(FAMILY_WORLD_IDS.map(world => [world, LEARNING_LAYERS.flatMap(layer => Array.from({ length: 8 }, (_, sequence) => generateFamilyLevel(world, layer, sequence)))])) as Record<FamilyWorldId, FamilyLevel[]>;

export function generateFamilyEndless(world: FamilyWorldId, run: number): FamilyLevel {
  const level = generateFamilyLevel(world, LEARNING_LAYERS[2], run % 8, run + 1000);
  return { ...level, id: `${world}-endless-${run}`, name: `Endless Expedition ${run + 1}`, subtitle: `Seed ${level.seed}` };
}

export const FAMILY_CAMPAIGN_COUNT = FAMILY_WORLD_IDS.length * LEARNING_LAYERS.length * 8;
