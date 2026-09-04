/* ------------------------------------------------------------------
   Game shell: scene flow, world rendering, and Level 1.
------------------------------------------------------------------- */

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const storyEl = document.getElementById('story');
const hudAct = document.getElementById('hud-act');
const muteBtn = document.getElementById('mute');

/* ============================ THE SCRIPT ========================== */
/* All the words in one place, so they are easy to rewrite. */
const SCRIPT = {
  open: {
    eyebrow: 'level 1',
    title: 'The Birth',
    text: '6th September, 2002. It has been raining over Bangalore, and the ' +
          'city has not stopped moving for a second.'
  },
  act1: {
    eyebrow: 'act 1 · papa',
    title: 'Get across the city',
    text: 'The call comes. The road is flooded, the buses have stopped dead, ' +
          'and the hospital is all the way across Bangalore. Get Papa there.'
  },
  act1done: {
    eyebrow: 'act 1 complete',
    title: 'Papa made it',
    text: 'Soaked through, still in uniform. But Ayrisha is not here yet.'
  },
  act2: {
    eyebrow: 'act 2 · mumma',
    title: 'Now bring Mumma',
    text: 'Mumma cannot run, and cannot jump the way Papa can. Take it ' +
          'slowly. Take it carefully. Just get Mumma there.'
  },
  act2done: {
    eyebrow: 'act 2 complete',
    title: 'Both of them, inside',
    text: 'The doors close behind Mumma. The rain keeps going without them.'
  },
  birth: {
    eyebrow: '6 september 2002',
    title: 'And then there were three',
    text: 'At the end of a very long wait, in a hospital across the city, ' +
          'Ayrisha arrives.'
  },
  gudiya: {
    eyebrow: 'and there she is',
    title: 'Our gudiya',
    text: 'And then comes our gudiya, our kuchupuchu precious bacha.',
    sweet: true
  },
  done: {
    eyebrow: 'level 1 complete',
    title: 'The Birth',
    text: 'Ayrisha is here. Everything after this is her story.'
  }
};

/* ============================== STATE ============================= */
let state = 'story';       // 'story' | 'play' | 'birthscene'
let level = null;
let player = null;
let cam = null;
let act = null;            // 'act1' | 'act2'
let spawnX = 0;
let storyQueue = [];
let birthT = 0;
let birthDone = false;
let birthStarted = false;
let skyline = [];
let rain = [];

/* ============================== STORY ============================= */
function showStory(entries, after) {
  storyQueue = entries.slice();
  storyQueue.after = after;
  state = 'story';
  renderStory();
}

function renderStory() {
  const s = storyQueue[0];
  storyEl.classList.remove('hidden');
  storyEl.querySelector('.story-eyebrow').textContent = s.eyebrow;
  storyEl.querySelector('.story-title').textContent = s.title;
  storyEl.querySelector('.story-text').textContent = s.text;
  storyEl.classList.toggle('sweet', !!s.sweet);
}

function advanceStory() {
  storyQueue.shift();
  if (storyQueue.length) { renderStory(); return; }
  storyEl.classList.add('hidden');
  const fn = storyQueue.after;
  storyQueue.after = null;
  if (fn) fn();
}

/* ============================== ACTS ============================== */
function startAct(which) {
  act = which;
  level = which === 'act1' ? buildAct1() : buildAct2();

  player = which === 'act1'
    ? new Actor('officer', 40, GROUND_Y * TILE, {
        maxSpeed: 2.15, accel: 0.5, jumpV: -7.4, w: 10
      })
    /* Mumma is slower and cannot jump nearly as high. That is a design
       choice, not a limitation — it is how the act says what it means. */
    : new Actor('mother', 40, GROUND_Y * TILE, {
        maxSpeed: 1.35, accel: 0.3, friction: 0.28, jumpV: -4.9, w: 11
      });

  spawnX = player.x;
  cam = new Camera(level);
  cam.x = 0;

  buildBackdrop(level);
  hudAct.textContent = (which === 'act1' ? 'PAPA' : 'MUMMA') + ' · to the hospital';
  Sound.playMusic(which === 'act1' ? 'rush' : 'careful');
  state = 'play';
}

