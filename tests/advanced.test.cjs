const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const data = require("../advanced-data.js");
const worldCup = require("../advanced-player-data.js");
const engine = require("../advanced-engine.js");

assert.equal(global.FM_WORLD_DATA.clubs.length, 222, "expanded database should include 222 club seeds across 27 football markets");
assert.equal(worldCup.playerCount, 1248, "registered 2026 World Cup snapshot should contain 1248 players");
assert.equal(worldCup.license, "CC0 1.0 Universal", "World Cup source licence should be recorded");
const deploymentWorkflow = fs.readFileSync(path.join(__dirname, "..", ".github", "workflows", "deploy.yml"), "utf8");
const pageHtml = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const serviceWorker = fs.readFileSync(path.join(__dirname, "..", "service-worker.js"), "utf8");
const advancedCss = fs.readFileSync(path.join(__dirname, "..", "advanced.css"), "utf8");
const mainCss = fs.readFileSync(path.join(__dirname, "..", "styles.css"), "utf8");
const appSource = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");
const advancedUiSource = fs.readFileSync(path.join(__dirname, "..", "advanced-ui.js"), "utf8");
assert.ok(pageHtml.includes('src="advanced-player-data.js"'), "the app shell must load the real-player dataset");
assert.ok(deploymentWorkflow.includes("advanced-player-data.js") && deploymentWorkflow.includes("dist/"),
  "the Pages build must copy the real-player dataset into the deploy artifact");
assert.ok(serviceWorker.includes('"./advanced-player-data.js"'), "the offline cache must include the real-player dataset");
assert.ok(advancedCss.includes("@media (max-width: 480px)") && advancedCss.includes("position: fixed; top: auto; bottom: 0"),
  "advanced manager mobile CSS must provide a small-screen breakpoint and persistent bottom navigation");
assert.ok(advancedCss.includes("env(safe-area-inset-bottom)") && advancedCss.includes("min-height: 42px"),
  "advanced manager mobile controls must respect device safe areas and touch target sizing");
assert.ok(mainCss.includes("@media (max-width: 420px)") && mainCss.includes("overscroll-behavior-x: contain"),
  "main shell mobile styles must handle narrow screens and horizontal table scrolling");
assert.ok(serviceWorker.includes('touchline-manager-v17'), "CA/PA and youth intake updates require a fresh offline cache version");
assert.ok(mainCss.includes(".topbar-right {") && mainCss.includes("flex-wrap: nowrap"),
  "main mobile header must keep its controls in a predictable bounded row");
assert.ok(mainCss.includes(".nav-list {") && mainCss.includes("overflow-x: auto") && mainCss.includes("flex-direction: row"),
  "main mobile navigation must scroll horizontally rather than clip items");
assert.ok(mainCss.includes("width: 100vw; max-width: 100vw; left: 0; right: 0"),
  "main mobile bottom navigation must cover the full device viewport width");
assert.ok(appSource.includes("function renderStartScreen(saved)") && appSource.includes('data-action="start-new-career"'),
  "fresh launches should show a career menu before entering the game");
assert.ok(appSource.includes('data-action="resume-classic-career"') && appSource.includes('data-action="resume-advanced-career"'),
  "the career menu should preserve separate resume paths for existing local saves");
assert.ok(mainCss.includes(".tm-start-screen") && mainCss.includes(".tm-start-new"),
  "the career menu should have a designed mobile-first welcome screen");
assert.ok(advancedUiSource.includes("function openNewCareer(skipConfirm)"),
  "the startup menu must be able to open the advanced new-career wizard even if an old save exists");
assert.ok(advancedUiSource.includes('name="managerName" required') && advancedUiSource.includes('name="managerNationality"') &&
  advancedUiSource.includes('name="clubId"') && advancedUiSource.includes("اكتب اسمك هنا"),
  "new-career setup must collect manager name, nationality and selected club");
assert.ok(advancedUiSource.includes("اختار النادي اللي هتدربه") && advancedUiSource.includes("جنسية المدير الفني"),
  "manager profile and club selection should be localized in Arabic");
assert.ok(advancedUiSource.includes('DATA.clubs.filter(c=>c.country===nation.value&&!c.unverifiedDivision)'),
  "new career club list must hide unverified affiliate clubs that the engine cannot select as a managed club");
assert.ok(advancedUiSource.includes('const welcomeScreen=document.getElementById("tm-start-screen")') &&
  advancedUiSource.includes('if(welcomeScreen&&typeof welcomeScreen.remove==="function")welcomeScreen.remove()'),
  "successful career creation must remove the startup welcome layer instead of leaving it over/under the game");
assert.ok(advancedUiSource.includes("managerNationality:String(fd.get(\"managerNationality\")||\"Egypt\")"),
  "manager nationality should be stored separately from the selected playable league");
assert.ok(appSource.includes('data-action="start-new-career">اختيار النادي وبدء المسيرة'),
  "the in-game new career action should open the same manager and club setup instead of resetting to a default club");
