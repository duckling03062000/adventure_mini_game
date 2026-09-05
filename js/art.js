/* ------------------------------------------------------------------
   The art board — Level 3, scene 3.

   A pen-and-ink line drawing of the hummingbird from the book's cover.
   Every lettered cell is a region waiting for colour; '#' is ink and
   cannot be painted; '.' is paper and is left alone.

   There is no right answer. Any colour anywhere is accepted — it is
   her painting. The level asks only that she finishes it.
------------------------------------------------------------------- */

const ART = {
  /* 22 wide. b=body w=wing t=throat k=beak p=petals c=centre s=stem l=leaf */
  grid: [
    '.................#....',
    '....#####......##p##..',
    '...#wwwww#....#ppppp#.',
    '..#wwwwwww#...#ppcpp#.',
    '..#wwwwwww#..#ppcccpp#',
    '...#wwwww##...#ppcpp#.',
    '..#bbbbbbbb####ppppp#.',
    '.#bbbbbbbttkkkk##s##..',
    '#bbbbbbbbbb######s#...',
    '#bbbbbbbb##.#lll#s#...',
    '.########..#llllls#...',
    '............#lll#s#...',
    '.............####s#...'
  ],
  /* A watercolour box. The first swatch is the eraser. */
  palette: [
    { name: 'erase',  hex: null },
    { name: 'ruby',   hex: '#c8324b' },
    { name: 'red',    hex: '#e04b32' },
    { name: 'orange', hex: '#ef8a3c' },
    { name: 'yellow', hex: '#f5cd24' },
    { name: 'lime',   hex: '#a9c93f' },
    { name: 'green',  hex: '#3f8f4a' },
    { name: 'teal',   hex: '#2f9c8f' },
    { name: 'sky',    hex: '#4aa8d8' },
    { name: 'blue',   hex: '#3c62b4' },
    { name: 'violet', hex: '#7d5bbe' },
    { name: 'pink',   hex: '#e884a8' },
    { name: 'brown',  hex: '#8a5a34' },
    { name: 'cream',  hex: '#f2e6c8' }
  ],
  ink: '#241b26',
  paper: '#fbf6ea'
};

const Art = (() => {
  let board, cells, painted, fillable, chosen, onDone;
  let dragging = false;
  let submitted = false;

  function build(container, done) {
    onDone = done;
    submitted = false;
    board = container;
    painted = new Map();
    fillable = 0;
    cells = [];

    const rows = ART.grid;
    const w = rows[0].length;

    const gridEl = board.querySelector('.art-grid');
    gridEl.style.gridTemplateColumns = `repeat(${w}, 1fr)`;
    gridEl.innerHTML = '';

    rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const d = document.createElement('div');
        d.className = 'art-cell';
        const key = `${x},${y}`;
        if (ch === '#') {
          d.classList.add('ink');
        } else if (ch === '.') {
          d.classList.add('paper');
        } else {
          d.classList.add('fill');
          d.dataset.key = key;
          fillable++;
        }
        gridEl.appendChild(d);
        cells.push({ el: d, ch, key });
      });
    });

    /* palette */
    const palEl = board.querySelector('.art-palette');
    palEl.innerHTML = '';
    ART.palette.forEach((p, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'art-swatch' + (p.hex ? '' : ' art-swatch--erase');
      btn.title = p.name;
      if (p.hex) btn.style.background = p.hex;
      btn.addEventListener('click', () => choose(i));
      palEl.appendChild(btn);
    });
    choose(1);

    /* painting: click, or hold and drag across */
    const paintFrom = e => {
      const t = document.elementFromPoint(
        e.clientX ?? e.touches?.[0].clientX,
        e.clientY ?? e.touches?.[0].clientY
      );
      if (t && t.classList.contains('fill')) paint(t);
    };
    gridEl.addEventListener('pointerdown', e => {
      dragging = true;
      gridEl.setPointerCapture?.(e.pointerId);
      paintFrom(e);
    });
    gridEl.addEventListener('pointermove', e => { if (dragging) paintFrom(e); });
    addEventListener('pointerup', () => { dragging = false; });

    board.querySelector('.art-submit').addEventListener('click', submit);
    update();
  }

  function choose(i) {
    chosen = ART.palette[i];
    board.querySelectorAll('.art-swatch').forEach((b, j) =>
      b.classList.toggle('is-on', j === i));
  }

  function paint(el) {
    const key = el.dataset.key;
    if (chosen.hex) {
      if (painted.get(key) === chosen.hex) return;
      painted.set(key, chosen.hex);
      el.style.background = chosen.hex;
      el.classList.add('done');
      if (typeof Sound !== 'undefined') Sound.play('brush');
    } else {
      if (!painted.has(key)) return;
      painted.delete(key);
      el.style.background = '';
      el.classList.remove('done');
    }
    update();
  }

  function update() {
    const n = painted.size;
    const left = fillable - n;
    board.querySelector('.art-count').textContent =
      left === 0 ? 'finished' : `${left} squares left`;
    const btn = board.querySelector('.art-submit');
    btn.disabled = left !== 0;
    board.classList.toggle('art-ready', left === 0);
  }

  function submit() {
    if (submitted || painted.size !== fillable) return;
    submitted = true;
    // The button keeps keyboard focus after the board is hidden, so a
    // later ENTER would re-fire it and restart the ending. Let it go.
    board.querySelector('.art-submit').blur();
    if (typeof Sound !== 'undefined') Sound.play('clear');
    onDone && onDone();
  }

  /* Redraw the finished painting onto a canvas, for the ending scene. */
  function drawTo(ctx, x, y, cell) {
    const rows = ART.grid;
    for (let gy = 0; gy < rows.length; gy++) {
      for (let gx = 0; gx < rows[gy].length; gx++) {
        const ch = rows[gy][gx];
        if (ch === '.') continue;
        const col = ch === '#' ? ART.ink : (painted.get(`${gx},${gy}`) || ART.paper);
        ctx.fillStyle = col;
        ctx.fillRect(x + gx * cell, y + gy * cell, cell, cell);
      }
    }
  }

  return { build, drawTo, get size() { return [ART.grid[0].length, ART.grid.length]; } };
})();
