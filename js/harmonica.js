/* ------------------------------------------------------------------
   The harmonica lesson — Level 4, after the bow.

   Six holes. The tune tells her which hole and whether to blow or
   draw; the hole lights up, and the arrow says which way the breath
   goes. As with the piano, a wrong hole simply does not count.
------------------------------------------------------------------- */

const HARMONICA = {
  /* A hole gives one note blown and another drawn. */
  holes: [
    { blow: 'C4', draw: 'D4' },
    { blow: 'E4', draw: 'F4' },
    { blow: 'G4', draw: 'A4' },
    { blow: 'B4', draw: 'C5' },
    { blow: 'D5', draw: 'E5' },
    { blow: 'F5', draw: 'G5' }
  ],
  /* Happy Birthday — [hole, blow?] */
  song: [
    [2, true], [2, true], [2, false], [2, true], [3, false], [3, true],
    [2, true], [2, true], [2, false], [2, true], [4, true], [3, false]
  ],
  title: 'Happy Birthday to You'
};

const Harmonica = (() => {
  let board, holeEls = [], noteEls = [], at = 0, onDone = null, live = false;

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    live = true;
    board.querySelector('.harp-song').textContent = HARMONICA.title;

    const strip = board.querySelector('.harp-strip');
    strip.innerHTML = '';
    noteEls = HARMONICA.song.map(([h, blow]) => {
      const d = document.createElement('span');
      d.className = 'harp-note';
      d.innerHTML = `${h + 1}<b>${blow ? '↑' : '↓'}</b>`;
      strip.appendChild(d);
      return d;
    });

    const body = board.querySelector('.harp-holes');
    body.innerHTML = '';
    holeEls = HARMONICA.holes.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'harp-hole';
      b.innerHTML = `<span class="hh-n">${i + 1}</span>`;
      b.addEventListener('click', () => { b.blur(); hit(i); });
      body.appendChild(b);
      return b;
    });

    addEventListener('keydown', onKey);
    update();
  }

  function onKey(e) {
    if (!live) return;
    const i = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6'].indexOf(e.code);
    if (i >= 0) { e.preventDefault(); hit(i); }
  }

  function hit(i) {
    if (!live) return;
    const [want, blow] = HARMONICA.song[at];
    // the tune decides the breath; she only has to find the hole
    Sound.note(HARMONICA.holes[i][i === want ? (blow ? 'blow' : 'draw') : 'blow']);
    holeEls[i].classList.add('is-hit');
    setTimeout(() => holeEls[i].classList.remove('is-hit'), 140);

    if (i !== want) {
      holeEls[i].classList.add('is-off');
      setTimeout(() => holeEls[i].classList.remove('is-off'), 220);
      return;
    }
    noteEls[at].classList.add('done');
    at++;
    if (at >= HARMONICA.song.length) return finish();
    update();
  }

  function update() {
    noteEls.forEach((n, i) => n.classList.toggle('now', i === at));
    const [want, blow] = HARMONICA.song[at];
    holeEls.forEach((h, i) => {
      h.classList.toggle('is-next', i === want);
      h.classList.toggle('is-blow', i === want && blow);
      h.classList.toggle('is-draw', i === want && !blow);
    });
    board.querySelector('.harp-count').textContent =
      `${HARMONICA.song.length - at} notes to go`;
  }

  function finish() {
    live = false;
    removeEventListener('keydown', onKey);
    holeEls.forEach(h => h.classList.remove('is-next', 'is-blow', 'is-draw'));
    board.querySelector('.harp-count').textContent = 'that was it';
    setTimeout(() => { Sound.play('clear'); onDone && onDone(); }, 700);
  }

  return { build };
})();