assert.ok(advancedCss.includes("fm-setup-form .fm-field") && advancedCss.includes("direction: rtl; text-align: right"),
  "the Arabic manager profile wizard must render with RTL alignment");
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
const zeroVitalsPlayer = engine.normalizePlayer({
  id: "zero-vitals-regression", name: "Zero Vitals Test", position: "CM",
  age: 25, overall: 60, potential: 70, fitness: 0, morale: 0,
  attributes: Object.fromEntries(engine.ATTRS.map(key => [key, 10]))
});
assert.equal(zeroVitalsPlayer.fitness, 0, "normalizing a saved player must not restore fitness when it is genuinely zero");
assert.equal(zeroVitalsPlayer.morale, 0, "normalizing a saved player must not restore morale when it is genuinely zero");
const nullVitalsPlayer = engine.normalizePlayer({
  id:"null-vitals-regression",name:"Null Vitals Test",position:"CM",
  fitness:null,morale:null,age:null,contractYears:null,
  attributes:Object.fromEntries(engine.ATTRS.map(key=>[key,10]))
});
assert.equal(nullVitalsPlayer.fitness, 94, "null fitness should use the missing-value default");
assert.equal(nullVitalsPlayer.morale, 72, "null morale should use the missing-value default");
assert.equal(nullVitalsPlayer.age, 19, "null age should use the missing-value default");
assert.equal(nullVitalsPlayer.contractYears, 2, "null contract length should use the missing-value default");
const malformedNumericPlayer = engine.normalizePlayer({
  id:"malformed-numeric-regression",name:"Malformed Numeric Test",position:"ST",
  age:"not-a-number",overall:"broken",potential:"broken",value:"broken",wage:"broken",
  shirt:"broken",contractYears:"broken",fitness:"broken",morale:"broken",injuredWeeks:-3,
  goals:"broken",assists:"broken",appearances:"broken",yellowCards:"broken",redCards:"broken",
  averageRating:"broken",lastMatchRating:"broken",cleanSheets:"broken",minutes:"broken",
  suspendedMatches:"broken",
  attributes:Object.fromEntries(engine.ATTRS.map(key=>[key,"broken"]))
});
for (const field of ["age","overall","potential","value","wage","shirt","contractYears","fitness","morale",
  "goals","assists","appearances","yellowCards","redCards","averageRating","lastMatchRating","cleanSheets","minutes","suspendedMatches"]) {
  assert.ok(Number.isFinite(malformedNumericPlayer[field]), "normalized player " + field + " must always be finite");
}
assert.ok(engine.ATTRS.every(key=>Number.isFinite(malformedNumericPlayer.attributes[key])&&malformedNumericPlayer.attributes[key]>=1&&malformedNumericPlayer.attributes[key]<=20),
  "malformed imported attributes must be normalized into the supported 1–20 range");
assert.equal(malformedNumericPlayer.injuredWeeks,0,"negative injury duration from imported saves must be clamped to zero");
assert.equal(malformedNumericPlayer.age,19,"invalid age should fall back to a safe default");
assert.ok(malformedNumericPlayer.overall>=20&&malformedNumericPlayer.overall<=99,
  "invalid overall must resolve to a bounded, usable value after attribute-based recalculation");
assert.ok(malformedNumericPlayer.potential>=malformedNumericPlayer.overall,"potential must never be below the normalized overall");

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
const automaticXIIds = xi.map(p => p.id);
const manualXIIds = automaticXIIds.slice();
[manualXIIds[1], manualXIIds[2]] = [manualXIIds[2], manualXIIds[1]];
state.tactics.startingXI = manualXIIds;
assert.deepEqual(engine.selectedXI(state, state.userClubId).map(p => p.id), manualXIIds,
  "manual selection should be respected when selected players remain position-compatible");
const invalidManualXI = automaticXIIds.slice(1).concat(automaticXIIds[0]);
state.tactics.startingXI = invalidManualXI;
const guardedXI = engine.selectedXI(state, state.userClubId);
assert.equal(guardedXI.length, 11, "a mismatched manual goalkeeper slot should be safely refilled from the squad");
assert.equal(guardedXI.filter(p => p.assignedPosition === "GK").length, 1, "manual selection must retain exactly one goalkeeper slot");
assert.ok(guardedXI.filter(p => p.assignedPosition === "GK").every(p => p.position === "GK"),
  "a field player must never be selected as goalkeeper even when manual XI order is invalid");
const managedClubForXI = state.clubs.find(c => c.id === state.userClubId);
const opponentClubForXI = state.clubs.find(c => c.id !== state.userClubId && c.league === managedClubForXI.league);
const guardedMatch = engine.simulateMatch(managedClubForXI, opponentClubForXI, state.players, state.tactics, engine.defaultTactics());
const simulatedUserLineup = guardedMatch.lineups[state.userClubId] || [];
assert.equal(new Set(simulatedUserLineup).size, simulatedUserLineup.length, "simulated lineup must not contain duplicates");
assert.equal(simulatedUserLineup.filter(id => state.players.find(p => p.id === id)?.position === "GK").length, 1,
  "match simulation must preserve one goalkeeper even with a malformed manual selection");
