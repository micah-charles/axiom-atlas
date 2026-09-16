# Source Review — Missions 1–6

Date: 2026-09-16
Reviewer: Codex
Decision: SOURCE REVIEW PASS, with simulation boundaries recorded below

## Primary source

Repository: `https://github.com/ccc115a/se`

Directory: `_more/mybook/向淘寶學習網站架構演進/`

Exact source files reviewed:

| File | GitHub blob SHA | Mission coverage |
|---|---|---|
| `1.1.md` | `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd` | M01–M03 |
| `1.2.md` | `00756d5a3a4054cd9592e19199c10626cdce993a` | M04–M06 |

## Findings for M01–M03 (`1.1.md`)

The source explicitly supports:

- an early shop with a few hundred products and fewer than 100 concurrent
  users;
- the rational starting point of one Linux host containing the Web
  application and MySQL database;
- the request path DNS → HTTP → Tomcat → JDBC → local MySQL → response;
- local assumptions of `localhost` database access, local image storage, and
  in-memory Tomcat Session;
- the trade-off of very fast/cheap deployment against no redundancy,
  limited scale, and shared resource contention.

Therefore the M01–M03 briefs are traceable to the source.

## Findings for M04–M06 (`1.2.md`)

The source explicitly supports:

- growth from hundreds to tens of thousands of products;
- MySQL data filling the shared disk so Tomcat cannot write logs and sellers
  cannot upload images;
- moving Tomcat and MySQL to separate machines over an internal TCP link;
- compute/storage isolation, independent tuning, and a new network dependency;
- remote connection settings including credentials, firewall scope, pool size,
  and timeout;
- the example values `maxPoolSize=50` and MySQL `max_connections=500`;
- the remaining local image-storage coupling as the next incident hook.

Therefore the M04–M06 briefs are traceable to the source.

## Adaptations that must stay labelled as simulation

- A two-second database outage is a deterministic game experiment, not a
  historical incident claimed by the source.
- `50` versus `500` is an educational parameter pair taken from the source
  example; it is not a universal production recommendation.
- Any latency, CPU, queue, cost, or availability values in the game are
  simulation values unless separately sourced.
- The fictional company is Atlas Market. The game must not imply that these
  exact incidents or metrics are a reconstruction of Taobao's production
  history.
- The game may expose security and firewall consequences that are implicit in
  the source, but must identify them as teaching interpretation rather than
  quote them as observed historical facts.

## Storyboard implications

The first ChatGPT storyboard request must require:

1. evidence before naming the correct architecture;
2. at least two plausible interventions;
3. a deterministic consequence for each intervention;
4. an explicit trade-off after Web/DB separation;
5. a `sourceFact` versus `gameSimulation` label for every numeric value;
6. no use of the words “Taobao did exactly this” for Atlas Market events.

## Gate result

The source-provenance gate for M01–M06 is complete. The next gate is not
implementation: it is requesting and reviewing the M01 storyboard artifact.
