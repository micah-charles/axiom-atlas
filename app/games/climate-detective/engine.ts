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
  source: { provider: string; dailyParameters: string; timeStandard: string; sourceUrl: string; dailyApiDocs?: string; atmosphericBase: string; regionalField?: string };
  pressureField: PressureField;
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
export type ConceptId = "PRESSURE" | "AIR_MASS" | "CONTINENTALITY" | "MARITIME_INFLUENCE" | "FRONT" | "RISING_AIR" | "CONDENSATION" | "CLIMATE_NORMAL" | "ANOMALY" | "AXIAL_TILT" | "SOLAR_ANGLE" | "INSOLATION" | "DAY_LENGTH";
export type ForecastChoice = "rising" | "falling" | "steady" | "warmer" | "cooler" | "wetter" | "drier" | "stronger" | "lighter";

export type CausalStep = { id: string; label: string; short: string; concept: ConceptId };
export type PressureFieldPoint = { longitude: number; latitude: number; surfaceElevation?: number; pressureKpa: number };
export type PressureField = {
  provider: string;
  parameter: string;
  units: "kPa";
  sourceUrl: string;
  timeStandard: string;
  resolution: { latitudeDegrees: number; longitudeDegrees: number; note: string };
  bounds: { west: number; east: number; south: number; north: number };
  values: Record<string, PressureFieldPoint[]>;
};
export type PressureContourSegment = { levelKpa: number; a: { longitude: number; latitude: number }; b: { longitude: number; latitude: number } };
export type PressureContourLabel = { levelKpa: number; longitude: number; latitude: number };
export type PressureCentre = { kind: "L" | "H"; longitude: number; latitude: number; pressureKpa: number; surfaceElevation?: number };
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
      { id: "low-pressure-centre", label: "An Atlantic low affects Britain", short: "low-pressure system", concept: "PRESSURE" },
      { id: "falling-pressure", label: "Surface pressure falls", short: "falling pressure", concept: "PRESSURE" },
      { id: "pressure-gradient", label: "Pressure differences strengthen the wind", short: "pressure gradient", concept: "PRESSURE" },
      { id: "moist-air-arrives", label: "Moist maritime air arrives", short: "Atlantic air mass", concept: "MARITIME_INFLUENCE" },
      { id: "rising-condensation", label: "Rising air cools, condenses, and brings rain", short: "rising air + condensation", concept: "RISING_AIR" },
    ],
    requiredConcepts: ["PRESSURE", "MARITIME_INFLUENCE", "RISING_AIR"],
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

export function pressureFieldForDate(field: PressureField, date: string): PressureFieldPoint[] { return field.values[date] ?? []; }

function fieldGrid(field: PressureField, date: string) {
  const points = pressureFieldForDate(field, date);
  const longitudes = [...new Set(points.map(point => point.longitude))].sort((a, b) => a - b);
  const latitudes = [...new Set(points.map(point => point.latitude))].sort((a, b) => a - b);
  const byCoordinate = new Map(points.map(point => [`${point.longitude.toFixed(3)},${point.latitude.toFixed(3)}`, point]));
  const at = (longitude: number, latitude: number) => byCoordinate.get(`${longitude.toFixed(3)},${latitude.toFixed(3)}`);
  return { longitudes, latitudes, at };
}

