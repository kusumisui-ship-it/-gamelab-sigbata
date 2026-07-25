"use strict";

(function initResearchBox() {
  function ensureResearchBox() {
    if (!state.researchBox || !Array.isArray(state.researchBox.folders) || !Array.isArray(state.researchBox.entries)) {
      state.researchBox = { folders: [], entries: [] };
    }

    Object.keys(GAME_META).forEach((game) => {
      if (!state.researchBox.folders.some((folder) => folder.game === game && folder.system)) {
        state.researchBox.folders.push({
          id: `box-${game.toLowerCase()}-inbox`,
          game,
          name: "未分類",
          system: true,
          createdAt: Date.now()
        });
      }
    });

    state.posts.filter((post) => post.saved).forEach((post) => {
      if (!state.researchBox.entries.some((entry) => entry.postId === post.id)) {
        const folder = getDefaultFolder(post.game);
        state.researchBox.entries.push({
          id: makeId("box-entry"),
          postId: post.id,
          folderId: folder.id,
          memo: "",
          status: "unread",
          savedAt: Date.now()
        });
      }
    });

    state.researchBox.entries = state.researchBox.entries.filter((entry) => {
      const post = state.posts.find((item) => item.id === entry.postId);
      return post && post.saved;
    });
  }

  function getDefaultFolder(game) {
    ensureResearchBoxShell();
    return state.researchBox.folders.find((folder) => folder.game === game && folder.system)
      || state.researchBox.folders.find((folder) => folder.game === game);
  }

  function ensureResearchBoxShell() {
    if (!state.researchBox) state.researchBox = { folders: [], entries: [] };
    if (!Array.isArray(state.researchBox.folders)) state.researchBox.folders = [];
    if (!Array.isArray(state.researchBox.entries)) state.researchBox.entries = [];
  }

  ensureResearchBox();
  saveState();

  const baseRender = render;
  render = function renderWithResearchBox() {
    if (ui.page === "box") {
      syncChrome();
      app.innerHTML = renderResearchBox();
      return;
    }
    baseRender();
    injectResearchBoxLinks();
  };

  const baseToggleSave = toggleSave;
  toggleSave = function toggleSaveWithBox(postId) {
    const post = state.posts.find((item) => item.id === postId);
    const wasSaved = Boolean(post?.saved);
    baseToggleSave(postId);
    if (!post) return;

    ensureResearchBox();
    if (!wasSaved && post.saved) {
      if (!state.researchBox.entries.some((entry) => entry.postId === post.id)) {
        const folder = getDefaultFolder(post.game);
        state.researchBox.entries.push({
          id: makeId("box-entry"),
          postId: post.id,
          folderId: folder.id,
          memo: "",
          status: "unread",
          savedAt: Date.now()
        });
      }
      saveState();
      showToast("研究BOXへ保存しました");
    } else if (wasSaved && !post.saved) {
      state.researchBox.entries = state.researchBox.entries.filter((entry) => entry.postId !== post.id);
      saveState();
    }
  };

  function injectResearchBoxLinks() {
    const quickGrid = document.querySelector(".quick-grid");
    if (quickGrid && !quickGrid.querySelector('[data-route="box"]')) {
      quickGrid.insertAdjacentHTML("beforeend", quickCard("▣", "研究BOX", "YOUR ARCHIVE", "box"));
    }

    const profileToolbar = document.querySelector(".profile-cover + .toolbar");
    if (profileToolbar && !profileToolbar.querySelector('[data-route="box"]')) {
      profileToolbar.insertAdjacentHTML("beforeend", '<button class="filter-chip" type="button" data-route="box">研究BOX</button>');
    }
  }

  function renderResearchBox() {
    ensureResearchBox();
    const currentFolders = state.researchBox.folders
      .filter((folder) => folder.game === state.currentGame)
      .sort((a, b) => Number(b.system) - Number(a.system) || a.createdAt - b.createdAt);
    const currentEntries = state.researchBox.entries
      .map((entry) => ({ entry, post: state.posts.find((post) => post.id === entry.postId) }))
      .filter(({ post }) => post && post.game === state.currentGame)
      .sort((a, b) => b.entry.savedAt - a.entry.savedAt);

    return `
      <section class="page research-box-page">
        <header class="page-head">
          <div><span class="eyebrow">PERSONAL RESEARCH ARCHIVE</span><h1>研究BOX</h1><p>保存したRBを、タイトル別・フォルダ別・メモ付きで整理する。</p></div>
          <button class="small-button" type="button" data-box-create-folder>＋ フォルダ</button>
        </header>
        ${renderAlphaBanner()}
        <div class="box-summary">
          <div><strong>${currentEntries.length}</strong><span>保存資料</span></div>
          <div><strong>${currentFolders.length}</strong><span>フォルダ</span></div>
          <div><strong>${currentEntries.filter(({ entry }) => entry.status === "verify").length}</strong><span>要検証</span></div>
        </div>
        <section class="section">
          <div class="section-head"><h2>${escapeHTML(currentGame().label)}</h2><span class="box-auto-label">タイトル別に自動分類</span></div>
          <div class="box-folder-grid">
            ${currentFolders.map((folder) => renderFolder(folder, currentEntries)).join("")}
          </div>
        </section>
      </section>`;
  }

  function renderFolder(folder, entries) {
    const items = entries.filter(({ entry }) => entry.folderId === folder.id);
    return `
      <article class="box-folder">
        <div class="box-folder-head">
          <div><span class="box-folder-icon">▰</span><strong>${escapeHTML(folder.name)}</strong><small>${items.length}件</small></div>
          ${folder.system ? "" : `<button class="icon-button box-mini-button" type="button" data-box-delete-folder="${escapeHTML(folder.id)}" aria-label="フォルダ削除">×</button>`}
        </div>
        <div class="box-folder-items">
          ${items.length ? items.map(({ entry, post }) => renderBoxItem(entry, post)).join("") : '<div class="box-folder-empty">保存したRBをここへ整理できます。</div>'}
        </div>
      </article>`;
  }

  function renderBoxItem(entry, post) {
    const statusLabel = { unread: "未読", checked: "確認済み", verify: "要検証" }[entry.status] || "未読";
    return `
      <button class="box-item" type="button" data-box-edit="${escapeHTML(entry.id)}">
        <div class="box-item-top"><span class="status-badge ${entry.status === "verify" ? "open" : entry.status === "checked" ? "verified" : ""}">${statusLabel}</span><small>${relativeTime(entry.savedAt)}</small></div>
        <p>${escapeHTML(post.text)}</p>
        <div class="post-tags">${post.tags.slice(0, 3).map((tag) => `<span>#${escapeHTML(tag)}</span>`).join("")}</div>
        ${entry.memo ? `<small class="box-memo">MEMO：${escapeHTML(entry.memo)}</small>` : '<small class="box-memo muted">メモなし</small>'}
      </button>`;
  }

  function createFolder() {
    const name = prompt("新しいフォルダ名を入力してください（例：武器研究、あとで検証）");
    if (!name || !name.trim()) return;
    const cleanName = name.trim().slice(0, 30);
    ensureResearchBox();
    if (state.researchBox.folders.some((folder) => folder.game === state.currentGame && folder.name === cleanName)) {
      return showToast("同じ名前のフォルダがあります");
    }
    state.researchBox.folders.push({ id: makeId("box-folder"), game: state.currentGame, name: cleanName, system: false, createdAt: Date.now() });
    saveState();
    render();
    showToast("フォルダを作成しました");
  }

  function deleteFolder(folderId) {
    const folder = state.researchBox.folders.find((item) => item.id === folderId);
    if (!folder || folder.system) return;
    if (!confirm(`「${folder.name}」を削除しますか？中の資料は未分類へ移動します。`)) return;
    const fallback = getDefaultFolder(folder.game);
    state.researchBox.entries.forEach((entry) => {
      if (entry.folderId === folderId) entry.folderId = fallback.id;
    });
    state.researchBox.folders = state.researchBox.folders.filter((item) => item.id !== folderId);
    saveState();
    render();
    showToast("フォルダを削除しました");
  }

  function openBoxEditor(entryId) {
    const entry = state.researchBox.entries.find((item) => item.id === entryId);
    const post = entry && state.posts.find((item) => item.id === entry.postId);
    if (!entry || !post) return;
    const folders = state.researchBox.folders.filter((folder) => folder.game === post.game);
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-modal>
        <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="boxEditTitle" data-modal-panel>
          <div class="modal-head"><div><h2 id="boxEditTitle">研究BOXを整理</h2><p class="modal-sub">保存先、状態、自分用メモを編集します。</p></div><button class="icon-button" type="button" data-close-modal>×</button></div>
          <article class="post-card box-editor-source"><p class="post-text">${escapeHTML(post.text)}</p></article>
          <div class="form-group"><label class="form-label" for="boxFolderSelect">FOLDER</label><select id="boxFolderSelect" class="box-select">${folders.map((folder) => `<option value="${escapeHTML(folder.id)}" ${folder.id === entry.folderId ? "selected" : ""}>${escapeHTML(folder.name)}</option>`).join("")}</select></div>
          <div class="form-group"><label class="form-label" for="boxStatusSelect">STATUS</label><select id="boxStatusSelect" class="box-select"><option value="unread" ${entry.status === "unread" ? "selected" : ""}>未読</option><option value="checked" ${entry.status === "checked" ? "selected" : ""}>確認済み</option><option value="verify" ${entry.status === "verify" ? "selected" : ""}>要検証</option></select></div>
          <div class="form-group"><label class="form-label" for="boxMemo">PERSONAL MEMO</label><textarea id="boxMemo" class="comment-input" maxlength="300" placeholder="比較したい点、検証条件、動画企画など...">${escapeHTML(entry.memo)}</textarea></div>
          <div class="modal-actions"><button class="secondary-button" type="button" data-box-open-post="${escapeHTML(post.id)}">元のRBを見る</button><button class="primary-button" type="button" data-box-save-entry="${escapeHTML(entry.id)}">保存する</button></div>
        </section>
      </div>`;
  }

  function saveBoxEntry(entryId) {
    const entry = state.researchBox.entries.find((item) => item.id === entryId);
    if (!entry) return;
    entry.folderId = document.querySelector("#boxFolderSelect")?.value || entry.folderId;
    entry.status = document.querySelector("#boxStatusSelect")?.value || "unread";
    entry.memo = (document.querySelector("#boxMemo")?.value || "").trim().slice(0, 300);
    saveState();
    closeModal();
    render();
    showToast("研究BOXを更新しました");
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-box-create-folder")) return createFolder();
    if (target.dataset.boxDeleteFolder) return deleteFolder(target.dataset.boxDeleteFolder);
    if (target.dataset.boxEdit) return openBoxEditor(target.dataset.boxEdit);
    if (target.dataset.boxSaveEntry) return saveBoxEntry(target.dataset.boxSaveEntry);
    if (target.dataset.boxOpenPost) return openPost(target.dataset.boxOpenPost);
  });

  render();
})();
