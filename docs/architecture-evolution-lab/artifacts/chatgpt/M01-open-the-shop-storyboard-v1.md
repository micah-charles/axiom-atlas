# M01 --- Open the Shop

## Architecture Evolution Lab --- Storyboard / Content Design v1

> **Scope lock:** This artifact designs **M01 only**. It does not design
> or implement M02--M79.\
> **Fiction boundary:** Atlas Market, its characters, dialogue,
> dashboards, costs, timings, scores, and simulation metrics are
> fictional educational framing unless explicitly identified as
> source-backed.\
> **Technical source of truth for this mission:** `ccc115a/se`,
> `_more/mybook/向淘寶學習網站架構演進/1.1.md`, blob SHA
> `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`.

------------------------------------------------------------------------

# 1. Mission header

  -------------------------------------------------------------------------------------
  Field                               Specification
  ----------------------------------- -------------------------------------------------
  Mission ID                          `M01`

  Title                               **Open the Shop**

  Act / Chapter                       Act I --- One Machine, First Limits / Chapter 1
                                      --- The Starting Point

  Source section                      `1.1 淘寶初期的 Web 架構：單機 Tomcat + 資料庫`

  Source blob SHA                     `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`

  Intended learner level              Beginner to early-intermediate systems/software
                                      learner; no prior distributed-systems knowledge
                                      required

  Estimated play time                 **8--12 minutes --- simulation-only design
                                      value**

  Mission fantasy                     You are Atlas Market's first systems engineer.
                                      The business needs the smallest online shop that
                                      can display products and accept an order.

  Learning objective                  **Given a tiny early-stage workload and a strong
                                      simplicity constraint, choose and justify a
                                      single-host architecture as a proportionate
                                      starting point while recognising that the host is
                                      one shared failure domain.**

  Causal position                     constraints → evidence → architecture choice →
                                      working request → proportionality result → single
                                      failure-domain trade-off

  Completion condition                The player has investigated enough evidence,
                                      assembled a working proportionate topology,
                                      successfully simulated one product request, and
                                      explained both **why it fits now** and **what
                                      remains unsolved**.
  -------------------------------------------------------------------------------------

## Mission design rule

M01 must not begin by asking, "Which architecture is correct?" It begins
with a business need and incomplete evidence. The player earns the
architectural label only after assembling and testing the system.

The player should finish with two simultaneous ideas:

1.  **"This small architecture is a sensible choice for the present
    constraints."**
2.  **"Everything important is on one host, so one host failure can stop
    the whole shop."**

Neither idea cancels the other.

------------------------------------------------------------------------

# 2. Source traceability

## 2.1 Traceability table

  -----------------------------------------------------------------------------------------------------------------
  Claim or mechanic          Source fact or game          Exact source section             Notes
                             simulation                                                    
  -------------------------- ---------------------------- -------------------------------- ------------------------
  Early shop has only a few  **Source-backed**            1.1, opening problem             Use as qualitative
  hundred products                                                                         constraint; UI may
                                                                                           display "a few hundred",
                                                                                           not an invented exact
                                                                                           historical count.

  Fewer than 100 users are   **Source-backed**            1.1, opening problem             Present as "under 100
  online concurrently                                                                      concurrent users" rather
                                                                                           than an invented exact
                                                                                           historical number.

  Priority is to get a       **Source-backed teaching     1.1, opening problem             Atlas Market dialogue
  usable shop online quickly premise**                                                     adapts this premise
                                                                                           fictionally.

  Web/application/database   **Source-backed**            1.1,                             Central mechanic of M01.
  can run on one host                                     "單機站：所有東西塞進一台機器"   

  Linux host                 **Source-backed**            1.1, single-node stack           Atlas Market may use
                                                                                           Linux in the educational
                                                                                           topology.

  Tomcat application server  **Source-backed**            1.1                              Keep visible because
                                                                                           request journey depends
                                                                                           on it.

  MySQL local database       **Source-backed**            1.1                              Store
                                                                                           products/orders/member
                                                                                           data at conceptual
                                                                                           level.

  Product images on local    **Source-backed**            1.1 topology and "three local    Must be inspectable.
  disk                                                    assumptions"                     

  Session in Tomcat memory   **Source-backed**            1.1 "three local assumptions"    Must be inspectable but
                                                                                           not expanded into
                                                                                           Session-sharing
                                                                                           solutions.

  DB connection is           **Source-backed**            1.1 request journey / local      Represent as a local
  local/JDBC                                              assumptions                      edge inside the host.

  Request begins with DNS    **Source-backed**            1.1 DNS section                  DNS translates the
  before reaching Tomcat                                                                   domain to the single
                                                                                           host IP in this mission.

  HTTP request reaches       **Source-backed**            1.1 DNS and request journey      Show sequentially.
  Tomcat after DNS                                                                         

  Tomcat processes request   **Source-backed**            1.1 Tomcat request journey       Core live request
  and calls MySQL through                                                                  animation.
  JDBC                                                                                     

  Single node has no load    **Source-backed**            1.1 single-node description      Do not introduce them as
  balancer or standby                                                                      required components.

  One host failure can stop  **Source-backed**            1.1 advantages/disadvantages     Trade-off reveal after
  the whole site                                                                           the successful run.

  Single-node deployment is  **Source-backed              1.1 advantages/disadvantages     Do not attach real-world
  simple/cheap/fast relative qualitatively**                                               currency amounts as
  to more complex designs                                                                  source facts.

  Architecture has limited   **Source-backed**            1.1 upper-limit table and        M01 only reveals this as
  scalability / ceiling                                   summary                          a boundary; it does not
                                                                                           teach the scaling
                                                                                           solution.

  Atlas Market company and   **Fictional framing**        N/A                              Must never be described
  characters                                                                               as Taobao history.

  Mission takes 8--12        **Simulation/design-only**   N/A                              UX estimate only.
  minutes                                                                                  

  Scenario "launch budget    **Simulation-only**          N/A                              Abstract educational
  units"                                                                                   units; never £/\$ or
                                                                                           claimed production cost.

  `complexityPoints`         **Simulation-only**          N/A                              Relative comparison
                                                                                           only.

  `monthlyCostUnits`         **Simulation-only**          N/A                              Relative educational
                                                                                           metric, not money.

  `setupSteps`               **Simulation-only**          N/A                              Used to communicate
                                                                                           operational burden.

  Simulated request latency  **Simulation-only**          N/A                              Directional,
  values                                                                                   deterministic
                                                                                           educational values.

  Simulated reliability      **Simulation-only**          N/A                              Must be labelled "Lab
  score                                                                                    reliability indicator",
                                                                                           not uptime/SLA.

  Simulated                  **Simulation-only**          N/A                              Do not imply historical
  capacity/headroom                                                                        or production capacity.
  indicator                                                                                

  Simulated failure drill at **Simulation-only mechanic   1.1 reliability disadvantage     Host shutdown is
  end                        based on source-backed                                        fictional; consequence
                             failure property**                                            is source-consistent.

  Score out of 100           **Simulation-only**          N/A                              Assessment device only.

  "Launch deadline: today"   **Fictional framing**        N/A                              Represents source-backed
                                                                                           urgency without claiming
                                                                                           history.

  "Budget: 12 lab units"     **Simulation-only**          N/A                              Deterministic comparison
                                                                                           input.

  Single-host option cost =  **Simulation-only**          N/A                              Relative only.
  4 units                                                                                  

  Load-balanced two-host     **Simulation-only**          N/A                              Deliberately plausible
  option cost = 10 units                                                                   but disproportionate.

  Kubernetes cluster option  **Simulation-only**          N/A                              Represents
  cost = 18 units                                                                          complexity/cost, not a
                                                                                           real quote.

  Single-host request        **Simulation-only**          N/A                              Used only for
  simulated at 80 ms                                                                       deterministic
                                                                                           comparison.

  Two-host request simulated **Simulation-only**          N/A                              Extra hop/coordination
  at 86 ms                                                                                 representation; not a
                                                                                           production benchmark.

  Kubernetes request         **Simulation-only**          N/A                              Not a claim about
  simulated at 92 ms                                                                       Kubernetes performance.

  One-host failure blast     **Source-backed property     1.1                              Core trade-off.
  radius = entire shop       represented by simulation**                                   
  -----------------------------------------------------------------------------------------------------------------

