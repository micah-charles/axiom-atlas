"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  M05_CAUSAL_CLAIMS,
  M05_EVIDENCE,
  M05_INITIAL_DEPENDENCY_MAP,
  M05_JUSTIFICATIONS,
  M05_PREDICTIONS,
  M05_REQUIRED_TOKENS,
  M05_RESULT_CHECKS,
  canUnlockM05Evidence,
  causalLinksCorrectM05,
  causalOrderCorrectM05,
  correctM05DependencyMap,
  m05ProofEvidenceEnough,
  policyJustificationCorrectM05,
  scoreM05,
  type M05CausalId,
  type M05DependencyToken,
  type M05DependencyZone,
  type M05Diagnosis,
  type M05EvidenceId,
  type M05JustificationId,
  type M05Policy,
  type M05PredictionChoice,
  type M05PredictionId,
  type M05ResultCheckId,
  type M05ResultChoice,
} from "./m05-engine";

type Phase = "observe" | "investigate" | "classify" | "diagnose" | "cause" | "predict" | "run-unbounded" | "reveal-unbounded" | "run-bounded" | "reveal-bounded" | "decide" | "complete";

const INITIAL_CAUSAL_ORDER: M05CausalId[] = [
  "DB_DEPENDENT_REQUEST_WAITS",
  "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT",
  "WEB_DB_ARE_SEPARATE",
  "WAITING_WORK_REMAINS_OCCUPIED",
  "DEPENDENCY_BECOMES_UNAVAILABLE",
  "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR",
  "DB_CALL_CROSSES_NETWORK_DEPENDENCY",
];

const TOKEN_LABELS: Record<M05DependencyToken, string> = {
  JDBC_DB_CALL: "JDBC database call",
  AFFECTED_SHOP_REQUEST: "Affected shop request",
  COMPARATOR_LOCAL_ACTION: "Comparator local action",
  DISK_FULL_HYPOTHESIS: "Disk-full hypothesis",
  CPU_EXHAUSTION_HYPOTHESIS: "CPU-exhaustion hypothesis",
};

const ZONE_LABELS: Record<M05DependencyZone, string> = {
  CROSSES_DB_NETWORK_DEPENDENCY: "Crosses DB network dependency",
  DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP: "Does not use DB dependency here",
  UNSUPPORTED_CAUSE: "Unsupported cause",
  UNCLASSIFIED: "Unclassified",
};

const DIAGNOSES: { id: M05Diagnosis; label: string; detail: string }[] = [
  { id: "NETWORK_DEPENDENCY_WAITING", label: "Network-dependent waiting", detail: "A DB-dependent call crosses the new host boundary and does not complete." },
  { id: "M04_DISK_CONTENTION", label: "M04 disk contention", detail: "The previous shared-disk mechanism explains this case." },
  { id: "CPU_EXHAUSTION", label: "CPU exhaustion", detail: "The compute resource is exhausted." },
  { id: "APPLICATION_CODE_STUCK_WITHOUT_DEPENDENCY_EVIDENCE", label: "Application code stuck", detail: "The application is at fault without a proven dependency." },
];

function AtlasMark() {
  return <span className="arch-lab-mark" aria-hidden="true">AX</span>;
}

function ProgressRail({ phase }: { phase: Phase }) {
  const items = ["Observe", "Investigate", "Diagnose", "Explain", "Predict", "Reveal", "Score"];
  const index = phase === "observe" ? 0 : phase === "investigate" ? 1 : ["classify", "diagnose"].includes(phase) ? 2 : phase === "cause" ? 3 : phase === "predict" ? 4 : ["run-unbounded", "reveal-unbounded", "run-bounded", "reveal-bounded", "decide"].includes(phase) ? 5 : 6;
  return <div className="arch-lab-progress" aria-label="M05 mission progress">{items.map((item, itemIndex) => <span className={itemIndex <= index ? "active" : ""} key={item}><i>{String(itemIndex + 1).padStart(2, "0")}</i>{item}</span>)}</div>;
}

function Feedback({ title, children, tone = "error" }: { title: string; children: ReactNode; tone?: "error" | "neutral" | "good" }) {
  return <div className={`arch-m04-feedback ${tone}`} role={tone === "error" ? "alert" : "status"}><b>{title}</b><span>{children}</span></div>;
}

function Topology({ resolved = false }: { resolved?: boolean }) {
  return <div className="arch-m05-topology" aria-label={resolved ? "Web host connected to a separate database host across a resolved internal dependency" : "Web host and database host with an unresolved dependency link"}>
    <div className="arch-m05-host"><span>WEB HOST</span><b>Tomcat</b><small>Shop requests · application work</small></div>
    <div className={`arch-m05-network ${resolved ? "resolved" : "unresolved"}`}><span>{resolved ? "JDBC · INTERNAL NETWORK" : "DEPENDENCY LINK"}</span><b>→</b><small>{resolved ? "DB call" : "target/path under investigation"}</small></div>
    <div className="arch-m05-host"><span>DB HOST</span><b>MySQL</b><small>Persistent data</small></div>
  </div>;
}

