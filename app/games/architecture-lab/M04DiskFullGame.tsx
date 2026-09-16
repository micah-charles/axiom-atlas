"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  M04_CAUSAL_CLAIMS,
  M04_EVIDENCE,
  M04_INITIAL_RESOURCE_MAP,
  M04_JUSTIFICATIONS,
  M04_PREDICTIONS,
  M04_REQUIRED_TOKENS,
  M04_RESULT_CHECKS,
  canCommitM04Predictions,
  canCommitM04ResourceMap,
  causalLinksCorrectM04,
  causalOrderCorrectM04,
  correctM04ResourceMap,
  interventionJustificationCorrectM04,
  m04ProofEvidenceEnough,
  resultChecksCorrectM04,
  scoreM04,
  type M04CausalId,
  type M04Diagnosis,
  type M04EvidenceId,
  type M04Intervention,
  type M04JustificationId,
  type M04PredictionChoice,
  type M04PredictionId,
  type M04ResourceToken,
  type M04ResourceZone,
  type M04ResultCheckId,
  type M04ResultChoice,
} from "./m04-engine";

type Phase = "observe" | "investigate" | "resource" | "diagnose" | "cause" | "predict" | "run" | "reveal" | "intervene" | "tradeoff" | "complete";
type TradeoffChoice = "NETWORK" | "INFINITE" | "IMAGES" | null;

const INITIAL_CAUSAL_ORDER: M04CausalId[] = [
  "DB_AND_APP_WRITES_SHARE_FINITE_DISK",
  "CATALOGUE_GROWS",
  "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE",
  "SHARED_DISK_REACHES_CAPACITY",
  "PERSISTENT_DB_DATA_GROWS",
];

const RESOURCE_LABELS: Record<M04ResourceToken, string> = {
  MYSQL_PERSISTENT_DATA: "MySQL persistent data",
  TOMCAT_LOG_WRITE: "Tomcat log write",
  SELLER_IMAGE_WRITE: "Seller image write",
  CPU_COMPARATOR: "CPU comparator",
  REQUEST_PATH_COMPARATOR: "Request-path comparator",
};

const ZONE_LABELS: Record<M04ResourceZone, string> = {
  UNCLASSIFIED: "Unclassified",
  SHARED_LOCAL_DISK: "Shared local disk",
  NOT_SHOWN_TO_CONSUME_THIS_DISK: "Not shown to consume this disk",
};

const DIAGNOSES: { id: M04Diagnosis; label: string; detail: string }[] = [
  { id: "SHARED_DISK_CAPACITY", label: "Shared disk capacity", detail: "One finite local resource explains multiple blocked writes." },
  { id: "CPU_CAPACITY", label: "CPU capacity", detail: "The compute resource is exhausted." },
  { id: "REQUEST_PATH_FAILURE", label: "Request-path failure", detail: "DNS or HTTP routing prevents the request." },
  { id: "APPLICATION_LOGGER_ONLY", label: "Application logger only", detail: "Only logging is broken." },
];

const INTERVENTIONS: { id: M04Intervention; label: string; detail: string }[] = [
  { id: "WEB_DB_ISOLATION", label: "Isolate Web and DB resource domains", detail: "Move MySQL to a DB host; keep Tomcat and local images on the Web host." },
  { id: "BIGGER_SINGLE_HOST_DISK", label: "Increase one shared disk", detail: "Adds headroom but retains the same shared boundary." },
  { id: "CPU_UPGRADE_ONLY", label: "Upgrade CPU only", detail: "Changes a resource not shown to be exhausted." },
  { id: "LOGGER_CHANGE_ONLY", label: "Change the logger only", detail: "Narrows one symptom without restoring image storage." },
];

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Diagnose", "Explain", "Predict", "Reveal", "Score"];
  const index = phase === "observe" ? 0 : phase === "investigate" ? 1 : phase === "resource" || phase === "diagnose" ? 2 : phase === "cause" ? 3 : phase === "predict" ? 4 : phase === "run" || phase === "reveal" || phase === "intervene" || phase === "tradeoff" ? 5 : 6;
  return <div className="arch-lab-progress" aria-label="M04 mission progress">
    {items.map((item, itemIndex) => <span className={itemIndex <= index ? "active" : ""} key={item}><i>{String(itemIndex + 1).padStart(2, "0")}</i>{item}</span>)}
  </div>;
}