## 2.2 Simulation-only value register

Every numeric value below must carry a UI affordance such as **"Lab
value"**, **"Simulation"**, or an info tooltip explaining that it is an
educational comparison, not production data.

  --------------------------------------------------------------------------------------
  ID                                                         Value Purpose
  ----------------------------------- ---------------------------- ---------------------
  `sim.launchBudgetUnits`                                       12 Makes proportionality
                                                                   measurable

  `sim.singleNode.costUnits`                                     4 Relative cost

  `sim.singleNode.complexityPoints`                              2 Relative complexity

  `sim.singleNode.setupSteps`                                    3 Relative setup burden

  `sim.singleNode.requestMs`                                    80 Deterministic request
                                                                   replay

  `sim.twoHost.costUnits`                                       10 Relative cost

  `sim.twoHost.complexityPoints`                                 7 Relative complexity

  `sim.twoHost.setupSteps`                                       8 Relative setup burden

  `sim.twoHost.requestMs`                                       86 Deterministic request
                                                                   replay

  `sim.k8s.costUnits`                                           18 Relative cost;
                                                                   exceeds scenario
                                                                   budget

  `sim.k8s.complexityPoints`                                    12 Relative complexity

  `sim.k8s.setupSteps`                                          14 Relative setup burden

  `sim.k8s.requestMs`                                           92 Deterministic request
                                                                   replay

  `sim.testRequests`                                            12 Number of animated
                                                                   request samples in
                                                                   deterministic replay

  `sim.scoreMax`                                               100 Assessment scale

  `sim.firstActionTargetSec`                                    10 UX acceptance target
  --------------------------------------------------------------------------------------

These numbers must never be shown beside "Taobao", "historical",
"actual", "real production", "benchmark", or equivalent language.

------------------------------------------------------------------------

# 3. Story beats

## Beat 1 --- Arrival and business constraint

**Character:** Maya --- Product Lead\
**Purpose:** Establish need without naming the answer.

**Visible player-facing text:**

> **Atlas Market needs to open.**\
> We have a small catalogue, fewer than 100 people online at once, and
> one priority: let a customer view a product and place an order without
> building more infrastructure than we need.

Secondary label:

> Atlas Market is fictional. Workload descriptions in this lab are
> adapted from the technical source; lab metrics and costs are
> simulated.

**Player action:** Select **"Inspect what we actually need"** or
directly open one of the evidence cards.

**Unlocked evidence:** Business constraints card.

**Must remain undisclosed:** - term "Single-Node Monolith"; -
recommended topology; - any statement that one host is "the correct
answer"; - Kubernetes/load-balancing critique; - next mission solution.

------------------------------------------------------------------------

## Beat 2 --- Current system context

**Character:** Leo --- Operations\
**Visible text:**

> Nothing is deployed yet. We have one available Linux host. Before you
> request anything else, show me what has to run for one product page
> and one order.

**Player action:** Inspect empty architecture canvas and component
inventory.

**Unlocked evidence:** Available host; required capabilities: HTTP
application, product/order data, images, user session.

**Must remain undisclosed:** - that all four capabilities should share
the host; - failure-blast-radius warning; - architecture label.

------------------------------------------------------------------------

## Beat 3 --- Player investigation

**Characters:** Maya and Leo, through evidence cards rather than
tutorial pop-ups.

**Player-facing evidence prompts:** - "How many people are we designing
for now?" - "Where does product data need to live?" - "What happens
between typing the URL and reading the product page?" - "What
infrastructure do we already have?"

**Player action:** Inspect at least **three of four required evidence
items** before the action tray unlocks full assembly.

**Unlocked evidence:** workload, request-path hint, local-resource
requirements, infrastructure constraint.

**Must remain undisclosed:** - exact assembled topology; - label
"single-node"; - single-host failure demonstration.

------------------------------------------------------------------------

## Beat 4 --- Architecture assembly

**Character:** Sam --- Developer\
**Visible text:**

> I need somewhere to run the shop, somewhere to keep product and order
> data, somewhere for product images, and a session while the customer
> browses. Keep the first release understandable.

**Player action:** Drag/place or keyboard-add: - Linux Host - Tomcat
Web/Application - MySQL - Local Image Storage - In-memory Session

Then connect required relationships.

**Unlocked evidence:** Once a valid serving topology exists, **"Run
customer request"** becomes available.

**Must remain undisclosed:** - whether the topology is proportionate
until tested; - future scaling components; - failure drill.

------------------------------------------------------------------------

## Beat 5 --- Live request simulation

**Character:** Leo\
**Visible text:**

> Good. Now prove that a customer can actually use it.

**Player action:** Press **Run request**.

