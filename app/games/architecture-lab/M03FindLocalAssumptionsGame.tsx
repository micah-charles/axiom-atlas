"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  M03_EVIDENCE,
  M03_EXPLANATION_CONCEPTS,
  M03_EXPLANATION_LINKS,
  M03_INITIAL_MAP,
  M03_PREDICTIONS,
  M03_RESULTS,
  canCommitM03Map,
  canCommitM03Predictions,
  canCompleteM03,
  canMutateM03Classification,
  correctM03Map,
  correctM03ResultMatches,
  explanationOrderCorrect,
  scoreM03,
  type M03Classification,
  type M03EvidenceId,
  type M03ExplanationConceptId,
  type M03ExplanationLinkId,
  type M03PredictionChoice,
  type M03PredictionId,
  type M03ResultId,
} from "./m03-engine";

type Phase = "observe" | "investigate" | "classify" | "predict" | "run" | "result" | "explain" | "complete";

const CLASSIFICATION_LABELS: Record<M03Classification, string> = {
  UNCLASSIFIED: "Unclassified",
  BOUND_TO_HOST_01: "Bound to HOST 01",
  NOT_PROVEN_LOCAL: "Not proven local",
};

const INITIAL_EXPLANATION_ORDER: M03ExplanationConceptId[] = [
  "DB_LOCALHOST",
  "SHOP_WORKS_ON_HOST_01",
  "IMAGE_LOCAL_DISK",
  "PLACEMENT_ASSUMPTIONS_EXIST",
  "BOUNDARY_CHANGE_EXPOSES_COUPLING",
  "SESSION_PROCESS_MEMORY",
];

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Classify", "Predict", "Reveal", "Explain"];
  const phaseIndex = phase === "observe" ? 0 : phase === "investigate" ? 1 : phase === "classify" ? 2 : phase === "predict" || phase === "run" ? 3 : phase === "result" ? 4 : 5;
  return <div className="arch-lab-progress" aria-label="M03 mission progress">
    {items.map((item, index) => <span className={index <= phaseIndex ? "active" : ""} key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}
  </div>;
}

