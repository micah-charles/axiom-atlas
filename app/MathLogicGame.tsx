"use client";

import React, { PointerEvent as ReactPointerEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BUBBLE_LEVELS, BubbleState, DEFAULT_PROGRESS, HistoryState, Progress, QUADRATIC_LEVELS,
  QuadraticLevel, QuadraticState, TREE_LEVELS, TreeState, WorldId, beginTreeStep,
  bubbleDecision, clampSnap, commit, createBubbleState, createHistory, createTreeState,
  formatQuadratic, quadraticMatches, quadraticY, redo, starsFor, treeChoose, treeTraverse, undo,
} from "./lib/game-core";
import {
  CAMPAIGN_LEVEL_COUNT, GeneratedLevelBase, LEARNING_LAYERS, LearningLayerId,
  generateEndlessLevel,
} from "./lib/campaign";
import { FAMILY_LEVELS, FamilyLevel, FamilyWorldId, generateFamilyEndless } from "./games/family-generator";
import { FAMILY_WORLD_IDS, WORLD_IDS, WORLD_META } from "./games/world-registry";

type Screen = "map" | WorldId;
type Toast = { kind: "success" | "warn" | "info"; text: string } | null;

function loadProgress(): Progress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try { return { ...DEFAULT_PROGRESS, ...JSON.parse(localStorage.getItem("axiom-progress-v1") ?? "{}") }; }
  catch { return DEFAULT_PROGRESS; }
}

function useAudio(enabled: boolean, haptics: boolean) {
  return useCallback((tone: "tap" | "good" | "bad" | "win") => {
    if (haptics && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(tone === "bad" ? [18, 20, 18] : tone === "win" ? [20, 30, 45] : 12);
    if (!enabled || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const notes = tone === "win" ? [523.25, 659.25, 783.99] : [tone === "good" ? 659.25 : tone === "bad" ? 130.81 : 440];
    notes.forEach((frequency, index) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = tone === "bad" ? "sawtooth" : "sine"; osc.frequency.value = frequency;
      const start = ctx.currentTime + index * 0.09;
      gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(0.08, start + 0.015); gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + 0.18);
    });
    window.setTimeout(() => ctx.close(), 700);
  }, [enabled, haptics]);
}

function IconButton({ label, children, onClick, disabled, active }: { label: string; children: React.ReactNode; onClick: () => void; disabled?: boolean; active?: boolean }) {
  return <button className={`icon-button ${active ? "active" : ""}`} aria-label={label} title={label} onClick={onClick} disabled={disabled}>{children}</button>;
}

function Stars({ count, small = false }: { count: number; small?: boolean }) {
  return <span className={`stars ${small ? "small" : ""}`} aria-label={`${count} of 3 stars`}>{[0, 1, 2].map(i => <span key={i} className={i < count ? "lit" : ""}>★</span>)}</span>;
}

type CampaignLevel = Pick<GeneratedLevelBase, "id" | "layer" | "sequence" | "name" | "subtitle">;
function CampaignDock<T extends CampaignLevel>({ levels, active, progress, onSelect, onEndless }: {
  levels: readonly T[]; active: T; progress: Progress; onSelect: (index: number) => void; onEndless: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [layer, setLayer] = useState<LearningLayerId>(active.layer);
  const layerMeta = LEARNING_LAYERS.find(item => item.id === active.layer)!;
  const shown = levels.map((item, index) => ({ item, index })).filter(({ item }) => item.layer === layer);
  const firstIncomplete = levels.findIndex(item => !progress.completed[item.id]);
  const unlockedIndex = firstIncomplete < 0 ? levels.length - 1 : firstIncomplete;
  return <>
    <button className="campaign-trigger" onClick={() => { setLayer(active.layer); setOpen(true); }}><span>{layerMeta.glyph}</span><b>{layerMeta.name}</b><small>{active.sequence + 1} / 8</small><i>Campaign</i></button>
    {open && <div className="campaign-backdrop">
      <section className="campaign-drawer" role="dialog" aria-modal="true" aria-label="Campaign levels">
        <header><div><span className="overline">Atlas campaign</span><h2>Five layers of mastery</h2></div><button onClick={() => setOpen(false)} aria-label="Close campaign">×</button></header>
        <nav className="layer-tabs" aria-label="Learning layers">{LEARNING_LAYERS.map(item => {
          const total = levels.filter(levelItem => levelItem.layer === item.id).length;
          const done = levels.filter(levelItem => levelItem.layer === item.id && progress.completed[levelItem.id]).length;
          return <button key={item.id} className={layer === item.id ? "active" : ""} onClick={() => setLayer(item.id)}><span>{item.glyph}</span><b>{item.name}</b><small>{done}/{total}</small></button>;
        })}</nav>
        <div className="layer-intro"><span>{LEARNING_LAYERS.find(item => item.id === layer)?.promise}</span><p>{LEARNING_LAYERS.find(item => item.id === layer)?.description}</p></div>
        <div className="campaign-levels">{shown.map(({ item, index }) => {
          const locked = index > unlockedIndex;
          const result = progress.completed[item.id];
          return <button key={item.id} disabled={locked} className={item.id === active.id ? "active" : ""} onClick={() => { onSelect(index); setOpen(false); }}><span>{locked ? "◇" : result ? "✓" : String(item.sequence + 1).padStart(2, "0")}</span><div><b>{item.name}</b><small>{locked ? "Complete the previous trial" : item.subtitle}</small></div>{result && <Stars count={result.stars} small />}</button>;
        })}</div>
        <button className="endless-card" onClick={() => { onEndless(); setOpen(false); }}><span>∞</span><div><b>Endless expedition</b><small>A fresh deterministic puzzle from a new seed</small></div><i>Generate →</i></button>
      </section>
    </div>}
  </>;
}

function CompletionOverlay({ title, copy, stars, onNext, onMap, onReplay, nextLabel = "Continue" }: { title: string; copy: string; stars: number; onNext: () => void; onMap: () => void; onReplay?: () => void; nextLabel?: string }) {
  return <div className="completion-backdrop" role="dialog" aria-modal="true" aria-label="Level complete">
    <div className="completion-card">
      <div className="completion-radiance" />
      <span className="completion-kicker">Mastery recorded</span>
      <h2>{title}</h2><Stars count={stars} />
      <p>{copy}</p>
      <div className={`completion-actions ${onReplay ? "has-replay" : ""}`}><button className="button secondary" onClick={onMap}>World map</button>{onReplay && <button className="button secondary" onClick={onReplay}>Replay</button>}<button className="button primary" onClick={onNext}>{nextLabel} <span>→</span></button></div>
    </div>
  </div>;
}

function WorldMap({ progress, onEnter }: { progress: Progress; onEnter: (world: WorldId) => void }) {
  const worlds = WORLD_IDS.map(id => [id, WORLD_META[id]] as const);
  const levelIds = Object.fromEntries(WORLD_IDS.map(id => [id, id === "bubble" ? BUBBLE_LEVELS.map(x => x.id) : id === "tree" ? TREE_LEVELS.map(x => x.id) : id === "parabola" ? QUADRATIC_LEVELS.map(x => x.id) : FAMILY_LEVELS[id as FamilyWorldId].map(x => x.id)])) as Record<WorldId, string[]>;
  return <main className="map-screen">
    <section className="map-hero">
      <div><span className="overline">The Axiom Atlas</span><h1>Think with your hands.</h1><p>Fifteen worlds. {CAMPAIGN_LEVEL_COUNT} campaign missions. Infinite generated expeditions.</p></div>
      <div className="atlas-mark" aria-hidden="true"><span>AX</span><i /></div>
    </section>
    <section className="realm-grid" aria-label="Game worlds">
      {worlds.map(([id, meta], index) => {
        const completed = levelIds[id].filter(level => progress.completed[level]).length;
        const stars = levelIds[id].reduce((sum, level) => sum + (progress.completed[level]?.stars ?? 0), 0);
        return <button key={id} className={`realm-card ${meta.color}`} onClick={() => onEnter(id)} style={{ "--delay": `${index * 90}ms` } as React.CSSProperties}>
          <div className="realm-card-top"><span className="realm-number">{meta.eyebrow}</span><span className="realm-icon">{meta.icon}</span></div>
          <div className="realm-art" aria-hidden="true"><i /><i /><i /><i /><span>{meta.icon}</span></div>
          <div className="realm-copy"><small>{meta.concept}</small><h2>{meta.name}</h2><p>{meta.subtitle}</p></div>
          <div className="realm-progress"><span><b>{completed}</b> / {levelIds[id].length} trials</span><span className="mini-star">★ {stars}</span></div>
          <div className="progress-track"><i style={{ width: `${Math.max(4, (completed / levelIds[id].length) * 100)}%` }} /></div>
        </button>;
      })}
    </section>
    <div className="map-footer"><span>Direct manipulation</span><i /> <span>Deterministic worlds</span><i /> <span>Your reasoning, replayed</span></div>
  </main>;
}

function WorldHeader({ world, levelName, progressLabel, onBack, history, onUndo, onRedo, onHint }: {
  world: WorldId; levelName: string; progressLabel: string; onBack: () => void;
  history?: HistoryState<unknown>; onUndo?: () => void; onRedo?: () => void; onHint?: () => void;
}) {
  const meta = WORLD_META[world];
  return <header className={`world-header ${meta.color}`}>
    <button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">A</span><span className="brand-copy"><b>{meta.name}</b><small>{levelName}</small></span></button>
    <div className="level-progress"><span>{progressLabel}</span><div><i /></div></div>
    <div className="header-tools">
      {onHint && <IconButton label="Hint" onClick={onHint}>?</IconButton>}
      {onUndo && <IconButton label="Undo (Z)" onClick={onUndo} disabled={!history?.past.length}>↶</IconButton>}
      {onRedo && <IconButton label="Redo (Shift+Z)" onClick={onRedo} disabled={!history?.future.length}>↷</IconButton>}
    </div>
  </header>;
}

type GameProps = { onBack: () => void; progress: Progress; completeLevel: (id: string, stars: number, moves: number) => void; sound: (tone: "tap" | "good" | "bad" | "win") => void };

function useKeyboardHistory(onUndo: () => void, onRedo: () => void, onReset: () => void) {
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "z" && (event.shiftKey || event.metaKey && event.shiftKey)) { event.preventDefault(); onRedo(); }
      else if (event.key.toLowerCase() === "y") { event.preventDefault(); onRedo(); }
      else if (event.key.toLowerCase() === "z") { event.preventDefault(); onUndo(); }
      else if (event.key.toLowerCase() === "r") { event.preventDefault(); onReset(); }
    };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  }, [onUndo, onRedo, onReset]);
}

