import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

test("server-renders the complete Axiom Atlas shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>The Axiom Atlas/);
  assert.match(html, /Think with your hands\./);
  assert.match(html, /Core Interaction Lab/);
  assert.match(html, /Bubble Village/);
  assert.match(html, /Tree Garden/);
  assert.match(html, /Parabola Valley/);
  assert.match(html, /Fifteen worlds/);
  assert.match(html, /600[\s\S]*campaign missions/);
  for (const world of ["Arithmetic Forge", "Fraction Harbor", "Equation Citadel", "Geometry Kingdom", "Probability Port", "Logic Forest", "Graph Metro", "Algorithm City", "Sequence Desert", "Cipher Isles", "Infinity Observatory"]) assert.match(html, new RegExp(world));
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships finished metadata, PWA manifest, and separated game engines", async () => {
  const [page, layout, manifest, packageJson, core] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../public/manifest.webmanifest", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/game-core.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /<MathLogicGame/);
  assert.match(layout, /The Axiom Atlas/);
  assert.match(layout, /manifest:\s*"\/manifest\.webmanifest"/);
  assert.match(manifest, /"display": "standalone"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(core, /function bubbleDecision/);
  assert.match(core, /function treeChoose/);
  assert.match(core, /function quadraticMatches/);
  await assert.rejects(access(new URL("../app/_sites-preview", import.meta.url)));
});
