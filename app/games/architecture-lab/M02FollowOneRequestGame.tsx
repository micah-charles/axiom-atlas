"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  M02_EVIDENCE,
  M02_EXPERIMENTS,
  M02_EXPLANATION_OPTIONS,
  M02_FINAL_EVIDENCE,
  M02_STAGE_ORDER,
  M02_TIMINGS,
  canUnlockM02Evidence,
  canCommitM02Diagnosis,
  canSubmitM02FinalDiagnosis,
  explanationIsComplete,
  explanationMatchesM02Diagnosis,
  experimentResult,
  predictionIsCorrect,
  scoreM02,
  timingTotal,
  m02RouteFeedback,
  validateM02Route,
  type M02EvidenceId,
  type M02ExperimentId,
  type M02FinalEvidenceId,
  type M02StageId,
} from "./m02-engine";

type Phase = "observe" | "investigate" | "route" | "baseline" | "diagnose" | "predict" | "run" | "result" | "final" | "explain" | "complete";

const STAGE_LABELS: Record<M02StageId, string> = {
  DNS_RESOLUTION: "DNS resolution",
  HTTP_CONNECTION: "HTTP connection",
  TOMCAT_PROCESSING: "Tomcat processing",
  JDBC_MYSQL_QUERY: "JDBC / MySQL query",
  RESPONSE: "Response",
};

const STAGE_SHORT: Record<M02StageId, string> = {
  DNS_RESOLUTION: "DNS",
  HTTP_CONNECTION: "HTTP",
  TOMCAT_PROCESSING: "Tomcat",
  JDBC_MYSQL_QUERY: "JDBC",
  RESPONSE: "Response",
};

const PROFILE_LABELS = {
  healthy: "HEALTHY REFERENCE",
  incident_baseline: "INCIDENT BASELINE",
  dns_delay_control: "DNS CONTROL",
  server_delay_control: "SERVER CONTROL",
} as const;

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function M02ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Diagnose", "Predict", "Reveal", "Explain"];
  const phaseIndex = phase === "observe" ? 0 : phase === "investigate" || phase === "route" || phase === "baseline" ? 1 : phase === "diagnose" ? 2 : phase === "predict" || phase === "run" ? 3 : phase === "result" || phase === "final" ? 4 : 5;
  return <div className="arch-lab-progress" aria-label="M02 mission progress">{items.map((item, index) => <span className={index <= phaseIndex ? "active" : ""} key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}</div>;
}