function replayCommands<T>(history: HistoryState<T>, setHistory: React.Dispatch<React.SetStateAction<HistoryState<T>>>, onFinish?: () => void) {
  const commands = [...history.past];
  if (!commands.length) return;
  const finalHistory = history;
  setHistory(createHistory(commands[0].before));
  commands.forEach((command, index) => window.setTimeout(() => {
    setHistory(createHistory(command.after));
    if (index === commands.length - 1) window.setTimeout(() => { setHistory(finalHistory); onFinish?.(); }, 600);
  }, 400 + index * 520));
}

function BubbleVillage({ onBack, progress, completeLevel }: GameProps) {
  const [levelIndex, setLevelIndex] = useState(() => BUBBLE_LEVELS.findIndex(level => !progress.completed[level.id]) === -1 ? 0 : BUBBLE_LEVELS.findIndex(level => !progress.completed[level.id]));
  const [endlessLevel, setEndlessLevel] = useState<(typeof BUBBLE_LEVELS)[number] | null>(null);
  const endlessRun = useRef(0);
  const level = endlessLevel ?? BUBBLE_LEVELS[levelIndex];
  const layerMeta = LEARNING_LAYERS[level.layerIndex];
  const makeHistory = useCallback(() => createHistory(createBubbleState(level.values)), [level.values]);
  const [history, setHistory] = useState<HistoryState<BubbleState>>(makeHistory);
  const [hintTier, setHintTier] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const play = useAudio(progress.sound, progress.haptics);
  const state = history.present;
  const changeLevel = (index: number) => { setEndlessLevel(null); setLevelIndex(index); setHistory(createHistory(createBubbleState(BUBBLE_LEVELS[index].values))); setHintTier(0); setShowComplete(false); };
  const startEndless = () => { const next = generateEndlessLevel("bubble", endlessRun.current++); setEndlessLevel(next); setHistory(createHistory(createBubbleState(next.values))); setHintTier(0); setShowComplete(false); };
  const decide = (decision: "swap" | "keep") => {
    const after = bubbleDecision(state, decision); const legal = after.comparisons > state.comparisons;
    if (!legal) {
      if (level.mistakeLimit === 0) setHistory(createHistory({ ...createBubbleState(level.values), message: "Master rule broken — the procession restarts." }));
      else setHistory(h => ({ ...h, present: after }));
      play("bad"); return;
    }
    setHistory(h => commit(h, decision === "swap" ? "SWAP" : "CONFIRM_ORDER", after, `${state.cursor} ↔ ${state.cursor + 1}`)); play(after.complete ? "win" : "good");
    if (after.complete) { const stars = starsFor(after.mistakes, after.comparisons, level.targetMoves); completeLevel(level.id, stars, after.comparisons); window.setTimeout(() => setShowComplete(true), 650); }
  };
  const reset = useCallback(() => setHistory(makeHistory()), [makeHistory]);
  useKeyboardHistory(() => setHistory(h => undo(h)), () => setHistory(h => redo(h)), reset);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === "ArrowLeft" || event.key === "1") decide("keep"); if (event.key === "ArrowRight" || event.key === "2" || event.key === " ") decide("swap"); };
    window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key);
  });
  const hint = hintTier === 0 ? null : hintTier === 1 ? "Watch the brighter value in the active pair." : hintTier === 2 ? "The greater value must finish on the right." : state.items[state.cursor].value > state.items[state.cursor + 1].value ? "Swap this pair." : "Keep this pair.";
  return <div className="world-screen bubble-world">
    <WorldHeader world="bubble" levelName={level.name} progressLabel={endlessLevel ? `Endless · seed ${level.seed}` : `${layerMeta.name} · ${level.sequence + 1} of 8`} onBack={onBack} history={history as HistoryState<unknown>} onUndo={() => setHistory(h => undo(h))} onRedo={() => setHistory(h => redo(h))} onHint={level.hintLimit ? () => setHintTier(t => Math.min(level.hintLimit, t + 1)) : undefined} />
    <div className="game-layout">
      <aside className="mission-panel"><span className="mission-index">{String(level.sequence + 1).padStart(2, "0")}</span><span className="overline">{layerMeta.glyph} {layerMeta.name} · Pass {state.pass}</span><h1>{level.stable ? "Guard the\nstable order" : "Raise the\ngreater light"}</h1><p>{level.layer === "discover" ? "Experiment with the two actions. Watch how the procession responds." : "The spirit may inspect neighbours only. Decide whether the pair should cross, then move one step right."}</p>
        <div className="objective-chip"><i /> Ascending order</div>
        {(level.layer === "challenge" || level.layer === "master") && <div className="constraint-strip"><span>Target ≤ {level.targetMoves} comparisons</span><span>{level.mistakeLimit === 0 ? "One mistake restarts" : `≤ ${level.mistakeLimit} incorrect decisions`}</span></div>}
        <div className="metric-grid"><div><span>{state.comparisons}</span><small>Comparisons</small></div><div><span>{state.swaps}</span><small>Swaps</small></div><div><span>{state.mistakes}</span><small>Incorrect decisions</small></div></div>
        {level.stable && <div className="rule-card"><span>A≺B</span><div><b>Stable festival</b><small>Equal orbs carry arrival marks. Never reverse them.</small></div></div>}
      </aside>
      <section className="play-stage bubble-stage">
        <div className="village-sky"><i /><i /><i /></div>
        <div className="pass-banner"><span>ACTIVE PASS</span><b>{state.pass}</b><em>{Math.max(0, state.passEnd)} comparisons remain in boundary</em></div>
        <div className="orb-rail" role="group" aria-label="Bubble sort values">
          {state.items.map((item, index) => {
            const active = index === state.cursor || index === state.cursor + 1;
            const locked = index > state.passEnd;
            return <div key={item.id} className={`orb-slot ${active ? "active" : ""} ${locked ? "locked" : ""}`}>
              <div className="sort-orb">{level.creatureMode && <strong className="orb-creature">{["🐭", "🐶", "🦊", "🐼", "🦒", "🐘"][Math.min(5, Math.floor((item.value - 1) / 3))]}</strong>}<span>{item.value}</span>{level.stable && <small>{item.stableKey}</small>}<i /></div>
              <em>{locked ? "LOCKED" : `P${index + 1}`}</em>
            </div>;
          })}
          {!state.complete && <div className="bubble-spirit" style={{ left: `calc(${(state.cursor + .5) * (100 / state.items.length)}% - 24px)` }}><span>◌</span><i /></div>}
        </div>
        <div className={`feedback-ribbon ${state.mistakes > 0 && state.message.includes("greater") ? "warn" : ""}`}><span>{state.complete ? "✓" : "✦"}</span><p>{state.message}</p></div>
        {hint && <div className="hint-bubble"><b>Hint {hintTier}/{level.hintLimit}</b>{hint}</div>}
        <div className="decision-deck">
          <button className="decision keep" onClick={() => decide("keep")} disabled={state.complete}><span>KEEP ORDER</span><b>{state.items[state.cursor]?.value ?? "–"} <i>≤</i> {state.items[state.cursor + 1]?.value ?? "–"}</b><small>1 / ←</small></button>
          <button className="decision swap" onClick={() => decide("swap")} disabled={state.complete}><span>SWAP PAIR</span><b>{state.items[state.cursor]?.value ?? "–"} <i>↔</i> {state.items[state.cursor + 1]?.value ?? "–"}</b><small>2 / Space</small></button>
        </div>
      </section>
    </div>
    <CampaignDock levels={BUBBLE_LEVELS} active={level} progress={progress} onSelect={changeLevel} onEndless={startEndless} />
    {showComplete && <CompletionOverlay title={level.layer === "master" ? "Village mastered" : "Pass wisdom earned"} copy={`${state.comparisons} comparisons · ${state.swaps} swaps · ${state.mistakes} incorrect decisions`} stars={starsFor(state.mistakes, state.comparisons, level.targetMoves)} onMap={onBack} onReplay={() => { setShowComplete(false); replayCommands(history, setHistory, () => setShowComplete(true)); }} onNext={() => endlessLevel ? startEndless() : levelIndex < BUBBLE_LEVELS.length - 1 ? changeLevel(levelIndex + 1) : onBack()} nextLabel={endlessLevel ? "New expedition" : levelIndex < BUBBLE_LEVELS.length - 1 ? "Next trial" : "World map"} />}
  </div>;
}

