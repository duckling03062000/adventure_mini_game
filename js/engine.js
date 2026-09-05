/* ------------------------------------------------------------------
   Platformer engine: input, tilemap collision, camera, rendering.

   World units are 1:1 with sprite pixels (a tile is 16 world px, and
   a character sprite is 22-31 world px tall), so everyone is roughly
   two tiles tall. SCALE only affects how big that world is drawn.
------------------------------------------------------------------- */

const TILE = 16;
const SCALE = 3;
const VIEW_W = 320;          // world px visible horizontally
const VIEW_H = 180;

/* Tile legend used by the level builders */
const SOLID = new Set(['#', 'B', 'C', 'W', 'S', 'F']);
const ONEWAY = new Set(['=']);
const HAZARD = new Set(['x']);

/* ------------------------------ INPUT ----------------------------- */
const Input = (() => {
  const down = new Set();
  const pressed = new Set();
  const MAP = {
    ArrowLeft: 'left', KeyA: 'left',
    ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump',
    Enter: 'confirm', KeyM: 'mute'
  };

  addEventListener('keydown', e => {
    const a = MAP[e.code];
    if (!a) return;
    if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    if (!down.has(a)) pressed.add(a);
    down.add(a);
  });
  addEventListener('keyup', e => {
    const a = MAP[e.code];
    if (a) down.delete(a);
  });
  addEventListener('blur', () => down.clear());

  return {
    held: a => down.has(a),
    /* True once per physical press, and CONSUMED on read.
       update() runs several times per frame on the fixed timestep while
       the buffer is cleared only once per frame, so a non-consuming
       version reported the same press on every substep - one ENTER
       could advance five lines of dialogue at once. */
    tapped(a) {
      if (!pressed.has(a)) return false;
      pressed.delete(a);
      return true;
    },
    endFrame: () => pressed.clear()
  };
})();

/* ------------------------------ LEVEL ----------------------------- */
class Level {
  constructor(rows, meta = {}) {
    this.rows = rows;
    this.h = rows.length;
    this.w = rows[0].length;
    this.meta = meta;
  }
  at(tx, ty) {
    if (tx < 0 || tx >= this.w || ty < 0 || ty >= this.h) return ty >= this.h ? '.' : '#';
    return this.rows[ty][tx];
  }
  isSolid(tx, ty) { return SOLID.has(this.at(tx, ty)); }
  isOneWay(tx, ty) { return ONEWAY.has(this.at(tx, ty)); }
  isHazard(tx, ty) { return HAZARD.has(this.at(tx, ty)); }
  get pxW() { return this.w * TILE; }
  get pxH() { return this.h * TILE; }
}

/* ------------------------------ ACTOR ----------------------------- */
class Actor {
  constructor(charId, x, y, tuning = {}) {
    this.char = CHARACTERS[charId];
    this.x = x;               // centre
    this.y = y;               // feet
    this.vx = 0;
    this.vy = 0;
    this.w = tuning.w ?? 9;
    this.h = frameHeight(this.char, 'idle');
    this.facing = 1;
    this.onGround = false;
    this.animTime = 0;
    this.stepPhase = 0;

    this.accel = tuning.accel ?? 0.45;
    this.maxSpeed = tuning.maxSpeed ?? 2.0;
    this.friction = tuning.friction ?? 0.35;
    this.gravity = tuning.gravity ?? 0.42;
    this.jumpV = tuning.jumpV ?? -6.6;
    this.maxFall = tuning.maxFall ?? 7;
    this.coyote = 0;
    this.jumpBuffer = 0;
  }

  get left()   { return this.x - this.w / 2; }
  get right()  { return this.x + this.w / 2; }
  get top()    { return this.y - this.h; }
  get bottom() { return this.y; }

  /* Which animation should be showing right now. */
  get anim() {
    if (!this.onGround) return 'jump';
    return Math.abs(this.vx) > 0.25 ? 'walk' : 'idle';
  }
}

