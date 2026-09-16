export type M07EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07";
export type M07Diagnosis = "CPU_SATURATION_PRIMARY" | "MEMORY_GC_PRIMARY" | "IO_WAIT_PRIMARY" | "INSUFFICIENT_EVIDENCE";
export type M07Qualitative = "LOW" | "MEDIUM" | "HIGH" | "NOT_OBSERVED";
export type M07RunId = "RUN_COMPUTE_WAIT_SAMPLE" | "RUN_GC_RETENTION_SAMPLE" | "RUN_THREAD_WAIT_SAMPLE";
export type M07RunFieldId = "CPU" | "RUNNABLE_QUEUE" | "IO_WAIT" | "SOCKET_BLOCKED" | "FULL_GC_DELTA" | "GC_PAUSE" | "HEAP_PRE_GC" | "HEAP_POST_GC" | "RETENTION_TREND" | "FILE_IO_BLOCKED";
export type M07PredictionChoice = M07Qualitative;
export type M07Reconciliation = "CONFIRMED" | "NOT_CONFIRMED" | "MISSING_EVIDENCE";
export type M07CausalId = "SLOW_IS_SYMPTOM" | "RESOURCE_EVIDENCE_DISCRIMINATES" | "PRIMARY_DIAGNOSIS" | "CONSEQUENCE_FOLLOWS";
export type M07AlternativeId = "IO_WEAKENED" | "MEMORY_UNRESOLVED";

export const M07_EVIDENCE = [
  { id: "E01" as const, label: "Request latency", family: "SYMPTOM", preview: "Inspect the request timing sample.", observation: "Baseline ~50 ms; warm-up ~5 s.", interpretation: "This is the visible symptom, not a diagnosis.", provenance: "SOURCE_BACKED approximate · section 1.3" },
  { id: "E02" as const, label: "CPU utilisation", family: "COMPUTE", preview: "Inspect the compute utilisation signal.", observation: "CPU reaches 100% during the incident window.", interpretation: "A strong compute signal, but not proof of a universal remedy.", provenance: "SOURCE_BACKED incident fact · section 1.3" },
  { id: "E03" as const, label: "Full-GC event", family: "MEMORY / GC", preview: "Inspect the runtime pause event.", observation: "Full GC coincides with a site freeze.", interpretation: "A real concurrent pause; deeper memory causation remains unresolved.", provenance: "SOURCE_BACKED incident fact · exact timing is simulated" },
  { id: "E04" as const, label: "Runnable-work sample", family: "COMPUTE", preview: "Inspect the work-queue context.", observation: "Runnable queue rises 3 → 24; compute sample is 96–100%.", interpretation: "Supports compute pressure in this deterministic incident.", provenance: "TEACHING_SIMULATION · fixed lab telemetry" },
  { id: "E05" as const, label: "Heap / GC sample", family: "MEMORY / GC", preview: "Inspect the heap and post-GC context.", observation: "Heap occupancy 68→82%; Full-GC count +1; post-GC occupancy returns to 69%.", interpretation: "GC happened, but sustained retention is not established.", provenance: "TEACHING_SIMULATION · fixed lab telemetry" },
  { id: "E06" as const, label: "Wait sample", family: "WAIT / I/O", preview: "Inspect the I/O wait context.", observation: "I/O wait 3%; socket-read blocked sample 2/200 threads.", interpretation: "Weak support for I/O as the primary cause in this run.", provenance: "TEACHING_SIMULATION · fixed lab telemetry" },
  { id: "E07" as const, label: "Missing allocation history", family: "MISSING", preview: "Inspect whether a long-window history was captured.", observation: "Long-window allocation/retention history: NOT_CAPTURED.", interpretation: "Missing is not zero; do not claim a leak from this snapshot.", provenance: "TEACHING_SIMULATION · explicit missing datum" },
] as const;

export const M07_REQUIRED_EVIDENCE: readonly M07EvidenceId[] = ["E01", "E02", "E03", "E04", "E05", "E06"];

export const M07_DIAGNOSES = [
  { id: "CPU_SATURATION_PRIMARY" as const, label: "Compute saturation is primary", detail: "Sustained compute pressure and runnable work best fit the current record." },
  { id: "MEMORY_GC_PRIMARY" as const, label: "Memory / GC pressure is primary", detail: "The pause event might be the main cause, pending discriminating evidence." },
  { id: "IO_WAIT_PRIMARY" as const, label: "I/O waiting is primary", detail: "Blocked external or disk waits can make a system slow while work waits." },
  { id: "INSUFFICIENT_EVIDENCE" as const, label: "Evidence is still insufficient", detail: "Concurrent signals may require another diagnostic run before a strong claim." },
] as const;

type M07RunDefinition = {
  id: M07RunId;
  label: string;
  description: string;
  fields: readonly M07RunFieldId[];
};