type LayoutNode = { id: string; x: number; y: number; depth: number };
function treeLayout(state: TreeState): LayoutNode[] {
  const order: string[] = [];
  const visit = (id: string | null) => { if (!id) return; const n = state.nodes[id]; visit(n.left); order.push(id); visit(n.right); };
  visit(state.rootId);
  const depthOf = (id: string, current: string | null = state.rootId, depth = 0): number => {
    if (!current) return 0; if (current === id) return depth; const n = state.nodes[current];
    return n.left && contains(n.left, id) ? depthOf(id, n.left, depth + 1) : depthOf(id, n.right, depth + 1);
  };
  const contains = (root: string | null, id: string): boolean => root === id || !!root && (contains(state.nodes[root].left, id) || contains(state.nodes[root].right, id));
  const depths = order.map(id => depthOf(id));
  const depthStep = Math.min(22, 72 / Math.max(1, ...depths));
  return order.map((id, index) => ({ id, x: ((index + 1) / (order.length + 1)) * 100, y: 12 + depths[index] * depthStep, depth: depths[index] }));
}

function TreeGarden({ onBack, progress, completeLevel }: GameProps) {
  const [levelIndex, setLevelIndex] = useState(() => Math.max(0, TREE_LEVELS.findIndex(l => !progress.completed[l.id])));
  const [endlessLevel, setEndlessLevel] = useState<(typeof TREE_LEVELS)[number] | null>(null);
  const endlessRun = useRef(0);
  const level = endlessLevel ?? TREE_LEVELS[levelIndex];
  const layerMeta = LEARNING_LAYERS[level.layerIndex];
  const makeHistory = useCallback(() => createHistory(beginTreeStep(createTreeState(level.values))), [level.values]);
  const [history, setHistory] = useState<HistoryState<TreeState>>(makeHistory);
  const [showComplete, setShowComplete] = useState(false); const [hintTier, setHintTier] = useState(0);
  const play = useAudio(progress.sound, progress.haptics); const state = history.present;
  const changeLevel = (index: number) => { setEndlessLevel(null); setLevelIndex(index); setHistory(createHistory(beginTreeStep(createTreeState(TREE_LEVELS[index].values)))); setShowComplete(false); setHintTier(0); };
  const startEndless = () => { const next = generateEndlessLevel("tree", endlessRun.current++); setEndlessLevel(next); setHistory(createHistory(beginTreeStep(createTreeState(next.values)))); setHintTier(0); setShowComplete(false); };
  const choose = (branch: "left" | "right") => {
    const after = treeChoose(state, branch); const legal = after.comparisons > state.comparisons;
    if (!legal) {
      if (level.mistakeLimit === 0) setHistory(createHistory({ ...beginTreeStep(createTreeState(level.values)), message: "Master rule broken — the garden regrows." }));
      else setHistory(h => ({ ...h, present: after }));
      play("bad"); return;
    }
    setHistory(h => commit(h, `CHOOSE_${branch.toUpperCase()}`, after, `${state.activeValue} ${branch} of ${state.nodes[state.currentNodeId!].value}`)); play("good");
  };
  const traverse = (id: string) => {
    const after = treeTraverse(state, id); const legal = after.traversalOutput.length > state.traversalOutput.length;
    if (!legal) {
      if (level.mistakeLimit === 0) setHistory(createHistory({ ...beginTreeStep(createTreeState(level.values)), message: "Master rule broken — the garden regrows." }));
      else setHistory(h => ({ ...h, present: after }));
      play("bad"); return;
    }
    setHistory(h => commit(h, "VISIT_NODE", after, String(state.nodes[id].value))); play(after.phase === "complete" ? "win" : "good");
    if (after.phase === "complete") { const stars = starsFor(after.mistakes, after.comparisons + after.traversalOutput.length, level.targetMoves); completeLevel(level.id, stars, history.past.length + 1); window.setTimeout(() => setShowComplete(true), 600); }
  };
  const layout = useMemo(() => treeLayout(state), [state]); const nodePos = Object.fromEntries(layout.map(n => [n.id, n]));
  const reset = useCallback(() => setHistory(makeHistory()), [makeHistory]);
  useKeyboardHistory(() => setHistory(h => undo(h)), () => setHistory(h => redo(h)), reset);
  useEffect(() => { const key = (e: KeyboardEvent) => { if (e.key === "ArrowLeft") choose("left"); if (e.key === "ArrowRight") choose("right"); }; window.addEventListener("keydown", key); return () => window.removeEventListener("keydown", key); });
  const current = state.currentNodeId ? state.nodes[state.currentNodeId] : null;
  const hint = hintTier === 0 ? null : state.phase === "insert" ? hintTier < 3 ? "Compare the falling seed with the glowing branch node." : `${state.activeValue! < current!.value ? "Left" : "Right"}: ${state.activeValue} is ${state.activeValue! < current!.value ? "smaller" : "greater or equal"}.` : hintTier < 3 ? "In-order means finish left, then visit root, then right." : `Visit ${state.nodes[state.traversalTarget[state.traversalOutput.length]].value} next.`;
  return <div className="world-screen tree-world">
    <WorldHeader world="tree" levelName={level.name} progressLabel={endlessLevel ? `Endless · seed ${level.seed}` : `${layerMeta.name} · ${level.sequence + 1} of 8`} onBack={onBack} history={history as HistoryState<unknown>} onUndo={() => setHistory(h => undo(h))} onRedo={() => setHistory(h => redo(h))} onHint={level.hintLimit ? () => setHintTier(t => Math.min(level.hintLimit, t + 1)) : undefined} />
    <div className="game-layout">
      <aside className="mission-panel"><span className="mission-index">{String(level.sequence + 1).padStart(2, "0")}</span><span className="overline">{layerMeta.glyph} {layerMeta.name} · {state.phase === "insert" ? "Growth" : "Harvest"}</span><h1>{state.phase === "insert" ? "Grow by\ncomparison" : "Read the\nliving order"}</h1><p>{level.layer === "discover" ? "Choose a branch and watch how the living structure answers." : state.phase === "insert" ? "Every seed must choose its own legal branch. Smaller grows left; equal or greater grows right." : "Visit every blossom using left → root → right. The harvest becomes a sorted sequence."}</p>
        {(level.layer === "challenge" || level.layer === "master") && <div className="constraint-strip"><span>Target ≤ {level.targetMoves} moves</span><span>{level.mistakeLimit === 0 ? "One mistake restarts" : `≤ ${level.mistakeLimit} corrections`}</span></div>}
        <div className="seed-queue"><span>Seed queue</span><div>{state.queue.map((value, i) => <i key={`${value}-${i}`} className={i === 0 ? "active" : ""}>{value}</i>)}</div></div>
        <div className="metric-grid"><div><span>{state.comparisons}</span><small>Comparisons</small></div><div><span>{Object.keys(state.nodes).length}</span><small>Nodes</small></div><div><span>{state.mistakes}</span><small>Incorrect decisions</small></div></div>
      </aside>
      <section className="play-stage tree-stage">
        <div className="forest-depth" />
        <div className="tree-canvas" role="tree" aria-label="Binary search tree">
          <svg className="tree-edges" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {layout.flatMap(pos => {
              const node = state.nodes[pos.id];
              return ([node.left, node.right] as (string | null)[]).filter(Boolean).map(childId => {
                const child = nodePos[childId!];
                if (!child) return null;
                return <line key={`${pos.id}-${childId}`} x1={pos.x} y1={pos.y} x2={child.x} y2={child.y} />;
              });
            })}
          </svg>
          {layout.map(pos => {
            const node = state.nodes[pos.id]; const active = pos.id === state.currentNodeId; const visited = state.traversalOutput.includes(pos.id); const path = state.path.includes(pos.id);
            return <button key={pos.id} role="treeitem" aria-selected={visited} className={`tree-node ${active ? "active" : ""} ${path ? "path" : ""} ${visited ? "visited" : ""}`} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} onClick={() => traverse(pos.id)} disabled={state.phase !== "traverse"}><i /><span>{node.value}</span><small>{visited ? state.traversalOutput.indexOf(pos.id) + 1 : pos.depth}</small></button>;
          })}
          {state.phase === "insert" && state.activeValue !== null && <div className="falling-seed" style={current ? { left: `${nodePos[current.id]?.x ?? 50}%`, top: `${Math.max(3, (nodePos[current.id]?.y ?? 12) - 13)}%` } : { left: "50%", top: "3%" }}><span>{state.activeValue}</span></div>}
        </div>
        <div className="tree-message"><span>{state.phase === "insert" ? "♧" : "⌁"}</span><p>{state.message}</p></div>
        {hint && <div className="hint-bubble tree-hint"><b>Garden whisper</b>{hint}</div>}
        {state.phase === "insert" && current && <div className="branch-decision"><button onClick={() => choose("left")}><span>← LEFT</span><b>Smaller than {current.value}</b><small>Arrow left</small></button><div className="comparison-gem"><small>COMPARE</small><b>{state.activeValue}</b><i>:</i><b>{current.value}</b></div><button onClick={() => choose("right")}><span>RIGHT →</span><b>Equal or greater</b><small>Arrow right</small></button></div>}
        {state.phase !== "insert" && <div className="harvest-rail"><span>IN-ORDER OUTPUT</span><div>{state.traversalTarget.map((id, index) => <i key={id} className={index < state.traversalOutput.length ? "filled" : ""}>{index < state.traversalOutput.length ? state.nodes[id].value : "·"}</i>)}</div></div>}
      </section>
    </div>
    <CampaignDock levels={TREE_LEVELS} active={level} progress={progress} onSelect={changeLevel} onEndless={startEndless} />
    {showComplete && <CompletionOverlay title="The garden remembers" copy={`Sorted harvest: ${state.traversalOutput.map(id => state.nodes[id].value).join(" · ")}`} stars={starsFor(state.mistakes, history.past.length, level.targetMoves)} onMap={onBack} onReplay={() => { setShowComplete(false); replayCommands(history, setHistory, () => setShowComplete(true)); }} onNext={() => endlessLevel ? startEndless() : levelIndex < TREE_LEVELS.length - 1 ? changeLevel(levelIndex + 1) : onBack()} nextLabel={endlessLevel ? "New expedition" : levelIndex < TREE_LEVELS.length - 1 ? "Next seed" : "World map"} />}
  </div>;
}

