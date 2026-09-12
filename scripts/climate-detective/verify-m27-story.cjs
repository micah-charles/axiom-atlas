/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

const requirePlaywright = createRequire("/opt/homebrew/lib/node_modules/clawdbot/package.json");
const { chromium } = requirePlaywright("playwright-core");
const executablePath = process.env.CLIMATE_CHROMIUM_PATH ?? "/Users/charlestan/Library/Caches/ms-playwright/chromium_headless_shell-1194/chrome-mac/headless_shell";
const baseUrl = process.env.CLIMATE_PREVIEW_URL ?? "http://localhost:3001/";
const outputDir = path.resolve(process.env.CLIMATE_EVIDENCE_DIR ?? "docs/climate-detective/evidence");

fs.mkdirSync(outputDir, { recursive: true });

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const button = (page, name) => page.getByRole("button", { name: new RegExp(escapeRegExp(name), "i") });
const instrument = (page, name) => page.getByRole("button", { name: new RegExp(`^${escapeRegExp(name)}$`, "i") });
const screenshot = async (page, name, fullPage = false) => page.screenshot({ path: path.join(outputDir, name), fullPage });

async function assertText(page, text) {
  const locator = page.getByText(text, { exact: false });
  if (!(await locator.count())) throw new Error(`Expected visible text: ${text}`);
  await locator.first().waitFor({ state: "visible", timeout: 10000 });
}

async function assertCount(page, selector, expected, description) {
  const actual = await page.locator(selector).count();
  if (actual !== expected) throw new Error(`${description}: expected ${expected}, got ${actual}`);
}

