#console.log("GR SYSTEM READY");

/* ========= PAGE SYSTEM ========= */

const app = document.querySelector(".home");

const pages = {

  home: `
  
  <section class="hero">

    <div class="game-selector">
      <button class="game-current">
        <span class="game-icon">A</span>
        <span>APEX</span>
        <span class="arrow">▼</span>
      </button>
    </div>

    <div class="hero-overlay"></div>

    <div class="hero-content">

      <p class="hero-mini">
        Competitive Strategy Lab
      </p>

      <h2>
        攻略ではなく、<br>
        <span>研究する。</span>
      </h2>

      <p class="hero-desc">
        Apex・VALORANT・LoLなどの戦略、研究、考察、
        コーチング、LFTを共有する競技ゲーマー向けコミュニティ。
      </p>

      <div class="hero-buttons">
        <button class="primary-btn" onclick="setPage('rb')">
          RBを見る
        </button>

        <button class="secondary-btn" onclick="setPage('lab')">
          LABを見る
        </button>
      </div>

    </div>

  </section>
  `,

  rb: `

<section class="rb-page">

  <div class="rb-header">

    <h2>
      Research Board
    </h2>

    <p>
      Competitive Research Feed
    </p>

  </div>

  <div class="rb-post-box">

    <textarea
      placeholder="研究・考察を書く..."
      maxlength="200"
    ></textarea>

    <div class="rb-post-bottom">

      <div class="rb-tags">

        <span>#Apex</span>
        <span>#IGL</span>
        <span>#Macro</span>

      </div>

      <button class="rb-submit">
        投稿
      </button>

    </div>

  </div>

  <div class="rb-feed">

    <article class="rb-card">

      <div class="rb-top">

        <div class="rb-user">

          <div class="rb-avatar">
            S
          </div>

          <div>

            <h4>
              Sui
            </h4>

            <p>
              IGL ・ 2時間前
            </p>

          </div>

        </div>

      </div>

      <p class="rb-text">

        PAD勢が近距離で勝てない理由は、
        入力遅延よりピークタイミング説。

      </p>

      <div class="rb-tag-row">

        <span>#PAD</span>
        <span>#研究</span>
        <span>#Macro</span>

      </div>

      <div class="rb-actions">

        <button>
          GOOD 91
        </button>

        <button>
          コメント 12
        </button>

        <button>
          保存
        </button>

      </div>

    </article>

    <article class="rb-card">

      <div class="rb-top">

        <div class="rb-user">

          <div class="rb-avatar red">
            A
          </div>

          <div>

            <h4>
              Apex Analyst
            </h4>

            <p>
              Analyst ・ 5時間前
            </p>

          </div>

        </div>

      </div>

      <p class="rb-text">

        安置読みは確率ではなく、
        “チーム分布”から逆算できる。

      </p>

      <div class="rb-tag-row">

        <span>#Zone</span>
        <span>#Macro</span>

      </div>

      <div class="rb-actions">

        <button>
          GOOD 142
        </button>

        <button>
          コメント 24
        </button>

        <button>
          保存
        </button>

      </div>

    </article>

  </div>

</section>

`,

  lab: `

  <section class="lab-list">

    <article class="lab-card">

      <div class="lab-thumb apex-thumb"></div>

      <div class="lab-info">

        <span class="lab-badge">
          LAB
        </span>

        <h4>
          競技シーンを、次の段階へ。
        </h4>

        <p>
          なぜ今、eSportsには“研究文化”が必要なのか
        </p>

      </div>

    </article>

  </section>
  
`,
profile: `

<section class="profile-page">

  <div class="profile-header">

    <div class="profile-avatar">
      S
    </div>

    <h2>Sui</h2>

    <p>IGL / Researcher</p>

  </div>

  <div class="profile-stats">

    <div>
      <strong>12</strong>
      <span>研究</span>
    </div>

    <div>
      <strong>91%</strong>
      <span>GOOD率</span>
    </div>

    <div>
      <strong>3</strong>
      <span>LAB</span>
    </div>

  </div>

</section>

`
};

function setPage(page){
  app.innerHTML = pages[page];
}

setPage("home");

/* ========= NAV ========= */

document.querySelectorAll(".nav-item").forEach((item,index)=>{

  item.addEventListener("click",()=>{

    document.querySelectorAll(".nav-item")
    .forEach(btn=>btn.classList.remove("active"));

    item.classList.add("active");

    if(index===0){
      setPage("home");
    }

    if(index===1){
      setPage("rb");
    }

  });

});
/* ========= RB POST ========= */