**Simulation sequence:** 1. Browser asks DNS for `shop.atlas.example`.
2. DNS returns the one host address. 3. Browser sends HTTP request to
Tomcat. 4. Tomcat handles request. 5. Tomcat reads product data from
local MySQL through JDBC. 6. Tomcat reads the product image from local
storage. 7. Session state remains in Tomcat memory. 8. Product response
returns to browser. 9. A second small animation shows an order write
reaching local MySQL.

**Unlocked evidence:** Request-path trace; topology validity; simulated
latency/cost/complexity comparison.

**Must remain undisclosed until animation completes:** - architecture
name; - single-host failure reveal.

------------------------------------------------------------------------

## Beat 6 --- Decision/result

**Character:** Maya\
**Visible text after successful proportional build:**

> The shop works, the request path is short, and we stayed inside the
> lab budget. For today's constraints, you have not paid for
> infrastructure we do not yet need.

Then reveal:

> **Architecture identified: Single-Node Monolith**

**Player action:** Review "Why this fits now" comparison.

**Unlocked evidence:** Relative cost and complexity versus overbuilt
alternatives.

**Must remain undisclosed:** specific later remedies for the failure
domain.

------------------------------------------------------------------------

## Beat 7 --- Trade-off reveal

**Character:** Leo\
**Visible text:**

> One more test. What happens if the host disappears?

**Player action:** Press **Simulate host failure**.

**Result:** Linux Host enters `DOWN`; Tomcat, MySQL, local images, and
in-memory Session all become unavailable; browser request fails.

**Visible conclusion:**

> **One host = one shared failure domain.**\
> The architecture is proportionate, but it has no redundancy.

**Must remain undisclosed:** - load balancer as the remedy; - database
separation as the remedy; - replicas; - session externalisation; - any
later architecture.

------------------------------------------------------------------------

## Beat 8 --- Next-incident hook

**Character:** Maya\
**Visible text:**

> We can open the shop. Keep watching the assumptions we made by putting
> everything together. Growth will test them.

**Player action:** Complete causal explanation and finish M01.

**Unlocked:** Mission completion card only.

**Next hook:** "The shop is live. The single host is now both our
strength---simplicity---and our shared point of failure."

**Do not preview:** M02 mechanics or solution.

------------------------------------------------------------------------

# 4. Screen-by-screen storyboard

## Screen S01 --- Mission briefing

### Objective

Make the business constraint legible before any architecture vocabulary
is introduced.

### Desktop layout

-   Top: `M01 — Open the Shop`, Act I breadcrumb.
-   Left 60%: Maya character panel and mission brief.
-   Right 40%: constraint cards:
    -   catalogue: "few hundred products";
    -   concurrency: "under 100 online at once";
    -   infrastructure: "one Linux host available";
    -   priority: "open with minimal unnecessary infrastructure".
-   Bottom: `Inspect the evidence` primary action.

### Mobile layout

-   Character brief first.
-   Horizontally scrollable constraint cards beneath.
-   Sticky bottom button: `Inspect evidence`.

### Controls

-   Primary button.
-   Each constraint card has `Inspect`.
-   Source/simulation info icon.

### State labels

`BRIEFING`, `SOURCE-BASED CONSTRAINT`, `FICTIONAL COMPANY`.

### Empty/error state

If content fails to load: show static mission objective and a retry
control; never replace evidence with the answer.

### Keyboard/touch

-   Tab through cards.
-   Enter/Space opens card.
-   Touch targets ≥44×44 CSS px.
-   Swipe is optional; cards remain reachable through buttons.

### Reduced motion

No character entrance animation. Cards appear instantly.

### First thing a fresh player should notice

**"Small shop, under 100 concurrent users, one host, open quickly."**

------------------------------------------------------------------------

## Screen S02 --- Architecture canvas

### Objective

Let the player construct the system from required capabilities.

### Desktop layout

-   Left 65%: empty architecture canvas with a browser outside a dotted
    "Atlas Market infrastructure" boundary.
-   Right 35%: evidence panel collapsed by default, with four evidence
    indicators.
-   Bottom action tray: Host, Application Server, Database, Local
    Storage, Session; advanced architecture bundles available under
    `Other approaches` only after investigation threshold.

### Mobile layout

Tabs: 1. `System` 2. `Evidence` 3. `Components`

Canvas supports pan/zoom but must fit initial small topology without
requiring zoom.

### Controls

-   Add component.
-   Remove component.
-   Connect.
-   Inspect node.
-   Reset canvas.
-   `Run request` disabled until topology can serve.

### State labels

`NOT YET SERVING`, `EVIDENCE 0/4`, `SIMULATION READY` when valid.

### Empty/error state

Empty canvas text:

> Start with what the shop needs. Inspect evidence before adding
> infrastructure.

Invalid connection gives local explanation, not global answer.

### Keyboard/touch

-   Keyboard `A` opens Add Component menu.
-   Arrow keys move selected component between valid slots.
-   `C` begins connect mode.
-   Enter confirms.
-   Touch: tap component → `Add`; tap source and destination →
    `Connect`.
-   Drag-and-drop is enhancement, never the only interaction.

### Reduced motion

No spring animation; nodes snap into slots.

### First thing a fresh player should notice

The **single available host slot** and the evidence counter, not a
technology menu.

------------------------------------------------------------------------

## Screen S03 --- Evidence drawer/panel

### Objective

Make investigation necessary and useful.

### Desktop layout

Right drawer overlays up to 38% of screen while preserving canvas
context.

### Mobile layout

Full-height sheet with `Back to system`.

### Controls

Evidence tabs: `Business`, `Host`, `Request`, `Local state`.

### State labels

`UNREAD`, `INSPECTED`, `SOURCE-BACKED`, `SIMULATED`.

### Empty/error state

Unavailable evidence shows `Evidence unavailable — retry`; never
auto-completes investigation.

### Keyboard/touch

Arrow keys switch evidence tabs; Escape closes drawer.

### Reduced motion

Drawer appears/disappears without slide.

### First thing a fresh player should notice

Evidence answers **constraints**, not "which architecture should I
pick?"

------------------------------------------------------------------------

## Screen S04 --- Action tray / architecture approaches

### Objective

Offer plausible proportional and overbuilt paths without naming one
"correct".

### Desktop layout

Bottom tray expands to three approach cards after ≥3 evidence items are
inspected: - `Use the available host` - `Request a redundant web tier` -
`Request an orchestrated cluster`

The cards describe components and consequences but **do not display
verdict labels**.

### Mobile layout

Bottom sheet with vertically stacked approach cards.

### Controls

`Preview topology`, `Use this approach`, `Compare requirements`.

### State labels

