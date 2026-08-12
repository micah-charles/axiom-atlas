import test from "node:test";
import assert from "node:assert/strict";
import {
  BUBBLE_LEVELS, QUADRATIC_LEVELS, TREE_LEVELS, beginTreeStep, bubbleDecision,
  commit, createBubbleState, createHistory, createTreeState, formatQuadratic,
  inorderIds, isStableBubbleResult, quadraticMatches, quadraticY, redo,
  treeChoose, treeTraverse, undo,
} from "../app/lib/game-core.ts";
import { LEARNING_LAYERS, generateBubbleLevel, generateEndlessLevel } from "../app/lib/campaign.ts";

test("campaign is generated deterministically across five learning layers", () => {
  assert.equal(LEARNING_LAYERS.length, 5);
  assert.equal(BUBBLE_LEVELS.length, 40);
  assert.equal(TREE_LEVELS.length, 40);
  assert.equal(QUADRATIC_LEVELS.length, 40);
  assert.deepEqual(generateBubbleLevel(LEARNING_LAYERS[3], 4), generateBubbleLevel(LEARNING_LAYERS[3], 4));
  assert.notDeepEqual(generateEndlessLevel("bubble", 1).values, generateEndlessLevel("bubble", 2).values);
});

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
