const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../advanced-data.js");
require("../advanced-player-data.js");
const engine = require("../advanced-engine.js");
const spatial = require("../spatial-match-engine.js");

const html = fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const serviceWorker = fs.readFileSync(path.join(__dirname,"..","service-worker.js"),"utf8");
const deployWorkflow = fs.readFileSync(path.join(__dirname,"..",".github","workflows","deploy.yml"),"utf8");
const qualityWorkflow = fs.readFileSync(path.join(__dirname,"..",".github","workflows","quality.yml"),"utf8");
const uiSource = fs.readFileSync(path.join(__dirname,"..","advanced-ui.js"),"utf8");
const engineSource = fs.readFileSync(path.join(__dirname,"..","advanced-engine.js"),"utf8");
assert.ok(html.indexOf('src="spatial-match-engine.js"') < html.indexOf('src="advanced-engine.js"'),
  "the spatial engine must load before the career engine binds its simulator");
assert.ok(serviceWorker.includes("touchline-manager-v21") && serviceWorker.includes('"./spatial-match-engine.js"'),
  "offline cache should version and include the spatial engine");
assert.ok(deployWorkflow.includes("spatial-match-engine.js") && deployWorkflow.includes("tests/spatial-match.test.cjs"),
  "the Pages workflow must validate and ship the spatial engine");
assert.ok(qualityWorkflow.includes("node tests/advanced.test.cjs") && qualityWorkflow.includes("node tests/spatial-match.test.cjs"),
  "quality workflow should run the regression and spatial-engine suites");
assert.ok(engineSource.includes('spatialEngine.simulateMatch') && engineSource.includes('matchContext'),
  "the career match simulation must call the spatial engine with a deterministic fixture context");
assert.ok(uiSource.includes("live.result.spatial") && uiSource.includes("live.spatialPlayersById"),
  "live-pitch rendering should use cached player positions from the spatial trace");

assert.equal(global.FM_SPATIAL_MATCH_ENGINE, spatial, "spatial engine should publish its browser/global API");
assert.equal(spatial.ROWS, 9);
assert.equal(spatial.COLS, 14);
assert.equal(spatial.TICKS, 180);

const home = {id:"home-test", name:"Home Test FC", strength:72};
const away = {id:"away-test", name:"Away Test FC", strength:70};
const positions = ["GK","LB","CB","CB","RB","DM","CM","CM","LW","ST","RW"];
function makeSide(club, start) {
  return positions.map((position,index)=>({
    id:club.id+"-p"+index,name:club.name+" Player "+index,clubId:club.id,position,
    shirt:index+1,overall:58+(index%7),potential:70,fitness:100,injuredWeeks:0,suspendedMatches:0,
    attributes:{passing:10+index%8,dribbling:9+index%9,shooting:8+index%10,decisions:11,
      tackling:8+index%8,creativity:10+index%7,pace:10+index%9,stamina:12,goalkeeping:position==="GK"?14:1,aggression:9+index%7}
  }));
}
const players = makeSide(home,0).concat(makeSide(away,11));
const tacticsHome = {formation:"4-3-3",mentality:"Attacking",style:"Possession",passing:"Short",pressing:"Press All Over",pressIntensity:15};
const tacticsAway = {formation:"4-2-3-1",mentality:"Balanced",style:"Counter-Attack",passing:"Mixed",pressing:"Balanced",pressIntensity:10};
const a = engine.simulateMatch(home,away,players,tacticsHome,tacticsAway,{seed:"spatial-test-2026-match-01"});
const b = engine.simulateMatch(home,away,players,tacticsHome,tacticsAway,{seed:"spatial-test-2026-match-01"});

assert.equal(a.engine,"spatial-tick-v1","the regular simulation API should use the new engine when available");
assert.equal(a.spatial.trace.length,180,"a match should be simulated as 180 half-minute ticks");
assert.equal(a.spatial.rows,9);
assert.equal(a.spatial.columns,14);
assert.deepEqual(a,b,"the same fixture seed and match inputs must produce an identical result");
assert.ok(a.spatial.trace.every(t=>t.ball.x>=0&&t.ball.x<14&&t.ball.y>=0&&t.ball.y<9),"the ball must remain on the 9x14 grid");
assert.ok(a.spatial.trace.every(t=>t.interactionCount===0||t.interactionCount===1),"a tick must resolve at most one ball interaction");
assert.ok(a.spatial.trace.every(t=>t.players.length===22&&t.players.every(p=>p.x>=0&&p.x<14&&p.y>=0&&p.y<9)),"all player coordinates must remain on the pitch");
assert.ok(a.spatial.finalPlayers.every(p=>p.fitness<=100&&p.fitness>=15),"fatigue values must remain bounded");
assert.ok(a.stats.possession[0]+a.stats.possession[1]===100,"possession should sum to 100%");
assert.ok(a.stats.shots[0]>=0&&a.stats.shots[1]>=0);
assert.ok(a.stats.passAccuracy.every(value=>value>=0&&value<=100),"pass accuracy must not exceed 100 percent");
assert.ok(a.stats.shots[0]+a.stats.shots[1]>0,"the deterministic fixture should produce actual shot decisions");
assert.equal(a.homeGoals,a.events.filter(e=>e.type==="goal"&&e.clubId===home.id).length);
assert.equal(a.awayGoals,a.events.filter(e=>e.type==="goal"&&e.clubId===away.id).length);
assert.ok(a.lineups[home.id].length>=7&&a.lineups[away.id].length>=7);
assert.ok(a.events.every(e=>e.minute>=1&&e.minute<=90));

const differentSeed = engine.simulateMatch(home,away,players,tacticsHome,tacticsAway,{seed:"spatial-test-2026-match-02"});
assert.notEqual(a.spatial.seed,differentSeed.spatial.seed,"different fixture seeds should be recorded distinctly");
const fallback = spatial.simulateMatch(home,away,players.slice(0,5),tacticsHome,tacticsAway,{seed:"short-roster"});
assert.equal(fallback,null,"short squads should fall back to the legacy simulator rather than producing invalid lineups");
console.log("Spatial tick match engine tests passed.");
