"use strict";

const STORAGE_KEY = "gamelab.sig.alpha.v2";
const APP_VERSION = 2;

const GAME_META = {
  APEX: { label: "APEX", initial: "A", subtitle: "Battle Royale / Competitive" },
  VALORANT: { label: "VALORANT", initial: "V", subtitle: "Tactical FPS" },
  LOL: { label: "League of Legends", initial: "L", subtitle: "MOBA / Competitive" }
};

const STATUS_META = {
  hypothesis: { label: "仮説", className: "" },
  open: { label: "検証募集", className: "open" },
  verified: { label: "検証済み", className: "verified" }
};

const seedState = () => ({
  version: APP_VERSION,
  currentGame: "APEX",
  profile: {
    name: "Sui",
    role: "IGL / Researcher",
    avatar: "S",
    bio: "Apex Master。戦闘とマクロ判断を分けて考える人。gamelab.sig test researcher。"
  },
  posts: [
    {
      id: "p-apex-01",
      game: "APEX",
      author: "Sui",
      role: "IGL",
      avatar: "S",
      text: "PAD勢が近距離で負ける場面は、入力遅延よりもピークの開始タイミングに差が出ている説。録画を0.25倍で比較したい。",
      tags: ["PAD", "近距離", "ピーク"],
      status: "open",
      createdAt: Date.now() - 1000 * 60 * 48,
      goodBase: 91,
      liked: false,
      saved: false,
      comments: [
        { id: "c1", author: "Apex Analyst", text: "遮蔽から体が出るフレームと射撃開始を分けて測ると比較しやすそうです。", createdAt: Date.now() - 1000 * 60 * 32 }
      ]
    },
    {
      id: "p-apex-02",
      game: "APEX",
      author: "Apex Analyst",
      role: "Analyst",
      avatar: "A",
      text: "終盤安置はリング単体ではなく、残存チームの分布と進行可能ルートから逆算した方が再現率が高い。ALGSの20試合で分類中。",
      tags: ["Zone", "Macro", "ALGS"],
      status: "verified",
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
      goodBase: 142,
      liked: false,
      saved: false,
      comments: [
        { id: "c2", author: "DataLab", text: "ランドマーク別の移動開始時刻も入ると面白いです。", createdAt: Date.now() - 1000 * 60 * 60 * 2 }
      ]
    },
    {
      id: "p-apex-03",
      game: "APEX",
      author: "FrameLab",
      role: "Mechanics",
      avatar: "F",
      text: "同じ武器構成でも、初弾を撃つ前の視点移動量が大きいほどワンマガ率が落ちる。感度ではなく視線の置き場所が主因かもしれない。",
      tags: ["Aim", "視点", "検証"],
      status: "hypothesis",
      createdAt: Date.now() - 1000 * 60 * 60 * 13,
      goodBase: 67,
      liked: false,
      saved: false,
      comments: []
    },
    {
      id: "p-val-01",
      game: "VALORANT",
      author: "SiteTheory",
      role: "Coach",
      avatar: "T",
      text: "サイト取得率より、設置後10秒時点で残っているユーティリティ数の方がラウンド勝率に強く相関する可能性。",
      tags: ["PostPlant", "Utility", "Data"],
      status: "open",
      createdAt: Date.now() - 1000 * 60 * 60 * 8,
      goodBase: 84,
      liked: false,
      saved: false,
      comments: []
    },
    {
      id: "p-lol-01",
      game: "LOL",
      author: "WaveNote",
      role: "Analyst",
      avatar: "W",
      text: "ドラゴン前の視界差はワード本数より、押しているレーン数でほぼ説明できる。視界を独立した指標として扱わない方が良い説。",
      tags: ["Wave", "Vision", "Macro"],
      status: "hypothesis",
      createdAt: Date.now() - 1000 * 60 * 60 * 19,
      goodBase: 58,
      liked: false,
      saved: false,
      comments: []
    }
  ],
  labs: [
    {
      id: "lab-01",
      game: "APEX",
      title: "IGLの思考を、戦闘とマクロに分解する",
      summary: "意思決定の混線を減らすための観戦・振り返りフレーム。",
      author: "GR Founder",
      reads: 1280,
      body: [
        ["研究対象", "IGLの判断は一つの能力に見えるが、実際には移動計画、情報更新、戦闘開始、撤退判断が短時間に重なっている。まず別の仕事として記録する。"],
        ["記録方法", "試合映像を30秒単位で区切り、その区間の目的、得た情報、選ばなかった選択肢を残す。正解探しではなく、判断材料が足りていたかを見る。"],
        ["検証の入口", "似た局面を10件以上集めると、負けた理由より『同じ条件で繰り返している判断』が見え始める。そこから仮説をRBに切り出す。"]
      ]
    },
    {
      id: "lab-02",
      game: "APEX",
      title: "安置読みをチーム分布から逆算する",
      summary: "リング予測だけに寄らない、終盤ルート研究の下書き。",
      author: "Apex Analyst",
      reads: 856,
      body: [
        ["前提", "最終安置の位置を当てることと、そこへ安全に入ることは別問題。残存チームが通路を塞ぐため、分布の変化を優先して観察する。"],
        ["仮説", "リング収縮前のチーム密度と、ランドマーク由来の進行方向が分かれば、次に混雑する境界を先に推定できる。"],
        ["未検証", "大会環境とランク環境ではチーム密度が違う。データを混ぜず、まずALGSだけで分類する必要がある。"]
      ]
    },
    {
      id: "lab-03",
      game: "VALORANT",
      title: "設置後をユーティリティ残量で見る",
      summary: "人数差だけでは説明できないポストプラントの再分類。",
      author: "SiteTheory",
      reads: 662,
      body: [
        ["問い", "同人数のポストプラントでも勝率が大きく違う理由を、残り時間とユーティリティで分類する。"],
        ["方法", "設置10秒後を基準点にして、攻守それぞれのスモーク、解除妨害、索敵を数える。"],
        ["注意", "エージェント構成ごとに価値が違うので、単純な本数ではなく役割別に扱う。"]
      ]
    }
  ],
  notifications: [
    { id: "n1", type: "good", text: "Apex AnalystがあなたのRBにGOODしました。", createdAt: Date.now() - 1000 * 60 * 18, unread: true },
    { id: "n2", type: "comment", text: "FrameLabが検証条件についてコメントしました。", createdAt: Date.now() - 1000 * 60 * 70, unread: true },
    { id: "n3", type: "system", text: "gamelab.sig テスト版へようこそ。投稿データはこの端末内に保存されます。", createdAt: Date.now() - 1000 * 60 * 60 * 8, unread: false }
  ]
});

