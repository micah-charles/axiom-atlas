export type M02EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05";
export type M02StageId = "DNS_RESOLUTION" | "HTTP_CONNECTION" | "TOMCAT_PROCESSING" | "JDBC_MYSQL_QUERY" | "RESPONSE";
export type M02ProfileId = "healthy" | "incident_baseline" | "dns_delay_control" | "server_delay_control";
export type M02ExperimentId = "X01_DNS_DELAY_CONTROL" | "X02_SERVER_DELAY_CONTROL";
export type M02FinalEvidenceId = "BASELINE_MEASUREMENT" | "CONTROLLED_COMPARISON" | "DNS_BEFORE_HTTP";

export const M02_STAGE_ORDER: readonly M02StageId[] = [
  "DNS_RESOLUTION",
  "HTTP_CONNECTION",
  "TOMCAT_PROCESSING",
  "JDBC_MYSQL_QUERY",
  "RESPONSE",
];

export const M02_EVIDENCE = [
  {
    id: "E01" as const,
    label: "Customer symptom",
    observation: "The product page eventually loads, but today it feels slow.",
    interpretation: "The symptom is real, but the responsible request layer is still unknown.",
    source: "Fictional Atlas Market incident; timing is teaching simulation.",
  },
  {
    id: "E02" as const,
    label: "Request journey",
    observation: "A browser request resolves a domain before it can connect to the shop application.",
    interpretation: "DNS resolution is a separate pre-server stage in this source-derived model.",
    source: "Source-backed section 1.1 request journey.",
  },
  {
    id: "E03" as const,
    label: "Application path",
    observation: "HTTP reaches Tomcat, which invokes application logic before the response returns.",
    interpretation: "Server/application processing is a distinct stage from DNS resolution.",
    source: "Source-backed section 1.1 Tomcat request journey.",
  },
  {
    id: "E04" as const,
    label: "Measured baseline probe",
    observation: "The lab can expose a fixed timing for each request stage after the baseline trace.",
    interpretation: "Segment evidence is needed; total latency alone cannot identify the cause.",
    source: "Teaching simulation built from source-backed causal stages.",
  },
  {
    id: "E05" as const,
    label: "Diagnostic principle",
    observation: "A slow DNS step can make the whole site feel slow without making Tomcat slow.",
    interpretation: "Compare layers before changing architecture.",
    source: "Source-backed section 1.1 DNS-slowness question, expressed as a lab clue.",
  },
] as const;

export const M02_TIMINGS: Record<M02ProfileId, Record<M02StageId, number>> = {
  healthy: {
    DNS_RESOLUTION: 20,
    HTTP_CONNECTION: 30,
    TOMCAT_PROCESSING: 90,
    JDBC_MYSQL_QUERY: 70,
    RESPONSE: 40,
  },
  incident_baseline: {
    DNS_RESOLUTION: 420,
    HTTP_CONNECTION: 30,
    TOMCAT_PROCESSING: 90,
    JDBC_MYSQL_QUERY: 70,
    RESPONSE: 40,
  },
  dns_delay_control: {
    DNS_RESOLUTION: 820,
    HTTP_CONNECTION: 30,
    TOMCAT_PROCESSING: 90,
    JDBC_MYSQL_QUERY: 70,
    RESPONSE: 40,
  },
  server_delay_control: {
    DNS_RESOLUTION: 20,
    HTTP_CONNECTION: 30,
    TOMCAT_PROCESSING: 490,
    JDBC_MYSQL_QUERY: 70,
    RESPONSE: 40,
  },
};

export const M02_EXPERIMENTS = {
  X01_DNS_DELAY_CONTROL: {
    id: "X01_DNS_DELAY_CONTROL" as const,
    label: "Add DNS-only delay",
    profile: "dns_delay_control" as const,
    comparison: "incident_baseline" as const,
    correctPrediction: "DNS_CHANGES_SERVER_STAYS",
    predictionOptions: [
      { id: "DNS_CHANGES_SERVER_STAYS", label: "DNS changes; Tomcat and JDBC stay the same." },
      { id: "TOMCAT_RISES_WITH_TOTAL", label: "Tomcat must rise because the total rises." },
      { id: "JDBC_RISES_WITH_DNS", label: "JDBC must rise whenever DNS is slower." },
    ],
  },
  X02_SERVER_DELAY_CONTROL: {
    id: "X02_SERVER_DELAY_CONTROL" as const,
    label: "Add Tomcat-processing-only delay",
    profile: "server_delay_control" as const,
    comparison: "healthy" as const,
    correctPrediction: "TOMCAT_CHANGES_DNS_STAYS",
    predictionOptions: [
      { id: "TOMCAT_CHANGES_DNS_STAYS", label: "Tomcat changes; DNS stays the same." },
      { id: "DNS_RISES_WITH_TOTAL", label: "DNS must rise because the whole site feels slower." },
      { id: "ALL_SEGMENTS_RISE", label: "Every segment rises together." },
    ],
  },
} as const;

export const M02_EXPLANATION_OPTIONS = [
  { id: "SYMPTOM_650", label: "The customer experiences a 650 ms request." },
  { id: "DNS_BEFORE_HTTP", label: "DNS occurs before the HTTP connection to Tomcat." },
  { id: "BASELINE_DNS_420", label: "DNS consumes 420 ms in the incident baseline." },
  { id: "INCIDENT_DNS_DIAGNOSIS", label: "The actual incident's slow segment is DNS resolution." },
  { id: "SAME_SYMPTOM_DIFFERENT_LAYER", label: "The same visible slowness can come from different layers." },
  { id: "DIAGNOSE_BEFORE_ARCHITECTURE_CHANGE", label: "Diagnose the layer before changing architecture." },
] as const;

