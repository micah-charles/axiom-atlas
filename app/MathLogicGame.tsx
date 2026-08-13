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
import { validateModeSelection } from "./games/mode-frameworks";
import { ADVANCED_ACTS, ADVANCED_CAMPAIGN, AdvancedLevelDefinition, advancedActRule, advancedActUnlocked, advancedNotation, closedPath, complexMultiply, curl, determinant, divergence, discreteSpectrum, generateAdvancedExpedition, gaussianHeight, jacobian, lineIntegral, logisticTrajectory, lotkaVolterraStep, monteCarloEstimate, multiplyMatrix, polygonArea, polylineLength, selectedPathWeight, shortestPath, springStep, surfaceFlux3D, tangentSlope, triangleArea, trapezoidIntegral } from "./games/advanced-engines";
import { FAMILY_WORLD_IDS, WORLD_IDS, WORLD_META } from "./games/world-registry";

type Screen = "map" | WorldId | "advanced";
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

function WorldMap({ progress, onEnter }: { progress: Progress; onEnter: (world: Screen) => void }) {
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
    <button className="advanced-launch" onClick={() => onEnter("advanced")}><span>∞</span><div><b>Advanced Worlds</b><small>Calculus, fields, dynamics, signals, matrices, and complex planes</small></div><i>Enter simulation lab →</i></button>
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

function ActGuide({ level }: { level: AdvancedLevelDefinition }) {
  const meta = ADVANCED_ACTS.find(act => act.id === level.act)!;
  const variant = level.seed === undefined ? "Campaign mission" : `Seeded expedition · ${Math.abs(level.seed) % 7 + 1}`;
  return <div className="act-guide" aria-label={`${meta.label}: ${meta.instruction}`}><span>{meta.verb}</span><div><b>{meta.label}</b><small>{meta.instruction}</small><em>{variant}</em>{meta.revealNotation && <code>{advancedNotation(level.concept)}</code>}</div>{meta.revealNotation && <i>Notation unlocked</i>}</div>;
}

function AdvancedRoute({ level, children }: { level: AdvancedLevelDefinition; children: React.ReactNode }) {
  const launch = () => { if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent<AdvancedLevelDefinition>("advanced-expedition", { detail: generateAdvancedExpedition(Date.now(), undefined, level.act) })); };
  return <div className="advanced-route"><ActGuide level={level} /><button className="advanced-expedition-button" onClick={launch}>✦ New expedition</button>{children}</div>;
}

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

function ModeBoard({ level, selected, onRemove }: { level: FamilyLevel; selected: string[]; onRemove: (index: number) => void }) {
  const { framework } = level;
  const slots = level.solution.map((_, index) => <button key={index} className={selected[index] ? "filled" : ""} onClick={() => onRemove(index)} aria-label={`Mechanism slot ${index + 1}`}>{selected[index] ?? index + 1}</button>);
  if (framework.board === "balance") return <div className="mode-board mode-balance"><div className="balance-pan"><small>LEFT TOWER</small><b>{selected.slice(0, Math.ceil(level.solution.length / 2)).join(" ") || "?"}</b></div><div className="balance-beam"><i /><span>⚖</span><i /></div><div className="balance-pan"><small>RIGHT TOWER</small><b>{level.targetLabel}</b></div><div className="mode-slots">{slots}</div></div>;
  if (framework.board === "bridge") return <div className="mode-board mode-bridge"><div className="bridge-deck"><span>◢</span>{slots}<span>◣</span></div><div className="bridge-water"><i /><i /><i /></div></div>;
  if (framework.board === "forest") return <div className="mode-board mode-forest"><div className="forest-gates"><div>TRUTH</div>{slots}<div>SAFE PATH</div></div><div className="forest-roots"><i /><i /><i /></div></div>;
  if (framework.board === "harbor") return <div className="mode-board mode-harbor"><div className="harbor-water"><span>⚓</span>{slots}<span>⚓</span></div><div className="harbor-meter"><i style={{ width: `${Math.min(100, selected.length / Math.max(1, level.solution.length) * 100)}%` }} /></div></div>;
  if (framework.board === "routes") return <div className="mode-board mode-routes"><div className="route-map"><span className="route-node">PORT</span>{slots}<span className="route-node">GOAL</span></div><div className="route-weather">◌ ◌ ◌</div></div>;
  if (framework.board === "constellation") return <div className="mode-board mode-constellation"><div className="star-field">{slots}<span>✦</span><span>✧</span><span>·</span></div></div>;
  if (framework.board === "grid") return <div className="mode-board mode-grid"><div className="coordinate-grid">{slots}<span>⌖</span></div><small>VECTOR POSITION · {selected.length},{level.solution.length}</small></div>;
  if (framework.board === "network") return <div className="mode-board mode-network"><div className="network-map"><span>A</span>{slots}<span>F</span></div><div className="network-edges">A──B B──E E──F</div></div>;
  if (framework.board === "machines") return <div className="mode-board mode-machines"><div className="machine-chain"><span>INPUT</span>{slots}<span>OUTPUT</span></div><div className="machine-trace">f(x) → {selected.length ? selected.join(" → ") : "waiting"}</div></div>;
  if (framework.board === "valley") return <div className="mode-board mode-valley"><div className="valley-ridge"><span>WORKERS</span>{slots}<span>HARVEST</span></div><div className="resource-bars"><i /><i /><i /></div></div>;
  return <div className="mode-board mode-conveyor"><div className="conveyor-belt"><span>ORIGIN</span>{slots}<span>TARGET</span></div><div className="conveyor-lights"><i /><i /><i /></div></div>;
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
    const correct = validateModeSelection(level.framework, selected, level.solution);
    if (!correct) {
      play("bad");
      if (level.mistakeLimit === 0) { setSelected([]); setMistakes(0); setMessage("Master rule broken — the mechanism reset."); }
      else if (level.mistakeLimit !== undefined && mistakes + 1 > level.mistakeLimit) { setSelected([]); setMistakes(0); setMessage("Challenge error limit reached — the mechanism reset."); }
      else { setMistakes(value => value + 1); setMessage("That arrangement cannot complete the mechanism. Rebuild and test again."); setSelected([]); }
      return;
    }
    const moves = selected.length + mistakes; const stars = starsFor(mistakes, moves, level.targetMoves);
    completeLevel(level.id, stars, moves); setMessage(`${level.framework.success}. Your reasoning is sound.`); play("win"); setShowComplete(true);
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
      <section className={`play-stage family-stage visual-${level.visual} framework-${level.framework.board}`} aria-label={`${meta.name} puzzle mechanism`}>
        <div className="family-atmosphere"><i /><i /><i /></div>
        <div className="mechanic-emblem" aria-hidden="true"><span>{meta.icon}</span><i /><i /></div>
        <div className="framework-caption"><span>{level.framework.mechanic}</span><b>{level.framework.feedback}</b></div>
        <ModeBoard level={level} selected={selected} onRemove={index => setSelected(items => items.slice(0, index))} />
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

function PathInstrument({ onPathChange }: { onPathChange: (points: { x: number; y: number }[]) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const pointsRef = useRef<{ x: number; y: number }[]>([]); const drawingRef = useRef(false);
  const draw = useCallback(() => { const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return; const ratio = window.devicePixelRatio || 1; const width = canvas.clientWidth; const height = canvas.clientHeight; canvas.width = width * ratio; canvas.height = height * ratio; context.scale(ratio, ratio); context.clearRect(0, 0, width, height); context.strokeStyle = "rgba(126,219,212,.12)"; context.lineWidth = 1; for (let x = 20; x < width; x += 32) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke(); } for (let y = 20; y < height; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke(); } const points = pointsRef.current; if (points.length < 1) return; context.strokeStyle = "#7edbd4"; context.lineWidth = 4; context.lineCap = "round"; context.lineJoin = "round"; context.beginPath(); points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y)); context.stroke(); points.forEach((point, index) => { if (index === 0 || index === points.length - 1) { context.fillStyle = index === 0 ? "#ffd166" : "#7edbd4"; context.beginPath(); context.arc(point.x, point.y, 7, 0, Math.PI * 2); context.fill(); } }); }, []);
  useEffect(() => { draw(); window.addEventListener("resize", draw); return () => window.removeEventListener("resize", draw); }, [draw]);
  const pointFromEvent = (event: ReactPointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: event.clientX - rect.left, y: event.clientY - rect.top }; };
  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => { event.currentTarget.setPointerCapture(event.pointerId); drawingRef.current = true; pointsRef.current = [pointFromEvent(event)]; draw(); onPathChange(pointsRef.current); };
  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => { if (!drawingRef.current) return; const point = pointFromEvent(event); const previous = pointsRef.current.at(-1); if (!previous || Math.hypot(point.x - previous.x, point.y - previous.y) > 5) { pointsRef.current = [...pointsRef.current, point]; draw(); onPathChange(pointsRef.current); } };
  const end = () => { drawingRef.current = false; };
  return <div className="path-instrument"><canvas ref={canvasRef} aria-label="Draw a route through the vector field" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} /><div><span><i className="path-start" />Start</span><span><i className="path-end" />Destination</span><small>Drag to draw a route through the field</small></div></div>;
}

