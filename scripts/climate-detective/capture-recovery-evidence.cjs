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
const screenshot = async (page, name, fullPage = true) => page.screenshot({ path: path.join(outputDir, name), fullPage });
const assertText = async (page, text) => {
  const locator = page.getByText(text, { exact: false });
  await locator.waitFor({ state: "visible", timeoutMs: 10000 });
  const count = await locator.count();
  if (!count) throw new Error(`Expected visible text: ${text}`);
};

async function solveMissionOne(page) {
  await button(page, "Climate Detective").click();
  await button(page, "Run to next clue").click();
  await instrument(page, "Pressure").click();
  await screenshot(page, "mission-01-pressure-desktop.png");
  await page.locator(".climate-map-target.low").click();
  await assertText(page, "1/3 clues pinned");
  await button(page, "Continue to task 2").click();
  await instrument(page, "Wind").click();
  await screenshot(page, "mission-01-wind-desktop.png");
  await page.locator(".climate-map-target.wind.selected").click();
  await button(page, "Continue to task 3").click();
  await instrument(page, "Rainfall").click();
  await screenshot(page, "mission-01-rainfall-desktop.png");
  await page.locator(".climate-map-target.rain.selected").click();
  await button(page, "Open causal explanation").click();
  await button(page, "Build causal explanation").click();
  await screenshot(page, "mission-01-explain-incomplete-desktop.png");

  await button(page, "Rising air cools, condenses").click();
  await assertText(page, "Order check");
  await button(page, "Rising air cools, condenses").click();
  for (const link of [
    "An Atlantic low affects Britain",
    "Surface pressure falls",
    "Pressure differences strengthen the wind",
    "Moist maritime air arrives",
    "Rising air cools, condenses, and brings rain",
  ]) await button(page, link).click();
  await screenshot(page, "mission-01-forecast-locked-desktop.png");
  const forecastButton = button(page, "Move to forecast");
  if (await forecastButton.isEnabled()) throw new Error("Forecast should remain locked with a blank field note");
  await page.locator("textarea").first().fill("Falling pressure brings maritime Atlantic air upward; rising air condenses and brings rain.");
  if (!(await forecastButton.isEnabled())) throw new Error("Valid field note should unlock forecast");
  await screenshot(page, "mission-01-forecast-unlocked-desktop.png");
  await forecastButton.click();
  await screenshot(page, "mission-01-prediction-desktop.png");
  await button(page, "Run +24 hours").click();
  await assertText(page, "WHAT ACTUALLY HAPPENED");
  await screenshot(page, "mission-01-reveal-desktop.png");
  await button(page, "Continue the year").click();
}

async function solvePassiveMission(page, missionNumber, evidenceNames, links, note, continueLabel) {
  console.log(`starting passive mission ${missionNumber}`);
  await button(page, "Run to next clue").click();
  console.log(`mission ${missionNumber} clue loaded`);
  await assertText(page, `MISSION 0${missionNumber}`);
  for (const evidenceName of evidenceNames) await page.locator(".climate-evidence-card").filter({ hasText: evidenceName }).click();
  await button(page, "Build explanation").click();
  for (const link of links) await button(page, link).click();
  await page.locator("textarea").first().fill(note);
  await button(page, "Reveal the result").click();
  await assertText(page, "Investigation result");
  console.log(`mission ${missionNumber} revealed`);
  await button(page, continueLabel).click();
  console.log(`after mission ${missionNumber}: ${(await page.locator("body").innerText()).slice(-500)}`);
}

async function solveYear(page) {
  await solveMissionOne(page);
  await solvePassiveMission(page, 2, ["Temperature", "Wind"], [
    "Pressure pattern changes",
    "Easterly / northerly flow sets in",
    "Colder continental or polar air arrives",
    "Temperature falls below normal",
  ], "Pressure changed and an easterly air mass brought colder continental air below normal.", "Continue the year");
  await solvePassiveMission(page, 3, ["Temperature", "Climate normal"], [
    "Axial tilt changes the solar angle",
    "Longer daylight increases insolation",
    "The season is warmer",
    "Compare the actual value with normal",
  ], "Earth's axial tilt raises the solar angle and longer daylight warms the season; compare the reading with normal.", "Finish the year");
  await assertText(page, "END-OF-YEAR WEATHER REPORT");
  await screenshot(page, "year-end-assessment-desktop.png");
}

async function captureMobile(browser) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await button(page, "Climate Detective").click();
  await button(page, "Run to next clue").click();
  await instrument(page, "Pressure").click();
  await screenshot(page, "mission-01-pressure-mobile.png", false);
  await page.close();
  return errors;
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", error => errors.push(`pageerror: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await solveYear(page);
  errors.push(...await captureMobile(browser));
  const files = fs.readdirSync(outputDir).filter(file => file.endsWith(".png")).sort();
  fs.writeFileSync(path.join(outputDir, "browser-console.json"), JSON.stringify({ baseUrl, viewport: { width: 1440, height: 1000 }, errors, screenshots: files }, null, 2) + "\n");
  await browser.close();
  console.log(JSON.stringify({ outputDir, screenshots: files, errors }));
})().catch(error => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});
