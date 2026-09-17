# M01 UI review — ChatGPT v1

- Source branch: `feature/architecture-evolution-lab`
- Source commit: `e8a07ef`
- Evidence packet: `docs/architecture-evolution-lab/evidence/ui-review/m01/`
- Review scope: first playable Architecture Evolution Lab scenario, screenshots captured at Chrome 150% zoom

OVERALL VERDICT

M01 has a sound technical/causal skeleton but a weaker game presentation. The committed flow genuinely progresses from evidence → architecture choice → request execution → failure-domain reveal → causal explanation → delayed architecture naming, which is a good foundation. The main product problem is that too much of that reasoning is presented through dense persistent text, already-explained evidence, obviously favoured choices, and repeated “advance” actions. At the captured 150% Chrome zoom / 1270×577 CSS viewport, the need for zoom is unsurprising: M01 deliberately uses many .40rem–.78rem text styles, including .4rem provenance/service text and .48rem overlines.

I would score the current experience Visual clarity 6.5/10 · Gameplay 5.5/10 · Readability 5/10 · Presentation 7/10. The dark cyan/gold identity is strong and suitable for an architecture laboratory, but the interaction currently feels closer to a polished interactive worksheet than a systems-investigation game.

One limitation on this review: the committed packet establishes all 11 screenshot states and their exact 150% capture conditions, but the GitHub connector exposes the JPG binaries here rather than rendering them directly to my vision surface. I therefore ground the screen-by-screen judgments in the committed state sequence plus the exact component/CSS producing those captures, rather than claiming pixel-level observations I cannot verify.

SCREEN-BY-SCREEN FINDINGS
Capture	Severity	What works	Specific problem / opportunity
01 — Fresh investigation	Major	The empty topology is a strong starting metaphor: there is genuinely “no serving topology yet,” and the architecture name is withheld.	This first screen carries too many simultaneous reading layers: persistent mission narrative, objective, three facts, provenance note, mission heading, investigation explanation, four evidence cards, and empty-system instructions. Worse, the evidence cards show their observation text before inspection; clicking mainly reveals interpretation/source. So “inspect” is mechanically a click gate more than a discovery action.
02 — Evidence inspected / approaches unlocked	Blocker for gameplay quality	Unlocking architectural choices after evidence is conceptually right.	The game gives away its preference. Approach A always carries the CSS class proportionate, a gold left border, and copy saying “complete request path · 4 lab units” before the player has tested it. Evidence interpretation also says unnecessary infrastructure has a cost and that local state can be co-located for the first release. This turns the architecture decision into answer recognition rather than deduction.
03 — Complete topology	Positive / Minor	This is where M01 starts to feel like architecture: browser → host → Tomcat/MySQL/images is a meaningful spatial representation, with cost/setup/path metrics.	Feedback comes too early and too definitively: selecting A immediately says “A complete path is ready” / “Topology can serve the shop.” The player has not actually proved the request yet. Prefer “candidate topology assembled — test it” and reserve validation for the successful request.
04 — Request step 1/9	Major	Manual request progression makes the architecture causal rather than static.	The entire nine-step trace is rendered at once, including future event names, details and targets. The player can read the complete answer path before advancing. Six tiny trace cards per row also create exactly the kind of 150%-zoom density you are seeing.
05 — Request step 2/9	Major	Active/done styling gives clear progress.	Interaction is essentially “press Advance again.” There is no meaningful prediction or routing decision. The current-step callout duplicates information already present in the active trace card.
06 — Request step 5/9	Major	By this point the request has touched application, data and local files, so the technical teaching content is good.	Mid-flow suspense is low because every later step remains visible. A stronger game would pause at selected decision points—e.g. “Where does product data come from?” or “Where is this image read from?”—and let the player route the request.
07 — Request step 9/9	Minor / Positive	Including order submit → JDBC write → confirmation fixes an important conceptual gap: M01 proves both product read and order write. The nine-step trace is source-review-backed.	The end of the request should feel like earned success, but mechanically it is just the ninth identical advance. Use a visual completion payoff and perhaps collapse prior steps into a concise trace history.
08 — Failure reveal	Positive with Major opportunity	This is M01's strongest dramatic moment. The same topology turns into a shared red failure domain, making the trade-off concrete instead of theoretical.	The player only acknowledges the failure after it is shown. There is no prediction. Ask “If HOST 01 disappears, what survives?” first, then let the player Pull Host 01 and compare the prediction with the reveal. That would add suspense and causal ownership without changing the technical lesson.
09 — Explanation empty	Major	Separating “why it fits now” from “what remains unsolved” is exactly the right learning objective.	This is highly worksheet-like. The copy literally tells the player to select evidence, the central fit claim and the shared failure consequence, while every selectable chip is part of the required answer. There are no plausible distractors or ordering decisions.
10 — Explanation ready	Minor / Major gameplay opportunity	Selected-state highlighting makes the chain readable and the final causal relation explicit.	Because submit is enabled only when all five exact tokens are selected and there are essentially no wrong causal alternatives, getting “ready” is mostly completion of a checklist. Add plausible competing claims and require construction/order, not simple selection of everything presented.
11 — Complete 100	Positive / Minor	Delaying “Single-Node Monolith” until completion is excellent. The boundary copy also carries the right idea forward without prescribing a future technology.	The completion view is overloaded: architecture reveal + five score metrics + total score + boundary hook + three actions. The learning payoff competes with administrative scoring. Make the architecture discovery and causal lesson dominant; collapse category scoring behind “See score details.”
PRIORITIZED CHANGES
Must-fix

