import type { Metadata } from "next";
import { AtlasHeader } from "../../components/atlas/AtlasHeader";
import { Breadcrumbs } from "../../components/atlas/Breadcrumbs";

export const metadata: Metadata = {
  title: "Climate Detective",
  description: "Investigate a real UK year using weather observations, pressure systems and evidence.",
};

export default function ClimateDetectiveLanding() {
  return <div className="atlas-shell module-shell climate-landing-shell">
    <AtlasHeader active="geography" />
    <main className="module-page">
      <Breadcrumbs items={[{ label: "Axiom Atlas", href: "/" }, { label: "Geography", href: "/geography" }, { label: "Climate Detective" }]} />
      <section className="climate-landing-hero" aria-labelledby="climate-title">
        <div className="climate-landing-copy"><span className="atlas-eyebrow">GEOGRAPHY · INVESTIGATION 01</span><h1 id="climate-title">Climate Detective</h1><p className="climate-tagline">Investigate. Analyse. Explain.</p><p className="climate-intro">Use real weather data, pressure systems and evidence to understand how and why the UK&apos;s weather changes.</p><div className="climate-feature-pills"><span>Historical observations</span><span>Interactive weather maps</span><span>Cause and effect analysis</span><span>Build your own explanation</span></div><a className="atlas-primary-action" href="/geography/climate-detective/investigation">Begin investigation <span>→</span></a></div>
        <div className="climate-landing-visual" aria-hidden="true"><div className="landing-contour contour-one" /><div className="landing-contour contour-two" /><div className="landing-contour contour-three" /><div className="landing-uk-shape" /><div className="landing-pressure low">L</div><div className="landing-pressure high">H</div><span className="landing-location">UK / NORTH ATLANTIC</span><span className="landing-date">HISTORICAL YEAR · 2018</span></div>
      </section>
      <nav className="module-tabs" aria-label="Climate Detective information"><a href="#overview">Overview</a><a href="#how-it-works">How it works</a><a href="#data-sources">Data sources</a><a href="#learning-goals">Learning goals</a></nav>
      <section className="module-info-grid" id="overview"><article><span className="atlas-eyebrow">THE PREMISE</span><h2>Reality creates the mystery.</h2><p>The year moves forward until a meaningful change interrupts it. You collect evidence, form a causal explanation, predict what happens next, and compare your claim with the historical record.</p></article><article id="how-it-works"><span className="atlas-eyebrow">THE LOOP</span><h2>Observe → Investigate → Reveal.</h2><p>Pressure, wind, rainfall, temperature and seasonal context are instruments for reasoning. They are not a collection of layers to open without a question.</p></article><article id="data-sources"><span className="atlas-eyebrow">PROVENANCE</span><h2>Published data, clearly labelled.</h2><p>Mission data uses NASA POWER/MERRA-2 analysis, NOAA OISST and Natural Earth geographic boundaries. Derived contours and teaching models are labelled separately.</p></article><article id="learning-goals"><span className="atlas-eyebrow">YOU WILL PRACTISE</span><h2>Evidence before certainty.</h2><p>Distinguish weather from climate, identify pressure systems, explain air movement, forecast a next step and reflect on which evidence mattered.</p></article></section>
      <section className="module-start-strip"><div><span className="atlas-eyebrow">READY TO INVESTIGATE?</span><h2>The record is waiting.</h2></div><a className="atlas-primary-action" href="/geography/climate-detective/investigation">Enter the field notebook <span>→</span></a></section>
    </main>
    <footer className="atlas-footer"><span>Climate Detective · A Year on Earth</span><a href="/geography">Back to Geography</a></footer>
  </div>;
}
