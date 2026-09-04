/* ------------------------------------------------------------------
   Shared canvas helpers: sizing, animation timing, sky and the
   walking ground strip. Used by both the title screen and the lab.
------------------------------------------------------------------- */

const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

/* Size a canvas to its CSS box (or a fixed logical size) at device res.
   Resizing a canvas wipes it, so only touch it when the box changed. */
function fitCanvas(cv, logicalW, logicalH) {
  const dpr = DPR();
  const w = logicalW ?? cv.clientWidth;
  const h = logicalH ?? cv.clientHeight;
  const pxW = Math.round(w * dpr), pxH = Math.round(h * dpr);
  const ctx = cv.getContext('2d');
  if (cv.width !== pxW || cv.height !== pxH) { cv.width = pxW; cv.height = pxH; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = false;
  return { ctx, w, h };
}

/* Frame + vertical bob for an animation at time t (seconds). */
function animAt(animName, t) {
  const a = ANIMATIONS[animName];
  const i = Math.floor(t * a.fps) % a.frames.length;
  return { leg: a.frames[i], bob: a.bob[i] };
}

/* ------------------------------- SKY ------------------------------ */
const CLOUDS = Array.from({ length: 12 }, () => ({
  x: Math.random(),
  y: 0.08 + Math.random() * 0.4,
  s: 0.6 + Math.random() * 1.1,
  v: 0.004 + Math.random() * 0.01
}));

function drawCloud(ctx, x, y, s) {
  const u = 6 * s;
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const [bx, by, br] of [[0, 0, 3], [2.4, -0.9, 2.4], [-2.4, -0.5, 2], [4.6, 0.2, 1.8]]) {
    ctx.beginPath();
    ctx.arc(x + bx * u, y + by * u, br * u, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSky(cv, ts) {
  const { ctx, w, h } = fitCanvas(cv);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#bfe3ff');
  g.addColorStop(0.45, '#ffe3f0');
  g.addColorStop(1, '#fff6ee');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(255,207,77,.45)';
  ctx.beginPath();
  ctx.arc(w * 0.84, h * 0.15, 44, 0, Math.PI * 2);
  ctx.fill();

  for (const c of CLOUDS) drawCloud(ctx, ((c.x + ts * c.v) % 1.3 - 0.15) * w, c.y * h, c.s);
}

/* --------------------------- WALKING STRIP ------------------------ */
/* `cast` is a list of character ids to parade across the ground. */
function drawWalkStrip(cv, ts, cast, opts = {}) {
  const { ctx, w, h } = fitCanvas(cv);
  ctx.clearRect(0, 0, w, h);

  const scale = opts.scale ?? 4;
  const spacing = opts.spacing ?? 150;
  const speed = opts.speed ?? 34;
  const groundY = h - 44;

  for (const hl of [
    { c: '#cfe8c3', amp: 26, base: groundY - 26, speed: 8, len: 260 },
    { c: '#b6dda6', amp: 18, base: groundY - 10, speed: 16, len: 180 }
  ]) {
    ctx.fillStyle = hl.c;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) {
      ctx.lineTo(x, hl.base - Math.sin((x + ts * hl.speed) / hl.len * Math.PI * 2) * hl.amp);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#8ec97a';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.fillStyle = '#76b563';
  ctx.fillRect(0, groundY + 10, w, h - groundY - 10);
  ctx.fillStyle = '#5e9a4d';
  for (let x = (ts * speed) % 22; x < w; x += 22) ctx.fillRect(x, groundY + 3, 3, 4);

  const span = spacing * cast.length;
  cast.forEach((id, i) => {
    const { leg, bob } = animAt('walk', ts + i * 0.13);
    const x = ((ts * speed + i * spacing) % (w + span)) - span / 2;
    drawCharacter(ctx, CHARACTERS[id], leg, scale, x, groundY + 4, bob);
  });
}
