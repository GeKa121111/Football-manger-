const assert = require("node:assert/strict");
const data = require("../advanced-data.js");
const engine = require("../advanced-engine.js");

assert.equal(global.FM_WORLD_DATA.clubs.length, 48, "seed should include 48 clubs across seven nations");
assert.ok(global.FM_WORLD_DATA.players.some(p => p.name === "Mohamed Salah"), "known seed player should exist");
assert.ok(global.FM_WORLD_DATA.players.some(p => p.name === "Erling Haaland"), "known seed player should exist");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.name === "Al Ahly"), "Egyptian clubs should be represented");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.name === "Al Hilal"), "Saudi clubs should be represented");

assert.equal(engine.normalizeKitColor("red"), "#D71920", "named imported kit colours should map to displayable hex colours");
assert.ok(Number.isInteger(engine.contractYearsFromUntil("2030-06")), "contract expiry should convert to remaining contract years");
assert.ok(engine.contractYearsFromUntil("2030-06") >= 0 && engine.contractYearsFromUntil("2030-06") <= 8, "contract years should be clamped to a supported range");

const state = engine.newCareer({
  mode: "career",
  managerName: "Test Manager",
  primaryNation: "England",
  nations: ["England", "Egypt", "Spain"],
  databaseSize: "medium",
  clubId: "liv"
});
assert.equal(state.userClubId, "liv", "chosen club should be used");
assert.equal(state.clubs.length, 48, "world should retain global transfer-market clubs");
assert.equal(state.playableNations.length, 3, "career should keep selected playable nation list");
assert.equal(state.players.length, 48 * 25, "medium world should have 25-player roster slots per club");
assert.equal(new Set(state.players.map(p => p.id)).size, state.players.length, "player ids must be unique");
for (const club of state.clubs) {
  const roster = state.players.filter(p => p.clubId === club.id);
  assert.equal(roster.length, 25, "every seeded club should have 25 roster entries: " + club.name);
  assert.ok(roster.every(p => p.name && p.position), "all roster entries need names and positions");
}
const managed = state.players.filter(p => p.clubId === state.userClubId);
assert.equal(managed.filter(p => p.registered).length, 25, "first 25 squad players should be competition-registered");
assert.ok(managed.some(p => !p.generated), "user club should retain at least one identifiable seed profile");
assert.ok(managed.some(p => p.generated), "missing roster slots should be marked as generated");
assert.ok(state.fixtures.length === 30, "six-club seeded English league gets 30 home/away fixtures");
assert.equal(Math.max(...state.fixtures.map(f => f.round)), 10, "six-club double round robin has 10 rounds");
assert.equal(state.fixtures[0].date, "2026-07-08", "the opening matchweek should start after career setup day");
assert.equal(state.continental.teams.length, 36, "continental entrants should be limited to the five European seed nations");
assert.ok(state.continental.teams.every(id => ["England","Spain","Italy","Germany","France"].includes(state.clubs.find(c=>c.id===id)?.country)), "UEFA-style entrants must not include Egypt or Saudi Arabia");
assert.equal(state.continental.fixtures.length, 144, "36 European entrants with eight fixtures each means 144 matches");
assert.ok(state.domesticCup && state.domesticCup.fixtures.length >= 2, "career needs a domestic cup framework");

const xi = engine.selectedXI(state, state.userClubId);
assert.equal(xi.length, 11, "first-team lineup should select 11 available players");
assert.equal(xi.filter(p => p.assignedPosition === "GK").length, 1, "lineup needs one goalkeeper");
assert.ok(state.players.filter(p => p.position !== "GK").every(p => p.attributes.goalkeeping === 1), "outfield players should not be rated as goalkeepers");
for (const p of state.players) {
  for (const attr of engine.ATTRS) {
    assert.ok(Number.isFinite(p.attributes[attr]) && p.attributes[attr] >= 1 && p.attributes[attr] <= 20,
      "attribute should be on the 1-20 scale: " + attr + " / " + p.name);
  }
}

