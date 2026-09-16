# Axiom Atlas --- Architecture Evolution Lab

## Game Design Bible v1.0

**Status:** Pre-implementation design bible\
**Target route:** `/computer-science/architecture-lab`\
**Parent project:** Axiom Atlas\
**Design principle:** *Do not study architectures as a list of
technologies. Evolve a working system because concrete problems force
each architectural change.*

------------------------------------------------------------------------

# 1. Purpose

Architecture Evolution Lab is an interactive, problem-driven
systems-architecture learning game. The player begins with the smallest
useful online shop and progressively evolves it as traffic, data volume,
organisational complexity, reliability requirements, deployment
complexity, cost pressure, and finally AI workloads increase.

The technical curriculum is derived primarily from the open GitHub book
**「演進式架構實戰：從單體、微服務到 Docker、Kubernetes 與 AI
雲原生轉型」** in `ccc115a/se`. The source itself explicitly presents
Taobao as a **teaching model rather than a literal reconstruction of
Taobao's historical architecture**. The game must preserve that
distinction.

The Bible therefore uses the source as a **technical source of truth for
the causal chain**:

> bottleneck → evidence → diagnosis → intervention → trade-off → new
> bottleneck

We may dramatise the company, characters, alerts, dashboards and player
interactions, but must not invent technical causality that contradicts
the source.

------------------------------------------------------------------------

# 2. Fictional World

The game uses a fictional commerce platform called **Atlas Market**.
This avoids pretending to recreate the actual history of Taobao while
preserving the source curriculum's e-commerce pressures.

The player joins Atlas Market as its first systems engineer. At the
beginning:

-   a few hundred products exist;
-   fewer than 100 users may be online concurrently;
-   the priority is shipping quickly, not building a hyperscale
    platform;
-   one server is a rational engineering choice.

Across the game, Atlas Market grows into a large multi-service,
multi-region, cloud-native and AI-enabled platform.

Recurring characters:

-   **Maya --- Product Lead:** represents business urgency and customer
    impact.
-   **Leo --- Operations:** brings incidents, logs, alerts and
    production symptoms.
-   **Rin --- Database Engineer:** explains storage constraints but
    never gives the answer before investigation.
-   **Sam --- Developer:** exposes deployment and dependency pain.
-   **Nova --- SRE:** appears later and introduces reliability, SLO and
    observability thinking.
-   **Ari --- AI Platform Engineer:** appears in the AI-native act.

Characters provide evidence, not lectures. The player remains the
architect.

------------------------------------------------------------------------

# 3. Core Gameplay Loop

Every mission follows the same cognitive loop.

1.  **Situation** --- show the currently working system.
2.  **Trigger** --- traffic, data, deployment or business change occurs.
3.  **Incident** --- a measurable failure or limitation appears.
4.  **Observe** --- player inspects metrics, topology, traces, logs,
    queues or data.
5.  **Hypothesise** --- player identifies the bottleneck.
6.  **Experiment** --- player changes a parameter or architecture.
7.  **Simulate** --- traffic is replayed.
8.  **Compare** --- before/after latency, throughput, error rate, cost
    and complexity.
9.  **Explain** --- player states or selects the causal explanation.
10. **Consequence** --- the improvement exposes the next architectural
    problem.

A mission is not passed merely by clicking the named technology. The
learner should be able to explain **why the intervention works, what it
does not solve, and what it costs**.

------------------------------------------------------------------------

# 4. Mission Specification Contract

Every implemented mission must contain:

1.  Mission ID and title
2.  Source chapter/section
3.  Source-derived incident or problem
4.  Existing architecture
5.  Business situation
6.  Trigger event
7.  Observable symptoms
8.  Metrics available
9.  Evidence the learner may inspect
10. Root cause
11. Player actions
12. Plausible alternative/wrong actions
13. Consequence of each action
14. Architecture modification
15. Before/after simulation
16. Technical learning objective
17. Misconceptions to challenge
18. Trade-off introduced
19. Next-incident hook
20. `do_not_teach_yet` boundary

------------------------------------------------------------------------

# 5. Global Simulation Model

The simulator should maintain a simplified but causally coherent system
state.

``` ts
type SystemState = {
  traffic: {
    concurrentUsers: number;
    requestsPerSecond: number;
    readWriteRatio: number;
    burstMultiplier: number;
  };
  experience: {
    p50Ms: number;
    p95Ms: number;
    p99Ms: number;
    errorRate: number;
    availability: number;
  };
  compute: {
    webReplicas: number;
    cpuPct: number;
    memoryPct: number;
    ioWaitPct: number;
    threadPoolUsed: number;
  };
  database: {
    readQps: number;
    writeQps: number;
    cpuPct: number;
    slowQueries: number;
    connections: number;
    replicationLagMs?: number;
    shards?: number;
  };
  cache?: {
    hitRate: number;
    missRate: number;
    hotKeys: number;
  };
  queue?: {
    ingressPerSec: number;
    consumePerSec: number;
    backlog: number;
  };
  platform: {
    services: number;
    containers: number;
    nodes: number;
    deploymentMinutes: number;
    mttrMinutes: number;
  };
  economics: {
    monthlyCost: number;
    utilisationPct: number;
  };
};
```

Numbers are educational approximations. They must behave directionally
correctly. The UI must label them as simulation values rather than
claims about a real company.

------------------------------------------------------------------------

# 6. World Structure

