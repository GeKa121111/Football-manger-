(function (root) {
  "use strict";

  const ROWS = 9;
  const COLS = 14;
  const TICKS = 180;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };
  const hash = value => {
    const s = String(value == null ? "" : value);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
  };
  function createRandom(seed) {
    let value = hash(seed) || 0x6d2b79f5;
    return function () {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }
  const FORMATIONS = {
    "4-3-3":["GK","LB","CB","CB","RB","DM","CM","CM","LW","ST","RW"],
    "4-2-3-1":["GK","LB","CB","CB","RB","DM","DM","LW","AM","RW","ST"],
    "4-4-2":["GK","LB","CB","CB","RB","LW","CM","CM","RW","ST","ST"],
    "3-5-2":["GK","CB","CB","CB","LB","DM","CM","CM","RB","ST","ST"],
    "4-1-4-1":["GK","LB","CB","CB","RB","DM","CM","CM","LW","RW","ST"]
  };
  const POSITION_WEIGHT = {
    GK:{GK:10},CB:{CB:10,LB:5,RB:5,DM:4},LB:{LB:10,RB:7,CB:5,LW:4},
    RB:{RB:10,LB:7,CB:5,RW:4},DM:{DM:10,CM:7,CB:4},CM:{CM:10,DM:7,AM:6},
    AM:{AM:10,CM:6,ST:4},LW:{LW:10,RW:7,AM:5,ST:3},RW:{RW:10,LW:7,AM:5,ST:3},
    ST:{ST:10,AM:5,LW:4,RW:4}
  };
  const ATTACKING = new Set(["ST","AM","LW","RW"]);
  const DEFENSIVE = new Set(["GK","CB","LB","RB","DM"]);
  const bounded = (p) => ({x:clamp(Math.round(p.x),0,COLS-1),y:clamp(Math.round(p.y),0,ROWS-1)});
  const distance = (a,b) => Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  const getAttribute = (player, key) => {
    const base = clamp(Math.round(number(player.overall, 55) / 5), 1, 20);
    return clamp(number(player.attributes && player.attributes[key], base), 1, 20);
  };
  function getTacticalValue(tactics, names, fallback) {
    for (const name of names) {
      const value = tactics && tactics[name];
      if (value != null && value !== "") return String(value);
    }
    return fallback;
  }
  function tacticAttack(tactics) {
    const mentality = getTacticalValue(tactics, ["mentality"], "Balanced");
    const style = getTacticalValue(tactics, ["style"], "Possession");
    const finalThird = getTacticalValue(tactics, ["finalThird"], "Work Ball Into Box");
    return (mentality === "Overload" ? 0.18 : mentality === "Attacking" ? 0.11 : mentality === "Defensive" || mentality === "Contain" ? -0.10 : 0)
      + (style === "Counter-Attack" || style === "Route One" ? 0.05 : 0)
      + (finalThird === "Shoot on Sight" ? 0.06 : finalThird === "Work Ball Into Box" ? -0.025 : 0);
  }
  function pressLevel(tactics) {
    const named = getTacticalValue(tactics, ["pressing"], "Balanced");
    const numeric = number(tactics && tactics.pressIntensity, named === "Press All Over" ? 17 : named === "Sit Back" ? 5 : 11);
    return clamp(numeric / 20, 0.1, 1);
  }
  function fit(playerPosition, slot) {
    if (playerPosition === slot) return 12;
    return (POSITION_WEIGHT[slot] && POSITION_WEIGHT[slot][playerPosition]) || 0;
  }
  function initialLane(position, index) {
    const byPosition = {GK:4,CB:index % 2 ? 3 : 5,LB:1,RB:7,DM:4,CM:index % 2 ? 2 : 6,AM:4,LW:1,RW:7,ST:4};
    return byPosition[position] == null ? (index % 7) + 1 : byPosition[position];
  }
  function makeLineup(club, players, tactics, team) {
    const formation = String(tactics && tactics.formation || "4-2-3-1");
    const slots = FORMATIONS[formation] || FORMATIONS["4-2-3-1"];
    const byId = new Map(players.map(p => [String(p.id), p]));
    const used = new Set();
    const direction = team === 0 ? 1 : -1;
    const line = slots.map((slot, index) => {
      const manualId = Array.isArray(tactics && tactics.startingXI) ? tactics.startingXI[index] : null;
      const preferred = manualId == null ? null : byId.get(String(manualId));
      const eligible = players.filter(p => !used.has(String(p.id)) && ((p.position === "GK") === (slot === "GK")))
        .sort((a,b) => (fit(b.position, slot) - fit(a.position, slot)) * 10
          + (number(b.overall, 50) - number(a.overall, 50))
          || String(a.id).localeCompare(String(b.id)));
      const chosen = preferred && !used.has(String(preferred.id)) && ((preferred.position === "GK") === (slot === "GK"))
        ? preferred : eligible[0];
      if (!chosen) return null;
      used.add(String(chosen.id));
      const position = bounded({
        x: slot === "GK" ? (team === 0 ? 1 : COLS-2)
          : direction === 1
            ? (DEFENSIVE.has(slot) ? 3 : ATTACKING.has(slot) ? 9 : 6)
            : (DEFENSIVE.has(slot) ? COLS-4 : ATTACKING.has(slot) ? 4 : 7),
        y: initialLane(slot, index)
      });
      return {
        id:String(chosen.id), name:String(chosen.name || "Player"), clubId:club.id, team:team,
        position:slot, sourcePosition:String(chosen.position || slot), shirt:number(chosen.shirt, index+1),
        overall:clamp(number(chosen.overall, 55), 20, 99),
        fitness:clamp(number(chosen.fitness, 90), 0, 100),
        stamina:getAttribute(chosen, "stamina"), passing:getAttribute(chosen, "passing"),
        dribbling:getAttribute(chosen, "dribbling"), shooting:getAttribute(chosen, "shooting"),
        decisions:getAttribute(chosen, "decisions"), tackling:getAttribute(chosen, "tackling"),
        creativity:getAttribute(chosen, "creativity"), pace:getAttribute(chosen, "pace"),
        goalkeeping:getAttribute(chosen, "goalkeeping"), aggression:getAttribute(chosen, "aggression"),
        x:position.x,y:position.y, startX:position.x,startY:position.y, playerRef:chosen
      };
    }).filter(Boolean);
    return line;
  }
  function nearest(players, point, predicate) {
    let winner = null, score = Infinity;
    for (const p of players) {
      if (predicate && !predicate(p)) continue;
      const d = distance(p, point);
      if (d < score || (d === score && String(p.id) < String(winner && winner.id || "~"))) {
        winner = p; score = d;
      }
    }
    return winner ? {player:winner,distance:score} : {player:null,distance:Infinity};
  }
  function moveOne(player, target) {
    const dx = target.x - player.x, dy = target.y - player.y;
    if (dx && (!dy || Math.abs(dx) >= Math.abs(dy))) player.x += Math.sign(dx);
    else if (dy) player.y += Math.sign(dy);
    const p = bounded(player); player.x = p.x; player.y = p.y;
  }
  function eventTextPass(passer, receiver, breaksLine) {
    return breaksLine
      ? passer.name + " splits the defensive line with a pass to " + receiver.name + "."
      : passer.name + " finds " + receiver.name + " in possession.";
  }
  function simulateMatch(homeClub, awayClub, allPlayers, homeTactics, awayTactics, options) {
    if (!homeClub || !awayClub || !Array.isArray(allPlayers)) return null;
    const homePlayers = allPlayers.filter(p => p && p.clubId === homeClub.id && !p.retired
      && number(p.injuredWeeks, 0) <= 0 && number(p.suspendedMatches, 0) <= 0);
    const awayPlayers = allPlayers.filter(p => p && p.clubId === awayClub.id && !p.retired
      && number(p.injuredWeeks, 0) <= 0 && number(p.suspendedMatches, 0) <= 0);
    const ht = homeTactics || {}, at = awayTactics || {};
    const homeXI = makeLineup(homeClub, homePlayers, ht, 0);
    const awayXI = makeLineup(awayClub, awayPlayers, at, 1);
    if (homeXI.length < 7 || awayXI.length < 7) return null;

    const seedInput = options && options.seed != null ? String(options.seed) : [
      homeClub.id, awayClub.id,
      homeXI.map(p => p.id + ":" + p.overall).join(","),
      awayXI.map(p => p.id + ":" + p.overall).join(","),
      ht.formation || "", ht.mentality || "", ht.style || "", ht.passing || "",
      at.formation || "", at.mentality || "", at.style || "", at.passing || ""
    ].join("|");
    const rng = createRandom(seedInput);
    const random = (min, max) => min + Math.floor(rng() * (max - min + 1));
    const teams = [homeXI, awayXI];
    const clubs = [homeClub, awayClub];
    const tactics = [ht, at];
    const directions = [1,-1];
    const attackBonus = [tacticAttack(ht), tacticAttack(at)];
    const press = [pressLevel(ht), pressLevel(at)];
    const counters = [
      {possession:0,shots:0,onTarget:0,xg:0,corners:0,fouls:0,yellow:0,red:0,passes:0,completed:0},
      {possession:0,shots:0,onTarget:0,xg:0,corners:0,fouls:0,yellow:0,red:0,passes:0,completed:0}
    ];
    const playerWork = new Map();
    teams.flat().forEach(p => playerWork.set(p.id, {actions:0,passes:0,assists:0,goals:0,shots:0,tackles:0,interceptions:0,fouls:0}));
    const events = [];
    const trace = [];
    const teamAverage = teams.map(line => line.reduce((s,p) => s + p.overall, 0) / Math.max(1,line.length));
    let tick = 0, flight = null, ownerTeam = rng() < 0.5 ? 0 : 1;
    let owner = teams[ownerTeam].slice().sort((a,b) => fit(b.position, "CM") - fit(a.position, "CM"))[0] || teams[ownerTeam][0];
    let ball = {x:6,y:4};
    owner.x = ball.x + (ownerTeam === 0 ? -1 : 1); owner.y = ball.y;
    ball = {x:owner.x,y:owner.y};
    let lastPasser = [null,null];
    function addEvent(type, minute, clubIndex, actor, text, extra) {
      const event = Object.assign({
        minute:clamp(Math.floor(minute),1,90),type:type,clubId:clubs[clubIndex].id,
        playerId:actor ? actor.id : null,text:text
      }, extra || {});
      events.push(event);
      return event;
    }
    function setPossession(team, player, position) {
      ownerTeam = team;
      owner = player || null;
      if (position) ball = bounded(position);
      if (owner) { owner.x = ball.x; owner.y = ball.y; }
    }
    function playerAt(id) {
      return teams.flat().find(p => p.id === String(id)) || null;
    }
    function chooseReceiver(team, passer) {
      const dir = directions[team];
      const candidates = teams[team].filter(p => p.id !== passer.id);
      candidates.sort((a,b) => {
        const score = p => (p.x - passer.x) * dir * 2.0 - distance(p, passer) * 0.48
          + (ATTACKING.has(p.position) ? 0.6 : 0) - Math.abs(p.y - passer.y) * 0.12;
        return score(b) - score(a) || String(a.id).localeCompare(String(b.id));
      });
      return candidates[0] || null;
    }
    function movePlayers() {
      teams.forEach((teamPlayers, team) => {
        const dir = directions[team], opposing = teams[1-team];
        teamPlayers.forEach((p,index) => {
          const owns = !flight && owner && owner.id === p.id;
          let target;
          if (p.position === "GK") {
            target = {x:team === 0 ? 1 : COLS-2,y:clamp(ball.y,2,6)};
          } else if (owns) {
            target = {x:clamp(p.x+dir,1,COLS-2),y:clamp(p.y+Math.sign(4-p.y),1,7)};
          } else if (ownerTeam === team) {
            const advance = ATTACKING.has(p.position) ? 2 : DEFENSIVE.has(p.position) ? -1 : 1;
            target = {x:clamp(ball.x+dir*advance,1,COLS-2),y:clamp(Math.round(p.startY*0.55+ball.y*0.45),1,7)};
          } else {
            const carrier = owner || (flight && playerAt(flight.passerId));
            target = {
              x:clamp(ball.x-dir*(DEFENSIVE.has(p.position)?2:1),1,COLS-2),
              y:clamp(ball.y+(p.startY-4)*0.35,1,7)
            };
            if (carrier && distance(p,carrier)>6) target.y=clamp(Math.round(target.y+(p.startY-4)*0.15),1,7);
          }
          const moveChance = clamp(0.68 + p.fitness/100*0.23 - (100-p.fitness)*0.002,0.38,0.9);
          if (rng() < moveChance) moveOne(p,target);
          p.fitness = clamp(p.fitness - (0.055 + press[team]*0.035 + (owns?0.05:0)),15,100);
        });
      });
      if (!flight && owner) { ball.x=owner.x; ball.y=owner.y; }
    }
    function finishFlight(minute) {
      const receiver = playerAt(flight.receiverId);
      const target = receiver ? {x:receiver.x,y:receiver.y} : {x:flight.to.x,y:flight.to.y};
      ball = bounded(target);
      const defending = nearest(teams[1-flight.team], ball);
      const roll = rng();
      if (defending.player && roll < flight.interceptChance) {
        counters[flight.team].completed += 0;
        playerWork.get(defending.player.id).interceptions++;
        setPossession(1-flight.team, defending.player, ball);
        addEvent("interception", minute, 1-flight.team, defending.player, defending.player.name + " reads the pass and intercepts.");
        return {type:"interception",team:1-flight.team,playerId:defending.player.id};
      }
      if (receiver && roll < flight.interceptChance + flight.completeChance) {
        counters[flight.team].completed++;
        playerWork.get(flight.passerId).passes++;
        lastPasser[flight.team] = flight.passerId;
        setPossession(flight.team, receiver, ball);
        if (flight.breaksLine) addEvent("line-break", minute, flight.team, playerAt(flight.passerId),
          eventTextPass(playerAt(flight.passerId),receiver,true), {receiverId:receiver.id});
        return {type:"reception",team:flight.team,playerId:receiver.id};
      }
      const looseWinner = defending.player || nearest(teams[flight.team], ball).player;
      if (looseWinner) setPossession(looseWinner.team, looseWinner, ball);
      return {type:"loose-ball",team:looseWinner ? looseWinner.team : flight.team,playerId:looseWinner ? looseWinner.id : null};
    }
    function tryShot(team, shooter, minute, pressureDistance) {
      const dir = directions[team], goalX = team === 0 ? COLS-1 : 0;
      const distanceToGoal = Math.abs(goalX - shooter.x);
      const lanePenalty = Math.abs(shooter.y - 4) * 0.022;
      const fatiguePenalty = (100-shooter.fitness) * 0.001;
      const xg = clamp(0.025 + (5.4-distanceToGoal)*0.046 + shooter.shooting/20*0.15
        + attackBonus[team]*0.18 - lanePenalty - Math.max(0,pressureDistance===Infinity?0:2-pressureDistance)*0.025
        - fatiguePenalty,0.015,0.68);
      const onTargetChance = clamp(0.20 + shooter.shooting*0.025 + attackBonus[team]*0.1
        - distanceToGoal*0.025 - lanePenalty - (pressureDistance<=1?0.12:pressureDistance<=2?0.06:0),0.10,0.78);
      counters[team].shots++;
      counters[team].xg += xg;
      playerWork.get(shooter.id).shots++;
      playerWork.get(shooter.id).actions++;
      const onTarget = rng() < onTargetChance;
      if (onTarget) counters[team].onTarget++;
      const keeper = teams[1-team].find(p => p.position === "GK");
      const goalChance = clamp(xg * 1.18 - (keeper ? keeper.goalkeeping/20*0.10 : 0.035),0.01,0.58);
      const scored = onTarget && rng() < goalChance;
      const minuteText = String(Math.floor(minute));
      if (scored) {
        const assistId = lastPasser[team] && lastPasser[team] !== shooter.id ? lastPasser[team] : null;
        const assist = assistId ? playerAt(assistId) : null;
        playerWork.get(shooter.id).goals++;
        if (assist) playerWork.get(assist.id).assists++;
        addEvent("goal", minute, team, shooter, shooter.name + " scores for " + clubs[team].name
          + (assist ? " after a pass from " + assist.name : "") + "!", {assistId:assist ? assist.id : null,xg:Number(xg.toFixed(3))});
        lastPasser[team] = null;
        setPossession(1-team, teams[1-team].find(p => p.position === "GK") || teams[1-team][0],
          {x:team===0?COLS-2:1,y:4});
      } else if (onTarget) {
        addEvent("shot", minute, team, shooter, shooter.name + " tests the goalkeeper.", {onTarget:true,xg:Number(xg.toFixed(3))});
        const keeperPlayer = keeper || nearest(teams[1-team],ball).player;
        if (keeperPlayer) setPossession(1-team, keeperPlayer, {x:team===0?COLS-2:1,y:4});
      } else {
        const corner = rng() < 0.22;
        if (corner) counters[team].corners++;
        addEvent(corner ? "corner" : "shot", minute, team, shooter,
          corner ? shooter.name + " wins a corner." : shooter.name + " shoots wide.", {onTarget:false,xg:Number(xg.toFixed(3))});
        setPossession(corner?team:1-team,corner?shooter:(teams[1-team].find(p=>p.position==="GK")||teams[1-team][0]),
          {x:team===0?COLS-2:1,y:corner?(shooter.y<4?0:ROWS-1):4});
      }
      flight = null;
      return {type:"shot",team:team,playerId:shooter.id,goal:scored,xg:xg};
    }
    for (tick = 0; tick < TICKS; tick++) {
      const minute = (tick+1)*0.5;
      let interaction = null;
      movePlayers();
      if (flight) {
        const old = {x:flight.from.x,y:flight.from.y};
        flight.progress++;
        const ratio = clamp(flight.progress/flight.total,0,1);
        ball = bounded({x:old.x+(flight.to.x-old.x)*ratio,y:old.y+(flight.to.y-old.y)*ratio});
        if (flight.progress >= flight.total) interaction = finishFlight(minute);
      } else if (owner) {
        ball = {x:owner.x,y:owner.y};
        const team = ownerTeam, opponent = teams[1-team], dir = directions[team];
        const nearestDefender = nearest(opponent, owner);
        const pressureDistance = nearestDefender.distance;
        const goalDistance = Math.abs((team===0?COLS-1:0)-owner.x);
        const inShotZone = goalDistance <= 5 && owner.x > 0 && owner.x < COLS-1;
        const slot = owner.position;
        const shootChance = inShotZone
          ? clamp(0.06 + (5-goalDistance)*0.035 + attackBonus[team]*0.08
            + (ATTACKING.has(slot)?0.025:0),0.04,0.24)
          : 0;
        const actionRoll = rng();
        if (inShotZone && actionRoll < shootChance) {
          interaction = tryShot(team,owner,minute,pressureDistance);
        } else if (actionRoll < shootChance + 0.49) {
          const receiver = chooseReceiver(team,owner);
          if (receiver) {
            const passDistance = distance(owner,receiver);
            const forwardGain = (receiver.x-owner.x)*dir;
            const breaksLine = forwardGain >= 2 && ATTACKING.has(receiver.position) || forwardGain >= 3;
            const risk = breaksLine ? 0.12 : 0.035;
            const completeChance = clamp(0.79 + (owner.passing-10)*0.012 - passDistance*0.017
              - Math.max(0,2.5-pressureDistance)*0.035 - risk + (100-owner.fitness)*-0.001,0.42,0.94);
            const interceptChance = clamp(0.045 + press[1-team]*0.09 + passDistance*0.012
              + risk*0.28 - (owner.decisions-10)*0.006,0.025,0.36);
            counters[team].passes++;
            playerWork.get(owner.id).actions++;
            flight = {
              team:team,passerId:owner.id,receiverId:receiver.id,from:{x:owner.x,y:owner.y},
              to:{x:receiver.x,y:receiver.y},progress:0,total:passDistance>4?2:1,
              completeChance:completeChance,interceptChance:interceptChance,breaksLine:breaksLine
            };
            ball={x:owner.x,y:owner.y};
            interaction={type:"pass",team:team,playerId:owner.id,receiverId:receiver.id,breaksLine:breaksLine};
            if (breaksLine && rng()<0.42) addEvent("pass",minute,team,owner,eventTextPass(owner,receiver,true),{receiverId:receiver.id});
          }
        } else {
          const ahead = bounded({x:owner.x+dir,y:owner.y+Math.sign(4-owner.y)});
          const challenge = nearest(opponent,ahead);
          const control = clamp(0.64 + (owner.dribbling-10)*0.018 - (challenge.distance<=1?0.22:challenge.distance<=2?0.10:0)
            - (100-owner.fitness)*0.002,0.25,0.90);
          if (rng()<control) {
            owner.x=ahead.x;owner.y=ahead.y;ball={x:owner.x,y:owner.y};
            playerWork.get(owner.id).actions++;
            interaction={type:"dribble",team:team,playerId:owner.id};
          } else if (challenge.player) {
            const fouled = rng() < clamp(0.08 + (number(tactics[team] && tactics[team].tackling,"Normal")==="Committed"?0.05:0),0.03,0.2);
            counters[1-team].fouls += fouled?1:0;
            playerWork.get(challenge.player.id).tackles++;
            if (fouled) {
              playerWork.get(challenge.player.id).fouls++;
              addEvent("foul",minute,1-team,challenge.player,challenge.player.name+" commits a foul.");
              const yellowChance = 0.045 + Math.max(0,challenge.player.aggression-12)*0.008;
              if (rng()<yellowChance) {
                counters[1-team].yellow++;
                addEvent("yellow",minute,1-team,challenge.player,challenge.player.name+" is booked.");
              }
            }
            setPossession(1-team,challenge.player,owner);
            interaction={type:fouled?"foul":"tackle",team:1-team,playerId:challenge.player.id};
          } else {
            setPossession(1-team,teams[1-team][0],owner);
            interaction={type:"loose-ball",team:1-team,playerId:teams[1-team][0].id};
          }
        }
      }
      const possessionTeam = ownerTeam;
      if (possessionTeam === 0 || possessionTeam === 1) counters[possessionTeam].possession++;
      trace.push({
        tick:tick,minute:Number(minute.toFixed(1)),ball:{x:ball.x,y:ball.y},
        ownerTeam:ownerTeam,ownerId:owner?owner.id:null,
        interaction:interaction?Object.assign({},interaction):null,
        interactionCount:interaction?1:0,
        players:teams.flat().map(p=>({id:p.id,clubId:p.clubId,team:p.team,x:p.x,y:p.y,fitness:Number(p.fitness.toFixed(2)),shirt:p.shirt}))
      });
    }
    events.sort((a,b)=>a.minute-b.minute);
    const totalPossession = counters[0].possession + counters[1].possession || 1;
    const possessionHome = clamp(Math.round(counters[0].possession / totalPossession * 100),0,100);
    const possessionAway = 100-possessionHome;
    const ratings = {};
    teams.flat().forEach(p => {
      const work = playerWork.get(p.id);
      const score = clamp(6.25 + (p.overall-60)*0.018 + Math.min(0.75,work.actions*0.018)
        + work.goals*1.05 + work.assists*0.55 + work.tackles*0.08 + work.interceptions*0.1
        - Math.max(0,65-p.fitness)*0.012 - work.fouls*0.12,3.5,10);
      ratings[p.id] = Number(score.toFixed(1));
    });
    const goals = [events.filter(e=>e.type==="goal"&&e.clubId===homeClub.id).length,
      events.filter(e=>e.type==="goal"&&e.clubId===awayClub.id).length];
    const stats = {
      possession:[possessionHome,possessionAway],
      shots:[counters[0].shots,counters[1].shots],
      shotsOnTarget:[counters[0].onTarget,counters[1].onTarget],
      xg:[Number(counters[0].xg.toFixed(2)),Number(counters[1].xg.toFixed(2))],
      corners:[counters[0].corners,counters[1].corners],
      fouls:[counters[0].fouls,counters[1].fouls],
      yellow:[counters[0].yellow,counters[1].yellow],
      red:[counters[0].red,counters[1].red],
      passAccuracy:[counters[0].passes?Math.round(counters[0].completed/counters[0].passes*100):78,
        counters[1].passes?Math.round(counters[1].completed/counters[1].passes*100):78],
      ratings:ratings
    };
    const motm = Object.keys(ratings).sort((a,b)=>ratings[b]-ratings[a]||String(a).localeCompare(String(b)))[0] || null;
    return {
      engine:"spatial-tick-v1",homeGoals:goals[0],awayGoals:goals[1],stats:stats,events:events,
      homeStrength:Number(teamAverage[0].toFixed(1)),awayStrength:Number(teamAverage[1].toFixed(1)),
      manOfTheMatch:motm,lineups:{[homeClub.id]:homeXI.map(p=>p.id),[awayClub.id]:awayXI.map(p=>p.id)},
      spatial:{
        rows:ROWS,columns:COLS,tickMinutes:0.5,ticks:TICKS,seed:seedInput,
        trace:trace,
        finalPlayers:teams.flat().map(p=>({id:p.id,clubId:p.clubId,team:p.team,x:p.x,y:p.y,fitness:Number(p.fitness.toFixed(2))}))
      }
    };
  }
  const api = {ROWS:ROWS,COLS:COLS,TICKS:TICKS,simulateMatch:simulateMatch};
  root.FM_SPATIAL_MATCH_ENGINE = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
