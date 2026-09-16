export type M03EvidenceId = "E01" | "E02" | "E03" | "E04" | "E05";
export type M03Classification = "UNCLASSIFIED" | "BOUND_TO_HOST_01" | "NOT_PROVEN_LOCAL";
export type M03PredictionId = "P01" | "P02" | "P03";
export type M03PredictionChoice =
  | "WORKS_UNCHANGED"
  | "TARGET_NO_LONGER_MEANS_HOST_01"
  | "ALL_DATABASE_DATA_MOVES_WITH_APP"
  | "IMAGE_BYTES_AUTOMATICALLY_FOLLOW_APP"
  | "HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE"
  | "DNS_DOWNLOADS_THE_IMAGE"
  | "SESSION_MEMORY_AUTOMATICALLY_APPEARS_ON_HOST_02"
  | "EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02"
  | "MYSQL_RECREATES_IT_AUTOMATICALLY";
export type M03ResultId = "DB" | "IMAGES" | "SESSION" | "DNS";
export type M03ExplanationConceptId =
  | "SHOP_WORKS_ON_HOST_01"
  | "PLACEMENT_ASSUMPTIONS_EXIST"
  | "DB_LOCALHOST"
  | "IMAGE_LOCAL_DISK"
  | "SESSION_PROCESS_MEMORY"
  | "BOUNDARY_CHANGE_EXPOSES_COUPLING";
export type M03ExplanationLinkId = "E01" | "E02" | "E03" | "X01";

export const M03_EVIDENCE = [
  {
    id: "E01" as const,
    label: "Connection settings",
    preview: "Application startup configuration. Inspect values.",
    observation: "A database connection value includes host localhost and port 3306.",
    interpretation: "localhost resolves to the machine on which the application is running, so the DB is assumed reachable on that application host.",
    provenance: "SOURCE_BACKED · local DB placement from section 1.1; config rendering is teaching simulation.",
    correct: "BOUND_TO_HOST_01" as const,
  },
  {
    id: "E02" as const,
    label: "Product asset trace",
    preview: "Where did the page obtain its image bytes?",
    observation: "The application reads /shop/images/item-1042.jpg from the machine filesystem.",
    interpretation: "The image bytes are being read from disk attached to the current host, not from an external or shared service.",
    provenance: "SOURCE_BACKED · local image storage from section 1.1; filename/path is teaching simulation.",
    correct: "BOUND_TO_HOST_01" as const,
  },
  {
    id: "E03" as const,
    label: "Browser state trace",
    preview: "A returning shopper has an active browsing state.",
    observation: "The Session object is shown inside the Tomcat process memory of HOST 01.",
    interpretation: "This browsing state exists in the running Tomcat memory on HOST 01; another process or host does not automatically contain it.",
    provenance: "SOURCE_BACKED · Session in Tomcat memory from section 1.1; shopper identity is teaching simulation.",
    correct: "BOUND_TO_HOST_01" as const,
  },
  {
    id: "E04" as const,
    label: "Request entry trace",
    preview: "Inspect what happens before HTTP reaches the shop.",
    observation: "DNS resolves the shop domain before the browser sends HTTP, represented outside the HOST 01 box.",
    interpretation: "In this mission model, DNS is an external request-stage dependency, not evidence of application data or state stored locally on HOST 01.",
    provenance: "SOURCE_BACKED · DNS-before-HTTP; diagram placement is teaching simulation.",
    correct: "NOT_PROVEN_LOCAL" as const,
  },
  {
    id: "E05" as const,
    label: "Deployment package",
    preview: "Inspect what the application package contains.",
    observation: "The package contains executable application code, but not the DB contents, product-image directory, or live Session memory.",
    interpretation: "Moving executable code is not evidence that its dependent state or resources move with it.",
    provenance: "TEACHING_SIMULATION · package representation supports the placement distinction.",
    correct: "NOT_PROVEN_LOCAL" as const,
  },
] as const;

export const M03_REQUIRED_EVIDENCE: readonly M03EvidenceId[] = ["E01", "E02", "E03", "E04", "E05"];
export const M03_REQUIRED_CLASSIFICATIONS: readonly M03EvidenceId[] = ["E01", "E02", "E03", "E04"];

