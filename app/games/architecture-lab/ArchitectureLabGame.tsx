"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  M01_EVIDENCE,
  M01_FAILURE_PREDICTIONS,
  M01_TRACE,
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

type SystemIconName = "browser" | "resolver" | "host" | "application" | "database" | "storage" | "session";

const SERVICE_NODES = [
  { id: "tomcat", label: "Tomcat", detail: "HTTP app", kind: "application" as const },
  { id: "mysql", label: "MySQL", detail: "product + orders", kind: "database" as const },
  { id: "images", label: "Images", detail: "local disk", kind: "storage" as const },
  { id: "session", label: "Session", detail: "in memory", kind: "session" as const },
];

function SystemIcon({ type }: { type: SystemIconName }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (type === "browser") return <svg viewBox="0 0 48 40" aria-hidden="true"><rect {...common} x="3" y="4" width="42" height="31" rx="3" /><path {...common} d="M3 12h42" /><circle cx="9" cy="8" r="1.5" fill="currentColor" /><circle cx="14" cy="8" r="1.5" fill="currentColor" /><circle cx="19" cy="8" r="1.5" fill="currentColor" /><circle {...common} cx="24" cy="24" r="7" /><path {...common} d="M17 24h14M24 17c3 4 3 10 0 14M24 17c-3 4-3 10 0 14" /></svg>;
  if (type === "resolver") return <svg viewBox="0 0 48 40" aria-hidden="true"><rect {...common} x="4" y="8" width="40" height="24" rx="3" /><path {...common} d="M10 15h10M10 21h14M10 27h7M32 14v12M37 17v6" /><circle cx="27" cy="15" r="1.5" fill="currentColor" /><circle cx="27" cy="25" r="1.5" fill="currentColor" /></svg>;
  if (type === "host") return <svg viewBox="0 0 48 40" aria-hidden="true"><rect {...common} x="8" y="3" width="32" height="34" rx="2" /><path {...common} d="M13 10h22M13 20h22M13 30h22" /><circle cx="17" cy="15" r="1.5" fill="currentColor" /><circle cx="17" cy="25" r="1.5" fill="currentColor" /><circle cx="17" cy="35" r="1.5" fill="currentColor" /><path {...common} d="M23 15h8M23 25h8M23 35h8" /></svg>;
  if (type === "application") return <svg viewBox="0 0 48 40" aria-hidden="true"><rect {...common} x="7" y="7" width="34" height="26" rx="3" /><path {...common} d="M12 14h24M14 21h8M14 27h14" /><circle cx="35" cy="21" r="2" fill="currentColor" /></svg>;
  if (type === "database") return <svg viewBox="0 0 48 40" aria-hidden="true"><ellipse {...common} cx="24" cy="9" rx="14" ry="5" /><path {...common} d="M10 9v20c0 3 6 6 14 6s14-3 14-6V9M10 19c0 3 6 5 14 5s14-2 14-5" /></svg>;
  if (type === "storage") return <svg viewBox="0 0 48 40" aria-hidden="true"><path {...common} d="M8 13h12l4 4h16v16H8z" /><path {...common} d="M8 13V9h13l4 4" /><path {...common} d="M17 23h14M17 28h9" /></svg>;
  return <svg viewBox="0 0 48 40" aria-hidden="true"><rect {...common} x="13" y="8" width="22" height="24" rx="3" /><path {...common} d="M18 4v7M24 4v7M30 4v7M18 29v7M24 29v7M30 29v7M9 14h7M9 20h7M9 26h7M32 14h7M32 20h7M32 26h7" /><path {...common} d="M19 17h10M19 23h10" /></svg>;
}

function slugTarget(target?: string) {
  return target?.toLowerCase().replace(/[^a-z]+/g, "-") || "idle";
}

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

