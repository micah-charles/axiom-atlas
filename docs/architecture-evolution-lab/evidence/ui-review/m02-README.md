# M02 UI review evidence

Route: `http://localhost:3001/computer-science/architecture-lab/m02`  
Branch: `feature/architecture-evolution-lab`

These captures are local Chrome evidence after the bounded M02 request-trace
revision. The visual loop was exercised through the evidence gate, request
ordering, all five baseline measurements, diagnosis, prediction, and the first
DNS controlled comparison.

| Capture | State | What it verifies |
| --- | --- | --- |
| `m02-current-before.png` | baseline before the revision | text/card-heavy starting point committed at `79c4ff8` |
| `m02-after-observe.png` | fresh observe state | request board is visible; stage values remain hidden; total is marked cause-unknown |
| `m02-after-baseline.png` | measured baseline | five stage objects show 420/30/90/70/40 ms and the 650 ms total |
| `m02-after-dns-control.png` | first control reveal | DNS changes while HTTP, Tomcat, JDBC and Response remain unchanged |

Runtime notes:

- The M02 engine and scoring contract were not changed by this presentation
  revision.
- The initial board does not reveal the 420 ms DNS value before the baseline
  trace.
- This is desktop evidence only; 390px, keyboard-only, touch, reduced-motion
  and screen-reader gates remain open.
- The selected ChatGPT surface could not accept the committed PNG as a direct
  image input, so the corrected text review is the design authority for this
  checkpoint. See `../../reviews/M02-ui-review-chatgpt-v1.md`.
