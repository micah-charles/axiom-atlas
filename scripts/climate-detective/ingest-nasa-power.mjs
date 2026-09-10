import { mkdir, writeFile } from "node:fs/promises";

const OUTPUT_DIR = new URL("../../app/games/climate-detective/data/", import.meta.url);
const REPORT_DIR = new URL("../../docs/climate-detective/", import.meta.url);
const POWER_BASE = "https://power.larc.nasa.gov/api";
const OISST_BASE = "https://erddap.aoml.noaa.gov/hdb/erddap/griddap/SST_OI_DAILY_1981_PRESENT_ML.json";
const candidates = [2010, 2013, 2018, 2022];
const locations = [
  { id: "london", name: "London", latitude: 51.5, longitude: -0.1, elevation: 73.15 },
  { id: "cardiff", name: "Cardiff", latitude: 51.48, longitude: -3.18, elevation: 25 },
  { id: "manchester", name: "Manchester", latitude: 53.48, longitude: -2.24, elevation: 78 },
  { id: "edinburgh", name: "Edinburgh", latitude: 55.95, longitude: -3.2, elevation: 41 },
  { id: "aberdeen", name: "Aberdeen", latitude: 57.15, longitude: -2.1, elevation: 65 },
];

const dailyParameters = "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,PS,WS10M,WD10M";
const monthlyParameters = dailyParameters;
const normalParameters = "T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,PS,WS10M,WD10M";

async function fetchJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.json();
}

function powerUrl(kind, location, start, end) {
  const endpoint = kind === "daily" ? "daily/point" : "monthly/point";
  return `${POWER_BASE}/temporal/${endpoint}?parameters=${kind === "daily" ? dailyParameters : monthlyParameters}&community=RE&longitude=${location.longitude}&latitude=${location.latitude}&start=${start}&end=${end}&format=JSON&time-standard=UTC`;
}

function climatologyUrl(location) {
  return `${POWER_BASE}/temporal/climatology/point?parameters=${normalParameters}&community=RE&longitude=${location.longitude}&latitude=${location.latitude}&format=JSON&time-standard=UTC`;
}

function rowsFromPower(payload) {
  const parameters = payload?.properties?.parameter ?? {};
  const dates = Object.keys(parameters.T2M ?? {}).sort();
  const rows = dates.map(date => Object.fromEntries([
    ["date", `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`],
    ["t2m", parameters.T2M?.[date]],
    ["t2mMax", parameters.T2M_MAX?.[date]],
    ["t2mMin", parameters.T2M_MIN?.[date]],
    ["precipitation", parameters.PRECTOTCORR?.[date]],
    ["pressureKpa", parameters.PS?.[date]],
    ["windSpeed", parameters.WS10M?.[date]],
    ["windDirection", parameters.WD10M?.[date]],
  ]));
  return rows.filter(row => Object.values(row).slice(1).every(value => Number.isFinite(value) && value !== -999));
}

function normalByMonth(payload) {
  const parameters = payload?.properties?.parameter ?? {};
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  return Object.fromEntries(months.map((month, index) => [index + 1, {
    t2m: parameters.T2M?.[month],
    t2mMax: parameters.T2M_MAX?.[month],
    t2mMin: parameters.T2M_MIN?.[month],
    precipitation: parameters.PRECTOTCORR?.[month],
    pressureKpa: parameters.PS?.[month],
    windSpeed: parameters.WS10M?.[month],
    windDirection: parameters.WD10M?.[month],
  }]));
}

function monthOf(date) { return Number(date.slice(5, 7)); }
function mean(values) { return values.reduce((sum, value) => sum + value, 0) / values.length; }
function directionIsEasterly(direction) { return direction >= 35 && direction <= 145; }
function deriveSignals(rows, normals) {
  return rows.map((row, index) => {
    const normal = normals[monthOf(row.date)];
    const previous = rows[Math.max(0, index - 2)];
    const temperatureChange = row.t2m - previous.t2m;
    return {
      ...row,
      monthNormal: normal.t2m,
      anomaly: Number((row.t2m - normal.t2m).toFixed(2)),
      twoDayTemperatureChange: Number(temperatureChange.toFixed(2)),
      windCompass: compass(row.windDirection),
      evidenceQuality: { complete: true, source: "NASA POWER / MERRA-2" },
    };
  });
}

function compass(degrees) {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(degrees / 45) % 8];
}

function detectEvents(rows) {
  const summer = rows.filter(row => [6, 7, 8].includes(monthOf(row.date)));
  const coldCandidates = rows.slice(2).map((row, index) => {
    const previous = rows[index];
    const drop = previous.t2m - row.t2m;
    return { row, drop, supported: drop >= 3 && directionIsEasterly(row.windDirection) };
  }).filter(item => item.supported && [1, 2, 3].includes(monthOf(item.row.date))).sort((a, b) => b.drop - a.drop);
  const depressionCandidates = rows.slice(2).map((row, index) => {
    const previous = rows[index];
    const pressureDrop = previous.pressureKpa - row.pressureKpa;
    return { row, pressureDrop, supported: pressureDrop >= 1.2 && row.precipitation >= 3 && row.windSpeed >= 4 };
  }).filter(item => item.supported).sort((a, b) => (b.pressureDrop + b.row.precipitation / 10) - (a.pressureDrop + a.row.precipitation / 10));
  const warmCandidates = summer.sort((a, b) => b.anomaly - a.anomaly);
  const cold = coldCandidates[0] ?? null;
  const depression = depressionCandidates[0] ?? null;
  const warm = warmCandidates[0] ?? null;
  return {
    coldSnap: cold ? { date: cold.row.date, drop: Number(cold.drop.toFixed(2)) } : null,
    depression: depression ? { date: depression.row.date, pressureDrop: Number(depression.pressureDrop.toFixed(2)), precipitation: depression.row.precipitation, windSpeed: depression.row.windSpeed } : null,
    warmAnomaly: warm ? { date: warm.date, anomaly: warm.anomaly, temperature: warm.t2m } : null,
  };
}