state.tactics.startingXI = [];
const retiredLineupCandidate = state.players.find(p => p.clubId === state.userClubId && p.position !== "GK" && !p.retired);
assert.ok(retiredLineupCandidate, "retired player regression needs an outfield squad member");
retiredLineupCandidate.retired = true;
assert.ok(!engine.squad(state,state.userClubId).some(p => p.id === retiredLineupCandidate.id),
  "retired players should not remain in the active squad list");
assert.ok(!engine.selectedXI(state,state.userClubId).some(p => p.id === retiredLineupCandidate.id),
  "retired players must not be selected for the starting XI");
const retiredPlayerMatch = engine.simulateMatch(managedClubForXI,opponentClubForXI,state.players,engine.defaultTactics(),engine.defaultTactics());
assert.ok(!(retiredPlayerMatch.lineups[state.userClubId]||[]).includes(retiredLineupCandidate.id),
  "retired players must not appear in simulated match lineups");
retiredLineupCandidate.retired = false;
const poorShape = Object.assign({},engine.defaultTactics(),{positions:Object.fromEntries(xi.map(p=>[p.id,[.5,.02]]))});
assert.ok(engine.strengthForXI(xi,poorShape,false)<engine.strengthForXI(xi,engine.defaultTactics(),false),
  "dragging the whole team out of its role zones should reduce tactical strength");
const baselineTactics = engine.tacticalDelta(engine.defaultTactics());
const highPressTactics = engine.tacticalDelta(Object.assign({}, engine.defaultTactics(), {pressIntensity:20}));
const counterTactics = engine.tacticalDelta(Object.assign({}, engine.defaultTactics(), {style:"Counter-Attack"}));
assert.ok(highPressTactics.attack > baselineTactics.attack, "higher pressing intensity should influence attacking pressure");
assert.ok(highPressTactics.fatigue > baselineTactics.fatigue, "higher pressing intensity should increase fatigue cost");
assert.ok(counterTactics.xg > baselineTactics.xg, "counter-attacking instructions should affect expected chance quality");
const aiProfileA = engine.aiTactics(state.clubs.find(c=>c.id==="liv"), state.season);
const aiProfileB = engine.aiTactics(state.clubs.find(c=>c.id==="liv"), state.season);
assert.deepEqual(aiProfileA, aiProfileB, "AI tactical identity should remain stable within a season");
assert.ok(Object.keys(engine.FORMATIONS).includes(aiProfileA.formation), "AI should choose a supported formation");
assert.ok(new Set(global.FM_WORLD_DATA.clubs.slice(0,25).map(c=>engine.aiTactics(c,2026).style)).size>1,
  "different AI clubs should use more than one tactical style");
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
const beforeAssistsTotal = state.players.reduce((sum,p)=>sum+(p.assists||0),0);
const result = engine.simulateMatch(home, away, state.players, engine.defaultTactics(), engine.defaultTactics());
assert.ok(Number.isInteger(result.homeGoals) && result.homeGoals >= 0 && result.homeGoals <= 12, "home score should be a plausible non-negative integer");
assert.ok(Number.isInteger(result.awayGoals) && result.awayGoals >= 0 && result.awayGoals <= 12, "away score should be a plausible non-negative integer");
assert.ok(Number.isFinite(result.stats.xg[0]) && Number.isFinite(result.stats.xg[1]), "xG should be numeric");
assert.equal(result.stats.possession[0] + result.stats.possession[1], 100, "possession should sum to 100%");
assert.ok(result.stats.shots[0] >= result.stats.shotsOnTarget[0], "shots should be at least shots on target");
assert.ok(result.stats.shots[1] >= result.stats.shotsOnTarget[1], "shots should be at least shots on target");
assert.equal(result.lineups[fixture.homeId].length, 11, "match simulation should return the home starting XI");
assert.equal(result.lineups[fixture.awayId].length, 11, "match simulation should return the away starting XI");
assert.ok(result.events.filter(e => e.type === "goal").every(e => e.assistId),
  "scored goals should carry an assisting player when a full XI is available");
assert.ok(result.events.some(e => e.type === "yellow" || e.type === "red") || result.stats.yellow[0] + result.stats.yellow[1] === 0,
  "disciplinary events should be represented in the match event log");