const fixture = state.fixtures[0];
const home = state.clubs.find(c => c.id === fixture.homeId);
const away = state.clubs.find(c => c.id === fixture.awayId);
const beforeGoals = Object.fromEntries(state.players.map(p => [p.id, p.goals || 0]));
const result = engine.simulateMatch(home, away, state.players, engine.defaultTactics(), engine.defaultTactics());
assert.ok(Number.isInteger(result.homeGoals) && result.homeGoals >= 0 && result.homeGoals <= 12, "home score should be a plausible non-negative integer");
assert.ok(Number.isInteger(result.awayGoals) && result.awayGoals >= 0 && result.awayGoals <= 12, "away score should be a plausible non-negative integer");
assert.ok(Number.isFinite(result.stats.xg[0]) && Number.isFinite(result.stats.xg[1]), "xG should be numeric");
assert.equal(result.stats.possession[0] + result.stats.possession[1], 100, "possession should sum to 100%");
assert.ok(result.stats.shots[0] >= result.stats.shotsOnTarget[0], "shots should be at least shots on target");
assert.ok(result.stats.shots[1] >= result.stats.shotsOnTarget[1], "shots should be at least shots on target");
for (const p of state.players) assert.equal(p.goals || 0, beforeGoals[p.id], "preview should not mutate season player goals");
engine.applyResult(state, fixture, result);
assert.equal(fixture.played, true, "applying a result should mark the fixture played");
assert.equal(fixture.homeGoals, result.homeGoals, "scoreline should be persisted");
for (const ev of result.events.filter(e => e.type === "goal")) {
  assert.ok((state.players.find(p => p.id === ev.playerId)?.goals || 0) >= 1, "scorers should receive goal statistics");
}

const training1 = engine.train(state, "Technical");
assert.equal(training1.ok, true, "first training session of the day should run");
const training2 = engine.train(state, "Attacking");
assert.equal(training2.ok, false, "duplicate same-day training must be rejected");
const shifted = engine.adjustBudget(state, 100000);
assert.equal(shifted.ok, true, "valid finance budget adjustment should succeed");
assert.equal(state.finances.wageBudget >= 0, true, "wage budget should remain non-negative");

const tooExpensive = engine.negotiateTransfer(state, state.players.find(p => p.clubId !== state.userClubId && p.clubId).id, {
  fee: state.finances.transferBudget + 1000000000,
  upfront: state.finances.transferBudget + 1000000000,
  wage: 10000,
  years: 3,
  installmentMonths: 0
});
assert.equal(tooExpensive.ok, false, "transfer above budget must be refused");
const renewalCandidate = state.players.find(p => p.clubId === state.userClubId);
const renewal = engine.offerRenewal(state, renewalCandidate.id, { wage: Math.max(renewalCandidate.wage + 1000, 3000), years: 3, releaseClause: 0, signingBonus: 0 });
assert.equal(renewal.ok, true, "a reasonable contract renewal should be accepted");
assert.equal(renewalCandidate.contractYears, 3, "renewal should update contract years");

const cup = engine.simulateDomesticCupRound(state);
assert.equal(cup.ok, true, "domestic cup round should simulate");
assert.ok(state.domesticCup.fixtures.some(f => f.played), "cup results should be persisted");
assert.equal(engine.simulateContinentalRound(state).ok, true, "continental matchday should simulate with 36 teams");

const exported = JSON.parse(engine.exportData(state));
assert.equal(exported.format, "touchline-advanced-save", "export should use the documented native save envelope");
assert.equal(exported.version, 1, "save envelope should carry a version");
const importState = engine.newCareer({ primaryNation: "Egypt", nations: ["Egypt"], clubId: "ahly" });
const ahlyBeforeImport = importState.clubs.find(c => c.id === "ahly");
const priorBudget = ahlyBeforeImport.transferBudget;
engine.normalizeImportedWorld({source:"kit-only import",clubs:[{id:"provider-ahly",name:"Al Ahly",country:"Egypt",league:"Egyptian Premier League",clubColors:"Red / White"}],players:[]},importState);
assert.equal(ahlyBeforeImport.transferBudget, priorBudget, "imports without budget data must preserve seeded budget instead of zeroing it");
assert.equal(ahlyBeforeImport.primary, "#D71920", "provider kit colour names should be converted to valid colours");
assert.equal(ahlyBeforeImport.secondary, "#FFFFFF", "secondary kit colour should be imported from provider colour string");

const importResult = engine.normalizeImportedWorld({
  source: "test fixture",
  clubs: [{id:"test-club-1",name:"Test Import Club",country:"Egypt",league:"Test League",stadium:"Test Ground",primary:"#123456",secondary:"#ffffff"}],
  players: [{id:"test-player-1",name:"Test Import Player",clubId:"test-club-1",position:"ST",nationality:"Egypt",age:20,shirt:9,overall:61,potential:77,value:100000,wage:1000}]
}, importState);
assert.equal(importResult.clubs, 1, "JSON importer should read clubs");
assert.equal(importResult.playersAdded, 1, "JSON importer should add players");
assert.ok(importState.players.some(p => p.id === "test-player-1" && p.name === "Test Import Player"), "imported player should be retained");

console.log("Advanced simulation tests passed.");