function Topology({ down = false, empty = false, activeTarget, incident = false }: { down?: boolean; empty?: boolean; activeTarget?: string; incident?: boolean }) {
  if (empty) return <div className="arch-empty-topology" aria-label="Empty architecture canvas"><span>＋</span><b>No serving topology yet.</b><small>Inspect evidence, then choose a candidate to test.</small></div>;
  const packetTarget = slugTarget(activeTarget);
  return <div className={`arch-topology ${down ? "down" : ""} ${incident ? "incident" : ""}`} aria-label={down ? "Single host failed; browser and resolver remain online while local services are unavailable" : "Single host topology with Browser, DNS resolver, Tomcat, MySQL, local images and Session"}>
    <div className="arch-network-canvas">
      <svg className="arch-network-edges" viewBox="0 0 1000 430" aria-hidden="true">
        <defs><marker id="arch-arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor" /></marker><marker id="arch-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="currentColor" /></marker></defs>
        <path className="arch-edge arch-edge-browser" d="M205 205 C285 205 290 205 365 205" markerEnd="url(#arch-arrow-cyan)" />
        <path className="arch-edge arch-edge-dns" d="M465 205 C540 205 565 205 635 205" markerEnd="url(#arch-arrow-cyan)" />
        <path className={`arch-edge arch-edge-host ${down ? "broken" : ""}`} d="M735 205 C810 205 830 205 900 205" markerEnd={down ? "url(#arch-arrow-red)" : "url(#arch-arrow-cyan)"} />
        <path className="arch-edge arch-edge-down" d="M900 205 C945 205 948 285 900 300" />
      </svg>

      <div className={`arch-network-node arch-node-browser ${activeTarget === "Browser" ? "active" : ""}`}><SystemIcon type="browser" /><b>Browser</b><small>customer · online</small></div>
      <div className={`arch-network-node arch-node-resolver ${activeTarget === "DNS" ? "active" : ""}`}><SystemIcon type="resolver" /><b>DNS</b><small>resolver · online</small></div>
      <div className={`arch-host-frame ${down ? "offline" : ""}`}>
        <div className="arch-host-head"><span className="arch-host-icon"><SystemIcon type="host" /></span><div><b>HOST 01</b><small>Linux host</small></div><strong>{down ? "OFFLINE" : "ONLINE"}</strong></div>
        <div className="arch-service-grid">
          {SERVICE_NODES.map(node => <div className={`arch-service-node ${activeTarget === node.label ? "active" : ""} ${down ? "unavailable" : ""}`} key={node.id}><SystemIcon type={node.kind} /><div><b>{node.label}</b><small>{down ? node.kind === "session" ? "LOST" : "UNREACHABLE" : node.detail}</small></div></div>)}
        </div>
        {down && <div className="arch-host-incident"><span>SHARED FAILURE BOUNDARY</span><b>One host. Four local dependencies.</b></div>}
      </div>

      {!down && <div className={`arch-request-packet target-${packetTarget}`} aria-hidden="true"><span>GET</span><i /></div>}
      {down && <div className="arch-dropped-packet" aria-hidden="true"><span>×</span></div>}
      <div className="arch-network-caption"><span className="arch-status-dot cyan" />observed flow <span className="arch-status-dot gold" />player focus <span className="arch-status-dot red" />incident</div>
    </div>
  </div>;
}

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="arch-metric"><small>{label}</small><strong>{value}</strong><span>{note}</span></div>;
}