function finishAct() {
  Sound.play('clear');
  if (act === 'act1') {
    showStory([SCRIPT.act1done, SCRIPT.act2], () => startAct('act2'));
  } else {
    Sound.playMusic('lullaby');
    showStory([SCRIPT.act2done], startBirthScene);
  }
}

function respawn() {
  Sound.play('hurt');
  const cps = level.meta.checkpoints.filter(c => c * TILE < player.x);
  const cx = cps.length ? cps[cps.length - 1] * TILE : spawnX;
  player.x = cx;
  player.y = (GROUND_Y - 1) * TILE;
  player.vx = 0;
  player.vy = 0;
}

/* =========================== BIRTH SCENE ========================== */
/* Not playable — the one moment the player should just watch. */
function startBirthScene() {
  state = 'birthscene';
  birthT = 0;
  birthDone = false;
  birthStarted = true;
  hudAct.textContent = '';
  Sound.play('birth');
}

function drawBirthScene(dt) {
  birthT += dt / 60;
  const FLOOR = 150;

  // warm hospital room instead of the cold street
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#42303f');
  g.addColorStop(1, '#7a555b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // window — the rain has finally eased off
  ctx.fillStyle = '#3b3a44';
  ctx.fillRect(22, 28, 58, 48);
  ctx.fillStyle = '#96a0b0';
  ctx.fillRect(25, 31, 52, 42);
  ctx.fillStyle = '#9aa2b4';
  ctx.fillRect(50, 28, 2, 48);
  ctx.fillRect(22, 50, 58, 2);
  ctx.strokeStyle = 'rgba(90,105,130,.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    const rx = 28 + ((i * 13 + birthT * 9) % 46);
    const ry = 33 + ((i * 17 + birthT * 26) % 36);
    ctx.moveTo(rx, ry); ctx.lineTo(rx - 1, ry + 4);
  }
  ctx.stroke();

  // wall clock
  ctx.fillStyle = '#e8ddd0';
  ctx.beginPath(); ctx.arc(258, 44, 11, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3b2d33'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(258, 44); ctx.lineTo(258, 37);
  ctx.moveTo(258, 44); ctx.lineTo(263, 47); ctx.stroke();

  // wall trim + floor
  ctx.fillStyle = '#5c4048';
  ctx.fillRect(0, FLOOR - 6, VIEW_W, 6);
  ctx.fillStyle = '#59414a';
  ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
  ctx.fillStyle = '#674a54';
  ctx.fillRect(0, FLOOR, VIEW_W, 3);
  ctx.fillStyle = 'rgba(0,0,0,.10)';
  for (let x = 0; x < VIEW_W; x += 24) ctx.fillRect(x, FLOOR + 3, 1, VIEW_H - FLOOR);

  // hospital bed
  ctx.fillStyle = '#8e97a8';
  ctx.fillRect(214, 116, 4, 34);
  ctx.fillRect(300, 120, 4, 30);
  ctx.fillStyle = '#cfd6e2';
  ctx.fillRect(214, 126, 90, 9);
  ctx.fillStyle = '#eef1f6';
  ctx.fillRect(218, 118, 24, 9);
  ctx.fillStyle = '#a8b0c0';
  ctx.fillRect(214, 135, 90, 3);

  // IV stand
  ctx.fillStyle = '#8e97a8';
  ctx.fillRect(200, 96, 2, 54);
  ctx.fillRect(194, 148, 14, 2);
  ctx.fillStyle = '#cfe4d8';
  ctx.fillRect(196, 98, 7, 13);

  // the two of them, standing together
  const bob = Math.sin(birthT * 2) > 0 ? 0 : 1;
  drawCharacter(ctx, CHARACTERS.mother, 'idle', 1, 122, FLOOR, bob);
  drawCharacter(ctx, CHARACTERS.officer, 'idle', 1, 172, FLOOR, bob);

  // the newborn, arriving as a glow that resolves into a bundle
  const t = Math.min(1, birthT / 2.4);
  const bx = 138, by = FLOOR - 15;

  ctx.save();
  ctx.globalAlpha = 0.22 + 0.2 * Math.sin(birthT * 3);
  ctx.fillStyle = '#ffd9a0';
  ctx.beginPath();
  ctx.arc(bx, by, 12 + t * 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (t > 0.4) {
    ctx.globalAlpha = Math.min(1, (t - 0.4) / 0.45);
    // swaddled in a blanket
    ctx.fillStyle = '#f7ecdc';
    ctx.fillRect(bx - 8, by - 6, 17, 13);
    ctx.fillStyle = '#e8cfc0';
    ctx.fillRect(bx - 8, by + 3, 17, 4);
    ctx.fillStyle = '#f2b6c8';
    ctx.fillRect(bx - 8, by - 6, 17, 2);
    // face
    ctx.fillStyle = '#e8b78d';
    ctx.fillRect(bx - 3, by - 4, 8, 7);
    ctx.fillStyle = '#17141c';
    ctx.fillRect(bx - 3, by - 5, 8, 2);      // her hair, black from day one
    ctx.fillRect(bx - 2, by - 1, 1, 1);      // eyes, shut
    ctx.fillRect(bx + 3, by - 1, 1, 1);
    ctx.fillStyle = '#b5605e';
    ctx.fillRect(bx, by + 1, 2, 1);
    ctx.globalAlpha = 1;
  }

  // sparkles
  for (let i = 0; i < 16; i++) {
    const a = birthT * 0.8 + i * 0.4;
    const r = 26 + (i % 4) * 8 + Math.sin(birthT * 2 + i) * 3;
    ctx.globalAlpha = 0.3 + 0.35 * Math.sin(birthT * 3 + i);
    ctx.fillStyle = '#ffe9b8';
    ctx.fillRect(Math.round(bx + Math.cos(a) * r), Math.round(by + Math.sin(a) * r * 0.6), 2, 2);
  }
  ctx.globalAlpha = 1;

  // fire the closing cards exactly once
  if (birthT > 4.5 && !birthDone) {
    birthDone = true;
    showStory([SCRIPT.birth, SCRIPT.gudiya, SCRIPT.done], () => {
      hudAct.textContent = 'LEVEL 1 COMPLETE';
      state = 'end';
    });
  }
}

/* ============================ BACKDROP ============================ */
/* Skyline + rain, generated once per act. */
function buildBackdrop(lv) {
  skyline = [];
  let x = -40;
  let seed = 20020906;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  while (x < lv.pxW + 200) {
    const w = 26 + Math.floor(rnd() * 34);
    const h = 40 + Math.floor(rnd() * 62);
    skyline.push({ x, w, h, lit: Array.from({ length: 12 }, () => rnd() > 0.55) });
    x += w + 4 + Math.floor(rnd() * 10);
  }
  rain = Array.from({ length: 90 }, () => ({
    x: Math.random() * VIEW_W,
    y: Math.random() * VIEW_H,
    len: 5 + Math.random() * 7,
    v: 4.5 + Math.random() * 3
  }));
}

function drawBackdrop(dt) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#4d5768');
  g.addColorStop(0.6, '#626b7c');
  g.addColorStop(1, '#7b8290');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // far skyline, parallax at 0.35 (drawn before the solid ground mass)
  const px = cam.x * 0.35;
  for (const b of skyline) {
    const sx = b.x - px;
    if (sx + b.w < -20 || sx > VIEW_W + 20) continue;
    const base = GROUND_Y * TILE - cam.y + 6;
    ctx.fillStyle = '#495061';
    ctx.fillRect(sx, base - b.h, b.w, b.h);
    ctx.fillStyle = 'rgba(242,198,106,.55)';
    for (let i = 0; i < b.lit.length; i++) {
      if (!b.lit[i] || i % 3) continue;
      const wx = sx + 4 + (i % 3) * 8;
      const wy = base - b.h + 7 + Math.floor(i / 3) * 11;
      if (wy < base - 4) ctx.fillRect(wx, wy, 3, 4);
    }
  }

  // near skyline, parallax at 0.6
  const px2 = cam.x * 0.6;
  for (let i = 0; i < skyline.length; i += 2) {
    const b = skyline[i];
    const sx = b.x * 0.8 - px2;
    if (sx + b.w < -20 || sx > VIEW_W + 20) continue;
    const base = GROUND_Y * TILE - cam.y + 10;
    ctx.fillStyle = '#3c4354';
    ctx.fillRect(sx, base - b.h * 0.7, b.w * 0.9, b.h * 0.7);
  }

  // everything under the road is underneath the city, not sky
  ctx.fillStyle = '#232833';
  ctx.fillRect(0, GROUND_Y * TILE - cam.y, VIEW_W, VIEW_H);
}

function drawProps(layer) {
  const FRONT = new Set(['bus', 'auto', 'hospital']);
  for (const p of level.meta.props) {
    if (FRONT.has(p.type) !== (layer === 'front')) continue;
    const sx = p.x * TILE - cam.x;
    if (sx < -140 || sx > VIEW_W + 140) continue;
    const base = GROUND_Y * TILE - cam.y;

    if (p.type === 'streetlight') {
      ctx.fillStyle = '#2f2a3d';
      ctx.fillRect(sx + 7, base - 46, 3, 46);
      ctx.fillRect(sx + 7, base - 48, 10, 3);
      ctx.fillStyle = '#ffe08a';
      ctx.fillRect(sx + 14, base - 46, 5, 4);
      const grd = ctx.createRadialGradient(sx + 16, base - 44, 2, sx + 16, base - 44, 44);
      grd.addColorStop(0, 'rgba(255,215,130,.13)');
      grd.addColorStop(1, 'rgba(255,215,130,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(sx - 28, base - 88, 88, 92);

    } else if (p.type === 'checkpoint') {
      ctx.fillStyle = '#8e97a8';
      ctx.fillRect(sx + 7, base - 26, 2, 26);
      ctx.fillStyle = player && player.x > p.x * TILE ? '#7bd36b' : '#c4536a';
      ctx.fillRect(sx + 9, base - 26, 10, 7);

    } else if (p.type === 'bus') {
      // stalled BMTC bus: cream body, red band, dead headlights
      const w = p.w * TILE, h = p.h * TILE;
      ctx.fillStyle = '#e4dcc6';
      ctx.fillRect(sx, base - h, w, h);
      ctx.fillStyle = '#b03a34';
      ctx.fillRect(sx, base - h + h * 0.58, w, 7);
      ctx.fillStyle = '#8d2f2a';
      ctx.fillRect(sx, base - h, w, 4);
      ctx.fillStyle = '#2b3346';
      for (let i = 0; i < p.w - 1; i++) ctx.fillRect(sx + 5 + i * TILE, base - h + 8, 11, 13);
      ctx.fillStyle = '#1c1a24';
      ctx.fillRect(sx + 6, base - 7, 10, 7);
      ctx.fillRect(sx + w - 16, base - 7, 10, 7);
      ctx.fillStyle = '#6a6255';
      ctx.fillRect(sx, base - h + h * 0.58 + 7, w, 2);

    } else if (p.type === 'auto') {
      // parked auto-rickshaw, yellow roof and black body
      const w = 2 * TILE;
      ctx.fillStyle = '#111014';
      ctx.fillRect(sx + 2, base - 13, w - 4, 10);
      ctx.fillStyle = '#f2c11e';
      ctx.fillRect(sx + 1, base - 20, w - 2, 8);
      ctx.fillStyle = '#8a6d10';
      ctx.fillRect(sx + 1, base - 20, w - 2, 2);
      ctx.fillStyle = '#2b3346';
      ctx.fillRect(sx + 5, base - 18, 9, 5);
      ctx.fillStyle = '#1c1a24';
      ctx.fillRect(sx + 4, base - 5, 6, 5);
      ctx.fillRect(sx + w - 10, base - 5, 6, 5);

    } else if (p.type === 'hospital') {
      const w = p.w * TILE;
      const top = 2 * TILE - cam.y;
      const dx = p.doorX * TILE - cam.x;
      const cx = dx + TILE;                 // centre of the doorway

      // ward windows — small and dim, so the signboard stays the focus
      ctx.fillStyle = 'rgba(255,226,150,.7)';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < p.w; c += 2) {
          const wy = top + 18 + r * 22;
          if (wy > base - 84) continue;
          if ((r * 7 + c) % 3 === 0) continue;
          ctx.fillRect(sx + 6 + c * TILE, wy, 6, 8);
        }
      }

      // red cross, centred over the entrance rather than the facade
      ctx.fillStyle = '#d94f5c';
      ctx.fillRect(cx - 3, top + 8, 7, 21);
      ctx.fillRect(cx - 10, top + 15, 21, 7);

      // the signboard
      const sw = 86;
      ctx.fillStyle = '#f4f1ea';
      ctx.fillRect(cx - sw / 2, base - 78, sw, 17);
      ctx.fillStyle = '#c8402f';
      ctx.fillRect(cx - sw / 2, base - 78, sw, 3);
      ctx.fillStyle = '#1d2a44';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MANIPAL', cx, base - 66);
      ctx.textAlign = 'left';

      // portico: canopy edge and a pillar at the outer corner
      ctx.fillStyle = '#5a627a';
      ctx.fillRect(sx, base - 51, (p.doorX + 2) * TILE - p.x * TILE, 4);
      ctx.fillStyle = '#4a5166';
      ctx.fillRect(sx + 2, base - 47, 5, 47);

      // the lit doorway itself, at the back of the portico
      ctx.fillStyle = '#ffdca0';
      ctx.fillRect(dx, base - 44, 32, 44);
      ctx.fillStyle = '#e8b878';
      ctx.fillRect(dx + 15, base - 44, 2, 44);
      ctx.fillStyle = 'rgba(255,220,160,.22)';
      ctx.fillRect(dx - 14, base - 62, 60, 62);
    }
  }
}