async function pointerClick(page, locator, description) {
  await locator.waitFor({ state: "visible", timeout: 10000 });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Expected a visible pointer target: ${description}`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function openExplain(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await button(page, "Climate Detective").click();
  await button(page, "Run to next clue").click();
  await instrument(page, "Pressure").click();
  const pressureTutorial = button(page, "I can read this");
  if (await pressureTutorial.count()) await pressureTutorial.click();
  await assertCount(page, ".climate-event-pulse", 0, "unexplained decorative event pulse");
  await assertCount(page, ".climate-pressure-centre", 2, "visible pressure centres");
  await pointerClick(page, page.locator(".climate-pressure-centre.low > circle:not(.climate-pressure-hit-area)"), "visible low-pressure circle");
  await button(page, "Continue to task 2").click();
  await instrument(page, "Wind").click();
  await pointerClick(page, page.locator('.climate-wind-vector[aria-label*="London"]'), "visible London wind vector");
  await button(page, "Continue to task 3").click();
  await instrument(page, "Rainfall").click();
  await pointerClick(page, page.locator('.climate-rain-signal[aria-label*="London"]'), "visible London rainfall signal");
  await button(page, "Open causal explanation").click();
  await button(page, "Build causal explanation").click();
  await assertText(page, "STORY SO FAR · 0/5");
}

async function runDesktopStory(page) {
  const expected = [
    "An Atlantic low affects Britain",
    "Surface pressure falls",
    "Pressure differences strengthen the wind",
    "Moist maritime air arrives",
    "Rising air cools, condenses, and brings rain",
  ];
  const orderBefore = await page.locator(".climate-chain-options button").allTextContents();
  const orderAgain = await page.locator(".climate-chain-options button").allTextContents();
  if (orderBefore.join("|") !== orderAgain.join("|")) throw new Error("Causal options changed without a new Explain attempt");
  if (orderBefore.join("|") === expected.join("|")) throw new Error("Causal options retained the authored answer order");
  await screenshot(page, "m27-story-00-shuffled.png");

  await button(page, "Rising air cools, condenses").click();
  await assertText(page, "Order check");
  await assertText(page, "Rising air");
  await screenshot(page, "m27-story-wrong-order.png");
  await button(page, "Remove Rising air cools, condenses").click();
  await assertText(page, "STORY SO FAR · 0/5");

  await button(page, expected[0]).click();
  await assertText(page, "STORY SO FAR · 1/5");
  await assertCount(page, ".climate-pressure-centre.low.selected", 1, "low-pressure story highlight");
  if (!(await page.locator(".climate-isobar.selected").count())) throw new Error("Step 1 did not highlight derived low-pressure contours");
  await screenshot(page, "m27-story-01-low.png");

  await button(page, expected[1]).click();
  await assertText(page, "STORY SO FAR · 2/5");
  await assertCount(page, ".climate-pressure-trend", 1, "pressure trend card");
  const trendLabel = await page.locator(".climate-pressure-trend svg").getAttribute("aria-label");
  if (!trendLabel?.includes("14 Jan") || !trendLabel.includes("15 Jan") || !trendLabel.includes("16 Jan")) throw new Error(`Pressure trend dates are incomplete: ${trendLabel}`);
  await assertCount(page, ".climate-low-track", 1, "derived low-centre track");
  await screenshot(page, "m27-story-02-pressure-trend.png");

  await button(page, expected[2]).click();
  await assertText(page, "STORY SO FAR · 3/5");
  if (!(await page.locator('.climate-wind-vector[aria-label*="London"]')).count()) throw new Error("Step 3 did not render measured wind vectors");
  await assertText(page, "Historical wind · arrow TO / label FROM");
  await screenshot(page, "m27-story-03-wind-gradient.png");

  await button(page, expected[3]).click();
  await assertText(page, "STORY SO FAR · 4/5");
  await assertCount(page, ".climate-airflow-path", 1, "derived Atlantic air path");
  await assertText(page, "Air-mass interpretation");
  await screenshot(page, "m27-story-04-atlantic-air.png");

  await button(page, expected[4]).click();
  await assertText(page, "STORY SO FAR · 5/5");
  await assertCount(page, ".climate-process-inset", 1, "conceptual rainfall process inset");
  await assertCount(page, '[role="img"][aria-label*="Conceptual vertical process"]', 1, "accessible rainfall process description");
  await assertText(page, "TEACHING MODEL · CONCEPTUAL CROSS-SECTION");
  await screenshot(page, "m27-story-05-rain-process.png");

  await button(page, "Focus map evidence for An Atlantic low affects Britain").click();
  await assertCount(page, ".climate-story-step.focused", 1, "focused Story So Far step");
  if (!(await page.locator(".climate-isobar-label.story-context").count())) throw new Error("Focused story step did not mute context layers");
  await button(page, "Replay explanation").click();
  await assertText(page, "STORY SO FAR · 1/5");
  await button(page, "Stop replay").click();
  await button(page, "Previous step").click();
  await assertText(page, "STORY SO FAR · 4/5");
  await button(page, "Next step").click();
  await assertText(page, "STORY SO FAR · 5/5");

  const note = page.locator("textarea").first();
  await note.fill("Falling pressure and a strong pressure gradient bring south-westerly maritime Atlantic air. Moist air rises, cools and condenses, producing rain.");
  await assertText(page, "FORMATIVE FIELD-NOTE CHECK");
  await assertText(page, "You connected wind with moisture.");
  await assertText(page, "EXPLANATION READY");
  await button(page, "Move to forecast").click();
  await assertText(page, "What happens tomorrow?");
  await screenshot(page, "m27-story-forecast-bridge.png");
  await button(page, "Run +24 hours").click();
  await assertText(page, "REVEAL · REALITY CHECK");
  await assertText(page, "WHAT ACTUALLY HAPPENED");
  await assertText(page, "16 Jan 2018");
  await assertCount(page, ".climate-process-inset", 1, "reveal keeps rainfall process inset");
  const revealTrend = await page.locator(".climate-pressure-trend svg").getAttribute("aria-label");
  if (!revealTrend?.includes("14 Jan") || !revealTrend.includes("15 Jan") || !revealTrend.includes("16 Jan")) throw new Error(`Reveal story trend lost its 14–16 Jan anchor: ${revealTrend}`);
  await assertText(page, "14 Jan → 15 Jan → 16 Jan");
  await screenshot(page, "m27-story-reveal.png");
}

async function runReducedMotion(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openExplain(page);
  for (const link of [
    "An Atlantic low affects Britain",
    "Surface pressure falls",
    "Pressure differences strengthen the wind",
    "Moist maritime air arrives",
    "Rising air cools, condenses, and brings rain",
  ]) await button(page, link).click();
  await button(page, "Replay explanation").click();
  await new Promise(resolve => setTimeout(resolve, 1500));
  await assertText(page, "STORY SO FAR · 1/5");
  await page.evaluate(() => window.scrollTo(0, 0));
  await screenshot(page, "m27-story-mobile-reduced-motion.png");
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  await openExplain(page);
  await runDesktopStory(page);
  await runReducedMotion(browser);
  const screenshots = fs.readdirSync(outputDir).filter(file => file.startsWith("m27-") && file.endsWith(".png")).sort();
  fs.writeFileSync(path.join(outputDir, "browser-console-m27.json"), JSON.stringify({ baseUrl, desktopViewport: { width: 1440, height: 1000 }, mobileViewport: { width: 390, height: 844 }, reducedMotion: true, errors, screenshots }, null, 2) + "\n");
  await browser.close();
  if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
  console.log(JSON.stringify({ baseUrl, screenshots, errors }));
})().catch(error => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});
