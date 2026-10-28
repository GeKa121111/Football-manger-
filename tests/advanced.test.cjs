const assert = require("node:assert/strict");
const data = require("../advanced-data.js");
const worldCup = require("../advanced-player-data.js");
const engine = require("../advanced-engine.js");

assert.equal(global.FM_WORLD_DATA.clubs.length, 222, "expanded database should include 222 club seeds across 27 football markets");
assert.equal(worldCup.playerCount, 1248, "registered 2026 World Cup snapshot should contain 1248 players");
assert.equal(worldCup.license, "CC0 1.0 Universal", "World Cup source licence should be recorded");
assert.ok(worldCup.players.some(p => p.name === "Kylian Mbappé" || p.name === "Kylian Mbappe"), "real national-team players should be bundled");
assert.ok(worldCup.players.every(p => p.clubName && p.dateOfBirth && p.nationalTeam), "source snapshot should include player club, DOB and national team fields");
assert.ok(global.FM_WORLD_DATA.players.some(p => p.name === "Mohamed Salah"), "known seed player should exist");
assert.ok(global.FM_WORLD_DATA.players.some(p => p.name === "Erling Haaland"), "known seed player should exist");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.name === "Al Ahly"), "Egyptian clubs should be represented");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.name === "Al Hilal"), "Saudi clubs should be represented");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.league === "Championship" && c.tier === 2), "English second tier should be present");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.league === "Liga Portugal 2" && c.tier === 2), "Portuguese second tier should be present");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.league === "J1 League"), "Japan should be represented");
assert.ok(global.FM_WORLD_DATA.clubs.some(c => c.league === "Major League Soccer"), "MLS should be represented");
assert.equal(new Set(global.FM_WORLD_DATA.clubs.map(c => c.id)).size, global.FM_WORLD_DATA.clubs.length, "club ids should be unique");
assert.equal(new Set(global.FM_WORLD_DATA.nations).size, 27, "playable nation list should have 27 entries");

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
assert.ok(state.clubs.length > 500, "world should also include clubs referenced by real World Cup player records");
assert.equal(state.playableNations.length, 3, "career should keep selected playable nation list");
assert.ok(state.players.length > 1248, "world should include the real World Cup player snapshot plus playable rosters");
assert.ok(state.players.filter(p=>p.worldCupSnapshot).length >= 1200, "at least 1200 real snapshot player records should be present in the world");
for (const seededClub of global.FM_WORLD_DATA.clubs) {
  const seededSquad=state.players.filter(p=>p.clubId===seededClub.id);
  assert.ok(seededSquad.length>=25, "every seeded club should have at least 25 player records: "+seededClub.name);
}
assert.ok(state.players.filter(p=>p.worldCupSnapshot).every(p=>p.realData&&!p.generated), "real snapshot players must not be marked as generated");
assert.ok(state.players.filter(p=>p.wageEstimated).length>0, "unknown player wages should be marked as estimated");
assert.equal(new Set(state.players.map(p => p.id)).size, state.players.length, "player ids must be unique");
for (const club of state.clubs.filter(c => !c.unverifiedDivision)) {
  const roster = state.players.filter(p => p.clubId === club.id);
  assert.ok(roster.length >= 25, "seeded / playable clubs should have at least 25 roster entries: " + club.name);
  assert.ok(roster.every(p => p.name && p.position), "all roster entries need names and positions");
}
for (const club of state.clubs.filter(c => c.unverifiedDivision)) {
  assert.ok(state.players.some(p => p.clubId === club.id && p.worldCupSnapshot), "unverified snapshot clubs must have real source player(s): " + club.name);
}
const managed = state.players.filter(p => p.clubId === state.userClubId);
assert.equal(managed.filter(p => p.registered).length, 25, "first 25 squad players should be competition-registered");
assert.ok(managed.some(p => !p.generated), "user club should retain at least one identifiable seed profile");
assert.ok(managed.some(p => p.generated), "missing roster slots should be marked as generated");
assert.ok(state.fixtures.length === 30, "six-club seeded English league gets 30 home/away fixtures");
assert.equal(Math.max(...state.fixtures.map(f => f.round)), 10, "six-club double round robin has 10 rounds");
assert.equal(state.fixtures[0].date, "2026-07-08", "the opening matchweek should start after career setup day");
assert.equal(state.continental.teams.length, 36, "continental entrants should be limited to European first divisions");
assert.ok(state.continental.teams.every(id => ["England","Spain","Italy","Germany","France","Portugal","Netherlands","Belgium","Turkey","Greece","Austria","Switzerland","Denmark","Norway","Sweden"].includes(state.clubs.find(c=>c.id===id)?.country)), "continental entrants must be from supported European countries");
assert.ok(state.continental.teams.every(id => state.clubs.find(c=>c.id===id)?.tier === 1), "second-tier clubs must not qualify as first-division continental entrants");
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


