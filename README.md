# SkiTesting

SkiTesting is a React-based application for structured cross-country ski testing, equipment management, historical comparison, and setup recommendations.

The goal of the project is to make ski testing more systematic and useful over time. Instead of relying on handwritten notes or remembering which ski, grind, rill, glide wax, or topping performed best under certain conditions, SkiTesting stores test sessions in a structured format and uses previous results to support future setup decisions.

The application currently runs entirely in the browser and stores data in `localStorage`. It is therefore still a local prototype, but the architecture is being developed with future database storage and more advanced analysis in mind.

---

# Table of contents

- [Project goal](#project-goal)
- [Current status](#current-status)
- [Main features](#main-features)
- [Application structure](#application-structure)
- [Pages and routes](#pages-and-routes)
- [Test workflow](#test-workflow)
- [Tournament system](#tournament-system)
- [Equipment catalogue](#equipment-catalogue)
- [Conditions](#conditions)
- [Historical analysis](#historical-analysis)
- [Recommendation system](#recommendation-system)
- [Condition similarity](#condition-similarity)
- [Historical setup score](#historical-setup-score)
- [Equipment and condition matching](#equipment-and-condition-matching)
- [Combined recommendation score](#combined-recommendation-score)
- [Data model](#data-model)
- [Data integrity](#data-integrity)
- [Backward compatibility](#backward-compatibility)
- [Persistence](#persistence)
- [Technology](#technology)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Development](#development)
- [Resetting local data](#resetting-local-data)
- [Known limitations](#known-limitations)
- [Planned development](#planned-development)
- [Long-term vision](#long-term-vision)

---

# Project goal

Ski testing is highly dependent on conditions.

A ski setup that performs well in dry new snow at -10 °C may perform very differently in transformed snow, artificial snow, wet conditions, or temperatures close to freezing.

Several variables can affect the result:

- ski
- base grind / structure
- hand rill
- glide wax
- topping
- air temperature
- snow temperature
- humidity
- snow type
- snow condition
- weather
- test method
- relative glide
- subjective feeling

The goal of SkiTesting is to connect these variables in one structured system.

Over time, the application should be able to answer questions such as:

> Which setup has performed best in conditions similar to today?

> Which glide waxes in my equipment catalogue are appropriate for the current snow temperature?

> Does a setup perform well historically even if it is outside the manufacturer's recommended range?

> Which grind and rill combinations have performed best in new snow?

> How confident should I be in a recommendation based on the amount of available test data?

The long-term objective is therefore not simply to log ski tests, but to create a personal data-driven ski setup recommendation system.

---

# Current status

The project is currently a frontend prototype.

Implemented functionality includes:

- creating ski test sessions
- editing test sessions
- deleting test sessions
- registering test conditions
- adding multiple skis to a session
- assigning equipment setups to skis
- automatic ski numbering
- head-to-head ski comparisons
- calculated comparison scores
- manual winner override
- elimination tournament logic
- automatic progression to the next duel
- handling odd numbers of skis with tournament byes
- completing test sessions
- reopening completed sessions
- historical session overview
- historical session detail pages
- equipment catalogue
- equipment editing and deletion
- temperature ranges for glide wax and topping
- snow-type profiles for grind and rill
- snow-condition profiles for grind and rill
- similarity scoring between current and historical conditions
- historical setup ranking
- temperature compatibility analysis
- snow-profile compatibility analysis
- combined setup recommendation scoring
- local persistence using `localStorage`

The project does **not yet** use a backend or database.

---

# Main features

## 1. Test sessions

A test session represents one ski test carried out under a specific set of conditions.

Each session can contain:

- title
- date
- time
- location
- environmental conditions
- skis
- ski setups
- comparisons
- tournament progression
- final winner
- active/completed status

Sessions are either:

```text
active
```

or:

```text
completed
```

Only completed sessions are currently used as historical evidence in the analysis system.

---

# Application structure

The main navigation currently consists of:

```text
Testøkter
Historikk
Analyse
Utstyr
```

The application uses React Router and separates overview pages from detailed test-session pages.

---

# Pages and routes

## `/testokter`

Overview of active test sessions.

From here the user can:

- create a new session
- see active sessions
- see test progress
- open a session
- continue testing

---

## `/testokter/:sessionId`

Detailed view for an active test session.

This is where the actual ski testing happens.

The page contains:

- session conditions
- editing controls
- registered skis
- ski setup information
- ski editing
- tournament progress
- next comparison
- completed comparisons
- final winner

---

## `/historikk`

Overview of completed test sessions.

Features include:

- historical session cards
- search
- sorting
- winner overview
- reopening sessions

---

## `/historikk/:sessionId`

Read-only historical detail page.

This page displays:

- session information
- test conditions
- all skis
- ski setups
- comparisons
- winner
- historical test data

---

## `/analyse`

Analysis and recommendation page.

The user enters today's conditions and the application compares them against completed test sessions.

The page currently provides:

- matching historical sessions
- condition similarity
- suitable glide waxes
- suitable toppings
- historical setup rankings
- temperature compatibility
- snow-profile compatibility
- data confidence
- combined recommendation scores

---

## `/utstyr`

Equipment catalogue.

The catalogue currently supports four equipment categories:

```text
Slip / grind
Rill
Glider
Topping
```

Equipment created here can be selected directly when a ski is added to a test session.

---

# Test workflow

A typical test workflow looks like this:

```text
Create test session
        ↓
Register conditions
        ↓
Add skis
        ↓
Select setup for each ski
        ↓
Start comparisons
        ↓
Ski A vs Ski B
        ↓
Register glide difference
        ↓
Register subjective feeling
        ↓
Automatic score
        ↓
Winner
        ↓
Next duel
        ↓
Final winner
        ↓
Complete session
        ↓
Session becomes historical data
        ↓
Used by Analyse
```

---

# Tournament system

SkiTesting currently uses an elimination tournament.

For `n` skis, a completed tournament normally requires:

```text
n - 1 comparisons
```

For example:

```text
4 skis
↓
3 total comparisons
```

or:

```text
8 skis
↓
7 total comparisons
```

The system automatically determines the next pair.

Example:

```text
Round 1

Ski 1 ─┐
       ├─ Winner A ─┐
Ski 2 ─┘            │
                    ├─ Final winner
Ski 3 ─┐            │
       ├─ Winner B ─┘
Ski 4 ─┘
```

If a round contains an odd number of participants, one ski automatically receives a bye and progresses to the next round.

Tournament logic is located in:

```text
src/utils/tournament.js
```

---

# Comparison scoring

Each comparison can contain both objective and subjective information.

Current comparison data includes:

- ski A
- ski B
- glide leader
- glide difference in centimetres
- feeling score for ski A
- feeling score for ski B
- calculated score
- automatic winner
- selected winner
- winner override
- tournament round

The current scoring model converts subjective feeling into an equivalent distance score.

Current constant:

```js
FEELING_CM_PER_POINT = 10
```

This means one point difference in subjective feeling corresponds to approximately:

```text
10 cm
```

in the calculated comparison score.

A small threshold is used to prevent extremely close calculations from automatically selecting a winner.

Current threshold:

```js
CLOSE_SCORE_THRESHOLD_CM = 5
```

If the calculated difference is inside this threshold, the comparison is treated as too close for an automatic winner.

The scoring logic is located in:

```text
src/utils/comparisonScoring.js
```

These values are currently application assumptions and may be adjusted later based on real testing experience.

---

# Equipment catalogue

The equipment catalogue is separate from individual test sessions.

This allows equipment to be registered once and reused across many tests.

An equipment item currently contains information such as:

```js
{
  id,
  type,
  name,
  brand,
  minTemperature,
  maxTemperature,
  snowTypes,
  snowConditions,
  notes
}
```

Not every field is relevant to every equipment type.

---

## Grind / structure

A grind can currently contain:

- name
- manufacturer
- suitable snow types
- suitable snow conditions
- notes

Example:

```text
Name:
S1

Suitable snow types:
✓ New snow
✓ Transformed snow

Suitable conditions:
✓ Dry
```

The exact names used in the UI are currently Norwegian.

---

## Rill

A rill can contain:

- name
- manufacturer
- suitable snow types
- suitable snow conditions
- notes

Example:

```text
1 mm straight

Snow types:
✓ Transformed snow
✓ Artificial snow

Conditions:
✓ Moist
✓ Wet
```

---

## Glide wax

A glide wax can currently contain:

- manufacturer
- product name
- minimum recommended temperature
- maximum recommended temperature
- notes

Example:

```text
Product:
TS5

Manufacturer:
Swix

Temperature:
-10 °C to -4 °C
```

---

## Topping

A topping uses the same temperature-range model as glide wax.

Example:

```text
Manufacturer:
Example manufacturer

Product:
Example topping

Temperature:
-8 °C to -2 °C
```

Actual commercial product data is not bundled into the project yet.

The catalogue currently contains only data entered by the user.

---

# Conditions

Test sessions support the following environmental variables.

## Numeric conditions

```text
Air temperature
Snow temperature
Humidity
```

## Categorised conditions

### Snow type

Current options:

```text
Nysnø
Omdannet snø
Kunstsnø
Blandet snø
```

### Snow condition

Current options:

```text
Tørr
Fuktig
Våt
Hard / isete
```

### Weather

Current options:

```text
Klart
Delvis skyet
Overskyet
Snøvær
Regn / sludd
```

The shared condition definitions are located in:

```text
src/config/conditionOptions.js
```

Using shared predefined values prevents differences such as:

```text
"new snow"
"Nysnø"
"new-snow"
"fresh snow"
```

from accidentally being treated as different conditions.

---

# Historical analysis

The analysis page uses completed sessions only.

An active test is intentionally excluded because its tournament and results may still change.

The analysis process currently follows approximately:

```text
Today's conditions
        ↓
Compare against historical sessions
        ↓
Calculate condition similarity
        ↓
Keep sufficiently similar sessions
        ↓
Extract ski comparisons
        ↓
Aggregate setup performance
        ↓
Calculate historical score
        ↓
Evaluate equipment suitability
        ↓
Calculate combined recommendation score
        ↓
Rank setups
```

---

# Recommendation system

The recommendation system uses several layers rather than a single win/loss percentage.

This is important because:

```text
1 win from 1 comparison
```

should not necessarily be considered stronger evidence than:

```text
15 wins from 20 comparisons
```

The recommendation system therefore currently considers:

- similarity between test conditions
- wins
- number of comparisons
- calculated comparison margin
- number of relevant sessions
- weighted evidence
- prior smoothing
- data confidence
- glide-wax temperature compatibility
- topping temperature compatibility
- grind snow-profile compatibility
- rill snow-profile compatibility

---

# Condition similarity

Historical test sessions are scored against the conditions entered on the Analysis page.

The current maximum weighting is:

| Condition | Weight |
|---|---:|
| Snow type | 25 |
| Snow condition | 25 |
| Snow temperature | 20 |
| Air temperature | 15 |
| Humidity | 10 |
| Weather | 5 |

Total:

```text
100
```

However, unavailable fields do not automatically count as mismatches.

Instead, the similarity score is normalised using only conditions where comparable information exists.

This allows older sessions with incomplete data to remain useful.

---

## Snow temperature similarity

Snow temperature receives partial credit based on distance between temperatures.

A very small temperature difference receives more similarity than a large difference.

The same principle is used for:

- air temperature
- humidity

whereas categorical values such as:

- snow type
- snow condition
- weather

are currently exact-match based.

Condition similarity logic is located in:

```text
src/utils/conditionSimilarity.js
```

---

# Relevant-session threshold

Setup recommendations currently use sessions with at least:

```text
50 % similarity
```

to the requested conditions.

This threshold is provisional and may later become configurable.

---

# Historical setup identity

Historically, the physical ski number is not treated as the most important identity.

A ski pair may eventually be replaced while a setup remains relevant.

The setup is therefore defined through:

```text
grind
rill
glide wax
topping
```

Newer tests also store equipment catalogue IDs:

```text
grindId
rillId
glideWaxId
toppingId
```

This provides more stable identity than names alone.

---

# Equipment IDs and snapshots

A ski currently stores both:

1. equipment ID
2. human-readable equipment name

Example:

```js
{
  grindId: 123,
  grind: 'S1',

  rillId: 456,
  rill: '1 mm straight',

  glideWaxId: 789,
  glideWax: 'Swix TS5',

  toppingId: 999,
  topping: 'Swix TSP5'
}
```

This is intentional.

The ID identifies the catalogue item.

The text value acts as a historical snapshot.

If a product is later renamed or removed from the catalogue, an old test can still display what was registered at the time of testing.

---

# Historical setup score

For historical recommendations, each comparison is weighted by condition similarity.

Example:

```text
Historical test similarity: 90 %
```

gives approximately:

```text
weight = 0.90
```

while:

```text
similarity = 60 %
```

gives:

```text
weight = 0.60
```

This means a result from very similar conditions influences recommendations more than a result from only moderately similar conditions.

---

# Prior smoothing

A small prior is added to historical win rate calculations.

Current values:

```js
PRIOR_WEIGHT = 3
PRIOR_WIN_RATE = 0.5
```

This effectively adds neutral prior evidence around a 50 % win rate.

The purpose is to avoid situations where:

```text
1 win
1 comparison
```

immediately creates a misleading:

```text
100 % recommendation
```

With more real test data, the effect of the prior becomes progressively smaller.

---

# Historical setup metrics

Each setup recommendation currently contains values including:

```text
comparisons
wins
rawWinRate
adjustedWinRate
weightedComparisons
weightedAverageScore
relevantSessionCount
dataConfidence
```

---

# Data confidence

Data confidence is currently based on weighted comparison volume.

Approximately:

```text
8 strongly relevant comparisons
```

correspond to:

```text
100 % data confidence
```

The value is capped at 100 %.

The UI translates confidence approximately into:

```text
0–39 %   → Low
40–74 %  → Medium
75–100 % → High
```

These thresholds are provisional.

---

# Equipment and condition matching

The recommendation model also uses equipment metadata.

This separates:

```text
What has historically worked?
```

from:

```text
What is this product intended for?
```

These two sources of information are then combined.

---

# Glide wax and topping temperature score

Glide wax and topping can have a recommended temperature interval.

Example:

```text
-10 °C to -4 °C
```

If today's snow temperature is:

```text
-7 °C
```

the product receives:

```text
100 % temperature fit
```

If the temperature is outside the interval, the score decreases gradually.

Current model:

```text
Inside interval = 100

1 °C outside = 80
2 °C outside = 60
3 °C outside = 40
4 °C outside = 20
5+ °C outside = 0
```

This prevents the recommendation model from using only a strict yes/no boundary.

---

# Grind and rill snow-profile score

Grind and rill products can contain:

```text
snowTypes
snowConditions
```

For example:

```js
snowTypes: [
  'Nysnø',
  'Omdannet snø'
]

snowConditions: [
  'Tørr'
]
```

If today's conditions match the registered profile, that component receives a high compatibility score.

Currently, categorical matching is binary:

```text
match = 100
no match = 0
```

Missing product metadata is treated as:

```text
unknown
```

rather than automatically being treated as bad.

This is important because older equipment entries may not yet contain full metadata.

---

# Product score

Equipment compatibility currently combines available information from:

```text
temperature compatibility
+
snow-profile compatibility
```

Only available scores are included.

Example:

```text
Temperature score: 100
Snow-profile score: 50
```

gives approximately:

```text
Product score: 75
```

If no product metadata is available, no product penalty is applied.

---

# Combined recommendation score

The final recommendation score currently gives the greatest importance to actual historical tests.

Current weighting:

```text
75 % historical test performance
25 % product / condition compatibility
```

Formula:

```text
combinedScore =
    historicalScore × 0.75
  + productScore    × 0.25
```

Example:

```text
Historical score: 70
Product score: 100
```

produces:

```text
70 × 0.75
+
100 × 0.25

= 77.5
```

Another setup could have:

```text
Historical score: 80
Product score: 20
```

which produces:

```text
80 × 0.75
+
20 × 0.25

= 65
```

This allows a historically strong setup to remain important while still taking current product suitability into account.

---

# Why historical results currently count more

The philosophy of SkiTesting is that real user testing should eventually be more valuable than a generic recommendation printed on a product.

Manufacturer ranges are useful context.

However, ski performance depends on many factors that cannot be fully described by a temperature interval.

For that reason:

```text
actual test evidence > generic catalogue information
```

in the current model.

The exact 75/25 weighting is provisional and may be adjusted when more real test data is available.

---

# Data model

A test session currently resembles:

```js
{
  id,
  title,
  date,
  time,
  location,

  status: 'active',

  completedAt: null,

  conditions: {
    airTemperature,
    snowTemperature,
    humidity,
    snowType,
    snowCondition,
    weather
  },

  skis: [],

  comparisons: []
}
```

---

# Ski model

A ski in a test session resembles:

```js
{
  id,

  skiNumber,

  grindId,
  grind,

  rillId,
  rill,

  glideWaxId,
  glideWax,

  toppingId,
  topping
}
```

`s​​kiNumber` is primarily a practical identifier inside the current test session.

For long-term analysis, setup identity is more important.

---

# Comparison model

A comparison resembles:

```js
{
  id,

  skiAId,
  skiBId,

  glideLeaderId,
  glideDifferenceCm,

  feelingA,
  feelingB,

  glideScore,
  feelingScore,
  calculatedScore,

  automaticWinnerId,
  winnerId,

  winnerOverridden,

  round
}
```

---

# Equipment model

An equipment catalogue entry currently resembles:

```js
{
  id,

  type,

  name,
  brand,

  minTemperature,
  maxTemperature,

  snowTypes: [],
  snowConditions: [],

  notes
}
```

Fields are used differently depending on equipment type.

---

# Data integrity

SkiTesting deliberately invalidates comparison data when changes would make existing tournament results unreliable.

For example, if a ski setup is changed after comparisons have already been recorded, the previous comparison results no longer represent the new setup.

Therefore, changing test-relevant ski data resets the session comparisons.

Fields currently considered test relevant include:

```text
ski number
grind
rill
glide wax
topping
equipment IDs
```

Similarly:

- adding a ski after testing has started resets the tournament
- deleting a ski resets the tournament
- changing a winner in an earlier round removes invalid later rounds
- deleting an earlier comparison removes dependent later rounds

The application warns the user before destructive actions.

---

# Why later rounds are removed

Consider this tournament:

```text
Ski 1 vs Ski 2
Winner: Ski 1

Ski 1 vs Ski 3
Winner: Ski 3
```

If the first result is later changed to:

```text
Winner: Ski 2
```

the second comparison is no longer valid because:

```text
Ski 1 should never have reached that round.
```

The application therefore removes downstream tournament results when an earlier winner changes.

---

# Backward compatibility

The project has evolved while test data already existed.

Older ski entries may therefore contain names without equipment IDs.

The analysis system handles this by:

1. preferring equipment IDs when available
2. falling back to normalised equipment names when IDs are unavailable

Example:

```text
New test:
glideWaxId = 12345

Old test:
glideWax = "Swix TS5"
```

Both formats can still participate in historical analysis.

This migration-friendly approach allows the data model to evolve without requiring all old sessions to be deleted.

---

# Persistence

The current prototype uses browser `localStorage`.

Two primary keys are used:

```text
skiSessions
skiEquipment
```

---

## `skiSessions`

Contains:

- sessions
- skis
- comparisons
- conditions
- completed test history

---

## `skiEquipment`

Contains the equipment catalogue.

---

# Important localStorage limitation

`localStorage` belongs to the current browser and browser profile.

This means data is currently **not**:

- synchronised between devices
- backed up automatically
- stored on a server
- shared between users
- available after browser storage is cleared

For this reason, `localStorage` is considered temporary prototype storage.

A database is planned later.

---

# Technology

Current core technology:

```text
React
JavaScript
Vite
React Router
CSS
Browser localStorage
```

The application currently has no backend.

---

# Project structure

The project is currently organised approximately as follows:

```text
src/
│
├── components/
│   │
│   ├── AnalysisPanel/
│   │
│   ├── ComparisonForm/
│   │   ├── ComparisonForm.jsx
│   │   └── ComparisonForm.css
│   │
│   ├── Navigation/
│   │   ├── Navigation.jsx
│   │   └── Navigation.css
│   │
│   ├── SessionCard/
│   │   ├── ComparisonHistory.jsx
│   │   ├── SessionCard.jsx
│   │   ├── SessionCard.css
│   │   ├── SessionHeader.jsx
│   │   ├── SkiSection.jsx
│   │   └── WinnerCard.jsx
│   │
│   ├── SessionEditForm/
│   │   ├── SessionEditForm.jsx
│   │   └── SessionEditForm.css
│   │
│   ├── SessionForm/
│   │   ├── SessionForm.jsx
│   │   └── SessionForm.css
│   │
│   ├── SetupInput/
│   │
│   ├── SetupRanking/
│   │
│   └── SkiForm/
│       ├── SkiForm.jsx
│       └── SkiForm.css
│
├── config/
│   ├── conditionOptions.js
│   ├── equipmentTypes.js
│   └── setupFields.js
│
├── pages/
│   │
│   ├── Analysis/
│   │   ├── Analysis.jsx
│   │   └── Analysis.css
│   │
│   ├── Equipment/
│   │   ├── Equipment.jsx
│   │   └── Equipment.css
│   │
│   ├── History/
│   │   └── History.jsx
│   │
│   ├── HistoryDetail/
│   │   ├── HistoryDetail.jsx
│   │   └── HistoryDetail.css
│   │
│   ├── TestSessionDetail/
│   │   ├── TestSessionDetail.jsx
│   │   └── TestSessionDetail.css
│   │
│   └── TestSessions/
│       ├── TestSessions.jsx
│       └── TestSessions.css
│
├── styles/
│   └── PageLayout.css
│
├── utils/
│   ├── comparisonScoring.js
│   ├── conditionSimilarity.js
│   ├── recommendationScore.js
│   ├── setupRecommendations.js
│   └── tournament.js
│
├── App.jsx
├── index.css
└── main.jsx
```

Some older components may still remain in the repository while the project is being refactored.

These can be cleaned up later once the current architecture has stabilised.

---

# Core utility modules

## `comparisonScoring.js`

Responsible for:

- objective glide score
- subjective feeling score
- combined duel score
- automatic winner
- close-result threshold

---

## `tournament.js`

Responsible for:

- tournament participants
- rounds
- pair matching
- byes
- next comparison
- tournament winner

---

## `conditionSimilarity.js`

Responsible for:

- comparing today's conditions with historical sessions
- weighted condition similarity
- handling incomplete historical data

---

## `setupRecommendations.js`

Responsible for:

- grouping setup identities
- historical wins
- weighted comparisons
- adjusted win rate
- average score
- confidence
- relevant session count

---

## `recommendationScore.js`

Responsible for:

- temperature suitability
- snow-profile suitability
- product compatibility
- final combined recommendation score

---

# Getting started

## Requirements

Install:

```text
Node.js
npm
Git
```

A recent Node.js version is recommended.

---

## Clone the repository

```bash
git clone https://github.com/asgeirespeland/SkiTesting.git
```

Enter the project:

```bash
cd SkiTesting
```

---

## Install dependencies

```bash
npm install
```

---

## Start development server

```bash
npm run dev
```

Vite will normally start the application on an address similar to:

```text
http://localhost:5173
```

Open the address shown in the terminal.

---

# Development

Typical development workflow:

```bash
git status
```

Stage changes:

```bash
git add .
```

Commit:

```bash
git commit -m "Describe change"
```

Push:

```bash
git push
```

---

# Example development commits

Examples of useful commit messages:

```text
Add equipment catalogue
```

```text
Add equipment IDs to ski setups
```

```text
Add temperature-based recommendations
```

```text
Add snow profile scoring
```

```text
Refactor tournament logic
```

```text
Improve analysis recommendation scoring
```

---

# Resetting local data

During development, test data can be removed through the browser console.

Remove sessions:

```js
localStorage.removeItem('skiSessions')
```

Remove equipment:

```js
localStorage.removeItem('skiEquipment')
```

Remove both:

```js
localStorage.removeItem('skiSessions')
localStorage.removeItem('skiEquipment')
```

Then refresh the application.

Use this carefully because the data is currently not backed up elsewhere.

---

# Known limitations

SkiTesting is still under active development.

Current limitations include:

## No database

All data is stored in browser `localStorage`.

---

## No authentication

There are currently no:

- accounts
- login
- permissions
- shared teams

---

## No cloud synchronisation

A test entered on one computer will not automatically appear on another device.

---

## No automatic backup

Clearing browser storage can remove test history.

---

## No bundled real product database

The application currently does not automatically include real glide-wax product ranges.

Product information is manually entered through the equipment catalogue.

---

## Recommendation weights are provisional

Values such as:

```text
75 % historical score
25 % product score
```

are current design decisions, not scientifically validated constants.

They should be evaluated using real ski-testing data.

---

## Temperature penalty is provisional

The current gradual reduction outside the recommended interval is a simple model.

It may later be improved based on:

- product manufacturer information
- real test results
- asymmetric cold/warm penalties
- snow type
- humidity
- snow age

---

## Snow-profile matching is currently simple

Snow-type and snow-condition matching currently uses categorical matches.

Future versions could model relationships such as:

```text
Nysnø
```

being more similar to:

```text
Blandet snø
```

than to:

```text
Hard / isete kunstsnø
```

rather than treating every mismatch equally.

---

## Equipment metadata is incomplete

Different equipment categories may eventually need specialised fields.

For example, future grind metadata could include:

```text
structure family
structure depth
machine
base characteristics
recommended humidity
recommended temperature
```

Rill metadata could include:

```text
straight / broken
roller type
spacing
depth
pressure
application method
```

---

# Planned development

The current roadmap is approximately:

## Phase 1 — Core testing workflow

Status: largely implemented.

- test sessions
- conditions
- skis
- comparisons
- tournament
- winners
- historical sessions

---

## Phase 2 — Equipment catalogue

Status: in progress.

- grind catalogue
- rill catalogue
- glide-wax catalogue
- topping catalogue
- equipment IDs
- temperature ranges
- snow profiles
- reusable equipment selections

---

## Phase 3 — Recommendation system

Status: in progress.

- historical similarity
- weighted test results
- confidence scoring
- temperature suitability
- snow-profile suitability
- combined setup ranking

---

## Phase 4 — Improve equipment metadata

Potential additions:

- snow type for glide wax
- snow condition for glide wax
- humidity range
- separate air/snow temperature recommendation
- grind structure metadata
- rill dimensions
- product series
- fluor-free product classification
- manufacturer URLs
- discontinued product flag

---

## Phase 5 — Database

Planned direction:

```text
Supabase
+
PostgreSQL
```

Potential database entities:

```text
users
sessions
session_conditions
skis
comparisons
equipment
equipment_profiles
```

A relational database will make it easier to:

- synchronise devices
- preserve data permanently
- create accounts
- share test data
- query large historical datasets
- analyse equipment performance

---

## Phase 6 — Authentication

Potential functionality:

- user accounts
- personal equipment catalogue
- personal test history
- multiple testers
- teams
- clubs

---

## Phase 7 — Better analysis

Possible future analysis methods include:

- setup vs setup performance
- pairwise comparison models
- Bayesian ranking
- Elo-style setup ratings
- uncertainty intervals
- confidence-aware ranking
- condition clustering
- trend analysis
- setup interactions
- season-to-season performance
- venue-specific performance

---

# Potential statistical improvements

The current recommendation system is intentionally understandable and deterministic.

Future versions could use more advanced approaches.

---

## Bayesian setup ranking

Instead of a simple adjusted win rate, setup performance could be represented as a probability distribution.

This could answer:

```text
There is an estimated 74 % probability that setup A is better than setup B under these conditions.
```

---

## Bradley–Terry model

Because the application primarily collects pairwise comparisons, a Bradley–Terry model could potentially be appropriate.

Rather than looking only at win percentage, it could estimate latent setup strength from the full comparison network.

---

## Elo-style ratings

Each setup could maintain a rating that updates whenever it wins or loses against another setup.

Ratings could potentially be condition-specific.

---

## Condition embeddings / similarity model

Instead of manually defined condition weights, future versions could learn which conditions actually matter from historical test results.

For example, the system could discover that:

```text
snow temperature
```

has significantly more predictive value than:

```text
weather
```

for a particular equipment category.

---

# Potential setup decomposition

The current recommendation system primarily evaluates complete setups.

Example:

```text
S1
+
1 mm straight
+
TS5
+
TSP5
```

Long term, it may also be useful to analyse individual components.

For example:

```text
Which grind performs best?
```

```text
Which rill performs best?
```

```text
Which glide wax performs best?
```

```text
Does grind S1 perform differently depending on rill?
```

```text
Which glide wax works best on grind S2 in transformed snow?
```

This would require significantly more test data but could become one of the most valuable parts of the application.

---

# Possible interaction analysis

A ski setup is not necessarily equal to the sum of its parts.

For example:

```text
Grind A + Rill X
```

may work very well, while:

```text
Grind A + Rill Y
```

does not.

Similarly:

```text
Glider A
```

may work particularly well with one structure.

Future versions may therefore analyse interactions such as:

```text
grind × rill
grind × glide wax
rill × snow type
glide wax × humidity
topping × snow temperature
```

---

# Mobile use

A future production version should work well on mobile devices.

This is particularly important because ski testing is usually performed outdoors.

Important mobile goals include:

- large buttons
- minimal typing
- quick comparison registration
- one-handed operation
- good contrast
- offline-friendly behaviour
- fast session switching

The current CSS already contains responsive layouts for several components, but mobile UX can still be improved considerably.

---

# Offline support

Because ski tests may be performed in locations with poor mobile coverage, offline support is a natural long-term feature.

Potential approach:

```text
Progressive Web App
+
local cache
+
background synchronisation
```

This could allow users to:

1. start a session offline
2. record all comparisons
3. finish the test
4. synchronise to the database later

---

# Potential weather integration

Future versions could optionally fetch environmental data automatically.

Possible data could include:

- air temperature
- humidity
- precipitation
- weather
- location
- historical weather

Snow temperature would probably still need to be measured manually.

Automatically recorded weather data should remain editable because actual track conditions can differ from the nearest weather station.

---

# Data quality principles

Several design decisions in SkiTesting are intended to preserve data quality.

## Historical data should not silently change

Old test results should represent what was actually tested.

---

## Missing data should not automatically mean bad performance

Unknown data is treated as unknown whenever possible.

---

## Later tournament results depend on earlier winners

Changing earlier comparisons invalidates later rounds.

---

## Active tests should not influence recommendations

Only completed sessions are used for historical analysis.

---

## Stable IDs should be preferred over names

Equipment IDs are increasingly used internally while names remain as historical snapshots.

---

# Design philosophy

The project currently follows a few key principles.

### 1. Testing should be fast

Entering data must not make ski testing unnecessarily complicated.

### 2. Historical data should become more valuable over time

Every completed test should contribute to future decisions.

### 3. Recommendations should be explainable

Rather than showing only:

```text
Use setup A
```

the application should be able to show why:

```text
Historical performance: 78 %
Temperature fit: 100 %
Snow profile: 100 %
Confidence: Medium
```

### 4. User test data should matter most

Manufacturer recommendations provide useful context, but actual results under real conditions are the primary goal of the application.

### 5. Uncertainty should be visible

One successful test should not appear as strong evidence.

Confidence should grow as data accumulates.

---

# Long-term vision

The long-term vision for SkiTesting is a system where a user can arrive at a ski venue, enter or automatically retrieve the current conditions, and receive something like:

```text
Conditions

Air: -5.2 °C
Snow: -7.1 °C
Humidity: 73 %

Snow:
New snow

Condition:
Dry
```

The application could then produce:

```text
Recommended setup #1

Grind:
S1

Rill:
1 mm straight

Glide wax:
Swix TS5

Topping:
TSP5

Overall recommendation:
84 %

Historical performance:
81 %

Temperature fit:
100 %

Snow-profile fit:
100 %

Data confidence:
High
```

along with evidence:

```text
Based on:
12 relevant comparisons
5 historical test sessions
Average condition similarity: 82 %
```

Alternative setups could also be presented:

```text
#2 Setup B – 79 %
#3 Setup C – 74 %
```

The user could then perform another test, adding more evidence back into the system.

This creates a continuous loop:

```text
Test
↓
Store
↓
Analyse
↓
Recommend
↓
Test again
↓
Improve recommendations
```

The more high-quality tests that are completed, the more useful the system becomes.

---

# Project stage

SkiTesting should currently be considered:

```text
Active development / prototype
```

The core concept works, but both the data model and recommendation algorithms are expected to evolve.

Breaking changes may therefore occur while the application is being developed.

---

# Repository

Repository:

```text
https://github.com/asgeirespeland/SkiTesting
```

---

# Author

Developed as an ongoing project for structured ski testing, historical performance analysis, and data-driven ski setup recommendations.