function EvidenceCard({ item, inspected, onInspect }: { item: typeof M02_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button className={`arch-m02-evidence ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-m02-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong>
    <span>{item.observation}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.source}</small></>}
  </button>;
}

function TimingTable({ profile, compareProfile, reveal = true }: { profile: keyof typeof M02_TIMINGS; compareProfile?: keyof typeof M02_TIMINGS; reveal?: boolean }) {
  return <div className="arch-m02-timing-wrap" aria-label={`${PROFILE_LABELS[profile]} timing evidence`}>
    <div className="arch-m02-timing-head"><span>{PROFILE_LABELS[profile]}</span><small>LAB TIMING · SIMULATION · ms</small></div>
    <div className="arch-m02-timing-table" role="table">
      <div className="arch-m02-timing-row header" role="row"><span role="columnheader">STAGE</span><span role="columnheader">{compareProfile ? PROFILE_LABELS[compareProfile] : "MEASURED"}</span>{compareProfile && <span role="columnheader">COMPARE</span>}</div>
      {M02_STAGE_ORDER.map(stage => <div className="arch-m02-timing-row" role="row" key={stage}><span role="cell">{STAGE_LABELS[stage]}</span><b role="cell">{reveal ? M02_TIMINGS[profile][stage] : "—"} <small>ms</small></b>{compareProfile && <b role="cell" className={M02_TIMINGS[profile][stage] === M02_TIMINGS[compareProfile][stage] ? "unchanged" : "changed"}>{M02_TIMINGS[compareProfile][stage]} <small>ms</small></b>}</div>)}
      <div className="arch-m02-timing-total"><span>TOTAL</span><b>{reveal ? timingTotal(profile) : "—"} ms</b>{compareProfile && <b className={timingTotal(profile) === timingTotal(compareProfile) ? "unchanged" : "changed"}>{timingTotal(compareProfile)} ms</b>}</div>
    </div>
  </div>;
}

function StageCard({ stage, onClick, disabled }: { stage: M02StageId; onClick: () => void; disabled: boolean }) {
  return <button className="arch-m02-stage-card" onClick={onClick} disabled={disabled} aria-label={`Add ${STAGE_LABELS[stage]} to route`}><span>{STAGE_SHORT[stage]}</span><b>{STAGE_LABELS[stage]}</b><small>{disabled ? "PLACED" : "ADD TO ROUTE"}</small></button>;
}

export default function M02FollowOneRequestGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M02EvidenceId[]>([]);
  const [route, setRoute] = useState<M02StageId[]>([]);
  const [routeRepairs, setRouteRepairs] = useState(0);
  const [routeError, setRouteError] = useState("");
  const [traceIndex, setTraceIndex] = useState(-1);
  const [diagnosisChoice, setDiagnosisChoice] = useState<M02StageId | "TOTAL_BLAMES_SERVER" | null>(null);
  const [firstDiagnosis, setFirstDiagnosis] = useState<M02StageId | "TOTAL_BLAMES_SERVER" | null>(null);
  const [diagnosisFeedback, setDiagnosisFeedback] = useState("");
  const [experimentChoice, setExperimentChoice] = useState<M02ExperimentId | null>(null);
  const [predictionChoice, setPredictionChoice] = useState("");
  const [predictionMistakes, setPredictionMistakes] = useState(0);
  const [predictionFeedback, setPredictionFeedback] = useState("");
  const [committedExperiment, setCommittedExperiment] = useState<M02ExperimentId | null>(null);
  const [experimentsRun, setExperimentsRun] = useState<M02ExperimentId[]>([]);
  const [finalDiagnosis, setFinalDiagnosis] = useState<M02StageId | "TOTAL_BLAMES_SERVER" | null>(null);
  const [finalEvidence, setFinalEvidence] = useState<M02FinalEvidenceId[]>([]);
  const [finalFeedback, setFinalFeedback] = useState("");
  const [explanation, setExplanation] = useState<string[]>([]);
  const [reflection, setReflection] = useState("");

  const evidenceGateOpen = canUnlockM02Evidence(inspected);
  const score = useMemo(() => scoreM02({ inspected, routeRepairs, firstDiagnosis, finalDiagnosis, predictionMistakes, experimentsRun: experimentsRun.length, explanation }), [inspected, routeRepairs, firstDiagnosis, finalDiagnosis, predictionMistakes, experimentsRun.length, explanation]);
  const currentExperiment = committedExperiment ? experimentResult(committedExperiment) : null;
  const nextExperiment = (Object.keys(M02_EXPERIMENTS) as M02ExperimentId[]).find(id => !experimentsRun.includes(id));

  function inspectEvidence(id: M02EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    if (phase === "observe") setPhase("investigate");
  }

  function addStage(stage: M02StageId) {
    if (!route.includes(stage)) setRoute(current => [...current, stage]);
    setRouteError("");
  }

  function removeStage(index: number) {
    setRoute(current => current.filter((_, itemIndex) => itemIndex !== index));
    setRouteError("");
  }

  function submitRoute() {
    if (!validateM02Route(route)) {
      setRouteRepairs(current => current + 1);
      setRouteError(m02RouteFeedback(route).message + " No result has been revealed.");
      return;
    }
    setRouteError("");
    setTraceIndex(-1);
    setPhase("baseline");
  }

  function advanceBaseline() {
    if (traceIndex < M02_STAGE_ORDER.length - 1) setTraceIndex(current => current + 1);
    else setPhase("diagnose");
  }

  function commitDiagnosis() {
    if (!diagnosisChoice) return;
    if (!canCommitM02Diagnosis(inspected, traceIndex >= M02_STAGE_ORDER.length - 1, diagnosisChoice)) {
      setDiagnosisFeedback("Before committing a cause, inspect the measured baseline probe (E04). The route is ready, but the segment evidence is not yet complete.");
      return;
    }
    setDiagnosisFeedback("");
    if (!firstDiagnosis) setFirstDiagnosis(diagnosisChoice);
    if (!experimentChoice) setExperimentChoice("X01_DNS_DELAY_CONTROL");
    setPhase("predict");
  }

  function commitPrediction() {
    if (!experimentChoice || !predictionChoice) return;
    if (!predictionIsCorrect(experimentChoice, predictionChoice)) {
      setPredictionMistakes(current => current + 1);
      setPredictionFeedback("Prediction recorded as a hypothesis, but the experiment is still locked. Re-read which segment the control changes.");
      return;
    }
    setPredictionFeedback("");
    setCommittedExperiment(experimentChoice);
    setPhase("run");
  }

  function runExperiment() {
    if (!committedExperiment || experimentsRun.includes(committedExperiment)) return;
    setExperimentsRun(current => [...current, committedExperiment]);
    setPhase("result");
  }

  function chooseAnotherExperiment() {
    if (!nextExperiment) return;
    setExperimentChoice(nextExperiment);
    setPredictionChoice("");
    setPredictionFeedback("");
    setCommittedExperiment(null);
    setPhase("predict");
  }

  function submitFinalDiagnosis() {
    if (!canSubmitM02FinalDiagnosis(finalDiagnosis, finalEvidence, experimentsRun.length)) {
      setFinalFeedback(finalDiagnosis !== "DNS_RESOLUTION"
        ? "That layer can make a site slow, but the incident evidence points to DNS. Compare the baseline with a controlled run before finalising the diagnosis."
        : "Select both the baseline measurement and the controlled comparison before building the explanation.");
      return;
    }
    setFinalFeedback("");
    setPhase("explain");
  }

  function submitExplanation() {
    if (!explanationIsComplete(explanation) || !explanationMatchesM02Diagnosis(finalDiagnosis, explanation)) return;
    setPhase("complete");
  }

  function toggleExplanation(id: string) {
    setExplanation(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function replay() {
    setPhase("observe");
    setInspected([]); setRoute([]); setRouteRepairs(0); setRouteError(""); setTraceIndex(-1);
    setDiagnosisChoice(null); setFirstDiagnosis(null); setDiagnosisFeedback(""); setExperimentChoice(null); setPredictionChoice(""); setPredictionMistakes(0); setPredictionFeedback("");
    setCommittedExperiment(null); setExperimentsRun([]); setFinalDiagnosis(null); setFinalEvidence([]); setFinalFeedback(""); setExplanation([]); setReflection("");
  }

  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · CUSTOMER REPORT" : phase === "investigate" ? `INVESTIGATE · ${inspected.length}/5 EVIDENCE` : phase === "route" ? "INVESTIGATE · ORDER THE JOURNEY" : phase === "baseline" ? "RUN · MEASURE BASELINE" : phase === "diagnose" ? "EXPLAIN · COMMIT DIAGNOSIS" : phase === "predict" ? "PREDICT · CHOOSE A CONTROL" : phase === "run" ? "RUN · CONTROLLED EXPERIMENT" : phase === "result" || phase === "final" ? "REVEAL · COMPARE EVIDENCE" : "EXPLAIN · BUILD THE CAUSAL CHAIN";

  return <main className="arch-lab-shell arch-m02-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M02 — FOLLOW ONE REQUEST</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab">M01 <span>↗</span></Link></header>
    <M02ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "02"}</span><h1>Follow<br />one request.</h1><p>A customer says the shop feels slow. Follow one request, measure where its time is spent, and diagnose the layer before anyone redesigns the architecture.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Find the responsible request segment, then prove your diagnosis with a controlled experiment.</b></div><div className="arch-brief-facts"><span><i>01</i> observe the slow symptom</span><span><i>02</i> compare segment timing</span><span><i>03</i> predict before reveal</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>Request stages trace to source section 1.1. Latencies and controlled results are labelled teaching simulation.</span></div></aside>

      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phase === "complete" ? "You found the delay." : phase === "observe" || phase === "investigate" ? "The page feels slow. Why?" : phase === "route" ? "Put the request in order." : phase === "baseline" ? "Measure before you guess." : phase === "diagnose" ? "Commit to a suspect." : phase === "predict" ? "What should this control change?" : phase === "run" ? "Run the experiment." : phase === "result" || phase === "final" ? "Let the evidence speak." : "Explain the causal chain."}</h2></div><span className="arch-date-chip">M02 · SOURCE 1.1</span></div>

        {(phase === "observe" || phase === "investigate") && <section className="arch-m02-observe-grid"><div className="arch-panel arch-m02-incident"><span className="arch-overline">OBSERVATION · CUSTOMER REPORT</span><h3>“The product page eventually loads, but today it feels slow.”</h3><div className="arch-m02-incident-total"><span>REQUEST TOTAL</span><b>650 ms</b><small>LAB TIMING · CAUSE UNKNOWN</small></div><p>Do not blame the server from the total alone. Inspect the evidence, then follow the request journey.</p><button className="arch-primary-button" onClick={() => setPhase("investigate")}>Inspect request evidence <span>→</span></button></div><div className="arch-panel arch-m02-boundary"><div className="arch-panel-head"><div><span className="arch-overline">PROVENANCE</span><h3>What kind of fact is this?</h3></div><b>VISIBLE</b></div><div className="arch-m02-legend"><span><i className="source" />source-backed causal stage</span><span><i className="fiction" />fictional Atlas Market incident</span><span><i className="simulation" />teaching-simulation timing</span></div><p>No answer is selected at the start. Your evidence and experiments determine the diagnosis.</p></div></section>}

        {(phase === "investigate" || phase === "observe") && <section className="arch-panel arch-m02-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the clues.</h3></div><b className={evidenceGateOpen ? "gate-open" : ""}>{inspected.length}/5 INSPECTED</b></div><p className="arch-panel-copy">You need the customer symptom, the request journey, and one more useful clue before the route can be proposed. Inspection is exploratory; the answer stays hidden.</p><div className="arch-m02-evidence-grid">{M02_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{evidenceGateOpen && <button className="arch-primary-button" onClick={() => setPhase("route")}>Build the request route <span>→</span></button>}</section>}

        {phase === "route" && <section className="arch-panel arch-m02-route-panel"><div className="arch-panel-head"><div><span className="arch-overline">02 · INVESTIGATE</span><h3>Order one request.</h3></div><b>{route.length}/5 PLACED</b></div><p className="arch-panel-copy">Choose stages in the order this source-derived request journey occurs. Click or tap cards; drag is not required.</p><div className="arch-m02-route-slots" aria-label="Ordered request route">{Array.from({ length: 5 }, (_, index) => <div className={`arch-m02-route-slot ${route[index] ? "filled" : ""}`} key={index}><span>{index + 1}</span>{route[index] ? <><b>{STAGE_LABELS[route[index]]}</b><button onClick={() => removeStage(index)} aria-label={`Remove ${STAGE_LABELS[route[index]]} from slot ${index + 1}`}>×</button></> : <small>Choose a stage</small>}</div>)}</div><div className="arch-m02-stage-tray" aria-label="Unordered request stages">{M02_STAGE_ORDER.map(stage => <StageCard key={stage} stage={stage} onClick={() => addStage(stage)} disabled={route.includes(stage)} />)}</div>{routeError && <div className="arch-m02-feedback error" role="alert"><b>Try that route again.</b><span>{routeError}</span></div>}<button className="arch-primary-button" onClick={submitRoute} disabled={route.length !== 5}>Measure baseline request <span>→</span></button></section>}

        {phase === "baseline" && <section className="arch-panel arch-m02-baseline-panel"><div className="arch-panel-head"><div><span className="arch-overline">03 · RUN</span><h3>Measure the baseline.</h3></div><b>STEP {Math.max(traceIndex + 1, 0)}/5</b></div><p className="arch-panel-copy">Advance one stage at a time. The measurements are fixed lab values, not historical or production telemetry.</p><div className="arch-m02-trace-strip">{M02_STAGE_ORDER.map((stage, index) => <div className={`arch-m02-trace-node ${index < traceIndex ? "done" : ""} ${index === traceIndex ? "active" : ""}`} key={stage}><span>{index < traceIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><b>{STAGE_SHORT[stage]}</b><small>{index <= traceIndex ? `${M02_TIMINGS.incident_baseline[stage]} ms` : "hidden"}</small></div>)}</div><TimingTable profile="incident_baseline" reveal={traceIndex >= M02_STAGE_ORDER.length - 1} /><button className="arch-primary-button" onClick={advanceBaseline}>{traceIndex < M02_STAGE_ORDER.length - 1 ? "Measure next stage" : "Commit a diagnosis →"}</button></section>}

        {phase === "diagnose" && <section className="arch-panel arch-m02-decision-panel"><div className="arch-panel-head"><div><span className="arch-overline">04 · EXPLAIN</span><h3>Which segment is the strongest suspect?</h3></div><b>CAUSE UNKNOWN</b></div><p className="arch-panel-copy">Commit before any controlled result is shown. A wrong hypothesis is recoverable, but diagnosis quality matters.</p><TimingTable profile="incident_baseline" />{!inspected.includes("E04") && <div className="arch-m02-diagnosis-evidence"><span className="arch-overline">DIAGNOSIS EVIDENCE GATE</span><p>Inspect the measured baseline probe before committing a cause.</p><EvidenceCard item={M02_EVIDENCE[3]} inspected={false} onInspect={() => inspectEvidence("E04")} /></div>}<div className="arch-m02-choice-grid">{[...M02_STAGE_ORDER, "TOTAL_BLAMES_SERVER" as const].map(choice => <button className={diagnosisChoice === choice ? "selected" : ""} key={choice} onClick={() => { setDiagnosisChoice(choice); setDiagnosisFeedback(""); }}>{choice === "TOTAL_BLAMES_SERVER" ? "Total alone proves the server is at fault" : STAGE_LABELS[choice]}</button>)}</div>{diagnosisFeedback && <div className="arch-m02-feedback error" role="alert"><b>Diagnosis is still locked.</b><span>{diagnosisFeedback}</span></div>}{firstDiagnosis && <div className="arch-m02-feedback neutral" role="status"><b>Diagnosis recorded.</b><span>Now design a comparison that could support or challenge it.</span></div>}<button className="arch-primary-button" onClick={commitDiagnosis} disabled={!diagnosisChoice}>Commit diagnosis <span>→</span></button></section>}

        {phase === "predict" && experimentChoice && <section className="arch-panel arch-m02-predict-panel"><div className="arch-panel-head"><div><span className="arch-overline">05 · PREDICT</span><h3>Choose a controlled experiment.</h3></div><b>RESULT HIDDEN</b></div><p className="arch-panel-copy">Pick a control, then predict which segment changes. The measured result remains locked until your prediction is committed.</p><div className="arch-m02-experiment-tabs">{(Object.keys(M02_EXPERIMENTS) as M02ExperimentId[]).map(id => <button className={experimentChoice === id ? "selected" : ""} key={id} onClick={() => { setExperimentChoice(id); setPredictionChoice(""); setPredictionFeedback(""); }}>{M02_EXPERIMENTS[id].label}</button>)}</div><div className="arch-m02-prediction-list">{M02_EXPERIMENTS[experimentChoice].predictionOptions.map(option => <button className={predictionChoice === option.id ? "selected" : ""} key={option.id} onClick={() => setPredictionChoice(option.id)}>{option.label}</button>)}</div>{predictionFeedback && <div className="arch-m02-feedback error" role="alert"><b>Keep the result hidden.</b><span>{predictionFeedback}</span></div>}<button className="arch-primary-button" onClick={commitPrediction} disabled={!predictionChoice}>Commit prediction <span>→</span></button></section>}

        {phase === "run" && committedExperiment && <section className="arch-panel arch-m02-run-panel"><span className="arch-overline">06 · RUN</span><h3>Run {M02_EXPERIMENTS[committedExperiment].label.toLowerCase()}.</h3><p>Prediction committed. Now run the fixed teaching-simulation control and reveal the comparison.</p><div className="arch-m02-control-card"><b>{M02_EXPERIMENTS[committedExperiment].label}</b><span>Only the named layer changes; the other stage values remain fixed.</span><small>SIMULATION CONTROL · DETERMINISTIC</small></div><button className="arch-primary-button" onClick={runExperiment}>Run controlled experiment <span>→</span></button></section>}

        {phase === "result" && currentExperiment && <section className="arch-panel arch-m02-result-panel"><div className="arch-panel-head"><div><span className="arch-overline">07 · REVEAL</span><h3>Compare the evidence.</h3></div><b>{experimentsRun.length}/2 CONTROLS RUN</b></div><p className="arch-panel-copy">The same visible slowness can come from different layers. Look at the segment profile, not only the total.</p><TimingTable profile={currentExperiment.profile} compareProfile={currentExperiment.comparison} /><div className="arch-m02-result-callout"><b>{committedExperiment === "X01_DNS_DELAY_CONTROL" ? "DNS changed before the server." : "Tomcat changed while DNS stayed healthy."}</b><span>{committedExperiment === "X01_DNS_DELAY_CONTROL" ? "Tomcat and JDBC remain fixed even though total latency rises." : "A server delay can reproduce the same 650 ms total while DNS remains healthy."}</span></div><div className="arch-m02-result-actions">{nextExperiment && <button className="arch-secondary-button" onClick={chooseAnotherExperiment}>Run the other control</button>}<button className="arch-primary-button" onClick={() => setPhase("final")}>Identify the incident segment <span>→</span></button></div></section>}

        {phase === "final" && <section className="arch-panel arch-m02-final-panel"><div className="arch-panel-head"><div><span className="arch-overline">08 · REVEAL</span><h3>Revisit the actual incident.</h3></div><b>EVIDENCE REQUIRED</b></div><p className="arch-panel-copy">Which segment explains the extra delay in the incident baseline? Select the segment and the evidence you used.</p><div className="arch-m02-choice-grid">{M02_STAGE_ORDER.map(choice => <button className={finalDiagnosis === choice ? "selected" : ""} key={choice} onClick={() => { setFinalDiagnosis(choice); setFinalFeedback(""); }}>{STAGE_LABELS[choice]}</button>)}</div><div className="arch-m02-evidence-picks"><span>USE THE MEASURED EVIDENCE</span>{M02_FINAL_EVIDENCE.map(item => <button className={finalEvidence.includes(item.id) ? "selected" : ""} key={item.id} onClick={() => { setFinalFeedback(""); setFinalEvidence(current => current.includes(item.id) ? current.filter(entry => entry !== item.id) : [...current, item.id]); }} aria-pressed={finalEvidence.includes(item.id)}>{item.label}</button>)}</div>{finalFeedback && <div className="arch-m02-feedback error" role="alert"><b>Final diagnosis needs stronger evidence.</b><span>{finalFeedback}</span></div>}{finalDiagnosis === "DNS_RESOLUTION" && finalEvidence.length >= 2 && <div className="arch-m02-feedback neutral" role="status"><b>Evidence assembled.</b><span>Now explain why a slow total is not enough to name the responsible layer.</span></div>}<button className="arch-primary-button" onClick={submitFinalDiagnosis} disabled={!finalDiagnosis || finalEvidence.length < 2}>Build causal explanation <span>→</span></button></section>}

        {phase === "explain" && <section className="arch-panel arch-m02-explain-panel"><div className="arch-panel-head"><div><span className="arch-overline">09 · EXPLAIN</span><h3>Build the causal chain.</h3></div><b>{explanation.length}/6 LINKS</b></div><p className="arch-panel-copy">Select the claims that connect the symptom, timing evidence, experiment, diagnosis and design lesson. No exact sentence is required.</p><div className="arch-m02-explanation-list">{M02_EXPLANATION_OPTIONS.map(option => <button className={explanation.includes(option.id) ? "selected" : ""} key={option.id} onClick={() => toggleExplanation(option.id)} aria-pressed={explanation.includes(option.id)}><span>{explanation.includes(option.id) ? "✓" : "○"}</span><b>{option.label}</b></button>)}</div><button className="arch-primary-button" onClick={submitExplanation} disabled={!explanationIsComplete(explanation) || !explanationMatchesM02Diagnosis(finalDiagnosis, explanation)}>Submit explanation <span>→</span></button></section>}

        {phase === "complete" && <section className="arch-panel arch-m02-complete-panel"><span className="arch-overline">M02 · COMPLETE</span><h3>You found the delay before redesigning the system.</h3><p>The incident has a 650 ms total, but total time did not identify the culprit by itself. The baseline and controlled evidence showed that DNS consumed 420 ms before the request reached Tomcat.</p><div className="arch-m02-architecture-reveal"><span>DIAGNOSIS</span><b>DNS resolution is the incident slow segment.</b><small>Tomcat and JDBC were not made slow by the DNS-delay control. The correct next move was measurement, not premature architecture change.</small></div><div className="arch-score-grid arch-m02-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong><span>evidence use</span></div><div className="arch-metric"><small>ORDERING</small><strong>{score.ordering}/20</strong><span>request journey</span></div><div className="arch-metric"><small>DIAGNOSIS</small><strong>{score.diagnosis}/20</strong><span>slow segment</span></div><div className="arch-metric"><small>PREDICTION</small><strong>{score.prediction}/15</strong><span>before reveal</span></div><div className="arch-metric"><small>COMPARISON</small><strong>{score.comparison}/15</strong><span>controlled evidence</span></div><div className="arch-metric"><small>EXPLANATION</small><strong>{score.explanation}/15</strong><span>causal chain</span></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Simulation-only assessment</small></div><label className="arch-m02-reflection"><span>REFLECT · OPTIONAL</span><textarea value={reflection} onChange={event => setReflection(event.target.value)} placeholder="Which evidence changed your mind?" /></label><div className="arch-complete-actions"><button className="arch-primary-button" onClick={replay}>Replay M02 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab">Return to M01 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: 1.1.md · LAB TIMINGS ARE TEACHING SIMULATION</span></footer>
  </main>;
}
