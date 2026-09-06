/* ------------------------------------------------------------------
   The jigsaw — Level 5, back home in her room.

   The picture is the night sky: the moon over a horizon, a ringed
   planet, a comet, and the stars behind all of it. It is painted here
   rather than loaded, so there is still no image file in the game.

   Cut into a 4 x 3 grid and tipped out on the floor. Pick a piece,
   click the space you think it goes in. A wrong space does nothing at
   all: no penalty, no scolding, and no way to fail it.
------------------------------------------------------------------- */

const JIG = { cols: 4, rows: 3, w: 480, h: 360 };

/* The picture, painted once into an offscreen canvas. */
function paintNightSky(cv) {
  const c = cv.getContext('2d');
  const W = cv.width, H = cv.height;

  const sky = c.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#0d1030');
  sky.addColorStop(0.55, '#22224e');
  sky.addColorStop(1, '#3d2c4f');
  c.fillStyle = sky;
  c.fillRect(0, 0, W, H);

  /* Stars. Fixed positions, so the picture is the same every time and
     the pieces are always solvable by eye. */
  let seed = 20020906;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let i = 0; i < 220; i++) {
    const x = rnd() * W, y = rnd() * H * 0.82;
    const r = rnd() < 0.09 ? 2.2 : rnd() < 0.4 ? 1.4 : 0.9;
    c.fillStyle = `rgba(255,255,255,${0.35 + rnd() * 0.6})`;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }

  // a band of milky way across the top left
  const band = c.createLinearGradient(0, 40, W * 0.7, 190);
  band.addColorStop(0, 'rgba(150,150,230,.16)');
  band.addColorStop(0.5, 'rgba(190,170,240,.10)');
  band.addColorStop(1, 'rgba(120,140,220,0)');
  c.fillStyle = band;
  c.fillRect(0, 20, W, 190);

  /* The moon, with its seas. */
  const mx = 150, my = 128, mr = 66;
  const halo = c.createRadialGradient(mx, my, mr * 0.8, mx, my, mr * 2.4);
  halo.addColorStop(0, 'rgba(240,238,220,.22)');
  halo.addColorStop(1, 'rgba(240,238,220,0)');
  c.fillStyle = halo;
  c.beginPath(); c.arc(mx, my, mr * 2.4, 0, Math.PI * 2); c.fill();

  const moon = c.createRadialGradient(mx - 22, my - 24, 8, mx, my, mr);
  moon.addColorStop(0, '#fbf8ea');
  moon.addColorStop(0.65, '#e6e0cb');
  moon.addColorStop(1, '#bfb7a0');
  c.fillStyle = moon;
  c.beginPath(); c.arc(mx, my, mr, 0, Math.PI * 2); c.fill();

  const craters = [[-26, -18, 13], [10, -34, 8], [22, 6, 17], [-14, 26, 10],
                   [34, 34, 7], [-40, 12, 6], [2, 20, 5]];
  for (const [dx, dy, r] of craters) {
    c.fillStyle = 'rgba(150,144,126,.42)';
    c.beginPath(); c.arc(mx + dx, my + dy, r, 0, Math.PI * 2); c.fill();
    c.fillStyle = 'rgba(255,253,242,.30)';
    c.beginPath(); c.arc(mx + dx - r * 0.24, my + dy - r * 0.24, r * 0.6, 0, Math.PI * 2); c.fill();
  }

  /* A ringed planet, off to the right. */
  const px = 372, py = 88, pr = 34;
  c.save();
  c.translate(px, py);
  c.rotate(-0.42);
  c.strokeStyle = '#d8a86a';
  c.lineWidth = 7;
  c.beginPath(); c.ellipse(0, 0, pr * 1.85, pr * 0.5, 0, 0, Math.PI * 2); c.stroke();
  c.strokeStyle = 'rgba(240,214,168,.55)';
  c.lineWidth = 3;
  c.beginPath(); c.ellipse(0, 0, pr * 2.15, pr * 0.62, 0, 0, Math.PI * 2); c.stroke();
  c.restore();

  const pg = c.createRadialGradient(px - 12, py - 12, 4, px, py, pr);
  pg.addColorStop(0, '#f0c98a');
  pg.addColorStop(0.7, '#cf9a5c');
  pg.addColorStop(1, '#9b6f42');
  c.fillStyle = pg;
  c.beginPath(); c.arc(px, py, pr, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(155,111,66,.5)';
  for (let i = 0; i < 3; i++) {
    c.fillRect(px - pr, py - 14 + i * 12, pr * 2, 4);
  }

  // the near half of the ring, drawn over the planet
  c.save();
  c.translate(px, py);
  c.rotate(-0.42);
  c.strokeStyle = '#e6b878';
  c.lineWidth = 7;
  c.beginPath(); c.ellipse(0, 0, pr * 1.85, pr * 0.5, 0, 0, Math.PI); c.stroke();
  c.restore();

  /* A comet coming in from the top right. */
  c.save();
  const cx0 = 448, cy0 = 34;
  const tail = c.createLinearGradient(cx0, cy0, cx0 - 96, cy0 + 64);
  tail.addColorStop(0, 'rgba(190,230,255,.85)');
  tail.addColorStop(1, 'rgba(190,230,255,0)');
  c.strokeStyle = tail;
  c.lineWidth = 5;
  c.lineCap = 'round';
  c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0 - 96, cy0 + 64); c.stroke();
  c.fillStyle = '#eaf7ff';
  c.beginPath(); c.arc(cx0, cy0, 5, 0, Math.PI * 2); c.fill();
  c.restore();

  /* The ground she is looking up from. */
  c.fillStyle = '#241b33';
  c.beginPath();
  c.moveTo(0, H);
  c.lineTo(0, H - 44);
  c.quadraticCurveTo(W * 0.3, H - 74, W * 0.55, H - 48);
  c.quadraticCurveTo(W * 0.8, H - 26, W, H - 56);
  c.lineTo(W, H);
  c.closePath();
  c.fill();
  c.fillStyle = 'rgba(120,110,170,.22)';
  c.fillRect(0, H - 6, W, 6);

  // a small observatory dome on the ridge
  c.fillStyle = '#3a2f4e';
  c.fillRect(398, H - 78, 40, 26);
  c.beginPath(); c.arc(418, H - 78, 20, Math.PI, 0); c.fill();
  c.fillStyle = '#5b4a75';
  c.fillRect(414, H - 96, 8, 20);
}

