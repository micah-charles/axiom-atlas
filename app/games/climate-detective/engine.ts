import rawData from "./data/year-2018.json" with { type: "json" };

export type ClimateRow = {
  date: string;
  t2m: number;
  t2mMax: number;
  t2mMin: number;
  precipitation: number;
  pressureKpa: number;
  windSpeed: number;
  windDirection: number;
  monthNormal: number;
  anomaly: number;
  twoDayTemperatureChange: number;
  windCompass: string;
  evidenceQuality: { complete: boolean; source: string };
};

export type ClimateLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  normals: Record<string, { t2m: number; t2mMax: number; t2mMin: number; precipitation: number; pressureKpa: number; windSpeed: number; windDirection: number }>;
  daily: ClimateRow[];
};

export type ClimateDataset = {
  historicalYear: number;
  baseline: { provider: string; period: string; kind: string };
  source: { provider: string; dailyParameters: string; timeStandard: string; sourceUrl: string; atmosphericBase: string };
  oceanSource: { provider: string; dataset: string; gridPoint: { latitude: number; longitude: number }; sourceUrl: string; values: Record<string, { latitude: number; longitude: number; celsius: number }> };
  selectedEvents: {
    year: number;
    coldSnap: { date: string; drop: number } | null;
    depression: { date: string; pressureDrop: number; precipitation: number; windSpeed: number } | null;
    warmAnomaly: { date: string; anomaly: number; temperature: number } | null;
  };
  candidates: Array<{ year: number; annualMean: number; score: number; coldSnap: unknown; depression: unknown; warmAnomaly: unknown }>;
  locations: ClimateLocation[];
};

export const CLIMATE_DATA = rawData as ClimateDataset;
export const CLIMATE_YEAR = CLIMATE_DATA.historicalYear;
export const CLIMATE_START = `${CLIMATE_YEAR}-01-01`;
export const CLIMATE_END = `${CLIMATE_YEAR}-12-31`;

export type MissionKind = "depression" | "cold-snap" | "warm-anomaly";
export type MissionPhase = "observe" | "investigate" | "explain" | "predict" | "reveal" | "reflect" | "assessment";
export type EvidenceId = "temperature" | "normal" | "pressure" | "wind" | "rain" | "sst" | "season";
export type ConceptId = "PRESSURE" | "AIR_MASS" | "CONTINENTALITY" | "MARITIME_INFLUENCE" | "FRONT" | "CLIMATE_NORMAL" | "ANOMALY" | "AXIAL_TILT" | "SOLAR_ANGLE" | "INSOLATION" | "DAY_LENGTH";
export type ForecastChoice = "rising" | "falling" | "steady" | "warmer" | "cooler" | "wetter" | "drier" | "stronger" | "lighter";

export type CausalStep = { id: string; label: string; short: string; concept: ConceptId };
export type ClimateMission = {
  id: MissionKind;
  number: string;
  date: string;
  title: string;
  kicker: string;
  objective: string;
  prompt: string;
  evidence: EvidenceId[];
  chain: CausalStep[];
  requiredConcepts: ConceptId[];
  forecast: boolean;
  nextLabel: string;
  reflection: string;
};

const selected = CLIMATE_DATA.selectedEvents;
const dateOr = (value: { date: string } | null, fallback: string) => value?.date ?? fallback;

