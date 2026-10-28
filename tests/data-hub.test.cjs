const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../advanced-data.js");
require("../advanced-player-data.js");
require("../spatial-match-engine.js");
const engine = require("../advanced-engine.js");
const home = {id:"analytics-home",name:"Analytics Home FC",strength:72};
const away = {id:"analytics-away",name:"Analytics Away FC",strength:70};
const positions = ["GK","LB","CB","CB","RB","DM","CM","CM","LW","ST","RW"];
function makeSide(club) {
  return positions.map((position,index)=>({
    id:club.id+"-p"+index,name:club.name+" Player "+index,clubId:club.id,position,
    shirt:index+1,overall:58+(index%7),potential:70,fitness:100,injuredWeeks:0,suspendedMatches:0,
    attributes:{passing:10+index%8,dribbling:9+index%9,shooting:8+index%10,decisions:11,
      tackling:8+index%8,creativity:10+index%7,pace:10+index%9,stamina:12,goalkeeping:position==="GK"?14:1,aggression:9+index%7}
  }));
}
const players=makeSide(home).concat(makeSide(away));
const result=engine.simulateMatch(home,away,players,
  {formation:"4-3-3",mentality:"Attacking",passing:"Short",style:"Possession"},
  {formation:"4-2-3-1",mentality:"Balanced",passing:"Mixed",style:"Counter-Attack"},
  {seed:"xg-xa-data-hub-regression-01"});
assert.ok(result&&result.engine==="spatial-tick-v1","analytics regression needs the spatial match engine");
assert.ok(Array.isArray(result.stats.xg)&&Array.isArray(result.stats.xa),"team xG and xA should be published");
assert.ok(Array.isArray(result.stats.keyPasses),"team key-pass counts should be published");
assert.ok(result.stats.playerXg&&result.stats.playerXa&&result.stats.playerKeyPasses,"per-player analytics should be available");
const attempts=result.events.filter(event=>typeof event.xg==="number"&&Number.isFinite(event.xg));
assert.equal(attempts.length,result.stats.shots[0]+result.stats.shots[1],"every shot attempt should carry one xG event");
for(let side=0;side<2;side++){
  const team=side===0?home:away;
  const eventXg=attempts.filter(event=>event.clubId===team.id).reduce((sum,event)=>sum+event.xg,0);
  const eventXa=attempts.filter(event=>event.clubId===team.id).reduce((sum,event)=>sum+(Number(event.xa)||0),0);
  const keyPasses=attempts.filter(event=>event.clubId===team.id&&event.keyPass===true).length;
  assert.ok(Math.abs(Number(eventXg.toFixed(2))-result.stats.xg[side])<=0.02,"team xG must reconcile to shot-level events");
  assert.ok(Math.abs(Number(eventXa.toFixed(2))-result.stats.xa[side])<=0.02,"team xA must reconcile to shot-level pass attribution");
  assert.equal(keyPasses,result.stats.keyPasses[side],"key-pass counts must reconcile to shot events");
}
for(const event of attempts){
  assert.ok(Number.isFinite(event.xa),"every shot event should explicitly carry xA, including zero");
  if(event.keyPass){assert.ok(event.assistId,"key pass must identify its passer");assert.ok(event.xa>0,"key pass leading to a shot should receive positive xA");}
  else assert.equal(event.xa,0,"a shot without a linked completed pass should not receive xA");
}
for(const xg of Object.values(result.stats.playerXg))assert.ok(Number.isFinite(xg)&&xg>=0,"player xG must be finite and non-negative");
for(const xa of Object.values(result.stats.playerXa))assert.ok(Number.isFinite(xa)&&xa>=0,"player xA must be finite and non-negative");
const sumPlayerXg=Object.values(result.stats.playerXg).reduce((sum,value)=>sum+value,0);
const sumPlayerXa=Object.values(result.stats.playerXa).reduce((sum,value)=>sum+value,0);
assert.ok(Math.abs(Number(sumPlayerXg.toFixed(2))-result.stats.xg.reduce((a,b)=>a+b,0))<=0.04,"player xG must reconcile to team xG");
assert.ok(Math.abs(Number(sumPlayerXa.toFixed(2))-result.stats.xa.reduce((a,b)=>a+b,0))<=0.04,"player xA must reconcile to team xA");
const ui=fs.readFileSync(path.join(__dirname,"..","advanced-ui.js"),"utf8");
const engineSource=fs.readFileSync(path.join(__dirname,"..","advanced-engine.js"),"utf8");
const deploy=fs.readFileSync(path.join(__dirname,"..",".github","workflows","deploy.yml"),"utf8");
const quality=fs.readFileSync(path.join(__dirname,"..",".github","workflows","quality.yml"),"utf8");
assert.ok(ui.includes('["data-hub","▤","Performance Data Hub"]')&&ui.includes("function renderDataHub()"),"the performance hub must be reachable from navigation");
assert.ok(ui.includes("Player chance contribution")&&ui.includes("xG per shot"),"hub should show match and player-level analytics");
assert.ok(engineSource.includes('shooter.seasonStats.xg')&&engineSource.includes('passer.seasonStats.xa')&&engineSource.includes('fixtureId:fixture.id'),"xG/xA must persist into player and career-history records");
assert.ok(deploy.includes("tests/data-hub.test.cjs")&&quality.includes("tests/data-hub.test.cjs"),"deploy and quality workflows must run the data hub regression");
console.log("xG/xA event attribution, reconciliation, career persistence and Data Hub integration tests passed.");