let state = loadState();
let ui = {
  page: "home",
  sort: "new",
  statusFilter: "all",
  searchQuery: "",
  searchTag: "",
  profileTab: "posts"
};
let composeTags = [];
let toastTimer = null;

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modalRoot");
const toast = document.querySelector("#toast");

function loadState() {
  const fallback = seedState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== APP_VERSION || !Array.isArray(parsed.posts)) return fallback;
    return parsed;
  } catch (error) {
    console.warn("Failed to load local state", error);
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Failed to save local state", error);
    showToast("端末への保存に失敗しました");
  }
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeId(prefix) {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function relativeTime(timestamp) {
  const seconds = Math.max(1, Math.floor((Date.now() - Number(timestamp)) / 1000));
  if (seconds < 60) return "今";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}

function compactNumber(number) {
  return new Intl.NumberFormat("ja-JP", { notation: "compact", maximumFractionDigits: 1 }).format(number);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1900);
}

function currentGame() {
  return GAME_META[state.currentGame] || GAME_META.APEX;
}

function syncChrome() {
  const meta = currentGame();
  document.querySelector("#gameInitial").textContent = meta.initial;
  document.querySelector("#gameName").textContent = meta.label === "League of Legends" ? "LoL" : meta.label;
  document.querySelector("#headerAvatar").textContent = state.profile.avatar;
  const unread = state.notifications.some((item) => item.unread);
  document.querySelector("#noticeDot").hidden = !unread;
  document.querySelectorAll(".nav-item[data-route]").forEach((button) => {
    button.classList.toggle("active", button.dataset.route === ui.page);
  });
}

function setPage(page, options = {}) {
  ui.page = page;
  if (options.tag) ui.searchTag = options.tag;
  closeModal();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
  requestAnimationFrame(() => app.focus({ preventScroll: true }));
}