export const M07_RUNS: readonly M07RunDefinition[] = [
  { id: "RUN_COMPUTE_WAIT_SAMPLE", label: "Sample compute and wait", description: "Measure CPU, runnable work and I/O waiting together.", fields: ["CPU", "RUNNABLE_QUEUE", "IO_WAIT", "SOCKET_BLOCKED"] },
  { id: "RUN_GC_RETENTION_SAMPLE", label: "Sample GC and post-GC heap", description: "Measure pause, heap recovery and whether retention history exists.", fields: ["FULL_GC_DELTA", "GC_PAUSE", "HEAP_PRE_GC", "HEAP_POST_GC", "RETENTION_TREND"] },
  { id: "RUN_THREAD_WAIT_SAMPLE", label: "Sample thread wait states", description: "Measure runnable work and socket/file-I/O blocking.", fields: ["RUNNABLE_QUEUE", "SOCKET_BLOCKED", "FILE_IO_BLOCKED", "CPU"] },
] as const;

export const M07_RUN_RESULTS: Readonly<Record<M07RunId, Readonly<Record<M07RunFieldId, { value: string; direction: M07Qualitative; unit: string; quality: "OBSERVED" | "NOT_CAPTURED" }>>>> = {
  RUN_COMPUTE_WAIT_SAMPLE: {
    CPU: { value: "99%", direction: "HIGH", unit: "%", quality: "OBSERVED" },
    RUNNABLE_QUEUE: { value: "23", direction: "HIGH", unit: "tasks", quality: "OBSERVED" },
    IO_WAIT: { value: "3%", direction: "LOW", unit: "%", quality: "OBSERVED" },
    SOCKET_BLOCKED: { value: "2/200", direction: "LOW", unit: "threads", quality: "OBSERVED" },
  },
  RUN_GC_RETENTION_SAMPLE: {
    FULL_GC_DELTA: { value: "+1", direction: "HIGH", unit: "event", quality: "OBSERVED" },
    GC_PAUSE: { value: "1800 ms", direction: "HIGH", unit: "ms", quality: "OBSERVED" },
    HEAP_PRE_GC: { value: "82%", direction: "HIGH", unit: "%", quality: "OBSERVED" },
    HEAP_POST_GC: { value: "69%", direction: "MEDIUM", unit: "%", quality: "OBSERVED" },
    RETENTION_TREND: { value: "NOT_CAPTURED", direction: "NOT_OBSERVED", unit: "—", quality: "NOT_CAPTURED" },
  },
  RUN_THREAD_WAIT_SAMPLE: {
    RUNNABLE_QUEUE: { value: "24", direction: "HIGH", unit: "tasks", quality: "OBSERVED" },
    SOCKET_BLOCKED: { value: "2/200", direction: "LOW", unit: "threads", quality: "OBSERVED" },
    FILE_IO_BLOCKED: { value: "1/200", direction: "LOW", unit: "threads", quality: "OBSERVED" },
    CPU: { value: "100%", direction: "HIGH", unit: "%", quality: "OBSERVED" },
  },
};

export const M07_CAUSAL_CLAIMS = [
  { id: "SLOW_IS_SYMPTOM" as const, label: "The five-second request is a symptom, not a diagnosis." },
  { id: "RESOURCE_EVIDENCE_DISCRIMINATES" as const, label: "Resource-specific evidence distinguishes competing bottleneck families." },
  { id: "PRIMARY_DIAGNOSIS" as const, label: "Compute saturation is primary in this deterministic incident." },
  { id: "CONSEQUENCE_FOLLOWS" as const, label: "Runnable work queues lengthen, so response latency rises." },
] as const;

export const M07_REQUIRED_CAUSAL_ORDER: readonly M07CausalId[] = ["SLOW_IS_SYMPTOM", "RESOURCE_EVIDENCE_DISCRIMINATES", "PRIMARY_DIAGNOSIS", "CONSEQUENCE_FOLLOWS"];
export const M07_REQUIRED_LINKS: Readonly<Record<"E01" | "E02" | "E04" | "E06", M07CausalId>> = {
  E01: "SLOW_IS_SYMPTOM",
  E02: "RESOURCE_EVIDENCE_DISCRIMINATES",
  E04: "PRIMARY_DIAGNOSIS",
  E06: "CONSEQUENCE_FOLLOWS",
};

export function canUnlockM07Evidence(inspected: M07EvidenceId[]) {
  const set = new Set(inspected);
  return M07_REQUIRED_EVIDENCE.every(id => set.has(id));
}

export function m07ProofEvidenceEnough(diagnosis: M07Diagnosis | null, proof: M07EvidenceId[], inspected: M07EvidenceId[]) {
  if (!diagnosis || proof.length < 3) return false;
  const inspectedSet = new Set(inspected);
  const resourceProofCount = new Set(proof.filter(id => ["E02", "E03", "E04", "E05", "E06"].includes(id))).size;
  return new Set(proof).size >= 3
    && proof.every(id => inspectedSet.has(id))
    && proof.includes("E01")
    && resourceProofCount >= 2;
}

