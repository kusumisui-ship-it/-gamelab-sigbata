"use strict";

(function initNotePublishing() {
  const NOTE_KEY = "gamelab.sig.notes.v1";

  function loadNotes() {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) || "[]"); }
    catch { return []; }
  }

  function saveNotes(notes) {
    localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  }

  function normalize(note) {
    return {
      visibility: "private",
      linkedPostId: "",
      author: state?.profile?.name || "Researcher",
      ...note,
      game: "APEX"
    };
  }

  function visibilityLabel(value) {
    return value === "public" ? "公開" : value === "unlisted" ? "限定公開" : "非公開";
  }

  function injectEditorSettings() {
    const editor = document.querySelector(".note-editor");
    if (!editor || editor.querySelector(".note-publish-settings")) return;
    const title = document.querySelector("#noteTitle")?.value || "";
    const current = loadNotes().find((note) => note.title === title) || {};
    const posts = (state?.posts || []).filter((post) => post.game === "APEX");
    editor.insertAdjacentHTML("beforeend", `
      <section class="note-publish-settings">
        <span class="form-label">PUBLISH</span>
        <div class="note-publish-grid">
          <label>公開範囲
            <select id="noteVisibility">
              <option value="private" ${current.visibility === "private" || !current.visibility ? "selected" : ""}>非公開</option>
              <option value="unlisted" ${current.visibility === "unlisted" ? "selected" : ""}>限定公開</option>
              <option value="public" ${current.visibility === "public" ? "selected" : ""}>公開</option>
            </select>
          </label>
          <label>関連RB
            <select id="noteLinkedPost">
              <option value="">紐付けなし</option>
              ${posts.map((post) => `<option value="${post.id}" ${current.linkedPostId === post.id ? "selected" : ""}>${escapeHTML(post.text.slice(0, 38))}</option>`).join("")}
            </select>
          </label>
        </div>
        <small>限定公開は一覧と検索に出さず、URLを知っている人だけが閲覧する想定です。</small>
      </section>`);
  }

  function patchLatestSavedNote() {
    const title = document.querySelector("#noteTitle")?.value.trim();
    if (!title) return;
    const visibility = document.querySelector("#noteVisibility")?.value || "private";
    const linkedPostId = document.querySelector("#noteLinkedPost")?.value || "";
    setTimeout(() => {
      const notes = loadNotes().map(normalize);
      const note = notes.find((item) => item.title === title);
      if (!note) return;
      note.visibility = visibility;
      note.linkedPostId = linkedPostId;
      note.author = state?.profile?.name || note.author;
      note.updatedAt = Date.now();
      saveNotes(notes);
    }, 0);
  }

  function renderCards(notes, options = {}) {
    if (!notes.length) return `<div class="note-empty">研究ノートはまだありません。</div>`;
    return `<div class="note-library">${notes.map((note) => {
      const linked = (state?.posts || []).find((post) => post.id === note.linkedPostId);
      return `<article class="note-card">
        <div class="note-badges"><span class="note-badge ${note.visibility}">${visibilityLabel(note.visibility)}</span><span class="note-badge">Version ${note.versions?.at(-1)?.number || 1}</span>${linked ? `<span class="note-badge">RB連携</span>` : ""}</div>
        <h3>${escapeHTML(note.title || "無題の研究")}</h3>
        <p>${escapeHTML(note.summary || "要約なし")}</p>
        <div class="note-card-meta"><small>${escapeHTML(note.author || "Researcher")}</small><small>${relativeTime(note.updatedAt || note.createdAt || Date.now())}</small></div>
        <div class="note-card-actions"><button type="button" data-open-note="${note.id}">読む</button>${options.owner ? `<button type="button" data-edit-published-note="${note.id}">編集</button>` : ""}${note.visibility !== "private" ? `<button type="button" data-copy-note-link="${note.id}">リンク</button>` : ""}</div>
      </article>`;
    }).join("")}</div>`;
  }

  function openReader(id) {
    const note = loadNotes().map(normalize).find((item) => item.id === id);
    if (!note) return showToast("ノートが見つかりません");
    const linked = (state?.posts || []).find((post) => post.id === note.linkedPostId);
    modalRoot.innerHTML = `<div class="modal-backdrop" data-close-modal><section class="modal-panel" role="dialog" aria-modal="true" data-modal-panel>
      <div class="modal-head"><div><h2>研究ノート</h2><p class="modal-sub">${visibilityLabel(note.visibility)} ・ Apex Legends</p></div><button class="icon-button" type="button" data-close-modal>×</button></div>
      <article class="note-reader"><header><div class="note-badges"><span class="note-badge ${note.visibility}">${visibilityLabel(note.visibility)}</span><span class="note-badge">${escapeHTML(note.author)}</span></div><h1>${escapeHTML(note.title)}</h1><p>${escapeHTML(note.summary || "")}</p></header>
      <section class="note-reader-body">${escapeHTML(note.body || "本文なし")}</section>
      ${note.images.map((image, index) => `<figure><img src="${image.annotated || image.original}" alt="研究画像${index + 1}"><figcaption>［画像${index + 1}］ ${escapeHTML(image.caption || image.name || "画像")}</figcaption></figure>`).join("")}
      ${linked ? `<section class="note-card"><strong>関連RB</strong><p>${escapeHTML(linked.text)}</p></section>` : ""}
      </article></section></div>`;
  }

  function injectProfileNotes() {
    if (ui?.page !== "profile") return;
    const root = document.querySelector("#app");
    if (!root || root.querySelector(".note-discovery-block")) return;
    const notes = loadNotes().map(normalize);
    root.insertAdjacentHTML("beforeend", `<section class="note-discovery-block"><div class="section-head"><div><span class="eyebrow">RESEARCH NOTES</span><h2>研究ノート</h2></div></div>${renderCards(notes, { owner: true })}</section>`);
  }

  function injectSearchNotes() {
    if (ui?.page !== "search") return;
    const root = document.querySelector("#app");
    if (!root || root.querySelector("#noteSearchInput")) return;
    const publicNotes = loadNotes().map(normalize).filter((note) => note.visibility === "public");
    root.insertAdjacentHTML("beforeend", `<section class="note-discovery-block"><div class="section-head"><div><span class="eyebrow">NOTE SEARCH</span><h2>公開研究ノート</h2></div></div><input id="noteSearchInput" class="note-search-input" placeholder="タイトル・要約・本文を検索"><div id="noteSearchResults">${renderCards(publicNotes)}</div></section>`);
  }

  function refreshInjectedViews() {
    injectEditorSettings();
    injectProfileNotes();
    injectSearchNotes();
  }

  document.addEventListener("input", (event) => {
    if (event.target.id !== "noteSearchInput") return;
    const query = event.target.value.trim().toLowerCase();
    const notes = loadNotes().map(normalize).filter((note) => note.visibility === "public" && [note.title, note.summary, note.body, note.author].join(" ").toLowerCase().includes(query));
    const results = document.querySelector("#noteSearchResults");
    if (results) results.innerHTML = renderCards(notes);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.saveNote !== undefined) patchLatestSavedNote();
    if (button.dataset.openNote) openReader(button.dataset.openNote);
    if (button.dataset.editPublishedNote) {
      document.querySelector("#composeButton")?.click();
      setTimeout(() => {
        document.querySelector('[data-compose-mode="note"]')?.click();
        setTimeout(() => globalThis.openNoteEditor?.(button.dataset.editPublishedNote), 0);
      }, 0);
    }
    if (button.dataset.copyNoteLink) {
      const url = `${location.origin}${location.pathname}#note=${button.dataset.copyNoteLink}`;
      navigator.clipboard?.writeText(url).then(() => showToast("ノートURLをコピーしました")).catch(() => showToast(url));
    }
  }, true);

  const observer = new MutationObserver(refreshInjectedViews);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", () => {
    const id = new URLSearchParams(location.hash.replace(/^#/, "")).get("note");
    if (id) openReader(id);
  });
  document.addEventListener("DOMContentLoaded", () => {
    refreshInjectedViews();
    const id = new URLSearchParams(location.hash.replace(/^#/, "")).get("note");
    if (id) openReader(id);
  }, { once: true });
})();