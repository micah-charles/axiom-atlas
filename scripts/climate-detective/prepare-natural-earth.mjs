import { mkdir, writeFile } from "node:fs/promises";

const sourceUrl = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";
const output = new URL("../../app/games/climate-detective/data/natural-earth-uk-europe.json", import.meta.url);
const keep = new Set(["United Kingdom", "Ireland", "France", "Spain", "Portugal", "Belgium", "Netherlands", "Germany", "Denmark", "Norway", "Iceland"]);
const response = await fetch(sourceUrl, { headers: { accept: "application/geo+json, application/json" } });
if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${sourceUrl}`);
const world = await response.json();
const features = world.features.filter(feature => keep.has(feature.properties?.ADMIN));
if (features.length !== keep.size) throw new Error(`Expected ${keep.size} Natural Earth features, received ${features.length}`);
await mkdir(new URL(".", output), { recursive: true });
await writeFile(output, `${JSON.stringify({ type: "FeatureCollection", features }, null, 2)}\n`);
console.log(JSON.stringify({ sourceUrl, output: "app/games/climate-detective/data/natural-earth-uk-europe.json", features: features.length }));