The source contains 17 chapters and a 14-evolution summary. The game
converts these into **8 Acts, 17 Chapters and 79 core missions**. The
number is deliberately finer than the source chapter count: a source
section may become multiple playable incidents when it contains multiple
distinct causal ideas.

## Act I --- One Machine, First Limits

Chapters 1--2, Missions 1--16

## Act II --- Scale Out and Data Growth

Chapters 3--4, Missions 17--31

## Act III --- Services and Distributed Failure

Chapters 5--6, Missions 32--45

## Act IV --- Containerisation

Chapters 7--8, Missions 46--53

## Act V --- Kubernetes and Elasticity

Chapters 9--11, Missions 54--65

## Act VI --- Rethinking Cloud Native

Chapters 12--13, Missions 66--71

## Act VII --- AI Workloads

Chapters 14--16, Missions 72--77

## Act VIII --- Architecture Judgment

Chapter 17, Missions 78--79

------------------------------------------------------------------------

# 7. Detailed Mission Bible

## ACT I --- ONE MACHINE, FIRST LIMITS

### Mission 1 --- Open the Shop

**Source:** 1.1\
**Story:** Maya needs Atlas Market online quickly. The player has one
Linux host and must place web application, database and product images.\
**Starting topology:** Browser → Tomcat → local MySQL; images on local
disk.\
**Player task:** Assemble the smallest architecture that can serve
products and accept an order.\
**Evidence:** \<100 concurrent users, only hundreds of products, tiny
budget.\
**Correct insight:** A single-node monolith is not automatically bad; it
is appropriate when simplicity and delivery speed dominate.\
**Simulation:** show a request travelling DNS → HTTP → Tomcat thread →
JDBC → MySQL → response.\
**Trap:** selecting load balancers, Kubernetes or sharding immediately
increases cost/complexity without solving a present problem.\
**Unlock:** Single-Node Monolith.\
**Next hook:** "What happens if this one machine dies?"

### Mission 2 --- Follow One Request

**Source:** 1.1\
**Story:** A customer reports "the site feels slow." Before changing the
server, Leo asks where a request actually travels.\
**Task:** order DNS resolution, HTTP connection, Tomcat processing, JDBC
query and response.\
**Learning:** DNS latency and application latency are different failure
domains.\
**Interaction:** animate packets; allow artificial DNS delay versus
server delay.\
**Next hook:** establish observability habit: diagnose before changing
architecture.

### Mission 3 --- Find the Three Local Assumptions

**Source:** 1.1\
**Task:** inspect the application and identify database=`localhost`,
files=local disk, session=Tomcat memory.\
**Learning:** local assumptions are invisible while one machine exists,
but become coupling points during scale-out.\
**Next hook:** disk pressure exposes the first coupling.

### Mission 4 --- Disk Full at 02:00

**Source:** 1.2\
**Incident:** product count grows from hundreds to tens of thousands.
MySQL data fills the disk; Tomcat cannot write logs and sellers cannot
upload images.\
**Dashboard:** disk 100%; DB data growth; web log write failures.\
**Task:** determine whether the web code, database or shared resource is
the root issue.\
**Action:** separate Web and DB onto two hosts.\
**Learning:** compute-storage separation and resource isolation.\
**Trade-off:** network dependency appears.\
**Next hook:** JDBC is no longer a local call.

### Mission 5 --- The Network Is Now Part of the System

**Source:** 1.2\
**Task:** change `localhost` DB access to an internal network
dependency; choose timeout and connection-pool settings.\
**Experiment:** disconnect DB for 2 seconds and observe timeout
behaviour.\
**Learning:** remote calls can fail, time out and require controlled
retries.\
**Trap:** infinite timeout makes threads accumulate.\
**Next hook:** connection pool sizing.

### Mission 6 --- Fifty Connections or Five Hundred?

**Source:** 1.2\
**Task:** tune application connection pool against DB
`max_connections`.\
**Experiment:** slider from too-small to too-large.\
**Learning:** more connections do not equal more throughput;
oversubscription can move the bottleneck to DB.\
**Next hook:** the web host itself saturates.

### Mission 7 --- The 5-Second Tomcat

**Source:** 1.3\
**Incident:** campaign warm-up moves response time from \~50 ms to \~5
s; CPU reaches 100%; Full GC freezes the site.\
**Task:** inspect CPU, memory and I/O rather than guessing.\
**Learning:** identical symptom ("slow") can have different causes.

### Mission 8 --- CPU Bottleneck

**Source:** 1.3\
**Evidence:** high load, Java consuming CPU, hot stack in
rendering/serialisation.\
**Player actions:** simplify computation, adjust workload, upgrade CPU.\
**Learning:** CPU-bound systems queue when compute is saturated.\
**Trap:** adding memory does not fix CPU saturation.

### Mission 9 --- Memory and Full GC

**Source:** 1.3\
**Incident:** browsing history has been stored in Session; each session
becomes very large.\
**Evidence:** frequent Full GC, heap growth, eventual OOM.\
**Action:** reduce session payload / add sensible lifecycle.\
**Learning:** memory misuse cannot be solved merely by "more threads."\
**Next hook:** Session will return later as a scale-out problem.

### Mission 10 --- CPU Is Idle, Yet the Site Is Slow

**Source:** 1.3\
**Evidence:** low CPU, high I/O wait, threads blocked on socket reads.\
**Task:** identify I/O bottleneck.\
**Learning:** blocked threads and dependency latency can exhaust a
server while CPU appears healthy.

### Mission 11 --- Thread Pool Trade-off

