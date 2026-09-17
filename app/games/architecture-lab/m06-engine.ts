export type M06EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07";
export type M06Diagnosis = "CONNECTION_ADMISSION_MISMATCH" | "M05_NETWORK_WAITING" | "WEB_CPU_EXHAUSTION" | "DB_CEILING_IS_THE_ONLY_LIMIT";
export type M06Candidate = "SMALL_POOL" | "FIT_POOL" | "LARGE_POOL";
export type M06Qualitative = "NONE" | "LOW" | "MEDIUM" | "HIGH";
export type M06BaselinePredictionId = "APP_WAIT" | "DB_CONTENTION" | "DB_CPU" | "THROUGHPUT" | "ERRORS";
export type M06PredictionId = M06BaselinePredictionId;
export type M06PredictionChoice = M06Qualitative;
export type M06ResultCheckId = "APP_WAIT" | "DB_CONTENTION" | "DB_CPU" | "THROUGHPUT" | "P95" | "ERRORS";
export type M06ResultChoice = "CONFIRMED" | "NOT_CONFIRMED";
export type M06CausalId = "CONCURRENT_DB_DEMAND_ARRIVES" | "APP_POOL_ADMITS_DB_WORK" | "DB_CAPACITY_LIMITS_USEFUL_CONCURRENCY" | "EXCESS_WORK_QUEUES_AT_A_BOUNDARY" | "TOO_MUCH_DB_CONCURRENCY_INCREASES_CONTENTION" | "QUEUEING_AND_CONTENTION_CHANGE_LATENCY" | "THROUGHPUT_HAS_A_USEFUL_REGION_NOT_A_MONOTONIC_MAXIMUM";
export type M06Tradeoff = "FIT_IS_MODEL_BOUND" | "SIXTY_IS_ALWAYS_OPTIMAL" | "CONSUME_ALL_DB_CAPACITY";

export const M06_EVIDENCE = [
  { id: "E01" as const, label: "Application pool example", preview: "Inspect the source configuration example.", observation: "The source example contains jdbc.maxPoolSize=50.", interpretation: "The application admits a bounded number of DB calls before more work waits.", provenance: "SOURCE_BACKED_SOURCE_EXAMPLE · section 1.2 · not a recommendation." },
  { id: "E02" as const, label: "Database ceiling example", preview: "Inspect the source database configuration.", observation: "The source diagram contains MySQL max_connections=500.", interpretation: "The DB has a configured ceiling, but a ceiling is not the same as useful concurrency.", provenance: "SOURCE_BACKED_SOURCE_EXAMPLE · section 1.2 · not a target utilisation." },
  { id: "E03" as const, label: "Waiting-work probe", preview: "Inspect where admitted work is waiting.", observation: "Teaching simulation: requests are waiting at the application-pool boundary.", interpretation: "Admission that is too small can queue work before it reaches the DB.", provenance: "TEACHING_SIMULATION · deterministic lab telemetry." },
  { id: "E04" as const, label: "DB pressure signal", preview: "Inspect the simulated DB pressure signal.", observation: "Teaching simulation: DB CPU and contention rise when too much work is admitted concurrently.", interpretation: "More admitted work can move the queue into DB contention rather than remove it.", provenance: "TEACHING_SIMULATION · not M07 CPU tuning." },
  { id: "E05" as const, label: "Latency measure", preview: "Inspect the response-time measure.", observation: "Teaching simulation: p95 request latency changes with the admission candidate.", interpretation: "The same workload can have different tail latency under different pool sizes.", provenance: "TEACHING_SIMULATION · milliseconds are model outputs." },
  { id: "E06" as const, label: "Throughput and errors", preview: "Inspect completed work and errors.", observation: "Teaching simulation: throughput is not monotonic as the pool grows; overload can add errors.", interpretation: "A larger pool is not automatically a faster or safer system.", provenance: "TEACHING_SIMULATION · fixed workload result signal." },
  { id: "E07" as const, label: "Fixed workload and seed", preview: "Inspect what stays constant between experiments.", observation: "The lab uses 240 requests over 12 seconds, offered demand 20 requests/s, seed 20260916.", interpretation: "The experiment changes one configuration while holding the workload and model fixed.", provenance: "TEACHING_SIMULATION · reproducibility controls." },
] as const;