for (const p of state.players) assert.equal(p.goals || 0, beforeGoals[p.id], "preview should not mutate season player goals");
engine.applyResult(state, fixture, result);
assert.equal(fixture.played, true, "applying a result should mark the fixture played");
assert.equal(fixture.homeGoals, result.homeGoals, "scoreline should be persisted");
for (const id of result.lineups[fixture.homeId].concat(result.lineups[fixture.awayId])) {
  const participant = state.players.find(p => p.id === id);
  assert.ok(participant && participant.appearances >= 1, "starting players should accrue a season appearance");
}
const seasonAssistsAfterMatch=state.players.reduce((sum,p)=>sum+(p.assists||0),0);
assert.equal(seasonAssistsAfterMatch-beforeAssistsTotal,
  result.events.filter(e=>e.type==="goal"&&e.assistId).length,
  "assists in the event log should be added to player season totals");
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
assert.equal(engine.transferWindowStatus("2026-07-01").open, true, "summer window should be open from July 1");
assert.equal(engine.transferWindowStatus("2026-08-31").open, true, "summer window should remain open through August 31");
assert.equal(engine.transferWindowStatus("2026-09-01").nextOpen, "2027-01-01", "winter window should be the next opening after August");
assert.equal(engine.transferWindowStatus("2027-02-01").nextOpen, "2027-07-01", "summer window should be the next opening after January");
const outsideWindowTarget = state.players.find(p => p.clubId && p.clubId !== state.userClubId && p.value > 0);
state.day = "2026-10-01";
const outsideWindowOffer = engine.negotiateTransfer(state, outsideWindowTarget.id, {fee:1000,upfront:1000,wage:1000,years:3,installmentMonths:0});
assert.equal(outsideWindowOffer.ok, false, "paid transfer should not complete outside a window");
assert.equal(outsideWindowOffer.code, "WINDOW_CLOSED", "closed-window transfers should return an explicit reason");
state.day = "2026-07-01";
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


const seasonStatsState = engine.newCareer({
  mode: "career", managerName: "Season Stats Test", primaryNation: "England",
  nations: ["England"], databaseSize: "small", clubId: "liv"
});
const seasonStatsPlayer = seasonStatsState.players.find(p => p.clubId === seasonStatsState.userClubId);
seasonStatsPlayer.goals = 12;
seasonStatsPlayer.appearances = 38;
seasonStatsPlayer.seasonStats = {
  appearances: 27, goals: 9, assists: 6, yellowCards: 4, redCards: 0,
  cleanSheets: 0, averageRating: 7.14, lastMatchRating: 6.8
};
engine.finishSeason(seasonStatsState);
assert.equal(seasonStatsPlayer.goals, 12, "season rollover must preserve career goals total");
assert.equal(seasonStatsPlayer.appearances, 38, "season rollover must preserve career appearances");
assert.equal(seasonStatsPlayer.seasonStats.goals, 0, "season rollover should reset current season goals");
assert.equal(seasonStatsPlayer.seasonStats.appearances, 0, "season rollover should reset current season appearances");
assert.equal(seasonStatsPlayer.seasonHistory[0].season, 2026, "completed season should be added to player history");
assert.equal(seasonStatsPlayer.seasonHistory[0].stats.goals, 9, "season history should keep the completed season's goals");
assert.equal(seasonStatsPlayer.seasonHistory[0].stats.assists, 6, "season history should keep the completed season's assists");
console.log("Season stats history tests passed.");


const contractExpiryState = engine.newCareer({
  mode: "career", managerName: "Contract Expiry Test", primaryNation: "England",
  nations: ["England"], databaseSize: "small", clubId: "liv"
});
const expiringPlayer = contractExpiryState.players.find(p => p.clubId === contractExpiryState.userClubId && !p.generated);
expiringPlayer.age = 25;
expiringPlayer.contractYears = 1;
expiringPlayer.retired = false;
const expiringPlayerName = expiringPlayer.name;
engine.finishSeason(contractExpiryState);
assert.equal(expiringPlayer.clubId, null, "unrenewed user-club contract should move the player to free agency");
assert.equal(expiringPlayer.retired, false, "an expired contract should not be mislabeled as retirement");
assert.ok(contractExpiryState.inbox.some(m => m.title === "Contract expired" && m.text.includes(expiringPlayerName)),
  "manager should receive an inbox notice when a contract expires");
assert.ok(contractExpiryState.players.filter(p => p.clubId === contractExpiryState.userClubId && !p.retired).length >= 25,
  "club should replenish squad depth after contract expiry");

// Same-day calendar regression: an earlier fixture belonging to two AI clubs must not hide the user's match.
const matchdayLookupState = engine.newCareer({
  mode: "career", managerName: "Matchday Lookup Test", primaryNation: "England",
  nations: ["England"], databaseSize: "small", clubId: "liv"
});
const managedFixture = matchdayLookupState.fixtures.find(f => !f.played && (f.homeId === matchdayLookupState.userClubId || f.awayId === matchdayLookupState.userClubId));
assert.ok(managedFixture, "test career should have an upcoming managed-club fixture");
const followingDate = new Date(matchdayLookupState.day + "T12:00:00Z");
followingDate.setUTCDate(followingDate.getUTCDate() + 1);
const followingDay = followingDate.toISOString().slice(0, 10);
managedFixture.date = followingDay;
const unrelatedFixture = matchdayLookupState.fixtures.find(f => f.id !== managedFixture.id &&
  f.homeId !== matchdayLookupState.userClubId && f.awayId !== matchdayLookupState.userClubId);
