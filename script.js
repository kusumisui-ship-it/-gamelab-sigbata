console.log("GR SYSTEM READY");

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