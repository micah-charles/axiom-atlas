"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  M06_BASELINE_PREDICTIONS,
  M06_BASELINE_RESULT,
  baselineResultChecksMatchPredictionsM06,
  M06_CAUSAL_CLAIMS,
  M06_CHANGED_PREDICTIONS,
  M06_EVIDENCE,
  M06_REQUIRED_CANDIDATES,
  M06_REQUIRED_LINKS,
  M06_RESULT_CHECKS,
  M06_RESULTS,
  canCompleteM06,
  canUnlockM06Evidence,
  diagnosisProofIsEnoughM06,
  m06ProofEvidenceEnough,
  predictionsCompleteM06,
  resultChecksMatchPredictionsM06,
  scoreM06,
  type M06Candidate,
  type M06CausalId,
  type M06Diagnosis,
  type M06EvidenceId,
  type M06PredictionChoice,
  type M06PredictionId,
  type M06ResultCheckId,
  type M06ResultChoice,
  type M06Tradeoff,
} from "./m06-engine";

type Phase = "observe" | "investigate" | "diagnose" | "predict-baseline" | "reveal-baseline" | "configure" | "predict-change" | "run-change" | "reveal-change" | "explain" | "complete";

const INITIAL_CAUSAL_ORDER: M06CausalId[] = [
  "DB_CAPACITY_LIMITS_USEFUL_CONCURRENCY",
  "CONCURRENT_DB_DEMAND_ARRIVES",
  "EXCESS_WORK_QUEUES_AT_A_BOUNDARY",
  "APP_POOL_ADMITS_DB_WORK",
  "QUEUEING_AND_CONTENTION_CHANGE_LATENCY",
  "THROUGHPUT_HAS_A_USEFUL_REGION_NOT_A_MONOTONIC_MAXIMUM",
  "TOO_MUCH_DB_CONCURRENCY_INCREASES_CONTENTION",
];

const DIAGNOSES: { id: M06Diagnosis; label: string; detail: string }[] = [
  { id: "CONNECTION_ADMISSION_MISMATCH", label: "Connection admission mismatch", detail: "The app-pool admission level and useful DB concurrency do not match." },
  { id: "M05_NETWORK_WAITING", label: "The M05 network dependency is still down", detail: "The earlier network-waiting incident explains every candidate result." },
  { id: "WEB_CPU_EXHAUSTION", label: "Web CPU exhaustion", detail: "The Web host is the only bottleneck in this experiment." },
  { id: "DB_CEILING_IS_THE_ONLY_LIMIT", label: "The DB ceiling is the only limit", detail: "Using more of the configured ceiling must always improve throughput." },
];

const QUALITATIVE_OPTIONS: M06PredictionChoice[] = ["NONE", "LOW", "MEDIUM", "HIGH"];

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Diagnose", "Predict", "Run", "Explain", "Score"];
  const index = phase === "observe" ? 0 : phase === "investigate" ? 1 : phase === "diagnose" ? 2 : ["predict-baseline", "predict-change"].includes(phase) ? 3 : ["reveal-baseline", "configure", "run-change", "reveal-change"].includes(phase) ? 4 : phase === "explain" ? 5 : 6;
  return <div className="arch-lab-progress" aria-label="M06 mission progress">{items.map((item, itemIndex) => <span className={itemIndex <= index ? "active" : ""} key={item}><i>{String(itemIndex + 1).padStart(2, "0")}</i>{item}</span>)}</div>;
}

function Feedback({ title, children }: { title: string; children: ReactNode }) {
  return <div className="arch-m04-feedback" role="alert"><b>{title}</b><span>{children}</span></div>;
}