**Source:** 1.3\
**Experiment:** change `maxThreads` and `acceptCount`.\
**Too low:** insufficient concurrency during I/O waits.\
**Too high:** context switching and memory overhead.\
**Learning:** tuning is a trade-off established through load testing,
not a magic maximum.

### Mission 12 --- Bigger Machine or More Machines?

**Source:** 1.4\
**Story:** Maya offers two budgets: one huge server or ten commodity
servers.\
**Task:** compare scale-up and scale-out.\
**Simulation:** cost, failure blast radius, throughput and ceiling.\
**Learning:** performance ≠ scalability; vertical scaling is useful but
bounded.

### Mission 13 --- Amdahl's Wall

**Source:** 1.4\
**Experiment:** make 80% of work parallel and 20% serial/shared. Add web
servers repeatedly.\
**Observation:** throughput stops improving as the shared DB/state
dominates.\
**Learning:** non-parallel shared state limits scale-out.

### Mission 14 --- Database Becomes the Hotspot

**Source:** 2.1\
**Incident:** multiple web servers repeatedly execute the same
product-detail SELECT tens of thousands of times.\
**Evidence:** DB CPU 100%, slow-query accumulation, read-heavy ratio
near 100:1.\
**Task:** decide what should be accelerated.\
**Unlock:** Cache.

### Mission 15 --- Cache-Aside

**Source:** 2.1\
**Interaction:** request → cache lookup → miss → DB → cache fill.\
**Experiment:** change hit rate and watch DB QPS.\
**Learning:** hot read-heavy data can be served from memory; cache is an
accelerator, not the source of truth.\
**Trade-off:** stale data.

### Mission 16 --- The Four Cache Disasters

**Source:** 2.3--2.4\
**Four mini-incidents:**\
A. nonexistent IDs cause penetration;\
B. one hot key expires causing breakdown;\
C. many keys share the same TTL causing avalanche;\
D. an extremely hot key is slow to rebuild.\
**Tools:** Bloom filter, null caching, mutex/singleflight, TTL jitter,
fallback/circuit breaking, background refresh.\
**Signature incident:** hit rate collapses from \~95% to \~5% while DB
receives enormous QPS.\
**Learning:** "add Redis" is only the beginning; cache itself requires
governance.\
**Next hook:** now the application layer can grow, but local state
prevents true scale-out.

------------------------------------------------------------------------

## ACT II --- SCALE OUT AND DATA GROWTH

### Mission 17 --- Add the Second Web Server

**Source:** 3.1\
**Task:** put Nginx/HAProxy in front of multiple web instances.\
**Learning:** reverse proxy and load distribution.\
**Simulation:** kill one web node; compare with single-node
architecture.

### Mission 18 --- The Vanishing Shopping Cart

**Source:** 3.2\
**Incident:** request 1 reaches Tomcat-1, request 2 reaches Tomcat-2;
local Session disappears.\
**Task:** trace user requests and identify state affinity.\
**Learning:** horizontal scaling requires replaceable/stateless
application instances.

### Mission 19 --- Sticky Sessions: The Fast Fix

**Source:** 3.2\
**Action:** use sticky routing.\
**Immediate result:** cart works.\
**New failures:** one node dies and users lose state; hot users produce
imbalance; new nodes remain underused.\
**Learning:** a plausible quick fix can block elasticity.

### Mission 20 --- Move Session Out

**Source:** 3.2\
**Action:** centralise Session in Redis.\
**Experiment:** kill a Tomcat node and verify the user remains logged
in.\
**Trade-off:** Redis becomes critical infrastructure and needs HA.

### Mission 21 --- JWT: Stateless Does Not Mean No State

**Source:** 3.2\
**Task:** compare central session and signed client token.\
**Incident:** forced logout becomes difficult.\
**Learning:** JWT reduces server-side session storage but creates
revocation/key-management trade-offs.

### Mission 22 --- L4 vs L7 Traffic

**Source:** 3.3\
**Task:** route traffic at transport versus HTTP/application level.\
**Learning:** different load-balancing layers solve different routing
needs.

### Mission 23 --- The Front Door Is a Single Point

**Source:** 3.3--3.4\
**Incident:** load balancer/entry path fails.\
**Task:** introduce redundancy/health checking.\
**Learning:** every new central component must itself be made resilient.

### Mission 24 --- Users Are Far Away

**Source:** 3.4\
**Symptoms:** static assets slow for distant users.\
**Action:** CDN and DNS-based routing.\
**Learning:** geography becomes an architectural variable.

### Mission 25 --- Reads and Writes Fight

**Source:** 4.1\
**Incident:** reads consume DB resources while order writes need
predictable latency.\
**Action:** primary/replica read-write separation.\
**Trade-off:** replication lag.

### Mission 26 --- "I Paid, Why Can't I See It?"

**Source:** 4.1\
**Incident:** customer writes to primary then reads stale replica.\
**Task:** reason about consistency-sensitive reads.\
**Learning:** replication increases read capacity but introduces
consistency windows.

### Mission 27 --- One Database, Too Many Businesses

**Source:** 4.2\
**Task:** split user/order/product domains vertically.\
**Learning:** reduce resource contention and align data with business
boundaries.\
**Trade-off:** cross-database operations.

### Mission 28 --- The Giant Orders Table

**Source:** 4.3\
**Incident:** table size makes queries/index maintenance slow.\
**Experiment:** hash versus time-based partitioning.\
**Learning:** horizontal sharding distributes data and load but requires
routing strategy.

