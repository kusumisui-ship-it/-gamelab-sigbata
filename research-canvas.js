"use strict";

(function initResearchCanvas() {
  const NOTE_KEY = "gamelab.sig.notes.v1";
  let draft = freshDraft();
  let activeImageIndex = -1;
  let canvasState = null;

  function freshDraft() {
    return { id: "", title: "", summary: "", body: "", game: state.currentGame, images: [], versions: [] };
  }

  function loadNotes() {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY) || "[]"); }
    catch { return []; }
  }

  function saveNotes(notes) {
    localStorage.setItem(NOTE_KEY, JSON.stringify(notes));
  }

  const baseOpenCompose = openCompose;
  openCompose = function openComposeWithNotes() {
    baseOpenCompose();
    const panel = modalRoot.querySelector(".modal-panel");
    if (!panel) return;
    panel.insertAdjacentHTML("afterbegin", `
      <div class="research-compose-tabs">
        <button type="button" class="active" data-compose-mode="rb">RB</button>
        <button type="button" data-compose-mode="note">研究ノート</button>
      </div>`);
  };

  function openNoteEditor(existingId = "") {
    const existing = loadNotes().find((note) => note.id === existingId);
    draft = existing ? structuredClone(existing) : freshDraft();
    draft.game = draft.game || state.currentGame;
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-modal>
        <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="noteEditorTitle" data-modal-panel>
          <div class="modal-head"><div><h2 id="noteEditorTitle">研究ノート</h2><p class="modal-sub">文章は軽く、画像はブロック化。全体像はプレビューで確認します。</p></div><button class="icon-button" type="button" data-close-modal>×</button></div>
          <div class="note-editor">
            <input id="noteTitle" class="note-title" maxlength="80" placeholder="研究タイトル" value="${escapeHTML(draft.title)}">
            <textarea id="noteSummary" class="note-summary" maxlength="180" placeholder="要約・研究目的">${escapeHTML(draft.summary)}</textarea>
            <textarea id="noteBody" class="note-body" placeholder="観察、仮説、条件、結果を書く…">${escapeHTML(draft.body)}</textarea>
            <div>
              <span class="form-label">IMAGES</span>
              <div id="noteBlockList" class="note-block-list">${renderImageBlocks()}</div>
            </div>
            <div class="note-toolbar">
              <label class="note-upload secondary-button">画像を追加<input id="noteImageInput" type="file" accept="image/*" multiple></label>
              <button type="button" data-add-demo-map>デモマップ</button>
              <button type="button" data-note-preview>プレビュー</button>
              ${draft.versions.length ? `<button type="button" data-note-history>履歴 ${draft.versions.length}</button>` : ""}
            </div>
            <p class="note-helper">画像は本文中で［画像1］のように管理します。編集では矢印・線・円・四角・文字・手書きを追加できます。元画像と注釈版は分離して保存されます。</p>
          </div>
          <div class="modal-actions"><button class="secondary-button" type="button" data-close-modal>閉じる</button><button class="primary-button" type="button" data-save-note>版を保存</button></div>
        </section>
      </div>`;
  }

  function syncDraftInputs() {
    draft.title = document.querySelector("#noteTitle")?.value.trim() || draft.title;
    draft.summary = document.querySelector("#noteSummary")?.value.trim() || draft.summary;
    draft.body = document.querySelector("#noteBody")?.value || draft.body;
  }

  function renderImageBlocks() {
    if (!draft.images.length) return `<div class="empty-state"><b>画像はまだありません</b><span>スクリーンショットやデモマップを追加できます。</span></div>`;
    return draft.images.map((image, index) => `
      <article class="note-image-block">
        <img src="${image.annotated || image.original}" alt="画像${index + 1}のサムネイル">
        <div class="note-image-copy"><strong>［画像${index + 1}］ ${escapeHTML(image.name || "画像")}</strong><small>${image.annotated ? "注釈あり" : "未編集"} ・ ${escapeHTML(image.caption || "説明なし")}</small></div>
        <div class="note-image-actions"><button type="button" data-edit-note-image="${index}">編集</button><button type="button" data-caption-note-image="${index}">説明</button><button type="button" data-remove-note-image="${index}">削除</button></div>
      </article>`).join("");
  }

  function refreshBlocks() {
    const list = document.querySelector("#noteBlockList");
    if (list) list.innerHTML = renderImageBlocks();
  }

  function addFiles(files) {
    [...files].forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        draft.images.push({ id: makeId("image"), name: file.name, original: reader.result, annotated: "", caption: "", annotations: [] });
        refreshBlocks();
      };
      reader.readAsDataURL(file);
    });
  }

  function addDemoMap() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760"><rect width="1200" height="760" fill="#11151a"/><g fill="none" stroke="#3b4652" stroke-width="5"><path d="M90 130L390 80 560 220 830 100 1090 180 1030 480 820 650 530 600 310 690 100 520Z"/><path d="M390 80L430 350 100 520M560 220L430 350 530 600M830 100L760 350 1030 480M430 350L760 350 820 650"/></g><g fill="#d9e0e7" font-family="sans-serif" font-size="34"><text x="160" y="250">NORTH BASE</text><text x="710" y="230">HIGH GROUND</text><text x="420" y="430">CENTRAL</text><text x="180" y="590">WEST GATE</text><text x="780" y="560">SOUTH ROUTE</text></g></svg>`;
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    draft.images.push({ id: makeId("image"), name: "G-lab デモマップ", original: url, annotated: "", caption: "架空マップ（機能確認用）", annotations: [] });
    refreshBlocks();
  }

  function openCanvas(index) {
    activeImageIndex = index;
    const image = draft.images[index];
    if (!image) return;
    modalRoot.insertAdjacentHTML("beforeend", `
      <div class="modal-backdrop canvas-backdrop">
        <section class="modal-panel canvas-panel" role="dialog" aria-modal="true" aria-labelledby="canvasTitle">
          <div class="modal-head"><div><h2 id="canvasTitle">画像${index + 1}を編集</h2><p class="modal-sub">元画像は保持し、注釈版を別保存します。</p></div><button class="icon-button" type="button" data-close-canvas>×</button></div>
          <div class="canvas-toolbar">
            <button type="button" class="active" data-canvas-tool="pen">手書き</button><button type="button" data-canvas-tool="line">線</button><button type="button" data-canvas-tool="arrow">矢印</button><button type="button" data-canvas-tool="circle">円</button><button type="button" data-canvas-tool="rect">四角</button><button type="button" data-canvas-undo>戻す</button><button type="button" data-canvas-clear>注釈消去</button>
          </div>
          <div class="canvas-text-row"><input id="canvasText" maxlength="40" placeholder="マップへ入れる文字"><button type="button" data-canvas-tool="text">文字を置く</button></div>
          <div class="canvas-wrap"><canvas id="researchCanvas"></canvas></div>
          <div class="modal-actions"><button class="secondary-button" type="button" data-close-canvas>キャンセル</button><button class="primary-button" type="button" data-save-canvas>編集を反映</button></div>
        </section>
      </div>`);
    setupCanvas(image);
  }

  function setupCanvas(image) {
    const canvas = document.querySelector("#researchCanvas");
    const ctx = canvas.getContext("2d");
    const source = new Image();
    source.onload = () => {
      const max = 1200;
      const scale = Math.min(1, max / source.width);
      canvas.width = Math.round(source.width * scale);
      canvas.height = Math.round(source.height * scale);
      canvasState = { canvas, ctx, source, tool: "pen", drawing: false, start: null, points: [], history: [...(image.annotations || [])] };
      redrawCanvas();
    };
    source.src = image.original;
    const point = (event) => {
      const rect = canvas.getBoundingClientRect();
      const touch = event.touches?.[0] || event.changedTouches?.[0] || event;
      return { x: (touch.clientX - rect.left) * canvas.width / rect.width, y: (touch.clientY - rect.top) * canvas.height / rect.height };
    };
    const begin = (event) => { if (!canvasState) return; event.preventDefault(); canvasState.drawing = true; canvasState.start = point(event); canvasState.points = [canvasState.start]; };
    const move = (event) => { if (!canvasState?.drawing) return; event.preventDefault(); canvasState.points.push(point(event)); redrawCanvas({ type: canvasState.tool, start: canvasState.start, end: point(event), points: canvasState.points }); };
    const end = (event) => { if (!canvasState?.drawing) return; event.preventDefault(); const annotation = { type: canvasState.tool, start: canvasState.start, end: point(event), points: [...canvasState.points] }; canvasState.history.push(annotation); canvasState.drawing = false; redrawCanvas(); };
    ["pointerdown"].forEach((name) => canvas.addEventListener(name, begin));
    ["pointermove"].forEach((name) => canvas.addEventListener(name, move));
    ["pointerup", "pointercancel", "pointerleave"].forEach((name) => canvas.addEventListener(name, end));
  }

  function drawAnnotation(a) {
    const { ctx } = canvasState;
    ctx.strokeStyle = "#ff3b45"; ctx.fillStyle = "#ff3b45"; ctx.lineWidth = 6; ctx.lineCap = "round"; ctx.lineJoin = "round";
    if (a.type === "pen") { ctx.beginPath(); (a.points || []).forEach((p, i) => i ? ctx.lineTo(p.x,p.y) : ctx.moveTo(p.x,p.y)); ctx.stroke(); return; }
    if (a.type === "line" || a.type === "arrow") { ctx.beginPath(); ctx.moveTo(a.start.x,a.start.y); ctx.lineTo(a.end.x,a.end.y); ctx.stroke(); if (a.type === "arrow") { const angle=Math.atan2(a.end.y-a.start.y,a.end.x-a.start.x); ctx.beginPath(); ctx.moveTo(a.end.x,a.end.y); ctx.lineTo(a.end.x-28*Math.cos(angle-.55),a.end.y-28*Math.sin(angle-.55)); ctx.lineTo(a.end.x-28*Math.cos(angle+.55),a.end.y-28*Math.sin(angle+.55)); ctx.closePath(); ctx.fill(); } return; }
    if (a.type === "rect") { ctx.strokeRect(a.start.x,a.start.y,a.end.x-a.start.x,a.end.y-a.start.y); return; }
    if (a.type === "circle") { const rx=Math.abs(a.end.x-a.start.x)/2, ry=Math.abs(a.end.y-a.start.y)/2; ctx.beginPath(); ctx.ellipse((a.start.x+a.end.x)/2,(a.start.y+a.end.y)/2,rx,ry,0,0,Math.PI*2); ctx.stroke(); return; }
    if (a.type === "text") { ctx.font = "700 34px sans-serif"; ctx.fillText(a.text,a.start.x,a.start.y); }
  }

  function redrawCanvas(temp) {
    if (!canvasState) return;
    const { ctx, canvas, source, history } = canvasState;
    ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(source,0,0,canvas.width,canvas.height);
    history.forEach(drawAnnotation); if (temp) drawAnnotation(temp);
  }

  function placeText() {
    const text = document.querySelector("#canvasText")?.value.trim();
    if (!text || !canvasState) return showToast("文字を入力してください");
    canvasState.tool = "text";
    canvasState.canvas.addEventListener("pointerdown", function handler(event) {
      const rect = canvasState.canvas.getBoundingClientRect();
      const p = { x:(event.clientX-rect.left)*canvasState.canvas.width/rect.width, y:(event.clientY-rect.top)*canvasState.canvas.height/rect.height };
      canvasState.history.push({ type:"text", text, start:p, end:p }); redrawCanvas();
      canvasState.canvas.removeEventListener("pointerdown", handler); canvasState.tool = "pen";
      document.querySelectorAll("[data-canvas-tool]").forEach((b) => b.classList.toggle("active", b.dataset.canvasTool === "pen"));
    });
  }

  function saveCanvas() {
    const image = draft.images[activeImageIndex];
    if (!image || !canvasState) return;
    image.annotations = [...canvasState.history];
    image.annotated = canvasState.canvas.toDataURL("image/png");
    document.querySelector(".canvas-backdrop")?.remove();
    refreshBlocks();
  }

  function openPreview() {
    syncDraftInputs();
    modalRoot.insertAdjacentHTML("beforeend", `
      <div class="modal-backdrop preview-backdrop">
        <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="previewTitle">
          <div class="modal-head"><div><h2 id="previewTitle">ノート全体プレビュー</h2><p class="modal-sub">公開時の見え方です。</p></div><button class="icon-button" type="button" data-close-preview>×</button></div>
          <article class="note-preview"><header><span class="eyebrow">LAB NOTE / ${escapeHTML(draft.game)}</span><h1>${escapeHTML(draft.title || "無題の研究")}</h1><p class="preview-summary">${escapeHTML(draft.summary || "要約なし")}</p></header><section class="preview-section">${escapeHTML(draft.body || "本文なし")}</section>${draft.images.map((img,i)=>`<figure class="preview-image"><img src="${img.annotated || img.original}" alt="画像${i+1}"><figcaption>［画像${i+1}］ ${escapeHTML(img.caption || img.name || "画像")}</figcaption></figure>`).join("")}</article>
        </section>
      </div>`);
  }

  function saveNote() {
    syncDraftInputs();
    if (!draft.title) return showToast("タイトルを入力してください");
    const notes = loadNotes();
    const now = Date.now();
    const snapshot = { number: (draft.versions.at(-1)?.number || 0) + 1, createdAt: now, title: draft.title, summary: draft.summary, body: draft.body, images: structuredClone(draft.images) };
    draft.id ||= makeId("note"); draft.updatedAt = now; draft.createdAt ||= now; draft.versions.push(snapshot);
    const index = notes.findIndex((note) => note.id === draft.id);
    if (index >= 0) notes[index] = draft; else notes.unshift(draft);
    saveNotes(notes); showToast(`Version ${snapshot.number} を保存しました`);
    openNoteEditor(draft.id);
  }

  function openHistory() {
    syncDraftInputs();
    modalRoot.insertAdjacentHTML("beforeend", `<div class="modal-backdrop history-backdrop"><section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="historyTitle"><div class="modal-head"><div><h2 id="historyTitle">研究の版履歴</h2><p class="modal-sub">変更前の研究へ戻せます。</p></div><button class="icon-button" type="button" data-close-history>×</button></div><div class="version-list">${draft.versions.slice().reverse().map((v)=>`<article class="version-row"><div><strong>Version ${v.number}</strong><small>${new Date(v.createdAt).toLocaleString("ja-JP")} ・ 画像${v.images.length}枚</small></div><button type="button" data-restore-version="${v.number}">復元</button></article>`).join("")}</div></section></div>`);
  }

  document.addEventListener("change", (event) => { if (event.target.id === "noteImageInput") addFiles(event.target.files); });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button"); if (!button) return;
    if (button.dataset.composeMode === "note") return openNoteEditor();
    if (button.dataset.addDemoMap !== undefined) return addDemoMap();
    if (button.dataset.editNoteImage !== undefined) { syncDraftInputs(); return openCanvas(Number(button.dataset.editNoteImage)); }
    if (button.dataset.captionNoteImage !== undefined) { const i=Number(button.dataset.captionNoteImage); const value=prompt("画像の説明",draft.images[i]?.caption||""); if(value!==null){draft.images[i].caption=value;refreshBlocks();} return; }
    if (button.dataset.removeNoteImage !== undefined) { draft.images.splice(Number(button.dataset.removeNoteImage),1); refreshBlocks(); return; }
    if (button.dataset.canvasTool === "text") return placeText();
    if (button.dataset.canvasTool && canvasState) { canvasState.tool=button.dataset.canvasTool; document.querySelectorAll("[data-canvas-tool]").forEach((b)=>b.classList.toggle("active",b===button)); return; }
    if (button.dataset.canvasUndo !== undefined && canvasState) { canvasState.history.pop(); redrawCanvas(); return; }
    if (button.dataset.canvasClear !== undefined && canvasState) { canvasState.history=[]; redrawCanvas(); return; }
    if (button.dataset.saveCanvas !== undefined) return saveCanvas();
    if (button.dataset.closeCanvas !== undefined) return document.querySelector(".canvas-backdrop")?.remove();
    if (button.dataset.notePreview !== undefined) return openPreview();
    if (button.dataset.closePreview !== undefined) return document.querySelector(".preview-backdrop")?.remove();
    if (button.dataset.saveNote !== undefined) return saveNote();
    if (button.dataset.noteHistory !== undefined) return openHistory();
    if (button.dataset.closeHistory !== undefined) return document.querySelector(".history-backdrop")?.remove();
    if (button.dataset.restoreVersion !== undefined) { const v=draft.versions.find((x)=>x.number===Number(button.dataset.restoreVersion)); if(v){draft.title=v.title;draft.summary=v.summary;draft.body=v.body;draft.images=structuredClone(v.images);document.querySelector(".history-backdrop")?.remove();openNoteEditor(draft.id);showToast(`Version ${v.number} を復元しました`);} }
  }, true);
})();