function FieldSensor({ mode, onSensorChange }: { mode: "divergence" | "curl"; onSensorChange: (point: { x: number; y: number }) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const [sensor, setSensor] = useState({ x: .5, y: .5 });
  const draw = useCallback(() => { const canvas = canvasRef.current; if (!canvas) return; const context = canvas.getContext("2d"); if (!context) return; const ratio = window.devicePixelRatio || 1; const width = canvas.clientWidth; const height = canvas.clientHeight; canvas.width = width * ratio; canvas.height = height * ratio; context.scale(ratio, ratio); context.fillStyle = "#080d18"; context.fillRect(0, 0, width, height); context.strokeStyle = "rgba(126,219,212,.12)"; context.lineWidth = 1; for (let x = 18; x < width; x += 36) for (let y = 18; y < height; y += 36) { const dx = x / width - .5; const dy = y / height - .5; const vx = mode === "curl" ? -dy : dx; const vy = mode === "curl" ? dx : dy; context.beginPath(); context.moveTo(x, y); context.lineTo(x + vx * 13, y + vy * 13); context.stroke(); } context.strokeStyle = mode === "curl" ? "#ff9f68" : "#7edbd4"; context.lineWidth = 3; context.beginPath(); context.arc(sensor.x * width, sensor.y * height, 25, 0, Math.PI * 2); context.stroke(); context.fillStyle = context.strokeStyle; context.beginPath(); context.arc(sensor.x * width, sensor.y * height, 5, 0, Math.PI * 2); context.fill(); }, [mode, sensor]);
  useEffect(() => { draw(); window.addEventListener("resize", draw); return () => window.removeEventListener("resize", draw); }, [draw]);
  const place = (event: ReactPointerEvent<HTMLCanvasElement>) => { const rect = event.currentTarget.getBoundingClientRect(); const next = { x: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)), y: Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)) }; setSensor(next); onSensorChange({ x: (next.x - .5) * 4, y: (next.y - .5) * 4 }); };
  return <div className="field-instrument"><canvas ref={canvasRef} aria-label={`Place ${mode} sensor`} onPointerDown={place} /><div><b>{mode === "curl" ? "WHIRL SENSOR" : "FLOW SENSOR"}</b><small>Click anywhere to relocate the instrument</small></div></div>;
}

function FieldWorld({ mode, level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { mode: "divergence" | "curl"; level: AdvancedLevelDefinition }) {
  const [point, setPoint] = useState({ x: 1, y: 1 }); const [radius, setRadius] = useState(1); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const measure = mode === "curl" ? curl(pointValue => ({ x: -pointValue.y, y: pointValue.x }), point) : divergence(pointValue => ({ x: pointValue.x, y: pointValue.y }), point); const reading = mode === "curl" ? `Rotation ${measure.toFixed(2)} rad/s` : `Expansion ${ (measure / radius).toFixed(2) } units/s`;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">∇</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 measurements</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Vector field engine · measure act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>LOCAL MEASUREMENT</small><b>{reading}</b><span>Sensor position ({point.x.toFixed(1)}, {point.y.toFixed(1)})</span></div><label className="instrument-control">Sensor radius <input type="range" min=".5" max="3" step=".5" value={radius} onChange={event => setRadius(Number(event.target.value))} /><b>{radius.toFixed(1)}</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Record measurement" : "Replay field"} <span>✦</span></button></aside><section className="field-world-stage"><FieldSensor mode={mode} onSensorChange={setPoint} /><p>Place the instrument where the particles spread or spin most strongly, then record the reading.</p></section></div></div>;
}

