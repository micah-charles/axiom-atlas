export type LearningLayerId = "discover" | "guided" | "practice" | "challenge" | "master";

export type LearningLayer = {
  id: LearningLayerId;
  order: number;
  name: string;
  glyph: string;
  promise: string;
  description: string;
  hintLimit: number;
  mistakeLimit?: number;
  moveMultiplier: number;
};

export const LEARNING_LAYERS: readonly LearningLayer[] = [
  { id: "discover", order: 1, name: "Discover", glyph: "◌", promise: "Notice the rule", description: "Experiment first. The world responds before it explains.", hintLimit: 0, moveMultiplier: 1.6 },
  { id: "guided", order: 2, name: "Guided", glyph: "✦", promise: "Name the rule", description: "Short prompts connect each physical move to its mathematical meaning.", hintLimit: 3, moveMultiplier: 1.5 },
  { id: "practice", order: 3, name: "Practice", glyph: "◇", promise: "Build fluency", description: "Normal play with optional escalating hints and varied configurations.", hintLimit: 3, moveMultiplier: 1.35 },
  { id: "challenge", order: 4, name: "Challenge", glyph: "△", promise: "Work under constraints", description: "Meet a move budget and correct your reasoning before the run ends.", hintLimit: 1, mistakeLimit: 2, moveMultiplier: 1.15 },
  { id: "master", order: 5, name: "Master", glyph: "♛", promise: "Think precisely", description: "No hints. One incorrect decision restarts the puzzle.", hintLimit: 0, mistakeLimit: 0, moveMultiplier: 1 },
] as const;

export type GeneratedLevelBase = {
  id: string;
  world: "bubble" | "tree" | "parabola";
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
};

export type BubbleCampaignLevel = GeneratedLevelBase & {
  world: "bubble";
  values: number[];
  stable: boolean;
  creatureMode: boolean;
};

export type TreeCampaignLevel = GeneratedLevelBase & {
  world: "tree";
  values: number[];
  duplicatePolicy: "right";
};

export type QuadraticParams = { a: number; h: number; k: number };
export type ParabolaCampaignLevel = GeneratedLevelBase & {
  world: "parabola";
  start: QuadraticParams;
  target: QuadraticParams;
  enabled: (keyof QuadraticParams)[];
  hideTargetEquation: boolean;
};

const WORLD_SALTS = { bubble: 0x51f15e, tree: 0x73ee, parabola: 0x9a4ab0 } as const;
const LEVELS_PER_LAYER = 8;

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function integer(random: () => number, min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  for (let index = items.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1));
    [items[index], items[target]] = [items[target], items[index]];
  }
  return items;
}

function seedFor(world: keyof typeof WORLD_SALTS, layer: LearningLayerId, sequence: number, run = 0): number {
  return (WORLD_SALTS[world] ^ hashText(layer) ^ Math.imul(sequence + 1, 2654435761) ^ Math.imul(run + 1, 2246822519)) >>> 0;
}

function inversions(values: number[]): number {
  let total = 0;
  for (let left = 0; left < values.length; left++) for (let right = left + 1; right < values.length; right++) if (values[left] > values[right]) total++;
  return total;
}

function bubbleComparisons(values: number[]): number {
  const work = [...values];
  let comparisons = 0;
  for (let end = work.length - 1; end > 0; end--) {
    let changed = false;
    for (let index = 0; index < end; index++) {
      comparisons++;
      if (work[index] > work[index + 1]) { [work[index], work[index + 1]] = [work[index + 1], work[index]]; changed = true; }
    }
    if (!changed) break;
  }
  return comparisons;
}

const NAMES = {
  bubble: ["First Light", "Market Chorus", "Lantern Current", "River of Orbs", "Gilded Procession", "Moonlit Exchange", "Stable Festival", "Royal Ascent"],
  tree: ["Seedling Path", "Branching Whisper", "Canopy Logic", "Rootbound Riddle", "Twin Blossoms", "Verdant Memory", "Ancient Grove", "Crown of Leaves"],
  parabola: ["Vertex Awakening", "Crystal Shift", "Arc of Dawn", "Valley Echo", "Mirror Chasm", "Gravity Well", "Royal Convergence", "Apex Crown"],
} as const;

function base<W extends GeneratedLevelBase["world"]>(world: W, layer: LearningLayer, sequence: number, seed: number, targetMoves: number): GeneratedLevelBase & { world: W } {
  return {
    id: `${world}-${layer.id}-${String(sequence + 1).padStart(2, "0")}`,
    world, layer: layer.id, layerIndex: layer.order - 1, sequence, seed,
    name: NAMES[world][sequence % NAMES[world].length],
    subtitle: layer.promise,
    targetMoves: Math.max(1, Math.ceil(targetMoves * layer.moveMultiplier)),
    hintLimit: layer.hintLimit,
    mistakeLimit: layer.mistakeLimit,
    generated: true,
  };
}