function drawRain(dt) {
  ctx.strokeStyle = 'rgba(180,200,255,.28)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const d of rain) {
    d.y += d.v * dt;
    d.x -= 0.9 * dt;
    if (d.y > VIEW_H) { d.y = -8; d.x = Math.random() * VIEW_W; }
    if (d.x < 0) d.x += VIEW_W;
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x - 1.6, d.y + d.len);
  }
  ctx.stroke();
}

/* ============================= MAIN LOOP ========================== */
let last = performance.now();
let acc = 0;
const STEP = 1000 / 60;

function frame(now) {
  let elapsed = Math.min(100, now - last);
  last = now;
  acc += elapsed;

  let steps = 0;
  while (acc >= STEP && steps < 5) { update(1); acc -= STEP; steps++; }

  render(1);
  Input.endFrame();
  requestAnimationFrame(frame);
}

function update(dt) {
  if (state === 'story') {
    if (Input.tapped('confirm') || Input.tapped('jump')) advanceStory();
    return;
  }
  if (Input.tapped('mute')) toggleMute();
  if (state !== 'play') return;

  controlActor(player, level, dt);
  cam.follow(player, dt);

  // splash through puddles
  const ptx = Math.floor(player.x / TILE);
  const pty = Math.floor((player.y - 2) / TILE);
  if (level.isHazard(ptx, pty) && player.onGround && Math.abs(player.vx) > 0.6) {
    if (Math.random() < 0.06) Sound.play('step');
  }

  if (player.y > level.pxH + 20) respawn();
  if (player.x >= level.meta.goalX) { state = 'transition'; finishAct(); }
}