function SeededCurveWorld({ mode, level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { mode: "integration" | "derivative"; level: AdvancedLevelDefinition }) {
  const actRule = advancedActRule(level.act);
  const seed = Math.abs(level.seed ?? 0);
  const amplitude = 14 + seed % 18;
  const target = Number(level.goal.target ?? (mode === "integration" ? 420 : 4));
  const [position, setPosition] = useState(4);
  const [resolution, setResolution] = useState(1);
  const [observations, setObservations] = useState(0);
  const rate = (x: number) => 30 + amplitude * (1 + Math.sin(x + seed % 6));
  const accumulated = trapezoidIntegral(rate, 0, position, Math.max(1, Math.round(position / resolution)));
  const slope = tangentSlope(x => x * x + Math.sin(x + seed % 4), position, Math.max(.05, resolution / 10));
  const reading = mode === "integration" ? accumulated : slope;
  const accurate = mode === "integration" ? Math.abs(reading - target) < Math.max(35, target * .12) : Math.abs(reading - target) < .7;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, accurate && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">{mode === "integration" ? "∫" : "′"}</span><span className="brand-copy"><b>{level.world}</b><small>Seeded {level.concept}</small></span></button><div className="level-progress"><span>{observations} / {actRule.minimumObservations} readings</span><div><i style={{ width: `${Math.min(100, observations / actRule.minimumObservations * 100)}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Seeded curve engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>{mode === "integration" ? "RESERVOIR TARGET" : "INSTANTANEOUS SLOPE"}</small><b>{reading.toFixed(2)} / {target.toFixed(2)}</b><span>Variant seed {level.seed} · amplitude {amplitude}</span></div><label className="instrument-control">Probe position <input type="range" min="1" max="8" step=".5" value={position} onChange={event => setPosition(Number(event.target.value))} /><b>{position.toFixed(1)}</b></label><label className="instrument-control">Resolution <input type="range" min=".25" max="2" step=".25" value={resolution} onChange={event => setResolution(Number(event.target.value))} /><b>{resolution.toFixed(2)}</b></label><button className="button primary" onClick={observe}>{observations < actRule.minimumObservations ? `${actRule.verb} reading` : "Replay expedition"} <span>✦</span></button></aside><section className="field-world-stage curve-stage"><div className="curve-visual"><div className="curve-river seeded-curve" style={{ opacity: .55 + amplitude / 60 }} /><div className="curve-marker" style={{ left: `${position / 8 * 78 + 10}%` }}><span>{mode === "integration" ? "◈" : "A"}</span></div><div className="curve-baseline" /></div><p>Seed {level.seed} changes the curve profile. Adjust the probe and resolution, then compare the measured reading with this expedition’s target.</p></section></div></div>;
}

function CurveWorld({ mode, level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { mode: "integration" | "derivative"; level: AdvancedLevelDefinition }) {
  const [probe, setProbe] = useState(4); const [sliceWidth, setSliceWidth] = useState(1); const [time, setTime] = useState(4); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const rate = (x: number) => 40 + 20 * Math.sin(x); const accumulated = trapezoidIntegral(rate, 0, time, Math.max(1, Math.round(time / sliceWidth))); const average = tangentSlope(x => x * x, probe / 2, Math.max(.05, sliceWidth / 10)); const target = mode === "integration" ? 420 : 4;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, actRule.revealNotation && (mode === "integration" ? Math.abs(accumulated - target) < 50 : Math.abs(average - target) < .5) ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">{mode === "integration" ? "∫" : "′"}</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 observations</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Curve engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>{mode === "integration" ? "RESERVOIR" : "SLOPE METER"}</small><b>{mode === "integration" ? `${accumulated.toFixed(0)} / ${target} units` : `${average.toFixed(2)} m/s`}</b><span>{mode === "integration" ? `Time ${time.toFixed(1)}s · slice ${sliceWidth.toFixed(1)}s` : `Marker gap ${(sliceWidth * 10).toFixed(1)}m · probe ${probe.toFixed(1)}`}</span></div>{mode === "integration" ? <><label className="instrument-control">Time scrub <input type="range" min="1" max="8" step=".5" value={time} onChange={event => setTime(Number(event.target.value))} /><b>{time.toFixed(1)} s</b></label><label className="instrument-control">Slice width <input type="range" min=".25" max="2" step=".25" value={sliceWidth} onChange={event => setSliceWidth(Number(event.target.value))} /><b>{sliceWidth.toFixed(2)} s</b></label></> : <><label className="instrument-control">Probe position <input type="range" min="1" max="8" step=".5" value={probe} onChange={event => setProbe(Number(event.target.value))} /><b>{probe.toFixed(1)} m</b></label><label className="instrument-control">Marker gap <input type="range" min=".1" max="2" step=".1" value={sliceWidth} onChange={event => setSliceWidth(Number(event.target.value))} /><b>{(sliceWidth * 10).toFixed(1)} m</b></label></>}<button className="button primary" onClick={observe}>{observations < 3 ? "Record reading" : "Replay curve"} <span>✦</span></button></aside><section className="field-world-stage curve-stage"><div className="curve-visual"><div className="curve-river" /><div className="curve-marker" style={{ left: `${mode === "integration" ? time / 8 * 78 + 10 : probe / 8 * 78 + 10}%` }}><span>{mode === "integration" ? "◈" : "A"}</span></div><div className="curve-slices">{mode === "integration" && Array.from({ length: Math.max(1, Math.round(time / sliceWidth)) }, (_, index) => <i key={index} style={{ width: `${Math.min(11, sliceWidth * 4)}%` }} />)}</div><div className="curve-baseline" /></div><p>{mode === "integration" ? "Water arrives continuously. Scrub time and change slice width to estimate the reservoir total." : "Move the second marker toward the first. Average slope converges toward the instantaneous slope."}</p></section></div></div>;
}

function GradientWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const partial = level.concept === "partial derivatives"; const [heading, setHeading] = useState(45); const [x, setX] = useState(0); const [y, setY] = useState(0); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const terrain = (px: number, py: number) => gaussianHeight({ x: px, y: py }, { x: 2, y: 2 }, 5) * 1000; const radians = heading * Math.PI / 180; const slope = (Math.cos(radians) * (2 - x) + Math.sin(radians) * (2 - y)) * 6; const altitude = terrain(x, y); const progress = Math.max(0, Math.min(100, ((x + y + 4) / 8) * 100));
  const climb = () => { const next = observations + 1; const dx = partial ? (observations % 2 === 0 ? .45 : 0) : Math.cos(radians) * .45; const dy = partial ? (observations % 2 === 1 ? .45 : 0) : Math.sin(radians) * .45; setX(value => Math.max(-2, Math.min(2.5, value + dx))); setY(value => Math.max(-2, Math.min(2.5, value + dy))); setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, slope > 0 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">∇</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 readings</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Field engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>{partial ? "EAST/WEST · NORTH/SOUTH" : "ALTIMETER / SLOPE"}</small><b>{altitude.toFixed(0)} m · {slope.toFixed(1)}°</b><span>Position ({x.toFixed(1)}, {y.toFixed(1)}) · summit progress {progress.toFixed(0)}%</span></div>{partial ? <div className="direction-lock"><span>LOCKED AXIS</span><b>{observations % 2 === 0 ? "EAST → WEST" : "NORTH → SOUTH"}</b></div> : <label className="instrument-control">Compass heading <input type="range" min="0" max="360" step="15" value={heading} onChange={event => setHeading(Number(event.target.value))} /><b>{heading}°</b></label>}<button className="button primary" onClick={climb}>{observations < 3 ? (partial ? "Measure axis" : "Take step") : "Replay expedition"} <span>✦</span></button></aside><section className="field-world-stage gradient-stage"><div className="gradient-visual"><div className="summit" /><div className="explorer" style={{ left: `${50 + x * 12}%`, top: `${50 - y * 12}%` }}>✦</div><div className="compass-needle" style={{ transform: `translate(-50%,-50%) rotate(${partial ? (observations % 2 === 0 ? 90 : 0) : heading}deg)` }} /><div className="gradient-readout">{partial ? (observations % 2 === 0 ? "∂x" : "∂y") : `N ${heading}°`}</div></div><p>{partial ? "Hold one coordinate still while stepping along the other. Compare the two local rates at the same terrain point." : "Rotate the compass to find the steepest direction, then climb. The gradient is experienced as a heading, not a symbol."}</p></section></div></div>;
}

function SailingWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const route = pathPoints.length > 1 ? pathPoints.map(point => ({ x: point.x / 42, y: point.y / 42 })) : [{ x: 0, y: 0 }, { x: 2, y: 0 }]; const energy = lineIntegral(() => ({ x: 2, y: 0 }), route); const distance = polylineLength(route); const goal = 4;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, energy >= goal && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">→</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 routes</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Flow engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>ENERGY / DISTANCE</small><b>{energy.toFixed(1)} / {distance.toFixed(1)}</b><span>Beacon threshold: {goal} energy units</span></div><button className="button primary" onClick={observe}>{observations < 3 ? "Sail and record" : "Replay route"} <span>✦</span></button></aside><section className="field-world-stage sailing-stage"><div className="sailing-arena"><div className="field-arrows">{Array.from({ length: 40 }, (_, index) => <i key={index} style={{ left: `${(index % 8) * 12 + 8}%`, top: `${Math.floor(index / 8) * 19 + 12}%` }}>→</i>)}</div><div className="sailing-beacon">BEACON</div><PathInstrument onPathChange={setPathPoints} /></div><p>Draw a route through the wind field. Direction along the field powers the ship; a detour changes the harvested energy.</p></section></div></div>;
}

function ChaosWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [growth, setGrowth] = useState(3.7); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const trajectory = logisticTrajectory(.21, growth, 30); const spread = Math.abs(trajectory.at(-1)! - trajectory[0]);
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, growth > 3.5 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">≈</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 trajectories</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Dynamic engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>SENSITIVITY / SPREAD</small><b>r = {growth.toFixed(2)} · {spread.toFixed(3)}</b><span>Seed 0.21 · 30 generations</span></div><label className="instrument-control">Growth parameter <input type="range" min="2.5" max="3.99" step=".01" value={growth} onChange={event => setGrowth(Number(event.target.value))} /><b>{growth.toFixed(2)}</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Record orbit" : "Replay orbit"} <span>✦</span></button></aside><section className="field-world-stage chaos-stage"><div className="chaos-visual"><div className="chaos-axis" />{trajectory.map((value, index) => <i key={index} style={{ left: `${(index / 29) * 88 + 6}%`, top: `${(1 - value) * 78 + 10}%` }} />)}<div className="chaos-label">GENERATION →</div></div><p>Turn the growth dial. Near the chaotic regime, a small parameter change reshapes the orbit over time.</p></section></div></div>;
}

