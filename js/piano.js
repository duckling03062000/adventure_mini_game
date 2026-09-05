/* ------------------------------------------------------------------
   The piano lesson — Level 4, scene 3.

   Her teacher sets her a tune and she plays it back a note at a time.
   The next note is lit on the keyboard, so it can be followed by
   looking rather than by reading music. A wrong key is not punished;
   it just does not advance. There is no failing this, only finishing.
------------------------------------------------------------------- */

const PIANO = {
  /* One octave of white keys, and the row of letters under them. */
  keys: [
    { note: 'C4', label: 'C', key: 'KeyA' },
    { note: 'D4', label: 'D', key: 'KeyS' },
    { note: 'E4', label: 'E', key: 'KeyD' },
    { note: 'F4', label: 'F', key: 'KeyF' },
    { note: 'G4', label: 'G', key: 'KeyG' },
    { note: 'A4', label: 'A', key: 'KeyH' },
    { note: 'B4', label: 'B', key: 'KeyJ' },
    { note: 'C5', label: 'C', key: 'KeyK' }
  ],
  /* Twinkle Twinkle Little Star — what everybody's first lesson is. */
  song: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
  title: 'Twinkle, Twinkle, Little Star'
};

const Piano = (() => {
  let board, keyEls = [], noteEls = [], at = 0, onDone = null, live = false;

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    live = true;

    board.querySelector('.piano-song').textContent = PIANO.title;

    // the tune, as a row of chips
    const strip = board.querySelector('.piano-strip');
    strip.innerHTML = '';
    noteEls = PIANO.song.map(i => {
      const d = document.createElement('span');
      d.className = 'piano-note';
      d.textContent = PIANO.keys[i].label;
      strip.appendChild(d);
      return d;
    });

    // the keyboard
    const kb = board.querySelector('.piano-keys');
    kb.innerHTML = '';
    keyEls = PIANO.keys.map((k, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'piano-key';
      b.innerHTML = `<span class="pk-note">${k.label}</span>` +
                    `<span class="pk-key">${k.key.slice(3)}</span>`;
      b.addEventListener('click', () => { b.blur(); hit(i); });
      kb.appendChild(b);
      return b;
    });

    addEventListener('keydown', onKey);
    update();
  }

  function onKey(e) {
    if (!live) return;
    const i = PIANO.keys.findIndex(k => k.key === e.code);
    if (i >= 0) { e.preventDefault(); hit(i); }
  }

  function hit(i) {
    if (!live) return;
    const k = PIANO.keys[i];
    Sound.note(k.note);
    keyEls[i].classList.add('is-hit');
    setTimeout(() => keyEls[i].classList.remove('is-hit'), 140);

    if (i !== PIANO.song[at]) {
      // a wrong note is just a wrong note
      keyEls[i].classList.add('is-off');
      setTimeout(() => keyEls[i].classList.remove('is-off'), 220);
      return;
    }

    noteEls[at].classList.add('done');
    at++;
    if (at >= PIANO.song.length) return finish();
    update();
  }

  function update() {
    noteEls.forEach((n, i) => n.classList.toggle('now', i === at));
    const want = PIANO.song[at];
    keyEls.forEach((k, i) => k.classList.toggle('is-next', i === want));
    board.querySelector('.piano-count').textContent =
      `${PIANO.song.length - at} notes to go`;
  }

  function finish() {
    live = false;
    removeEventListener('keydown', onKey);
    keyEls.forEach(k => k.classList.remove('is-next'));
    board.querySelector('.piano-count').textContent = 'that was it';
    // let the last note ring before the room comes back
    setTimeout(() => { Sound.play('clear'); onDone && onDone(); }, 700);
  }

  return { build };
})();