export const M06_REQUIRED_EVIDENCE: readonly M06EvidenceId[] = ["E01", "E02", "E03", "E04", "E05", "E06", "E07"];
export const M06_REQUIRED_CAUSAL_ORDER: readonly M06CausalId[] = [
  "CONCURRENT_DB_DEMAND_ARRIVES",
  "APP_POOL_ADMITS_DB_WORK",
  "DB_CAPACITY_LIMITS_USEFUL_CONCURRENCY",
  "EXCESS_WORK_QUEUES_AT_A_BOUNDARY",
  "TOO_MUCH_DB_CONCURRENCY_INCREASES_CONTENTION",
  "QUEUEING_AND_CONTENTION_CHANGE_LATENCY",
  "THROUGHPUT_HAS_A_USEFUL_REGION_NOT_A_MONOTONIC_MAXIMUM",
];

export const M06_CAUSAL_CLAIMS = [
  { id: "CONCURRENT_DB_DEMAND_ARRIVES" as const, label: "Concurrent DB demand arrives." },
  { id: "APP_POOL_ADMITS_DB_WORK" as const, label: "The application pool admits DB work." },
  { id: "DB_CAPACITY_LIMITS_USEFUL_CONCURRENCY" as const, label: "DB capacity limits useful concurrency." },
  { id: "EXCESS_WORK_QUEUES_AT_A_BOUNDARY" as const, label: "Excess work queues at a boundary." },
  { id: "TOO_MUCH_DB_CONCURRENCY_INCREASES_CONTENTION" as const, label: "Too much DB concurrency increases contention." },
  { id: "QUEUEING_AND_CONTENTION_CHANGE_LATENCY" as const, label: "Queueing and contention change latency." },
  { id: "THROUGHPUT_HAS_A_USEFUL_REGION_NOT_A_MONOTONIC_MAXIMUM" as const, label: "Throughput has a useful region, not a monotonic maximum." },
] as const;

export const M06_BASELINE_PREDICTIONS = [
  { id: "APP_WAIT" as const, label: "Application-pool wait", prompt: "At the source-example baseline, app-pool waiting will be…", correct: "MEDIUM" as const },
  { id: "DB_CONTENTION" as const, label: "DB contention", prompt: "At the source-example baseline, DB contention will be…", correct: "LOW" as const },
  { id: "DB_CPU" as const, label: "DB CPU pressure", prompt: "At the source-example baseline, DB CPU pressure will be…", correct: "MEDIUM" as const },
  { id: "THROUGHPUT" as const, label: "Completed throughput", prompt: "At the source-example baseline, completed throughput will be…", correct: "MEDIUM" as const },
  { id: "ERRORS" as const, label: "Overload errors", prompt: "At the source-example baseline, overload errors will be…", correct: "NONE" as const },
] as const;

export const M06_CHANGED_PREDICTIONS = M06_BASELINE_PREDICTIONS.map(item => ({
  ...item,
  correctByCandidate: {
    SMALL_POOL: ({ APP_WAIT: "HIGH", DB_CONTENTION: "LOW", DB_CPU: "MEDIUM", THROUGHPUT: "LOW", ERRORS: "NONE" } as Record<M06PredictionId, M06Qualitative>)[item.id],
    FIT_POOL: ({ APP_WAIT: "LOW", DB_CONTENTION: "LOW", DB_CPU: "MEDIUM", THROUGHPUT: "HIGH", ERRORS: "NONE" } as Record<M06PredictionId, M06Qualitative>)[item.id],
    LARGE_POOL: ({ APP_WAIT: "NONE", DB_CONTENTION: "HIGH", DB_CPU: "HIGH", THROUGHPUT: "MEDIUM", ERRORS: "HIGH" } as Record<M06PredictionId, M06Qualitative>)[item.id],
  },
}));

