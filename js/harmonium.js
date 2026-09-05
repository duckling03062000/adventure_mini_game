/* ------------------------------------------------------------------
   The harmonium lesson — Level 4, after the bow.

   A harmonium is a keyboard you have to keep alive: one hand plays,
   the other pumps the bellows, and if you stop pumping the reeds go
   quiet mid-phrase. So this is not the piano again — it is the piano
   plus the thing that actually makes a harmonium hard.
------------------------------------------------------------------- */

const HARMONIUM = {
  keys: [
    { note: 'C4', label: 'C', key: 'KeyA' },
    { note: 'D4', label: 'D', key: 'KeyS' },
    { note: 'E4', label: 'E', key: 'KeyD' },
    { note: 'F4', label: 'F', key: 'KeyF' },
    { note: 'G4', label: 'G', key: 'KeyG' },
    { note: 'A4', label: 'A', key: 'KeyH' },
    { note: 'B4', label: 'B', key: 'KeyJ' },
    { note: 'C5', label: 'C', key: 'KeyK' },
    { note: 'D5', label: 'D', key: 'KeyL' }
  ],
  /* Happy Birthday: G G A G C B | G G A G D C */
  song: [4, 4, 5, 4, 7, 6, 4, 4, 5, 4, 8, 7],
  title: 'Happy Birthday to You',
  drain: 0.075,     // air lost per second — present, but not nagging
  pump: 0.55        // air gained per pump
};

const Harmonium = (() => {
  let board, keyEls = [], noteEls = [], bellowsEl, airEl;
  let at = 0, air = 1, onDone = null, live = false, timer = null;

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    air = 1;
    live = true;

    board.querySelector('.harm-song').textContent = HARMONIUM.title;

    const strip = board.querySelector('.harm-strip');
    strip.innerHTML = '';
    noteEls = HARMONIUM.song.map(i => {
      const d = document.createElement('span');
      d.className = 'harm-note';
      d.textContent = HARMONIUM.keys[i].label;
      strip.appendChild(d);
      return d;
    });

    const kb = board.querySelector('.harm-keys');
    kb.innerHTML = '';
    keyEls = HARMONIUM.keys.map((k, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'harm-key';
      b.innerHTML = `<span class="hk-note">${k.label}</span>` +
                    `<span class="hk-key">${k.key.slice(3)}</span>`;
      b.addEventListener('click', () => { b.blur(); hit(i); });
      kb.appendChild(b);
      return b;
    });

    bellowsEl = board.querySelector('.harm-bellows');
    airEl = board.querySelector('.harm-air-fill');
    bellowsEl.onclick = () => { bellowsEl.blur(); pump(); };

    addEventListener('keydown', onKey);
    clearInterval(timer);
    timer = setInterval(tick, 100);
    update();
  }

  function onKey(e) {
    if (!live) return;
    if (e.code === 'Space') { e.preventDefault(); pump(); return; }
    const i = HARMONIUM.keys.findIndex(k => k.key === e.code);
    if (i >= 0) { e.preventDefault(); hit(i); }
  }

  function pump() {
    if (!live) return;
    air = Math.min(1, air + HARMONIUM.pump);
    bellowsEl.classList.add('is-pump');
    setTimeout(() => bellowsEl.classList.remove('is-pump'), 160);
    Sound.play('step');
    paintAir();
  }

  function tick() {
    if (!live) return;
    air = Math.max(0, air - HARMONIUM.drain / 10);
    paintAir();
  }

  function paintAir() {
    airEl.style.width = `${Math.round(air * 100)}%`;
    board.classList.toggle('no-air', air <= 0.02);
  }

  function hit(i) {
    if (!live) return;
    if (air <= 0.02) {
      // no air, no note — pump first
      bellowsEl.classList.add('is-need');
      setTimeout(() => bellowsEl.classList.remove('is-need'), 320);
      return;
    }
    Sound.note(HARMONIUM.keys[i].note);
    keyEls[i].classList.add('is-hit');
    setTimeout(() => keyEls[i].classList.remove('is-hit'), 140);

    if (i !== HARMONIUM.song[at]) {
      keyEls[i].classList.add('is-off');
      setTimeout(() => keyEls[i].classList.remove('is-off'), 220);
      return;
    }
    noteEls[at].classList.add('done');
    at++;
    if (at >= HARMONIUM.song.length) return finish();
    update();
  }

  function update() {
    noteEls.forEach((n, i) => n.classList.toggle('now', i === at));
    keyEls.forEach((k, i) => k.classList.toggle('is-next', i === HARMONIUM.song[at]));
    board.querySelector('.harm-count').textContent =
      `${HARMONIUM.song.length - at} notes to go`;
    paintAir();
  }

  function finish() {
    live = false;
    clearInterval(timer);
    removeEventListener('keydown', onKey);
    keyEls.forEach(k => k.classList.remove('is-next'));
    board.querySelector('.harm-count').textContent = 'that was it';
    setTimeout(() => { Sound.play('clear'); onDone && onDone(); }, 700);
  }

  return { build };
})();
