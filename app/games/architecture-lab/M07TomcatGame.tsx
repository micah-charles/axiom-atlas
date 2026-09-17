"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  M07_CAUSAL_CLAIMS,
  M07_DIAGNOSES,
  M07_EVIDENCE,
  M07_REQUIRED_LINKS,
  M07_RUNS,
  M07_RUN_RESULTS,
  canCompleteM07,
  canUnlockM07Evidence,
  m07ProofEvidenceEnough,
  predictionsCompleteM07,
  resultChecksMatchPredictionsM07,
  scoreM07,
  type M07AlternativeId,
  type M07CausalId,
  type M07Diagnosis,
  type M07EvidenceId,
  type M07PredictionChoice,
  type M07Reconciliation,
  type M07RunFieldId,
  type M07RunId,
} from "./m07-engine";

type Phase = "observe" | "investigate" | "diagnose" | "predict" | "run" | "reveal" | "reconcile" | "explain" | "complete";

const QUALITATIVE_OPTIONS: readonly M07PredictionChoice[] = ["LOW", "MEDIUM", "HIGH", "NOT_OBSERVED"];
const FIELD_LABELS: Record<M07RunFieldId, string> = {
  CPU: "CPU utilisation",
  RUNNABLE_QUEUE: "Runnable queue",
  IO_WAIT: "I/O wait",
  SOCKET_BLOCKED: "Socket-read blocked",
  FULL_GC_DELTA: "Full-GC count change",
  GC_PAUSE: "GC pause",
  HEAP_PRE_GC: "Heap before GC",
  HEAP_POST_GC: "Heap after GC",
  RETENTION_TREND: "Long-window retention trend",
  FILE_IO_BLOCKED: "File-I/O blocked",
};

const INITIAL_CAUSAL_ORDER: M07CausalId[] = ["PRIMARY_DIAGNOSIS", "SLOW_IS_SYMPTOM", "CONSEQUENCE_FOLLOWS", "RESOURCE_EVIDENCE_DISCRIMINATES"];

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Diagnose", "Predict", "Reveal", "Explain", "Score"];
  const index = phase === "observe" ? 0 : phase === "investigate" ? 1 : phase === "diagnose" ? 2 : phase === "predict" || phase === "run" ? 3 : phase === "reveal" || phase === "reconcile" ? 4 : phase === "explain" ? 5 : 6;
  return <div className="arch-lab-progress" aria-label="M07 mission progress">{items.map((item, itemIndex) => <span className={itemIndex <= index ? "active" : ""} key={item}><i>{String(itemIndex + 1).padStart(2, "0")}</i>{item}</span>)}</div>;
}

function Feedback({ title, children, tone = "error" }: { title: string; children: ReactNode; tone?: "error" | "neutral" | "good" }) {
  return <div className={`arch-m04-feedback ${tone}`} role={tone === "error" ? "alert" : "status"}><b>{title}</b><span>{children}</span></div>;
}