function scoreCandidate(year, rows, events) {
  const annualMean = mean(rows.map(row => row.t2m));
  const coldScore = events.coldSnap?.drop ?? 0;
  const depressionScore = events.depression ? events.depression.pressureDrop + events.depression.precipitation / 10 : 0;
  const warmScore = events.warmAnomaly?.anomaly ?? 0;
  return { year, annualMean: Number(annualMean.toFixed(2)), ...events, score: Number((coldScore + depressionScore + warmScore).toFixed(2)) };
}

function oisstUrl(date) {
  return `${OISST_BASE}?sst%5B(${date}T00:00:00Z):1:(${date}T00:00:00Z)%5D%5B(50):1:(50)%5D%5B(-10):1:(-10)%5D`;
}

async function fetchSst(dates) {
  const values = {};
  for (const date of dates) {
    const payload = await fetchJson(oisstUrl(date));
    const row = payload?.table?.rows?.[0];
    if (row && Number.isFinite(row[3])) values[date] = { latitude: row[1], longitude: row[2], celsius: row[3] };
  }
  return values;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const london = locations[0];
  const londonNormal = normalByMonth(await fetchJson(climatologyUrl(london)));
  const candidateRows = {};
  for (const year of candidates) {
    candidateRows[year] = rowsFromPower(await fetchJson(powerUrl("daily", london, `${year}0101`, `${year}1231`)));
  }
  const candidateReport = candidates.map(year => scoreCandidate(year, candidateRows[year], detectEvents(deriveSignals(candidateRows[year], londonNormal))));
  const selected = [...candidateReport].filter(item => item.coldSnap && item.depression && item.warmAnomaly).sort((a, b) => b.score - a.score)[0] ?? candidateReport.sort((a, b) => b.score - a.score)[0];
  if (!selected) throw new Error("No candidate year returned usable data");
  const year = selected.year;
  const locationData = [];
  for (const location of locations) {
    const [normalPayload, dailyPayload] = await Promise.all([
      location.id === london.id ? Promise.resolve(null) : fetchJson(climatologyUrl(location)),
      fetchJson(powerUrl("daily", location, `${year}0101`, `${year}1231`)),
    ]);
    const normals = location.id === london.id ? londonNormal : normalByMonth(normalPayload);
    locationData.push({ ...location, normals, daily: deriveSignals(rowsFromPower(dailyPayload), normals) });
  }
  const eventDates = [selected.coldSnap?.date, selected.depression?.date, selected.warmAnomaly?.date].filter(Boolean);
  const sst = await fetchSst([...new Set(eventDates)]);
  const dataset = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    historicalYear: year,
    baseline: { provider: "NASA POWER", period: "2001-2020", kind: "pre-computed monthly climatology" },
    source: { provider: "NASA POWER", dailyParameters, timeStandard: "UTC", sourceUrl: "https://power.larc.nasa.gov/", atmosphericBase: "MERRA-2" },
    oceanSource: { provider: "NOAA NCEI", dataset: "OISST v2.1", gridPoint: { latitude: 50.125, longitude: -9.875 }, sourceUrl: "https://www.ncei.noaa.gov/products/optimum-interpolation-sst", values: sst },
    candidates: candidateReport,
    selectedEvents: selected,
    locations: locationData,
  };
  await writeFile(new URL("year-2018.json", OUTPUT_DIR), `${JSON.stringify(dataset, null, 2)}\n`);
  await writeFile(new URL("candidate-year-report.json", OUTPUT_DIR), `${JSON.stringify({ selectedYear: year, candidates: candidateReport }, null, 2)}\n`);
  await writeFile(new URL("natural-earth-source.json", OUTPUT_DIR), `${JSON.stringify({ source: "Natural Earth 1:110m admin-0 country boundaries", sourceUrl: "https://github.com/nvkelso/natural-earth-vector", note: "Run scripts/climate-detective/prepare-natural-earth.mjs to refresh the filtered geometry." }, null, 2)}\n`);
  const report = `# Candidate year report\n\nGenerated: ${new Date().toISOString()}\nSelected historical year: **${year}**\n\n| Year | Annual mean °C | Cold snap | Atlantic depression | Warm anomaly | Score |\n| ---: | ---: | --- | --- | --- | ---: |\n${candidateReport.map(item => `| ${item.year} | ${item.annualMean} | ${item.coldSnap ? `${item.coldSnap.date} / −${item.coldSnap.drop}°C` : "not supported"} | ${item.depression ? `${item.depression.date} / ${item.depression.precipitation} mm` : "not supported"} | ${item.warmAnomaly ? `${item.warmAnomaly.date} / +${item.warmAnomaly.anomaly}°C` : "not supported"} | ${item.score} |`).join("\n")}\n\n## Decision\n\nThe score is a transparent event-selection heuristic, not a scientific ranking of years. The selected year must still pass gameplay and scientific QA.\n`;
  await writeFile(new URL("CANDIDATE_YEAR_REPORT.md", REPORT_DIR), report);
  console.log(JSON.stringify({ selectedYear: year, candidates: candidateReport, output: "app/games/climate-detective/data/year-2018.json" }, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