`WITHIN LAB BUDGET`, `NEAR LAB BUDGET`, `OVER LAB BUDGET`; these are
scenario indicators, not correctness badges.

### Empty/error state

If no approach can be applied due to malformed canvas, show
`Reset to investigated state`.

### Keyboard/touch

Full button access; no drag required.

### Reduced motion

Topology previews switch instantly.

### First thing a fresh player should notice

The alternatives solve **different levels of problem** and carry visibly
different complexity.

------------------------------------------------------------------------

## Screen S05 --- Live request simulation

### Objective

Prove functional causality.

### Desktop layout

-   Topology occupies left 70%.
-   Right 30% trace timeline:
    `DNS → HTTP → Tomcat → JDBC → MySQL → image/session → response`.
-   Bottom mini-panel: lab latency, cost units, complexity points.

### Mobile layout

Topology upper half; trace timeline below as a step list.

### Controls

`Play`, `Pause`, `Step`, `Replay`, `Speed 0.5×/1×/2×`.

### State labels

`REQUEST RUNNING`, `STEP 3/8`, `SIMULATION VALUE`.

### Empty/error state

If topology lacks a dependency, request stops at that step and explains
the missing capability without revealing the complete answer.

### Keyboard/touch

Space play/pause; left/right step; replay button accessible.

### Reduced motion

Replace moving packets with sequential node highlights and textual
status: `Step 4: Tomcat queries local MySQL through JDBC`.

### First thing a fresh player should notice

The request visibly travels through a **short local path after
DNS/HTTP**.

------------------------------------------------------------------------

## Screen S06 --- Before/after comparison

### Objective

Compare the chosen design against the unassembled starting state and
against scenario constraints.

### Important wording

"Before" means **no deployable shop**, not a fictitious previous
production architecture.

### Desktop layout

Two columns: - Before: no serving topology. - After: chosen topology.
Bottom: scenario-fit indicators.

### Mobile layout

Segmented toggle `Before | After`.

### Controls

`Compare request path`, `Compare cost/complexity`, `Continue`.

### State labels

`NO SHOP`, `SERVING`, `LAB VALUE`.

### Empty/error state

If no successful request exists, comparison remains locked and says why.

### Keyboard/touch

Segment control keyboard accessible.

### Reduced motion

No animated morph between diagrams.

### First thing a fresh player should notice

The architecture now serves the business need **without requiring every
advanced component available in the lab**.

------------------------------------------------------------------------

## Screen S07 --- Explanation/result

### Objective

Assess causal reasoning and reveal the trade-off.

### Desktop layout

Three-part causal builder:

`Because [constraints/evidence] → this design [effect] → but it leaves [trade-off]`

Evidence chips can be placed into each slot.

### Mobile layout

One causal slot at a time with `Next`.

### Controls

Select evidence chips, reorder, submit, revise.

### State labels

`EXPLAIN`, `PARTIAL`, `CAUSAL MATCH`, `REVISE`.

### Empty/error state

Submitting empty slots gives targeted prompt: \> Use at least one
workload constraint and one reliability consequence.

### Keyboard/touch

Chip selection via Enter; reorder via Move Left/Right buttons as
alternative to drag.

### Reduced motion

No flying chips; state changes instantly.

### First thing a fresh player should notice

Passing requires both **fit now** and **unsolved risk**.

------------------------------------------------------------------------

# 5. Starting system and topology

## 5.1 Initial state

The mission begins with **no deployed shop topology**.

``` yaml
topology_state: empty
external_nodes:
  - id: customer_browser
    type: client
    label: Customer Browser
available_infrastructure:
  - id: host_01
    type: linux_host
    quantity: 1
    status: available_not_configured
required_capabilities:
  - serve_http_application
  - store_product_and_order_data
  - serve_product_images
  - maintain_browsing_session
```

This is a content/data specification, not application code.

## 5.2 Target proportional topology

``` yaml
nodes:
  - id: customer_browser
    kind: client
    placement: external
  - id: dns
    kind: dns_resolution
    placement: external_conceptual
  - id: host_01
    kind: linux_host
    placement: atlas_market
  - id: tomcat_01
    kind: web_application_server
    parent: host_01
  - id: mysql_01
    kind: relational_database
    parent: host_01
  - id: image_disk_01
    kind: local_disk
    parent: host_01
  - id: session_memory_01
    kind: in_memory_session
    parent: tomcat_01
edges:
  - from: customer_browser
    to: dns
    protocol: dns_lookup
  - from: dns
    to: host_01
    meaning: resolves_single_host_address
  - from: customer_browser
    to: tomcat_01
    protocol: http
  - from: tomcat_01
    to: mysql_01
    protocol: jdbc_local
  - from: tomcat_01
    to: image_disk_01
    protocol: local_file_access
  - from: tomcat_01
    to: session_memory_01
    protocol: in_process_memory
```

## 5.3 Request path

``` text
Customer enters shop domain
→ DNS resolves one IP
→ browser sends HTTP request
→ Tomcat receives and processes request
→ Tomcat reads product through local JDBC/MySQL
→ Tomcat accesses local product image
→ Tomcat uses in-memory Session
→ Tomcat returns response
```

For order submission:

``` text
Browser
→ HTTP
→ Tomcat
→ JDBC local write
→ MySQL order data
→ response
```

## 5.4 Local resources

All of these share `host_01`: - OS resources; - Tomcat process; - MySQL
process; - product-image disk; - Tomcat Session memory.

## 5.5 Failure blast radius

``` yaml
failure_domain:
  id: host_01
  contains:
    - tomcat_01
    - mysql_01
    - image_disk_01
    - session_memory_01
  on_host_down:
    shop_http: unavailable
    database: unavailable
    images: unavailable
    active_sessions: unavailable
  user_visible_result:
    product_request: fails
    order_request: fails
```

The blast-radius model is source-consistent: one node, no redundancy,
host failure means the site is unavailable.

------------------------------------------------------------------------

# 6. Evidence and investigation

The player must inspect **at least three evidence items**, including
`E01` and either `E03` or `E04`, before selecting an architecture
approach. The fourth remains available for stronger scoring.

## E01 --- Business envelope

**Observation**

> Catalogue: a few hundred products.\
> Concurrent users: fewer than 100.\
> Priority: open a usable shop quickly.

**Interpretation expected:** Current demand is small enough that
minimising unnecessary infrastructure is a legitimate engineering
objective.

**Access interaction:** Click/tap `Business brief`; keyboard Enter.

**Provenance:** Source-backed constraints adapted to fictional Atlas
Market.

**Does not say:** "Use one server."