export function pressureContourSegments(field: PressureField, date: string, levelsKpa: number[]): PressureContourSegment[] {
  const { longitudes, latitudes, at } = fieldGrid(field, date);
  const segments: PressureContourSegment[] = [];
  const edgePairs: Record<number, [number, number]> = { 0: [0, 1], 1: [1, 2], 2: [2, 3], 3: [3, 0] };
  const cases: Record<number, number[][]> = {
    0: [], 1: [[3, 0]], 2: [[0, 1]], 3: [[3, 1]], 4: [[1, 2]], 5: [[3, 2], [0, 1]], 6: [[0, 2]], 7: [[3, 2]],
    8: [[2, 3]], 9: [[0, 2]], 10: [[0, 1], [2, 3]], 11: [[1, 2]], 12: [[3, 1]], 13: [[0, 1]], 14: [[3, 0]], 15: [],
  };
  for (const levelKpa of levelsKpa) {
    for (let rowIndex = 0; rowIndex < latitudes.length - 1; rowIndex += 1) {
      for (let columnIndex = 0; columnIndex < longitudes.length - 1; columnIndex += 1) {
        const corners = [
          at(longitudes[columnIndex], latitudes[rowIndex]),
          at(longitudes[columnIndex + 1], latitudes[rowIndex]),
          at(longitudes[columnIndex + 1], latitudes[rowIndex + 1]),
          at(longitudes[columnIndex], latitudes[rowIndex + 1]),
        ];
        if (corners.some(corner => !corner || !Number.isFinite(corner.pressureKpa))) continue;
        const values = corners.map(corner => corner!.pressureKpa);
        const mask = values.reduce((bits, value, index) => bits | (value >= levelKpa ? 1 << index : 0), 0);
        const pointOnEdge = (edge: number) => {
          const [start, end] = edgePairs[edge];
          const first = corners[start]!; const second = corners[end]!;
          const denominator = second.pressureKpa - first.pressureKpa;
          const ratio = Math.abs(denominator) < 1e-9 ? .5 : Math.max(0, Math.min(1, (levelKpa - first.pressureKpa) / denominator));
          return { longitude: first.longitude + (second.longitude - first.longitude) * ratio, latitude: first.latitude + (second.latitude - first.latitude) * ratio };
        };
        for (const [aEdge, bEdge] of cases[mask] ?? []) segments.push({ levelKpa, a: pointOnEdge(aEdge), b: pointOnEdge(bEdge) });
      }
    }
  }
  return segments;
}

export function pressureContourLevels(field: PressureField, date: string, intervalHpa = 4): number[] {
  const points = pressureFieldForDate(field, date);
  const focused = points.filter(point => point.longitude >= -18 && point.longitude <= 4 && point.latitude >= 48 && point.latitude <= 62 && (point.surfaceElevation ?? 0) <= 10);
  const values = (focused.length ? focused : points).map(point => point.pressureKpa).filter(Number.isFinite);
  if (!values.length || intervalHpa <= 0) return [];
  const minimumHpa = Math.ceil(Math.min(...values) * 10 - 1e-6);
  const maximumHpa = Math.floor(Math.max(...values) * 10 + 1e-6);
  const firstHpa = Math.ceil(minimumHpa / intervalHpa) * intervalHpa;
  const lastHpa = Math.floor(maximumHpa / intervalHpa) * intervalHpa;
  const levels: number[] = [];
  for (let hpa = firstHpa; hpa <= lastHpa; hpa += intervalHpa) levels.push(Number((hpa / 10).toFixed(1)));
  return levels;
}

export function pressureContourLabels(field: PressureField, date: string, levelsKpa: number[], maximum = 5): PressureContourLabel[] {
  if (maximum <= 0) return [];
  const levels = [...new Set(levelsKpa)].sort((a, b) => a - b);
  if (levels.length <= 1 || maximum === 1) {
    const levelKpa = levels[0];
    if (levelKpa === undefined) return [];
    const segment = pressureContourSegments(field, date, [levelKpa])[0];
    return segment ? [{ levelKpa, longitude: (segment.a.longitude + segment.b.longitude) / 2, latitude: (segment.a.latitude + segment.b.latitude) / 2 }] : [];
  }
  const selectedLevels = levels.length <= maximum
    ? levels
    : levels.filter((_, index) => index === 0 || index === levels.length - 1 || index % Math.ceil((levels.length - 1) / (maximum - 1)) === 0).slice(0, maximum);
  const segments = pressureContourSegments(field, date, selectedLevels);
  const low = derivePressureCentres(field, date).find(centre => centre.kind === "L");
  return selectedLevels.flatMap(levelKpa => {
    const candidates = segments.filter(segment => segment.levelKpa === levelKpa);
    if (!candidates.length) return [];
    const ordered = low ? [...candidates].sort((first, second) => {
      const distance = (segment: PressureContourSegment) => {
        const longitude = (segment.a.longitude + segment.b.longitude) / 2;
        const latitude = (segment.a.latitude + segment.b.latitude) / 2;
        return Math.hypot(longitude - low.longitude, latitude - low.latitude);
      };
      return distance(first) - distance(second);
    }) : candidates;
    const segment = ordered[0];
    return [{ levelKpa, longitude: (segment.a.longitude + segment.b.longitude) / 2, latitude: (segment.a.latitude + segment.b.latitude) / 2 }];
  });
}