export const M03_PREDICTIONS = [
  {
    id: "P01" as const,
    title: "Connection target",
    prompt: "What happens to the localhost target when the application runs on HOST 02?",
    correct: "TARGET_NO_LONGER_MEANS_HOST_01" as const,
    options: [
      { id: "WORKS_UNCHANGED" as const, label: "It works unchanged." },
      { id: "TARGET_NO_LONGER_MEANS_HOST_01" as const, label: "The target no longer means HOST 01." },
      { id: "ALL_DATABASE_DATA_MOVES_WITH_APP" as const, label: "All database data moves with the application." },
    ],
  },
  {
    id: "P02" as const,
    title: "Product image read",
    prompt: "What happens to the observed image file when only application execution moves?",
    correct: "HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE" as const,
    options: [
      { id: "IMAGE_BYTES_AUTOMATICALLY_FOLLOW_APP" as const, label: "The image bytes automatically follow the app." },
      { id: "HOST_02_DOES_NOT_HAVE_OBSERVED_HOST_01_FILE" as const, label: "HOST 02 does not have the observed HOST 01 file." },
      { id: "DNS_DOWNLOADS_THE_IMAGE" as const, label: "DNS downloads the image." },
    ],
  },
  {
    id: "P03" as const,
    title: "Existing browsing Session",
    prompt: "What happens to the active Session object when a new process starts on HOST 02?",
    correct: "EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02" as const,
    options: [
      { id: "SESSION_MEMORY_AUTOMATICALLY_APPEARS_ON_HOST_02" as const, label: "The Session memory automatically appears on HOST 02." },
      { id: "EXISTING_HOST_01_PROCESS_MEMORY_IS_NOT_PRESENT_ON_HOST_02" as const, label: "HOST 02 does not contain the existing HOST 01 process memory." },
      { id: "MYSQL_RECREATES_IT_AUTOMATICALLY" as const, label: "MySQL recreates it automatically." },
    ],
  },
] as const;

export const M03_RESULTS = [
  { id: "DB" as const, title: "DB access", result: "NOT PRESERVED", evidence: "E01", reason: "localhost now describes the machine running the application process." },
  { id: "IMAGES" as const, title: "Product image read", result: "NOT PRESERVED", evidence: "E02", reason: "The observed file remains on HOST 01's local disk." },
  { id: "SESSION" as const, title: "Existing Session state", result: "NOT PRESERVED", evidence: "E03", reason: "The observed object remains in HOST 01 Tomcat process memory." },
  { id: "DNS" as const, title: "Entry-stage classification", result: "NOT THE LOCAL COUPLING UNDER TEST", evidence: "E04", reason: "DNS is shown outside HOST 01 and is not local application state in this experiment." },
] as const;

export const M03_EXPLANATION_CONCEPTS = [
  { id: "SHOP_WORKS_ON_HOST_01" as const, label: "The current shop works while application and local dependencies share HOST 01." },
  { id: "PLACEMENT_ASSUMPTIONS_EXIST" as const, label: "Working behaviour can rely on where data and state currently live." },
  { id: "DB_LOCALHOST" as const, label: "The DB connection assumes the database is local to the running application host." },
  { id: "IMAGE_LOCAL_DISK" as const, label: "Product image bytes are read from HOST 01's local disk." },
  { id: "SESSION_PROCESS_MEMORY" as const, label: "Existing Session state lives in Tomcat memory on HOST 01." },
  { id: "BOUNDARY_CHANGE_EXPOSES_COUPLING" as const, label: "Moving application execution alone crosses the host boundary, so local assumptions are not automatically satisfied." },
] as const;

export const M03_EXPLANATION_LINKS = [
  { id: "E01" as const, label: "DB_LOCALHOST", target: "DB_LOCALHOST" as const },
  { id: "E02" as const, label: "IMAGE_LOCAL_DISK", target: "IMAGE_LOCAL_DISK" as const },
  { id: "E03" as const, label: "SESSION_PROCESS_MEMORY", target: "SESSION_PROCESS_MEMORY" as const },
  { id: "X01" as const, label: "Host-boundary result", target: "BOUNDARY_CHANGE_EXPOSES_COUPLING" as const },
] as const;

export const M03_INITIAL_MAP: Record<M03EvidenceId, M03Classification> = {
  E01: "UNCLASSIFIED",
  E02: "UNCLASSIFIED",
  E03: "UNCLASSIFIED",
  E04: "UNCLASSIFIED",
  E05: "UNCLASSIFIED",
};

export function uniqueM03Evidence(inspected: M03EvidenceId[]) {
  return [...new Set(inspected)];
}

export function canUnlockM03Evidence(inspected: M03EvidenceId[]) {
  const unique = new Set(inspected);
  return unique.size === 5 && M03_REQUIRED_EVIDENCE.every(id => unique.has(id));
}