Raise the typography floor before anything cosmetic. Remove .4rem–.58rem player-facing text from the core game. Target roughly 14–16px body, 12–13px metadata minimum, 16px+ evidence titles, with line-height around 1.45–1.65. The existing CSS contains many text sizes equivalent to roughly 6–9 CSS px at 100%, which directly explains why 150% zoom is necessary.

Remove answer leakage from the architecture-choice screen. Do not style A as .proportionate before evaluation; remove “complete request path” from its pre-test card. Make A/B/C/D visually neutral until selected and tested. The engine may still retain deterministic outcomes; the UI should not expose the winner in advance.

Turn “inspection” into actual discovery. Before inspection, show a short evidence title/question, not the full observation. On inspect, reveal the observation and provenance. Delay the interpretive sentence—or let the player infer/select the implication—because current interpretations heavily guide the correct architecture.

Redesign the nine-step request sequence. Do not render all future event details/targets. Show previous steps + current step + locked future markers. At 2–3 important points require the player to choose the next target; auto-run obvious transitions. This converts nine “Next” clicks into an actual architecture-path exercise.

Add a prediction before the host-failure reveal. Let the player mark what they think survives, then “Pull HOST 01.” Compare predicted vs actual HTTP/DB/images/session outcomes. This is the clearest opportunity to add suspense without adding irrelevant complexity.

Replace the explanation checklist with a causal-construction task. Use slots for BECAUSE → DESIGN FITS → BUT/RISK, with a pool containing correct and plausible incorrect claims. Require selection/order and provide misconception-specific feedback.

Polish after the loop is stronger

Collapse persistent briefing content after the first action. The left panel currently remains present through simulation, failure, explanation and completion. Convert it to a compact mission strip after briefing; this matters even more on mobile.

Simplify the completion screen. Lead with Single-Node Monolith, a two-sentence discovery, and the next boundary. Put detailed five-category scoring in a disclosure/accordion.

PROTOTYPE DIRECTION

Use an “Architecture Workbench” rather than replacing the Axiom Atlas visual identity.

The existing near-black / white / cyan / gold palette is appropriate: it feels like an engineering console, gives architecture its own identity within Atlas, and lets red failure states land strongly. I would keep it. The problem is not the palette; it is that almost every element is a bordered dark rectangle with tiny technical text.

Two concrete directions:

Preferred — Architecture Workbench. Keep the current colours, serif headings and mono metadata, but make the topology the visual centre. Desktop layout becomes roughly 280px evidence drawer | flexible topology canvas | 280px decision panel. After briefing, the mission prose collapses. Cyan means observed evidence/system state, gold means player decision/active experiment, green means verified outcome, red means failure. A request “packet” can visibly move between Browser → Tomcat → MySQL/images, with reduced-motion fallback.

Alternative — Dark Blueprint / Case File. Keep the same background and typography but treat evidence as an investigative dossier around a blueprint schematic: evidence tabs on one side, hypothesis cards on the other, architecture diagram in the middle. This gives more investigative character, but I would reserve the stronger “case file” aesthetic for later incident missions such as disk/network/CPU; M01 benefits more from the workbench.

