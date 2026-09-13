"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import worldShapes from "./data/natural-earth-world.json";
import { CLIMATE_DATA, locationById, pressureHpa, rowAt } from "./engine";
import {
  CORIOLIS_EXAMPLES, GLOBAL_CELLS, GLOBAL_LATITUDE_BANDS, GLOBAL_PRESSURE_BELTS, GLOBAL_WIND_BELTS,
  Hemisphere, PressureBelt, WindBelt, coriolisMotionLatitudes, equalEarthPoint,
} from "./global-circulation";

type WorldShape = { type: "Feature"; properties: { ADMIN?: string }; geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] } };
type WorldCollection = { type: "FeatureCollection"; features: WorldShape[] };
type LessonMode = "guided" | "explore";
type CirculationStage = 0 | 1 | 2 | 3 | 4 | 5;
type ExploreLayers = { latitude: boolean; pressure: boolean; cells: boolean; coriolis: boolean; winds: boolean; britain: boolean; historical: boolean };

const world = worldShapes as WorldCollection;
const VIEW = { width: 1200, height: 520, padding: 28 };
const INITIAL_EXPLORE_LAYERS: ExploreLayers = { latitude: true, pressure: false, cells: false, coriolis: false, winds: false, britain: false, historical: false };
const GUIDED_STAGES = [
  { id: 0, eyebrow: "01 / 06 · EARTH HEATING", title: "Unequal heating starts the circulation", body: "Sunlight is more concentrated near the equator. Air there warms, becomes less dense and rises. At high latitudes, the lower Sun angle spreads the same energy over a larger area, so colder, denser air tends to sink.", signal: "HEATING → VERTICAL MOTION", hint: "The latitude bands are a guide to where energy arrives differently." },
  { id: 1, eyebrow: "02 / 06 · PRESSURE BELTS", title: "Vertical motion helps make pressure belts", body: "Rising air is associated with lower surface pressure. Sinking air is associated with higher surface pressure. In this idealised climate model, broad belts form near the equator, around 30°, around 60° and near the poles.", signal: "RISING AIR → LOW · SINKING AIR → HIGH", hint: "These are climatological patterns, not the small weather-system L and H on today’s map." },
  { id: 2, eyebrow: "03 / 06 · THREE CELLS", title: "Each hemisphere is described by three cells", body: "The Hadley, Ferrel and Polar cells are a simplified way to describe the large-scale overturning. They help connect the pressure belts, but they are not fixed tubes of air and they do not replace real weather observations.", signal: "HADLEY · FERREL · POLAR", hint: "Season, land and ocean contrast make the real atmosphere more variable than this teaching model." },
  { id: 3, eyebrow: "04 / 06 · EARTH ROTATES", title: "Moving air is deflected by the Coriolis effect", body: "Earth’s rotation changes the path of moving air. In the Northern Hemisphere the deflection is to the right of the motion; in the Southern Hemisphere it is to the left. It does not mean every wind points right or left on a map.", signal: "NORTH: RIGHT · SOUTH: LEFT", hint: "Try the same idea with air moving toward the equator and toward the pole." },
  { id: 4, eyebrow: "05 / 06 · PREVAILING WINDS", title: "Wind belts emerge from the pattern", body: "Pressure differences start air moving. Rotation bends that motion, producing broad trade-wind, westerly and polar-easterly belts. Winds are named for where they come from: a westerly travels broadly from west to east.", signal: "PRESSURE DIFFERENCE + ROTATION → WIND BELTS", hint: "Click a belt to inspect its FROM direction, destination and cell association." },
  { id: 5, eyebrow: "06 / 06 · BRITAIN → REAL WEATHER", title: "Britain sits in the Northern mid-latitude westerlies", body: "Britain is around 50–60°N, so the background circulation is associated with the Northern Hemisphere westerlies. That makes Atlantic airflow common, but it does not make every UK wind south-westerly. The exact day depends on the weather-scale pressure pattern.", signal: "GLOBAL BACKGROUND ≠ DAILY WEATHER", hint: "Now compare the idealised context with the real 15 Jan 2018 Mission 01 record." },
] as const;

