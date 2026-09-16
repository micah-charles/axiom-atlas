export type M04EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05" | "E06" | "E07";
export type M04ResourceToken = "MYSQL_PERSISTENT_DATA" | "TOMCAT_LOG_WRITE" | "SELLER_IMAGE_WRITE" | "CPU_COMPARATOR" | "REQUEST_PATH_COMPARATOR";
export type M04ResourceZone = "SHARED_LOCAL_DISK" | "NOT_SHOWN_TO_CONSUME_THIS_DISK" | "UNCLASSIFIED";
export type M04Diagnosis = "SHARED_DISK_CAPACITY" | "CPU_CAPACITY" | "REQUEST_PATH_FAILURE" | "APPLICATION_LOGGER_ONLY";
export type M04CausalId = "CATALOGUE_GROWS" | "PERSISTENT_DB_DATA_GROWS" | "DB_AND_APP_WRITES_SHARE_FINITE_DISK" | "SHARED_DISK_REACHES_CAPACITY" | "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE";
export type M04PredictionId = "A_DB_WRITE" | "A_LOG_WRITE" | "A_IMAGE_WRITE" | "B_WRITES_AVAILABLE" | "B_SAME_BOUNDARY";
export type M04PredictionChoice = "BLOCKED" | "AVAILABLE" | "SAME" | "SEPARATE";
export type M04ResultCheckId = "SHARED_WRITES_BLOCKED" | "ISOLATED_WRITES_AVAILABLE" | "FINITE_BOUNDARY";
export type M04ResultChoice = "CONFIRMED" | "NOT_CONFIRMED";
export type M04Intervention = "WEB_DB_ISOLATION" | "BIGGER_SINGLE_HOST_DISK" | "CPU_UPGRADE_ONLY" | "LOGGER_CHANGE_ONLY";
export type M04JustificationId = "PROVEN_SHARED_DISK" | "SEPARATE_RESOURCE_DOMAINS" | "FINITE_DOMAINS" | "NETWORK_TRADEOFF" | "CPU_FIX";

export const M04_EVIDENCE = [
  { id: "E01" as const, label: "Catalogue snapshot", preview: "Compare the earlier shop with the current catalogue.", observation: "The source describes growth from hundreds of products to tens of thousands.", interpretation: "More persistent catalogue content can require more stored data; this does not by itself prove which resource is exhausted.", provenance: "SOURCE_BACKED · growth direction from section 1.2." },
  { id: "E02" as const, label: "HOST 01 storage probe", preview: "Inspect the finite local resource shared by current processes.", observation: "Teaching simulation: occupied storage is 100 of 100 LAB UNITS.", interpretation: "The simulated shared disk has no free capacity.", provenance: "TEACHING_SIMULATION · LAB UNITS, not a production measurement." },
  { id: "E03" as const, label: "Persistent data directory", preview: "Inspect what is consuming persistent storage.", observation: "Source: MySQL data files filled the disk. The lab visualises DB data as 76 of the 100 occupied LAB UNITS.", interpretation: "Database persistence is a major consumer of the same finite disk used by the application host.", provenance: "SOURCE_BACKED + TEACHING_SIMULATION · allocation is lab-only." },
  { id: "E04" as const, label: "Application write check", preview: "Inspect a write the application attempted during the incident.", observation: "Tomcat cannot write its log.", interpretation: "The failure affects a write outside MySQL, consistent with a shared storage boundary.", provenance: "SOURCE_BACKED · symptom from section 1.2." },
  { id: "E05" as const, label: "Seller action check", preview: "Inspect what happens when a seller adds a product image.", observation: "The image cannot be stored because there is no disk space.", interpretation: "A second non-database write is blocked by the same finite local resource.", provenance: "SOURCE_BACKED · symptom from section 1.2." },
  { id: "E06" as const, label: "Compute comparator", preview: "Inspect whether this case establishes CPU exhaustion.", observation: "This mission provides no evidence that CPU capacity is exhausted.", interpretation: "A CPU-upgrade diagnosis is unsupported by this incident.", provenance: "TEACHING_SIMULATION · negative control." },
  { id: "E07" as const, label: "Entry-path comparator", preview: "Inspect whether this case establishes DNS or HTTP-path failure.", observation: "The incident evidence does not establish DNS resolution or HTTP routing failure.", interpretation: "Do not reuse an earlier latency/path diagnosis when the observed failures are storage writes.", provenance: "TEACHING_SIMULATION · negative control." },
] as const;