Implementation-ready M01 structure
┌──────────────────────────────────────────────────────────────┐
│ AXIOM ATLAS   M01 OPEN THE SHOP      1 Evidence · 2 Build…  │
├──────────────┬──────────────────────────────┬────────────────┤
│ EVIDENCE     │        SYSTEM CANVAS         │ DECISION       │
│              │                              │                │
│ E01 Business │     Browser                  │ Candidate A    │
│ E02 Host     │        ↓                     │ Candidate B    │
│ E03 Journey  │     [empty / assembled]      │ Candidate C    │
│ E04 State    │                              │ Candidate D    │
│              │                              │                │
├──────────────┴──────────────────────────────┴────────────────┤
│ Current task / feedback                         [COMMIT →]   │
└──────────────────────────────────────────────────────────────┘

Suggested copy reduction:

Current mission paragraph → “Launch a small shop with the least architecture the evidence justifies.”

Objective → “Serve a product request and an order. Avoid unjustified infrastructure.”

Facts → three compact chips: “hundreds of products” · “<100 concurrent” · “1 Linux host”

Investigation copy → “Inspect the case file, then commit a topology.”

Failure prompt → “HOST 01 is about to disappear. What survives?”

Explanation prompt → “Build two claims: why this fit now, and why it fails together.”

Interaction sequence:

Brief
→ reveal evidence
→ commit candidate topology
→ test request
→ predict failure
→ pull host
→ reconcile failure prediction
→ build causal explanation
→ reveal “Single-Node Monolith”

For the request itself, show only a compact 9-dot progress rail; reveal labels as they happen. At key events, ask the player to route the packet to a target. Use a short 250–400 ms packet movement or edge glow; reduced-motion mode switches instantly between highlighted nodes.

This preserves every important causal fact in the existing engine—small workload, complete product/order path, local MySQL/images/session, one shared failure domain—while converting passive reading into hypothesis/test/reveal.

ACCESSIBILITY AND 150% GATE

The revised M01 should not be considered visually ready until all of these checks pass:

Gate	Exact acceptance check
100% readability	On a normal desktop at 100% browser zoom, core body/interaction text is ≥14 CSS px; metadata/provenance ≥12 CSS px; no player-essential text uses the current .4rem–.58rem range.
150% target	At the packet's 150% zoom / 1270×577 CSS viewport, no horizontal page scroll, no clipped text, no overlapping cards, and the current primary action remains visible or in a sticky action bar.
Line length	Narrative/body copy ≤65–70 characters per line; evidence interpretation ideally ≤45–55 characters per line.
390×844	Full mission completable without horizontal scrolling. Do not force the persistent briefing panel above every active phase. Topology must reflow; do not retain .38rem service text on mobile.
Touch	Every primary/selectable control at least ~44×44 CSS px. Current 42px primary-button minimum should be raised.
Keyboard	Full mission playable with keyboard only; approach choices exposed as a semantic radio group or equivalent; no drag-only causal builder; obvious visible focus.
Focus order	Evidence → candidate decision → run → prediction/reveal → explanation → completion, matching visual order.
Screen reader	Do not make the entire main workspace one broad aria-live region. Announce phase changes/current request step/reveal through small dedicated status regions. Topology needs a concise text equivalent.
State semantics	Selected approach/evidence/causal choices use aria-pressed, radio semantics, or checked state—not border colour alone.
Contrast	All body/small text meets WCAG AA; especially re-test muted greys such as #6f8b8f, #69868a, #789396 against the dark panels.
Reduced motion	Request packet/failure animation has an instantaneous equivalent under prefers-reduced-motion: reduce; no causal information depends on movement.
200% sanity check	Although 150% is the immediate comfort target, also verify WCAG-style zoom/reflow at 200% without loss of content or function.

The current CSS does provide a mobile breakpoint, native-button-heavy interaction and a small reduced-motion rule, but those are implementation foundations, not proof of complete mobile/touch/keyboard/screen-reader verification.

REVIEW DECISION

Refine the M01 core presentation loop before treating it as the UX template for the rest of Architecture Evolution Lab. I would not rewrite the M01 technical engine—the source-backed causal content and delayed architecture reveal are solid, and the earlier committed-source review already established the logic as a valid implementation baseline. But the current presentation over-guides the architecture choice, exposes the future request trace, makes failure observation passive, and turns the final causal explanation into a checklist. Those are foundational game-feel issues, not mere polish. Fix M01's evidence discovery → neutral decision → test → prediction → reveal → causal construction interaction pattern first; then use that refined pattern as the presentation standard for later missions.