function M05RequestGlyph({ kind }: { kind: "request" | "database" | "network" | "slot" | "clock" | "error" }) {
  if (kind === "request") return <svg viewBox="0 0 48 32" aria-hidden="true"><rect x="5" y="6" width="38" height="20" rx="3" /><path d="M12 16h22M28 11l6 5-6 5" /></svg>;
  if (kind === "database") return <svg viewBox="0 0 48 32" aria-hidden="true"><ellipse cx="24" cy="7" rx="13" ry="4" /><path d="M11 7v16c0 3 6 5 13 5s13-2 13-5V7M11 15c0 3 6 5 13 5s13-2 13-5" /></svg>;
  if (kind === "network") return <svg viewBox="0 0 48 32" aria-hidden="true"><circle cx="10" cy="16" r="5" /><circle cx="38" cy="16" r="5" /><path d="M15 16h18M27 10l6 6-6 6" /></svg>;
  if (kind === "slot") return <svg viewBox="0 0 48 32" aria-hidden="true"><rect x="8" y="6" width="32" height="20" rx="2" /><path d="M14 12h20M14 18h13M14 23h8" /></svg>;
  if (kind === "clock") return <svg viewBox="0 0 48 32" aria-hidden="true"><circle cx="24" cy="16" r="11" /><path d="M24 10v7l5 3" /></svg>;
  return <svg viewBox="0 0 48 32" aria-hidden="true"><path d="M24 5l15 23H9z" /><path d="M24 12v8M24 24v1" /></svg>;
}

function M05RequestPressureBoard({ phase, inspected, policy, unboundedRun, boundedRun }: { phase: Phase; inspected: M05EvidenceId[]; policy: M05Policy | null; unboundedRun: boolean; boundedRun: boolean }) {
  const has = (id: M05EvidenceId) => inspected.includes(id);
  const resolvedPath = has("E01");
  const waiting = has("E02");
  const slotsKnown = has("E04");
  const comparatorKnown = has("E05");
  const resultPhase = ["reveal-unbounded", "run-bounded", "reveal-bounded", "decide", "complete"].includes(phase);
  const boardMode = phase === "run-unbounded" || phase === "reveal-unbounded" ? "unbounded" : phase === "run-bounded" || phase === "reveal-bounded" ? "bounded" : "idle";
  const visualMode = phase === "decide" || phase === "complete" ? "bounded" : boardMode;
  const requestState = visualMode === "bounded" ? "TIMEOUT / RETRY" : visualMode === "unbounded" ? "WAITING" : waiting ? "WAITING" : "IN PROGRESS";
  const stateLabel = phase === "complete" ? "POLICY ACCEPTED" : phase === "decide" ? "RESULTS RECONCILED" : phase === "reveal-bounded" ? "ERROR RETURNED" : phase === "reveal-unbounded" ? "WAITING PRESERVED" : visualMode === "bounded" ? "TIMEOUT + RETRY" : visualMode === "unbounded" ? "WAIT WITHOUT BOUND" : waiting ? "WAITING" : "IN PROGRESS";
  const slotLabel = visualMode === "bounded" ? "4 fixed slots · caller returned" : slotsKnown ? "2 / 4 occupied" : "4 slots · state unknown";
  return <section className={`arch-panel arch-m05-request-board mode-${visualMode} ${resultPhase ? "result" : ""}`} aria-label="M05 request flight and slot pressure board">
    <div className="arch-m05-request-head"><div><span className="arch-overline">REQUEST FLIGHT · SLOT PRESSURE BOARD</span><h3>What happens while the dependency does not answer?</h3></div><b>{stateLabel}</b></div>
    <div className="arch-m05-request-layout">
      <div className="arch-m05-request-host"><span className="arch-m05-board-kicker">WEB HOST · CALLER</span><div className="arch-m05-request-packets"><div className={`arch-m05-request-packet ${visualMode === "unbounded" || (visualMode === "idle" && waiting) ? "waiting" : visualMode === "bounded" ? "bounded" : ""}`}><M05RequestGlyph kind="request" /><b>REQ-A</b><small>{requestState}</small></div><div className={`arch-m05-request-packet ${visualMode === "unbounded" || (visualMode === "idle" && waiting) ? "waiting" : visualMode === "bounded" ? "bounded" : ""}`}><M05RequestGlyph kind="request" /><b>REQ-B</b><small>{requestState}</small></div></div><div className="arch-m05-request-slots"><div><span>REQUEST SLOTS</span><b>{slotLabel}</b></div><div className="arch-m05-slot-row">{["REQ-A", "REQ-B", "OPEN", "OPEN"].map((label, index) => <span className={index < 2 && slotsKnown && visualMode !== "bounded" ? "occupied" : ""} key={label + index}>{visualMode === "bounded" ? label : index < 2 && !slotsKnown ? "?" : label}</span>)}</div></div></div>
      <div className={`arch-m05-request-link ${resolvedPath ? "resolved" : "unresolved"}`}><M05RequestGlyph kind={resolvedPath ? "network" : "clock"} /><span>{resolvedPath ? "JDBC · INTERNAL NETWORK" : "DEPENDENCY LINK"}</span><b>→</b><small>{resolvedPath ? "DB call crosses boundary" : "target/path under investigation"}</small>{visualMode !== "idle" && <em>{visualMode === "unbounded" ? "0.00 → 2.00 lab seconds" : "0.75s timeout → one retry"}</em>}</div>
      <div className="arch-m05-request-host db"><span className="arch-m05-board-kicker">DB HOST · DEPENDENCY</span><div className="arch-m05-db-object"><M05RequestGlyph kind="database" /><b>MySQL</b><small>{resultPhase ? "UNAVAILABLE" : resolvedPath ? "target identified · response pending" : "service identity known · target unresolved"}</small></div><div className="arch-m05-db-state"><span>CALL STATE</span><strong>{visualMode === "bounded" ? "ERROR AFTER BOUNDED ATTEMPTS" : visualMode === "unbounded" || (visualMode === "idle" && waiting) ? "NO COMPLETION OBSERVED" : "NOT YET TESTED"}</strong></div></div>
    </div>
    <div className="arch-m05-request-footer"><div className="arch-m05-request-timeline"><span>{visualMode === "bounded" ? "ATTEMPT 1" : "CALL"}</span><i className={visualMode === "unbounded" ? "waiting" : visualMode === "bounded" ? "error" : ""} /><span>{visualMode === "bounded" ? "0.75s TIMEOUT" : "DEPENDENCY RESPONSE"}</span>{visualMode === "bounded" && <><i className="retry" /><span>ONE RETRY · 0.25s</span></>}</div><div className="arch-m05-request-comparator"><M05RequestGlyph kind={comparatorKnown ? "request" : "slot"} /><span>{comparatorKnown ? "LOCAL COMPARATOR" : "COMPARATOR"}</span><b>{comparatorKnown ? "COMPLETES WITHOUT DB PATH" : "inspect E05"}</b></div></div>
    {phase === "predict" && <div className="arch-m05-request-policy-strip"><span>RESULT HIDDEN · SAME OUTAGE / SAME 4 SLOTS</span><b>Only the caller policy changes.</b><em>{policy ? `Selected: ${policy === "UNBOUNDED_WAIT" ? "wait without bound" : "timeout + one retry"}` : "Choose both conditions below."}</em></div>}
    {phase === "reveal-unbounded" && unboundedRun && <div className="arch-m05-request-result"><M05RequestGlyph kind="clock" /><b>WAITING PRESERVED</b><span>REQ-A and REQ-B still occupy their slots at t=2.00. No error returned in the lab window.</span></div>}
    {phase === "reveal-bounded" && boundedRun && <div className="arch-m05-request-result error"><M05RequestGlyph kind="error" /><b>CONTROL RETURNED WITH ERROR</b><span>Timeout and one retry both fail; the DB remains unavailable. The policy changed caller behaviour, not dependency health.</span></div>}
  </section>;
}

