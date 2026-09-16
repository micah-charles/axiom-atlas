# M02 --- Follow One Request

## Architecture Evolution Lab --- Storyboard / Content Design v1

> **Artifact type:** Mission storyboard and implementation contract, not
> application code.\
> **Scope:** M02 only. No M03+ lesson is designed or implemented here.

------------------------------------------------------------------------

# 1. Mission header

  ----------------------------------------------------------------------------------
  Field                               Value
  ----------------------------------- ----------------------------------------------
  Mission ID                          `M02`

  Title                               **Follow One Request**

  Act / chapter                       Act I --- One Machine, First Limits

  Primary source                      `ccc115a/se` →
                                      `_more/mybook/向淘寶學習網站架構演進/1.1.md`

  Exact source blob SHA               `9ddbabbd0fe6693b7c8c60479f0c2f37803233fd`

  Intended learner                    Beginner--intermediate; understands
                                      browser/server/database at a basic level

  Estimated play time                 8--12 minutes first run; 3--5 minutes replay

  Prerequisite                        M01 conceptual baseline: Atlas Market
                                      currently uses one Linux host containing
                                      Tomcat, MySQL, local images, and in-memory
                                      Session

  Learning objective                  **Trace one concrete customer page request
                                      through DNS, HTTP/Tomcat, JDBC/MySQL, local
                                      image access and Session, then explain which
                                      stages are request routing, application work,
                                      data access and local-state assumptions.**
  ----------------------------------------------------------------------------------

## 1.1 Player promise

> **"You will follow one customer's click from a shop URL to a finished
> product page. Every hop you place has a job. If you route the request
> incorrectly, the page will fail in a technically meaningful way ---
> and you can diagnose and repair it."**

The mission must feel like operating a request, not reading a network
diagram.

The player will:

1.  receive a concrete fictional customer incident/request;
2.  inspect evidence without seeing the complete answer;
3.  assemble/trace the request path;
4.  execute it deterministically;
5.  diagnose at least one plausible broken path;
6.  observe a local-state boundary;
7.  build a causal explanation;
8.  receive deterministic scoring;
9.  optionally reflect in free text after the scored interaction.

------------------------------------------------------------------------

# 2. Source / fiction / simulation boundary

M02 uses the source for **technical causality**, not for fictional
historical reconstruction.

## 2.1 Three explicit provenance classes

Every content datum in the mission belongs to exactly one of:

### `SOURCE_BACKED`

Supported by source section 1.1.

Examples:

-   browser performs DNS resolution before connecting to Tomcat;
-   DNS maps the domain to the single host IP in this architecture;
-   HTTP request reaches Tomcat;
-   Tomcat processes HTTP / invokes application logic;
-   application accesses local MySQL through JDBC;
-   product images are stored on local disk;
-   Session is stored in Tomcat memory;
-   the database, images, and Session are local assumptions;
-   a single host has no redundancy.

### `FICTIONAL_SCENARIO`

Atlas Market narrative material invented only to make the source
playable.

Examples:

-   customer name;
-   product name;
-   request ID;
-   incident wording;
-   support/engineering characters;
-   timestamps;
-   order/product identifiers.

These must never be presented as Taobao history.

### `TEACHING_SIMULATION`

Deterministic values/rules added for gameplay.

Examples:

-   stage tokens;
-   trace score;
-   simulated milliseconds;
-   retry count;
-   "request health" indicators;
-   evidence-inspection score;
-   exact scoring weights;
-   synthetic DNS cache state chosen for the mission.

Any such numeric value must be visibly marked `SIMULATION`, `LAB`, or
equivalent.

------------------------------------------------------------------------

# 3. Source traceability

  -------------------------------------------------------------------------------------------------------
  Claim / mechanic           Provenance            Exact source basis               Mission treatment
  -------------------------- --------------------- -------------------------------- ---------------------
  Small shop uses one host   SOURCE_BACKED         "Web                             M02 starts from the
                                                   程式和資料庫全裝在同一台機器";   already-established
                                                   single-node architecture         M01 topology rather
                                                                                    than rebuilding it

  Browser first resolves     SOURCE_BACKED         "第一步不是連你的 Tomcat，而是問 First request-routing
  domain                                           DNS"                             problem

  Browser DNS cache may      SOURCE_BACKED         DNS step 1                       Inspectable evidence;
  answer                                                                            simplified
                                                                                    cache-hit/miss
                                                                                    decision

  Cache miss goes to         SOURCE_BACKED         DNS steps 2--3                   Shown as environment
  configured/ISP DNS                                                                trace, not
                                                                                    player-deployed
                                                                                    infrastructure

  DNS eventually returns IP  SOURCE_BACKED         DNS step 3                       Required before HTTP
                                                                                    connection

  Single-node DNS maps to    SOURCE_BACKED         "單機時代 DNS...域名翻譯成唯一的 Correct target is
  one IP                                           IP"                              HOST 01

  Browser then sends HTTP    SOURCE_BACKED         DNS step 4                       Required path edge
  request                                                                           

  Tomcat handles request     SOURCE_BACKED         Tomcat request section           Required application
                                                                                    stage

  Tomcat parses HTTP / calls SOURCE_BACKED         "解析 HTTP、呼叫對應的 Servlet"  Represented as
  Servlet                                                                           application
                                                                                    processing, not full
                                                                                    Java tutorial

  Tomcat uses a thread to    SOURCE_BACKED         "Tomcat 用執行緒處理它"          Inspectable evidence;
  handle request                                                                    teaching label only

  JDBC reads/writes local    SOURCE_BACKED         "經 JDBC 讀寫本地 MySQL"         Product request uses
  MySQL                                                                             JDBC product read

  Servlet example reads      SOURCE_BACKED         `itemDao.findById(itemId)`       Basis for concrete
  product by ID                                                                     product-page mission

  HTML returns to browser    SOURCE_BACKED         "再把 HTML 吐回去"               Final response stage

  Images live on local disk  SOURCE_BACKED         "圖片就在本地磁碟"               Product page must
                                                                                    fetch/read a local
                                                                                    image resource

  Session lives in Tomcat    SOURCE_BACKED         "Session 就在 Tomcat 記憶體裡"   Session check/update
  memory                                                                            occurs at application
                                                                                    stage

  DB/images/Session are      SOURCE_BACKED         explicitly named in source       Boundary reveal after
  three local assumptions                                                           successful trace

  Atlas                      FICTIONAL_SCENARIO    Not in source                    Clearly labelled
  customer/product/request                                                          Atlas Market fiction

  72 ms / stage timing       TEACHING_SIMULATION   Not in source                    Optional
                                                                                    deterministic lab
                                                                                    metric only

  Score / evidence points    TEACHING_SIMULATION   Not in source                    Clearly labelled lab
                                                                                    assessment

  Specific DNS cache miss in TEACHING_SIMULATION   Source supports both             Mission selects miss
  this run                                         possibilities, not this event    to expose DNS journey
  -------------------------------------------------------------------------------------------------------