export const M06_RESULTS: Record<M06Candidate, {
  pool: number;
  appWait: number;
  dbContention: number;
  dbCpu: number;
  throughput: number;
  p95: number;
  errors: number;
}> = {
  SMALL_POOL: { pool: 10, appWait: 14, dbContention: 0, dbCpu: 60, throughput: 10, p95: 420, errors: 0 },
  FIT_POOL: { pool: 60, appWait: 3, dbContention: 2, dbCpu: 78, throughput: 18, p95: 190, errors: 0 },
  LARGE_POOL: { pool: 300, appWait: 0, dbContention: 38, dbCpu: 99, throughput: 15, p95: 880, errors: 8 },
};

export const M06_BASELINE_RESULT = { pool: 50, appWait: 5, dbContention: 1, dbCpu: 72, throughput: 17, p95: 230, errors: 0 } as const;

export const M06_BASELINE_DIRECTIONAL_VALUES: Readonly<Record<M06PredictionId, M06Qualitative>> = {
  APP_WAIT: "MEDIUM",
  DB_CONTENTION: "LOW",
  DB_CPU: "MEDIUM",
  THROUGHPUT: "MEDIUM",
  ERRORS: "NONE",
};

export const M06_RESULT_CHECKS: readonly { id: M06ResultCheckId; label: string }[] = [
  { id: "APP_WAIT", label: "The app-pool queue matches the predicted direction." },
  { id: "DB_CONTENTION", label: "The DB contention queue matches the predicted direction." },
  { id: "DB_CPU", label: "DB CPU pressure matches the predicted direction." },
  { id: "THROUGHPUT", label: "Throughput matches the predicted direction." },
  { id: "P95", label: "p95 latency and errors match this run's trade-off." },
  { id: "ERRORS", label: "The error result matches the predicted direction." },
];

export const M06_REQUIRED_LINKS: Readonly<Record<"E01" | "E02" | "E03" | "E04" | "E05" | "E06", M06CausalId>> = {
  E01: "APP_POOL_ADMITS_DB_WORK",
  E02: "DB_CAPACITY_LIMITS_USEFUL_CONCURRENCY",
  E03: "EXCESS_WORK_QUEUES_AT_A_BOUNDARY",
  E04: "TOO_MUCH_DB_CONCURRENCY_INCREASES_CONTENTION",
  E05: "QUEUEING_AND_CONTENTION_CHANGE_LATENCY",
  E06: "THROUGHPUT_HAS_A_USEFUL_REGION_NOT_A_MONOTONIC_MAXIMUM",
};

export function canUnlockM06Evidence(inspected: M06EvidenceId[]) {
  const unique = new Set(inspected);
  return unique.size === M06_REQUIRED_EVIDENCE.length && M06_REQUIRED_EVIDENCE.every(id => unique.has(id));
}

export function m06ProofEvidenceEnough(proof: M06EvidenceId[], inspected: M06EvidenceId[]) {
  const proofSet = new Set(proof);
  const inspectedSet = new Set(inspected);
  return [...proofSet].every(id => inspectedSet.has(id))
    && proofSet.has("E01")
    && proofSet.has("E02")
    && (proofSet.has("E03") || proofSet.has("E04"))
    && (proofSet.has("E05") || proofSet.has("E06"));
}

export function diagnosisProofIsEnoughM06(diagnosis: M06Diagnosis | null, proof: M06EvidenceId[], inspected: M06EvidenceId[]) {
  return diagnosis === "CONNECTION_ADMISSION_MISMATCH" && m06ProofEvidenceEnough(proof, inspected);
}

export function predictionsCompleteM06(predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>) {
  return M06_BASELINE_PREDICTIONS.every(item => predictions[item.id] !== undefined);
}

export function baselinePredictionsCorrectM06(predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>) {
  return M06_BASELINE_PREDICTIONS.every(item => predictions[item.id] === M06_BASELINE_DIRECTIONAL_VALUES[item.id]);
}

export function candidatePredictionsCorrectM06(candidate: M06Candidate, predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>) {
  return M06_CHANGED_PREDICTIONS.every(item => predictions[item.id] === item.correctByCandidate[candidate]);
}

export function causalOrderCorrectM06(order: M06CausalId[]) {
  return order.length === M06_REQUIRED_CAUSAL_ORDER.length && order.every((id, index) => id === M06_REQUIRED_CAUSAL_ORDER[index]);
}