type Viewport = { scale: number; panX: number; panY: number };
function ParabolaCanvas({ state, target, enabled, reducedMotion, onCommit }: { state: QuadraticState; target: QuadraticState; enabled: (keyof QuadraticState)[]; reducedMotion: boolean; onCommit: (next: QuadraticState, type: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const wrapRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<Viewport>({ scale: 42, panX: 0, panY: 0 });
  const [size, setSize] = useState({ width: 900, height: 560 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ mode: "vertex" | "stretch" | "pan" | "pinch"; before: QuadraticState; startX: number; startY: number; panX: number; panY: number; pinchDistance?: number; scale?: number } | null>(null);
  const screen = useCallback((x: number, y: number) => ({ x: size.width / 2 + view.panX + x * view.scale, y: size.height / 2 + view.panY - y * view.scale }), [size, view]);
  const world = useCallback((x: number, y: number) => ({ x: (x - size.width / 2 - view.panX) / view.scale, y: -(y - size.height / 2 - view.panY) / view.scale }), [size, view]);
  useEffect(() => { if (!wrapRef.current) return; const observer = new ResizeObserver(([entry]) => setSize({ width: Math.max(320, entry.contentRect.width), height: Math.max(360, entry.contentRect.height) })); observer.observe(wrapRef.current); return () => observer.disconnect(); }, []);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const dpr = Math.min(2, window.devicePixelRatio || 1); canvas.width = size.width * dpr; canvas.height = size.height * dpr; canvas.style.width = `${size.width}px`; canvas.style.height = `${size.height}px`;
    const ctx = canvas.getContext("2d")!; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, size.width, size.height);
    const bg = ctx.createLinearGradient(0, 0, 0, size.height); bg.addColorStop(0, "#111029"); bg.addColorStop(1, "#09091a"); ctx.fillStyle = bg; ctx.fillRect(0, 0, size.width, size.height);
    const xMin = Math.floor(world(0, 0).x), xMax = Math.ceil(world(size.width, 0).x), yMax = Math.ceil(world(0, 0).y), yMin = Math.floor(world(0, size.height).y);
    ctx.lineWidth = 1;
    for (let x = xMin; x <= xMax; x++) { const p = screen(x, 0); ctx.strokeStyle = x === 0 ? "rgba(207,201,255,.46)" : "rgba(151,141,224,.09)"; ctx.beginPath(); ctx.moveTo(p.x, 0); ctx.lineTo(p.x, size.height); ctx.stroke(); if (x !== 0) { ctx.fillStyle = "rgba(213,208,255,.42)"; ctx.font = "11px ui-monospace"; ctx.fillText(String(x), p.x + 4, screen(0, 0).y - 7); } }
    for (let y = yMin; y <= yMax; y++) { const p = screen(0, y); ctx.strokeStyle = y === 0 ? "rgba(207,201,255,.46)" : "rgba(151,141,224,.09)"; ctx.beginPath(); ctx.moveTo(0, p.y); ctx.lineTo(size.width, p.y); ctx.stroke(); if (y !== 0) { ctx.fillStyle = "rgba(213,208,255,.42)"; ctx.font = "11px ui-monospace"; ctx.fillText(String(y), screen(0, 0).x + 7, p.y - 4); } }
    const drawCurve = (quadratic: QuadraticState, color: string, width: number, dash: number[] = []) => { ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.setLineDash(dash); ctx.shadowColor = color; ctx.shadowBlur = dash.length ? 0 : 14; ctx.beginPath(); let started = false; for (let px = -20; px <= size.width + 20; px += 2) { const wx = world(px, 0).x; const py = screen(0, quadraticY(quadratic, wx)).y; if (py > -100 && py < size.height + 100) { if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py); } else started = false; } ctx.stroke(); ctx.restore(); };
    drawCurve(target, "rgba(192,179,255,.44)", 2, [7, 8]); drawCurve(state, "#9f8cff", 3.5);
    const vertex = screen(state.h, state.k), handle = screen(state.h + 1, state.k + state.a);
    ctx.fillStyle = "rgba(159,140,255,.16)"; ctx.beginPath(); ctx.arc(vertex.x, vertex.y, 21, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "#f4f0ff"; ctx.strokeStyle = "#8a74ff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(vertex.x, vertex.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (enabled.includes("a")) { ctx.strokeStyle = "rgba(255,207,103,.48)"; ctx.setLineDash([4, 5]); ctx.beginPath(); ctx.moveTo(vertex.x, vertex.y); ctx.lineTo(handle.x, handle.y); ctx.stroke(); ctx.setLineDash([]); ctx.fillStyle = "#ffd36b"; ctx.beginPath(); ctx.arc(handle.x, handle.y, 8, 0, Math.PI * 2); ctx.fill(); }
    const tv = screen(target.h, target.k); ctx.strokeStyle = "rgba(255,255,255,.65)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tv.x, tv.y, 13, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(tv.x - 18, tv.y); ctx.lineTo(tv.x + 18, tv.y); ctx.moveTo(tv.x, tv.y - 18); ctx.lineTo(tv.x, tv.y + 18); ctx.stroke();
  }, [enabled, screen, size, state, target, view, world]);
  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => { const r = event.currentTarget.getBoundingClientRect(); return { x: event.clientX - r.left, y: event.clientY - r.top }; };
  const down = (event: ReactPointerEvent<HTMLCanvasElement>) => { event.currentTarget.setPointerCapture(event.pointerId); const p = point(event); pointers.current.set(event.pointerId, p); const vertex = screen(state.h, state.k), handle = screen(state.h + 1, state.k + state.a); const mode = Math.hypot(p.x - vertex.x, p.y - vertex.y) < 32 && (enabled.includes("h") || enabled.includes("k")) ? "vertex" : Math.hypot(p.x - handle.x, p.y - handle.y) < 30 && enabled.includes("a") ? "stretch" : "pan"; gesture.current = { mode, before: state, startX: p.x, startY: p.y, panX: view.panX, panY: view.panY }; };
  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!gesture.current) return; const p = point(event); pointers.current.set(event.pointerId, p); if (pointers.current.size === 2) { const pts = [...pointers.current.values()]; const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y); if (gesture.current.mode !== "pinch") gesture.current = { ...gesture.current, mode: "pinch", pinchDistance: distance, scale: view.scale }; else setView(v => ({ ...v, scale: Math.max(24, Math.min(90, (gesture.current!.scale ?? v.scale) * distance / (gesture.current!.pinchDistance ?? distance))) })); return; }
    if (gesture.current.mode === "pan") setView(v => ({ ...v, panX: gesture.current!.panX + p.x - gesture.current!.startX, panY: gesture.current!.panY + p.y - gesture.current!.startY }));
    if (gesture.current.mode === "vertex") { const w = world(p.x, p.y); onCommit({ ...state, h: enabled.includes("h") ? clampSnap(w.x, -8, 8, 1) : state.h, k: enabled.includes("k") ? clampSnap(w.y, -6, 6, 1) : state.k }, "PREVIEW_VERTEX"); }
    if (gesture.current.mode === "stretch") { const w = world(p.x, p.y); let a = clampSnap(w.y - state.k, -3, 3, .5); if (Math.abs(a) < .5) a = a < 0 ? -.5 : .5; onCommit({ ...state, a }, "PREVIEW_STRETCH"); }
  };
  const up = (event: ReactPointerEvent<HTMLCanvasElement>) => { pointers.current.delete(event.pointerId); if (pointers.current.size) return; const g = gesture.current; gesture.current = null; if (g && (g.mode === "vertex" || g.mode === "stretch") && JSON.stringify(g.before) !== JSON.stringify(state)) onCommit(state, g.mode === "vertex" ? "MOVE_VERTEX" : "STRETCH_CURVE"); };
  return <div className="graph-wrap" ref={wrapRef}>
    {/* A keyboard-focusable application region is the correct semantic model for this multi-handle canvas. */}
    {/* eslint-disable-next-line jsx-a11y/no-interactive-element-to-noninteractive-role */}
    <canvas ref={canvasRef} role="application" tabIndex={0} aria-label="Interactive quadratic coordinate plane. Drag the vertex or stretch handle; use plus and minus to zoom." onKeyDown={e => { if (e.key === "+" || e.key === "=") setView(v => ({ ...v, scale: Math.min(90, v.scale * 1.1) })); if (e.key === "-") setView(v => ({ ...v, scale: Math.max(24, v.scale * .9) })); if (e.key === "Home") setView({ scale: 42, panX: 0, panY: 0 }); }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={e => { e.preventDefault(); setView(v => ({ ...v, scale: Math.max(24, Math.min(90, v.scale * (e.deltaY > 0 ? .9 : 1.1))) })); }} />
    <div className="graph-tools"><button onClick={() => setView({ scale: 42, panX: 0, panY: 0 })}>⌂ <span>Reset view</span></button><div><i className="player" />Yours <i className="target" />Target</div></div>
    {!reducedMotion && <div className="graph-aurora" />}
  </div>;
}

