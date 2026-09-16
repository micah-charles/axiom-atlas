export type M08EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07";
export type M08Diagnosis = "CPU_SATURATION_PRIMARY" | "MEMORY_GC_PRIMARY" | "IO_WAIT_PRIMARY" | "INSUFFICIENT_EVIDENCE";
export type M08Intervention = "SIMPLIFY_COMPUTE" | "UPGRADE_CPU" | "ADD_MEMORY";
export type M08MetricId = "CPU" | "QUEUE" | "LATENCY" | "THROUGHPUT";
export type M08Prediction = "LOW" | "MEDIUM" | "HIGH" | "UNCHANGED";
export type M08Reconciliation = "CONFIRMED" | "NOT_CONFIRMED";
export type M08CausalId = "LOAD_ARRIVES" | "COMPUTE_HOT" | "CPU_SATURATES" | "QUEUE_GROWS";

export const M08_EVIDENCE = [
  { id: "E01" as const, label: "Request load", family: "SYMPTOM", preview: "Inspect how much work is arriving.", observation: "180 requests/s offered to the service.", interpretation: "High demand is a symptom; it does not identify the limiting resource.", provenance: "SOURCE_BACKED SHAPE · section 1.3" },
  { id: "E02" as const, label: "Load average", family: "SCHEDULER", preview: "Inspect runnable pressure separately from utilisation.", observation: "Load average 14.2 on 8 logical CPUs.", interpretation: "Runnable pressure is present, but load average alone is not a diagnosis.", provenance: "TEACHING_SIMULATION · fixed Atlas Market telemetry" },
  { id: "E03" as const, label: "Java CPU", family: "COMPUTE", preview: "Inspect the Java process resource signal.", observation: "Java CPU reaches 96% during the incident window.", interpretation: "A strong compute signal that needs a work-level comparator.", provenance: "SOURCE_BACKED SHAPE · section 1.3" },
  { id: "E04" as const, label: "Queue and latency", family: "OUTCOME", preview: "Inspect what customers experience.", observation: "31 requests queued; p95 latency is 920 ms.", interpretation: "Queueing is the consequence that the intervention should change.", provenance: "TEACHING_SIMULATION · fixed Atlas Market telemetry" },
  { id: "E05" as const, label: "Hot compute stack", family: "COMPUTE", preview: "Inspect where the Java samples spend time.", observation: "62% of samples are in rendering and serialisation work.", interpretation: "The CPU signal is connected to compute work, not merely correlated with slowness.", provenance: "SOURCE_BACKED SHAPE · section 1.3; exact share simulated" },
  { id: "E06" as const, label: "Memory / GC comparator", family: "MEMORY / GC", preview: "Inspect memory pressure without assuming a remedy.", observation: "Heap 71%; 0 Full GC captured in the window.", interpretation: "This weakens memory-primary for this run; it does not prove memory is always healthy.", provenance: "TEACHING_SIMULATION · fixed Atlas Market telemetry" },
  { id: "E07" as const, label: "I/O comparator", family: "I/O", preview: "Inspect whether the process is blocked on I/O.", observation: "I/O wait 4%; 3/200 reads blocked.", interpretation: "Low wait weakens I/O-primary for this run.", provenance: "TEACHING_SIMULATION · fixed Atlas Market telemetry" },
] as const;

export const M08_REQUIRED_EVIDENCE: readonly M08EvidenceId[] = ["E01", "E02", "E03", "E04", "E05", "E06", "E07"];

export const M08_DIAGNOSES = [
  { id: "CPU_SATURATION_PRIMARY" as const, label: "CPU saturation is primary", detail: "Compute pressure and the hot stack fit the complete record." },
  { id: "MEMORY_GC_PRIMARY" as const, label: "Memory / GC is primary", detail: "The runtime may be retaining work or pausing under collection pressure." },
  { id: "IO_WAIT_PRIMARY" as const, label: "I/O wait is primary", detail: "Blocked reads may be holding requests while they wait." },
  { id: "INSUFFICIENT_EVIDENCE" as const, label: "Evidence is insufficient", detail: "The record may not justify a strong resource-family claim yet." },
] as const;

