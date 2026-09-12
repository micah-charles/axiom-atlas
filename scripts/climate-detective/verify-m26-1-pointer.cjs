/* eslint-disable @typescript-eslint/no-require-imports */
const { createRequire } = require("node:module");

const requirePlaywright = createRequire("/opt/homebrew/lib/node_modules/clawdbot/package.json");
const { chromium } = requirePlaywright("playwright-core");
const executablePath = process.env.CLIMATE_CHROMIUM_PATH ?? "/Users/charlestan/Library/Caches/ms-playwright/chromium_headless_shell-1194/chrome-mac/headless_shell";
const baseUrl = process.env.CLIMATE_PREVIEW_URL ?? "http://localhost:3001/";

const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const roleButton = (page, name) => page.getByRole("button", { name: new RegExp(escapeRegExp(name), "i") });
const instrument = (page, name) => page.getByRole("button", { name: new RegExp(`^${escapeRegExp(name)}$`, "i") });

async function pointerClick(page, locator, description, offset = null) {
  await locator.waitFor({ state: "visible", timeout: 10000 });
  const box = await locator.boundingBox();
  if (!box) throw new Error(`Expected visible pointer target: ${description}`);
  const x = offset ? box.x + offset.x : box.x + box.width / 2;
  const y = offset ? box.y + offset.y : box.y + box.height / 2;
  await page.mouse.click(x, y);
}

async function assertText(page, text) {
  const locator = page.getByText(text, { exact: false });
  if (!(await locator.count())) throw new Error(`Expected visible text: ${text}`);
}

async function openTask(browser, viewport = { width: 1440, height: 1000 }, options = {}) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, ...options });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await roleButton(page, "Climate Detective").click();
  await roleButton(page, "Run to next clue").click();
  await instrument(page, "Pressure").click();
  await roleButton(page, "I can read this").click();
  return page;
}

async function assertFreshTask(page) {
  await assertText(page, "TASK 1 OF 3");
  await assertText(page, "0/3 clues pinned");
  await assertText(page, "Pressure system not yet identified");
}

async function assertLowSuccess(page, locator, description) {
  await pointerClick(page, locator, description);
  await assertText(page, "1/3 clues pinned");
  await assertText(page, "LOW-PRESSURE SYSTEM FOUND");
  if (await page.locator(".climate-pressure-centre.selected").count() !== 1) throw new Error(`${description} did not select one pressure centre`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const failures = [];
  const checks = async (name, action) => {
    const page = await openTask(browser);
    try {
      await assertFreshTask(page);
      await action(page);
      console.log(`PASS ${name}`);
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.error(`FAIL ${name}: ${error.message}`);
    } finally {
      await page.close();
    }
  };

  await checks("L circle pointer click", async page => {
    await assertLowSuccess(page, page.locator(".climate-pressure-centre.low > circle:not(.climate-pressure-hit-area)"), "L circle");
  });
  await checks("L text pointer click", async page => {
    await assertLowSuccess(page, page.locator(".climate-pressure-centre.low > text:not(.climate-pressure-label)"), "L text");
  });
  await checks("963 hPa label pointer click", async page => {
    await assertLowSuccess(page, page.locator(".climate-pressure-centre.low .climate-pressure-label"), "963 hPa label");
  });
  await checks("marker edge pointer click", async page => {
    const hitArea = page.locator(".climate-pressure-centre.low .climate-pressure-hit-area");
    const box = await hitArea.boundingBox();
    if (!box) throw new Error("Pressure hit area is not visible to pointer testing");
    await pointerClick(page, hitArea, "low marker edge", { x: 4, y: box.height / 2 });
    await assertText(page, "1/3 clues pinned");
  });
  await checks("H wrong-click feedback", async page => {
    await pointerClick(page, page.locator(".climate-pressure-centre.high > circle:not(.climate-pressure-hit-area)"), "H circle");
    await assertText(page, "That’s a high-pressure centre");
    await assertText(page, "0/3 clues pinned");
  });
  await checks("London wrong-click feedback", async page => {
    await pointerClick(page, roleButton(page, "Select London"), "London observation point");
    await assertText(page, "London is the observation location");
    await assertText(page, "0/3 clues pinned");
  });
  await checks("isobar teaching feedback", async page => {
    await pointerClick(page, page.locator(".climate-isobar").first(), "pressure contour");
    await assertText(page, "This is an isobar");
    await assertText(page, "0/3 clues pinned");
  });
  await checks("keyboard low-centre activation", async page => {
    const low = page.locator(".climate-pressure-centre.low");
    await low.press("Enter");
    await assertText(page, "1/3 clues pinned");
  });

  const mobile = await openTask(browser, { width: 390, height: 844 });
  try {
    await assertFreshTask(mobile);
    await assertLowSuccess(mobile, mobile.locator(".climate-pressure-centre.low > circle:not(.climate-pressure-hit-area)"), "mobile L circle");
    console.log("PASS mobile L pointer click");
  } catch (error) {
    failures.push(`mobile L pointer click: ${error.message}`);
    console.error(`FAIL mobile L pointer click: ${error.message}`);
  } finally {
    await mobile.close();
  }

  const touch = await openTask(browser, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
  try {
    await assertFreshTask(touch);
    const lowCircle = touch.locator(".climate-pressure-centre.low > circle:not(.climate-pressure-hit-area)");
    const box = await lowCircle.boundingBox();
    if (!box) throw new Error("Expected a visible low-pressure circle for touch testing");
    await touch.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    await assertText(touch, "1/3 clues pinned");
    await assertText(touch, "LOW-PRESSURE SYSTEM FOUND");
    console.log("PASS mobile L touch tap");
  } catch (error) {
    failures.push(`mobile L touch tap: ${error.message}`);
    console.error(`FAIL mobile L touch tap: ${error.message}`);
  } finally {
    await touch.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(JSON.stringify({ baseUrl, failures }));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ baseUrl, checks: 10, failures: [] }));
  }
})().catch(error => {
  console.error(error.stack ?? error);
  process.exitCode = 1;
});
