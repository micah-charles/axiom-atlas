export type M05EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07";
export type M05DependencyToken = "JDBC_DB_CALL" | "AFFECTED_SHOP_REQUEST" | "COMPARATOR_LOCAL_ACTION" | "DISK_FULL_HYPOTHESIS" | "CPU_EXHAUSTION_HYPOTHESIS";
export type M05DependencyZone = "CROSSES_DB_NETWORK_DEPENDENCY" | "DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP" | "UNSUPPORTED_CAUSE" | "UNCLASSIFIED";
export type M05Diagnosis = "NETWORK_DEPENDENCY_WAITING" | "M04_DISK_CONTENTION" | "CPU_EXHAUSTION" | "APPLICATION_CODE_STUCK_WITHOUT_DEPENDENCY_EVIDENCE";
export type M05CausalId = "WEB_DB_ARE_SEPARATE" | "DB_CALL_CROSSES_NETWORK_DEPENDENCY" | "DEPENDENCY_BECOMES_UNAVAILABLE" | "DB_DEPENDENT_REQUEST_WAITS" | "WAITING_WORK_REMAINS_OCCUPIED" | "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR" | "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT";
export type M05PredictionId = "A_AFFECTED_WAITING" | "A_ERROR_SURFACED" | "A_RETRY_SUCCESS" | "A_SLOT_CHANGED" | "A_DEPENDENCY_RECOVERED" | "B_AFFECTED_WAITING" | "B_ERROR_SURFACED" | "B_RETRY_SUCCESS" | "B_SLOT_CHANGED" | "B_DEPENDENCY_RECOVERED";
export type M05PredictionChoice = "YES" | "NO";
export type M05ResultCheckId = "A_WAITING_AT_END" | "A_NO_ERROR" | "A_NO_RECOVERY" | "B_ERROR_SURFACED" | "B_RETRY_FAILED" | "FIXED_SLOTS";
export type M05ResultChoice = "CONFIRMED" | "NOT_CONFIRMED";
export type M05Policy = "UNBOUNDED_WAIT" | "BOUNDED_TIMEOUT_ONE_RETRY" | "RETRY_UNTIL_SUCCESS" | "INCREASE_REQUEST_SLOTS";
export type M05JustificationId = "REMOTE_CALL_CAN_WAIT" | "WAIT_MUST_HAVE_A_BOUND" | "TIMEOUT_SURFACES_CONTROLLED_ERROR" | "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT" | "FIXED_SLOT_COUNT_WAS_NOT_TUNED";

export const M05_EVIDENCE = [
  { id: "E01" as const, label: "Database target", preview: "Inspect where the Web application sends its database call.", observation: "The source changes the JDBC target from localhost to a remote internal address after Web/DB separation.", interpretation: "The database call now crosses a host/network boundary.", provenance: "SOURCE_BACKED · section 1.2 topology." },
  { id: "E02" as const, label: "Call-state probe", preview: "Inspect what the affected requests are doing.", observation: "Teaching simulation: two DB-dependent requests are waiting for the dependency to complete.", interpretation: "The work has not finished and remains occupied while the dependency does not answer.", provenance: "TEACHING_SIMULATION · not production telemetry." },
  { id: "E03" as const, label: "Connection behaviour note", preview: "Inspect what changes when the DB is remote.", observation: "The source explicitly raises timeout and retry questions once the DB becomes a remote dependency.", interpretation: "A remote call needs bounded failure behaviour; it cannot be treated exactly like an in-process operation.", provenance: "SOURCE_BACKED · section 1.2 discussion." },
  { id: "E04" as const, label: "Request-slot snapshot", preview: "Inspect the controlled workload state.", observation: "Teaching simulation: the lab has 4 fixed request slots; 2 are occupied by affected DB-dependent requests.", interpretation: "Waiting work continues to occupy fixed lab slots. The slot count is evidence, not a tuning choice.", provenance: "TEACHING_SIMULATION · fixed educational model." },
  { id: "E05" as const, label: "Non-DB action comparator", preview: "Inspect an action that does not require the DB dependency in this lab step.", observation: "Teaching simulation: the comparator action does not wait on the DB path.", interpretation: "The observed wait is associated with the DB-dependent path, not all Web work indiscriminately.", provenance: "TEACHING_SIMULATION_NEGATIVE_CONTROL." },
  { id: "E06" as const, label: "Prior-incident comparator", preview: "Inspect whether the M04 storage symptom is present.", observation: "This M05 scenario supplies no evidence of a full shared disk.", interpretation: "Do not reuse M04's storage diagnosis for a different symptom.", provenance: "TEACHING_SIMULATION_NEGATIVE_CONTROL." },
  { id: "E07" as const, label: "Compute comparator", preview: "Inspect whether this incident establishes CPU exhaustion.", observation: "No CPU-exhaustion evidence is supplied in this mission.", interpretation: "A CPU upgrade would be unsupported by the observed evidence.", provenance: "TEACHING_SIMULATION_NEGATIVE_CONTROL." },
] as const;