## 3.1 Source-fidelity caution

The source includes more detailed DNS recursion and mentions Tomcat
thread-pool settings. M02 may expose these as evidence/context, but it
must **not turn M02 into a DNS administration mission or Tomcat tuning
mission**.

The playable causal spine remains:

``` text
browser
→ DNS resolves host address
→ browser sends HTTP request
→ Tomcat/application + Session
→ JDBC reads local MySQL
→ local product image
→ HTML/page response
```

DNS resolver infrastructure is environment context, not part of the
Atlas Market host topology the player deploys.

------------------------------------------------------------------------

# 4. Mission story

## 4.1 Fictional request

**Customer:** Mina Rao --- fictional Atlas Market shopper\
**Request:** `GET /item?id=184`\
**Product:** "Atlas Desk Lamp" --- fictional\
**Request ID:** `REQ-M02-184-A` --- simulation identifier

Opening message from fictional support character Maya:

> "Mina says she opened an Atlas Market product link. I don't want a
> guess about whether 'the server works.' Follow this one request. Tell
> me what has to happen before the page can appear."

Developer Sam adds only:

> "We know the shop is on HOST 01. Start from the browser. Prove each
> dependency."

Neither character states the complete route.

## 4.2 Narrative purpose

M01 asked:

> **What architecture should this tiny shop start with?**

M02 asks a narrower question:

> **Inside that architecture, what actually happens to one customer
> request?**

This prevents M02 from becoming a duplicate of M01.

------------------------------------------------------------------------

# 5. Starting state

M02 does **not** ask the player to redesign the architecture.

The M01 topology is given as the current system:

``` yaml
current_topology:
  owned_host:
    id: HOST_01
    os: Linux
    components:
      - TOMCAT_01
      - MYSQL_LOCAL
      - IMAGE_DISK_LOCAL
  local_runtime_state:
    - SESSION_IN_TOMCAT_MEMORY
  external:
    - CUSTOMER_BROWSER
  request_environment:
    - DNS_RESOLUTION
```

## 5.1 What is visible initially

Visible:

-   customer browser with URL/request card;
-   HOST 01 as a destination boundary;
-   evidence drawer;
-   empty **request route strip** between them;
-   objective;
-   provenance legend.

Not initially visible:

-   ordered request stages;
-   correct DNS result;
-   JDBC edge;
-   local image dependency;
-   Session placement conclusion;
-   complete causal answer;
-   later scaling technology.

## 5.2 First thing a fresh player should notice

A large request card:

> **Mina opens `/item?id=184`. How does this become a product page?**

Primary action:

> **Inspect request evidence**

The architecture itself must be visually secondary at first.

------------------------------------------------------------------------

# 6. Mission state machine

``` yaml
mission_id: M02
initial_state: BRIEFING

states:
  - BRIEFING
  - INVESTIGATING
  - ROUTE_GATE_OPEN
  - ROUTING
  - ROUTE_INVALID
  - ROUTE_READY
  - TRACE_RUNNING
  - TRACE_PAUSED_DIAGNOSIS
  - TRACE_COMPLETE
  - LOCAL_BOUNDARY_REVEAL
  - EXPLAIN
  - COMPLETE

transitions:
  BRIEFING:
    inspect_evidence: INVESTIGATING

  INVESTIGATING:
    inspect_evidence:
      if: evidence_unlock_predicate
      then: ROUTE_GATE_OPEN
      else: INVESTIGATING

  ROUTE_GATE_OPEN:
    begin_route: ROUTING

  ROUTING:
    submit_route:
      if: route_valid
      then: ROUTE_READY
      else: ROUTE_INVALID

  ROUTE_INVALID:
    repair_route: ROUTING

  ROUTE_READY:
    run_request: TRACE_RUNNING

  TRACE_RUNNING:
    advance_trace:
      if: diagnostic_checkpoint
      then: TRACE_PAUSED_DIAGNOSIS
      elif: final_step
      then: TRACE_COMPLETE
      else: TRACE_RUNNING

  TRACE_PAUSED_DIAGNOSIS:
    choose_diagnosis:
      if: diagnosis_correct
      then: TRACE_RUNNING
      else: TRACE_PAUSED_DIAGNOSIS

  TRACE_COMPLETE:
    inspect_local_boundary: LOCAL_BOUNDARY_REVEAL

  LOCAL_BOUNDARY_REVEAL:
    continue: EXPLAIN

  EXPLAIN:
    submit:
      if: explanation_complete
      then: COMPLETE
      else: EXPLAIN

  COMPLETE:
    replay: BRIEFING
```