function Feedback({ title, children, tone = "error" }: { title: string; children: ReactNode; tone?: "error" | "neutral" | "good" }) {
  return <div className={"arch-m04-feedback " + tone} role={tone === "error" ? "alert" : "status"}><b>{title}</b><span>{children}</span></div>;
}

function StorageTopology({ separated = false }: { separated?: boolean }) {
  if (separated) {
    return <div className="arch-m04-topology" aria-label="Separated Web and DB resource domains">
      <div className="arch-m04-host"><span>WEB HOST</span><b>Tomcat</b><small>Local images · Web disk</small></div>
      <div className="arch-m04-network-arrow" aria-hidden="true">→</div>
      <div className="arch-m04-host"><span>DB HOST</span><b>MySQL</b><small>Persistent data · DB disk</small></div>
    </div>;
  }
  return <div className="arch-m04-topology" aria-label="Tomcat and MySQL share one local disk on HOST 01">
    <div className="arch-m04-host wide"><span>HOST 01</span><b>Tomcat + MySQL</b><small>One shared local disk boundary</small></div>
  </div>;
}

function EvidenceCard({ item, inspected, onInspect }: { item: typeof M04_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button type="button" className={"arch-m04-evidence " + (inspected ? "inspected" : "")} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-m04-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong>
    <span>{inspected ? item.observation : item.preview}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.provenance}</small></>}
  </button>;
}