export const CLIMATE_MISSIONS: ClimateMission[] = [
  {
    id: "depression",
    number: "01",
    date: dateOr(selected.depression, `${CLIMATE_YEAR}-01-15`),
    title: "The Atlantic conveyor",
    kicker: "LOW PRESSURE INBOUND",
    objective: "Use the evidence to explain the wet, windy change — then predict the next 24 hours.",
    prompt: "A pressure system is crossing the Atlantic. What is driving the change over Britain?",
    evidence: ["pressure", "wind", "rain", "sst"],
    chain: [
      { id: "falling-pressure", label: "Pressure falls", short: "low pressure", concept: "PRESSURE" },
      { id: "front-arrives", label: "A front approaches", short: "front", concept: "FRONT" },
      { id: "rising-rain", label: "Air rises and rain increases", short: "rising air", concept: "FRONT" },
      { id: "weather-shifts", label: "Wind and rainfall change", short: "weather shift", concept: "AIR_MASS" },
    ],
    requiredConcepts: ["PRESSURE", "FRONT"],
    forecast: true,
    nextLabel: "Run +24 hours",
    reflection: "Which signal told you the low-pressure system was arriving?",
  },
  {
    id: "cold-snap",
    number: "02",
    date: dateOr(selected.coldSnap, `${CLIMATE_YEAR}-03-18`),
    title: "The eastern door",
    kicker: "COLD AIR ARRIVES",
    objective: "Find where the cold air came from. You need at least two useful pieces of evidence.",
    prompt: "Temperature has fallen sharply. Is this only the season — or has a different air mass arrived?",
    evidence: ["temperature", "normal", "pressure", "wind", "sst", "season"],
    chain: [
      { id: "pressure-pattern", label: "Pressure pattern changes", short: "pressure", concept: "PRESSURE" },
      { id: "easterly-flow", label: "Easterly / northerly flow sets in", short: "wind direction", concept: "AIR_MASS" },
      { id: "continental-air", label: "Colder continental or polar air arrives", short: "air mass", concept: "CONTINENTALITY" },
      { id: "temperature-falls", label: "Temperature falls below normal", short: "temperature", concept: "ANOMALY" },
    ],
    requiredConcepts: ["PRESSURE", "AIR_MASS", "CONTINENTALITY"],
    forecast: false,
    nextLabel: "Continue the year",
    reflection: "Which evidence separated a cold air-mass change from an ordinary March day?",
  },
  {
    id: "warm-anomaly",
    number: "03",
    date: dateOr(selected.warmAnomaly, `${CLIMATE_YEAR}-07-26`),
    title: "Warm is not the same as unusual",
    kicker: "NORMAL OR ANOMALY?",
    objective: "Compare the actual reading with the climate normal and explain what the anomaly means.",
    prompt: "Summer should be warm. Is today's warmth simply seasonal, or is it also unusual for this month?",
    evidence: ["temperature", "normal", "season", "sst"],
    chain: [
      { id: "tilt-season", label: "Axial tilt changes the solar angle", short: "Earth's tilt", concept: "AXIAL_TILT" },
      { id: "longer-days", label: "Longer daylight increases insolation", short: "day length", concept: "DAY_LENGTH" },
      { id: "summer-warmth", label: "The season is warmer", short: "season", concept: "SOLAR_ANGLE" },
      { id: "compare-normal", label: "Compare the actual value with normal", short: "anomaly", concept: "CLIMATE_NORMAL" },
    ],
    requiredConcepts: ["CLIMATE_NORMAL", "AXIAL_TILT", "SOLAR_ANGLE"],
    forecast: false,
    nextLabel: "Finish the year",
    reflection: "Why is a seasonal change not the same thing as a climate-change attribution?",
  },
];

export function locationById(id: string): ClimateLocation {
  return CLIMATE_DATA.locations.find(location => location.id === id) ?? CLIMATE_DATA.locations[0];
}

export function rowAt(location: ClimateLocation, date: string): ClimateRow {
  return location.daily.find(row => row.date === date) ?? location.daily[0];
}

export function nextRow(location: ClimateLocation, date: string): ClimateRow {
  const index = location.daily.findIndex(row => row.date === date);
  return location.daily[Math.min(location.daily.length - 1, Math.max(0, index + 1))];
}

export function previousRow(location: ClimateLocation, date: string): ClimateRow {
  const index = location.daily.findIndex(row => row.date === date);
  return location.daily[Math.max(0, index - 1)];
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

export function dayOfYear(date: string): number {
  const start = Date.UTC(CLIMATE_YEAR, 0, 1);
  return Math.round((Date.parse(`${date}T00:00:00Z`) - start) / 86400000) + 1;
}

export function dayLengthHours(latitude: number, date: string): number {
  const rad = Math.PI / 180;
  const declination = -23.44 * Math.cos((360 / 365.24) * (dayOfYear(date) + 10) * rad);
  const latitudeRad = latitude * rad;
  const declinationRad = declination * rad;
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, -Math.tan(latitudeRad) * Math.tan(declinationRad))));
  return Number((24 * hourAngle / Math.PI).toFixed(1));
}

