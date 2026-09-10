"use client";

import React, { useMemo, useRef, useState } from "react";
import rawShapes from "./data/natural-earth-uk-europe.json";
import {
  CLIMATE_DATA, CLIMATE_END, CLIMATE_MISSIONS, CLIMATE_START, ClimateLocation, ClimateMission, ClimateRow, EvidenceId, ForecastChoice, MissionPhase,
  conceptsFromText, evidenceLabel, evidenceValue, formatDate, formatShortDate, locationById, nextRow, previousRow, pressureHpa, rowAt, rowsAround, seasonFor, scoreMission,
} from "./engine";

type Shape = { type: "Feature"; properties: { ADMIN?: string }; geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } };
type ShapeCollection = { type: "FeatureCollection"; features: Shape[] };
type MapView = { scale: number; x: number; y: number };
type ForecastState = Record<"temperature" | "pressure" | "wind" | "rain", ForecastChoice>;
type MissionScore = ReturnType<typeof scoreMission>;

const shapes = rawShapes as ShapeCollection;
const initialForecast: ForecastState = { temperature: "steady", pressure: "steady", wind: "steady", rain: "steady" };
const mapBounds = { west: -20, east: 12, south: 45, north: 64, width: 1000, height: 610 };

function project(longitude: number, latitude: number) {
  return { x: ((longitude - mapBounds.west) / (mapBounds.east - mapBounds.west)) * mapBounds.width, y: ((mapBounds.north - latitude) / (mapBounds.north - mapBounds.south)) * mapBounds.height };
}

function linePath(points: number[][]) {
  return points.map(([longitude, latitude], index) => { const point = project(longitude, latitude); return `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`; }).join(" ") + " Z";
}

function featurePath(feature: Shape) {
  if (feature.geometry.type === "Polygon") return (feature.geometry.coordinates as number[][][]).map(linePath).join(" ");
  return (feature.geometry.coordinates as number[][][][]).flatMap(polygon => polygon.map(linePath)).join(" ");
}