No random branch is allowed.

------------------------------------------------------------------------

# 7. Evidence system and gate

## 7.1 Evidence items

### E01 --- Customer request

**Observation**

> Mina's browser has `https://shop.atlas.test/item?id=184`, but a domain
> name is not itself the host address.

**Interpretation after inspection**

> Something must translate the shop domain into the address the browser
> will connect to.

**Provenance:** SOURCE_BACKED technical principle + FICTIONAL_SCENARIO
URL.

------------------------------------------------------------------------

### E02 --- DNS note

**Observation**

> The browser has no cached record for `shop.atlas.test` in this lab
> run.

**Interpretation**

> A DNS lookup must complete before the browser can send the HTTP
> request to HOST 01.

**Provenance:** source supports cache hit/miss; this specific cache miss
is TEACHING_SIMULATION.

Do not expose resolver internals unless the player opens `More detail`.

Optional detail:

> Browser cache → configured DNS resolver → recursive resolution →
> returned host IP.

------------------------------------------------------------------------

### E03 --- Application entry

**Observation**

> HOST 01 exposes the shop through Tomcat. Product pages are handled by
> application logic.

**Interpretation**

> HTTP reaches the application before product data can be read.

**Provenance:** SOURCE_BACKED.

------------------------------------------------------------------------

### E04 --- Product data clue

**Observation**

> Product `184` is stored in local MySQL.

**Interpretation**

> The application needs a JDBC data-access step to retrieve the product
> record.

**Provenance:** SOURCE_BACKED mechanism + FICTIONAL_SCENARIO product ID.

------------------------------------------------------------------------

### E05 --- Page resources

**Observation**

> The product record alone is not the whole rendered page. The product
> image is a local file, and the browsing Session is kept in Tomcat
> memory.

**Interpretation**

> The request depends on application memory and local disk in addition
> to the database.

**Provenance:** SOURCE_BACKED.

Do **not** yet say "therefore scaling is hard" or prescribe any
replacement.

------------------------------------------------------------------------

## 7.2 Evidence unlock predicate

The player must inspect enough evidence to understand routing and
application/data responsibilities, without being forced to read every
card.

``` yaml
required_evidence:
  minimum_count: 3
  mandatory: [E01, E03]
  one_of: [E02, E04, E05]
  unlock_predicate: >
    inspected_count >= 3
    AND inspected(E01)
    AND inspected(E03)
    AND (inspected(E02) OR inspected(E04) OR inspected(E05))
```

Unique cards only count once.

## 7.3 What remains locked

Before the gate opens:

-   route-stage tray is locked;
-   no "correct route" preview exists;
-   no automatic arrows reveal sequence;
-   no architecture vocabulary quiz appears.

Gate copy:

> **You have enough evidence to propose a request route. You do not yet
> know whether it works.**

------------------------------------------------------------------------

# 8. Core playable mechanic --- Build the request route

## 8.1 Interaction

The player receives six causal stage cards in an unordered tray:

``` text
DNS RESOLVE
HTTP → TOMCAT
SESSION CHECK
JDBC → MYSQL
LOCAL IMAGE READ
RETURN PAGE
```

The player drags, taps, or keyboard-moves cards into six numbered route
slots.

Desktop:

``` text
CUSTOMER
   │
[ 1 ] → [ 2 ] → [ 3 ] → [ 4 ] → [ 5 ] → [ 6 ]
                                             │
                                        PRODUCT PAGE
```

Mobile: vertical numbered route.

## 8.2 Canonical route

``` yaml
canonical_route:
  - DNS_RESOLVE
  - HTTP_TOMCAT
  - SESSION_CHECK
  - JDBC_MYSQL
  - LOCAL_IMAGE_READ
  - RETURN_PAGE
```

### Teaching simplification

This is an educational causal ordering, not a claim that every
production web application must synchronously perform these exact six
operations in exactly this order.

For this source-derived Atlas Market request:

-   DNS must precede the HTTP connection;
-   Tomcat must receive/process the request before its application data
    access;
-   JDBC/MySQL supplies product data;
-   the product image is local;
-   Session is in Tomcat memory;
-   the final product page is returned.

The UI must contain a visible `LAB TRACE` label.

------------------------------------------------------------------------

# 9. Plausible wrong paths and recovery

Wrong answers must teach causality rather than punish vocabulary.

## WP01 --- HTTP before DNS

Player route:

``` text
HTTP → TOMCAT
→ DNS
→ ...
```

Result:

> **Route cannot start.** The browser has a domain name but, in this lab
> run, no cached address for HOST 01.

Unlocked evidence reference:

> Recheck E01/E02.

Do not display the entire correct route.

Recovery:

-   offending first two cards remain highlighted;
-   player can swap them;
-   no score reset;
-   one `route_repair` is recorded.

------------------------------------------------------------------------

## WP02 --- Browser directly queries MySQL

Player route places JDBC/MySQL before Tomcat.

Result:

> **Application path missing.** The source request is handled by Tomcat;
> JDBC is the application's path to local MySQL, not the browser's
> direct data connection.

Recovery hint:

> Which component receives the customer's HTTP request?

This is a meaningful architecture misconception.

------------------------------------------------------------------------

## WP03 --- Return page before local image read

Result:

> **Incomplete page path.** Product data exists, but this Atlas Market
> page also expects its local product image.

This branch may be classified `PARTIAL_ROUTE`, not "nonsense".

Recovery:

> Inspect the page-resource evidence if you have not already.

------------------------------------------------------------------------

## WP04 --- Omit Session

