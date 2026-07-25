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

  function enhanceCurrentView() {
    applyPrefs();
    injectTopControls();
    injectSocialTabs();
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
      <div class="ui-settings" data-ui-close>
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

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button?.hasAttribute("data-ui-settings")) return openSettings();

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

    if (event.target.closest("[data-ui-close]")) {
      event.target.closest(".ui-settings")?.remove();
    }
  });

  const gameButton = document.querySelector("#gameButton");
  gameButton?.addEventListener("click", () => requestAnimationFrame(applyPrefs));

  applyPrefs();
  enhanceCurrentView();
})();