export function causalLinksCorrectM06(links: Partial<Record<keyof typeof M06_REQUIRED_LINKS, M06CausalId>>) {
  return (Object.keys(M06_REQUIRED_LINKS) as (keyof typeof M06_REQUIRED_LINKS)[]).every(id => links[id] === M06_REQUIRED_LINKS[id]);
}

export function resultChecksCorrectM06(checks: Partial<Record<M06ResultCheckId, M06ResultChoice>>) {
  return M06_RESULT_CHECKS.every(item => checks[item.id] === "CONFIRMED");
}

function resultChecksMatchExpectedM06(
  predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>,
  expected: Readonly<Record<M06PredictionId, M06Qualitative>>,
  checks: Partial<Record<M06ResultCheckId, M06ResultChoice>>,
) {
  const expectedChecks: Record<M06ResultCheckId, M06ResultChoice> = {
    APP_WAIT: predictions.APP_WAIT === expected.APP_WAIT ? "CONFIRMED" : "NOT_CONFIRMED",
    DB_CONTENTION: predictions.DB_CONTENTION === expected.DB_CONTENTION ? "CONFIRMED" : "NOT_CONFIRMED",
    DB_CPU: predictions.DB_CPU === expected.DB_CPU ? "CONFIRMED" : "NOT_CONFIRMED",
    THROUGHPUT: predictions.THROUGHPUT === expected.THROUGHPUT ? "CONFIRMED" : "NOT_CONFIRMED",
    P95: predictions.DB_CONTENTION === expected.DB_CONTENTION && predictions.ERRORS === expected.ERRORS ? "CONFIRMED" : "NOT_CONFIRMED",
    ERRORS: predictions.ERRORS === expected.ERRORS ? "CONFIRMED" : "NOT_CONFIRMED",
  };
  return M06_RESULT_CHECKS.every(item => checks[item.id] === expectedChecks[item.id]);
}

export function directionalValueForResultM06(result: { appWait: number; dbContention: number; dbCpu: number; throughput: number; errors: number }, id: M06PredictionId): M06Qualitative {
  if (id === "APP_WAIT") return result.appWait >= 10 ? "HIGH" : result.appWait === 0 ? "NONE" : "LOW";
  if (id === "DB_CONTENTION") return result.dbContention >= 20 ? "HIGH" : "LOW";
  if (id === "DB_CPU") return result.dbCpu >= 90 ? "HIGH" : "MEDIUM";
  if (id === "THROUGHPUT") return result.throughput >= 18 ? "HIGH" : result.throughput <= 10 ? "LOW" : "MEDIUM";
  return result.errors > 0 ? "HIGH" : "NONE";
}

export function directionalValue(candidate: M06Candidate, id: M06PredictionId): M06Qualitative {
  return directionalValueForResultM06(M06_RESULTS[candidate], id);
}

export function predictionAccuracyScoreM06(predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>, expected: Readonly<Record<M06PredictionId, M06Qualitative>>) {
  const correct = M06_BASELINE_PREDICTIONS.reduce((total, item) => total + (predictions[item.id] === expected[item.id] ? 1 : 0), 0);
  return Math.round((correct / M06_BASELINE_PREDICTIONS.length) * 10);
}

export function candidatePredictionScoreM06(candidate: M06Candidate, predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>) {
  return predictionAccuracyScoreM06(predictions, Object.fromEntries(M06_BASELINE_PREDICTIONS.map(item => [item.id, directionalValue(candidate, item.id)])) as Record<M06PredictionId, M06Qualitative>);
}

export function baselineResultChecksMatchPredictionsM06(predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>, checks: Partial<Record<M06ResultCheckId, M06ResultChoice>>) {
  return resultChecksMatchExpectedM06(predictions, M06_BASELINE_DIRECTIONAL_VALUES, checks);
}

export function resultChecksMatchPredictionsM06(candidate: M06Candidate, predictions: Partial<Record<M06PredictionId, M06PredictionChoice>>, checks: Partial<Record<M06ResultCheckId, M06ResultChoice>>) {
  const expected = Object.fromEntries(M06_BASELINE_PREDICTIONS.map(item => [item.id, directionalValue(candidate, item.id)])) as Record<M06PredictionId, M06Qualitative>;
  return resultChecksMatchExpectedM06(predictions, expected, checks);
}