export const M04_REQUIRED_EVIDENCE: readonly M04EvidenceId[] = ["E01", "E02", "E03", "E04", "E05"];
export const M04_COMPARATOR_EVIDENCE: readonly M04EvidenceId[] = ["E06", "E07"];
export const M04_REQUIRED_TOKENS: readonly M04ResourceToken[] = ["MYSQL_PERSISTENT_DATA", "TOMCAT_LOG_WRITE", "SELLER_IMAGE_WRITE", "CPU_COMPARATOR", "REQUEST_PATH_COMPARATOR"];
export const M04_REQUIRED_CAUSAL_ORDER: readonly M04CausalId[] = ["CATALOGUE_GROWS", "PERSISTENT_DB_DATA_GROWS", "DB_AND_APP_WRITES_SHARE_FINITE_DISK", "SHARED_DISK_REACHES_CAPACITY", "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE"];

export const M04_CAUSAL_CLAIMS = [
  { id: "CATALOGUE_GROWS" as const, label: "The catalogue grows." },
  { id: "PERSISTENT_DB_DATA_GROWS" as const, label: "Persistent DB data grows." },
  { id: "DB_AND_APP_WRITES_SHARE_FINITE_DISK" as const, label: "DB and application writes share one finite disk." },
  { id: "SHARED_DISK_REACHES_CAPACITY" as const, label: "The shared disk reaches its capacity boundary." },
  { id: "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE" as const, label: "Tomcat log and image writes cannot obtain space." },
] as const;

export const M04_INITIAL_RESOURCE_MAP: Record<M04ResourceToken, M04ResourceZone> = {
  MYSQL_PERSISTENT_DATA: "UNCLASSIFIED",
  TOMCAT_LOG_WRITE: "UNCLASSIFIED",
  SELLER_IMAGE_WRITE: "UNCLASSIFIED",
  CPU_COMPARATOR: "UNCLASSIFIED",
  REQUEST_PATH_COMPARATOR: "UNCLASSIFIED",
};

export const M04_PREDICTIONS = [
  { id: "A_DB_WRITE" as const, label: "Current shared condition · DB persistent write", prompt: "At 100/100 shared lab units, what happens?", correct: "BLOCKED" as const, options: ["BLOCKED", "AVAILABLE"] as const },
  { id: "A_LOG_WRITE" as const, label: "Current shared condition · Tomcat log write", prompt: "What happens to a new application log write?", correct: "BLOCKED" as const, options: ["BLOCKED", "AVAILABLE"] as const },
  { id: "A_IMAGE_WRITE" as const, label: "Current shared condition · seller image write", prompt: "What happens to a new product-image write?", correct: "BLOCKED" as const, options: ["BLOCKED", "AVAILABLE"] as const },
  { id: "B_WRITES_AVAILABLE" as const, label: "Separated condition · tested writes", prompt: "What do you predict after Web/DB resource boundaries are separated?", correct: "AVAILABLE" as const, options: ["BLOCKED", "AVAILABLE"] as const },
  { id: "B_SAME_BOUNDARY" as const, label: "Separated condition · capacity boundary", prompt: "Do Web and DB still consume the exact same disk boundary?", correct: "SEPARATE" as const, options: ["SAME", "SEPARATE"] as const },
] as const;

export const M04_RESULT_CHECKS = [
  { id: "SHARED_WRITES_BLOCKED" as const, label: "Shared condition: log and image writes are blocked.", correct: "CONFIRMED" as const },
  { id: "ISOLATED_WRITES_AVAILABLE" as const, label: "Separated condition: tested writes have space in the lab model.", correct: "CONFIRMED" as const },
  { id: "FINITE_BOUNDARY" as const, label: "Isolation does not make either disk infinite.", correct: "CONFIRMED" as const },
] as const;