------------------------------------------------------------------------

## E02 --- Available infrastructure

**Observation**

> One Linux host is already available. Additional infrastructure can be
> requested, but increases lab cost and setup burden.

**Interpretation expected:** The player should first test whether the
available host can satisfy current needs.

**Access interaction:** Inspect host inventory card.

**Provenance:** One-host starting model is source-backed; "already
available" and cost mechanics are fictional/simulated.

**Does not say:** That requesting more hosts is wrong.

------------------------------------------------------------------------

## E03 --- Required request journey

**Observation**

A partial sequence appears:

``` text
Domain → ? → HTTP application → product data → response
```

Inspecting details reveals: - DNS resolves domain to IP; - application
needs product/order access; - local JDBC is possible if DB shares host.

**Interpretation expected:** A functioning architecture must include a
web/application path and data path; DNS is outside the host but precedes
HTTP.

**Access interaction:** `Trace a hypothetical request`.

**Provenance:** Source-backed request journey.

**Does not say:** Exact component placement.

------------------------------------------------------------------------

## E04 --- Local state requirements

**Observation**

Sam's deployment note:

> The first release needs product images and a browsing Session in
> addition to product/order data.

Inspecting each: - images can be stored on local disk; - Session can
live in Tomcat memory; - database can be local.

**Interpretation expected:** These can all be co-located now, but doing
so creates local assumptions.

**Access interaction:** Open `Developer notes`.

**Provenance:** Source-backed three local assumptions; character/note
fictional.

**Does not say:** How those assumptions will later break.

------------------------------------------------------------------------

## E05 --- Optional source lens

Available only after one successful request.

**Observation:** "This lab adapts section 1.1 of the source, which
describes a one-node teaching model with Tomcat, local database, local
files and Session."

**Interpretation:** Reinforces traceability after discovery.

**Access:** `Why is this in the lab?`

**Provenance:** Source-backed.

**Purpose:** Never reveal answer before investigation.

------------------------------------------------------------------------

# 7. Choices and deterministic simulation

## 7.1 Shared deterministic scenario inputs

``` yaml
scenario:
  catalogue_scale: few_hundred_products
  concurrent_users: under_100
  growth_event_active: false
  redundancy_requirement: not_stated
  multi_region_requirement: false
  independent_team_deployment_requirement: false
  launch_budget_units: 12
  priority_order:
    - functional_shop
    - simplicity
    - proportional_cost
    - reliability_awareness
```

No stochastic events are used in M01. Replaying the same architecture
with the same inputs must return the same simulation result.

------------------------------------------------------------------------

## Choice A --- Use the available host

### Why it is plausible

It directly tests whether the simplest available infrastructure
satisfies the stated business need.

### Topology change

One Linux host contains Tomcat, MySQL, local image storage and in-memory
Session.

### Deterministic rules

``` yaml
cost_units: 4
complexity_points: 2
setup_steps: 3
request_ms: 80
serves_current_workload: true
redundant: false
host_failure_shop_available: false
budget_remaining: 8
```

### Directional metrics

-   Functional serving: from `NO` → `YES`.
-   Relative cost: low.
-   Relative complexity: low.
-   Request path: short/local after HTTP reaches host.
-   Reliability: unchanged in redundancy terms; still one failure
    domain.
-   Headroom: adequate for the mission's stated small workload, not
    claimed beyond it.

### Consequence

**Succeeds.** Highest proportionality score if explanation recognises
failure domain.

### Recovery

Not required. Player proceeds to request simulation and failure drill.

------------------------------------------------------------------------

## Choice B --- Request a redundant web tier now

### Why it is tempting

The player may correctly recognise that one server can fail and may want
redundancy immediately. This is not foolish; it values availability.

### Proposed topology

DNS → load-balancing entry → Web A + Web B → shared/selected data
placement.

Because M01 has not taught shared Session, shared files, or separated
database design, the preview explicitly surfaces unresolved questions:

-   Where is Session?
-   Where are product images?
-   Which database instance is authoritative?
-   What new component receives traffic first?

### Deterministic rules

``` yaml
cost_units: 10
complexity_points: 7
setup_steps: 8
request_ms: 86
serves_current_workload: true
redundancy_intent: true
unresolved_state_placement: true
budget_remaining: 2
```

### Directional metrics

-   Functional serving: possible.
-   Cost: substantially higher than A.
-   Complexity: higher.
-   Reliability intention: improved at web-process level, but not
    cleanly resolved because state/data remain local concepts in this
    mission.
-   Current workload performance: no meaningful mission benefit required
    by evidence.

### Consequence

**Partially succeeds.** It can serve the shop, but is disproportionate
to stated requirements and introduces state-placement questions the
player has not yet needed to solve.

### Feedback

> You solved a reliability concern before the mission required a
> redundant service, but the new topology creates shared-state and
> traffic-routing questions. The current evidence did not require that
> complexity yet.

### Recovery

`Simplify using current constraints` returns to the investigated canvas
without losing evidence or explanation progress.

**Important:** Do not teach how to implement the load balancer or shared
Session. They are represented as unresolved complexity, not lessons.

------------------------------------------------------------------------

## Choice C --- Request an orchestrated cluster

### Why it is tempting

A learner may associate "professional architecture" with
Kubernetes/orchestration, declarative deployment and redundancy. The
choice is credible precisely because it is a real technology used for
larger operational problems.

### Proposed topology

Cluster boundary with multiple worker slots and an orchestration control
layer; application/database placement intentionally remains high-level.

### Deterministic rules

``` yaml
cost_units: 18
complexity_points: 12
setup_steps: 14
request_ms: 92
serves_current_workload: true
budget_exceeded: true
redundancy_capability: true
present_problem_requires_orchestration: false
```

### Directional metrics

-   Functional serving: yes.
-   Cost: exceeds scenario budget.
-   Complexity: much higher.
-   Current business capability: still only product view/order.
-   Reliability capability: potentially greater, but M01 has no
    source-backed requirement for cluster orchestration.
-   Time-to-open indicator: worse in the lab model.

### Consequence

**Fails the mission's proportionality requirement**, not because
Kubernetes is "bad," but because the evidence does not justify the
operational machinery and the scenario budget is exceeded.

### Feedback

> This architecture can run a small shop, but the mission evidence has
> not shown a scheduling, cluster, scaling, or multi-node operations
> problem. You have paid for capabilities that are not currently
> required.

### Recovery

`Return to requirements` highlights E01/E02 and preserves the player's
attempted design for comparison.

