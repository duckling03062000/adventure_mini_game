/* ------------------------------------------------------------------
   Shared level builder.

   Levels are assembled from chunks against a moving cursor rather than
   written as 200-character string literals, so they stay editable.
------------------------------------------------------------------- */

const GRID_H = 12;
const GROUND_Y = 10;   // tile row of the walking surface
const CEIL_Y = 4;      // indoor ceiling occupies rows 0..CEIL_Y-1

function makeBuilder(height = GRID_H) {
  const cols = [];
  const props = [];
  const checkpoints = [];
  let cursor = 0;
  let groundTile = '#';
  let indoor = false;
  const indoorSpans = [];   // tile ranges that need an interior back wall

  function col(x) {
    while (cols.length <= x) cols.push(new Array(height).fill('.'));
    return cols[x];
  }
  function set(x, y, c) { if (y >= 0 && y < height) col(x)[y] = c; }

  /* Lay the floor at `cursor`, plus a ceiling when we are indoors —
     the ceiling is what hides the sky, so no theme switching is needed. */
  function ground(x, top = GROUND_Y) {
    for (let y = top; y < height; y++) set(x, y, groundTile);
    if (indoor) for (let y = 0; y < CEIL_Y; y++) set(x, y, 'S');
  }

  const api = {
    get x() { return cursor; },
    prop(type, x = cursor, extra = {}) { props.push({ type, x, ...extra }); return api; },

    /* Switch between street and building interior. */
    outdoors() {
      if (indoor && indoorSpans.length) indoorSpans[indoorSpans.length - 1].to = cursor;
      groundTile = '#'; indoor = false; return api;
    },
    indoors() {
      if (!indoor) indoorSpans.push({ from: cursor, to: Infinity });
      groundTile = 'F'; indoor = true; return api;
    },

    flat(n, opts = {}) {
      for (let i = 0; i < n; i++) {
        ground(cursor);
        if (opts.puddleAt && opts.puddleAt.includes(i)) set(cursor, GROUND_Y - 1, 'x');
        cursor++;
      }
      return api;
    },
    gap(n) { for (let i = 0; i < n; i++) { col(cursor); if (indoor) for (let y = 0; y < CEIL_Y; y++) set(cursor, y, 'S'); cursor++; } return api; },

    /* A stack of solid boxes: crates on the street, chairs in a classroom. */
    crates(h, n = 1, tile = 'C') {
      for (let i = 0; i < n; i++) {
        ground(cursor);
        for (let k = 1; k <= h; k++) set(cursor, GROUND_Y - k, tile);
        cursor++;
      }
      return api;
    },
    /* A solid block you climb rather than clear. */
    block(w, h, tile = 'B', propType = null) {
      const startX = cursor;
      for (let i = 0; i < w; i++) {
        ground(cursor);
        for (let k = 1; k <= h; k++) set(cursor, GROUND_Y - k, tile);
        cursor++;
      }
      if (propType) props.push({ type: propType, x: startX, w, h });
      return api;
    },
    bus(w = 5, h = 3) { return api.block(w, h, 'B', 'bus'); },
    auto() {
      api.block(2, 1, 'B', null);
      props.push({ type: 'auto', x: cursor - 2 });
      return api;
    },
    /* A rising staircase, then flat on top. */
    steps(n, top = 1) {
      for (let i = 0; i < n; i++) {
        ground(cursor);
        for (let k = 1; k <= i + top; k++) set(cursor, GROUND_Y - k, 'B');
        cursor++;
      }
      return api;
    },
    /* Platforms you can jump up through. */
    ledges(n, up = 3) {
      for (let i = 0; i < n; i++) { ground(cursor); set(cursor, GROUND_Y - up, '='); cursor++; }
      return api;
    },
    checkpoint() {
      checkpoints.push(cursor);
      ground(cursor);
      props.push({ type: 'checkpoint', x: cursor });
      cursor++;
      return api;
    },

    /* A building frontage. The last few tiles are a covered portico,
       open at head height, so you can walk in rather than into a wall. */
    frontage(w, tile, propType, extra = {}) {
      const startX = cursor;
      const doorX = startX + (extra.doorOffset ?? 4);
      const openTo = extra.openAll ? startX + w : doorX + 1;
      for (let i = 0; i < w; i++) {
        const x = cursor;
        ground(x);
        const walkThrough = x <= openTo;
        for (let y = 2; y < GROUND_Y; y++) {
          if (walkThrough && y >= GROUND_Y - 3) continue;
          set(x, y, tile);
        }
        cursor++;
      }
      props.push({ type: propType, x: startX, w, doorX, ...extra });
      return { goalX: doorX * 16, doorX, startX };
    },

    build(meta = {}) {
      if (indoor && indoorSpans.length) indoorSpans[indoorSpans.length - 1].to = cursor;
      const rows = [];
      for (let y = 0; y < height; y++) rows.push(cols.map(c => c[y]).join(''));
      return new Level(rows, { props, checkpoints, indoorSpans, theme: 'monsoon', ...meta });
    }
  };
  return api;
}