document.addEventListener("click",(e)=>{

  if(e.target.classList.contains("rb-submit")){

    const textarea =
    document.querySelector(".rb-post-box textarea");

    const text = textarea.value.trim();

    if(!text) return;

    const feed =
    document.querySelector(".rb-feed");

    const post = document.createElement("article");

    post.className = "rb-card";

    post.innerHTML = `

      <div class="rb-top">

        <div class="rb-user">

          <div class="rb-avatar">
            S
          </div>

          <div>

            <h4>
              Sui
            </h4>

            <p>
              Player ・ 今
            </p>

          </div>

        </div>

      </div>

      <p class="rb-text">
        ${text}
      </p>

      <div class="rb-tag-row">

        <span>#研究</span>

      </div>

      <div class="rb-actions">

        <button>
          GOOD 0
        </button>

        <button>
          コメント 0
        </button>

        <button>
          保存
        </button>

      </div>

    `;

    feed.prepend(post);

    textarea.value="";

  }

});
/* ========= RB POST ========= */

document.addEventListener("click", (e) => {
  const submitBtn = e.target.closest(".rb-submit");
  if (!submitBtn) return;

  const postBox = submitBtn.closest(".rb-post-box");
  const textarea = postBox.querySelector("textarea");
  const feed = document.querySelector(".rb-feed");

  const text = textarea.value.trim();

  if (text.length === 0) {
    alert("投稿内容を入力して");
    return;
  }

  const post = document.createElement("article");
  post.className = "rb-card";

  post.innerHTML = `
    <div class="rb-top">
      <div class="rb-user">
        <div class="rb-avatar">S</div>
        <div>
          <h4>Sui</h4>
          <p>Researcher ・ 今</p>
        </div>
      </div>
    </div>

    <p class="rb-text">${text}</p>

    <div class="rb-tag-row">
      <span>#研究</span>
      <span>#Apex</span>
    </div>

    <div class="rb-actions">
      <button>GOOD 0</button>
      <button>コメント 0</button>
      <button>保存</button>
    </div>
  `;

  feed.prepend(post);
  textarea.value = "";
});
/* ========= GOOD BUTTON ========= */

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".rb-actions button");

  if (!btn) return;

  if (!btn.textContent.includes("GOOD")) return;

  const current = parseInt(
    btn.textContent.replace("GOOD", "").trim()
  );

  btn.textContent = `GOOD ${current + 1}`;
});

/* ========= COMMENT VIEW / WRITE ========= */

let activeCommentCard = null;

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".rb-actions button");
  if (!btn) return;
  if (!btn.textContent.includes("コメント")) return;

  activeCommentCard = btn.closest(".rb-card");
  openCommentView();
});

function getOriginalPostText() {
  if (!activeCommentCard) return "";
  const text = activeCommentCard.querySelector(".rb-text");
  return text ? text.textContent.trim() : "";
}

function createCommentModal() {
  let modal = document.querySelector(".comment-modal");

  if (modal) return modal;

  modal = document.createElement("div");
  modal.className = "comment-modal";

  modal.innerHTML = `
    <div class="comment-panel">

      <div class="comment-head">
        <button class="comment-back">←</button>
        <h3>コメント</h3>
        <button class="comment-close">×</button>
      </div>

      <div class="comment-original">
        <span>元投稿</span>
        <p></p>
      </div>

      <div class="comment-view">
        <div class="modal-comment-list"></div>
        <button class="open-comment-write">コメントを書く</button>
      </div>

      <div class="comment-write hidden">
        <textarea class="modal-comment-input" placeholder="コメントを書く..."></textarea>
        <button class="modal-comment-submit">送信</button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function openCommentView() {
  const modal = createCommentModal();

  modal.classList.add("show");
  modal.querySelector(".comment-view").classList.remove("hidden");
  modal.querySelector(".comment-write").classList.add("hidden");

  modal.querySelector(".comment-original p").textContent = getOriginalPostText();

  const list = modal.querySelector(".modal-comment-list");
  list.innerHTML = "";

  const comments = activeCommentCard.querySelectorAll(".stored-comment");

  if (comments.length === 0) {
    list.innerHTML = `<p class="empty-comment">まだコメントはありません</p>`;
    return;
  }

  comments.forEach((comment) => {
    list.appendChild(comment.cloneNode(true));
  });
}

function openCommentWrite() {
  const modal = createCommentModal();

  modal.querySelector(".comment-view").classList.add("hidden");
  modal.querySelector(".comment-write").classList.remove("hidden");

  modal.querySelector(".comment-original p").textContent = getOriginalPostText();
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("comment-close")) {
    document.querySelector(".comment-modal").classList.remove("show");
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("comment-back")) {
    openCommentView();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("open-comment-write")) {
    openCommentWrite();
  }
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".modal-comment-submit");
  if (!btn) return;

  const modal = btn.closest(".comment-modal");
  const input = modal.querySelector(".modal-comment-input");

  const text = input.value.trim();
  if (!text) return;

  const comment = document.createElement("div");
  comment.className = "stored-comment rb-comment";

  comment.innerHTML = `
    <strong>Sui</strong>
    <p>${text}</p>
  `;

  activeCommentCard.appendChild(comment);

  const commentBtn =
    activeCommentCard.querySelector(".rb-actions button:nth-child(2)");

  const currentCount = parseInt(
    commentBtn.textContent.replace("コメント", "").trim()
  );

  commentBtn.textContent = `コメント ${currentCount + 1}`;

  input.value = "";
  openCommentView();
});