assert.ok(!global.FM_WORLD_DATA.players.some(p => /\\bDemo\\b/i.test(p.name)), "demo-labelled fake player records must not ship in the real-player seed");

const nestedResult = engine.normalizeImportedWorld({
  source: "nested real squad test",
  clubs: [{
    id: "provider-liverpool",
    name: "Liverpool FC",
    shortName: "Liverpool",
    area: {name: "England"},
    competition: {name: "Premier League"},
    clubColors: "Red / White",
    venue: "Anfield",
    squad: [{
      id: 888001, name: "Nested Import Striker", position: "Attacker",
      dateOfBirth: "2000-04-11", nationality: "England", shirtNumber: 88,
      marketValue: 12500000, contract: {until: "2029-06"}
    }]
  }],
  players: []
}, importState);
assert.equal(nestedResult.playersAdded, 1, "players nested inside a club squad must be imported");
assert.ok(importState.players.some(p => p.name === "Nested Import Striker" && p.clubId === "liv"), "suffix variants such as Liverpool FC should map to the seeded Liverpool club");
assert.equal(importState.players.filter(p => p.clubId === "liv" && p.generated).length, 0, "generated slots should be removed for clubs with imported real squads");
assert.ok(importState.realSquadClubIds.includes("liv"), "the world state should remember which clubs have real source squads");
assert.equal(importState.players.find(p => p.name === "Nested Import Striker")?.value, 12500000, "market value should come through the provider mapping");

const legacyState = engine.newCareer({
  mode: "career", managerName: "Legacy Save", primaryNation: "England",
  nations: ["England", "Egypt"], databaseSize: "medium", clubId: "liv"
});
const oldSnapshotClubIds = new Set(legacyState.clubs.filter(c => c.unverifiedDivision).map(c => c.id));
legacyState.players = legacyState.players.filter(p => !p.worldCupSnapshot && !oldSnapshotClubIds.has(p.clubId));
legacyState.clubs = legacyState.clubs.filter(c => !c.unverifiedDivision);
legacyState.world.clubs = legacyState.clubs;
legacyState.world.players = legacyState.players;
legacyState.bundledRealDataImported = false;
legacyState.worldCupPlayers = 0;
const legacyTracked = legacyState.players.find(p => p.clubId === "liv" && p.generated);
assert.ok(legacyTracked, "legacy save fixture should have a generated roster player to preserve");
legacyTracked.goals = 17;
const legacyTrackedId = legacyTracked.id;
const migration = engine.mergeBundledRealPlayers(legacyState);
assert.equal(migration.realPlayers, 1248, "legacy-save migration should include the complete bundled World Cup snapshot");
assert.ok(legacyState.bundledRealDataImported, "migration flag should prevent repeated importing on future launches");
assert.ok(legacyState.players.filter(p => p.worldCupSnapshot).length >= 1200, "migrated save should include real registered World Cup players");
assert.equal(legacyState.players.find(p => p.id === legacyTrackedId)?.goals, 17, "migration must preserve existing career progress");
assert.equal(new Set(legacyState.players.map(p => p.id)).size, legacyState.players.length, "migration must preserve unique player IDs");
for (const c of global.FM_WORLD_DATA.clubs) {
  assert.ok(legacyState.players.filter(p => p.clubId === c.id).length >= 25, "migration must keep each seeded club playable: " + c.name);
}
console.log("Advanced simulation tests passed.");