**Boundary:** No Kubernetes concepts are taught beyond "orchestrated
cluster = additional machinery for problems not present here."

------------------------------------------------------------------------

## Choice D --- Database-only shop / static page without required application path

### Why it is plausible

A learner may focus on "store the products" or "show a page" and omit
one required capability.

### Deterministic rule

Request stops at the missing component.

### Consequence

**Fails functional requirement.**

### Feedback

Specific, local: \> Product data exists, but there is no application
path that can receive the HTTP request and query it.

or:

> The page can render, but an order has nowhere authoritative to be
> written.

### Recovery

Return to canvas; missing capability is highlighted, not auto-added.

------------------------------------------------------------------------

## 7.2 Deterministic request model

For a valid Choice A run:

``` yaml
request_trace:
  - step: 1
    event: dns_lookup
    result: host_address_resolved
  - step: 2
    event: http_request
    target: tomcat_01
  - step: 3
    event: application_processing
    target: tomcat_01
  - step: 4
    event: jdbc_product_read
    target: mysql_01
  - step: 5
    event: local_image_read
    target: image_disk_01
  - step: 6
    event: session_access
    target: session_memory_01
  - step: 7
    event: response
    target: customer_browser
result:
  status: success
  lab_latency_ms: 80
```

For the failure drill:

``` yaml
event: host_01_down
cascade:
  tomcat_01: down
  mysql_01: down
  image_disk_01: inaccessible
  session_memory_01: lost_or_unavailable
next_request:
  status: fail
reason: no_available_serving_host
```

------------------------------------------------------------------------

# 8. Explanation and scoring

## 8.1 Causal explanation interaction

The player constructs two linked statements from evidence-backed
fragments.

### Statement A --- Why the design fits

Required semantic structure:

> **Because** the current shop has \[small workload / few hundred
> products / under 100 concurrent users\] and \[speed/simplicity is a
> priority\], **placing** the application, database and local state on
> the available host **meets the current need with less infrastructure
> and complexity**.

Equivalent wording is accepted. The learner does not need the phrase
"Single-Node Monolith."

### Statement B --- What remains unsolved

Required semantic structure:

> **Because** the application, database, images and Session share one
> host, **a failure of that host can make the whole shop unavailable**,
> so the design has no redundancy and a limited future ceiling.

### Interaction format

Evidence chips + causal connectors: - `Because` - `therefore` - `but` -
`which means`

The learner selects evidence and consequences, not definitions.

### Rejected vocabulary-only response

> "It is a monolith because it is a monolith."

Feedback: \> Name the constraint it fits and the consequence of sharing
one host.

------------------------------------------------------------------------

## 8.2 Scoring

Total: **100 lab points --- simulation-only assessment scale.**

  ------------------------------------------------------------------------------------------------
  Dimension                                      Max Full-credit evidence
  --------------------- ---------------------------- ---------------------------------------------
  Diagnosis                                       25 Identifies that the current problem is to
                                                     create a functioning small shop, not to solve
                                                     unobserved scale problems

  Proportionality /                               25 Chooses or recovers to the one-host design
  cost                                               and connects simplicity to present
                                                     constraints

  Reliability awareness                           20 Explicitly identifies one-host blast radius /
                                                     no redundancy

  Causal explanation                              20 Correct
                                                     `constraint → choice → benefit → trade-off`
                                                     reasoning

  Investigation                                   10 Inspects relevant evidence before speculative
  efficiency                                         architecture changes
  ------------------------------------------------------------------------------------------------

### Partial credit examples

**Player chooses redundant web tier but correctly explains why:** -
Diagnosis: 20/25 - Proportionality: 10/25 - Reliability awareness:
20/20 - Explanation: up to 18/20 - Investigation: based on behaviour

Feedback: \> Your reliability reasoning is strong. Re-check whether the
present workload and requirements justify the extra state/routing
complexity.

**Player chooses one host but says "because monolith is fastest":** -
Proportionality may score 18/25. - Explanation capped at 10/20 until
linked to actual constraints.

Feedback: \> The architecture is proportionate, but your explanation
needs evidence: what about this shop makes simplicity valuable?

**Player chooses one host and ignores failure risk:** - Reliability:
0--8/20. - Mission enters `RESULT_REVISION_REQUIRED`.

Feedback: \> The shop works. Now inspect what shares the host and
describe what a host failure affects.

### Recovery path

No hard fail screen for architectural overbuilding. The player can: 1.
inspect missing evidence; 2. compare consequences; 3. simplify/rebuild;
4. rerun deterministically; 5. revise explanation.

Mission completion requires: - functional topology; - proportional
architecture or explicit recovery to it; - acknowledgement of the shared
failure domain.

------------------------------------------------------------------------

# 9. Misconceptions and boundaries

## 9.1 Misconceptions to challenge

### "The biggest architecture is always best."

Challenge through cost/complexity without ridiculing advanced systems. A
large architecture may have capabilities, but capabilities are valuable
only when requirements justify them.

### "Single-node means incorrect."

Challenge directly. Under a small workload and urgent/simple launch
constraint, a single node can be a rational engineering starting point.

### "If one node can fail, it must never be used."

Challenge through trade-offs. Reliability matters, but architecture is
chosen against actual requirements, cost and stage. M01 requires
**awareness** of the risk, not premature remediation.

### "A monolith means one undifferentiated program."

Clarify only as needed: in this mission, "single-node monolith"
describes the deployment model in which web/application/database
resources share one host. Do not launch a taxonomy lecture.

### "DNS is inside Tomcat."

Challenge through request animation: DNS resolution precedes the HTTP
request reaching Tomcat.

### "The database is the whole website."

Challenge through functional topology: browser request requires
application processing plus data/storage.

### "Local means free of consequences."

Local DB/files/Session simplify the initial system, but they share the
host's fate.

### "A faster simulated latency proves an architecture is universally faster."

Explicitly prevent this. Lab latency is a deterministic teaching value
used for comparison, not a benchmark.

------------------------------------------------------------------------

## 9.2 `do_not_teach_yet`

M01 must **not teach, configure, or explain the implementation** of:

-   Web/DB separation;
-   remote DB connections;
-   connection pools as a scaling intervention;
-   caching/Redis;
-   load-balancing algorithms;
-   active/passive failover;
-   shared Session;
-   JWT;
-   CDN;
-   database replicas;
-   database sharding;
-   distributed transactions;
-   microservices;
-   service discovery;
-   message queues;
-   Docker;
-   Kubernetes internals;
-   autoscaling;
-   service mesh;
-   multi-region design;
-   AI infrastructure.

