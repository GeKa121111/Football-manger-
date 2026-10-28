"use strict";

/*
 * Lightweight simulation worker for computationally expensive match batches.
 * The main thread owns the live career; each task gets a structured-clone
 * snapshot and returns the updated state. Keeping the worker stateless between
 * tasks makes save/load, imports and recovery from worker failures predictable.
 */
(function (scope) {
  let engine = null;
  let startupError = null;

  try {
    scope.importScripts("advanced-data.js", "advanced-player-data.js", "spatial-match-engine.js", "advanced-engine.js");
    engine = scope.FM_ENGINE;
    if (!engine) throw new Error("FM_ENGINE did not initialize in the simulation worker.");
    scope.postMessage({
      type: "ready",
      capabilities: ["simulate-round", "simulate-domestic-cup-round", "simulate-continental-round", "finish-season"]
    });
  } catch (error) {
    startupError = error;
    scope.postMessage({
      type: "startup-error",
      error: String(error && error.message || error || "Simulation worker initialization failed.")
    });
  }

  scope.addEventListener("message", function (event) {
    const message = event && event.data || {};
    if (!message.id) return;

    if (startupError || !engine) {
      scope.postMessage({
        type: "task-result",
        id: message.id,
        ok: false,
        error: String(startupError && startupError.message || "Simulation worker is not ready.")
      });
      return;
    }

    const state = message.state;
    if (!state || typeof state !== "object" || !Array.isArray(state.players) ||
        !Array.isArray(state.clubs) || !Array.isArray(state.fixtures)) {
      scope.postMessage({ type: "task-result", id: message.id, ok: false, error: "Invalid career snapshot." });
      return;
    }

    try {
      let result;
      switch (message.task) {
        case "simulate-round":
          result = engine.simulateRound(state, Number(message.round));
          break;
        case "simulate-domestic-cup-round":
          result = engine.simulateDomesticCupRound(state);
          break;
        case "simulate-continental-round":
          result = engine.simulateContinentalRound(state);
          break;
        case "finish-season":
          result = engine.finishSeason(state);
          break;
        default:
          throw new Error("Unsupported simulation task: " + String(message.task));
      }

      // Re-establish canonical references expected by the career UI after transfer.
      if (state.world) {
        state.world.players = state.players;
        state.world.clubs = state.clubs;
        const managedClub = state.clubs.find(function (club) { return club.id === state.userClubId; });
        if (managedClub && state.world.calendar && state.world.calendar[managedClub.league]) {
          state.world.calendar[managedClub.league] = state.fixtures;
        }
      }

      scope.postMessage({ type: "task-result", id: message.id, ok: true, state: state, result: result });
    } catch (error) {
      scope.postMessage({
        type: "task-result",
        id: message.id,
        ok: false,
        error: String(error && error.message || error || "Simulation task failed.")
      });
    }
  });
})(self);