export function derivePressureCentres(field: PressureField, date: string): PressureCentre[] {
  const points = pressureFieldForDate(field, date);
  const focused = points.filter(point => point.longitude >= -18 && point.longitude <= 4 && point.latitude >= 48 && point.latitude <= 62 && (point.surfaceElevation ?? 0) <= 10);
  const candidates = focused.length ? focused : points;
  if (!candidates.length) return [];
  const low = candidates.reduce((best, point) => point.pressureKpa < best.pressureKpa ? point : best);
  const high = candidates.reduce((best, point) => point.pressureKpa > best.pressureKpa ? point : best);
  return [
    { kind: "L", longitude: low.longitude, latitude: low.latitude, pressureKpa: low.pressureKpa, surfaceElevation: low.surfaceElevation },
    { kind: "H", longitude: high.longitude, latitude: high.latitude, pressureKpa: high.pressureKpa, surfaceElevation: high.surfaceElevation },
  ];
}

export function evidenceLabel(id: EvidenceId): string {
  return ({ temperature: "Temperature", normal: "Climate normal", pressure: "Surface pressure", wind: "Wind", rain: "Rainfall", sst: "North Atlantic SST", season: "Seasonal geometry" })[id];
}

export function evidenceValue(id: EvidenceId, row: ClimateRow, previous: ClimateRow, location: ClimateLocation, date: string): { value: string; detail: string; concepts: ConceptId[] } {
  if (id === "temperature") return { value: `${row.t2m.toFixed(1)} °C`, detail: `${row.t2m - previous.t2m >= 0 ? "+" : ""}${(row.t2m - previous.t2m).toFixed(1)} °C since yesterday`, concepts: ["ANOMALY"] };
  if (id === "normal") return { value: `${row.monthNormal.toFixed(1)} °C normal`, detail: `Actual anomaly ${row.anomaly >= 0 ? "+" : ""}${row.anomaly.toFixed(1)} °C`, concepts: ["CLIMATE_NORMAL", "ANOMALY"] };
  if (id === "pressure") return { value: `${pressureHpa(row)} hPa`, detail: `${pressureHpa(row) - pressureHpa(previous) >= 0 ? "+" : ""}${(pressureHpa(row) - pressureHpa(previous)).toFixed(1)} hPa since yesterday`, concepts: ["PRESSURE"] };
  if (id === "wind") return { value: `${row.windCompass} · ${row.windSpeed.toFixed(1)} m/s`, detail: windDirectionLabel(row.windDirection), concepts: ["AIR_MASS"] };
  if (id === "rain") return { value: `${row.precipitation.toFixed(1)} mm/day`, detail: row.precipitation >= 3 ? "A wet day: rising air and condensation may be involved" : "Little measurable precipitation", concepts: ["RISING_AIR", "CONDENSATION"] };
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
  FRONT: /front|frontal|warm front|cold front|occluded|rain band/i,
  RISING_AIR: /rising air|air rises|uplift|lifted air/i,
  CONDENSATION: /condensation|condenses|cloud droplets/i,
  CLIMATE_NORMAL: /normal|average|climatology|baseline|expected/i,
  ANOMALY: /anomal|unusual|\b(?:above|below|(?:difference|departure) (?:from|between|relative to|compared with))\b[^.!?;]{0,60}\b(?:normals?|averages?|baseline|expected)\b/i,
  AXIAL_TILT: /tilt|23\.5|axis/i,
  SOLAR_ANGLE: /solar angle|sun angle|direct|sunlight angle|sun higher/i,
  INSOLATION: /insolation|solar energy|energy from the sun|radiation/i,
  DAY_LENGTH: /day length|longer days|daylight|shorter days/i,
};

export function conceptsFromText(text: string): ConceptId[] {
  return (Object.keys(conceptPatterns) as ConceptId[]).filter(concept => conceptPatterns[concept].test(text));
}

