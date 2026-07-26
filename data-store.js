"use strict";

(function initGamelabDataStore() {
  const LOCAL_STATE_KEY = "gamelab.sig.alpha.v2";
  const LOCAL_NOTE_KEY = "gamelab.sig.notes.v1";
  const CONFIG_KEY = "gamelab.sig.backend.v1";

  function readJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch (error) {
      console.warn(`Failed to read ${key}`, error);
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function backendConfig() {
    return readJSON(CONFIG_KEY, { provider: "local", url: "", anonKey: "" });
  }

  const localAdapter = {
    name: "local",
    isRemote: false,
    async getSession() { return null; },
    async loadAppState(fallback) { return readJSON(LOCAL_STATE_KEY, fallback); },
    async saveAppState(value) { return writeJSON(LOCAL_STATE_KEY, value); },
    async listNotes() { return readJSON(LOCAL_NOTE_KEY, []); },
    async saveNotes(notes) { return writeJSON(LOCAL_NOTE_KEY, notes); },
    async healthcheck() { return { ok: true, provider: "local" }; }
  };

  function createSupabaseAdapter(config) {
    let client = null;

    function requireClient() {
      if (!globalThis.supabase?.createClient) {
        throw new Error("Supabase SDK is not loaded");
      }
      client ||= globalThis.supabase.createClient(config.url, config.anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      return client;
    }

    return {
      name: "supabase",
      isRemote: true,
      async getSession() {
        const { data, error } = await requireClient().auth.getSession();
        if (error) throw error;
        return data.session;
      },
      async healthcheck() {
        const { error } = await requireClient().from("profiles").select("id", { head: true, count: "exact" }).limit(1);
        return { ok: !error, provider: "supabase", error: error?.message || "" };
      },
      async loadAppState(fallback) {
        // The UI still consumes the prototype aggregate shape. This method is the migration seam;
        // table-by-table hydration will replace this fallback after authentication is connected.
        return readJSON(LOCAL_STATE_KEY, fallback);
      },
      async saveAppState(value) {
        // Keep a local recovery copy even after remote sync is enabled.
        return writeJSON(LOCAL_STATE_KEY, value);
      },
      async listNotes() { return readJSON(LOCAL_NOTE_KEY, []); },
      async saveNotes(notes) { return writeJSON(LOCAL_NOTE_KEY, notes); }
    };
  }

  function selectAdapter() {
    const config = backendConfig();
    if (config.provider === "supabase" && config.url && config.anonKey) {
      return createSupabaseAdapter(config);
    }
    return localAdapter;
  }

  const store = {
    adapter: selectAdapter(),
    get mode() { return this.adapter.name; },
    get isRemote() { return this.adapter.isRemote; },
    configureSupabase(url, anonKey) {
      if (!/^https:\/\/.+\.supabase\.co$/i.test(String(url || ""))) throw new Error("Invalid Supabase URL");
      if (!String(anonKey || "").trim()) throw new Error("Supabase anon key is required");
      writeJSON(CONFIG_KEY, { provider: "supabase", url: String(url).trim(), anonKey: String(anonKey).trim() });
      this.adapter = selectAdapter();
    },
    useLocal() {
      writeJSON(CONFIG_KEY, { provider: "local", url: "", anonKey: "" });
      this.adapter = localAdapter;
    },
    loadAppState: (...args) => store.adapter.loadAppState(...args),
    saveAppState: (...args) => store.adapter.saveAppState(...args),
    listNotes: (...args) => store.adapter.listNotes(...args),
    saveNotes: (...args) => store.adapter.saveNotes(...args),
    getSession: (...args) => store.adapter.getSession(...args),
    healthcheck: (...args) => store.adapter.healthcheck(...args)
  };

  globalThis.GData = store;
  document.documentElement.dataset.backend = store.mode;
  document.dispatchEvent(new CustomEvent("gdata:ready", { detail: { mode: store.mode } }));
})();
