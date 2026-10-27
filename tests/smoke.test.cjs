const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

const source = fs.readFileSync(path.join(__dirname, "..", "app.js"), "utf8");

function createElement() {
  return {
    textContent: "",
    innerHTML: "",
    className: "",
    dataset: {},
    style: {},
    children: [],
    parentNode: null,
    listeners: {},
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    addEventListener(type, callback) {
      this.listeners[type] = callback;
    },
    querySelector() { return null; },
    focus() {},
    removeChild(child) {
      this.children = this.children.filter((item) => item !== child);
      child.parentNode = null;
    },
    closest() { return null; }
  };
}

function boot(storage) {
  const documentListeners = {};
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, createElement());
      return elements.get(id);
    },
    querySelectorAll() { return []; },
    addEventListener(type, callback) {
      documentListeners[type] = callback;
    },
    createElement() { return createElement(); }
  };
  const localStorage = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null; },
    setItem(key, value) { storage[key] = String(value); },
    removeItem(key) { delete storage[key]; }
  };
  const context = {
    document,
    localStorage,
    window: { setTimeout() { return 0; } },
    console,
    Math,
    Date,
    Intl,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Promise
  };
  vm.runInNewContext(source, context, { filename: "app.js" });
  return {
    document,
    elements,
    storage,
    click(action, extra) {
      const targetAction = Object.assign({ dataset: Object.assign({ action }, extra || {}) }, {
        closest(selector) { return selector === "[data-action]" ? this : null; }
      });
      documentListeners.click({ target: targetAction, preventDefault() {} });
    },
    clickView(view) {
      const targetView = { dataset: { view }, closest(selector) { return selector === "[data-view]" ? this : null; } };
      documentListeners.click({ target: targetView, preventDefault() {} });
    },
    change(setting, value) {
      documentListeners.change({ target: { dataset: { setting }, value } });
    },
    savedState() {
      return JSON.parse(storage["touchline-manager-save-v1"]);
    }
  };
}

const storage = {};
let game = boot(storage);
let state = game.savedState();

assert.equal(state.clubs.length, 12, "initial world should contain 12 clubs");
assert.equal(state.players.length, 240, "initial world should contain 20 players per club");
assert.equal(new Set(state.players.map((player) => player.id)).size, 240, "player IDs should be unique");
assert.equal(state.fixtures.length, 66, "single round-robin schedule should contain 66 fixtures");
assert.equal(state.currentRound, 0, "new career should begin before round one");
assert.ok(state.players.every((player) => Number.isInteger(player.contractYears) && player.contractYears >= 1 && player.contractYears <= 4), "generated players should have valid contract terms");

const expectedViews = [
  ["overview", "جدول الدوري"],
  ["squad", "الفريق الأول"],
  ["tactics", "التكتيك والخطة"],
  ["fixtures", "المباريات والدوري"],
  ["transfers", "سوق الانتقالات"],
  ["training", "التدريب والتطوير"],
  ["finances", "مالية النادي"]
];
for (const [view, expectedText] of expectedViews) {
  game.clickView(view);
  assert.ok(game.elements.get("view-root").innerHTML.includes(expectedText), "view should render: " + view);
}

game = boot(storage);
state = game.savedState();
const renewalCandidate = state.players.find((player) => player.clubId === state.userClubId);
const originalContract = renewalCandidate.contractYears;
game.click("renew-contract", { playerId: renewalCandidate.id });
game.document.getElementById("renewal-years").value = "3";
game.document.getElementById("renewal-wage").value = String(renewalCandidate.wage * 10);
game.click("confirm-renew", { playerId: renewalCandidate.id });
state = game.savedState();
const renewedPlayer = state.players.find((player) => player.id === renewalCandidate.id);
assert.equal(renewedPlayer.contractYears, 3, "an accepted renewal should update the contract term");
assert.equal(renewedPlayer.wage, Math.round((renewalCandidate.wage * 10) / 100) * 100, "an accepted renewal should update the agreed wage");
assert.equal(state.inbox[0].title, "تجديد عقد ناجح", "contract renewal should create an inbox record");