function featurePath(feature: WorldShape) {
  const line = (points: number[][]) => `${points.map(([longitude, latitude], index) => { const point = equalEarthPoint(longitude, latitude, VIEW.width, VIEW.height, VIEW.padding); return `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`; }).join(" ")} Z`;
  if (feature.geometry.type === "Polygon") return (feature.geometry.coordinates as number[][][]).map(line).join(" ");
  return (feature.geometry.coordinates as number[][][][]).flatMap(polygon => polygon.map(line)).join(" ");
}

function latitudeY(latitude: number) { return equalEarthPoint(0, latitude, VIEW.width, VIEW.height, VIEW.padding).y; }
function safeStage(value: number): CirculationStage { return Math.max(0, Math.min(5, value)) as CirculationStage; }
function beltMidLatitude(belt: WindBelt) { const parts = belt.latitudeRange.match(/-?\d+/g)?.map(Number) ?? [0, 0]; return belt.hemisphere === "north" ? (parts[0] + parts[1]) / 2 : -(parts[0] + parts[1]) / 2; }
function bearingVector(bearing: number, length = 78) { const radians = bearing * Math.PI / 180; return { x: Math.sin(radians) * length, y: -Math.cos(radians) * length * .65 }; }
function beltArrow(belt: WindBelt, longitude: number) { const origin = equalEarthPoint(longitude, beltMidLatitude(belt), VIEW.width, VIEW.height, VIEW.padding); const vector = bearingVector(belt.toBearing); return { origin, end: { x: origin.x + vector.x, y: origin.y + vector.y } }; }

function PressureBeltMarker({ belt, selected, onSelect }: { belt: PressureBelt; selected: boolean; onSelect: () => void }) {
  const point = equalEarthPoint(0, belt.centreLatitude, VIEW.width, VIEW.height, VIEW.padding);
  return <g className={`global-pressure-marker ${belt.kind === "L" ? "low" : "high"} ${selected ? "selected" : ""}`} role="button" tabIndex={0} onClick={onSelect} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(); } }} aria-label={`${belt.name}, ${belt.kind === "H" ? "high" : "low"} pressure, ${belt.latitudeRange}`}>
    <circle cx={point.x} cy={point.y} r="19" /><text x={point.x} y={point.y + 6} textAnchor="middle">{belt.kind}</text><text className="global-pressure-name" x={point.x + 28} y={point.y + 4}>{belt.name}</text>
  </g>;
}

function CellLayer({ hemisphere }: { hemisphere: Hemisphere }) {
  const sign = hemisphere === "north" ? 1 : -1;
  return <g className="global-cell-layer" aria-label={`${hemisphere === "north" ? "Northern" : "Southern"} Hemisphere atmospheric cells`}>
    {GLOBAL_CELLS.filter(cell => cell.hemisphere === hemisphere).map(cell => { const from = Math.min(cell.fromLatitude, cell.toLatitude); const to = Math.max(cell.fromLatitude, cell.toLatitude); const y = latitudeY((from + to) / 2); const x1 = equalEarthPoint(-126, (from + to) / 2, VIEW.width, VIEW.height, VIEW.padding).x; const x2 = equalEarthPoint(126, (from + to) / 2, VIEW.width, VIEW.height, VIEW.padding).x; const arrowY = y + (cell.name === "Hadley Cell" ? sign * 13 : cell.name === "Ferrel Cell" ? -sign * 11 : sign * 11); return <g key={cell.id} className={`global-cell global-cell-${cell.name.toLowerCase().split(" ")[0]}`}><path d={`M${x1},${y} Q${(x1 + x2) / 2},${arrowY} ${x2},${y}`} /><path d={`M${x2},${y} Q${(x1 + x2) / 2},${arrowY + sign * 20} ${x1},${y + sign * 2}`} /><text x={(x1 + x2) / 2} y={y + sign * 30} textAnchor="middle">{cell.name}</text></g>; })}
  </g>;
}

