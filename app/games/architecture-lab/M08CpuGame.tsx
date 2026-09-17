"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  M08_CAUSAL_CLAIMS,
  M08_DIAGNOSES,
  M08_EVIDENCE,
  M08_INTERVENTIONS,
  M08_METRICS,
  M08_RESULTS,
  canCompleteM08,
  canUnlockM08Evidence,
  m08ProofPredicate,
  predictionsCompleteM08,
  resultChecksMatchPredictionsM08,
  scoreM08,
  type M08CausalId,
  type M08Diagnosis,
  type M08EvidenceId,
  type M08Intervention,
  type M08MetricId,
  type M08Prediction,
  type M08Reconciliation,
} from "./m08-engine";

type Phase = "observe" | "investigate" | "diagnose" | "predict" | "run" | "reveal" | "reconcile" | "explain" | "complete";
const PREDICTIONS: readonly M08Prediction[] = ["LOW", "MEDIUM", "HIGH", "UNCHANGED"];
const INITIAL_CAUSAL_ORDER: M08CausalId[] = ["CPU_SATURATES", "LOAD_ARRIVES", "QUEUE_GROWS", "COMPUTE_HOT"];

function AtlasMark() { return <span className="arch-lab-mark" aria-hidden="true">AX</span>; }
function Feedback({ title, children, tone = "error" }: { title: string; children: ReactNode; tone?: "error" | "neutral" | "good" }) {
  return <div className={`arch-m04-feedback ${tone}`} role={tone === "error" ? "alert" : "status"}><b>{title}</b><span>{children}</span></div>;
}
function ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Diagnose", "Predict", "Reveal", "Explain", "Score"];
  const index = phase === "observe" ? 0 : phase === "investigate" ? 1 : phase === "diagnose" ? 2 : phase === "predict" || phase === "run" ? 3 : phase === "reveal" || phase === "reconcile" ? 4 : phase === "explain" ? 5 : 6;
  return <div className="arch-lab-progress" aria-label="M08 mission progress">{items.map((item, itemIndex) => <span className={itemIndex <= index ? "active" : ""} key={item}><i>{String(itemIndex + 1).padStart(2, "0")}</i>{item}</span>)}</div>;
}
function EvidenceCard({ item, inspected, onInspect }: { item: typeof M08_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button type="button" className={`arch-m04-evidence ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected} data-testid={`m08-evidence-${item.id}`}>
    <span className="arch-m04-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong><span>{inspected ? item.observation : item.preview}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.provenance}</small></>}
  </button>;
}
const M08_BASELINE_REFERENCES: Readonly<Record<M08MetricId, string>> = { CPU: "96%", QUEUE: "31", LATENCY: "920 ms", THROUGHPUT: "160 req/s" };
const M08_CHANGE_MODULES: readonly { id: M08Intervention; target: string; change: string }[] = [
  { id: "SIMPLIFY_COMPUTE", target: "RENDER + SERIALISE", change: "change work performed per request" },
  { id: "UPGRADE_CPU", target: "CPU CAPACITY", change: "change compute capacity" },
  { id: "ADD_MEMORY", target: "HEAP CAPACITY", change: "change memory capacity" },
];

function M08BoardGlyph({ kind }: { kind: "demand" | "work" | "cpu" | "queue" | "memory" | "io" | "outcome" }) {
  return <svg className="arch-m08-board-glyph" viewBox="0 0 48 48" aria-hidden="true">
    {kind === "demand" && <><path d="M8 24h25" /><path d="m26 16 9 8-9 8" /><circle cx="11" cy="14" r="3" /><circle cx="11" cy="34" r="3" /></>}
    {kind === "work" && <><rect x="9" y="10" width="30" height="28" rx="4" /><path d="M16 18h16M16 24h10M16 30h14" /></>}
    {kind === "cpu" && <><rect x="11" y="11" width="26" height="26" rx="3" /><path d="M17 21h14M17 27h8" /><path d="M6 17h5M6 24h5M6 31h5M37 17h5M37 24h5M37 31h5" /></>}
    {kind === "queue" && <><rect x="9" y="13" width="12" height="8" rx="2" /><rect x="27" y="13" width="12" height="8" rx="2" /><rect x="9" y="27" width="12" height="8" rx="2" /><rect x="27" y="27" width="12" height="8" rx="2" /></>}
    {kind === "memory" && <><path d="M12 14h24v20H12z" /><path d="M17 19h14M17 25h10M17 31h6" /><path d="M8 18h4M8 24h4M8 30h4M36 18h4M36 24h4M36 30h4" /></>}
    {kind === "io" && <><circle cx="24" cy="24" r="13" /><path d="M24 16v9l6 4" /><path d="M10 11 6 15M38 11l4 4" /></>}
    {kind === "outcome" && <><path d="M10 34V22M19 34V16M28 34V25M37 34V11" /><path d="M7 37h34" /></>}
  </svg>;
}

function M08WorkLane({ kind, title, subtitle, active, metrics, note }: { kind: "cpu" | "queue" | "memory" | "io"; title: string; subtitle: string; active: boolean; metrics: string[]; note?: string }) {
  return <article className={`arch-m08-work-lane ${active ? "active" : ""}`} aria-label={`${title} evidence lane`}>
    <div className="arch-m08-lane-head"><span className="arch-m08-lane-icon"><M08BoardGlyph kind={kind} /></span><span><b>{title}</b><small>{subtitle}</small></span><em>{active ? "EVIDENCE ACTIVE" : "UNRESOLVED"}</em></div>
    <div className="arch-m08-lane-metrics">{metrics.length ? metrics.map(metric => <span key={metric}>{metric}</span>) : <span className="arch-m08-board-lock">measurement hidden · inspect evidence</span>}</div>
    {note && <small className="arch-m08-lane-note">{note}</small>}
  </article>;
}

function M08WorkBoard({ phase, inspected, intervention, predictions, checks }: { phase: Phase; inspected: M08EvidenceId[]; intervention: M08Intervention | null; predictions: Partial<Record<M08MetricId, M08Prediction>>; checks: Partial<Record<M08MetricId, M08Reconciliation>> }) {
  const has = (id: M08EvidenceId) => inspected.includes(id);
  const afterReveal = phase === "reveal" || phase === "reconcile" || phase === "explain" || phase === "complete";
  const result = intervention && afterReveal ? M08_RESULTS[intervention] : null;
  const resultFor = (id: M08MetricId) => result?.[id];
  const demandMetrics = has("E01") ? ["CAMPAIGN DEMAND · 180 req/s"] : [];
  const workMetrics = has("E05") ? ["RENDER + SERIALISE · 62% samples"] : [];
  const cpuMetrics = [
    ...(has("E02") ? ["LOAD · 14.2 / 8 logical CPUs"] : []),
    ...(has("E03") ? ["JAVA CPU · 96%"] : []),
    ...(resultFor("CPU") ? [`RUN · CPU ${resultFor("CPU")!.value}`] : []),
  ];
  const queueMetrics = [
    ...(has("E04") ? ["QUEUE · 31 requests"] : []),
    ...(resultFor("QUEUE") ? [`RUN · QUEUE ${resultFor("QUEUE")!.value}`] : []),
  ];
  const memoryMetrics = has("E06") ? ["HEAP · 71%", "FULL GC · 0 captured"] : [];
  const ioMetrics = has("E07") ? ["I/O WAIT · 4%", "READS BLOCKED · 3 / 200"] : [];
  const status = phase === "reveal" || phase === "reconcile" ? "RESULT AVAILABLE" : afterReveal ? "RESULT RECORDED" : phase === "predict" || phase === "run" ? "RESULT HIDDEN" : canUnlockM08Evidence(inspected) ? "EVIDENCE MODEL READY" : inspected.length ? "EVIDENCE IN BOARD" : "MEASUREMENTS LOCKED";
  return <section className="arch-panel arch-m08-work-board" aria-label="Campaign work queue pressure board">
    <div className="arch-m08-board-head"><div><span className="arch-overline">CAMPAIGN WORK · QUEUE PRESSURE BOARD</span><h3>Can the host finish work as fast as demand arrives?</h3></div><b>{status}</b></div>
    <div className="arch-m08-system-path">
      <div className={`arch-m08-demand-node ${has("E01") ? "observed" : ""}`}><M08BoardGlyph kind="demand" /><span><b>INCOMING DEMAND</b><small>{demandMetrics[0] ?? "load sample locked"}</small></span></div>
      <span className="arch-m08-flow-arrow" aria-hidden="true">→</span>
      <div className="arch-m08-host-node"><div className="arch-m08-host-head"><span><b>APPLICATION HOST</b><small>work, pressure, queue and customer outcome</small></span><span className="arch-m08-fixed-chip">FIXED · ONE INCIDENT WINDOW</span></div><div className="arch-m08-work-row"><div className={`arch-m08-work-object ${has("E05") ? "active" : ""}`}><M08BoardGlyph kind="work" /><span><b>REQUEST WORK</b><small>{workMetrics[0] ?? "render / serialise work hidden"}</small></span></div><span className="arch-m08-mini-arrow" aria-hidden="true">↓</span><div className={`arch-m08-work-object ${has("E03") ? "active" : ""}`}><M08BoardGlyph kind="cpu" /><span><b>CPU / SCHEDULER</b><small>{has("E03") ? "capacity under pressure" : "pressure unresolved"}</small></span></div><span className="arch-m08-mini-arrow" aria-hidden="true">↓</span><div className={`arch-m08-work-object ${has("E04") ? "active" : ""}`}><M08BoardGlyph kind="queue" /><span><b>UNFINISHED QUEUE</b><small>{has("E04") ? "customer work waits" : "queue hidden"}</small></span></div></div><div className="arch-m08-lane-grid"><M08WorkLane kind="cpu" title="CPU / scheduler" subtitle="load · utilisation · work" active={has("E02") || has("E03") || Boolean(resultFor("CPU"))} metrics={cpuMetrics} note={has("E03") && !has("E05") ? "CAUSE NOT YET PROVEN" : undefined} /><M08WorkLane kind="queue" title="Queue / outcome" subtitle="unfinished work · p95" active={has("E04") || Boolean(resultFor("QUEUE"))} metrics={queueMetrics} /><M08WorkLane kind="memory" title="Memory / GC" subtitle="measured comparator" active={has("E06")} metrics={memoryMetrics} note={has("E06") ? "WEAKENS MEMORY-PRIMARY · THIS RUN" : undefined} /><M08WorkLane kind="io" title="Wait / I/O" subtitle="measured comparator" active={has("E07")} metrics={ioMetrics} note={has("E07") ? "WEAKENS I/O-PRIMARY · THIS RUN" : undefined} /></div><div className="arch-m08-outcome-strip"><span><M08BoardGlyph kind="outcome" /><b>CUSTOMER OUTCOME</b></span><span>{has("E04") ? "P95 · 920 ms" : "P95 · hidden"}</span><span>{resultFor("LATENCY") ? `RUN · ${resultFor("LATENCY")!.value} ms` : "THROUGHPUT · reference appears at forecast"}</span></div></div>
    </div>
    {(phase === "predict" || phase === "run" || phase === "reveal" || phase === "reconcile" || phase === "explain" || phase === "complete") && <div className="arch-m08-change-rail"><div className="arch-m08-rail-head"><span className="arch-overline">CONTROLLED CHANGE · ONE VARIABLE</span><small>Demand 180 req/s · same incident window · seed 20260917</small></div><div className="arch-m08-change-grid">{M08_CHANGE_MODULES.map(module => <div className={`arch-m08-change-card ${intervention === module.id ? "selected" : ""}`} key={module.id}><span>{intervention === module.id ? "●" : "○"}</span><b>{M08_INTERVENTIONS.find(item => item.id === module.id)!.label}</b><small>{module.target} · {module.change}</small></div>)}</div></div>}
    {intervention && <div className="arch-m08-forecast-strip"><span className="arch-overline">FORECAST BOARD · {afterReveal ? "FORECAST FROZEN · RESULT RECORDED" : "RESULT HIDDEN UNTIL RUN"}</span>{M08_METRICS.map(metric => { const predicted = predictions[metric.id]; const record = resultFor(metric.id); const check = checks[metric.id]; return <div className="arch-m08-forecast-cell" key={metric.id}><b>{metric.label}</b><small>BASELINE · {M08_BASELINE_REFERENCES[metric.id]}</small><span>{predicted ? `PREDICT · ${predicted}` : "PREDICT · —"}</span>{record && <em>{`OBSERVED · ${record.value} → ${record.direction}`}{check ? ` · ${check === "CONFIRMED" ? "MATCH" : "REVISE"}` : ""}</em>}</div>; })}</div>}
  </section>;
}

function ResultTable({ intervention }: { intervention: M08Intervention }) {
  return <div className="arch-m07-result-table" aria-label={`${intervention} result`} data-testid="m08-result-table">
    <div className="arch-m07-result-heading"><span>METRIC</span><span>OBSERVED</span><span>DIRECTION</span></div>
    {M08_METRICS.map(metric => { const result = M08_RESULTS[intervention][metric.id]; return <div className="arch-m07-result-row" key={metric.id}><b>{metric.label}</b><span>{result.value} <small>{result.unit}</small></span><em>{result.direction}</em></div>; })}
  </div>;
}
function PredictionFields({ predictions, onChange }: { predictions: Partial<Record<M08MetricId, M08Prediction>>; onChange: (id: M08MetricId, value: M08Prediction) => void }) {
  return <div className="arch-m08-prediction-grid">{M08_METRICS.map(metric => <fieldset className="arch-m08-prediction-card" key={metric.id}><legend><b>{metric.label}</b><span>{metric.prompt}</span></legend><div className="arch-m08-prediction-options">{PREDICTIONS.map(option => <button type="button" className={predictions[metric.id] === option ? "selected" : ""} aria-pressed={predictions[metric.id] === option} key={option} onClick={() => onChange(metric.id, option)}>{option}</button>)}</div></fieldset>)}</div>;
}
function ReconciliationFields({ intervention, checks, onChange }: { intervention: M08Intervention; checks: Partial<Record<M08MetricId, M08Reconciliation>>; onChange: (id: M08MetricId, value: M08Reconciliation) => void }) {
  return <div className="arch-m05-check-grid">{M08_METRICS.map(metric => <fieldset key={metric.id}><legend>{metric.label}</legend>{(["CONFIRMED", "NOT_CONFIRMED"] as const).map(option => <label className={checks[metric.id] === option ? "selected" : ""} key={option}><input type="radio" name={`m08-check-${metric.id}`} value={option} checked={checks[metric.id] === option} onChange={() => onChange(metric.id, option)} />{option === "CONFIRMED" ? "Confirmed" : "Not confirmed"}</label>)}</fieldset>)}<small className="arch-m06-note">This run is `{intervention}`. Mark what your frozen prediction got right; the interface does not auto-select the record.</small></div>;
}

export default function M08CpuGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M08EvidenceId[]>([]);
  const [diagnosis, setDiagnosis] = useState<M08Diagnosis | null>(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState<M08Diagnosis | null>(null);
  const [proof, setProof] = useState<M08EvidenceId[]>([]);
  const [intervention, setIntervention] = useState<M08Intervention | null>(null);
  const [predictions, setPredictions] = useState<Partial<Record<M08MetricId, M08Prediction>>>({});
  const [checks, setChecks] = useState<Partial<Record<M08MetricId, M08Reconciliation>>>({});
  const [reconciled, setReconciled] = useState(false);
  const [causalOrder, setCausalOrder] = useState<M08CausalId[]>(INITIAL_CAUSAL_ORDER);
  const [comparedAlternative, setComparedAlternative] = useState(false);
  const [boundedStatement, setBoundedStatement] = useState(false);
  const [recoveryCycles, setRecoveryCycles] = useState(0);
  const [feedback, setFeedback] = useState("");

  const evidenceOpen = canUnlockM08Evidence(inspected);
  const score = useMemo(() => scoreM08({ inspected, diagnosis, proof, intervention, predictions, reconciled, causalOrder, comparedAlternative, boundedStatement, recoveryCycles }), [inspected, diagnosis, proof, intervention, predictions, reconciled, causalOrder, comparedAlternative, boundedStatement, recoveryCycles]);
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · NEW INCIDENT" : phase === "investigate" ? `INVESTIGATE · ${inspected.length}/7 REQUIRED` : phase === "diagnose" ? "DIAGNOSE · HYPOTHESIS REQUIRED" : phase === "predict" ? "PREDICT · RESULT HIDDEN" : phase === "run" ? "RUN · CONTROLLED CHANGE" : phase === "reveal" ? "REVEAL · RECORD AVAILABLE" : phase === "reconcile" ? "RECONCILE · COMPARE REALITY" : "EXPLAIN · REVISE OR KEEP";

  function inspectEvidence(id: M08EvidenceId) { setInspected(current => current.includes(id) ? current : [...current, id]); setPhase(current => current === "observe" ? "investigate" : current); setFeedback(""); }
  function commitEvidence() { if (!evidenceOpen) { setFeedback("Inspect all seven evidence cards before choosing a resource-family hypothesis."); return; } setPhase("diagnose"); setFeedback(""); }
  function toggleProof(id: M08EvidenceId) { setProof(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); setFeedback(""); }
  function commitDiagnosis() { if (!m08ProofPredicate(diagnosis, proof, inspected)) { setRecoveryCycles(current => current + 1); setFeedback("Choose a complete hypothesis and cite the required inspected proof. E01 or E04, plus the diagnosis-specific comparator cards, must be included."); return; } setPhase("predict"); setFeedback(""); }
  function chooseIntervention(id: M08Intervention) { setIntervention(id); setPredictions({}); setChecks({}); setReconciled(false); setFinalDiagnosis(null); setFeedback(""); }
  function commitPredictions() { if (!intervention || !predictionsCompleteM08(predictions)) { setRecoveryCycles(current => current + 1); setFeedback("Choose an intervention and predict all four metrics before the result is revealed."); return; } setPhase("run"); setFeedback(""); }
  function runChange() { if (intervention) { setPhase("reveal"); setFeedback(""); } }
  function commitReconciliation() { if (!intervention || !resultChecksMatchPredictionsM08(intervention, predictions, checks)) { setRecoveryCycles(current => current + 1); setFeedback("Reconcile every metric with the frozen prediction. A wrong prediction can recover here, but it cannot be marked confirmed."); return; } setReconciled(true); setFinalDiagnosis(diagnosis); setPhase("explain"); setFeedback(""); }
  function moveCausal(index: number, direction: -1 | 1) { const next = index + direction; if (next < 0 || next >= causalOrder.length) return; setCausalOrder(current => { const copy = [...current]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy; }); setFeedback(""); }
  function commitExplanation() { if (!canCompleteM08({ inspected, diagnosis, finalDiagnosis, proof, intervention, predictions, reconciled, causalOrder, comparedAlternative, boundedStatement })) { setRecoveryCycles(current => current + 1); setFeedback("The final diagnosis must match the causal explanation, and the chain must show demand → compute work → saturation → queueing."); return; } setPhase("complete"); setFeedback(""); }
  function rerun() { setRecoveryCycles(current => current + 1); setIntervention(null); setPredictions({}); setChecks({}); setReconciled(false); setFinalDiagnosis(null); setPhase("predict"); setFeedback(""); }
  function replay() { setPhase("observe"); setInspected([]); setDiagnosis(null); setFinalDiagnosis(null); setProof([]); setIntervention(null); setPredictions({}); setChecks({}); setReconciled(false); setCausalOrder([...INITIAL_CAUSAL_ORDER]); setComparedAlternative(false); setBoundedStatement(false); setRecoveryCycles(0); setFeedback(""); }

  return <main className="arch-lab-shell arch-m07-shell arch-m08-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M08 — CAMPAIGN UNDER LOAD</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab/m07">M07 <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "08"}</span><h1>{phase === "complete" ? "The queue has a cause." : "A busy campaign."}</h1><p>Atlas Market pages have become slower during a busy campaign. You are given one incident window and must decide which resource family limits progress.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Inspect all seven signals, make a testable hypothesis, predict a controlled change, then explain the result.</b></div><div className="arch-brief-facts"><span><i>01</i> result stays hidden until prediction</span><span><i>02</i> initial hypothesis is preserved</span><span><i>03</i> source shape ≠ production advice</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>Source claims shape the incident. Exact counters, intervention outcomes and scores are labelled deterministic teaching simulation.</span></div></aside>
      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phase === "complete" ? "The record supports a bounded explanation." : phase === "diagnose" ? "Which resource family best fits?" : phase === "explain" ? "Keep or revise your diagnosis." : "Something changed under load."}</h2></div><span className="arch-date-chip">M08 · SOURCE 1.3</span></div>
        <M08WorkBoard phase={phase} inspected={inspected} intervention={intervention} predictions={predictions} checks={checks} />

        {(phase === "observe" || phase === "investigate") && <>
          <section className="arch-m05-observe-grid"><div className="arch-panel arch-m05-incident"><span className="arch-overline">NEW INCIDENT · SOURCE-BACKED SHAPE</span><h3>The campaign is making ordinary pages take longer.</h3><div className="arch-m06-source-pair"><div><span>BEFORE</span><b>fast</b><small>normal request path</small></div><div><span>DURING CAMPAIGN</span><b>slower</b><small>customers wait longer</small></div></div><p>Load, compute, memory/GC and I/O can all produce a slow symptom. Inspect the complete record before you name the limit.</p><button type="button" className="arch-primary-button" onClick={() => setPhase("investigate")}>Begin investigation <span>→</span></button></div><div className="arch-panel arch-m05-case"><span className="arch-overline">M07 CONTINUITY</span><h3>One application host. A new bottleneck question.</h3><p>This mission tests one bounded resource hypothesis. Memory/GC and I/O remain live alternatives until the evidence discriminates.</p><div className="arch-m04-gate-note">DIAGNOSIS LOCKED · E01–E07 REQUIRED</div></div></section>
          <section className="arch-panel arch-m04-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the complete evidence record.</h3></div><b className={evidenceOpen ? "gate-open" : ""}>{inspected.length}/7 REQUIRED</b></div><p className="arch-m04-panel-copy">Every card is required before diagnosis, including the memory/GC and I/O comparators. The hypothesis and result table stay hidden until the gate opens.</p><div className="arch-m04-evidence-grid">{M08_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{!evidenceOpen && <div className="arch-m04-lock-note" role="status">Evidence gate locked · inspect E01–E07.</div>}{evidenceOpen && <button type="button" className="arch-primary-button" onClick={commitEvidence}>Form a hypothesis <span>→</span></button>}{feedback && <Feedback title="Investigation feedback">{feedback}</Feedback>}</section>
        </>}

        {phase === "diagnose" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">02 · FORM A HYPOTHESIS</span><h3>Which resource family best fits the record?</h3></div><b>PROOF REQUIRED</b></div><p className="arch-m04-panel-copy">Choose one complete hypothesis and cite inspected proof. A wrong complete hypothesis can still reach the controlled run and learn from the reveal.</p><div className="arch-m04-diagnosis-grid">{M08_DIAGNOSES.map(item => <button type="button" key={item.id} className={`arch-m04-diagnosis ${diagnosis === item.id ? "selected" : ""}`} onClick={() => { setDiagnosis(item.id); setFeedback(""); }} aria-pressed={diagnosis === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div><div className="arch-m04-proof"><span className="arch-overline">CITE INSPECTED PROOF</span>{M08_EVIDENCE.map(item => <button type="button" key={item.id} className={proof.includes(item.id) ? "selected" : ""} onClick={() => toggleProof(item.id)} aria-pressed={proof.includes(item.id)}>{item.id} · {item.label}{!inspected.includes(item.id) ? " · inspect first" : ""}</button>)}</div>{feedback && <Feedback title="Hypothesis needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitDiagnosis}>Commit hypothesis <span>→</span></button></section>}

        {phase === "predict" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">03 · PREDICT / CHOOSE CHANGE</span><h3>What should change if your explanation is useful?</h3></div><b>RESULT HIDDEN</b></div><p className="arch-m04-panel-copy">Choose one bounded intervention, then predict all four metrics. Do not use the result table as a shortcut; it appears only after you commit.</p><div className="arch-m05-policy-grid">{M08_INTERVENTIONS.map(item => <button type="button" className={`arch-m05-policy ${intervention === item.id ? "selected" : ""}`} key={item.id} onClick={() => chooseIntervention(item.id)} aria-pressed={intervention === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div>{intervention && <><div className="arch-m07-run-contract"><span>COMMIT BEFORE REVEAL</span><b>{M08_INTERVENTIONS.find(item => item.id === intervention)!.label}</b><small>Seed 20260917 · fixed incident window · exact outcomes remain hidden</small></div><PredictionFields predictions={predictions} onChange={(id, value) => { setPredictions(current => ({ ...current, [id]: value })); setFeedback(""); }} /></>}{feedback && <Feedback title="Prediction needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitPredictions}>Commit prediction <span>→</span></button></section>}

        {phase === "run" && intervention && <section className="arch-panel arch-m06-stage"><span className="arch-overline">04 · RUN · TEACHING SIMULATION</span><h3>Run the controlled change.</h3><p className="arch-m04-panel-copy">The intervention changes one bounded resource response in a deterministic teaching simulation. It reveals observations, not a universal production remedy.</p><div className="arch-m07-run-contract"><span>FIXED EXPERIMENT IDENTITY</span><b>Seed 20260917 · 180 req/s · one incident window</b><small>Source-backed incident shape; exact intervention telemetry is simulated.</small></div><button type="button" className="arch-primary-button" onClick={runChange}>Run controlled change <span>→</span></button></section>}

        {phase === "reveal" && intervention && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">05 · REVEAL</span><h3>The controlled result is visible.</h3></div><b>RESULT REVEALED</b></div><p className="arch-m04-panel-copy">Read what actually happened. Your predictions remain frozen until reconciliation.</p><ResultTable intervention={intervention} /><div className="arch-m06-note">All values are `TEACHING_SIMULATION`. Missing data would be labelled `NOT_CAPTURED`, never silently treated as zero.</div><button type="button" className="arch-primary-button" onClick={() => setPhase("reconcile")}>Reconcile the record <span>→</span></button></section>}

        {phase === "reconcile" && intervention && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">06 · RECONCILE</span><h3>Compare the frozen prediction with reality.</h3></div><b>YOUR JUDGEMENT</b></div><p className="arch-m04-panel-copy">Mark each metric as Confirmed or Not confirmed. A wrong prediction is recoverable, but the record must be represented honestly.</p><ResultTable intervention={intervention} /><ReconciliationFields intervention={intervention} checks={checks} onChange={(id, value) => { setChecks(current => ({ ...current, [id]: value })); setFeedback(""); }} />{feedback && <Feedback title="Reconciliation needs revision">{feedback}</Feedback>}<div className="arch-m07-explain-actions"><button type="button" className="arch-primary-button" onClick={commitReconciliation}>Continue to explanation <span>→</span></button><button type="button" className="arch-secondary-button" onClick={rerun}>Rerun with a different change <span>↻</span></button></div></section>}

        {phase === "explain" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">07 · EXPLAIN</span><h3>Keep or revise the original hypothesis.</h3></div><b>FINAL DIAGNOSIS REQUIRED</b></div><p className="arch-m04-panel-copy">Your initial hypothesis is frozen for history and scoring. After seeing the record, make the final diagnosis explicit.</p><div className="arch-m07-final-diagnosis"><span className="arch-overline">POST-REVEAL FINAL DIAGNOSIS</span><p>{finalDiagnosis === diagnosis ? "FROZEN INITIAL HYPOTHESIS · unchanged so far." : "REVISION AFTER EVIDENCE · the final explanation differs from the initial hypothesis."}</p><div className="arch-m04-diagnosis-grid">{M08_DIAGNOSES.map(item => <button type="button" key={item.id} className={`arch-m04-diagnosis ${finalDiagnosis === item.id ? "selected" : ""}`} onClick={() => { setFinalDiagnosis(item.id); setFeedback(""); }} aria-pressed={finalDiagnosis === item.id}><b>{item.label}</b><span>{finalDiagnosis === item.id ? (item.id === diagnosis ? "FROZEN INITIAL HYPOTHESIS · " : "REVISION AFTER EVIDENCE · ") : ""}{item.detail}</span></button>)}</div></div><div className="arch-m04-causal-list">{causalOrder.map((id, index) => { const claim = M08_CAUSAL_CLAIMS.find(item => item.id === id)!; return <div className="arch-m04-causal-row" key={id}><span>{index + 1}</span><b>{claim.label}</b><button type="button" onClick={() => moveCausal(index, -1)} disabled={index === 0} aria-label={`Move claim ${index + 1} up`}>↑</button><button type="button" onClick={() => moveCausal(index, 1)} disabled={index === causalOrder.length - 1} aria-label={`Move claim ${index + 1} down`}>↓</button></div>; })}</div><div className="arch-m05-justifications"><span className="arch-overline">BOUND THE CONCLUSION</span><label className={comparedAlternative ? "selected" : ""}><input type="checkbox" checked={comparedAlternative} onChange={() => { setComparedAlternative(value => !value); setFeedback(""); }} />I compared the memory/GC and I/O alternatives before naming CPU as primary.</label><label className={boundedStatement ? "selected" : ""}><input type="checkbox" checked={boundedStatement} onChange={() => { setBoundedStatement(value => !value); setFeedback(""); }} />This conclusion is specific to the captured evidence and does not claim a universal remedy.</label></div>{feedback && <Feedback title="Explanation needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitExplanation}>Commit explanation <span>→</span></button></section>}

        {phase === "complete" && <section className="arch-panel arch-m06-stage"><span className="arch-overline">M08 · COMPLETE</span><h3>The record supports a bounded CPU explanation.</h3><p>You used all seven signals, made a hypothesis before changing the system, saw the result, and made the final diagnosis explicit. The initial hypothesis remains history; the final explanation must agree with the causal chain.</p><div className="arch-m06-final"><span>CONTROLLED CONCLUSION</span><b>Compute work saturated Java, then queueing raised latency.</b><small>Simplifying compute fits this fixed teaching model. It is not a universal remedy; this mission ends at the bounded evidence-backed experiment.</small></div><div className="arch-score-grid arch-m05-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong></div><div className="arch-metric"><small>DIAGNOSIS</small><strong>{score.diagnosis}/15</strong></div><div className="arch-metric"><small>PREDICTION</small><strong>{score.prediction}/15</strong></div><div className="arch-metric"><small>INTERVENTION</small><strong>{score.interventionFit}/10</strong></div><div className="arch-metric"><small>RECONCILIATION</small><strong>{score.reconciliation}/15</strong></div><div className="arch-metric"><small>CAUSAL MODEL</small><strong>{score.causal}/15</strong></div><div className="arch-metric"><small>ALTERNATIVES</small><strong>{score.alternative}/10</strong></div><div className="arch-metric"><small>EFFICIENCY</small><strong>{score.efficiency}/5</strong></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Seed 20260917 · initial diagnosis frozen · finalDiagnosis reconciled</small></div><div className="arch-next-hook"><span>INCIDENT CLOSED — ANOTHER RESOURCE SIGNAL ARRIVES</span><b>The team now knows how to test a compute hypothesis instead of guessing from “slow.” A later incident will bring a different evidence pattern.</b><p>M08 stops here.</p></div><div className="arch-complete-actions"><button type="button" className="arch-primary-button" onClick={replay}>Replay M08 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab/m07">Return to M07 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: ccc115a/se · `_more/mybook/向淘寶學習網站架構演進/1.3.md` · simulation values are labelled</span></footer>
  </main>;
}
