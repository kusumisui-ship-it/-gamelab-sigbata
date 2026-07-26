"use strict";

(function initDraftRecovery() {
  const DRAFT_KEY = "gamelab.sig.note-draft.v1";
  const SAVE_DELAY = 700;
  let timer = null;
  let lastSignature = "";

  function imageSummary() {
    const blocks = document.querySelectorAll("[data-edit-note-image]");
    return Array.from(blocks, (button) => Number(button.dataset.editNoteImage)).filter(Number.isFinite);
  }

  function readEditorDraft() {
    const title = document.querySelector("#noteTitle");
    const summary = document.querySelector("#noteSummary");
    const body = document.querySelector("#noteBody");
    if (!title || !summary || !body) return null;
    return {
      title: title.value,
      summary: summary.value,
      body: body.value,
      imageIndexes: imageSummary(),
      savedAt: Date.now()
    };
  }

  function storeDraft() {
    const value = readEditorDraft();
    if (!value) return;
    const signature = JSON.stringify([value.title, value.summary, value.body, value.imageIndexes]);
    if (signature === lastSignature) return;
    lastSignature = signature;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    updateIndicator("自動保存済み", value.savedAt);
  }

  function scheduleSave() {
    updateIndicator("保存中…");
    clearTimeout(timer);
    timer = setTimeout(storeDraft, SAVE_DELAY);
  }

  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null"); }
    catch { return null; }
  }

  function clearDraft() {
    clearTimeout(timer);
    localStorage.removeItem(DRAFT_KEY);
    lastSignature = "";
  }

  function updateIndicator(label, timestamp = 0) {
    const indicator = document.querySelector("#noteAutosaveStatus");
    if (!indicator) return;
    indicator.textContent = timestamp
      ? `${label} ${new Date(timestamp).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}`
      : label;
  }

  function injectIndicator() {
    const editor = document.querySelector("#noteTitle")?.closest(".modal-panel");
    if (!editor || editor.querySelector("#noteAutosaveStatus")) return;
    const head = editor.querySelector(".modal-head");
    head?.insertAdjacentHTML("afterend", `<div class="note-autosave-bar"><span id="noteAutosaveStatus">端末内の復元用下書き</span><button type="button" data-discard-recovery>破棄</button></div>`);

    const recovered = loadDraft();
    if (!recovered || (!recovered.title && !recovered.summary && !recovered.body)) return;
    editor.insertAdjacentHTML("afterbegin", `<aside class="draft-recovery-card"><div><strong>保存前の下書きがあります</strong><small>${new Date(recovered.savedAt).toLocaleString("ja-JP")}</small></div><div><button type="button" data-restore-recovery>復元</button><button type="button" data-discard-recovery>破棄</button></div></aside>`);
  }

  function restoreDraft() {
    const recovered = loadDraft();
    if (!recovered) return;
    const title = document.querySelector("#noteTitle");
    const summary = document.querySelector("#noteSummary");
    const body = document.querySelector("#noteBody");
    if (!title || !summary || !body) return;
    title.value = recovered.title || "";
    summary.value = recovered.summary || "";
    body.value = recovered.body || "";
    lastSignature = "";
    scheduleSave();
    document.querySelector(".draft-recovery-card")?.remove();
    globalThis.showToast?.("下書きを復元しました");
  }

  const observer = new MutationObserver(() => injectIndicator());
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("input", (event) => {
    if (["noteTitle", "noteSummary", "noteBody"].includes(event.target?.id)) scheduleSave();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-restore-recovery")) return restoreDraft();
    if (button.hasAttribute("data-discard-recovery")) {
      clearDraft();
      document.querySelector(".draft-recovery-card")?.remove();
      updateIndicator("復元用下書きを破棄しました");
      return;
    }
    if (button.hasAttribute("data-save-note")) {
      setTimeout(() => {
        clearDraft();
        updateIndicator("Version保存済み");
      }, 0);
    }
  }, true);

  window.addEventListener("pagehide", storeDraft);
  globalThis.GDraftRecovery = { storeDraft, loadDraft, clearDraft };
})();