export const M05_REQUIRED_EVIDENCE: readonly M05EvidenceId[] = ["E01", "E02", "E03", "E04", "E05"];
export const M05_COMPARATOR_EVIDENCE: readonly M05EvidenceId[] = ["E06", "E07"];
export const M05_REQUIRED_TOKENS: readonly M05DependencyToken[] = ["JDBC_DB_CALL", "AFFECTED_SHOP_REQUEST", "COMPARATOR_LOCAL_ACTION", "DISK_FULL_HYPOTHESIS", "CPU_EXHAUSTION_HYPOTHESIS"];
export const M05_REQUIRED_CAUSAL_ORDER: readonly M05CausalId[] = ["WEB_DB_ARE_SEPARATE", "DB_CALL_CROSSES_NETWORK_DEPENDENCY", "DEPENDENCY_BECOMES_UNAVAILABLE", "DB_DEPENDENT_REQUEST_WAITS", "WAITING_WORK_REMAINS_OCCUPIED", "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR", "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT"];

export const M05_CAUSAL_CLAIMS = [
  { id: "WEB_DB_ARE_SEPARATE" as const, label: "Web and DB are separate hosts." },
  { id: "DB_CALL_CROSSES_NETWORK_DEPENDENCY" as const, label: "The DB call crosses a network dependency." },
  { id: "DEPENDENCY_BECOMES_UNAVAILABLE" as const, label: "The dependency becomes unavailable." },
  { id: "DB_DEPENDENT_REQUEST_WAITS" as const, label: "The DB-dependent request waits." },
  { id: "WAITING_WORK_REMAINS_OCCUPIED" as const, label: "Waiting work remains occupied." },
  { id: "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR" as const, label: "A bounded call can return control with an error." },
  { id: "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT" as const, label: "A retry is another bounded attempt, not a guarantee." },
] as const;

export const M05_INITIAL_DEPENDENCY_MAP: Record<M05DependencyToken, M05DependencyZone> = {
  JDBC_DB_CALL: "UNCLASSIFIED",
  AFFECTED_SHOP_REQUEST: "UNCLASSIFIED",
  COMPARATOR_LOCAL_ACTION: "UNCLASSIFIED",
  DISK_FULL_HYPOTHESIS: "UNCLASSIFIED",
  CPU_EXHAUSTION_HYPOTHESIS: "UNCLASSIFIED",
};

export const M05_PREDICTIONS = [
  { id: "A_AFFECTED_WAITING" as const, label: "Unbounded wait · affected work remains waiting", correct: "YES" as const },
  { id: "A_ERROR_SURFACED" as const, label: "Unbounded wait · error surfaces in the lab window", correct: "NO" as const },
  { id: "A_RETRY_SUCCESS" as const, label: "Unbounded wait · retry guarantees success", correct: "NO" as const },
  { id: "A_SLOT_CHANGED" as const, label: "Unbounded wait · fixed slot count changes", correct: "NO" as const },
  { id: "A_DEPENDENCY_RECOVERED" as const, label: "Unbounded wait · dependency recovers during outage", correct: "NO" as const },
  { id: "B_AFFECTED_WAITING" as const, label: "Bounded timeout + one retry · affected work remains waiting", correct: "NO" as const },
  { id: "B_ERROR_SURFACED" as const, label: "Bounded timeout + one retry · error surfaces in the lab window", correct: "YES" as const },
  { id: "B_RETRY_SUCCESS" as const, label: "Bounded timeout + one retry · retry guarantees success", correct: "NO" as const },
  { id: "B_SLOT_CHANGED" as const, label: "Bounded timeout + one retry · fixed slot count changes", correct: "NO" as const },
  { id: "B_DEPENDENCY_RECOVERED" as const, label: "Bounded timeout + one retry · dependency recovers during outage", correct: "NO" as const },
] as const;