Advanced alternatives may appear only as **high-level overbuilt
choices** to test proportionality. Their mechanics remain locked.

The result may say:

> "This design has no redundancy."

It must not continue with:

> "Therefore add X."

The next architectural change must be earned by a later problem.

------------------------------------------------------------------------

# 10. Implementation handoff

This section is a **data-oriented content contract**, not application
code.

## 10.1 Mission object proposal

``` yaml
mission:
  id: M01
  slug: open-the-shop
  title: Open the Shop
  act_id: ACT_I
  chapter_id: CH01
  learner_level: beginner_early_intermediate
  estimated_play_minutes_simulated: [8, 12]

  source_refs:
    - repository: ccc115a/se
      path: _more/mybook/向淘寶學習網站架構演進/1.1.md
      section: "1.1"
      blob_sha: 9ddbabbd0fe6693b7c8c60479f0c2f37803233fd
      role: primary_technical_source

  objective:
    one_sentence: >
      Choose and justify the smallest architecture that satisfies the
      current small-shop constraints while recognising its single failure domain.

  states:
    - BRIEFING
    - INVESTIGATING
    - ASSEMBLING
    - READY_TO_SIMULATE
    - REQUEST_RUNNING
    - REQUEST_SUCCESS
    - TRADEOFF_REVEAL
    - EXPLAINING
    - RESULT_REVISION_REQUIRED
    - COMPLETE

  required_evidence:
    minimum_count: 3
    mandatory_any:
      - [E01]
      - [E03, E04]

  evidence_ids:
    - E01_BUSINESS_ENVELOPE
    - E02_AVAILABLE_INFRASTRUCTURE
    - E03_REQUEST_JOURNEY
    - E04_LOCAL_STATE_REQUIREMENTS
    - E05_OPTIONAL_SOURCE_LENS

  action_ids:
    - A01_USE_AVAILABLE_HOST
    - A02_REDUNDANT_WEB_TIER
    - A03_ORCHESTRATED_CLUSTER
    - A04_INCOMPLETE_FUNCTIONAL_TOPOLOGY

  simulation_inputs:
    catalogue_scale: few_hundred_products
    concurrency: under_100
    budget_units: 12
    growth_event: false
    redundancy_requirement: not_stated

  success_rules:
    - id: SR01
      rule: topology_can_serve_product_request
    - id: SR02
      rule: topology_can_write_order
    - id: SR03
      rule: final_selected_topology_is_proportional_single_host
    - id: SR04
      rule: explanation_mentions_present_constraints
    - id: SR05
      rule: explanation_mentions_single_host_failure_domain

  scoring:
    diagnosis: 25
    proportionality_cost: 25
    reliability_awareness: 20
    causal_explanation: 20
    investigation_efficiency: 10

  next_hook:
    id: NH01
    text: >
      The shop is live. Everything important still shares one host,
      so simplicity and shared failure fate now coexist.
    reveal_solution: false

  boundaries:
    do_not_teach_yet:
      - database_separation
      - load_balancing_implementation
      - shared_session
      - caching
      - sharding
      - microservices
      - containers
      - kubernetes
      - autoscaling

  provenance_labels:
    source_backed: SOURCE
    fictional_story: FICTION
    simulation_value: LAB_SIMULATION
```

## 10.2 Test IDs

``` yaml
test_ids:
  - M01-T001-FIRST-ACTION-10S
  - M01-T002-SOURCE-CONSTRAINTS
  - M01-T003-EMPTY-CANVAS-NO-ANSWER
  - M01-T004-EVIDENCE-GATE
  - M01-T005-SINGLE-HOST-TOPOLOGY
  - M01-T006-DNS-HTTP-TOMCAT-JDBC-MYSQL
  - M01-T007-LOCAL-IMAGE-SESSION
  - M01-T008-PROPORTIONAL-CHOICE
  - M01-T009-REDUNDANT-TIER-PARTIAL
  - M01-T010-K8S-OVERBUILD
  - M01-T011-INCOMPLETE-TOPOLOGY
  - M01-T012-DETERMINISTIC-REPLAY
  - M01-T013-HOST-FAILURE-BLAST-RADIUS
  - M01-T014-CAUSAL-EXPLANATION
  - M01-T015-PARTIAL-CREDIT
  - M01-T016-KEYBOARD
  - M01-T017-TOUCH-MOBILE
  - M01-T018-REDUCED-MOTION
  - M01-T019-PROVENANCE-LABELS
  - M01-T020-NO-FUTURE-SOLUTION-REVEAL
```

------------------------------------------------------------------------

# 11. Test and evidence plan

## M01-T001 --- Fresh-player first action within 10 seconds

**Setup:** New player, desktop and mobile separately.

**Acceptance:** - Within 10 seconds, ≥80% of internal usability-test
participants should be able to identify an actionable next step without
facilitator help. - Valid first actions: inspect a constraint/evidence
card or press `Inspect evidence`. - The first action must not require
knowing "monolith."

**Capture:**\
`M01-T001-desktop-first-action.mp4`\
`M01-T001-mobile-first-action.mp4`

------------------------------------------------------------------------

## M01-T002 --- Source constraints

**Acceptance:** - UI shows "few hundred products" and "under 100
concurrent users". - Does not invent an exact historical Atlas/Taobao
user count. - Fiction/simulation provenance is visible.

**Capture:** `M01-T002-source-constraints.png`

------------------------------------------------------------------------

## M01-T003 --- Empty canvas does not reveal answer

**Acceptance:** - Initial canvas contains browser + available host
context, not preassembled Tomcat/MySQL topology. - "Single-Node
Monolith" is absent before successful investigation/build. - No green
"correct" highlight on one-host approach before simulation.

**Capture:** `M01-T003-empty-canvas.png`

------------------------------------------------------------------------

## M01-T004 --- Evidence gate

**Acceptance:** - Player cannot immediately receive a final architecture
verdict. - Architecture approaches become fully actionable only after
evidence threshold. - Evidence E01 and at least one of E03/E04 have been
inspected.

**Capture:** `M01-T004-evidence-gate.mp4`

------------------------------------------------------------------------

## M01-T005 --- Single-host topology

**Acceptance:** - Tomcat, MySQL, local image storage and Session are all
children/resources of one Linux host. - Browser remains external. - DNS
remains conceptual/external, not inside the host.

**Capture:** `M01-T005-single-host-topology.png`

------------------------------------------------------------------------

## M01-T006 --- Request path

**Acceptance:** Replay order is deterministic:

`DNS → HTTP → Tomcat → JDBC → MySQL → response`

