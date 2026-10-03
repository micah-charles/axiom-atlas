import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CLIMATE_MISSIONS, conceptsFromText, continuationDate, evidenceInterpretation, fieldNoteScienceIssues, explanationLockReasons, locationById, pressureStoryRows, forecastComparison, scoreMission } from '../app/games/climate-detective/engine.ts';
import { CORIOLIS_EXAMPLES, GLOBAL_LATITUDE_BANDS, coriolisExampleGeometry, equalEarthPoint } from '../app/games/climate-detective/global-circulation.ts';

const mission = CLIMATE_MISSIONS[0];
const chain = mission.chain.map(step => step.id);
const london = locationById('london');
const [prior, actual, following] = pressureStoryRows(london, mission.date, true);

test('misconceptions cannot unlock with complete chain and recognised keywords', () => {
  for (const note of [
    'High pressure makes air rise and condensation happens because rising air warms up.',
    'Low pressure makes air sink. Maritime air warms and condensation happens.',
    'Rising air does not cool; pressure brings maritime air.',
    'Rising air never cools; condensation brings rain.',
    "Rising air doesn't cool. Low pressure brings maritime air.",
    'Condensation happens because the air warms.',
    'High-pressure air rises and rising air does not warm.',
    'Low pressure does not make air rise; condensation makes rain.',
    'High pressure does not make air sink; rising air cools.',
  ]) assert.ok(explanationLockReasons(mission, chain, note).some(reason => /Repair/.test(reason)), note);
});

