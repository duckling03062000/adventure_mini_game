/* ------------------------------------------------------------------
   Character Lab — internal review page.
   Shows every stage side by side. Never linked from the game.
------------------------------------------------------------------- */

const CARD_W = 300, CARD_H = 250, CARD_SCALE = 7, CARD_GROUND = 226;
const cardState = {};
/* The growth shot is only ever the three Ayrishas; the cards show everyone. */
const LAB_CAST = ORDER.concat(['officer', 'mother', 'tutor', 'husband', 'krishna']);

function buildCards() {
  const wrap = document.getElementById('cards');
  LAB_CAST.forEach((id, i) => {
    const char = CHARACTERS[id];
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-stage"><canvas id="cv-${id}"></canvas></div>
      <p class="stage-no">${i < ORDER.length ? `stage ${i + 1} of ${ORDER.length}` : (i < ORDER.length + 2 ? 'level 1 · 2002' : 'level 3')}</p>
      <h3>${char.name}</h3>
      <p class="era">${char.era}</p>
      <p class="note">${char.note}</p>
      <div class="poses">
        <button class="chip is-on" data-char="${id}" data-anim="idle">Idle</button>
        <button class="chip" data-char="${id}" data-anim="walk">Walk</button>
        <button class="chip" data-char="${id}" data-anim="jump">Jump</button>
      </div>`;
    wrap.appendChild(card);

    const cv = card.querySelector('canvas');
    cv.style.aspectRatio = `${CARD_W} / ${CARD_H}`;
    cardState[id] = { anim: 'idle', ctx: fitCanvas(cv, CARD_W, CARD_H).ctx, cv };
  });

  wrap.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    cardState[btn.dataset.char].anim = btn.dataset.anim;
    btn.parentElement.querySelectorAll('.chip').forEach(b => b.classList.toggle('is-on', b === btn));
  });
}

function drawCards(ts) {
  LAB_CAST.forEach(id => {
    const st = cardState[id];
    const { ctx } = st;
    ctx.clearRect(0, 0, CARD_W, CARD_H);

    const g = ctx.createLinearGradient(0, 0, 0, CARD_H);
    g.addColorStop(0, '#f6f1ff');
    g.addColorStop(1, '#ffeef6');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = 'rgba(36,27,38,.07)';
    ctx.fillRect(0, CARD_GROUND + 6, CARD_W, CARD_H - CARD_GROUND - 6);
    ctx.fillStyle = 'rgba(36,27,38,.13)';
    ctx.fillRect(0, CARD_GROUND + 6, CARD_W, 2);

    const { leg, bob } = animAt(st.anim, ts);
    const lift = st.anim === 'jump' ? -18 : 0;
    drawCharacter(ctx, CHARACTERS[id], leg, CARD_SCALE, CARD_W / 2, CARD_GROUND + lift, bob);
  });
}

/* ------------------------------ GROWTH ---------------------------- */
const GROW_W = 900, GROW_H = 330, GROW_SCALE = 7, GROW_GROUND = 262;
let growthAnim = 'walk';
let growthCtx = null;

function buildGrowth() {
  const cv = document.getElementById('growth');
  cv.style.aspectRatio = `${GROW_W} / ${GROW_H}`;
  growthCtx = fitCanvas(cv, GROW_W, GROW_H).ctx;
  document.querySelector('.growth-controls').addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    growthAnim = btn.dataset.growth;
    btn.parentElement.querySelectorAll('.chip').forEach(b => b.classList.toggle('is-on', b === btn));
  });
}

function drawGrowth(ts) {
  const ctx = growthCtx;
  ctx.clearRect(0, 0, GROW_W, GROW_H);
  ctx.fillStyle = '#fffdfb';
  ctx.fillRect(0, 0, GROW_W, GROW_H);

  ORDER.forEach(id => {
    const y = GROW_GROUND - frameHeight(CHARACTERS[id], 'idle') * GROW_SCALE;
    ctx.strokeStyle = 'rgba(143,122,217,.28)';
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(GROW_W - 28, y);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  ctx.fillStyle = '#e9e2f6';
  ctx.fillRect(0, GROW_GROUND + 6, GROW_W, GROW_H - GROW_GROUND - 6);
  ctx.fillStyle = '#cfc3e6';
  ctx.fillRect(0, GROW_GROUND + 6, GROW_W, 3);

  ORDER.forEach((id, i) => {
    const char = CHARACTERS[id];
    const x = GROW_W * (i + 1) / (ORDER.length + 1);
    const { leg, bob } = animAt(growthAnim, ts + i * 0.11);
    const lift = growthAnim === 'jump' ? -20 : 0;
    drawCharacter(ctx, char, leg, GROW_SCALE, x, GROW_GROUND + lift, bob);

    ctx.fillStyle = '#5b4a6b';
    ctx.font = '600 13px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.name, x, GROW_GROUND + 46);
    ctx.textAlign = 'left';
  });
}

function loop(now) {
  const ts = now / 1000;
  drawCards(ts);
  drawGrowth(ts);
  requestAnimationFrame(loop);
}

buildCards();
buildGrowth();
requestAnimationFrame(loop);

let rz;
window.addEventListener('resize', () => {
  clearTimeout(rz);
  rz = setTimeout(() => {
    LAB_CAST.forEach(id => { cardState[id].ctx = fitCanvas(cardState[id].cv, CARD_W, CARD_H).ctx; });
    growthCtx = fitCanvas(document.getElementById('growth'), GROW_W, GROW_H).ctx;
  }, 150);
});