Result:

> **Local state assumption missing.** The page can retrieve product
> data, but your trace does not account for the browsing Session that
> this source architecture keeps in Tomcat memory.

The mission does not teach how to externalise Session.

------------------------------------------------------------------------

# 10. Deterministic live request

Once the route validates, the player presses:

> **Run REQ-M02-184-A**

## 10.1 Trace steps

``` yaml
trace:
  - id: R01
    label: DNS lookup
    target: DNS_ENVIRONMENT
    result: shop_domain_resolves_to_HOST_01
    provenance: SOURCE_BACKED_PLUS_SIMULATED_CACHE_MISS

  - id: R02
    label: HTTP reaches Tomcat
    target: TOMCAT_01
    result: request_accepted
    provenance: SOURCE_BACKED

  - id: R03
    label: Session check
    target: TOMCAT_MEMORY
    result: browsing_session_available
    provenance: SOURCE_BACKED_PLACEMENT_SIMULATED_REQUEST_STATE

  - id: R04
    label: JDBC product read
    target: MYSQL_LOCAL
    result: product_184_returned
    provenance: SOURCE_BACKED_MECHANISM_FICTIONAL_RECORD

  - id: R05
    label: Local image read
    target: IMAGE_DISK_LOCAL
    result: atlas_desk_lamp_image_returned
    provenance: SOURCE_BACKED_PLACEMENT_FICTIONAL_FILE

  - id: R06
    label: Product page response
    target: CUSTOMER_BROWSER
    result: page_complete
    provenance: SOURCE_BACKED_RESPONSE_FICTIONAL_PAGE
```

## 10.2 Optional simulation timings

If timing chips are used:

``` yaml
lab_timings_ms:
  R01: 18
  R02: 9
  R03: 2
  R04: 21
  R05: 14
  R06: 8
  total: 72
```

These values are **TEACHING_SIMULATION ONLY**.

They must never be labelled historical, measured, benchmark, production,
or source values.

M02 does not teach performance optimisation from these numbers.

------------------------------------------------------------------------

# 11. Mid-trace diagnostic checkpoint

To prevent the trace from becoming a "Next, Next, Next" slideshow, the
request pauses after R02.

Message:

> **Tomcat has the request. The product title is not in the HTTP request
> itself. Where should the application obtain product 184?**

Choices:

A. Ask DNS for the product record\
B. Read local MySQL through JDBC\
C. Read the product image file as the database record

Correct: **B**

### Wrong A feedback

> DNS answered "where is the host?" Its job in this trace is not "what
> product is item 184?"

### Wrong C feedback

> The image file is a page resource, not the product database record.

The trace cannot continue until B is selected.

This checkpoint is deterministic and scored.

It does not reveal the remaining route beyond the immediate dependency.

------------------------------------------------------------------------

# 12. Meaningful boundary reveal

After R06 succeeds, the game does **not** immediately announce a later
scaling solution.

Instead, the player gets a "dependency lens".

Prompt:

> **The page worked. Now mark which successful steps depended on
> resources local to HOST 01.**

Player selects from:

-   DNS resolution
-   Tomcat application
-   Session
-   MySQL
-   product image
-   customer's browser

Correct local dependencies:

``` text
Tomcat application
Session
MySQL
product image
```

DNS environment and customer browser are external.

## 12.1 Reveal

After submission:

> **This request succeeded because several responsibilities are
> conveniently local. The same trace exposes three important local
> assumptions: database, image files, and Session state.**

This is source-backed.

The mission may additionally say:

> "Tomcat itself is also on HOST 01."

But M02 must **not** teach how to break these assumptions yet.

## 12.2 Constraint learned

The meaningful boundary is:

> A successful page request is not "browser → database." It crosses
> distinct responsibilities, and several of those responsibilities
> currently depend on one host's local resources.

This is the mission's discovery.

------------------------------------------------------------------------

# 13. Causal explanation builder

The explanation is structured and scored. Optional free text comes
afterward.

## 13.1 Required causal chain

Player assembles/selects:

### START

`The browser has a shop domain`

### THEREFORE

`DNS resolves the address before HTTP`

### THEN

`Tomcat receives and processes the HTTP request`

### DATA

`Application logic uses JDBC to read local MySQL`

### LOCAL STATE

At least **two of three**:

-   `Session lives in Tomcat memory`
-   `product image lives on local disk`
-   `database is local to the host`

### RESULT

`the product page can return to the browser`

### BOUNDARY

`this successful request depends on multiple responsibilities, several local to HOST 01`

## 13.2 Required submission predicate

``` yaml
explanation_required:
  mandatory:
    - DOMAIN_NEEDS_DNS
    - DNS_BEFORE_HTTP
    - HTTP_TO_TOMCAT
    - JDBC_TO_LOCAL_MYSQL
    - PAGE_RETURNS_TO_BROWSER
    - LOCAL_DEPENDENCY_BOUNDARY
  local_assumptions:
    minimum_count: 2
    allowed:
      - SESSION_IN_TOMCAT_MEMORY
      - IMAGE_ON_LOCAL_DISK
      - DATABASE_LOCAL
  unlock_predicate: >
    all_mandatory_selected
    AND local_assumption_count >= 2
    AND diagnostic_checkpoint_correct
    AND trace_complete
```

## 13.3 Optional reflection

After the deterministic score:

> "Which step surprised you most, and why?"

``` yaml
reflection:
  required: false
  scored: false
  visible_after_score: true
```

No LLM judgement is required for mission completion.

------------------------------------------------------------------------

# 14. Scoring

