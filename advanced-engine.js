(function (root) {
  "use strict";
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (xs) => xs[Math.floor(Math.random() * xs.length)];
  const fmtDate = (iso) => new Date(iso + "T12:00:00Z").toISOString().slice(0, 10);
  const POSITIONS = ["GK","RB","CB","CB","LB","DM","CM","CM","RW","LW","ST","GK","CB","CB","RB","LB","DM","CM","AM","RW","LW","ST","ST","CM","CB"];
  const FORMATIONS = {
    "4-3-3": ["GK","LB","CB","CB","RB","DM","CM","CM","LW","ST","RW"],
    "4-2-3-1": ["GK","LB","CB","CB","RB","DM","DM","LW","AM","RW","ST"],
    "4-4-2": ["GK","LB","CB","CB","RB","LW","CM","CM","RW","ST","ST"],
    "3-5-2": ["GK","CB","CB","CB","LB","DM","CM","CM","RB","ST","ST"],
    "4-1-4-1": ["GK","LB","CB","CB","RB","DM","CM","CM","LW","RW","ST"]
  };
  const ROLES = {
    GK:["Sweeper Keeper","Goalkeeper"],RB:["Wing Back","Inverted Wing Back","Full Back"],LB:["Wing Back","Inverted Wing Back","Full Back"],CB:["Central Defender","Ball Playing Defender","Libero"],DM:["Anchor Man","Ball Winning Midfielder","Deep Lying Playmaker"],CM:["Box-to-Box","Deep Lying Playmaker","Advanced Playmaker","Ball Winning Midfielder"],AM:["Advanced Playmaker","Shadow Striker"],RW:["Winger","Inside Forward"],LW:["Winger","Inside Forward"],ST:["Poacher","Target Man","Pressing Forward","Complete Forward","False 9"]
  };
  const ATTRS = ["crossing","dribbling","heading","passing","shooting","setPieces","tackling","technique","aggression","creativity","decisions","leadership","movement","positioning","teamwork","aerial","pace","stamina","strength","goalkeeping"];
  const ATTR_LABELS = {crossing:"Crossing",dribbling:"Dribbling",heading:"Heading",passing:"Passing",shooting:"Shooting",setPieces:"Set pieces",tackling:"Tackling",technique:"Technique",aggression:"Aggression",creativity:"Creativity",decisions:"Decisions",leadership:"Leadership",movement:"Movement",positioning:"Positioning",teamwork:"Teamwork",aerial:"Aerial",pace:"Pace",stamina:"Stamina",strength:"Strength",goalkeeping:"Goalkeeping"};
  function baseAttributes(p) {
    const o = clamp(Math.round((p.overall || 55) / 5), 1, 20);
    const v = {};
    ATTRS.forEach((key) => {
      let n = Math.round(o + rand(-3, 3));
      if (key === "goalkeeping") n = p.position === "GK" ? Math.round((p.overall || 55) / 5) : 1;
      if (p.position === "ST" && ["shooting","movement","heading"].includes(key)) n += 2;
      if (["CB","RB","LB","DM"].includes(p.position) && ["tackling","positioning","strength"].includes(key)) n += 2;
      if (["AM","CM","RW","LW"].includes(p.position) && ["passing","technique","creativity","dribbling"].includes(key)) n += 2;
      v[key] = clamp(n,1,20);
    });
    return v;
  }
  function playerOverall(p) {
    const weights = p.position === "GK" ? {goalkeeping:5,decisions:1,positioning:1,passing:1,leadership:1} :
      p.position === "ST" ? {shooting:4,movement:3,pace:2,technique:2,decisions:2,heading:1,teamwork:1} :
      ["CB","RB","LB","DM"].includes(p.position) ? {tackling:3,positioning:3,heading:2,decisions:2,passing:1,pace:1,teamwork:1} :
      {passing:3,technique:2,creativity:2,decisions:2,stamina:1,teamwork:1,dribbling:1};
    const attr = p.attributes || {};
    let num=0, den=0;
    Object.keys(weights).forEach(k=>{num+=(Number(attr[k])||10)*weights[k];den+=weights[k];});
    return clamp(Math.round(num/den*5),20,99);
  }
  function normalizePlayer(p, fallbackClub) {
    const position = ["GK","RB","CB","LB","DM","CM","AM","RW","LW","ST"].includes(p.position || p.pos) ? (p.position || p.pos) : "CM";
    const rawOverall = Number(p.overall || p.ovr || 55);
    const player = {
      id:String(p.id || ("p-"+Math.random().toString(36).slice(2,10))),
      name:String(p.name || "Unnamed import").slice(0,100),
      clubId:p.clubId || fallbackClub || null,
      position:position,nationality:String(p.nationality || p.country || "Unknown"),contractUntil:p.contractUntil||p.contract?.until||null,
      age:clamp(Number(p.age || 19),15,48),shirt:clamp(Number(p.shirt || p.number || 0),0,99),
      overall:clamp(rawOverall,20,99),potential:clamp(Number(p.potential || rawOverall+5),20,99),
      value:Math.max(0,Number(p.value || p.marketValue || 0)),wage:Math.max(0,Number(p.wage || p.weeklyWage || 0)),
      contractYears:clamp(Number(p.contractYears ?? 2),0,8),fitness:clamp(Number(p.fitness || 94),0,100),
      morale:clamp(Number(p.morale || 72),0,100),form:Array.isArray(p.form)?p.form.slice(-5):[6.8,6.9,7.0,7.0,6.9],
      goals:Number(p.goals||0),assists:Number(p.assists||0),injuredWeeks:Number(p.injuredWeeks||0),
      realData:p.realData !== false && !p.generated, source:p.source || (p.generated?"Generated academy slot":"Imported dataset"),
      generated:!!p.generated, attributes:p.attributes && typeof p.attributes==="object" ? p.attributes : null,
      role:p.role || null, status:p.status || "Available", dob:p.dateOfBirth || p.dob || null
    };
    player.attributes = Object.assign(baseAttributes(player), player.attributes || {});
    player.overall = playerOverall(player);
    if (player.position !== "GK") player.attributes.goalkeeping = 1;
    return player;
  }
  function clubStrength(players) {
    const first = players.slice().sort((a,b)=>b.overall-a.overall).slice(0,11);
    if (!first.length) return 45;
    return first.reduce((s,p)=>s+p.overall,0)/first.length;
  }
  function generateRoster(club, existing, dbSize) {
    const roster = existing.filter(p=>p.clubId===club.id).map(p=>normalizePlayer(p,club.id));
    const minimum = dbSize === "large" ? 30 : 25;
    let next = 1;
    while(roster.length < minimum) {
      const pos = POSITIONS[(roster.length+club.id.length)%POSITIONS.length];
      const overall = clamp(Math.round(club.strength || 58) - rand(5,18),35,78);
      const p = normalizePlayer({
        id:"academy-"+club.id+"-"+String(next).padStart(2,"0"),
        name:"ACADEMY SLOT "+String(next).padStart(2,"0")+" · "+club.code,
        clubId:club.id,position:pos,nationality:club.country,age:rand(17,22),
        overall:overall,potential:clamp(overall+rand(3,14),overall,90),
        value:Math.round((overall*overall)*500),wage:Math.round(overall*70),
        contractYears:rand(1,4),fitness:rand(80,100),morale:rand(60,84),
        generated:true,realData:false,source:"Procedurally generated academy slot — not a real player"
      },club.id);
      p.attributes = baseAttributes(p);
      roster.push(p); next++;
    }
    return roster;
  }
  function circleSchedule(clubIds, roundsCount) {
    const ids=clubIds.slice();
    if(ids.length%2) ids.push(null);
    const n=ids.length, rounds=[];
    for(let round=0;round<n-1;round++) {
      const games=[];
      for(let i=0;i<n/2;i++) {
        const a=ids[i],b=ids[n-1-i];
        if(a&&b) games.push({homeId:round%2===0?a:b,awayId:round%2===0?b:a,round:round+1,played:false,competition:"league"});
      }
      rounds.push(games);
      ids.splice(1,0,ids.pop());
    }
    let output=rounds.slice(0,Math.min(roundsCount||rounds.length,rounds.length)).flat();
    if(roundsCount===undefined || roundsCount>=n-1) {
      const reverse=output.map(f=>({homeId:f.awayId,awayId:f.homeId,round:f.round+n-1,played:false,competition:"league"}));
      output=output.concat(reverse);
    }
    return output.map((f,i)=>Object.assign({id:"fix-"+f.round+"-"+i,homeGoals:null,awayGoals:null,date:null,stats:null,events:[]},f));
  }
  function setFixtureDates(fixtures, startISO) {
    const start=new Date(startISO+"T12:00:00Z");
    fixtures.forEach(f=>{ const d=new Date(start); d.setUTCDate(d.getUTCDate()+(f.round-1)*7); f.date=d.toISOString().slice(0,10); });
    return fixtures;
  }
  function buildUCL(clubs) {
    const uefaCountries=["England","Spain","Italy","Germany","France","Portugal","Netherlands","Belgium","Turkey","Greece","Austria","Switzerland","Denmark","Norway","Sweden"];
    const entrants=clubs.filter(c=>uefaCountries.includes(c.country)&&Number(c.tier||1)===1).slice().sort((a,b)=>b.strength-a.strength).slice(0,36);
    if(entrants.length<36) return {name:"Continental league phase",note:"Import more clubs to run a full 36-team phase.",teams:entrants.map(c=>c.id),fixtures:[]};
    const schedule=circleSchedule(entrants.map(c=>c.id),8).filter(f=>f.round<=8);
    schedule.forEach((f,i)=>{f.id="ucl-"+f.round+"-"+i;f.competition="ucl";f.date=null;});
    return {name:"Continental league phase",note:"36 teams, 8 different opponents per club, knockout places for top finishers.",teams:entrants.map(c=>c.id),fixtures:schedule};
  }
  function normalizePersonName(value) {
    return String(value||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\\s+/g," ");
  }
  function stableHash(value) {
    const s=String(value||"");let h=2166136261;
    for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
    return h>>>0;
  }
  function ageAtDate(dob, isoDate) {
    if(!dob)return 24;
    const b=new Date(String(dob).slice(0,10)+"T12:00:00Z"),d=new Date(String(isoDate||"2026-07-01")+"T12:00:00Z");
    if(Number.isNaN(b.getTime()))return 24;
    let age=d.getUTCFullYear()-b.getUTCFullYear();
    if(d.getUTCMonth()<b.getUTCMonth()||(d.getUTCMonth()===b.getUTCMonth()&&d.getUTCDate()<b.getUTCDate()))age--;
    return clamp(age,15,48);
  }
  function estimateSnapshotPlayer(raw, clubId) {
    const age=ageAtDate(raw.dateOfBirth||raw.dob,"2026-07-01");
    const base=raw.positionGroup==="GK"?61:raw.positionGroup==="DF"?62:raw.positionGroup==="FW"?64:63;
    const ageBonus=age<21?7:age<24?6:age<28?5:age<32?2:-4;
    const overall=clamp(base+(stableHash(raw.id||raw.name)%18)+ageBonus,55,89);
    const ageValue=age<22?1.55:age<26?1.35:age<30?1:age<33?.65:.32;
    const value=Math.round(Math.max(150000,Math.pow(Math.max(1,overall-35),2)*18000*ageValue));
    const wage=Math.round(Math.max(650,value*.0015));
    const pos=String(raw.positionGroup||raw.pos||"MF").toUpperCase();
    const mappedPosition=pos==="GK"?"GK":pos==="DF"?"CB":pos==="FW"?"ST":"CM";
    return {
      id:String(raw.id),name:raw.name,clubId:clubId,position:mappedPosition,
      sourcePositionGroup:pos,nationality:raw.nationalTeam||"Unknown",nationalTeam:raw.nationalTeam||null,
      age:age,dateOfBirth:raw.dateOfBirth||null,shirt:Number(raw.shirt||0),
      overall:overall,potential:clamp(overall+(age<22?12:age<25?7:age<29?3:0),overall,95),
      value:value,valueEstimated:true,wage:wage,wageKnown:false,wageEstimated:true,ratingsEstimated:true,
      contractYears:age<24?4:age<29?3:2,fitness:94,morale:74,goals:0,assists:0,injuredWeeks:0,
      realData:true,generated:false,worldCupSnapshot:true,source:raw.source||"2026 World Cup registered squad snapshot"
    };
  }
  function makeWorld(options) {
    const source=root.FM_WORLD_DATA;
    if(!source) throw new Error("FM_WORLD_DATA missing — load advanced-data.js first");
    const wc=root.FM_WORLD_CUP_DATA||{players:[],source:"none",snapshotDate:null};
    const selectedNations=(options&&options.nations&&options.nations.length?options.nations:["England","Spain","Egypt"]).slice(0,5);
    const clubs=source.clubs.map(c=>Object.assign({},c));
    const codeCountry={ENG:"England",ESP:"Spain",GER:"Germany",ITA:"Italy",FRA:"France",POR:"Portugal",NED:"Netherlands",BEL:"Belgium",TUR:"Turkey",GRE:"Greece",AUT:"Austria",SUI:"Switzerland",DEN:"Denmark",NOR:"Norway",SWE:"Sweden",BRA:"Brazil",ARG:"Argentina",USA:"United States",MEX:"Mexico",JPN:"Japan",KOR:"South Korea",AUS:"Australia",MAR:"Morocco",RSA:"South Africa",UAE:"United Arab Emirates",EGY:"Egypt",KSA:"Saudi Arabia",ALG:"Algeria",ARM:"Armenia",AZE:"Azerbaijan",BIH:"Bosnia and Herzegovina",BUL:"Bulgaria",CAN:"Canada",CHI:"Chile",CHN:"China",COL:"Colombia",CRC:"Costa Rica",CRO:"Croatia",CYP:"Cyprus",CZE:"Czech Republic",ECU:"Ecuador",GHA:"Ghana",HAI:"Haiti",HON:"Honduras",HUN:"Hungary",IDN:"Indonesia",IRL:"Ireland",IRN:"Iran",IRQ:"Iraq",ISR:"Israel",JOR:"Jordan",KAZ:"Kazakhstan",MAS:"Malaysia",NZL:"New Zealand",PAN:"Panama",PAR:"Paraguay",POL:"Poland",QAT:"Qatar",ROU:"Romania",RUS:"Russia",SCO:"Scotland",SRB:"Serbia",SVK:"Slovakia",SVN:"Slovenia",THA:"Thailand",TUN:"Tunisia",URU:"Uruguay",UZB:"Uzbekistan",VEN:"Venezuela",WAL:"Wales"};
    const clubKey=(name,country)=>String(country||"Unknown")+"|"+normalizeClubName(name);
    const byClubKey=new Map(),byName=new Map();
    clubs.forEach(c=>{
      const key=normalizeClubName(c.name);
      byName.set(key,c);
      byClubKey.set(clubKey(c.name,c.country),c);
    });
    const playerRecords=source.players.map(p=>Object.assign({},p));
    const sourceNames=new Set((wc.players||[]).map(p=>normalizePersonName(p.name)));
    // A national-team squad snapshot is a stronger signal for current club affiliation than the older hand-curated demo seed.
    for(let i=playerRecords.length-1;i>=0;i--)if(sourceNames.has(normalizePersonName(playerRecords[i].name)))playerRecords.splice(i,1);
    const snapshotPlayers=[];
    (wc.players||[]).forEach(raw=>{
      if(!raw||!raw.name||!raw.clubName)return;
      const country=raw.clubCountry||codeCountry[raw.clubCountryCode]||"Unknown";
      const key=clubKey(raw.clubName,country);
      let c=byClubKey.get(key);
      if(!c){
        const normalized=normalizeClubName(raw.clubName);
        const maybe=byName.get(normalized);
        if(maybe&&(!country||country==="Unknown"||maybe.country===country))c=maybe;
      }
      if(!c){
        const baseId="wc-club-"+String(normalizeClubName(raw.clubName)).replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,58);
        let id=baseId+"-"+String(raw.clubCountryCode||"xx").toLowerCase();
        let suffix=2;
        while(clubs.some(x=>x.id===id)){id=baseId+"-"+String(raw.clubCountryCode||"xx").toLowerCase()+"-"+suffix;suffix++;}
        c={id:id,name:String(raw.clubName).trim(),code:String(raw.clubName).trim().split(/\\s+/).slice(0,3).map(x=>x[0]||"").join("").toUpperCase().slice(0,3),
          country:country,nation:country,league:"Unverified division · "+country,stadium:"Not supplied by the player source",
          primary:"#334155",secondary:"#F8FAFC",capacity:0,transferBudget:0,wageBudget:0,strength:62,tier:0,
          seeded:false,unverifiedDivision:true,source:"2026 World Cup player club affiliation; division, stadium and kit colours not verified"};
        clubs.push(c);byClubKey.set(key,c);if(!byName.has(normalizeClubName(c.name)))byName.set(normalizeClubName(c.name),c);
      }
      const rawPos=String(raw.positionGroup||"MF").toUpperCase();
      const age=ageAtDate(raw.dateOfBirth,"2026-07-01");
      const estimated=estimateSnapshotPlayer(raw,c.id);
      snapshotPlayers.push(Object.assign(estimated,{sourcePositionGroup:rawPos,age:age,shirt:Number(raw.shirt||0),clubName:raw.clubName,clubCountry:country}));
    });
    playerRecords.push(...snapshotPlayers);
    clubs.forEach(c=>{c.strength=c.strength||62;if(!c.unverifiedDivision)c.wageBudget=c.wageBudget||1200000;});
    const players=[];
    clubs.forEach(c=>{
      playerRecords.filter(p=>p.clubId===c.id).forEach(p=>{
        const normalized=normalizePlayer(p,c.id);
        Object.assign(normalized,{
          nationalTeam:p.nationalTeam||null,sourcePositionGroup:p.sourcePositionGroup||null,
          dateOfBirth:p.dateOfBirth||p.dob||null,clubName:p.clubName||null,clubCountry:p.clubCountry||null,
          worldCupSnapshot:!!p.worldCupSnapshot,
          valueEstimated:!!p.valueEstimated||p.source==="seeded demo snapshot"||!!p.generated,
          wageEstimated:!!p.wageEstimated||p.source==="seeded demo snapshot"||!!p.generated,
          wageKnown:p.wageKnown===true&&!p.wageEstimated,
          ratingsEstimated:!!p.ratingsEstimated||p.source==="seeded demo snapshot"||!!p.generated
        });
        players.push(normalized);
      });
    });
    const selectedSet=new Set(selectedNations);
    clubs.forEach(c=>{
      const real=players.filter(p=>p.clubId===c.id);
      if(real.length)c.strength=clubStrength(real);
      // Seeded clubs remain fully playable. Unverified snapshot-only clubs have real listed internationals but no invented 25-man squads unless selected.
      if(!c.unverifiedDivision||selectedSet.has(c.country)){
        const roster=generateRoster(c,players,options&&options.databaseSize);
        roster.forEach(p=>{
          if(!players.some(x=>x.id===p.id)){
            p.valueEstimated=true;p.wageEstimated=true;p.wageKnown=false;p.ratingsEstimated=true;
            players.push(p);
          }
        });
      }
    });
    const leagues=[...new Set(clubs.filter(c=>!c.unverifiedDivision).map(c=>c.league))];
    const calendar={};
    leagues.forEach(l=>{
      const members=clubs.filter(c=>!c.unverifiedDivision&&c.league===l);
      calendar[l]=setFixtureDates(circleSchedule(members.map(c=>c.id)).map(f=>Object.assign(f,{competition:l})),"2026-07-08");
    });
    const sourceLabel=(wc.players||[]).length
      ? source.dataSeason+" · "+(wc.players||[]).length+" registered World Cup players (snapshot "+wc.snapshotDate+")"
      : source.dataSeason;
    return {clubs:clubs,players:players,leagues:leagues,calendar:calendar,fixtures:[],createdAt:new Date().toISOString(),sourceSeason:sourceLabel,
      worldCupSource:wc.source||null,worldCupSnapshotDate:wc.snapshotDate||null,worldCupPlayers:(wc.players||[]).length,
      realRosterClubCount:Array.from(new Set(snapshotPlayers.map(p=>p.clubId))).length,
      notes:source.databaseNotes.concat((wc.players||[]).length?[
        "Includes the 2026 World Cup registered national-team roster snapshot from openfootball/worldcup.json (CC0 1.0 Universal; snapshot date "+wc.snapshotDate+").",
        "Club affiliations are taken from that roster snapshot. This is not a complete 2026/27 club squad database. Existing main-database clubs are completed with clearly marked generated slots.",
        "Clubs discovered only through national-team rosters are included with tier, stadium, kit colours and budgets marked as unverified; they do not receive invented league fixtures."
      ]:[])};
  }
  function defaultTactics() {
    return {formation:"4-2-3-1",mentality:"Balanced",width:"Balanced",tempo:"Normal",passing:"Mixed",finalThird:"Work Ball Into Box",line:"Balanced",pressing:"Balanced",tackling:"Normal",offsideTrap:false,style:"Possession",roles:{},captainId:null,viceCaptainId:null,penaltyId:null,freeKickId:null,cornerId:null};
  }
  function createDomesticCup(nation, clubs, season) {
    const countryClubs=clubs.filter(c=>c.country===nation&&!c.unverifiedDivision).slice().sort((a,b)=>b.strength-a.strength);
    const names={"England":"FA Cup","Spain":"Copa del Rey","Italy":"Coppa Italia","Germany":"DFB-Pokal","France":"Coupe de France","Egypt":"Egypt Cup","Saudi Arabia":"King's Cup"};
    const ids=countryClubs.map(c=>c.id);
    const fixtures=[];
    if(ids.length>=6){
      fixtures.push({id:"cup-"+season+"-r1-1",homeId:ids[2],awayId:ids[5],round:1,competition:"cup",played:false,homeGoals:null,awayGoals:null,date:season+"-08-15",events:[]});
      fixtures.push({id:"cup-"+season+"-r1-2",homeId:ids[3],awayId:ids[4],round:1,competition:"cup",played:false,homeGoals:null,awayGoals:null,date:season+"-08-15",events:[]});
    } else {
      for(let i=0;i+1<ids.length;i+=2)fixtures.push({id:"cup-"+season+"-r1-"+i,homeId:ids[i],awayId:ids[i+1],round:1,competition:"cup",played:false,homeGoals:null,awayGoals:null,date:season+"-08-15",events:[]});
    }
    return {name:names[nation]||"National Cup",nation:nation,season:season,stage:"Round of 6",round:1,byes:ids.slice(0,2),participants:ids,fixtures:fixtures,champion:null,complete:false,note:"Playable cup framework for clubs in the bundled sample nation; import a complete pyramid before treating entry rules as official."};
  }
  function simulateDomesticCupRound(state) {
    const cup=state.domesticCup;if(!cup||cup.complete)return {ok:false,message:"The domestic cup is complete."};
    const games=cup.fixtures.filter(f=>f.round===cup.round&&!f.played);
    if(!games.length)return {ok:false,message:"No fixtures are scheduled for this cup round."};
    const winners=[];
    games.forEach(f=>{
      const h=state.clubs.find(c=>c.id===f.homeId),a=state.clubs.find(c=>c.id===f.awayId);
      const result=simulateMatch(h,a,state.players,f.homeId===state.userClubId?state.tactics:defaultTactics(),f.awayId===state.userClubId?state.tactics:defaultTactics());
      f.played=true;f.homeGoals=result.homeGoals;f.awayGoals=result.awayGoals;f.stats=result.stats;f.events=result.events;
      let winnerId=f.homeGoals===f.awayGoals?(Math.random()<.5?f.homeId:f.awayId):(f.homeGoals>f.awayGoals?f.homeId:f.awayId);
      f.winnerId=winnerId;winners.push(winnerId);
      if(f.homeId===state.userClubId||f.awayId===state.userClubId)applyResult(state,f,result);
    });
    let advancing=winners;
    if(cup.round===1)advancing=cup.byes.concat(winners);
    if(cup.round===1||cup.round===2){
      const nextRound=cup.round+1;
      const nextFixtures=[];
      for(let i=0;i+1<advancing.length;i+=2){
        nextFixtures.push({id:"cup-"+cup.season+"-r"+nextRound+"-"+(i/2+1),homeId:advancing[i],awayId:advancing[i+1],round:nextRound,competition:"cup",played:false,homeGoals:null,awayGoals:null,date:null,events:[]});
      }
      cup.fixtures.push(...nextFixtures);cup.round=nextRound;cup.stage=nextRound===2?"Semi-finals":"Final";
      if(!nextFixtures.length){cup.complete=true;cup.champion=advancing[0]||null;}
      return {ok:true,message:cup.stage+" scheduled.",winners:advancing};
    }
    cup.complete=true;cup.champion=advancing[0]||games[0]?.winnerId||null;cup.stage="Completed";
    state.inbox.unshift({id:"cup-champion-"+cup.season,title:cup.name+" champions",text:(state.clubs.find(c=>c.id===cup.champion)?.name||"A club")+" won the cup.",read:false,kind:"success",day:state.day});
    if(cup.champion===state.userClubId)state.board.confidence=clamp(state.board.confidence+8,0,100);
    return {ok:true,message:(state.clubs.find(c=>c.id===cup.champion)?.name||"A club")+" win the "+cup.name+".",champion:cup.champion};
  }
  function simulateContinentalRound(state) {
    const c=state.continental;
    if(!c||!c.fixtures.length)return {ok:false,message:"Import at least 36 clubs for the continental league phase."};
    const next=c.fixtures.filter(f=>!f.played).reduce((n,f)=>Math.min(n||f.round,f.round),0);
    if(!next)return {ok:false,message:"All continental fixtures have been played."};
    let count=0;
    c.fixtures.filter(f=>!f.played&&f.round===next).forEach(f=>{
      const h=state.clubs.find(x=>x.id===f.homeId),a=state.clubs.find(x=>x.id===f.awayId);if(!h||!a)return;
      const r=simulateMatch(h,a,state.players,f.homeId===state.userClubId?state.tactics:defaultTactics(),f.awayId===state.userClubId?state.tactics:defaultTactics());
      f.played=true;f.homeGoals=r.homeGoals;f.awayGoals=r.awayGoals;f.stats=r.stats;f.events=r.events;count++;
      if(f.homeId===state.userClubId||f.awayId===state.userClubId)applyResult(state,f,r);
    });
    c.lastRound=next;
    return {ok:true,message:"Continental round "+next+" simulated ("+count+" matches).",round:next,count:count};
  }
  function newCareer(options) {
    const world=makeWorld(options||{});
    const nation=(options&&options.primaryNation)||((options&&options.nations&&options.nations[0])||"England");
    const candidates=world.clubs.filter(c=>c.country===nation&&!c.unverifiedDivision);
    const preferred=(options&&options.clubId)||null;
    const chosen=candidates.find(c=>c.id===preferred)||candidates.slice().sort((a,b)=>b.strength-a.strength)[Math.min(candidates.length-1,Math.floor(candidates.length*.55))];
    if(!chosen) throw new Error("No clubs found for selected nation. Import a club database or select another nation.");
    const clubPlayers=world.players.filter(p=>p.clubId===chosen.id);
    const state={
      schemaVersion:1,mode:options.mode||"career",manager:{name:options.managerName||"Alex Manager",nationality:options.managerNationality||nation,reputation:Number(options.reputation||45),badge:options.badge||"Tactician",clubId:chosen.id},
      season:2026,seasonNumber:1,day:"2026-07-01",seasonDays:0,userClubId:chosen.id,nation:nation,playableNations:options.nations||[nation],databaseSize:options.databaseSize||"medium",
      world:world,players:world.players,clubs:world.clubs,fixtures:world.calendar[chosen.league]||[],continental:buildUCL(world.clubs),domesticCup:createDomesticCup(nation,world.clubs,2026),tactics:defaultTactics(),
      finances:{balance:chosen.transferBudget,transferBudget:chosen.transferBudget,wageBudget:chosen.wageBudget,weeklyIncome:350000,weeklyCosts:0,seasonIncome:0,seasonCosts:0},
      board:{confidence:68,expectation:"Finish in the top half",objectives:["Maintain positive finances","Develop young talent"],lastReview:null},
      morale:76,harmony:72,trainingFocus:"Balanced",lastTrainingDay:null,week:0,matchPending:null,careerHistory:[],inbox:[{id:"welcome",day:"2026-07-01",title:"Welcome to the club",text:"Review your squad, set your tactical identity, and prepare for the first league fixture.",read:false,kind:"info"}],
      staff:[{id:"asst",type:"Assistant Manager",name:"Assistant Coach",rating:3,salary:3000},{id:"physio",type:"Physio",name:"Club Physio",rating:2,salary:1800},{id:"scout",type:"Scout",name:"Regional Scout",rating:2,salary:1600}],
      transfers:[],sponsorships:[],trainingLog:[],challenge:options.mode==="challenge"?(options.challenge||"Relegation survival"):null,achievements:[],settings:{currency:"GBP",wageDisplay:"weekly",language:"en",speed:1,highlightMode:"key",databaseSource:world.sourceSeason},generatedCount:world.players.filter(p=>p.generated).length
    };
    clubPlayers.slice().sort((a,b)=>b.overall-a.overall).forEach((p,i)=>{p.registered=i<25;});
    const startingXI=clubPlayers.slice().sort((a,b)=>b.overall-a.overall).slice(0,11);
    if(startingXI[0]) state.tactics.captainId=startingXI[0].id;
    state.finances.weeklyCosts=clubPlayers.reduce((a,p)=>a+p.wage,0);
    return state;
  }
  function currentClub(state) { return state.clubs.find(c=>c.id===state.userClubId); }
  function squad(state,clubId) { return state.players.filter(p=>p.clubId===clubId); }
  function selectedXI(state,clubId) {
    const list=squad(state,clubId).filter(p=>p.injuredWeeks<=0).slice();
    const plan=FORMATIONS[state.tactics.formation]||FORMATIONS["4-2-3-1"], out=[], used=new Set();
    plan.forEach(pos=>{
      const choices=list.filter(p=>!used.has(p.id)).sort((a,b)=>positionFit(b.position,pos)-positionFit(a.position,pos)+b.overall-a.overall);
      const chosen=choices[0];
      if(chosen){out.push(Object.assign({},chosen,{assignedPosition:pos}));used.add(chosen.id);}
    });
    return out;
  }
  function positionFit(actual,wanted) {
    if(actual===wanted) return 100;
    const groups={GK:["GK"],RB:["RB","LB","CB"],LB:["LB","RB","CB"],CB:["CB","RB","LB","DM"],DM:["DM","CM","CB"],CM:["CM","DM","AM"],AM:["AM","CM","RW","LW"],RW:["RW","LW","AM"],LW:["LW","RW","AM"],ST:["ST","AM","RW","LW"]};
    return (groups[wanted]||[]).includes(actual)?45:0;
  }
  function tacticalDelta(t) {
    let attack=0,defense=0,fatigue=0;
    const m=t.mentality||"Balanced";
    if(m==="Attacking"||m==="Overload") {attack+=m==="Overload"?14:8;defense-=5;fatigue+=.25;}
    if(m==="Defensive"||m==="Contain") {attack-=5;defense+=9;fatigue-=.08;}
    if(t.tempo==="Fast"){attack+=5;fatigue+=.18;} if(t.tempo==="Slow"){defense+=2;attack-=2;fatigue-=.1;}
    if(t.width==="Wide")attack+=2;if(t.width==="Narrow")defense+=2;
    if(t.passing==="Direct"||t.passing==="Long Ball")attack+=3;
    if(t.pressing==="Press All Over"){attack+=3;defense+=1;fatigue+=.3;}
    if(t.line==="High Line"){defense+=3;fatigue+=.05;}
    if(t.tackling==="Committed")defense+=2;
    return {attack,defense,fatigue};
  }
  function strengthForXI(xi,tactics,home) {
    if(!xi.length) return 45;
    const power=xi.reduce((sum,p)=>{
      const att=p.attributes||baseAttributes(p);
      const role=tactics.roles&&tactics.roles[p.id];
      let factor=p.overall*.75;
      factor+=(att.decisions+att.teamwork+att.positioning)*.42;
      if(["ST","LW","RW","AM"].includes(p.assignedPosition))factor+=(att.shooting+att.movement+att.pace)*.18;
      else factor+=(att.tackling+att.passing+att.strength)*.18;
      if(role&&ROLES[p.assignedPosition]&&ROLES[p.assignedPosition].includes(role))factor+=1.8;
      factor*=clamp(p.fitness/100,.45,1)*(.75+clamp(p.morale,0,100)/400);
      return sum+factor;
    },0)/xi.length;
    const delta=tacticalDelta(tactics);
    return clamp(power+delta.attack*.28+delta.defense*.12+(home?2.7:0),30,99);
  }
  function poisson(lambda) {
    let L=Math.exp(-lambda),k=0,p=1;
    do{k++;p*=Math.random();}while(p>L&&k<12);
    return k-1;
  }
  function simulateMatch(homeClub,awayClub,allPlayers,homeT,awayT) {
    const hp=allPlayers.filter(p=>p.clubId===homeClub.id&&p.injuredWeeks===0);
    const ap=allPlayers.filter(p=>p.clubId===awayClub.id&&p.injuredWeeks===0);
    const getXI=(list,t)=>{ const plan=FORMATIONS[t.formation]||FORMATIONS["4-2-3-1"],used=new Set();return plan.map(pos=>{const c=list.filter(p=>!used.has(p.id)).sort((a,b)=>positionFit(b.position,pos)-positionFit(a.position,pos)+b.overall-a.overall)[0];if(c)used.add(c.id);return c;}).filter(Boolean);};
    const hxi=getXI(hp,homeT||defaultTactics()),axi=getXI(ap,awayT||defaultTactics());
    const hs=strengthForXI(hxi,homeT||defaultTactics(),true),as=strengthForXI(axi,awayT||defaultTactics(),false);
    const hxg=clamp(.9+(hs-as)*.042+Math.random()*.45,.15,4.3),axg=clamp(.82+(as-hs)*.041+Math.random()*.45,.1,4.0);
    const hg=poisson(hxg),ag=poisson(axg);
    const hpct=clamp(Math.round(50+(hs-as)*.52+rand(-7,7)),28,72);
    const hsot=clamp(hg+poisson(hxg*.85),hg,16),asot=clamp(ag+poisson(axg*.85),ag,15);
    const hshots=clamp(hsot+poisson(3+hxg*1.5),hsot,30),ashots=clamp(asot+poisson(3+axg*1.5),asot,29);
    const events=[], scorer=(xi)=>xi.slice().sort((a,b)=>(b.attributes?.shooting||10)*.7+(b.attributes?.movement||10)*.3-((a.attributes?.shooting||10)*.7+(a.attributes?.movement||10)*.3));
    const hscorers=scorer(hxi),ascorers=scorer(axi);
    for(let i=0;i<hg;i++){const p=pick(hscorers.length?hscorers:hp);if(p){events.push({minute:rand(3,90),type:"goal",clubId:homeClub.id,playerId:p.id,text:p.name+" scores for "+homeClub.name+"!"});}}
    for(let i=0;i<ag;i++){const p=pick(ascorers.length?ascorers:ap);if(p){events.push({minute:rand(3,90),type:"goal",clubId:awayClub.id,playerId:p.id,text:p.name+" scores for "+awayClub.name+"!"});}}
    const foulCount=rand(8,29), yellowHome=rand(0,3),yellowAway=rand(0,3);
    if(Math.random()<.12){const injuredClub=Math.random()<.5?homeClub:awayClub,injuredXI=injuredClub.id===homeClub.id?hxi:axi,injuredPlayer=pick(injuredXI);events.push({minute:rand(10,88),type:"injury",clubId:injuredClub.id,playerId:injuredPlayer?.id||null,text:(injuredPlayer?.name||"A player")+" is injured"});}
    events.sort((a,b)=>a.minute-b.minute);
    const ratings={};
    hxi.concat(axi).forEach(p=>{ratings[p.id]=clamp(6.1+Math.random()*1.5+(events.some(e=>e.type==="goal"&&e.playerId===p.id)?1.2:0),4,10);});
    const stats={possession:[hpct,100-hpct],shots:[hshots,ashots],shotsOnTarget:[hsot,asot],xg:[Number(hxg.toFixed(2)),Number(axg.toFixed(2))],corners:[rand(2,9),rand(1,7)],fouls:[Math.round(foulCount*(.48+Math.random()*.05)),Math.round(foulCount*.52)],yellow:[yellowHome,yellowAway],red:[Math.random()<.04?1:0,Math.random()<.04?1:0],passAccuracy:[clamp(Math.round(72+(hs-70)*.4+rand(-6,5)),45,95),clamp(Math.round(72+(as-70)*.4+rand(-6,5)),45,95)],ratings:ratings};
    return {homeGoals:hg,awayGoals:ag,stats:stats,events:events,homeStrength:Number(hs.toFixed(1)),awayStrength:Number(as.toFixed(1)),manOfTheMatch:Object.keys(ratings).sort((a,b)=>ratings[b]-ratings[a])[0]||null,playedAt:new Date().toISOString()};
  }
  function recalcStandings(state, fixtures) {
    const rows=state.clubs.filter(c=>c.league===currentClub(state).league).map(c=>({clubId:c.id,name:c.name,played:0,wins:0,draws:0,losses:0,GF:0,GA:0,GD:0,points:0,form:[]}));
    const index=Object.fromEntries(rows.map(r=>[r.clubId,r]));
    fixtures.filter(f=>f.played&&index[f.homeId]&&index[f.awayId]).forEach(f=>{
      const h=index[f.homeId],a=index[f.awayId];h.played++;a.played++;h.GF+=f.homeGoals;h.GA+=f.awayGoals;a.GF+=f.awayGoals;a.GA+=f.homeGoals;
      if(f.homeGoals>f.awayGoals){h.wins++;h.points+=3;a.losses++;h.form.push("W");a.form.push("L");}
      else if(f.homeGoals<f.awayGoals){a.wins++;a.points+=3;h.losses++;h.form.push("L");a.form.push("W");}
      else{h.draws++;a.draws++;h.points++;a.points++;h.form.push("D");a.form.push("D");}
    });
    rows.forEach(r=>{r.GD=r.GF-r.GA;r.form=r.form.slice(-5);});
    return rows.sort((a,b)=>b.points-a.points||b.GD-a.GD||b.GF-a.GF);
  }
  function train(state, focus) {
    if(state.lastTrainingDay===state.day)return {ok:false,message:"Training already completed today."};
    const players=squad(state,state.userClubId);
    let gains=0;
    players.forEach(p=>{
      if(p.injuredWeeks>0){p.fitness=clamp(p.fitness+rand(2,5),0,100);return;}
      const att=p.attributes;
      if(focus==="Recovery"){p.fitness=clamp(p.fitness+rand(8,14),0,100);p.morale=clamp(p.morale+1,0,100);return;}
      p.fitness=clamp(p.fitness-rand(2,6),0,100);
      let key= focus==="Attacking"?"shooting":focus==="Defending"?"tackling":focus==="Technical"?"technique":focus==="Passing"?"passing":focus==="Fitness"?"stamina":"teamwork";
      const bump=p.age<24&&p.overall<p.potential&&Math.random()<.55?.12:.04;
      if(Math.random()<bump&&att[key]<20){att[key]++;gains++;}
      if(p.age<22&&p.overall<p.potential&&Math.random()<.08)p.overall=clamp(p.overall+1,20,p.potential);
    });
    state.lastTrainingDay=state.day;state.trainingLog.unshift({day:state.day,focus:focus,gains:gains,players:players.length});
    return {ok:true,message:"Training completed; "+gains+" attribute improvements.",gains:gains};
  }
  function continueDay(state) {
    const next=new Date(state.day+"T12:00:00Z");next.setUTCDate(next.getUTCDate()+1);state.day=next.toISOString().slice(0,10);state.seasonDays++;
    const dt=new Date(state.day+"T12:00:00Z");
    if(dt.getUTCDay()===1){state.week++;state.finances.balance+=state.finances.weeklyIncome-state.finances.weeklyCosts;state.finances.seasonIncome+=state.finances.weeklyIncome;state.finances.seasonCosts+=state.finances.weeklyCosts;}
    state.players.forEach(p=>{if(p.injuredWeeks>0 && dt.getUTCDay()===1)p.injuredWeeks--;p.fitness=clamp(p.fitness+(dt.getUTCDay()===0?3:0)-.18,30,100);});
    if(dt.getUTCDate()===1){
      state.transfers.filter(t=>t.type==="installments"&&t.remaining>0).forEach(t=>{
        const payment=Math.min(t.remaining,Math.max(0,Number(t.monthly)||0));
        t.remaining-=payment;t.monthsRemaining=Math.max(0,(t.monthsRemaining||t.months||0)-1);
        state.finances.balance-=payment;t.due=state.day;
      });
      state.transfers=state.transfers.filter(t=>t.type!=="installments"||t.remaining>0);
    }
    const todays=state.fixtures.find(f=>!f.played&&f.date===state.day);
    if(todays&&(todays.homeId===state.userClubId||todays.awayId===state.userClubId)){state.matchPending=todays.id;return {match:true,fixture:todays};}
    return {match:false};
  }
  function applyResult(state, fixture, result) {
    fixture.played=true;fixture.homeGoals=result.homeGoals;fixture.awayGoals=result.awayGoals;fixture.stats=result.stats;fixture.events=result.events;fixture.manOfTheMatch=result.manOfTheMatch;
    const home=state.clubs.find(c=>c.id===fixture.homeId),away=state.clubs.find(c=>c.id===fixture.awayId);
    (state.players.filter(p=>p.clubId===fixture.homeId||p.clubId===fixture.awayId)).forEach(p=>{p.fitness=clamp(p.fitness-rand(5,14),20,100);p.form=(p.form||[]).concat([result.stats.ratings[p.id]||6.6]).slice(-5);});
    result.events.filter(e=>e.type==="goal").forEach(e=>{const p=state.players.find(p=>p.id===e.playerId);if(p)p.goals=(p.goals||0)+1;});
    result.events.filter(e=>e.type==="injury").forEach(e=>{
      const p=state.players.find(p=>p.id===e.playerId);
      if(p){p.injuredWeeks=Math.max(p.injuredWeeks||0,rand(1,5));state.inbox.unshift({id:"injury-"+p.id+"-"+Date.now(),title:"Injury report",text:p.name+" is out for approximately "+p.injuredWeeks+" week(s).",read:false,kind:"warning",day:state.day});}
    });
    if(fixture.homeId===state.userClubId||fixture.awayId===state.userClubId){
      const userGoals=fixture.homeId===state.userClubId?result.homeGoals:result.awayGoals, oppGoals=fixture.homeId===state.userClubId?result.awayGoals:result.homeGoals;
      state.careerHistory.unshift({day:state.day,home:home.name,away:away.name,score:result.homeGoals+"–"+result.awayGoals,goalsFor:userGoals,goalsAgainst:oppGoals});
      if(userGoals>oppGoals){state.morale=clamp(state.morale+4,0,100);state.board.confidence=clamp(state.board.confidence+3,0,100);}
      else if(userGoals<oppGoals){state.morale=clamp(state.morale-5,0,100);state.board.confidence=clamp(state.board.confidence-4,0,100);}
      else state.morale=clamp(state.morale+1,0,100);
      state.inbox.unshift({id:"match-"+fixture.id,title:"Full-time: "+home.name+" "+result.homeGoals+"–"+result.awayGoals+" "+away.name,text:"xG "+result.stats.xg.join("–")+" • Possession "+result.stats.possession.join("% / ")+"%.",read:false,kind:userGoals>=oppGoals?"success":"warning",day:state.day});
    }
    return recalcStandings(state,state.fixtures);
  }
  function simulateRound(state, round) {
    const roundFixtures=state.fixtures.filter(f=>f.round===round&&!f.played),userT=state.tactics;
    roundFixtures.forEach(f=>{
      const h=state.clubs.find(c=>c.id===f.homeId),a=state.clubs.find(c=>c.id===f.awayId);
      if(!h||!a)return;
      const result=simulateMatch(h,a,state.players,f.homeId===state.userClubId?userT:defaultTactics(),f.awayId===state.userClubId?userT:defaultTactics());
      applyResult(state,f,result);
    });
    return recalcStandings(state,state.fixtures);
  }
  function finishSeason(state) {
    const standings=recalcStandings(state,state.fixtures);
    state.inbox.unshift({id:"season-"+state.seasonNumber,title:"Season review complete",text:(standings[0]?.name||"Winner")+" finished top of the league. Career season "+state.seasonNumber+" complete.",read:false,kind:"success",day:state.day});
    state.careerHistory.push({type:"season",season:state.season,champion:standings[0]?.clubId||null,table:standings});
    state.players.forEach(p=>{p.age=Math.min(48,p.age+1);p.contractYears=Math.max(0,p.contractYears-1);if(p.age>32&&Math.random()<.13)p.overall=Math.max(35,p.overall-1);if(p.age<24&&Math.random()<.18)p.overall=Math.min(p.potential,p.overall+1);if(p.age<24&&p.overall<p.potential&&Math.random()<.12){const k=pick(ATTRS.filter(key=>key!=="goalkeeping"||p.position==="GK"));p.attributes=p.attributes||baseAttributes(p);p.attributes[k]=clamp((p.attributes[k]||10)+1,1,20);}});
    state.season++;state.seasonNumber++;state.day=String(state.season)+"-07-01";state.currentRound=0;state.seasonDays=0;state.fixtures=state.world.calendar[currentClub(state).league]||[];state.fixtures=setFixtureDates(circleSchedule(state.clubs.filter(c=>c.league===currentClub(state).league).map(c=>c.id)).map(f=>Object.assign(f,{competition:currentClub(state).league})),String(state.season)+"-07-08");
    state.players.filter(p=>p.clubId===state.userClubId).forEach(p=>{p.fitness=rand(80,100);p.morale=clamp(p.morale+rand(-5,5),40,95);p.registered=(p.registered===true);});
    state.domesticCup=createDomesticCup(state.nation,state.clubs,state.season);
    state.finances.balance+=state.finances.weeklyIncome*4;
  }
  function negotiateTransfer(state, playerId, offer) {
    const player=state.players.find(p=>p.id===playerId);
    if(!player||player.clubId===state.userClubId)return {ok:false,message:"Player is not available to buy."};
    const fee=Math.max(0,Number(offer.fee)||0),wage=Math.max(0,Number(offer.wage)||0),upfront=clamp(Number(offer.upfront||fee),0,fee);
    const months=Number(offer.installmentMonths||0),installments=Math.max(0,fee-upfront);
    if(fee>state.finances.transferBudget)return {ok:false,message:"Transfer budget is too low for the offer."};
    if(wage>state.finances.wageBudget)return {ok:false,message:"Weekly wage is above the wage budget."};
    if(player.clubId&&fee<player.value*.72&&Math.random()>.12)return {ok:false,counter:Math.round(player.value*1.12),message:"Selling club rejected the fee and requested a higher offer."};
    if(wage<Math.max(500,player.wage*.78)&&Math.random()>.18)return {ok:false,counterWage:Math.round(player.wage*1.1),message:"The player rejected the wage offer."};
    state.finances.transferBudget-=upfront;
    state.finances.balance-=upfront;
    if(installments>0)state.transfers.push({id:"installment-"+player.id+"-"+Date.now(),type:"installments",playerId:player.id,remaining:installments,months:months||12,monthsRemaining:months||12,monthly:Math.ceil(installments/(months||12)),due:state.day});
    if(player.clubId){const old=state.clubs.find(c=>c.id===player.clubId);if(old)old.transferBudget=(old.transferBudget||0)+fee;}
    player.clubId=state.userClubId;player.wage=wage;player.contractYears=Number(offer.years||4);player.value=Math.max(player.value,fee);player.morale=clamp(player.morale+7,0,100);player.generated=false;player.appearanceBonus=Math.max(0,Number(offer.appearanceBonus)||0);player.goalBonus=Math.max(0,Number(offer.goalBonus)||0);player.sellOnPercent=clamp(Number(offer.sellOn)||0,0,50);player.releaseClause=Math.max(0,Number(offer.releaseClause)||0);player.signingBonus=Math.max(0,Number(offer.signingBonus)||0);state.finances.balance-=player.signingBonus;
    state.finances.weeklyCosts+=wage;state.inbox.unshift({id:"signed-"+player.id+"-"+Date.now(),title:"Signing complete",text:player.name+" signed for "+fee+" with a weekly wage of "+wage+".",kind:"success",read:false,day:state.day});
    state.careerHistory.push({type:"transfer-in",day:state.day,playerId:player.id,fee:fee,wage:wage});
    return {ok:true,message:"Transfer and contract registered.",player:player};
  }
  function sellPlayer(state, playerId, fee) {
    const p=state.players.find(p=>p.id===playerId);
    if(!p||p.clubId!==state.userClubId)return {ok:false,message:"Player is not in your squad."};
    if(squad(state,state.userClubId).length<=18)return {ok:false,message:"Keep at least 18 registered players."};
    const amount=Math.max(0,Number(fee)||p.value);
    p.clubId=null;state.finances.balance+=amount;state.finances.transferBudget+=amount;state.finances.weeklyCosts=Math.max(0,state.finances.weeklyCosts-p.wage);
    state.careerHistory.push({type:"transfer-out",day:state.day,playerId:p.id,fee:amount});
    state.inbox.unshift({id:"sale-"+p.id+"-"+Date.now(),title:"Player sold",text:p.name+" was sold for "+amount+".",kind:"success",read:false,day:state.day});
    return {ok:true,message:"Sale completed."};
  }
  function offerRenewal(state, playerId, deal) {
    const p=state.players.find(x=>x.id===playerId);
    if(!p||p.clubId!==state.userClubId)return {ok:false,message:"Player is not in your club."};
    const oldWage=Number(p.wage)||0;
    const wage=Math.max(0,Number(deal.wage)||oldWage),years=clamp(Number(deal.years||3),1,5);
    if(wage>state.finances.wageBudget)return {ok:false,message:"Weekly wage budget exceeded."};
    if(wage<Math.max(500,oldWage*.82)&&Math.random()>.25)return {ok:false,message:"The player rejected the wage proposal."};
    const signingBonus=Math.max(0,Number(deal.signingBonus)||0);
    if(signingBonus>state.finances.balance)return {ok:false,message:"The club cannot afford the signing-on fee."};
    p.wage=wage;p.contractYears=years;p.releaseClause=Math.max(0,Number(deal.releaseClause)||0);p.signingBonus=signingBonus;
    p.appearanceBonus=Math.max(0,Number(deal.appearanceBonus)||p.appearanceBonus||0);
    p.goalBonus=Math.max(0,Number(deal.goalBonus)||p.goalBonus||0);
    state.finances.weeklyCosts+=wage-oldWage;state.finances.balance-=signingBonus;
    state.inbox.unshift({id:"renew-"+p.id+"-"+Date.now(),title:"Contract renewed",text:p.name+" renewed for "+years+" seasons.",kind:"success",read:false,day:state.day});
    return {ok:true,message:"Renewal accepted."};
  }
  function adjustBudget(state, transferAmount) {
    const amount=clamp(Number(transferAmount)||0,-state.finances.wageBudget*.4,state.finances.transferBudget*.4);
    if(state.finances.transferBudget-amount<0||state.finances.wageBudget+amount<0)return {ok:false,message:"Budget split would become negative."};
    state.finances.transferBudget-=amount;state.finances.wageBudget+=amount;
    return {ok:true,message:"Budgets adjusted."};
  }
  function exportData(state) { return JSON.stringify({format:"touchline-advanced-save",version:1,exportedAt:new Date().toISOString(),state:state},null,2); }
  function normalizeKitColor(value) {
    const raw=String(value||"").trim();
    if(/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(raw))return raw;
    const colors={"red":"#D71920","white":"#FFFFFF","black":"#111111","blue":"#00529F","light blue":"#6CABDD","sky blue":"#6CABDD","navy":"#132257","green":"#008B55","dark green":"#006B45","yellow":"#FDE100","gold":"#D4AF37","orange":"#F56600","purple":"#482E92","maroon":"#8E1F2F","claret":"#7A263A","silver":"#B4B9C8","grey":"#808080","gray":"#808080","pink":"#E84A8A"};
    return colors[raw.toLowerCase()]||"#233C7A";
  }
  function contractYearsFromUntil(until) {
    if(!until)return 2;
    const match=String(until).match(/^(\d{4})-(\d{1,2})/);
    if(!match)return 2;
    const current=new Date(),months=(Number(match[1])-current.getFullYear())*12+(Number(match[2])-current.getMonth()-1);
    return clamp(Math.ceil(months/12),0,8);
  }
  function normalizeClubName(value) {
    const raw=String(value||"").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase()
      .replace(/&/g,"and").replace(/[^a-z0-9]+/g," ").trim().replace(/\\s+/g," ");
    const aliases={
      "fc internazionale milano":"inter","internazionale milano":"inter","inter milan":"inter",
      "bayern munchen":"bayern munich","fc bayern munchen":"bayern munich",
      "real betis balompie":"real betis","real betis balompie seville":"real betis",
      "real sociedad de futbol":"real sociedad","real sociedad de san sebastian":"real sociedad",
      "athletic bilbao":"athletic club","athletic club bilbao":"athletic club",
      "atletico de madrid":"atletico madrid","club atletico de madrid":"atletico madrid",
      "paris saint germain":"paris saint germain","paris saint germain fc":"paris saint germain",
      "al ahli saudi":"al ahli","al ahli club":"al ahli","al hilal saudi club":"al hilal",
      "al nassr fc":"al nassr","al ittihad club":"al ittihad",
      "al ahly sc":"al ahly","al ahly sporting club":"al ahly",
      "mamelodi sundowns fc":"mamelodi sundowns","raja club athletic":"raja club athletic"
    };
    const withoutClubSuffix=raw.split(" ").filter(token=>!["fc","cf","afc","sc","ac","football"].includes(token)).join(" ");
    return aliases[raw]||aliases[withoutClubSuffix]||withoutClubSuffix;
  }
  function normalizeImportedWorld(data, state) {
    const clubsIn=data.clubs||data.teams||[];
    const playersIn=Array.isArray(data.players)?data.players.slice():[];
    if(!Array.isArray(clubsIn)||!Array.isArray(playersIn))throw new Error("JSON must include clubs/teams and players arrays.");
    const nestedSquadRows=[];
    clubsIn.forEach(c=>{
      if(!Array.isArray(c.squad))return;
      c.squad.filter(p=>p&&p.name).forEach(p=>nestedSquadRows.push(Object.assign({},p,{clubId:String(c.id||c.name),teamId:String(c.id||c.name),club:c.name})));
    });
    const playerIdentity=p=>String(p.name||"").trim().toLowerCase()+"|"+String(p.clubId||p.teamId||p.club||p.team||"");
    const seenNested=new Set(playersIn.map(playerIdentity));
    nestedSquadRows.forEach(p=>{const key=playerIdentity(p);if(!seenNested.has(key)){playersIn.push(p);seenNested.add(key);}});
    const byName=new Map(state.clubs.map(c=>[normalizeClubName(c.name),c]));
    const idMap=new Map();
    clubsIn.forEach(c=>{
      const name=String(c.name||c.shortName||"").trim();
      if(!name)return;
      let found=byName.get(normalizeClubName(name));
      if(!found && c.shortName)found=byName.get(normalizeClubName(c.shortName));
      if(!found){found=state.clubs.find(x=>x.code===c.code || (c.id&&x.id===String(c.id))); }
      const id=found?found.id:String(c.id||("import-"+name.toLowerCase().replace(/[^a-z0-9]+/g,"-")));
      idMap.set(String(c.id||c.name),id);
      const transformed={id:id,name:name,code:String(c.tla||c.code||name.slice(0,3).toUpperCase()),country:String(c.area?.name||c.country||c.nation||"Unknown"),nation:String(c.area?.name||c.country||c.nation||"Unknown"),league:String(c.competition?.name||c.league||"Imported League"),stadium:String(c.venue||c.stadium||"Unknown stadium"),primary:normalizeKitColor(String(c.primary||c.clubColors||found?.primary||"#233C7A").split("/")[0].trim()),secondary:normalizeKitColor(String(c.secondary||(String(c.clubColors||"").split("/")[1]||found?.secondary||"#F5F5F5")).split("/")[0].trim()),capacity:Number(c.capacity||found?.capacity||0),transferBudget:Number(c.transferBudget??c.budget??found?.transferBudget??0),wageBudget:Number(c.wageBudget??found?.wageBudget??0),strength:found?.strength||65,seeded:false,source:"Imported data"};
      if(found)Object.assign(found,transformed);else{state.clubs.push(transformed);found=transformed;byName.set(normalizeClubName(name),found);}
    });
    let added=0,updated=0;
    const importedSquadClubIds=new Set(Array.isArray(state.realSquadClubIds)?state.realSquadClubIds:[]);
    playersIn.forEach(p=>{
      const clubKey=String(p.clubId||p.teamId||p.club||p.team||"");
      const mapped=idMap.get(clubKey);
      const club= mapped||state.clubs.find(c=>c.id===clubKey||normalizeClubName(c.name)===normalizeClubName(clubKey));
      if(club)importedSquadClubIds.add(club.id);
      const existing=state.players.find(x=>x.name.toLowerCase()===String(p.name||"").toLowerCase()&&x.clubId===(club&&club.id));
      const src=Object.assign({},p,{clubId:club?club.id:null,realData:true,generated:false,source:data.source||"JSON dataset"});
      const player=normalizePlayer(src,club&&club.id);
      if(existing){Object.assign(existing,player,{id:existing.id,clubId:club?club.id:existing.clubId});updated++;}
      else{state.players.push(player);added++;}
    });
    state.realSquadClubIds=Array.from(importedSquadClubIds);
    if(importedSquadClubIds.size){
      state.players=state.players.filter(p=>!(p.generated&&importedSquadClubIds.has(p.clubId)));
    }
    state.clubs.forEach(c=>{
      const current=state.players.filter(p=>p.clubId===c.id);
      if(!importedSquadClubIds.has(c.id)&&current.length<25){
        const generated=generateRoster(c,current,"large");
        generated.forEach(p=>{if(!state.players.some(x=>x.id===p.id))state.players.push(p);});
      }
    });
    state.generatedCount=state.players.filter(p=>p.generated).length;
    state.world.clubs=state.clubs;state.world.players=state.players;
    return {clubs:clubsIn.length,playersAdded:added,playersUpdated:updated,generated:state.generatedCount};
  }
  function importFootballData(competitionCode, seasonYear, token, state) {
    if(!token)throw new Error("A football-data.org API token is required for this provider.");
    const endpoint="https://api.football-data.org/v4/competitions/"+encodeURIComponent(competitionCode)+"/teams?season="+encodeURIComponent(seasonYear);
    return fetch(endpoint,{headers:{"X-Auth-Token":token}}).then(async response=>{
      const body=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(body.message||("API returned HTTP "+response.status));
      const teams=(body.teams||[]).map(t=>({id:t.id,name:t.name,shortName:t.shortName,tla:t.tla,area:t.area,competition:body.competition,clubColors:t.clubColors,venue:t.venue,squad:t.squad}));
      const players=[];
      teams.forEach(t=>(t.squad||[]).filter(p=>p.role==="PLAYER"||!p.role).forEach(p=>{
        const age=p.dateOfBirth?Math.floor((Date.now()-new Date(p.dateOfBirth).getTime())/31557600000):19;
        players.push({id:"fd-"+p.id,name:p.name,clubId:String(t.id),position:mapPosition(p.position),nationality:p.nationality||"Unknown",age:age,shirt:p.shirtNumber||0,overall:60,potential:65,value:Number(p.marketValue||0),wage:0,contractUntil:p.contract?.until||null,contractYears:contractYearsFromUntil(p.contract?.until),dateOfBirth:p.dateOfBirth,realData:true,source:"football-data.org API"});
      }));
      return normalizeImportedWorld({source:"football-data.org API ("+competitionCode+" "+seasonYear+")",clubs:teams,players:players},state);
    });
  }
  async function importFootballDataBatch(competitionCodes, seasonYear, token, state, onProgress) {
    if(!token)throw new Error("A football-data.org API token is required for this provider.");
    const codes=Array.from(new Set((Array.isArray(competitionCodes)?competitionCodes:String(competitionCodes||"").split(","))
      .map(c=>String(c).trim().toUpperCase()).filter(Boolean)));
    if(!codes.length)throw new Error("Enter one or more competition codes, separated by commas.");
    const report={requested:codes,successes:[],failures:[],playersAdded:0,playersUpdated:0,clubs:0};
    for(let i=0;i<codes.length;i++){
      const code=codes[i];
      if(typeof onProgress==="function")onProgress({index:i+1,total:codes.length,code:code,stage:"fetching"});
      try{
        const result=await importFootballData(code,seasonYear,token,state);
        const importedCount=(Number(result.playersAdded)||0)+(Number(result.playersUpdated)||0);
        if(importedCount===0)throw new Error("The provider returned no squad players for this competition or this plan does not include squad data.");
        report.successes.push({code:code,players:importedCount,clubs:Number(result.clubs)||0});
        report.playersAdded+=Number(result.playersAdded)||0;report.playersUpdated+=Number(result.playersUpdated)||0;report.clubs+=Number(result.clubs)||0;
      }catch(error){
        report.failures.push({code:code,message:String(error&&error.message||error)});
      }
      if(i<codes.length-1)await new Promise(resolve=>setTimeout(resolve,6200));
    }
    report.generated=state.players.filter(p=>p.generated).length;
    report.realPlayers=state.players.filter(p=>!p.generated&&p.realData!==false).length;
    report.realSquads=(state.realSquadClubIds||[]).length;
    state.world.sourceSeason="football-data.org API · "+report.successes.map(x=>x.code).join(", ")+" · "+seasonYear;
    state.world.notes=state.world.notes||[];
    state.world.notes.unshift("Real squad import on "+state.day+": "+report.successes.length+" competition(s) loaded; "+report.playersAdded+" added, "+report.playersUpdated+" updated; "+report.failures.length+" failed.");
    if(!report.successes.length)throw new Error("No real squads were imported. Check the API token, competition codes and plan. "+report.failures.map(f=>f.code+": "+f.message).join(" | "));
    return report;
  }
  function mapPosition(pos) {
    const p=String(pos||"").toLowerCase();
    if(p.includes("goal"))return "GK";if(p.includes("keeper"))return "GK";
    if(p.includes("back"))return p.includes("left")?"LB":p.includes("right")?"RB":"CB";
    if(p.includes("defence")||p.includes("defender"))return "CB";
    if(p.includes("midfield"))return p.includes("defensive")?"DM":p.includes("attacking")?"AM":"CM";
    if(p.includes("wing"))return p.includes("left")?"LW":"RW";
    if(p.includes("offence")||p.includes("forward")||p.includes("attacker"))return "ST";
    return "CM";
  }
  const api = {POSITIONS,FORMATIONS,ROLES,ATTRS,ATTR_LABELS,clamp,normalizePlayer,playerOverall,circleSchedule,setFixtureDates,buildUCL,createDomesticCup,simulateDomesticCupRound,simulateContinentalRound,makeWorld,newCareer,currentClub,squad,selectedXI,positionFit,tacticalDelta,strengthForXI,simulateMatch,recalcStandings,train,continueDay,applyResult,simulateRound,finishSeason,negotiateTransfer,sellPlayer,offerRenewal,adjustBudget,exportData,normalizeImportedWorld,importFootballData,importFootballDataBatch,baseAttributes,defaultTactics,normalizeKitColor,contractYearsFromUntil,normalizeClubName};
  root.FM_ENGINE=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
})(typeof window!=="undefined"?window:globalThis);
