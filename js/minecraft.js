/* ------------------------------------------------------------------
   Blocks — Level 8, the second game of the night.

   A plan on the left, an empty plot on the right, and a hotbar along
   the bottom. Pick a block, then click or drag across the plot to put
   it where the plan says it goes.

   The ground is already there. A block in the wrong place simply does
   not stick, so there is nothing to undo and nothing to lose.
------------------------------------------------------------------- */

const MINE = {
  /* G grass  E earth  S stone  W wood  N glass  O door  T torch  . air
     The bottom two rows are the ground and come free. */
  plan: [
    '...........',
    '.....T.....',
    '...WWWWW...',
    '..WWWWWWW..',
    '..SNSSSNS..',
    '..SSOOOSS..',
    'GGGGGGGGGGG',
    'EEEEEEEEEEE'
  ],
  given: 'GE',                       // already on the plot when she starts
  blocks: {
    G: { name: 'Grass', top: '#5f9a3d', side: '#7a5a37' },
    E: { name: 'Dirt',  top: '#8a6440', side: '#7a5a37' },
    S: { name: 'Stone', top: '#9a9a9a', side: '#828282' },
    W: { name: 'Wood',  top: '#a3763f', side: '#8a6234' },
    N: { name: 'Glass', top: '#b6dced', side: '#9cc6d8' },
    O: { name: 'Door',  top: '#7a5330', side: '#5e3f24' },
    T: { name: 'Torch', top: '#f2c14a', side: '#8a6234' }
  },
  /* What she can actually place. Grass and dirt are already down. */
  hotbar: ['S', 'W', 'N', 'O', 'T']
};

const Minecraft = (() => {
  let board, cells = [], placed, need, picked, onDone;
  let dragging = false;

  const W = () => MINE.plan[0].length;
  const H = () => MINE.plan.length;

  function build(container, done) {
    board = container;
    onDone = done;
    cells = [];
    placed = 0;
    need = 0;
    picked = MINE.hotbar[0];
    dragging = false;

    /* The plan, drawn small. */
    const planEl = board.querySelector('.mc-plan');
    planEl.innerHTML = '';
    planEl.style.gridTemplateColumns = `repeat(${W()}, 1fr)`;
    for (let y = 0; y < H(); y++) {
      for (let x = 0; x < W(); x++) {
        const ch = MINE.plan[y][x];
        const d = document.createElement('div');
        d.className = 'mc-pcell';
        if (ch !== '.') paint(d, ch);
        planEl.appendChild(d);
      }
    }

    /* The plot, with the ground already down. */
    const plotEl = board.querySelector('.mc-plot');
    plotEl.innerHTML = '';
    plotEl.style.gridTemplateColumns = `repeat(${W()}, 1fr)`;
    for (let y = 0; y < H(); y++) {
      cells.push([]);
      for (let x = 0; x < W(); x++) {
        const ch = MINE.plan[y][x];
        const d = document.createElement('div');
        d.className = 'mc-cell';
        const free = MINE.given.includes(ch);
        if (free) { paint(d, ch); d.dataset.done = '1'; }
        else if (ch !== '.') need++;
        if (ch !== '.' && !free) {
          d.onmousedown = e => { e.preventDefault(); dragging = true; put(x, y); };
          d.onmouseenter = () => { if (dragging) put(x, y); };
        }
        plotEl.appendChild(d);
        cells[y].push(d);
      }
    }
    document.addEventListener('mouseup', stop);

    /* The hotbar. */
    const bar = board.querySelector('.mc-bar');
    bar.innerHTML = '';
    for (const key of MINE.hotbar) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mc-slot' + (key === picked ? ' is-on' : '');
      const sw = document.createElement('span');
      paint(sw, key);
      b.appendChild(sw);
      const cap = document.createElement('i');
      cap.textContent = MINE.blocks[key].name;
      b.appendChild(cap);
      b.onclick = () => {
        picked = key;
        for (const o of bar.children) o.classList.remove('is-on');
        b.classList.add('is-on');
        if (typeof Sound !== 'undefined') Sound.play('talk');
      };
      bar.appendChild(b);
    }

    count();
  }

  /* A block: a lit top face and a darker body, which is all a block
     needs to look like a block at this size. */
  function paint(el, ch) {
    const b = MINE.blocks[ch];
    el.style.background = b.side;
    el.style.boxShadow = `inset 0 3px 0 ${b.top}`;
    if (ch === 'N') el.style.opacity = '.75';
    if (ch === 'T') el.style.boxShadow = `inset 0 -6px 0 ${b.side}, inset 0 4px 0 ${b.top}`;
  }

  function stop() { dragging = false; }

  function put(x, y) {
    const cell = cells[y][x];
    if (cell.dataset.done) return;
    /* The wrong block just does not stick. */
    if (MINE.plan[y][x] !== picked) {
      cell.classList.add('is-nope');
      setTimeout(() => cell.classList.remove('is-nope'), 200);
      return;
    }
    paint(cell, picked);
    cell.dataset.done = '1';
    cell.classList.add('is-set');
    placed++;
    if (typeof Sound !== 'undefined') Sound.play('step');
    count();

    if (placed >= need) {
      dragging = false;
      board.querySelector('.mc-plot').classList.add('is-done');
      if (typeof Sound !== 'undefined') Sound.play('clear');
      setTimeout(() => {
        board.querySelector('.mc-plot').classList.remove('is-done');
        document.removeEventListener('mouseup', stop);
        onDone && onDone();
      }, 1700);
    }
  }

  function count() {
    const left = need - placed;
    board.querySelector('.mc-count').textContent =
      left ? `${left} block${left === 1 ? '' : 's'} to go` : 'built';
    board.classList.toggle('art-ready', !left);
  }

  return { build };
})();
