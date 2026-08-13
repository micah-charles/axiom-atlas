import type { FamilyWorldId } from "./world-registry.ts";

export type ModeBoard = "conveyor" | "balance" | "bridge" | "forest" | "harbor" | "routes" | "constellation" | "grid" | "network" | "machines" | "valley";
export type ModeInteraction = "compose" | "balance" | "rotate" | "deduce" | "scale" | "choose" | "construct" | "navigate" | "connect" | "transform" | "allocate";
export type ModeControl = "operator-pad" | "balance-rail" | "angle-dial" | "clue-gates" | "cargo-cards" | "route-cards" | "star-tiles" | "direction-pad" | "node-links" | "machine-slots" | "resource-plans";
export type ModeSelectionState = "empty" | "progress" | "complete" | "wrong";

export type GameFramework = {
  world: Exclude<FamilyWorldId, "lab"> | "lab";
  board: ModeBoard;
  interaction: ModeInteraction;
  mechanic: string;
  feedback: string;
  success: string;
  control: ModeControl;
  controlPrompt: string;
};

export const GAME_FRAMEWORKS: Record<FamilyWorldId, GameFramework> = {
  lab: { world: "lab", board: "conveyor", interaction: "compose", mechanic: "direct manipulation protocol", feedback: "signal rings", success: "protocol complete", control: "operator-pad", controlPrompt: "Choose the next protocol action" },
  arithmetic: { world: "arithmetic", board: "conveyor", interaction: "compose", mechanic: "operator conveyor", feedback: "live machine output", success: "target ingot forged", control: "operator-pad", controlPrompt: "Send the ingot through one operator" },
  equations: { world: "equations", board: "balance", interaction: "balance", mechanic: "physical balance scales", feedback: "equal tower weights", success: "both sides balance", control: "balance-rail", controlPrompt: "Apply the same inverse operation to both towers" },
  geometry: { world: "geometry", board: "bridge", interaction: "rotate", mechanic: "bridge workshop", feedback: "angle lock and alignment", success: "bridge span completed", control: "angle-dial", controlPrompt: "Rotate the beam into the illuminated socket" },
  logic: { world: "logic", board: "forest", interaction: "deduce", mechanic: "truth-gate forest", feedback: "guardian consistency", success: "safe path deduced", control: "clue-gates", controlPrompt: "Choose the gate that survives every clue" },
  fractions: { world: "fractions", board: "harbor", interaction: "scale", mechanic: "fraction cargo holds", feedback: "capacity fill level", success: "cargo matched exactly", control: "cargo-cards", controlPrompt: "Load the hold with an equivalent proportion" },
  probability: { world: "probability", board: "routes", interaction: "choose", mechanic: "simulation harbour", feedback: "risk and reward forecast", success: "best expected route chosen", control: "route-cards", controlPrompt: "Launch the route with the strongest long-run return" },
  patterns: { world: "patterns", board: "constellation", interaction: "construct", mechanic: "pattern observatory", feedback: "symmetry and recurrence glow", success: "constellation restored", control: "star-tiles", controlPrompt: "Place the missing star in the sequence" },
  coordinates: { world: "coordinates", board: "grid", interaction: "navigate", mechanic: "coordinate expedition", feedback: "live vector position", success: "beacon reached", control: "direction-pad", controlPrompt: "Steer the explorer one vector at a time" },
  graphs: { world: "graphs", board: "network", interaction: "connect", mechanic: "graph laboratory", feedback: "network edges and weights", success: "graph target connected", control: "node-links", controlPrompt: "Choose the next station on the shortest route" },
  functions: { world: "functions", board: "machines", interaction: "transform", mechanic: "function factory", feedback: "input/output trace", success: "transformation composed", control: "machine-slots", controlPrompt: "Compose the machines in the order that reaches the output" },
  optimisation: { world: "optimisation", board: "valley", interaction: "allocate", mechanic: "resource valley", feedback: "budget and capacity meters", success: "optimal plan found", control: "resource-plans", controlPrompt: "Lock constraints, then select the best trade-off" },
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

/** Evaluate a partial sequence so the interface can teach while the player builds it. */
export function modeSelectionState(selected: string[], solution: string[]): ModeSelectionState {
  if (!selected.length) return "empty";
  const prefixMatches = selected.every((token, index) => token === solution[index]);
  if (!prefixMatches) return "wrong";
  return selected.length === solution.length ? "complete" : "progress";
}

export function modeSelectionMessage(framework: GameFramework, state: ModeSelectionState): string {
  if (state === "empty") return framework.controlPrompt;
  if (state === "complete") return `${framework.success} — ready to test.`;
  if (state === "wrong") {
    const messages: Record<ModeControl, string> = {
      "operator-pad": "The ingot drifts off target — try a different operator order.",
      "balance-rail": "The towers tilt — undo the last operation on both sides.",
      "angle-dial": "The beam misses the socket — keep the target angle in view.",
      "clue-gates": "A clue contradicts this gate — inspect the guardian statements again.",
      "cargo-cards": "That hold has a different capacity — compare numerator and denominator together.",
      "route-cards": "The forecast weakens — compare probability × reward before launching.",
      "star-tiles": "The constellation flickers — look for the recurrence, not a nearby number.",
      "direction-pad": "The explorer veers away — retrace the shortest vector sequence.",
      "node-links": "That station adds a costly detour — keep the network connected.",
      "machine-slots": "The output is unstable — composition order changes the function.",
      "resource-plans": "The valley exceeds a constraint — trade one resource for another.",
    };
    return messages[framework.control];
  }
  return `${framework.feedback} — the mechanism is responding.`;
}