function render() {
  syncChrome();
  const views = {
    home: renderHome,
    rb: renderRB,
    search: renderSearch,
    notice: renderNotice,
    profile: renderProfile,
    labs: renderLabs
  };
  app.innerHTML = (views[ui.page] || renderHome)();
  bindDynamicInputs();
}

function renderAlphaBanner() {
  return `<div class="alpha-banner"><strong>ALPHA TEST</strong><span>ログイン・共有DB・課金は未実装です。投稿、GOOD、保存、コメントはこの端末のブラウザ内だけに保存されます。</span></div>`;
}

function renderHome() {
  const gamePosts = state.posts.filter((post) => post.game === state.currentGame).slice().sort((a, b) => b.createdAt - a.createdAt);
  const gameLabs = state.labs.filter((lab) => lab.game === state.currentGame);
  const tags = getTrendingTags(gamePosts).slice(0, 8);
  return `
    <section class="page">
      ${renderAlphaBanner()}
      <section class="hero">
        <div class="hero-content">
          <p class="hero-kicker">${escapeHTML(currentGame().subtitle)}</p>
          <h1>攻略ではなく、<br><span>研究する。</span></h1>
          <p class="hero-desc">小さな気づきをRBへ。条件と反証を重ね、まとまった知見をLABへ。競技ゲームの「なぜ」を共有する。</p>
          <div class="hero-actions">
            <button class="primary-button" type="button" data-route="rb">RBを見る</button>
            <button class="secondary-button" type="button" data-route="labs">LABを見る</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Quick Access</h2></div>
        <div class="quick-grid">
          ${quickCard("#", "RB", "RESEARCH BOARD", "rb")}
          ${quickCard("▱", "LAB", "LONG FORM", "labs")}
          ${quickCard("⌕", "検索", "FIND RESEARCH", "search")}
          ${quickCard("＋", "投稿", "NEW HYPOTHESIS", "compose")}
          ${quickCard("◇", "通知", "ACTIVITY", "notice")}
          ${quickCard("S", "Profile", "YOUR LOG", "profile")}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Featured LAB</h2><button class="link-button" data-route="labs">すべて見る</button></div>
        ${gameLabs.length ? `<div class="lab-grid">${gameLabs.slice(0, 3).map(renderLabCard).join("")}</div>` : renderEmpty("このゲームのLABはまだありません", "RBから研究を育てていく段階です。")}
      </section>

      <section class="section">
        <div class="section-head"><h2>Trending Tags</h2></div>
        <div class="tag-cloud">${tags.map(({ tag, count }) => `<button class="tag-chip" type="button" data-tag="${escapeHTML(tag)}">#${escapeHTML(tag)} <span>${count}</span></button>`).join("")}</div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Latest Research</h2><button class="link-button" data-route="rb">すべて見る</button></div>
        ${gamePosts.length ? `<div class="feed">${gamePosts.slice(0, 3).map(renderPostCard).join("")}</div>` : renderEmpty("投稿はまだありません", "最初の仮説を書いてみよう。フ")}
      </section>
    </section>`;
}

function quickCard(icon, title, subtitle, route) {
  const action = route === "compose" ? `data-action="compose"` : `data-route="${route}"`;
  return `<button class="quick-card" type="button" ${action}><span class="quick-icon">${icon}</span><span><b>${title}</b><small>${subtitle}</small></span></button>`;
}

function renderRB() {
  let posts = state.posts.filter((post) => post.game === state.currentGame);
  if (ui.statusFilter !== "all") posts = posts.filter((post) => post.status === ui.statusFilter);
  posts = posts.slice().sort((a, b) => ui.sort === "good" ? postGoodCount(b) - postGoodCount(a) : b.createdAt - a.createdAt);
  return `
    <section class="page">
      <header class="page-head">
        <div><span class="eyebrow">RESEARCH BOARD</span><h1>RB</h1><p>200文字から始まる、競技研究フィード。</p></div>
        <button class="small-button" type="button" data-action="compose">＋ 投稿</button>
      </header>
      ${renderAlphaBanner()}
      <div class="toolbar">
        <button class="filter-chip ${ui.sort === "new" ? "active" : ""}" data-sort="new">新着</button>
        <button class="filter-chip ${ui.sort === "good" ? "active" : ""}" data-sort="good">GOOD順</button>
        <button class="filter-chip ${ui.statusFilter === "all" ? "active" : ""}" data-status-filter="all">すべて</button>
        <button class="filter-chip ${ui.statusFilter === "hypothesis" ? "active" : ""}" data-status-filter="hypothesis">仮説</button>
        <button class="filter-chip ${ui.statusFilter === "open" ? "active" : ""}" data-status-filter="open">検証募集</button>
        <button class="filter-chip ${ui.statusFilter === "verified" ? "active" : ""}" data-status-filter="verified">検証済み</button>
      </div>
      <section class="section">
        ${posts.length ? `<div class="feed">${posts.map(renderPostCard).join("")}</div>` : renderEmpty("条件に合うRBがありません", "フィルターを変えるか、新しい仮説を投稿してください。")}
      </section>
    </section>`;
}

function postGoodCount(post) {
  return Number(post.goodBase || 0) + (post.liked ? 1 : 0);
}

function renderPostCard(post) {
  const status = STATUS_META[post.status] || STATUS_META.hypothesis;
  const comments = Array.isArray(post.comments) ? post.comments.length : 0;
  return `
    <article class="post-card" data-post-card="${escapeHTML(post.id)}">
      <div class="post-top">
        <div class="user-line">
          <span class="user-avatar">${escapeHTML(post.avatar || post.author[0])}</span>
          <span class="user-copy"><strong>${escapeHTML(post.author)}</strong><small><span class="game-label">${escapeHTML(GAME_META[post.game]?.label || post.game)}</span>${escapeHTML(post.role)} ・ ${relativeTime(post.createdAt)}</small></span>
        </div>
        <span class="status-badge ${status.className}">${status.label}</span>
      </div>
      <button class="post-text-button" type="button" data-open-post="${escapeHTML(post.id)}"><p class="post-text">${escapeHTML(post.text)}</p></button>
      <div class="post-tags">${post.tags.map((tag) => `<button class="link-button" type="button" data-tag="${escapeHTML(tag)}">#${escapeHTML(tag)}</button>`).join("")}</div>
      <div class="post-actions">
        <button class="action-button ${post.liked ? "active" : ""}" type="button" data-good="${escapeHTML(post.id)}">GOOD ${postGoodCount(post)}</button>
        <button class="action-button" type="button" data-comment="${escapeHTML(post.id)}">コメント ${comments}</button>
        <button class="action-button ${post.saved ? "active" : ""}" type="button" data-save="${escapeHTML(post.id)}">${post.saved ? "保存済み" : "保存"}</button>
      </div>
    </article>`;
}

function renderLabs() {
  const labs = state.labs.filter((lab) => lab.game === state.currentGame);
  return `
    <section class="page">
      <header class="page-head"><div><span class="eyebrow">LONG FORM RESEARCH</span><h1>LAB</h1><p>RBで育った仮説を、読み返せる知見へ。</p></div></header>
      ${renderAlphaBanner()}
      <section class="section">
        ${labs.length ? `<div class="lab-grid">${labs.map(renderLabCard).join("")}</div>` : renderEmpty("このゲームのLABはまだありません", "テスト版ではサンプルを順次追加します。")}
      </section>
    </section>`;
}

function renderLabCard(lab) {
  return `<button class="lab-card" type="button" data-open-lab="${escapeHTML(lab.id)}"><div class="lab-visual"><span>LAB / ${escapeHTML(lab.game)}</span></div><div class="lab-body"><h3>${escapeHTML(lab.title)}</h3><p>${escapeHTML(lab.summary)}</p><div class="lab-meta"><span>${escapeHTML(lab.author)}</span><span>${compactNumber(lab.reads)} READ</span></div></div></button>`;
}

function renderSearch() {
  const query = ui.searchQuery.trim().toLowerCase();
  const tag = ui.searchTag;
  const allPosts = state.posts.slice().sort((a, b) => b.createdAt - a.createdAt);
  const allLabs = state.labs.slice();
  const matchesPost = (post) => {
    const haystack = [post.text, post.author, post.role, post.game, ...post.tags].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && (!tag || post.tags.some((item) => item.toLowerCase() === tag.toLowerCase()));
  };
  const matchesLab = (lab) => {
    const haystack = [lab.title, lab.summary, lab.author, lab.game].join(" ").toLowerCase();
    return (!query || haystack.includes(query)) && !tag;
  };
  const posts = allPosts.filter(matchesPost);
  const labs = allLabs.filter(matchesLab);
  const tags = getTrendingTags(state.posts).slice(0, 14);
  return `
    <section class="page">
      <header class="page-head"><div><span class="eyebrow">DISCOVERY</span><h1>検索</h1><p>ゲームをまたいで、仮説・タグ・LABを探す。</p></div></header>
      <div class="search-box"><input id="searchInput" type="search" value="${escapeHTML(ui.searchQuery)}" placeholder="例：安置、IGL、Utility" autocomplete="off"><span>⌕</span></div>
      <div class="toolbar">
        ${ui.searchTag ? `<button class="filter-chip active" data-clear-tag>#${escapeHTML(ui.searchTag)} ×</button>` : ""}
        ${tags.map(({ tag: item }) => `<button class="filter-chip ${item === ui.searchTag ? "active" : ""}" data-search-tag="${escapeHTML(item)}">#${escapeHTML(item)}</button>`).join("")}
      </div>
      <p class="result-label">RB / ${posts.length} RESULTS</p>
      <section class="section">${posts.length ? `<div class="feed">${posts.map(renderPostCard).join("")}</div>` : renderEmpty("一致するRBがありません", "言葉を短くするか、タグを解除してください。")}</section>
      ${!tag ? `<p class="result-label">LAB / ${labs.length} RESULTS</p><section class="section">${labs.length ? `<div class="lab-grid">${labs.map(renderLabCard).join("")}</div>` : renderEmpty("一致するLABがありません", "別のキーワードを試してください。")}</section>` : ""}
    </section>`;
}

function renderNotice() {
  const notifications = state.notifications.slice().sort((a, b) => b.createdAt - a.createdAt);
  return `
    <section class="page">
      <header class="page-head"><div><span class="eyebrow">ACTIVITY</span><h1>通知</h1><p>GOOD、コメント、テスト版のお知らせ。</p></div><button class="small-button" type="button" data-mark-read>すべて既読</button></header>
      <div class="notification-list">
        ${notifications.length ? notifications.map(renderNotification).join("") : renderEmpty("通知はありません", "反応が届くとここに表示されます。")}
      </div>
    </section>`;
}

function renderNotification(item) {
  const icons = { good: "＋", comment: "▱", system: "i" };
  return `<article class="notification ${item.unread ? "unread" : ""}"><span class="notification-icon">${icons[item.type] || "◇"}</span><div><p>${escapeHTML(item.text)}</p><small>${relativeTime(item.createdAt)}</small></div></article>`;
}

function renderProfile() {
  const ownPosts = state.posts.filter((post) => post.author === state.profile.name).slice().sort((a, b) => b.createdAt - a.createdAt);
  const saved = state.posts.filter((post) => post.saved).slice().sort((a, b) => b.createdAt - a.createdAt);
  const visible = ui.profileTab === "saved" ? saved : ownPosts;
  const goodTotal = ownPosts.reduce((sum, post) => sum + postGoodCount(post), 0);
  return `
    <section class="page">
      <div class="profile-cover">
        <div class="profile-avatar">${escapeHTML(state.profile.avatar)}</div>
        <h1>${escapeHTML(state.profile.name)}</h1>
        <p class="profile-role">${escapeHTML(state.profile.role)}</p>
        <p class="profile-bio">${escapeHTML(state.profile.bio)}</p>
        <div class="profile-stats">
          <div class="profile-stat"><strong>${ownPosts.length}</strong><small>RB</small></div>
          <div class="profile-stat"><strong>${goodTotal}</strong><small>GOOD</small></div>
          <div class="profile-stat"><strong>${saved.length}</strong><small>SAVED</small></div>
        </div>
      </div>
      <div class="toolbar">
        <button class="filter-chip ${ui.profileTab === "posts" ? "active" : ""}" data-profile-tab="posts">自分のRB</button>
        <button class="filter-chip ${ui.profileTab === "saved" ? "active" : ""}" data-profile-tab="saved">保存</button>
      </div>
      <section class="section">${visible.length ? `<div class="feed">${visible.map(renderPostCard).join("")}</div>` : renderEmpty(ui.profileTab === "saved" ? "保存したRBはありません" : "自分のRBはありません", "フィードから研究を残してみよう。")}</section>
      <div class="settings-card"><h3>テストデータ</h3><p>この端末内の投稿、GOOD、保存、コメントを初期状態へ戻します。他の利用者には影響しません。</p><button class="danger-button" type="button" data-reset>端末内データをリセット</button></div>
    </section>`;
}

function renderEmpty(title, description) {
  return `<div class="empty-state"><b>${escapeHTML(title)}</b><span>${escapeHTML(description)}</span></div>`;
}

function getTrendingTags(posts) {
  const counts = new Map();
  posts.forEach((post) => post.tags.forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1)));
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function bindDynamicInputs() {
  const searchInput = document.querySelector("#searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      ui.searchQuery = event.target.value;
      debounceRenderSearch();
    });
  }
}

let searchTimer = null;
function debounceRenderSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (ui.page !== "search") return;
    const position = document.querySelector("#searchInput")?.selectionStart ?? ui.searchQuery.length;
    render();
    const input = document.querySelector("#searchInput");
    input?.focus();
    input?.setSelectionRange(position, position);
  }, 140);
}

function openCompose() {
  composeTags = [];
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="composeTitle" data-modal-panel>
        <div class="modal-head"><div><h2 id="composeTitle">RBを投稿</h2><p class="modal-sub">答えではなくてもいい。条件が分かる仮説を残す。</p></div><button class="icon-button" type="button" data-close-modal aria-label="閉じる">×</button></div>
        <div class="form-group"><label class="form-label" for="composeText">RESEARCH NOTE / 200</label><textarea id="composeText" class="compose-textarea" maxlength="200" placeholder="観察したこと、仮説、検証したい条件を書く..."></textarea><div id="composeCounter" class="counter">0 / 200</div></div>
        <div class="form-group"><span class="form-label">STATUS</span><div class="status-options">
          <label class="status-option"><input type="radio" name="composeStatus" value="hypothesis" checked><span>仮説</span></label>
          <label class="status-option"><input type="radio" name="composeStatus" value="open"><span>検証募集</span></label>
          <label class="status-option"><input type="radio" name="composeStatus" value="verified"><span>検証済み</span></label>
        </div></div>
        <div class="form-group"><label class="form-label" for="composeTags">TAGS / 最大5個</label><input id="composeTags" class="tag-input" placeholder="例：IGL, Macro, 安置"><div class="suggested-tags">${getTrendingTags(state.posts.filter((post) => post.game === state.currentGame)).slice(0, 8).map(({ tag }) => `<button class="tag-chip" type="button" data-compose-tag="${escapeHTML(tag)}">#${escapeHTML(tag)}</button>`).join("")}</div></div>
        <div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>キャンセル</button><button class="primary-button" type="button" data-submit-post>投稿する</button></div>
      </section>
    </div>`;
  document.querySelector("#composeText").focus();
  document.querySelector("#composeText").addEventListener("input", (event) => {
    document.querySelector("#composeCounter").textContent = `${event.target.value.length} / 200`;
  });
}

function submitPost() {
  const text = document.querySelector("#composeText")?.value.trim() || "";
  const typed = document.querySelector("#composeTags")?.value || "";
  const status = document.querySelector('input[name="composeStatus"]:checked')?.value || "hypothesis";
  const typedTags = typed.split(/[、,\s#]+/).map((tag) => tag.trim()).filter(Boolean);
  const tags = [...new Set([...composeTags, ...typedTags])].slice(0, 5);
  if (!text) return showToast("投稿内容を入力してください");
  if (text.length > 200) return showToast("200文字以内にしてください");
  const post = {
    id: makeId("post"),
    game: state.currentGame,
    author: state.profile.name,
    role: state.profile.role.split("/")[0].trim(),
    avatar: state.profile.avatar,
    text,
    tags: tags.length ? tags : [state.currentGame, "研究"],
    status,
    createdAt: Date.now(),
    goodBase: 0,
    liked: false,
    saved: false,
    comments: []
  };
  state.posts.unshift(post);
  state.notifications.unshift({ id: makeId("notice"), type: "system", text: "RBを端末内に保存しました。共有DBはまだ接続されていません。", createdAt: Date.now(), unread: true });
  saveState();
  closeModal();
  ui.page = "rb";
  render();
  showToast("RBを投稿しました（端末内保存）");
}

function openGamePicker() {
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="gameTitle" data-modal-panel>
        <div class="modal-head"><div><h2 id="gameTitle">ゲームを切り替える</h2><p class="modal-sub">タイトルごとにRBとLABを分けて表示します。</p></div><button class="icon-button" type="button" data-close-modal>×</button></div>
        <div class="game-list">${Object.entries(GAME_META).map(([key, meta]) => `<button class="game-choice ${key === state.currentGame ? "active" : ""}" type="button" data-game="${key}"><span class="game-initial">${meta.initial}</span><span><b>${escapeHTML(meta.label)}</b><small>${escapeHTML(meta.subtitle)}</small></span></button>`).join("")}</div>
      </section>
    </div>`;
}