assert.ok(unrelatedFixture, "test career should have an AI-only fixture");
unrelatedFixture.date = followingDay;
matchdayLookupState.fixtures.splice(matchdayLookupState.fixtures.indexOf(unrelatedFixture), 1);
matchdayLookupState.fixtures.unshift(unrelatedFixture);
const matchdayResult = engine.continueDay(matchdayLookupState);
assert.equal(matchdayResult.match, true, "the calendar must find the managed-club fixture even when an AI fixture is listed first on that date");
assert.equal(matchdayResult.fixture.id, managedFixture.id, "the user's fixture must be selected for matchday");


// Discipline regression: red cards and five yellow cards suspend a player for the next match.
const disciplineState = engine.newCareer({
  mode: "career", managerName: "Discipline Rules Test", primaryNation: "England",
  nations: ["England"], databaseSize: "small", clubId: "liv"
});
const disciplineFixture = disciplineState.fixtures.find(f => !f.played &&
  (f.homeId === disciplineState.userClubId || f.awayId === disciplineState.userClubId));
assert.ok(disciplineFixture, "discipline test requires a managed-club fixture");
const disciplineOpponentId = disciplineFixture.homeId === disciplineState.userClubId ? disciplineFixture.awayId : disciplineFixture.homeId;
const redCardPlayer = disciplineState.players.find(p => p.clubId === disciplineState.userClubId && !p.generated && !p.retired);
assert.ok(redCardPlayer, "discipline test requires a player in the managed squad");
const emptyMatchStats = () => ({ratings: {}, xg: [0, 0], possession: [50, 50]});
const emptyLineups = (homeId, awayId) => ({[homeId]: [], [awayId]: []});
engine.applyResult(disciplineState, disciplineFixture, {
  homeGoals: 0, awayGoals: 0, stats: emptyMatchStats(),
  events: [{type: "red", clubId: disciplineState.userClubId, playerId: redCardPlayer.id, minute: 72, text: "Red card"}],
  lineups: {[disciplineState.userClubId]: [redCardPlayer.id], [disciplineOpponentId]: []},
  manOfTheMatch: null
});
assert.equal(redCardPlayer.redCards, 1, "red cards must increment the player's career tally");
assert.equal(redCardPlayer.suspendedMatches, 1, "a red card must trigger a one-match suspension");
const managedClub = disciplineState.clubs.find(c => c.id === disciplineState.userClubId);
const opponentClub = disciplineState.clubs.find(c => c.id === disciplineOpponentId);
const nextSimulatedMatch = engine.simulateMatch(managedClub, opponentClub, disciplineState.players, disciplineState.tactics, engine.defaultTactics());
assert.ok(!(nextSimulatedMatch.lineups[managedClub.id] || []).includes(redCardPlayer.id),
  "a suspended player must be unavailable for selection in the next match");
engine.applyResult(disciplineState, {id:"suspension-served-test",homeId:disciplineState.userClubId,awayId:disciplineOpponentId,round:2}, {
  homeGoals: 0, awayGoals: 0, stats: emptyMatchStats(), events: [],
  lineups: emptyLineups(disciplineState.userClubId, disciplineOpponentId), manOfTheMatch: null
});
assert.equal(redCardPlayer.suspendedMatches, 0, "serving the next club match must clear a one-match suspension");

const yellowCardPlayer = disciplineState.players.find(p => p.clubId === disciplineState.userClubId && p.id !== redCardPlayer.id && !p.generated && !p.retired);
assert.ok(yellowCardPlayer, "discipline test requires a second squad player");
yellowCardPlayer.seasonStats = Object.assign({}, yellowCardPlayer.seasonStats, {yellowCards: 4});
engine.applyResult(disciplineState, {id:"yellow-threshold-test",homeId:disciplineState.userClubId,awayId:disciplineOpponentId,round:3}, {
  homeGoals: 0, awayGoals: 0, stats: emptyMatchStats(),
  events: [{type:"yellow",clubId:disciplineState.userClubId,playerId:yellowCardPlayer.id,minute:61,text:"Yellow card"}],
  lineups: emptyLineups(disciplineState.userClubId, disciplineOpponentId), manOfTheMatch: null
});
assert.equal(yellowCardPlayer.seasonStats.yellowCards, 5, "yellow cards must update the season tally");
assert.equal(yellowCardPlayer.suspendedMatches, 1, "five yellow cards in a season must trigger a suspension");
assert.ok(disciplineState.inbox.some(m => m.title === "Suspension after red card"),
  "red-card suspension should be communicated through the inbox");
assert.ok(disciplineState.inbox.some(m => m.title === "Suspension: yellow-card threshold"),
  "yellow-card threshold suspension should be communicated through the inbox");

const injuredMatchPlayer = disciplineState.players.find(p => p.clubId === disciplineState.userClubId &&
  p.id !== redCardPlayer.id && p.id !== yellowCardPlayer.id && !p.generated && !p.retired);