export const M04_JUSTIFICATIONS = [
  { id: "PROVEN_SHARED_DISK" as const, label: "The proven cause is one shared finite disk." },
  { id: "SEPARATE_RESOURCE_DOMAINS" as const, label: "Isolation gives Web/application and DB separate resource domains." },
  { id: "FINITE_DOMAINS" as const, label: "Each new resource domain remains finite." },
  { id: "NETWORK_TRADEOFF" as const, label: "Web-to-DB access becomes a network dependency." },
  { id: "CPU_FIX" as const, label: "A CPU change would remove the proven storage contention." },
] as const;

export function canUnlockM04Evidence(inspected: M04EvidenceId[]) {
  const unique = new Set(inspected);
  return M04_REQUIRED_EVIDENCE.every(id => unique.has(id)) && M04_COMPARATOR_EVIDENCE.some(id => unique.has(id)) && unique.size >= 6;
}

export function canCommitM04ResourceMap(map: Record<M04ResourceToken, M04ResourceZone>) {
  return M04_REQUIRED_TOKENS.every(id => map[id] !== "UNCLASSIFIED");
}

export function correctM04ResourceMap(map: Record<M04ResourceToken, M04ResourceZone>) {
  return map.MYSQL_PERSISTENT_DATA === "SHARED_LOCAL_DISK"
    && map.TOMCAT_LOG_WRITE === "SHARED_LOCAL_DISK"
    && map.SELLER_IMAGE_WRITE === "SHARED_LOCAL_DISK"
    && map.CPU_COMPARATOR === "NOT_SHOWN_TO_CONSUME_THIS_DISK"
    && map.REQUEST_PATH_COMPARATOR === "NOT_SHOWN_TO_CONSUME_THIS_DISK";
}

export function diagnosisProofIsEnough(diagnosis: M04Diagnosis | null, proof: M04EvidenceId[]) {
  return diagnosis === "SHARED_DISK_CAPACITY" && m04ProofEvidenceEnough(proof);
}

export function m04ProofEvidenceEnough(proof: M04EvidenceId[]) {
  const unique = new Set(proof);
  return unique.has("E02")
    && ["E03", "E04", "E05"].filter(id => unique.has(id)).length >= 2;
}

export function canCommitM04Predictions(predictions: Partial<Record<M04PredictionId, M04PredictionChoice>>) {
  return M04_PREDICTIONS.every(item => Boolean(predictions[item.id]));
}

export function predictionsCorrectM04(predictions: Partial<Record<M04PredictionId, M04PredictionChoice>>) {
  return M04_PREDICTIONS.every(item => predictions[item.id] === item.correct);
}

export function resultChecksCorrectM04(checks: Partial<Record<M04ResultCheckId, M04ResultChoice>>) {
  return M04_RESULT_CHECKS.every(item => checks[item.id] === item.correct);
}

export function causalOrderCorrectM04(order: M04CausalId[]) {
  return order.length === M04_REQUIRED_CAUSAL_ORDER.length && order.every((id, index) => id === M04_REQUIRED_CAUSAL_ORDER[index]);
}

export function causalLinksCorrectM04(links: Partial<Record<"E01" | "E02" | "E03" | "E04" | "E05", M04CausalId>>) {
  return links.E01 === "CATALOGUE_GROWS"
    && links.E03 === "PERSISTENT_DB_DATA_GROWS"
    && links.E02 === "SHARED_DISK_REACHES_CAPACITY"
    && links.E04 === "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE"
    && links.E05 === "TOMCAT_LOG_AND_IMAGE_WRITES_CANNOT_OBTAIN_SPACE";
}

export function interventionJustificationCorrectM04(intervention: M04Intervention | null, selected: M04JustificationId[]) {
  const choices = new Set(selected);
  return intervention === "WEB_DB_ISOLATION"
    && choices.has("PROVEN_SHARED_DISK")
    && choices.has("SEPARATE_RESOURCE_DOMAINS")
    && choices.has("FINITE_DOMAINS");
}