export function solarAngle(latitude: number, date: string): number {
  const rad = Math.PI / 180;
  const declination = -23.44 * Math.cos((360 / 365.24) * (dayOfYear(date) + 10) * rad);
  return Number((90 - Math.abs(latitude - declination)).toFixed(1));
}

export function seasonFor(date: string): "winter" | "spring" | "summer" | "autumn" {
  const month = Number(date.slice(5, 7));
  if (month <= 2 || month === 12) return "winter";
  if (month <= 5) return "spring";
  if (month <= 8) return "summer";
  return "autumn";
}

export function pressureHpa(row: ClimateRow): number { return Number((row.pressureKpa * 10).toFixed(1)); }
export function windDirectionLabel(degrees: number): string { return `${Math.round(degrees)}° ${degrees >= 35 && degrees <= 145 ? "easterly sector" : degrees >= 220 && degrees <= 320 ? "westerly sector" : "mixed sector"}`; }

export function evidenceLabel(id: EvidenceId): string {
  return ({ temperature: "Temperature", normal: "Climate normal", pressure: "Surface pressure", wind: "Wind", rain: "Rainfall", sst: "North Atlantic SST", season: "Seasonal geometry" })[id];
}

export function evidenceValue(id: EvidenceId, row: ClimateRow, previous: ClimateRow, location: ClimateLocation, date: string): { value: string; detail: string; concepts: ConceptId[] } {
  if (id === "temperature") return { value: `${row.t2m.toFixed(1)} °C`, detail: `${row.t2m - previous.t2m >= 0 ? "+" : ""}${(row.t2m - previous.t2m).toFixed(1)} °C since yesterday`, concepts: ["ANOMALY"] };
  if (id === "normal") return { value: `${row.monthNormal.toFixed(1)} °C normal`, detail: `Actual anomaly ${row.anomaly >= 0 ? "+" : ""}${row.anomaly.toFixed(1)} °C`, concepts: ["CLIMATE_NORMAL", "ANOMALY"] };
  if (id === "pressure") return { value: `${pressureHpa(row)} hPa`, detail: `${pressureHpa(row) - pressureHpa(previous) >= 0 ? "+" : ""}${(pressureHpa(row) - pressureHpa(previous)).toFixed(1)} hPa since yesterday`, concepts: ["PRESSURE"] };
  if (id === "wind") return { value: `${row.windCompass} · ${row.windSpeed.toFixed(1)} m/s`, detail: windDirectionLabel(row.windDirection), concepts: ["AIR_MASS"] };
  if (id === "rain") return { value: `${row.precipitation.toFixed(1)} mm/day`, detail: row.precipitation >= 3 ? "A wet day: rising air or a front may be involved" : "Little measurable precipitation", concepts: ["FRONT"] };
  if (id === "sst") {
    const sst = CLIMATE_DATA.oceanSource.values[date];
    return sst ? { value: `${sst.celsius.toFixed(1)} °C`, detail: `NOAA OISST at ${sst.latitude.toFixed(3)}°N, ${Math.abs(sst.longitude).toFixed(3)}°W`, concepts: ["MARITIME_INFLUENCE"] } : { value: "No value", detail: "No SST sample at this event date", concepts: [] };
  }
  return { value: `${dayLengthHours(location.latitude, date)} h daylight`, detail: `Solar angle ≈ ${solarAngle(location.latitude, date)}° · teaching model`, concepts: ["AXIAL_TILT", "SOLAR_ANGLE", "DAY_LENGTH"] };
}

export function rowsAround(location: ClimateLocation, date: string, count = 18): ClimateRow[] {
  const index = Math.max(0, location.daily.findIndex(row => row.date === date));
  return location.daily.slice(Math.max(0, index - count + 1), index + 1);
}