function CoriolisMapArrow({ exampleId }: { exampleId: typeof CORIOLIS_EXAMPLES[number]["id"] }) {
  const example = CORIOLIS_EXAMPLES.find(item => item.id === exampleId) ?? CORIOLIS_EXAMPLES[0];
  const { startLatitude, endLatitude } = coriolisMotionLatitudes(example.id);
  const start = { x: 610, y: latitudeY(startLatitude) };
  const end = { x: 610, y: latitudeY(endLatitude) };
  const movingDown = end.y > start.y;
  const screenRight = movingDown ? example.deflection === "right" : example.deflection !== "right";
  const curve = screenRight ? 70 : -70;
  return <g className="global-coriolis-map" aria-label={`${example.motion}; deflects ${example.deflection}; ${startLatitude}° to ${endLatitude}°`}><path className="global-coriolis-straight" d={`M${start.x},${start.y} L${end.x},${end.y}`} /><path className="global-coriolis-curve" d={`M${start.x},${start.y} Q${start.x + curve},${(start.y + end.y) / 2} ${end.x + curve * .55},${end.y}`} markerEnd="url(#global-arrow-gold)" /><text x={start.x + curve * .55 + 10} y={(start.y + end.y) / 2}>{example.deflection.toUpperCase()} → {example.result}</text></g>;
}

function GlobalMap({ stage, mode, layers, selectedBeltId, selectedPressureId, coriolisExampleId, onSelectBelt, onSelectPressure, onShowBritain }: { stage: CirculationStage; mode: LessonMode; layers: ExploreLayers; selectedBeltId: string | null; selectedPressureId: string | null; coriolisExampleId: typeof CORIOLIS_EXAMPLES[number]["id"]; onSelectBelt: (belt: WindBelt) => void; onSelectPressure: (belt: PressureBelt) => void; onShowBritain: () => void }) {
  const visible = mode === "guided" ? { latitude: true, pressure: stage >= 1, cells: stage >= 2, coriolis: stage >= 3, winds: stage >= 4, britain: stage >= 5, historical: stage >= 5 } : layers;
  const britain = equalEarthPoint(-3.2, 55, VIEW.width, VIEW.height, VIEW.padding);
  const historical = rowAt(locationById("london"), CLIMATE_DATA.selectedEvents.depression?.date ?? "2018-01-15");
  const actualTo = bearingVector((historical.windDirection + 180) % 360, 88);
  const beltLongitudes = [-145, -78, 0, 78, 145];
  return <div className="global-map-shell"><div className="global-map-labels"><span>90°N</span><span>60°N</span><span>30°N</span><span>EQUATOR</span><span>30°S</span><span>60°S</span><span>90°S</span></div><svg className="global-circulation-map" viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label="Equal Earth world map with latitude bands and idealised global circulation layers">
    <defs><marker id="global-arrow-gold" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#ffd36b" /></marker><marker id="global-arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7edbd4" /></marker></defs>
    <rect width={VIEW.width} height={VIEW.height} className="global-map-ocean" />
    {visible.latitude && <g className="global-latitude-lines">{GLOBAL_LATITUDE_BANDS.map(band => <g key={band.latitude}><line x1={VIEW.padding} x2={VIEW.width - VIEW.padding} y1={latitudeY(band.latitude)} y2={latitudeY(band.latitude)} /><text x={VIEW.padding + 8} y={latitudeY(band.latitude) - 7}>{band.shortLabel}</text></g>)}</g>}
    <g className="global-land-layer">{world.features.map(feature => <path key={feature.properties.ADMIN} d={featurePath(feature)} className={feature.properties.ADMIN === "United Kingdom" && visible.britain ? "britain" : ""} />)}</g>
    {visible.pressure && <g className="global-pressure-layer">{GLOBAL_PRESSURE_BELTS.map(belt => <PressureBeltMarker key={belt.id} belt={belt} selected={selectedPressureId === belt.id} onSelect={() => onSelectPressure(belt)} />)}</g>}
    {visible.cells && <><CellLayer hemisphere="north" /><CellLayer hemisphere="south" /></>}
    {visible.coriolis && <CoriolisMapArrow exampleId={coriolisExampleId} />}
    {visible.winds && <g className="global-wind-layer">{GLOBAL_WIND_BELTS.flatMap(belt => beltLongitudes.map(longitude => { const arrow = beltArrow(belt, longitude); const selected = selectedBeltId === belt.id; return <g key={`${belt.id}-${longitude}`} className={`global-wind-belt ${selected ? "selected" : ""}`} role="button" tabIndex={0} onClick={() => onSelectBelt(belt)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectBelt(belt); } }} aria-label={`${belt.name}, from ${belt.fromDirection}, toward ${belt.toDirection}, ${belt.latitudeRange}`}><line className="global-wind-hit" x1={arrow.origin.x} y1={arrow.origin.y} x2={arrow.end.x} y2={arrow.end.y} /><line className="global-wind-arrow" markerEnd="url(#global-arrow-gold)" x1={arrow.origin.x} y1={arrow.origin.y} x2={arrow.end.x} y2={arrow.end.y} /></g>; }))}</g>}
    {visible.britain && <g className="global-britain-layer" onClick={onShowBritain} role="button" tabIndex={0} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onShowBritain(); } }} aria-label="Show Britain in the Northern Hemisphere mid-latitudes"><circle cx={britain.x} cy={britain.y} r="14" /><circle cx={britain.x} cy={britain.y} r="4" /><text x={britain.x + 20} y={britain.y - 8}>BRITAIN · 55°N</text><path d={`M${britain.x - 110},${britain.y + 38} Q${britain.x - 40},${britain.y - 8} ${britain.x - 12},${britain.y + 4}`} markerEnd="url(#global-arrow-gold)" /><text x={britain.x - 112} y={britain.y + 59}>NORTH ATLANTIC → UK</text></g>}
    {visible.historical && <g className="global-historical-layer" aria-label="Historical Mission 01 wind on 15 January 2018"><rect x={britain.x - 92} y={britain.y - 78} width="206" height="43" rx="3" /><text x={britain.x - 80} y={britain.y - 60}>15 JAN 2018 · HISTORICAL DATA</text><text x={britain.x - 80} y={britain.y - 44}>FROM {historical.windCompass} · {historical.windSpeed.toFixed(1)} m/s</text><line markerEnd="url(#global-arrow-cyan)" x1={britain.x - 78} y1={britain.y + 83} x2={britain.x - 78 + actualTo.x} y2={britain.y + 83 + actualTo.y} /><text x={britain.x - 80} y={britain.y + 113}>observed/analysis wind · arrow TO</text></g>}
    {stage === 0 && <g className="global-heating-layer"><ellipse cx={VIEW.width / 2} cy={latitudeY(0)} rx="235" ry="28" /><path d={`M${VIEW.width / 2 - 260},${latitudeY(0) - 120} L${VIEW.width / 2 - 150},${latitudeY(0) - 30}`} markerEnd="url(#global-arrow-gold)" /><path d={`M${VIEW.width / 2 + 260},${latitudeY(0) - 120} L${VIEW.width / 2 + 150},${latitudeY(0) - 30}`} markerEnd="url(#global-arrow-gold)" /><text x={VIEW.width / 2} y={latitudeY(0) + 9} textAnchor="middle">MORE CONCENTRATED SOLAR ENERGY</text></g>}
  </svg><div className="global-map-caption"><span>{mode === "guided" ? "IDEALISED CLIMATE MODEL" : "EXPLORE · TOGGLE A LAYER"}</span><b>{visible.historical ? "Global context → 15 Jan 2018" : visible.winds ? "Click a wind belt to inspect it" : visible.pressure ? "Broad climatological pressure pattern" : "Latitude is the organising clue"}</b></div></div>;
}

