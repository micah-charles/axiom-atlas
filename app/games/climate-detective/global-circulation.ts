export type Hemisphere = "north" | "south";
export type PressureKind = "H" | "L";
export type WindBeltId = "north-polar-easterlies" | "north-westerlies" | "north-trade-winds" | "south-trade-winds" | "south-westerlies" | "south-polar-easterlies";
export type CoriolisExampleId = "north-equatorward" | "north-poleward" | "south-equatorward" | "south-poleward";

export type LatitudeBand = {
  latitude: number;
  label: string;
  shortLabel: string;
};

export type PressureBelt = {
  id: string;
  name: string;
  kind: PressureKind;
  centreLatitude: number;
  latitudeRange: string;
  verticalMotion: "rising" | "sinking";
  hemisphere: Hemisphere | "both";
};

export type AtmosphericCell = {
  id: string;
  name: "Hadley Cell" | "Ferrel Cell" | "Polar Cell";
  hemisphere: Hemisphere;
  fromLatitude: number;
  toLatitude: number;
  pressureConnection: string;
};

export type WindBelt = {
  id: WindBeltId;
  name: string;
  hemisphere: Hemisphere;
  latitudeRange: string;
  fromDirection: string;
  toDirection: string;
  fromBearing: number;
  toBearing: number;
  pressureBelts: string;
  cell: "Hadley Cell" | "Ferrel Cell" | "Polar Cell";
  note: string;
};

export const GLOBAL_LATITUDE_BANDS: LatitudeBand[] = [
  { latitude: 90, label: "90°N · North Pole", shortLabel: "90°N" },
  { latitude: 60, label: "60°N", shortLabel: "60°N" },
  { latitude: 30, label: "30°N", shortLabel: "30°N" },
  { latitude: 0, label: "0° · Equator", shortLabel: "Equator" },
  { latitude: -30, label: "30°S", shortLabel: "30°S" },
  { latitude: -60, label: "60°S", shortLabel: "60°S" },
  { latitude: -90, label: "90°S · South Pole", shortLabel: "90°S" },
];

export const GLOBAL_PRESSURE_BELTS: PressureBelt[] = [
  { id: "polar-high-north", name: "Polar High", kind: "H", centreLatitude: 75, latitudeRange: "60–90°N", verticalMotion: "sinking", hemisphere: "north" },
  { id: "subpolar-low-north", name: "Subpolar Low", kind: "L", centreLatitude: 60, latitudeRange: "about 60°N", verticalMotion: "rising", hemisphere: "north" },
  { id: "subtropical-high-north", name: "Subtropical High", kind: "H", centreLatitude: 30, latitudeRange: "about 30°N", verticalMotion: "sinking", hemisphere: "north" },
  { id: "equatorial-low", name: "Equatorial Low / ITCZ", kind: "L", centreLatitude: 0, latitudeRange: "about 10°N–10°S", verticalMotion: "rising", hemisphere: "both" },
  { id: "subtropical-high-south", name: "Subtropical High", kind: "H", centreLatitude: -30, latitudeRange: "about 30°S", verticalMotion: "sinking", hemisphere: "south" },
  { id: "subpolar-low-south", name: "Subpolar Low", kind: "L", centreLatitude: -60, latitudeRange: "about 60°S", verticalMotion: "rising", hemisphere: "south" },
  { id: "polar-high-south", name: "Polar High", kind: "H", centreLatitude: -75, latitudeRange: "60–90°S", verticalMotion: "sinking", hemisphere: "south" },
];

export const GLOBAL_CELLS: AtmosphericCell[] = [
  { id: "hadley-north", name: "Hadley Cell", hemisphere: "north", fromLatitude: 0, toLatitude: 30, pressureConnection: "Equatorial Low ↔ Subtropical High" },
  { id: "ferrel-north", name: "Ferrel Cell", hemisphere: "north", fromLatitude: 30, toLatitude: 60, pressureConnection: "Subtropical High ↔ Subpolar Low" },
  { id: "polar-north", name: "Polar Cell", hemisphere: "north", fromLatitude: 60, toLatitude: 90, pressureConnection: "Subpolar Low ↔ Polar High" },
  { id: "hadley-south", name: "Hadley Cell", hemisphere: "south", fromLatitude: -30, toLatitude: 0, pressureConnection: "Equatorial Low ↔ Subtropical High" },
  { id: "ferrel-south", name: "Ferrel Cell", hemisphere: "south", fromLatitude: -60, toLatitude: -30, pressureConnection: "Subtropical High ↔ Subpolar Low" },
  { id: "polar-south", name: "Polar Cell", hemisphere: "south", fromLatitude: -90, toLatitude: -60, pressureConnection: "Subpolar Low ↔ Polar High" },
];

