# M02 — Follow One Request Playtest QA

Date: 2026-09-16  
Route: `/computer-science/architecture-lab/m02`  
Branch: `feature/architecture-evolution-lab`

## Result

**Desktop gameplay: PASS**  
**Keyboard activation smoke: PASS**  
**M02 bounded-fix regression: PASS**
**M02 verification: CONDITIONAL — mobile, reduced-motion and screen-reader evidence remain open.**

## Fresh-player observations

- Opening state clearly presents the customer report: “The product page
  eventually loads, but today it feels slow.”
- The total is labelled `650 ms · LAB TIMING · CAUSE UNKNOWN`; no culprit is
  selected initially.
- Provenance legend distinguishes source-backed stages, fictional incident
  content and teaching-simulation timings.
- Evidence cards are real player actions. The route gate remained closed until
  the deterministic evidence predicate was satisfied.

## Gameplay path exercised

1. Inspected E01, E02 and E04.
2. Opened the route builder and submitted an intentionally wrong route.
3. Confirmed local recovery feedback appeared without revealing the complete
   answer; repaired the route and ran the five-stage baseline.
4. Advanced DNS, HTTP, Tomcat, JDBC/MySQL and response measurements manually.
5. Committed a wrong Tomcat diagnosis; the game continued without game-over.
6. Submitted a wrong DNS-control prediction; result remained locked and
   recoverable feedback appeared.
7. Ran the DNS-only control and the Tomcat-processing-only control.
8. Confirmed the reveal showed the same 650 ms total can have different
   dominant segments.
9. Selected DNS plus two evidence items, assembled all six causal claims and
   completed the mission at 83/100 after the deliberate mistakes.
10. Replayed the mission and completed a clean two-control path at 100/100.
11. Replayed again and confirmed evidence reset to `0/5 INSPECTED`.

## Post-review bounded-fix regression

After ChatGPT's independent implementation review identified M02-F01 through
M02-F03, the following paths were rerun:

- E01 + E02 + E03 opened the route but could not commit a diagnosis until E04
  was inspected; the in-context diagnosis evidence gate appeared.
- HTTP-before-DNS produced local feedback explaining that the browser cannot
  send HTTP until the domain resolves.
- A wrong final Tomcat diagnosis with baseline/control evidence stayed on the
  final screen and showed recoverable feedback; it could not enter the causal
  explanation.
- A corrected DNS final diagnosis completed successfully.
- A clean two-control path completed at `100/100` after the bounded fixes.

## Keyboard smoke

The clean success path was repeated using `Enter` activation on the native
buttons for evidence, route construction, baseline trace, diagnosis,
prediction, experiments, final evidence and explanation. It completed at
`100/100`.

## Visual inspection

Desktop CUA inspection confirmed:

- strong first-screen hierarchy around the slow request;
- clear separation between observation, evidence, timing table, experiment
  reveal and score;
- readable five-stage baseline and before/after timing comparison;
- completion screen exposes the diagnosis and six score dimensions;
- wrong actions produce in-context feedback rather than a dead end.

## Open evidence

- A real 390 CSS-pixel viewport run with captures for each major state is still
  required.
- A real `prefers-reduced-motion: reduce` completion run is still required.
- Screen-reader announcement testing is not yet recorded.

The implementation must remain 🟦 IMPLEMENTED / NEEDS QA until those evidence
items are captured and the acceptance criteria are checked.
