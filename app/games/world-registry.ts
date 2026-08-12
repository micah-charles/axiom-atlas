export const WORLD_IDS = [
  "lab", "bubble", "tree", "parabola", "arithmetic", "fractions", "equations",
  "geometry", "probability", "logic", "graphs", "algorithms", "sequences",
  "ciphers", "infinity",
] as const;

export type WorldId = typeof WORLD_IDS[number];

export type WorldMeta = {
  eyebrow: string;
  name: string;
  icon: string;
  subtitle: string;
  color: string;
  concept: string;
};

export const WORLD_META: Record<WorldId, WorldMeta> = {
  lab: { eyebrow: "GM–01", name: "Core Interaction Lab", icon: "✦", subtitle: "Master the language of touch", color: "cyan", concept: "Reasoning & controls" },
  bubble: { eyebrow: "GM–02", name: "Bubble Village", icon: "◌", subtitle: "Guide the greater light upward", color: "gold", concept: "Comparison & sorting" },
  tree: { eyebrow: "GM–03", name: "Tree Garden", icon: "♧", subtitle: "Every comparison grows a branch", color: "green", concept: "Trees & traversal" },
  parabola: { eyebrow: "GM–04", name: "Parabola Valley", icon: "⌒", subtitle: "Shape equations with your hands", color: "violet", concept: "Quadratic functions" },
  arithmetic: { eyebrow: "GM–05", name: "Arithmetic Forge", icon: "⚒", subtitle: "Forge targets through machine chains", color: "ember", concept: "Operations & precedence" },
  fractions: { eyebrow: "GM–06", name: "Fraction Harbor", icon: "◒", subtitle: "Load exact proportions", color: "aqua", concept: "Fractions & ratios" },
  equations: { eyebrow: "GM–07", name: "Equation Citadel", icon: "⚖", subtitle: "Keep both towers balanced", color: "royal", concept: "Algebra & equations" },
  geometry: { eyebrow: "GM–08", name: "Geometry Kingdom", icon: "△", subtitle: "Construct with shape and measure", color: "rose", concept: "Angles & transformations" },
  probability: { eyebrow: "GM–09", name: "Probability Port", icon: "⚄", subtitle: "Navigate risk and reward", color: "teal", concept: "Probability & expectation" },
  logic: { eyebrow: "GM–10", name: "Logic Forest", icon: "◇", subtitle: "Deduce the only safe path", color: "moss", concept: "Deduction & Boolean logic" },
  graphs: { eyebrow: "GM–11", name: "Graph Metro", icon: "⌘", subtitle: "Run the shortest network", color: "metro", concept: "Graph theory & paths" },
  algorithms: { eyebrow: "GM–12", name: "Algorithm City", icon: "▦", subtitle: "Program robots through motion", color: "electric", concept: "Algorithms & complexity" },
  sequences: { eyebrow: "GM–13", name: "Sequence Desert", icon: "⋯", subtitle: "Restore the lost pattern", color: "sand", concept: "Patterns & sequences" },
  ciphers: { eyebrow: "GM–14", name: "Cipher Isles", icon: "⌁", subtitle: "Turn number into secret language", color: "indigo", concept: "Number theory & cryptography" },
  infinity: { eyebrow: "GM–15", name: "Infinity Observatory", icon: "∞", subtitle: "Where every discipline meets", color: "cosmic", concept: "Proof & advanced synthesis" },
};

export const FAMILY_WORLD_IDS = WORLD_IDS.filter(id => !["bubble", "tree", "parabola"].includes(id)) as Exclude<WorldId, "bubble" | "tree" | "parabola">[];
