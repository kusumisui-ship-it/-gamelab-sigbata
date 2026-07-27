"use strict";

(function initContentNavigation() {
  const NOTE_KEY = "gamelab.sig.notes.v1";
  let profileTab = "rb";
  let searchTab = "all";
  let scheduled = false;

  function notes() {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) || "[]"); }
    catch { return []; }
  }

  function ownNotes() {
    return notes().filter((note) => !note.author || note.author === state?.profile?.name);
  }

  function publicNotes() {
    return notes().filter((note) => note.visibility === "public");
  }

  function noteMatches(note, query) {
    if (!query) return true;
    return [note.title, note.summary, note.body, note.author].join(" ").toLowerCase().includes(query);
  }

  function renderNoteCards(items) {
    if (!items.length) return `<div class="content-lab-empty"><b>研究ノートはありません</b><span>RBの気づきを掘り下げると、ここへ並びます。</span></div>`;
    return `<div class="content-note-list">${items.map((note) => {
      const linked = (state?.posts || []).some((post) => post.id === note.linkedPostId);
      const visibility = note.visibility === "public" ? "公開" : note.visibility === "unlisted" ? "限定公開" : "非公開";
      return `<button type="button" class="content-note-card" data-open-note="${escapeHTML(note.id)}">
        <span class="content-note-card-top"><span>${visibility} / RESEARCH NOTE</span><small>${relativeTime(note.updatedAt || note.createdAt || Date.now())}</small></span>
        <h3>${escapeHTML(note.title || "無題の研究")}</h3>
        <p>${escapeHTML(note.summary || note.body || "要約なし")}</p>
        <span class="content-note-card-meta"><span>${escapeHTML(note.author || state?.profile?.name || "Researcher")}</span>${linked ? `<span class="source">元RBあり</span>` : ""}</span>
      </button>`;
    }).join("")}</div>`;
  }

  function renderProfileTabs(root) {
    if (ui?.page !== "profile") return;
    const cover = root.querySelector(".profile-cover");
    if (!cover) return;

    const oldToolbar = cover.nextElementSibling?.classList.contains("toolbar") ? cover.nextElementSibling : null;
    const oldSection = oldToolbar?.nextElementSibling?.classList.contains("section") ? oldToolbar.nextElementSibling : null;
    const noteBlock = root.querySelector(".note-discovery-block");
    if (oldToolbar) oldToolbar.hidden = true;
    if (oldSection) oldSection.hidden = true;
    if (noteBlock) noteBlock.hidden = true;
    if (root.querySelector(".profile-content-shell")) return;

    const ownPosts = state.posts.filter((post) => post.author === state.profile.name).slice().sort((a,b) => b.createdAt-a.createdAt);
    const saved = state.posts.filter((post) => post.saved).slice().sort((a,b) => b.createdAt-a.createdAt);
    const myNotes = ownNotes().slice().sort((a,b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    const myLabs = state.labs.filter((lab) => lab.author === state.profile.name || lab.author === "GR Founder");

    cover.insertAdjacentHTML("afterend", `<section class="profile-content-shell">
      <div class="content-tabs" role="tablist" aria-label="プロフィールのコンテンツ">
        <button class="content-tab ${profileTab === "rb" ? "active" : ""}" data-content-profile="rb">RB</button>
        <button class="content-tab ${profileTab === "notes" ? "active" : ""}" data-content-profile="notes">研究ノート</button>
        <button class="content-tab ${profileTab === "saved" ? "active" : ""}" data-content-profile="saved">保存</button>
        <button class="content-tab ${profileTab === "labs" ? "active" : ""}" data-content-profile="labs">LAB</button>
      </div>
      <div class="content-counts"><span class="content-count"><b>${ownPosts.length}</b> RB</span><span class="content-count"><b>${myNotes.length}</b> NOTES</span><span class="content-count"><b>${myLabs.length}</b> LAB</span></div>
      <div class="content-panel" data-profile-panel="rb" ${profileTab !== "rb" ? "hidden" : ""}>${ownPosts.length ? `<div class="feed">${ownPosts.map(renderPostCard).join("")}</div>` : renderEmpty("自分のRBはありません", "気軽な気づきや質問を投稿してみよう。")}</div>
      <div class="content-panel" data-profile-panel="notes" ${profileTab !== "notes" ? "hidden" : ""}>${renderNoteCards(myNotes)}</div>
      <div class="content-panel" data-profile-panel="saved" ${profileTab !== "saved" ? "hidden" : ""}>${saved.length ? `<div class="feed">${saved.map(renderPostCard).join("")}</div>` : renderEmpty("保存したRBはありません", "あとで読みたい投稿を保存できます。")}</div>
      <div class="content-panel" data-profile-panel="labs" ${profileTab !== "labs" ? "hidden" : ""}>${myLabs.length ? `<div class="lab-grid">${myLabs.map(renderLabCard).join("")}</div>` : `<div class="content-lab-empty"><b>公開したLABはありません</b><span>複数のRBと研究ノートを、読み返せる完成版へまとめる場所です。</span></div>`}</div>
    </section>`);
  }

  function renderSearchTabs(root) {
    if (ui?.page !== "search") return;
    const searchBox = root.querySelector(".search-box");
    if (!searchBox) return;

    [...root.children].forEach((child) => {
      if (child === root.querySelector(".page-head") || child === searchBox || child.classList.contains("discovery-content-shell")) return;
      child.hidden = true;
    });
    if (root.querySelector(".discovery-content-shell")) return;

    const query = (ui.searchQuery || "").trim().toLowerCase();
    const tag = ui.searchTag || "";
    const postMatches = (post) => {
      const haystack = [post.text, post.author, post.role, ...post.tags].join(" ").toLowerCase();
      return (!query || haystack.includes(query)) && (!tag || post.tags.some((item) => item.toLowerCase() === tag.toLowerCase()));
    };
    const labMatches = (lab) => !tag && (!query || [lab.title, lab.summary, lab.author].join(" ").toLowerCase().includes(query));
    const matchedPosts = state.posts.filter(postMatches).slice().sort((a,b) => b.createdAt-a.createdAt);
    const matchedNotes = tag ? [] : publicNotes().filter((note) => noteMatches(note, query));
    const matchedLabs = state.labs.filter(labMatches);

    const group = (type, title, count, content) => `<section class="discovery-group" data-discovery-group="${type}"><div class="discovery-group-head"><h2>${title}</h2><span>${count}件</span></div>${content}</section>`;
    searchBox.insertAdjacentHTML("afterend", `<section class="discovery-content-shell">
      <div class="content-tabs" role="tablist" aria-label="検索対象">
        <button class="content-tab ${searchTab === "all" ? "active" : ""}" data-content-search="all">すべて</button>
        <button class="content-tab ${searchTab === "rb" ? "active" : ""}" data-content-search="rb">RB</button>
        <button class="content-tab ${searchTab === "notes" ? "active" : ""}" data-content-search="notes">研究ノート</button>
        <button class="content-tab ${searchTab === "labs" ? "active" : ""}" data-content-search="labs">LAB</button>
      </div>
      <p class="discovery-description">RBは気軽な投稿、研究ノートは掘り下げ、LABは整理された完成版です。</p>
      <div class="content-counts"><span class="content-count"><b>${matchedPosts.length}</b> RB</span><span class="content-count"><b>${matchedNotes.length}</b> NOTES</span><span class="content-count"><b>${matchedLabs.length}</b> LAB</span></div>
      <div class="content-panel" data-search-panel="all" ${searchTab !== "all" ? "hidden" : ""}>
        ${group("rb","RB",matchedPosts.length,matchedPosts.length ? `<div class="feed">${matchedPosts.slice(0,5).map(renderPostCard).join("")}</div>` : `<div class="discovery-zero">一致するRBはありません</div>`)}
        ${group("notes","研究ノート",matchedNotes.length,matchedNotes.length ? renderNoteCards(matchedNotes.slice(0,5)) : `<div class="discovery-zero">一致する研究ノートはありません</div>`)}
        ${group("labs","LAB",matchedLabs.length,matchedLabs.length ? `<div class="lab-grid">${matchedLabs.slice(0,5).map(renderLabCard).join("")}</div>` : `<div class="discovery-zero">一致するLABはありません</div>`)}
      </div>
      <div class="content-panel" data-search-panel="rb" ${searchTab !== "rb" ? "hidden" : ""}>${matchedPosts.length ? `<div class="feed">${matchedPosts.map(renderPostCard).join("")}</div>` : renderEmpty("一致するRBはありません", "検索語を短くするか、タグを解除してください。")}</div>
      <div class="content-panel" data-search-panel="notes" ${searchTab !== "notes" ? "hidden" : ""}>${renderNoteCards(matchedNotes)}</div>
      <div class="content-panel" data-search-panel="labs" ${searchTab !== "labs" ? "hidden" : ""}>${matchedLabs.length ? `<div class="lab-grid">${matchedLabs.map(renderLabCard).join("")}</div>` : renderEmpty("一致するLABはありません", "別のキーワードを試してください。")}</div>
    </section>`);
  }

  function enhance() {
    scheduled = false;
    const root = document.querySelector("#app");
    if (!root) return;
    renderProfileTabs(root);
    renderSearchTabs(root);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(enhance);
  }

  document.addEventListener("click", (event) => {
    const profile = event.target.closest("[data-content-profile]");
    if (profile) {
      profileTab = profile.dataset.contentProfile;
      document.querySelectorAll("[data-content-profile]").forEach((button) => button.classList.toggle("active", button === profile));
      document.querySelectorAll("[data-profile-panel]").forEach((panel) => { panel.hidden = panel.dataset.profilePanel !== profileTab; });
      return;
    }
    const search = event.target.closest("[data-content-search]");
    if (search) {
      searchTab = search.dataset.contentSearch;
      document.querySelectorAll("[data-content-search]").forEach((button) => button.classList.toggle("active", button === search));
      document.querySelectorAll("[data-search-panel]").forEach((panel) => { panel.hidden = panel.dataset.searchPanel !== searchTab; });
    }
  });

  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", schedule, { once: true });
})();