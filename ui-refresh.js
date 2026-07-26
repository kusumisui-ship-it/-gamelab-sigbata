"use strict";

(function initUiRefresh() {
  const UI_KEY = "gamelab.sig.ui.v1";
  const defaults = { theme: "dark", boxView: "grid", socialLayout: "minimal" };

  function readPrefs() {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(UI_KEY) || "{}") }; }
    catch { return { ...defaults }; }
  }

  let prefs = readPrefs();

  function savePrefs() {
    localStorage.setItem(UI_KEY, JSON.stringify(prefs));
  }

  function applyPrefs() {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.dataset.game = state.currentGame;
    document.documentElement.dataset.boxView = prefs.boxView;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", prefs.theme === "light" ? "#ffffff" : "#0b0c0e");
  }

  function injectTopControls() {
    const actions = document.querySelector(".top-actions");
    if (!actions || actions.querySelector(".ui-theme-button")) return;
    const button = document.createElement("button");
    button.className = "ui-theme-button";
    button.type = "button";
    button.dataset.uiSettings = "";
    button.setAttribute("aria-label", "表示設定");
    button.textContent = "◐";
    actions.prepend(button);
  }

  function injectSocialTabs() {
    if (ui.page !== "rb") return;
    const pageHead = app.querySelector(".page-head");
    if (!pageHead || app.querySelector(".rb-social-tabs")) return;
    pageHead.insertAdjacentHTML("afterend", `
      <nav class="rb-social-tabs" aria-label="タイムライン切替">
        <button type="button" class="active">おすすめ</button>
        <button type="button">フォロー中</button>
        <button type="button">ゲーム別</button>
      </nav>`);
  }

  function injectResearchPurpose() {
    if (ui.page !== "rb" || app.querySelector(".research-purpose")) return;
    const tabs = app.querySelector(".rb-social-tabs");
    if (!tabs) return;
    tabs.insertAdjacentHTML("afterend", `
      <aside class="research-purpose">
        <strong>知見が次の知見へつながる順に表示</strong>
        <span>人気だけでなく、検証状況・再現性・投稿者の研究実績を参照します。</span>
      </aside>`);
  }

  function injectBoxSwitch() {
    if (ui.page !== "box") return;
    const head = app.querySelector(".section-head");
    if (!head || head.querySelector(".ui-view-switch")) return;
    head.insertAdjacentHTML("beforeend", `
      <div class="ui-view-switch" aria-label="フォルダ表示切替">
        <button type="button" data-box-layout="list" class="${prefs.boxView === "list" ? "active" : ""}">一覧</button>
        <button type="button" data-box-layout="grid" class="${prefs.boxView === "grid" ? "active" : ""}">グリッド</button>
      </div>`);
  }

  function authorTrust(post) {
    const verified = state.posts.filter((item) => item.author === post.author && item.status === "verified").length;
    const total = state.posts.filter((item) => item.author === post.author).length;
    const commentCount = state.posts
      .flatMap((item) => Array.isArray(item.comments) ? item.comments : [])
      .filter((comment) => comment.author === post.author).length;
    return Math.min(98, 58 + verified * 14 + Math.min(total, 5) * 3 + Math.min(commentCount, 5) * 2);
  }

  function relatedPosts(post) {
    return state.posts
      .filter((item) => item.id !== post.id && item.game === post.game)
      .map((item) => ({
        item,
        overlap: item.tags.filter((tag) => post.tags.some((source) => source.toLowerCase() === tag.toLowerCase())).length
      }))
      .filter(({ overlap }) => overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || postGoodCount(b.item) - postGoodCount(a.item))
      .slice(0, 3)
      .map(({ item }) => item);
  }

  function fundingLabel(post) {
    // Prototype-only example. Funding affects production/visibility, never verification or trust.
    if (post.id !== "p-apex-02") return "";
    return `<span class="funding-label" title="資金提供は調査制作への支援です。評価や検証済み判定は購入できません。">検証協賛・デモ</span>`;
  }

  const basePostCard = renderPostCard;
  renderPostCard = function renderResearchPostCard(post) {
    const html = basePostCard(post);
    const related = relatedPosts(post);
    const trust = authorTrust(post);
    const evidenceLabel = post.status === "verified" ? "複数条件で再現確認" : post.status === "open" ? "追加検証を募集中" : "検証前の仮説";

    return html
      .replace(
        `<span class="status-badge`,
        `${fundingLabel(post)}<span class="status-badge`
      )
      .replace(
        `<button class="post-text-button"`,
        `<div class="research-proof"><span>信頼 ${trust}</span><span>${evidenceLabel}</span></div><button class="post-text-button"`
      )
      .replace(
        `GOOD ${postGoodCount(post)}`,
        `参考になった ${postGoodCount(post)}`
      )
      .replace(
        `</div>\n    </article>`,
        `${related.length ? `<button class="related-research-button" type="button" data-related-post="${escapeHTML(post.id)}">関連研究 ${related.length}件を見る <span>→</span></button>` : ""}</div>\n    </article>`
      );
  };

  function enhanceCurrentView() {
    applyPrefs();
    injectTopControls();
    injectSocialTabs();
    injectResearchPurpose();
    injectBoxSwitch();
  }

  const baseSyncChrome = syncChrome;
  syncChrome = function syncChromeWithTheme() {
    baseSyncChrome();
    applyPrefs();
    injectTopControls();
  };

  const baseRender = render;
  render = function renderWithUiRefresh() {
    baseRender();
    enhanceCurrentView();
  };

  function openSettings() {
    modalRoot.insertAdjacentHTML("beforeend", `
      <div class="ui-settings" data-ui-backdrop>
        <section class="ui-settings-panel" role="dialog" aria-modal="true" aria-labelledby="uiSettingsTitle">
          <h2 id="uiSettingsTitle">表示設定</h2>
          <div class="ui-setting-group">
            <strong>カラー</strong>
            <div class="ui-choice-grid">
              <button type="button" data-ui-theme="light" class="${prefs.theme === "light" ? "active" : ""}">ライト</button>
              <button type="button" data-ui-theme="dark" class="${prefs.theme === "dark" ? "active" : ""}">ダーク</button>
              <button type="button" data-ui-theme="game" class="${prefs.theme === "game" ? "active" : ""}">ゲーム色</button>
            </div>
          </div>
          <div class="ui-setting-group">
            <strong>研究BOX</strong>
            <div class="ui-choice-grid">
              <button type="button" data-box-layout="list" class="${prefs.boxView === "list" ? "active" : ""}">一覧</button>
              <button type="button" data-box-layout="grid" class="${prefs.boxView === "grid" ? "active" : ""}">グリッド</button>
            </div>
          </div>
          <button class="ui-settings-close" type="button" data-ui-close>閉じる</button>
        </section>
      </div>`);
  }

  function openRelated(postId) {
    const source = state.posts.find((post) => post.id === postId);
    if (!source) return;
    const related = relatedPosts(source);
    modalRoot.insertAdjacentHTML("beforeend", `
      <div class="ui-settings related-modal" data-ui-backdrop>
        <section class="ui-settings-panel" role="dialog" aria-modal="true" aria-labelledby="relatedTitle">
          <div class="related-modal-head">
            <div><small>RESEARCH PATH</small><h2 id="relatedTitle">関連研究</h2></div>
            <button type="button" data-ui-close aria-label="閉じる">×</button>
          </div>
          <p class="related-source">「${escapeHTML(source.text.slice(0, 58))}${source.text.length > 58 ? "…" : ""}」から続く研究</p>
          <div class="related-list">
            ${related.length ? related.map((post) => `
              <button type="button" class="related-item" data-open-related-id="${escapeHTML(post.id)}">
                <span><b>${escapeHTML(STATUS_META[post.status]?.label || "仮説")}</b> 信頼 ${authorTrust(post)}</span>
                <strong>${escapeHTML(post.text)}</strong>
                <small>${post.tags.map((tag) => `#${escapeHTML(tag)}`).join(" ")}</small>
              </button>`).join("") : `<p>同じ条件につながる研究はまだありません。</p>`}
          </div>
          <p class="funding-note"><b>表示について</b> 協賛や有料露出は明示されます。資金提供によって信頼値・検証判定・研究評価が上がることはありません。</p>
        </section>
      </div>`);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button?.hasAttribute("data-ui-settings")) return openSettings();

    if (button?.dataset.relatedPost) {
      openRelated(button.dataset.relatedPost);
      return;
    }

    if (button?.dataset.openRelatedId) {
      const id = button.dataset.openRelatedId;
      button.closest(".ui-settings")?.remove();
      openPost(id);
      return;
    }

    if (button?.dataset.uiTheme) {
      prefs.theme = button.dataset.uiTheme;
      savePrefs();
      applyPrefs();
      document.querySelectorAll("[data-ui-theme]").forEach((item) => item.classList.toggle("active", item.dataset.uiTheme === prefs.theme));
      return;
    }

    if (button?.dataset.boxLayout) {
      prefs.boxView = button.dataset.boxLayout;
      savePrefs();
      applyPrefs();
      document.querySelectorAll("[data-box-layout]").forEach((item) => item.classList.toggle("active", item.dataset.boxLayout === prefs.boxView));
      return;
    }

    if (button?.hasAttribute("data-ui-close")) {
      button.closest(".ui-settings")?.remove();
      return;
    }

    if (event.target.hasAttribute("data-ui-backdrop")) {
      event.target.remove();
    }
  });

  const gameButton = document.querySelector("#gameButton");
  gameButton?.addEventListener("click", () => requestAnimationFrame(applyPrefs));

  applyPrefs();
  enhanceCurrentView();
})();