export const M05_RESULT_CHECKS = [
  { id: "A_WAITING_AT_END" as const, label: "Unbounded run: affected requests are still waiting at the end.", correct: "CONFIRMED" as const },
  { id: "A_NO_ERROR" as const, label: "Unbounded run: no dependency error surfaces within the window.", correct: "CONFIRMED" as const },
  { id: "A_NO_RECOVERY" as const, label: "Both runs: the dependency remains unavailable for the full outage.", correct: "CONFIRMED" as const },
  { id: "B_ERROR_SURFACED" as const, label: "Bounded run: an error surfaces after bounded attempts.", correct: "CONFIRMED" as const },
  { id: "B_RETRY_FAILED" as const, label: "Bounded run: the retry fails because the dependency stays unavailable.", correct: "CONFIRMED" as const },
  { id: "FIXED_SLOTS" as const, label: "Both runs: the request-slot count stays fixed.", correct: "CONFIRMED" as const },
] as const;

export const M05_JUSTIFICATIONS = [
  { id: "REMOTE_CALL_CAN_WAIT" as const, label: "A remote call can wait when its dependency does not answer." },
  { id: "WAIT_MUST_HAVE_A_BOUND" as const, label: "Waiting needs a bound so work cannot wait indefinitely." },
  { id: "TIMEOUT_SURFACES_CONTROLLED_ERROR" as const, label: "A timeout surfaces a controlled error and returns control." },
  { id: "RETRY_IS_ANOTHER_BOUNDED_ATTEMPT" as const, label: "A retry is another bounded attempt, not a guarantee of success." },
  { id: "FIXED_SLOT_COUNT_WAS_NOT_TUNED" as const, label: "The fixed slot count was evidence, not a capacity-tuning intervention." },
] as const;

export function canUnlockM05Evidence(inspected: M05EvidenceId[]) {
  const unique = new Set(inspected);
  return M05_REQUIRED_EVIDENCE.every(id => unique.has(id)) && M05_COMPARATOR_EVIDENCE.some(id => unique.has(id)) && unique.size >= 6;
}

export function correctM05DependencyMap(map: Record<M05DependencyToken, M05DependencyZone>) {
  return map.JDBC_DB_CALL === "CROSSES_DB_NETWORK_DEPENDENCY"
    && map.AFFECTED_SHOP_REQUEST === "CROSSES_DB_NETWORK_DEPENDENCY"
    && map.COMPARATOR_LOCAL_ACTION === "DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP"
    && map.DISK_FULL_HYPOTHESIS === "UNSUPPORTED_CAUSE"
    && map.CPU_EXHAUSTION_HYPOTHESIS === "UNSUPPORTED_CAUSE";
}

export function m05ProofEvidenceEnough(proof: M05EvidenceId[], inspected: M05EvidenceId[]) {
  const proofSet = new Set(proof);
  const inspectedSet = new Set(inspected);
  return [...proofSet].every(id => inspectedSet.has(id)) && proofSet.has("E01") && proofSet.has("E02") && (proofSet.has("E03") || proofSet.has("E04"));
}

export function diagnosisProofIsEnoughM05(diagnosis: M05Diagnosis | null, proof: M05EvidenceId[], inspected: M05EvidenceId[]) {
  return diagnosis === "NETWORK_DEPENDENCY_WAITING" && m05ProofEvidenceEnough(proof, inspected);
}

export function canCommitM05Predictions(predictions: Partial<Record<M05PredictionId, M05PredictionChoice>>) {
  return M05_PREDICTIONS.every(item => Boolean(predictions[item.id]));
}

export function predictionsCorrectM05(predictions: Partial<Record<M05PredictionId, M05PredictionChoice>>) {
  return M05_PREDICTIONS.every(item => predictions[item.id] === item.correct);
}

export function causalOrderCorrectM05(order: M05CausalId[]) {
  return order.length === M05_REQUIRED_CAUSAL_ORDER.length && order.every((id, index) => id === M05_REQUIRED_CAUSAL_ORDER[index]);
}

export function causalLinksCorrectM05(links: Partial<Record<"E01" | "E02" | "E03" | "E04", M05CausalId>>) {
  return links.E01 === "DB_CALL_CROSSES_NETWORK_DEPENDENCY"
    && links.E02 === "DB_DEPENDENT_REQUEST_WAITS"
    && links.E03 === "BOUNDED_CALL_POLICY_CAN_RETURN_CONTROL_WITH_ERROR"
    && links.E04 === "WAITING_WORK_REMAINS_OCCUPIED";
}

export function resultChecksCorrectM05(checks: Partial<Record<M05ResultCheckId, M05ResultChoice>>) {
  return M05_RESULT_CHECKS.every(item => checks[item.id] === item.correct);
}

export function policyJustificationCorrectM05(policy: M05Policy | null, selected: M05JustificationId[]) {
  const choices = new Set(selected);
  return policy === "BOUNDED_TIMEOUT_ONE_RETRY" && M05_JUSTIFICATIONS.every(item => choices.has(item.id));
}