export const M02_FINAL_EVIDENCE = [
  { id: "BASELINE_MEASUREMENT" as const, label: "Baseline measurement" },
  { id: "CONTROLLED_COMPARISON" as const, label: "Controlled comparison" },
  { id: "DNS_BEFORE_HTTP" as const, label: "DNS occurs before HTTP" },
] as const;

export function uniqueM02Evidence(inspected: M02EvidenceId[]) {
  return [...new Set(inspected)];
}

export function canUnlockM02Evidence(inspected: M02EvidenceId[]) {
  const unique = new Set(inspected);
  return unique.size >= 3 && unique.has("E01") && unique.has("E02") && ["E03", "E04", "E05"].some(id => unique.has(id));
}

export function validateM02Route(route: M02StageId[]) {
  return route.length === M02_STAGE_ORDER.length && route.every((stage, index) => stage === M02_STAGE_ORDER[index]);
}

export function m02RouteFeedback(route: M02StageId[]) {
  const positions = new Map(route.map((stage, index) => [stage, index]));
  if (positions.get("HTTP_CONNECTION")! < positions.get("DNS_RESOLUTION")!) {
    return { id: "HTTP_BEFORE_DNS", message: "The browser cannot send HTTP until it knows where the domain resolves." };
  }
  if (positions.get("JDBC_MYSQL_QUERY")! < positions.get("TOMCAT_PROCESSING")!) {
    return { id: "JDBC_BEFORE_TOMCAT", message: "JDBC is used by application logic after HTTP reaches Tomcat; the browser does not query MySQL directly." };
  }
  if (positions.get("RESPONSE")! < positions.get("JDBC_MYSQL_QUERY")!) {
    return { id: "RESPONSE_BEFORE_DATA", message: "The response cannot leave before the product-data query has completed." };
  }
  return { id: "ROUTE_ORDER_UNCLEAR", message: "That journey cannot run yet. Recheck which layer must happen before the next one." };
}

export function canCommitM02Diagnosis(inspected: M02EvidenceId[], baselineComplete: boolean, diagnosis: M02StageId | "TOTAL_BLAMES_SERVER" | null) {
  return Boolean(diagnosis) && baselineComplete && new Set(inspected).has("E04");
}

export function canSubmitM02FinalDiagnosis(finalDiagnosis: M02StageId | "TOTAL_BLAMES_SERVER" | null, finalEvidence: M02FinalEvidenceId[], experimentsRun: number) {
  const evidence = new Set(finalEvidence);
  return finalDiagnosis === "DNS_RESOLUTION" && experimentsRun >= 1 && evidence.has("BASELINE_MEASUREMENT") && evidence.has("CONTROLLED_COMPARISON");
}

export function timingTotal(profile: M02ProfileId) {
  return M02_STAGE_ORDER.reduce((total, stage) => total + M02_TIMINGS[profile][stage], 0);
}

export function experimentResult(experiment: M02ExperimentId) {
  const definition = M02_EXPERIMENTS[experiment];
  return {
    ...definition,
    values: M02_TIMINGS[definition.profile],
    comparisonValues: M02_TIMINGS[definition.comparison],
    total: timingTotal(definition.profile),
    comparisonTotal: timingTotal(definition.comparison),
  };
}

export function predictionIsCorrect(experiment: M02ExperimentId, prediction: string) {
  return M02_EXPERIMENTS[experiment].correctPrediction === prediction;
}

export function explanationIsComplete(selected: string[]) {
  const chosen = new Set(selected);
  return M02_EXPLANATION_OPTIONS.every(option => chosen.has(option.id));
}

export function explanationMatchesM02Diagnosis(finalDiagnosis: M02StageId | "TOTAL_BLAMES_SERVER" | null, selected: string[]) {
  return finalDiagnosis === "DNS_RESOLUTION" && selected.includes("INCIDENT_DNS_DIAGNOSIS");
}

export function scoreM02({
  inspected,
  routeRepairs,
  firstDiagnosis,
  finalDiagnosis,
  predictionMistakes,
  experimentsRun,
  explanation,
}: {
  inspected: M02EvidenceId[];
  routeRepairs: number;
  firstDiagnosis: M02StageId | "TOTAL_BLAMES_SERVER" | null;
  finalDiagnosis: M02StageId | "TOTAL_BLAMES_SERVER" | null;
  predictionMistakes: number;
  experimentsRun: number;
  explanation: string[];
}) {
  const unique = uniqueM02Evidence(inspected);
  const investigation = unique.length === 3 && unique.includes("E04") ? 15 : unique.length >= 4 ? 12 : unique.length >= 3 ? 10 : 0;
  const ordering = routeRepairs === 0 ? 20 : routeRepairs === 1 ? 16 : routeRepairs === 2 ? 12 : routeRepairs >= 3 ? 8 : 0;
  const diagnosis = finalDiagnosis !== "DNS_RESOLUTION" ? 0 : firstDiagnosis === "DNS_RESOLUTION" ? 20 : 12;
  const prediction = predictionMistakes === 0 ? 15 : predictionMistakes === 1 ? 10 : 6;
  const comparison = experimentsRun >= 2 ? 15 : experimentsRun === 1 ? 12 : 0;
  const explanationScore = explanationIsComplete(explanation) ? 15 : new Set(explanation).size * 2;
  return {
    investigation,
    ordering,
    diagnosis,
    prediction,
    comparison,
    explanation: Math.min(15, explanationScore),
    total: investigation + ordering + diagnosis + prediction + comparison + Math.min(15, explanationScore),
  };
}
