(function (root) {
  "use strict";

  const DB_NAME = "touchline-advanced-db";
  const DB_VERSION = 2;
  const SAVE_KEY = "touchline-advanced-save-v1";
  const MAX_SNAPSHOTS = 28;
  const MAX_SEASON_ARCHIVES = 40;

  function validCareer(value) {
    return !!(value && typeof value === "object" && value.schemaVersion === 1 &&
      Array.isArray(value.players) && Array.isArray(value.clubs) && Array.isArray(value.fixtures));
  }

  function parseCareer(value) {
    if (typeof value === "string") {
      try { value = JSON.parse(value); } catch (error) { return null; }
    }
    if (value && typeof value === "object" && value.state && typeof value.state === "object") value = value.state;
    return validCareer(value) ? value : null;
  }

  function dayDistance(a, b) {
    if (!a || !b) return Infinity;
    const left = new Date(String(a).slice(0, 10) + "T12:00:00Z").getTime();
    const right = new Date(String(b).slice(0, 10) + "T12:00:00Z").getTime();
    if (!Number.isFinite(left) || !Number.isFinite(right)) return Infinity;
    return Math.floor(Math.abs(right - left) / 86400000);
  }

  function ensureCareerIdentity(state) {
    if (!state.careerId) {
      const manager = String(state.manager && state.manager.name || "manager")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "manager";
      const club = String(state.userClubId || "club").replace(/[^a-z0-9_-]/gi, "").slice(0, 18) || "club";
      state.careerId = "tm-" + manager + "-" + club + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
    }
    if (!state.startedAt) state.startedAt = state.createdAt || new Date().toISOString();
    if (!state.storageMeta || typeof state.storageMeta !== "object" || Array.isArray(state.storageMeta)) state.storageMeta = {};
    return state.careerId;
  }

  function careerLabel(state) {
    const manager = String(state.manager && state.manager.name || "Manager");
    const club = String((state.clubs || []).find(function (item) { return item.id === state.userClubId; })?.name || state.userClubId || "Club");
    return manager + " · " + club;
  }

  function buildSnapshot(state, payload, forced) {
    const now = new Date().toISOString();
    const day = String(state.day || now.slice(0, 10)).slice(0, 10);
    return {
      id: state.careerId + ":" + (forced ? "manual:" + Date.now().toString(36) + ":" + Math.random().toString(36).slice(2, 6) : "auto:" + day),
      careerId: state.careerId,
      label: careerLabel(state),
      managerName: String(state.manager && state.manager.name || "Manager"),
      clubId: String(state.userClubId || ""),
      clubName: String((state.clubs || []).find(function (item) { return item.id === state.userClubId; })?.name || state.userClubId || "Club"),
      day: day,
      season: Number(state.season) || Number(String(day).slice(0, 4)) || 0,
      seasonNumber: Number(state.seasonNumber) || 1,
      savedAt: now,
      kind: forced ? "manual" : "weekly",
      payload: payload
    };
  }

  function buildSeasonRecord(state, archive) {
    const season = Number(archive && archive.season);
    if (!Number.isFinite(season)) return null;
    return {
      id: state.careerId + ":season:" + season,
      careerId: state.careerId,
      season: season,
      seasonLabel: String(season) + "/" + String((season + 1) % 100).padStart(2, "0"),
      clubId: archive.clubId || state.userClubId || "",
      clubName: archive.clubName || "",
      champion: archive.champion || null,
      finalPosition: archive.finalPosition == null ? null : Number(archive.finalPosition),
      recordedAt: new Date().toISOString(),
      playerCount: Array.isArray(archive.players) ? archive.players.length : 0,
      players: Array.isArray(archive.players) ? archive.players : []
    };
  }

  function createCareerStorage(host) {
    const env = host || root;
    let dbPromise = null;
    let saveQueue = Promise.resolve();
    let lastStorageMode = "localStorage";

    function localStorageRef() {
      try { return env.localStorage || null; } catch (error) { return null; }
    }

    function openDatabase() {
      if (!env.indexedDB) return Promise.resolve(null);
      if (dbPromise) return dbPromise;
      dbPromise = new Promise(function (resolve, reject) {
        let request;
        try { request = env.indexedDB.open(DB_NAME, DB_VERSION); }
        catch (error) { reject(error); return; }

        request.onupgradeneeded = function (event) {
          const db = request.result;
          const upgradeTransaction = event.target.transaction;
          // Version 1 already created a keyless "careers" store; preserve it.
          if (!db.objectStoreNames.contains("careers")) db.createObjectStore("careers");
          let snapshots;
          if (!db.objectStoreNames.contains("snapshots")) snapshots = db.createObjectStore("snapshots", { keyPath: "id" });
          else snapshots = upgradeTransaction.objectStore("snapshots");
          if (snapshots && !snapshots.indexNames.contains("careerId")) snapshots.createIndex("careerId", "careerId", { unique: false });
          if (snapshots && !snapshots.indexNames.contains("savedAt")) snapshots.createIndex("savedAt", "savedAt", { unique: false });
          let seasons;
          if (!db.objectStoreNames.contains("seasons")) seasons = db.createObjectStore("seasons", { keyPath: "id" });
          else seasons = upgradeTransaction.objectStore("seasons");
          if (seasons && !seasons.indexNames.contains("careerId")) seasons.createIndex("careerId", "careerId", { unique: false });
          if (seasons && !seasons.indexNames.contains("season")) seasons.createIndex("season", "season", { unique: false });
        };
        request.onsuccess = function () {
          const db = request.result;
          db.onversionchange = function () {
            db.close();
            dbPromise = null;
          };
          resolve(db);
        };
        request.onerror = function () { reject(request.error || new Error("IndexedDB open failed.")); };
        request.onblocked = function () { reject(new Error("IndexedDB upgrade is blocked by another open game tab.")); };
      });
      dbPromise = dbPromise.catch(function (error) {
        dbPromise = null;
        throw error;
      });
      return dbPromise;
    }

    function requestResult(request) {
      return new Promise(function (resolve, reject) {
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error || new Error("IndexedDB request failed.")); };
      });
    }

    function transactionDone(tx) {
      return new Promise(function (resolve, reject) {
        tx.oncomplete = function () { resolve(true); };
        tx.onabort = tx.onerror = function () { reject(tx.error || new Error("IndexedDB transaction failed.")); };
      });
    }

    function readActive(db) {
      return new Promise(function (resolve, reject) {
        let tx;
        try { tx = db.transaction(["careers"], "readonly"); }
        catch (error) { reject(error); return; }
        const request = tx.objectStore("careers").get("active");
        request.onsuccess = function () { resolve(request.result == null ? null : request.result); };
        request.onerror = function () { reject(request.error || new Error("Could not read the active career.")); };
      });
    }

    function setLocal(payload) {
      const storage = localStorageRef();
      if (!storage) return false;
      try { storage.setItem(SAVE_KEY, payload); return true; }
      catch (error) { return false; }
    }

    function getLocal() {
      const storage = localStorageRef();
      if (!storage) return null;
      try { return parseCareer(storage.getItem(SAVE_KEY)); }
      catch (error) { return null; }
    }

    async function load() {
      let db = null;
      try {
        db = await openDatabase();
        if (db) {
          const stored = await readActive(db);
          const state = parseCareer(stored);
          if (state) {
            ensureCareerIdentity(state);
            setLocal(JSON.stringify(state));
            lastStorageMode = "indexedDB";
            // Migrate old version-1 active saves to the richer stores on the next save.
            return { state: state, source: "indexedDB", migrated: false };
          }
        }
      } catch (error) {
        lastStorageMode = "localStorage";
      } finally {
        if (db) { try { db.close(); } catch (error) {} dbPromise = null; }
      }

      const legacy = getLocal();
      if (!legacy) return { state: null, source: "empty", migrated: false };
      ensureCareerIdentity(legacy);
      lastStorageMode = "localStorage";
      let migrated = false;
      try {
        const result = await save(legacy, { checkpoint: true, reason: "migration" });
        migrated = result.storage === "indexedDB";
      } catch (error) {
        // Keep the localStorage save usable if the browser blocks IndexedDB.
      }
      return { state: legacy, source: migrated ? "migrated-localStorage" : "localStorage", migrated: migrated };
    }

    async function saveOnce(state, options) {
      if (!validCareer(state)) throw new TypeError("A valid career state is required to save.");
      const opts = options || {};
      ensureCareerIdentity(state);
      const storage = localStorageRef();
      let localSaved = false;
      let payload = "";
      const previousCheckpoint = state.storageMeta.lastCheckpointDay || "";
      const newArchives = Array.isArray(state.seasonArchives) ? state.seasonArchives : [];
      const previouslyArchivedSeason = Number(state.storageMeta.lastArchivedSeason) || 0;
      const maxArchiveSeason = newArchives.reduce(function (max, archive) {
        return Math.max(max, Number(archive && archive.season) || 0);
      }, previouslyArchivedSeason);
      const hasUnarchivedSeason = newArchives.some(function (archive) {
        return archive && Number(archive.season) > previouslyArchivedSeason;
      });
      if (newArchives.length) state.storageMeta.lastArchivedSeason = maxArchiveSeason;
      state.savedAt = new Date().toISOString();

      // Keep the legacy key current before any asynchronous operation: this is the fallback
      // if the browser denies IndexedDB access or closes the tab mid-write.
      try { payload = JSON.stringify(state); } catch (error) { throw new Error("Career save could not be serialized: " + error.message); }
      if (storage) {
        try { storage.setItem(SAVE_KEY, payload); localSaved = true; } catch (error) {}
      }

      const dueToCheckpoint = !!opts.checkpoint || !previousCheckpoint ||
        dayDistance(previousCheckpoint, state.day) >= 7 || hasUnarchivedSeason;
      let snapshot = null;
      if (dueToCheckpoint) {
        state.storageMeta.lastCheckpointDay = String(state.day || "").slice(0, 10);
        state.storageMeta.lastCheckpointAt = new Date().toISOString();
        if (opts.reason) state.storageMeta.lastCheckpointReason = String(opts.reason);
        payload = JSON.stringify(state);
        if (storage) {
          try { storage.setItem(SAVE_KEY, payload); localSaved = true; } catch (error) {}
        }
        snapshot = buildSnapshot(state, payload, !!opts.checkpoint);
      }

      let db = null;
      try {
        db = await openDatabase();
        if (!db) {
          lastStorageMode = "localStorage";
          return { ok: localSaved, storage: "localStorage", checkpoint: !!snapshot };
        }
        const stores = ["careers", "snapshots", "seasons"];
        const tx = db.transaction(stores, "readwrite");
        const careers = tx.objectStore("careers");
        careers.put(payload, "active");
        careers.put(payload, "career:" + state.careerId);
        if (snapshot) tx.objectStore("snapshots").put(snapshot);

        newArchives.forEach(function (archive) {
          const record = buildSeasonRecord(state, archive);
          if (record) tx.objectStore("seasons").put(record);
        });
        const completion = transactionDone(tx);
        await completion;

        lastStorageMode = "indexedDB";
        await pruneSnapshots(db, state.careerId);
        return { ok: true, storage: "indexedDB", checkpoint: !!snapshot, archivedSeasons: newArchives.length };
      } catch (error) {
        lastStorageMode = "localStorage";
        return { ok: localSaved, storage: "localStorage", checkpoint: !!snapshot, warning: String(error && error.message || error) };
      } finally {
        if (db) { try { db.close(); } catch (error) {} dbPromise = null; }
      }
    }

    function save(state, options) {
      const task = function () { return saveOnce(state, options); };
      const next = saveQueue.then(task, task);
      saveQueue = next.catch(function () {});
      return next;
    }

    async function pruneSnapshots(db, careerId) {
      const readTx = db.transaction(["snapshots"], "readonly");
      const readDone = transactionDone(readTx);
      const request = readTx.objectStore("snapshots").index("careerId").getAll(careerId);
      const entries = await requestResult(request);
      await readDone;
      entries.sort(function (a, b) { return String(b.savedAt).localeCompare(String(a.savedAt)); });
      const expired = entries.slice(MAX_SNAPSHOTS);
      if (!expired.length) return;
      const writeTx = db.transaction(["snapshots"], "readwrite");
      const writeDone = transactionDone(writeTx);
      const store = writeTx.objectStore("snapshots");
      expired.forEach(function (entry) { store.delete(entry.id); });
      await writeDone;
    }

    async function listSnapshots(careerId) {
      const db = await openDatabase();
      if (!db) return [];
      try {
        const tx = db.transaction(["snapshots"], "readonly");
        const request = tx.objectStore("snapshots").index("careerId").getAll(careerId);
        const values = await requestResult(request);
        return values.sort(function (a, b) { return String(b.savedAt).localeCompare(String(a.savedAt)); })
          .map(function (item) {
            return { id: item.id, label: item.label, day: item.day, season: item.season,
              seasonNumber: item.seasonNumber, savedAt: item.savedAt, kind: item.kind, clubName: item.clubName };
          });
      } finally {
        try { db.close(); } catch (error) {}
        dbPromise = null;
      }
    }

    async function restoreSnapshot(snapshotId) {
      const db = await openDatabase();
      if (!db) return null;
      try {
        const tx = db.transaction(["snapshots"], "readonly");
        const value = await requestResult(tx.objectStore("snapshots").get(snapshotId));
        const state = value && parseCareer(value.payload);
        if (state) ensureCareerIdentity(state);
        return state;
      } finally {
        try { db.close(); } catch (error) {}
        dbPromise = null;
      }
    }

    async function listSeasons(careerId) {
      const db = await openDatabase();
      if (!db) return [];
      try {
        const tx = db.transaction(["seasons"], "readonly");
        const request = tx.objectStore("seasons").index("careerId").getAll(careerId);
        const values = await requestResult(request);
        return values.sort(function (a, b) { return Number(b.season) - Number(a.season); });
      } finally {
        try { db.close(); } catch (error) {}
        dbPromise = null;
      }
    }

    function status() {
      return {
        indexedDBAvailable: !!env.indexedDB,
        mode: lastStorageMode,
        database: DB_NAME,
        databaseVersion: DB_VERSION,
        maxSnapshots: MAX_SNAPSHOTS
      };
    }

    return {
      load: load,
      save: save,
      listSnapshots: listSnapshots,
      restoreSnapshot: restoreSnapshot,
      listSeasons: listSeasons,
      status: status,
      ensureCareerIdentity: ensureCareerIdentity
    };
  }

  const api = {
    DB_NAME: DB_NAME,
    DB_VERSION: DB_VERSION,
    MAX_SNAPSHOTS: MAX_SNAPSHOTS,
    validCareer: validCareer,
    parseCareer: parseCareer,
    dayDistance: dayDistance,
    buildSnapshot: buildSnapshot,
    buildSeasonRecord: buildSeasonRecord,
    createCareerStorage: createCareerStorage
  };
  root.FM_CAREER_STORAGE = createCareerStorage(root);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