### Mission 29 --- Hot Shard

**Source:** 4.3\
**Incident:** poor shard key creates uneven load.\
**Task:** inspect per-shard QPS and redesign partition key.\
**Learning:** sharding quality depends on distribution, access pattern
and future growth.

### Mission 30 --- Half an Order

**Source:** 4.4\
**Incident:** order DB commits; stock DB times out.\
**Task:** compare 2PC, TCC, Saga and
reliable-message/eventual-consistency approaches.\
**Learning:** distributed transactions trade
simplicity/performance/availability against consistency guarantees.

### Mission 31 --- Where Did My JOIN Go?

**Source:** 4.4\
**Incident:** report previously used one JOIN; data now spans
databases/shards.\
**Options:** application composition, redundant snapshot fields, ES/wide
tables, offline warehouse/MPP.\
**Learning:** splitting data improves scale but transfers complexity
into transactions, queries and operations.\
**Next hook:** data boundaries begin to suggest service boundaries.

------------------------------------------------------------------------

## ACT III --- SERVICES AND DISTRIBUTED FAILURE

### Mission 32 --- The Monolith Team Collision

**Source:** 5.1\
**Symptoms:** releases couple unrelated functions; teams collide; blast
radius is large.\
**Task:** identify bounded business contexts rather than splitting by
table/function.\
**Unlock:** service decomposition.

### Mission 33 --- Extract Product Service

**Source:** 5.1\
**Task:** separate a coherent business capability.\
**Learning:** service boundaries should follow domain cohesion.

### Mission 34 --- Shared Capability Becomes RPC

**Source:** 5.2\
**Task:** move a shared module behind a service contract.\
**Learning:** local calls become network calls and therefore gain
latency/failure modes.

### Mission 35 --- "Where Is Inventory Service?"

**Source:** 5.3\
**Problem:** dynamic service instances cannot be hard-coded.\
**Action:** service registry/discovery and configuration centre.\
**Learning:** distributed systems need dynamic naming and configuration.

### Mission 36 --- Slow Logistics, Dead Store

**Source:** 5.4\
**Incident:** logistics latency rises from \~50 ms to \~5 s; transaction
threads wait; unrelated pages become unavailable.\
**Learning:** synchronous dependency chains can cause cascading failure.

### Mission 37 --- Rate Limit the Flood

**Source:** 5.4\
**Experiment:** leaky bucket versus token bucket.\
**Learning:** protect finite capacity; burst tolerance differs by
algorithm.

### Mission 38 --- Circuit Break the Bad Dependency

**Source:** 5.4\
**Interaction:** Closed → Open → Half-Open → Closed/Open.\
**Learning:** fast failure can preserve system capacity when a
dependency is unhealthy.

### Mission 39 --- Degrade to Save Checkout

**Source:** 5.4\
**Task:** classify checkout/payment as core, recommendation/reviews as
degradable, history charts as removable.\
**Learning:** resilience sometimes means intentionally providing less
functionality.

### Mission 40 --- One Database Cannot Serve Every Workload

**Source:** 6.1\
**Scenario:** transactions need strong consistency; logs are tens of
TB/day; user profiles need massive KV access; product search needs
full-text ranking.\
**Task:** match workload to MySQL/OceanBase, HDFS, HBase and
Elasticsearch.\
**Learning:** heterogeneous storage.

### Mission 41 --- Build Product Search with Elasticsearch

**Source:** 6.1\
**Task:** compare SQL wildcard search with an inverted-index search
workload.\
**Architecture:** product source-of-truth DB → synchronisation →
Elasticsearch.\
**Learning:** search is a specialised access pattern, not simply "a
bigger DB."

### Mission 42 --- Search Shows Yesterday's Title

**Source:** 6.1\
**Incident:** DB has new title; ES still has old title.\
**Learning:** heterogeneous stores commonly accept eventual consistency;
transactional DB remains source of truth.\
**Action:** inspect sync pipeline and fallback behaviour.

### Mission 43 --- Midnight ×100

**Source:** 6.2\
**Incident:** order traffic becomes \~100× normal; synchronous order →
stock → coupon → log path times out.\
**Action:** separate immediate work from deferrable work with MQ.\
**Learning:** asynchronous decoupling and peak shaving.

### Mission 44 --- Duplicate Message

**Source:** 6.2\
**Incident:** consumer restarts and receives a message again; coupon
would be issued twice.\
**Action:** idempotent consumer keyed by order ID.\
**Learning:** reliable messaging implies duplicate-handling design.

### Mission 45 --- Order, Stock and Transactional Messages

**Source:** 6.2 / 4.4\
**Task:** reason about order DB commit and message publication.\
**Learning:** transactional/reliable messaging helps coordinate local
transaction with eventual downstream work.\
**Next hook:** dozens of services now work logically---but operations
becomes unbearable.

------------------------------------------------------------------------

## ACT IV --- CONTAINERISATION

### Mission 46 --- "Works on My Machine"

**Source:** 6.4\
**Incident:** dev JDK/OS differs from test, pre-prod and production.
Same code behaves differently.\
**Evidence:** environment matrix and dependency versions.\
**Learning:** environment drift.

### Mission 47 --- Release Server 17

**Source:** 6.4\
**Story:** dozens of services are deployed by SSH/SCP. Servers 1--16
succeed; server 17 fails.\
**Player decision:** continue, rollback, repair manually.\
**Learning:** non-atomic manual deployment creates uncertain state and
rollback risk.

### Mission 48 --- Package the Environment

