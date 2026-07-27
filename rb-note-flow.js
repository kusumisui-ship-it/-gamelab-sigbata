"use strict";

(function initRbNoteFlow() {
  function posts() {
    return (globalThis.state?.posts || []).filter((post) => post.game === "APEX");
  }

  function short(text, max = 72) {
    const value = String(text || "").replace(/\s+/g, " ").trim();
    return value.length > max ? `${value.slice(0, max)}…` : value;
  }

  function currentPost() {
    const id = document.querySelector("#noteLinkedPost")?.value || "";
    return posts().find((post) => post.id === id) || null;
  }

  function pickerButtonHtml(post) {
    return `<button type="button" class="rb-source-button" data-open-rb-source-picker>
      <strong>${post ? "元RBを選択中" : "元RBを選ぶ"}</strong>
      <span>${post ? escapeHTML(short(post.text)) : "この研究ノートのきっかけになったRB投稿を選べます"}</span>
      <small>${post ? `${escapeHTML(post.author || "投稿者")} ・ ${relativeTime(post.createdAt)}` : "紐付けなしでも保存できます"}</small>
    </button>`;
  }

  function enhanceEditor() {
    const select = document.querySelector("#noteLinkedPost");
    if (!select || select.dataset.enhanced === "true") return;
    select.dataset.enhanced = "true";
    select.classList.add("rb-source-select");
    const label = select.closest("label");
    if (!label) return;
    label.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("関連RB")) node.textContent = "元RB";
    });
    const wrap = document.createElement("div");
    wrap.className = "rb-source-picker";
    wrap.innerHTML = pickerButtonHtml(currentPost());
    label.appendChild(wrap);
    const helper = label.closest(".note-publish-settings")?.querySelector(":scope > small");
    if (helper) helper.textContent = "元RBは、この研究ノートを書くきっかけになったSNS投稿です。限定公開は一覧や検索には表示されません。";
  }

  function refreshButton() {
    const wrap = document.querySelector(".rb-source-picker");
    if (wrap) wrap.innerHTML = pickerButtonHtml(currentPost());
  }

  function openPicker() {
    document.querySelector(".rb-source-sheet")?.remove();
    const selected = document.querySelector("#noteLinkedPost")?.value || "";
    const sheet = document.createElement("div");
    sheet.className = "rb-source-sheet";
    sheet.innerHTML = `<section class="rb-source-panel" role="dialog" aria-modal="true" aria-label="元RBを選択">
      <header><div><h3>元RBを選ぶ</h3><p>研究のきっかけになった投稿を1件選択します。</p></div><button type="button" class="icon-button" data-close-rb-source>×</button></header>
      <div class="rb-source-list">
        <button type="button" class="rb-source-option ${selected ? "" : "active"}" data-select-rb-source=""><b>紐付けなし</b><span>このノートを単独で保存する</span></button>
        ${posts().map((post) => `<button type="button" class="rb-source-option ${selected === post.id ? "active" : ""}" data-select-rb-source="${post.id}"><b>RB ・ ${escapeHTML(post.author || "投稿者")}</b><span>${escapeHTML(short(post.text, 110))}</span><small>${relativeTime(post.createdAt)} ・ ${escapeHTML((post.tags || []).slice(0, 3).map((tag) => `#${tag}`).join(" "))}</small></button>`).join("")}
      </div>
    </section>`;
    document.body.appendChild(sheet);
  }

  function openRbPreview(id) {
    const post = posts().find((item) => item.id === id);
    if (!post) return showToast("元RBが見つかりません");
    modalRoot.insertAdjacentHTML("beforeend", `<div class="modal-backdrop rb-preview-backdrop"><section class="modal-panel" role="dialog" aria-modal="true"><div class="modal-head"><div><h2>元RB</h2><p class="modal-sub">この研究ノートの出発点になった投稿です。</p></div><button type="button" class="icon-button" data-close-rb-preview>×</button></div><article class="note-reader"><header><div class="note-badges"><span class="note-badge">RB</span><span class="note-badge">${escapeHTML(post.author || "投稿者")}</span></div></header><section class="note-reader-body">${escapeHTML(post.text)}</section><p>${(post.tags || []).map((tag) => `#${escapeHTML(tag)}`).join("　")}</p></article></section></div>`);
  }

  function enhanceReader() {
    document.querySelectorAll(".note-reader .note-card").forEach((card) => {
      if (card.dataset.sourceEnhanced === "true") return;
      const text = card.querySelector("p")?.textContent?.trim();
      if (!text) return;
      const post = posts().find((item) => item.text.trim() === text);
      if (!post) return;
      card.dataset.sourceEnhanced = "true";
      card.className = "note-source-card";
      card.innerHTML = `<button type="button" data-open-source-rb="${post.id}"><small>元RB</small><p>${escapeHTML(short(post.text, 130))}</p></button>`;
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.openRbSourcePicker !== undefined) openPicker();
    if (target.dataset.closeRbSource !== undefined || event.target.classList?.contains("rb-source-sheet")) document.querySelector(".rb-source-sheet")?.remove();
    if (target.dataset.selectRbSource !== undefined) {
      const select = document.querySelector("#noteLinkedPost");
      if (select) select.value = target.dataset.selectRbSource;
      document.querySelector(".rb-source-sheet")?.remove();
      refreshButton();
    }
    if (target.dataset.openSourceRb) openRbPreview(target.dataset.openSourceRb);
    if (target.dataset.closeRbPreview !== undefined) document.querySelector(".rb-preview-backdrop")?.remove();
  }, true);

  const observer = new MutationObserver(() => {
    enhanceEditor();
    enhanceReader();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  document.addEventListener("DOMContentLoaded", () => { enhanceEditor(); enhanceReader(); }, { once: true });
})();