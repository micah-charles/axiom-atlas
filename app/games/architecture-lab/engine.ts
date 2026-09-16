export type EvidenceId = "E01" | "E02" | "E03" | "E04";
export type ApproachId = "A" | "B" | "C" | "D";

export const M01_EVIDENCE = [
  {
    id: "E01" as const,
    label: "Business envelope",
    observation: "A few hundred products, fewer than 100 concurrent users, and a quick launch matter now.",
    interpretation: "The current workload is small enough that unnecessary infrastructure has a real cost.",
    source: "Source-backed constraints adapted to fictional Atlas Market.",
  },
  {
    id: "E02" as const,
    label: "Available host",
    observation: "One Linux host is available before any additional infrastructure is requested.",
    interpretation: "Test the available host against the present need before expanding the system.",
    source: "Source-backed one-host starting model; availability and lab cost are simulated.",
  },
  {
    id: "E03" as const,
    label: "Required request journey",
    observation: "A customer needs a path from the shop domain to an HTTP application, product data and a response.",
    interpretation: "A functioning design needs both an application path and a data path.",
    source: "Source-backed request journey from section 1.1.",
  },
  {
    id: "E04" as const,
    label: "Local state requirements",
    observation: "The first release also needs product images and a browsing Session.",
    interpretation: "Local disk, local data and in-memory Session can be co-located now, but create shared failure fate.",
    source: "Source-backed local assumptions from section 1.1.",
  },
] as const;

export const M01_TRACE = [
  { event: "DNS lookup", detail: "The shop domain resolves to the one available host address.", target: "DNS" },
  { event: "HTTP request", detail: "The browser sends the product request to Tomcat.", target: "Tomcat" },
  { event: "Application processing", detail: "Tomcat handles the request and keeps the browsing Session in memory.", target: "Tomcat" },
  { event: "JDBC product read", detail: "Tomcat reads product and order data from local MySQL.", target: "MySQL" },
  { event: "Local image read", detail: "The product image comes from the host's local disk.", target: "Images" },
  { event: "Response", detail: "The product page returns to the customer browser.", target: "Browser" },
] as const;

export const TARGET_NODES = [
  { id: "host", label: "Linux host", kind: "host", detail: "One shared failure domain" },
  { id: "tomcat", label: "Tomcat", kind: "application", detail: "HTTP application + in-memory Session" },
  { id: "mysql", label: "MySQL", kind: "database", detail: "Local product and order data" },
  { id: "images", label: "Local images", kind: "storage", detail: "Product files on local disk" },
] as const;

export function canUnlockApproaches(inspected: EvidenceId[]) {
  const unique = new Set(inspected);
  return unique.size >= 3 && unique.has("E01") && (unique.has("E03") || unique.has("E04"));
}

export function approachResult(approach: ApproachId) {
  if (approach === "A") {
    return {
      id: approach,
      label: "Use the available host",
      status: "READY_TO_SERVE" as const,
      costUnits: 4,
      complexityPoints: 2,
      setupSteps: 3,
      requestMs: 80,
      copy: "The smallest complete request path is ready to test.",
    };
  }
  if (approach === "B") {
    return {
      id: approach,
      label: "Request a redundant web tier",
      status: "PREVIEW_BLOCKED_UNRESOLVED_PLACEMENT" as const,
      costUnits: 10,
      complexityPoints: 7,
      setupSteps: 8,
      requestMs: null,
      copy: "Preview only: request distribution, Session, images and authoritative data placement are unresolved.",
    };
  }
  if (approach === "C") {
    return {
      id: approach,
      label: "Request a multi-node managed platform",
      status: "PREVIEW_BLOCKED_OVERBUILT_AND_UNRESOLVED" as const,
      costUnits: 18,
      complexityPoints: 12,
      setupSteps: 14,
      requestMs: null,
      copy: "Preview only: the present evidence does not require this extra machinery, and placement is unresolved.",
    };
  }
  return {
    id: approach,
    label: "Database-only shop",
    status: "FUNCTIONAL_REQUIREMENT_MISSING" as const,
    costUnits: 2,
    complexityPoints: 1,
    setupSteps: 1,
    requestMs: null,
    copy: "The browser has no HTTP application path that can serve a product page and accept an order.",
  };
}

export function scoreExplanation(selectedEvidence: string[], acknowledgedFailureDomain: boolean) {
  const fit = selectedEvidence.includes("E01") && selectedEvidence.includes("E03");
  const state = selectedEvidence.includes("E04");
  const diagnosis = fit ? 25 : selectedEvidence.includes("E01") ? 15 : 0;
  const proportionality = fit ? 25 : 10;
  const reliability = acknowledgedFailureDomain ? 20 : 0;
  const explanation = fit && state && acknowledgedFailureDomain ? 20 : fit && acknowledgedFailureDomain ? 16 : 8;
  const efficiency = selectedEvidence.length <= 4 ? 10 : 7;
  return {
    diagnosis,
    proportionality,
    reliability,
    explanation,
    efficiency,
    total: diagnosis + proportionality + reliability + explanation + efficiency,
  };
}
