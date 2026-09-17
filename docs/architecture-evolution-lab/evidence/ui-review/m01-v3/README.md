# M01 v3 visual evidence packet

This packet records the visual/gameplay pass after the ChatGPT UI review.

## Captures

The captures are stored one directory above this README so the existing flat
evidence naming remains compatible with earlier review packets:

- `../m01-v3-simulate-step-1.png` — topology board with Browser, DNS, HOST 01
  services, moving `GET` packet and request rail.
- `../m01-v3-predict-failure.png` — outcome-only failure prediction before the
  incident is revealed.
- `../m01-v3-host-failure.png` — HOST 01 offline, local services unavailable,
  Browser/DNS still online, and shared failure boundary visible.
- `../m01-v3-visual-direction.png` — generated visual direction reference,
  not functional interface artwork.

## QA path

The capture run was performed in Chrome against:

`http://localhost:3001/computer-science/architecture-lab`

The run passed the desktop M01 path from evidence inspection through causal
explanation submission and reached `100/100`. It is evidence for the v3 visual
and gameplay changes only; the wider mobile/accessibility verification gate
remains open in `PROGRESS.md`.