function EvidenceCard({ item, inspected, onInspect }: { item: typeof M07_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button type="button" className={`arch-m04-evidence ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-m04-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong><span>{inspected ? item.observation : item.preview}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.provenance}</small></>}
  </button>;
}

type M07BoardPhase = "observe" | "investigate" | "diagnose" | "predict" | "run" | "reveal" | "reconcile" | "explain" | "complete";

const M07_PROBE_SCOPES: readonly { id: M07RunId; label: string; fields: string; lane: string }[] = [
  { id: "RUN_COMPUTE_WAIT_SAMPLE", label: "Compute + wait probe", fields: "CPU · runnable · I/O · socket", lane: "COMPUTE / WAIT" },
  { id: "RUN_GC_RETENTION_SAMPLE", label: "GC + retention probe", fields: "GC · heap pre/post · retention", lane: "MEMORY / GC" },
  { id: "RUN_THREAD_WAIT_SAMPLE", label: "Thread-state probe", fields: "runnable · socket · file I/O · CPU", lane: "WAIT / I/O" },
];

function M07BoardGlyph({ kind }: { kind: "request" | "compute" | "memory" | "wait" | "database" }) {
  return <svg className="arch-m07-board-glyph" viewBox="0 0 48 48" aria-hidden="true">
    {kind === "request" && <><rect x="8" y="13" width="32" height="22" rx="4" /><path d="M14 20h20M14 27h12" /><path d="m28 31 5-5 5 5" /></>}
    {kind === "compute" && <><rect x="9" y="11" width="30" height="26" rx="3" /><path d="M16 18h16M16 24h10M16 30h7" /><path d="M4 17h5M4 24h5M4 31h5M39 17h5M39 24h5M39 31h5" /></>}
    {kind === "memory" && <><path d="M12 14h24v20H12z" /><path d="M17 19h14M17 25h10M17 31h6" /><path d="M8 18h4M8 24h4M8 30h4M36 18h4M36 24h4M36 30h4" /></>}
    {kind === "wait" && <><circle cx="24" cy="24" r="13" /><path d="M24 16v9l6 4" /><path d="M10 11 6 15M38 11l4 4" /></>}
    {kind === "database" && <><ellipse cx="24" cy="14" rx="13" ry="5" /><path d="M11 14v19c0 3 6 5 13 5s13-2 13-5V14" /><path d="M11 23c0 3 6 5 13 5s13-2 13-5" /></>}
  </svg>;
}

function M07PressureLane({ kind, title, subtitle, active, metrics, note }: { kind: "compute" | "memory" | "wait"; title: string; subtitle: string; active: boolean; metrics: string[]; note?: string }) {
  return <article className={`arch-m07-pressure-lane ${active ? "active" : ""}`} aria-label={`${title} evidence lane`}>
    <div className="arch-m07-lane-head"><span className="arch-m07-lane-icon"><M07BoardGlyph kind={kind} /></span><span><b>{title}</b><small>{subtitle}</small></span><em>{active ? "SIGNALS ACTIVE" : "UNRESOLVED"}</em></div>
    <div className="arch-m07-lane-metrics">{metrics.length ? metrics.map(metric => <span key={metric}>{metric}</span>) : <span className="arch-m07-board-lock">measurement hidden · inspect evidence</span>}</div>
    {note && <small className="arch-m07-lane-note">{note}</small>}
  </article>;
}

function M07PressureBoard({ phase, inspected, selectedRun, predictions, resultChecks, completedRuns }: { phase: M07BoardPhase; inspected: M07EvidenceId[]; selectedRun: M07RunId | null; predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>; resultChecks: Partial<Record<M07RunFieldId, M07Reconciliation>>; completedRuns: M07RunId[] }) {
  const has = (id: M07EvidenceId) => inspected.includes(id);
  const afterReveal = phase === "reveal" || phase === "reconcile" || phase === "explain" || phase === "complete";
  const result = selectedRun && afterReveal ? M07_RUN_RESULTS[selectedRun] : null;
  const observed = (field: M07RunFieldId) => result?.[field];
  const computeMetrics = [
    ...(has("E02") ? ["CPU · 100%"] : []),
    ...(has("E04") ? ["RUNNABLE · 3 → 24", "SAMPLE · 96–100%"] : []),
    ...(observed("CPU") ? [`RUN · CPU ${observed("CPU")!.value}`] : []),
  ];
  const memoryMetrics = [
    ...(has("E03") ? ["FULL GC · freeze overlap"] : []),
    ...(has("E05") ? ["HEAP · 68% → 82% → 69%"] : []),
    ...(has("E07") ? ["RETENTION HISTORY · NOT CAPTURED"] : []),
    ...(observed("FULL_GC_DELTA") ? [`RUN · GC ${observed("FULL_GC_DELTA")!.value}`] : []),
  ];
  const waitMetrics = [
    ...(has("E06") ? ["I/O WAIT · 3%", "SOCKET · 2 / 200"] : []),
    ...(observed("IO_WAIT") ? [`RUN · I/O ${observed("IO_WAIT")!.value}`] : []),
    ...(observed("FILE_IO_BLOCKED") ? [`RUN · FILE ${observed("FILE_IO_BLOCKED")!.value}`] : []),
  ];
  const resultLabel = phase === "reveal" || phase === "reconcile" ? "RESULT AVAILABLE" : afterReveal ? "RESULT RECORDED" : phase === "predict" || phase === "run" ? "RESULT HIDDEN" : canUnlockM07Evidence(inspected) ? "EVIDENCE MODEL READY" : inspected.length ? "EVIDENCE IN BOARD" : "MEASUREMENTS LOCKED";
  return <section className="arch-panel arch-m07-pressure-board" aria-label="Five-second request host pressure board">
    <div className="arch-m07-board-head"><div><span className="arch-overline">REQUEST AUTOPSY · HOST PRESSURE BOARD</span><h3>Where does the five-second request spend its time?</h3></div><b>{resultLabel}</b></div>
    <div className="arch-m07-board-path">
      <div className={`arch-m07-request-node ${has("E01") ? "observed" : ""}`}><M07BoardGlyph kind="request" /><span><b>REQUEST</b><small>{has("E01") ? "~50 ms → ~5 s" : "timing sample locked"}</small></span></div>
      <span className="arch-m07-flow-arrow" aria-hidden="true">→</span>
      <div className="arch-m07-host-node"><div className="arch-m07-host-heading"><span><b>APPLICATION HOST</b><small>three resource families compete for support</small></span><span className="arch-m07-host-chip">DB HOST · SEPARATE CONTEXT</span></div><div className="arch-m07-lane-grid">
        <M07PressureLane kind="compute" title="Compute" subtitle="CPU · runnable work" active={has("E02") || has("E04") || Boolean(observed("CPU"))} metrics={computeMetrics} />
        <M07PressureLane kind="memory" title="Memory / GC" subtitle="heap · pauses · retention" active={has("E03") || has("E05") || has("E07") || Boolean(observed("FULL_GC_DELTA"))} metrics={memoryMetrics} note={has("E07") ? "UNKNOWN ≠ ZERO" : undefined} />
        <M07PressureLane kind="wait" title="Wait / I/O" subtitle="socket · file · external wait" active={has("E06") || Boolean(observed("IO_WAIT")) || Boolean(observed("FILE_IO_BLOCKED"))} metrics={waitMetrics} />
      </div></div>
    </div>
    <div className="arch-m07-probe-rail"><div className="arch-m07-probe-rail-head"><span className="arch-overline">DIAGNOSTIC PROBES</span><small>{selectedRun ? "Forecast scope is selected; results stay frozen until reveal." : "Choose a probe to measure a family, not to assume its result."}</small></div><div className="arch-m07-probe-grid">{M07_PROBE_SCOPES.map(probe => <div className={`arch-m07-probe-card ${selectedRun === probe.id ? "selected" : ""} ${completedRuns.includes(probe.id) ? "complete" : ""}`} key={probe.id}><span className="arch-m07-probe-mark">{selectedRun === probe.id ? "●" : completedRuns.includes(probe.id) ? "✓" : "○"}</span><span><b>{probe.label}</b><small>{probe.lane} · {probe.fields}</small></span><em>{completedRuns.includes(probe.id) ? "RECORDED" : selectedRun === probe.id ? "SELECTED" : "SCOPE ONLY"}</em></div>)}</div></div>
    {selectedRun && <div className="arch-m07-forecast-strip"><span className="arch-overline">FORECAST BOARD · {afterReveal ? "FORECAST FROZEN · RESULT RECORDED" : "RESULT HIDDEN UNTIL RUN"}</span>{M07_RUNS.find(item => item.id === selectedRun)!.fields.map(field => { const value = predictions[field]; const record = observed(field); const check = resultChecks[field]; return <div className="arch-m07-forecast-cell" key={field}><b>{FIELD_LABELS[field]}</b><span>{value ? `PREDICT · ${value === "NOT_OBSERVED" ? "NOT OBSERVED" : value}` : "PREDICT · —"}</span>{record && <small>{record.quality === "NOT_CAPTURED" ? "OBSERVED · NOT CAPTURED" : `OBSERVED · ${record.value} → ${record.direction}`}{check ? ` · ${check === "MISSING_EVIDENCE" ? "MISSING" : check === "CONFIRMED" ? "MATCH" : "REVISE"}` : ""}</small>}</div>; })}</div>}
  </section>;
}

function ResultTable({ run }: { run: M07RunId }) {
  const definition = M07_RUNS.find(item => item.id === run)!;
  return <div className="arch-m07-result-table" aria-label={`${definition.label} result`}>
    <div className="arch-m07-result-heading"><span>MEASURE</span><span>OBSERVED</span><span>QUALITY</span></div>
    {definition.fields.map(field => { const result = M07_RUN_RESULTS[run][field]; return <div className="arch-m07-result-row" key={field}><b>{FIELD_LABELS[field]}</b><span>{result.value} <small>{result.unit}</small></span><em>{result.quality === "NOT_CAPTURED" ? "NOT CAPTURED" : result.direction}</em></div>; })}
  </div>;
}

function PredictionFields({ run, predictions, onChange }: { run: M07RunId; predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>; onChange: (field: M07RunFieldId, value: M07PredictionChoice) => void }) {
  const definition = M07_RUNS.find(item => item.id === run)!;
  return <div className="arch-m07-prediction-grid">{definition.fields.map(field => <fieldset className="arch-m07-prediction-card" key={field}><legend><b>{FIELD_LABELS[field]}</b><span>Place one forecast marker before the probe runs.</span></legend><div className="arch-m07-prediction-options">{QUALITATIVE_OPTIONS.map(option => <button type="button" className={predictions[field] === option ? "selected" : ""} key={option} aria-pressed={predictions[field] === option} onClick={() => onChange(field, option)}>{option === "NOT_OBSERVED" ? "NOT OBSERVED" : option}</button>)}</div></fieldset>)}</div>;
}

function ReconciliationFields({ run, checks, onChange }: { run: M07RunId; checks: Partial<Record<M07RunFieldId, M07Reconciliation>>; onChange: (field: M07RunFieldId, value: M07Reconciliation) => void }) {
  const definition = M07_RUNS.find(item => item.id === run)!;
  return <div className="arch-m05-check-grid">{definition.fields.map(field => <fieldset key={field}><legend>{FIELD_LABELS[field]}</legend>{(["CONFIRMED", "NOT_CONFIRMED", "MISSING_EVIDENCE"] as const).map(option => <label className={checks[field] === option ? "selected" : ""} key={option}><input type="radio" value={option} name={`m07-reconcile-${field}`} checked={checks[field] === option} onChange={() => onChange(field, option)} />{option === "MISSING_EVIDENCE" ? "Missing evidence" : option === "CONFIRMED" ? "Confirmed" : "Not confirmed"}</label>)}</fieldset>)}</div>;
}

export default function M07TomcatGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M07EvidenceId[]>([]);
  const [diagnosis, setDiagnosis] = useState<M07Diagnosis | null>(null);
  const [finalDiagnosis, setFinalDiagnosis] = useState<M07Diagnosis | null>(null);
  const [proof, setProof] = useState<M07EvidenceId[]>([]);
  const [selectedRun, setSelectedRun] = useState<M07RunId | null>(null);
  const [predictions, setPredictions] = useState<Partial<Record<M07RunFieldId, M07PredictionChoice>>>({});
  const [resultChecks, setResultChecks] = useState<Partial<Record<M07RunFieldId, M07Reconciliation>>>({});
  const [completedRuns, setCompletedRuns] = useState<M07RunId[]>([]);
  const [reconciled, setReconciled] = useState(false);
  const [causalOrder, setCausalOrder] = useState<M07CausalId[]>(INITIAL_CAUSAL_ORDER);
  const [causalLinks, setCausalLinks] = useState<Partial<Record<keyof typeof M07_REQUIRED_LINKS, M07CausalId>>>({});
  const [alternatives, setAlternatives] = useState<M07AlternativeId[]>([]);
  const [statement, setStatement] = useState(false);
  const [recoveryCycles, setRecoveryCycles] = useState(0);
  const [feedback, setFeedback] = useState("");

  const evidenceOpen = canUnlockM07Evidence(inspected);
  const score = useMemo(() => scoreM07({ inspected, diagnosis, proof, run: selectedRun, predictions, reconciled, causalOrder, causalLinks, alternatives, statement, recoveryCycles }), [inspected, diagnosis, proof, selectedRun, predictions, reconciled, causalOrder, causalLinks, alternatives, statement, recoveryCycles]);
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · NEW INCIDENT" : phase === "investigate" ? `INVESTIGATE · ${inspected.length}/6 REQUIRED` : phase === "diagnose" ? "DIAGNOSE · HYPOTHESIS REQUIRED" : phase === "predict" ? "PREDICT · RESULT HIDDEN" : phase === "run" ? "RUN · DETERMINISTIC CHECK" : phase === "reveal" ? "REVEAL · RESULT AVAILABLE" : phase === "reconcile" ? "RECONCILE · COMPARE THE RECORD" : "EXPLAIN · BUILD THE CAUSE";

  function inspectEvidence(id: M07EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    setPhase(current => current === "observe" ? "investigate" : current);
    setFeedback("");
  }

  function commitEvidence() {
    if (!evidenceOpen) {
      setFeedback("Inspect at least one signal from each resource family before diagnosing.");
      return;
    }
    setFeedback("");
    setPhase("diagnose");
  }

  function toggleProof(id: M07EvidenceId) {
    setProof(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitDiagnosis() {
    if (!m07ProofEvidenceEnough(diagnosis, proof, inspected)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Choose one complete hypothesis and cite at least three distinct inspected cards, including E01 and two resource-specific signals.");
      return;
    }
    setFeedback("");
    setPhase("predict");
  }

  function chooseRun(run: M07RunId) {
    setSelectedRun(run);
    setPredictions({});
    setResultChecks({});
    setReconciled(false);
    setFeedback("");
  }

  function commitPredictions() {
    if (!selectedRun || !predictionsCompleteM07(selectedRun, predictions)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Predict every field before the diagnostic result is revealed. A wrong complete prediction can still run.");
      return;
    }
    setFeedback("");
    setPhase("run");
  }

  function runDiagnostic() {
    if (!selectedRun) return;
    setCompletedRuns(current => current.includes(selectedRun) ? current : [...current, selectedRun]);
    setPhase("reveal");
  }

  function commitReconciliation() {
    if (!selectedRun || !resultChecksMatchPredictionsM07(selectedRun, predictions, resultChecks)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Compare each frozen prediction with the observed direction. Missing data is not the same as a low value.");
      return;
    }
    setReconciled(true);
    setFinalDiagnosis(diagnosis);
    setFeedback("");
    setPhase("explain");
  }

  function runAnotherCheck() {
    setRecoveryCycles(current => current + 1);
    setSelectedRun(null);
    setPredictions({});
    setResultChecks({});
    setReconciled(false);
    setFinalDiagnosis(null);
    setFeedback("");
    setPhase("predict");
  }

  function moveCausal(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= causalOrder.length) return;
    setCausalOrder(current => { const copy = [...current]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy; });
    setFeedback("");
  }

  function toggleAlternative(id: M07AlternativeId) {
    setAlternatives(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitExplanation() {
    if (!canCompleteM07({ inspected, diagnosis, finalDiagnosis, proof, run: selectedRun, predictions, reconciled, causalOrder, causalLinks, alternatives, statement })) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Set a final diagnosis that agrees with the causal chain, then complete the symptom → evidence → diagnosis → consequence chain and compare an alternative.");
      return;
    }
    setFeedback("");
    setPhase("complete");
  }

  function replay() {
    setPhase("observe"); setInspected([]); setDiagnosis(null); setFinalDiagnosis(null); setProof([]); setSelectedRun(null); setPredictions({}); setResultChecks({}); setCompletedRuns([]); setReconciled(false); setCausalOrder([...INITIAL_CAUSAL_ORDER]); setCausalLinks({}); setAlternatives([]); setStatement(false); setRecoveryCycles(0); setFeedback("");
  }

  return <main className="arch-lab-shell arch-m07-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M07 — FIVE-SECOND REQUEST</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab/m06">M06 <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "07"}</span><h1>{phase === "complete" ? "Slow is a symptom." : "Five seconds is a clue."}</h1><p>Campaign warm-up has started. Customers report that pages which were normally fast are now taking seconds.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Inspect the host, distinguish competing evidence, and explain what the record supports.</b></div><div className="arch-brief-facts"><span><i>01</i> ~50 ms → ~5 s</span><span><i>02</i> DB remains on a separate host</span><span><i>03</i> evidence before diagnosis</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>The incident shape is source-backed. Exact counters, run results and scores are labelled deterministic teaching simulation.</span></div></aside>
      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phase === "complete" ? "The record supports a bounded explanation." : phase === "diagnose" ? "Which explanation currently best fits?" : phase === "explain" ? "Build the causal explanation." : "A slow symptom has arrived."}</h2></div><span className="arch-date-chip">M07 · SOURCE 1.3</span></div>
        <M07PressureBoard phase={phase} inspected={inspected} selectedRun={selectedRun} predictions={predictions} resultChecks={resultChecks} completedRuns={completedRuns} />

        {(phase === "observe" || phase === "investigate") && <>
          <section className="arch-m05-observe-grid"><div className="arch-panel arch-m05-incident"><span className="arch-overline">NEW INCIDENT · SOURCE-BACKED SHAPE</span><h3>Campaign warm-up has changed the request path.</h3><div className="arch-m06-source-pair"><div><span>BEFORE</span><b>~50 ms</b><small>normally fast request</small></div><div><span>DURING WARM-UP</span><b>~5 s</b><small>customers feel the slowdown</small></div></div><p>Three evidence families can produce the shared symptom “slow”. Inspect the host before you commit a diagnosis.</p><button type="button" className="arch-primary-button" onClick={() => setPhase("investigate")}>Inspect host evidence <span>→</span></button></div><div className="arch-panel arch-m05-case"><span className="arch-overline">M06 CONTINUITY</span><h3>One application path. A new performance question.</h3><p>The database remains on its separate host. This incident begins on the application side of that boundary; do not assume the cause.</p><div className="arch-m04-gate-note">DIAGNOSIS LOCKED · RESOURCE EVIDENCE REQUIRED</div></div></section>
          <section className="arch-panel arch-m04-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the host evidence.</h3></div><b className={evidenceOpen ? "gate-open" : ""}>{evidenceOpen ? `${inspected.length}/7 INSPECTED · GATE OPEN` : `${inspected.length}/6 REQUIRED`}</b></div><p className="arch-m04-panel-copy">Inspect CPU, memory/GC and wait/I/O signals. The diagnosis and run results stay hidden until the cross-family evidence gate opens.</p><div className="arch-m04-evidence-grid">{M07_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{!evidenceOpen && <div className="arch-m04-lock-note" role="status">Evidence gate locked · inspect E01–E06 across the signal families.</div>}{evidenceOpen && <button type="button" className="arch-primary-button" onClick={commitEvidence}>Form a diagnosis <span>→</span></button>}{feedback && <Feedback title="Investigation feedback">{feedback}</Feedback>}</section>
        </>}

        {phase === "diagnose" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">02 · FORM A DIAGNOSIS</span><h3>Which explanation currently best fits?</h3></div><b>PROOF REQUIRED</b></div><p className="arch-m04-panel-copy">Choose one complete hypothesis and attach inspected proof. The result is not revealed yet, and a wrong hypothesis remains playable.</p><div className="arch-m04-diagnosis-grid">{M07_DIAGNOSES.map(item => <button type="button" key={item.id} className={`arch-m04-diagnosis ${diagnosis === item.id ? "selected" : ""}`} onClick={() => { setDiagnosis(item.id); setFeedback(""); }} aria-pressed={diagnosis === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div><div className="arch-m04-proof"><span className="arch-overline">CITE INSPECTED PROOF</span>{M07_EVIDENCE.slice(0, 6).map(item => <button type="button" key={item.id} className={proof.includes(item.id) ? "selected" : ""} onClick={() => toggleProof(item.id)} aria-pressed={proof.includes(item.id)}>{item.id} · {item.label}{!inspected.includes(item.id) ? " · inspect first" : ""}</button>)}</div>{feedback && <Feedback title="Hypothesis needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitDiagnosis}>Commit hypothesis <span>→</span></button></section>}

        {phase === "predict" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">03 · PREDICT / CHOOSE A RUN</span><h3>Choose one diagnostic run, then predict its fields.</h3></div><b>RESULT HIDDEN</b></div><p className="arch-m04-panel-copy">Select a measurement family. Commit every qualitative prediction before the result appears. A wrong complete prediction can still run.</p><div className="arch-m05-policy-grid">{M07_RUNS.map(run => <button type="button" className={`arch-m05-policy ${selectedRun === run.id ? "selected" : ""}`} key={run.id} onClick={() => chooseRun(run.id)} aria-pressed={selectedRun === run.id}><b>{run.label}</b><span>{run.description}{completedRuns.includes(run.id) ? " · previously run; a rerun clears stale reconciliation" : ""}</span></button>)}</div>{selectedRun && <><div className="arch-m07-run-contract"><span>COMMIT BEFORE REVEAL</span><b>{M07_RUNS.find(item => item.id === selectedRun)!.label}</b><small>Seed 20260916 · exact result remains hidden</small></div><PredictionFields run={selectedRun} predictions={predictions} onChange={(field, value) => { setPredictions(current => ({ ...current, [field]: value })); setFeedback(""); }} /></>}{feedback && <Feedback title="Prediction needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitPredictions}>Commit prediction <span>→</span></button></section>}

        {phase === "run" && selectedRun && <section className="arch-panel arch-m06-stage"><span className="arch-overline">04 · RUN · TEACHING SIMULATION</span><h3>Run the diagnostic check.</h3><p className="arch-m04-panel-copy">The result is deterministic teaching simulation. It will reveal observations, not a universal production remedy.</p><div className="arch-m07-run-contract"><span>FIXED EXPERIMENT IDENTITY</span><b>Seed 20260916 · 30-second incident window · 5-second samples</b><small>Source-backed incident shape; exact telemetry is simulated.</small></div><button type="button" className="arch-primary-button" onClick={runDiagnostic}>Run diagnostic check <span>→</span></button></section>}

        {phase === "reveal" && selectedRun && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">05 · REVEAL</span><h3>The measurement is now visible.</h3></div><b>RESULT REVEALED</b></div><p className="arch-m04-panel-copy">Read the observed value and quality. Reconciliation comes next; your original prediction remains frozen.</p><ResultTable run={selectedRun} /><div className="arch-m06-note">Observed values are labelled teaching simulation. NOT CAPTURED is missing evidence, not zero.</div><button type="button" className="arch-primary-button" onClick={() => setPhase("reconcile")}>Reconcile the record <span>→</span></button></section>}

        {phase === "reconcile" && selectedRun && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">06 · RECONCILE</span><h3>Compare the frozen prediction with reality.</h3></div><b>YOUR JUDGEMENT</b></div><p className="arch-m04-panel-copy">For each field, mark Confirmed, Not confirmed or Missing evidence. The UI does not auto-select the answer.</p><ResultTable run={selectedRun} /><ReconciliationFields run={selectedRun} checks={resultChecks} onChange={(field, value) => { setResultChecks(current => ({ ...current, [field]: value })); setFeedback(""); }} />{feedback && <Feedback title="Reconciliation needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitReconciliation}>Continue to explanation <span>→</span></button></section>}

        {phase === "explain" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">07 · EXPLAIN</span><h3>Separate symptom, evidence, diagnosis and consequence.</h3></div><b>CAUSAL BUILDER</b></div><p className="arch-m04-panel-copy">Order the causal claims, attach the evidence that supports them, compare an alternative, and state the limit of the conclusion.</p><div className="arch-m07-final-diagnosis"><span className="arch-overline">FINAL DIAGNOSIS AFTER EVIDENCE</span><p>The original hypothesis remains frozen for scoring. Confirm it or revise it after seeing the diagnostic result.</p><div className="arch-m04-diagnosis-grid">{M07_DIAGNOSES.map(item => <button type="button" key={item.id} className={`arch-m04-diagnosis ${finalDiagnosis === item.id ? "selected" : ""}`} onClick={() => { setFinalDiagnosis(item.id); setFeedback(""); }} aria-pressed={finalDiagnosis === item.id}><b>{item.label}</b><span>{finalDiagnosis === item.id && item.id !== diagnosis ? "REVISION AFTER EVIDENCE · " : finalDiagnosis === item.id ? "FROZEN INITIAL HYPOTHESIS · " : ""}{item.detail}</span></button>)}</div></div><div className="arch-m04-causal-list">{causalOrder.map((id, index) => { const claim = M07_CAUSAL_CLAIMS.find(item => item.id === id)!; return <div className="arch-m04-causal-row" key={id}><span>{index + 1}</span><b>{claim.label}</b><button type="button" onClick={() => moveCausal(index, -1)} disabled={index === 0} aria-label={`Move claim ${index + 1} up`}>↑</button><button type="button" onClick={() => moveCausal(index, 1)} disabled={index === causalOrder.length - 1} aria-label={`Move claim ${index + 1} down`}>↓</button></div>; })}</div><div className="arch-m04-link-builder"><span className="arch-overline">ATTACH EVIDENCE</span>{(Object.keys(M07_REQUIRED_LINKS) as (keyof typeof M07_REQUIRED_LINKS)[]).map(id => <label key={id}>{id} supports<select aria-label={`Evidence link for ${id}`} value={causalLinks[id] ?? ""} onChange={event => { setCausalLinks(current => ({ ...current, [id]: event.target.value as M07CausalId })); setFeedback(""); }}><option value="">Choose claim</option>{M07_CAUSAL_CLAIMS.map(claim => <option key={claim.id} value={claim.id}>{claim.label}</option>)}</select></label>)}</div><div className="arch-m05-justifications"><span className="arch-overline">COMPARE AN ALTERNATIVE</span><label className={alternatives.includes("IO_WEAKENED") ? "selected" : ""}><input type="checkbox" checked={alternatives.includes("IO_WEAKENED")} onChange={() => toggleAlternative("IO_WEAKENED")} />Low I/O wait and few blocked threads weaken I/O-primary.</label><label className={alternatives.includes("MEMORY_UNRESOLVED") ? "selected" : ""}><input type="checkbox" checked={alternatives.includes("MEMORY_UNRESOLVED")} onChange={() => toggleAlternative("MEMORY_UNRESOLVED")} />Full GC is real, but long-window retention evidence remains missing.</label><label className={statement ? "selected" : ""}><input type="checkbox" checked={statement} onChange={() => { setStatement(value => !value); setFeedback(""); }} />Slow alone is not a diagnosis; this conclusion is specific to the captured evidence.</label></div>{feedback && <Feedback title="Explanation needs revision">{feedback}</Feedback>}<div className="arch-m07-explain-actions"><button type="button" className="arch-primary-button" onClick={commitExplanation}>Commit explanation <span>→</span></button>{selectedRun && <button type="button" className="arch-secondary-button" onClick={runAnotherCheck}>Run one more discriminating check <span>↻</span></button>}</div></section>}

        {phase === "complete" && <section className="arch-panel arch-m06-stage"><span className="arch-overline">M07 · COMPLETE</span><h3>The record supports a bounded explanation.</h3><p>“Slow” was the symptom. Resource-specific evidence let you distinguish the primary signal, the concurrent pause and the missing evidence instead of turning one metric into a universal remedy.</p><div className="arch-m05-final"><span>CONTROLLED CONCLUSION</span><b>Slow alone is not a diagnosis.</b><small>Compute saturation is primary in this deterministic incident; Full GC is consequential but its deeper memory cause is not established here. Later remediation remains outside this investigation.</small></div><div className="arch-score-grid arch-m05-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong></div><div className="arch-metric"><small>DIAGNOSIS</small><strong>{score.diagnosis}/15</strong></div><div className="arch-metric"><small>PREDICTION</small><strong>{score.prediction}/15</strong></div><div className="arch-metric"><small>RUN DISCIPLINE</small><strong>{score.runDiscipline}/10</strong></div><div className="arch-metric"><small>RECONCILIATION</small><strong>{score.reconciliation}/15</strong></div><div className="arch-metric"><small>ALTERNATIVES</small><strong>{score.alternatives}/10</strong></div><div className="arch-metric"><small>CAUSAL MODEL</small><strong>{score.causal}/15</strong></div><div className="arch-metric"><small>EFFICIENCY</small><strong>{score.efficiency}/5</strong></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Seed 20260916 · one diagnostic investigation · neutral next-incident hook</small></div><div className="arch-next-hook"><span>INCIDENT CLOSED — ANOTHER SIGNAL ARRIVES</span><b>The team has learned that “slow” needs evidence before a diagnosis. Later, another application-host alert arrives with a different evidence pattern.</b><p>M07 stops here.</p></div><div className="arch-complete-actions"><button type="button" className="arch-primary-button" onClick={replay}>Replay M07 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab/m06">Return to M06 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: ccc115a/se · `_more/mybook/向淘寶學習網站架構演進/1.3.md` · simulation values are labelled</span></footer>
  </main>;
}
