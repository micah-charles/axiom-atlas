"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  M01_EVIDENCE,
  M01_FAILURE_PREDICTIONS,
  M01_TRACE,
  TARGET_NODES,
  approachResult,
  canUnlockApproaches,
  failurePredictionIsCorrect,
  scoreExplanation,
  type ApproachId,
  type EvidenceId,
  type FailurePredictionId,
} from "./engine";

type Phase = "briefing" | "assembly" | "simulate" | "predictFailure" | "failure" | "explain" | "complete";

const phases = ["Situation", "Evidence", "Build", "Test", "Explain"];

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function ProgressRail({ phase }: { phase: Phase }) {
  const current = phase === "briefing" ? 0 : phase === "assembly" ? 2 : phase === "simulate" || phase === "predictFailure" || phase === "failure" ? 3 : 4;
  return <div className="arch-lab-progress" aria-label="Mission progress">{phases.map((item, index) => <span className={index <= current ? "active" : ""} key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</span>)}</div>;
}

function EvidenceCard({ id, label, observation, interpretation, source, inspected, onInspect }: typeof M01_EVIDENCE[number] & { inspected: boolean; onInspect: () => void }) {
  return <button className={`arch-evidence-card ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-evidence-top"><b>{id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{label}</strong>
    <span className="arch-evidence-observation">{inspected ? observation : "Open the case file to reveal its observation."}</span>
    {inspected && <><em>{interpretation}</em><small className="arch-source-label">{source}</small></>}
  </button>;
}

function Topology({ down = false, empty = false, activeTarget }: { down?: boolean; empty?: boolean; activeTarget?: string }) {
  if (empty) return <div className="arch-empty-topology" aria-label="Empty architecture canvas"><span>＋</span><b>No serving topology yet.</b><small>Inspect evidence, then choose a candidate to test.</small></div>;
  return <div className={`arch-topology ${down ? "down" : ""}`} aria-label={down ? "Single host failed; all local services are unavailable" : "Single host topology with Tomcat, MySQL, local images and Session"}>
    <div className={`arch-browser-node ${activeTarget === "Browser" ? "active" : ""}`}><span>◎</span><b>Customer browser</b><small>external</small></div>
    <div className="arch-request-line"><i /> <span>HTTP</span> <i /></div>
    <div className="arch-host-node"><div className="arch-host-head"><span>HOST 01</span><b>Linux host</b><small>{down ? "DOWN" : "AVAILABLE"}</small></div><div className="arch-service-grid">{TARGET_NODES.slice(1).map(node => <div className={`arch-service-node ${activeTarget === node.label ? "active" : ""}`} key={node.id}><span>{node.kind === "application" ? "◈" : node.kind === "database" ? "▣" : "▤"}</span><b>{node.label}</b><small>{down ? "unavailable" : node.detail}</small></div>)}</div></div>
  </div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="arch-metric"><small>{label}</small><strong>{value}</strong><span>{note}</span></div>;
}

export default function ArchitectureLabGame() {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [inspected, setInspected] = useState<EvidenceId[]>([]);
  const [approach, setApproach] = useState<ApproachId | null>(null);
  const [traceIndex, setTraceIndex] = useState(-1);
  const [failurePrediction, setFailurePrediction] = useState<FailurePredictionId | null>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<string[]>([]);
  const [failureAcknowledged, setFailureAcknowledged] = useState(false);

  const gateOpen = canUnlockApproaches(inspected);
  const result = approach ? approachResult(approach) : null;
  const score = useMemo(() => scoreExplanation(selectedExplanation, failureAcknowledged), [selectedExplanation, failureAcknowledged]);
  const activeTrace = traceIndex >= 0 ? M01_TRACE[traceIndex] : null;

  function inspect(id: EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    if (phase === "briefing") setPhase("assembly");
  }

  function chooseApproach(id: ApproachId) {
    setApproach(id);
    if (id !== "A") setTraceIndex(-1);
  }

  function startRequest() {
    if (approach !== "A") return;
    setTraceIndex(0);
    setPhase("simulate");
  }

  function advanceTrace() {
    if (traceIndex < M01_TRACE.length - 1) setTraceIndex(index => index + 1);
    else setPhase("predictFailure");
  }

  function revealFailure() {
    if (!failurePrediction) return;
    setFailureAcknowledged(true);
    setPhase("failure");
  }

  function toggleExplanation(id: string) {
    setSelectedExplanation(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function submitExplanation() {
    setPhase("complete");
  }

  const evidenceCount = inspected.length;
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "failure" ? "TRADE-OFF REVEAL" : phase === "predictFailure" ? "PREDICT THE FAILURE" : phase === "simulate" ? "REQUEST RUNNING" : phase === "assembly" ? (gateOpen ? "ASSEMBLY READY" : `EVIDENCE ${evidenceCount}/4`) : "BRIEFING";

  return <main className="arch-lab-shell arch-m01-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M01 — OPEN THE SHOP</strong></div><Link className="arch-lab-exit" href="/">Exit lab <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief">
        <span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "01"}</span>
        <h1>Open<br />the shop.</h1>
        <p>Atlas Market needs a small online shop today. Investigate the constraints, build the smallest complete path, and explain what your choice leaves unsolved.</p>
        <div className="arch-objective"><span>OBJECTIVE</span><b>Serve one product request and one order without building more infrastructure than the evidence justifies.</b></div>
        <div className="arch-brief-facts"><span><i>01</i> few hundred products</span><span><i>02</i> under 100 concurrent users</span><span><i>03</i> one Linux host available</span></div>
        <div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>Technical claims trace to source section 1.1. Costs, timings and reliability indicators are lab simulations.</span></div>
      </aside>

      <section className="arch-lab-main" aria-live="off">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phase === "complete" ? "You opened the shop." : phase === "failure" ? "The host is gone." : phase === "predictFailure" ? "Make a prediction before reality changes." : phase === "explain" ? "Make the trade-off explicit." : "What does the shop actually need?"}</h2></div><span className="arch-date-chip">M01 · SOURCE 1.1</span></div>
        <div className="arch-live-status" role="status" aria-live="polite">{missionStatus} · {phase === "simulate" ? `step ${traceIndex + 1} of ${M01_TRACE.length}` : phase === "assembly" ? `${evidenceCount} of 4 evidence cards inspected` : "follow the highlighted action"}</div>

        {phase === "briefing" || phase === "assembly" ? <>
          <div className="arch-workspace-grid">
            <section className="arch-panel arch-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Read the evidence first.</h3></div><b className={gateOpen ? "gate-open" : ""}>{evidenceCount}/4 INSPECTED</b></div><p className="arch-panel-copy">No architecture verdict is available yet. Inspect at least three evidence cards, including the business envelope and either the request journey or local state.</p><div className="arch-evidence-list">{M01_EVIDENCE.map(item => <EvidenceCard key={item.id} {...item} inspected={inspected.includes(item.id)} onInspect={() => inspect(item.id)} />)}</div></section>
            <section className="arch-panel arch-system-panel"><div className="arch-panel-head"><div><span className="arch-overline">02 · SYSTEM</span><h3>{approach === "A" ? "Candidate topology assembled." : "Start with an empty system."}</h3></div><b>{result?.status ?? "NOT YET SERVING"}</b></div><Topology empty={approach === null} />{gateOpen && <div className="arch-approaches"><div className="arch-approach-heading"><span className="arch-overline">CANDIDATE TOPOLOGIES</span><small>Choose one, then test it.</small></div>{(["A", "B", "C", "D"] as ApproachId[]).map(id => { const option = approachResult(id); return <button key={id} className={`arch-approach ${approach === id ? "selected" : ""}`} onClick={() => chooseApproach(id)} aria-pressed={approach === id}><span>{id}</span><div><b>{option.label}</b><small>{approach === id ? "Selected candidate · ready to test" : "Candidate topology · test required"}</small></div></button>; })}</div>}
              {approach && result && <div className={`arch-result ${result.status === "READY_TO_SERVE" ? "good" : "warning"}`}><b>{result.status === "READY_TO_SERVE" ? "Candidate assembled — test it." : "Candidate needs more evidence."}</b><span>{result.copy}</span>{result.status === "READY_TO_SERVE" && <div className="arch-metrics"><Metric label="LAB COST" value={`${result.costUnits} units`} note="of 12" /><Metric label="SETUP" value={`${result.setupSteps} steps`} note="simulation" /><Metric label="PATH" value={`${result.requestMs} ms`} note="simulation" /></div>}</div>}
              {approach === "A" && <button className="arch-primary-button" onClick={startRequest}>Run customer request <span>→</span></button>}
            </section>
          </div>
        </> : null}

        {phase === "simulate" && <section className="arch-simulation-view"><div className="arch-panel arch-simulation-panel"><div className="arch-panel-head"><div><span className="arch-overline">03 · LIVE REQUEST SIMULATION</span><h3>Follow the customer request.</h3></div><b>STEP {traceIndex + 1}/{M01_TRACE.length}</b></div><Topology activeTarget={activeTrace?.target} /><div className="arch-trace-rail" aria-label={`Request progress, step ${traceIndex + 1} of ${M01_TRACE.length}`}>{M01_TRACE.map((item, index) => <i className={index < traceIndex ? "done" : index === traceIndex ? "active" : ""} key={item.event} />)}</div><div className="arch-trace-list">{M01_TRACE.map((item, index) => { const locked = index > traceIndex; return <div className={`arch-trace-step ${index < traceIndex ? "done" : ""} ${index === traceIndex ? "active" : ""} ${locked ? "locked" : ""}`} key={item.event}><span>{index < traceIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><div><b>{locked ? `Step ${index + 1}` : item.event}</b><small>{locked ? "Locked until the request reaches here." : item.detail}</small></div><em>{locked ? "LOCKED" : item.target}</em></div>; })}</div>{activeTrace && <div className="arch-live-callout"><span>NOW MOVING</span><b>{activeTrace.event}</b><p>{activeTrace.detail}</p></div>}<button className="arch-primary-button" onClick={advanceTrace}>{traceIndex === M01_TRACE.length - 1 ? "Test the failure boundary →" : "Advance request →"}</button></div></section>}

        {phase === "predictFailure" && <section className="arch-failure-view"><div className="arch-panel arch-prediction-panel"><span className="arch-overline">04 · PREDICT</span><h3>HOST 01 is about to disappear.</h3><p>Before reality changes, predict what survives. Use the topology you just tested, not a generic rule about servers.</p><Topology /><div className="arch-prediction-options" role="radiogroup" aria-label="Failure prediction">{M01_FAILURE_PREDICTIONS.map(option => <button key={option.id} className={failurePrediction === option.id ? "selected" : ""} onClick={() => setFailurePrediction(option.id)} aria-pressed={failurePrediction === option.id}><b>{option.label}</b><small>{option.detail}</small></button>)}</div><button className="arch-primary-button" disabled={!failurePrediction} onClick={revealFailure}>Pull HOST 01 →</button></div></section>}

        {phase === "failure" && <section className="arch-failure-view"><div className="arch-panel arch-failure-panel"><span className="arch-overline">04 · TRADE-OFF REVEAL</span><h3>HOST 01 is gone.</h3><p>Reality has answered the prediction. Because the application, data, images and in-memory Session share one machine, the shop shares one failure domain too.</p><Topology down /><div className="arch-failure-alert"><span>HOST 01 · DOWN</span><b>One shared failure domain</b><small>Shop HTTP unavailable · database unavailable · images unavailable · active sessions lost</small></div><div className={`arch-prediction-result ${failurePredictionIsCorrect(failurePrediction) ? "correct" : "revised"}`}><span>YOUR PREDICTION</span><b>{failurePrediction ? M01_FAILURE_PREDICTIONS.find(option => option.id === failurePrediction)?.label : "No prediction recorded"}</b><small>{failurePredictionIsCorrect(failurePrediction) ? "Correct. The topology gave every service the same failure boundary." : "Revise it. The browser is outside the host, but the shop services it needs are not."}</small></div><button className="arch-primary-button" onClick={() => setPhase("explain")}>Build the causal explanation →</button></div></section>}

        {phase === "explain" && <section className="arch-explain-view"><div className="arch-panel arch-explain-panel"><span className="arch-overline">05 · CAUSAL EXPLANATION</span><h3>Why did this design fit — and what remains unsolved?</h3><p>Build the chain from evidence. Add the fit, then name the failure boundary. Plausible but unsupported claims reduce efficiency.</p><div className="arch-causal-builder"><div><span>BECAUSE</span><button className={selectedExplanation.includes("E01") ? "selected" : ""} onClick={() => toggleExplanation("E01")}>small workload + quick launch</button><button className={selectedExplanation.includes("E03") ? "selected" : ""} onClick={() => toggleExplanation("E03")}>complete HTTP → data path</button></div><strong>→</strong><div><span>THIS DESIGN</span><button className={selectedExplanation.includes("fit") ? "selected" : ""} onClick={() => toggleExplanation("fit")}>fits the present need</button></div><strong>→</strong><div><span>BUT</span><button className={selectedExplanation.includes("E04") ? "selected" : ""} onClick={() => toggleExplanation("E04")}>everything shares one host</button><button className={selectedExplanation.includes("risk") ? "selected" : ""} onClick={() => toggleExplanation("risk")}>one host failure stops the shop</button></div></div><div className="arch-explanation-checks"><span>PLAUSIBLE, BUT UNSUPPORTED</span><button className={selectedExplanation.includes("managed") ? "selected" : ""} onClick={() => toggleExplanation("managed")}>the current evidence requires a managed platform</button><button className={selectedExplanation.includes("independent") ? "selected" : ""} onClick={() => toggleExplanation("independent")}>the database has its own failure boundary</button></div><div className="arch-selected-chain"><span>YOUR CHAIN</span>{selectedExplanation.length ? selectedExplanation.map((id, index) => <b key={`${id}-${index}`}>{index + 1}. {id === "E01" ? "small workload" : id === "E03" ? "complete path" : id === "fit" ? "fits now" : id === "E04" ? "shared host" : id === "risk" ? "shared failure" : id === "managed" ? "managed platform" : "independent database"}</b>) : <small>Select claims above to assemble the explanation.</small>}</div><div className="arch-explain-status"><span>{selectedExplanation.length} clues selected</span><b>{failureAcknowledged ? "Failure domain observed" : "Failure domain not yet observed"}</b></div><button className="arch-primary-button" disabled={!selectedExplanation.includes("E01") || !selectedExplanation.includes("E03") || !selectedExplanation.includes("fit") || !selectedExplanation.includes("E04") || !selectedExplanation.includes("risk")} onClick={submitExplanation}>Submit explanation <span>→</span></button></div></section>}

        {phase === "complete" && <section className="arch-complete-view"><div className="arch-panel arch-complete-panel"><span className="arch-overline">M01 · COMPLETE</span><h3>The shop works — and now you can name its boundary.</h3><p>Your architecture was proportionate for the current workload because the complete product-and-order path stayed on one host. The same choice creates one shared failure domain.</p><div className="arch-architecture-reveal"><span>ARCHITECTURE IDENTIFIED</span><b>Single-Node Monolith</b><small>One Linux host contains the application, local MySQL, local images and in-memory Session.</small></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Simulation-only assessment</small></div><details className="arch-score-details"><summary>See score breakdown</summary><div className="arch-score-grid"><Metric label="DIAGNOSIS" value={`${score.diagnosis}/25`} note="current need" /><Metric label="PROPORTIONALITY" value={`${score.proportionality}/25`} note="fit now" /><Metric label="RELIABILITY" value={`${score.reliability}/20`} note="failure domain" /><Metric label="EXPLANATION" value={`${score.explanation}/20`} note="causal chain" /><Metric label="EFFICIENCY" value={`${score.efficiency}/10`} note="evidence" /></div></details><div className="arch-next-hook"><span>BOUNDARY TO CARRY FORWARD</span><b>The shop is live. Everything important still shares one host, so simplicity and shared failure fate now coexist.</b><p>The assumptions that made this design simple are now visible.</p></div><div className="arch-complete-actions"><button className="arch-primary-button" onClick={() => window.location.reload()}>Replay M01 <span>↻</span></button><Link className="arch-primary-button" href="/computer-science/architecture-lab/m02">Continue to M02 <span>→</span></Link><Link className="arch-secondary-button" href="/">Return to Atlas <span>↗</span></Link></div></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>Source: ccc115a/se · `_more/mybook/向淘寶學習網站架構演進/1.1.md`</span><span>All metrics marked simulation are educational lab values.</span></footer>
  </main>;
}
