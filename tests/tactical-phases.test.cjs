const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

require("../advanced-data.js");
require("../advanced-player-data.js");
require("../spatial-match-engine.js");
const engine = require("../advanced-engine.js");

const legacy = {
  formation:"4-3-3", mentality:"Balanced", width:"Wide", tempo:"Fast",
  passing:"Direct", style:"Wing Play", line:"High Line", pressing:"Press All Over",
  pressIntensity:16, tackling:"Committed", offsideTrap:true, roles:{"legacy-role-player":"Winger"}
};
const migrated = engine.ensureTacticalPhases(legacy);
assert.equal(migrated.inPossession.formation,"4-3-3","legacy formation should be retained as the in-possession default");
assert.equal(migrated.inPossession.passing,"Direct","legacy passing instruction should be migrated");
assert.equal(migrated.outOfPossession.formation,"4-4-2","old saves should receive a defensive shape without losing their old formation");
assert.equal(migrated.outOfPossession.line,"High Line");
assert.equal(migrated.outOfPossession.pressIntensity,16);
assert.equal(migrated.outOfPossession.tackling,"Committed");
assert.equal(migrated.inPossession.roles["legacy-role-player"],"Winger");
assert.equal(migrated.outOfPossession.roles["legacy-role-player"],"Winger");
assert.equal(legacy.formation,"4-3-3","phase migration must not rewrite legacy baseline fields");

const career = engine.newCareer({
  mode:"career", managerName:"Phase Tactics Regression",
  primaryNation:"England", nations:["England"], databaseSize:"small", clubId:"liv"
});
const home = career.clubs.find(club => club.id === "liv");
const away = career.clubs.find(club => club.id === "mci");
assert.ok(home && away,"test clubs should be available in the bundled world");
const tactics = JSON.parse(JSON.stringify(career.tactics));
const phases = engine.ensureTacticalPhases(tactics);
phases.inPossession.formation = "4-3-3";
phases.inPossession.mentality = "Attacking";
phases.inPossession.width = "Wide";
phases.inPossession.tempo = "Fast";
phases.inPossession.passing = "Short";
phases.inPossession.style = "Possession";
phases.inPossession.finalThird = "Work Ball Into Box";
phases.inPossession.buildUp = "Play Out Of Defence";
phases.outOfPossession.formation = "4-4-2";
phases.outOfPossession.line = "High Line";
phases.outOfPossession.pressing = "Press All Over";
phases.outOfPossession.pressIntensity = 17;
phases.outOfPossession.pressTrigger = "Always";
phases.outOfPossession.transition = "Counter-press";
const homeSquad = career.players.filter(player => player.clubId === home.id);
for (const player of homeSquad) {
  if (["RW","LW"].includes(player.position)) phases.inPossession.roles[player.id] = "Winger";
  if (["CM","DM"].includes(player.position)) phases.outOfPossession.roles[player.id] = "Ball Winning Midfielder";
}
const awayTactics = engine.aiTactics(away, career.season);
const result = engine.simulateMatch(home, away, career.players, tactics, awayTactics, {seed:"tactical-phases-regression-01"});
const repeated = engine.simulateMatch(home, away, career.players, tactics, awayTactics, {seed:"tactical-phases-regression-01"});

assert.ok(result && result.engine === "spatial-tick-v1","the spatial engine should continue to drive matches");
assert.deepEqual(result, repeated,"phase-aware matches should remain deterministic for identical inputs");
assert.equal(result.spatial.trace.length,180);
assert.equal(result.spatial.phases.home.inPossession.formation,"4-3-3");
assert.equal(result.spatial.phases.home.outOfPossession.formation,"4-4-2");
assert.equal(result.spatial.phases.home.inPossession.buildUp,"Play Out Of Defence");
assert.equal(result.spatial.phases.home.outOfPossession.pressTrigger,"Always");
assert.equal(result.spatial.phases.home.outOfPossession.transition,"Counter-press");
assert.ok(result.spatial.trace.some(t => t.players.some(p => p.phase === "inPossession")));
assert.ok(result.spatial.trace.some(t => t.players.some(p => p.phase === "outOfPossession")));
assert.ok(result.spatial.trace.some(t => t.players.some(p => p.role === "Winger")));
assert.ok(result.spatial.trace.some(t => t.players.some(p => p.role === "Ball Winning Midfielder")));
assert.ok(result.spatial.trace.every(t => t.interactionCount === 0 || t.interactionCount === 1),"only one ball interaction may resolve in a tick");
assert.ok(result.spatial.trace.every(t => t.ball.x >= 0 && t.ball.x < 14 && t.ball.y >= 0 && t.ball.y < 9));
assert.ok(result.spatial.trace.every(t => t.players.every(p => p.x >= 0 && p.x < 14 && p.y >= 0 && p.y < 9)));
assert.ok(result.stats.passAccuracy.every(n => n >= 0 && n <= 100));
assert.equal(result.homeGoals,result.events.filter(e => e.type === "goal" && e.clubId === home.id).length);
assert.equal(result.awayGoals,result.events.filter(e => e.type === "goal" && e.clubId === away.id).length);

const alternate = JSON.parse(JSON.stringify(tactics));
engine.ensureTacticalPhases(alternate).inPossession.formation = "4-1-4-1";
const alternateResult = engine.simulateMatch(home, away, career.players, alternate, awayTactics, {seed:"tactical-phases-regression-01"});
assert.equal(alternateResult.spatial.phases.home.inPossession.formation,"4-1-4-1","the configured attacking formation should reach the match simulation");

const ui = fs.readFileSync(path.join(__dirname,"..","advanced-ui.js"),"utf8");
const css = fs.readFileSync(path.join(__dirname,"..","advanced.css"),"utf8");
const deploy = fs.readFileSync(path.join(__dirname,"..",".github","workflows","deploy.yml"),"utf8");
const quality = fs.readFileSync(path.join(__dirname,"..",".github","workflows","quality.yml"),"utf8");
assert.ok(ui.includes('data-action="tactical-phase"'),"the tactics UI needs a phase preview toggle");
assert.ok(ui.includes('data-field="phaseRole"'),"the tactics UI needs per-phase player-role selectors");
assert.ok(ui.includes('data-phase="outOfPossession"') && ui.includes('data-phase="inPossession"'),"both phase forms must be editable");
assert.ok(ui.includes("phasePositions[tacticalBoardPhase]"),"the visualizer should save a separate position layout for each phase");
assert.ok(css.includes(".fm-board-phase-tools") && css.includes(".fm-phase-lineup-row"),"phase controls must have dedicated responsive styling");
assert.ok(deploy.includes("tests/tactical-phases.test.cjs"),"the Pages build should execute tactical phase tests");
assert.ok(quality.includes("tests/tactical-phases.test.cjs"),"quality checks should execute tactical phase tests");

console.log("Phase-aware tactics migration, roles, visualization and simulation tests passed.");