function DynamicWorld({ mode, level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { mode: "population" | "spring"; level: AdvancedLevelDefinition }) {
  const [observations, setObservations] = useState(0); const [food, setFood] = useState(1); const [hunting, setHunting] = useState(.01); const [mass, setMass] = useState(1); const [stiffness, setStiffness] = useState(3); const [damping, setDamping] = useState(.4); const [population, setPopulation] = useState({ rabbits: 300, foxes: 20 }); const [spring, setSpring] = useState({ position: 1, velocity: 0 }); const actRule = advancedActRule(level.act);
  const readout = mode === "population" ? `Rabbits ${population.rabbits.toFixed(0)} · foxes ${population.foxes.toFixed(0)}` : `Bridge offset ${spring.position.toFixed(2)} · velocity ${spring.velocity.toFixed(2)}`;
  const observe = () => { const next = observations + 1; const dt = .1; if (mode === "population") setPopulation(state => lotkaVolterraStep(state, dt, { birth: food, predation: hunting, growth: .005, death: .8 })); else setSpring(state => springStep(state, dt, mass, stiffness, damping)); setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">∿</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 simulations</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Dynamic systems engine · control act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>LIVE SIMULATION</small><b>{readout}</b><span>Time step {Math.max(.1, observations * .1).toFixed(1)}</span></div>{mode === "population" ? <><label className="instrument-control">Food supply <input type="range" min=".5" max="1.8" step=".1" value={food} onChange={event => setFood(Number(event.target.value))} /><b>{food.toFixed(1)}</b></label><label className="instrument-control">Hunting pressure <input type="range" min=".002" max=".03" step=".002" value={hunting} onChange={event => setHunting(Number(event.target.value))} /><b>{hunting.toFixed(3)}</b></label></> : <><label className="instrument-control">Mass <input type="range" min=".5" max="3" step=".5" value={mass} onChange={event => setMass(Number(event.target.value))} /><b>{mass.toFixed(1)}</b></label><label className="instrument-control">Spring stiffness <input type="range" min="1" max="8" step=".5" value={stiffness} onChange={event => setStiffness(Number(event.target.value))} /><b>{stiffness.toFixed(1)}</b></label><label className="instrument-control">Damping <input type="range" min="0" max="1.5" step=".1" value={damping} onChange={event => setDamping(Number(event.target.value))} /><b>{damping.toFixed(1)}</b></label></>}<button className="button primary" onClick={observe}>{observations < 3 ? "Advance simulation" : "Replay simulation"} <span>✦</span></button></aside><section className={`dynamic-stage dynamic-${mode}`}><div className="dynamic-visual"><div className="dynamic-grid" /><div className="dynamic-orbit"><span>{mode === "population" ? "🐇" : "▣"}</span><i /><i /></div><div className="dynamic-bars"><b style={{ height: `${Math.min(95, mode === "population" ? population.rabbits / 5 : Math.abs(spring.position) * 70 + 10)}%` }} /><b style={{ height: `${Math.min(95, mode === "population" ? population.foxes * 2 : Math.abs(spring.velocity) * 70 + 10)}%` }} /></div></div><p>Change a system parameter, advance time, and observe the consequence.</p></section></div></div>;
}

function SurfaceWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [tilt, setTilt] = useState(0); const [azimuth, setAzimuth] = useState(0); const [area, setArea] = useState(1); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const tiltRadians = tilt * Math.PI / 180; const azimuthRadians = azimuth * Math.PI / 180;
  const normal = { x: Math.sin(tiltRadians) * Math.cos(azimuthRadians), y: Math.sin(tiltRadians) * Math.sin(azimuthRadians), z: Math.cos(tiltRadians) };
  const flux = surfaceFlux3D(() => ({ x: 2, y: 3, z: 8 }), normal, area);
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, flux >= 7.5 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">☼</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 alignments</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Flow engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>3D FLUX GAUGE</small><b>{flux.toFixed(2)} MW</b><span>Normal ({normal.x.toFixed(2)}, {normal.y.toFixed(2)}, {normal.z.toFixed(2)}) · safe zone 7.5–8.0</span></div><label className="instrument-control">Panel tilt <input type="range" min="-80" max="80" step="5" value={tilt} onChange={event => setTilt(Number(event.target.value))} /><b>{tilt}°</b></label><label className="instrument-control">Panel azimuth <input type="range" min="-180" max="180" step="10" value={azimuth} onChange={event => setAzimuth(Number(event.target.value))} /><b>{azimuth}°</b></label><label className="instrument-control">Shield area <input type="range" min=".5" max="1.5" step=".1" value={area} onChange={event => setArea(Number(event.target.value))} /><b>{area.toFixed(1)}×</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Record flux" : "Replay alignment"} <span>✦</span></button></aside><section className="field-world-stage surface-stage"><div className="surface-visual"><div className="sun-beam">☀︎ ☀︎ ☀︎</div><div className="surface-panel" style={{ transform: `perspective(520px) rotateX(${tilt}deg) rotateZ(${azimuth}deg) scale(${area})` }}><span>3D SHIELD</span></div><div className="surface-gauge">{flux.toFixed(1)} MW</div></div><p>Rotate a true 3D solar sail. Flux is the field’s dot product with the panel normal, multiplied by its area.</p></section></div></div>;
}

function StokesWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const route = closedPath(pathPoints.length > 1 ? pathPoints.map(point => ({ x: point.x / 42, y: point.y / 42 })) : [{ x: -2, y: -1 }, { x: 2, y: -1 }, { x: 2, y: 1 }, { x: -2, y: 1 }]); const boundary = lineIntegral(point => ({ x: -point.y, y: point.x }), route); const area = polygonArea(route); const interior = 2 * area;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">∮</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 investigations</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Flow engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>BOUNDARY / INTERIOR</small><b>{boundary.toFixed(2)} / {interior.toFixed(2)}</b><span>Enclosed area {area.toFixed(2)} · curl density 2.00</span></div><button className="button primary" onClick={observe}>{observations < 3 ? "Compare readings" : "Replay mystery"} <span>✦</span></button></aside><section className="field-world-stage stokes-stage"><PathInstrument onPathChange={setPathPoints} /><p>Trace any closed island boundary. The circulation around it should match the area-weighted curl inside.</p></section></div></div>;
}

function SoundWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [bird, setBird] = useState(80); const [machine, setMachine] = useState(30); const [filterStrength, setFilterStrength] = useState(0); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const residualNoise = machine * (1 - filterStrength / 100); const samples = Array.from({ length: 16 }, (_, index) => Math.sin(index * bird / 35) + residualNoise / 100 * Math.sin(index * 7 / 3)); const spectrum = discreteSpectrum(samples); const purity = Math.max(0, Math.min(100, 100 - residualNoise * .75 - Math.abs(bird - 80) * .08));
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, purity > 72 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">∿</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 mixes</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Signal engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>SIGNAL PURITY</small><b>{purity.toFixed(0)}%</b><span>Residual machine component: {residualNoise.toFixed(0)}%</span></div><label className="instrument-control">Bird call frequency <input type="range" min="40" max="140" step="5" value={bird} onChange={event => setBird(Number(event.target.value))} /><b>{bird} Hz</b></label><label className="instrument-control">Machine noise <input type="range" min="0" max="100" step="5" value={machine} onChange={event => setMachine(Number(event.target.value))} /><b>{machine}%</b></label><label className="instrument-control">Filter crystal <input type="range" min="0" max="100" step="5" value={filterStrength} onChange={event => setFilterStrength(Number(event.target.value))} /><b>{filterStrength}%</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Listen and record" : "Replay mix"} <span>✦</span></button></aside><section className="field-world-stage sound-stage"><div className="signal-visual"><div className="waveform">{samples.map((sample, index) => <i key={index} style={{ height: `${Math.max(8, Math.abs(sample) * 42)}%` }} />)}</div><div className="spectrum-bars">{spectrum.slice(0, 8).map((value, index) => <b key={index} style={{ height: `${Math.max(8, value * 110)}%` }}><small>{index + 1}</small></b>)}</div><div className="signal-labels"><span>TIME DOMAIN</span><span>FREQUENCY DOMAIN</span></div></div><p>Increase the filter crystal to suppress the machine component while preserving the bird call in both domains.</p></section></div></div>;
}

function EigenvectorWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [probeAngle, setProbeAngle] = useState(0); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const matrix: [number, number, number, number] = [1.6, .4, .2, .8]; const radians = probeAngle * Math.PI / 180; const probe = { x: Math.cos(radians), y: Math.sin(radians) }; const output = applyMatrix(matrix, probe); const drift = Math.abs(Math.atan2(output.y, output.x) - radians) * 180 / Math.PI; const growth = Math.hypot(output.x, output.y);
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, drift < 7 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">→</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 probe readings</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Transformation engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>DIRECTION DRIFT / GROWTH</small><b>{drift.toFixed(1)}° · {growth.toFixed(2)}×</b><span>Probe {probeAngle}° · output ({output.x.toFixed(2)}, {output.y.toFixed(2)})</span></div><label className="instrument-control">Probe direction <input type="range" min="-180" max="180" step="5" value={probeAngle} onChange={event => setProbeAngle(Number(event.target.value))} /><b>{probeAngle}°</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Send arrow through" : "Replay probe"} <span>✦</span></button></aside><section className="field-world-stage matrix-stage"><div className="matrix-visual"><div className="matrix-grid" /><div className="matrix-square" style={{ transform: `translate(-50%,-50%) rotate(${probeAngle}deg) scale(${Math.max(.7, Math.min(1.8, growth / 1.4))})` }}><span>→</span></div><div className="matrix-target">DRIFT {drift.toFixed(0)}°</div></div><p>Rotate the probe until the transformed arrow keeps its heading. That surviving direction is an eigenvector; its growth is the eigenvalue.</p></section></div></div>;
}

function JacobianWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [x, setX] = useState(0); const [y, setY] = useState(0); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const warp = (point: { x: number; y: number }) => ({ x: point.x + .25 * point.x * point.y, y: point.y + .2 * point.x * point.x }); const local = jacobian(warp, { x, y }); const area = determinant(local); const sample = applyMatrix(local, { x: .4, y: .4 });
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, Math.abs(area - 1) < .2 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">⌖</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 local calibrations</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Transformation engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>LOCAL JACOBIAN</small><b>[{local.map(value => value.toFixed(2)).join(" ")}]</b><span>At ({x.toFixed(1)}, {y.toFixed(1)}) · area scale {area.toFixed(2)}× · sample ({sample.x.toFixed(2)}, {sample.y.toFixed(2)})</span></div><label className="instrument-control">Gate X <input type="range" min="-2" max="2" step=".1" value={x} onChange={event => setX(Number(event.target.value))} /><b>{x.toFixed(1)}</b></label><label className="instrument-control">Gate Y <input type="range" min="-2" max="2" step=".1" value={y} onChange={event => setY(Number(event.target.value))} /><b>{y.toFixed(1)}</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Calibrate local grid" : "Replay calibration"} <span>✦</span></button></aside><section className="field-world-stage matrix-stage"><div className="matrix-visual"><div className="matrix-grid" /><div className="matrix-square" style={{ transform: `translate(-50%,-50%) skewX(${local[1] * 20}deg) scale(${Math.max(.7, Math.min(1.8, Math.abs(area)))})` }}><span>⌖</span></div><div className="matrix-target">LOCAL GRID</div></div><p>Move the gate through a curved field. Zooming in turns the nonlinear warp into a local matrix that can align the reference grid.</p></section></div></div>;
}

type MatrixMode = "matrix transformations" | "eigenvectors" | "determinant" | "Jacobian";
function MatrixWorld({ mode, level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { mode: MatrixMode; level: AdvancedLevelDefinition }) {
  const [angle, setAngle] = useState(30); const [stretch, setStretch] = useState(1.5); const [shear, setShear] = useState(0); const [order, setOrder] = useState<"rotate-stretch" | "stretch-rotate">("rotate-stretch"); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const radians = angle * Math.PI / 180; const rotation: [number, number, number, number] = [Math.cos(radians), -Math.sin(radians), Math.sin(radians), Math.cos(radians)]; const transform: [number, number, number, number] = [stretch, shear, 0, 1]; const matrix = order === "rotate-stretch" ? multiplyMatrix(rotation, transform) : multiplyMatrix(transform, rotation); const point = applyMatrix(matrix, { x: 1, y: .35 }); const area = determinant(matrix); const invariant = Math.abs(Math.atan2(point.y, point.x) - Math.atan2(.35, 1)) * 180 / Math.PI;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, mode === "determinant" && Math.abs(area - 1.5) < .2 && actRule.revealNotation ? 3 : 2, next); };
  const title = mode === "Jacobian" ? "Teleport Gate" : level.world;
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">▦</span><span className="brand-copy"><b>{title}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 transformations</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Transformation engine · {level.act} act</span><h1>{title}</h1><p>{level.objective}</p><div className="advanced-readout"><small>{mode === "determinant" ? "AREA SCALE" : mode === "eigenvectors" ? "DIRECTION DRIFT" : "LOCAL OUTPUT"}</small><b>{mode === "determinant" ? `${area.toFixed(2)}×` : mode === "eigenvectors" ? `${invariant.toFixed(1)}°` : `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`}</b><span>Order: {order === "rotate-stretch" ? "R → S" : "S → R"} · Matrix [ {matrix.map(value => value.toFixed(2)).join(" ")} ]</span></div><label className="instrument-control">Rotation <input type="range" min="-90" max="90" step="5" value={angle} onChange={event => setAngle(Number(event.target.value))} /><b>{angle}°</b></label><label className="instrument-control">Stretch <input type="range" min=".5" max="3" step=".1" value={stretch} onChange={event => setStretch(Number(event.target.value))} /><b>{stretch.toFixed(1)}×</b></label><label className="instrument-control">Shear <input type="range" min="-.8" max=".8" step=".1" value={shear} onChange={event => setShear(Number(event.target.value))} /><b>{shear.toFixed(1)}</b></label><div className="order-buttons"><button className={order === "rotate-stretch" ? "active" : ""} onClick={() => setOrder("rotate-stretch")}>ROTATE → STRETCH</button><button className={order === "stretch-rotate" ? "active" : ""} onClick={() => setOrder("stretch-rotate")}>STRETCH → ROTATE</button></div><button className="button primary" onClick={observe}>{observations < 3 ? "Send through chamber" : "Replay transformation"} <span>✦</span></button></aside><section className="field-world-stage matrix-stage"><div className="matrix-visual"><div className="matrix-grid" /><div className="matrix-square" style={{ transform: `translate(-50%,-50%) rotate(${angle}deg) skewX(${shear * 25}deg) scale(${stretch},1)` }}><span>{mode === "eigenvectors" ? "→" : mode === "Jacobian" ? "⌖" : "◇"}</span></div><div className="matrix-target">TARGET</div></div><p>Swap the crystal order. The final shape changes because matrix composition is not commutative.</p></section></div></div>;
}

type ComplexMode = "complex numbers" | "Euler formula";
function EulerWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [angle, setAngle] = useState(45); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const radians = angle * Math.PI / 180; const point = { x: Math.cos(radians), y: Math.sin(radians) }; const samples = Array.from({ length: 16 }, (_, index) => ({ x: Math.cos(radians + index * Math.PI / 4), y: Math.sin(radians + index * Math.PI / 4) }));
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">eⁱ</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept} · Act {level.act}</small></span></button><div className="level-progress"><span>{observations} / 3 rotations</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Plane engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>UNIT-CIRCLE PROJECTION</small><b>{point.x.toFixed(2)} + {point.y.toFixed(2)}i</b><span>cos θ = {point.x.toFixed(2)} · sin θ = {point.y.toFixed(2)}</span></div><label className="instrument-control">Rotation angle <input type="range" min="0" max="360" step="5" value={angle} onChange={event => setAngle(Number(event.target.value))} /><b>{angle}°</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Rotate and record" : "Replay wave"} <span>✦</span></button></aside><section className="field-world-stage complex-stage"><div className="complex-visual"><div className="complex-axis complex-x" /><div className="complex-axis complex-y" /><div className="complex-circle" /><div className="complex-point" style={{ left: `${50 + point.x * 20}%`, top: `${50 - point.y * 20}%` }}><span>•</span></div><div className="euler-wave cosine-wave">{samples.map((sample, index) => <i key={`c${index}`} style={{ height: `${Math.abs(sample.x) * 45 + 8}%` }} />)}</div><div className="euler-wave sine-wave">{samples.map((sample, index) => <i key={`s${index}`} style={{ height: `${Math.abs(sample.y) * 45 + 8}%` }} />)}</div></div><p>One rotating point produces two synchronized projections: cosine on the real axis and sine on the imaginary axis.</p></section></div></div>;
}