function CoriolisDemo({ exampleId, rotationOn, onExample, onToggleRotation }: { exampleId: typeof CORIOLIS_EXAMPLES[number]["id"]; rotationOn: boolean; onExample: (id: typeof CORIOLIS_EXAMPLES[number]["id"]) => void; onToggleRotation: () => void }) {
  const example = CORIOLIS_EXAMPLES.find(item => item.id === exampleId) ?? CORIOLIS_EXAMPLES[0];
  const { startLatitude, endLatitude } = coriolisMotionLatitudes(example.id);
  const movingDown = endLatitude < startLatitude;
  const startY = movingDown ? 20 : 85;
  const endY = movingDown ? 85 : 20;
  const screenRight = movingDown ? example.deflection === "right" : example.deflection !== "right";
  const demoCurve = screenRight ? 58 : -58;
  const route = `${Math.abs(startLatitude)}°${startLatitude >= 0 ? "N" : "S"} → ${endLatitude === 0 ? "equator" : `${Math.abs(endLatitude)}°${endLatitude >= 0 ? "N" : "S"}`}`;
  return <div className="global-coriolis-demo"><div className="global-demo-heading"><span>INTERACTIVE CORIOLIS DEMO</span><b>{rotationOn ? "EARTH ROTATION ON" : "EARTH ROTATION OFF"}</b></div><div className="global-demo-controls"><button className={!rotationOn ? "active" : ""} onClick={() => { if (rotationOn) onToggleRotation(); }}>Rotation OFF</button><button className={rotationOn ? "active" : ""} onClick={() => { if (!rotationOn) onToggleRotation(); }}>Rotation ON</button></div><div className="global-coriolis-examples">{CORIOLIS_EXAMPLES.map(item => <button key={item.id} className={item.id === exampleId ? "active" : ""} onClick={() => onExample(item.id)}>{item.hemisphere === "north" ? "NH" : "SH"} · {item.id.includes("equatorward") ? "toward equator" : "toward pole"}</button>)}</div><div className="global-demo-track"><svg viewBox="0 0 280 105" role="img" aria-label={`${example.motion}; ${route}; ${rotationOn ? `deflects ${example.deflection}` : "travels in a straight conceptual path"}`}><defs><marker id="demo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" fill={rotationOn ? "#ffd36b" : "#7edbd4"} /></marker></defs><path className="demo-straight" d={`M140 ${startY} L140 ${endY}`} markerEnd="url(#demo-arrow)" /><path className={`demo-curve ${rotationOn ? "on" : "off"}`} d={rotationOn ? `M140 ${startY} Q${140 + demoCurve} 52 174 ${endY}` : `M140 ${startY} L140 ${endY}`} markerEnd="url(#demo-arrow)" /></svg><div><b>{route} · {rotationOn ? `Deflects ${example.deflection}` : "Conceptual pressure-gradient path"}</b><p>{rotationOn ? `In the ${example.hemisphere === "north" ? "Northern" : "Southern"} Hemisphere, this motion bends to the ${example.deflection}. The resulting ${example.result} is a broad pattern, not a daily forecast.` : "A simple teaching view that ignores Earth’s rotation. Pressure differences can start motion, but this is not the complete real-world path."}</p></div></div></div>;
}