**Source:** 7.1--7.3\
**Concept:** container versus VM; image, container, repository.\
**Task:** create an immutable application package with
runtime/dependencies.\
**Learning:** build once, run consistently.

### Mission 49 --- Image Is Not Container

**Source:** 7.2\
**Interaction:** instantiate multiple containers from one image,
stop/delete/recreate them.\
**Learning:** immutable template versus runtime instance.

### Mission 50 --- Write the Dockerfile

**Source:** 7.3\
**Task:** choose base image, copy artifact, install dependencies,
expose/run.\
**Experiment:** rebuild after dependency change.\
**Learning:** deployment environment becomes code.

### Mission 51 --- Four Services, One Command

**Source:** 7.4\
**Topology:** app + Redis + MySQL + Nginx.\
**Action:** model dependencies and start with Compose.\
**Learning:** repeatable multi-container local deployment.

### Mission 52 --- Network and Persistent Data

**Source:** 8.1--8.2\
**Mini-incidents:** container IP changes; DB container is recreated and
data disappears.\
**Action:** service networking + volumes/bind mounts.\
**Learning:** container lifecycle is ephemeral; state needs explicit
persistence.

### Mission 53 --- From 4 Containers to 4,000

**Source:** 8.3\
**Incident:** campaign requires \~200 app replicas across \~20 hosts; a
host dies; env var typo appears; container IPs move.\
**Three unsolved problems:** scheduling, cross-host self-healing,
service discovery/traffic.\
**Learning:** Compose solves one-machine orchestration, not cluster
orchestration.\
**Next hook:** "Declare the desired state and let a control loop
maintain it."

------------------------------------------------------------------------

## ACT V --- KUBERNETES AND ELASTICITY

### Mission 54 --- Declare 200 Replicas

**Source:** 9.1--9.3\
**Task:** replace manual `docker run` thinking with desired state.\
**Learning:** orchestration/control-loop model.

### Mission 55 --- Control Plane and Workers

**Source:** 9.2\
**Task:** place scheduler/control functions versus workloads.\
**Learning:** cluster architecture.

### Mission 56 --- Pod, ReplicaSet, Deployment

**Source:** 9.3\
**Interaction:** kill a Pod; observe reconciliation.\
**Learning:** workload hierarchy and desired replicas.

### Mission 57 --- Release Without Midnight Downtime

**Source:** 9.4\
**Task:** rolling update from v1 to v2 while maintaining capacity.\
**Incident:** v2 has errors.\
**Action:** rollback.\
**Learning:** deployment strategy is a reliability mechanism.

### Mission 58 --- Stable Name for Moving Pods

**Source:** 10.1\
**Problem:** Pod IPs are ephemeral.\
**Action:** Service abstraction.\
**Learning:** stable discovery/load balancing over replaceable
instances.

### Mission 59 --- The External Front Door

**Source:** 10.2\
**Task:** expose multiple services through Ingress/gateway routing.\
**Learning:** cluster-internal service and external routing are separate
concerns.

### Mission 60 --- Service-to-Service Governance

**Source:** 10.3\
**Problem:** many east-west calls need policy, identity and encryption.\
**Concept:** service mesh / mTLS.\
**Boundary:** teach why, not every Istio object.

### Mission 61 --- Configuration and Storage

**Source:** 10.4\
**Task:** distinguish ConfigMap, Secret, PV/PVC/StorageClass.\
**Incident:** hard-coded config prevents safe deployment.\
**Learning:** workload code, configuration, secrets and persistent
storage have distinct lifecycles.

### Mission 62 --- "Alive" Is Not "Ready"

**Source:** 11.1\
**Incident:** process exists but cannot serve traffic.\
**Experiment:** liveness versus readiness probes.\
**Learning:** restart health and traffic-readiness are different.

### Mission 63 --- The Campaign Autoscaler

**Source:** 11.2\
**Scenario:** traffic grows \~10×.\
**Action:** HPA on CPU; fast scale-up, slow scale-down.\
**Experiment:** thresholds 30% vs 60%; observe
latency/cost/oscillation.\
**Learning:** autoscaling is control theory plus economics, not
"infinite capacity."

### Mission 64 --- CPU Looks Fine, Queue Is Exploding

**Source:** 11.2 + 6.2\
**Incident:** CPU has not crossed threshold while MQ backlog reaches
100,000.\
**Action:** event-driven scaling using KEDA-like signal.\
**Learning:** choose a scaling signal that represents demand; queue lag
may lead CPU.

### Mission 65 --- Pods Need Nodes, Nodes Need Limits

**Source:** 11.2--11.4\
**Task:** combine HPA, Cluster Autoscaler, requests/limits and
scheduling constraints.\
**Failure:** scale-out hits DB ceiling or causes OOM due to bad resource
settings.\
**Learning:** elasticity has downstream and cost ceilings.

------------------------------------------------------------------------

## ACT VI --- RETHINKING CLOUD NATIVE

### Mission 66 --- We Split Too Far

**Source:** 12.1\
**Incident:** product page fans out across 5--8 tiny services; P99
worsens; transactions and testing become complex.\
**Evidence:** fan-out count, network share of P99, number of
cross-service transaction participants.\
**Learning:** microservices are not automatically better;
over-decomposition creates technical debt.

### Mission 67 --- Merge or Keep Separate?

**Source:** 12.2\
**Task:** decide which highly cohesive services belong in a modular
monolith.\
**Rule of thumb:** components that always change/release together may
belong together.\
**Learning:** architecture can evolve backwards as well as forwards.