Local image and Session access appear during application processing
without changing the core order.

**Capture:** `M01-T006-request-path.mp4`

------------------------------------------------------------------------

## M01-T007 --- Local image and Session assumptions

**Acceptance:** - Product image storage is visibly local. - Session is
visibly in Tomcat memory. - Inspection explains placement but does not
teach future externalisation.

**Capture:** `M01-T007-local-assumptions.png`

------------------------------------------------------------------------

## M01-T008 --- Proportional choice

**Acceptance:** - Choice A serves product and order requirements. - Lab
budget remains positive. - Result identifies architecture only after
successful run. - Player must still complete reliability explanation.

**Capture:** `M01-T008-proportional-result.png`

------------------------------------------------------------------------

## M01-T009 --- Plausible redundant-tier alternative

**Acceptance:** - Choice B is not mocked or marked nonsensical. - It can
serve the current shop. - Simulation reports higher cost/complexity and
unresolved state-placement questions. - Recovery preserves inspected
evidence.

**Capture:** `M01-T009-redundant-tier-partial.mp4`

------------------------------------------------------------------------

## M01-T010 --- Kubernetes overbuild

**Acceptance:** - Choice C is described as capable but
disproportionate. - Scenario budget is exceeded deterministically. - No
Kubernetes tutorial appears. - Feedback explains missing present need
rather than saying "Kubernetes is bad."

**Capture:** `M01-T010-overbuild-result.png`

------------------------------------------------------------------------

## M01-T011 --- Incomplete topology

**Acceptance:** - Missing application or data capability stops request
at the relevant step. - Error identifies the missing capability only. -
Complete target topology is not auto-generated.

**Capture:** `M01-T011-incomplete-request.mp4`

------------------------------------------------------------------------

## M01-T012 --- Deterministic replay

**Acceptance:** Given identical mission state and Choice A: - request
trace is identical; - lab latency returns 80 ms each replay; - cost =
4; - complexity = 2; - same failure drill consequence.

Given Choice B/C, their specified values also repeat exactly.

**Capture:** automated test log + `M01-T012-replay.mp4`

------------------------------------------------------------------------

## M01-T013 --- Failure blast radius

**Acceptance:** On `host_01_down`: - Tomcat unavailable; - MySQL
unavailable; - local images unavailable; - in-memory Session
unavailable; - next customer request fails.

No solution component is suggested automatically.

**Capture:** `M01-T013-host-failure.png`

------------------------------------------------------------------------

## M01-T014 --- Causal explanation

**Acceptance:** Full score requires: - at least one present
constraint; - connection from constraint to
simplicity/proportionality; - explicit one-host reliability trade-off.

Vocabulary alone cannot receive full explanation score.

**Capture:** `M01-T014-causal-explanation.png`

------------------------------------------------------------------------

## M01-T015 --- Partial credit

**Acceptance:** - Redundant-tier learner receives reliability credit. -
Single-host learner who omits failure risk receives proportionality
credit but reduced reliability score. - Player can revise without
restarting mission.

**Capture:** `M01-T015-partial-credit.mp4`

------------------------------------------------------------------------

## M01-T016 --- Keyboard path

**Acceptance:** Mission can be completed without mouse: - evidence; -
component placement; - connections; - simulation; - explanation; -
revision.

Focus order is logical and visible.

**Capture:** `M01-T016-keyboard-complete.mp4`

------------------------------------------------------------------------

## M01-T017 --- Touch/mobile path

**Acceptance:** - No required hover. - No required drag. - Canvas is
understandable on narrow viewport. - Evidence and components available
through tabs/sheets. - Touch targets meet minimum size.

**Capture:**\
`M01-T017-mobile-brief.png`\
`M01-T017-mobile-canvas.png`\
`M01-T017-mobile-complete.mp4`

------------------------------------------------------------------------

## M01-T018 --- Reduced motion

**Acceptance:** With reduced-motion preference: - moving packets are
replaced by sequential highlights/text; - no essential information is
conveyed by movement; - simulation step order remains understandable.

**Capture:** `M01-T018-reduced-motion.mp4`

------------------------------------------------------------------------

## M01-T019 --- Provenance labels

**Acceptance:** - Fictional Atlas Market framing is labelled. - Lab-only
cost/latency/complexity values are labelled. - Source-backed constraints
are distinguishable. - No simulated value is presented as historical
Taobao data.

**Capture:** `M01-T019-provenance.png`

------------------------------------------------------------------------

## M01-T020 --- No future-solution reveal

**Acceptance:** Search rendered mission content for prohibited early
instruction: - no "add Redis"; - no "add a load balancer" as recommended
next step; - no "split the database"; - no Kubernetes implementation
guidance; - no M02+ mission content.

Trade-off reveal stops at the problem statement.

**Capture:** content-test output `M01-T020-boundary-check.txt`

------------------------------------------------------------------------

# 12. Open questions

1.  **Visual representation of DNS:** Should DNS be a persistent small
    node on the architecture canvas, or appear only during request
    simulation? Both preserve source causality; persistent display
    improves conceptual continuity, while simulation-only display keeps
    the initial topology visually smaller.

2.  **Free-form explanation input:** Should the causal explanation be
    evidence-chip construction only, or optionally allow a short
    free-text explanation after the structured causal builder? The
    structured version is easier to score deterministically; optional
    free text may improve learner reflection but needs a separate
    evaluation strategy.

3.  **Overbuilt alternative naming:** Should the action tray explicitly
    say "orchestrated cluster," or use a more neutral description such
    as "multi-node managed platform" so that the mission does not
    prematurely foreground Kubernetes vocabulary? The mission contract
    permits Kubernetes as a premature alternative but forbids teaching
    it.

------------------------------------------------------------------------

# Change log

## v1

-   Created the complete M01-only storyboard.
-   Verified the primary source file and blob SHA.
-   Separated source-backed facts, fictional Atlas Market framing, and
    lab simulation values.
-   Added eight player-facing story beats with disclosure boundaries.
-   Specified desktop/mobile/keyboard/touch/reduced-motion behaviour for
    all required screens.
-   Defined a data-oriented starting topology, request path and
    single-host blast radius.
-   Added five inspectable evidence items and an investigation gate.
-   Added deterministic proportional, redundant-tier,
    orchestrated-cluster and incomplete-topology paths.
-   Added causal scoring, partial credit and non-punitive recovery.
-   Added `do_not_teach_yet` boundaries to prevent M02+ leakage.
-   Added implementation-handoff content contract and 20 acceptance-test
    IDs.
-   Added post-implementation screenshot/recording evidence names.
