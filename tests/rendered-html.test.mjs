import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the Axiom Atlas platform entrance", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Axiom Atlas/);
  assert.match(html, /Explore\.[\s\S]*Discover\.[\s\S]*Understand\./);
  assert.match(html, /Math &amp; Logic|Math & Logic/);
  assert.match(html, /Geography/);
  assert.match(html, /An interactive atlas of ideas/);
  assert.doesNotMatch(html, /<MathLogicGame|Core Interaction Lab/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("server-renders the Math realm without Climate Detective", async () => {
  const response = await render("/math-logic");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Subject realm · Math &amp; Logic|Subject realm · Math & Logic/);
  assert.match(html, /Core Interaction Lab/);
  assert.match(html, /Advanced Worlds/);
  assert.match(html, /Optimisation Valley/);
  assert.doesNotMatch(html, /Climate Detective/);
});

test("server-renders Geography and Climate Detective route shells", async () => {
  const [geography, landing, investigation] = await Promise.all([
    render("/geography"),
    render("/geography/climate-detective"),
    render("/geography/climate-detective/investigation"),
  ]);
  const geographyHtml = await geography.text();
  const landingHtml = await landing.text();
  const investigationHtml = await investigation.text();
  assert.match(geographyHtml, /Geography Atlas/);
  assert.match(geographyHtml, /Climate Detective/i);
  assert.match(geographyHtml, /Coming later/);
  assert.match(landingHtml, /Investigate\. Analyse\. Explain\./);
  assert.match(landingHtml, /Begin investigation/);
  assert.match(landingHtml, /NASA POWER/);
  assert.match(investigationHtml, /North Atlantic investigation surface/);
  assert.match(investigationHtml, /Axiom Atlas · Geography · Climate Detective · Investigation/);
});

test("server-renders the Architecture Evolution Lab M01 shell", async () => {
  const response = await render("/computer-science/architecture-lab");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /Architecture Evolution Lab/);
  assert.match(html, /M01 — OPEN THE SHOP|M01/);
  assert.match(html, /Read the evidence first/);
  assert.match(html, /No serving topology yet/);
  assert.match(html, /Atlas Market is fictional/i);
});

test("server-renders the Architecture Evolution Lab M02 shell", async () => {
  const response = await render("/computer-science/architecture-lab/m02");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M02 — FOLLOW ONE REQUEST|M02/);
  assert.match(html, /The page feels slow/);
  assert.match(html, /650 ms/);
  assert.match(html, /LAB TIMING/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.match(html, /request resolves a domain/i);
  assert.match(html, /arch-m02-request-board/);
  assert.match(html, /Where did this request spend its time/);
  assert.match(html, /not yet measured/);
  assert.doesNotMatch(html, /control 420 ms/);
  assert.doesNotMatch(html, /DNS resolution, 420 milliseconds/);
});

test("server-renders the Architecture Evolution Lab M03 shell", async () => {
  const response = await render("/computer-science/architecture-lab/m03");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M03 — FIND THE THREE LOCAL ASSUMPTIONS|M03/);
  assert.match(html, /The shop works\. Is it portable\?/);
  assert.match(html, /INSPECT ALL FIVE BEFORE CLASSIFICATION/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.match(html, /HOST 01/);
});

test("server-renders the Architecture Evolution Lab M04 shell without answer leakage", async () => {
  const response = await render("/computer-science/architecture-lab/m04");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M04 — DISK FULL AT 02:00|M04/);
  assert.match(html, /Two failures\. One question\.|failed writes/i);
  assert.match(html, /DIAGNOSIS LOCKED/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.doesNotMatch(html, /SHARED_DISK_CAPACITY|MySQL filled the disk|Isolate Web and DB/);
});

test("server-renders the Architecture Evolution Lab M05 shell without answer leakage", async () => {
  const response = await render("/computer-science/architecture-lab/m05");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M05 — THE NETWORK IS NOW PART OF THE SYSTEM|M05/);
  assert.match(html, /A DB-dependent request stopped making progress/);
  assert.match(html, /REQUEST FLIGHT.*SLOT PRESSURE BOARD|DEPENDENCY LINK/i);
  assert.match(html, /DIAGNOSIS LOCKED/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.doesNotMatch(html, /INTERNAL TCP|The DB is no longer a local call/);
  assert.doesNotMatch(html, /bound the waiting|bound the wait|use a timeout|retry once|bounded timeout/i);
  assert.doesNotMatch(html, /NETWORK_DEPENDENCY_WAITING|BOUNDED_TIMEOUT_ONE_RETRY|2-second teaching-simulation DB outage/i);
});

test("server-renders the Architecture Evolution Lab M06 shell without answer leakage", async () => {
  const response = await render("/computer-science/architecture-lab/m06");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M06 — FIFTY CONNECTIONS OR FIVE HUNDRED|M06/);
  assert.match(html, /Two limits\. One investigation|The useful region is not the biggest number/i);
  assert.match(html, /ADMISSION FLOW.*QUEUE PRESSURE BOARD/i);
  assert.match(html, /Where does the waiting work go/i);
  assert.match(html, /RESULTS LOCKED|E01–E07 REQUIRED/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.doesNotMatch(html, /CONNECTION_ADMISSION_MISMATCH|FIT_POOL|admission mismatch|more connections can make the system worse|More connections can move the bottleneck|winning pool/i);
});

test("server-renders the Architecture Evolution Lab M07 shell without answer leakage", async () => {
  const response = await render("/computer-science/architecture-lab/m07");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M07 — FIVE-SECOND TOMCAT|M07/);
  assert.match(html, /Campaign warm-up has started/);
  assert.match(html, /~50 ms|~5 s/);
  assert.match(html, /DIAGNOSIS LOCKED|RESOURCE EVIDENCE REQUIRED/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.doesNotMatch(html, /CPU_SATURATION_PRIMARY|RUN_COMPUTE_WAIT_SAMPLE|CPU is the bottleneck|Full GC is secondary|canonical diagnosis|M08/i);
});

test("server-renders the Architecture Evolution Lab M08 shell without answer leakage", async () => {
  const response = await render("/computer-science/architecture-lab/m08");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /M08 — CPU BOTTLENECK|M08/);
  assert.match(html, /busy campaign|slower/i);
  assert.match(html, /DIAGNOSIS LOCKED|E01–E07 REQUIRED/);
  assert.match(html, /Atlas Market is fictional/i);
  assert.doesNotMatch(html, /CPU_SATURATION_PRIMARY|SIMPLIFY_COMPUTE|CPU saturation is primary|finalDiagnosis|M09/i);
});

test("ships finished metadata, PWA manifest, and separated game engines", async () => {
  const [page, layout, manifest, packageJson, core] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/game-core.ts", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(page, /<MathLogicGame/);
  assert.match(page, /SubjectRealmCard/);
  assert.match(layout, /The Axiom Atlas/);
  assert.match(layout, /manifest:\s*"\/manifest\.webmanifest"/);
  assert.match(manifest, /"display": "standalone"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(core, /function bubbleDecision/);
  assert.match(core, /function treeChoose/);
  assert.match(core, /function quadraticMatches/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