export function scoreM05({
  inspected, map, diagnosis, proof, causalOrder, causalLinks, predictions, checks, policy, justifications, recoveryCycles,
}: {
  inspected: M05EvidenceId[];
  map: Record<M05DependencyToken, M05DependencyZone>;
  diagnosis: M05Diagnosis | null;
  proof: M05EvidenceId[];
  causalOrder: M05CausalId[];
  causalLinks: Partial<Record<"E01" | "E02" | "E03" | "E04", M05CausalId>>;
  predictions: Partial<Record<M05PredictionId, M05PredictionChoice>>;
  checks: Partial<Record<M05ResultCheckId, M05ResultChoice>>;
  policy: M05Policy | null;
  justifications: M05JustificationId[];
  recoveryCycles: number;
}) {
  const investigation = canUnlockM05Evidence(inspected) ? 15 : 0;
  const diagnosisScore = diagnosis === "NETWORK_DEPENDENCY_WAITING" ? 10 + (m05ProofEvidenceEnough(proof, inspected) ? 5 : 0) : 0;
  const classification = M05_REQUIRED_TOKENS.filter(id => (
    (id === "JDBC_DB_CALL" || id === "AFFECTED_SHOP_REQUEST")
      ? map[id] === "CROSSES_DB_NETWORK_DEPENDENCY"
      : id === "COMPARATOR_LOCAL_ACTION"
        ? map[id] === "DOES_NOT_USE_DB_DEPENDENCY_IN_THIS_LAB_STEP"
        : map[id] === "UNSUPPORTED_CAUSE"
  )).length * 2;
  const causal = (causalOrderCorrectM05(causalOrder) ? 10 : 0) + (causalLinksCorrectM05(causalLinks) ? 5 : 0);
  const prediction = M05_PREDICTIONS.filter(item => predictions[item.id] === item.correct).length;
  const experiment = (checks.A_WAITING_AT_END === "CONFIRMED" ? 5 : 0)
    + (checks.B_ERROR_SURFACED === "CONFIRMED" ? 5 : 0)
    + (checks.A_NO_RECOVERY === "CONFIRMED" && checks.B_RETRY_FAILED === "CONFIRMED" && checks.FIXED_SLOTS === "CONFIRMED" ? 5 : 0);
  const policyScore = policy === "BOUNDED_TIMEOUT_ONE_RETRY" ? 7 : policy ? 2 : 0;
  const justification = policyJustificationCorrectM05(policy, justifications) ? 3 : 0;
  const boundary = justifications.includes("FIXED_SLOT_COUNT_WAS_NOT_TUNED") && !justifications.includes("TIMEOUT_SURFACES_CONTROLLED_ERROR") ? 0 : justifications.includes("FIXED_SLOT_COUNT_WAS_NOT_TUNED") ? 5 : 0;
  const efficiency = recoveryCycles === 0 ? 5 : recoveryCycles === 1 ? 4 : recoveryCycles === 2 ? 3 : 2;
  const total = investigation + diagnosisScore + classification + causal + prediction + experiment + policyScore + justification + boundary + efficiency;
  return { investigation, diagnosis: diagnosisScore, classification, causal, prediction, experiment, policy: policyScore + justification, boundary, efficiency, total };
}

export function canCompleteM05({
  inspected, map, diagnosis, proof, causalOrder, causalLinks, predictions, checks, unboundedRun, boundedRun, policy, justifications,
}: {
  inspected: M05EvidenceId[];
  map: Record<M05DependencyToken, M05DependencyZone>;
  diagnosis: M05Diagnosis | null;
  proof: M05EvidenceId[];
  causalOrder: M05CausalId[];
  causalLinks: Partial<Record<"E01" | "E02" | "E03" | "E04", M05CausalId>>;
  predictions: Partial<Record<M05PredictionId, M05PredictionChoice>>;
  checks: Partial<Record<M05ResultCheckId, M05ResultChoice>>;
  unboundedRun: boolean;
  boundedRun: boolean;
  policy: M05Policy | null;
  justifications: M05JustificationId[];
}) {
  return canUnlockM05Evidence(inspected)
    && correctM05DependencyMap(map)
    && diagnosisProofIsEnoughM05(diagnosis, proof, inspected)
    && causalOrderCorrectM05(causalOrder)
    && causalLinksCorrectM05(causalLinks)
    && predictionsCorrectM05(predictions)
    && unboundedRun
    && boundedRun
    && resultChecksCorrectM05(checks)
    && policyJustificationCorrectM05(policy, justifications);
}
