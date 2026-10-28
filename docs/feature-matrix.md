# Feature matrix — Touchline Manager

This is a staged implementation plan for an original football club-management simulator. It uses officially published Football Manager 27 features as a quality benchmark, not as assets or copied game code. The current browser build is a playable foundation and should not be described as feature-equivalent to Football Manager.

## Current build (implemented)

| Area | Current behavior | Maturity |
|---|---|---|
| Game world | 12 fictional clubs, 20 generated players per club | Foundation |
| Player model | Age, position, overall, potential, fitness, morale, sharpness, wages, estimated value, training experience and basic performance stats | Foundation |
| League | Double round-robin schedule (home and away), 22 matchweeks and 132 fixtures for 12 clubs, all fixtures simulated per round, points table, goal difference, form and match history | Foundation |
| Match simulation | Probabilistic goals tied to squad strength, home advantage and tactics; per-match expected goals (xG), possession, shots, shots on target, corners, passing accuracy, cards, injuries and event timeline | Foundation |
| Tactics | One selected formation, playing style and mentality affect XI selection and team power | Foundation |
| Squad | Searchable first-team table, position, rating, potential, fitness, wage and estimated value | Foundation |
| Transfers | Simplified immediate signing with transfer fee, budget validation, roster-size limit and two transfer windows (season start and midseason) | Foundation |
| Training | One session per round, with attacking, defending, technical, fitness, balanced and youth-development focuses | Foundation |
| Finance | Starting balance, weekly sponsorship/media income, weekly wages and home-match income; transfer fees are deducted immediately | Foundation |
| Persistence | LocalStorage save, manual save and confirmed career reset | Foundation |
| UX / delivery | Responsive Arabic UI, web manifest, service worker shell cache and GitHub Actions smoke tests | Foundation |

## Priority roadmap

### P0 — Simulation integrity
- Replace coarse club strength with an attribute-weighted lineup model and position-specific contributions.
- Make match events, shots, expected goals, possession, cards and injuries explain each simulated result.
- Tune fixture calendar, match fitness and weekly cash flow against season-length simulations.
- Add deterministic seeds and regression tests for repeatable simulation scenarios.

### P1 — Tactical effectiveness
- Separate formations in possession and out of possession, with role suitability and player familiarity.
- Add pressing height, defensive line, tempo, width, passing risk and player instructions.
- Calculate tactic effectiveness from player attributes, role suitability, training focus and recruitment fit.
- Add opponent scouting and a pre-match tactical report.

### P1 — Recruitment and contracts
- Scouting assignments and reports with uncertainty, role fit and estimated transfer ranges.
- Negotiable transfer bids, selling clubs' decisions, wage/contract negotiations and deadline-day pressure.
- Contract duration, renewal requests, bonuses, release clauses, agents, loans and outgoing transfers.
- Recruitment requirements and opportunities instead of an instant-buy-only market.

### P2 — Club and season world
- Cup draws, domestic cups, continental competitions and more than one competition calendar.
- News inbox, transfer deadline day, dynamic board confidence, manager reputation and season objectives.
- Coaches, scouts, medical staff, facilities, youth academy, player dynamics and morale effects.
- International management and women's competitions, with separate player pools and competition rules.
- Historical records, trophies, individual awards, season summaries, relegation/promotion and club finances over multiple seasons.

### P2 — Match experience and analysis
- Match timeline and commentary that explain major events rather than only generating a final score.
- Team/player match ratings tied to events, role execution, workload and opposition.
- Data hub with form, xG/xA, pressing indicators, pass completion and opponent trends.
- Optional compact 2D or event-focused match presentation; the management simulation remains the core.

## Official benchmark references

The live official feature pages are subject to change as Football Manager 27 approaches release. Re-check them before treating any item as a complete requirements list.

- [Football Manager 27 — Key Features](https://www.footballmanager.com/fm27/features): tactical effectiveness, tactical tweaks, player instructions and match-day presentation.
- [FM27 — Training & Tactical Effectiveness](https://www.footballmanager.com/fm27/features/fm27-training-and-tactical-effectiveness): connects training, recruitment and tactical approach to how well players can execute the manager's plan.
- [FM27 — A Deeper, More Immersive Football World](https://www.footballmanager.com/fm27/features/deeper-more-immersive-world): news flow, cup draws, transfer deadline day and the wider season narrative.
- [FM27 — 2D Match, In-Game Editor and Deeper World Upgrades](https://www.footballmanager.com/fm27/features/fm27-2d-match-engine-game-editor-and-deeper-world-upgrades): match presentation, competition behavior and quality-of-life updates.