export function generateBubbleLevel(layer: LearningLayer, sequence: number, run = 0): BubbleCampaignLevel {
  const seed = seedFor("bubble", layer.id, sequence, run); const random = rng(seed);
  const count = Math.min(9, 4 + layer.order + Math.floor(sequence / 3));
  const stable = layer.order >= 3 && sequence % 4 === 2;
  const pool = Array.from({ length: count }, (_, index) => stable && index > 1 && index % 3 === 0 ? integer(random, 1, Math.max(3, count - 2)) : integer(random, 1, 9 + layer.order * 3));
  let values = shuffle(pool, random);
  if (inversions(values) === 0) values = [...values].reverse();
  return { ...base("bubble", layer, sequence, seed, bubbleComparisons(values)), values, stable, creatureMode: layer.order <= 2 };
}

export function generateTreeLevel(layer: LearningLayer, sequence: number, run = 0): TreeCampaignLevel {
  const seed = seedFor("tree", layer.id, sequence, run); const random = rng(seed);
  const count = Math.min(11, 5 + layer.order + Math.floor(sequence / 3));
  const allowDuplicates = layer.order >= 3 && sequence % 3 === 2;
  const values: number[] = [];
  while (values.length < count) {
    const value = integer(random, 1, 9 + layer.order * 4);
    if (allowDuplicates || !values.includes(value)) values.push(value);
  }
  const root = values[0];
  if (layer.order === 5 && sequence % 2 === 1) values.splice(0, values.length, ...shuffle([...values].sort((a, b) => a - b), random));
  else if (root === Math.min(...values) || root === Math.max(...values)) {
    const median = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    const medianIndex = values.indexOf(median);
    [values[0], values[medianIndex]] = [values[medianIndex], values[0]];
  }
  return { ...base("tree", layer, sequence, seed, count * 3), values, duplicatePolicy: "right" };
}

const A_VALUES = [-3, -2, -1.5, -1, -.5, .5, 1, 1.5, 2, 3];
export function generateParabolaLevel(layer: LearningLayer, sequence: number, run = 0): ParabolaCampaignLevel {
  const seed = seedFor("parabola", layer.id, sequence, run); const random = rng(seed);
  const enabled: (keyof QuadraticParams)[] = layer.order === 1 ? [sequence % 2 ? "h" : "k"] : layer.order === 2 ? ["h", "k"] : ["a", "h", "k"];
  const start: QuadraticParams = { a: 1, h: 0, k: 0 };
  const target: QuadraticParams = {
    a: enabled.includes("a") ? A_VALUES[integer(random, 0, A_VALUES.length - 1)] : 1,
    h: enabled.includes("h") ? integer(random, -5, 5) : 0,
    k: enabled.includes("k") ? integer(random, -4, 5) : 0,
  };
  if (target.a === start.a && target.h === start.h && target.k === start.k) target.k = enabled.includes("k") ? 2 : 0;
  const moves = Number(target.a !== start.a) + Number(target.h !== start.h) + Number(target.k !== start.k);
  return { ...base("parabola", layer, sequence, seed, moves), start, target, enabled, hideTargetEquation: layer.order === 1 || layer.order === 5 };
}

export const BUBBLE_LEVELS: readonly BubbleCampaignLevel[] = LEARNING_LAYERS.flatMap(layer => Array.from({ length: LEVELS_PER_LAYER }, (_, sequence) => generateBubbleLevel(layer, sequence)));
export const TREE_LEVELS: readonly TreeCampaignLevel[] = LEARNING_LAYERS.flatMap(layer => Array.from({ length: LEVELS_PER_LAYER }, (_, sequence) => generateTreeLevel(layer, sequence)));
export const QUADRATIC_LEVELS: readonly ParabolaCampaignLevel[] = LEARNING_LAYERS.flatMap(layer => Array.from({ length: LEVELS_PER_LAYER }, (_, sequence) => generateParabolaLevel(layer, sequence)));

export const CAMPAIGN_LEVEL_COUNT = 600;

export function generateEndlessLevel(world: "bubble", run: number): BubbleCampaignLevel;
export function generateEndlessLevel(world: "tree", run: number): TreeCampaignLevel;
export function generateEndlessLevel(world: "parabola", run: number): ParabolaCampaignLevel;
export function generateEndlessLevel(world: "bubble" | "tree" | "parabola", run: number) {
  const layer = LEARNING_LAYERS[2];
  const level = world === "bubble" ? generateBubbleLevel(layer, run % LEVELS_PER_LAYER, run + 1000)
    : world === "tree" ? generateTreeLevel(layer, run % LEVELS_PER_LAYER, run + 1000)
      : generateParabolaLevel(layer, run % LEVELS_PER_LAYER, run + 1000);
  return { ...level, id: `${world}-endless-${run}`, name: `Endless Run ${run + 1}`, subtitle: `Seed ${level.seed}` };
}

export function levelsInLayer<T extends GeneratedLevelBase>(levels: readonly T[], layer: LearningLayerId): T[] {
  return levels.filter(level => level.layer === layer);
}
