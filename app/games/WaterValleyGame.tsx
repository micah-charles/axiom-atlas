"use client";

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { ADVANCED_ACTS, AdvancedLevelDefinition, advancedNotation } from "./advanced-engines";
import { ValleyReading, buildValleyRectangles, estimateValleyVolume, resolveValleyOutcome, valleyActualVolume, valleyConfidence, valleyFlowRate, valleyRiverModel, valleyStars } from "./water-valley-engine";

type WaterValleyGameProps = {
  level: AdvancedLevelDefinition;
  onBack: () => void;
  completeLevel: (id: string, stars: number, moves: number) => void;
  sound: (tone: "tap" | "good" | "bad" | "win") => void;
};

type ValleyPhase = "briefing" | "playing" | "success" | "failure";
const SLICE_OPTIONS = [10, 6, 4, 2];

export function WaterValleyGame({ level, onBack, completeLevel, sound }: WaterValleyGameProps) {
  const seed = Math.abs(level.seed ?? 0);
  const target = Number(level.goal.target ?? 420);
  const act = ADVANCED_ACTS.find(candidate => candidate.id === level.act) ?? ADVANCED_ACTS[0];
  const actIndex = Math.max(0, ADVANCED_ACTS.findIndex(candidate => candidate.id === level.act));
  const modelIndex = level.seed === undefined ? actIndex : seed % 5;
  const riverModel = valleyRiverModel(modelIndex, seed, target);
  const [phase, setPhase] = useState<ValleyPhase>("briefing");
  const [timeLeft, setTimeLeft] = useState(60);
  const [probeTime, setProbeTime] = useState(18);
  const [gateTime, setGateTime] = useState(54);
  const [sliceWidth, setSliceWidth] = useState(10);
  const [readings, setReadings] = useState<ValleyReading[]>([]);
  const [attempts, setAttempts] = useState(2);
  const [message, setMessage] = useState("The river is changing. We need a plan before the gate bell rings.");
  const [revealedVolume, setRevealedVolume] = useState<number | null>(null);
  const completedRef = useRef(false);

  const chart = useMemo(() => Array.from({ length: 31 }, (_, index) => {
    const time = index * 2;
    return { time, rate: valleyFlowRate(time, seed, target, modelIndex) };
  }), [seed, target, modelIndex]);
  const maxRate = Math.max(...chart.map(point => point.rate));
  const rectangles = useMemo(() => buildValleyRectangles(readings, gateTime, sliceWidth), [readings, gateTime, sliceWidth]);
  const estimate = useMemo(() => estimateValleyVolume(readings, gateTime, sliceWidth), [readings, gateTime, sliceWidth]);
  const confidence = valleyConfidence(readings, gateTime);
  const selectedRate = valleyFlowRate(probeTime, seed, target, modelIndex);
  const reservoirPercent = Math.max(0, Math.min(100, ((revealedVolume ?? estimate) / target) * 100));

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setTimeLeft(value => {
      const next = Math.max(0, value - 1);
      if (next === 45) { setMessage(riverModel.id === "mixed" ? "Nia: Cloudburst upstream! Re-measure around 28–38 seconds." : `Nia: The ${riverModel.name.toLowerCase()} is changing. Spread the probes across time.`); sound("bad"); }
      if (next === 25) { setMessage(riverModel.id === "mixed" ? "Nia: The east channel is leaking. Late flow has dropped." : "Nia: The bell is close. Compare thin slices before you commit."); sound("bad"); }
      if (next === 0) { setPhase("failure"); setMessage("The bell rang before we opened the gate. The lower village remains dry."); sound("bad"); }
      return next;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [phase, riverModel.id, riverModel.name, sound]);

  const start = () => {
    setPhase("playing");
    setMessage("Nia: Place probes across the whole river timeline, then choose a gate-closing time.");
    sound("good");
  };

  const recordReading = () => {
    if (phase !== "playing") return;
    if (readings.length >= 7) { setMessage("The probe battery is empty. Improve the plan with the readings you have."); sound("bad"); return; }
    const reading = { time: probeTime, rate: selectedRate };
    setReadings(current => [...current.filter(item => item.time !== probeTime), reading].sort((a, b) => a.time - b.time));
    setMessage(probeTime >= 28 && probeTime <= 38 ? "Nia: That spike confirms the cloudburst. Tighten the slices here." : probeTime >= 44 ? "Nia: The leak is real. Late flow is weaker than expected." : `Nia: ${selectedRate.toFixed(1)} units/s recorded at ${probeTime}s.`);
    sound("good");
  };

  const undoReading = () => {
    setReadings(current => current.slice(0, -1));
    setMessage("Last probe reading removed.");
    sound("tap");
  };

  const commitPlan = () => {
    if (readings.length < 3) { setMessage("Nia: Three readings minimum. One point cannot describe a changing river."); sound("bad"); return; }
    const actual = valleyActualVolume(gateTime, seed, target, .1, modelIndex);
    const outcome = resolveValleyOutcome(actual, target);
    setRevealedVolume(actual);
    if (outcome === "success") {
      const stars = valleyStars(actual, target, timeLeft, readings.length);
      setPhase("success");
      setMessage(`The gate closes at ${gateTime}s. ${actual.toFixed(1)} units reach the reservoir—safe and full.`);
      sound("win");
      if (!completedRef.current) { completedRef.current = true; completeLevel(level.id, stars, readings.length); }
      return;
    }
    if (attempts > 1) {
      setAttempts(value => value - 1);
      setTimeLeft(value => Math.max(8, value - 8));
      setMessage(outcome === "shortage" ? `Only ${actual.toFixed(0)} units arrived. Families at the lower terraces still have no water. Close later.` : `${actual.toFixed(0)} units surged through. The spillway nearly flooded. Close earlier.`);
      sound("bad");
      return;
    }
    setAttempts(0);
    setPhase("failure");
    setMessage(outcome === "shortage" ? "The gate closed too early. The village ration line has run dry." : "The reservoir overflowed and the emergency spillway failed.");
    sound("bad");
  };

  const reset = () => {
    setPhase("briefing"); setTimeLeft(60); setProbeTime(18); setGateTime(54); setSliceWidth(10); setReadings([]); setAttempts(2); setRevealedVolume(null); completedRef.current = false;
    setMessage("The river is changing. We need a plan before the gate bell rings.");
  };

  const stars = revealedVolume === null ? 0 : valleyStars(revealedVolume, target, timeLeft, readings.length);

  return <div className={`water-valley-game wv-${phase}`}>
    <header className="wv-header">
      <button className="wv-back" onClick={onBack} aria-label="Return to advanced world map">← <span>AXIOM ATLAS</span></button>
      <div className="wv-title"><small>WATER VALLEY</small><b>{act.label}</b></div>
      <div className={`wv-clock ${timeLeft <= 15 ? "urgent" : ""}`}><small>GATE BELL</small><b>00:{String(timeLeft).padStart(2, "0")}</b></div>
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
        <div className="wv-landmark wv-gate">VILLAGE GATE <i>Closes at {gateTime}s</i></div>

        <div className="wv-reservoir-hud">
          <div className="wv-water-mark">◒</div><small>LOWER RESERVOIR</small>
          <b>{Math.round(revealedVolume ?? estimate)} <span>/ {target.toFixed(0)} units</span></b>
          <div className="wv-fill-track"><i style={{ width: `${reservoirPercent}%` }} /></div>
          <p>{revealedVolume === null ? `Estimate ±${Math.max(8, Math.round((100 - confidence) * .7))} · ${confidence}% confidence` : `${Math.abs(revealedVolume - target).toFixed(1)} units from target`}</p>
        </div>

        <div className="wv-event-strip">{riverModel.events.map((event, index) => <span key={event}>{index === 0 ? "☁" : "◌"} {event}</span>)}</div>

        <div className="wv-console">
          <div className="wv-chart-head"><div><small>RIVER FLOW</small><b>Select a moment, then record its rate</b></div><span>{selectedRate.toFixed(1)} units/s <i>at {probeTime}s</i></span></div>
          <div className="wv-chart" aria-label="River flow over sixty seconds">
            {chart.map(point => {
              const recorded = readings.some(reading => reading.time === point.time);
              const style = { "--wv-height": `${Math.max(12, point.rate / maxRate * 100)}%` } as CSSProperties;
              return <button key={point.time} style={style} className={`${point.time === probeTime ? "selected" : ""} ${recorded ? "recorded" : ""}`} onClick={() => { setProbeTime(point.time); sound("tap"); }} aria-label={`Select ${point.time} seconds`}><i /><span>{recorded ? "◆" : ""}</span></button>;
            })}
            <div className="wv-chart-target" style={{ left: `${gateTime / 60 * 100}%` }}><span>GATE</span></div>
          </div>
          <div className="wv-axis"><span>0s</span><span>15s</span><span>30s</span><span>45s</span><span>60s</span></div>

          <div className="wv-rectangle-lab">
            <div className="wv-rectangle-title"><span>WATER BLOCKS · HEIGHT × WIDTH = VOLUME</span><b>{rectangles.map(rectangle => Math.round(rectangle.volume)).join(" + ")} = <i>{Math.round(estimate)}</i></b></div>
            <div className="wv-rectangles" aria-label="Riemann rectangle calculations">
              {rectangles.map((rectangle, index) => <div key={`${rectangle.start}-${rectangle.end}`} className="wv-rectangle" style={{ "--wv-block-height": `${Math.max(24, rectangle.height / maxRate * 62)}px`, animationDelay: `${Math.min(index, 12) * .035}s` } as CSSProperties}><i /><small>{rectangle.start}–{rectangle.end}s</small><b>{rectangle.height.toFixed(1)} × {rectangle.width.toFixed(0)}</b><span>= {rectangle.volume.toFixed(0)}</span></div>)}
            </div>
          </div>

          <div className="wv-controls">
            <div className="wv-tool probe"><small>PROBE · {7 - readings.length} CHARGES</small><label>Reading time <input type="range" min="0" max="60" step="2" value={probeTime} onChange={event => setProbeTime(Number(event.target.value))} /><b>{probeTime}s</b></label><button onClick={recordReading} disabled={phase !== "playing"}>Record {selectedRate.toFixed(1)}</button></div>
            <div className="wv-tool"><small>RIEMANN SLICES</small><div className="wv-slice-buttons">{SLICE_OPTIONS.map(option => <button key={option} className={sliceWidth === option ? "active" : ""} onClick={() => { setSliceWidth(option); sound("tap"); }}>{option}s</button>)}</div><p>Smaller slices refine your estimate.</p></div>
            <div className="wv-tool gate"><small>GATE CLOSE TIME</small><label>Close channel <input type="range" min="20" max="60" step="1" value={gateTime} onChange={event => { setGateTime(Number(event.target.value)); setRevealedVolume(null); }} /><b>{gateTime}s</b></label><button onClick={undoReading} disabled={!readings.length}>Undo probe</button></div>
          </div>

          <div className="wv-command"><div><small>YOUR PLAN</small><b>{Math.round(estimate)} estimated · {readings.length} probes · {confidence}% confidence</b></div><button onClick={commitPlan} disabled={phase !== "playing"}>OPEN THE CHANNEL <span>→</span></button></div>
        </div>

        {phase === "briefing" && <div className="wv-modal"><span>ACT {actIndex + 1} · RIVER MODEL HIDDEN</span><h2>The bell rings in one minute.</h2><p>Probe the river at different times. Each reading builds a visible water block. Add the blocks, refine their width, and choose when to close the gate.</p><button onClick={start}>BEGIN THE WATCH <i>→</i></button><small>No equation yet. Discover the river through evidence.</small></div>}
        {(phase === "success" || phase === "failure") && <div className={`wv-modal result ${phase}`}><span>{phase === "success" ? "VALLEY SAVED · RIVER REVEALED" : "MISSION FAILED"}</span><h2>{phase === "success" ? "The water reaches every home." : "The gate bell has rung."}</h2><div className="wv-result-stars">{Array.from({ length: 3 }, (_, index) => <i key={index} className={phase === "success" && index < stars ? "earned" : ""}>★</i>)}</div><p>{message}</p>{phase === "success" && <><div className="wv-formula-reveal"><small>THE HIDDEN PHYSICS</small><b>{riverModel.name}</b><code>{riverModel.formula}</code><p>Your rectangles approximated the area under this flow curve. That accumulated area is the definite integral: <strong>{advancedNotation(level.concept)}</strong>.</p></div><div className="wv-crystal"><i>◆</i><div><b>CONCEPT CRYSTAL EARNED</b><span>Rectangle → area → accumulation → integral</span></div></div></>}<div className="wv-result-actions"><button onClick={reset}>{phase === "success" ? "REPLAY" : "TRY AGAIN"}</button><button onClick={onBack}>WORLD MAP →</button></div></div>}
      </section>
    </main>
  </div>;
}