function openPost(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  const status = STATUS_META[post.status] || STATUS_META.hypothesis;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="postTitle" data-modal-panel>
        <div class="modal-head"><div><h2 id="postTitle">RB Detail</h2><p class="modal-sub">${escapeHTML(GAME_META[post.game]?.label || post.game)} ・ ${relativeTime(post.createdAt)}</p></div><button class="icon-button" type="button" data-close-modal>×</button></div>
        <article class="post-card" style="margin-top:15px">
          <div class="post-top"><div class="user-line"><span class="user-avatar">${escapeHTML(post.avatar)}</span><span class="user-copy"><strong>${escapeHTML(post.author)}</strong><small>${escapeHTML(post.role)}</small></span></div><span class="status-badge ${status.className}">${status.label}</span></div>
          <p class="post-text">${escapeHTML(post.text)}</p>
          <div class="post-tags">${post.tags.map((tag) => `<span>#${escapeHTML(tag)}</span>`).join("")}</div>
          <div class="post-actions"><button class="action-button ${post.liked ? "active" : ""}" data-good="${escapeHTML(post.id)}">GOOD ${postGoodCount(post)}</button><button class="action-button" data-comment="${escapeHTML(post.id)}">コメント ${post.comments.length}</button><button class="action-button ${post.saved ? "active" : ""}" data-save="${escapeHTML(post.id)}">${post.saved ? "保存済み" : "保存"}</button></div>
        </article>
      </section>
    </div>`;
}

function openComments(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="commentTitle" data-modal-panel>
        <div class="modal-head"><div><h2 id="commentTitle">コメント</h2><p class="modal-sub">反証、条件追加、再現報告を残す。</p></div><button class="icon-button" type="button" data-close-modal>×</button></div>
        <article class="post-card" style="margin-top:15px"><div class="user-copy"><strong>${escapeHTML(post.author)}</strong><small>${escapeHTML(GAME_META[post.game]?.label || post.game)}</small></div><p class="post-text">${escapeHTML(post.text)}</p></article>
        <div class="comment-list">${post.comments.length ? post.comments.map((comment) => `<article class="comment"><strong>${escapeHTML(comment.author)}</strong><p>${escapeHTML(comment.text)}</p><small>${relativeTime(comment.createdAt)}</small></article>`).join("") : `<div class="empty-state"><b>まだコメントはありません</b><span>最初の検証条件を書いてみよう。</span></div>`}</div>
        <div class="form-group"><label class="form-label" for="commentText">NEW COMMENT</label><textarea id="commentText" class="comment-input" maxlength="300" placeholder="反証、追加条件、再現結果など..."></textarea></div>
        <div class="modal-actions"><button class="primary-button" type="button" data-submit-comment="${escapeHTML(post.id)}">コメントする</button></div>
      </section>
    </div>`;
  document.querySelector("#commentText").focus();
}