function ComplexWorld({ mode, level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { mode: ComplexMode; level: AdvancedLevelDefinition }) {
  const [portal, setPortal] = useState({ x: 1, y: 0 }); const [angle, setAngle] = useState(45); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act);
  const portalChoices = [{ label: "×2", value: { x: 2, y: 0 } }, { label: "×i", value: { x: 0, y: 1 } }, { label: "×(1+i)", value: { x: 1, y: 1 } }]; const target = { x: -2, y: 0 }; const output = mode === "complex numbers" ? portal : { x: Math.cos(angle * Math.PI / 180), y: Math.sin(angle * Math.PI / 180) }; const phase = Math.atan2(output.y, output.x) * 180 / Math.PI; const gateDistance = Math.hypot(output.x - target.x, output.y - target.y);
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, mode === "complex numbers" ? (gateDistance < .1 ? 3 : 2) : actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">i</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 portal readings</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Plane engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>{mode === "Euler formula" ? "ROTATION PROJECTION" : "PORTAL OUTPUT"}</small><b>{mode === "Euler formula" ? `${output.x.toFixed(2)} + ${output.y.toFixed(2)}i` : `(${output.x.toFixed(2)}, ${output.y.toFixed(2)})`}</b><span>Magnitude {Math.hypot(output.x, output.y).toFixed(2)} · phase {phase.toFixed(0)}°</span></div>{mode === "complex numbers" ? <div className="portal-buttons">{portalChoices.map(choice => <button key={choice.label} className={portal.x === choice.value.x && portal.y === choice.value.y ? "active" : ""} onClick={() => setPortal(complexMultiply(portal, choice.value))}>{choice.label}<small>apply portal</small></button>)}</div> : <label className="instrument-control">Rotation angle <input type="range" min="0" max="360" step="5" value={angle} onChange={event => setAngle(Number(event.target.value))} /><b>{angle}°</b></label>}<button className="button primary" onClick={observe}>{observations < 3 ? "Send through plane" : "Replay rotation"} <span>✦</span></button></aside><section className="field-world-stage complex-stage"><div className="complex-visual"><div className="complex-axis complex-x" /><div className="complex-axis complex-y" /><div className="complex-circle" /><div className="complex-point" style={{ left: `${50 + output.x * 20}%`, top: `${50 - output.y * 20}%` }}><span>•</span></div>{mode === "Euler formula" && <div className="projection-bars"><b style={{ height: `${Math.abs(output.x) * 100}%` }} /><b style={{ height: `${Math.abs(output.y) * 100}%` }} /></div>}</div><p>{mode === "Euler formula" ? "A point circling the unit circle projects into cosine and sine waves." : "Each portal multiplies a complex number: scaling changes distance, while i rotates the plane."}</p></section></div></div>;
}

function GraphWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const edges = [{ from: 0, to: 1, weight: 2 }, { from: 1, to: 3, weight: 3 }, { from: 0, to: 2, weight: 1 }, { from: 2, to: 3, weight: 6 }, { from: 1, to: 2, weight: 2 }]; const [selected, setSelected] = useState<number[]>([0, 1]); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const distance = selectedPathWeight(4, edges, selected, 0, 3); const best = shortestPath(4, edges, 0, 3); const connected = Number.isFinite(distance);
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, distance === best && actRule.revealNotation ? 3 : connected ? 2 : 1, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">⌘</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 routes</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Graph engine · control act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>PATH METER</small><b>{distance} km</b><span>Shortest known route: {best} km</span></div><button className="button primary" onClick={observe}>{observations < 3 ? "Test route" : "Replay route"} <span>✦</span></button></aside><section className="field-world-stage graph-stage-advanced"><div className="network-visual">{[[18,50],[42,25],[42,75],[76,50]].map(([left, top], index) => <span key={index} className={`network-node ${index === 0 ? "start" : index === 3 ? "goal" : ""}`} style={{ left: `${left}%`, top: `${top}%` }}>{index + 1}</span>)}{edges.map((edge, index) => <button key={index} className={`network-edge ${selected.includes(index) ? "active" : ""}`} style={{ left: `${index === 0 ? 26 : index === 1 ? 57 : index === 2 ? 26 : index === 3 ? 57 : 42}%`, top: `${index === 0 ? 38 : index === 1 ? 38 : index === 2 ? 62 : index === 3 ? 62 : 50}%` }} onClick={() => setSelected(items => items.includes(index) ? items.filter(item => item !== index) : [...items, index])}>+{edge.weight}</button>)}</div><p>Toggle the edges to make a connected route. Short paths teach optimisation without hiding the network.</p></section></div></div>;
}

function ProbabilityWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [trials, setTrials] = useState(20); const [observations, setObservations] = useState(0); const [runOffset, setRunOffset] = useState(0); const actRule = advancedActRule(level.act); let sampleIndex = 0; const estimate = monteCarloEstimate(trials, () => { const draw = sampleIndex + runOffset; sampleIndex++; return draw % 5 < 3; });
  const observe = () => { const next = observations + 1; setRunOffset(offset => offset + trials); setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, Math.abs(estimate - .6) < .08 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">⚄</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 trials</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Probability engine · measure act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>ESTIMATED CHANCE</small><b>{(estimate * 100).toFixed(0)}%</b><span>Hidden bias target: 60%</span></div><label className="instrument-control">Trial count <input type="range" min="5" max="100" step="5" value={trials} onChange={event => setTrials(Number(event.target.value))} /><b>{trials} draws</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Run sample" : "Replay sample"} <span>✦</span></button></aside><section className="field-world-stage probability-stage"><div className="probability-visual"><div className="probability-jar"><i style={{ height: `${estimate * 100}%` }} /><span>{(estimate * 100).toFixed(0)}%</span></div><div className="probability-trail">{Array.from({ length: Math.min(40, trials) }, (_, index) => <b key={index} className={index % 5 < 3 ? "success" : "failure"}>{index % 5 < 3 ? "●" : "○"}</b>)}</div></div><p>More trials make the estimate settle around the hidden probability.</p></section></div></div>;
}

function SeededProbabilityWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const actRule = advancedActRule(level.act); const seed = Math.abs(level.seed ?? 0); const target = Math.min(.85, .45 + (seed % 9) * .04); const [trials, setTrials] = useState(25); const [observations, setObservations] = useState(0); const [offset, setOffset] = useState(0); let index = 0; const estimate = monteCarloEstimate(trials, () => { const draw = index + offset; index++; return (draw + seed) % 10 < Math.round(target * 10); }); const accurate = Math.abs(estimate - target) < .08;
  const observe = () => { const next = observations + 1; setOffset(value => value + trials); setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, accurate && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">⚄</span><span className="brand-copy"><b>{level.world}</b><small>Seeded probability</small></span></button><div className="level-progress"><span>{observations} / {actRule.minimumObservations} trials</span><div><i style={{ width: `${Math.min(100, observations / actRule.minimumObservations * 100)}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Seeded probability engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>ESTIMATED / HIDDEN BIAS</small><b>{(estimate * 100).toFixed(0)}% / {(target * 100).toFixed(0)}%</b><span>Variant seed {level.seed} · {trials} draws</span></div><label className="instrument-control">Trial count <input type="range" min="5" max="120" step="5" value={trials} onChange={event => setTrials(Number(event.target.value))} /><b>{trials}</b></label><button className="button primary" onClick={observe}>{observations < actRule.minimumObservations ? `${actRule.verb} sample` : "Replay expedition"} <span>✦</span></button></aside><section className="field-world-stage probability-stage"><div className="probability-visual"><div className="probability-jar"><i style={{ height: `${estimate * 100}%` }} /><span>{(estimate * 100).toFixed(0)}%</span></div><div className="probability-trail">{Array.from({ length: Math.min(50, trials) }, (_, item) => <b key={item} className={(item + seed) % 10 < Math.round(target * 10) ? "success" : "failure"}>{(item + seed) % 10 < Math.round(target * 10) ? "●" : "○"}</b>)}</div></div><p>The seed changes the hidden bias. Increase the sample size until your estimate settles near this expedition’s unknown probability.</p></section></div></div>;
}

function GeometryWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const [base, setBase] = useState(4); const [height, setHeight] = useState(3); const [apexX, setApexX] = useState(0); const [observations, setObservations] = useState(0); const actRule = advancedActRule(level.act); const area = triangleArea({ x: 0, y: 0 }, { x: base, y: 0 }, { x: apexX, y: height });
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, Math.abs(area - 6) < .01 && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">△</span><span className="brand-copy"><b>{level.world}</b><small>{level.concept}</small></span></button><div className="level-progress"><span>{observations} / 3 constructions</span><div><i style={{ width: `${observations / 3 * 100}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Geometry engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>AREA METER</small><b>{area.toFixed(2)} units²</b><span>Vertices A(0,0) · B({base.toFixed(1)},0) · C({apexX.toFixed(1)},{height.toFixed(1)})</span></div><label className="instrument-control">Base <input type="range" min="2" max="8" step=".5" value={base} onChange={event => setBase(Number(event.target.value))} /><b>{base.toFixed(1)}</b></label><label className="instrument-control">Height <input type="range" min="1" max="8" step=".5" value={height} onChange={event => setHeight(Number(event.target.value))} /><b>{height.toFixed(1)}</b></label><label className="instrument-control">Apex horizontal shift <input type="range" min="-3" max="7" step=".5" value={apexX} onChange={event => setApexX(Number(event.target.value))} /><b>{apexX.toFixed(1)}</b></label><button className="button primary" onClick={observe}>{observations < 3 ? "Check construction" : "Replay construction"} <span>✦</span></button></aside><section className="field-world-stage geometry-stage"><div className="geometry-visual"><div className="geometry-triangle" style={{ clipPath: `polygon(14% 86%, 86% 86%, ${14 + (apexX + 3) * 7.2}% ${Math.max(10, 86 - height * 9)}%)` }} /><span className="geometry-label">{area.toFixed(1)} u²</span></div><p>Move the apex, base, and height. Horizontal shifts change the shape but not the area when the perpendicular height stays fixed.</p></section></div></div>;
}