export function canMutateM03Classification(inspected: M03EvidenceId[], evidenceId: M03EvidenceId) {
  return canUnlockM03Evidence(inspected) && M03_REQUIRED_CLASSIFICATIONS.includes(evidenceId);
}

export function canCommitM03Map(inspected: M03EvidenceId[], map: Record<M03EvidenceId, M03Classification>) {
  return canUnlockM03Evidence(inspected)
    && M03_REQUIRED_CLASSIFICATIONS.every(id => map[id] !== "UNCLASSIFIED");
}

export function correctM03Map(map: Record<M03EvidenceId, M03Classification>) {
  return M03_EVIDENCE.filter(item => item.id !== "E05").every(item => map[item.id] === item.correct);
}

export function predictionIsCorrectM03(id: M03PredictionId, choice: M03PredictionChoice | null) {
  return M03_PREDICTIONS.find(prediction => prediction.id === id)?.correct === choice;
}

export function canCommitM03Predictions(predictions: Partial<Record<M03PredictionId, M03PredictionChoice>>) {
  return M03_PREDICTIONS.every(prediction => Boolean(predictions[prediction.id]));
}

export function correctM03ResultMatches(matches: Partial<Record<M03ResultId, M03EvidenceId>>) {
  return M03_RESULTS.every(result => matches[result.id] === result.evidence);
}

export function explanationOrderCorrect(order: M03ExplanationConceptId[]) {
  return order.length === M03_EXPLANATION_CONCEPTS.length
    && order.every((id, index) => id === M03_EXPLANATION_CONCEPTS[index].id);
}

export function explanationLinksCorrect(links: Partial<Record<M03ExplanationLinkId, M03ExplanationConceptId>>) {
  return M03_EXPLANATION_LINKS.every(link => links[link.id] === link.target);
}

export function canCompleteM03({
  inspected,
  map,
  predictions,
  matches,
  explanationOrder,
  explanationLinks,
}: {
  inspected: M03EvidenceId[];
  map: Record<M03EvidenceId, M03Classification>;
  predictions: Partial<Record<M03PredictionId, M03PredictionChoice>>;
  matches: Partial<Record<M03ResultId, M03EvidenceId>>;
  explanationOrder: M03ExplanationConceptId[];
  explanationLinks: Partial<Record<M03ExplanationLinkId, M03ExplanationConceptId>>;
}) {
  return canCommitM03Map(inspected, map)
    && correctM03Map(map)
    && canCommitM03Predictions(predictions)
    && correctM03ResultMatches(matches)
    && explanationOrderCorrect(explanationOrder)
    && explanationLinksCorrect(explanationLinks);
}

export function scoreM03({
  inspected,
  map,
  predictions,
  matches,
  explanationOrder,
  explanationLinks,
  classificationRepairs,
}: {
  inspected: M03EvidenceId[];
  map: Record<M03EvidenceId, M03Classification>;
  predictions: Partial<Record<M03PredictionId, M03PredictionChoice>>;
  matches: Partial<Record<M03ResultId, M03EvidenceId>>;
  explanationOrder: M03ExplanationConceptId[];
  explanationLinks: Partial<Record<M03ExplanationLinkId, M03ExplanationConceptId>>;
  classificationRepairs: number;
}) {
  const investigation = canUnlockM03Evidence(inspected) ? 15 : 0;
  const classification = M03_EVIDENCE.filter(item => item.id !== "E05" && map[item.id] === item.correct).length * 7.5;
  const prediction = M03_PREDICTIONS.reduce((total, item) => {
    const choice = predictions[item.id];
    return total + (choice === item.correct ? 5 : choice ? 3 : 0);
  }, 0);
  const experiment = (["DB", "IMAGES", "SESSION"] as const).filter(id => matches[id] === M03_RESULTS.find(result => result.id === id)?.evidence).length * 5;
  const causal = (explanationOrderCorrect(explanationOrder) ? 12 : Math.min(12, explanationOrder.filter((id, index) => id === M03_EXPLANATION_CONCEPTS[index]?.id).length * 2))
    + (explanationLinksCorrect(explanationLinks) ? 8 : M03_EXPLANATION_LINKS.filter(link => explanationLinks[link.id] === link.target).length * 2);
  const efficiency = classificationRepairs === 0 ? 5 : classificationRepairs === 1 ? 4 : classificationRepairs === 2 ? 3 : 2;
  const total = investigation + classification + prediction + experiment + causal + efficiency;
  return { investigation, classification, prediction, experiment, causal, efficiency, total };
}