assert.ok(injuredMatchPlayer, "injury test requires a third player in the managed squad");
engine.applyResult(disciplineState,
  {id:"match-injury-test",homeId:disciplineState.userClubId,awayId:disciplineOpponentId,round:4},
  {
    homeGoals:0,awayGoals:0,stats:emptyMatchStats(),
    events:[{type:"injury",clubId:disciplineState.userClubId,playerId:injuredMatchPlayer.id,minute:36,weeksOut:3,text:"Injury"}],
    lineups:emptyLineups(disciplineState.userClubId,disciplineOpponentId),manOfTheMatch:null
  });
assert.equal(injuredMatchPlayer.injuredWeeks, 3, "match injury events must persist a multi-week injury");
assert.ok(disciplineState.inbox.some(m => m.title === "Injury during match" && m.text.includes(injuredMatchPlayer.name)),
  "manager should receive a message for an injured player in their own squad");
const postInjuryMatch = engine.simulateMatch(managedClub,opponentClub,disciplineState.players,disciplineState.tactics,engine.defaultTactics());
assert.ok(!(postInjuryMatch.lineups[managedClub.id]||[]).includes(injuredMatchPlayer.id),
  "a player injured during a match must be unavailable for later match selection until recovered");

const aiRedCardPlayer = disciplineState.players.find(p => p.clubId === disciplineOpponentId &&
  p.id !== injuredMatchPlayer.id && !p.generated && !p.retired);
const aiYellowCardPlayer = disciplineState.players.find(p => p.clubId === disciplineOpponentId &&
  p.id !== aiRedCardPlayer?.id && p.id !== injuredMatchPlayer.id && !p.generated && !p.retired);
assert.ok(aiRedCardPlayer && aiYellowCardPlayer, "AI discipline alert test requires two opponent players");
aiYellowCardPlayer.seasonStats = Object.assign({}, aiYellowCardPlayer.seasonStats, {yellowCards:4});
engine.applyResult(disciplineState,
  {id:"ai-card-inbox-test",homeId:disciplineOpponentId,awayId:disciplineState.userClubId,round:5},
  {
    homeGoals:0,awayGoals:0,stats:emptyMatchStats(),
    events:[
      {type:"red",clubId:disciplineOpponentId,playerId:aiRedCardPlayer.id,minute:51,text:"Red card"},
      {type:"yellow",clubId:disciplineOpponentId,playerId:aiYellowCardPlayer.id,minute:67,text:"Yellow card"}
    ],
    lineups:emptyLineups(disciplineOpponentId,disciplineState.userClubId),manOfTheMatch:null
  });
assert.equal(aiRedCardPlayer.suspendedMatches, 1, "AI players should still receive suspension rules");
assert.equal(aiYellowCardPlayer.suspendedMatches, 1, "AI yellow-card thresholds should still trigger suspensions");
assert.ok(!disciplineState.inbox.some(m => ["Suspension after red card","Suspension: yellow-card threshold"].includes(m.title) &&
  (m.text.includes(aiRedCardPlayer.name)||m.text.includes(aiYellowCardPlayer.name))),
  "the manager inbox must not be flooded by discipline alerts for AI clubs");

const retirementAlertState = engine.newCareer({
  mode:"career",managerName:"AI Retirement Alert Test",primaryNation:"England",
  nations:["England"],databaseSize:"small",clubId:"liv"
});
retirementAlertState.players.forEach(p=>{p.age=25;p.contractYears=5;p.retired=false;});
const aiRetiree = retirementAlertState.players.find(p=>p.clubId && p.clubId!==retirementAlertState.userClubId);
assert.ok(aiRetiree, "retirement alert test requires a player at an AI club");
aiRetiree.age=41;
const savedRandomForRetirement=Math.random;
try { Math.random=()=>0; engine.finishSeason(retirementAlertState); }
finally { Math.random=savedRandomForRetirement; }
assert.equal(aiRetiree.retired,true,"season rollover should still retire old AI players");
assert.ok(!retirementAlertState.inbox.some(m=>m.title==="Player retirement"&&m.text.includes(aiRetiree.name)),
  "the manager inbox should only report retirements at their own club");
console.log("Matchday, discipline, injury, and inbox-scope tests passed.");