export function canCompleteM04({
  inspected, map, diagnosis, proof, predictions, checks, causalOrder, causalLinks, intervention, justifications, tradeoff,
}: {
  inspected: M04EvidenceId[];
  map: Record<M04ResourceToken, M04ResourceZone>;
  diagnosis: M04Diagnosis | null;
  proof: M04EvidenceId[];
  predictions: Partial<Record<M04PredictionId, M04PredictionChoice>>;
  checks: Partial<Record<M04ResultCheckId, M04ResultChoice>>;
  causalOrder: M04CausalId[];
  causalLinks: Partial<Record<"E01" | "E02" | "E03" | "E04" | "E05", M04CausalId>>;
  intervention: M04Intervention | null;
  justifications: M04JustificationId[];
  tradeoff: boolean;
}) {
  return canUnlockM04Evidence(inspected)
    && correctM04ResourceMap(map)
    && diagnosisProofIsEnough(diagnosis, proof)
    && predictionsCorrectM04(predictions)
    && resultChecksCorrectM04(checks)
    && causalOrderCorrectM04(causalOrder)
    && causalLinksCorrectM04(causalLinks)
    && interventionJustificationCorrectM04(intervention, justifications)
    && tradeoff;
}

export function scoreM04({
  inspected, map, diagnosis, proof, predictions, checks, causalOrder, causalLinks, intervention, justifications, tradeoff, recoveryCycles,
}: {
  inspected: M04EvidenceId[];
  map: Record<M04ResourceToken, M04ResourceZone>;
  diagnosis: M04Diagnosis | null;
  proof: M04EvidenceId[];
  predictions: Partial<Record<M04PredictionId, M04PredictionChoice>>;
  checks: Partial<Record<M04ResultCheckId, M04ResultChoice>>;
  causalOrder: M04CausalId[];
  causalLinks: Partial<Record<"E01" | "E02" | "E03" | "E04" | "E05", M04CausalId>>;
  intervention: M04Intervention | null;
  justifications: M04JustificationId[];
  tradeoff: boolean;
  recoveryCycles: number;
}) {
  const investigation = canUnlockM04Evidence(inspected) ? 15 : 0;
  const diagnosisScore = diagnosis === "SHARED_DISK_CAPACITY" ? 10 + (diagnosisProofIsEnough(diagnosis, proof) ? 5 : 0) : 0;
  const resourceMap = M04_REQUIRED_TOKENS.filter(id => (
    (id === "MYSQL_PERSISTENT_DATA" || id === "TOMCAT_LOG_WRITE" || id === "SELLER_IMAGE_WRITE")
      ? map[id] === "SHARED_LOCAL_DISK"
      : map[id] === "NOT_SHOWN_TO_CONSUME_THIS_DISK"
  )).length * 2;
  const causal = (causalOrderCorrectM04(causalOrder) ? 10 : 0) + (causalLinksCorrectM04(causalLinks) ? 5 : 0);
  const prediction = M04_PREDICTIONS.filter(item => predictions[item.id] === item.correct).length * 2;
  const experiment = (checks.SHARED_WRITES_BLOCKED === "CONFIRMED" ? 4 : 0)
    + (checks.ISOLATED_WRITES_AVAILABLE === "CONFIRMED" ? 4 : 0)
    + (checks.FINITE_BOUNDARY === "CONFIRMED" ? 2 : 0);
  const interventionScore = intervention === "WEB_DB_ISOLATION" ? 10 : intervention === "BIGGER_SINGLE_HOST_DISK" ? 6 : intervention ? 2 : 0;
  const justification = interventionJustificationCorrectM04(intervention, justifications) ? 5 : 0;
  const tradeoffScore = tradeoff ? 5 : 0;
  const efficiency = recoveryCycles === 0 ? 5 : recoveryCycles === 1 ? 4 : recoveryCycles === 2 ? 3 : 2;
  const total = investigation + diagnosisScore + resourceMap + causal + prediction + experiment + interventionScore + justification + tradeoffScore + efficiency;
  return { investigation, diagnosis: diagnosisScore, resourceMap, causal, prediction, experiment, intervention: interventionScore, justification, tradeoff: tradeoffScore, efficiency, total };
}
