"use strict";

(function initAuthShell() {
  const AUTH_KEY = "gamelab.sig.auth.prototype.v1";
  const GUEST = { signedIn: false, email: "", name: "Guest", role: "Researcher", bio: "", avatar: "?" };

  function readAuth() {
    try { return { ...GUEST, ...JSON.parse(localStorage.getItem(AUTH_KEY) || "{}") }; }
    catch { return { ...GUEST }; }
  }

  let auth = readAuth();

  function persistAuth() {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  function syncProfile() {
    if (typeof state === "undefined") return;
    if (auth.signedIn) {
      state.profile = {
        ...state.profile,
        name: auth.name || "Researcher",
        role: auth.role || "Researcher",
        bio: auth.bio || "Apex Legendsの研究者。",
        avatar: auth.avatar || (auth.name?.[0] || "R").toUpperCase()
      };
      if (typeof saveState === "function") saveState();
    }
    const avatar = document.querySelector("#headerAvatar");
    if (avatar) {
      avatar.textContent = auth.signedIn ? (auth.avatar || auth.name?.[0] || "R").toUpperCase() : "?";
      avatar.closest("button")?.classList.toggle("guest-avatar", !auth.signedIn);
      avatar.closest("button")?.setAttribute("aria-label", auth.signedIn ? "プロフィール" : "ログイン");
    }
  }

  function openAuth(mode = "signin") {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-auth>
        <section class="modal-panel auth-panel" role="dialog" aria-modal="true" aria-labelledby="authTitle">
          <div class="modal-head"><div><h2 id="authTitle">gamelab.sig アカウント</h2><p class="modal-sub">現在は認証UIの試作です。本番接続後はメール認証に切り替わります。</p></div><button class="icon-button" type="button" data-close-auth>×</button></div>
          <div class="auth-tabs">
            <button type="button" data-auth-mode="signin" class="${mode === "signin" ? "active" : ""}">ログイン</button>
            <button type="button" data-auth-mode="signup" class="${mode === "signup" ? "active" : ""}">新規登録</button>
          </div>
          <form class="auth-form" data-auth-form="${mode}">
            ${mode === "signup" ? `<label>表示名<input id="authName" maxlength="30" required placeholder="例：Sui"></label>` : ""}
            <label>メールアドレス<input id="authEmail" type="email" required autocomplete="email" placeholder="name@example.com"></label>
            <label>パスワード<input id="authPassword" type="password" minlength="8" required autocomplete="${mode === "signup" ? "new-password" : "current-password"}" placeholder="8文字以上"></label>
            <button class="primary-button" type="submit">${mode === "signup" ? "登録して始める" : "ログイン"}</button>
            ${mode === "signin" ? `<button class="secondary-button" type="button" data-password-reset>パスワードを忘れた</button>` : ""}
          </form>
          <p class="auth-note">試作版では入力内容を端末内に保存します。実在するパスワードは入力しないでください。</p>
        </section>
      </div>`;
    document.querySelector(mode === "signup" ? "#authName" : "#authEmail")?.focus();
  }

  function submitAuth(form) {
    const mode = form.dataset.authForm;
    const email = document.querySelector("#authEmail")?.value.trim() || "";
    const password = document.querySelector("#authPassword")?.value || "";
    const name = document.querySelector("#authName")?.value.trim() || email.split("@")[0] || "Researcher";
    if (!email || password.length < 8) return showToast("メールと8文字以上のパスワードを入力してください");
    auth = { ...auth, signedIn: true, email, name: mode === "signup" ? name : (auth.name === "Guest" ? name : auth.name), avatar: (mode === "signup" ? name : auth.name || name).slice(0, 1).toUpperCase() };
    persistAuth();
    syncProfile();
    modalRoot.innerHTML = "";
    if (typeof render === "function") render();
    showToast(mode === "signup" ? "試作アカウントを作成しました" : "ログインしました");
  }

  function openProfileEditor() {
    if (!auth.signedIn) return openAuth("signin");
    modalRoot.innerHTML = `
      <div class="modal-backdrop" data-close-auth>
        <section class="modal-panel auth-panel" role="dialog" aria-modal="true" aria-labelledby="profileEditTitle">
          <div class="modal-head"><div><h2 id="profileEditTitle">プロフィール編集</h2><p class="modal-sub">Apexでの役割や研究領域を設定します。</p></div><button class="icon-button" type="button" data-close-auth>×</button></div>
          <form class="auth-form" data-profile-form>
            <label>表示名<input id="profileName" maxlength="30" required value="${escapeHTML(auth.name)}"></label>
            <label>役割<input id="profileRole" maxlength="40" value="${escapeHTML(auth.role || "Researcher")}" placeholder="例：IGL / Analyst"></label>
            <label>自己紹介<textarea id="profileBio" maxlength="240" placeholder="研究していることを書く">${escapeHTML(auth.bio || "")}</textarea></label>
            <button class="primary-button" type="submit">保存する</button>
          </form>
        </section>
      </div>`;
  }

  function saveProfile() {
    auth.name = document.querySelector("#profileName")?.value.trim() || auth.name;
    auth.role = document.querySelector("#profileRole")?.value.trim() || "Researcher";
    auth.bio = document.querySelector("#profileBio")?.value.trim() || "";
    auth.avatar = auth.name.slice(0, 1).toUpperCase();
    persistAuth(); syncProfile(); modalRoot.innerHTML = ""; render(); showToast("プロフィールを保存しました");
  }

  function renderAccountControls() {
    if (ui.page !== "profile") return;
    if (!auth.signedIn) {
      app.innerHTML = `<section class="page"><header class="page-head"><div><span class="eyebrow">ACCOUNT</span><h1>プロフィール</h1><p>投稿・保存・フォローにはアカウントが必要です。</p></div></header><div class="auth-gate"><h2>Apexの研究を残す</h2><p>ログインするとRB、研究ノート、LAB、検証履歴を自分のプロフィールへ保存できます。</p><div class="auth-actions"><button class="primary-button" type="button" data-open-auth="signup">新規登録</button><button class="secondary-button" type="button" data-open-auth="signin">ログイン</button></div></div></section>`;
      return;
    }
    const page = app.querySelector(".page");
    if (!page || page.querySelector(".account-card")) return;
    page.insertAdjacentHTML("beforeend", `<section class="account-card"><div class="account-row"><div><strong><span class="auth-status-dot"></span>ログイン中</strong><small>${escapeHTML(auth.email)}</small></div><button class="secondary-button" type="button" data-edit-profile>プロフィール編集</button></div><div class="account-row"><div><strong>アカウント</strong><small>本番ではメール認証・パスワード再設定・削除確認を行います。</small></div><button class="secondary-button" type="button" data-sign-out>ログアウト</button></div><div class="account-row auth-danger"><div><strong>アカウント削除</strong><small>試作端末内の認証情報とプロフィールを削除します。</small></div><button class="danger-button" type="button" data-delete-account>削除</button></div></section>`);
  }

  function requireAuth(actionLabel) {
    if (auth.signedIn) return true;
    openAuth("signup");
    showToast(`${actionLabel}にはログインが必要です`);
    return false;
  }

  const baseRender = render;
  render = function renderWithAuth() { baseRender(); syncProfile(); renderAccountControls(); };

  const baseOpenCompose = openCompose;
  openCompose = function authenticatedCompose() { if (requireAuth("投稿")) baseOpenCompose(); };

  document.addEventListener("submit", (event) => {
    const authForm = event.target.closest("[data-auth-form]");
    if (authForm) { event.preventDefault(); return submitAuth(authForm); }
    if (event.target.matches("[data-profile-form]")) { event.preventDefault(); return saveProfile(); }
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("button"); if (!button) return;
    if (button.dataset.openAuth) return openAuth(button.dataset.openAuth);
    if (button.dataset.authMode) return openAuth(button.dataset.authMode);
    if (button.hasAttribute("data-close-auth")) { modalRoot.innerHTML = ""; return; }
    if (button.hasAttribute("data-password-reset")) { const email=document.querySelector("#authEmail")?.value.trim(); return showToast(email ? "本番接続後、このアドレスへ再設定メールを送信します" : "メールアドレスを入力してください"); }
    if (button.hasAttribute("data-edit-profile")) return openProfileEditor();
    if (button.hasAttribute("data-sign-out")) { auth={...GUEST}; persistAuth(); modalRoot.innerHTML=""; render(); return showToast("ログアウトしました"); }
    if (button.hasAttribute("data-delete-account")) { if(!confirm("試作アカウントを削除しますか？")) return; localStorage.removeItem(AUTH_KEY); auth={...GUEST}; if(typeof state!=="undefined") state.profile={name:"Guest",role:"Researcher",avatar:"?",bio:""}; if(typeof saveState==="function") saveState(); render(); return showToast("試作アカウントを削除しました"); }
  }, true);

  syncProfile();
  requestAnimationFrame(() => { syncProfile(); renderAccountControls(); });
  globalThis.GLabAuth = { get session(){ return { ...auth }; }, requireAuth, openAuth };
})();