function render() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;

  if (birthStarted) {
    drawBirthScene(1);
    return;
  }
  if (!level) return;

  drawBackdrop(1);
  drawProps('back');
  drawTiles(ctx, level, cam);
  drawProps('front');
  drawActor(ctx, player, cam);
  drawRain(1);

  // vignette so the edges of the street fall into the dark
  const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  v.addColorStop(0, 'rgba(30,34,44,.28)');
  v.addColorStop(0.4, 'rgba(30,34,44,0)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

/* ============================== BOOT ============================== */
function toggleMute() {
  const m = Sound.toggleMute();
  muteBtn.textContent = m ? '♪ off' : '♪ on';
}
muteBtn.addEventListener('click', () => { Sound.unlock(); toggleMute(); });

/* Audio needs a real gesture. The opening card doubles as that gesture. */
function boot() {
  showStory([SCRIPT.open, SCRIPT.act1], () => startAct('act1'));
  const kick = () => {
    Sound.unlock();
    removeEventListener('keydown', kick);
    removeEventListener('pointerdown', kick);
  };
  addEventListener('keydown', kick);
  addEventListener('pointerdown', kick);
  storyEl.addEventListener('click', () => { if (state === 'story') advanceStory(); });
  requestAnimationFrame(frame);
}
boot();