### Mission 68 --- Event Work Without Permanent Servers

**Source:** 12.3--12.4\
**Concept:** Serverless/FaaS/Knative for suitable event-driven or
low-frequency workloads.\
**Trade-off:** cold starts, state and execution constraints.\
**Learning:** workload shape should drive execution model.

### Mission 69 --- Git Is the Deployment Record

**Source:** 13.1\
**Task:** change desired configuration through Git and reconcile
deployment.\
**Learning:** GitOps provides auditable desired state and rollback.

### Mission 70 --- 99.99% → 99.5% at Midnight

**Source:** 13.2\
**Incident:** order success rate drops.\
**Investigation order:** Metric → Trace → Log.\
**Trace clue:** inventory span \~380 ms, DB portion \~350 ms.\
**Learning:** metrics say where, traces say which hop, logs say why.

### Mission 71 --- Reliability Has a Price

**Source:** 13.3--13.4\
**Task:** balance utilisation, redundancy, managed services and cost.\
**Learning:** FinOps is an architectural constraint; idle
overprovisioning and underprovisioning both have costs.

------------------------------------------------------------------------

## ACT VII --- AI WORKLOADS

### Mission 72 --- Add an AI Shopping Assistant

**Source:** 14.1\
**Story:** Atlas Market adds generative shopping assistance.\
**Problem:** requests are now probabilistic, token-consuming and may
invoke tools.\
**Learning:** AI workloads introduce new latency, cost, evaluation and
safety dimensions.

### Mission 73 --- GPU Is Not Ordinary CPU

**Source:** 14.2--14.5\
**Task:** allocate GPU resources and compare sharing/isolation
approaches conceptually.\
**Learning:** inference workloads introduce accelerator scheduling,
memory and network constraints.

### Mission 74 --- Deploy Inference as a Service

**Source:** 14.3--14.5\
**Topology:** gateway → inference service → GPU workers.\
**Learning:** model serving needs batching/routing/scaling/health just
like other production workloads, with GPU-specific constraints.

### Mission 75 --- Ten Thousand Agents Need a Runway

**Source:** 15.2\
**Incident:** a demo Agent works; production with long-running sessions
and many concurrent agents does not.\
**Unlock the eight concerns:** runtime, AI gateway, AI MQ, memory,
observability, evaluation, security, resources.\
**Learning:** Agent infrastructure is a production system, not only an
LLM call.

### Mission 76 --- Same User, Different Worker

**Source:** 15.2--15.4\
**Incident:** two turns land on different workers without shared
memory/session affinity.\
**Action:** session affinity/shared memory/runtime strategy; introduce
MCP/A2A as protocols only when the problem requires tool/agent
interoperability.\
**Learning:** state placement returns as an AI-era version of the
Session problem from Mission 18.

### Mission 77 --- Route Models, Limit Tokens, Queue Work

**Source:** 16.1--16.4\
**Task:** route requests across models, enforce token/cost limits, queue
long work, observe tool/token traces.\
**Learning:** AI gateway and Agent infra reuse classic gateway, queue,
observability and autoscaling ideas under new workload characteristics.

------------------------------------------------------------------------

## ACT VIII --- ARCHITECTURE JUDGMENT

### Mission 78 --- The Architecture Time Machine

**Source:** 17.2--17.4 + B.1\
**Task:** replay the entire Atlas Market topology from one server to
AI-native platform.\
**Interaction:** scrub a timeline and compare why each component
appeared.\
**Challenge:** remove any component and predict which old problem
returns.\
**Learning:** technology should exist because a constraint requires it.

### Mission 79 --- Build the Smallest Architecture That Works

**Source:** 17.3--17.4\
**Final challenge:** player receives one of several businesses with
different traffic, consistency, team size, budget and AI needs.\
**Rule:** points are lost for unnecessary complexity as well as unmet
requirements.\
**Assessment:** explain choices, failure modes, rollback, monitoring,
scale path and cost.\
**Final lesson:** avoid cloud-native or AI-native technology for its own
sake. Architecture is contextual trade-off management.

------------------------------------------------------------------------

# 8. Optional Challenge Missions

These are unlocked after the corresponding core mission and should not
block the main story.

-   Cache TTL tuning laboratory
-   Bloom-filter false-positive visualisation
-   Connection-pool saturation experiment
-   Amdahl's Law interactive graph
-   Replica-lag consistency challenge
-   Shard-key tournament
-   Saga compensation puzzle
-   Token-bucket vs leaky-bucket traffic visualiser
-   Circuit-breaker state-machine challenge
-   Elasticsearch inverted-index explorer
-   MQ consumer-rate/backlog simulator
-   Docker image-layer optimisation
-   Kubernetes scheduler packing puzzle
-   Readiness/liveness failure lab
-   HPA threshold experiment
-   KEDA queue-lag experiment
-   Trace detective challenge
-   FinOps capacity planning
-   Agent token-cost routing challenge
-   Final "minimum sufficient architecture" sandbox

------------------------------------------------------------------------

# 9. UI / UX Storyboard

## 9.1 World Map

The world map should show Acts rather than 79 equal tiles.

``` text
[ I  ONE MACHINE ]
        ↓
[ II SCALE OUT ]
        ↓
[ III DISTRIBUTED SYSTEM ]
        ↓
[ IV CONTAINERS ]
        ↓
[ V KUBERNETES ]
        ↓
[ VI CLOUD-NATIVE JUDGMENT ]
        ↓
[ VII AI-NATIVE ]
        ↓
[ VIII ARCHITECT CHALLENGE ]
```