export const M08_INTERVENTIONS = [
  { id: "SIMPLIFY_COMPUTE" as const, label: "Simplify compute", detail: "Reduce render/serialise work while keeping the workload fixed." },
  { id: "UPGRADE_CPU" as const, label: "Upgrade CPU", detail: "Add compute capacity without changing the work itself." },
  { id: "ADD_MEMORY" as const, label: "Add memory", detail: "Increase heap capacity as a plausible but possibly mismatched response." },
] as const;

type M08MetricResult = { value: string; direction: M08Prediction; unit: string };
export const M08_RESULTS: Readonly<Record<M08Intervention, Readonly<Record<M08MetricId, M08MetricResult>>>> = {
  SIMPLIFY_COMPUTE: {
    CPU: { value: "72%", direction: "LOW", unit: "%" }, QUEUE: { value: "8", direction: "LOW", unit: "requests" }, LATENCY: { value: "340", direction: "LOW", unit: "ms p95" }, THROUGHPUT: { value: "172", direction: "HIGH", unit: "req/s" },
  },
  UPGRADE_CPU: {
    CPU: { value: "67%", direction: "LOW", unit: "%" }, QUEUE: { value: "11", direction: "LOW", unit: "requests" }, LATENCY: { value: "410", direction: "LOW", unit: "ms p95" }, THROUGHPUT: { value: "168", direction: "MEDIUM", unit: "req/s" },
  },
  ADD_MEMORY: {
    CPU: { value: "95%", direction: "HIGH", unit: "%" }, QUEUE: { value: "29", direction: "HIGH", unit: "requests" }, LATENCY: { value: "890", direction: "HIGH", unit: "ms p95" }, THROUGHPUT: { value: "151", direction: "LOW", unit: "req/s" },
  },
};

export const M08_METRICS: readonly { id: M08MetricId; label: string; prompt: string }[] = [
  { id: "CPU", label: "Java CPU", prompt: "Compared with 96%, what direction will CPU move?" },
  { id: "QUEUE", label: "Queued requests", prompt: "Compared with 31, what direction will the queue move?" },
  { id: "LATENCY", label: "p95 latency", prompt: "Compared with 920 ms, what direction will latency move?" },
  { id: "THROUGHPUT", label: "Useful throughput", prompt: "Compared with 160 req/s, what direction will useful throughput move?" },
];

export const M08_CAUSAL_CLAIMS = [
  { id: "LOAD_ARRIVES" as const, label: "Demand arrives faster than the service can finish it." },
  { id: "COMPUTE_HOT" as const, label: "Rendering and serialisation consume the hot compute samples." },
  { id: "CPU_SATURATES" as const, label: "Java CPU approaches saturation under that compute work." },
  { id: "QUEUE_GROWS" as const, label: "Unfinished work queues, so p95 latency rises." },
] as const;
export const M08_REQUIRED_CAUSAL_ORDER: readonly M08CausalId[] = ["LOAD_ARRIVES", "COMPUTE_HOT", "CPU_SATURATES", "QUEUE_GROWS"];

export function canUnlockM08Evidence(inspected: M08EvidenceId[]) {
  const set = new Set(inspected);
  return M08_REQUIRED_EVIDENCE.every(id => set.has(id));
}

export function m08ProofPredicate(diagnosis: M08Diagnosis | null, proof: M08EvidenceId[], inspected: M08EvidenceId[]) {
  if (!diagnosis || !canUnlockM08Evidence(inspected) || new Set(proof).size < 3 || proof.some(id => !inspected.includes(id))) return false;
  const has = (id: M08EvidenceId) => proof.includes(id);
  if (diagnosis === "CPU_SATURATION_PRIMARY") return (has("E01") || has("E04")) && has("E03") && has("E05");
  if (diagnosis === "MEMORY_GC_PRIMARY") return (has("E01") || has("E04")) && has("E06") && (has("E02") || has("E03"));
  if (diagnosis === "IO_WAIT_PRIMARY") return (has("E01") || has("E04")) && has("E07") && (has("E02") || has("E03"));
  return (has("E01") || has("E04")) && has("E06") && has("E07");
}