function ParabolaValley({ onBack, progress, completeLevel }: GameProps) {
  const [levelIndex, setLevelIndex] = useState(() => Math.max(0, QUADRATIC_LEVELS.findIndex(l => !progress.completed[l.id])));
  const [endlessLevel, setEndlessLevel] = useState<(typeof QUADRATIC_LEVELS)[number] | null>(null);
  const endlessRun = useRef(0);
  const level: QuadraticLevel = endlessLevel ?? QUADRATIC_LEVELS[levelIndex];
  const layerMeta = LEARNING_LAYERS[level.layerIndex ?? 0];
  const makeHistory = useCallback(() => createHistory(level.start), [level.start]); const [history, setHistory] = useState<HistoryState<QuadraticState>>(makeHistory);
  const [preview, setPreview] = useState<QuadraticState | null>(null); const [showComplete, setShowComplete] = useState(false); const [hintTier, setHintTier] = useState(0);
  const play = useAudio(progress.sound, progress.haptics); const state = preview ?? history.present; const matched = quadraticMatches(state, level.target);
  const changeLevel = (index: number) => { setEndlessLevel(null); setLevelIndex(index); setHistory(createHistory(QUADRATIC_LEVELS[index].start)); setPreview(null); setShowComplete(false); setHintTier(0); };
  const startEndless = () => { const next = generateEndlessLevel("parabola", endlessRun.current++); setEndlessLevel(next); setHistory(createHistory(next.start)); setPreview(null); setHintTier(0); setShowComplete(false); };
  const graphCommit = (next: QuadraticState, type: string) => { if (type.startsWith("PREVIEW")) { setPreview(next); return; } const final = preview ?? next; setPreview(null); setHistory(h => commit(h, type, final, formatQuadratic(final))); play(quadraticMatches(final, level.target) ? "win" : "good"); };
  const nudge = (key: keyof QuadraticState, delta: number) => { if (!level.enabled.includes(key)) return; const next = { ...history.present, [key]: clampSnap(history.present[key] + delta, key === "a" ? -3 : key === "h" ? -8 : -6, key === "a" ? 3 : key === "h" ? 8 : 6, key === "a" ? .5 : 1) }; if (key === "a" && Math.abs(next.a) < .5) next.a = delta > 0 ? .5 : -.5; setHistory(h => commit(h, `NUDGE_${key.toUpperCase()}`, next)); play(quadraticMatches(next, level.target) ? "win" : "tap"); };
  const validate = () => { if (matched) { const stars = starsFor(0, history.past.length, level.targetMoves ?? 3); completeLevel(level.id, stars, history.past.length); play("win"); setShowComplete(true); } else { if (level.mistakeLimit === 0) reset(); play("bad"); } };
  const reset = useCallback(() => { setHistory(makeHistory()); setPreview(null); }, [makeHistory]); useKeyboardHistory(() => setHistory(h => undo(h)), () => setHistory(h => redo(h)), reset);
  const hint = hintTier === 0 ? null : hintTier === 1 ? "Compare the glowing vertex and opening direction with the ghost curve." : hintTier === 2 ? `Target vertex: (${level.target.h}, ${level.target.k}).` : `Target parameters: a = ${level.target.a}, h = ${level.target.h}, k = ${level.target.k}.`;
  return <div className="world-screen parabola-world">
    <WorldHeader world="parabola" levelName={level.name} progressLabel={endlessLevel ? `Endless · seed ${level.seed}` : `${layerMeta.name} · ${(level.sequence ?? 0) + 1} of 8`} onBack={onBack} history={history as HistoryState<unknown>} onUndo={() => setHistory(h => undo(h))} onRedo={() => setHistory(h => redo(h))} onHint={level.hintLimit ? () => setHintTier(t => Math.min(level.hintLimit!, t + 1)) : undefined} />
    <div className="game-layout graph-layout">
      <aside className="mission-panel"><span className="mission-index">{String((level.sequence ?? 0) + 1).padStart(2, "0")}</span><span className="overline">{layerMeta.glyph} {layerMeta.name} · Quadratic resonance</span><h1>Match the<br />ghost curve</h1><p>{level.layer === "discover" ? "Move the solid curve until it rests on the ghost. Notice what each handle changes." : "Move the vertex and shape the curve. Geometry and equation are two views of the same state."}</p>
        <div className="equation target-equation"><small>TARGET</small><span>{level.hideTargetEquation && !showComplete ? "Mystery curve — read its shape" : formatQuadratic(level.target)}</span></div><div className={`equation live-equation ${matched ? "matched" : ""}`}><small>YOUR CURVE</small><span>{formatQuadratic(state)}</span></div>
        {(level.layer === "challenge" || level.layer === "master") && <div className="constraint-strip"><span>Target ≤ {level.targetMoves} transformations</span><span>{level.mistakeLimit === 0 ? "Wrong test restarts" : "Precision challenge"}</span></div>}
        <div className="parameter-grid">{(["a", "h", "k"] as const).map(key => <div key={key} className={!level.enabled.includes(key) ? "disabled" : ""}><span>{key}</span><button aria-label={`Decrease ${key}`} onClick={() => nudge(key, key === "a" ? -.5 : -1)} disabled={!level.enabled.includes(key)}>−</button><b>{state[key]}</b><button aria-label={`Increase ${key}`} onClick={() => nudge(key, key === "a" ? .5 : 1)} disabled={!level.enabled.includes(key)}>+</button></div>)}</div>
        {hint && <div className="hint-bubble graph-hint"><b>Valley signal</b>{hint}</div>}
        <button className={`button validate ${matched ? "ready" : ""}`} onClick={validate}>{matched ? "Resonance found" : "Test resonance"}<span>✦</span></button>
      </aside>
      <section className="play-stage graph-stage"><ParabolaCanvas state={state} target={level.target} enabled={level.enabled} reducedMotion={progress.reducedMotion} onCommit={graphCommit} /><div className="gesture-legend"><span><i className="vertex-key" />Drag vertex</span>{level.enabled.includes("a") && <span><i className="stretch-key" />Drag gold handle</span>}<span>Two fingers: zoom</span></div></section>
    </div>
    <CampaignDock levels={QUADRATIC_LEVELS} active={level as (typeof QUADRATIC_LEVELS)[number]} progress={progress} onSelect={changeLevel} onEndless={startEndless} />
    {showComplete && <CompletionOverlay title="Curves in resonance" copy={`${formatQuadratic(state)} — exact mathematical match`} stars={starsFor(0, history.past.length, level.targetMoves ?? 3)} onMap={onBack} onReplay={() => { setShowComplete(false); replayCommands(history, setHistory, () => setShowComplete(true)); }} onNext={() => endlessLevel ? startEndless() : levelIndex < QUADRATIC_LEVELS.length - 1 ? changeLevel(levelIndex + 1) : onBack()} nextLabel={endlessLevel ? "New expedition" : levelIndex < QUADRATIC_LEVELS.length - 1 ? "Next curve" : "World map"} />}
  </div>;
}