export function scoreM06({
  inspected, diagnosis, proof, baselinePredictions, candidatePredictions, runs, reconciled, causalOrder, causalLinks, tradeoff, recoveryCycles,
}: {
  inspected: M06EvidenceId[];
  diagnosis: M06Diagnosis | null;
  proof: M06EvidenceId[];
  baselinePredictions: Partial<Record<M06PredictionId, M06PredictionChoice>>;
  candidatePredictions: Partial<Record<M06Candidate, Partial<Record<M06PredictionId, M06PredictionChoice>>>>;
  runs: M06Candidate[];
  reconciled: Partial<Record<M06Candidate, boolean>>;
  causalOrder: M06CausalId[];
  causalLinks: Partial<Record<keyof typeof M06_REQUIRED_LINKS, M06CausalId>>;
  tradeoff: M06Tradeoff | null;
  recoveryCycles: number;
}) {
  const investigation = canUnlockM06Evidence(inspected) ? 15 : 0;
  const diagnosisScore = diagnosis === "CONNECTION_ADMISSION_MISMATCH" ? 10 + (m06ProofEvidenceEnough(proof, inspected) ? 5 : 0) : 0;
  const baseline = predictionAccuracyScoreM06(baselinePredictions, M06_BASELINE_DIRECTIONAL_VALUES);
  const allRuns = M06_REQUIRED_CANDIDATES.every(candidate => runs.includes(candidate));
  const controlledChange = allRuns ? 10 : 0;
  const changedPrediction = Math.round(M06_REQUIRED_CANDIDATES.reduce((total, candidate) => total + candidatePredictionScoreM06(candidate, candidatePredictions[candidate] ?? {}), 0) / M06_REQUIRED_CANDIDATES.length);
  const reconciliation = M06_REQUIRED_CANDIDATES.every(candidate => reconciled[candidate]) ? 15 : 0;
  const causal = (causalOrderCorrectM06(causalOrder) ? 10 : 0) + (causalLinksCorrectM06(causalLinks) ? 5 : 0);
  const boundary = tradeoff === "FIT_IS_MODEL_BOUND" ? 5 : 0;
  const efficiency = recoveryCycles === 0 ? 5 : recoveryCycles === 1 ? 4 : recoveryCycles === 2 ? 3 : 2;
  const total = investigation + diagnosisScore + baseline + controlledChange + changedPrediction + reconciliation + causal + boundary + efficiency;
  return { investigation, diagnosis: diagnosisScore, baseline, controlledChange, changedPrediction, reconciliation, causal, boundary, efficiency, total };
}

export const M06_REQUIRED_CANDIDATES: readonly M06Candidate[] = ["SMALL_POOL", "FIT_POOL", "LARGE_POOL"];

export function canCompleteM06({
  inspected, diagnosis, proof, baselinePredictions, baselineReconciled, candidatePredictions, runs, reconciled, causalOrder, causalLinks, tradeoff,
}: {
  inspected: M06EvidenceId[];
  diagnosis: M06Diagnosis | null;
  proof: M06EvidenceId[];
  baselinePredictions: Partial<Record<M06PredictionId, M06PredictionChoice>>;
  baselineReconciled: boolean;
  candidatePredictions: Partial<Record<M06Candidate, Partial<Record<M06PredictionId, M06PredictionChoice>>>>;
  runs: M06Candidate[];
  reconciled: Partial<Record<M06Candidate, boolean>>;
  causalOrder: M06CausalId[];
  causalLinks: Partial<Record<keyof typeof M06_REQUIRED_LINKS, M06CausalId>>;
  tradeoff: M06Tradeoff | null;
}) {
  return canUnlockM06Evidence(inspected)
    && diagnosisProofIsEnoughM06(diagnosis, proof, inspected)
    && predictionsCompleteM06(baselinePredictions)
    && baselineReconciled
    && M06_REQUIRED_CANDIDATES.every(candidate => runs.includes(candidate) && predictionsCompleteM06(candidatePredictions[candidate] ?? {}) && reconciled[candidate])
    && causalOrderCorrectM06(causalOrder)
    && causalLinksCorrectM06(causalLinks)
    && tradeoff === "FIT_IS_MODEL_BOUND";
}
