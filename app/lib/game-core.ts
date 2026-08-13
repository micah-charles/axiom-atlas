export type { WorldId } from "../games/world-registry.ts";

export { BUBBLE_LEVELS, TREE_LEVELS, QUADRATIC_LEVELS } from "./campaign.ts";

export type GameCommand<T> = {
  id: string;
  type: string;
  before: T;
  after: T;
  legal: boolean;
  cost: number;
  timestamp: number;
  note?: string;
};

export type HistoryState<T> = {
  present: T;
  past: GameCommand<T>[];
  future: GameCommand<T>[];
};

export function createHistory<T>(state: T): HistoryState<T> {
  return { present: state, past: [], future: [] };
}

export function commit<T>(history: HistoryState<T>, type: string, after: T, note?: string): HistoryState<T> {
  const command: GameCommand<T> = {
    id: `${type}-${history.past.length}-${Date.now()}`,
    type,
    before: history.present,
    after,
    legal: true,
    cost: 1,
    timestamp: Date.now(),
    note,
  };
  return { present: after, past: [...history.past, command], future: [] };
}

export function undo<T>(history: HistoryState<T>): HistoryState<T> {
  const command = history.past.at(-1);
  if (!command) return history;
  return {
    present: command.before,
    past: history.past.slice(0, -1),
    future: [command, ...history.future],
  };
}

export function redo<T>(history: HistoryState<T>): HistoryState<T> {
  const command = history.future[0];
  if (!command) return history;
  return {
    present: command.after,
    past: [...history.past, command],
    future: history.future.slice(1),
  };
}

export type BubbleItem = { id: string; value: number; stableKey: string };
export type BubbleState = {
  items: BubbleItem[];
  cursor: number;
  passEnd: number;
  pass: number;
  comparisons: number;
  swaps: number;
  mistakes: number;
  complete: boolean;
  lastAction: "swap" | "keep" | null;
  message: string;
};

export function createBubbleState(values: readonly number[]): BubbleState {
  const seen = new Map<number, number>();
  return {
    items: values.map((value, index) => {
      const count = seen.get(value) ?? 0;
      seen.set(value, count + 1);
      return { id: `orb-${index}-${value}`, value, stableKey: String.fromCharCode(65 + count) };
    }),
    cursor: 0,
    passEnd: values.length - 1,
    pass: 1,
    comparisons: 0,
    swaps: 0,
    mistakes: 0,
    complete: values.length < 2,
    lastAction: null,
    message: "Inspect the glowing neighbours.",
  };
}

export function bubbleDecision(state: BubbleState, decision: "swap" | "keep"): BubbleState {
  if (state.complete) return state;
  const left = state.items[state.cursor];
  const right = state.items[state.cursor + 1];
  if (!left || !right) return state;
  const needsSwap = left.value > right.value;
  const legal = decision === "swap" ? needsSwap : !needsSwap;
  if (!legal) {
    return {
      ...state,
      mistakes: state.mistakes + 1,
      message: decision === "swap"
        ? `${left.value} is already before ${right.value}. Keep their stable order.`
        : `${left.value} is greater than ${right.value}. The larger orb must bubble right.`,
    };
  }

  const items = [...state.items];
  if (decision === "swap") [items[state.cursor], items[state.cursor + 1]] = [right, left];
  const comparisons = state.comparisons + 1;
  const swaps = state.swaps + (decision === "swap" ? 1 : 0);
  const reachedEnd = state.cursor + 1 >= state.passEnd;
  if (!reachedEnd) {
    return {
      ...state,
      items,
      cursor: state.cursor + 1,
      comparisons,
      swaps,
      lastAction: decision,
      message: decision === "swap" ? "Clean swap. The larger orb rises." : "Order preserved. Scan onward.",
    };
  }
  const passEnd = state.passEnd - 1;
  const complete = passEnd <= 0 || items.every((item, index) => index === 0 || items[index - 1].value <= item.value);
  return {
    ...state,
    items,
    cursor: 0,
    passEnd,
    pass: state.pass + (complete ? 0 : 1),
    comparisons,
    swaps,
    complete,
    lastAction: decision,
    message: complete ? "The village is in harmony." : `Pass complete. ${state.passEnd + 1} is now locked.`,
  };
}

export function isStableBubbleResult(items: BubbleItem[]): boolean {
  const groups = new Map<number, string[]>();
  for (const item of items) groups.set(item.value, [...(groups.get(item.value) ?? []), item.stableKey]);
  return [...groups.values()].every((keys) => keys.every((key, index) => index === 0 || keys[index - 1] <= key));
}

export type TreeNode = { id: string; value: number; left: string | null; right: string | null; order: number };
export type TreeState = {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
  queue: number[];
  activeValue: number | null;
  currentNodeId: string | null;
  path: string[];
  phase: "insert" | "traverse" | "complete";
  traversalTarget: string[];
  traversalOutput: string[];
  mistakes: number;
  comparisons: number;
  message: string;
  duplicatePolicy: "right";
};

export function createTreeState(values: readonly number[]): TreeState {
  return {
    nodes: {}, rootId: null, queue: [...values], activeValue: null, currentNodeId: null,
    path: [], phase: "insert", traversalTarget: [], traversalOutput: [], mistakes: 0,
    comparisons: 0, message: "Plant the first seed.", duplicatePolicy: "right",
  };
}