const conceptPatterns: Record<ConceptId, RegExp> = {
  PRESSURE: /pressure|low[- ]pressure|high[- ]pressure|hpa|barometer/i,
  AIR_MASS: /air mass|airmass|easterly|northerly|wind direction|polar air|cold air/i,
  CONTINENTALITY: /continental|continent|land cooled|land heats|continentality/i,
  MARITIME_INFLUENCE: /maritime|ocean|atlantic|sea|sst|water influence/i,
  FRONT: /front|frontal|warm front|cold front|occluded|rising air|condensation|rain band/i,
  CLIMATE_NORMAL: /normal|average|climatology|baseline|expected/i,
  ANOMALY: /anomal|unusual|difference|above|below|departure/i,
  AXIAL_TILT: /tilt|23\.5|axis/i,
  SOLAR_ANGLE: /solar angle|sun angle|direct|sunlight angle|sun higher/i,
  INSOLATION: /insolation|solar energy|energy from the sun|radiation/i,
  DAY_LENGTH: /day length|longer days|daylight|shorter days/i,
};

export function conceptsFromText(text: string): ConceptId[] {
  return (Object.keys(conceptPatterns) as ConceptId[]).filter(concept => conceptPatterns[concept].test(text));
}

export function scoreMission(mission: ClimateMission, selectedEvidence: EvidenceId[], chain: string[], answer: string, forecast: Record<string, ForecastChoice>, actual: ClimateRow, following: ClimateRow): { evidence: number; concepts: number; reasoning: number; prediction: number; efficiency: number; total: number; matchedConcepts: ConceptId[]; feedback: string[] } {
  const relevantEvidence = selectedEvidence.filter(id => mission.evidence.includes(id));
  const evidence = Math.min(3, new Set(relevantEvidence).size >= 4 ? 3 : new Set(relevantEvidence).size >= 2 ? 2 : new Set(relevantEvidence).size);
  const textConcepts = conceptsFromText(answer);
  const chainConcepts = mission.chain.filter(step => chain.includes(step.id)).map(step => step.concept);
  const matchedConcepts = [...new Set([...textConcepts, ...chainConcepts])];
  const concepts = Math.min(3, mission.requiredConcepts.filter(concept => matchedConcepts.includes(concept)).length);
  const reasoning = chain.length === mission.chain.length && chain.every((step, index) => step === mission.chain[index].id) ? 3 : chain.length >= 3 ? 2 : chain.length >= 1 ? 1 : 0;
  const actualTemperatureTrend = following.t2m - actual.t2m >= 1 ? "warmer" : following.t2m - actual.t2m <= -1 ? "cooler" : "steady";
  const actualPressureTrend = following.pressureKpa - actual.pressureKpa >= .12 ? "rising" : following.pressureKpa - actual.pressureKpa <= -.12 ? "falling" : "steady";
  const actualRainTrend = following.precipitation - actual.precipitation >= 1 ? "wetter" : following.precipitation - actual.precipitation <= -1 ? "drier" : "steady";
  const actualWindTrend = following.windSpeed - actual.windSpeed >= 1 ? "stronger" : following.windSpeed - actual.windSpeed <= -1 ? "lighter" : "steady";
  const forecastHits = [forecast.temperature === actualTemperatureTrend, forecast.pressure === actualPressureTrend, forecast.rain === actualRainTrend, forecast.wind === actualWindTrend].filter(Boolean).length;
  const prediction = mission.forecast ? (forecastHits >= 3 ? 3 : forecastHits >= 2 ? 2 : forecastHits >= 1 ? 1 : 0) : 0;
  const efficiency = selectedEvidence.length <= 4 ? 2 : selectedEvidence.length <= 6 ? 1 : 0;
  const feedback = [
    `${evidence}/3 useful evidence signals selected.`,
    `${concepts}/3 target concepts recognised: ${matchedConcepts.length ? matchedConcepts.join(" · ") : "none yet"}.`,
    `${reasoning}/3 causal order score.`,
    mission.forecast ? `${prediction}/3 forecast directions matched historical reality.` : "No forecast requested for this mission.",
    `${efficiency}/2 investigation efficiency — focused evidence beats opening every instrument.`,
  ];
  return { evidence, concepts, reasoning, prediction, efficiency, total: evidence + concepts + reasoning + prediction + efficiency, matchedConcepts, feedback };
}
