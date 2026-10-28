# Touchline Manager

An original browser-based football management simulator with Arabic base UI, mobile layout, local saves, and an optional **Advanced Career** layer. The advanced mode is designed as an original football-director experience; it is not a 1:1 reproduction of Football Manager Mobile or its proprietary UI/code/assets.

## Run

Open `index.html` through a static web server or publish the repository with GitHub Pages. Click **Advanced Career** in the top bar to launch the multi-screen career. The original Touchline experience remains available.

## Advanced mode includes

- Pre-game setup for career, challenge and custom-club starts; manager identity, reputation, coaching style, nation selection (up to five) and club choice.
- A curated seed list of 42 real clubs from England, Spain, Italy, Germany, France, Egypt and Saudi Arabia, with stadiums, kit colours and club budget estimates.
- 1,248 real registered players from the 2026 World Cup national-team squad snapshot, with source-reported names, nationalities, national teams, birth dates, shirt numbers, club affiliations and coarse position groups. The source is CC0 1.0 Universal: https://github.com/openfootball/worldcup.json/blob/master/2026/worldcup.squads.json. A 1–20 attribute model, role/position weighted ratings and labelled generated academy slots remain for incomplete club rosters.
- League fixtures/tables, domestic-cup framework, a 36-team / eight-round continental schedule framework, match results and stats.
- Tactical formations and instructions that affect match simulation (pressing intensity, mentality, passing, style, final-third approach, width, defensive line, tackling and offside trap), manual starting XI selection, role assignments, drag-and-drop tactics board, squad numbers and 25-player registration, training, mentoring groups and team dynamics.
- Player search, scouting assignments, transfer offers/counteroffers, summer (July–August) and winter (January) windows, wage budget validation, installments, player sales and contract renewals.
- Board requests, club budget allocation and staff hiring/release.
- Match engine with tactical influence, weighted scorers, assists, disciplinary events, player ratings, appearances and season stats; Canvas presentation with animated tokens/ball, clock, highlights/commentary, score/stats, 1×/2×/4× controls, half-time, touchline shouts and substitution controls.
- JSON save export/import, database JSON import, optional bulk football-data.org squad import for supported competition codes, LocalStorage save plus IndexedDB backup where available.
- Real squad import reads nested squad arrays, maps provider club names to the existing 222-club world, refreshes player identity/position/age/nationality/shirt number/contract expiry/market value fields when supplied, and removes generated roster slots for clubs with real squads imported.
- One-click live Premier League importer uses the public Fantasy Premier League `bootstrap-static` endpoint (with a CORS-proxy fallback) to load current players for all 20 clubs; FPL fantasy cost is kept separate from player market value, while wages and simulation ratings remain marked as estimates unless a source reports them.
- Bulk squad importer defaults to PL, ELC, BL1, PD, SA, FL1, DED, PPL and BSA (Premier League, Championship, Bundesliga, La Liga, Serie A, Ligue 1, Eredivisie, Primeira Liga and Brazilian Série A) and runs sequentially to respect provider rate limits.
- Matchday selection checks all fixtures scheduled for the date, so an AI-only fixture cannot hide the managed club's match.
- Transfer installments respect a genuine zero upfront payment, validate the term (1–48 months) and reserve the entire agreed fee from the transfer budget to prevent overspending.
- Red cards trigger a one-match suspension, five season yellow cards trigger a suspension, and suspended players are excluded from tactical lineup selection and shown in the squad UI.
- Regression coverage includes same-day fixture lookup, red-card availability, yellow-card thresholds and suspension service.

## Data accuracy and licensing

The expanded club list is a broad seed catalogue, **not a verified complete 2026/27 divisional database**. The additional 1,248-player data file is a **2026 World Cup national-team registration snapshot** with source-reported club affiliations; it is not 1,248 full club-squad players and does not constitute all squads at every club. Club names are real and tier labels are representative seed groupings, but affiliations can change by season and most full squads are not bundled. Procedurally generated academy slots are visibly marked and must not be mistaken for real people. The app does not fabricate wages or market values where imported feeds omit them. Before treating ages, club membership, shirt numbers, stadium capacities, salaries or valuations as authoritative, import and validate a current, licensed source. Player value/wage figures embedded in the starter seed are estimates for gameplay, not official payroll disclosures.

The one-click Premier League importer reads the public `https://fantasy.premierleague.com/api/bootstrap-static/` endpoint; this is the public current-season Fantasy Premier League dataset, not an official market-value/wage database. The optional football-data.org importer uses the user's own API token in a request header. In Settings → World Database & Settings, paste your token and select Import real squads from all codes to fetch the default nine supported competitions, or use one competition code at a time. The batch is sequential and can take about a minute; competition access and squad detail depend on the provider plan. The source can supply real player identity, nationality, date of birth, position, shirt number, contract expiry and market value where available, but it does not consistently provide weekly wages or the detailed attributes used by the simulation. Wages and attributes must not be mistaken for official data. Clubs not covered by the provider still use the bundled seed/labelled generated slots unless you import another JSON dataset. Do not commit private API tokens into the repository.

The bundled 36-team continental screen selects from supported European first-tier seed clubs, but remains an **engine framework**, not a complete official qualification/seed system. Exact UEFA, CAF, AFC, domestic-cup, promotion/relegation and squad registration regulations require separately verified competition datasets and rules. The initial cup framework is simplified. It should not be advertised as a complete, official league pyramid.

## Save storage

Careers are stored per browser/device. Use **Settings → Export save JSON** before clearing browser data or moving devices. Import a Touchline save JSON to continue the career. You can also import a JSON database shaped like:

```json
{
  "source": "Your provider and update date",
  "clubs": [{"id":"club-id","name":"Club Name","country":"Country","league":"League","stadium":"Ground","primary":"#123456","secondary":"#ffffff"}],
  "players": [{"id":"player-id","name":"Player Name","clubId":"club-id","position":"ST","nationality":"Country","age":23,"shirt":9,"overall":75,"potential":84,"value":12000000,"wage":45000}]
}
```

Missing player positions are filled with generated slots, clearly marked as generated. Import is best treated as replacing/updating the existing seed world rather than an official database sync.

## Tests

With Node.js 20 or newer:

```sh
node --check app.js
node --check advanced-data.js
node --check advanced-engine.js
node --check advanced-ui.js
node tests/smoke.test.cjs
node tests/advanced.test.cjs
```

GitHub Actions runs the checks and publishes static assets through GitHub Pages on pushes to `main`.

## Known limits

This is a substantial playable expansion, not a complete commercial-grade Football Manager clone. The match Canvas uses an event-driven probabilistic result with animated visual tokens; players are not running an advanced pathfinding/ball-control physics AI. Full 25-player *real* rosters across all divisions, official transfer/wage data, exhaustive domestic and continental rules, real press conferences/AI transfer negotiations, and full Arabic localization are not bundled. These need trusted data feeds and further iteration.