(async function testBatchRealSquadImport() {
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => ({
    ok: true,
    status: 200,
    json: async () => ({
      competition: {name: "Premier League", code: "PL"},
      teams: [{
        id: 12345, name: "Liverpool FC", shortName: "Liverpool", tla: "LIV",
        area: {name: "England"}, clubColors: "Red / White", venue: "Anfield",
        squad: [{
          id: 888002, name: "Batch API Midfielder", position: "Midfield",
          dateOfBirth: "2002-01-22", nationality: "England", shirtNumber: 89,
          marketValue: 8500000, contract: {until: "2028-06"}
        }]
      }]
    })
  });
  try {
    const report = await engine.importFootballDataBatch("PL", 2026, "test-token", importState);
    assert.equal(report.successes.length, 1, "batch importer should count successfully imported competitions");
    assert.ok(importState.players.some(p => p.name === "Batch API Midfielder" && p.clubId === "liv"), "batch importer should save real squad records into the matching club");
    assert.equal(importState.players.filter(p => p.clubId === "liv" && p.generated).length, 0, "batch import should not refill imported squads with generated slots");
    console.log("Real squad import tests passed.");
  } finally {
    global.fetch = originalFetch;
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

(async function testLivePremierLeagueImport() {
  const originalFetch = global.fetch;
  global.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      events: [{name:"Gameweek 8",is_current:true}],
      teams: [
        {id: 91, name:"Arsenal", short_name:"ARS", strength:950},
        {id: 92, name:"Liverpool", short_name:"LIV", strength:930}
      ],
      elements: [
        {id:9101,first_name:"Test",second_name:"PL Forward",web_name:"Test Forward",team:91,element_type:4,birth_date:"2001-03-10",squad_number:19,now_cost:78,minutes:640,goals_scored:6,assists:2,clean_sheets:0,bonus:8,ict_index:"110.2",form:"6.4",status:"a"},
        {id:9201,first_name:"Test",second_name:"PL Midfielder",web_name:"Test Midfielder",team:92,element_type:3,birth_date:"1999-07-14",squad_number:8,now_cost:69,minutes:570,goals_scored:2,assists:5,clean_sheets:3,bonus:6,ict_index:"85.5",form:"5.3",status:"a"}
      ]
    })
  });
  try {
    const report = await engine.importFantasyPremierLeague(importState);
    assert.equal(report.sourcePlayers, 2, "FPL importer should load all returned real player records");
    assert.equal(report.sourceClubs, 2, "FPL importer should load current club list");
    const forward = importState.players.find(p => p.name === "Test PL Forward");
    assert.ok(forward && forward.clubId === "ars", "current Premier League players should map to the correct existing club");
    assert.equal(forward.worldCupSnapshot, false, "non-international current player should not be mislabelled as World Cup data");
    assert.equal(forward.fantasyPrice, 7.8, "Fantasy Premier League price must be stored separately from market value");
    assert.equal(forward.value, 0, "fantasy game price must not be misrepresented as player market value");
    assert.equal(forward.valueEstimated, true, "missing market value should be marked estimated/unavailable");
    assert.equal(forward.wageEstimated, true, "missing wages should be clearly marked estimated");
    assert.equal(importState.players.filter(p => p.clubId === "ars" && p.generated).length, 0, "real club import should remove generated players for imported clubs");
    assert.ok(importState.realSquadClubIds.includes("ars"), "current team should be marked as a real-squad import");
    assert.ok(importState.world.calendar["Premier League"].length > 0, "Premier League calendar should be rebuilt for imported teams");
    console.log("Live Premier League importer tests passed.");
  } finally {
    global.fetch = originalFetch;
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