function EvidenceCard({ item, inspected, onInspect }: { item: typeof M03_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button className={`arch-m03-evidence ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-m03-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong>
    <span>{inspected ? item.observation : item.preview}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.provenance}</small></>}
  </button>;
}

const M03_RESOURCE_META = {
  E01: { label: "DB", detail: "localhost:3306", kind: "db" },
  E02: { label: "Images", detail: "local disk", kind: "images" },
  E03: { label: "Session", detail: "process memory", kind: "session" },
} as const;

type M03ResourceId = keyof typeof M03_RESOURCE_META;

function M03DependencyGlyph({ kind }: { kind: "app" | "db" | "images" | "session" | "dns" | "package" }) {
  if (kind === "app") return <svg viewBox="0 0 48 36" aria-hidden="true"><rect x="6" y="6" width="36" height="24" rx="3" /><path d="M12 13h24M12 19h15M12 25h20" /><circle cx="35" cy="19" r="2" /></svg>;
  if (kind === "db") return <svg viewBox="0 0 48 36" aria-hidden="true"><ellipse cx="24" cy="8" rx="13" ry="4" /><path d="M11 8v18c0 3 6 5 13 5s13-2 13-5V8M11 17c0 3 6 5 13 5s13-2 13-5" /></svg>;
  if (kind === "images") return <svg viewBox="0 0 48 36" aria-hidden="true"><path d="M8 9h12l3 4h17v16H8z" /><path d="M13 24l6-6 5 5 4-4 7 5" /></svg>;
  if (kind === "session") return <svg viewBox="0 0 48 36" aria-hidden="true"><rect x="8" y="7" width="32" height="22" rx="3" /><path d="M14 13h20M14 19h12M14 25h17" /><circle cx="35" cy="19" r="2" /></svg>;
  if (kind === "dns") return <svg viewBox="0 0 48 36" aria-hidden="true"><rect x="7" y="7" width="34" height="22" rx="2" /><path d="M13 13h22M13 19h12M13 25h18" /><circle cx="34" cy="19" r="3" /></svg>;
  return <svg viewBox="0 0 48 36" aria-hidden="true"><path d="M8 10h13l3 4h16v15H8z" /><path d="M14 21h20M14 25h14" /></svg>;
}

function M03DependencyBoard({ phase, inspected, map, onInspect }: { phase: Phase; inspected: M03EvidenceId[]; map: Record<M03EvidenceId, M03Classification>; onInspect: (id: M03EvidenceId) => void }) {
  const moved = ["result", "explain", "complete"].includes(phase);
  const targetReady = phase === "predict" || phase === "run";
  const resourceIds = Object.keys(M03_RESOURCE_META) as M03ResourceId[];
  const inHostOne = resourceIds.filter(id => moved || map[id] === "BOUND_TO_HOST_01");
  const unresolved = resourceIds.filter(id => !moved && !inspected.includes(id));
  const notProvenLocal = resourceIds.filter(id => !moved && map[id] === "NOT_PROVEN_LOCAL");
  const inspectedEntry = inspected.includes("E04");
  const boardLabel = moved ? "Boundary exposed · compare the consequences" : targetReady ? "Experiment target · application moves only" : phase === "classify" ? "Map the placement assumptions" : "Unknown placements · inspect before classifying";
  const renderResource = (id: M03ResourceId, location: "host" | "pool" | "external") => {
    const item = M03_RESOURCE_META[id];
    const token = <span className={`arch-m03-dependency-token ${location}`}><span className="arch-m03-dependency-glyph"><M03DependencyGlyph kind={item.kind} /></span><b>{item.label}</b><small>{moved ? "remains on HOST 01" : item.detail}</small></span>;
    return inspected.includes(id) || moved ? token : <button className="arch-m03-dependency-token unknown" onClick={() => onInspect(id)} aria-label={`Inspect ${id} ${item.label}`}><span className="arch-m03-dependency-glyph mystery">?</span><b>{item.label}</b><small>INSPECT</small></button>;
  };

  return <section className={`arch-panel arch-m03-dependency-board ${moved ? "moved" : ""}`} aria-label="Host-boundary dependency board">
    <div className="arch-m03-board-head"><div><span className="arch-overline">HOST BOUNDARY · PLAYABLE BOARD</span><h3>What crosses the boundary?</h3></div><b>{boardLabel}</b></div>
    <div className="arch-m03-boundary-rail"><div className={`arch-m03-boundary-node ${inspectedEntry ? "inspected" : ""}`}><span className="arch-m03-dependency-glyph"><M03DependencyGlyph kind="dns" /></span><b>DNS</b><small>{inspectedEntry ? "outside hosts" : "? entry path"}</small></div><span className="arch-m03-boundary-caption">OUTSIDE HOST BOUNDARY</span><div className="arch-m03-boundary-line" aria-hidden="true" /></div>
    <div className="arch-m03-host-board">
      <div className="arch-m03-host-zone current"><span className="arch-m03-host-kicker">HOST 01 · CURRENT MACHINE</span><h4>{moved ? "resources remain" : "working shop"}</h4><div className="arch-m03-zone-stack"><span className="arch-m03-dependency-token app"><span className="arch-m03-dependency-glyph"><M03DependencyGlyph kind="app" /></span><b>Application</b><small>{moved ? "moved to HOST 02" : "running here"}</small></span>{inHostOne.map(id => <span key={id}>{renderResource(id, "host")}</span>)}{unresolved.map(id => <span key={id}>{renderResource(id, "pool")}</span>)}</div></div>
      <div className="arch-m03-host-transfer" aria-hidden="true"><span>{moved ? "APP →" : targetReady ? "APP ?" : "BOUNDARY"}</span><i /></div>
      <div className={`arch-m03-host-zone target ${targetReady ? "ready" : ""} ${moved ? "received" : ""}`}><span className="arch-m03-host-kicker">HOST 02 · REPLACEMENT TARGET</span><h4>{moved ? "new process" : targetReady ? "awaiting application" : "empty lab target"}</h4><div className="arch-m03-zone-stack">{moved && <span className="arch-m03-dependency-token app moved-app"><span className="arch-m03-dependency-glyph"><M03DependencyGlyph kind="app" /></span><b>Application</b><small>new process</small></span>}{!moved && <span className="arch-m03-empty-slot">{targetReady ? "APPLICATION WILL MOVE HERE" : "NO APPLICATION YET"}</span>}</div></div>
    </div>
    <div className="arch-m03-board-shelf"><div><span className="arch-m03-shelf-label">UNRESOLVED / NOT PROVEN LOCAL</span><div className="arch-m03-shelf-items">{notProvenLocal.map(id => <span key={id}>{renderResource(id, "external")}</span>)}{inspected.includes("E05") && <span className="arch-m03-dependency-token external"><span className="arch-m03-dependency-glyph"><M03DependencyGlyph kind="package" /></span><b>App package</b><small>code only</small></span>}{!notProvenLocal.length && !inspected.includes("E05") && <span className="arch-m03-shelf-empty">Inspect evidence to reveal resource placement.</span>}</div></div></div>
    <p className="arch-m03-board-hint">{moved ? "The application crossed the boundary; the resource objects did not. Reconcile each consequence with its evidence." : "Inspect the objects, classify their placement, then predict what changes when only the application moves."}</p>
  </section>;
}

function Feedback({ title, children, tone = "error" }: { title: string; children: ReactNode; tone?: "error" | "neutral" | "good" }) {
  return <div className={`arch-m03-feedback ${tone}`} role={tone === "error" ? "alert" : "status"}><b>{title}</b><span>{children}</span></div>;
}

export default function M03FindLocalAssumptionsGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M03EvidenceId[]>([]);
  const [map, setMap] = useState<Record<M03EvidenceId, M03Classification>>({ ...M03_INITIAL_MAP });
  const [selectedToken, setSelectedToken] = useState<M03EvidenceId | null>(null);
  const [classificationRepairs, setClassificationRepairs] = useState(0);
  const [classificationFeedback, setClassificationFeedback] = useState("");
  const [predictions, setPredictions] = useState<Partial<Record<M03PredictionId, M03PredictionChoice>>>({});
  const [predictionFeedback, setPredictionFeedback] = useState("");
  const [runReady, setRunReady] = useState(false);
  const [matches, setMatches] = useState<Partial<Record<M03ResultId, M03EvidenceId>>>({});
  const [resultFeedback, setResultFeedback] = useState("");
  const [explanationOrder, setExplanationOrder] = useState<M03ExplanationConceptId[]>(INITIAL_EXPLANATION_ORDER);
  const [explanationLinks, setExplanationLinks] = useState<Partial<Record<M03ExplanationLinkId, M03ExplanationConceptId>>>({});
  const [explanationFeedback, setExplanationFeedback] = useState("");

  const score = useMemo(() => scoreM03({ inspected, map, predictions, matches, explanationOrder, explanationLinks, classificationRepairs }), [inspected, map, predictions, matches, explanationOrder, explanationLinks, classificationRepairs]);
  const allEvidenceInspected = inspected.length === 5;
  const mapReady = canCommitM03Map(inspected, map);
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · SHOP HEALTHY" : phase === "investigate" ? `INVESTIGATE · ${inspected.length}/5 EVIDENCE` : phase === "classify" ? "CLASSIFY · COMMIT THE MAP" : phase === "predict" ? "PREDICT · BEFORE THE MOVE" : phase === "run" ? "RUN · HOST BOUNDARY" : phase === "result" ? "REVEAL · RECONCILE" : "EXPLAIN · BUILD THE MODEL";

  function inspectEvidence(id: M03EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    if (phase === "observe") setPhase("investigate");
  }

  function moveToken(id: M03EvidenceId, classification: M03Classification) {
    if (!canMutateM03Classification(inspected, id) || classification === "UNCLASSIFIED") return;
    setMap(current => ({ ...current, [id]: classification }));
    setSelectedToken(null);
    setClassificationFeedback("");
  }

  function commitMap() {
    if (!mapReady) {
      setClassificationFeedback("Inspect all five evidence cards, then place E01–E04 before committing the dependency map.");
      return;
    }
    setClassificationFeedback("");
    setPhase("predict");
  }

  function choosePrediction(id: M03PredictionId, choice: M03PredictionChoice) {
    setPredictions(current => ({ ...current, [id]: choice }));
    setPredictionFeedback("");
  }

  function commitPredictions() {
    if (!canCommitM03Predictions(predictions)) {
      setPredictionFeedback("Commit one prediction for each of the three dependencies before revealing the experiment.");
      return;
    }
    setPredictionFeedback("");
    setRunReady(true);
    setPhase("run");
  }

  function runExperiment() {
    if (!runReady) return;
    setPhase("result");
  }

  function reviseMap() {
    setClassificationRepairs(current => current + 1);
    setClassificationFeedback("Re-open the inspected evidence and revise only the placement judgments that conflict with the host-boundary result.");
    setPhase("classify");
  }

  function submitMatches() {
    if (!correctM03Map(map)) {
      setResultFeedback("One or more placement judgments conflicts with the experiment. Revise the dependency map before accepting the findings.");
      return;
    }
    if (!correctM03ResultMatches(matches)) {
      setResultFeedback("Match each result to the inspected evidence that explains its placement consequence. The result stays visible while you revise.");
      return;
    }
    setResultFeedback("");
    setPhase("explain");
  }

  function moveConcept(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= explanationOrder.length) return;
    setExplanationOrder(current => {
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    setExplanationFeedback("");
  }

  function submitExplanation() {
    if (!canCompleteM03({ inspected, map, predictions, matches, explanationOrder, explanationLinks })) {
      setExplanationFeedback(explanationOrderCorrect(explanationOrder) ? "Attach E01, E02, E03 and the X01 result to the matching causal claims, and keep the final map consistent." : "This explanation uses a placement consequence before establishing where that dependency lived. Reorder the claims and try again.");
      return;
    }
    setExplanationFeedback("");
    setPhase("complete");
  }

  function replay() {
    setPhase("observe"); setInspected([]); setMap({ ...M03_INITIAL_MAP }); setSelectedToken(null); setClassificationRepairs(0); setClassificationFeedback("");
    setPredictions({}); setPredictionFeedback(""); setRunReady(false); setMatches({}); setResultFeedback(""); setExplanationOrder(INITIAL_EXPLANATION_ORDER); setExplanationLinks({}); setExplanationFeedback("");
  }

  return <main className="arch-lab-shell arch-m03-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M03 — FIND THE THREE LOCAL ASSUMPTIONS</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab/m02">M02 <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "03"}</span><h1>Find the<br />hidden ties.</h1><p>Atlas Market works on one machine. Operations wants to rehearse a move to a replacement host. Investigate what the working shop silently assumes before the boundary changes.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Identify which dependencies are tied to HOST 01, then prove your map with a controlled host-boundary experiment.</b></div><div className="arch-brief-facts"><span><i>01</i> inspect neutral evidence</span><span><i>02</i> predict before reveal</span><span><i>03</i> explain the coupling</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>Source-backed placement assumptions are separated from the teaching-simulation hosts and experiment. This mission does not choose a redesign.</span></div></aside>
      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phase === "complete" ? "Three assumptions exposed." : phase === "observe" || phase === "investigate" ? "The shop works. Is it portable?" : phase === "classify" ? "Mark what is tied to HOST 01." : phase === "predict" ? "What survives the host move?" : phase === "run" ? "Change one boundary." : phase === "result" ? "Compare the placement evidence." : "Why did the boundary matter?"}</h2></div><span className="arch-date-chip">M03 · SOURCE 1.1</span></div>

        <M03DependencyBoard phase={phase} inspected={inspected} map={map} onInspect={inspectEvidence} />

        {(phase === "observe" || phase === "investigate") && <section className="arch-m03-observe-grid"><div className="arch-panel arch-m03-brief-panel"><span className="arch-overline">SHOP HEALTHY · REHEARSAL REQUESTED</span><h3>“The shop works on HOST 01. Prove whether the application can run on HOST 02 without silently depending on HOST 01.”</h3><p>Nothing is visibly broken yet. Inspect the dependency objects, then predict what changes when only application execution moves.</p><button className="arch-primary-button" onClick={() => setPhase("investigate")}>Inspect the evidence <span>→</span></button></div><div className="arch-panel arch-m03-case-panel"><div className="arch-panel-head"><div><span className="arch-overline">EVIDENCE CASE</span><h3>What are you trying to learn?</h3></div><b>{inspected.length}/5</b></div><p>Which dependencies silently rely on HOST 01? The board stays neutral until you inspect them.</p><div className="arch-m03-gate-note">INSPECT ALL FIVE BEFORE CLASSIFICATION</div></div></section>}

        {(phase === "investigate" || phase === "observe") && <section className="arch-panel arch-m03-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the evidence case.</h3></div><b className={allEvidenceInspected ? "gate-open" : ""}>{inspected.length}/5 INSPECTED</b></div><p className="arch-panel-copy">Read the observation, interpretation and provenance on every card. The dependency board stays locked until all five are inspected, so no unseen card can be solved by guessing.</p><div className="arch-m03-evidence-grid">{M03_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{!allEvidenceInspected && <div className="arch-m03-lock-note" role="status">Evidence gate locked · inspect {5 - inspected.length} more card{5 - inspected.length === 1 ? "" : "s"}.</div>}{allEvidenceInspected && <button className="arch-primary-button" onClick={() => setPhase("classify")}>Open dependency board <span>→</span></button>}</section>}

        {phase === "classify" && <section className="arch-panel arch-m03-classify-panel"><div className="arch-panel-head"><div><span className="arch-overline">02 · CLASSIFY</span><h3>Which dependencies are bound to HOST 01?</h3></div><b>{Object.values(map).filter(value => value !== "UNCLASSIFIED").length}/4 MARKED</b></div><p className="arch-panel-copy">Select a neutral token, then choose a zone. E05 is context evidence; classify E01–E04 only. Wrong hypotheses are allowed, but the answer is not revealed until the experiment.</p><div className="arch-m03-board"><div className="arch-m03-token-list" aria-label="Evidence tokens">{M03_EVIDENCE.filter(item => item.id !== "E05").map(item => <button className={`arch-m03-token ${selectedToken === item.id ? "selected" : ""} ${map[item.id] !== "UNCLASSIFIED" ? "placed" : ""}`} key={item.id} onClick={() => setSelectedToken(item.id)} aria-pressed={selectedToken === item.id}><span>{item.id}</span><b>{item.label}</b><small>{CLASSIFICATION_LABELS[map[item.id]]}</small></button>)}</div><div className="arch-m03-zones"><button className={`arch-m03-zone bound ${selectedToken ? "ready" : ""}`} onClick={() => selectedToken && moveToken(selectedToken, "BOUND_TO_HOST_01")}><span>BOUND TO HOST 01</span><b>Assumes this current machine or its process placement</b><small>{M03_EVIDENCE.filter(item => item.id !== "E05" && map[item.id] === "BOUND_TO_HOST_01").map(item => item.id).join(" · ") || "No cards placed"}</small></button><button className={`arch-m03-zone external ${selectedToken ? "ready" : ""}`} onClick={() => selectedToken && moveToken(selectedToken, "NOT_PROVEN_LOCAL")}><span>NOT PROVEN LOCAL</span><b>Evidence does not place app state/resource on HOST 01</b><small>{M03_EVIDENCE.filter(item => item.id !== "E05" && map[item.id] === "NOT_PROVEN_LOCAL").map(item => item.id).join(" · ") || "No cards placed"}</small></button></div></div>{classificationFeedback && <Feedback title="Map not ready" >{classificationFeedback}</Feedback>}<button className="arch-primary-button" onClick={commitMap} disabled={!mapReady}>Commit dependency map <span>→</span></button></section>}

        {phase === "predict" && <section className="arch-panel arch-m03-predict-panel"><div className="arch-panel-head"><div><span className="arch-overline">03 · PREDICT</span><h3>Predict before the boundary moves.</h3></div><b>RESULT HIDDEN</b></div><p className="arch-panel-copy">Only application execution will move to HOST 02. Predict what that boundary change does to each dependency before revealing the experiment.</p><div className="arch-m03-prediction-list">{M03_PREDICTIONS.map(prediction => <fieldset key={prediction.id}><legend><b>{prediction.id} · {prediction.title}</b><span>{prediction.prompt}</span></legend>{prediction.options.map(option => <label key={option.id} className={predictions[prediction.id] === option.id ? "selected" : ""}><input type="radio" name={prediction.id} checked={predictions[prediction.id] === option.id} onChange={() => choosePrediction(prediction.id, option.id)} />{option.label}</label>)}</fieldset>)}</div>{predictionFeedback && <Feedback title="Prediction not committed">{predictionFeedback}</Feedback>}<button className="arch-primary-button" onClick={commitPredictions}>Commit predictions <span>→</span></button></section>}

        {phase === "run" && <section className="arch-panel arch-m03-run-panel"><span className="arch-overline">04 · RUN · TEACHING SIMULATION</span><h3>Move application execution only.</h3><p className="arch-m03-lede">This is a deterministic placement experiment, not a production migration procedure. The board will reveal which objects follow the process after you run it.</p><div className="arch-m03-intervention"><span>CONTROLLED CHANGE</span><b>APP: HOST 01 → HOST 02</b><small>Resource placement remains hidden until the experiment runs.</small></div><button className="arch-primary-button" onClick={runExperiment}>Run host-boundary experiment <span>→</span></button></section>}

        {phase === "result" && <section className="arch-panel arch-m03-result-panel"><div className="arch-panel-head"><div><span className="arch-overline">05 · REVEAL</span><h3>Reconcile the placement consequences.</h3></div><b>QUALITATIVE RESULT</b></div><p className="arch-panel-copy">Match each result to the evidence that explains it. No invented latency, outage or capacity metrics are used in this experiment.</p><div className="arch-m03-result-list">{M03_RESULTS.map(result => <div className="arch-m03-result-row" key={result.id}><div><span>{result.title}</span><b>{result.result}</b><small>{result.reason}</small></div><div className="arch-m03-match-buttons" aria-label={`Evidence for ${result.title}`}>{M03_EVIDENCE.filter(item => item.id !== "E05").map(item => <button key={item.id} className={matches[result.id] === item.id ? "selected" : ""} onClick={() => { setMatches(current => ({ ...current, [result.id]: item.id })); setResultFeedback(""); }} aria-pressed={matches[result.id] === item.id}>{item.id}</button>)}</div></div>)}</div>{resultFeedback && <Feedback title="Reconciliation needs another look">{resultFeedback}</Feedback>}<div className="arch-m03-result-actions"><button className="arch-secondary-button" onClick={reviseMap}>Revise dependency map</button><button className="arch-primary-button" onClick={submitMatches}>Accept findings <span>→</span></button></div></section>}

        {phase === "explain" && <section className="arch-panel arch-m03-explain-panel"><div className="arch-panel-head"><div><span className="arch-overline">06 · EXPLAIN</span><h3>Build the causal dependency model.</h3></div><b>{explanationOrder.length}/6 CLAIMS</b></div><p className="arch-panel-copy">Put the six claims in causal order, then attach the evidence that supports the four placement claims. The closing explanation must agree with your final map.</p><div className="arch-m03-concept-list">{explanationOrder.map((id, index) => { const concept = M03_EXPLANATION_CONCEPTS.find(item => item.id === id)!; return <div className="arch-m03-concept-row" key={id}><span>{index + 1}</span><b>{concept.label}</b><button onClick={() => moveConcept(index, -1)} disabled={index === 0} aria-label={`Move claim ${index + 1} up`}>↑</button><button onClick={() => moveConcept(index, 1)} disabled={index === explanationOrder.length - 1} aria-label={`Move claim ${index + 1} down`}>↓</button></div>; })}</div><div className="arch-m03-link-builder"><span className="arch-overline">ATTACH SUPPORTING EVIDENCE</span>{M03_EXPLANATION_LINKS.map(link => <label key={link.id}>{link.id === "X01" ? "X01 host-boundary result" : `${link.id} inspected evidence`}<select aria-label={`Evidence link for ${link.id}`} value={explanationLinks[link.id] ?? ""} onChange={event => { setExplanationLinks(current => ({ ...current, [link.id]: event.target.value as M03ExplanationConceptId })); setExplanationFeedback(""); }}><option value="">Choose matching claim</option>{M03_EXPLANATION_CONCEPTS.map(concept => <option key={concept.id} value={concept.id}>{concept.id}</option>)}</select></label>)}</div>{explanationFeedback && <Feedback title="Explanation not complete">{explanationFeedback}</Feedback>}<button className="arch-primary-button" onClick={submitExplanation}>Submit explanation <span>→</span></button></section>}

        {phase === "complete" && <section className="arch-panel arch-m03-complete-panel"><span className="arch-overline">M03 · COMPLETE</span><h3>Three local assumptions identified.</h3><p>The shop was not “wrong” on HOST 01. It worked because application execution and its dependencies shared a placement. Moving only the application exposed that coupling.</p><div className="arch-m03-final-reveal"><span>SOURCE-BACKED FINDINGS</span><b>DB endpoint · local image files · Tomcat Session memory</b><small>HOST 01 was a rational working start. M03 stops after identifying what is coupled; it does not prescribe how to redesign it.</small></div><div className="arch-score-grid arch-m03-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong><span>evidence gate</span></div><div className="arch-metric"><small>CLASSIFICATION</small><strong>{score.classification}/30</strong><span>placement map</span></div><div className="arch-metric"><small>PREDICTION</small><strong>{score.prediction}/15</strong><span>before reveal</span></div><div className="arch-metric"><small>EXPERIMENT</small><strong>{score.experiment}/15</strong><span>result matches</span></div><div className="arch-metric"><small>CAUSAL MODEL</small><strong>{score.causal}/20</strong><span>order + links</span></div><div className="arch-metric"><small>EFFICIENCY</small><strong>{score.efficiency}/5</strong><span>recovery path</span></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Simulation-only assessment</small></div><div className="arch-complete-actions"><button className="arch-primary-button" onClick={replay}>Replay M03 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab/m02">Return to M02 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: 1.1.md · HOSTS AND RESULTS ARE TEACHING SIMULATION</span></footer>
  </main>;
}