Within an Act, missions appear as a causal path. Technology branches can
be revisited independently after unlocking.

## 9.2 Mission Screen

Desktop layout:

``` text
┌─────────────────────────────────────────────────────────────────┐
│ Mission / objective / incident status                           │
├──────────────────────┬──────────────────────┬───────────────────┤
│ SYSTEM TOPOLOGY      │ LIVE SIMULATION      │ EVIDENCE          │
│                      │                      │                   │
│ animated nodes       │ RPS / latency        │ Metrics           │
│ request flow         │ CPU / memory         │ Logs              │
│ dependencies         │ DB / cache / queue   │ Traces            │
│                      │ errors / cost        │ Config            │
├──────────────────────┴──────────────────────┴───────────────────┤
│ ACTION TRAY: architecture components / parameter controls       │
├─────────────────────────────────────────────────────────────────┤
│ Explain your diagnosis → Run experiment → Compare               │
└─────────────────────────────────────────────────────────────────┘
```

Mobile should collapse to tabs: **System \| Signals \| Evidence \|
Change**.

## 9.3 Visual Language

-   healthy node: normal neutral styling;
-   warning: amber semantics;
-   failing/saturated: red semantics;
-   traffic should visibly move along edges;
-   queues should visibly accumulate;
-   cache hits should stop before DB;
-   retries should be visible as repeated paths;
-   circuit breaker should visibly open;
-   replica lag should show time offset;
-   autoscaling should animate new replicas/nodes;
-   cost must update when resources are added.

Never rely on colour alone; use icon/text/state labels for
accessibility.

------------------------------------------------------------------------

# 10. Choice Design

Avoid simplistic multiple-choice "technology quizzes."

A player may choose a technically valid but suboptimal intervention. The
simulator should show the result.

Example:

**Problem:** DB overloaded by repeated product reads.

-   Upgrade DB → improves latency somewhat; cost rises; bottleneck
    remains.
-   Add web servers → may worsen DB pressure.
-   Add cache → large read reduction but creates
    consistency/cache-governance problems.
-   Shard DB immediately → technically possible but disproportionately
    complex.

The game should reward **causal fit and proportionality**, not
memorisation.

------------------------------------------------------------------------

# 11. Scoring

Each mission can score five dimensions:

-   **Diagnosis** --- did the learner identify the actual bottleneck?
-   **Effectiveness** --- did the change improve the target symptom?
-   **Resilience** --- did it avoid creating an obvious SPOF/failure
    cascade?
-   **Cost** --- was the solution proportionate?
-   **Explanation** --- can the learner explain why it worked and its
    trade-off?

No global "best architecture" score. The final game rewards the smallest
design satisfying stated requirements.

------------------------------------------------------------------------

# 12. Knowledge Repetition / Spiral Learning

Concepts must return later in new forms.

Examples:

-   Local Session problem → Redis Session → Kubernetes replaceable Pods
    → Agent session affinity.
-   DB bottleneck → cache → cache failure → replicas/shards →
    heterogeneous storage → AI/vector memory.
-   Manual scaling → load-balanced replicas → container replicas → HPA →
    KEDA → AI worker queues.
-   Logs → distributed traces → OpenTelemetry → agent/tool/token traces.
-   Queue peak shaving → KEDA queue-driven scaling → AI MQ.
-   Gateway → API Gateway → Ingress → AI Gateway.

This repetition is intentional: the learner should see that modern
systems reuse old principles under new workload shapes.

------------------------------------------------------------------------

# 13. Source Fidelity Rules

1.  The source repository's causal explanations are the default
    technical basis.
2.  Atlas Market is fictional; do not claim incidents happened
    historically at Taobao.
3.  When the source provides a concrete incident, prefer adapting it
    rather than inventing a new root cause.
4.  Preserve the source's sequence where sequence is pedagogically
    important.
5.  If the game simplifies a technology, document the simplification in
    mission metadata.
6.  Do not teach a later technology before the learner has experienced
    the problem it solves, except in optional preview/reference
    material.
7.  Do not portray any named technology as universally correct.
8.  Preserve trade-offs: every architectural improvement should cost
    money, complexity, consistency, latency, operational burden, or
    another constraint.
9.  Keep source references in mission data,
    e.g. `sourceSections: ["2.3"]`.
10. Before implementation, re-read the exact source section for each
    mission and verify the storyboard against it.

------------------------------------------------------------------------

