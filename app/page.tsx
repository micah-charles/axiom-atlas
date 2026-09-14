import type { Metadata } from "next";
import { AtlasHeader } from "./components/atlas/AtlasHeader";
import { SubjectRealmCard } from "./components/atlas/SubjectRealmCard";

export const metadata: Metadata = {
  title: "Axiom Atlas — Explore. Discover. Understand.",
  description: "An interactive learning universe where ideas become places to explore.",
};

export default function Home() {
  return <div className="atlas-shell atlas-home">
    <AtlasHeader active="home" />
    <main>
      <section className="atlas-home-hero" aria-labelledby="atlas-home-title">
        <div className="atlas-home-copy">
          <span className="atlas-eyebrow">AN INTERACTIVE LEARNING UNIVERSE</span>
          <h1 id="atlas-home-title">Explore.<br /><em>Discover.<br />Understand.</em></h1>
          <p>An interactive atlas of ideas. Learn by investigating systems, manipulating models, and discovering patterns.</p>
          <a className="atlas-primary-action" href="#realms">Choose a realm <span>↓</span></a>
        </div>
        <div className="atlas-home-visual" aria-label="A constellation of mathematical and geographic ideas">
          <div className="atlas-visual-grid" /><div className="atlas-visual-ring ring-one" /><div className="atlas-visual-ring ring-two" />
          <div className="atlas-visual-core"><span>AX</span><i /><i /><i /></div>
          <span className="atlas-coordinate coordinate-one">51.5°N · 0.1°W</span>
          <span className="atlas-coordinate coordinate-two">IDEAS / SYSTEMS / PATTERNS</span>
          <span className="atlas-visual-label label-one">MATH</span><span className="atlas-visual-label label-two">EARTH</span>
        </div>
      </section>
      <section className="atlas-realms" id="realms" aria-labelledby="realms-title">
        <div className="atlas-section-heading"><div><span className="atlas-eyebrow">CHOOSE YOUR STARTING POINT</span><h2 id="realms-title">Two ways into the Atlas.</h2></div><p>Each realm turns a different kind of understanding into a place to investigate.</p></div>
        <div className="atlas-subject-grid">
          <SubjectRealmCard tone="math" href="/math-logic" eyebrow="SUBJECT REALM 01" title="Math & Logic" subtitle="Patterns. Structures. Systems." description="Build intuition through tactile puzzles, experiments, and decisions that make the rule visible." facts={["15 core worlds", "Advanced simulation worlds", "600+ deterministic missions"]} icon="∑" action="Enter realm" image="/og.png" />
          <SubjectRealmCard tone="geography" href="/geography" eyebrow="SUBJECT REALM 02" title="Geography" subtitle="Planet. Climate. Places. People." description="Read the planet through real observations, maps, weather systems, and evidence-based investigations." facts={["Climate Detective active", "Historical observations", "More modules coming"]} icon="◉" action="Read the planet" />
        </div>
      </section>
      <section className="atlas-home-note" id="about" aria-labelledby="about-title"><div><span className="atlas-eyebrow">WHY THE ATLAS EXISTS</span><h2 id="about-title">Curiosity connects everything.</h2></div><p>From a sorting rule to a changing weather system, the Atlas invites learners to observe first, ask better questions, and build explanations they can test.</p></section>
      <section className="atlas-progress-strip" id="progress" aria-labelledby="progress-title"><span className="atlas-eyebrow">YOUR ATLAS</span><h2 id="progress-title">Progress stays with you.</h2><p>Math mastery and investigation results are kept privately on this device.</p><a href="/math-logic">View the Math realm <span>→</span></a></section>
    </main>
    <footer className="atlas-footer"><span>Axiom Atlas</span><span>Explore. Discover. Understand.</span><span>© 2026</span></footer>
  </div>;
}
