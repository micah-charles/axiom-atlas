import type { FamilyWorldId } from "./world-registry.ts";

export type ModeBoard = "conveyor" | "balance" | "bridge" | "forest" | "harbor" | "routes" | "constellation" | "grid" | "network" | "machines" | "valley";
export type ModeInteraction = "compose" | "balance" | "rotate" | "deduce" | "scale" | "choose" | "construct" | "navigate" | "connect" | "transform" | "allocate";

export type GameFramework = {
  world: Exclude<FamilyWorldId, "lab"> | "lab";
  board: ModeBoard;
  interaction: ModeInteraction;
  mechanic: string;
  feedback: string;
  success: string;
};

export const GAME_FRAMEWORKS: Record<FamilyWorldId, GameFramework> = {
  lab: { world: "lab", board: "conveyor", interaction: "compose", mechanic: "direct manipulation protocol", feedback: "signal rings", success: "protocol complete" },
  arithmetic: { world: "arithmetic", board: "conveyor", interaction: "compose", mechanic: "operator conveyor", feedback: "live machine output", success: "target ingot forged" },
  equations: { world: "equations", board: "balance", interaction: "balance", mechanic: "physical balance scales", feedback: "equal tower weights", success: "both sides balance" },
  geometry: { world: "geometry", board: "bridge", interaction: "rotate", mechanic: "bridge workshop", feedback: "angle lock and alignment", success: "bridge span completed" },
  logic: { world: "logic", board: "forest", interaction: "deduce", mechanic: "truth-gate forest", feedback: "guardian consistency", success: "safe path deduced" },
  fractions: { world: "fractions", board: "harbor", interaction: "scale", mechanic: "fraction cargo holds", feedback: "capacity fill level", success: "cargo matched exactly" },
  probability: { world: "probability", board: "routes", interaction: "choose", mechanic: "simulation harbour", feedback: "risk and reward forecast", success: "best expected route chosen" },
  patterns: { world: "patterns", board: "constellation", interaction: "construct", mechanic: "pattern observatory", feedback: "symmetry and recurrence glow", success: "constellation restored" },
  coordinates: { world: "coordinates", board: "grid", interaction: "navigate", mechanic: "coordinate expedition", feedback: "live vector position", success: "beacon reached" },
  graphs: { world: "graphs", board: "network", interaction: "connect", mechanic: "graph laboratory", feedback: "network edges and weights", success: "graph target connected" },
  functions: { world: "functions", board: "machines", interaction: "transform", mechanic: "function factory", feedback: "input/output trace", success: "transformation composed" },
  optimisation: { world: "optimisation", board: "valley", interaction: "allocate", mechanic: "resource valley", feedback: "budget and capacity meters", success: "optimal plan found" },
};

export function frameworkFor(world: FamilyWorldId): GameFramework {
  return GAME_FRAMEWORKS[world];
}

export function validateModeSelection(framework: GameFramework, selected: string[], solution: string[]): boolean {
  if (selected.length !== solution.length) return false;
  switch (framework.interaction) {
    case "choose": return selected.length === 1 && selected[0] === solution[0];
    case "scale": return selected[0] === solution[0];
    case "connect": return selected.every((token, index) => token === solution[index]);
    case "allocate": return selected.every((token, index) => token === solution[index]);
    case "balance": return selected.join("|") === solution.join("|");
    default: return selected.every((token, index) => token === solution[index]);
  }
}