/** Bounded proposition rules, not a general semantic grader. Negation belongs to a predicate. */
export function fieldNoteScienceIssues(text: string): string[] {
  const normalized = text.toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\b(doesn't|don't|isn't|aren't|can't|won't)\b/g, word => ({ "doesn't": "does not", "don't": "do not", "isn't": "is not", "aren't": "are not", "can't": "can not", "won't": "will not" })[word]!)
    .replace(/\b(high|low)-pressure\b/g, "$1 pressure");
  const issues = new Set<string>();
  const pressureRepair = "Repair the pressure mechanism: low pressure is associated with rising air; high pressure with sinking air.";
  const rainRepair = "Repair the rain mechanism: rising moist air cools; cooling allows condensation, rather than warming causing it.";
  const auxiliaries = "(?:(?:does|do|is|are|can|cannot|will|would|should|may|must|not|never|usually|generally|often|normally|typically|always|necessarily)\\s+)*";
  const air = "(?:(?:the|warm|moist|cold|atlantic|maritime)\\s+)*air";
  const motion = "(?:rise|rises|rising|ascend|ascends|ascending|sink|sinks|sinking|descend|descends|descending)";
  const negated = (predicate: string, source: string, index: number) => {
    // A wrapper directly denying this claim counts; an unrelated earlier 'not' does not.
    const wrapper = source.slice(Math.max(0, index - 70), index);
    return /\b(?:not|never|cannot)\b/.test(predicate) || /(?:not (?:true|correct) that|(?:false|incorrect|wrong) (?:that|to say that))\s*$/.test(wrapper);
  };
  const nonUniversal = (predicate: string) => /\bnot (?:always|necessarily)\b/.test(predicate);
  const checkPressure = (kind: string, predicate: string, direction: string, source: string, index: number) => {
    if (nonUniversal(predicate)) return;
    const rising = /^(?:ris|ascend)/.test(direction);
    const supported = kind === "low" ? rising : !rising;
    if (supported === negated(predicate, source, index)) issues.add(pressureRepair);
  };
  const pressureClaim = new RegExp(`\\b(high|low) pressure\\s+(${auxiliaries}(?:(?:make|makes|cause|causes|help|helps|bring|brings|lead to|leads to|associated with|allow|allows|mean|means)\\s+)?(?:${air}\\s+(?:to\\s+)?)?)(${motion})\\b`, "g");
  const inversePressureClaim = new RegExp(`\\b${air}\\s+(${auxiliaries})(${motion})\\s+(?:under|in|with|due to|because of)\\s+(high|low) pressure\\b`, "g");

  // Check causal temperature claims first. A denied causal claim must not become
  // an affirmative warming claim merely because its subordinate phrase contains 'air warms'.
  const causalClaim = /\b(condensation|condensing|cloud droplets)\s+((?:(?!\b(?:and|but)\b)[^.!?;]){0,65}?)(?:because|due to|caused by|from|when)\s+((?:(?!\b(?:and|but)\b)[^.!?;]){0,65})/g;
  const reverseCausalClaim = /\b(warming|heating|cooling)\s+((?:(?!\b(?:and|but)\b)[^.!?;]){0,55}?)(?:cause|causes|produce|produces|lead to|leads to|allow|allows)\s+(condensation|condensing|cloud droplets)\b/g;
  for (const sentence of normalized.split(/[.!?;]|\b(?:but|whereas|instead|although)\b/)) {
    for (const match of sentence.matchAll(pressureClaim)) checkPressure(match[1], match[2], match[3], sentence, match.index);
    for (const match of sentence.matchAll(inversePressureClaim)) checkPressure(match[3], match[1], match[2], sentence, match.index);
    let thermalSource = sentence;
    for (const match of sentence.matchAll(causalClaim)) {
      const reason = match[3];
      // 'Warm moist air' describes its source temperature. Only warming/heating verbs
      // or process nouns assert a temperature increase as the cause of condensation.
      const warming = /\b(?:warming|heating|warms|heats)\b|\b(?:air|it) (?:gets|becomes) warmer\b/.test(reason) || new RegExp(`\\b${air}\\s+(?:(?:does|do|can|will|would|may|must|not|never)\\s+)*(?:warm|heat)\\b`).test(reason);
      const cooling = /\b(?:cooling|cools)\b/.test(reason) || new RegExp(`\\b${air}\\s+${auxiliaries}cool\\b`).test(reason);
      const denied = negated(match[2], sentence, match.index) || /\b(?:not|never)\b/.test(reason);
      if ((!denied && warming) || (denied && cooling && !nonUniversal(match[2]))) issues.add(rainRepair);
      if (denied) thermalSource = thermalSource.replace(match[0], " ".repeat(match[0].length));
    }
    for (const match of sentence.matchAll(reverseCausalClaim)) {
      const denied = negated(match[2], sentence, match.index);
      if ((match[1] === "cooling") === denied && !nonUniversal(match[2])) issues.add(rainRepair);
    }
    const thermalVerb = "(?:warm|warms|warming|cool|cools|cooling|heat|heats|heating|get warmer|gets warmer|become warmer|becomes warmer)";
    const risingSubject = `(?:rising\\s+${air}|${air}\\s+(?:(?:that|which)\\s+)?(?:rises|is rising|ascends))`;
    const risingThermalClaim = new RegExp(`\\b${risingSubject}\\s*,?\\s*((?:(?:and|then)\\s+)?${auxiliaries})(${thermalVerb})\\b`, "g");
    const thermalWhileRising = new RegExp(`\\b${air}\\s+(${auxiliaries})(${thermalVerb})(?:\\s+up)?\\s+(?:as|when|while|because)\\s+(?:it|the air)\\s+(?:rises|ascends|is rising)\\b`, "g");
    const risingThenThermal = new RegExp(`\\b(?:as|when|while)\\s+${air}\\s+(?:rises|ascends)\\s*,?\\s*(?:it|the air)\\s+(${auxiliaries})(${thermalVerb})\\b`, "g");
    for (const pattern of [risingThermalClaim, thermalWhileRising, risingThenThermal]) {
      for (const match of thermalSource.matchAll(pattern)) {
        const predicate = match[1];
        if (nonUniversal(predicate)) continue;
        if (/\b(?:is|are)\s*$/.test(predicate) && /^(?:warm|cool)$/.test(match[2])) continue; // state, not temperature change
        const cooling = /^cool/.test(match[2]);
        if (cooling === negated(predicate, thermalSource, match.index)) issues.add(rainRepair);
      }
    }
  }
  return [...issues];
}