function WindBeltDetail({ belt }: { belt: WindBelt }) {
  return <div className="global-belt-detail"><div><span>SELECTED WIND BELT</span><b>{belt.name}</b></div><p><strong>FROM</strong> {belt.fromDirection} <span>→</span> <strong>TO</strong> {belt.toDirection}</p><div className="global-belt-facts"><span><small>LATITUDE</small><b>{belt.latitudeRange}</b></span><span><small>PRESSURE</small><b>{belt.pressureBelts}</b></span><span><small>CELL</small><b>{belt.cell}</b></span></div><small className="global-belt-note">{belt.note}</small></div>;
}

function HistoricalBridge() {
  const london = locationById("london");
  const date = CLIMATE_DATA.selectedEvents.depression?.date ?? "2018-01-15";
  const row = rowAt(london, date);
  const sst = CLIMATE_DATA.oceanSource.values[date];
  return <div className="global-historical-bridge"><div className="global-bridge-heading"><span>REAL WEATHER · MISSION 01</span><b>Now return from the model to the record</b></div><div className="global-bridge-grid"><div><small>DATE</small><b>15 Jan 2018</b><span>historical daily record</span></div><div><small>SURFACE PRESSURE</small><b>{pressureHpa(row).toFixed(0)} hPa</b><span>NASA POWER PS · London</span></div><div><small>WIND</small><b>FROM {row.windCompass}</b><span>{row.windSpeed.toFixed(1)} m/s · arrow points TO</span></div><div><small>RAINFALL</small><b>{row.precipitation.toFixed(1)} mm/day</b><span>{sst ? `North Atlantic SST ${sst.celsius.toFixed(1)}°C` : "daily rainfall signal"}</span></div></div><p><strong>GLOBAL CLIMATE CONTEXT:</strong> Britain sits in the mid-latitude westerlies, so Atlantic airflow is common. <strong>WEATHER-SCALE REALITY:</strong> the exact south-westerly wind on this date is set by the historical pressure field, pressure gradient, Earth’s rotation, friction and local conditions. The global model explains the background; it does not replace today’s evidence.</p></div>;
}