Total: **100 points**

  -------------------------------------------------------------------------------
  Category                                       Max Rule
  --------------------- ---------------------------- ----------------------------
  Investigation                                   15 15 for gate with 3 unique
                                                     cards; 12 for 4; no penalty
                                                     below required because route
                                                     remains locked

  Route causality                                 30 30 first valid route; 24
                                                     after 1 repair; 18 after 2;
                                                     12 after 3+

  Diagnostic reasoning                            20 20 correct first attempt; 14
                                                     second; 8 after two wrong
                                                     attempts

  Local-boundary                                  15 15 identifies all four local
  understanding                                      HOST 01 dependencies; 12
                                                     identifies three
                                                     incl. Session/MySQL/image; 8
                                                     identifies two

  Causal explanation                              20 20 all mandatory + ≥2 local
                                                     assumptions; partial score
                                                     available before final
                                                     completion only
  -------------------------------------------------------------------------------

## 14.1 Completion rule

Mission completion requires understanding, not a perfect score.

``` yaml
mission_complete_if:
  route_validated: true
  trace_complete: true
  diagnostic_checkpoint_correct: true
  local_boundary_submitted: true
  explanation_unlock_predicate: true
```

Minimum completion score is not used as a gate.

A player can complete after mistakes and receive recoverable partial
credit.

## 14.2 Perfect-score rule

100/100 requires:

-   exactly three evidence cards inspected before route unlock;
-   correct route first submission;
-   diagnostic checkpoint first attempt;
-   all four local HOST 01 dependencies correctly identified;
-   complete structured causal explanation.

Optional reflection does not affect score.

------------------------------------------------------------------------

# 15. Success and failure states

## 15.1 Success

`COMPLETE`

Visible:

> **REQ-M02-184-A completed**

> Domain → DNS → HTTP/Tomcat → application state → JDBC/MySQL + local
> image → product page.

Then:

> **Boundary identified:** the request spans several responsibilities,
> and database/image/Session assumptions are local to HOST 01.

Do not call the next solution.

## 15.2 Recoverable failure states

### `ROUTE_INVALID`

Route ordering/dependency incorrect.

No game-over.

### `TRACE_DIAGNOSIS_WRONG`

Trace pauses; feedback explains only the local misconception.

### `BOUNDARY_INCOMPLETE`

Player missed local dependencies.

Feedback:

> "You found some local resources. Reopen the successful trace and
> inspect where each stage actually ran."

### `EXPLANATION_INCOMPLETE`

Missing causal concept is highlighted by category, not answered
automatically.

Example:

> "Your explanation gets the request into Tomcat, but it does not yet
> explain how product data reaches the application."

------------------------------------------------------------------------

# 16. Screen-by-screen storyboard

# Screen S01 --- Mission briefing

**Objective:** Establish one concrete request and distinguish source
from fiction/simulation.

### Desktop

Left:

-   M02 title
-   customer request card
-   objective

Centre:

-   browser
-   blank route strip
-   HOST 01 silhouette

Right:

-   provenance legend
-   evidence drawer collapsed

### Mobile

Order:

1.  title/objective
2.  request card
3.  provenance legend
4.  browser → blank route
5.  Inspect Evidence button

### Controls

-   `Inspect evidence`
-   source-boundary disclosure
-   Exit lab

### First notice

`REQ-M02-184-A — Mina opens /item?id=184`

### Empty state

> "No request route proposed."

### Keyboard/touch

Primary button is first mission control after navigation.

### Reduced motion

No auto-moving request packet.

------------------------------------------------------------------------

# Screen S02 --- Evidence investigation

**Objective:** Gather enough clues to propose the route.

Visible:

-   E01--E05 cards
-   inspected state
-   gate indicator

Gate indicator must say requirements, not answer:

> `Need ≥3 unique evidence cards · E01 + E03 required`

### Error state

None; evidence can be inspected in any order.

### Accessibility

Cards are buttons with `aria-pressed`.

------------------------------------------------------------------------

# Screen S03 --- Route builder

**Objective:** Make the player commit to a causal sequence.

Visible:

-   unordered stage tray
-   six numbered slots
-   browser start
-   product-page end

### Controls

Desktop:

-   drag/drop supported if desired;
-   every drag operation must also have click/keyboard equivalent.

Keyboard:

-   focus stage;
-   `Enter` selects;
-   arrow/number slot selection;
-   `Enter` places;
-   `Delete/Backspace` returns card to tray.

Touch:

-   tap stage → tap slot.

### Error state

`Route incomplete: 4/6 stages placed`

No automatic answer.

------------------------------------------------------------------------

# Screen S04 --- Route validation / repair

**Objective:** Give local causal feedback.

On wrong route:

-   only relevant cards/edge highlighted;
-   feedback from WP01--WP04;
-   `Repair route`.

No score shown yet.

### Reduced motion

Highlight/pulse becomes static border/icon under reduced motion.

------------------------------------------------------------------------

# Screen S05 --- Live request trace

**Objective:** Execute the player's validated route.

Visible:

-   route;
-   current stage;
-   target;
-   evidence/provenance chip;
-   `Advance request`.

Do not auto-run.

### Diagnostic pause

After HTTP/Tomcat:

> "Where does product 184 come from?"

Player must answer.

------------------------------------------------------------------------

# Screen S06 --- Successful page + dependency lens

**Objective:** Turn success into architecture understanding.

Top:

-   fictional rendered product card;
-   `REQUEST COMPLETE`.

Below:

> "Which successful stages depended on HOST 01?"

Selectable dependency chips.

No future solution.

------------------------------------------------------------------------

# Screen S07 --- Causal explanation

**Objective:** Explain request causality and local assumptions.

Desktop:

horizontal causal chain where space permits.

Mobile:

vertical:

