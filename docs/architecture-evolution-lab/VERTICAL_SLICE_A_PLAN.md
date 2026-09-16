# Vertical Slice A — Missions 1–6

This is the first playable architecture-lab slice. It is intentionally small:
one shop grows from a rational single-node design into a system with separated
storage and a remote database dependency. The slice is successful only if the
player feels that each architectural change was forced by evidence.

All entries below are provisional planning briefs derived from the Bible. The
exact source sections and numeric simulation parameters remain pending source
verification and storyboard review.

## Shared player arc

```text
small shop
  → trace one request
  → identify hidden local assumptions
  → disk-full incident
  → separate Web and DB
  → discover network failure/timeout
  → tune connection pool against DB capacity
```

## Mission briefs

| Mission | Problem / trigger | Evidence player investigates | Decision / experiment | Expected consequence | Milestone evidence |
|---|---|---|---|---|---|
| M01 Open the Shop | Atlas Market must launch quickly with a few hundred products and fewer than 100 concurrent users. | User volume, product count, budget, request path, failure blast radius. | Assemble the smallest useful topology; compare a single-node monolith with premature scale-out. | Simple design is fast and cheap now; one host is also one failure domain. | Player ships a working shop and can explain why simplicity is rational under current constraints. |
| M02 Follow One Request | A customer says the site feels slow, but the cause is unknown. | DNS timing, HTTP connection, Tomcat processing, JDBC query, response timing. | Order the request journey and inject DNS versus server delay. | Same symptom can come from different layers; diagnosis must precede architecture change. | Player identifies the slow segment and does not equate DNS latency with application latency. |
| M03 Find the Three Local Assumptions | The single host hides coupling that will block scale-out later. | `localhost` DB address, local image files, in-memory Tomcat session. | Inspect code/config and mark each local assumption. | Local calls are convenient now; each becomes a migration boundary later. | Player finds all three assumptions without being given their labels first. |
| M04 Disk Full at 02:00 | Product/data growth fills the disk; logging and uploads fail. | Disk usage, DB growth, log write failures, image storage, service symptoms. | Identify the shared-resource root cause; choose Web/DB separation rather than random server upgrades. | Isolation reduces contention but introduces network dependency and operational cost. | Player can connect the incident to storage/resource contention and sees the new dependency. |
| M05 The Network Is Now Part of the System | After separation, DB calls cross a network and can stall or fail. | Network latency, timeout, retries, blocked requests, connection-pool occupancy. | Set timeout and pool behaviour; simulate a 2-second DB outage. | Infinite waits accumulate blocked work; controlled timeouts fail fast but can surface errors. | Player observes a failure mode that did not exist on one host and selects bounded behaviour. |
| M06 Fifty Connections or Five Hundred? | Web concurrency and DB capacity are now mismatched. | App pool size, DB `max_connections`, queueing, DB CPU, request latency. | Tune the app pool against DB capacity; compare too-small and too-large pools. | More connections do not equal more throughput; oversubscription moves the bottleneck to DB. | Player chooses a proportional configuration and explains why the largest pool is not best. |

## Slice-level acceptance gate

- [ ] Every mission has an exact source trace.
- [ ] Every mission begins with an observable problem or constraint.
- [ ] Every mission offers at least two plausible actions or hypotheses.
- [ ] The simulation is deterministic and directionally correct.
- [ ] A successful intervention exposes the next problem.
- [ ] Wrong choices create understandable consequences and recovery is possible.
- [ ] The player can complete the slice without reading a textbook paragraph.
- [ ] A fresh player knows what to do within 10 seconds of each mission.
- [ ] Desktop and mobile interactions preserve topology → evidence → change →
  compare.
- [ ] The slice has a clear end assessment: explain why the architecture
  evolved and identify the current bottleneck/trade-off.
