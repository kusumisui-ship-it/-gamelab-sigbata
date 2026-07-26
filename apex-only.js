"use strict";

(function lockPrototypeToApex() {
  const APEX = "APEX";

  function enforceApex() {
    if (typeof state !== "undefined") {
      state.currentGame = APEX;
      if (Array.isArray(state.posts)) state.posts = state.posts.filter((post) => post.game === APEX);
      if (Array.isArray(state.labs)) state.labs = state.labs.filter((lab) => lab.game === APEX);
      if (typeof saveState === "function") saveState();
    }

    const gameButton = document.querySelector("#gameButton");
    if (gameButton) {
      gameButton.disabled = true;
      gameButton.setAttribute("aria-label", "対応ゲーム：Apex Legends");
      gameButton.title = "初期リリースはApex Legends専用です";
      gameButton.querySelector("[aria-hidden='true']:last-child")?.remove();
    }

    document.querySelector("#gameInitial")?.replaceChildren(document.createTextNode("A"));
    document.querySelector("#gameName")?.replaceChildren(document.createTextNode("APEX"));
    document.documentElement.dataset.game = APEX;
  }

  if (typeof openGamePicker === "function") {
    openGamePicker = function apexOnlyPicker() {
      if (typeof showToast === "function") showToast("初期リリースはApex Legends専用です");
    };
  }

  document.addEventListener("DOMContentLoaded", enforceApex, { once: true });
  requestAnimationFrame(enforceApex);
})();