function addTreeNode(state: TreeState, value: number, parentId: string | null, branch: "left" | "right" | null): TreeState {
  const id = `node-${Object.keys(state.nodes).length}-${value}`;
  const nodes = { ...state.nodes, [id]: { id, value, left: null, right: null, order: Object.keys(state.nodes).length } };
  let rootId = state.rootId;
  if (!parentId) rootId = id;
  else nodes[parentId] = { ...nodes[parentId], [branch!]: id };
  const queue = state.queue.slice(1);
  const next = queue[0] ?? null;
  const insertionDone = queue.length === 0;
  const nextState: TreeState = {
    ...state, nodes, rootId, queue,
    activeValue: insertionDone ? null : next,
    currentNodeId: insertionDone ? null : rootId,
    path: insertionDone ? [] : rootId ? [rootId] : [],
    phase: insertionDone ? "traverse" : "insert",
    message: insertionDone ? "The tree is grown. Harvest it in-order: left, root, right." : `Guide ${next} from the root.`,
  };
  return insertionDone ? { ...nextState, traversalTarget: inorderIds(nextState) } : nextState;
}

export function beginTreeStep(state: TreeState): TreeState {
  if (state.phase !== "insert" || state.activeValue !== null) return state;
  const value = state.queue[0];
  if (value === undefined) return state;
  if (!state.rootId) return addTreeNode({ ...state, activeValue: value }, value, null, null);
  return { ...state, activeValue: value, currentNodeId: state.rootId, path: [state.rootId], message: `Compare ${value} with the root.` };
}

export function treeChoose(state: TreeState, branch: "left" | "right"): TreeState {
  if (state.phase !== "insert" || state.activeValue === null || !state.currentNodeId) return state;
  const current = state.nodes[state.currentNodeId];
  const legalBranch = state.activeValue < current.value ? "left" : "right";
  if (branch !== legalBranch) {
    const relation = state.activeValue === current.value ? "Equal values grow to the right in this garden." : `${state.activeValue} is ${state.activeValue < current.value ? "smaller" : "greater"} than ${current.value}.`;
    return { ...state, mistakes: state.mistakes + 1, message: `${relation} Choose ${legalBranch}.` };
  }
  const childId = current[branch];
  if (childId) {
    return {
      ...state, currentNodeId: childId, path: [...state.path, childId], comparisons: state.comparisons + 1,
      message: `Correct. Now compare ${state.activeValue} with ${state.nodes[childId].value}.`,
    };
  }
  return addTreeNode({ ...state, comparisons: state.comparisons + 1 }, state.activeValue, current.id, branch);
}

export function inorderIds(state: Pick<TreeState, "nodes" | "rootId">): string[] {
  const result: string[] = [];
  const visit = (id: string | null) => {
    if (!id) return;
    const node = state.nodes[id];
    visit(node.left); result.push(id); visit(node.right);
  };
  visit(state.rootId);
  return result;
}

export function treeTraverse(state: TreeState, nodeId: string): TreeState {
  if (state.phase !== "traverse") return state;
  const expected = state.traversalTarget[state.traversalOutput.length];
  if (nodeId !== expected) {
    return { ...state, mistakes: state.mistakes + 1, message: "Not yet. Finish the entire left branch before visiting this blossom." };
  }
  const traversalOutput = [...state.traversalOutput, nodeId];
  const complete = traversalOutput.length === state.traversalTarget.length;
  return {
    ...state, traversalOutput, phase: complete ? "complete" : "traverse",
    message: complete ? "Harvest complete — the output is sorted." : "Good. Continue left → root → right.",
  };
}

export type QuadraticState = { a: number; h: number; k: number };
export type QuadraticLevel = { id: string; name: string; start: QuadraticState; target: QuadraticState; enabled: (keyof QuadraticState)[]; targetMoves?: number; layer?: string; hideTargetEquation?: boolean; hintLimit?: number; mistakeLimit?: number };

export function formatQuadratic({ a, h, k }: QuadraticState): string {
  const numericA = (Number.isInteger(a) ? String(a) : String(Number(a.toFixed(2)))).replace("-", "−");
  const aText = a === 1 ? "" : a === -1 ? "−" : numericA;
  const hText = h === 0 ? "x" : h > 0 ? `(x − ${h})` : `(x + ${Math.abs(h)})`;
  const kText = k === 0 ? "" : k > 0 ? ` + ${k}` : ` − ${Math.abs(k)}`;
  return `y = ${aText}${hText}²${kText}`;
}

export function quadraticY(state: QuadraticState, x: number): number {
  return state.a * (x - state.h) ** 2 + state.k;
}

export function quadraticMatches(current: QuadraticState, target: QuadraticState, tolerance = 0.001): boolean {
  return Math.abs(current.a - target.a) <= tolerance && Math.abs(current.h - target.h) <= tolerance && Math.abs(current.k - target.k) <= tolerance;
}

export function clampSnap(value: number, min: number, max: number, step: number): number {
  return Math.max(min, Math.min(max, Math.round(value / step) * step));
}

export type Progress = {
  completed: Record<string, { stars: number; bestMoves: number; completedAt: number }>;
  dailyChallenge: { key: string; stars: number; completedAt: number } | null;
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
};

export const DEFAULT_PROGRESS: Progress = { completed: {}, dailyChallenge: null, sound: true, haptics: true, reducedMotion: false };

export function starsFor(mistakes: number, moves: number, targetMoves: number): number {
  if (mistakes === 0 && moves <= targetMoves) return 3;
  if (mistakes <= 2) return 2;
  return 1;
}