export function predictionsCompleteM07(run: M07RunId, predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>) {
  const definition = M07_RUNS.find(item => item.id === run);
  return Boolean(definition && definition.fields.every(field => predictions[field] !== undefined));
}

export function resultChecksMatchPredictionsM07(run: M07RunId, predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>, checks: Partial<Record<M07RunFieldId, M07Reconciliation>>) {
  const definition = M07_RUNS.find(item => item.id === run);
  if (!definition || !predictionsCompleteM07(run, predictions)) return false;
  return definition.fields.every(field => {
    const result = M07_RUN_RESULTS[run][field];
    const expected: M07Reconciliation = result.quality === "NOT_CAPTURED" ? "MISSING_EVIDENCE" : predictions[field] === result.direction ? "CONFIRMED" : "NOT_CONFIRMED";
    return checks[field] === expected;
  });
}

export function causalOrderCorrectM07(order: M07CausalId[]) {
  return order.length === M07_REQUIRED_CAUSAL_ORDER.length && order.every((id, index) => id === M07_REQUIRED_CAUSAL_ORDER[index]);
}

export function causalLinksCorrectM07(links: Partial<Record<keyof typeof M07_REQUIRED_LINKS, M07CausalId>>) {
  return (Object.keys(M07_REQUIRED_LINKS) as (keyof typeof M07_REQUIRED_LINKS)[]).every(id => links[id] === M07_REQUIRED_LINKS[id]);
}

export function predictionAccuracyScoreM07(run: M07RunId, predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>) {
  const definition = M07_RUNS.find(item => item.id === run)!;
  const correct = definition.fields.filter(field => M07_RUN_RESULTS[run][field].quality === "NOT_CAPTURED" ? predictions[field] === "NOT_OBSERVED" : predictions[field] === M07_RUN_RESULTS[run][field].direction).length;
  return Math.round((correct / definition.fields.length) * 15);
}

export function scoreM07({
  inspected, diagnosis, proof, run, predictions, reconciled, causalOrder, causalLinks, alternatives, statement, recoveryCycles,
}: {
  inspected: M07EvidenceId[];
  diagnosis: M07Diagnosis | null;
  proof: M07EvidenceId[];
  run: M07RunId | null;
  predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>;
  reconciled: boolean;
  causalOrder: M07CausalId[];
  causalLinks: Partial<Record<keyof typeof M07_REQUIRED_LINKS, M07CausalId>>;
  alternatives: M07AlternativeId[];
  statement: boolean;
  recoveryCycles: number;
}) {
  const investigation = canUnlockM07Evidence(inspected) ? 15 : 0;
  const diagnosisScore = diagnosis && m07ProofEvidenceEnough(diagnosis, proof, inspected) ? (diagnosis === "CPU_SATURATION_PRIMARY" ? 15 : 5) : 0;
  const prediction = run ? predictionAccuracyScoreM07(run, predictions) : 0;
  const runDiscipline = run && predictionsCompleteM07(run, predictions) ? 10 : 0;
  const reconciliation = reconciled ? 15 : 0;
  const alternativeScore = alternatives.length > 0 ? 10 : 0;
  const causal = causalOrderCorrectM07(causalOrder) && causalLinksCorrectM07(causalLinks) && statement ? 15 : 0;
  const efficiency = recoveryCycles === 0 ? 5 : recoveryCycles === 1 ? 4 : recoveryCycles === 2 ? 3 : 2;
  return { investigation, diagnosis: diagnosisScore, prediction, runDiscipline, reconciliation, alternatives: alternativeScore, causal, efficiency, total: investigation + diagnosisScore + prediction + runDiscipline + reconciliation + alternativeScore + causal + efficiency };
}

export function canCompleteM07({
  inspected, diagnosis, finalDiagnosis, proof, run, predictions, reconciled, causalOrder, causalLinks, alternatives, statement,
}: {
  inspected: M07EvidenceId[];
  diagnosis: M07Diagnosis | null;
  finalDiagnosis: M07Diagnosis | null;
  proof: M07EvidenceId[];
  run: M07RunId | null;
  predictions: Partial<Record<M07RunFieldId, M07PredictionChoice>>;
  reconciled: boolean;
  causalOrder: M07CausalId[];
  causalLinks: Partial<Record<keyof typeof M07_REQUIRED_LINKS, M07CausalId>>;
  alternatives: M07AlternativeId[];
  statement: boolean;
}) {
  return canUnlockM07Evidence(inspected)
    && m07ProofEvidenceEnough(diagnosis, proof, inspected)
    && finalDiagnosis === "CPU_SATURATION_PRIMARY"
    && Boolean(run && predictionsCompleteM07(run, predictions) && reconciled)
    && causalOrderCorrectM07(causalOrder)
    && causalLinksCorrectM07(causalLinks)
    && alternatives.length > 0
    && statement;
}