function FamilyWorld({ world, onBack, progress, completeLevel }: GameProps & { world: FamilyWorldId }) {
  const levels = FAMILY_LEVELS[world];
  const [levelIndex, setLevelIndex] = useState(() => Math.max(0, levels.findIndex(level => !progress.completed[level.id])));
  const [endlessLevel, setEndlessLevel] = useState<FamilyLevel | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("Build the mechanism, then test your reasoning.");
  const [hintTier, setHintTier] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const endlessRun = useRef(0);
  const level = endlessLevel ?? levels[levelIndex];
  const layer = LEARNING_LAYERS[level.layerIndex];
  const meta = WORLD_META[world];
  const play = useAudio(progress.sound, progress.haptics);
  const resetRun = useCallback(() => { setSelected([]); setMistakes(0); setMessage("Build the mechanism, then test your reasoning."); setHintTier(0); setShowComplete(false); }, []);
  const changeLevel = (index: number) => { setEndlessLevel(null); setLevelIndex(index); resetRun(); };
  const startEndless = () => { setEndlessLevel(generateFamilyEndless(world, endlessRun.current++)); resetRun(); };
  const appendToken = (token: string) => { if (selected.length >= level.solution.length) return; setSelected(items => [...items, token]); setMessage(`${token} placed. ${Math.max(0, level.solution.length - selected.length - 1)} step${level.solution.length - selected.length - 1 === 1 ? "" : "s"} remain.`); play("tap"); };
  const testSolution = () => {
    const correct = selected.length === level.solution.length && selected.every((token, index) => token === level.solution[index]);
    if (!correct) {
      play("bad");
      if (level.mistakeLimit === 0) { setSelected([]); setMistakes(0); setMessage("Master rule broken — the mechanism reset."); }
      else if (level.mistakeLimit !== undefined && mistakes + 1 > level.mistakeLimit) { setSelected([]); setMistakes(0); setMessage("Challenge error limit reached — the mechanism reset."); }
      else { setMistakes(value => value + 1); setMessage("That arrangement cannot complete the mechanism. Rebuild and test again."); setSelected([]); }
      return;
    }
    const moves = selected.length + mistakes; const stars = starsFor(mistakes, moves, level.targetMoves);
    completeLevel(level.id, stars, moves); setMessage("The mechanism resonates. Your reasoning is sound."); play("win"); setShowComplete(true);
  };
  const hint = hintTier ? level.hint : null;
  useKeyboardHistory(() => setSelected(items => items.slice(0, -1)), () => {}, resetRun);
  return <div className={`world-screen family-world ${meta.color}-world`}>
    <WorldHeader world={world} levelName={level.name} progressLabel={endlessLevel ? `Endless · seed ${level.seed}` : `${layer.name} · ${level.sequence + 1} of 8`} onBack={onBack} onUndo={() => setSelected(items => items.slice(0, -1))} history={{ present: selected, past: selected.map((_, index) => ({ id: String(index), type: "PLACE", before: [], after: [], legal: true, cost: 1, timestamp: 0 })), future: [] }} onHint={level.hintLimit ? () => setHintTier(tier => Math.min(level.hintLimit, tier + 1)) : undefined} />
    <div className="game-layout family-layout">
      <aside className="mission-panel"><span className="mission-index">{String(level.sequence + 1).padStart(2, "0")}</span><span className="overline">{layer.glyph} {layer.name} · {meta.concept}</span><h1>{level.prompt}</h1><p>{level.instruction}</p>
        <div className="family-readout"><small>START</small><b>{level.startLabel}</b><i>→</i><small>GOAL</small><b>{level.targetLabel}</b></div>
        {(level.layer === "challenge" || level.layer === "master") && <div className="constraint-strip"><span>Target ≤ {level.targetMoves} placements</span><span>{level.mistakeLimit === 0 ? "One error resets" : `≤ ${level.mistakeLimit} errors`}</span></div>}
        <div className="metric-grid"><div><span>{selected.length}</span><small>Placed</small></div><div><span>{level.solution.length}</span><small>Required</small></div><div><span>{mistakes}</span><small>Errors</small></div></div>
        {level.facts && <div className="family-facts">{level.facts.map(fact => <span key={fact}>{fact}</span>)}</div>}
      </aside>
      <section className={`play-stage family-stage visual-${level.visual}`} aria-label={`${meta.name} puzzle mechanism`}>
        <div className="family-atmosphere"><i /><i /><i /></div>
        <div className="mechanic-emblem" aria-hidden="true"><span>{meta.icon}</span><i /><i /></div>
        <div className="mechanic-path"><div className="mechanic-origin"><small>ORIGIN</small><b>{level.startLabel}</b></div><span className="path-line" />{level.solution.map((_, index) => <button key={index} className={selected[index] ? "filled" : ""} onClick={() => setSelected(items => items.slice(0, index))} aria-label={`Mechanism slot ${index + 1}`}>{selected[index] ?? index + 1}</button>)}<span className="path-line" /><div className="mechanic-target"><small>TARGET</small><b>{level.targetLabel}</b></div></div>
        <div className="token-bank" role="group" aria-label="Available mechanism pieces">{level.tokens.map(token => <button key={token} onClick={() => appendToken(token)} disabled={selected.length >= level.solution.length}><span>{token}</span><i>PLACE</i></button>)}</div>
        <div className={`family-feedback ${message.includes("cannot") || message.includes("broken") ? "warn" : ""}`}><span>{showComplete ? "✓" : meta.icon}</span><p>{message}</p></div>
        {hint && <div className="hint-bubble family-hint"><b>{meta.name} signal</b>{hint}</div>}
        <div className="family-actions"><button className="button secondary" onClick={() => setSelected([])} disabled={!selected.length}>Clear</button><button className={`button primary ${selected.length === level.solution.length ? "ready" : ""}`} onClick={testSolution} disabled={selected.length !== level.solution.length}>Test mechanism <span>✦</span></button></div>
      </section>
    </div>
    <CampaignDock levels={levels} active={level} progress={progress} onSelect={changeLevel} onEndless={startEndless} />
    {showComplete && <CompletionOverlay title={`${meta.name} restored`} copy={`${selected.length} placements · ${mistakes} incorrect decisions · seed ${level.seed}`} stars={starsFor(mistakes, selected.length + mistakes, level.targetMoves)} onMap={onBack} onNext={() => endlessLevel ? startEndless() : levelIndex < levels.length - 1 ? changeLevel(levelIndex + 1) : onBack()} nextLabel={endlessLevel ? "New expedition" : levelIndex < levels.length - 1 ? "Next mission" : "World map"} />}
  </div>;
}