test('wind and rain require correct inference; wrong answers can recover', () => {
  assert.equal(evidenceInterpretation('wind', 'to-direction', actual).correct, false);
  assert.equal(evidenceInterpretation('wind', 'continental', actual).correct, false);
  assert.equal(evidenceInterpretation('wind', 'from-atlantic', actual).correct, true);
  assert.equal(evidenceInterpretation('rain', 'proves-front', actual).correct, false);
  assert.equal(evidenceInterpretation('rain', 'high-rises', actual).correct, false);
  assert.equal(evidenceInterpretation('rain', 'supports-uplift', actual).correct, true);
  const source = readFileSync(new URL('../app/games/climate-detective/ClimateDetectiveGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /inspectedTask !== guidedTask/);
  assert.match(source, /if \(decision.correct\) pinEvidence/);
  assert.doesNotMatch(source, /chooseLocation\(id\); pinEvidence\("(?:wind|rain)"\)/);
  assert.match(source, /taskHints\[guidedTask\]/);
});

test('global coordinates use a single projected system; rotation waits for prediction', () => {
  for (const band of GLOBAL_LATITUDE_BANDS) {
    const west = equalEarthPoint(-180, band.latitude, 1200, 520, 28);
    const centre = equalEarthPoint(0, band.latitude, 1200, 520, 28);
    const east = equalEarthPoint(180, band.latitude, 1200, 520, 28);
    assert.equal(west.y, centre.y);
    assert.equal(east.y, centre.y);
  }
  const source = readFileSync(new URL('../app/games/climate-detective/GlobalWindSystems.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /className="global-map-labels"/);
  assert.match(source, /y=\{latitudeY\(band.latitude\)\} dominantBaseline="middle"/);
  assert.match(source, /disabled=\{!committed\} className=\{rotationOn/);
  assert.match(source, /useState\(false\)/);
  assert.doesNotMatch(source, /item.id < stage \? "✓"/);
  assert.match(source, /Purple cell loops/);
});

test('all four Coriolis routes bend toward the scientific component in both map and demo', () => {
  const downRoutes = new Set(['north-equatorward', 'south-poleward']);
  for (const example of CORIOLIS_EXAMPLES) {
    const signX = example.resultingComponent === 'westward' ? -1 : 1;
    const signY = downRoutes.has(example.id) ? 1 : -1;
    for (const season of ['baseline', 'nh-winter', 'nh-summer']) {
      const { map, demo } = coriolisExampleGeometry(example.id, season);
      for (const [name, geometry] of [['map', map], ['demo', demo]]) {
        const context = `${example.id} ${season} ${name}`;
        assert.equal(Math.sign(geometry.control.x - geometry.start.x), signX, `${context}: control component`);
        assert.equal(Math.sign(geometry.curvedEnd.x - geometry.start.x), signX, `${context}: endpoint component`);
        assert.equal(Math.sign(geometry.curvedEnd.y - geometry.start.y), signY, `${context}: north/south motion`);
        assert.equal(geometry.straightEnd.x, geometry.start.x, `${context}: rotation OFF has no zonal bend`);
        assert.equal(Math.sign(geometry.straightEnd.y - geometry.start.y), signY, `${context}: OFF direction`);
        const { start, control, curvedEnd: end } = geometry;
        // SVG markerEnd follows B'(1) = 2*(end-control), not end-start.
        for (const [label, tangent] of [
          ['initial', { x: 2 * (control.x - start.x), y: 2 * (control.y - start.y) }],
          ['terminal', { x: 2 * (end.x - control.x), y: 2 * (end.y - control.y) }],
        ]) {
          assert.equal(Math.sign(tangent.x), signX, `${context}: ${label} zonal tangent`);
          assert.equal(Math.sign(tangent.y), signY, `${context}: ${label} meridional tangent`);
        }
        let previous = null;
        for (let step = 0; step <= 100; step += 1) {
          const t = step / 100;
          const u = 1 - t;
          const point = { x: u * u * start.x + 2 * u * t * control.x + t * t * end.x, y: u * u * start.y + 2 * u * t * control.y + t * t * end.y };
          const derivative = { x: 2 * u * (control.x - start.x) + 2 * t * (end.x - control.x), y: 2 * u * (control.y - start.y) + 2 * t * (end.y - control.y) };
          assert.equal(Math.sign(derivative.x), signX, `${context}: dx/dt at ${t}`);
          assert.equal(Math.sign(derivative.y), signY, `${context}: dy/dt at ${t}`);
          if (previous) {
            assert.equal(Math.sign(point.x - previous.x), signX, `${context}: sampled dx at ${t}`);
            assert.equal(Math.sign(point.y - previous.y), signY, `${context}: sampled dy at ${t}`);
          }
          previous = point;
        }
      }
    }
  }
  const source = readFileSync(new URL('../app/games/climate-detective/GlobalWindSystems.tsx', import.meta.url), 'utf8');
  assert.equal((source.match(/= coriolisExampleGeometry\(/g) ?? []).length, 2);
  assert.doesNotMatch(source, /const screenRight/);
  assert.match(source, /className="global-coriolis-straight" d=\{geometry.straightPath\} markerEnd="url\(#global-arrow-cyan\)"/);
  assert.match(source, /d=\{rotationOn \? geometry.curvedPath : geometry.straightPath\}/);
});

test('mobile pressure symbols keep exact values in date-bound inspection feedback', () => {
  const source = readFileSync(new URL('../app/games/climate-detective/ClimateDetectiveGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /setInspectedCentre\(\{ date, centre \}\)/);
  assert.match(source, /inspectedCentre\?\.date === date/);
  assert.match(source, /pressureCentreLabel\(inspectedCentre.centre\)/);
  const css = readFileSync(new URL('../app/games/climate-detective/recovery.css', import.meta.url), 'utf8');
  assert.match(css, /climate-pressure-label \{ display:none; \}/);
  assert.match(css, /global-coriolis-straight \{[^}]*stroke-dasharray:none; opacity:1/);
});

test('mobile workflow has mission/map/evidence anchors and scoped non-overlay layout', () => {
  const source = readFileSync(new URL('../app/games/climate-detective/ClimateDetectiveGame.tsx', import.meta.url), 'utf8');
  for (const id of ['climate-mission', 'climate-map', 'climate-evidence']) {
    assert.ok(source.includes(`href="#${id}"`));
    assert.ok(source.includes(`id="${id}"`));
  }
  const css = readFileSync(new URL('../app/games/climate-detective/recovery.css', import.meta.url), 'utf8');
  assert.match(css, /font-size:16px/);
  assert.match(css, /font-size:12px/);
  assert.match(css, /position:static; inset:auto/);
  assert.match(css, /climate-context-link \{ grid-column:1\/-1/);
});

test('valid paraphrases and denial of misconceptions are accepted', () => {
  for (const note of [
    'Low pressure brings maritime air; rising air cools and condenses into rain.',
    'High pressure does not make air rise. Low pressure brings rising air that cools and condenses.',
    "Condensation isn't caused by warming. Rising moist air cools under low pressure.",
    'Rising air does not warm; instead it cools and condensation forms in maritime air.',
    'Falling pressure brings maritime Atlantic air upward; rising air condenses and brings rain.',
  ]) assert.deepEqual(explanationLockReasons(mission, chain, note), [], note);
  assert.ok(fieldNoteScienceIssues('High pressure makes air rise but rising air cools.').length);
});

test('source warmth is not a warming mechanism and unrelated negation cannot mask a claim', () => {
  const valid = [
    'Warm moist Atlantic air rises, cools and condenses.',
    'Warm maritime air rises and cools, causing condensation and rainfall.',
    'Low pressure and pressure differences bring wind from the Atlantic. Moist maritime air rises and cools, causing condensation and rainfall.',
    'Rising warm moist air cools and condenses.',
    'Air cools as it rises. Low pressure draws maritime air in.',
    'As maritime air rises, it cools and condenses.',
    'High pressure causes air to sink. Low pressure allows moist air to rise.',
    'Air does not rise under high pressure; maritime air cools as it rises under low pressure.',
    'High pressure is associated with sinking air, not rising air.',
    'High pressure does not make air rise; rising air does not warm.',
    'It is not true that high pressure makes air rise. Rising air cools.',
    'Condensation does not occur because rising air warms. Moist air cools under low pressure.',
    'Warming does not cause condensation; cooling allows condensation.',
    'Warm source air is warm before it rises. Rising air cools and condenses.',
  ];
  for (const note of valid) {
    assert.deepEqual(fieldNoteScienceIssues(note), [], note);
    if (conceptsFromText(note).length >= 2) assert.deepEqual(explanationLockReasons(mission, chain, note), [], note);
  }
  const invalid = [
    'It is not cold because high pressure makes air rise.',
    'There is no rain, but high pressure makes air rise.',
    'It is not warm because low pressure makes air sink.',
    'It is not cold because rising air warms up.',
    'It is not windy because condensation happens when the air warms.',
    'Rising moist air does not cool, causing condensation.',
    'Air warms as it rises. Atlantic moisture brings rain.',
    'As moist air rises, it warms and causes condensation.',
    'High pressure causes moist air to rise.',
    'Air rises under high pressure.',
    'Low pressure is associated with sinking air.',
    'Cooling does not cause condensation.',
    'Warming causes condensation.',
    'Condensation happens because rising air does not cool.',
  ];
  for (const note of invalid) assert.ok(fieldNoteScienceIssues(note).length, note);
});

test('pressure story only includes tomorrow after commitment', () => {
  assert.deepEqual(pressureStoryRows(london, mission.date).map(row => row.date), [prior.date, actual.date]);
  assert.equal(pressureStoryRows(london, mission.date, true).at(-1).date, following.date);
  const source = readFileSync(new URL('../app/games/climate-detective/ClimateDetectiveGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /pressureStoryRows\(location, storyDate, revealMode\)/);
  assert.match(source, /committed=\{revealMode\}/);
  assert.match(source, /unlocked \? step.title : `Unrevealed step/);
  assert.doesNotMatch(source, /14 Jan → 15 Jan → 16 Jan/);
});

test('all four forecast directions share scoring thresholds, including wind', () => {
  const base = { ...actual, t2m: 10, pressureKpa: 100, windSpeed: 5, precipitation: 3 };
  const next = { ...following, t2m: 11, pressureKpa: 100.12, windSpeed: 4, precipitation: 3.9 };
  const forecast = { temperature: 'warmer', pressure: 'rising', wind: 'lighter', rain: 'steady' };
  const comparison = forecastComparison(base, next, forecast);
  assert.equal(comparison.length, 4);
  assert.ok(comparison.every(item => item.hit));
  assert.equal(scoreMission(mission, ['pressure', 'wind', 'rain'], chain, 'Rising air cools under low pressure.', forecast, base, next).evidence, 3);
  assert.equal(scoreMission(mission, ['pressure', 'wind', 'rain'], chain, '', forecast, base, next).prediction, 3);
  for (const count of [0, 1, 2, 3, 4]) {
    const choices = Object.fromEntries(comparison.map((item, index) => [item.key, index < count ? item.observed : 'wrong']));
    assert.equal(scoreMission(mission, [], [], '', choices, base, next).prediction, Math.min(3, count));
  }
});

test('continuation retains the revealed next day and pressure differences are not anomalies', () => {
  assert.equal(continuationDate('2018-01-15', '2018-01-16'), '2018-01-16');
  assert.equal(continuationDate('2018-01-16', '2018-01-15'), '2018-01-16');
  assert.equal(continuationDate('2018-01-16', null), '2018-01-16');
  assert.ok(!conceptsFromText('Low pressure and pressure differences bring wind from the Atlantic. Moist maritime air rises and cools, causing condensation and rainfall.').includes('ANOMALY'));
  for (const note of ['A pressure difference drives wind.', 'Temperature above the ocean.', 'Rain below the cloud.', 'Departure of the pressure system from Britain.']) assert.ok(!conceptsFromText(note).includes('ANOMALY'), note);
  for (const note of ['Temperature is below normal.', 'The anomaly is unusual.', 'The difference from the climate normal is large.', 'A departure from the baseline.', 'The temperature difference relative to the climate normal.']) assert.ok(conceptsFromText(note).includes('ANOMALY'), note);
  const source = readFileSync(new URL('../app/games/climate-detective/ClimateDetectiveGame.tsx', import.meta.url), 'utf8');
  assert.match(source, /setDate\(continuationDate\(date, revealDate\)\)/);
  assert.doesNotMatch(source, /next.precipitation/);
});

test('mobile acceptance repairs keep navigation in its scroll container and focus crowded layers', () => {
  const css = readFileSync(new URL('../app/games/climate-detective/recovery.css', import.meta.url), 'utf8');
  assert.match(css, /height:100dvh; min-height:0; overflow-y:auto/);
  assert.match(css, /climate-score-grid \{ grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /data-mobile-layer="wind"/);
  assert.match(css, /global-stage-strip \{ display:grid; grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  const game = readFileSync(new URL('../app/games/climate-detective/ClimateDetectiveGame.tsx', import.meta.url), 'utf8');
  assert.match(game, /aria-label="Focus one map layer"/);
  assert.doesNotMatch(game, /: currentTask.instruction\}<\/p>/);
  const global = readFileSync(new URL('../app/games/climate-detective/GlobalWindSystems.tsx', import.meta.url), 'utf8');
  assert.match(global, /className="global-map-viewport" ref=\{mapViewportRef\}/);
  assert.match(global, /viewport.scrollWidth \* \(610 \/ VIEW.width\) - viewport.clientWidth \/ 2/);
  assert.match(global, /SEPARATE CHALLENGE · NH EQUATORWARD ROUTE/);
  assert.match(global, /Swipe the geographic map east\/west/);
});
