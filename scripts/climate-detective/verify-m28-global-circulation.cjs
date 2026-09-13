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
const exactButton = (page, name) => page.getByRole("button", { name, exact: true });
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

async function assertCoriolisArrowDirection(page, exampleLabel, movesDown, description) {
  await exactButton(page, exampleLabel).click();
  const points = await page.locator(".global-coriolis-curve").evaluate(element => {
    const path = element;
    const start = path.getPointAtLength(0);
    const end = path.getPointAtLength(path.getTotalLength());
    return { startY: start.y, endY: end.y };
  });
  if ((points.endY > points.startY) !== movesDown) throw new Error(`${description}: unexpected SVG direction ${JSON.stringify(points)}`);
}

async function pointerClick(page, locator, description) {
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Expected a visible pointer target: ${description}`);
  await page.mouse.click(box.x + Math.max(1, box.width / 2), box.y + Math.max(1, box.height / 2));
}

async function openExplain(page) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await button(page, "Climate Detective").click();
  await button(page, "Run to next clue").click();
  await exactButton(page, "Pressure").click();
  const pressureTutorial = button(page, "I can read this");
  if (await pressureTutorial.count()) await pressureTutorial.click();
  await pointerClick(page, page.locator(".climate-pressure-centre.low > circle:not(.climate-pressure-hit-area)"), "visible low-pressure circle");
  await button(page, "Continue to task 2").click();
  await exactButton(page, "Wind").click();
  await pointerClick(page, page.locator('.climate-wind-vector[aria-label*="London"]'), "visible London wind vector");
  await button(page, "Continue to task 3").click();
  await exactButton(page, "Rainfall").click();
  await pointerClick(page, page.locator('.climate-rain-signal[aria-label*="London"]'), "visible London rainfall signal");
  await button(page, "Open causal explanation").click();
  await button(page, "Build causal explanation").click();
  await assertText(page, "STORY SO FAR · 0/5");
}

async function runGuidedLesson(page) {
  await assertCount(page, ".climate-global-launch", 1, "Global Wind Systems mission entry point");
  await button(page, "Global Wind Systems").click();
  await assertText(page, "GLOBAL CONTEXT · TEACHING MODEL + HISTORICAL BRIDGE");
  await assertText(page, "Unequal heating starts the circulation");
  await assertText(page, "IDEALISED CLIMATE MODEL");
  await screenshot(page, "m28-global-01-stage-heating.png");

  await exactButton(page, "Next →").click();
  await assertText(page, "Vertical motion helps make pressure belts");
  await assertText(page, "climatological patterns, not the small weather-system L and H");
  await exactButton(page, "Next →").click();
  await assertText(page, "Each hemisphere is described by three cells");
  await assertText(page, "Hadley, Ferrel and Polar cells");
  await exactButton(page, "Next →").click();
  await assertText(page, "Moving air is deflected by the Coriolis effect");
  await assertText(page, "INTERACTIVE CORIOLIS DEMO");
  await assertText(page, "Rotation ON");
  await exactButton(page, "Rotation OFF").click();
  await assertText(page, "Conceptual pressure-gradient path");
  await exactButton(page, "Rotation ON").click();
  await assertCoriolisArrowDirection(page, "NH · toward equator", true, "Northern equatorward Coriolis arrow");
  await screenshot(page, "m28-global-02-coriolis-nh-equatorward.png");
  await assertCoriolisArrowDirection(page, "SH · toward equator", false, "Southern equatorward Coriolis arrow");
  await assertCoriolisArrowDirection(page, "SH · toward pole", true, "Southern poleward Coriolis arrow");
  await exactButton(page, "NH · toward pole").click();
  await assertCoriolisArrowDirection(page, "NH · toward pole", false, "Northern poleward Coriolis arrow");
  await assertText(page, "Deflects right");
  await exactButton(page, "Westward component").click();
  await exactButton(page, "Check").click();
  await assertText(page, "Correct. Southward motion in the Northern Hemisphere");
  await screenshot(page, "m28-global-02-coriolis.png");

  await exactButton(page, "Next →").click();
  await assertText(page, "Wind belts emerge from the pattern");
  await assertCount(page, '[aria-label="Northern Mid-latitude Westerlies, from west, toward east, 30–60°N"]', 5, "Northern westerly belt arrows");
  const westerly = page.getByRole("button", { name: "Northern Mid-latitude Westerlies, from west, toward east, 30–60°N", exact: true }).first();
  await pointerClick(page, westerly, "Northern mid-latitude westerly arrow");
  await assertText(page, "SELECTED WIND BELT");
  await assertText(page, "FROM west");
  await assertText(page, "Ferrel Cell");
  await screenshot(page, "m28-global-03-westerlies.png");

  await exactButton(page, "Next →").click();
  await assertText(page, "Britain sits in the Northern mid-latitude westerlies");
  await assertText(page, "GLOBAL BACKGROUND ≠ DAILY WEATHER");
  await assertText(page, "15 Jan 2018");
  await assertText(page, "FROM SW");
  await assertText(page, "North Atlantic SST 10.9°C");
  await assertText(page, "the global model explains the background; it does not replace today’s evidence");
  await screenshot(page, "m28-global-04-historical-bridge.png");
}

async function runReturnAndContextLink(page) {
  await button(page, "Return to mission").click();
  await assertText(page, "GLOBAL CONTEXT RETURNED");
  await assertText(page, "Historical FROM SW wind highlighted");
  await assertText(page, "STORY SO FAR · 0/5");

  const orderedLabels = [
    "An Atlantic low affects Britain",
    "Surface pressure falls",
    "Pressure differences strengthen the wind",
    "Moist maritime air arrives",
  ];
  for (const label of orderedLabels) await button(page, label).click();
  await assertText(page, "STORY SO FAR · 4/5");
  await assertCount(page, ".climate-context-link", 2, "global context links on pressure and moisture cards");
  await button(page, "Why is the wind from SW?").last().click();
  await assertText(page, "Global Wind Systems");
  await assertText(page, "15 Jan 2018");
  await button(page, "Return to mission").click();
  await assertText(page, "STORY SO FAR · 4/5");
  await assertText(page, "GLOBAL CONTEXT RETURNED");
  await screenshot(page, "m28-global-05-context-return.png");
}

async function runExploreMode(page) {
  await button(page, "Global Wind Systems").click();
  await exactButton(page, "Guided stage 6: Britain sits in the Northern mid-latitude westerlies").click();
  await page.getByRole("tab", { name: "Explore layers", exact: true }).click();
  await assertText(page, "Build your own global-to-local view");
  await assertCount(page, '[aria-pressed="true"]', 1, "initial Explore active layers");
  await exactButton(page, "Pressure belts").click();
  await exactButton(page, "Atmospheric cells").click();
  await exactButton(page, "Coriolis").click();
  await exactButton(page, "Show Britain").click();
  await exactButton(page, "15 Jan 2018").click();
  await assertText(page, "Historical daily record");
  await assertText(page, "Idealised climate model · Historical weather data");
  await screenshot(page, "m28-global-06-explore.png");
  await button(page, "Return to mission").click();
}

async function runMobile(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await button(page, "Climate Detective").click();
  await button(page, "Global Wind Systems").click();
  await assertText(page, "Global Wind Systems");
  await assertText(page, "Guided lesson");
  const panelBox = await page.locator(".climate-global-panel").boundingBox();
  if (!panelBox || panelBox.width > 390.5) throw new Error(`Global panel exceeds mobile viewport: ${JSON.stringify(panelBox)}`);
  await screenshot(page, "m28-global-07-mobile.png");
}

async function runAccessibility(page) {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await button(page, "Climate Detective").click();
  await button(page, "Global Wind Systems").click();
  const focusedRole = await page.evaluate(() => document.activeElement?.getAttribute("role"));
  if (focusedRole !== "dialog") throw new Error(`Global panel did not receive initial focus: ${focusedRole}`);
  const next = exactButton(page, "Next →");
  await next.focus();
  await page.keyboard.press("Enter");
  await assertText(page, "Vertical motion helps make pressure belts");
  await page.keyboard.press("Escape");
  await assertCount(page, '[role="dialog"]', 0, "Escape closes the global reference");
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  await openExplain(page);
  await runGuidedLesson(page);
  await runReturnAndContextLink(page);
  await runExploreMode(page);
  await runAccessibility(page);
  await runMobile(page);
  const screenshots = fs.readdirSync(outputDir).filter(file => file.startsWith("m28-") && file.endsWith(".png")).sort();
  fs.writeFileSync(path.join(outputDir, "browser-console-m28.json"), JSON.stringify({ baseUrl, desktopViewport: { width: 1440, height: 1000 }, mobileViewport: { width: 390, height: 844 }, errors, screenshots }, null, 2) + "\n");
  await browser.close();
  if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
  console.log(JSON.stringify({ baseUrl, screenshots, errors }));
})().catch(error => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});