function moveDate(date: string, days: number) {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function dateToDay(date: string) { return Math.max(1, Math.min(365, Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${CLIMATE_START}T00:00:00Z`)) / 86400000) + 1)); }
function trend(current: number, prior: number, unit = "") { const delta = current - prior; return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}${unit}`; }

function Sparkline({ rows, field, color, label }: { rows: ClimateRow[]; field: keyof ClimateRow; color: string; label: string }) {
  const values = rows.map(row => Number(row[field])).filter(Number.isFinite);
  const min = Math.min(...values); const max = Math.max(...values); const range = Math.max(.01, max - min);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${92 - ((value - min) / range) * 76}`).join(" ");
  return <div className="climate-sparkline"><div className="climate-sparkline-head"><span>{label}</span><b style={{ color }}>{values.at(-1)?.toFixed(1)}</b></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={`${label} trend`}><polyline points={points} fill="none" stroke={color} strokeWidth="2.8" vectorEffect="non-scaling-stroke" /><line x1="0" x2="100" y1="92" y2="92" stroke="rgba(255,255,255,.12)" /></svg></div>;
}

function MissionRail({ missions, activeIndex, completed }: { missions: ClimateMission[]; activeIndex: number; completed: Record<string, MissionScore> }) {
  return <div className="climate-mission-rail" aria-label="Investigation missions">{missions.map((mission, index) => <div key={mission.id} className={`climate-rail-step ${index === activeIndex ? "active" : ""} ${completed[mission.id] ? "done" : ""}`}><span>{completed[mission.id] ? "✓" : mission.number}</span><div><b>{mission.title}</b><small>{completed[mission.id] ? `${completed[mission.id].total}/14 points` : formatShortDate(mission.date)}</small></div></div>)}</div>;
}

function EvidenceCard({ id, row, prior, location, date, selected, onSelect, disabled }: { id: EvidenceId; row: ClimateRow; prior: ClimateRow; location: ClimateLocation; date: string; selected: boolean; onSelect: () => void; disabled?: boolean }) {
  const item = evidenceValue(id, row, prior, location, date);
  return <button className={`climate-evidence-card ${selected ? "selected" : ""}`} onClick={onSelect} disabled={disabled} aria-pressed={selected}><span className="climate-evidence-top"><i>{selected ? "✓" : "＋"}</i><small>{evidenceLabel(id)}</small></span><b>{item.value}</b><span>{item.detail}</span><em>{selected ? "Evidence pinned" : "Inspect evidence"}</em></button>;
}

function MapPanel({ date, location, locations, onLocation, mapView, setMapView, phase, activeMission }: { date: string; location: ClimateLocation; locations: ClimateLocation[]; onLocation: (id: string) => void; mapView: MapView; setMapView: React.Dispatch<React.SetStateAction<MapView>>; phase: MissionPhase; activeMission: ClimateMission | null }) {
  const drag = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const current = rowAt(location, date); const prior = previousRow(location, date); const next = nextRow(location, date);
  const startPan = (event: React.PointerEvent<SVGSVGElement>) => { if (event.pointerType === "mouse" && event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, originX: mapView.x, originY: mapView.y }; };
  const pan = (event: React.PointerEvent<SVGSVGElement>) => { const active = drag.current; if (!active || active.pointerId !== event.pointerId) return; setMapView(view => ({ ...view, x: active.originX + event.clientX - active.x, y: active.originY + event.clientY - active.y })); };
  const stopPan = () => { drag.current = null; };
  return <section className="climate-map-panel" aria-label="Real geographic map of the United Kingdom and North Atlantic">
    <div className="climate-map-heading"><div><span className="climate-overline">REAL GEOGRAPHY · NATURAL EARTH 1:110m</span><b>North Atlantic field</b></div><div className="climate-map-controls"><button onClick={() => setMapView(view => ({ ...view, scale: Math.min(2.8, view.scale + .25) }))} aria-label="Zoom in">+</button><button onClick={() => setMapView(view => ({ ...view, scale: Math.max(1, view.scale - .25) }))} aria-label="Zoom out">−</button><button onClick={() => setMapView({ scale: 1, x: 0, y: 0 })}>Reset</button></div></div>
    <div className="climate-map-frame"><svg viewBox={`0 0 ${mapBounds.width} ${mapBounds.height}`} role="img" aria-label={`Map showing the UK on ${formatDate(date)}`} onPointerDown={startPan} onPointerMove={pan} onPointerUp={stopPan} onPointerCancel={stopPan}>
      <defs><pattern id="climate-grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="rgba(159,221,226,.08)" strokeWidth="1" /></pattern><marker id="wind-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffd36b" /></marker></defs>
      <rect width="1000" height="610" fill="url(#climate-grid)" />
      <g transform={`translate(${mapView.x} ${mapView.y}) scale(${mapView.scale})`}>
        {shapes.features.map(feature => <path key={feature.properties.ADMIN} d={featurePath(feature)} className={`climate-land ${feature.properties.ADMIN === "United Kingdom" ? "focus" : ""}`} />)}
        <path d="M610,298 C657,271 690,265 726,275" fill="none" stroke="#ffd36b" strokeWidth="3" strokeDasharray="7 8" opacity=".8" markerEnd="url(#wind-arrow)" />
        <text x="618" y="253" className="climate-map-label">EASTERN FLOW</text>
        <text x="152" y="118" className="climate-map-label soft">NORTH ATLANTIC</text>
        {locations.map(item => { const point = project(item.longitude, item.latitude); const selectedPoint = item.id === location.id; return <g key={item.id} className={`climate-location-marker ${selectedPoint ? "selected" : ""}`} onClick={() => onLocation(item.id)} role="button" aria-label={`Select ${item.name}`}><circle cx={point.x} cy={point.y} r={selectedPoint ? 13 : 8} /><circle cx={point.x} cy={point.y} r="3" /><text x={point.x + 14} y={point.y + 4}>{item.name}</text></g>; })}
        {activeMission && <g className="climate-event-pulse"><circle cx={project(location.longitude, location.latitude).x} cy={project(location.longitude, location.latitude).y} r="24" /><circle cx={project(location.longitude, location.latitude).x} cy={project(location.longitude, location.latitude).y} r="35" /></g>}
      </g>
    </svg><div className="climate-map-badge"><span>{phase === "investigate" || phase === "explain" || phase === "predict" ? "MISSION PAUSED" : "HISTORICAL RECORD"}</span><b>{formatDate(date)}</b><small>{seasonFor(date)} · {location.name}</small></div><div className="climate-map-legend"><span><i className="legend-land" /> land boundary</span><span><i className="legend-marker" /> data point</span><span><i className="legend-flow" /> teaching flow</span></div></div>
    <div className="climate-map-readout"><div><small>TEMPERATURE</small><b>{current.t2m.toFixed(1)}°</b><span>{trend(current.t2m, prior.t2m, "°C")} / day</span></div><div><small>PRESSURE</small><b>{pressureHpa(current).toFixed(0)} hPa</b><span>{trend(pressureHpa(current), pressureHpa(prior), " hPa")}</span></div><div><small>WIND</small><b>{current.windCompass}</b><span>{current.windSpeed.toFixed(1)} m/s</span></div><div><small>RAIN</small><b>{current.precipitation.toFixed(1)} mm</b><span>{next.precipitation > current.precipitation ? "building" : "easing"}</span></div></div>
  </section>;
}

function ForecastControl({ label, value, choices, onChange }: { label: string; value: ForecastChoice; choices: ForecastChoice[]; onChange: (value: ForecastChoice) => void }) {
  return <div className="climate-forecast-row"><span>{label}</span><div>{choices.map(choice => <button key={choice} className={choice === value ? "active" : ""} onClick={() => onChange(choice)}>{choice}</button>)}</div></div>;
}

function ScoreCard({ result, mission, actual, following }: { result: MissionScore; mission: ClimateMission; actual: ClimateRow; following: ClimateRow }) {
  return <div className="climate-score-card"><div className="climate-score-total"><span>Investigation result</span><b>{result.total}<small>/14</small></b><em>{result.total >= 11 ? "Strong fieldwork" : result.total >= 7 ? "Useful lead" : "Keep investigating"}</em></div><div className="climate-score-grid"><div><span>Evidence</span><b>{result.evidence}/3</b></div><div><span>Concepts</span><b>{result.concepts}/3</b></div><div><span>Reasoning</span><b>{result.reasoning}/3</b></div><div><span>Forecast</span><b>{result.prediction}/3</b></div><div><span>Efficiency</span><b>{result.efficiency}/2</b></div></div><div className="climate-reveal"><span>WHAT ACTUALLY HAPPENED · {formatShortDate(following.date)}</span><div><b>{following.t2m.toFixed(1)}°C</b><small>temperature</small><b>{pressureHpa(following).toFixed(0)} hPa</b><small>pressure</small><b>{following.precipitation.toFixed(1)} mm</b><small>rain</small></div></div><div className="climate-feedback">{result.feedback.map(message => <p key={message}>· {message}</p>)}</div><p className="climate-score-note">{mission.reflection}</p><div className="climate-actual-strip"><span>Reality is the referee</span><b>{actual.windCompass} wind · {actual.windSpeed.toFixed(1)} m/s today</b></div></div>;
}

export default function ClimateDetectiveGame({ onBack }: { onBack: () => void }) {
  const [date, setDate] = useState(CLIMATE_START);
  const [locationId, setLocationId] = useState("london");
  const [phase, setPhase] = useState<MissionPhase>("observe");
  const [activeMissionIndex, setActiveMissionIndex] = useState(-1);
  const [completed, setCompleted] = useState<Record<string, MissionScore>>({});
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceId[]>([]);
  const [chain, setChain] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [forecast, setForecast] = useState<ForecastState>(initialForecast);
  const [result, setResult] = useState<MissionScore | null>(null);
  const [mapView, setMapView] = useState<MapView>({ scale: 1, x: 0, y: 0 });
  const [reflection, setReflection] = useState("");
  const [assessmentNote, setAssessmentNote] = useState("");
  const location = useMemo(() => locationById(locationId), [locationId]);
  const current = useMemo(() => rowAt(location, date), [location, date]);
  const prior = useMemo(() => previousRow(location, date), [location, date]);
  const following = useMemo(() => nextRow(location, date), [location, date]);
  const activeMission = activeMissionIndex >= 0 ? CLIMATE_MISSIONS[activeMissionIndex] : null;
  const signalRows = useMemo(() => rowsAround(location, date, 18), [location, date]);
  const timelinePosition = dateToDay(date);
  const solvedCount = Object.keys(completed).length;
  const usedConcepts = useMemo(() => [...new Set(conceptsFromText(answer))], [answer]);

  const resetMissionState = () => { setSelectedEvidence([]); setChain([]); setAnswer(""); setForecast(initialForecast); setResult(null); setReflection(""); };
  const beginMission = (index: number) => { resetMissionState(); setActiveMissionIndex(index); setDate(CLIMATE_MISSIONS[index].date); setPhase("investigate"); };
  const nextClue = () => { const nextIndex = CLIMATE_MISSIONS.findIndex((mission, index) => index > activeMissionIndex && !completed[mission.id] && mission.date > date); if (nextIndex >= 0) beginMission(nextIndex); else if (solvedCount === CLIMATE_MISSIONS.length) { setDate(CLIMATE_END); setPhase("assessment"); } };
  const advance = (days: number) => {
    if (phase !== "observe") return;
    const target = moveDate(date, days);
    const nextIndex = CLIMATE_MISSIONS.findIndex((mission, index) => index > activeMissionIndex && !completed[mission.id] && mission.date > date && mission.date <= target);
    if (nextIndex >= 0) beginMission(nextIndex); else setDate(target > CLIMATE_END ? CLIMATE_END : target);
  };
  const chooseLocation = (id: string) => { setLocationId(id); setMapView(view => ({ ...view, scale: Math.max(view.scale, 1.25) })); };
  const selectEvidence = (id: EvidenceId) => setSelectedEvidence(items => items.includes(id) ? items.filter(item => item !== id) : [...items, id]);
  const addChainStep = (step: string) => setChain(items => items.includes(step) ? items : [...items, step]);
  const removeChainStep = (index: number) => setChain(items => items.filter((_, itemIndex) => itemIndex !== index));
  const reveal = () => { if (!activeMission) return; const score = scoreMission(activeMission, selectedEvidence, chain, answer, forecast, current, following); setResult(score); setCompleted(old => ({ ...old, [activeMission.id]: score })); setPhase("reveal"); };
  const lockExplanation = () => { if (activeMission?.forecast) setPhase("predict"); else reveal(); };
  const continueAfterReveal = () => { if (activeMissionIndex < CLIMATE_MISSIONS.length - 1) { setActiveMissionIndex(activeMissionIndex); resetMissionState(); setPhase("observe"); } else { setDate(CLIMATE_END); setPhase("assessment"); } };
  const restart = () => { setDate(CLIMATE_START); setPhase("observe"); setActiveMissionIndex(-1); setCompleted({}); resetMissionState(); setAssessmentNote(""); };
  const chainRemaining = activeMission ? activeMission.chain.filter(step => !chain.includes(step.id)) : [];

  return <main className="climate-detective" style={{ "--climate-accent": phase === "investigate" || phase === "explain" || phase === "predict" ? "#ffd36b" : "#7edbd4" } as React.CSSProperties}>
    <header className="climate-header"><button className="climate-brand" onClick={onBack} aria-label="Return to Axiom Atlas"><span>CD</span><div><b>Climate Detective</b><small>A Year on Earth · UK / North Atlantic</small></div></button><div className="climate-header-centre"><span>HISTORICAL YEAR</span><b>{CLIMATE_DATA.historicalYear}</b></div><div className="climate-header-tools"><span><b>{solvedCount}</b> / {CLIMATE_MISSIONS.length} cases</span><button onClick={restart}>Restart year</button></div></header>
    <div className="climate-body"><aside className="climate-sidebar"><div className="climate-sidebar-top"><span className="climate-overline">FIELD NOTEBOOK</span><h1>A change is coming.</h1><p>Follow the record. When reality interrupts, collect evidence before you explain it.</p></div><MissionRail missions={CLIMATE_MISSIONS} activeIndex={activeMissionIndex} completed={completed} /><div className="climate-loop"><span className={phase === "observe" ? "active" : "done"}>01 <b>Observe</b></span><span className={phase === "investigate" ? "active" : phase === "observe" ? "" : "done"}>02 <b>Investigate</b></span><span className={phase === "explain" ? "active" : ["predict", "reveal", "reflect", "assessment"].includes(phase) ? "done" : ""}>03 <b>Explain</b></span><span className={phase === "predict" ? "active" : ["reveal", "reflect", "assessment"].includes(phase) ? "done" : ""}>04 <b>Predict</b></span><span className={phase === "reveal" || phase === "reflect" ? "active" : phase === "assessment" ? "done" : ""}>05 <b>Reveal</b></span></div><div className="climate-source-stamp"><small>DATA PROVENANCE</small><b>NASA POWER · NOAA OISST</b><span>Gridded analysis and daily SST. Not an operational forecast.</span><button onClick={() => window.alert("NASA POWER daily meteorology (MERRA-2) · NOAA OISST v2.1 · Natural Earth 1:110m. Full provenance is in docs/climate-detective/DATA_SOURCES.md.")}>View sources</button></div></aside>
      <div className="climate-main"><div className="climate-mission-banner"><div><span className="climate-overline">{activeMission ? `MISSION ${activeMission.number} · ${activeMission.kicker}` : phase === "assessment" ? "END-OF-YEAR WEATHER REPORT" : "THE RECORD IS MOVING"}</span><h2>{activeMission ? activeMission.title : phase === "assessment" ? "Write the final forecast." : "Run the year until something changes."}</h2><p>{activeMission ? activeMission.objective : phase === "assessment" ? "You have investigated three interruptions. Use the evidence pattern you learned to make one final weather report." : "Start near the beginning of 2018. The next clue will pause the clock for you."}</p></div><div className="climate-mission-status"><span>{phase === "observe" ? "READY TO RUN" : phase === "assessment" ? "YEAR COMPLETE" : phase.toUpperCase()}</span><b>{formatDate(date)}</b></div></div>
        <div className="climate-workspace"><MapPanel date={date} location={location} locations={CLIMATE_DATA.locations} onLocation={chooseLocation} mapView={mapView} setMapView={setMapView} phase={phase} activeMission={activeMission} />
          <aside className="climate-inspector">
            {phase === "observe" && <><div className="climate-inspector-heading"><span className="climate-overline">WHAT DO YOU NOTICE?</span><h3>The map is quiet — for now.</h3><p>Move time forward in meaningful jumps. The next data-backed event will stop the clock.</p></div><div className="climate-time-controls"><button className="climate-run-button" onClick={nextClue}>▶ Run to next clue</button><div><button onClick={() => advance(-1)} disabled={date === CLIMATE_START}>− day</button><button onClick={() => advance(1)}>+ day</button><button onClick={() => advance(7)}>+ week</button><button onClick={() => advance(30)}>+ month</button></div><label><span>2018 timeline</span><input type="range" min="1" max="365" value={timelinePosition} onChange={event => advance(Number(event.target.value) - timelinePosition)} /><div><small>Jan</small><small>Dec</small></div></label></div><div className="climate-observe-cards"><Sparkline rows={signalRows} field="t2m" color="#ffb86b" label="temperature · °C" /><Sparkline rows={signalRows} field="pressureKpa" color="#7edbd4" label="pressure · kPa" /></div><div className="climate-atlas-callout"><span>FIELD RULE</span><b>Real data creates the mystery.</b><p>Layers are instruments. Your job is to decide which signal matters before the explanation is revealed.</p></div></>}
            {phase === "investigate" && activeMission && <><div className="climate-inspector-heading"><span className="climate-overline">INVESTIGATE · CHOOSE EVIDENCE</span><h3>{activeMission.prompt}</h3><p>Pin at least two signals. Opening every instrument is not the same as understanding the weather.</p></div><div className="climate-evidence-list">{activeMission.evidence.map(id => <EvidenceCard key={id} id={id} row={current} prior={prior} location={location} date={date} selected={selectedEvidence.includes(id)} onSelect={() => selectEvidence(id)} />)}</div><button className="climate-action-button" disabled={selectedEvidence.length < 2} onClick={() => setPhase("explain")}>Build explanation <span>→</span></button></>}
            {phase === "explain" && activeMission && <><div className="climate-inspector-heading"><span className="climate-overline">EXPLAIN · BUILD A CAUSAL CHAIN</span><h3>What caused the change?</h3><p>Tap the links in order. Then write the explanation in your own words.</p></div><div className="climate-chain-board">{chain.map((stepId, index) => { const step = activeMission.chain.find(item => item.id === stepId)!; return <button key={stepId} className="climate-chain-step filled" onClick={() => removeChainStep(index)}><span>{index + 1}</span><b>{step.label}</b><small>{step.short}</small></button>; })}{chain.length === 0 && <div className="climate-chain-empty">Your causal chain will appear here.</div>}</div><div className="climate-chain-options"><small>AVAILABLE LINKS</small>{chainRemaining.map(step => <button key={step.id} onClick={() => addChainStep(step.id)}><span>＋</span>{step.label}</button>)}</div><label className="climate-answer"><span>YOUR FIELD NOTE</span><textarea value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Write what the evidence suggests…" rows={4} /><small>{usedConcepts.length ? `${usedConcepts.join(" · ")} recognised` : "Concepts appear as you write."}</small></label><button className="climate-action-button" disabled={chain.length < 2 || answer.trim().length < 12} onClick={lockExplanation}>{activeMission.forecast ? "Move to forecast" : "Reveal the result"} <span>→</span></button></>}
            {phase === "predict" && activeMission && <><div className="climate-inspector-heading"><span className="climate-overline">PREDICT · NEXT 24 HOURS</span><h3>What happens tomorrow?</h3><p>Choose directions, not false precision. You will see the historical answer after you commit.</p></div><div className="climate-forecast-card"><ForecastControl label="Temperature" value={forecast.temperature} choices={["warmer", "steady", "cooler"]} onChange={value => setForecast(old => ({ ...old, temperature: value }))} /><ForecastControl label="Pressure" value={forecast.pressure} choices={["rising", "steady", "falling"]} onChange={value => setForecast(old => ({ ...old, pressure: value }))} /><ForecastControl label="Wind" value={forecast.wind} choices={["stronger", "steady", "lighter"]} onChange={value => setForecast(old => ({ ...old, wind: value }))} /><ForecastControl label="Rain" value={forecast.rain} choices={["wetter", "steady", "drier"]} onChange={value => setForecast(old => ({ ...old, rain: value }))} /></div><div className="climate-prediction-signal"><span>YOUR EVIDENCE</span><b>{selectedEvidence.map(evidenceLabel).join(" · ")}</b></div><button className="climate-action-button" onClick={reveal}>Run +24 hours <span>→</span></button></>}
            {phase === "reveal" && activeMission && result && <><div className="climate-inspector-heading"><span className="climate-overline">REVEAL · REALITY CHECK</span><h3>The record answers back.</h3><p>You made a claim. Now compare it with the actual next day in the historical year.</p></div><ScoreCard result={result} mission={activeMission} actual={current} following={following} /><button className="climate-action-button" onClick={continueAfterReveal}>{activeMissionIndex < CLIMATE_MISSIONS.length - 1 ? "Continue the year" : "Finish the year"} <span>→</span></button></>}
            {phase === "assessment" && <><div className="climate-inspector-heading"><span className="climate-overline">ASSESSMENT · WEATHER REPORT</span><h3>Your report, forecaster.</h3><p>Use the latest evidence to describe what this year taught you. Keep seasonal warmth, weather events, anomalies and climate change separate.</p></div><div className="climate-final-report"><div><span>YEAR INVESTIGATED</span><b>{CLIMATE_YEAR}</b></div><div><span>CASES SOLVED</span><b>{solvedCount} / {CLIMATE_MISSIONS.length}</b></div><div><span>FIELD POINTS</span><b>{Object.values(completed).reduce((sum, item) => sum + item.total, 0)}</b></div></div><label className="climate-answer"><span>FINAL WEATHER REPORT</span><textarea value={assessmentNote} onChange={event => setAssessmentNote(event.target.value)} placeholder="The evidence I trusted most was…" rows={5} /><small>Try to name the evidence and the process it supports.</small></label><label className="climate-answer"><span>REFLECTION</span><textarea value={reflection} onChange={event => setReflection(event.target.value)} placeholder="What would you investigate next?" rows={3} /></label><div className="climate-end-note"><b>Vertical slice checkpoint</b><p>{solvedCount === CLIMATE_MISSIONS.length ? "Observe → Investigate → Explain → Predict → Reveal completed." : "Some cases remain open. Return to the year to finish the investigation."}</p></div><button className="climate-action-button" onClick={restart}>Replay the year <span>↻</span></button></>}
          </aside>
        </div>
      </div>
    </div>
  </main>;
}