function submitComment(postId) {
  const post = state.posts.find((item) => item.id === postId);
  const text = document.querySelector("#commentText")?.value.trim() || "";
  if (!post || !text) return showToast("コメントを入力してください");
  post.comments.push({ id: makeId("comment"), author: state.profile.name, text, createdAt: Date.now() });
  state.notifications.unshift({ id: makeId("notice"), type: "comment", text: `「${post.text.slice(0, 28)}…」にコメントを追加しました。`, createdAt: Date.now(), unread: true });
  saveState();
  openComments(postId);
  syncChrome();
  showToast("コメントを追加しました");
}

function openLab(labId) {
  const lab = state.labs.find((item) => item.id === labId);
  if (!lab) return;
  lab.reads += 1;
  saveState();
  app.innerHTML = `
    <article class="page article">
      <button class="back-button" type="button" data-route="${ui.page === "home" ? "home" : "labs"}">← LAB一覧へ</button>
      <header class="article-hero"><div><span class="eyebrow">LAB / ${escapeHTML(lab.game)}</span><h1>${escapeHTML(lab.title)}</h1><p class="hero-desc">${escapeHTML(lab.summary)}</p></div></header>
      <div class="article-content"><p><strong>${escapeHTML(lab.author)}</strong> ・ ${compactNumber(lab.reads)} READ</p>${lab.body.map(([heading, paragraph]) => `<h2>${escapeHTML(heading)}</h2><p>${escapeHTML(paragraph)}</p>`).join("")}</div>
    </article>`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleGood(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  if (post.liked) state.notifications.unshift({ id: makeId("notice"), type: "good", text: `「${post.text.slice(0, 28)}…」にGOODしました。`, createdAt: Date.now(), unread: true });
  saveState();
  if (modalRoot.innerHTML) openPost(postId); else render();
  showToast(post.liked ? "GOODしました" : "GOODを取り消しました");
}

function toggleSave(postId) {
  const post = state.posts.find((item) => item.id === postId);
  if (!post) return;
  post.saved = !post.saved;
  saveState();
  if (modalRoot.innerHTML) openPost(postId); else render();
  showToast(post.saved ? "RBを保存しました" : "保存を解除しました");
}

function closeModal() {
  modalRoot.innerHTML = "";
}

function resetState() {
  if (!confirm("この端末内のG-labテストデータを初期化しますか？")) return;
  state = seedState();
  ui = { page: "home", sort: "new", statusFilter: "all", searchQuery: "", searchTag: "", profileTab: "posts" };
  saveState();
  render();
  showToast("テストデータを初期化しました");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;

  if (target.dataset.route) return setPage(target.dataset.route);
  if (target.dataset.action === "compose" || target.id === "composeButton") return openCompose();
  if (target.id === "gameButton") return openGamePicker();
  if (target.hasAttribute("data-close-modal")) return closeModal();
  if (target.dataset.game) {
    state.currentGame = target.dataset.game;
    saveState();
    closeModal();
    render();
    return showToast(`${GAME_META[state.currentGame].label}へ切り替えました`);
  }
  if (target.dataset.sort) { ui.sort = target.dataset.sort; return render(); }
  if (target.dataset.statusFilter) { ui.statusFilter = target.dataset.statusFilter; return render(); }
  if (target.dataset.good) return toggleGood(target.dataset.good);
  if (target.dataset.save) return toggleSave(target.dataset.save);
  if (target.dataset.comment) return openComments(target.dataset.comment);
  if (target.dataset.openPost) return openPost(target.dataset.openPost);
  if (target.dataset.openLab) return openLab(target.dataset.openLab);
  if (target.dataset.submitComment) return submitComment(target.dataset.submitComment);
  if (target.hasAttribute("data-submit-post")) return submitPost();
  if (target.dataset.tag) { ui.searchTag = target.dataset.tag; ui.searchQuery = ""; return setPage("search"); }
  if (target.dataset.searchTag) { ui.searchTag = target.dataset.searchTag; return render(); }
  if (target.hasAttribute("data-clear-tag")) { ui.searchTag = ""; return render(); }
  if (target.dataset.composeTag) {
    const tag = target.dataset.composeTag;
    composeTags = composeTags.includes(tag) ? composeTags.filter((item) => item !== tag) : [...composeTags, tag].slice(0, 5);
    target.classList.toggle("active", composeTags.includes(tag));
    return;
  }
  if (target.hasAttribute("data-mark-read")) {
    state.notifications.forEach((item) => { item.unread = false; });
    saveState();
    render();
    return showToast("すべて既読にしました");
  }
  if (target.dataset.profileTab) { ui.profileTab = target.dataset.profileTab; return render(); }
  if (target.hasAttribute("data-reset")) return resetState();
});

modalRoot.addEventListener("click", (event) => {
  if (event.target.classList.contains("modal-backdrop")) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

render();
console.log("gamelab.sig alpha ready", { version: APP_VERSION, posts: state.posts.length });
