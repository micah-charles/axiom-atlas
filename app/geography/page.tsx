import type { Metadata } from "next";
import Link from "next/link";
import { AtlasHeader } from "../components/atlas/AtlasHeader";
import { Breadcrumbs } from "../components/atlas/Breadcrumbs";

export const metadata: Metadata = {
  title: "Geography Atlas",
  description: "Read the planet through climate, weather, landscapes and places.",
};

const futureModules = [
  { icon: "⌁", title: "Rivers & Coasts", copy: "Water, erosion and the shape of shorelines." },
  { icon: "△", title: "Tectonics", copy: "Earth’s restless plates and changing landscapes." },
  { icon: "▦", title: "Population & Cities", copy: "People, place and the systems between them." },
];

export default function GeographyRealm() {
  return <div className="atlas-shell realm-shell geography-realm">
    <AtlasHeader active="geography" />
    <main className="realm-page">
      <Breadcrumbs items={[{ label: "Axiom Atlas", href: "/" }, { label: "Geography" }]} />
      <section className="realm-hero geography-hero" aria-labelledby="geography-title">
        <div><span className="atlas-eyebrow">SUBJECT REALM · GEOGRAPHY</span><h1 id="geography-title">Geography Atlas</h1><p>Read the planet.</p><span className="realm-hero-rule" /></div>
        <div className="realm-hero-copy"><p>Investigate the Earth&apos;s systems, from climate and weather to landscapes, people and places.</p><span className="atlas-coordinate">REAL WORLD · REAL EVIDENCE</span></div>
        <div className="geography-hero-visual" aria-hidden="true"><div className="geo-contours" /><div className="geo-globe"><span>◉</span></div><i /><i /><i /></div>
      </section>
      <section className="geography-feature-section" aria-labelledby="featured-investigation-title">
        <div className="atlas-section-heading"><div><span className="atlas-eyebrow">FEATURED INVESTIGATION</span><h2 id="featured-investigation-title">Start with a changing atmosphere.</h2></div><p>One complete investigation is live now. Future modules stay visible without pretending to be ready.</p></div>
        <a className="climate-feature-card" href="/geography/climate-detective">
          <div className="climate-feature-art" aria-hidden="true"><span className="feature-pressure low">L</span><span className="feature-pressure high">H</span><div className="feature-isobar isobar-a" /><div className="feature-isobar isobar-b" /><div className="feature-isobar isobar-c" /><div className="feature-map-land" /><span className="feature-stamp">UK · NORTH ATLANTIC</span></div>
          <div className="climate-feature-copy"><span className="atlas-eyebrow">CLIMATE DETECTIVE</span><h3>Investigate a real UK year.</h3><p>Use historical weather observations, pressure systems, maps and evidence to understand how and why Britain&apos;s weather changes.</p><div className="feature-learning-list"><span>Historical observations</span><span>Forecasting</span><span>Cause → consequence</span><span>Evidence-based explanation</span></div><span className="atlas-primary-action">Start investigation <b>→</b></span></div>
        </a>
      </section>
      <section className="future-modules" aria-labelledby="future-title"><div className="atlas-section-heading"><div><span className="atlas-eyebrow">ON THE HORIZON</span><h2 id="future-title">More of the planet, later.</h2></div></div><div className="future-module-grid">{futureModules.map(module => <div className="future-module" key={module.title} aria-disabled="true"><span>{module.icon}</span><div><h3>{module.title}</h3><p>{module.copy}</p><small>Coming later</small></div></div>)}</div></section>
    </main>
    <footer className="atlas-footer"><span>Axiom Atlas · Geography</span><Link href="/">Return to Atlas entrance</Link></footer>
  </div>;
}