// Transfer finance regression: zero-upfront deals remain zero-upfront and reserve the full fee against the transfer budget.
const installmentState = engine.newCareer({
  mode: "career", managerName: "Installment Finance Test", primaryNation: "England",
  nations: ["England"], databaseSize: "small", clubId: "liv"
});
installmentState.day = "2026-07-15";
installmentState.finances.transferBudget = 10000000;
installmentState.finances.balance = 10000000;
installmentState.finances.wageBudget = 1000000;
installmentState.finances.weeklyCosts = 0;
const installmentTarget = installmentState.players.find(p => p.clubId && p.clubId !== installmentState.userClubId && !p.generated && !p.retired);
assert.ok(installmentTarget, "installment test requires a player at another club");
installmentTarget.value = 2000000;
installmentTarget.valueEstimated = true;
installmentTarget.wage = 1000;
const installmentBudgetBefore = installmentState.finances.transferBudget;
const installmentBalanceBefore = installmentState.finances.balance;
const installmentDeal = engine.negotiateTransfer(installmentState, installmentTarget.id, {
  fee: 2000000, upfront: 0, installmentMonths: 4, wage: 1000, years: 3, signingBonus: 0
});
assert.equal(installmentDeal.ok, true, "a valid fully-deferred transfer should be accepted in an open window");
assert.equal(installmentState.finances.balance, installmentBalanceBefore, "a zero-upfront deal must not charge the fee immediately");
assert.equal(installmentState.finances.transferBudget, installmentBudgetBefore - 2000000,
  "the full agreed fee must be reserved from the transfer budget, not only the upfront payment");
const installmentRecord = installmentState.transfers.find(t => t.type === "installments" && t.playerId === installmentTarget.id);
assert.ok(installmentRecord, "deferred transfer balance must be recorded for monthly settlement");
assert.equal(installmentRecord.remaining, 2000000, "all of the fee should remain payable after zero upfront");
assert.equal(installmentRecord.monthsRemaining, 4, "installment term should be preserved");
assert.equal(installmentRecord.monthly, 500000, "installment amount should be calculated from the agreed term");
console.log("Transfer installment accounting tests passed.");

// Training regression: development changes role-weighted OVR through attributes and respects potential.
const trainingState = engine.newCareer({
  mode: "career", managerName: "Training Development Test", primaryNation: "England",
  nations: ["England"], databaseSize: "small", clubId: "liv"
});
const trainingPlayer = trainingState.players.find(p => p.clubId === trainingState.userClubId && p.position === "ST");
assert.ok(trainingPlayer, "training test requires a striker in the managed squad");
trainingPlayer.age = 18;
trainingPlayer.overall = 50;
trainingPlayer.potential = 80;
trainingPlayer.injuredWeeks = 0;
trainingPlayer.attributes = Object.fromEntries(engine.ATTRS.map(key => [key, 10]));
trainingState.lastTrainingDay = null;
const savedRandom = Math.random;
let trainingResult;
try {
  Math.random = () => 0;
  trainingResult = engine.train(trainingState, "Attacking");
} finally {
  Math.random = savedRandom;
}
assert.equal(trainingResult.ok, true, "training should run once on the current day");
assert.equal(trainingPlayer.attributes.shooting, 11, "attacking training should improve the selected skill");
assert.equal(trainingPlayer.overall, engine.playerOverall(trainingPlayer),
  "young player's displayed overall must follow the updated position-weighted attributes");
assert.ok(trainingPlayer.overall <= trainingPlayer.potential,
  "training-driven overall must not exceed the player's potential");
console.log("Training development integration tests passed.");

// Season rollover regression: growth and ageing update relevant attributes and the position-weighted overall.
function prepareDeterministicSeasonState(managerName, targetAge) {
  const state = engine.newCareer({
    mode: "career", managerName, primaryNation: "England",
    nations: ["England"], databaseSize: "small", clubId: "liv"
  });
  state.players.forEach(p => {
    p.age = 25;
    p.contractYears = 5;
    p.retired = false;
  });
  const target = state.players.find(p => p.clubId === state.userClubId && p.position === "ST");
  assert.ok(target, "season-development test requires a managed striker");
  state.players.splice(state.players.indexOf(target), 1);
  state.players.unshift(target);
  target.age = targetAge;
  target.overall = 50;
  target.potential = 80;
  target.contractYears = 5;
  target.attributes = Object.fromEntries(engine.ATTRS.map(key => [key, 10]));
  return {state, target};
}
function finishSeasonWithControlledRandom(state) {
  const savedRandom = Math.random;
  let calls = 0;
  try {
    Math.random = () => (++calls <= 2 ? 0 : 0.99);
    engine.finishSeason(state);
  } finally {
    Math.random = savedRandom;
  }
}
const youthSeason = prepareDeterministicSeasonState("Youth Season Growth Test", 18);
finishSeasonWithControlledRandom(youthSeason.state);
assert.equal(youthSeason.target.attributes.shooting, 11, "a developing striker should improve a role-relevant attribute during season rollover");
assert.equal(youthSeason.target.overall, engine.playerOverall(youthSeason.target),
  "season growth should recalculate overall from attributes");
assert.ok(youthSeason.target.overall <= youthSeason.target.potential,
  "season growth should respect potential ability");
const ageingSeason = prepareDeterministicSeasonState("Veteran Ageing Test", 34);
finishSeasonWithControlledRandom(ageingSeason.state);
assert.equal(ageingSeason.target.attributes.shooting, 9, "ageing should reduce a role-relevant attribute");
assert.equal(ageingSeason.target.overall, engine.playerOverall(ageingSeason.target),
  "ageing decline should be reflected in position-weighted overall");