export function forecastComparison(actual: ClimateRow, following: ClimateRow, forecast: Record<string, ForecastChoice>) {
  const specs = [
    { key: "temperature", label: "Temperature", before: actual.t2m, after: following.t2m, threshold: 1, unit: "°C", up: "warmer", down: "cooler" },
    { key: "pressure", label: "Pressure", before: pressureHpa(actual), after: pressureHpa(following), threshold: 1.2, unit: "hPa", up: "rising", down: "falling" },
    { key: "wind", label: "Wind speed", before: actual.windSpeed, after: following.windSpeed, threshold: 1, unit: "m/s", up: "stronger", down: "lighter" },
    { key: "rain", label: "Rainfall", before: actual.precipitation, after: following.precipitation, threshold: 1, unit: "mm/day", up: "wetter", down: "drier" },
  ];
  return specs.map(spec => {
    const delta = Number((spec.after - spec.before).toFixed(6));
    const observed = delta >= spec.threshold ? spec.up : delta <= -spec.threshold ? spec.down : "steady";
    return { ...spec, delta, observed, predicted: forecast[spec.key], hit: forecast[spec.key] === observed };
  });
}

export function pressureStoryRows(location: ClimateLocation, date: string, committed = false): ClimateRow[] {
  return [previousRow(location, date), rowAt(location, date), ...(committed ? [nextRow(location, date)] : [])]
    .filter((row, index, all) => all.findIndex(candidate => candidate.date === row.date) === index);
}

export function continuationDate(date: string, revealedDate: string | null): string {
  return revealedDate && revealedDate > date ? revealedDate : date;
}

export function evidenceInterpretation(task: "wind" | "rain", choice: string, row: ClimateRow): { correct: boolean; feedback: string } {
  if (task === "wind") {
    const correct = choice === "from-atlantic" && row.windDirection >= 180 && row.windDirection <= 315;
    return { correct, feedback: correct ? `FROM ${row.windCompass} points back across the Atlantic. Moist maritime air is a supported interpretation, not a measured moisture trajectory.` : "The label names where wind comes FROM; the arrow points TO. Trace the source direction back from Britain, then try again." };
  }
  const correct = choice === "supports-uplift" && row.precipitation > 0;
  return { correct, feedback: correct ? `${row.precipitation.toFixed(1)} mm/day supports a wet-day explanation. Rising and cooling moist air can condense; rainfall alone does not locate a front or prove the mechanism.` : "A rainfall total measures water reaching the surface. It supports wet weather, but cannot prove that high pressure makes air rise or pinpoint a front. Reconsider what this observation supports." };
}

/**
 * Stable, seedable Fisher–Yates shuffle for causal cards. The UI supplies a
 * fresh attempt seed; tests can use fixed seeds without depending on DOM order.
 */
export function shuffleCausalIds(ids: string[], seed = 1): string[] {
  const shuffled = [...ids];
  let state = (Math.abs(Math.trunc(seed)) || 1) >>> 0;
  const nextRandom = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state;
  };
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = nextRandom() % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  if (shuffled.length > 1 && shuffled.every((id, index) => id === ids[index])) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export function causalPrefixLength(mission: ClimateMission, chain: string[]): number {
  let prefix = 0;
  while (prefix < chain.length && chain[prefix] === mission.chain[prefix]?.id) prefix += 1;
  return prefix;
}

