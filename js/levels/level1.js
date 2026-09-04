/* ------------------------------------------------------------------
   LEVEL 1 — THE BIRTH
   Bangalore, 6 September 2002. Heavy monsoon rain.
   The goal is the hospital, across the city. Only the signboard on the
   building names it — the writing never does.

   Act 1: Papa has to get across a flooded city. Broken road,
          barricades, a stalled BMTC bus, a parked auto.
   Act 2: Mumma has to get there too, and cannot jump the way Papa
          can, so the route is gentler — that difference is the point.
------------------------------------------------------------------- */

const GRID_H = 12;
const GROUND_Y = 10;   // tile row of the road surface

/* Small builder so the maps stay readable instead of being 200-char
   string literals nobody can safely edit. */
function makeBuilder(height) {
  const cols = [];
  const props = [];
  const checkpoints = [];
  let cursor = 0;

  function col(x) {
    while (cols.length <= x) cols.push(new Array(height).fill('.'));
    return cols[x];
  }
  function set(x, y, c) { if (y >= 0 && y < height) col(x)[y] = c; }
  function ground(x, top = GROUND_Y) { for (let y = top; y < height; y++) set(x, y, '#'); }

  const api = {
    get x() { return cursor; },
    prop(type, x = cursor, extra = {}) { props.push({ type, x, ...extra }); return api; },

    flat(n, opts = {}) {
      for (let i = 0; i < n; i++) {
        ground(cursor);
        if (opts.puddleAt && opts.puddleAt.includes(i)) set(cursor, GROUND_Y - 1, 'x');
        cursor++;
      }
      return api;
    },
    /* A hole in the road. Fall in and you go back to the last checkpoint. */
    gap(n) { for (let i = 0; i < n; i++) { col(cursor); cursor++; } return api; },

    crates(h, n = 1) {
      for (let i = 0; i < n; i++) {
        ground(cursor);
        for (let k = 1; k <= h; k++) set(cursor, GROUND_Y - k, 'C');
        cursor++;
      }
      return api;
    },
    /* A stalled bus: a solid block you climb rather than clear. */
    bus(w = 5, h = 3) {
      for (let i = 0; i < w; i++) {
        ground(cursor);
        for (let k = 1; k <= h; k++) set(cursor, GROUND_Y - k, 'B');
        cursor++;
      }
      props.push({ type: 'bus', x: cursor - w, w, h });
      return api;
    },
    /* A parked auto-rickshaw. Low enough to clear in one hop. */
    auto() {
      for (let i = 0; i < 2; i++) {
        ground(cursor);
        set(cursor, GROUND_Y - 1, 'B');
        cursor++;
      }
      props.push({ type: 'auto', x: cursor - 2 });
      return api;
    },
    /* Scaffolding ledges you can jump up through. */
    ledges(n, up = 3) {
      for (let i = 0; i < n; i++) { ground(cursor); set(cursor, GROUND_Y - up, '='); cursor++; }
      return api;
    },
    checkpoint() { checkpoints.push(cursor); ground(cursor); props.push({ type: 'checkpoint', x: cursor }); cursor++; return api; },

    /* The hospital. The last few tiles are a covered portico — open at
       head height so you can actually walk in, rather than a flat wall
       standing in front of its own front door. */
    hospital(w = 12) {
      const startX = cursor;
      const doorX = startX + 4;
      for (let i = 0; i < w; i++) {
        const x = cursor;
        ground(x);
        const walkThrough = x <= doorX + 1;
        for (let y = 2; y < GROUND_Y; y++) {
          if (walkThrough && y >= GROUND_Y - 3) continue;
          set(x, y, 'W');
        }
        cursor++;
      }
      props.push({ type: 'hospital', x: startX, w, doorX });
      return { goalX: doorX * 16, startX };
    },

    build(meta = {}) {
      const rows = [];
      for (let y = 0; y < height; y++) rows.push(cols.map(c => c[y]).join(''));
      return new Level(rows, { props, checkpoints, ...meta });
    }
  };
  return api;
}

/* ------------------------------- ACT 1 ---------------------------- */
/* Papa's run. Long, broken, and deliberately demanding. */
function buildAct1() {
  const b = makeBuilder(GRID_H);
  b.prop('streetlight', 4);
  b.flat(14, { puddleAt: [9] });
  b.gap(3);
  b.flat(6);
  b.crates(1);
  b.flat(4);
  b.crates(2);
  b.flat(6, { puddleAt: [2] });
  b.gap(3);
  b.prop('streetlight');
  b.flat(3);
  b.auto();
  b.flat(3);
  b.checkpoint();
  b.flat(5);
  b.crates(1);
  b.bus(5, 3);
  b.flat(5);
  b.gap(3);
  b.flat(4);
  b.crates(2, 2);
  b.flat(7, { puddleAt: [3] });
  b.ledges(4, 4);
  b.flat(3);
  b.gap(3);
  b.prop('streetlight');
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.crates(3);
  b.flat(3);
  b.gap(3);
  b.flat(3);
  b.auto();
  b.flat(2);
  b.crates(1);
  b.bus(6, 3);
  b.flat(6, { puddleAt: [1, 4] });
  b.gap(3);
  b.flat(8);
  b.prop('streetlight');
  b.checkpoint();
  b.flat(6);
  const goal = b.hospital(12);
  b.flat(6);
  return b.build({ goalX: goal.goalX, name: 'act1' });
}

/* ------------------------------- ACT 2 ---------------------------- */
/* Mumma's walk. No holes she can fall into, nothing she cannot step
   over. Shorter, but she moves slowly, so it does not feel short. */
function buildAct2() {
  const b = makeBuilder(GRID_H);
  b.prop('streetlight', 3);
  b.flat(12, { puddleAt: [7] });
  b.crates(1);
  b.flat(8, { puddleAt: [3] });
  b.checkpoint();
  b.flat(6);
  b.auto();
  b.flat(5);
  b.ledges(3, 2);
  b.flat(6, { puddleAt: [2] });
  b.prop('streetlight');
  b.checkpoint();
  b.flat(7);
  b.crates(1, 2);
  b.flat(9, { puddleAt: [4] });
  b.crates(1);
  b.flat(6);
  b.prop('streetlight');
  b.checkpoint();
  b.flat(5);
  const goal = b.hospital(12);
  b.flat(6);
  return b.build({ goalX: goal.goalX, name: 'act2' });
}