/* --------------------------- TILE COLLISION ----------------------- */
/* Resolve one axis at a time — the standard, and the only reliable,
   way to keep an AABB out of a tile grid. */
function moveActor(a, level, dt) {
  // ---- horizontal ----
  a.x += a.vx * dt;
  const ty0 = Math.floor(a.top / TILE);
  const ty1 = Math.floor((a.bottom - 0.01) / TILE);

  if (a.vx !== 0) {
    const dir = Math.sign(a.vx);
    const edge = dir > 0 ? a.right : a.left;
    const tx = Math.floor(edge / TILE);
    for (let ty = ty0; ty <= ty1; ty++) {
      if (level.isSolid(tx, ty)) {
        a.x = dir > 0 ? tx * TILE - a.w / 2 - 0.01
                      : (tx + 1) * TILE + a.w / 2 + 0.01;
        a.vx = 0;
        break;
      }
    }
  }

  // ---- vertical ----
  const wasGround = a.onGround;
  a.y += a.vy * dt;
  a.onGround = false;
  const tx0 = Math.floor(a.left / TILE);
  const tx1 = Math.floor((a.right - 0.01) / TILE);

  if (a.vy >= 0) {                       // falling
    const ty = Math.floor(a.bottom / TILE);
    for (let tx = tx0; tx <= tx1; tx++) {
      const solid = level.isSolid(tx, ty);
      // one-way platforms only catch you if you were above them
      const oneway = level.isOneWay(tx, ty) &&
                     (a.bottom - a.vy * dt) <= ty * TILE + 1;
      if (solid || oneway) {
        a.y = ty * TILE;
        a.vy = 0;
        a.onGround = true;
        break;
      }
    }
  } else {                               // rising
    const ty = Math.floor(a.top / TILE);
    for (let tx = tx0; tx <= tx1; tx++) {
      if (level.isSolid(tx, ty)) {
        a.y = (ty + 1) * TILE + a.h;
        a.vy = 0;
        break;
      }
    }
  }

  if (a.onGround && !wasGround && a.vy === 0) a.justLanded = true;
  else a.justLanded = false;
}

/* Standard run + jump control, shared by both playable characters. */
function controlActor(a, level, dt) {
  // an actor on auto walks itself; used by the growing-up interlude
  const left = a.auto ? false : Input.held('left');
  const right = a.auto ? true : Input.held('right');
  const dir = (right ? 1 : 0) - (left ? 1 : 0);

  if (dir !== 0) {
    a.vx += dir * a.accel * dt;
    a.facing = dir;
  } else {
    const f = a.friction * dt;
    a.vx = Math.abs(a.vx) <= f ? 0 : a.vx - Math.sign(a.vx) * f;
  }
  a.vx = Math.max(-a.maxSpeed, Math.min(a.maxSpeed, a.vx));

  // coyote time + jump buffering: both make the jump feel fair
  a.coyote = a.onGround ? 6 : Math.max(0, a.coyote - dt);
  if (Input.tapped('jump')) a.jumpBuffer = 8;
  else a.jumpBuffer = Math.max(0, a.jumpBuffer - dt);

  if (a.jumpBuffer > 0 && a.coyote > 0) {
    a.vy = a.jumpV;
    a.onGround = false;
    a.coyote = 0;
    a.jumpBuffer = 0;
    Sound.play('jump');
  }
  // variable jump height — let go early, rise less
  if (a.vy < 0 && !Input.held('jump')) a.vy += a.gravity * 1.6 * dt;

  a.vy = Math.min(a.maxFall, a.vy + a.gravity * dt);

  moveActor(a, level, dt);

  if (a.justLanded) Sound.play('land');

  // footsteps, paced to the walk animation
  if (a.onGround && Math.abs(a.vx) > 0.25) {
    a.stepPhase += Math.abs(a.vx) * dt;
    if (a.stepPhase > 14) { a.stepPhase = 0; Sound.play('step'); }
  } else {
    a.stepPhase = 0;
  }

  a.animTime += dt / 60;
}