export function predictionsCompleteM08(predictions: Partial<Record<M08MetricId, M08Prediction>>) {
  return M08_METRICS.every(metric => predictions[metric.id] !== undefined);
}

export function resultChecksMatchPredictionsM08(intervention: M08Intervention, predictions: Partial<Record<M08MetricId, M08Prediction>>, checks: Partial<Record<M08MetricId, M08Reconciliation>>) {
  if (!predictionsCompleteM08(predictions)) return false;
  return M08_METRICS.every(metric => checks[metric.id] === (predictions[metric.id] === M08_RESULTS[intervention][metric.id].direction ? "CONFIRMED" : "NOT_CONFIRMED"));
}

export function predictionAccuracyScoreM08(intervention: M08Intervention, predictions: Partial<Record<M08MetricId, M08Prediction>>) {
  const correct = M08_METRICS.filter(metric => predictions[metric.id] === M08_RESULTS[intervention][metric.id].direction).length;
  return Math.round((correct / M08_METRICS.length) * 15);
}

export function causalOrderCorrectM08(order: M08CausalId[]) {
  return order.length === M08_REQUIRED_CAUSAL_ORDER.length && order.every((id, index) => id === M08_REQUIRED_CAUSAL_ORDER[index]);
}

export function scoreM08({ inspected, diagnosis, proof, intervention, predictions, reconciled, causalOrder, comparedAlternative, boundedStatement, recoveryCycles }: {
  inspected: M08EvidenceId[];
  diagnosis: M08Diagnosis | null;
  proof: M08EvidenceId[];
  intervention: M08Intervention | null;
  predictions: Partial<Record<M08MetricId, M08Prediction>>;
  reconciled: boolean;
  causalOrder: M08CausalId[];
  comparedAlternative: boolean;
  boundedStatement: boolean;
  recoveryCycles: number;
}) {
  const investigation = canUnlockM08Evidence(inspected) ? 15 : 0;
  const diagnosisScore = m08ProofPredicate(diagnosis, proof, inspected) ? (diagnosis === "CPU_SATURATION_PRIMARY" ? 15 : 5) : 0;
  const prediction = intervention ? predictionAccuracyScoreM08(intervention, predictions) : 0;
  const interventionFit = intervention === "SIMPLIFY_COMPUTE" ? 10 : intervention ? 5 : 0;
  const reconciliation = reconciled ? 15 : 0;
  const causal = causalOrderCorrectM08(causalOrder) && boundedStatement ? 15 : 0;
  const alternative = comparedAlternative ? 10 : 0;
  const efficiency = recoveryCycles === 0 ? 5 : recoveryCycles === 1 ? 4 : recoveryCycles === 2 ? 3 : 2;
  return { investigation, diagnosis: diagnosisScore, prediction, interventionFit, reconciliation, causal, alternative, efficiency, total: investigation + diagnosisScore + prediction + interventionFit + reconciliation + causal + alternative + efficiency };
}

export function canCompleteM08({ inspected, diagnosis, finalDiagnosis, proof, intervention, predictions, reconciled, causalOrder, comparedAlternative, boundedStatement }: {
  inspected: M08EvidenceId[];
  diagnosis: M08Diagnosis | null;
  finalDiagnosis: M08Diagnosis | null;
  proof: M08EvidenceId[];
  intervention: M08Intervention | null;
  predictions: Partial<Record<M08MetricId, M08Prediction>>;
  reconciled: boolean;
  causalOrder: M08CausalId[];
  comparedAlternative: boolean;
  boundedStatement: boolean;
}) {
  return canUnlockM08Evidence(inspected)
    && m08ProofPredicate(diagnosis, proof, inspected)
    && finalDiagnosis === "CPU_SATURATION_PRIMARY"
    && Boolean(intervention && predictionsCompleteM08(predictions) && reconciled)
    && causalOrderCorrectM08(causalOrder)
    && comparedAlternative
    && boundedStatement;
}