function EvidenceCard({ item, inspected, onInspect }: { item: typeof M06_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button type="button" className={`arch-m04-evidence ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-m04-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong><span>{inspected ? item.observation : item.preview}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.provenance}</small></>}
  </button>;
}

function PredictionCard({ label, prompt, value, onChange }: { label: string; prompt: string; value?: M06PredictionChoice; onChange: (value: M06PredictionChoice) => void }) {
  return <label className="arch-m06-prediction-card"><span className="arch-overline">{label}</span><b>{prompt}</b><select value={value ?? ""} onChange={event => onChange(event.target.value as M06PredictionChoice)} aria-label={prompt}><option value="">Choose direction</option>{QUALITATIVE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function CandidateLabel({ candidate }: { candidate: M06Candidate }) {
  return candidate === "SMALL_POOL" ? "SMALL · 10 connections" : candidate === "FIT_POOL" ? "FIT · 60 connections" : "LARGE · 300 connections";
}

function ResultTable({ candidate, baseline = false }: { candidate?: M06Candidate; baseline?: boolean }) {
  const result = baseline ? M06_BASELINE_RESULT : M06_RESULTS[candidate!];
  return <div className="arch-m06-result-table" aria-label={baseline ? "Baseline result" : `${candidate} result`}>
    <div><span>APP WAIT</span><b>{result.appWait} req</b></div>
    <div><span>DB QUEUE</span><b>{result.dbContention} req</b></div>
    <div><span>DB CPU</span><b>{result.dbCpu}%</b></div>
    <div><span>THROUGHPUT</span><b>{result.throughput} req/s</b></div>
    <div><span>P95</span><b>{result.p95} ms</b></div>
    <div><span>ERRORS</span><b>{result.errors}%</b></div>
  </div>;
}

export default function M06ConnectionGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M06EvidenceId[]>([]);
  const [diagnosis, setDiagnosis] = useState<M06Diagnosis | null>(null);
  const [proof, setProof] = useState<M06EvidenceId[]>([]);
  const [baselinePredictions, setBaselinePredictions] = useState<Partial<Record<M06PredictionId, M06PredictionChoice>>>({});
  const [baselineResultChecks, setBaselineResultChecks] = useState<Partial<Record<M06ResultCheckId, M06ResultChoice>>>({});
  const [baselineReconciled, setBaselineReconciled] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<M06Candidate | null>(null);
  const [candidatePredictions, setCandidatePredictions] = useState<Partial<Record<M06Candidate, Partial<Record<M06PredictionId, M06PredictionChoice>>>> >({});
  const [runs, setRuns] = useState<M06Candidate[]>([]);
  const [resultChecks, setResultChecks] = useState<Partial<Record<M06Candidate, Partial<Record<M06ResultCheckId, M06ResultChoice>>>> >({});
  const [reconciled, setReconciled] = useState<Partial<Record<M06Candidate, boolean>>>({});
  const [causalOrder, setCausalOrder] = useState<M06CausalId[]>(INITIAL_CAUSAL_ORDER);
  const [causalLinks, setCausalLinks] = useState<Partial<Record<keyof typeof M06_REQUIRED_LINKS, M06CausalId>>>({});
  const [tradeoff, setTradeoff] = useState<M06Tradeoff | null>(null);
  const [recoveryCycles, setRecoveryCycles] = useState(0);
  const [feedback, setFeedback] = useState("");

  const evidenceOpen = canUnlockM06Evidence(inspected);
  const score = useMemo(() => scoreM06({ inspected, diagnosis, proof, baselinePredictions, candidatePredictions, runs, reconciled, causalOrder, causalLinks, tradeoff, recoveryCycles }), [inspected, diagnosis, proof, baselinePredictions, candidatePredictions, runs, reconciled, causalOrder, causalLinks, tradeoff, recoveryCycles]);
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · INCIDENT OPEN" : phase === "investigate" ? `INVESTIGATE · ${inspected.length}/7 INSPECTED` : phase === "diagnose" ? "DIAGNOSE · PROOF REQUIRED" : phase === "predict-baseline" ? "PREDICT · BASELINE HIDDEN" : phase === "reveal-baseline" ? "REVEAL · BASELINE RESULT" : phase === "configure" ? "INVESTIGATE · CHANGE ONE THING" : phase === "predict-change" ? "PREDICT · CANDIDATE HIDDEN" : phase === "run-change" ? "RUN · CONTROLLED EXPERIMENT" : phase === "reveal-change" ? "REVEAL · RECONCILE" : "EXPLAIN · BUILD THE MODEL";
  const phaseTitle = phase === "complete" ? "The useful region is not the biggest number." : phase === "observe" || phase === "investigate" ? "Two limits, one record." : phase === "diagnose" ? "Where is the mismatch?" : phase === "predict-baseline" ? "Predict before the baseline runs." : phase === "reveal-baseline" ? "The baseline is a reference, not an answer." : phase === "configure" ? "Choose one controlled change." : phase === "predict-change" ? "What will this candidate do?" : phase === "run-change" ? "Run the experiment." : phase === "reveal-change" ? "Compare your prediction with the record." : phase === "explain" ? "Explain the trade-off." : "";

  function inspectEvidence(id: M06EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    setPhase(current => current === "observe" ? "investigate" : current);
  }

  function commitEvidence() {
    if (!evidenceOpen) {
      setFeedback("Inspect all seven unique evidence cards before diagnosing. The result table remains hidden.");
      return;
    }
    setFeedback("");
    setPhase("diagnose");
  }

  function toggleProof(id: M06EvidenceId) {
    setProof(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitDiagnosis() {
    if (!diagnosis || !m06ProofEvidenceEnough(proof, inspected)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Cite inspected E01 and E02, plus one queue/pressure card and one outcome card before committing.");
      return;
    }
    if (!diagnosisProofIsEnoughM06(diagnosis, proof, inspected)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("This diagnosis does not explain both admission and DB pressure. Re-read the evidence before choosing an intervention.");
      return;
    }
    setFeedback("");
    setPhase("predict-baseline");
  }

  function commitBaselinePrediction() {
    if (!predictionsCompleteM06(baselinePredictions)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Choose a direction for all five baseline measures before running the experiment. Your hypothesis will be checked against the revealed record afterward.");
      return;
    }
    setBaselineResultChecks({});
    setBaselineReconciled(false);
    setFeedback("");
    setPhase("reveal-baseline");
  }

  function setBaselineCheck(id: M06ResultCheckId, value: M06ResultChoice) {
    setBaselineResultChecks(current => ({ ...current, [id]: value }));
    setFeedback("");
  }

  function commitBaselineReconciliation() {
    if (!baselineResultChecksMatchPredictionsM06(baselinePredictions, baselineResultChecks)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Mark each baseline metric Confirmed when the record supports your prediction, or Not confirmed when it does not. Reconcile every metric before continuing.");
      return;
    }
    setBaselineReconciled(true);
    setFeedback("");
    setPhase("configure");
  }

  function chooseCandidate(candidate: M06Candidate) {
    setSelectedCandidate(candidate);
    setReconciled(current => ({ ...current, [candidate]: false }));
    setResultChecks(current => ({ ...current, [candidate]: {} }));
    setFeedback("");
    setPhase("predict-change");
  }

  function commitCandidatePrediction() {
    if (!selectedCandidate || !predictionsCompleteM06(candidatePredictions[selectedCandidate] ?? {})) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Choose a direction for all five candidate measures before running the experiment. Your hypothesis will be checked against the revealed record afterward.");
      return;
    }
    setFeedback("");
    setPhase("run-change");
  }

  function runCandidate() {
    if (!selectedCandidate) return;
    setRuns(current => current.includes(selectedCandidate) ? current : [...current, selectedCandidate]);
    setPhase("reveal-change");
  }

  function setCheck(id: M06ResultCheckId, value: M06ResultChoice) {
    if (!selectedCandidate) return;
    setResultChecks(current => ({ ...current, [selectedCandidate]: { ...(current[selectedCandidate] ?? {}), [id]: value } }));
    setFeedback("");
  }

  function commitReconciliation() {
    if (!selectedCandidate || !resultChecksMatchPredictionsM06(selectedCandidate, candidatePredictions[selectedCandidate] ?? {}, resultChecks[selectedCandidate] ?? {})) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Mark each metric Confirmed when the record supports your prediction, or Not confirmed when it does not. Reconcile every metric before continuing.");
      return;
    }
    setReconciled(current => ({ ...current, [selectedCandidate]: true }));
    setFeedback("");
    setPhase(M06_REQUIRED_CANDIDATES.every(candidate => runs.includes(candidate)) ? "explain" : "configure");
  }

  function moveCausal(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= causalOrder.length) return;
    setCausalOrder(current => {
      const copy = [...current];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
    setFeedback("");
  }

  function commitExplanation() {
    if (!canCompleteM06({ inspected, diagnosis, proof, baselinePredictions, baselineReconciled, candidatePredictions, runs, reconciled, causalOrder, causalLinks, tradeoff })) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Complete the seven-link chain, attach E01–E06, and state that FIT is best only in this fixed teaching model.");
      return;
    }
    setFeedback("");
    setPhase("complete");
  }

  function replay() {
    setPhase("observe");
    setInspected([]);
    setDiagnosis(null);
    setProof([]);
    setBaselinePredictions({});
    setBaselineResultChecks({});
    setBaselineReconciled(false);
    setSelectedCandidate(null);
    setCandidatePredictions({});
    setRuns([]);
    setResultChecks({});
    setReconciled({});
    setCausalOrder([...INITIAL_CAUSAL_ORDER]);
    setCausalLinks({});
    setTradeoff(null);
    setRecoveryCycles(0);
    setFeedback("");
  }

  return <main className="arch-lab-shell arch-m06-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · THE FIRST CAPACITY TRADE-OFF</small><strong>M06 — FIFTY CONNECTIONS OR FIVE HUNDRED?</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab/m05">M05 <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "06"}</span><h1>{phase === "complete" ? "The useful region is not the biggest number." : "Two limits. One investigation."}</h1><p>The DB configuration example says 500. The application example says 50. Determine how the limits relate and what changes when one admission setting changes.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Inspect the evidence, form a diagnosis, then test one pool-size change and explain what the record shows.</b></div><div className="arch-brief-facts"><span><i>01</i> inspect all seven cards</span><span><i>02</i> predict before every reveal</span><span><i>03</i> compare 10 · 60 · 300</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>50 and 500 are source examples. Workload, metrics and results are labelled teaching simulation, not production advice.</span></div></aside>
      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phaseTitle}</h2></div><span className="arch-date-chip">M06 · SOURCE 1.2</span></div>

        {(phase === "observe" || phase === "investigate") && <>
          <section className="arch-m05-observe-grid"><div className="arch-panel arch-m05-incident"><span className="arch-overline">FICTIONAL OPERATIONS REPORT</span><h3>“The shop is healthy at low demand, but a burst of DB work makes the system hesitate.”</h3><div className="arch-m06-source-pair"><div><span>SOURCE EXAMPLE</span><b>app pool: 50</b><small>jdbc.maxPoolSize</small></div><div><span>SOURCE EXAMPLE</span><b>DB ceiling: 500</b><small>MySQL max_connections</small></div></div><p>The relationship between these limits is the question. Inspect the evidence before choosing a pool size.</p><button type="button" className="arch-primary-button" onClick={() => setPhase("investigate")}>Begin investigation <span>→</span></button></div><div className="arch-panel arch-m05-case"><span className="arch-overline">M05 CONTINUITY</span><h3>One network boundary. A new question.</h3><p>The Web and DB remain separate hosts. M06 changes one admission setting only; it does not redesign the earlier dependency policy.</p><div className="arch-m04-gate-note">RESULTS LOCKED · E01–E07 REQUIRED</div></div></section>
          <section className="arch-panel arch-m04-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the evidence case.</h3></div><b className={evidenceOpen ? "gate-open" : ""}>{inspected.length}/7 INSPECTED</b></div><p className="arch-m04-panel-copy">Inspect every unique card. The candidate table, diagnosis and winning pool remain hidden until the evidence gate opens.</p><div className="arch-m04-evidence-grid">{M06_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{!evidenceOpen && <div className="arch-m04-lock-note" role="status">Evidence gate locked · inspect E01–E07.</div>}{evidenceOpen && <button type="button" className="arch-primary-button" onClick={commitEvidence}>Diagnose the mismatch <span>→</span></button>}</section>
        </>}

        {phase === "diagnose" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">02 · DIAGNOSE</span><h3>Where is the mismatch?</h3></div><b>PROOF REQUIRED</b></div><p className="arch-m04-panel-copy">Choose a diagnosis and cite inspected evidence. You need E01 + E02, one pressure/queue card and one outcome card.</p><div className="arch-m04-diagnosis-grid">{DIAGNOSES.map(item => <button type="button" key={item.id} className={`arch-m04-diagnosis ${diagnosis === item.id ? "selected" : ""}`} onClick={() => { setDiagnosis(item.id); setFeedback(""); }} aria-pressed={diagnosis === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div><div className="arch-m04-proof"><span className="arch-overline">CITE INSPECTED PROOF</span>{M06_EVIDENCE.slice(0, 6).map(item => <button type="button" key={item.id} className={proof.includes(item.id) ? "selected" : ""} onClick={() => toggleProof(item.id)} aria-pressed={proof.includes(item.id)}>{item.id} · {item.label}{!inspected.includes(item.id) ? " · inspect first" : ""}</button>)}</div>{feedback && <Feedback title="Diagnosis needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitDiagnosis}>Commit diagnosis <span>→</span></button></section>}

        {phase === "predict-baseline" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">03 · PREDICT BASELINE</span><h3>Predict before the 50-connection baseline runs.</h3></div><b>RESULT HIDDEN</b></div><p className="arch-m04-panel-copy">Use the seven cards to predict direction, not false precision. The baseline result will appear only after all five predictions are committed; they will be compared with the record afterward.</p><div className="arch-m06-prediction-grid">{M06_BASELINE_PREDICTIONS.map(item => <PredictionCard key={item.id} label={item.label} prompt={item.prompt} value={baselinePredictions[item.id]} onChange={value => { setBaselinePredictions(current => ({ ...current, [item.id]: value })); setFeedback(""); }} />)}</div>{feedback && <Feedback title="Baseline prediction needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitBaselinePrediction}>Commit baseline predictions <span>→</span></button></section>}

        {phase === "reveal-baseline" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">04 · REVEAL BASELINE</span><h3>Reconcile the baseline with your hypothesis.</h3></div><b>TEACHING SIMULATION</b></div><p className="arch-m04-panel-copy">The record is visible now. Mark each check as Confirmed or Not confirmed; the baseline prediction remains the hypothesis you made before the reveal.</p><ResultTable baseline /><div className="arch-m06-note">Fixed workload: 240 requests · 12 seconds · offered demand 20 req/s · seed 20260916 · all values are teaching simulation.</div><div className="arch-m06-check-grid">{M06_RESULT_CHECKS.map(check => <fieldset key={check.id}><legend>{check.label}</legend>{(["CONFIRMED", "NOT_CONFIRMED"] as const).map(option => <label key={option} className={baselineResultChecks[check.id] === option ? "selected" : ""}><input type="radio" value={option} name={`baseline-${check.id}`} checked={baselineResultChecks[check.id] === option} onChange={() => setBaselineCheck(check.id, option)} />{option === "CONFIRMED" ? "Confirmed" : "Not confirmed"}</label>)}</fieldset>)}</div>{feedback && <Feedback title="Baseline needs reconciliation">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitBaselineReconciliation}>Continue to pool candidates <span>→</span></button></section>}

        {phase === "configure" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">05 · CHANGE ONE CONFIGURATION</span><h3>Choose a candidate to test.</h3></div><b>{runs.length}/3 RUN</b></div><p className="arch-m04-panel-copy">Only the application pool changes. Workload, DB ceiling, topology and M05 policy remain fixed. Run all three candidates before explaining the trade-off.</p><div className="arch-m05-policy-grid">{M06_REQUIRED_CANDIDATES.map(candidate => <button type="button" key={candidate} className={`arch-m05-policy ${runs.includes(candidate) ? "selected" : ""}`} onClick={() => chooseCandidate(candidate)} aria-pressed={runs.includes(candidate)}><b><CandidateLabel candidate={candidate} /></b><span>{runs.includes(candidate) ? "Already run · replay it if your reconciliation changed." : "Select this one, predict five directions, then reveal the result."}</span></button>)}</div><div className="arch-m06-note">The 500-connection source example is a ceiling, not a target utilisation. A teaching model can have a smaller useful concurrency region.</div></section>}

        {phase === "predict-change" && selectedCandidate && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">06 · PREDICT CANDIDATE</span><h3>What will {selectedCandidate === "SMALL_POOL" ? "10" : selectedCandidate === "FIT_POOL" ? "60" : "300"} connections do?</h3></div><b>RESULT HIDDEN</b></div><p className="arch-m04-panel-copy">Make five directional predictions. Do not use the result table as a shortcut; it is still hidden. Any complete hypothesis can run, then you will reconcile it with the record.</p><div className="arch-m06-prediction-grid">{M06_CHANGED_PREDICTIONS.map(item => <PredictionCard key={item.id} label={item.label} prompt={item.prompt} value={candidatePredictions[selectedCandidate]?.[item.id]} onChange={value => { setCandidatePredictions(current => ({ ...current, [selectedCandidate]: { ...(current[selectedCandidate] ?? {}), [item.id]: value } })); setFeedback(""); }} />)}</div>{feedback && <Feedback title="Candidate prediction needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitCandidatePrediction}>Commit candidate predictions <span>→</span></button></section>}

        {phase === "run-change" && selectedCandidate && <section className="arch-panel arch-m06-stage"><span className="arch-overline">07 · RUN CONTROLLED EXPERIMENT</span><h3>Run <CandidateLabel candidate={selectedCandidate} />.</h3><p className="arch-m04-panel-copy">One variable changes: application-pool size. The result is deterministic teaching simulation, not production telemetry.</p><div className="arch-m06-experiment-card"><span>FIXED</span><b>240 requests · 12 seconds · DB ceiling 500 · seed 20260916</b><small>M05 topology and bounded call policy unchanged</small></div><button type="button" className="arch-primary-button" onClick={runCandidate}>Run {selectedCandidate} <span>→</span></button></section>}

        {phase === "reveal-change" && selectedCandidate && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">08 · REVEAL · {selectedCandidate}</span><h3>Compare prediction with the record.</h3></div><b>RESULT REVEALED</b></div><ResultTable candidate={selectedCandidate} /><div className="arch-m06-note">Every metric is `TEACHING_SIMULATION`. The source examples 50 and 500 are not recommendations.</div><div className="arch-m06-check-grid">{M06_RESULT_CHECKS.map(check => <fieldset key={check.id}><legend>{check.label}</legend>{(["CONFIRMED", "NOT_CONFIRMED"] as const).map(option => <label key={option} className={resultChecks[selectedCandidate]?.[check.id] === option ? "selected" : ""}><input type="radio" value={option} name={`${selectedCandidate}-${check.id}`} checked={resultChecks[selectedCandidate]?.[check.id] === option} onChange={() => setCheck(check.id, option)} />{option === "CONFIRMED" ? "Confirmed" : "Not confirmed"}</label>)}</fieldset>)}</div>{feedback && <Feedback title="Result needs reconciliation">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitReconciliation}>{runs.length < 3 ? "Choose another candidate" : "Build the causal explanation"} <span>→</span></button></section>}

        {phase === "explain" && <section className="arch-panel arch-m06-stage"><div className="arch-panel-head"><div><span className="arch-overline">09 · EXPLAIN</span><h3>Build the causal model.</h3></div><b>7 LINKS + BOUNDARY</b></div><p className="arch-m04-panel-copy">Order the claims, attach the evidence that supports the causal links, and state the limit of the result.</p><div className="arch-m04-causal-list">{causalOrder.map((id, index) => { const claim = M06_CAUSAL_CLAIMS.find(item => item.id === id)!; return <div className="arch-m04-causal-row" key={id}><span>{index + 1}</span><b>{claim.label}</b><button type="button" onClick={() => moveCausal(index, -1)} disabled={index === 0} aria-label={`Move claim ${index + 1} up`}>↑</button><button type="button" onClick={() => moveCausal(index, 1)} disabled={index === causalOrder.length - 1} aria-label={`Move claim ${index + 1} down`}>↓</button></div>; })}</div><div className="arch-m04-link-builder"><span className="arch-overline">ATTACH EVIDENCE</span>{(Object.keys(M06_REQUIRED_LINKS) as (keyof typeof M06_REQUIRED_LINKS)[]).map(id => <label key={id}>{id} supports<select aria-label={`Evidence link for ${id}`} value={causalLinks[id] ?? ""} onChange={event => { setCausalLinks(current => ({ ...current, [id]: event.target.value as M06CausalId })); setFeedback(""); }}><option value="">Choose claim</option>{M06_CAUSAL_CLAIMS.map(claim => <option key={claim.id} value={claim.id}>{claim.label}</option>)}</select></label>)}</div><div className="arch-m06-tradeoff"><span className="arch-overline">TRADE-OFF BOUNDARY</span>{(["FIT_IS_MODEL_BOUND", "SIXTY_IS_ALWAYS_OPTIMAL", "CONSUME_ALL_DB_CAPACITY"] as const).map(option => <label key={option} className={tradeoff === option ? "selected" : ""}><input type="radio" value={option} name="m06-tradeoff" checked={tradeoff === option} onChange={() => setTradeoff(option)} />{option === "FIT_IS_MODEL_BOUND" ? "60 is the best fit in this fixed teaching model; it is not universal advice." : option === "SIXTY_IS_ALWAYS_OPTIMAL" ? "60 connections is always optimal." : "The application should consume all 500 DB connections."}</label>)}</div>{feedback && <Feedback title="Causal model needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitExplanation}>Commit explanation <span>→</span></button></section>}

        {phase === "complete" && <section className="arch-panel arch-m06-stage"><span className="arch-overline">M06 · COMPLETE</span><h3>The useful region is a system property, not the largest setting.</h3><p>The application pool controls admission, but the DB has a finite useful concurrency region. Too small queues at the app; too large shifts contention into the DB. FIT wins this fixed model, not every production system.</p><div className="arch-m06-final"><span>CONTROLLED CONCLUSION</span><b>More connections can move the bottleneck instead of removing it.</b><small>Source examples are not recommendations. All workload and metric values are teaching simulation.</small></div><div className="arch-score-grid arch-m05-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong></div><div className="arch-metric"><small>DIAGNOSIS</small><strong>{score.diagnosis}/15</strong></div><div className="arch-metric"><small>BASELINE</small><strong>{score.baseline}/10</strong></div><div className="arch-metric"><small>CONTROLLED CHANGE</small><strong>{score.controlledChange}/10</strong></div><div className="arch-metric"><small>PREDICTIONS</small><strong>{score.changedPrediction}/10</strong></div><div className="arch-metric"><small>RECONCILIATION</small><strong>{score.reconciliation}/15</strong></div><div className="arch-metric"><small>CAUSAL MODEL</small><strong>{score.causal}/15</strong></div><div className="arch-metric"><small>BOUNDARY</small><strong>{score.boundary}/5</strong></div><div className="arch-metric"><small>EFFICIENCY</small><strong>{score.efficiency}/5</strong></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Clean path · three candidates reconciled · M06-T050 remains a neutral next-incident hook.</small></div><div className="arch-complete-actions"><button type="button" className="arch-primary-button" onClick={replay}>Replay M06 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab/m05">Return to M05 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: 1.2.md · SOURCE / FICTION / TEACHING SIMULATION LABELS ARE VISIBLE</span></footer>
  </main>;
}