function Settings({ progress, update, close }: { progress: Progress; update: (patch: Partial<Progress>) => void; close: () => void }) {
  return <div className="settings-backdrop"><section className="settings-card" role="dialog" aria-modal="true" aria-label="Settings"><div><span className="overline">Atlas controls</span><h2>Settings</h2><button onClick={close} aria-label="Close settings">×</button></div>
    <div className="setting-row"><span><b>Sound design</b><small>Responsive harmonic cues</small></span><input aria-label="Sound design" type="checkbox" checked={progress.sound} onChange={e => update({ sound: e.target.checked })} /></div>
    <div className="setting-row"><span><b>Haptic feedback</b><small>Supported touch devices</small></span><input aria-label="Haptic feedback" type="checkbox" checked={progress.haptics} onChange={e => update({ haptics: e.target.checked })} /></div>
    <div className="setting-row"><span><b>Reduced motion</b><small>Calmer transitions and effects</small></span><input aria-label="Reduced motion" type="checkbox" checked={progress.reducedMotion} onChange={e => update({ reducedMotion: e.target.checked })} /></div>
    <p>Progress is stored privately on this device.</p></section></div>;
}

export default function MathLogicGame() {
  const [screen, setScreen] = useState<Screen>("map"); const [progress, setProgress] = useState<Progress>(DEFAULT_PROGRESS); const [settings, setSettings] = useState(false); const [toast, setToast] = useState<Toast>(null);
  // Hydrate device-local progress after mount so server and client markup stay identical.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setProgress(loadProgress()), []);
  useEffect(() => { window.scrollTo({ top: 0, left: 0 }); }, [screen]);
  useEffect(() => { if (typeof window !== "undefined") localStorage.setItem("axiom-progress-v1", JSON.stringify(progress)); document.documentElement.dataset.reducedMotion = String(progress.reducedMotion); }, [progress]);
  const completeLevel = useCallback((id: string, stars: number, moves: number) => { setProgress(old => { const prior = old.completed[id]; return { ...old, completed: { ...old.completed, [id]: { stars: Math.max(stars, prior?.stars ?? 0), bestMoves: Math.min(moves, prior?.bestMoves ?? Infinity), completedAt: Date.now() } } }; }); setToast({ kind: "success", text: `Mastery saved · ${stars} stars` }); window.setTimeout(() => setToast(null), 2600); }, []);
  const sound = useAudio(progress.sound, progress.haptics); const props = { onBack: () => setScreen("map"), progress, completeLevel, sound };
  return <div className={`axiom-app ${progress.reducedMotion ? "reduced-motion" : ""}`}>
    {screen === "map" && <WorldMap progress={progress} onEnter={world => { sound("tap"); setScreen(world); }} />}
    {screen === "bubble" && <BubbleVillage {...props} />}{screen === "tree" && <TreeGarden {...props} />}{screen === "parabola" && <ParabolaValley {...props} />}
    {screen !== "map" && FAMILY_WORLD_IDS.includes(screen as FamilyWorldId) && <FamilyWorld {...props} world={screen as FamilyWorldId} />}
    <button className="settings-button" onClick={() => setSettings(true)} aria-label="Open settings">⚙</button>
    {settings && <Settings progress={progress} update={patch => setProgress(p => ({ ...p, ...patch }))} close={() => setSettings(false)} />}
    {toast && <div className={`toast ${toast.kind}`}>{toast.text}</div>}
  </div>;
}