const targetPlayer = state.players.find((player) => player.clubId !== state.userClubId && player.injuredWeeks === 0);
const originalBalance = state.balance;
game.click("buy-player", { playerId: targetPlayer.id });
game.click("confirm-buy", { playerId: targetPlayer.id });
state = game.savedState();
assert.equal(state.players.find((player) => player.id === targetPlayer.id).clubId, state.userClubId, "confirmed transfer should move the player to the user's club");
assert.equal(state.career.transfersIn, 1, "confirmed transfer should update career history");
assert.ok(state.balance < originalBalance, "confirmed transfer should deduct the fee");
const freeAgent = state.players.find((player) => player.clubId !== state.userClubId && player.injuredWeeks === 0);
freeAgent.clubId = null;
freeAgent.contractYears = 0;
storage["touchline-manager-save-v1"] = JSON.stringify(state);
game = boot(storage);
const freeAgentId = freeAgent.id;
game.click("buy-player", { playerId: freeAgentId });
game.click("confirm-buy", { playerId: freeAgentId });
state = game.savedState();
const signedFreeAgent = state.players.find((player) => player.id === freeAgentId);
assert.equal(signedFreeAgent.clubId, state.userClubId, "free agent should join the club when signed");
assert.ok(signedFreeAgent.contractYears >= 2, "free-agent signing should include a new contract");

game = boot(storage);
const clubBalanceBeforeSale = game.savedState().balance;
const squadCountBeforeSale = game.savedState().players.filter((player) => player.clubId === game.savedState().userClubId).length;
game.click("sell-player", { playerId: renewalCandidate.id });
const saleMarkup = game.elements.get("modal-root").innerHTML;
const saleOffer = saleMarkup.match(/data-buyer-id="([^"]+)" data-sale-fee="(\\d+)"/);
assert.ok(saleOffer, "sale dialog should create a buyer offer");
game.click("confirm-sale", { playerId: renewalCandidate.id, buyerId: saleOffer[1], saleFee: saleOffer[2] });
state = game.savedState();
assert.equal(state.players.find((player) => player.id === renewalCandidate.id).clubId, saleOffer[1], "selling a player should move him to the buyer club");
assert.equal(state.career.transfersOut, 1, "accepted sale should be recorded in the career");
assert.ok(state.balance > clubBalanceBeforeSale, "accepted sale should add money to club balance");
assert.equal(state.players.filter((player) => player.clubId === state.userClubId).length, squadCountBeforeSale - 1, "sale should reduce the first-team roster");

game.click("open-inbox");
game.click("mark-inbox-read", { messageId: "all" });
state = game.savedState();
assert.ok(state.inbox.every((message) => message.read), "mark all as read should update inbox messages");

game.click("play-next-round");
state = game.savedState();
assert.equal(state.currentRound, 1, "round simulation should advance the calendar");
const playedFixtures = state.fixtures.filter((fixture) => fixture.played);
assert.equal(playedFixtures.length, 6, "a round should simulate six matches");
assert.ok(state.clubs.every((club) => club.played === 1), "every club should play exactly once per round");
assert.equal(state.history.length, 1, "the user's match should be recorded in history");
assert.ok(playedFixtures.every((fixture) => fixture.report && fixture.report.home && fixture.report.away), "each simulated fixture should contain a stats report");
assert.ok(playedFixtures.every((fixture) => fixture.report.home.possession + fixture.report.away.possession === 100), "home and away possession should sum to 100%");
assert.ok(playedFixtures.every((fixture) => fixture.report.home.shots >= fixture.homeGoals && fixture.report.away.shots >= fixture.awayGoals), "shot counts should be at least each side's goal count");
assert.ok(state.players.filter((player) => playedFixtures.some((fixture) => fixture.homeId === player.clubId || fixture.awayId === player.clubId)).some((player) => player.appearances > 0), "player appearances should be recorded across the simulated world");
const userFixture = playedFixtures.find((fixture) => fixture.homeId === state.userClubId || fixture.awayId === state.userClubId);
game.clickView("fixtures");
game.click("show-match-report", { fixtureId: userFixture.id });
assert.ok(game.elements.get("modal-root").innerHTML.includes("أحداث المباراة"), "played fixture should open its detailed match report");

game.change("trainingFocus", "fitness");
state = game.savedState();
assert.equal(state.tactics.trainingFocus, "fitness", "tactical/training settings should persist");
game.click("run-training");
state = game.savedState();
assert.equal(state.lastTrainingRound, 1, "training should be limited to once per round");
const trainingXp = state.players.filter((player) => player.clubId === state.userClubId).reduce((sum, player) => sum + player.trainingXp, 0);
game.click("run-training");
const afterSecondTraining = game.savedState();
assert.equal(
  afterSecondTraining.players.filter((player) => player.clubId === state.userClubId).reduce((sum, player) => sum + player.trainingXp, 0),
  trainingXp,
  "a second training session in the same round should not apply"
);

game = boot(storage);
assert.equal(game.savedState().currentRound, 1, "career should load from local storage");
assert.equal(game.savedState().lastTrainingRound, 1, "weekly training state should survive a reload");

console.log("Touchline Manager smoke tests passed.");
