export type ValleyReading = { time: number; rate: number };
export type ValleyOutcome = "success" | "shortage" | "flood";
export type RiverRectangle = { start: number; end: number; width: number; height: number; volume: number };
export type RiverModel = { id: "linear" | "quadratic" | "wave" | "flood" | "mixed"; name: string; formula: string; events: string[] };

const MODEL_IDS: RiverModel["id"][] = ["linear", "quadratic", "wave", "flood", "mixed"];

function rawRiverRate(time: number, seed: number, model: RiverModel["id"]): number {
  const t = Math.max(0, Math.min(60, time));
  const phase = (Math.abs(Math.floor(seed)) % 11) * .09;
  if (model === "linear") return 4.4 + .085 * t;
  if (model === "quadratic") return 3.8 + .0019 * t * t;
  if (model === "wave") return 7 + 2.15 * Math.sin(t / 7 + phase);
  if (model === "flood") return 13 * Math.exp(-t / 24) + 1.3;
  const cloudburst = t >= 28 && t <= 38 ? 2.2 * Math.sin(Math.PI * (t - 28) / 10) : 0;
  const leak = t >= 44 ? .9 : 0;
  return 7.2 + 1.35 * Math.sin((t + 3) / 5.7 + phase) + .7 * Math.sin(t / 2.4 + phase / 2) + cloudburst - leak;
}

function rawModelTotal(seed: number, model: RiverModel["id"]): number {
  let total = 0;
  for (let time = 0; time < 60; time += .25) total += (rawRiverRate(time, seed, model) + rawRiverRate(time + .25, seed, model)) * .125;
  return total;
}

export function valleyRiverModel(modelIndex = 4, seed = 0, target = 420): RiverModel {
  const id = MODEL_IDS[Math.abs(Math.floor(modelIndex)) % MODEL_IDS.length];
  const scale = target * 1.045 / rawModelTotal(seed, id);
  const factor = scale.toFixed(2);
  if (id === "linear") return { id, name: "Rising Snowmelt", formula: `Flow(t) = ${factor} × (4.4 + 0.085t)`, events: ["SUNRISE · FLOW RISES STEADILY"] };
  if (id === "quadratic") return { id, name: "Accelerating Thaw", formula: `Flow(t) = ${factor} × (3.8 + 0.0019t²)`, events: ["THAW · FLOW ACCELERATES"] };
  if (id === "wave") return { id, name: "Mountain Pulse", formula: `Flow(t) = ${factor} × (7 + 2.15 sin(t/7 + φ))`, events: ["PULSE · FLOW RISES AND FALLS"] };
  if (id === "flood") return { id, name: "Fading Flash Flood", formula: `Flow(t) = ${factor} × (13e⁻ᵗ⁄²⁴ + 1.3)`, events: ["FLASH FLOOD · HIGH EARLY FLOW"] };
  return { id, name: "Storm-and-Leak River", formula: `Flow(t) = ${factor} × (7.2 + 1.35 sin((t+3)/5.7+φ) + 0.7 sin(t/2.4+φ/2) + events)`, events: ["CLOUDBURST · 28–38s", "CHANNEL LEAK · AFTER 44s"] };
}

export function valleyFlowRate(time: number, seed = 0, target = 420, modelIndex = 4): number {
  const t = Math.max(0, Math.min(60, time));
  const model = valleyRiverModel(modelIndex, seed, target);
  const scale = target * 1.045 / rawModelTotal(seed, model.id);
  return Math.max(.2, rawRiverRate(t, seed, model.id) * scale);
}

export function valleyActualVolume(cutoff: number, seed = 0, target = 420, step = .1, modelIndex = 4): number {
  const end = Math.max(0, Math.min(60, cutoff));
  const width = Math.max(.02, step);
  let total = 0;
  for (let time = 0; time < end; time += width) {
    const next = Math.min(end, time + width);
    total += (valleyFlowRate(time, seed, target, modelIndex) + valleyFlowRate(next, seed, target, modelIndex)) * (next - time) / 2;
  }
  return total;
}

function inferredRate(time: number, readings: ValleyReading[]): number {
  const points = readings
    .filter(reading => reading.time >= 0 && reading.time <= 60)
    .sort((a, b) => a.time - b.time)
    .filter((reading, index, all) => index === all.findIndex(candidate => candidate.time === reading.time));
  const after = points.find(point => point.time >= time);
  const before = [...points].reverse().find(point => point.time <= time);
  if (!before && !after) return 0;
  if (!before) return after!.rate;
  if (!after || after.time === before.time) return before.rate;
  const mix = (time - before.time) / (after.time - before.time);
  return before.rate + (after.rate - before.rate) * mix;
}

export function buildValleyRectangles(readings: ValleyReading[], cutoff: number, sliceWidth: number): RiverRectangle[] {
  const end = Math.max(0, Math.min(60, cutoff));
  const width = Math.max(1, sliceWidth);
  const rectangles: RiverRectangle[] = [];
  for (let start = 0; start < end; start += width) {
    const stop = Math.min(end, start + width);
    const height = inferredRate((start + stop) / 2, readings);
    rectangles.push({ start, end: stop, width: stop - start, height, volume: height * (stop - start) });
  }
  return rectangles;
}

export function estimateValleyVolume(readings: ValleyReading[], cutoff: number, sliceWidth: number): number {
  return buildValleyRectangles(readings, cutoff, sliceWidth).reduce((total, rectangle) => total + rectangle.volume, 0);
}

export function valleyConfidence(readings: ValleyReading[], cutoff: number): number {
  const times = [0, ...readings.map(reading => reading.time).filter(time => time > 0 && time < cutoff), cutoff].sort((a, b) => a - b);
  const largestGap = times.slice(1).reduce((largest, time, index) => Math.max(largest, time - times[index]), cutoff);
  const coverage = Math.min(1, new Set(readings.map(reading => Math.floor(reading.time / 10))).size / Math.max(1, Math.ceil(cutoff / 10)));
  return Math.round(Math.max(12, Math.min(98, 28 + readings.length * 8 + coverage * 32 - largestGap * .7)));
}

export function resolveValleyOutcome(volume: number, target = 420, tolerance = 14): ValleyOutcome {
  if (Math.abs(volume - target) <= tolerance) return "success";
  return volume < target ? "shortage" : "flood";
}

export function valleyStars(volume: number, target: number, timeLeft: number, probesUsed: number): number {
  const error = Math.abs(volume - target);
  if (error <= 5 && timeLeft >= 15 && probesUsed <= 6) return 3;
  if (error <= 10) return 2;
  return 1;
}