function SeededGeometryWorld({ level, onBack, completeLevel, sound }: Pick<GameProps, "onBack" | "completeLevel" | "sound"> & { level: AdvancedLevelDefinition }) {
  const actRule = advancedActRule(level.act); const seed = Math.abs(level.seed ?? 0); const target = Number(level.goal.target ?? 6 + (seed % 3) * .5); const [base, setBase] = useState(4); const [height, setHeight] = useState(3); const [apexX, setApexX] = useState(0); const [observations, setObservations] = useState(0); const area = triangleArea({ x: 0, y: 0 }, { x: base, y: 0 }, { x: apexX, y: height }); const accurate = Math.abs(area - target) < .08;
  const observe = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) completeLevel(level.id, accurate && actRule.revealNotation ? 3 : 2, next); };
  return <div className="world-screen advanced-world"><header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">△</span><span className="brand-copy"><b>{level.world}</b><small>Seeded geometry</small></span></button><div className="level-progress"><span>{observations} / {actRule.minimumObservations} constructions</span><div><i style={{ width: `${Math.min(100, observations / actRule.minimumObservations * 100)}%` }} /></div></div></header><div className="field-world-layout"><aside className="mission-panel"><span className="overline">Seeded geometry engine · {level.act} act</span><h1>{level.world}</h1><p>{level.objective}</p><div className="advanced-readout"><small>AREA / TARGET</small><b>{area.toFixed(2)} / {target.toFixed(2)} units²</b><span>Variant seed {level.seed} · base {base.toFixed(1)} · height {height.toFixed(1)}</span></div><label className="instrument-control">Base <input type="range" min="2" max="9" step=".5" value={base} onChange={event => setBase(Number(event.target.value))} /><b>{base.toFixed(1)}</b></label><label className="instrument-control">Height <input type="range" min="1" max="9" step=".5" value={height} onChange={event => setHeight(Number(event.target.value))} /><b>{height.toFixed(1)}</b></label><label className="instrument-control">Apex shift <input type="range" min="-3" max="7" step=".5" value={apexX} onChange={event => setApexX(Number(event.target.value))} /><b>{apexX.toFixed(1)}</b></label><button className="button primary" onClick={observe}>{observations < actRule.minimumObservations ? `${actRule.verb} construction` : "Replay expedition"} <span>✦</span></button></aside><section className="field-world-stage geometry-stage"><div className="geometry-visual"><div className="geometry-triangle" style={{ clipPath: `polygon(14% 86%, 86% 86%, ${14 + (apexX + 3) * 7.2}% ${Math.max(10, 86 - height * 9)}%)` }} /><span className="geometry-label">{area.toFixed(1)} / {target.toFixed(1)} u²</span></div><p>The seeded target changes the construction challenge. Horizontal apex shifts preserve area; base and height control it.</p></section></div></div>;
}

