"use strict";

(function initResearchFlow() {
  const FLOW_KEY = "gamelab.sig.research-flow.v1";
  const defaults = { joined: {}, labCandidates: {}, contributions: {} };

  function readFlow() {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(FLOW_KEY) || "{}") }; }
    catch { return { ...defaults }; }
  }

  let flow = readFlow();

  function saveFlow() {
    localStorage.setItem(FLOW_KEY, JSON.stringify(flow));
  }

  function contributionCount(postId) {
    return Array.isArray(flow.contributions[postId]) ? flow.contributions[postId].length : 0;
  }

  function flowButtons(post) {
    const joined = Boolean(flow.joined[post.id]);
    const labCandidate = Boolean(flow.labCandidates[post.id]);
    const count = contributionCount(post.id);
    return `
      <div class="research-flow-actions" aria-label="研究を進める">
        <button type="button" class="flow-action ${joined ? "active" : ""}" data-join-verification="${escapeHTML(post.id)}">
          <span>◎</span><b>${joined ? "検証参加中" : "検証に参加"}</b>
        </button>
        <button type="button" class="flow-action" data-add-evidence="${escapeHTML(post.id)}">
          <span>±</span><b>検証・反証 ${count || ""}</b>
        </button>
        <button type="button" class="flow-action ${labCandidate ? "active" : ""}" data-lab-candidate="${escapeHTML(post.id)}">
          <span>▱</span><b>${labCandidate ? "LAB候補" : "LABへ送る"}</b>
        </button>
      </div>`;
  }

  const previousPostCard = renderPostCard;
  renderPostCard = function renderPostCardWithFlow(post) {
    const html = previousPostCard(post);
    return html.replace(
      `</div>\n    </article>`,
      `${flowButtons(post)}</div>\n    </article>`
    );
  };

  function postById(postId) {
    return state.posts.find((post) => post.id === postId);
  }

  function openEvidenceModal(postId) {
    const post = postById(postId);
    if (!post) return;
    const existing = flow.contributions[postId] || [];
    modalRoot.insertAdjacentHTML("beforeend", `
      <div class="ui-settings evidence-modal" data-flow-backdrop>
        <section class="ui-settings-panel" role="dialog" aria-modal="true" aria-labelledby="evidenceTitle">
          <div class="related-modal-head">
            <div><small>VERIFICATION LOG</small><h2 id="evidenceTitle">検証・反証を追加</h2></div>
            <button type="button" data-flow-close aria-label="閉じる">×</button>
          </div>
          <p class="evidence-source">${escapeHTML(post.text)}</p>
          <div class="evidence-type-grid" role="group" aria-label="記録の種類">
            <button type="button" class="active" data-evidence-type="support">再現できた</button>
            <button type="button" data-evidence-type="counter">再現しなかった</button>
            <button type="button" data-evidence-type="condition">条件を補足</button>
          </div>
          <label class="evidence-label" for="evidenceNote">条件・結果</label>
          <textarea id="evidenceNote" class="evidence-note" maxlength="240" placeholder="使用環境、ランク帯、試行回数、例外条件など"></textarea>
          <div class="evidence-rule"><b>重要</b><span>賛成・反対ではなく、再現条件を残します。異なる結果も研究価値として保存されます。</span></div>
          <button type="button" class="evidence-submit" data-submit-evidence="${escapeHTML(postId)}" data-selected-evidence="support">記録を追加</button>
          ${existing.length ? `<div class="evidence-history"><strong>この端末の記録 ${existing.length}件</strong>${existing.slice().reverse().map((item) => `<p><b>${item.type === "support" ? "再現" : item.type === "counter" ? "反証" : "条件"}</b>${escapeHTML(item.note)}</p>`).join("")}</div>` : ""}
        </section>
      </div>`);
  }

  function toggleJoin(postId) {
    flow.joined[postId] = !flow.joined[postId];
    saveFlow();
    showToast(flow.joined[postId] ? "検証参加リストに追加しました" : "検証参加を解除しました");
    render();
  }

  function toggleLabCandidate(postId) {
    flow.labCandidates[postId] = !flow.labCandidates[postId];
    saveFlow();
    showToast(flow.labCandidates[postId] ? "LAB候補へ送りました" : "LAB候補から戻しました");
    render();
  }

  function submitEvidence(button) {
    const postId = button.dataset.submitEvidence;
    const modal = button.closest(".evidence-modal");
    const note = modal?.querySelector("#evidenceNote")?.value.trim();
    const type = button.dataset.selectedEvidence || "support";
    if (!note) {
      showToast("条件・結果を入力してください");
      return;
    }
    flow.contributions[postId] = flow.contributions[postId] || [];
    flow.contributions[postId].push({ id: Date.now(), type, note, createdAt: Date.now() });
    flow.joined[postId] = true;
    saveFlow();
    modal?.remove();
    showToast(type === "counter" ? "反証を記録しました" : "検証記録を追加しました");
    render();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.joinVerification) {
      toggleJoin(button.dataset.joinVerification);
      return;
    }
    if (button.dataset.addEvidence) {
      openEvidenceModal(button.dataset.addEvidence);
      return;
    }
    if (button.dataset.labCandidate) {
      toggleLabCandidate(button.dataset.labCandidate);
      return;
    }
    if (button.dataset.evidenceType) {
      const modal = button.closest(".evidence-modal");
      modal?.querySelectorAll("[data-evidence-type]").forEach((item) => item.classList.toggle("active", item === button));
      const submit = modal?.querySelector("[data-submit-evidence]");
      if (submit) submit.dataset.selectedEvidence = button.dataset.evidenceType;
      return;
    }
    if (button.dataset.submitEvidence) {
      submitEvidence(button);
      return;
    }
    if (button.hasAttribute("data-flow-close")) {
      button.closest(".evidence-modal")?.remove();
      return;
    }
    if (event.target.hasAttribute("data-flow-backdrop")) {
      event.target.remove();
    }
  });

  render();
})();