# 14. Source-to-Game Mapping

  -----------------------------------------------------------------------
  Source                              Game focus
  ----------------------------------- -----------------------------------
  1.1                                 Single-node monolith, DNS/request
                                      journey, local assumptions

  1.2                                 Web/DB separation, network
                                      dependency, connection pools

  1.3                                 CPU/memory/I/O diagnosis, GC,
                                      threads

  1.4                                 Performance vs scalability,
                                      scale-up/out, Amdahl

  2.1--2.4                            Cache-aside, Redis/local cache,
                                      penetration/breakdown/avalanche,
                                      consistency

  3.1--3.4                            Reverse proxy, statelessness,
                                      sessions, L4/L7, DNS/CDN/multi-site

  4.1--4.4                            Replicas, vertical DB split,
                                      sharding, distributed
                                      transaction/JOIN cost

  5.1--5.4                            Domain/service split, RPC,
                                      discovery/config, rate
                                      limit/circuit break/degrade

  6.1                                 Heterogeneous stores,
                                      HDFS/HBase/Elasticsearch, eventual
                                      consistency

  6.2                                 MQ, peak shaving, ordering,
                                      transaction messages, idempotency

  6.3                                 ESB/API Gateway

  6.4                                 Deployment hell/environment drift

  7.1--8.3                            Docker, images, Compose,
                                      networking/storage, cluster limit

  9.1--11.4                           Kubernetes core, routing/storage,
                                      probes, HPA/CA/KEDA,
                                      resources/multi-cluster

  12.1--12.4                          Over-decomposition, modular
                                      monolith, Serverless/FaaS

  13.1--13.4                          GitOps, observability, FinOps,
                                      managed K8s

  14.1--14.5                          AI workloads, GPU, inference stack,
                                      edge/WASM

  15.1--15.4                          AI-native architecture, AgentRun,
                                      runtime, MCP/A2A

  16.1--16.4                          AI Gateway, token routing/limiting,
                                      middleware, contemporary commerce
                                      AI examples

  17.1--17.4                          review, selection discipline,
                                      architecture principles

  B.1                                 14-evolution master map

  B.2                                 campaign/peak case

  B.4                                 problem-first teaching and
                                      experiment-based assessment
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 15. Implementation Structure for Axiom Atlas

Recommended route structure:

``` text
app/
  computer-science/
    page.tsx
    architecture-lab/
      page.tsx
      ArchitectureLab.tsx
      components/
        ArchitectureCanvas.tsx
        MetricPanel.tsx
        EvidenceDrawer.tsx
        ActionTray.tsx
        IncidentBanner.tsx
        BeforeAfterPanel.tsx
        MissionMap.tsx
      engine/
        simulation.ts
        actions.ts
        scoring.ts
        topology.ts
        types.ts
      missions/
        act-01.ts
        act-02.ts
        act-03.ts
        act-04.ts
        act-05.ts
        act-06.ts
        act-07.ts
        act-08.ts
      content/
        glossary.ts
        source-map.ts
```

Mission content should be data-driven. Avoid writing 79 separate bespoke
page components.

Suggested shape:

``` ts
type Mission = {
  id: string;
  act: number;
  title: string;
  sourceSections: string[];
  objective: string;
  story: StoryBeat[];
  initialState: SystemState;
  evidence: EvidenceItem[];
  availableActions: ArchitectureAction[];
  experiments?: Experiment[];
  success: SuccessRule[];
  misconceptions: string[];
  tradeoffs: string[];
  nextHook: string;
  doNotTeachYet: string[];
};
```

------------------------------------------------------------------------

# 16. MVP Build Order

Do **not** implement all 79 missions at once.

### Vertical Slice A

Missions 1--6: single machine → disk-full incident → Web/DB split →
remote dependency → connection pool.

Purpose: validate whether the core observe/change/simulate loop is fun.

### Vertical Slice B

Missions 14--16: DB read bottleneck → cache-aside → cache disasters.

Purpose: validate traffic animation and causal metrics.

### Vertical Slice C

Missions 46--53: deployment hell → Docker → Compose → 4,000-container
limit.

Purpose: validate non-performance incidents and architecture evolution.

### Vertical Slice D

Missions 62--65: probes → HPA → queue-driven scaling → node/resources.

Purpose: validate live control-loop simulation.

Only after these four slices are enjoyable should the entire curriculum
be produced.

------------------------------------------------------------------------

# 17. Acceptance Criteria for the Bible-to-Code Transition

Before Codex is asked to implement a mission:

-   exact source section has been reviewed;
-   incident/root cause is traceable to source or clearly marked as
    game-only framing;
-   before topology exists;
-   player-observable evidence exists;
-   at least two plausible interventions exist;
-   each intervention has a simulated consequence;
-   successful intervention creates or reveals a trade-off;
-   learning objective is one sentence;
-   `do_not_teach_yet` is defined;
-   mobile interaction is specified;
-   no answer is revealed before investigation;
-   mission can be completed without reading a textbook paragraph first.

------------------------------------------------------------------------

# 18. Final Design Principle

The learner should finish the lab with a mental model like this:

``` text
We did not add Redis because Redis is popular.
We added it because repeated reads were crushing the database.

We did not add Elasticsearch because every system needs Elasticsearch.
We added it because full-text/ranked search is a different access pattern.

We did not add Docker because containers are modern.
We added it because application + environment had to become a reproducible unit.

We did not add Kubernetes because large companies use Kubernetes.
We added it because thousands of containers required scheduling,
self-healing, discovery and desired-state reconciliation.

We did not split everything into microservices forever.
We learned when splitting itself becomes technical debt.

We did not add Agent infrastructure because AI is fashionable.
We added it because production agents introduce long-running work,
memory, tools, queues, evaluation, observability, security and cost.
```

That causal understanding---not technology-name recall---is the learning
outcome.

------------------------------------------------------------------------

# 19. Primary Source

`ccc115a/se/_more/mybook/向淘寶學習網站架構演進/`

Key source sections reviewed while producing this Bible include the
master README, B.1 evolution map, B.4 teaching guide, 1.1--1.4, 2.1,
2.3, 3.2, 4.4, 5.4, 6.1, 6.2, 6.4, 8.3, 11.2, 12.1, 13.2 and 15.2.
Before implementation of each remaining mission, its exact corresponding
source section should be re-read and the mission verified.

------------------------------------------------------------------------

**End of Architecture Evolution Lab --- Game Design Bible v1.0**