export default function ArchitectureLabGame() {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [inspected, setInspected] = useState<EvidenceId[]>([]);
  const [approach, setApproach] = useState<ApproachId | null>(null);
  const [testedApproach, setTestedApproach] = useState<ApproachId | null>(null);
  const [traceIndex, setTraceIndex] = useState(-1);
  const [failurePrediction, setFailurePrediction] = useState<FailurePredictionId | null>(null);
  const [selectedExplanation, setSelectedExplanation] = useState<string[]>([]);
  const [failureAcknowledged, setFailureAcknowledged] = useState(false);
  const [incidentPulse, setIncidentPulse] = useState(false);

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
    setTestedApproach(null);
    if (id !== "A") setTraceIndex(-1);
  }

  function testCandidate() {
    if (approach) setTestedApproach(approach);
  }

  function startRequest() {
    if (approach !== "A" || testedApproach !== "A") return;
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
    setIncidentPulse(true);
    setPhase("failure");
    window.setTimeout(() => setIncidentPulse(false), 1100);
  }

  function toggleExplanation(id: string) {
    setSelectedExplanation(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
  }

  function submitExplanation() {
    setPhase("complete");
  }

  const evidenceCount = inspected.length;
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "failure" ? "TRADE-OFF REVEAL" : phase === "predictFailure" ? "PREDICT THE FAILURE" : phase === "simulate" ? "REQUEST RUNNING" : phase === "assembly" ? (gateOpen ? "ASSEMBLY READY" : `EVIDENCE ${evidenceCount}/4`) : "BRIEFING";
  const liveMessage = phase === "failure"
    ? "HOST 01 offline. Tomcat, MySQL, local images and active Session state are unavailable."
    : `${missionStatus} · ${phase === "simulate" ? `step ${traceIndex + 1} of ${M01_TRACE.length}` : phase === "assembly" ? `${evidenceCount} of 4 evidence cards inspected` : "follow the highlighted action"}`;

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
        <div className="arch-live-status" role="status" aria-live="polite">{liveMessage}</div>

        {phase === "briefing" || phase === "assembly" ? <>
          <div className="arch-workspace-grid">
            <section className="arch-panel arch-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Read the evidence first.</h3></div><b className={gateOpen ? "gate-open" : ""}>{evidenceCount}/4 INSPECTED</b></div><p className="arch-panel-copy">No architecture verdict is available yet. Inspect at least three evidence cards, including the business envelope and either the request journey or local state.</p><div className="arch-evidence-list">{M01_EVIDENCE.map(item => <EvidenceCard key={item.id} {...item} inspected={inspected.includes(item.id)} onInspect={() => inspect(item.id)} />)}</div></section>
            <section className="arch-panel arch-system-panel"><div className="arch-panel-head"><div><span className="arch-overline">02 · SYSTEM</span><h3>{approach ? "Candidate hypothesis selected." : "Start with an empty system."}</h3></div><b>{testedApproach === approach && result ? result.status : approach ? "NOT YET TESTED" : "NOT YET SERVING"}</b></div><Topology empty={approach === null} />{gateOpen && <div className="arch-approaches"><div className="arch-approach-heading"><span className="arch-overline">CANDIDATE TOPOLOGIES</span><small>Choose a hypothesis, then test it.</small></div>{(["A", "B", "C", "D"] as ApproachId[]).map(id => { const option = approachResult(id); return <button key={id} className={`arch-approach ${approach === id ? "selected" : ""}`} onClick={() => chooseApproach(id)} aria-pressed={approach === id}><span>{id}</span><div><b>{option.label}</b><small>{approach === id ? "Selected hypothesis · test required" : "Candidate topology · neutral"}</small></div></button>; })}</div>}
              {approach && testedApproach !== approach && <button className="arch-primary-button arch-test-candidate" onClick={testCandidate}>Test candidate <span>→</span></button>}
              {approach && testedApproach === approach && result && <div className={`arch-result ${result.status === "READY_TO_SERVE" ? "good" : "warning"}`}><b>{result.status === "READY_TO_SERVE" ? "REQUEST TEST AVAILABLE" : "TEST RESULT"}</b><span>{result.copy}</span>{result.status === "READY_TO_SERVE" && <div className="arch-metrics"><Metric label="LAB COST" value={`${result.costUnits} units`} note="of 12" /><Metric label="SETUP" value={`${result.setupSteps} steps`} note="simulation" /><Metric label="PATH" value={`${result.requestMs} ms`} note="simulation" /></div>}</div>}
              {approach === "A" && testedApproach === "A" && <button className="arch-primary-button" onClick={startRequest}>Run customer request <span>→</span></button>}
            </section>
          </div>
        </> : null}

        {phase === "simulate" && <section className="arch-simulation-view"><div className="arch-panel arch-simulation-panel"><div className="arch-panel-head"><div><span className="arch-overline">03 · LIVE REQUEST SIMULATION</span><h3>Follow the customer request.</h3></div><b>STEP {traceIndex + 1}/{M01_TRACE.length}</b></div><Topology activeTarget={activeTrace?.target} /><div className="arch-trace-rail" aria-label={`Request progress, step ${traceIndex + 1} of ${M01_TRACE.length}`}>{M01_TRACE.map((item, index) => <i className={index < traceIndex ? "done" : index === traceIndex ? "active" : ""} key={item.event} />)}</div><div className="arch-trace-list">{M01_TRACE.map((item, index) => { const locked = index > traceIndex; return <div className={`arch-trace-step ${index < traceIndex ? "done" : ""} ${index === traceIndex ? "active" : ""} ${locked ? "locked" : ""}`} key={item.event}><span>{index < traceIndex ? "✓" : String(index + 1).padStart(2, "0")}</span><div><b>{locked ? `Step ${index + 1}` : item.event}</b><small>{locked ? "Locked until the request reaches here." : item.detail}</small></div><em>{locked ? "LOCKED" : item.target}</em></div>; })}</div>{activeTrace && <div className="arch-live-callout"><span>NOW MOVING</span><b>{activeTrace.event}</b><p>{activeTrace.detail}</p></div>}<button className="arch-primary-button" onClick={advanceTrace}>{traceIndex === M01_TRACE.length - 1 ? "Test the failure boundary →" : "Advance request →"}</button></div></section>}

        {phase === "predictFailure" && <section className="arch-failure-view"><div className="arch-panel arch-prediction-panel"><span className="arch-overline">04 · PREDICT</span><h3>HOST 01 is about to disappear.</h3><p>Before reality changes, predict what survives. Use the topology you just tested, not a generic rule about servers.</p><Topology /><div className="arch-prediction-options" role="radiogroup" aria-label="Failure prediction">{M01_FAILURE_PREDICTIONS.map(option => <button key={option.id} className={failurePrediction === option.id ? "selected" : ""} onClick={() => setFailurePrediction(option.id)} aria-pressed={failurePrediction === option.id}><b>{option.label}</b><small>{option.detail}</small></button>)}</div><button className="arch-primary-button" disabled={!failurePrediction} onClick={revealFailure}>Pull HOST 01 →</button></div></section>}

        {phase === "failure" && <section className="arch-failure-view"><div className="arch-panel arch-failure-panel"><span className="arch-overline">04 · TRADE-OFF REVEAL</span><h3>HOST 01 is gone.</h3><p>Reality has answered the prediction. The browser and resolver remain online; the services inside HOST 01 do not.</p><Topology down incident={incidentPulse} /><div className="arch-failure-alert"><span>HOST 01 · OFFLINE</span><b>One host. One failure domain.</b><small>Tomcat stopped · MySQL unreachable · images unavailable · active Session lost</small></div><div className={`arch-prediction-result ${failurePredictionIsCorrect(failurePrediction) ? "correct" : "revised"}`}><span>YOUR PREDICTION</span><b>{failurePrediction ? M01_FAILURE_PREDICTIONS.find(option => option.id === failurePrediction)?.label : "No prediction recorded"}</b><small>{failurePredictionIsCorrect(failurePrediction) ? "Correct. Every shop dependency sat inside the same host boundary." : "Revise it. The browser and resolver survive outside the host, but the shop services do not."}</small></div><button className="arch-primary-button" onClick={() => setPhase("explain")}>Build the causal explanation →</button></div></section>}

        {phase === "explain" && <section className="arch-explain-view"><div className="arch-panel arch-explain-panel"><span className="arch-overline">05 · CAUSAL EXPLANATION</span><h3>Why did this design fit — and what remains unsolved?</h3><p>Build the chain from evidence. Place claims into the cause → effect slots. The experiment is the judge.</p><div className="arch-causal-builder"><div><span>EVIDENCE</span><button className={selectedExplanation.includes("E01") ? "selected" : ""} onClick={() => toggleExplanation("E01")}>small workload + quick launch</button><button className={selectedExplanation.includes("E03") ? "selected" : ""} onClick={() => toggleExplanation("E03")}>complete HTTP → data path</button></div><strong>→</strong><div><span>DESIGN CHOICE</span><button className={selectedExplanation.includes("fit") ? "selected" : ""} onClick={() => toggleExplanation("fit")}>fits the present need</button></div><strong>→</strong><div><span>MECHANISM / RISK</span><button className={selectedExplanation.includes("E04") ? "selected" : ""} onClick={() => toggleExplanation("E04")}>everything shares one host</button><button className={selectedExplanation.includes("risk") ? "selected" : ""} onClick={() => toggleExplanation("risk")}>one host failure stops the shop</button></div></div><div className="arch-explanation-checks"><span>AVAILABLE CLAIMS</span><button className={selectedExplanation.includes("managed") ? "selected" : ""} onClick={() => toggleExplanation("managed")}>the current evidence requires a managed platform</button><button className={selectedExplanation.includes("independent") ? "selected" : ""} onClick={() => toggleExplanation("independent")}>the database has its own failure boundary</button></div><div className="arch-selected-chain"><span>YOUR CHAIN</span>{selectedExplanation.length ? selectedExplanation.map((id, index) => <b key={`${id}-${index}`}>{index + 1}. {id === "E01" ? "small workload" : id === "E03" ? "complete path" : id === "fit" ? "fits now" : id === "E04" ? "shared host" : id === "risk" ? "shared failure" : id === "managed" ? "managed platform" : "independent database"}</b>) : <small>Select claims above to assemble the explanation.</small>}</div><div className="arch-explain-status"><span>{selectedExplanation.length} claims placed</span><b>{failureAcknowledged ? "Failure domain observed" : "Failure domain not yet observed"}</b></div><button className="arch-primary-button" disabled={!selectedExplanation.includes("E01") || !selectedExplanation.includes("E03") || !selectedExplanation.includes("fit") || !selectedExplanation.includes("E04") || !selectedExplanation.includes("risk")} onClick={submitExplanation}>Submit explanation <span>→</span></button></div></section>}

        {phase === "complete" && <section className="arch-complete-view"><div className="arch-panel arch-complete-panel"><span className="arch-overline">M01 · COMPLETE</span><h3>The shop works — and now you can name its boundary.</h3><p>Your architecture was proportionate for the current workload because the complete product-and-order path stayed on one host. The same choice creates one shared failure domain.</p><div className="arch-architecture-reveal"><span>ARCHITECTURE IDENTIFIED</span><b>Single-Node Monolith</b><small>One Linux host contains the application, local MySQL, local images and in-memory Session.</small></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Simulation-only assessment</small></div><details className="arch-score-details"><summary>See score breakdown</summary><div className="arch-score-grid"><Metric label="DIAGNOSIS" value={`${score.diagnosis}/25`} note="current need" /><Metric label="PROPORTIONALITY" value={`${score.proportionality}/25`} note="fit now" /><Metric label="RELIABILITY" value={`${score.reliability}/20`} note="failure domain" /><Metric label="EXPLANATION" value={`${score.explanation}/20`} note="causal chain" /><Metric label="EFFICIENCY" value={`${score.efficiency}/10`} note="evidence" /></div></details><div className="arch-next-hook"><span>BOUNDARY TO CARRY FORWARD</span><b>The shop is live. Everything important still shares one host, so simplicity and shared failure fate now coexist.</b><p>The assumptions that made this design simple are now visible.</p></div><div className="arch-complete-actions"><button className="arch-primary-button" onClick={() => window.location.reload()}>Replay M01 <span>↻</span></button><Link className="arch-primary-button" href="/computer-science/architecture-lab/m02">Continue to M02 <span>→</span></Link><Link className="arch-secondary-button" href="/">Return to Atlas <span>↗</span></Link></div></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>Source: ccc115a/se · `_more/mybook/向淘寶學習網站架構演進/1.1.md`</span><span>All metrics marked simulation are educational lab values.</span></footer>
  </main>;
}
