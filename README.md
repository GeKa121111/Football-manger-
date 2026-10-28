# Touchline Manager

An original browser-based football management simulator with Arabic base UI, mobile layout, local saves, and an optional **Advanced Career** layer. The advanced mode is designed as an original football-director experience; it is not a 1:1 reproduction of Football Manager Mobile or its proprietary UI/code/assets.

## Run

Open `index.html` through a static web server or publish the repository with GitHub Pages. Click **Advanced Career** in the top bar to launch the multi-screen career. The original Touchline experience remains available.

## Advanced mode includes

- Pre-game setup for career, challenge and custom-club starts; manager identity, reputation, coaching style, nation selection (up to five) and club choice.
- A curated seed list of 42 real clubs from England, Spain, Italy, Germany, France, Egypt and Saudi Arabia, with stadiums, kit colours and club budget estimates.
- A limited set of identifiable player examples, a 1–20 attribute model, role/position weighted ratings, and explicitly labelled generated academy slots to make roster sizes playable.
- League fixtures/tables, domestic-cup framework, a 36-team / eight-round continental schedule framework, match results and stats.
- Tactical formations and instructions, drag-and-drop Canvas tactics board, squad numbers and 25-player registration, training, mentoring groups and team dynamics.
- Player search, scouting assignments, transfer offers/counteroffers, wage budget validation, installments, player sales and contract renewals.
- Board requests, club budget allocation and staff hiring/release.
- Canvas match presentation with animated tokens/ball, clock, highlights/commentary, score/stats, 1×/2×/4× controls, half-time, touchline shouts and substitution controls.
- JSON save export/import, database JSON import, optional bulk football-data.org squad import for supported competition codes, LocalStorage save plus IndexedDB backup where available.
- Real squad import reads nested squad arrays, maps provider club names to the existing 222-club world, refreshes player identity/position/age/nationality/shirt number/contract expiry/market value fields when supplied, and removes generated roster slots for clubs with real squads imported.
- Bulk squad importer defaults to PL, ELC, BL1, PD, SA, FL1, DED, PPL and BSA (Premier League, Championship, Bundesliga, La Liga, Serie A, Ligue 1, Eredivisie, Primeira Liga and Brazilian Série A) and runs sequentially to respect provider rate limits.
- Regression tests for core database, roster, fixture, match and training invariants.

## Data accuracy and licensing

The expanded club list is a broad seed catalogue, **not a verified complete 2026/27 divisional database**. Club names are real and tier labels are representative seed groupings, but affiliations can change by season and most full squads are not bundled. Procedurally generated academy slots are visibly marked and must not be mistaken for real people. The app does not fabricate wages or market values where imported feeds omit them. Before treating ages, club membership, shirt numbers, stadium capacities, salaries or valuations as authoritative, import and validate a current, licensed source. Player value/wage figures embedded in the starter seed are estimates for gameplay, not official payroll disclosures.

The optional football-data.org importer uses the user's own API token in a request header. In Settings → World Database & Settings, paste your token and select Import real squads from all codes to fetch the default nine supported competitions, or use one competition code at a time. The batch is sequential and can take about a minute; competition access and squad detail depend on the provider plan. The source can supply real player identity, nationality, date of birth, position, shirt number, contract expiry and market value where available, but it does not consistently provide weekly wages or the detailed attributes used by the simulation. Wages and attributes must not be mistaken for official data. Clubs not covered by the provider still use the bundled seed/labelled generated slots unless you import another JSON dataset. Do not commit private API tokens into the repository.

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