function M05PredictionMatrix({ predictions, onChange }: { predictions: Partial<Record<M05PredictionId, M05PredictionChoice>>; onChange: (id: M05PredictionId, value: M05PredictionChoice) => void }) {
  const rows = [
    ["A_AFFECTED_WAITING", "B_AFFECTED_WAITING", "Affected work remains waiting"],
    ["A_ERROR_SURFACED", "B_ERROR_SURFACED", "An error surfaces in the lab window"],
    ["A_RETRY_SUCCESS", "B_RETRY_SUCCESS", "Retry guarantees success"],
    ["A_SLOT_CHANGED", "B_SLOT_CHANGED", "Fixed slot count changes"],
    ["A_DEPENDENCY_RECOVERED", "B_DEPENDENCY_RECOVERED", "Dependency recovers during outage"],
  ] as const;
  return <div className="arch-m05-prediction-matrix" role="group" aria-label="Prediction matrix for both call policies"><div className="arch-m05-matrix-head"><span>ASSERTION</span><b> A · WAIT WITHOUT BOUND</b><b>B · TIMEOUT + ONE RETRY</b></div>{rows.map(([a, b, label]) => <div className="arch-m05-matrix-row" key={label}><span>{label}</span>{([a, b] as const).map(id => <fieldset key={id}><legend className="sr-only">{id.startsWith("A_") ? "Unbounded wait" : "Bounded timeout plus one retry"}: {label}</legend>{(["YES", "NO"] as const).map(option => <label key={option} className={predictions[id] === option ? "selected" : ""}><input type="radio" name={id} checked={predictions[id] === option} onChange={() => onChange(id, option)} />{option}</label>)}</fieldset>)}</div>)}</div>;
}

function EvidenceCard({ item, inspected, onInspect }: { item: typeof M05_EVIDENCE[number]; inspected: boolean; onInspect: () => void }) {
  return <button type="button" className={`arch-m04-evidence ${inspected ? "inspected" : ""}`} onClick={onInspect} aria-pressed={inspected}>
    <span className="arch-m04-card-top"><b>{item.id}</b><small>{inspected ? "INSPECTED" : "INSPECT EVIDENCE"}</small></span>
    <strong>{item.label}</strong><span>{inspected ? item.observation : item.preview}</span>
    {inspected && <><em>{item.interpretation}</em><small className="arch-source-label">{item.provenance}</small></>}
  </button>;
}

function PredictionCard({
  item, value, onChange,
}: { item: typeof M05_PREDICTIONS[number]; value?: M05PredictionChoice; onChange: (value: M05PredictionChoice) => void }) {
  const bounded = item.id.startsWith("B_");
  return <fieldset className="arch-m05-prediction-card"><legend><b>{item.label}</b><span>{bounded ? "Condition B · same outage, bounded call policy" : "Condition A · same outage, unbounded call"}</span></legend>
    {(["YES", "NO"] as const).map(option => <label key={option} className={value === option ? "selected" : ""}><input type="radio" name={item.id} checked={value === option} onChange={() => onChange(option)} />{option === "YES" ? "YES" : "NO"}</label>)}
  </fieldset>;
}