export default function M04DiskFullGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M04EvidenceId[]>([]);
  const [resourceMap, setResourceMap] = useState<Record<M04ResourceToken, M04ResourceZone>>({ ...M04_INITIAL_RESOURCE_MAP });
  const [selectedToken, setSelectedToken] = useState<M04ResourceToken | null>(null);
  const [diagnosis, setDiagnosis] = useState<M04Diagnosis | null>(null);
  const [proof, setProof] = useState<M04EvidenceId[]>([]);
  const [causalOrder, setCausalOrder] = useState<M04CausalId[]>(INITIAL_CAUSAL_ORDER);
  const [causalLinks, setCausalLinks] = useState<Partial<Record<M04EvidenceId, M04CausalId>>>({});
  const [predictions, setPredictions] = useState<Partial<Record<M04PredictionId, M04PredictionChoice>>>({});
  const [resultChecks, setResultChecks] = useState<Partial<Record<M04ResultCheckId, M04ResultChoice>>>({});
  const [intervention, setIntervention] = useState<M04Intervention | null>(null);
  const [justifications, setJustifications] = useState<M04JustificationId[]>([]);
  const [tradeoffChoice, setTradeoffChoice] = useState<TradeoffChoice>(null);
  const [recoveryCycles, setRecoveryCycles] = useState(0);
  const [feedback, setFeedback] = useState("");

  const tradeoff = tradeoffChoice === "NETWORK";
  const score = useMemo(() => scoreM04({ inspected, map: resourceMap, diagnosis, proof, predictions, checks: resultChecks, causalOrder, causalLinks, intervention, justifications, tradeoff, recoveryCycles }), [inspected, resourceMap, diagnosis, proof, predictions, resultChecks, causalOrder, causalLinks, intervention, justifications, tradeoff, recoveryCycles]);
  const evidenceOpen = inspected.length >= 6 && M04_EVIDENCE.slice(0, 5).every(item => inspected.includes(item.id)) && inspected.some(id => id === "E06" || id === "E07");
  const mapReady = canCommitM04ResourceMap(resourceMap);
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · INCIDENT OPEN" : phase === "investigate" ? "INVESTIGATE · " + inspected.length + "/7 INSPECTED" : phase === "resource" ? "DIAGNOSE · MAP THE RESOURCE" : phase === "diagnose" ? "DIAGNOSE · CITE THE EVIDENCE" : phase === "cause" ? "EXPLAIN · BUILD THE CAUSE" : phase === "predict" ? "PREDICT · RESULT HIDDEN" : phase === "run" ? "RUN · CONTROLLED COMPARISON" : phase === "reveal" ? "REVEAL · MEASURED RESULT" : phase === "intervene" ? "INTERVENE · CHOOSE THE RESPONSE" : "TRADE-OFF · NAME THE CONSEQUENCE";

  function inspectEvidence(id: M04EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    setPhase(current => current === "observe" ? "investigate" : current);
  }

  function placeToken(zone: M04ResourceZone) {
    if (!selectedToken) return;
    setResourceMap(current => ({ ...current, [selectedToken]: zone }));
    setSelectedToken(null);
    setFeedback("");
  }

  function commitResourceMap() {
    if (!mapReady) {
      setFeedback("Classify all five tokens before committing the resource map. The experiment will test your hypothesis.");
      return;
    }
    setFeedback("");
    setPhase("diagnose");
  }

  function toggleProof(id: M04EvidenceId) {
    setProof(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitDiagnosis() {
    if (!diagnosis) {
      setFeedback("Choose one diagnosis before committing.");
      return;
    }
    if (!m04ProofEvidenceEnough(proof)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Your diagnosis needs E02 and at least two of E03, E04 and E05 as proof. Revisit the inspected observations.");
      return;
    }
    if (diagnosis !== "SHARED_DISK_CAPACITY") {
      setRecoveryCycles(current => current + 1);
      setFeedback("That diagnosis does not explain the database, log and image writes together. Keep the evidence, then revise your diagnosis.");
      return;
    }
    setFeedback("");
    setPhase("cause");
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

  function commitCause() {
    if (!correctM04ResourceMap(resourceMap)) {
      setFeedback("The causal model must keep MySQL, Tomcat logs and seller images on the shared disk, while the comparators stay outside that resource. Revise the map first.");
      setPhase("resource");
      return;
    }
    if (!causalOrderCorrectM04(causalOrder) || !causalLinksCorrectM04(causalLinks)) {
      setFeedback("The cause must start with catalogue growth, connect it to persistent DB data and the shared finite disk, then explain both blocked writes. Check each evidence link.");
      return;
    }
    setFeedback("");
    setPhase("predict");
  }

  function commitPredictions() {
    if (!canCommitM04Predictions(predictions)) {
      setFeedback("Commit one prediction for each of the five controlled assertions before the result can be run.");
      return;
    }
    setFeedback("");
    setPhase("run");
  }

  function runExperiment() {
    setPhase("reveal");
    setFeedback("");
  }

  function commitResults() {
    if (!resultChecksCorrectM04(resultChecks)) {
      setFeedback("Reconcile all three measured claims: blocked shared writes, available isolated writes, and finite boundaries.");
      return;
    }
    setFeedback("");
    setPhase("intervene");
  }

  function toggleJustification(id: M04JustificationId) {
    setJustifications(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitIntervention() {
    if (!intervention) {
      setFeedback("Choose the response you would actually take after the measured comparison.");
      return;
    }
    if (intervention !== "WEB_DB_ISOLATION" || !interventionJustificationCorrectM04(intervention, justifications)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("This response does not yet address the proven shared-disk mechanism. You can revise it without losing the evidence.");
      return;
    }
    setFeedback("");
    setPhase("tradeoff");
  }

  function commitTradeoff() {
    if (!tradeoff) {
      if (tradeoffChoice) setRecoveryCycles(current => current + 1);
      setFeedback("Choose the supported consequence of separating the Web and DB resource domains.");
      return;
    }
    setFeedback("");
    setPhase("complete");
  }

  function replay() {
    setPhase("observe");
    setInspected([]);
    setResourceMap({ ...M04_INITIAL_RESOURCE_MAP });
    setSelectedToken(null);
    setDiagnosis(null);
    setProof([]);
    setCausalOrder(INITIAL_CAUSAL_ORDER);
    setCausalLinks({});
    setPredictions({});
    setResultChecks({});
    setIntervention(null);
    setJustifications([]);
    setTradeoffChoice(null);
    setRecoveryCycles(0);
    setFeedback("");
  }

  return <main className="arch-lab-shell arch-m04-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M04 — DISK FULL AT 02:00</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab/m03">M03 <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "04"}</span><h1>Find the<br />shared limit.</h1><p>At 02:00, Atlas Market reports two failed writes. Follow the evidence, prove the shared resource, then test a proportionate intervention.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Explain why the catalogue, database, logs and product image write now fail together.</b></div><div className="arch-brief-facts"><span><i>01</i> inspect neutral evidence</span><span><i>02</i> predict before run</span><span><i>03</i> reveal the trade-off</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>Source-backed incident claims are separated from the fictional clock and explicitly labelled teaching-simulation lab units.</span></div></aside>
      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phase === "complete" ? "The shared boundary is explained." : phase === "observe" || phase === "investigate" ? "Something stopped writing." : phase === "resource" ? "Which observations share a finite resource?" : phase === "diagnose" ? "What explains all three write failures?" : phase === "cause" ? "Build the causal chain." : phase === "predict" ? "What should the controlled comparison show?" : phase === "run" ? "Run the comparison." : phase === "reveal" ? "Now reconcile the measured result." : phase === "intervene" ? "Choose a response to the evidence." : "What new dependency did the response create?"}</h2></div><span className="arch-date-chip">M04 · SOURCE 1.2</span></div>

        {(phase === "observe" || phase === "investigate") && <section className="arch-m04-observe-grid"><div className="arch-panel arch-m04-brief-panel"><span className="arch-overline">02:00 · FICTIONAL SCENARIO</span><h3>“Sellers cannot add product images, and the application log has stopped recording new entries.”</h3><StorageTopology /><p>Both are writes. Find what they might share before changing the architecture.</p><button type="button" className="arch-primary-button" onClick={() => setPhase("investigate")}>Begin investigation <span>→</span></button></div><div className="arch-panel arch-m04-case-panel"><span className="arch-overline">EVIDENCE CASE</span><h3>Two failures. One question.</h3><p>Inspect the cards one at a time. Their titles stay neutral until you look at the observation and provenance.</p><div className="arch-m04-gate-note">DIAGNOSIS LOCKED · E01–E05 + ONE COMPARATOR</div></div></section>}

        {(phase === "observe" || phase === "investigate") && <section className="arch-panel arch-m04-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the evidence case.</h3></div><b className={evidenceOpen ? "gate-open" : ""}>{inspected.length}/7 INSPECTED</b></div><p className="arch-panel-copy">Read every causal card and at least one neutral comparator. No uninspected card can be used as proof.</p><div className="arch-m04-evidence-grid">{M04_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{!evidenceOpen && <div className="arch-m04-lock-note" role="status">Evidence gate locked · inspect {5 - M04_EVIDENCE.slice(0, 5).filter(item => inspected.includes(item.id)).length} causal card{M04_EVIDENCE.slice(0, 5).filter(item => inspected.includes(item.id)).length === 4 ? "" : "s"} and one comparator.</div>}{evidenceOpen && <button type="button" className="arch-primary-button" onClick={() => setPhase("resource")}>Map the resource boundary <span>→</span></button>}</section>}

        {phase === "resource" && <section className="arch-panel arch-m04-resource-panel"><div className="arch-panel-head"><div><span className="arch-overline">02 · DIAGNOSE</span><h3>Which observations share one finite resource?</h3></div><b>{Object.values(resourceMap).filter(value => value !== "UNCLASSIFIED").length}/5 PLACED</b></div><p className="arch-panel-copy">Select a neutral token, then choose a zone. The experiment will test your map; placement correctness is not shown now.</p><div className="arch-m04-resource-board"><div className="arch-m04-token-list" aria-label="Resource tokens">{M04_REQUIRED_TOKENS.map(token => <button type="button" className={"arch-m04-token " + (selectedToken === token ? "selected " : "") + (resourceMap[token] !== "UNCLASSIFIED" ? "placed" : "")} key={token} onClick={() => setSelectedToken(token)} aria-pressed={selectedToken === token}><span>{token === "MYSQL_PERSISTENT_DATA" ? "DB" : token === "TOMCAT_LOG_WRITE" ? "LOG" : token === "SELLER_IMAGE_WRITE" ? "IMG" : token === "CPU_COMPARATOR" ? "CPU" : "PATH"}</span><b>{RESOURCE_LABELS[token]}</b><small>{ZONE_LABELS[resourceMap[token]]}</small></button>)}</div><div className="arch-m04-zones"><button type="button" className={"arch-m04-zone disk " + (selectedToken ? "ready" : "")} onClick={() => placeToken("SHARED_LOCAL_DISK")}><span>SHARED LOCAL DISK</span><b>One finite capacity boundary on HOST 01</b><small>{M04_REQUIRED_TOKENS.filter(token => resourceMap[token] === "SHARED_LOCAL_DISK").map(token => RESOURCE_LABELS[token]).join(" · ") || "No tokens placed"}</small></button><button type="button" className={"arch-m04-zone neutral " + (selectedToken ? "ready" : "")} onClick={() => placeToken("NOT_SHOWN_TO_CONSUME_THIS_DISK")}><span>NOT SHOWN TO CONSUME THIS DISK</span><b>Negative controls for this incident</b><small>{M04_REQUIRED_TOKENS.filter(token => resourceMap[token] === "NOT_SHOWN_TO_CONSUME_THIS_DISK").map(token => RESOURCE_LABELS[token]).join(" · ") || "No tokens placed"}</small></button></div></div>{feedback && <Feedback title="Resource map not committed">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitResourceMap} disabled={!mapReady}>Commit resource map <span>→</span></button></section>}

        {phase === "diagnose" && <section className="arch-panel arch-m04-diagnose-panel"><div className="arch-panel-head"><div><span className="arch-overline">03 · DIAGNOSE</span><h3>What explains all three write failures?</h3></div><b>PROOF REQUIRED</b></div><p className="arch-panel-copy">Choose one diagnosis and cite E02 plus at least two of E03, E04 and E05. A wrong diagnosis is recoverable, but it must explain the observed writes.</p><div className="arch-m04-diagnosis-grid">{DIAGNOSES.map(item => <button type="button" key={item.id} className={"arch-m04-diagnosis " + (diagnosis === item.id ? "selected" : "")} onClick={() => { setDiagnosis(item.id); setFeedback(""); }} aria-pressed={diagnosis === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div><div className="arch-m04-proof"><span className="arch-overline">CITE INSPECTED PROOF</span>{M04_EVIDENCE.filter(item => ["E02", "E03", "E04", "E05"].includes(item.id)).map(item => <button type="button" key={item.id} className={proof.includes(item.id) ? "selected" : ""} onClick={() => toggleProof(item.id)} aria-pressed={proof.includes(item.id)}>{item.id} · {item.label}</button>)}</div>{feedback && <Feedback title="Diagnosis needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitDiagnosis}>Commit diagnosis <span>→</span></button></section>}

        {phase === "cause" && <section className="arch-panel arch-m04-cause-panel"><div className="arch-panel-head"><div><span className="arch-overline">04 · EXPLAIN</span><h3>Build the five-link cause.</h3></div><b>{causalOrder.length}/5 CLAIMS</b></div><p className="arch-panel-copy">Put the claims in causal order, then attach the evidence that supports each observed link. The answer is a causal explanation, not a label.</p><div className="arch-m04-causal-list">{causalOrder.map((id, index) => { const claim = M04_CAUSAL_CLAIMS.find(item => item.id === id)!; return <div className="arch-m04-causal-row" key={id}><span>{index + 1}</span><b>{claim.label}</b><button type="button" onClick={() => moveCausal(index, -1)} disabled={index === 0} aria-label={"Move claim " + (index + 1) + " up"}>↑</button><button type="button" onClick={() => moveCausal(index, 1)} disabled={index === causalOrder.length - 1} aria-label={"Move claim " + (index + 1) + " down"}>↓</button></div>; })}</div><div className="arch-m04-link-builder"><span className="arch-overline">ATTACH EVIDENCE</span>{(["E01", "E02", "E03", "E04", "E05"] as const).map(id => <label key={id}>{id} support<select aria-label={"Evidence link for " + id} value={causalLinks[id] ?? ""} onChange={event => { setCausalLinks(current => ({ ...current, [id]: event.target.value as M04CausalId })); setFeedback(""); }}><option value="">Choose claim</option>{M04_CAUSAL_CLAIMS.map(claim => <option key={claim.id} value={claim.id}>{claim.label}</option>)}</select></label>)}</div>{feedback && <Feedback title="Causal model not ready">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitCause}>Commit causal explanation <span>→</span></button></section>}

        {phase === "predict" && <section className="arch-panel arch-m04-predict-panel"><div className="arch-panel-head"><div><span className="arch-overline">05 · PREDICT</span><h3>Predict before the comparison runs.</h3></div><b>RESULT HIDDEN</b></div><p className="arch-panel-copy">Condition A keeps Web and DB on the shared boundary. Condition B separates the resource domains. No outcome appears until every prediction is committed.</p><div className="arch-m04-prediction-conditions"><div><span className="arch-overline">CONDITION A · CURRENT SHARED</span><StorageTopology /><small>100/100 LAB UNITS · TEACHING SIMULATION</small></div><div><span className="arch-overline">CONDITION B · SEPARATED RESOURCE BOUNDARIES</span><StorageTopology separated /><small>WEB 24/30 · DB 76/100 LAB UNITS · TEACHING SIMULATION</small></div></div><div className="arch-m04-prediction-list">{M04_PREDICTIONS.map(prediction => <fieldset key={prediction.id}><legend><b>{prediction.label}</b><span>{prediction.prompt}</span></legend>{prediction.options.map(option => <label key={option} className={predictions[prediction.id] === option ? "selected" : ""}><input type="radio" name={prediction.id} checked={predictions[prediction.id] === option} onChange={() => setPredictions(current => ({ ...current, [prediction.id]: option }))} />{option === "BLOCKED" ? "BLOCKED" : option === "AVAILABLE" ? "AVAILABLE IN LAB MODEL" : option === "SAME" ? "YES · SAME BOUNDARY" : "NO · SEPARATE BOUNDARIES"}</label>)}</fieldset>)}</div>{feedback && <Feedback title="Predictions incomplete">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitPredictions}>Commit predictions <span>→</span></button></section>}

        {phase === "run" && <section className="arch-panel arch-m04-run-panel"><span className="arch-overline">06 · RUN · TEACHING SIMULATION</span><h3>Compare the two resource boundaries.</h3><p>This controlled model tests only write availability and the exact shared-disk boundary. It does not model a production outage.</p><div className="arch-m04-run-grid"><div><span className="arch-overline">CURRENT SHARED</span><StorageTopology /><b>DB 76 + images 18 + logs/other 6 = 100/100</b></div><div><span className="arch-overline">WEB / DB ISOLATED</span><StorageTopology separated /><b>Web 24/30 · DB 76/100 · finite domains</b></div></div><button type="button" className="arch-primary-button" onClick={runExperiment}>Run controlled comparison <span>→</span></button></section>}

        {phase === "reveal" && <section className="arch-panel arch-m04-reveal-panel"><div className="arch-panel-head"><div><span className="arch-overline">07 · REVEAL</span><h3>Reconcile what the experiment measured.</h3></div><b>QUALITATIVE RESULT</b></div><div className="arch-m04-result-grid"><div><span className="arch-overline">CURRENT SHARED CONDITION</span><b>Log write: BLOCKED</b><b>Image write: BLOCKED</b><small>Web + DB same disk boundary: YES</small></div><div><span className="arch-overline">SEPARATED RESOURCE CONDITION</span><b>Log write: SPACE AVAILABLE IN LAB MODEL</b><b>Image write: SPACE AVAILABLE IN LAB MODEL</b><small>Web + DB same disk boundary: NO</small></div></div><div className="arch-m04-checks"><span className="arch-overline">MATCH THE MEASURED CLAIMS</span>{M04_RESULT_CHECKS.map(check => <fieldset key={check.id}><legend>{check.label}</legend>{(["CONFIRMED", "NOT_CONFIRMED"] as const).map(option => <label key={option} className={resultChecks[check.id] === option ? "selected" : ""}><input type="radio" name={check.id} checked={resultChecks[check.id] === option} onChange={() => setResultChecks(current => ({ ...current, [check.id]: option }))} />{option === "CONFIRMED" ? "Confirmed by the controlled result" : "Not confirmed"}</label>)}</fieldset>)}</div>{feedback && <Feedback title="Measured result needs reconciliation">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitResults}>Continue to intervention <span>→</span></button></section>}

        {phase === "intervene" && <section className="arch-panel arch-m04-intervene-panel"><div className="arch-panel-head"><div><span className="arch-overline">08 · INTERVENE</span><h3>Choose the proportionate response.</h3></div><b>RESULTS MEASURED</b></div><p className="arch-panel-copy">Only now are intervention names exposed. Choose the response that removes the demonstrated shared resource contention, then justify the mechanism.</p><div className="arch-m04-intervention-grid">{INTERVENTIONS.map(item => <button type="button" key={item.id} className={"arch-m04-intervention-card " + (intervention === item.id ? "selected" : "")} onClick={() => { setIntervention(item.id); setFeedback(""); }} aria-pressed={intervention === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div><div className="arch-m04-justifications"><span className="arch-overline">JUSTIFY THE CHOICE</span>{M04_JUSTIFICATIONS.filter(item => item.id !== "NETWORK_TRADEOFF").map(item => <label key={item.id} className={justifications.includes(item.id) ? "selected" : ""}><input type="checkbox" checked={justifications.includes(item.id)} onChange={() => toggleJustification(item.id)} />{item.label}</label>)}</div>{feedback && <Feedback title="Intervention needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitIntervention}>Commit intervention <span>→</span></button></section>}

        {phase === "tradeoff" && <section className="arch-panel arch-m04-tradeoff-panel"><div className="arch-panel-head"><div><span className="arch-overline">09 · TRADE-OFF</span><h3>What changed when the resource domains separated?</h3></div><b>STOP AFTER THIS CONSEQUENCE</b></div><div className="arch-m04-tradeoff-topology"><StorageTopology separated /></div><p className="arch-m04-tradeoff-copy">The controlled experiment supports one new dependency. Choose it, then stop the mission at this boundary.</p><div className="arch-m04-tradeoff-options"><button type="button" className={"arch-m04-tradeoff-choice " + (tradeoffChoice === "NETWORK" ? "selected" : "")} onClick={() => { setTradeoffChoice("NETWORK"); setFeedback(""); }} aria-pressed={tradeoffChoice === "NETWORK"}><b>Web → DB is now a network dependency.</b><span>The application must reach the database across a network.</span></button><button type="button" className={"arch-m04-tradeoff-choice " + (tradeoffChoice === "INFINITE" ? "selected" : "")} onClick={() => { setTradeoffChoice("INFINITE"); setFeedback(""); }} aria-pressed={tradeoffChoice === "INFINITE"}><b>Both new disks are now infinite.</b><span>Isolation does not remove finite capacity boundaries.</span></button><button type="button" className={"arch-m04-tradeoff-choice " + (tradeoffChoice === "IMAGES" ? "selected" : "")} onClick={() => { setTradeoffChoice("IMAGES"); setFeedback(""); }} aria-pressed={tradeoffChoice === "IMAGES"}><b>Product images automatically move to the DB host.</b><span>The source-backed placement keeps product images on the Web host.</span></button></div>{feedback && <Feedback title="Trade-off not selected">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitTradeoff}>Complete the investigation <span>→</span></button></section>}

        {phase === "complete" && <section className="arch-panel arch-m04-complete-panel"><span className="arch-overline">M04 · COMPLETE</span><h3>The shared boundary is explained.</h3><p>The catalogue grew, persistent data consumed the finite disk, and DB, log and image writes shared that boundary. Web/DB isolation removes this specific contention while introducing a network dependency.</p><div className="arch-m04-final-reveal"><span>CONTROLLED CONCLUSION</span><b>Isolation addresses the proven resource cause.</b><small>Each new disk remains finite. Product images remain on the Web host. M04 stops at the newly introduced network dependency.</small></div><div className="arch-score-grid arch-m04-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong></div><div className="arch-metric"><small>DIAGNOSIS</small><strong>{score.diagnosis}/15</strong></div><div className="arch-metric"><small>RESOURCE MAP</small><strong>{score.resourceMap}/10</strong></div><div className="arch-metric"><small>CAUSAL CHAIN</small><strong>{score.causal}/15</strong></div><div className="arch-metric"><small>PREDICTION</small><strong>{score.prediction}/10</strong></div><div className="arch-metric"><small>EXPERIMENT</small><strong>{score.experiment}/10</strong></div><div className="arch-metric"><small>INTERVENTION</small><strong>{score.intervention + score.justification}/15</strong></div><div className="arch-metric"><small>TRADE-OFF</small><strong>{score.tradeoff}/5</strong></div><div className="arch-metric"><small>EFFICIENCY</small><strong>{score.efficiency}/5</strong></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Teaching-simulation assessment</small></div><div className="arch-complete-actions"><button type="button" className="arch-primary-button" onClick={replay}>Replay M04 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab/m03">Return to M03 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: 1.2.md · SOURCE / FICTION / TEACHING SIMULATION LABELS ARE VISIBLE</span></footer>
  </main>;
}