``` text
DOMAIN
↓
DNS
↓
HTTP / TOMCAT
↓
JDBC / MYSQL
↓
LOCAL STATE
↓
PAGE
↓
BOUNDARY
```

Required concepts visibly grouped, but correct selections not prefilled.

------------------------------------------------------------------------

# Screen S08 --- Result

**Objective:** Consolidate learning.

Visible:

-   score by category;
-   request path summary;
-   source/simulation badges;
-   boundary statement;
-   optional reflection;
-   Replay M02.

Do not display an M03 button in this artifact.

------------------------------------------------------------------------

# 17. Misconceptions deliberately challenged

1.  **"Typing a URL immediately contacts Tomcat."**\
    DNS/address resolution precedes the HTTP connection in the modeled
    cache-miss request.

2.  **"DNS serves the webpage."**\
    DNS resolves the address; Tomcat serves/processes HTTP.

3.  **"The browser talks directly to MySQL."**\
    Application logic accesses MySQL through JDBC.

4.  **"A product page is just one database read."**\
    In this modeled page it also uses application state and a local
    image.

5.  **"Session is automatically a database record."**\
    In this source architecture, Session is in Tomcat memory.

6.  **"If the request succeeds, the architecture has no important
    constraints."**\
    Successful execution itself exposes local assumptions.

7.  **"Every box in a diagram is a server we own."**\
    DNS environment and browser are outside the Atlas host topology.

------------------------------------------------------------------------

# 18. Non-goals / do_not_teach_yet

M02 must not recommend, implement, configure, or tutorialise:

``` yaml
do_not_teach_yet:
  - Redis
  - shared/external Session stores
  - load balancers
  - reverse-proxy scaling patterns
  - Kubernetes
  - containers as a scaling answer
  - microservices
  - service discovery
  - queues
  - Kafka
  - AMQP
  - database sharding
  - database replicas
  - database separation/migration as a solution
  - CDN
  - object storage migration
  - distributed file systems
  - cache clusters
  - DNS round-robin
  - geographic routing
  - autoscaling
  - horizontal scaling
  - Dubbo
  - Spring architecture migration
```

The source mentions some later technologies or future evolution. Their
presence in provenance/developer notes does not make them M02 teaching
content.

M02 also does not teach:

-   detailed recursive DNS administration;
-   Tomcat connector tuning;
-   Java coding;
-   SQL syntax;
-   transaction design;
-   network packet analysis.

------------------------------------------------------------------------

# 19. Runtime future-solution boundary

Player-facing completion must stop at:

> **The request works, and now you can see exactly which
> responsibilities it crossed and which resources are local to HOST
> 01.**

Allowed:

-   "local assumption"
-   "one host"
-   "Session in memory"
-   "local database"
-   "local image"
-   "shared/local dependency"

Forbidden recommendation semantics:

``` text
you should / next add / move to / deploy / introduce / replace with
+
Redis / load balancer / Kubernetes / microservices / queue /
replica / sharding / CDN / distributed storage / separate database
```

------------------------------------------------------------------------

# 20. Implementation handoff

This is a data contract proposal, not code.

``` yaml
mission:
  id: M02
  slug: follow-one-request
  title: Follow One Request
  source:
    repo: ccc115a/se
    path: _more/mybook/向淘寶學習網站架構演進/1.1.md
    blob_sha: 9ddbabbd0fe6693b7c8c60479f0c2f37803233fd

  prerequisite_context:
    topology_source: M01
    topology_mutation_allowed: false

  scenario:
    company: Atlas Market
    fictional: true
    customer: Mina Rao
    product_id: 184
    product_name: Atlas Desk Lamp
    request_id: REQ-M02-184-A

  evidence:
    ids: [E01, E02, E03, E04, E05]
    required:
      minimum_count: 3
      mandatory: [E01, E03]
      one_of: [E02, E04, E05]
      unlock_predicate: >
        inspected_count >= 3
        AND inspected(E01)
        AND inspected(E03)
        AND (inspected(E02) OR inspected(E04) OR inspected(E05))

  route:
    slots: 6
    canonical:
      - DNS_RESOLVE
      - HTTP_TOMCAT
      - SESSION_CHECK
      - JDBC_MYSQL
      - LOCAL_IMAGE_READ
      - RETURN_PAGE
    validation: deterministic
    auto_reveal_correct_route: false

  trace:
    ids: [R01, R02, R03, R04, R05, R06]
    manual_advance: true
    diagnostic_pause_after: R02

  diagnostic:
    id: D01_PRODUCT_SOURCE
    correct: JDBC_LOCAL_MYSQL
    retry_allowed: true

  boundary:
    local_host_dependencies:
      - TOMCAT_APPLICATION
      - SESSION_IN_TOMCAT_MEMORY
      - MYSQL_LOCAL
      - IMAGE_DISK_LOCAL
    external:
      - CUSTOMER_BROWSER
      - DNS_ENVIRONMENT

  explanation:
    mandatory:
      - DOMAIN_NEEDS_DNS
      - DNS_BEFORE_HTTP
      - HTTP_TO_TOMCAT
      - JDBC_TO_LOCAL_MYSQL
      - PAGE_RETURNS_TO_BROWSER
      - LOCAL_DEPENDENCY_BOUNDARY
    local_assumption_minimum: 2
    local_assumption_options:
      - SESSION_IN_TOMCAT_MEMORY
      - IMAGE_ON_LOCAL_DISK
      - DATABASE_LOCAL
    free_text:
      required: false
      scored: false

  scoring:
    investigation: 15
    route_causality: 30
    diagnostic_reasoning: 20
    local_boundary: 15
    causal_explanation: 20
    total: 100

  replay:
    reset:
      - inspected_evidence
      - route_slots
      - route_repairs
      - trace_index
      - diagnostic_attempts
      - boundary_selection
      - explanation_selection
      - score
      - reflection
    preserve:
      - source_reference

  future_solution_recommendation_allowed: false
```