export default function M05NetworkGame() {
  const [phase, setPhase] = useState<Phase>("observe");
  const [inspected, setInspected] = useState<M05EvidenceId[]>([]);
  const [dependencyMap, setDependencyMap] = useState<Record<M05DependencyToken, M05DependencyZone>>({ ...M05_INITIAL_DEPENDENCY_MAP });
  const [selectedToken, setSelectedToken] = useState<M05DependencyToken | null>(null);
  const [diagnosis, setDiagnosis] = useState<M05Diagnosis | null>(null);
  const [proof, setProof] = useState<M05EvidenceId[]>([]);
  const [causalOrder, setCausalOrder] = useState<M05CausalId[]>(INITIAL_CAUSAL_ORDER);
  const [causalLinks, setCausalLinks] = useState<Partial<Record<"E01" | "E02" | "E03" | "E04", M05CausalId>>>({});
  const [predictions, setPredictions] = useState<Partial<Record<M05PredictionId, M05PredictionChoice>>>({});
  const [resultChecks, setResultChecks] = useState<Partial<Record<M05ResultCheckId, M05ResultChoice>>>({});
  const [unboundedRun, setUnboundedRun] = useState(false);
  const [boundedRun, setBoundedRun] = useState(false);
  const [policy, setPolicy] = useState<M05Policy | null>(null);
  const [justifications, setJustifications] = useState<M05JustificationId[]>([]);
  const [recoveryCycles, setRecoveryCycles] = useState(0);
  const [feedback, setFeedback] = useState("");

  const score = useMemo(() => scoreM05({ inspected, map: dependencyMap, diagnosis, proof, causalOrder, causalLinks, predictions, checks: resultChecks, policy, justifications, recoveryCycles }), [inspected, dependencyMap, diagnosis, proof, causalOrder, causalLinks, predictions, resultChecks, policy, justifications, recoveryCycles]);
  const evidenceOpen = canUnlockM05Evidence(inspected);
  const mapReady = M05_REQUIRED_TOKENS.every(token => dependencyMap[token] !== "UNCLASSIFIED");
  const missionStatus = phase === "complete" ? "MISSION COMPLETE" : phase === "observe" ? "OBSERVE · INCIDENT OPEN" : phase === "investigate" ? `INVESTIGATE · ${inspected.length}/7 INSPECTED` : phase === "classify" ? "DIAGNOSE · MAP THE DEPENDENCY" : phase === "diagnose" ? "DIAGNOSE · CITE THE EVIDENCE" : phase === "cause" ? "EXPLAIN · BUILD THE CAUSE" : phase === "predict" ? "PREDICT · RESULTS HIDDEN" : phase === "run-unbounded" ? "RUN · UNBOUNDED POLICY" : phase === "reveal-unbounded" ? "REVEAL · WAITING RESULT" : phase === "run-bounded" ? "RUN · BOUNDED POLICY" : phase === "reveal-bounded" ? "REVEAL · ERROR RESULT" : "DECIDE · CHOOSE THE POLICY";

  function inspectEvidence(id: M05EvidenceId) {
    setInspected(current => current.includes(id) ? current : [...current, id]);
    setPhase(current => current === "observe" ? "investigate" : current);
  }

  function placeToken(zone: M05DependencyZone) {
    if (!selectedToken) return;
    setDependencyMap(current => ({ ...current, [selectedToken]: zone }));
    setSelectedToken(null);
    setFeedback("");
  }

  function commitMap() {
    if (!mapReady) {
      setFeedback("Classify all five tokens before committing the dependency map.");
      return;
    }
    if (!correctM05DependencyMap(dependencyMap)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("The map is a hypothesis. Re-check which tokens cross the DB boundary and which are only comparators.");
      return;
    }
    setFeedback("");
    setPhase("diagnose");
  }

  function toggleProof(id: M05EvidenceId) {
    setProof(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitDiagnosis() {
    if (!diagnosis) {
      setFeedback("Choose one diagnosis before committing.");
      return;
    }
    if (!m05ProofEvidenceEnough(proof, inspected)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Your proof must include inspected E01 and E02, plus inspected E03 or E04.");
      return;
    }
    if (diagnosis !== "NETWORK_DEPENDENCY_WAITING") {
      setRecoveryCycles(current => current + 1);
      setFeedback("That diagnosis does not explain a remote DB call waiting while local comparator work continues. Revise it using the evidence.");
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
    if (!causalOrderCorrectM05(causalOrder) || !causalLinksCorrectM05(causalLinks)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("Start with separation, then the network dependency and unavailable dependency; finish with waiting, bounded error and bounded retry. Attach E01–E04 to the links they support.");
      return;
    }
    setFeedback("");
    setPhase("predict");
  }

  function commitPredictions() {
    if (Object.keys(predictions).length < M05_PREDICTIONS.length) {
      setFeedback("Commit one YES/NO prediction for all five assertions under both policies before any result is revealed.");
      return;
    }
    setFeedback("");
    setPhase("run-unbounded");
  }

  function commitUnboundedResult() {
    const required: M05ResultCheckId[] = ["A_WAITING_AT_END", "A_NO_ERROR", "A_NO_RECOVERY"];
    if (!required.every(id => resultChecks[id] === "CONFIRMED")) {
      setFeedback("Reconcile the unbounded result: affected work remains waiting, no error surfaces in the window, and the dependency does not recover.");
      return;
    }
    setFeedback("");
    setPhase("run-bounded");
  }

  function commitBoundedResult() {
    const required: M05ResultCheckId[] = ["B_ERROR_SURFACED", "B_RETRY_FAILED", "FIXED_SLOTS"];
    if (!required.every(id => resultChecks[id] === "CONFIRMED")) {
      setFeedback("Reconcile the bounded result: an error surfaces after bounded attempts, the retry fails, and fixed slots do not change.");
      return;
    }
    setFeedback("");
    setPhase("decide");
  }

  function toggleJustification(id: M05JustificationId) {
    setJustifications(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]);
    setFeedback("");
  }

  function commitPolicy() {
    if (!policy) {
      setFeedback("Choose the policy you would adopt in this teaching model.");
      return;
    }
    if (!policyJustificationCorrectM05(policy, justifications)) {
      setRecoveryCycles(current => current + 1);
      setFeedback("The final policy must be bounded timeout plus one bounded retry, with all five mechanism and boundary justifications.");
      return;
    }
    setFeedback("");
    setPhase("complete");
  }

  function replay() {
    setPhase("observe");
    setInspected([]);
    setDependencyMap({ ...M05_INITIAL_DEPENDENCY_MAP });
    setSelectedToken(null);
    setDiagnosis(null);
    setProof([]);
    setCausalOrder([...INITIAL_CAUSAL_ORDER]);
    setCausalLinks({});
    setPredictions({});
    setResultChecks({});
    setUnboundedRun(false);
    setBoundedRun(false);
    setPolicy(null);
    setJustifications([]);
    setRecoveryCycles(0);
    setFeedback("");
  }

  const phaseTitle = phase === "complete" ? "A bounded call makes the dependency legible." : phase === "observe" || phase === "investigate" ? "A DB-dependent request stopped making progress." : phase === "classify" ? "Which work crosses the new boundary?" : phase === "diagnose" ? "What explains the waiting?" : phase === "cause" ? "Build the causal explanation." : phase === "predict" ? "Predict before the outage runs." : phase === "run-unbounded" ? "Run the unbounded policy." : phase === "reveal-unbounded" ? "What did waiting preserve?" : phase === "run-bounded" ? "Run the bounded policy." : phase === "reveal-bounded" ? "What did the bound change?" : phase === "decide" ? "Choose the policy from evidence." : "";

  return <main className="arch-lab-shell arch-m05-shell">
    <header className="arch-lab-header"><Link className="arch-lab-brand" href="/"><AtlasMark /><span><b>Axiom Atlas</b><small>COMPUTER SCIENCE · ARCHITECTURE EVOLUTION LAB</small></span></Link><div className="arch-lab-title"><small>ACT I · ONE MACHINE, FIRST LIMITS</small><strong>M05 — THE NETWORK IS NOW PART OF THE SYSTEM</strong></div><Link className="arch-lab-exit" href="/computer-science/architecture-lab/m04">M04 <span>↗</span></Link></header>
    <ProgressRail phase={phase} />
    <div className="arch-lab-layout">
      <aside className="arch-lab-brief"><span className="arch-overline">MISSION {phase === "complete" ? "COMPLETE" : "05"}</span><h1>The wait is part of the system.</h1><p>After M04, the database has its own host. Follow a request across the new boundary, then decide what the caller should do while the dependency is unavailable.</p><div className="arch-objective"><span>OBJECTIVE</span><b>Prove the dependency, predict both call policies, and explain which call behaviour changes the outcome.</b></div><div className="arch-brief-facts"><span><i>01</i> inspect neutral evidence</span><span><i>02</i> predict before reveal</span><span><i>03</i> compare call behaviour</span></div><div className="arch-fiction-note"><b>ATLAS MARKET IS FICTIONAL</b><span>Source-backed topology is separated from the fictional incident and labelled teaching-simulation values.</span></div></aside>
      <section className="arch-lab-main" aria-live="polite">
        <div className="arch-mission-bar"><div><span className="arch-overline">{missionStatus}</span><h2>{phaseTitle}</h2></div><span className="arch-date-chip">M05 · SOURCE 1.2</span></div>

        <M05RequestPressureBoard phase={phase} inspected={inspected} policy={policy} unboundedRun={unboundedRun} boundedRun={boundedRun} />

        {(phase === "observe" || phase === "investigate") && <>
          <section className="arch-m05-observe-grid"><div className="arch-panel arch-m05-incident"><span className="arch-overline">FICTIONAL OPERATIONS REPORT</span><h3>“A shop action reaches the Web application, but its DB-dependent step does not complete. Two affected requests remain in progress.”</h3><Topology resolved={inspected.includes("E01")} /><p>Do not change the call behaviour yet. First determine what the request is waiting on.</p><button type="button" className="arch-primary-button" onClick={() => setPhase("investigate")}>Begin investigation <span>→</span></button></div><div className="arch-panel arch-m05-case"><span className="arch-overline">NEW CONSEQUENCE AFTER M04</span><h3>One boundary. One question.</h3><p>Inspect whether this step crosses a dependency, then decide what the caller should do while it is unavailable.</p><div className="arch-m04-gate-note">DIAGNOSIS LOCKED · E01–E05 + ONE COMPARATOR</div></div></section>
          <section className="arch-panel arch-m04-evidence-panel"><div className="arch-panel-head"><div><span className="arch-overline">01 · INVESTIGATE</span><h3>Inspect the evidence case.</h3></div><b className={evidenceOpen ? "gate-open" : ""}>{inspected.length}/7 INSPECTED</b></div><p className="arch-m04-panel-copy">Read the five causal cards and at least one neutral comparator. No uninspected card can become proof.</p><div className="arch-m04-evidence-grid">{M05_EVIDENCE.map(item => <EvidenceCard key={item.id} item={item} inspected={inspected.includes(item.id)} onInspect={() => inspectEvidence(item.id)} />)}</div>{!evidenceOpen && <div className="arch-m04-lock-note" role="status">Evidence gate locked · inspect E01–E05 and one of E06/E07.</div>}{evidenceOpen && <button type="button" className="arch-primary-button" onClick={() => setPhase("classify")}>Map the dependency <span>→</span></button>}</section>
        </>}

        {phase === "classify" && <section className="arch-panel arch-m05-classify"><div className="arch-panel-head"><div><span className="arch-overline">02 · DIAGNOSE</span><h3>Map the dependency path.</h3></div><b>{Object.values(dependencyMap).filter(value => value !== "UNCLASSIFIED").length}/5 CLASSIFIED</b></div><p className="arch-m04-panel-copy">Select a neutral token, then place it in the zone supported by the evidence. The map is a hypothesis until you commit it.</p><div className="arch-m05-map-board"><div className="arch-m05-token-list" aria-label="Dependency tokens">{M05_REQUIRED_TOKENS.map(token => <button type="button" className={`arch-m05-token ${selectedToken === token ? "selected" : ""} ${dependencyMap[token] !== "UNCLASSIFIED" ? "placed" : ""}`} key={token} onClick={() => setSelectedToken(token)} aria-pressed={selectedToken === token}><span>{token === "JDBC_DB_CALL" ? "DB" : token === "AFFECTED_SHOP_REQUEST" ? "REQ" : token === "COMPARATOR_LOCAL_ACTION" ? "LOCAL" : token === "DISK_FULL_HYPOTHESIS" ? "DISK" : "CPU"}</span><b>{TOKEN_LABELS[token]}</b><small>{ZONE_LABELS[dependencyMap[token]]}</small></button>)}</div><div className="arch-m05-zone-list"><button type="button" className={`arch-m05-zone ${selectedToken ? "ready" : ""}`} onClick={() => placeToken("CROSSES_DB_NETWORK_DEPENDENCY")}><span>DB NETWORK DEPENDENCY</span><b>Web request crosses to the separate DB host.</b><small>{M05_REQUIRED_TOKENS.filter(token => dependencyMap[token] === "CROSSES_DB_NETWORK_DEPENDENCY").map(token => TOKEN_LABELS[token]).join(" · ") || "No tokens placed"}</small></button><button type="button" className={`arch-m05-zone ${selectedToken ? "ready" : ""}`} onClick={() => placeToken("DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP")}><span>NOT USING DB HERE</span><b>Local comparator continues without this dependency.</b><small>{M05_REQUIRED_TOKENS.filter(token => dependencyMap[token] === "DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP").map(token => TOKEN_LABELS[token]).join(" · ") || "No tokens placed"}</small></button><button type="button" className={`arch-m05-zone unsupported ${selectedToken ? "ready" : ""}`} onClick={() => placeToken("UNSUPPORTED_CAUSE")}><span>UNSUPPORTED CAUSE</span><b>No evidence establishes this as the cause.</b><small>{M05_REQUIRED_TOKENS.filter(token => dependencyMap[token] === "UNSUPPORTED_CAUSE").map(token => TOKEN_LABELS[token]).join(" · ") || "No tokens placed"}</small></button></div></div>{feedback && <Feedback title="Dependency map needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitMap}>Commit dependency map <span>→</span></button></section>}

        {phase === "diagnose" && <section className="arch-panel arch-m05-diagnose"><div className="arch-panel-head"><div><span className="arch-overline">03 · DIAGNOSE</span><h3>What explains the waiting?</h3></div><b>PROOF REQUIRED</b></div><p className="arch-m04-panel-copy">Choose one diagnosis and cite inspected E01, E02, plus E03 or E04. Wrong routes are recoverable; the evidence remains available.</p><div className="arch-m04-diagnosis-grid">{DIAGNOSES.map(item => <button type="button" key={item.id} className={`arch-m04-diagnosis ${diagnosis === item.id ? "selected" : ""}`} onClick={() => { setDiagnosis(item.id); setFeedback(""); }} aria-pressed={diagnosis === item.id}><b>{item.label}</b><span>{item.detail}</span></button>)}</div><div className="arch-m04-proof"><span className="arch-overline">CITE INSPECTED PROOF</span>{M05_EVIDENCE.filter(item => ["E01", "E02", "E03", "E04"].includes(item.id)).map(item => <button type="button" key={item.id} className={proof.includes(item.id) ? "selected" : ""} onClick={() => toggleProof(item.id)} aria-pressed={proof.includes(item.id)}>{item.id} · {item.label}{!inspected.includes(item.id) ? " · inspect first" : ""}</button>)}</div>{feedback && <Feedback title="Diagnosis needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitDiagnosis}>Commit diagnosis <span>→</span></button></section>}

        {phase === "cause" && <section className="arch-panel arch-m05-cause"><div className="arch-panel-head"><div><span className="arch-overline">04 · EXPLAIN</span><h3>Build the causal chain.</h3></div><b>{causalOrder.length}/7 CLAIMS</b></div><p className="arch-m04-panel-copy">Put the claims in causal order, then attach the evidence that supports the observed links. Up/down controls also provide the keyboard path.</p><div className="arch-m04-causal-list">{causalOrder.map((id, index) => { const claim = M05_CAUSAL_CLAIMS.find(item => item.id === id)!; return <div className="arch-m04-causal-row" key={id}><span>{index + 1}</span><b>{claim.label}</b><button type="button" onClick={() => moveCausal(index, -1)} disabled={index === 0} aria-label={`Move claim ${index + 1} up`}>↑</button><button type="button" onClick={() => moveCausal(index, 1)} disabled={index === causalOrder.length - 1} aria-label={`Move claim ${index + 1} down`}>↓</button></div>; })}</div><div className="arch-m04-link-builder"><span className="arch-overline">ATTACH EVIDENCE</span>{(["E01", "E02", "E03", "E04"] as const).map(id => <label key={id}>{id} supports<select aria-label={`Evidence link for ${id}`} value={causalLinks[id] ?? ""} onChange={event => { setCausalLinks(current => ({ ...current, [id]: event.target.value as M05CausalId })); setFeedback(""); }}><option value="">Choose claim</option>{M05_CAUSAL_CLAIMS.map(claim => <option key={claim.id} value={claim.id}>{claim.label}</option>)}</select></label>)}</div>{feedback && <Feedback title="Causal model not ready">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitCause}>Commit causal explanation <span>→</span></button></section>}

        {phase === "predict" && <section className="arch-panel arch-m05-predict"><div className="arch-panel-head"><div><span className="arch-overline">05 · PREDICT</span><h3>Predict before the outage runs.</h3></div><b>RESULT HIDDEN</b></div><p className="arch-m04-panel-copy">The same topology, starting requests and 2-second teaching simulation will be used twice. Only the call policy changes. Commit all five predictions for both conditions.</p><M05PredictionMatrix predictions={predictions} onChange={(id, value) => { setPredictions(current => ({ ...current, [id]: value })); setFeedback(""); }} />{feedback && <Feedback title="Predictions incomplete">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitPredictions}>Commit predictions <span>→</span></button></section>}

        {phase === "run-unbounded" && <section className="arch-panel arch-m05-run"><span className="arch-overline">06 · RUN · TEACHING SIMULATION</span><h3>Run condition A: unbounded wait.</h3><p>This is a deterministic educational model, not production telemetry. The DB dependency stays unavailable for the full 2-second lab window.</p><div className="arch-m05-run-card"><Topology resolved /><div><b>Policy: wait without a bound inside the lab window</b><small>Fixed request slots: 4 · affected at start: 2 · TEACHING_SIMULATION</small></div></div><button type="button" className="arch-primary-button" onClick={() => { setUnboundedRun(true); setPhase("reveal-unbounded"); }}>Run unbounded policy <span>→</span></button></section>}

        {phase === "reveal-unbounded" && <section className="arch-panel arch-m05-reveal"><div className="arch-panel-head"><div><span className="arch-overline">07 · REVEAL · CONDITION A</span><h3>The waiting work stayed occupied.</h3></div><b>QUALITATIVE RESULT</b></div><div className="arch-m05-result-grid"><div><span>UNBOUNDED WAIT</span><b>Still waiting at t=2.00 lab seconds.</b><small>No dependency error surfaced in the window.</small></div><div><span>DEPENDENCY</span><b>Unavailable for the full controlled outage.</b><small>Fixed slots: unchanged · TEACHING_SIMULATION</small></div></div><div className="arch-m05-check-grid">{M05_RESULT_CHECKS.slice(0, 3).map(check => <fieldset key={check.id}><legend>{check.label}</legend>{(["CONFIRMED", "NOT_CONFIRMED"] as const).map(option => <label key={option} className={resultChecks[check.id] === option ? "selected" : ""}><input type="radio" name={check.id} checked={resultChecks[check.id] === option} onChange={() => setResultChecks(current => ({ ...current, [check.id]: option }))} />{option === "CONFIRMED" ? "Confirmed" : "Not confirmed"}</label>)}</fieldset>)}</div>{feedback && <Feedback title="Measured result needs reconciliation">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitUnboundedResult}>Continue to bounded policy <span>→</span></button></section>}

        {phase === "run-bounded" && <section className="arch-panel arch-m05-run"><span className="arch-overline">08 · RUN · TEACHING SIMULATION</span><h3>Run condition B: bounded timeout plus one retry.</h3><p>Keep the outage, topology, starting occupancy and fixed slot count identical. Change only the call policy.</p><div className="arch-m05-run-card"><Topology resolved /><div><b>Policy: timeout at 0.75 lab seconds, then one retry after 0.25 lab seconds</b><small>Maximum retries: 1 · all values are TEACHING_SIMULATION, not production recommendations</small></div></div><button type="button" className="arch-primary-button" onClick={() => { setBoundedRun(true); setPhase("reveal-bounded"); }}>Run bounded policy <span>→</span></button></section>}

        {phase === "reveal-bounded" && <section className="arch-panel arch-m05-reveal"><div className="arch-panel-head"><div><span className="arch-overline">09 · REVEAL · CONDITION B</span><h3>The bound returned control with an error.</h3></div><b>QUALITATIVE RESULT</b></div><div className="arch-m05-result-grid"><div><span>BOUNDED POLICY</span><b>Error surfaced after bounded attempts.</b><small>Attempt 1 timeout · one retry · retry also failed.</small></div><div><span>CONTROL</span><b>Dependency stayed unavailable; slots did not change.</b><small>2-second outage · TEACHING_SIMULATION</small></div></div><div className="arch-m05-check-grid">{M05_RESULT_CHECKS.slice(3).map(check => <fieldset key={check.id}><legend>{check.label}</legend>{(["CONFIRMED", "NOT_CONFIRMED"] as const).map(option => <label key={option} className={resultChecks[check.id] === option ? "selected" : ""}><input type="radio" name={check.id} checked={resultChecks[check.id] === option} onChange={() => setResultChecks(current => ({ ...current, [check.id]: option }))} />{option === "CONFIRMED" ? "Confirmed" : "Not confirmed"}</label>)}</fieldset>)}</div>{feedback && <Feedback title="Measured result needs reconciliation">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitBoundedResult}>Choose a policy <span>→</span></button></section>}

        {phase === "decide" && <section className="arch-panel arch-m05-decide"><div className="arch-panel-head"><div><span className="arch-overline">10 · DECIDE</span><h3>Choose the policy from the evidence.</h3></div><b>BOUNDARY AWARENESS</b></div><p className="arch-m04-panel-copy">The experiment isolates call behaviour. It does not tune pool size or database capacity. Choose the policy that bounds waiting in this teaching model and explain its limits.</p><div className="arch-m05-policy-grid">{(["UNBOUNDED_WAIT", "BOUNDED_TIMEOUT_ONE_RETRY", "RETRY_UNTIL_SUCCESS", "INCREASE_REQUEST_SLOTS"] as const).map(item => <button type="button" key={item} className={`arch-m05-policy ${policy === item ? "selected" : ""}`} onClick={() => { setPolicy(item); setFeedback(""); }} aria-pressed={policy === item}><b>{item === "UNBOUNDED_WAIT" ? "Keep waiting" : item === "BOUNDED_TIMEOUT_ONE_RETRY" ? "Bound the call + retry once" : item === "RETRY_UNTIL_SUCCESS" ? "Retry until success" : "Increase request slots"}</b><span>{item === "UNBOUNDED_WAIT" ? "No error is surfaced in the lab window." : item === "BOUNDED_TIMEOUT_ONE_RETRY" ? "Return control after a bounded attempt and one bounded retry." : item === "RETRY_UNTIL_SUCCESS" ? "An unbounded series of attempts can extend the same wait." : "Changes capacity, not the call policy under test."}</span></button>)}</div><div className="arch-m05-justifications"><span className="arch-overline">JUSTIFY THE BOUNDED POLICY</span>{M05_JUSTIFICATIONS.map(item => <label key={item.id} className={justifications.includes(item.id) ? "selected" : ""}><input type="checkbox" checked={justifications.includes(item.id)} onChange={() => toggleJustification(item.id)} />{item.label}</label>)}</div>{feedback && <Feedback title="Policy needs revision">{feedback}</Feedback>}<button type="button" className="arch-primary-button" onClick={commitPolicy}>Commit policy <span>→</span></button></section>}

        {phase === "complete" && <section className="arch-panel arch-m05-complete"><span className="arch-overline">M05 · COMPLETE</span><h3>The network dependency is now part of the explanation.</h3><p>The Web/DB split removed the shared-disk contention, but database calls now cross a network boundary. An unavailable dependency can retain work; a bounded timeout returns control with an error, and a bounded retry is only another attempt.</p><div className="arch-m05-final"><span>CONTROLLED CONCLUSION</span><b>Bound the wait. Do not confuse a retry with a guarantee.</b><small>All numerical values are labelled teaching simulation. M05 stops before pool-size and database-capacity tuning.</small></div><div className="arch-score-grid arch-m05-score-grid"><div className="arch-metric"><small>INVESTIGATION</small><strong>{score.investigation}/15</strong></div><div className="arch-metric"><small>DIAGNOSIS</small><strong>{score.diagnosis}/15</strong></div><div className="arch-metric"><small>CLASSIFICATION</small><strong>{score.classification}/10</strong></div><div className="arch-metric"><small>CAUSAL CHAIN</small><strong>{score.causal}/15</strong></div><div className="arch-metric"><small>PREDICTION</small><strong>{score.prediction}/10</strong></div><div className="arch-metric"><small>EXPERIMENT</small><strong>{score.experiment}/15</strong></div><div className="arch-metric"><small>POLICY</small><strong>{score.policy}/10</strong></div><div className="arch-metric"><small>BOUNDARY</small><strong>{score.boundary}/5</strong></div><div className="arch-metric"><small>EFFICIENCY</small><strong>{score.efficiency}/5</strong></div></div><div className="arch-total-score"><span>LAB SCORE</span><strong>{score.total}/100</strong><small>Teaching-simulation assessment · {unboundedRun && boundedRun ? "both runs completed" : "runs incomplete"}</small></div><div className="arch-complete-actions"><button type="button" className="arch-primary-button" onClick={replay}>Replay M05 <span>↻</span></button><Link className="arch-secondary-button" href="/computer-science/architecture-lab/m04">Return to M04 <span>↗</span></Link></div></section>}
      </section>
    </div>
    <footer className="arch-lab-footer"><span>AXIOM ATLAS · ARCHITECTURE EVOLUTION LAB</span><span>SOURCE: 1.2.md · SOURCE / FICTION / TEACHING SIMULATION LABELS ARE VISIBLE</span></footer>
  </main>;
}