export const GLOBAL_WIND_BELTS: WindBelt[] = [
  { id: "north-polar-easterlies", name: "Northern Polar Easterlies", hemisphere: "north", latitudeRange: "60–90°N", fromDirection: "east / north-east", toDirection: "west / south-west", fromBearing: 45, toBearing: 225, pressureBelts: "Polar High → Subpolar Low", cell: "Polar Cell", note: "A broad polar-belt tendency, not an exact daily wind." },
  { id: "north-westerlies", name: "Northern Mid-latitude Westerlies", hemisphere: "north", latitudeRange: "30–60°N", fromDirection: "west", toDirection: "east", fromBearing: 270, toBearing: 90, pressureBelts: "Subtropical High → Subpolar Low", cell: "Ferrel Cell", note: "The North Atlantic and UK often receive a south-westerly component within this broad westerly belt." },
  { id: "north-trade-winds", name: "Northern Trade Winds", hemisphere: "north", latitudeRange: "0–30°N", fromDirection: "north-east", toDirection: "south-west", fromBearing: 45, toBearing: 225, pressureBelts: "Subtropical High → Equatorial Low / ITCZ", cell: "Hadley Cell", note: "The air moves toward the equator and is deflected right in the Northern Hemisphere." },
  { id: "south-trade-winds", name: "Southern Trade Winds", hemisphere: "south", latitudeRange: "0–30°S", fromDirection: "south-east", toDirection: "north-west", fromBearing: 135, toBearing: 315, pressureBelts: "Subtropical High → Equatorial Low / ITCZ", cell: "Hadley Cell", note: "The air moves toward the equator and is deflected left in the Southern Hemisphere." },
  { id: "south-westerlies", name: "Southern Mid-latitude Westerlies", hemisphere: "south", latitudeRange: "30–60°S", fromDirection: "west", toDirection: "east", fromBearing: 270, toBearing: 90, pressureBelts: "Subtropical High → Subpolar Low", cell: "Ferrel Cell", note: "The Southern Hemisphere has its own westerly belt with a different Coriolis sense." },
  { id: "south-polar-easterlies", name: "Southern Polar Easterlies", hemisphere: "south", latitudeRange: "60–90°S", fromDirection: "east / south-east", toDirection: "west / north-west", fromBearing: 135, toBearing: 315, pressureBelts: "Polar High → Subpolar Low", cell: "Polar Cell", note: "A broad polar-belt tendency, not an exact daily wind." },
];

export const CORIOLIS_EXAMPLES = [
  { id: "north-equatorward", hemisphere: "north" as Hemisphere, motion: "Air moves south toward the equator", deflection: "right", resultingComponent: "westward", result: "north-east trade winds" },
  { id: "north-poleward", hemisphere: "north" as Hemisphere, motion: "Air moves north toward the pole", deflection: "right", resultingComponent: "eastward", result: "westerly component" },
  { id: "south-equatorward", hemisphere: "south" as Hemisphere, motion: "Air moves north toward the equator", deflection: "left", resultingComponent: "westward", result: "south-east trade winds" },
  { id: "south-poleward", hemisphere: "south" as Hemisphere, motion: "Air moves south toward the pole", deflection: "left", resultingComponent: "eastward", result: "westerly component" },
] as const;

export function coriolisMotionLatitudes(exampleId: CoriolisExampleId): { startLatitude: number; endLatitude: number } {
  const north = exampleId.startsWith("north");
  const towardPole = exampleId.endsWith("poleward");
  return {
    startLatitude: north ? 30 : -30,
    endLatitude: towardPole ? (north ? 60 : -60) : 0,
  };
}

export function coriolisDeflection(hemisphere: Hemisphere): "right" | "left" {
  return hemisphere === "north" ? "right" : "left";
}

export function windBeltForLatitude(latitude: number): WindBelt | null {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) return null;
  if (Math.abs(latitude) < 1) return null;
  const north = latitude > 0;
  const absolute = Math.abs(latitude);
  if (absolute <= 30) return GLOBAL_WIND_BELTS.find(belt => belt.id === (north ? "north-trade-winds" : "south-trade-winds")) ?? null;
  if (absolute < 60) return GLOBAL_WIND_BELTS.find(belt => belt.id === (north ? "north-westerlies" : "south-westerlies")) ?? null;
  return GLOBAL_WIND_BELTS.find(belt => belt.id === (north ? "north-polar-easterlies" : "south-polar-easterlies")) ?? null;
}

export function pressureBeltAtLatitude(latitude: number): PressureBelt | null {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) return null;
  return [...GLOBAL_PRESSURE_BELTS].sort((first, second) => Math.abs(first.centreLatitude - latitude) - Math.abs(second.centreLatitude - latitude))[0] ?? null;
}

export function atmosphericCellForLatitude(latitude: number): AtmosphericCell | null {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || Math.abs(latitude) < 0.001) return null;
  const hemisphere: Hemisphere = latitude > 0 ? "north" : "south";
  const absolute = Math.abs(latitude);
  const name = absolute <= 30 ? "Hadley Cell" : absolute < 60 ? "Ferrel Cell" : "Polar Cell";
  return GLOBAL_CELLS.find(cell => cell.hemisphere === hemisphere && cell.name === name) ?? null;
}

export function equalEarthPoint(longitude: number, latitude: number, width: number, height: number, padding = 24): { x: number; y: number } {
  const rad = Math.PI / 180;
  const phi = Math.max(-90, Math.min(90, latitude)) * rad;
  const lambda = Math.max(-180, Math.min(180, longitude)) * rad;
  const theta = Math.asin((Math.sqrt(3) / 2) * Math.sin(phi));
  const a1 = 1.340264;
  const a2 = -0.081106;
  const a3 = 0.000893;
  const a4 = 0.003796;
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  const xRaw = (2 * Math.sqrt(3) / 3) * lambda * Math.cos(theta) * (a1 + 3 * a2 * theta2 + theta6 * (7 * a3 + 9 * a4 * theta2));
  const yRaw = theta * (a1 + a2 * theta2 + theta6 * (a3 + a4 * theta2));
  const maxX = 4.86;
  const maxY = 1.32;
  return {
    x: padding + ((xRaw + maxX) / (2 * maxX)) * (width - padding * 2),
    y: padding + ((maxY - yRaw) / (2 * maxY)) * (height - padding * 2),
  };
}

export function isBritainMidLatitude(latitude: number): boolean {
  return latitude >= 50 && latitude <= 60;
}