------------------------------------------------------------------------

# 21. Determinism rules

Given the same player actions:

-   evidence gate always opens identically;
-   stage validation always returns the same result;
-   diagnostic answers always return the same feedback;
-   trace always has the same six stages;
-   lab timings, if rendered, are fixed;
-   dependency-lens truth set is fixed;
-   scoring is pure/deterministic;
-   replay resets all mission progress;
-   no network request is required to calculate mission correctness;
-   no LLM is required for grading.

------------------------------------------------------------------------

# 22. Acceptance tests

## M02-T001 --- Fresh-player first action

**Given:** clean M02 state.

**Acceptance:**

-   within 10 seconds, a fresh player can identify the concrete customer
    request;
-   objective says the player will follow/prove one request;
-   no complete route is visible;
-   source/fiction/simulation boundary is visible;
-   primary action leads to evidence.

**Capture:** `M02-T001-fresh-player.png`

------------------------------------------------------------------------

## M02-T002 --- Existing topology, empty route

**Acceptance:**

-   HOST 01 context may be visible;
-   route slots are empty;
-   player is not asked to rebuild M01;
-   DNS is not rendered inside HOST 01.

**Capture:** `M02-T002-empty-route.png`

------------------------------------------------------------------------

## M02-T003 --- Evidence provenance

**Acceptance:**

-   each evidence item has provenance;
-   fictional product/request is not labelled source history;
-   simulated DNS cache miss is explicitly lab-selected;
-   no simulation timing is presented as source measurement.

------------------------------------------------------------------------

## M02-T004 --- Evidence gate false cases

Must remain locked for:

``` text
E01
E01 + E03
E02 + E03 + E04
E01 + E02 + E05
```

because each fails count and/or mandatory requirements.

------------------------------------------------------------------------

## M02-T005 --- Evidence gate true cases

Must unlock for:

``` text
E01 + E03 + E02
E01 + E03 + E04
E01 + E03 + E05
E01 + E02 + E03 + E05
```

Duplicates do not increase count.

------------------------------------------------------------------------

## M02-T006 --- No answer reveal before route attempt

**Acceptance:**

-   evidence does not display the complete ordered six-stage route;
-   route tray is unordered;
-   no "correct path" ghost arrows appear.

------------------------------------------------------------------------

## M02-T007 --- Canonical route validation

Route:

``` text
DNS → HTTP/Tomcat → Session → JDBC/MySQL → local image → return page
```

returns `ROUTE_READY`.

------------------------------------------------------------------------

## M02-T008 --- HTTP-before-DNS recovery

**Acceptance:**

-   route rejected locally;
-   feedback explains unresolved address in this lab cache-miss case;
-   full answer is not revealed;
-   repair preserves evidence;
-   repair counter increments exactly once.

------------------------------------------------------------------------

## M02-T009 --- Browser-direct-to-MySQL recovery

**Acceptance:**

-   route rejected;
-   feedback distinguishes HTTP application path from JDBC data access;
-   no database-scaling lesson appears.

------------------------------------------------------------------------

## M02-T010 --- Missing image/session recovery

**Acceptance:**

-   omission produces incomplete/local-state feedback;
-   player can inspect E05 and repair;
-   no external Session/image solution is recommended.

------------------------------------------------------------------------

## M02-T011 --- Trace cannot run before valid route

**Acceptance:**

-   Run action disabled/absent until `ROUTE_READY`.

------------------------------------------------------------------------

## M02-T012 --- Deterministic six-step trace

**Acceptance:**

Exact sequence:

``` text
R01 DNS
R02 HTTP/Tomcat
R03 Session
R04 JDBC/MySQL
R05 local image
R06 response
```

Replay with identical actions produces identical sequence/results.

------------------------------------------------------------------------

## M02-T013 --- Diagnostic pause

**Acceptance:**

-   trace pauses after R02;
-   player must identify JDBC/local MySQL as product-data source;
-   trace cannot advance past checkpoint without correct diagnosis.

------------------------------------------------------------------------

## M02-T014 --- Diagnostic wrong DNS answer

**Acceptance:**

-   feedback says DNS locates the host, not the product record;
-   no whole-route answer reveal;
-   second attempt allowed.

------------------------------------------------------------------------

## M02-T015 --- Local dependency lens

Correct set:

``` text
Tomcat application
Session
MySQL
product image
```

External:

``` text
browser
DNS environment
```

All must score deterministically.

------------------------------------------------------------------------

## M02-T016 --- Boundary reveal sequencing

**Acceptance:**

-   "three local assumptions" conclusion is not fully revealed before
    successful request;
-   explicit local-boundary reveal occurs after trace;
-   no later solution is prescribed.

------------------------------------------------------------------------

## M02-T017 --- Explanation gate

Submission cannot complete without:

-   domain/DNS concept;
-   DNS-before-HTTP;
-   HTTP/Tomcat;
-   JDBC/local MySQL;
-   response to browser;
-   local-dependency boundary;
-   at least two allowed local assumptions;
-   completed trace;
-   correct diagnostic checkpoint.

------------------------------------------------------------------------

## M02-T018 --- Scoring perfect path

Perfect deterministic run yields exactly:

``` text
Investigation       15
Route causality     30
Diagnostic          20
Local boundary      15
Causal explanation  20
TOTAL               100
```

------------------------------------------------------------------------

## M02-T019 --- Partial-credit recovery

**Acceptance:**

-   one repaired route cannot score 30 route points;
-   player can still complete;
-   feedback identifies what improved;
-   no "game over".

