"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ADVANCED_ACTS, AdvancedLevelDefinition, advancedNotation } from "./advanced-engines";
import { ValleyReading, buildActualRevealBlocks, buildValleyTimeBlocks, estimateTargetCrossing, resolveValleyOutcome, valleyActualVolume, valleyConfidence, valleyFlowRate, valleyRiverModel, valleyStars } from "./water-valley-engine";

type WaterValleyGameProps = {
  level: AdvancedLevelDefinition;
  onBack: () => void;
  completeLevel: (id: string, stars: number, moves: number) => void;
  sound: (tone: "tap" | "good" | "bad" | "win") => void;
};

type ValleyPhase = "briefing" | "playing" | "gate-closing" | "success" | "failure";

export function WaterValleyGame({ level, onBack, completeLevel, sound }: WaterValleyGameProps) {
  const seed = Math.abs(level.seed ?? 0);
  const target = Number(level.goal.target ?? 420);
  const act = ADVANCED_ACTS.find(candidate => candidate.id === level.act) ?? ADVANCED_ACTS[0];
  const actIndex = Math.max(0, ADVANCED_ACTS.findIndex(candidate => candidate.id === level.act));
  const modelIndex = level.seed === undefined ? actIndex : seed % 5;
  const riverModel = valleyRiverModel(modelIndex, seed, target);
  const [phase, setPhase] = useState<ValleyPhase>("briefing");
  const [timeLeft, setTimeLeft] = useState(60);
  const [readings, setReadings] = useState<ValleyReading[]>([]);
  const [refinements, setRefinements] = useState<Array<{ start: number; end: number }>>([]);
  const [attempts, setAttempts] = useState(2);
  const [message, setMessage] = useState("The river is changing. We need a plan before the gate bell rings.");
  const [revealedVolume, setRevealedVolume] = useState<number | null>(null);
  const completedRef = useRef(false);

  const chart = useMemo(() => Array.from({ length: 31 }, (_, index) => {
    const time = index * 2;
    return { time, rate: valleyFlowRate(time, seed, target, modelIndex) };
  }), [seed, target, modelIndex]);
  const maxRate = Math.max(...chart.map(point => point.rate));
  const elapsedSeconds = Math.max(0, 60 - timeLeft);
  const rectangles = useMemo(() => buildValleyTimeBlocks(readings, elapsedSeconds, 5, refinements), [readings, elapsedSeconds, refinements]);
  const estimate = useMemo(() => rectangles.reduce((sum, rectangle) => sum + rectangle.volume, 0), [rectangles]);
  const confidence = valleyConfidence(readings, Math.max(1, elapsedSeconds));
  const selectedRate = valleyFlowRate(elapsedSeconds, seed, target, modelIndex);
  const physicalWater = Math.min(target * 1.18, Math.max(0, valleyActualVolume(elapsedSeconds, seed, target, .1, modelIndex)));
  const reservoirPercent = Math.max(0, Math.min(100, (physicalWater / (target * 1.12)) * 100));
  const crossing = estimateTargetCrossing(readings, target, elapsedSeconds, 5);
  const revealBlocks = useMemo(() => buildActualRevealBlocks(elapsedSeconds, seed, target, modelIndex), [elapsedSeconds, seed, target, modelIndex]);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setTimeLeft(value => {
      const next = Math.max(0, Number((value - .1).toFixed(1)));
      if (value > 45 && next <= 45) { setMessage(riverModel.id === "mixed" ? "Nia: Cloudburst upstream! Measure the changing flow." : `Nia: The ${riverModel.name.toLowerCase()} is changing. Measure now.`); sound("bad"); }
      if (value > 25 && next <= 25) { setMessage(riverModel.id === "mixed" ? "Nia: The east channel is leaking. The trend has changed." : "Nia: The bell is close. Refine your estimate before you decide."); sound("bad"); }
      if (next <= 0) { setPhase("failure"); setMessage("The river flooded past the open gate. The valley needed a decision before 60 seconds."); sound("bad"); }
      return next;
    }), 100);
    return () => window.clearInterval(timer);
  }, [phase, riverModel.id, riverModel.name, sound]);

  const start = () => {
    setPhase("playing");
    setMessage("Nia: Watch the river. Measure now when the flow changes, then close the gate near 420 units.");
    sound("good");
  };

  const recordReading = () => {
    if (phase !== "playing") return;
    if (readings.length >= 7) { setMessage("The probe battery is empty. Improve the plan with the readings you have."); sound("bad"); return; }
    const reading = { time: Number(elapsedSeconds.toFixed(1)), rate: selectedRate };
    setReadings(current => [...current, reading].sort((a, b) => a.time - b.time));
    setMessage(elapsedSeconds >= 28 && elapsedSeconds <= 38 ? "Nia: Cloudburst upstream. This is a valuable moment to measure." : elapsedSeconds >= 44 ? "Nia: The east channel is leaking. The trend has changed." : `Nia: Probe landed at ${reading.time.toFixed(1)}s · ${selectedRate.toFixed(1)} units/s.`);
    sound("good");
  };

  const commitPlan = () => {
    if (phase !== "playing") return;
    const actual = valleyActualVolume(elapsedSeconds, seed, target, .05, modelIndex);
    const outcome = resolveValleyOutcome(actual, target);
    setRevealedVolume(actual);
    setPhase("gate-closing");
    setMessage("The floodgate is closing. Calculating what actually passed...");
    window.setTimeout(() => setPhase(outcome === "success" ? "success" : "failure"), 1100);
    sound("win");
    if (outcome === "success") {
      const stars = valleyStars(actual, target, timeLeft, readings.length);
      if (!completedRef.current) { completedRef.current = true; completeLevel(level.id, stars, readings.length); }
    }
  };

  const reset = () => {
    setPhase("briefing"); setTimeLeft(60); setReadings([]); setRefinements([]); setAttempts(2); setRevealedVolume(null); completedRef.current = false;
    setMessage("The river is changing. We need a plan before the gate bell rings.");
  };

  const stars = revealedVolume === null ? 0 : valleyStars(revealedVolume, target, timeLeft, readings.length);

  return <div className={`water-valley-game wv-${phase}`}>
    <header className="wv-header">
      <button className="wv-back" onClick={onBack} aria-label="Return to advanced world map">← <span>AXIOM ATLAS</span></button>
      <div className="wv-title"><small>WATER VALLEY</small><b>{act.label}</b></div>
      <div className={`wv-clock ${timeLeft <= 15 ? "urgent" : ""}`}><small>TIME REMAINING</small><b>00:{timeLeft.toFixed(1).padStart(4, "0")}</b></div>
      <div className="wv-attempts"><small>SAFETY TOKENS</small><span>{Array.from({ length: 2 }, (_, index) => <i key={index} className={index < attempts ? "active" : ""}>◆</i>)}</span></div>
    </header>

    <main className="wv-layout">
      <aside className="wv-story-panel">
        <span className="wv-kicker">MISSION 01 · THE LAST RESERVOIR</span>
        <h1>Water for<br />the valley.</h1>
        <p>A drought has emptied the lower reservoir. At sunset, the mountain river will change course. Send exactly <b>{target.toFixed(0)} units</b> through the village gate before the bell.</p>
        <div className="wv-nia"><span aria-hidden="true">N</span><div><b>NIA · APPRENTICE ENGINEER</b><p>{message}</p></div></div>
        <div className="wv-loop" aria-label="Core gameplay loop">
          {["Place probe", "Record flow", "Build estimate", "Set gate", "Commit"].map((step, index) => <div key={step} className={index <= Math.min(4, readings.length) ? "active" : ""}><i>{index + 1}</i><span>{step}</span></div>)}
        </div>
        <div className="wv-rewards"><small>FIELD REWARDS</small><span className={readings.length >= 1 ? "earned" : ""}>◉ First Drop</span><span className={readings.length >= 5 ? "earned" : ""}>◈ Surveyor</span><span className={phase === "success" && stars === 3 ? "earned" : ""}>✦ Perfectionist</span></div>
      </aside>

      <section className="wv-world" aria-label="Water Valley game field">
        <div className="wv-atmosphere">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ left: `${8 + index * 7.6}%`, animationDelay: `${index * .17}s` }} />)}</div>
        <div className="wv-landmark wv-upper">UPPER LAKE <i>Mountain source</i></div>
        <div className="wv-landmark wv-station">MEASURING STATION <i>Probe deployed here</i></div>
        <div className="wv-landmark wv-gate">VILLAGE GATE <i>Close it when you are ready</i></div>

        <div className="wv-reservoir-hud">
          <div className="wv-water-mark">◒</div><small>LOWER RESERVOIR</small>
          <b>{Math.round(revealedVolume ?? estimate)} <span>/ {target.toFixed(0)} units</span></b>
          <div className="wv-fill-track"><i style={{ width: `${reservoirPercent}%` }} /></div>
          <div className="wv-target-readout"><span>TARGET <b>{target.toFixed(0)}</b></span><span>PREDICTION <b>{revealedVolume === null ? (readings.length ? Math.round(estimate) : "—") : Math.round(revealedVolume)}</b></span><span>ERROR <b>{revealedVolume === null ? (readings.length ? `±${Math.max(8, Math.round((100 - confidence) * .7))}` : "Unknown") : `${Math.abs(revealedVolume - target).toFixed(1)}`}</b></span></div>
          <div className="wv-physical-water">RESERVOIR LEVEL <b>{physicalWater < target * .45 ? "RISING" : physicalWater < target * .85 ? "HIGH" : "NEAR CAPACITY"}</b></div>
          <p>{revealedVolume === null ? `Your estimate ≈ ${Math.round(estimate)} · ${confidence}% confidence` : `Gate closed at ${elapsedSeconds.toFixed(1)}s`}</p>
        </div>

        <div className="wv-event-strip">{riverModel.events.map((event, index) => <span key={event}>{index === 0 ? "☁" : "◌"} {event}</span>)}</div>

        <div className="wv-console">
          <div className="wv-chart-head"><div><small>FLOW RATE · LIVE CURVE</small><b>Watch the river and measure the current moment</b></div><span>{selectedRate.toFixed(1)} units/s <i>NOW · {elapsedSeconds.toFixed(1)}s</i></span></div>
          <div className="wv-chart" aria-label="River flow over sixty seconds">
            {chart.map(point => {
              const recorded = readings.some(reading => Math.abs(reading.time - point.time) < 1.1);
              const style = { "--wv-height": `${Math.max(12, point.rate / maxRate * 100)}%` } as CSSProperties;
              return <i key={point.time} style={style} className={`${point.time <= elapsedSeconds ? "past" : "future"} ${recorded ? "recorded" : ""}`} aria-label={`${point.time} seconds flow ${point.rate.toFixed(1)} units per second`}><b>{recorded ? "◆" : ""}</b></i>;
            })}
            <div className="wv-chart-target" style={{ left: `${elapsedSeconds / 60 * 100}%` }}><span>NOW</span></div>
          </div>
          <div className="wv-axis"><span>0s</span><span>15s</span><span>30s</span><span>45s</span><span>60s</span></div>

          <div className="wv-rectangle-lab">
            <div className="wv-rectangle-title"><span>WATER ACCUMULATION · EACH BLOCK = FLOW × TIME</span><b>{rectangles.filter(rectangle => rectangle.state !== "waiting").map(rectangle => Math.round(rectangle.volume)).join(" + ") || "Watch the first block fill"} = <i>{Math.round(estimate)}</i></b></div>
            <div className="wv-leakage wv-leak-mid">{refinements.length ? "Refined blocks hug the changing river more closely." : "Wide blocks miss quick changes. Refine a high-change interval."}</div>
            <div className="wv-rectangles" aria-label="Time block water calculations">
              {rectangles.map((rectangle, index) => <div key={`${rectangle.start}-${rectangle.end}`} className={`wv-rectangle wv-block-${rectangle.state}`} style={{ "--wv-block-height": `${Math.max(24, rectangle.height / maxRate * 62)}px`, animationDelay: `${Math.min(index, 12) * .035}s` } as CSSProperties}><i /><small>{rectangle.start}–{rectangle.end}s</small><b>{rectangle.height ? `${rectangle.height.toFixed(1)} × ${rectangle.width.toFixed(1)}` : "WAITING"}</b><span>{rectangle.state === "filling" ? "FILLING…" : rectangle.state === "waiting" ? "WAITING" : `= ${rectangle.volume.toFixed(1)} ${rectangle.source === "measured" ? "MEASURED" : "EST."}`}</span></div>)}
            </div>
          </div>

          <div className="wv-controls">
            <div className="wv-tool probe"><small>SURVEY PROBE · {7 - readings.length} CHARGES</small><b>NOW · {elapsedSeconds.toFixed(1)}s · {selectedRate.toFixed(1)} units/s</b><button onClick={recordReading} disabled={phase !== "playing" || readings.length >= 7}>MEASURE NOW</button></div>
            <div className="wv-tool"><small>REFINEMENT</small><b>{crossing ? `Estimated crossing · ${crossing[0].toFixed(1)}–${crossing[1].toFixed(1)}s` : "Keep watching the changing flow"}</b><button onClick={() => { const start = Math.max(0, Math.floor((elapsedSeconds - 5) / 5) * 5); setRefinements(current => current.some(region => region.start === start) ? current : [...current, { start, end: start + 10 }]); setMessage("Nia: Smaller blocks can improve the estimate where the river changes fastest."); sound("tap"); }} disabled={phase !== "playing" || elapsedSeconds < 5}>REFINE BLOCKS</button></div>
            <div className="wv-tool gate"><small>FLOODGATE LEVER</small><b>Stop the water at this moment</b><button onClick={commitPlan} disabled={phase !== "playing"}>CLOSE GATE NOW</button></div>
          </div>

          <div className="wv-command"><div><small>YOUR RUNNING ESTIMATE</small><b>≈ {estimate.toFixed(1)} units · target {target.toFixed(0)} · {confidence}% confidence</b></div><button onClick={commitPlan} disabled={phase !== "playing"}>CLOSE GATE NOW <span>→</span></button></div>
        </div>

        {phase === "briefing" && <div className="wv-modal"><span>ACT {actIndex + 1} · RIVER MODEL HIDDEN</span><h2>The bell rings in one minute.</h2><p>Probe the river at different times. Each reading builds a visible water block. Add the blocks, refine their width, and choose when to close the gate.</p><button onClick={start}>BEGIN THE WATCH <i>→</i></button><small>No equation yet. Discover the river through evidence.</small></div>}
        {(phase === "success" || phase === "failure") && <div className={`wv-modal result ${phase}`}><span>{phase === "success" ? "VALLEY SAVED · ACTUAL WATER REVEALED" : "RESERVOIR OUTCOME"}</span><h2>{phase === "success" ? "The water reaches every home." : "The gate was too early or too late."}</h2><div className="wv-result-stars">{Array.from({ length: 3 }, (_, index) => <i key={index} className={phase === "success" && index < stars ? "earned" : ""}>★</i>)}</div><p>{message}</p><div className="wv-reveal-stream"><small>BLOCK-BY-BLOCK REVEAL · GATE CLOSED {elapsedSeconds.toFixed(1)}s</small>{revealBlocks.map((block, index) => <div key={`${block.start}-${block.end}`}><span>{block.start.toFixed(1)}–{block.end.toFixed(1)}s</span><b>+{block.volume.toFixed(1)}</b><i>Total {revealBlocks.slice(0, index + 1).reduce((sum, item) => sum + item.volume, 0).toFixed(1)}</i></div>)}</div><div className="wv-result-actual"><span>TARGET <b>{target.toFixed(1)}</b></span><span>ACTUAL <b>{(revealedVolume ?? 0).toFixed(1)}</b></span><span>ERROR <b>{((revealedVolume ?? 0) - target).toFixed(1)}</b></span></div>{phase === "success" && <><div className="wv-formula-reveal"><small>THE HIDDEN PHYSICS</small><b>{riverModel.name}</b><code>{riverModel.formula}</code><p>Each block was flow × time. You added them to estimate the total. That sum is the definite integral: <strong>{advancedNotation(level.concept)}</strong>.</p></div><div className="wv-crystal"><i>◆</i><div><b>CONCEPT CRYSTAL EARNED</b><span>Σ flow × time → ∫ flow dt</span></div></div></>}<div className="wv-result-actions"><button onClick={reset}>{phase === "success" ? "REPLAY" : "TRY AGAIN"}</button><button onClick={onBack}>WORLD MAP →</button></div></div>}
      </section>
    </main>
  </div>;
}
