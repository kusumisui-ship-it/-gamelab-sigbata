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

  <section class="quick-access">

    <h3>Research Board</h3>

    <div class="quick-grid">

      <button class="quick-card">
        <span>#IGL</span>
      </button>

      <button class="quick-card">
        <span>#PAD</span>
      </button>

      <button class="quick-card">
        <span>#Macro</span>
      </button>

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