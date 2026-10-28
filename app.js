(function () {
  "use strict";

  const STORAGE_KEY = "touchline-manager-save-v1";
  const CURRENT_VERSION = 2;
  const root = document.getElementById("view-root");
  const toastRegion = document.getElementById("toast-region");
  const modalRoot = document.getElementById("modal-root");

  const CLUB_SEEDS = [
    { id: "cairo", name: "القاهرة يونايتد", short: "CU", strength: 73, budget: 78000000 },
    { id: "alex", name: "إسكندرية مارينرز", short: "AM", strength: 72, budget: 69000000 },
    { id: "delta", name: "دلتا أثليتيك", short: "DA", strength: 69, budget: 52000000 },
    { id: "canal", name: "كانال سيتي", short: "CC", strength: 68, budget: 48000000 },
    { id: "redvalley", name: "ريد فالي", short: "RV", strength: 67, budget: 44000000 },
    { id: "giza", name: "جيزة تايتنز", short: "GT", strength: 66, budget: 41000000 },
    { id: "mansoura", name: "المنصورة إف سي", short: "MF", strength: 64, budget: 35000000 },
    { id: "portsaid", name: "بورت سعيد", short: "PS", strength: 63, budget: 33000000 },
    { id: "tanta", name: "طنطا روفرز", short: "TR", strength: 62, budget: 30000000 },
    { id: "suez", name: "السويس يونايتد", short: "SU", strength: 61, budget: 28000000 },
    { id: "aswan", name: "أسوان صنز", short: "AS", strength: 59, budget: 24000000 },
    { id: "mahalla", name: "محلة ووريرز", short: "MW", strength: 58, budget: 22000000 }
  ];

  const FIRST_NAMES = ["عمر", "يوسف", "آدم", "مروان", "زياد", "حمزة", "كريم", "علي", "أحمد", "مصطفى", "حسن", "إبراهيم", "خالد", "طارق", "سيف", "بلال", "رامي", "محمود", "ياسين", "فارس", "مالك", "أمير", "مازن", "هشام", "أنس", "إسلام", "أدهم", "عاصم", "شادي", "نديم"];
  const LAST_NAMES = ["السيد", "حسن", "إبراهيم", "عبدالله", "مصطفى", "منصور", "سالم", "عادل", "فتحي", "كمال", "مراد", "فؤاد", "نجيب", "طارق", "صالح", "رمضان", "حمدي", "زهران", "عثمان", "سليمان", "شريف", "الرفاعي", "عمر", "فهمي", "شاهين", "سعد", "البنا", "نصار", "النجار", "عوض"];
  const POSITION_LABELS = { GK: "حارس مرمى", LB: "ظهير أيسر", CB: "قلب دفاع", RB: "ظهير أيمن", DM: "وسط دفاعي", CM: "وسط", AM: "وسط هجومي", LW: "جناح أيسر", RW: "جناح أيمن", ST: "مهاجم" };
  const POSITION_ORDER = ["GK", "LB", "CB", "CB", "RB", "DM", "CM", "CM", "LW", "ST", "RW"];
  const FORMATIONS = {
    "4-3-3": ["GK", "LB", "CB", "CB", "RB", "DM", "CM", "CM", "LW", "ST", "RW"],
    "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "DM", "DM", "LW", "AM", "RW", "ST"],
    "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LW", "CM", "CM", "RW", "ST", "ST"]
  };
  const TACTICAL_STYLES = {
    balanced: { label: "متوازن", attack: 0, defense: 0, fitness: 0 },
    possession: { label: "استحواذ وبناء", attack: 1.5, defense: 0.5, fitness: -0.5 },
    counter: { label: "مرتدات سريعة", attack: 1.7, defense: -0.2, fitness: -0.4 },
    press: { label: "ضغط عالٍ", attack: 1.2, defense: -0.8, fitness: -1.4 },
    defensive: { label: "كتلة دفاعية", attack: -0.7, defense: 1.7, fitness: 0.3 }
  };
  const MENTALITIES = {
    cautious: { label: "حذر", attack: -1.4, defense: 1.3 },
    balanced: { label: "متوازن", attack: 0, defense: 0 },
    positive: { label: "إيجابي", attack: 1.2, defense: -0.3 },
    attacking: { label: "هجومي", attack: 2.1, defense: -1.1 }
  };
  let state = null;
  let pendingSavedState = null;
  let currentView = "overview";
  let playerSearch = "";
  let marketSearch = "";
  let toastTimer = null;

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function pick(array) { return array[Math.floor(Math.random() * array.length)]; }
  function money(value) {
    const n = Number(value) || 0;
    if (Math.abs(n) >= 1000000) return (n / 1000000).toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " مليون ج.م";
    if (Math.abs(n) >= 1000) return Math.round(n / 1000).toLocaleString("ar-EG") + " ألف ج.م";
    return n.toLocaleString("ar-EG") + " ج.م";
  }
  function shortMoney(value) {
    const n = Number(value) || 0;
    if (Math.abs(n) >= 1000000) return (n / 1000000).toLocaleString("ar-EG", { maximumFractionDigits: 1 }) + " م";
    return Math.round(n / 1000).toLocaleString("ar-EG") + " ألف";
  }
  function number(value) { return (Number(value) || 0).toLocaleString("ar-EG"); }
  function pct(value) { return clamp(Math.round(value), 0, 100).toLocaleString("ar-EG") + "٪"; }
  function dateForState() {
    const date = new Date(Date.UTC(state.seasonYear, 6, 1 + state.currentRound * 7, 12));
    return date;
  }
  function dateLabel(date) {
    return new Intl.DateTimeFormat("ar-EG", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }
  function seasonLabel() { return state.seasonYear + "/" + String((state.seasonYear + 1) % 100).padStart(2, "0"); }
  function clubById(id) { return state.clubs.find(function (club) { return club.id === id; }); }
  function playerById(id) { return state.players.find(function (player) { return player.id === id; }); }
  function userClub() { return clubById(state.userClubId); }
  function userPlayers() { return state.players.filter(function (p) { return p.clubId === state.userClubId; }).sort(function (a, b) { return b.overall - a.overall; }); }
  function currentFixtures() { return state.fixtures.filter(function (f) { return f.round === state.currentRound + 1; }); }
  function nextUserFixture() {
    return state.fixtures.find(function (f) {
      return !f.played && f.round > state.currentRound && (f.homeId === state.userClubId || f.awayId === state.userClubId);
    }) || null;
  }
  function safeName(name) {
    return String(name == null ? "" : name).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function positionFit(actual, wanted) {
    if ((actual === "GK") !== (wanted === "GK")) return -100;
    if (actual === wanted) return 7;
    const groups = {
      GK: ["GK"], LB: ["LB", "RB", "CB"], RB: ["RB", "LB", "CB"], CB: ["CB", "LB", "RB"],
      DM: ["DM", "CM", "CB"], CM: ["CM", "DM", "AM"], AM: ["AM", "CM", "LW", "RW"],
      LW: ["LW", "RW", "AM", "ST"], RW: ["RW", "LW", "AM", "ST"], ST: ["ST", "LW", "RW", "AM"]
    };
    return (groups[wanted] || []).indexOf(actual) >= 0 ? 2 : -8;
  }

  function generatePlayers(clubSeed) {
    const positions = ["GK", "GK", "LB", "LB", "CB", "CB", "CB", "CB", "RB", "RB", "DM", "DM", "CM", "CM", "CM", "AM", "LW", "RW", "ST", "ST"];
    return positions.map(function (pos, index) {
      const age = randomInt(17, 33);
      const variance = randomInt(-8, 8);
      let overall = clamp(Math.round(clubSeed.strength + variance + (age < 21 ? -4 : age > 30 ? -2 : 0)), 43, 88);
      if (pos === "GK") overall = clamp(overall + randomInt(-1, 3), 42, 89);
      const potential = clamp(overall + randomInt(2, age < 23 ? 15 : 7), overall, 94);
      const first = FIRST_NAMES[(index * 7 + randomInt(0, FIRST_NAMES.length - 1)) % FIRST_NAMES.length];
      const last = LAST_NAMES[(index * 5 + randomInt(0, LAST_NAMES.length - 1)) % LAST_NAMES.length];
      const skillBase = overall + randomInt(-5, 5);
      return {
        id: clubSeed.id + "-p" + (index + 1), clubId: clubSeed.id, name: first + " " + last,
        position: pos, age: age, overall: overall, potential: potential,
        fitness: randomInt(80, 100), morale: randomInt(60, 90), sharpness: randomInt(55, 90),
        wage: Math.round((overall * 620 + randomInt(4000, 19000)) / 100) * 100,
        contractYears: randomInt(1, 4),
        value: Math.round((Math.max(1, overall - 42) * (age < 23 ? 330000 : 245000) * (potential > overall + 8 ? 1.4 : 1)) / 100000) * 100000,
        goals: 0, assists: 0, appearances: 0, yellowCards: 0, injuredWeeks: 0, trainingXp: 0,
        goalkeeping: pos === "GK" ? clamp(skillBase + randomInt(2, 7), 35, 98) : 0,
        finishing: clamp(skillBase + (pos === "ST" ? 7 : pos.indexOf("W") >= 0 ? 3 : -2), 35, 95),
        passing: clamp(skillBase + (["CM", "AM", "DM"].indexOf(pos) >= 0 ? 6 : -1), 35, 95),
        defending: clamp(skillBase + (["CB", "LB", "RB", "DM"].indexOf(pos) >= 0 ? 7 : -6), 30, 95),
        pace: clamp(skillBase + (["LW", "RW", "ST", "LB", "RB"].indexOf(pos) >= 0 ? 7 : -2), 35, 95),
        status: "جاهز"
      };
    });
  }

  function makeFixtures(clubs, seasonYear) {
    const list = clubs.map(function (c) { return c.id; });
    const rounds = [];
    for (let round = 0; round < list.length - 1; round += 1) {
      const matches = [];
      for (let i = 0; i < list.length / 2; i += 1) {
        let home = list[i], away = list[list.length - 1 - i];
        if ((round + i) % 2 === 1) { const temp = home; home = away; away = temp; }
        matches.push({
          id: "s" + seasonYear + "-r" + (round + 1) + "-" + i,
          round: round + 1, homeId: home, awayId: away, played: false,
          homeGoals: null, awayGoals: null, note: ""
        });
      }
      rounds.push(matches);
      const fixed = list[0];
      const movable = list.slice(1);
      movable.unshift(movable.pop());
      list.splice(0, list.length, fixed);
      Array.prototype.push.apply(list, movable);
    }
    const firstLeg = rounds.reduce(function (all, round) { return all.concat(round); }, []);
    const roundCount = rounds.length;
    const returnLeg = firstLeg.map(function (fixture) {
      return {
        id: fixture.id + "-return",
        round: fixture.round + roundCount,
        homeId: fixture.awayId,
        awayId: fixture.homeId,
        played: false,
        homeGoals: null,
        awayGoals: null,
        note: ""
      };
    });
    return firstLeg.concat(returnLeg);
  }

  function seasonRoundCount() {
    return state && Array.isArray(state.clubs)
      ? Math.max(0, (state.clubs.length - 1) * 2)
      : Math.max(0, (CLUB_SEEDS.length - 1) * 2);
  }

  function isTransferWindowOpen() {
    const totalRounds = seasonRoundCount();
    const currentRound = state ? state.currentRound : 0;
    const firstWindowEnd = Math.max(1, Math.floor(totalRounds * 0.1));
    const midSeason = Math.ceil(totalRounds / 2);
    return currentRound <= firstWindowEnd ||
      (currentRound >= midSeason - 1 && currentRound <= midSeason + 2);
  }

  function makeInitialState() {
    const clubs = CLUB_SEEDS.map(function (seed) {
      return {
        id: seed.id, name: seed.name, short: seed.short, budget: seed.budget, strength: seed.strength,
        played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, form: []
      };
    });
    const players = [];
    clubs.forEach(function (club, i) {
      generatePlayers({ id: club.id, strength: CLUB_SEEDS[i].strength }).forEach(function (p) { players.push(p); });
    });
    return {
      version: CURRENT_VERSION, seasonYear: 2026, currentRound: 0, userClubId: "cairo",
      balance: 78000000, sponsorWeekly: 175000, mediaWeekly: 210000,
      clubs: clubs, players: players, fixtures: makeFixtures(clubs, 2026),
      tactics: {
        formation: "4-3-3", style: "balanced", mentality: "balanced", trainingFocus: "balanced",
        captainId: players.filter(function (player) { return player.clubId === "cairo"; })
          .sort(function (a, b) { return b.overall - a.overall; })[0]?.id || null
      },
      lastTrainingRound: -1, history: [], inbox: [
        { id: "welcome", title: "أهلًا بك في Touchline Manager", text: "مجلس الإدارة يتوقع المنافسة على المراكز الأربعة الأولى هذا الموسم. ابنِ فريقك، وراقب الميزانية، وطوّر اللاعبين.", kind: "info", read: false }
      ],
      career: { seasonsPlayed: 0, transfersIn: 0, transfersOut: 0, matchesManaged: 0, bestFinish: null }
    };
  }

  function repairLoadedState(saved) {
    if (!saved || (saved.version !== 1 && saved.version !== CURRENT_VERSION) || !Array.isArray(saved.clubs) || !Array.isArray(saved.players) || !Array.isArray(saved.fixtures)) return null;
    const savedVersion = saved.version;
    if (!saved.clubs.some(function (c) { return c.id === saved.userClubId; })) return null;
    if (savedVersion < CURRENT_VERSION) {
      const previousFixtures = new Map(saved.fixtures.map(function (fixture) { return [fixture.id, fixture]; }));
      saved.fixtures = makeFixtures(saved.clubs, saved.seasonYear).map(function (fixture) {
        const previous = previousFixtures.get(fixture.id);
        return previous ? Object.assign(fixture, previous) : fixture;
      });
      saved.version = CURRENT_VERSION;
    }
    saved.tactics = saved.tactics || { formation: "4-3-3", style: "balanced", mentality: "balanced", trainingFocus: "balanced", captainId: null };
    saved.career = saved.career || { seasonsPlayed: 0, transfersIn: 0, transfersOut: 0, matchesManaged: 0, bestFinish: null };
    if (!Number.isFinite(saved.career.transfersOut)) saved.career.transfersOut = 0;
    saved.history = saved.history || [];
    saved.inbox = saved.inbox || [];
    saved.lastTrainingRound = Number.isInteger(saved.lastTrainingRound) ? saved.lastTrainingRound : -1;
    if (!saved.players.some(function (p) { return p.id === saved.tactics.captainId && p.clubId === saved.userClubId; })) {
      saved.tactics.captainId = null;
    }
    saved.players.forEach(function (p) {
      if (!Number.isFinite(p.contractYears)) p.contractYears = randomInt(1, 3);
      if (!Number.isFinite(p.yellowCards)) p.yellowCards = 0;
      if (!Number.isFinite(p.appearances)) p.appearances = 0;
      if (!Number.isFinite(p.goals)) p.goals = 0;
      if (!Number.isFinite(p.assists)) p.assists = 0;
      if (!Number.isFinite(p.wage)) p.wage = Math.round((p.overall * 620 + 10000) / 100) * 100;
      if (p.position === "GK") {
        if (!Number.isFinite(p.goalkeeping) || p.goalkeeping < 1) p.goalkeeping = clamp(p.overall, 35, 98);
      } else {
        p.goalkeeping = 0;
      }
    });
    return saved;
  }

  function saveGame(showMessage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      const saveLabel = document.getElementById("save-label");
      if (saveLabel) saveLabel.textContent = "تم الحفظ تلقائيًا";
      if (showMessage) toast("تم حفظ مسيرتك بنجاح");
      return true;
    } catch (error) {
      const saveLabel = document.getElementById("save-label");
      if (saveLabel) saveLabel.textContent = "تعذّر الحفظ على هذا الجهاز";
      if (showMessage) toast("تعذّر حفظ المسيرة. تأكد من مساحة التخزين.", "error");
      return false;
    }
  }

  function toast(message, kind) {
    const el = document.createElement("div");
    el.className = "toast" + (kind ? " " + kind : "");
    el.textContent = message;
    toastRegion.appendChild(el);
    window.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3200);
  }

  function startModal(title, body, actions) {
    modalRoot.innerHTML = '<div class="modal-backdrop" data-action="dismiss-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="' + safeName(title) + '"><h2>' + title + '</h2><div>' + body + '</div><div class="modal-actions">' + actions + '</div></section></div>';
    const backdrop = modalRoot.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function (event) {
        if (event.target === backdrop) modalRoot.innerHTML = "";
      });
    }
  }

  function goTo(view) {
    currentView = view;
    const titles = {
      overview: "مركز الإدارة", squad: "الفريق الأول", tactics: "التكتيك والخطة",
      fixtures: "المباريات والدوري", transfers: "سوق الانتقالات", training: "التدريب والتطوير", finances: "المالية"
    };
    document.querySelectorAll(".nav-item").forEach(function (button) {
      button.classList.toggle("active", button.dataset.view === view);
    });
    const title = document.getElementById("page-title");
    if (title) title.textContent = titles[view] || "مركز الإدارة";
    render();
    if (root) root.focus({ preventScroll: true });
  }

  function currentUserStrength() {
    const xi = bestXI().filter(Boolean);
    if (!xi.length) return 50;
    return xi.reduce(function (sum, p) { return sum + p.overall; }, 0) / xi.length;
  }

  function roleAttributeScore(player, wanted) {
    const weights = {
      GK: { overall: 0.35, goalkeeping: 0.55, defending: 0.05, passing: 0.05 },
      LB: { overall: 0.30, defending: 0.20, pace: 0.20, passing: 0.20, finishing: 0.10 },
      RB: { overall: 0.30, defending: 0.20, pace: 0.20, passing: 0.20, finishing: 0.10 },
      CB: { overall: 0.35, defending: 0.30, pace: 0.15, passing: 0.15, finishing: 0.05 },
      DM: { overall: 0.30, defending: 0.25, passing: 0.25, pace: 0.08, finishing: 0.12 },
      CM: { overall: 0.30, passing: 0.30, defending: 0.15, finishing: 0.15, pace: 0.10 },
      AM: { overall: 0.30, passing: 0.25, finishing: 0.25, pace: 0.15, defending: 0.05 },
      LW: { overall: 0.30, pace: 0.25, finishing: 0.25, passing: 0.15, defending: 0.05 },
      RW: { overall: 0.30, pace: 0.25, finishing: 0.25, passing: 0.15, defending: 0.05 },
      ST: { overall: 0.30, finishing: 0.40, pace: 0.15, passing: 0.10, defending: 0.05 }
    };
    const roleWeights = weights[wanted] || weights.CM;
    return Object.keys(roleWeights).reduce(function (sum, attribute) {
      return sum + (Number(player[attribute]) || 0) * roleWeights[attribute];
    }, 0);
  }

  function bestXI(clubId) {
    const targetClubId = clubId || state.userClubId;
    const squad = state.players.filter(function (p) { return p.clubId === targetClubId && p.injuredWeeks <= 0; }).sort(function (a, b) { return b.overall - a.overall; });
    const formation = targetClubId === state.userClubId ? (FORMATIONS[state.tactics.formation] || POSITION_ORDER) : POSITION_ORDER;
    const available = squad.slice();
    return formation.map(function (wanted) {
      let bestIndex = -1, bestScore = -Infinity;
      available.forEach(function (p, i) {
        if ((p.position === "GK") !== (wanted === "GK")) return;
        const fitnessPenalty = p.fitness < 60 ? 5 : p.fitness < 75 ? 2 : 0;
        const captainBonus = p.id === state.tactics.captainId ? 2 : 0;
        const score = roleAttributeScore(p, wanted) + positionFit(p.position, wanted) - fitnessPenalty + (p.morale >= 75 ? 0.5 : 0) + captainBonus;
        if (score > bestScore) { bestIndex = i; bestScore = score; }
      });
      if (bestIndex < 0) return null;
      return available.splice(bestIndex, 1)[0];
    });
  }

  function sortedTable() {
    return state.clubs.slice().sort(function (a, b) {
      return b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor || b.strength - a.strength;
    });
  }

  function leaguePosition() {
    return sortedTable().findIndex(function (c) { return c.id === state.userClubId; }) + 1;
  }

  function updateClubStrengths() {
    state.clubs.forEach(function (club) {
      const squad = state.players.filter(function (p) { return p.clubId === club.id; });
      if (squad.length) club.strength = Math.round(squad.reduce(function (sum, p) { return sum + p.overall; }, 0) / squad.length);
    });
  }

  function formStrip(club) {
    const forms = (club.form || []).slice(-5);
    if (!forms.length) return '<span class="small-note">—</span>';
    return '<div class="form-strip">' + forms.map(function (r) { return '<span class="form-result ' + r + '">' + r + '</span>'; }).join("") + '</div>';
  }

  function tableRows(clubs, detailed) {
    return clubs.map(function (club, idx) {
      const current = club.id === state.userClubId;
      return '<tr' + (current ? ' class="current-club"' : '') + '>' +
        '<td class="numeric"><span class="rank-number ' + (current ? 'current' : '') + '">' + (idx + 1).toLocaleString("ar-EG") + '</span></td>' +
        '<td><div class="club-cell"><span class="tiny-crest">' + safeName(club.short) + '</span><span>' + safeName(club.name) + (current ? ' <span class="small-note">(أنت)</span>' : '') + '</span></div></td>' +
        '<td class="numeric">' + number(club.played) + '</td><td class="numeric">' + number(club.wins) + '</td>' +
        '<td class="numeric">' + number(club.draws) + '</td><td class="numeric">' + number(club.losses) + '</td>' +
        '<td class="numeric">' + number(club.goalsFor - club.goalsAgainst) + '</td>' +
        '<td class="numeric"><strong>' + number(club.points) + '</strong></td>' +
        (detailed ? '<td>' + formStrip(club) + '</td>' : '') + '</tr>';
    }).join("");
  }

  function leagueTable(detailed) {
    return '<div class="table-wrap"><table><thead><tr><th class="numeric">#</th><th>النادي</th><th class="numeric">ل</th><th class="numeric">ف</th><th class="numeric">ت</th><th class="numeric">خ</th><th class="numeric">+/-</th><th class="numeric">ن</th>' + (detailed ? '<th>آخر 5</th>' : '') + '</tr></thead><tbody>' + tableRows(sortedTable(), detailed) + '</tbody></table></div>';
  }

  function fixtureRow(fixture) {
    const home = clubById(fixture.homeId), away = clubById(fixture.awayId);
    const playedScore = fixture.played ? number(fixture.homeGoals) + " - " + number(fixture.awayGoals) : "لم تُلعب";
    const matchDate = new Date(Date.UTC(state.seasonYear, 6, 1 + (fixture.round - 1) * 7, 12));
    return '<div class="fixture-row">' +
      '<div class="fixture-date">' + dateLabel(matchDate).replace(/،.*$/, "") + '<br><span class="small-note">الجولة ' + number(fixture.round) + '</span></div>' +
      '<div class="fixture-teams"><strong>' + safeName(home.name) + '</strong><span class="vs">×</span><strong>' + safeName(away.name) + '</strong></div>' +
      '<div class="fixture-score ' + (fixture.played ? '' : 'pending') + '">' + playedScore + (fixture.played ? '<button class="panel-action report-link" data-action="show-match-report" data-fixture-id="' + safeName(fixture.id) + '">تقرير المباراة</button>' : '') + '</div></div>';
  }

  function reportStat(label, homeValue, awayValue, total) {
    const sum = total || (Number(homeValue) + Number(awayValue)) || 1;
    const homeWidth = clamp(Number(homeValue) / sum * 100, 0, 100);
    const awayWidth = 100 - homeWidth;
    return '<div class="report-stat"><div class="report-stat-values"><strong>' + safeName(homeValue) + '</strong><span>' + safeName(label) + '</span><strong>' + safeName(awayValue) + '</strong></div><div class="report-stat-bars"><span style="width:' + homeWidth + '%"></span><i style="width:' + awayWidth + '%"></i></div></div>';
  }

  function showMatchReport(fixtureId) {
    const fixture = state.fixtures.find(function (f) { return f.id === fixtureId; });
    if (!fixture || !fixture.played || !fixture.report) {
      toast("تقرير المباراة متاح بعد محاكاة الجولة.", "warning");
      return;
    }
    const home = clubById(fixture.homeId), away = clubById(fixture.awayId);
    const report = fixture.report;
    const userHome = home.id === state.userClubId;
    const userGoals = userHome ? fixture.homeGoals : fixture.awayGoals;
    const opponentGoals = userHome ? fixture.awayGoals : fixture.homeGoals;
    const outcome = userGoals > opponentGoals ? "فوز" : userGoals === opponentGoals ? "تعادل" : "خسارة";
    const eventItems = report.events.length ? report.events.map(function (event) {
      const eventClub = clubById(event.teamId);
      const icon = event.kind === "goal" ? "⚽" : event.kind === "card" ? "🟨" : "✚";
      const kind = event.kind === "goal" ? "goal" : event.kind === "card" ? "card" : "injury";
      return '<div class="match-event ' + kind + '"><span class="event-minute">' + number(event.minute) + '′</span><span class="event-icon">' + icon + '</span><span class="event-text">' + safeName(event.text) + '</span><span class="event-team">' + safeName(eventClub ? eventClub.short : "") + '</span></div>';
    }).join("") : '<div class="empty-state">مباراة هادئة من غير أهداف أو أحداث مسجلة.</div>';
    const title = safeName(home.name) + " " + number(fixture.homeGoals) + " - " + number(fixture.awayGoals) + " " + safeName(away.name);
    const body = '<div class="report-scoreboard">' +
      '<div class="report-team"><span class="club-crest">' + safeName(home.short) + '</span><strong>' + safeName(home.name) + '</strong><small>' + (userHome ? "فريقك" : "صاحب الأرض") + '</small></div>' +
      '<div class="report-final-score"><strong>' + number(fixture.homeGoals) + '</strong><span>FULL TIME</span><strong>' + number(fixture.awayGoals) + '</strong></div>' +
      '<div class="report-team"><span class="club-crest">' + safeName(away.short) + '</span><strong>' + safeName(away.name) + '</strong><small>' + (!userHome ? "فريقك" : "الضيف") + '</small></div></div>' +
      (home.id === state.userClubId || away.id === state.userClubId ? '<div class="status-tag report-outcome">' + outcome + ' لفريقك</div>' : '') +
      '<div class="report-stats">' +
      reportStat("الاستحواذ ٪", report.home.possession, report.away.possession, 100) +
      reportStat("التسديدات", report.home.shots, report.away.shots) +
      reportStat("على المرمى", report.home.onTarget, report.away.onTarget) +
      (Number.isFinite(report.home.xG) && Number.isFinite(report.away.xG)
        ? reportStat("الأهداف المتوقعة (xG)", report.home.xG.toFixed(2), report.away.xG.toFixed(2))
        : '') +
      reportStat("الركنيات", report.home.corners, report.away.corners) +
      reportStat("دقة التمرير ٪", report.home.passAccuracy, report.away.passAccuracy, 100) +
      reportStat("الإنذارات", report.home.yellowCards, report.away.yellowCards) +
      '</div><div class="report-events"><div class="panel-header"><h3 class="panel-title">أحداث المباراة</h3><span class="small-note">' + number(report.events.length) + ' أحداث</span></div>' + eventItems + '</div>';
    startModal("تقرير المباراة", '<div class="small-note" style="margin-bottom:10px">' + title + ' · الجولة ' + number(fixture.round) + '</div>' + body, '<button class="button button-primary" data-action="dismiss-modal">إغلاق التقرير</button>');
  }

  function recentFixtures(count) {
    return state.fixtures.filter(function (f) { return f.played && (f.homeId === state.userClubId || f.awayId === state.userClubId); }).slice(-count).reverse();
  }

  function teamToken(club, label) {
    return '<div class="team-token"><span class="club-crest">' + safeName(club.short) + '</span><span>' + safeName(label || club.name) + '</span></div>';
  }

  function overviewView() {
    const club = userClub();
    const pos = leaguePosition();
    const fixture = nextUserFixture();
    const nextMatch = fixture ? clubById(fixture.homeId === club.id ? fixture.awayId : fixture.homeId) : null;
    const home = fixture && fixture.homeId === club.id;
    const xi = bestXI();
    const played = club.played;
    const form = club.form.slice(-5).join(" · ") || "لم تبدأ المنافسات";
    const squad = userPlayers();
    const avgAge = squad.length ? (squad.reduce(function (sum, p) { return sum + p.age; }, 0) / squad.length).toFixed(1) : "—";
    const recentMessages = state.inbox.slice(0, 3);
    const unreadMessages = state.inbox.filter(function (message) { return !message.read; }).length;
    const nextButton = state.currentRound >= seasonRoundCount() ? "بدء الموسم التالي" : "محاكاة الجولة التالية";
    const nextDesc = state.currentRound >= seasonRoundCount() ? "الموسم انتهى — جهّز الفريق للموسم الجديد" : "محاكاة نتائج الجولة وتحديث الدوري والمالية";
    return '<div class="page-heading"><div><div class="eyebrow">CLUB CONTROL CENTER</div><h1>صباح الخير، مدير النادي</h1><p>كل تفاصيل ناديك في مكان واحد. القرارات اللي بتاخدها هنا بتأثر على الموسم كله.</p></div><button class="button button-primary" data-action="play-next-round">' + nextButton + ' <span aria-hidden="true">←</span></button></div>' +
      '<section class="hero-card"><div class="hero-main"><div class="hero-kicker">YOUR CLUB · SEASON ' + safeName(seasonLabel()) + '</div><h2>كل قرار بيقرّبك من القمة.</h2><p>' + safeName(club.name) + ' في المركز ' + number(pos) + '، وتقييم التشكيلة الأساسية ' + Math.round(currentUserStrength()).toLocaleString("ar-EG") + '. ' + nextDesc + '.</p><div class="hero-actions"><button class="button button-primary" data-view="tactics">مراجعة التكتيك</button><button class="button button-secondary" data-view="squad">إدارة الفريق</button></div></div><div class="next-match"><div class="match-label">المباراة القادمة · الجولة ' + (fixture ? number(fixture.round) : number(state.currentRound)) + '</div><div class="match-opponent">' + (nextMatch ? safeName(nextMatch.name) : "نهاية الموسم") + '</div><div class="match-meta">' + (fixture ? (home ? "على ملعبك" : "خارج ملعبك") + " · " + dateLabel(new Date(Date.UTC(state.seasonYear, 6, 1 + (fixture.round - 1) * 7, 12))) : "كل مباريات الدوري اكتملت") + '</div><div class="match-teams">' + teamToken(home ? club : (nextMatch || club), home ? club.short : (nextMatch || club).short) + '<span class="vs">VS</span>' + teamToken(home ? nextMatch || club : club, home ? (nextMatch || club).short : club.short) + '</div><div class="match-progress"><span style="width:' + Math.round(state.currentRound / (seasonRoundCount()) * 100) + '%"></span></div><div class="small-note" style="margin-top:7px">تقدم الموسم: ' + number(state.currentRound) + ' من ' + number(seasonRoundCount()) + ' جولة</div></div></section>' +
      '<section class="grid grid-4" style="margin-bottom:17px">' +
      statCard("مركز الدوري", number(pos) + " / " + number(state.clubs.length), pos <= 4 ? "ضمن المراكز الأوروبية" : "الهدف: الوصول لأول 4", "var(--green)") +
      statCard("ميزانية النادي", shortMoney(state.balance), "السيولة المتاحة", "var(--blue)") +
      statCard("النقاط", number(club.points), played + " مباراة · " + form, "var(--amber)") +
      statCard("قوام الفريق", number(squad.length) + " لاعب", "متوسط العمر " + avgAge + " سنة", "#b2a0ff") +
      '</section><section class="grid grid-2" style="margin-bottom:17px"><div class="panel"><div class="panel-header"><div><h3 class="panel-title">جدول الدوري</h3><div class="panel-subtitle">ترتيب الموسم الحالي</div></div><button class="panel-action" data-view="fixtures">عرض كامل ←</button></div>' + leagueTable(false) + '</div><div class="panel"><div class="panel-header"><div><h3 class="panel-title">مباريات الفريق</h3><div class="panel-subtitle">آخر النتائج والمواجهة القادمة</div></div><button class="panel-action" data-view="fixtures">كل المباريات ←</button></div><div class="fixture-list">' + (recentFixtures(3).map(fixtureRow).join("") || '<div class="empty-state"><strong>لسه ما لعبناش</strong>ابدأ الموسم بمحاكاة الجولة الأولى.</div>') + (fixture ? fixtureRow(fixture) : '') + '</div></div></section>' +
      '<section class="grid grid-2"><div class="panel"><div class="panel-header"><div><h3 class="panel-title">تشكيلة متوقعة</h3><div class="panel-subtitle">' + safeName(state.tactics.formation) + ' · ' + safeName(TACTICAL_STYLES[state.tactics.style].label) + '</div></div><button class="panel-action" data-view="tactics">تعديل ←</button></div><div class="panel-body"><div class="grid grid-2">' + xi.slice(0, 6).map(playerCard).join("") + '</div></div></div><div class="panel"><div class="panel-header"><div><h3 class="panel-title">رسائل مجلس الإدارة</h3><div class="panel-subtitle">آخر المستجدات داخل النادي</div></div><button class="panel-action" data-action="open-inbox">فتح الرسائل (' + number(unreadMessages) + ') ←</button></div><div class="panel-body"><div class="inbox-preview">' + (recentMessages.map(function (message) {
        const icon = message.kind === "success" ? "✓" : message.kind === "warning" ? "!" : "i";
        return '<article class="inbox-item ' + (message.read ? '' : 'unread') + '"><span class="inbox-mark ' + safeName(message.kind || 'info') + '">' + icon + '</span><div class="inbox-message"><strong>' + safeName(message.title) + '</strong><p>' + safeName(message.text) + '</p></div>' + (message.read ? '' : '<button class="panel-action inbox-read-button" data-action="mark-inbox-read" data-message-id="' + safeName(message.id) + '">مقروء</button>') + '</article>';
      }).join("") || '<div class="empty-state"><strong>مفيش رسائل جديدة</strong>هتظهر هنا قرارات المجلس وتحديثات الفريق.</div>') + '</div><div class="notice" style="margin-top:13px">هدف الموسم: إنهاء الدوري ضمن أول أربعة مراكز، مع الحفاظ على الاستقرار المالي وتطوير اللاعبين الشباب.</div><div class="inline-stat"><span>نتائج آخر المباريات</span><strong>' + safeName(form) + '</strong></div><div class="inline-stat"><span>الإنفاق الأسبوعي على الأجور</span><strong>' + money(totalWages()) + '</strong></div><div class="inline-stat"><span>عدد الصفقات هذا الموسم</span><strong>' + number(state.career.transfersIn) + '</strong></div></div></div></section>';
  }

  function statCard(label, value, foot, accent) {
    return '<div class="panel stat-card" style="--accent:' + accent + '"><div class="stat-label">' + label + '</div><div class="stat-value">' + value + '</div><div class="stat-foot">' + foot + '</div></div>';
  }

  function playerCard(player) {
    if (!player) return '';
    return '<div class="player-card"><div class="player-number">' + safeName(player.position) + '</div><div class="player-card-main"><strong>' + safeName(player.name) + '</strong><small>' + number(player.age) + ' سنة · ' + safeName(POSITION_LABELS[player.position]) + '</small></div><div class="player-ovr">' + number(player.overall) + '</div></div>';
  }

  function squadView() {
    const players = userPlayers().filter(function (p) {
      const text = (p.name + " " + p.position + " " + (POSITION_LABELS[p.position] || "")).toLowerCase();
      return !playerSearch || text.indexOf(playerSearch.toLowerCase()) >= 0;
    });
    const avgs = userPlayers().length ? Math.round(userPlayers().reduce(function (a, p) { return a + p.overall; }, 0) / userPlayers().length) : 0;
    return '<div class="page-heading"><div><div class="eyebrow">FIRST TEAM</div><h1>الفريق الأول</h1><p>تابع مستوى اللاعبين وحالتهم البدنية ورواتبهم وقيمتهم السوقية.</p></div><button class="button button-secondary" data-view="training">فتح مركز التدريب</button></div><section class="grid grid-4" style="margin-bottom:17px">' +
      statCard("عدد اللاعبين", number(userPlayers().length), "الحد الأقصى المقترح: 25", "var(--green)") +
      statCard("متوسط التقييم", number(avgs), "من 100", "var(--blue)") +
      statCard("الجاهزية البدنية", pct(userPlayers().reduce(function (sum, p) { return sum + p.fitness; }, 0) / Math.max(1, userPlayers().length)), "متوسط الفريق", "var(--amber)") +
      statCard("إجمالي الأجور", money(totalWages()), "أسبوعيًا", "#b2a0ff") +
      '</section><div class="panel"><div class="panel-header"><div><h3 class="panel-title">قائمة اللاعبين</h3><div class="panel-subtitle">الأعلى تقييمًا يظهر أولًا</div></div><span class="status-tag">' + number(players.length) + ' لاعب</span></div><div class="filter-bar" style="padding:0 19px 14px"><input id="squad-search" type="text" value="' + safeName(playerSearch) + '" placeholder="ابحث بالاسم أو المركز..." aria-label="بحث في الفريق"><button class="button button-secondary button-small" data-action="search-squad">بحث</button></div><div class="table-wrap"><table class="squad-table"><thead><tr><th>اللاعب</th><th>المركز</th><th class="numeric">العمر</th><th class="numeric">OVR</th><th class="numeric">POT</th><th>الجاهزية</th><th class="numeric">الأجور/أسبوع</th><th>العقد</th><th>إجراء</th><th class="numeric">القيمة السوقية</th></tr></thead><tbody>' + players.map(function (p) {
        const condition = p.injuredWeeks > 0 ? '<span class="status-tag injured">مصاب ' + number(p.injuredWeeks) + ' ج</span>' : p.fitness < 60 ? '<span class="status-tag suspended">إرهاق</span>' : '<span class="status-tag">جاهز ' + pct(p.fitness) + '</span>';
        const contractTag = p.contractYears <= 1 ? '<span class="status-tag suspended">ينتهي قريبًا</span>' : '<span class="status-tag">' + number(p.contractYears) + ' سنوات</span>';
        return '<tr data-player="' + safeName(p.id) + '"><td><div class="player-name">' + safeName(p.name) + '</div><div class="player-meta">مشاركات ' + number(p.appearances) + ' · أهداف ' + number(p.goals) + ' · صناعة ' + number(p.assists) + '</div></td><td><span class="position-badge">' + safeName(p.position) + '</span><div class="player-meta">' + safeName(POSITION_LABELS[p.position]) + '</div></td><td class="numeric">' + number(p.age) + '</td><td class="numeric"><span class="rating ' + (p.overall >= 75 ? 'high' : p.overall < 60 ? 'low' : '') + '">' + number(p.overall) + '</span></td><td class="numeric">' + number(p.potential) + '</td><td>' + condition + '</td><td class="numeric">' + money(p.wage) + '</td><td>' + contractTag + '</td><td><div class="row-actions"><button class="button button-secondary button-small" data-action="renew-contract" data-player-id="' + safeName(p.id) + '">تجديد</button><button class="button button-danger button-small" data-action="sell-player" data-player-id="' + safeName(p.id) + '">بيع</button></div></td><td class="numeric">' + money(p.value) + '</td></tr>';
      }).join("") + '</tbody></table></div></div>';
  }

  function tacticsView() {
    const xi = bestXI();
    const slots = FORMATIONS[state.tactics.formation] || POSITION_ORDER;
    const layoutByFormation = {
      "4-3-3": [[3,5],[1,4],[2,4],[4,4],[5,4],[2,3],[3,3],[4,3],[2,2],[3,2],[4,2]],
      "4-2-3-1": [[3,5],[1,4],[2,4],[4,4],[5,4],[2,3],[4,3],[1,2],[3,2],[5,2],[3,1]],
      "4-4-2": [[3,5],[1,4],[2,4],[4,4],[5,4],[1,3],[2,3],[4,3],[5,3],[2,2],[4,2]]
    };
    const layout = layoutByFormation[state.tactics.formation] || layoutByFormation["4-3-3"];
    const pitchPlayers = slots.map(function (pos, i) {
      const player = xi[i] || null;
      const coords = layout[i] || [3, 3];
      return '<div class="pitch-slot" style="grid-column:' + coords[0] + ';grid-row:' + coords[1] + '"><div class="pitch-player" title="' + (player ? safeName(player.name) : "مركز فارغ") + '">' + (player ? safeName(player.position) : "--") + '</div><div class="pitch-name">' + (player ? safeName(player.name) : "لاعب غير متاح") + '</div></div>';
    }).join("");
    return '<div class="page-heading"><div><div class="eyebrow">TACTICAL BOARD</div><h1>التكتيك والخطة</h1><p>اختار طريقة اللعب والعقلية؛ تأثيرها يدخل مباشرة في حسابات محاكاة المباريات.</p></div><span class="status-tag">تشكيلة ' + number(xi.filter(Boolean).length) + '/11</span></div>' +
      '<section class="grid grid-2"><div class="panel"><div class="panel-header"><div><h3 class="panel-title">لوحة التكتيك</h3><div class="panel-subtitle">تشكيلتك المتوقعة للمباراة القادمة</div></div></div><div class="panel-body"><div class="pitch">' + pitchPlayers + '</div><div class="small-note" style="margin-top:10px">التشكيلة تلقائية حسب التقييم والمركز واللياقة. التغييرات هنا تحفظ فورًا.</div></div></div>' +
      '<div class="panel"><div class="panel-header"><div><h3 class="panel-title">إعدادات الفريق</h3><div class="panel-subtitle">كل اختيار يغيّر توازن الهجوم والدفاع والإجهاد.</div></div></div><div class="panel-body"><div class="form-grid"><div class="field-group"><label class="field-label" for="formation-select">الخطة الأساسية</label><select id="formation-select" data-setting="formation">' + Object.keys(FORMATIONS).map(function (f) { return '<option value="' + f + '"' + (state.tactics.formation === f ? ' selected' : '') + '>' + f + '</option>'; }).join("") + '</select></div><div class="field-group"><label class="field-label" for="style-select">أسلوب اللعب</label><select id="style-select" data-setting="style">' + Object.keys(TACTICAL_STYLES).map(function (key) { return '<option value="' + key + '"' + (state.tactics.style === key ? ' selected' : '') + '>' + TACTICAL_STYLES[key].label + '</option>'; }).join("") + '</select></div><div class="field-group"><label class="field-label" for="mentality-select">عقلية الفريق</label><select id="mentality-select" data-setting="mentality">' + Object.keys(MENTALITIES).map(function (key) { return '<option value="' + key + '"' + (state.tactics.mentality === key ? ' selected' : '') + '>' + MENTALITIES[key].label + '</option>'; }).join("") + '</select></div><div class="field-group"><label class="field-label" for="captain-select">قائد الفريق</label><select id="captain-select" data-setting="captainId"><option value=""' + (!state.tactics.captainId ? ' selected' : '') + '>بدون قائد</option>' + userPlayers().slice().sort(function (a, b) { return a.name.localeCompare(b.name, "ar"); }).map(function (player) { return '<option value="' + safeName(player.id) + '"' + (state.tactics.captainId === player.id ? ' selected' : '') + '>' + safeName(player.name) + ' · ' + safeName(POSITION_LABELS[player.position] || player.position) + '</option>'; }).join("") + '</select><div class="small-note" style="margin-top:6px">القائد المشارك في التشكيلة يمنح الفريق دفعة قيادة بسيطة.</div></div><div class="field-group"><label class="field-label">تأثير الخطة</label><div class="inline-stat"><span>الهجوم</span><strong class="rating">' + signed(tacticalAttack()) + '</strong></div><div class="inline-stat"><span>الدفاع</span><strong class="rating">' + signed(tacticalDefense()) + '</strong></div></div></div><div class="notice" style="margin-top:17px">معلومة: الضغط العالي يرفع فرص استعادة الكرة والهجوم، لكنه يستهلك اللياقة أسرع. الكتلة الدفاعية تقلل المخاطرة على حساب الهجوم.</div></div></div></section>';
  }

  function signed(value) { return (value > 0 ? "+" : "") + value.toLocaleString("ar-EG", { maximumFractionDigits: 1 }); }
  function tacticalAttack() { return (TACTICAL_STYLES[state.tactics.style] || TACTICAL_STYLES.balanced).attack + (MENTALITIES[state.tactics.mentality] || MENTALITIES.balanced).attack; }
  function tacticalDefense() { return (TACTICAL_STYLES[state.tactics.style] || TACTICAL_STYLES.balanced).defense + (MENTALITIES[state.tactics.mentality] || MENTALITIES.balanced).defense; }

  function fixturesView() {
    const standings = leagueTable(true);
    const matches = state.fixtures.slice().sort(function (a, b) { return a.round - b.round; });
    let content = "";
    for (let round = 1; round <= seasonRoundCount(); round += 1) {
      const items = matches.filter(function (f) { return f.round === round; });
      const played = items.every(function (f) { return f.played; });
      content += '<div class="panel" style="margin-bottom:12px"><div class="panel-header"><div><h3 class="panel-title">الجولة ' + number(round) + '</h3><div class="panel-subtitle">' + (played ? "اكتملت الجولة" : round === state.currentRound + 1 ? "الجولة القادمة" : "لم تُلعب بعد") + '</div></div>' + (round === state.currentRound + 1 && !played ? '<button class="button button-primary button-small" data-action="play-next-round">محاكاة الجولة</button>' : '') + '</div><div class="fixture-list">' + items.map(fixtureRow).join("") + '</div></div>';
    }
    return '<div class="page-heading"><div><div class="eyebrow">LEAGUE & SCHEDULE</div><h1>المباريات والدوري</h1><p>كل النتائج والترتيب وفارق الأهداف ومشوار الموسم.</p></div><button class="button button-primary" data-action="play-next-round">' + (state.currentRound >= seasonRoundCount() ? "بدء الموسم التالي" : "محاكاة الجولة التالية") + '</button></div><div class="panel" style="margin-bottom:17px"><div class="panel-header"><div><h3 class="panel-title">جدول الترتيب</h3><div class="panel-subtitle">النقاط ثم فارق الأهداف ثم الأهداف المسجلة</div></div><span class="status-tag">الجولة ' + number(state.currentRound) + ' / ' + number(seasonRoundCount()) + '</span></div>' + standings + '</div><div class="grid grid-2"><div>' + content + '</div><div class="panel" style="height:max-content"><div class="panel-header"><div><h3 class="panel-title">ملخص الدوري</h3><div class="panel-subtitle">الوضع الحالي في البطولة</div></div></div><div class="panel-body"><div class="inline-stat"><span>المركز الحالي</span><strong>' + number(leaguePosition()) + ' من ' + number(state.clubs.length) + '</strong></div><div class="inline-stat"><span>مباريات لعبت</span><strong>' + number(userClub().played) + '</strong></div><div class="inline-stat"><span>معدل النقاط</span><strong>' + (userClub().played ? (userClub().points / userClub().played).toLocaleString("ar-EG", { maximumFractionDigits: 2 }) : "0") + '</strong></div><div class="inline-stat"><span>الأهداف المسجلة</span><strong>' + number(userClub().goalsFor) + '</strong></div><div class="inline-stat"><span>الأهداف المستقبلة</span><strong>' + number(userClub().goalsAgainst) + '</strong></div><div class="notice" style="margin-top:15px">كل جولة تحاكي نتائج الأندية كلها، وتحدّث جدول الترتيب واللياقة والأجور تلقائيًا.</div></div></div></div>';
  }

  function marketPlayers() {
    return state.players.filter(function (p) {
      if (p.clubId === state.userClubId || p.age > 35 || p.injuredWeeks > 0) return false;
      const club = clubById(p.clubId);
      const match = (p.name + " " + p.position + " " + (POSITION_LABELS[p.position] || "") + " " + (club ? club.name : "")).toLowerCase();
      return !marketSearch || match.indexOf(marketSearch.toLowerCase()) >= 0;
    }).sort(function (a, b) { return b.overall - a.overall; }).slice(0, 40);
  }

  function transfersView() {
    const market = marketPlayers();
    const windowOpen = isTransferWindowOpen();
    const availableBudget = state.balance;
    return '<div class="page-heading"><div><div class="eyebrow">RECRUITMENT ROOM</div><h1>سوق الانتقالات</h1><p>استهدف لاعبين يناسبوا أسلوبك وإمكانات النادي، وراقب تأثير الصفقة على السيولة.</p></div><span class="status-tag ' + (windowOpen ? '' : 'suspended') + '">' + (windowOpen ? "فترة الانتقالات مفتوحة" : "الفترة الحالية مغلقة") + '</span></div>' +
      '<section class="grid grid-3" style="margin-bottom:17px">' + statCard("الميزانية المتاحة", shortMoney(availableBudget), "رصيد النادي الحالي", "var(--green)") + statCard("عدد الصفقات", number(state.career.transfersIn), "إجمالي صفقات المسيرة", "var(--blue)") + statCard("قوام الفريق", number(userPlayers().length), userPlayers().length >= 25 ? "الفريق وصل للحد المقترح" : "مساحة للتعاقدات الجديدة", "var(--amber)") + '</section>' +
      (!windowOpen ? '<div class="notice" style="margin-bottom:14px">سوق الانتقالات مغلق بين النافذتين. ستفتح الفترة الأولى في بداية الموسم، ثم تفتح مجددًا قرب منتصفه.</div>' : '') +
      '<div class="panel"><div class="panel-header"><div><h3 class="panel-title">قائمة اللاعبين المتاحين</h3><div class="panel-subtitle">تقدير القيمة السوقية تقريبي، والتعاقد الفوري يتطلب رصيدًا كافيًا.</div></div><span class="status-tag">' + number(market.length) + ' نتيجة</span></div><div class="filter-bar" style="padding:0 19px 14px"><input id="market-search" type="text" value="' + safeName(marketSearch) + '" placeholder="ابحث عن لاعب أو مركز أو نادي..." aria-label="البحث في سوق الانتقالات"><button class="button button-secondary button-small" data-action="search-market">بحث</button></div><div class="panel-body"><div class="transfer-grid">' + (market.map(function (p) {
        const club = clubById(p.clubId);
        const fee = transferFee(p);
        const canBuy = windowOpen && userPlayers().length < 25 && availableBudget >= fee;
        return '<article class="transfer-card"><div class="transfer-card-top"><div class="player-number">' + safeName(p.position) + '</div><div class="transfer-card-info"><strong>' + safeName(p.name) + '</strong><small>' + safeName(club ? club.name : "لاعب حر") + ' · ' + safeName(POSITION_LABELS[p.position]) + ' · ' + number(p.age) + ' سنة</small><div class="small-note" style="margin-top:5px">التقييم <strong class="rating">' + number(p.overall) + '</strong> · الإمكانات ' + number(p.potential) + ' · لياقة ' + pct(p.fitness) + '</div><div class="player-meta">العقد المتبقي: ' + (p.clubId ? number(p.contractYears) + ' سنوات' : 'بدون نادٍ') + '</div></div><div class="transfer-price">' + shortMoney(fee) + '</div></div><div class="progress-bar"><span style="width:' + p.overall + '%"></span></div><div class="transfer-card-bottom"><span class="small-note">راتب أسبوعي: ' + money(p.wage) + '</span><button class="button ' + (canBuy ? 'button-primary' : 'button-secondary') + ' button-small" data-action="buy-player" data-player-id="' + safeName(p.id) + '"' + (canBuy ? '' : ' disabled') + '>التعاقد</button></div></article>';
      }).join("") || '<div class="empty-state"><strong>مفيش لاعبين مطابقين</strong>جرّب بحثًا آخر أو ارجع للسوق في فترة الانتقالات.</div>') + '</div></div></div>';
  }

  function transferFee(player) {
    if (!player.clubId || !clubById(player.clubId)) return Math.round(Math.max(200000, player.wage * 3) / 10000) * 10000;
    return Math.round(Math.max(player.value * 1.12, player.value + 900000) / 100000) * 100000;
  }

  function trainingView() {
    const players = userPlayers().slice().sort(function (a, b) { return a.fitness - b.fitness; });
    const alreadyTrained = state.lastTrainingRound === state.currentRound;
    const focusLabels = { balanced: "متوازن", attack: "هجوم وإنهاء", defense: "دفاع وتنظيم", technical: "تمرير وتحكم", fitness: "لياقة واستشفاء", youth: "تطوير الشباب" };
    return '<div class="page-heading"><div><div class="eyebrow">PLAYER DEVELOPMENT</div><h1>التدريب والتطوير</h1><p>اختار محور التدريب؛ التقدم يتراكم عبر الموسم وقد يرفع مستوى اللاعب بمرور الوقت.</p></div><button class="button button-primary" data-action="run-training"' + (alreadyTrained ? ' disabled' : '') + '>' + (alreadyTrained ? "تم تدريب الفريق هذا الأسبوع" : "تنفيذ حصة التدريب") + '</button></div>' +
      '<section class="grid grid-3" style="margin-bottom:17px">' + statCard("متوسط اللياقة", pct(players.reduce(function (s, p) { return s + p.fitness; }, 0) / Math.max(1, players.length)), "كلما ارتفعت قلّ خطر الإرهاق", "var(--green)") + statCard("التحسن المكتسب", number(players.reduce(function (s, p) { return s + p.trainingXp; }, 0)), "نقاط خبرة تدريبية متراكمة", "var(--blue)") + statCard("المحور المختار", focusLabels[state.tactics.trainingFocus] || "متوازن", "يتغير قبل تنفيذ الحصة", "var(--amber)") + '</section>' +
      '<section class="grid grid-2" style="margin-bottom:17px"><div class="panel"><div class="panel-header"><div><h3 class="panel-title">برنامج الحصة</h3><div class="panel-subtitle">اختر جانب التطوير الذي تحتاجه أكثر</div></div></div><div class="panel-body"><div class="field-group"><label class="field-label" for="training-focus">محور التدريب</label><select id="training-focus" data-setting="trainingFocus">' + Object.keys(focusLabels).map(function (k) { return '<option value="' + k + '"' + (state.tactics.trainingFocus === k ? ' selected' : '') + '>' + focusLabels[k] + '</option>'; }).join("") + '</select></div><div class="notice" style="margin-top:15px">تنفيذ التدريب مرة واحدة في كل أسبوع داخل اللعبة. المحاور الفنية تطوّر المهارة المستهدفة، ومحور اللياقة يزيد الجاهزية ويقلل الإرهاق.</div><div class="inline-stat"><span>الموعد الحالي</span><strong>' + dateLabel(dateForState()) + '</strong></div><div class="inline-stat"><span>حالة الحصة</span><strong>' + (alreadyTrained ? "منفذة" : "متاحة") + '</strong></div></div></div><div class="panel"><div class="panel-header"><div><h3 class="panel-title">الأكثر احتياجًا للتطوير</h3><div class="panel-subtitle">اللاعبون الأقل لياقة يظهرون أولًا</div></div></div><div class="panel-body">' + players.slice(0, 5).map(function (p) { return '<div style="margin-bottom:15px"><div class="inline-stat" style="padding-top:0"><strong>' + safeName(p.name) + '</strong><span>' + pct(p.fitness) + ' لياقة</span></div><div class="progress-bar"><span style="width:' + p.fitness + '%"></span></div></div>'; }).join("") + '</div></div></section>' +
      '<div class="panel"><div class="panel-header"><div><h3 class="panel-title">تقدم اللاعبين</h3><div class="panel-subtitle">التقييم الحالي والإمكانات واللياقة</div></div></div><div class="table-wrap"><table><thead><tr><th>اللاعب</th><th>المركز</th><th class="numeric">OVR</th><th class="numeric">POT</th><th>الخبرة</th><th>اللياقة</th></tr></thead><tbody>' + userPlayers().map(function (p) { return '<tr><td><strong>' + safeName(p.name) + '</strong></td><td><span class="position-badge">' + p.position + '</span></td><td class="numeric"><span class="rating">' + number(p.overall) + '</span></td><td class="numeric">' + number(p.potential) + '</td><td>' + number(p.trainingXp) + ' نقطة</td><td style="min-width:115px"><div class="progress-bar"><span style="width:' + p.fitness + '%"></span></div><span class="small-note">' + pct(p.fitness) + '</span></td></tr>'; }).join("") + '</tbody></table></div></div>';
  }

  function totalWages() {
    return userPlayers().reduce(function (sum, p) { return sum + p.wage; }, 0);
  }

  function contractDemand(player) {
    const ageAdjustment = player.age < 23 ? .13 : player.age > 31 ? -.07 : 0;
    const potentialAdjustment = clamp(player.potential - player.overall, 0, 20) * .009;
    const moraleAdjustment = (player.morale - 65) / 450;
    const urgencyAdjustment = player.contractYears <= 1 ? .05 : 0;
    return Math.max(5000, Math.round(player.wage * (1.08 + ageAdjustment + potentialAdjustment + moraleAdjustment + urgencyAdjustment) / 1000) * 1000);
  }

  function openRenewal(playerId) {
    const player = playerById(playerId);
    if (!player || player.clubId !== state.userClubId) {
      toast("اللاعب مش ضمن فريقك حاليًا.", "error");
      return;
    }
    const demand = contractDemand(player);
    const years = Math.max(2, Math.min(4, player.contractYears || 2));
    const body = '<p>التفاوض مع <strong>' + safeName(player.name) + '</strong>. الطلب بيتأثر بالعمر والإمكانات والمعنويات والمدة المتبقية.</p>' +
      '<div class="inline-stat"><span>الراتب الحالي</span><strong>' + money(player.wage) + ' / أسبوع</strong></div>' +
      '<div class="inline-stat"><span>الراتب المتوقع</span><strong class="rating">' + money(demand) + ' / أسبوع</strong></div>' +
      '<div class="form-grid" style="margin-top:14px"><div class="field-group"><label class="field-label" for="renewal-years">مدة العقد</label><select id="renewal-years">' + [1,2,3,4,5].map(function (n) { return '<option value="' + n + '"' + (n === years ? ' selected' : '') + '>' + number(n) + (n === 1 ? ' سنة' : ' سنوات') + '</option>'; }).join("") + '</select></div>' +
      '<div class="field-group"><label class="field-label" for="renewal-wage">العرض الأسبوعي (ج.م)</label><input id="renewal-wage" type="number" min="1000" step="1000" value="' + demand + '"></div></div>' +
      '<div class="notice" style="margin-top:14px">العرض الأقل بكثير من طلب اللاعب ممكن يُرفض، والعرض العادل يزيد فرصة التجديد. العقد الجديد يحل محل المدة الحالية.</div>';
    startModal("تجديد عقد اللاعب", body, '<button class="button button-secondary" data-action="dismiss-modal">إلغاء</button><button class="button button-primary" data-action="confirm-renew" data-player-id="' + safeName(player.id) + '">تقديم العرض</button>');
  }

  function confirmRenew(playerId) {
    const player = playerById(playerId);
    const yearsField = document.getElementById("renewal-years");
    const wageField = document.getElementById("renewal-wage");
    const years = Number(yearsField && yearsField.value);
    const offeredWage = Math.floor(Number(wageField && wageField.value));
    if (!player || player.clubId !== state.userClubId) {
      modalRoot.innerHTML = "";
      toast("لا يمكن تجديد عقد اللاعب ده حاليًا.", "error");
      return;
    }
    if (!Number.isInteger(years) || years < 1 || years > 5 || !Number.isFinite(offeredWage) || offeredWage < 1000) {
      toast("اكتب راتبًا صحيحًا وحدد مدة من سنة إلى خمس سنوات.", "error");
      return;
    }
    const demand = contractDemand(player);
    const ratio = offeredWage / demand;
    const chance = ratio >= 1.25 ? 1 : ratio < .85 ? .08 : clamp(.72 + (ratio - 1) * 1.5 + (player.morale - 65) / 140 + (player.contractYears <= 1 ? .06 : 0), .12, .96);
    modalRoot.innerHTML = "";
    if (Math.random() < chance) {
      player.wage = Math.round(offeredWage / 100) * 100;
      player.contractYears = years;
      player.morale = clamp(player.morale + 5, 0, 100);
      state.inbox.unshift({ id: "renew-" + player.id + "-" + state.seasonYear, title: "تجديد عقد ناجح", text: "وافق " + player.name + " على عقد جديد لمدة " + number(years) + " سنوات وبراتب أسبوعي " + money(player.wage) + ".", kind: "success", read: false });
      toast("اللاعب وافق على تجديد عقده.");
    } else {
      player.morale = clamp(player.morale - 5, 0, 100);
      state.inbox.unshift({ id: "renew-reject-" + player.id + "-" + state.seasonYear, title: "رفض عرض التجديد", text: "رفض " + player.name + " العرض الحالي. راجع الراتب أو حاول مرة أخرى لاحقًا.", kind: "warning", read: false });
      toast("اللاعب رفض العرض. معنوياته انخفضت قليلًا.", "warning");
    }
    saveGame(false);
    render();
  }

  function saleValue(player) {
    const multiplier = player.age < 23 ? .98 : player.age >= 30 ? .72 : .88;
    return Math.max(200000, Math.round(player.value * multiplier / 100000) * 100000);
  }

  function openPlayerSale(playerId) {
    const player = playerById(playerId);
    if (!player || player.clubId !== state.userClubId) { toast("اللاعب مش ضمن فريقك.", "error"); return; }
    if (!isTransferWindowOpen()) { toast("فترة الانتقالات مغلقة الآن، ومش هتقدر تبيع اللاعب قبل فتحها تاني.", "warning"); return; }
    if (userPlayers().length <= 15) { toast("مينفعش تبيع اللاعب ده؛ لازم تحتفظ بـ15 لاعب على الأقل.", "warning"); return; }
    const fee = saleValue(player);
    const buyers = state.clubs.filter(function (club) { return club.id !== state.userClubId && (club.budget || 0) >= fee; })
      .sort(function (a, b) { return Math.abs(a.strength - player.overall) - Math.abs(b.strength - player.overall); });
    if (!buyers.length) { toast("مفيش نادٍ عنده ميزانية كفاية للعرض ده.", "warning"); return; }
    const buyer = buyers[0];
    startModal("عرض لبيع اللاعب", '<p>وصل عرض من <strong>' + safeName(buyer.name) + '</strong> للتعاقد مع <strong>' + safeName(player.name) + '</strong>.</p><div class="inline-stat"><span>مركز اللاعب وتقييمه</span><strong>' + safeName(player.position) + ' · ' + number(player.overall) + '</strong></div><div class="inline-stat"><span>العقد المتبقي</span><strong>' + number(player.contractYears) + ' سنوات</strong></div><div class="inline-stat"><span>قيمة العرض</span><strong class="rating">' + money(fee) + '</strong></div><div class="inline-stat"><span>رصيد النادي بعد البيع</span><strong>' + money(state.balance + fee) + '</strong></div><div class="notice" style="margin-top:13px">قبول العرض ينقل اللاعب للنادي الآخر ويضيف قيمة الصفقة إلى ميزانيتك.</div>', '<button class="button button-secondary" data-action="dismiss-modal">رفض العرض</button><button class="button button-primary" data-action="confirm-sale" data-player-id="' + safeName(player.id) + '" data-buyer-id="' + safeName(buyer.id) + '" data-sale-fee="' + fee + '">قبول العرض</button>');
  }

  function confirmPlayerSale(playerId, buyerId, rawFee) {
    const player = playerById(playerId);
    const buyer = clubById(buyerId);
    const fee = Math.floor(Number(rawFee));
    if (!player || player.clubId !== state.userClubId || !buyer || buyer.id === state.userClubId || !Number.isFinite(fee)) {
      modalRoot.innerHTML = "";
      toast("تعذر إتمام البيع؛ تفاصيل العرض غير صحيحة.", "error");
      return;
    }
    if (!isTransferWindowOpen()) { modalRoot.innerHTML = ""; toast("فترة الانتقالات مغلقة الآن.", "error"); return; }
    if (userPlayers().length <= 15) { modalRoot.innerHTML = ""; toast("لازم تحتفظ بـ15 لاعب على الأقل.", "error"); return; }
    if ((buyer.budget || 0) < fee || fee < 1) { modalRoot.innerHTML = ""; toast("النادي المشتري لم يعد قادرًا على دفع العرض.", "error"); return; }
    const sellerName = player.name;
    if (state.tactics.captainId === player.id) state.tactics.captainId = null;
    player.clubId = buyer.id;
    player.morale = clamp(player.morale + 3, 0, 100);
    buyer.budget -= fee;
    state.balance += fee;
    state.career.transfersOut += 1;
    state.inbox.unshift({ id: "sale-" + player.id + "-" + state.seasonYear, title: "اكتملت صفقة بيع", text: "انتقل " + sellerName + " إلى " + buyer.name + " مقابل " + money(fee) + ". تمت إضافة المبلغ إلى ميزانية النادي.", kind: "success", read: false });
    modalRoot.innerHTML = "";
    saveGame(false);
    render();
    toast("تم بيع اللاعب بنجاح وإضافة قيمة الصفقة للميزانية.");
  }

  function financesView() {
    const annualWage = totalWages() * 52;
    const estimatedSeasonIncome = (state.sponsorWeekly + state.mediaWeekly) * seasonRoundCount() + 4500000;
    const wageRatio = estimatedSeasonIncome > 0 ? annualWage / estimatedSeasonIncome * 100 : 0;
    return '<div class="page-heading"><div><div class="eyebrow">FINANCIAL CONTROL</div><h1>مالية النادي</h1><p>راقب السيولة والتزامات الأجور وقيمة الفريق قبل اتخاذ قرارات الانتقالات.</p></div><button class="button button-secondary" data-action="save-now">حفظ المسيرة</button></div>' +
      '<section class="grid grid-3" style="margin-bottom:17px">' +
      '<div class="panel stat-card" style="--accent:var(--green)"><div class="stat-label">السيولة الحالية</div><div class="finance-value ' + (state.balance >= 0 ? 'positive' : 'negative') + '">' + money(state.balance) + '</div><div class="stat-foot">رصيد قابل للاستخدام</div></div>' +
      '<div class="panel stat-card" style="--accent:var(--blue)"><div class="stat-label">الأجور الأسبوعية</div><div class="finance-value">' + money(totalWages()) + '</div><div class="stat-foot">تكلفة قائمة الفريق الأول</div></div>' +
      '<div class="panel stat-card" style="--accent:var(--amber)"><div class="stat-label">الرواتب السنوية المقدرة</div><div class="finance-value">' + money(annualWage) + '</div><div class="stat-foot">على أساس 52 أسبوعًا</div></div></section>' +
      '<section class="grid grid-2"><div class="panel"><div class="panel-header"><div><h3 class="panel-title">التدفق المالي الأسبوعي</h3><div class="panel-subtitle">قيم تقديرية تتغير مع كل جولة</div></div></div><div class="panel-body"><div class="inline-stat"><span>رعاية وإعلانات</span><strong class="rating">+' + money(state.sponsorWeekly) + '</strong></div><div class="inline-stat"><span>حقوق بث وتوزيعات</span><strong class="rating">+' + money(state.mediaWeekly) + '</strong></div><div class="inline-stat"><span>أجور اللاعبين</span><strong style="color:var(--red)">−' + money(totalWages()) + '</strong></div><div class="inline-stat"><span>صافي أسبوع تقديري</span><strong style="color:' + (state.sponsorWeekly + state.mediaWeekly - totalWages() >= 0 ? 'var(--green)' : 'var(--red)') + '">' + money(state.sponsorWeekly + state.mediaWeekly - totalWages()) + '</strong></div><div class="notice" style="margin-top:15px">المباريات على ملعبك تضيف إيرادات تذاكر. الانتقالات تخصم من السيولة فور إتمامها، لذلك احتفظ باحتياطي لتغطية الأجور.</div></div></div>' +
      '<div class="panel"><div class="panel-header"><div><h3 class="panel-title">قيمة قائمة الفريق</h3><div class="panel-subtitle">ملخص الأصول والالتزامات</div></div></div><div class="panel-body"><div class="inline-stat"><span>قيمة اللاعبين السوقية</span><strong>' + money(userPlayers().reduce(function (s, p) { return s + p.value; }, 0)) + '</strong></div><div class="inline-stat"><span>عدد اللاعبين</span><strong>' + number(userPlayers().length) + '</strong></div><div class="inline-stat"><span>متوسط الأجر الأسبوعي للاعب</span><strong>' + money(totalWages() / Math.max(1, userPlayers().length)) + '</strong></div><div class="inline-stat"><span>الأجور من الدخل الأسبوعي المتوقع</span><strong>' + pct(wageRatio) + '</strong></div><div class="progress-bar" style="margin-top:13px"><span style="width:' + clamp(wageRatio, 0, 100) + '%;background:' + (wageRatio > 75 ? 'var(--red)' : 'var(--green)') + '"></span></div><div class="small-note" style="margin-top:7px">كلما زادت نسبة الأجور من الدخل، قلّت مرونة النادي في التعاقدات.</div></div></div></section>';
  }

  function render() {
    updateClubStrengths();
    const club = userClub();
    const date = dateForState();
    document.getElementById("sidebar-club").textContent = club.name;
    document.getElementById("sidebar-crest").textContent = club.short;
    document.getElementById("sidebar-season").textContent = "الموسم " + seasonLabel();
    document.getElementById("squad-count").textContent = userPlayers().length;
    document.getElementById("current-date").textContent = dateLabel(date);
    document.getElementById("mobile-footer-date").textContent = seasonLabel();
    const views = { overview: overviewView, squad: squadView, tactics: tacticsView, fixtures: fixturesView, transfers: transfersView, training: trainingView, finances: financesView };
    root.innerHTML = (views[currentView] || overviewView)();
    saveGame(false);
  }

  function poisson(lambda) {
    const limit = Math.exp(-clamp(lambda, 0.1, 3.8));
    let k = 0, product = 1;
    do { k += 1; product *= Math.random(); } while (product > limit && k < 10);
    return clamp(k - 1, 0, 6);
  }

  function teamPower(clubId, isHome) {
    const club = clubById(clubId);
    if (!club) return 50;
    const selectedXI = bestXI(clubId);
    const xi = selectedXI.filter(Boolean);
    if (!xi.length) return club.strength - 12 + (isHome ? 2.8 : 0);
    const avg = xi.reduce(function (sum, p) { return sum + p.overall; }, 0) / xi.length;
    const formation = clubId === state.userClubId ? (FORMATIONS[state.tactics.formation] || POSITION_ORDER) : POSITION_ORDER;
    const roleTotal = selectedXI.reduce(function (sum, p, index) {
      return p ? sum + roleAttributeScore(p, formation[index] || p.position) : sum;
    }, 0);
    const roleAverage = roleTotal / xi.length;
    const captainOnPitch = selectedXI.some(function (p) { return p && p.id === state.tactics.captainId; });
    const captainBonus = captainOnPitch && clubId === state.userClubId ? 0.75 : 0;
    const fitness = xi.reduce(function (sum, p) { return sum + p.fitness; }, 0) / xi.length;
    const morale = xi.reduce(function (sum, p) { return sum + p.morale; }, 0) / xi.length;
    const attackers = xi.filter(function (p) { return ["ST", "LW", "RW", "AM"].indexOf(p.position) >= 0; });
    const defenders = xi.filter(function (p) { return ["CB", "LB", "RB", "DM", "GK"].indexOf(p.position) >= 0; });
    const finishing = attackers.length ? attackers.reduce(function (sum, p) { return sum + p.finishing; }, 0) / attackers.length : avg;
    const defending = defenders.length ? defenders.reduce(function (sum, p) { return sum + p.defending; }, 0) / defenders.length : avg;
    const skillBalance = ((finishing - 65) * .055 + (defending - 65) * .045);
    const managerTactics = clubId === state.userClubId ? tacticalAttack() * .55 + tacticalDefense() * .25 : 0;
    const fitnessPenalty = fitness < 60 ? -5 : fitness < 75 ? -2 : (fitness - 80) / 20;
    const moraleBonus = (morale - 65) / 25;
    return avg * 0.35 + roleAverage * 0.65 + (isHome ? 2.8 : 0) + managerTactics + skillBalance + fitnessPenalty + moraleBonus + captainBonus;
  }

  function chooseWeightedPlayer(players, attribute) {
    if (!players.length) return null;
    const weights = players.map(function (p) { return Math.max(1, Number(p[attribute]) || p.overall || 1); });
    const total = weights.reduce(function (sum, w) { return sum + w; }, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < players.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return players[i];
    }
    return players[players.length - 1];
  }

  function simulateLineup(clubId, goals, homePower, awayPower) {
    const lineup = bestXI(clubId).filter(Boolean);
    const events = [];
    const attacking = lineup.filter(function (p) { return ["ST", "LW", "RW", "AM", "CM"].indexOf(p.position) >= 0; });
    const outfield = lineup.filter(function (p) { return p.position !== "GK"; });
    const goalCandidates = attacking.length ? attacking : outfield;
    const userSide = clubId === state.userClubId;
    const style = TACTICAL_STYLES[state.tactics.style] || TACTICAL_STYLES.balanced;
    let yellowCards = 0;
    lineup.forEach(function (p) {
      p.appearances += 1;
      const matchDrain = userSide && style.fitness < -1 ? randomInt(9, 15) : randomInt(5, 10);
      p.fitness = clamp(p.fitness - matchDrain, 35, 100);
      p.sharpness = clamp(p.sharpness + randomInt(1, 4), 0, 100);
      if (Math.random() < .055) {
        p.yellowCards += 1;
        yellowCards += 1;
        events.push({ minute: randomInt(8, 87), kind: "card", teamId: clubId, text: "إنذار للاعب " + p.name });
      }
      if (Math.random() < .018) {
        p.injuredWeeks = Math.max(p.injuredWeeks, randomInt(1, 3));
        events.push({ minute: randomInt(10, 89), kind: "injury", teamId: clubId, text: "إصابة " + p.name });
      }
    });
    for (let i = 0; i < goals; i += 1) {
      const scorer = chooseWeightedPlayer(goalCandidates, "finishing") || chooseWeightedPlayer(outfield, "overall");
      if (!scorer) break;
      scorer.goals += 1;
      let assist = null;
      const assistCandidates = outfield.filter(function (p) { return p.id !== scorer.id; });
      if (assistCandidates.length && Math.random() < .68) {
        assist = chooseWeightedPlayer(assistCandidates, "passing");
        if (assist) assist.assists += 1;
      }
      events.push({
        minute: randomInt(2, 90), kind: "goal", teamId: clubId,
        text: "هدف " + scorer.name + (assist ? " بصناعة " + assist.name : "")
      });
    }
    const shots = Math.max(goals, randomInt(7, 14) + Math.round((homePower - awayPower) / (clubId === state.userClubId ? 7 : 10)));
    const onTarget = clamp(Math.max(goals, Math.round(shots * .31 + goals * .42 + randomInt(-2, 2))), goals, shots);
    const averagePassing = lineup.length ? lineup.reduce(function (sum, p) { return sum + p.passing; }, 0) / lineup.length : 60;
    const yellowBase = yellowCards;
    const possession = clamp(Math.round(50 + (homePower - awayPower) * (clubId === state.userClubId ? .55 : .35) + randomInt(-9, 9)), 25, 75);
    return {
      events: events,
      stats: {
        possession: possession, shots: shots, onTarget: onTarget,
        corners: randomInt(2, 9), yellowCards: yellowBase,
        passAccuracy: clamp(Math.round(averagePassing * .55 + randomInt(20, 34)), 45, 96)
      }
    };
  }

  function simMatch(fixture) {
    const home = clubById(fixture.homeId), away = clubById(fixture.awayId);
    const homePower = teamPower(home.id, true);
    const awayPower = teamPower(away.id, false);
    const lambdaHome = clamp(1.25 + (homePower - awayPower) / 18 + .15, .25, 3.7);
    const lambdaAway = clamp(1.05 + (awayPower - homePower) / 18, .2, 3.5);
    const gh = poisson(lambdaHome), ga = poisson(lambdaAway);
    fixture.played = true;
    fixture.homeGoals = gh;
    fixture.awayGoals = ga;
    const record = function (club, scored, conceded) {
      club.played += 1;
      club.goalsFor += scored;
      club.goalsAgainst += conceded;
      if (scored > conceded) { club.wins += 1; club.points += 3; club.form.push("W"); }
      else if (scored === conceded) { club.draws += 1; club.points += 1; club.form.push("D"); }
      else { club.losses += 1; club.form.push("L"); }
      club.form = club.form.slice(-5);
    };
    record(home, gh, ga);
    record(away, ga, gh);
    const homeLineup = simulateLineup(home.id, gh, homePower, awayPower);
    const awayLineup = simulateLineup(away.id, ga, awayPower, homePower);
    const events = homeLineup.events.concat(awayLineup.events).sort(function (a, b) { return a.minute - b.minute; });
    const reportHomeStats = homeLineup.stats;
    const reportAwayStats = awayLineup.stats;
    reportHomeStats.xG = Math.round(lambdaHome * 100) / 100;
    reportAwayStats.xG = Math.round(lambdaAway * 100) / 100;
    reportAwayStats.possession = 100 - reportHomeStats.possession;
    fixture.report = {
      home: reportHomeStats,
      away: reportAwayStats,
      events: events,
      homePower: Math.round(homePower * 10) / 10,
      awayPower: Math.round(awayPower * 10) / 10
    };
    if (home.id === state.userClubId || away.id === state.userClubId) {
      state.career.matchesManaged += 1;
      if (home.id === state.userClubId) state.balance += 420000 + gh * 65000;
      else state.balance += 120000;
    }
    return fixture;
  }

  function ageAndRecover(injuriesAtRoundStart) {
    const injuryMap = new Map((injuriesAtRoundStart || []).map(function (entry) { return [entry.id, entry.injuredWeeks]; }));
    state.players.forEach(function (p) {
      const previousWeeks = injuryMap.get(p.id) || 0;
      if (previousWeeks > 0) p.injuredWeeks = Math.max(0, previousWeeks - 1);
      p.fitness = clamp(p.fitness + randomInt(3, 8), 35, 100);
      p.morale = clamp(p.morale + randomInt(-2, 2), 35, 100);
    });
  }

  function playNextRound() {
    if (state.currentRound >= seasonRoundCount()) {
      startNextSeason();
      return;
    }
    const roundNumber = state.currentRound + 1;
    const fixtures = state.fixtures.filter(function (f) { return f.round === roundNumber; });
    if (!fixtures.length || fixtures.every(function (f) { return f.played; })) {
      toast("الجولة دي مكتملة بالفعل.", "warning");
      return;
    }
    const injuriesAtRoundStart = state.players.map(function (p) { return { id: p.id, injuredWeeks: p.injuredWeeks }; });
    fixtures.forEach(simMatch);
    ageAndRecover(injuriesAtRoundStart);
    state.balance += state.sponsorWeekly + state.mediaWeekly - totalWages();
    state.currentRound = roundNumber;
    if (roundNumber === seasonRoundCount()) {
      const expiringPlayers = userPlayers().filter(function (p) { return p.contractYears <= 1; });
      if (expiringPlayers.length) {
        state.inbox.unshift({
          id: "contracts-expiring-" + state.seasonYear,
          title: "عقود تحتاج قرارًا قبل نهاية الموسم",
          text: expiringPlayers.map(function (p) { return p.name; }).join("، ") + ". افتح صفحة الفريق وجدّد العقود المهمة قبل بدء الموسم الجديد.",
          kind: "warning", read: false
        });
      }
    }
    const own = fixtures.find(function (f) { return f.homeId === state.userClubId || f.awayId === state.userClubId; });
    if (own) {
      const gf = own.homeId === state.userClubId ? own.homeGoals : own.awayGoals;
      const ga = own.homeId === state.userClubId ? own.awayGoals : own.homeGoals;
      const result = gf > ga ? "فوز" : gf === ga ? "تعادل" : "خسارة";
      state.history.unshift({ season: seasonLabel(), round: roundNumber, score: gf + " - " + ga, result: result, opponent: clubById(own.homeId === state.userClubId ? own.awayId : own.homeId).name });
      if (result === "فوز") state.inbox.unshift({ id: "r" + roundNumber + "-win", title: "فوز مهم للفريق", text: "انتهت الجولة بنتيجة " + gf + " - " + ga + ". حافظ على لياقة الفريق واستعد للمواجهة التالية.", kind: "success", read: false });
      else if (result === "خسارة") state.inbox.unshift({ id: "r" + roundNumber + "-loss", title: "تقرير ما بعد المباراة", text: "خسر الفريق " + gf + " - " + ga + ". راجع الخطة أو ارفع الجاهزية قبل الجولة المقبلة.", kind: "warning", read: false });
    }
    state.lastTrainingRound = -1;
    if (state.balance < 0) toast("تحذير: رصيد النادي سالب. تجنب صفقات كبيرة وراجع الأجور.", "error");
    else toast("اكتملت الجولة " + number(roundNumber) + " وتحدثت نتائج الدوري والمالية.");
    saveGame(false);
    render();
  }

  function startNextSeason() {
    const position = leaguePosition();
    state.career.seasonsPlayed += 1;
    state.career.bestFinish = state.career.bestFinish === null ? position : Math.min(state.career.bestFinish, position);
    state.seasonYear += 1;
    state.currentRound = 0;
    state.fixtures = makeFixtures(state.clubs, state.seasonYear);
    state.clubs.forEach(function (club) {
      club.played = 0; club.wins = 0; club.draws = 0; club.losses = 0;
      club.goalsFor = 0; club.goalsAgainst = 0; club.points = 0; club.form = [];
    });
    const contractDepartures = [];
    state.players.forEach(function (p) {
      p.age += 1;
      p.fitness = clamp(p.fitness + 12, 60, 100);
      p.morale = clamp(p.morale + randomInt(-4, 6), 35, 100);
      p.contractYears = Math.max(0, (Number(p.contractYears) || 0) - 1);
      if (p.contractYears <= 0 && p.clubId && p.clubId !== state.userClubId) {
        p.contractYears = randomInt(2, 4);
        p.wage = Math.round(p.wage * (p.morale >= 70 ? 1.05 : 1.02) / 100) * 100;
      } else if (p.contractYears <= 0 && p.clubId === state.userClubId) {
        if (state.tactics.captainId === p.id) state.tactics.captainId = null;
        p.clubId = null;
        contractDepartures.push(p.name);
      }
      if (p.age >= 34) p.overall = clamp(p.overall - 1, 35, 95);
      else if (p.age < 24 && p.overall < p.potential && Math.random() < .65) p.overall += 1;
      p.value = Math.max(200000, Math.round(p.value * (p.age >= 30 ? .88 : p.age < 23 ? 1.12 : 1.03)));
    });
    if (contractDepartures.length) {
      state.inbox.unshift({
        id: "contract-expired-" + state.seasonYear,
        title: "لاعبون غادروا بانتهاء العقود",
        text: contractDepartures.join("، ") + ". تقدر تبحث عن بدائل أو لاعبين أحرار في سوق الانتقالات.",
        kind: "warning", read: false
      });
    }
    state.tactics.trainingFocus = "balanced";
    state.lastTrainingRound = -1;
    state.inbox.unshift({ id: "season-" + state.seasonYear, title: "انطلاق موسم جديد", text: "بدأ موسم " + seasonLabel() + ". انتهيت الموسم الماضي في المركز " + number(position) + ". فترة الانتقالات مفتوحة.", kind: "info", read: false });
    toast("بدأ الموسم " + seasonLabel() + ". اتخذ قراراتك قبل الجولة الأولى.");
    saveGame(false);
    goTo("overview");
  }

  function buyPlayer(id) {
    const player = playerById(id);
    if (!player || player.clubId === state.userClubId) { toast("اللاعب لم يعد متاحًا.", "error"); return; }
    if (!isTransferWindowOpen()) { toast("فترة الانتقالات مغلقة الآن.", "error"); return; }
    if (userPlayers().length >= 25) { toast("قائمة الفريق وصلت إلى 25 لاعبًا. بع لاعبًا أولًا.", "warning"); return; }
    const fee = transferFee(player);
    if (state.balance < fee) { toast("ميزانية النادي لا تكفي الصفقة.", "error"); return; }
    const fromClub = clubById(player.clubId);
    const newWage = player.wage;
    startModal("تأكيد التعاقد", '<p>هل تريد التعاقد مع <strong>' + safeName(player.name) + '</strong> من ' + safeName(fromClub ? fromClub.name : "لاعب حر") + '؟</p><div class="inline-stat"><span>قيمة الصفقة</span><strong>' + money(fee) + '</strong></div><div class="inline-stat"><span>راتب أسبوعي إضافي</span><strong>' + money(newWage) + '</strong></div><div class="inline-stat"><span>الرصيد بعد الصفقة</span><strong>' + money(state.balance - fee) + '</strong></div>', '<button class="button button-secondary" data-action="dismiss-modal">إلغاء</button><button class="button button-primary" data-action="confirm-buy" data-player-id="' + safeName(player.id) + '">تأكيد التعاقد</button>');
  }

  function confirmBuy(id) {
    const player = playerById(id);
    if (!player || player.clubId === state.userClubId) { modalRoot.innerHTML = ""; toast("الصفقة لم تعد متاحة.", "error"); return; }
    const fee = transferFee(player);
    if (!isTransferWindowOpen() || userPlayers().length >= 25 || state.balance < fee) {
      modalRoot.innerHTML = ""; toast("شروط الصفقة لم تعد متاحة.", "error"); return;
    }
    const from = clubById(player.clubId);
    if (from) from.budget = (from.budget || 0) + fee;
    state.balance -= fee;
    player.clubId = state.userClubId;
    player.contractYears = randomInt(2, 4);
    player.value = Math.round(player.value * 1.05);
    player.morale = clamp(player.morale + 8, 0, 100);
    state.career.transfersIn += 1;
    state.inbox.unshift({ id: "transfer-" + player.id + "-" + Date.now(), title: "صفقة جديدة", text: "انضم " + player.name + " إلى " + userClub().name + " مقابل " + money(fee) + ".", kind: "success", read: false });
    modalRoot.innerHTML = "";
    toast("تم التعاقد مع " + player.name + " بنجاح.");
    saveGame(false);
    render();
  }

  function runTraining() {
    if (state.lastTrainingRound === state.currentRound) { toast("نفذت حصة التدريب لهذا الأسبوع بالفعل.", "warning"); return; }
    const focus = state.tactics.trainingFocus;
    const injuryChance = focus === "fitness" ? .002 : focus === "press" ? .05 : .025;
    userPlayers().forEach(function (p) {
      if (p.injuredWeeks > 0) { p.fitness = clamp(p.fitness + randomInt(2, 5), 35, 100); return; }
      if (focus === "fitness") {
        p.fitness = clamp(p.fitness + randomInt(8, 14), 35, 100);
        p.morale = clamp(p.morale + 1, 35, 100);
      } else {
        p.fitness = clamp(p.fitness - randomInt(2, 6), 35, 100);
        p.trainingXp += focus === "youth" && p.age < 24 ? 2 : 1;
        if (focus === "attack") p.finishing = clamp(p.finishing + (p.position === "ST" || p.position === "LW" || p.position === "RW" || p.position === "AM" ? 1 : 0), 30, 99);
        if (focus === "defense") p.defending = clamp(p.defending + (["CB", "LB", "RB", "DM"].indexOf(p.position) >= 0 ? 1 : 0), 30, 99);
        if (focus === "technical") p.passing = clamp(p.passing + 1, 30, 99);
        if (focus === "youth" && p.age < 24 && p.overall < p.potential && p.trainingXp % 3 === 0) p.overall = clamp(p.overall + 1, 35, p.potential);
        if (p.trainingXp > 0 && p.trainingXp % 5 === 0 && p.overall < p.potential) p.overall = clamp(p.overall + 1, 35, p.potential);
      }
      if (Math.random() < injuryChance) p.injuredWeeks = randomInt(1, 2);
    });
    state.lastTrainingRound = state.currentRound;
    saveGame(false);
    render();
    toast(focus === "fitness" ? "اكتملت حصة الاستشفاء واللياقة." : "اكتملت الحصة. تم تحديث اللياقة وخبرة التدريب.");
  }

  function resetGame() {
    startModal("بدء مسيرة جديدة", '<p>هتقدر تختار اسم المدير الفني وجنسيته والنادي الجديد قبل بداية المسيرة.</p><div class="notice">المسيرة الحالية مش هتتستبدل إلا لما تكمل إنشاء المسيرة الجديدة وتحفظها.</div>', '<button class="button button-secondary" data-action="dismiss-modal">إلغاء</button><button class="button button-primary" data-action="start-new-career">اختيار النادي وبدء المسيرة</button>');
  }

  function openInbox() {
    const messages = state.inbox.slice(0, 30);
    const messageMarkup = messages.map(function (message) {
      const icon = message.kind === "success" ? "✓" : message.kind === "warning" ? "!" : "i";
      return '<article class="inbox-item ' + (message.read ? '' : 'unread') + '"><span class="inbox-mark ' + safeName(message.kind || 'info') + '">' + icon + '</span><div class="inbox-message"><strong>' + safeName(message.title) + '</strong><p>' + safeName(message.text) + '</p><small>' + safeName(message.kind === "warning" ? "تنبيه" : message.kind === "success" ? "نجاح" : "إدارة النادي") + '</small></div>' + (message.read ? '<span class="small-note">مقروءة</span>' : '<button class="button button-secondary button-small" data-action="mark-inbox-read" data-message-id="' + safeName(message.id) + '">تعليم كمقروء</button>') + '</article>';
    }).join("");
    const body = messages.length ? '<div class="inbox-modal-list">' + messageMarkup + '</div>' : '<div class="empty-state"><strong>صندوق الوارد فارغ</strong>كل الأخبار والتحديثات ستظهر هنا خلال الموسم.</div>';
    const actions = '<button class="button button-secondary" data-action="mark-inbox-read" data-message-id="all">تعليم الكل كمقروء</button><button class="button button-primary" data-action="dismiss-modal">إغلاق</button>';
    startModal("صندوق الوارد", body, actions);
  }

  function markInboxRead(messageId) {
    if (messageId === "all") state.inbox.forEach(function (message) { message.read = true; });
    else {
      const message = state.inbox.find(function (item) { return item.id === messageId; });
      if (message) message.read = true;
    }
    saveGame(false);
    if (modalRoot.innerHTML) openInbox();
    else render();
  }

  function handleAction(button) {
    const action = button.dataset.action;
    if (!action) return;
    if (action === "resume-classic-career") {
      if (!pendingSavedState) { toast("مفيش مسيرة محفوظة للاستكمال.", "warning"); return; }
      state = pendingSavedState;
      pendingSavedState = null;
      removeStartScreen();
      updateClubStrengths();
      render();
      return;
    }
    if (action === "resume-advanced-career") {
      if (window.FM_ADVANCED && typeof window.FM_ADVANCED.open === "function") window.FM_ADVANCED.open();
      else toast("وضع المسيرة المتقدمة لسه بيحمّل. حدّث الصفحة وجرب تاني.", "warning");
      return;
    }
    if (action === "start-new-career") {
      if (window.FM_ADVANCED && typeof window.FM_ADVANCED.openNewCareer === "function") {
        const opened = window.FM_ADVANCED.openNewCareer();
        if (opened !== false) modalRoot.innerHTML = "";
      } else {
        // Graceful fallback if the advanced module is blocked or fails to load.
        modalRoot.innerHTML = "";
        state = makeInitialState();
        updateClubStrengths();
        removeStartScreen();
        saveGame(false);
        render();
        toast("بدأت مسيرة محلية مبسطة؛ حمّل الصفحة مجددًا لخيارات الأندية المتقدمة.", "warning");
      }
      return;
    }
    if (action === "play-next-round") playNextRound();
    else if (action === "save-now") saveGame(true);
    else if (action === "open-inbox") openInbox();
    else if (action === "mark-inbox-read") markInboxRead(button.dataset.messageId);
    else if (action === "reset-game") resetGame();
    else if (action === "dismiss-modal") modalRoot.innerHTML = "";
    else if (action === "search-squad") { const el = document.getElementById("squad-search"); playerSearch = el ? el.value.trim() : ""; render(); }
    else if (action === "search-market") { const el = document.getElementById("market-search"); marketSearch = el ? el.value.trim() : ""; render(); }
    else if (action === "buy-player") buyPlayer(button.dataset.playerId);
    else if (action === "confirm-buy") confirmBuy(button.dataset.playerId);
    else if (action === "renew-contract") openRenewal(button.dataset.playerId);
    else if (action === "confirm-renew") confirmRenew(button.dataset.playerId);
    else if (action === "sell-player") openPlayerSale(button.dataset.playerId);
    else if (action === "confirm-sale") confirmPlayerSale(button.dataset.playerId, button.dataset.buyerId, button.dataset.saleFee);
    else if (action === "show-match-report") showMatchReport(button.dataset.fixtureId);
    else if (action === "run-training") runTraining();
    else if (action === "confirm-reset") {
      state = makeInitialState(); playerSearch = ""; marketSearch = ""; modalRoot.innerHTML = "";
      saveGame(false); goTo("overview"); toast("بدأت مسيرة جديدة.");
    }
  }

  document.addEventListener("click", function (event) {
    const nav = event.target.closest("[data-view]");
    if (nav) { event.preventDefault(); goTo(nav.dataset.view); return; }
    const action = event.target.closest("[data-action]");
    if (action) handleAction(action);
  });

  document.addEventListener("change", function (event) {
    const setting = event.target.dataset.setting;
    if (!setting || !state) return;
    const allowed = {
      formation: Object.keys(FORMATIONS),
      style: Object.keys(TACTICAL_STYLES),
      mentality: Object.keys(MENTALITIES),
      trainingFocus: ["balanced", "attack", "defense", "technical", "fitness", "youth"],
      captainId: userPlayers().map(function (player) { return player.id; }).concat([""])
    };
    if (allowed[setting] && allowed[setting].indexOf(event.target.value) >= 0) {
      state.tactics[setting] = setting === "captainId" ? (event.target.value || null) : event.target.value;
      saveGame(false);
      render();
      toast("تم تحديث الإعدادات.");
    }
  });

  function removeStartScreen() {
    const screen = document.getElementById("tm-start-screen");
    if (screen && typeof screen.remove === "function") screen.remove();
    else if (screen && screen.parentNode && typeof screen.parentNode.removeChild === "function") screen.parentNode.removeChild(screen);
  }

  function renderStartScreen(saved) {
    pendingSavedState = saved || null;
    let advanced = null;
    try { advanced = JSON.parse(localStorage.getItem("touchline-advanced-save-v1") || "null"); } catch (error) { advanced = null; }
    const classicClub = saved && Array.isArray(saved.clubs) ? saved.clubs.find(c => c.id === saved.userClubId) : null;
    const advancedClub = advanced && Array.isArray(advanced.clubs) ? advanced.clubs.find(c => c.id === advanced.userClubId) : null;
    const advancedName = advanced && advanced.manager ? advanced.manager.name : "";
    let screen = document.getElementById("tm-start-screen");
    if (!screen) {
      screen = document.createElement("section");
      screen.id = "tm-start-screen";
      screen.className = "tm-start-screen";
      screen.setAttribute("aria-label", "بداية اللعبة");
      document.body.appendChild(screen);
    }
    screen.innerHTML =
      '<div class="tm-start-pitch" aria-hidden="true"><span></span></div>' +
      '<div class="tm-start-content">' +
        '<div class="tm-start-brand"><span class="tm-start-mark">TM</span><div><b>TOUCHLINE MANAGER</b><small>محاكي إدارة كرة القدم</small></div></div>' +
        '<div class="tm-start-hero"><span class="tm-start-eyebrow">مسيرتك. قراراتك. تاريخك.</span><h1>كل أسطورة<br><em>بتبدأ بقرار.</em></h1><p>اختار ناديك، اكتب اسمك، وابدأ رحلتك على خط التماس.</p></div>' +
        '<div class="tm-start-panel"><div class="tm-start-panel-heading"><span>ابدأ من هنا</span><small>ملف مدير محلي على جهازك</small></div>' +
        (saved ? '<button type="button" class="tm-start-resume" data-action="resume-classic-career"><span class="tm-start-button-icon">↻</span><span><b>استكمال المسيرة</b><small>'+safeName(classicClub ? classicClub.name : "مسيرتك المحفوظة")+' · الموسم '+safeName(saved.seasonYear || "")+'</small></span><strong>←</strong></button>' : '') +
        (advanced ? '<button type="button" class="tm-start-resume" data-action="resume-advanced-career"><span class="tm-start-button-icon">♜</span><span><b>استكمال المسيرة المتقدمة</b><small>'+safeName(advancedName || "ملف المدير")+(advancedClub ? " · "+safeName(advancedClub.name) : "")+'</small></span><strong>←</strong></button>' : '') +
        '<button type="button" class="tm-start-new" data-action="start-new-career"><span><small>NEW CAREER</small><b>إنشاء مسيرة جديدة</b><em>اختيار النادي وملف المدير</em></span><strong>←</strong></button>' +
        '<div class="tm-start-footnote"><span class="tm-start-live-dot"></span> يتم حفظ مسيرتك على هذا الجهاز تلقائيًا</div></div>' +
        '<div class="tm-start-version">TOUCHLINE MANAGER <span>•</span> LOCAL CAREER</div>' +
      '</div>';
  }

  function initialize() {
    let saved = null;
    try { saved = repairLoadedState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")); } catch (error) { saved = null; }
    state = null;
    document.getElementById("save-now").addEventListener("click", function () { saveGame(true); });
    document.getElementById("reset-game").addEventListener("click", resetGame);
    renderStartScreen(saved);
  }

  initialize();
})();