function AdvancedWorld({ onBack, completeLevel, sound }: GameProps) {
  const [levelIndex, setLevelIndex] = useState(0); const [generatedLevel, setGeneratedLevel] = useState<AdvancedLevelDefinition | null>(null); const [observations, setObservations] = useState(0); const [showNotation, setShowNotation] = useState(false);
  const [sliceWidth, setSliceWidth] = useState(1); const [markerGap, setMarkerGap] = useState(4); const [sensorRadius, setSensorRadius] = useState(1); const [pathLength, setPathLength] = useState(2); const [pathPoints, setPathPoints] = useState<{ x: number; y: number }[]>([]); const [damping, setDamping] = useState(.4); const [frequency, setFrequency] = useState(120); const [matrixScale, setMatrixScale] = useState(2); const [matrixOrder, setMatrixOrder] = useState<"rotate-stretch" | "stretch-rotate">("rotate-stretch"); const [portalAngle, setPortalAngle] = useState(90);
  useEffect(() => { const onExpedition = (event: Event) => { setGeneratedLevel((event as CustomEvent<AdvancedLevelDefinition>).detail); setObservations(0); setShowNotation(false); setPathPoints([]); }; window.addEventListener("advanced-expedition", onExpedition); return () => window.removeEventListener("advanced-expedition", onExpedition); }, []);
  const level: AdvancedLevelDefinition = generatedLevel ?? ADVANCED_CAMPAIGN[levelIndex]; const actMeta = ADVANCED_ACTS.find(act => act.id === level.act); const actRule = advancedActRule(level.act);
  if (level.concept === "divergence" || level.concept === "curl") return <AdvancedRoute level={level}><FieldWorld mode={level.concept} level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "integration" || level.concept === "derivative") return <AdvancedRoute level={level}>{level.seed === undefined ? <CurveWorld mode={level.concept} level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /> : <SeededCurveWorld mode={level.concept} level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} />}</AdvancedRoute>;
  if (level.concept === "gradient" || level.concept === "partial derivatives") return <AdvancedRoute level={level}><GradientWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "line integral") return <AdvancedRoute level={level}><SailingWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "chaotic dynamics") return <AdvancedRoute level={level}><ChaosWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "differential equations" || level.concept === "second-order differential equations") return <AdvancedRoute level={level}><DynamicWorld mode={level.concept === "differential equations" ? "population" : "spring"} level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "surface integral") return <AdvancedRoute level={level}><SurfaceWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "Stokes theorem") return <AdvancedRoute level={level}><StokesWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "Fourier transform") return <AdvancedRoute level={level}><SoundWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "eigenvectors") return <AdvancedRoute level={level}><EigenvectorWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "Jacobian") return <AdvancedRoute level={level}><JacobianWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "matrix transformations" || level.concept === "determinant") return <AdvancedRoute level={level}><MatrixWorld mode={level.concept as MatrixMode} level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "Euler formula") return <AdvancedRoute level={level}><EulerWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "complex numbers") return <AdvancedRoute level={level}><ComplexWorld mode="complex numbers" level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "graph paths") return <AdvancedRoute level={level}><GraphWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /></AdvancedRoute>;
  if (level.concept === "probability simulation") return <AdvancedRoute level={level}>{level.seed === undefined ? <ProbabilityWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /> : <SeededProbabilityWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} />}</AdvancedRoute>;
  if (level.concept === "geometry construction") return <AdvancedRoute level={level}>{level.seed === undefined ? <GeometryWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} /> : <SeededGeometryWorld level={level} onBack={onBack} completeLevel={completeLevel} sound={sound} />}</AdvancedRoute>;
  const reset = () => { setObservations(0); setShowNotation(false); setPathPoints([]); };
  const select = (index: number) => { setGeneratedLevel(null); setLevelIndex(index); setObservations(0); setShowNotation(false); setPathPoints([]); };
  const route = pathPoints.length > 1 ? pathPoints.map(point => ({ x: point.x / 42, y: point.y / 42 })) : [{ x: 0, y: 0 }, { x: pathLength, y: 0 }];
  const act = () => { const next = observations + 1; setObservations(next); sound(next >= actRule.minimumObservations ? "win" : "good"); if (next >= actRule.minimumObservations) { setShowNotation(actRule.revealNotation); completeLevel(level.id, actRule.revealNotation ? 3 : 2, next); } };
  const readout = (() => {
    if (level.concept === "integration") return `${Math.round(trapezoidIntegral(t => 40 + 20 * Math.sin(t), 0, 8, Math.max(1, Math.round(8 / sliceWidth))))} units accumulated · slice ${sliceWidth.toFixed(1)}s`;
    if (level.concept === "derivative") return `Average slope ${tangentSlope(x => x * x, 2 + markerGap / 10).toFixed(2)} · marker gap ${markerGap.toFixed(1)}m`;
    if (level.concept === "gradient") return `Altimeter ${gaussianHeight({ x: observations, y: observations }) * 1000 | 0} m · slope probe ready`;
    if (level.concept === "divergence") return `Sensor divergence ${(divergence(point => ({ x: point.x, y: point.y }), { x: 1, y: 1 }) / sensorRadius).toFixed(2)} · radius ${sensorRadius.toFixed(1)}`;
    if (level.concept === "curl") return `Wheel rotation ${curl(point => ({ x: -point.y, y: point.x }), { x: 1, y: 1 }).toFixed(2)} rad/s`;
    if (level.concept === "line integral") return `Energy harvested ${lineIntegral(() => ({ x: 2, y: 0 }), route).toFixed(0)} · route ${polylineLength(route).toFixed(1)} units`;
    if (level.concept === "Stokes theorem") return `Boundary circulation ${lineIntegral(point => ({ x: -point.y, y: point.x }), route).toFixed(1)} · boundary ${polylineLength(route).toFixed(1)} units`;
    if (level.concept === "differential equations") return `Rabbits ${lotkaVolterraStep({ rabbits: 300, foxes: 20 }, observations * .1).rabbits.toFixed(0)}`;
    if (level.concept === "second-order differential equations") return `Bridge position ${springStep({ position: 1, velocity: 0 }, observations * .1, 1, 3, damping).position.toFixed(2)} · damping ${damping.toFixed(1)}`;
    if (level.concept === "matrix transformations" || level.concept === "determinant") return `Area scale ${determinant([matrixScale, 0, 0, 1]).toFixed(1)}× · order ${matrixOrder}`;
    if (level.concept === "Fourier transform") return `Spectrum peak ${frequency} Hz · ${discreteSpectrum([1, Math.sin(frequency / 60), 0, -Math.sin(frequency / 60)]).map(value => value.toFixed(1)).join(" / ")}`;
    if (level.concept === "complex numbers" || level.concept === "Euler formula") return `Portal output ${JSON.stringify(complexMultiply({ x: 1, y: 0 }, { x: Math.cos(portalAngle * Math.PI / 180), y: Math.sin(portalAngle * Math.PI / 180) }))} · angle ${portalAngle}°`;
    return `${level.concept} instrument calibrated`;
  })();
  const controls = level.concept === "integration" ? <label className="instrument-control">Slice width <input type="range" min=".25" max="2" step=".25" value={sliceWidth} onChange={e => setSliceWidth(Number(e.target.value))} /><b>{sliceWidth.toFixed(2)} s</b></label> : level.concept === "derivative" ? <label className="instrument-control">Marker distance <input type="range" min=".1" max="8" step=".1" value={markerGap} onChange={e => setMarkerGap(Number(e.target.value))} /><b>{markerGap.toFixed(1)} m</b></label> : level.concept === "divergence" ? <label className="instrument-control">Sensor radius <input type="range" min=".5" max="3" step=".5" value={sensorRadius} onChange={e => setSensorRadius(Number(e.target.value))} /><b>{sensorRadius.toFixed(1)}</b></label> : level.concept === "line integral" ? <label className="instrument-control">Route length <input type="range" min="1" max="8" step=".5" value={pathLength} onChange={e => setPathLength(Number(e.target.value))} /><b>{pathLength.toFixed(1)} km</b></label> : level.concept === "second-order differential equations" ? <label className="instrument-control">Damping <input type="range" min="0" max="1.5" step=".1" value={damping} onChange={e => setDamping(Number(e.target.value))} /><b>{damping.toFixed(1)}</b></label> : level.concept === "matrix transformations" || level.concept === "determinant" ? <div className="instrument-control"><label>Stretch crystal <input type="range" min=".5" max="3" step=".5" value={matrixScale} onChange={e => setMatrixScale(Number(e.target.value))} /><b>{matrixScale.toFixed(1)}×</b></label><div className="order-buttons"><button className={matrixOrder === "rotate-stretch" ? "active" : ""} onClick={() => setMatrixOrder("rotate-stretch")}>ROTATE → STRETCH</button><button className={matrixOrder === "stretch-rotate" ? "active" : ""} onClick={() => setMatrixOrder("stretch-rotate")}>STRETCH → ROTATE</button></div></div> : level.concept === "complex numbers" || level.concept === "Euler formula" ? <label className="instrument-control">Portal angle <input type="range" min="0" max="360" step="15" value={portalAngle} onChange={e => setPortalAngle(Number(e.target.value))} /><b>{portalAngle}°</b></label> : <label className="instrument-control">Instrument frequency <input type="range" min="30" max="480" step="30" value={frequency} onChange={e => setFrequency(Number(e.target.value))} /><b>{frequency} Hz</b></label>;
  return <div className="world-screen advanced-world">
    <header className="world-header advanced"><button className="brand-button" onClick={onBack} aria-label="Return to world map"><span className="brand-glyph">∞</span><span className="brand-copy"><b>Advanced Worlds</b><small>{actMeta?.label ?? "Simulation Lab"}</small></span></button><div className="level-progress"><span>{levelIndex + 1} / {ADVANCED_CAMPAIGN.length}</span><div><i style={{ width: `${((levelIndex + 1) / ADVANCED_CAMPAIGN.length) * 100}%` }} /></div></div><div className="header-tools"><IconButton label="Reset simulation" onClick={reset}>↻</IconButton></div></header>
    <div className="advanced-layout"><aside className="mission-panel"><span className="overline">{level.engine} engine · Act {level.act}</span><h1>{level.world}</h1><h2>{level.concept}</h2><p>{level.objective}</p><div className="advanced-tools"><small>{actRule.verb.toUpperCase()} · INSTRUMENTS</small>{level.tools.map(tool => <span key={tool}>{tool}</span>)}</div>{controls}<div className="advanced-readout"><small>LIVE MEASUREMENT</small><b>{readout}</b><span>Act target: {actRule.minimumObservations} observation{actRule.minimumObservations === 1 ? "" : "s"}</span></div>{showNotation && <div className="notation-reveal"><small>FORMAL NAME</small><b>{level.concept} discovered</b><span>Notation unlocked after observation.</span></div>}</aside><section className="advanced-stage">{level.concept === "line integral" && <PathInstrument onPathChange={setPathPoints} />}<div className={`advanced-simulation engine-${level.engine}`}><div className="simulation-grid" /><div className="simulation-core"><span>{level.engine === "curve" ? "∫" : level.engine === "field" ? "∇" : level.engine === "transformation" ? "▦" : level.engine === "plane" ? "i" : "✦"}</span><i /><i /></div><div className="simulation-track">{Array.from({ length: Math.max(actRule.minimumObservations, observations + 2) }, (_, index) => <span key={index} className={index < observations ? "active" : ""}>{index + 1}</span>)}</div><p>{actMeta?.instruction ?? "Adjust the instrument, observe the system, then measure again."}</p></div><div className="advanced-actions"><button className="button primary" onClick={act}>{observations === 0 ? actRule.verb : observations < actRule.minimumObservations ? `${actRule.verb} again` : "Replay discovery"} <span>✦</span></button><span>{observations} / {actRule.minimumObservations} observations</span></div></section></div><nav className="advanced-levels" aria-label="Advanced world levels">{ADVANCED_CAMPAIGN.map((item, index) => { const locked = !advancedActUnlocked(ADVANCED_CAMPAIGN, progress.completed, item); return <button key={item.id} disabled={locked} className={`${index === levelIndex ? "active" : ""} ${locked ? "locked" : ""}`} onClick={() => select(index)}><small>{locked ? "LOCKED" : `${item.engine} · ${item.act}`}</small><b>{item.world}</b><span>{item.concept}</span></button>; })}</nav>
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
    {screen === "advanced" && <AdvancedWorld {...props} />}
    <button className="settings-button" onClick={() => setSettings(true)} aria-label="Open settings">⚙</button>
    {settings && <Settings progress={progress} update={patch => setProgress(p => ({ ...p, ...patch }))} close={() => setSettings(false)} />}
    {toast && <div className={`toast ${toast.kind}`}>{toast.text}</div>}
  </div>;
}
