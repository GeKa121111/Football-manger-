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

game.click("play-next-round");
state = game.savedState();
assert.equal(state.currentRound, 1, "round simulation should advance the calendar");
assert.equal(state.fixtures.filter((fixture) => fixture.played).length, 6, "a round should simulate six matches");
assert.ok(state.clubs.every((club) => club.played === 1), "every club should play exactly once per round");
assert.equal(state.history.length, 1, "the user's match should be recorded in history");

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