export function causalOrderFeedback(mission: ClimateMission, chain: string[]): string {
  const firstWrongIndex = chain.findIndex((step, index) => step !== mission.chain[index]?.id);
  if (firstWrongIndex < 0) return "The causal links are in a supported order.";
  const placed = mission.chain.find(step => step.id === chain[firstWrongIndex]);
  const expected = mission.chain[firstWrongIndex];
  if (placed?.id === "rising-condensation") return "Rain is evidence, but think about the order: does rainfall make moist air rise, or does rising moist air eventually help produce rainfall?";
  if (placed?.id === "moist-air-arrives" && expected?.id === "pressure-gradient") return "What transports the air toward Britain? Build the pressure-gradient wind step before the maritime-air step.";
  return `This link may be real, but the next supported step is ${expected?.short ?? "another process"}. Tap the misplaced link to remove it and repair the story.`;
}

export function explanationLockReasons(mission: ClimateMission, chain: string[], answer: string, guidedTasksComplete = true): string[] {
  const reasons: string[] = [];
  if (!guidedTasksComplete) reasons.push("Finish all three map tasks and pin their discoveries in the field notebook.");
  const chainComplete = chain.length === mission.chain.length && chain.every((step, index) => step === mission.chain[index].id);
  if (!chainComplete) reasons.push(`Complete the causal chain in order (${chain.length}/${mission.chain.length} links placed).`);
  if (answer.trim().length < 12) reasons.push("Write a field note of at least one sentence explaining the change.");
  const recognised = conceptsFromText(answer);
  if (recognised.length < 2) reasons.push("Name at least two climate concepts in the field note, such as pressure, maritime air, rising air, or condensation.");
  reasons.push(...fieldNoteScienceIssues(answer));
  return reasons;
}

export function scoreMission(mission: ClimateMission, selectedEvidence: EvidenceId[], chain: string[], answer: string, forecast: Record<string, ForecastChoice>, actual: ClimateRow, following: ClimateRow, hintsUsed = 0): { evidence: number; concepts: number; reasoning: number; prediction: number; efficiency: number; total: number; matchedConcepts: ConceptId[]; feedback: string[] } {
  const relevantEvidence = selectedEvidence.filter(id => mission.evidence.includes(id));
  const evidence = Math.min(3, new Set(relevantEvidence).size);
  const textConcepts = conceptsFromText(answer);
  const chainConcepts = mission.chain.filter(step => chain.includes(step.id)).map(step => step.concept);
  const matchedConcepts = [...new Set([...textConcepts, ...chainConcepts])];
  const concepts = Math.min(3, mission.requiredConcepts.filter(concept => matchedConcepts.includes(concept)).length);
  const reasoning = chain.length === mission.chain.length && chain.every((step, index) => step === mission.chain[index].id) ? 3 : chain.length >= 3 ? 2 : chain.length >= 1 ? 1 : 0;
  const forecastHits = forecastComparison(actual, following, forecast).filter(item => item.hit).length;
  const prediction = mission.forecast ? (forecastHits >= 3 ? 3 : forecastHits >= 2 ? 2 : forecastHits >= 1 ? 1 : 0) : 0;
  const efficiency = selectedEvidence.length <= 3 && hintsUsed === 0 ? 2 : selectedEvidence.length <= 4 && hintsUsed <= 1 ? 1 : 0;
  const feedback = [
    `${new Set(relevantEvidence).size} distinct useful clues pinned → ${evidence}/3 evidence points (one per clue, capped at three).`,
    `${concepts}/3 target concepts recognised: ${matchedConcepts.length ? matchedConcepts.join(" · ") : "none yet"}.`,
    `${reasoning}/3 causal order score.`,
    mission.forecast ? `${forecastHits}/4 directions correct → ${prediction}/3 forecast points: 0, 1, 2 or 3–4 matches earn 0, 1, 2 or 3 points.` : "No forecast requested for this mission.",
    `${efficiency}/2 investigation efficiency — focused evidence beats opening every instrument.`,
  ];
  return { evidence, concepts, reasoning, prediction, efficiency, total: evidence + concepts + reasoning + prediction + efficiency, matchedConcepts, feedback };
}