console.log("Season rollover development tests passed.");

 
// CA/PA and hidden attributes are stable estimates, explicitly marked as such.
assert.equal(data.players.length > 0, true, "seeded player data should remain available");
for (const player of data.players) {
  assert.ok(Number.isInteger(player.CA) && player.CA >= 1 && player.CA <= 200,
    "seeded players should have CA on the 1-200 scale: " + player.id);
  assert.ok(Number.isInteger(player.PA) && player.PA >= player.CA && player.PA <= 200,
    "seeded players should have PA >= CA on the 1-200 scale: " + player.id);
  assert.equal(player.abilityEstimated, true, "derived seed abilities should be labelled as estimates");
  for (const key of ["professionalism", "ambition", "consistency", "pressure", "durability"]) {
    assert.ok(Number.isInteger(player.hiddenAttributes[key]) && player.hiddenAttributes[key] >= 1 && player.hiddenAttributes[key] <= 20,
      "hidden attribute should be in the 1-20 range: " + player.id + " / " + key);
  }
}
assert.ok(worldCup.players.every(player =>
  Number.isInteger(player.CA) && player.CA >= 1 && player.CA <= 200 &&
  Number.isInteger(player.PA) && player.PA >= player.CA && player.PA <= 200 &&
  player.hiddenAttributes && player.abilityEstimated === true
), "all registered snapshot players should receive estimated CA/PA and hidden attributes");
assert.equal(data.clubs.length, 222, "youth recruitment metadata must preserve all club seeds");
for (const club of data.clubs) {
  for (const key of ["youthRecruitment", "juniorCoaching", "youthFacilities"]) {
    assert.ok(Number.isInteger(club[key]) && club[key] >= 1 && club[key] <= 20,
      "club youth infrastructure should stay on a 1-20 scale: " + club.id + " / " + key);
  }
}

const youthSystem = data.youthSystem;
assert.ok(youthSystem && typeof youthSystem.previewIntake === "function" &&
  typeof youthSystem.announceIntake === "function", "the world dataset should expose the two-stage youth intake API");
const previewA = youthSystem.previewIntake("liv", 2027);
const previewB = youthSystem.previewIntake("liv", 2027);
assert.deepEqual(previewA, previewB, "the same club and intake year should reproduce the same December preview");
assert.equal(previewA.previewDate, "2026-12-15");
assert.equal(previewA.targetAnnouncementDate, "2027-03-31");
assert.equal(previewA.count, 16, "each youth intake preview should include exactly 16 prospects");
assert.equal(new Set(previewA.players.map(player => player.id)).size, 16, "preview IDs must be unique within an intake");
assert.ok(previewA.players.every(player =>
  player.previewOnly === true && player.age >= 15 && player.age <= 17 &&
  player.expectedCA >= 1 && player.expectedCA <= 200 &&
  player.expectedPA >= player.expectedCA && player.expectedPA <= 200 &&
  !Object.prototype.hasOwnProperty.call(player, "CA") &&
  !Object.prototype.hasOwnProperty.call(player, "PA")
), "December preview should show estimates without exposing actual announced CA/PA");

const announcementA = youthSystem.announceIntake(previewA);
const announcementB = youthSystem.announceIntake(previewB);
assert.deepEqual(announcementA, announcementB, "the same preview should reproduce the same March youth announcement");
assert.equal(announcementA.announcedOn, "2027-03-31");
assert.equal(announcementA.count, 16);
assert.equal(new Set(announcementA.players.map(player => player.id)).size, 16);
for (const player of announcementA.players) {
  assert.equal(player.generated, true, "intake players must be marked as generated");
  assert.equal(player.realData, false, "fictional intake players must not be mistaken for real players");
  assert.ok(Number.isInteger(player.CA) && player.CA >= 1 && player.CA <= 200);
  assert.ok(Number.isInteger(player.PA) && player.PA >= player.CA && player.PA <= 200);
  assert.ok(player.potential >= player.overall, "display potential must not fall below current ability");
  assert.ok(player.hiddenAttributes && ["professionalism", "ambition", "consistency", "pressure", "durability"]
    .every(key => Number.isInteger(player.hiddenAttributes[key]) && player.hiddenAttributes[key] >= 1 && player.hiddenAttributes[key] <= 20));
  assert.equal(player.youthIntakeYear, 2027);
  assert.equal(player.youthIntakeClubId, "liv");
}
assert.throws(() => youthSystem.previewIntake("liv", "not-a-year"), /intakeYear/);
assert.throws(() => youthSystem.announceIntake({type:"invalid"}), /youth-intake-preview/);
const previousTestlandRating = youthSystem.getNationYouthRating("Testland");
youthSystem.setNationYouthRating("Testland", 12);
assert.equal(youthSystem.getNationYouthRating("Testland"), 12, "nation youth rating should be adjustable at runtime");
youthSystem.setNationYouthRating("Testland", previousTestlandRating);
console.log("CA/PA and deterministic youth intake tests passed.");