export default function GlobalWindSystems({ initialStage = 0, onClose }: { initialStage?: number; onClose: () => void }) {
  const [mode, setMode] = useState<LessonMode>("guided");
  const [stage, setStage] = useState<CirculationStage>(safeStage(initialStage));
  const [exploreLayers, setExploreLayers] = useState<ExploreLayers>(INITIAL_EXPLORE_LAYERS);
  const [selectedBeltId, setSelectedBeltId] = useState<string | null>(null);
  const [selectedPressureId, setSelectedPressureId] = useState<string | null>(null);
  const [coriolisExampleId, setCoriolisExampleId] = useState<typeof CORIOLIS_EXAMPLES[number]["id"]>(initialStage >= 3 ? "north-poleward" : "north-equatorward");
  const [rotationOn, setRotationOn] = useState(true);
  const [challengeAnswer, setChallengeAnswer] = useState<"westward" | "eastward" | null>(null);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const currentStage = GUIDED_STAGES[stage];
  const selectedBelt = useMemo(() => GLOBAL_WIND_BELTS.find(belt => belt.id === selectedBeltId) ?? null, [selectedBeltId]);
  const selectedPressure = useMemo(() => GLOBAL_PRESSURE_BELTS.find(belt => belt.id === selectedPressureId) ?? null, [selectedPressureId]);
  const guidedComplete = stage === 5;

  useEffect(() => { panelRef.current?.focus(); }, []);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  const goStage = (next: number) => { setMode("guided"); setStage(safeStage(next)); setSelectedBeltId(null); setSelectedPressureId(null); setChallengeChecked(false); setChallengeAnswer(null); };
  const showBritain = () => { setStage(5); setSelectedBeltId("north-westerlies"); };
  const toggleLayer = (key: keyof ExploreLayers) => setExploreLayers(old => ({ ...old, [key]: !old[key] }));
  const challengeIsCorrect = challengeAnswer === "westward";
  const challenge = <div className="global-predict-challenge"><div><span>OPTIONAL MINI-GAME · PREDICT THE WIND</span><b>Air moves south from a subtropical high toward the equatorial low at 20°N. Which way does Earth’s rotation deflect it?</b></div><div className="global-challenge-options"><button className={challengeAnswer === "westward" ? "active" : ""} onClick={() => { setChallengeAnswer("westward"); setChallengeChecked(false); }}>Westward component</button><button className={challengeAnswer === "eastward" ? "active" : ""} onClick={() => { setChallengeAnswer("eastward"); setChallengeChecked(false); }}>Eastward component</button><button className="global-challenge-check" disabled={!challengeAnswer} onClick={() => setChallengeChecked(true)}>Check</button></div>{challengeChecked && <p className={challengeIsCorrect ? "correct" : "incorrect"}>{challengeIsCorrect ? "Correct. Southward motion in the Northern Hemisphere is deflected to the right, adding a westward component. That helps make the north-east trade winds." : "Not this time. Face south and picture right: the deflection adds a westward component, helping make the north-east trade winds."}</p>}</div>;

  return <div className="climate-global-overlay" role="presentation"><div className="climate-global-panel" role="dialog" aria-modal="true" aria-labelledby="global-wind-title" tabIndex={-1} ref={panelRef}>
    <header className="global-panel-header"><div><span className="climate-overline">GLOBAL CONTEXT · TEACHING MODEL + HISTORICAL BRIDGE</span><h2 id="global-wind-title">Global Wind Systems</h2><p>Why does Britain’s wind come from the south-west rather than simply travelling in a straight line from high pressure to low?</p></div><button className="global-close-button" onClick={onClose} aria-label="Close Global Wind Systems">×</button></header>
    <div className="global-mode-tabs" role="tablist" aria-label="Global Wind Systems modes"><button role="tab" aria-selected={mode === "guided"} className={mode === "guided" ? "active" : ""} onClick={() => setMode("guided")}>Guided lesson</button><button role="tab" aria-selected={mode === "explore"} className={mode === "explore" ? "active" : ""} disabled={!guidedComplete} onClick={() => setMode("explore")}>Explore layers {guidedComplete ? "" : "· finish Guided first"}</button></div>
    {mode === "guided" ? <div className="global-stage-strip" aria-label="Guided lesson stages">{GUIDED_STAGES.map(item => <button key={item.id} className={item.id === stage ? "active" : item.id < stage ? "done" : ""} onClick={() => goStage(item.id)} aria-label={`Guided stage ${item.id + 1}: ${item.title}`}><span>{item.id < stage ? "✓" : String(item.id + 1).padStart(2, "0")}</span><small>{item.title}</small></button>)}</div> : <div className="global-explore-controls" aria-label="Explore global circulation layers">{(["latitude", "pressure", "cells", "coriolis", "winds", "britain", "historical"] as const).map(layer => <button key={layer} className={exploreLayers[layer] ? "active" : ""} aria-pressed={exploreLayers[layer]} onClick={() => toggleLayer(layer)}>{layer === "latitude" ? "Latitude" : layer === "pressure" ? "Pressure belts" : layer === "cells" ? "Atmospheric cells" : layer === "coriolis" ? "Coriolis" : layer === "winds" ? "Wind belts" : layer === "britain" ? "Show Britain" : "15 Jan 2018"}</button>)}</div>}
    <div className="global-panel-body"><GlobalMap stage={stage} mode={mode} layers={exploreLayers} selectedBeltId={selectedBeltId} selectedPressureId={selectedPressureId} coriolisExampleId={coriolisExampleId} onSelectBelt={belt => { setSelectedBeltId(belt.id); setExploreLayers(old => ({ ...old, winds: true })); }} onSelectPressure={belt => setSelectedPressureId(belt.id)} onShowBritain={showBritain} />
      <aside className="global-lesson-card">{mode === "guided" ? <><span className="global-lesson-eyebrow">{currentStage.eyebrow}</span><h3>{currentStage.title}</h3><p>{currentStage.body}</p><div className="global-lesson-signal"><small>FOLLOW THE SIGNAL</small><b>{currentStage.signal}</b></div><small className="global-lesson-hint">{currentStage.hint}</small>{stage === 1 && selectedPressure && <div className="global-selected-callout"><b>{selectedPressure.name}</b><p>{selectedPressure.kind === "H" ? "Sinking air is associated with this idealised high-pressure belt." : "Rising air is associated with this idealised low-pressure belt."} <strong>{selectedPressure.latitudeRange}</strong>.</p></div>}{stage === 3 && <CoriolisDemo exampleId={coriolisExampleId} rotationOn={rotationOn} onExample={setCoriolisExampleId} onToggleRotation={() => setRotationOn(value => !value)} />}{stage === 4 && selectedBelt && <WindBeltDetail belt={selectedBelt} />}{stage === 3 && challenge}{stage === 5 && <HistoricalBridge />}</> : <><span className="global-lesson-eyebrow">EXPLORE MODE · REFERENCE</span><h3>Build your own global-to-local view</h3><p>Turn one layer on at a time. Solid land and latitude lines are geographic context. Dashed arrows, belts and cells are the idealised climate model. The 15 Jan 2018 panel is historical data.</p>{selectedPressure && <div className="global-selected-callout"><b>{selectedPressure.name}</b><p>{selectedPressure.kind === "H" ? "High-pressure belt · sinking air" : "Low-pressure belt · rising air"} · {selectedPressure.latitudeRange}.</p></div>}{selectedBelt && <WindBeltDetail belt={selectedBelt} />}{exploreLayers.coriolis && <CoriolisDemo exampleId={coriolisExampleId} rotationOn={rotationOn} onExample={setCoriolisExampleId} onToggleRotation={() => setRotationOn(value => !value)} />}{exploreLayers.historical && <HistoricalBridge />}{exploreLayers.winds && !selectedBelt && <div className="global-lesson-tip"><b>Choose a wind belt on the map.</b><p>Its card will show the FROM direction, destination, latitude range, pressure connection and cell.</p></div>}</>}</aside>
    </div>
    <footer className="global-panel-footer"><div>{mode === "guided" ? <><span>GLOBAL → LOCAL</span><b>{stage === 5 ? "The model has met the real record." : "Advance when the idea is clear."}</b></> : <><span>MODEL / DATA LEGEND</span><b>Idealised climate model · Historical weather data</b></>}</div><div className="global-footer-actions">{mode === "guided" && <><button onClick={() => goStage(stage - 1)} disabled={stage === 0}>Back</button>{stage < 5 ? <button className="primary" onClick={() => goStage(stage + 1)}>Next <span>→</span></button> : <button className="primary" onClick={onClose}>Return to mission <span>→</span></button>}</>}{mode === "explore" && <button className="primary" onClick={onClose}>Return to mission <span>→</span></button>}</div></footer>
  </div></div>;
}