/* ------------------------------ CAMERA ---------------------------- */
class Camera {
  constructor(level) { this.level = level; this.x = 0; this.y = 0; }
  follow(target, dt) {
    const want = target.x - VIEW_W * 0.42;
    this.x += (want - this.x) * Math.min(1, 0.12 * dt);
    this.x = Math.max(0, Math.min(this.level.pxW - VIEW_W, this.x));
    this.y = Math.max(0, Math.min(this.level.pxH - VIEW_H, this.level.pxH - VIEW_H));
  }
}

/* --------------------------- TILE RENDERING ----------------------- */
const TILE_STYLE = {
  '#': { fill: '#4a4954', top: '#63616e' },   // road / ground
  'B': { fill: '#5a5064', top: '#6f637a' },   // building block
  'C': { fill: '#7a5a38', top: '#96714a' },   // crate
  'W': { fill: '#6a7183', top: '#828a9c' },   // hospital wall
  '=': { fill: '#6b5f7a', top: '#8b7da0' },   // one-way ledge
  'S': { fill: '#d9c8a8', top: '#e8dbc0' },   // school wall / ceiling
  'F': { fill: '#8a7256', top: '#9b8163' }    // indoor floor
};

function drawTiles(ctx, level, cam) {
  const styles = level.meta.tileStyles
    ? { ...TILE_STYLE, ...level.meta.tileStyles }
    : TILE_STYLE;
  const tx0 = Math.max(0, Math.floor(cam.x / TILE) - 1);
  const tx1 = Math.min(level.w - 1, Math.ceil((cam.x + VIEW_W) / TILE) + 1);
  const ty0 = Math.max(0, Math.floor(cam.y / TILE) - 1);
  const ty1 = Math.min(level.h - 1, Math.ceil((cam.y + VIEW_H) / TILE) + 1);

  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      const c = level.at(tx, ty);
      const st = styles[c];
      if (!st) continue;
      const x = tx * TILE - cam.x, y = ty * TILE - cam.y;
      ctx.fillStyle = st.fill;
      ctx.fillRect(x, y, TILE, ONEWAY.has(c) ? 5 : TILE);
      // lit top edge, only where nothing sits above
      if (!SOLID.has(level.at(tx, ty - 1))) {
        ctx.fillStyle = st.top;
        ctx.fillRect(x, y, TILE, ONEWAY.has(c) ? 2 : 3);
      }
      if (c === 'C') {                       // crate banding
        ctx.fillStyle = '#5e4429';
        ctx.fillRect(x, y + 7, TILE, 2);
        ctx.fillRect(x + 7, y, 2, TILE);
      }
    }
  }

  // puddles sit in the road surface rather than on top of it
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) {
      if (!level.isHazard(tx, ty)) continue;
      const x = tx * TILE - cam.x, y = ty * TILE - cam.y;
      ctx.fillStyle = 'rgba(90,140,180,.55)';
      ctx.fillRect(x, y + TILE - 4, TILE, 4);
      ctx.fillStyle = 'rgba(170,210,235,.5)';
      ctx.fillRect(x + 2, y + TILE - 4, 5, 1);
    }
  }
}

/* Draw an actor into world space. */
function drawActor(ctx, a, cam) {
  const { leg, bob } = animAt(a.anim, a.animTime);
  const sx = Math.round(a.x - cam.x);
  const sy = Math.round(a.y - cam.y);
  if (a.facing < 0) {
    ctx.save();
    ctx.translate(sx * 2, 0);
    ctx.scale(-1, 1);
    drawCharacter(ctx, a.char, leg, 1, sx, sy, bob);
    ctx.restore();
  } else {
    drawCharacter(ctx, a.char, leg, 1, sx, sy, bob);
  }
}