const Jigsaw = (() => {
  let board, tray, onDone;
  let pieces = [], slots = [], picked = null, placed = 0;

  function build(container, done) {
    onDone = done;
    board = container;
    picked = null;
    placed = 0;
    pieces = [];
    slots = [];

    const src = document.createElement('canvas');
    src.width = JIG.w;
    src.height = JIG.h;
    paintNightSky(src);

    const boardEl = board.querySelector('.jig-board');
    tray = board.querySelector('.jig-tray');
    boardEl.innerHTML = '';
    tray.innerHTML = '';
    boardEl.style.gridTemplateColumns = `repeat(${JIG.cols}, 1fr)`;

    const pw = JIG.w / JIG.cols, ph = JIG.h / JIG.rows;
    const order = [];

    for (let r = 0; r < JIG.rows; r++) {
      for (let c = 0; c < JIG.cols; c++) {
        const i = r * JIG.cols + c;
        order.push(i);

        const slot = document.createElement('button');
        slot.type = 'button';
        slot.className = 'jig-slot';
        slot.style.aspectRatio = `${pw} / ${ph}`;
        slot.onclick = () => drop(i);
        boardEl.appendChild(slot);
        slots.push(slot);

        // the piece itself, cut out of the painted picture
        const cv = document.createElement('canvas');
        cv.width = pw;
        cv.height = ph;
        const cc = cv.getContext('2d');
        cc.drawImage(src, c * pw, r * ph, pw, ph, 0, 0, pw, ph);
        pieces.push({ index: i, url: cv.toDataURL(), placed: false });
      }
    }

    /* Tipped out of the box: shuffled, but never left in solved order. */
    let shuffled;
    do {
      shuffled = order.slice();
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (shuffled.every((v, i) => v === i));

    for (const i of shuffled) {
      const p = pieces[i];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'jig-piece';
      b.style.backgroundImage = `url(${p.url})`;
      b.style.aspectRatio = `${pw} / ${ph}`;
      b.onclick = () => pick(i, b);
      p.el = b;
      tray.appendChild(b);
    }

    count();
  }

  function pick(i, el) {
    if (pieces[i].placed) return;
    const already = picked === i;
    for (const p of pieces) p.el && p.el.classList.remove('is-picked');
    if (already) { picked = null; return; }
    picked = i;
    el.classList.add('is-picked');
    if (typeof Sound !== 'undefined') Sound.play('talk');
  }

  function drop(slotIndex) {
    if (picked == null) return;
    const p = pieces[picked];
    /* Wrong space, nothing happens: the piece stays in her hand. */
    if (p.index !== slotIndex) {
      slots[slotIndex].classList.add('is-nope');
      setTimeout(() => slots[slotIndex].classList.remove('is-nope'), 260);
      return;
    }

    const slot = slots[slotIndex];
    slot.style.backgroundImage = `url(${p.url})`;
    slot.classList.add('is-filled');
    p.placed = true;
    p.el.remove();
    picked = null;
    placed++;
    if (typeof Sound !== 'undefined') Sound.play('pickup');
    count();

    if (placed === pieces.length) {
      board.querySelector('.jig-board').classList.add('is-done');
      if (typeof Sound !== 'undefined') Sound.play('clear');
      setTimeout(() => {
        board.querySelector('.jig-board').classList.remove('is-done');
        onDone && onDone();
      }, 1600);
    }
  }

  function count() {
    const left = pieces.length - placed;
    board.querySelector('.jig-count').textContent =
      left ? `${left} piece${left === 1 ? '' : 's'} still on the floor`
           : 'finished';
    board.classList.toggle('art-ready', !left);
  }

  return { build };
})();
