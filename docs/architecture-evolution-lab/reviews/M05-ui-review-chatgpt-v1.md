# M05 UI/gameplay review — ChatGPT v1

Date: 2026-09-17  
Branch: `feature/architecture-evolution-lab`  
Route: `/computer-science/architecture-lab/m05`

## Review scope

This was the M05 baseline presentation review before the bounded visual
implementation. The selected ChatGPT conversation reviewed the local mission
contract, the fresh-state route and the existing deterministic engine.

## Accepted direction

ChatGPT rejected a card-led worksheet as the main playable object and accepted
a persistent **Request Flight + Slot Pressure Board**:

```text
remote dependency call
  → waiting request
  → occupied caller work
  → policy determines when control returns
```

The board should keep Web host, DB host, two affected requests and four fixed
request slots visible through diagnosis, prediction and both policy runs.
Evidence should change the same board:

- E01 resolves the call path into JDBC/internal network;
- E02 changes affected requests to `WAITING`;
- E04 reveals `2 / 4` occupied slots;
- E05 shows a local comparator completing without the DB path.

The proposed bounded visual changes preserve the M05 engine and prediction IDs:
the unbounded run ends with waiting work still occupying slots, while the
bounded run returns control with an error without recovering the DB.

## Baseline findings

The fresh route leaked the E01 answer in two places:

- the opening diagram labelled the edge `INTERNAL TCP / DB call`;
- the copy stated that the DB was no longer a local call.

The bounded fix was therefore limited to a neutral fresh board, persistent
request/slot objects and a two-condition prediction matrix. No M05 engine
redesign was requested.

## Evidence boundary

The CUA browser session produced a live fresh-state capture, but this browser
backend returned transient image bytes without a repository file path. No PNG
is claimed as committed evidence here.