------------------------------------------------------------------------

## M02-T020 --- Replay/reset

After Replay:

-   evidence uninspected;
-   route empty;
-   counters zero;
-   trace not started;
-   diagnostic unanswered;
-   boundary empty;
-   explanation empty;
-   score reset;
-   reflection reset.

Source reference remains.

------------------------------------------------------------------------

## M02-T021 --- Runtime future-solution boundary

Inspect player-facing M02 runtime message registry only.

Expected:

``` yaml
forbidden_future_solution_recommendations: 0
completion_stops_at_local_dependency_boundary: true
M03_content_present: false
```

Do not grep developer/source documentation.

------------------------------------------------------------------------

## M02-T022 --- Keyboard-only completion

Player must complete M02 using keyboard only.

Verify:

-   evidence cards focusable;
-   route cards placeable/reorderable without drag;
-   validation accessible;
-   trace advance accessible;
-   diagnostic choices accessible;
-   dependency chips accessible;
-   explanation builder accessible;
-   Replay accessible;
-   visible focus;
-   no keyboard trap.

**Capture:** `M02-T022-keyboard.mp4`

------------------------------------------------------------------------

## M02-T023 --- 390 px mobile completion

At 390 CSS px:

-   no critical horizontal overflow;
-   route builder becomes vertical or otherwise fully comprehensible;
-   stage cards are tappable;
-   no hover dependency;
-   diagnostic modal/panel fits;
-   dependency lens fits;
-   explanation builder fits;
-   score/replay reachable;
-   touch targets meet the mission's accessibility target.

**Captures:**

``` text
M02-T023-mobile-brief.png
M02-T023-mobile-route.png
M02-T023-mobile-trace.png
M02-T023-mobile-boundary.png
M02-T023-mobile-explain.png
M02-T023-mobile-complete.png
```

------------------------------------------------------------------------

## M02-T024 --- Reduced-motion completion

With `prefers-reduced-motion: reduce`:

-   request packet does not need to animate;
-   stage changes remain visible via text/border/state;
-   pulses/transforms are removed or nonessential;
-   all information and scoring are identical.

**Capture:** `M02-T024-reduced-motion.mp4`

------------------------------------------------------------------------

## M02-T025 --- Screen-reader semantics

Verify:

-   route has an accessible ordered representation;
-   active trace stage announced without flooding;
-   stage buttons expose selected/placed state;
-   provenance badges have readable text;
-   diagnostic feedback is announced;
-   score labels are not conveyed by colour alone.

------------------------------------------------------------------------

## M02-T026 --- Source/simulation terminology

Runtime must not claim:

-   lab timings are historical Taobao measurements;
-   Mina/product 184 are historical;
-   Atlas Market is Taobao;
-   every web architecture universally follows the exact six-slot
    teaching trace.

------------------------------------------------------------------------

# 23. Suggested implementation evidence package

After implementation capture:

``` text
M02-qa-desktop-full.mp4
M02-T001-fresh-player.png
M02-T002-empty-route.png
M02-T008-dns-repair.png
M02-T009-browser-mysql-repair.png
M02-T013-diagnostic-pause.png
M02-T015-local-dependency.png
M02-T018-score-100.png
M02-T020-replay.mp4
M02-T022-keyboard.mp4
M02-T023-mobile-*.png
M02-T024-reduced-motion.mp4
M02-runtime-boundary-check.txt
```

------------------------------------------------------------------------

# 24. Implementation review checklist

A future independent reviewer should ask:

1.  Did the player actually build/commit to a route, or was it already
    drawn?
2.  Can a plausible misconception produce technically meaningful
    feedback?
3.  Does the trace execute the player's validated reasoning rather than
    merely animate a predetermined dashboard?
4.  Is DNS clearly environment/request routing rather than an
    Atlas-owned host component?
5.  Is JDBC shown as application-to-database access rather than
    browser-to-database?
6.  Are local Session/image/database assumptions source-faithful?
7.  Does success expose a constraint without prescribing a future
    technology?
8.  Can the player explain the causal chain rather than merely identify
    vocabulary?
9.  Is scoring deterministic?
10. Can the mission be completed on keyboard, touch/mobile, and reduced
    motion?
11. Are source-backed, fictional, and simulation values visibly
    distinct?

------------------------------------------------------------------------

# 25. Open questions

**None requiring human approval before implementation.**

The source and mission contract settle the key design choices:

-   M02 follows one product-page request;
-   the DNS run uses a simulated cache miss so the source-backed DNS
    journey is observable;
-   the existing M01 single-host topology is context, not a new
    architecture choice;
-   the player builds the request route;
-   wrong paths are recoverable;
-   local assumptions are discovered after successful execution;
-   structured explanation is scored;
-   free-text reflection is optional/unscored;
-   later scaling solutions remain outside M02.

------------------------------------------------------------------------

# 26. Change log

## v1

-   Created M02 as a playable request-tracing mission grounded only in
    source section 1.1.
-   Reused M01's established topology without reopening M01 architecture
    selection.
-   Added a deterministic evidence gate and six-stage route builder.
-   Added meaningful recoverable wrong paths for DNS ordering,
    browser-to-DB confusion, image omission, and Session omission.
-   Added a mid-trace product-data diagnostic to prevent passive "Next"
    gameplay.
-   Added a post-success local-dependency lens exposing the source's
    local assumptions without teaching later solutions.
-   Added a deterministic causal explanation builder and 100-point
    scoring model.
-   Added source/fiction/simulation provenance rules.
-   Added M02-T001--M02-T026 acceptance tests including replay,
    keyboard, 390 px mobile, reduced motion, screen-reader semantics,
    and runtime future-solution boundary.
-   No M03+ mission content or application code added.
