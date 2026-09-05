/* ------------------------------------------------------------------
   Game shell: chapters, scene flow, and world rendering.

   A chapter is one level: some opening cards, one or more playable
   acts, an ending scene, and some closing cards. Adding a level means
   adding an entry to CHAPTERS, not touching the flow code.
------------------------------------------------------------------- */

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const hudAct = document.getElementById('hud-act');
const muteBtn = document.getElementById('mute');
const hudCollect = document.getElementById('hud-collect');
const noteEl = document.getElementById('note');
const levelCard = document.getElementById('levelcard');
const fadeEl = document.getElementById('fade');
const artEl = document.getElementById('artboard');
const pianoEl = document.getElementById('piano');
const harmEl = document.getElementById('harmonium');

/* The real cover, for the moment she is given it. */
const BOOK_IMG = new Image();
BOOK_IMG.src = 'assets/images/painting-nature.jpg';

/* ============================ THE SCRIPT ==========================
   All the words in one place, so they are easy to rewrite.
   Nothing here asserts a detail we do not actually know.
------------------------------------------------------------------ */
const SCRIPT = {
  /* Level 1 */
  l1act1:     [{ who: 'Krishna ji', char: 'krishna', text: 'Let\u2019s take Papa to the hospital.' }],
  l1act1done: [{ who: 'Krishna ji', char: 'krishna', text: 'Act 1 complete.' }],
  l1act2:     [{ who: 'Krishna ji', char: 'krishna',
                 text: 'Let\u2019s take Mumma to the hospital. Be gentle \u2014 ' +
                       'she cannot walk fast.' }],
  /* Nothing here: reaching the hospital just fades into the birth. */
  l1act2done: [],
  /* Said after the birth has actually played, not before it. */
  l1done:     [{ who: 'Krishna ji', char: 'krishna', text: 'Ayrisha was born.' },
               { who: 'Krishna ji', char: 'krishna', text: 'Our kuchupuchu precious bacha.', sweet: true },
               { who: 'Krishna ji', char: 'krishna', text: 'Level 1 complete.' }],

  /* Level 2 */
  l2done1:    [{ text: 'You made it to the class!' }],
  l2done:     [{ text: 'Have a great day at school.', sweet: true }],

  /* Level 3 */
  l3done:     [{ who: 'Krishna ji', char: 'krishna', text: 'Level 3 complete.' }],

  /* Level 4 */
  l4guide:    [{ who: 'Krishna ji', char: 'krishna',
                 text: 'Hey little Ayrisha, let\u2019s go to the music classes.' }],
  l4done:     [{ who: 'Krishna ji', char: 'krishna', text: 'Level 4 complete.' }],

  /* The growing-up interlude */
  growEnd:    [{ text: 'And she was not little any more.', sweet: true }],

  /* Level 5 */
  l5guide: [{ who: 'Krishna ji', char: 'krishna',
              text: 'Kota. Two years of it. Let\u2019s get to class.' }],
  l5bazar: [{ who: 'Anam', char: 'anam', text: 'Chalo, cold coffee? My treat.' },
            { who: 'Ayrisha', char: 'teen', text: 'Only if it is a big one.' }],
  l5test:  [{ text: 'Sunday. The test.' }],
  l5done:  [{ who: 'Krishna ji', char: 'krishna', text: 'Level 5 complete.' }]
};

/* ============================= CHAPTERS =========================== */
const CHILD_TUNING  = { maxSpeed: 1.7,  accel: 0.36, jumpV: -5.6, w: 8 };
const PAPA_TUNING   = { maxSpeed: 2.15, accel: 0.5,  jumpV: -7.4, w: 10 };
const TEEN_TUNING   = { maxSpeed: 1.95, accel: 0.42, jumpV: -6.4, w: 9 };
const MUMMA_TUNING  = { maxSpeed: 1.35, accel: 0.3,  friction: 0.28, jumpV: -4.9, w: 11 };

const CHAPTERS = [
  {
    id: 'level1',
    number: 1,
    title: 'Bangalore',
    subtitle: '6th September, 2002',
    blurb: '',
    objectives: [],
    acts: [
      { intro: SCRIPT.l1act1, outro: SCRIPT.l1act1done,
        build: buildAct1, char: 'officer', tuning: PAPA_TUNING,
        music: 'rush', hud: 'PAPA' },
      { intro: SCRIPT.l1act2, outro: SCRIPT.l1act2done,
        build: buildAct2, char: 'mother', tuning: MUMMA_TUNING,
        music: 'careful', hud: 'MUMMA' }
    ],
    ending: 'birth',
    close: SCRIPT.l1done
  },
  {
    id: 'level2',
    number: 2,
    title: "Let's go to school",
    subtitle: '',
    blurb: '',
    objectives: [],
    acts: [
      { intro: [], outro: SCRIPT.l2done1,
        build: buildLevel2, char: 'child', tuning: CHILD_TUNING,
        music: 'morning', hud: 'AYRISHA' }
    ],
    ending: 'classroom',
    close: SCRIPT.l2done
  },
  {
    id: 'level3',
    number: 3,
    title: 'Let\u2019s go see our art tutor',
    subtitle: '',
    blurb: '',
    objectives: [],          // nothing here gives away what she gets
    acts: [
      { intro: [{ who: 'Krishna ji', char: 'krishna',
                  text: 'Let\u2019s catch up with the art tutor.' }],
        outro: [], seamless: true,
        build: buildAct3a, char: 'child', tuning: CHILD_TUNING,
        music: 'afternoon', hud: 'AYRISHA' },
      { intro: [], outro: [], seamless: true,
        build: buildAct3b, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Aunty', char: 'tutor',
            text: 'Hello Ayrisha, I\u2019m glad you made it. How are you?' },
          { who: 'Ayrisha', char: 'child',
            text: 'Hello, good evening. I am good.' },
          { who: 'Aunty', char: 'tutor',
            text: 'Okay, let\u2019s get started with our art classes.' }
        ] },
      { type: 'art', intro: [], outro: [], seamless: true, music: 'indoors' }
    ],
    ending: 'book',
    close: SCRIPT.l3done
  },
  {
    id: 'level4',
    number: 4,
    title: "Let's go to the music class",
    subtitle: '',
    blurb: '',
    objectives: [],
    acts: [
      { intro: SCRIPT.l4guide, outro: [], seamless: true,
        build: buildAct4a, char: 'child', tuning: CHILD_TUNING,
        music: 'morning', hud: 'AYRISHA' },
      { intro: [], outro: [], seamless: true,
        build: buildAct4b, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Teacher', char: 'musicteacher',
            text: 'Ayrisha, hello! How was your school?' },
          { who: 'Ayrisha', char: 'child', text: 'Yeah, my school was good.' },
          { who: 'Teacher', char: 'musicteacher',
            text: 'Okay, let\u2019s start with our piano lessons.' },
          { who: 'Ayrisha', char: 'child', text: 'Yes, let\u2019s go!' }
        ] },
      { type: 'piano', intro: [], outro: [], seamless: true, music: 'indoors' },
      { intro: [], outro: [], seamless: true,
        build: buildAct4c, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Teacher', char: 'musicteacher', text: 'Everyone, bow down.' },
          /* she bows here, and does not stop in time */
          { who: 'Ayrisha', char: 'child', text: 'Namaste, teacher!',
            lock: true, wait: 3000, on() { startPlayerBow(); } },
          { who: 'Ayrisha', char: 'child',
            text: 'Oh! I hit the ground when I bowed down.' },
          { who: 'Teacher', char: 'musicteacher',
            text: 'So cutely you bow down! Gently next time.' },
          { who: 'Teacher', char: 'musicteacher',
            text: 'Now \u2014 let us start the harmonium.' }
        ] },
      { type: 'harmonium', intro: [], outro: [], seamless: true, music: 'indoors' }
    ],
    ending: 'musicdone',
    close: SCRIPT.l4done
  },
  {
    id: 'growing',
    interlude: true,          // no landing page; it just happens
    number: 0,
    title: '',
    subtitle: '', blurb: '', objectives: [],
    acts: [
      { intro: [], outro: SCRIPT.growEnd, seamless: true,
        build: buildGrowing, char: 'child', tuning: CHILD_TUNING,
        autoWalk: true, music: 'afternoon', hud: '' }
    ],
    ending: null,
    close: []
  },
  {
    id: 'level5',
    number: 5,
    title: 'College entrance exams',
    subtitle: 'Kota, Rajasthan',
    blurb: '', objectives: [],
    acts: [
      { intro: SCRIPT.l5guide, outro: [], seamless: true,
        build: buildAct5a, char: 'teen', tuning: TEEN_TUNING,
        music: 'afternoon', hud: 'AYRISHA' },
      { intro: [], outro: [], seamless: true,
        build: buildAct5b, char: 'teen', tuning: TEEN_TUNING,
        music: 'indoors', hud: 'AYRISHA',
        goalLines: [
          { who: 'Anam', char: 'anam', text: 'You are up too. Every night, na?' },
          { who: 'Ayrisha', char: 'teen', text: 'Every night. I am Ayrisha.' },
          { who: 'Anam', char: 'anam', text: 'Anam. Room 214. Same floor as you.' },
          { who: 'Ayrisha', char: 'teen',
            text: 'Then I am never studying alone again.' },
          { who: 'Anam', char: 'anam', text: 'Chalo \u2014 cold coffee. Friends Bazar.' }
        ] },
      { intro: [], outro: [], seamless: true,
        build: buildAct5c, char: 'teen', tuning: TEEN_TUNING,
        music: 'morning', hud: 'AYRISHA · with Anam',
        goalLines: [
          { who: 'Anam', char: 'anam', text: 'Two cold coffees, bhaiya. Big ones.' },
          { who: 'Ayrisha', char: 'teen',
            text: 'This is the best thing that has happened all week.' },
          { who: 'Anam', char: 'anam', text: 'It is Tuesday, Ayrisha.' },
          { who: 'Ayrisha', char: 'teen', text: 'I know.' }
        ] },
      { intro: SCRIPT.l5test, outro: [], seamless: true,
        build: buildAct5d, char: 'teen', tuning: TEEN_TUNING,
        music: 'careful', hud: 'AYRISHA · the test',
        goalLines: [
          { text: 'Three hours. Then the long walk back, and sleep.' }
        ] }
    ],
    ending: 'kotahome',
    close: SCRIPT.l5done
  }
];

/* ============================== STATE ============================= */
let state = 'story';          // 'story' | 'play' | 'ending' | 'end'
let level = null;
let player = null;
let cam = null;
let spawnX = 0;
let chapterIdx = 0;
let actIdx = 0;
let ending = null;
let endingT = 0;
let endingDone = false;
let bookGiven = false;
let musicDone = false;
let kotaDone = false;
let bookT = 0;
let skyline = [];
let rain = [];

/* --------------------------- GROWING UP --------------------------
   She changes sprite mid-stride. Her feet stay where they are and the
   extra height goes upward, so it reads as growing rather than as a
   swap.
------------------------------------------------------------------ */
let growFlash = 0;

function growUp() {
  player.char = CHARACTERS.teen;
  player.h = frameHeight(player.char, 'idle');
  growFlash = 1;
  Sound.play('checkpoint');
}

function drawGrowFlash() {
  if (growFlash <= 0.01) return;
  growFlash *= 0.94;
  const x = player.x - cam.x, y = player.y - cam.y - player.h / 2;
  ctx.save();
  ctx.globalAlpha = growFlash * 0.8;
  const g = ctx.createRadialGradient(x, y, 2, x, y, 46);
  g.addColorStop(0, 'rgba(255,247,214,.9)');
  g.addColorStop(1, 'rgba(255,231,150,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 50, y - 50, 100, 100);
  ctx.restore();
}

/* ============================ THE BOW =============================
   She folds forward from the feet and puts her head in the floor. It
   happens in the room she is standing in rather than in a cutaway.
------------------------------------------------------------------ */
const pbow = { on: false, t: 0, hit: false };

function startPlayerBow() {
  pbow.on = true;
  pbow.t = 0;
  pbow.hit = false;
}

function drawPlayer() {
  if (!pbow.on) { drawActor(ctx, player, cam); return; }

  pbow.t += 1 / 60;
  const bend = Math.min(1, pbow.t / 0.5);
  const back = pbow.t > 2.0 ? Math.min(1, (pbow.t - 2.0) / 0.6) : 0;
  const angle = (bend - back) * 1.42;      // ~81 degrees, forward

  const sx = Math.round(player.x - cam.x);
  const sy = Math.round(player.y - cam.y);
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle);
  drawCharacter(ctx, player.char, 'idle', 1, 0, 0, 0);
  ctx.restore();

  if (pbow.t > 0.5 && pbow.t < 1.4) {
    if (!pbow.hit) { pbow.hit = true; Sound.play('land'); }
    const p = Math.min(1, (pbow.t - 0.5) / 0.6);
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = '#ffcf4d';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const a = -0.3 - i * 0.45;
      const r0 = 7 + p * 8, r1 = 16 + p * 14;
      ctx.beginPath();
      ctx.moveTo(sx + 24 + Math.cos(a) * r0, sy - 7 + Math.sin(a) * r0);
      ctx.lineTo(sx + 24 + Math.cos(a) * r1, sy - 7 + Math.sin(a) * r1);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (back >= 1) pbow.on = false;
}

/* ============================== GUIDE =============================
   Krishna ji appears at the start of a level to say what it is about.

   He is drawn at the centre of the screen rather than beside the
   player: he is a vision, not a companion walking along. Unlike the
   between-scene captions this waits for the player - ENTER moves it
   on, because it is being said to her.
------------------------------------------------------------------ */
const guide = { on: false, t: 0, fade: 0 };

function showGuide(lines, after) {
  dropFocus();
  guide.on = true;
  guide.t = 0;
  guide.fade = 0;
  Dialogue.start(lines, () => { guide.on = false; if (after) after(); },
                 { pos: 'bottomright' });
}

function drawGuide(dt) {
  if (!guide.on && guide.fade <= 0) return;
  if (!level || !cam || ending) return;
  guide.t += dt / 60;
  guide.fade += ((guide.on ? 1 : 0) - guide.fade) * 0.07;
  if (guide.fade < 0.01) return;

  const char = CHARACTERS.krishna;
  const h = frameHeight(char, 'idle');
  const x = Math.round(VIEW_W / 2);
  // standing on the ground, centre of the screen — not hovering.
  // During an ending there is no camera, so fall back to the floor line.
  const y = Math.round(GROUND_Y * TILE - cam.y);
  const rise = (1 - guide.fade) * 10;   // steps into place as he appears

  ctx.save();
  ctx.globalAlpha = guide.fade;
  ctx.translate(0, rise);

  // the whole screen dims a little so he reads as a vision
  ctx.fillStyle = `rgba(20,16,34,${0.34 * guide.fade})`;
  ctx.fillRect(-VIEW_W, -VIEW_H, VIEW_W * 3, VIEW_H * 3);

  // aura
  const cy = y - h / 2;
  const glow = ctx.createRadialGradient(x, cy, 4, x, cy, 62);
  glow.addColorStop(0, 'rgba(255,236,170,.55)');
  glow.addColorStop(0.45, 'rgba(255,214,120,.20)');
  glow.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 70, cy - 70, 140, 140);

  // a slow ring of light behind him
  ctx.strokeStyle = `rgba(255,229,150,${0.30 * guide.fade})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, cy, 34 + Math.sin(guide.t * 1.2) * 2, 0, Math.PI * 2);
  ctx.stroke();

  drawCharacter(ctx, char, 'idle', 1, x, y, 0);

  // petals drifting around him
  for (let i = 0; i < 10; i++) {
    const a = guide.t * 0.7 + i * 0.63;
    const r = 30 + (i % 4) * 8;
    ctx.globalAlpha = guide.fade * (0.25 + 0.3 * Math.sin(guide.t * 2.4 + i));
    ctx.fillStyle = i % 3 ? '#ffe9a8' : '#f6c9d8';
    ctx.fillRect(Math.round(x + Math.cos(a) * r),
                 Math.round(cy + Math.sin(a) * r * 0.7), 2, 2);
  }
  ctx.restore();
}

/* ============================ NARRATION ===========================
   Between-scene text is spoken over the world in the dialogue box
   rather than on a card that stops the game. Lines play themselves,
   timed to their length, so a transition never waits on a keypress.

   Any control that still holds keyboard focus would steal ENTER, so
   focus is dropped whenever the game takes the screen back.
------------------------------------------------------------------ */
function dropFocus() {
  const el = document.activeElement;
  if (el && el !== document.body && typeof el.blur === 'function') el.blur();
}

/* Long enough to read without dawdling. */
function readingTime(text) {
  return Math.max(1500, Math.min(4200, 900 + text.length * 55));
}

/* A line with a speaker is delivered by them; a line without one is a
   caption that plays itself. */
function say(lines, after) {
  if (!lines || !lines.length) { if (after) after(); return; }
  if (lines[0].char) showGuide(lines, after);
  else narrate(lines, after);
}

function narrate(lines, after) {
  dropFocus();
  if (!lines || !lines.length) { if (after) after(); return; }
  Dialogue.start(lines.map(l => ({
    ...l,
    lock: true,
    wait: l.wait || readingTime(l.text)
  })), after);
}

/* ============================== FADE ==============================
   Scenes inside a level hand over through a fade, not a card, so a
   level reads as one continuous stretch rather than a sequence.
------------------------------------------------------------------ */
function fadeThrough(mid, after) {
  fadeEl.classList.add('on');
  setTimeout(() => {
    mid();
    setTimeout(() => {
      fadeEl.classList.remove('on');
      after && after();
    }, 60);
  }, 470);
}

/* ========================== LEVEL LANDING =========================
   Every level opens on its own page: what it is called, what it is
   about, what you actually have to do, and a START button.
------------------------------------------------------------------ */
function showLevelCard(ch) {
  state = 'levelcard';
  artEl.classList.add('hidden');
  pianoEl.classList.add('hidden');
  harmEl.classList.add('hidden');
  hudAct.textContent = '';
  hudCollect.textContent = '';
  levelCard.querySelector('.lc-num').textContent = `LEVEL ${ch.number}`;
  levelCard.querySelector('.lc-title').textContent = ch.title;
  const sub = levelCard.querySelector('.lc-sub');
  const blurb = levelCard.querySelector('.lc-blurb');
  const obj = levelCard.querySelector('.lc-obj');
  sub.textContent = ch.subtitle || '';
  blurb.textContent = ch.blurb || '';
  sub.hidden = !ch.subtitle;
  blurb.hidden = !ch.blurb;
  obj.hidden = !(ch.objectives && ch.objectives.length);
  levelCard.querySelector('.lc-list').innerHTML =
    (ch.objectives || []).map(o => `<li>${o}</li>`).join('');
  levelCard.classList.remove('hidden');
}

function beginLevel() {
  if (state !== 'levelcard') return;
  Sound.unlock();
  Sound.play('confirm');
  levelCard.classList.add('hidden');
  const ch = CHAPTERS[chapterIdx];
  // music from the START press, so the game is never silent
  if (ch.acts[0].music) Sound.playMusic(ch.acts[0].music);
  startCurrentAct();
}

/* ============================= CHAPTERS =========================== */
function startChapter(i) {
  chapterIdx = i;
  actIdx = 0;
  ending = null;
  level = null;
  guide.on = false;
  guide.fade = 0;
  pbow.on = false;
  Sound.stopMusic();
  const ch = CHAPTERS[i];
  if (ch.interlude) {
    // it skips the landing page, so it has to dismiss it itself
    levelCard.classList.add('hidden');
    Sound.unlock();
    if (ch.acts[0].music) Sound.playMusic(ch.acts[0].music);
    startCurrentAct();
    return;
  }
  showLevelCard(ch);
}

function startCurrentAct(skipIntro) {
  const a = CHAPTERS[chapterIdx].acts[actIdx];

  if (a.type === 'harmonium') {
    level = null;
    player = null;
    hudAct.textContent = 'AYRISHA · harmonium';
    hudCollect.textContent = '';
    if (a.music) Sound.playMusic(a.music);
    artEl.classList.add('hidden');
    pianoEl.classList.add('hidden');
    harmEl.classList.remove('hidden');
    Harmonium.build(harmEl, () => {
      harmEl.classList.add('hidden');
      state = 'transition';
      finishAct();
    });
    state = 'art';
    return;
  }

  if (a.type === 'piano') {
    level = null;
    player = null;
    hudAct.textContent = 'AYRISHA · piano lesson';
    hudCollect.textContent = '';
    if (a.music) Sound.playMusic(a.music);
    artEl.classList.add('hidden');
    harmEl.classList.add('hidden');
    pianoEl.classList.remove('hidden');
    Piano.build(pianoEl, () => {
      pianoEl.classList.add('hidden');
      state = 'transition';
      finishAct();
    });
    state = 'art';
    return;
  }

  if (a.type === 'art') {
    level = null;
    player = null;
    hudAct.textContent = 'AYRISHA · paint it in';
    hudCollect.textContent = '';
    if (a.music) Sound.playMusic(a.music);
    artEl.classList.remove('hidden');
    Art.build(artEl, () => {
      artEl.classList.add('hidden');
      state = 'transition';
      finishAct();
    });
    state = 'art';
    return;
  }

  artEl.classList.add('hidden');
  pianoEl.classList.add('hidden');
  harmEl.classList.add('hidden');
  level = a.build();
  player = new Actor(a.char, 40, GROUND_Y * TILE, a.tuning);
  player.auto = !!a.autoWalk;
  spawnX = player.x;
  cam = new Camera(level);
  cam.x = 0;
  buildBackdrop(level);
  hudAct.textContent = a.hud;
  updateCollectHud();
  Sound.playMusic(a.music);
  state = 'play';
  if (!skipIntro) say(a.intro);
}

function finishAct() {
  const ch = CHAPTERS[chapterIdx];
  const a = ch.acts[actIdx];
  const last = actIdx === ch.acts.length - 1;
  if (!a.type) Sound.play('clear');

  const next = last ? startEnding : () => { actIdx++; startCurrentAct(); };
  // speak the closing line over the scene it belongs to, then fade
  say(a.outro, () => fadeThrough(next));
}

function startEnding() {
  musicDone = false;
  kotaDone = false;
  const ch = CHAPTERS[chapterIdx];
  // an interlude has no ending scene: say its last line and move on
  if (!ch.ending) {
    say(ch.close, () => fadeThrough(nextChapter));
    return;
  }
  ending = ENDINGS[ch.ending];
  endingT = 0;
  endingDone = false;
  dropFocus();
  hudAct.textContent = '';
  hudCollect.textContent = '';
  state = 'ending';
  if (ending.music) Sound.playMusic(ending.music);
  if (ending.enter) ending.enter();
}

function nextChapter() {
  if (chapterIdx < CHAPTERS.length - 1) {
    startChapter(chapterIdx + 1);
  } else {
    hudAct.textContent = 'TO BE CONTINUED';
    hudCollect.textContent = '';
    state = 'end';
  }
}

function respawn() {
  Sound.play('hurt');
  const cps = level.meta.checkpoints.filter(c => c * TILE < player.x);
  player.x = cps.length ? cps[cps.length - 1] * TILE : spawnX;
  player.y = (GROUND_Y - 1) * TILE;
  player.vx = 0;
  player.vy = 0;
}

/* ============================== ENDINGS ===========================
   Not playable. The moments the player should just watch.
------------------------------------------------------------------ */
const ENDINGS = {
  /* ---------------------- level 1: the birth ---------------------- */
  birth: {
    dur: 4.5,
    music: 'lullaby',
    enter() { Sound.play('birth'); },
    draw(t) {
      const FLOOR = 150;
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
        const rx = 28 + ((i * 13 + t * 9) % 46);
        const ry = 33 + ((i * 17 + t * 26) % 36);
        ctx.moveTo(rx, ry); ctx.lineTo(rx - 1, ry + 4);
      }
      ctx.stroke();

      // wall clock
      ctx.fillStyle = '#e8ddd0';
      ctx.beginPath(); ctx.arc(258, 44, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#3b2d33'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(258, 44); ctx.lineTo(258, 37);
      ctx.moveTo(258, 44); ctx.lineTo(263, 47); ctx.stroke();

      ctx.fillStyle = '#5c4048'; ctx.fillRect(0, FLOOR - 6, VIEW_W, 6);
      ctx.fillStyle = '#59414a'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#674a54'; ctx.fillRect(0, FLOOR, VIEW_W, 3);
      ctx.fillStyle = 'rgba(0,0,0,.10)';
      for (let x = 0; x < VIEW_W; x += 24) ctx.fillRect(x, FLOOR + 3, 1, VIEW_H - FLOOR);

      // bed and IV stand
      ctx.fillStyle = '#8e97a8';
      ctx.fillRect(214, 116, 4, 34); ctx.fillRect(300, 120, 4, 30);
      ctx.fillStyle = '#cfd6e2'; ctx.fillRect(214, 126, 90, 9);
      ctx.fillStyle = '#eef1f6'; ctx.fillRect(218, 118, 24, 9);
      ctx.fillStyle = '#a8b0c0'; ctx.fillRect(214, 135, 90, 3);
      ctx.fillStyle = '#8e97a8';
      ctx.fillRect(200, 96, 2, 54); ctx.fillRect(194, 148, 14, 2);
      ctx.fillStyle = '#cfe4d8'; ctx.fillRect(196, 98, 7, 13);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.mother, 'idle', 1, 122, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.officer, 'idle', 1, 172, FLOOR, bob);

      const p = Math.min(1, t / 2.4);
      const bx = 138, by = FLOOR - 15;
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.2 * Math.sin(t * 3);
      ctx.fillStyle = '#ffd9a0';
      ctx.beginPath(); ctx.arc(bx, by, 12 + p * 14, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (p > 0.4) {
        ctx.globalAlpha = Math.min(1, (p - 0.4) / 0.45);
        ctx.fillStyle = '#f7ecdc'; ctx.fillRect(bx - 8, by - 6, 17, 13);
        ctx.fillStyle = '#e8cfc0'; ctx.fillRect(bx - 8, by + 3, 17, 4);
        ctx.fillStyle = '#f2b6c8'; ctx.fillRect(bx - 8, by - 6, 17, 2);
        ctx.fillStyle = '#e8b78d'; ctx.fillRect(bx - 3, by - 4, 8, 7);
        ctx.fillStyle = '#17141c';
        ctx.fillRect(bx - 3, by - 5, 8, 2);       // her hair, black from day one
        ctx.fillRect(bx - 2, by - 1, 1, 1);
        ctx.fillRect(bx + 3, by - 1, 1, 1);
        ctx.fillStyle = '#b5605e'; ctx.fillRect(bx, by + 1, 2, 1);
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < 16; i++) {
        const a = t * 0.8 + i * 0.4;
        const r = 26 + (i % 4) * 8 + Math.sin(t * 2 + i) * 3;
        ctx.globalAlpha = 0.3 + 0.35 * Math.sin(t * 3 + i);
        ctx.fillStyle = '#ffe9b8';
        ctx.fillRect(Math.round(bx + Math.cos(a) * r), Math.round(by + Math.sin(a) * r * 0.6), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  },

  /* ------------------------ level 3: the book --------------------- */
  book: {
    music: 'lullaby',
    /* She comes back out to the balcony, and Aunty looks at what she
       made before giving her anything. */
    enter() {
      bookGiven = false;
      bookT = 0;
      Dialogue.start([
        { who: 'Aunty', char: 'tutor', text: 'Oh wow, you did a great job!' },
        { who: 'Ayrisha', char: 'child',
          text: 'Thank you, Aunty. You teach so well.' },
        { who: 'Aunty', char: 'tutor',
          text: 'Yeah, you are a great student. I have a book for you.' },
        { who: 'Ayrisha', char: 'child', text: 'What is it?' },
        /* the book arrives on this line, and it cannot be skipped, so
           the handover actually plays */
        { who: 'Aunty', char: 'tutor', text: 'Here is the book.',
          lock: true, wait: 3600,
          on() { bookGiven = true; bookT = 0; Sound.play('birth'); } }
      ], null);
    },
    /* Long enough after the conversation to actually look at it. */
    done(t) { return bookGiven && !Dialogue.active && bookT > 4.5; },
    draw(t) {
      const FLOOR = 152;

      // the balcony, late afternoon
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#7fbfe0');
      g.addColorStop(0.55, '#f0c98a');
      g.addColorStop(1, '#f6ddb2');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = 'rgba(255,236,170,.55)';
      ctx.beginPath(); ctx.arc(268, 40, 15, 0, Math.PI * 2); ctx.fill();

      // rooftops below the balcony
      ctx.fillStyle = '#a98871';
      for (let i = 0; i < 7; i++) {
        const bx = i * 52 - 20, bh = 24 + ((i * 37) % 26);
        ctx.fillRect(bx, FLOOR - 34 - bh, 44, bh);
      }

      // railing and floor
      ctx.fillStyle = '#b08e70'; ctx.fillRect(0, FLOOR - 36, VIEW_W, 5);
      ctx.fillStyle = '#c9a98a';
      for (let x = 0; x < VIEW_W; x += 8) ctx.fillRect(x, FLOOR - 31, 3, 31);
      ctx.fillStyle = '#9a7550'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#b08a63'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      // her painting, up on the easel where she left it
      ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(36, FLOOR); ctx.lineTo(46, FLOOR - 46);
      ctx.moveTo(60, FLOOR); ctx.lineTo(50, FLOOR - 46);
      ctx.stroke();
      const [gw, gh] = Art.size;
      const cell = 2;
      ctx.fillStyle = '#fbf6ea';
      ctx.fillRect(30, FLOOR - 74, gw * cell + 6, gh * cell + 6);
      Art.drawTo(ctx, 33, FLOOR - 71, cell);
      ctx.fillStyle = '#6b4a33'; ctx.fillRect(28, FLOOR - 46, gw * cell + 10, 4);

      // the two of them
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.tutor, 'idle', 1, 122, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.child, 'idle', 1, 168, FLOOR, bob);

      // the book itself, only once she has actually been given it
      if (!bookGiven) return;
      bookT += 1 / 60;
      const p = Math.min(1, bookT / 0.7);
      const bx = 145, by = FLOOR - 50;
      ctx.save();
      ctx.globalAlpha = 0.2 + 0.2 * Math.sin(t * 3);
      ctx.fillStyle = '#fff0c0';
      ctx.beginPath(); ctx.arc(bx, by, 18 + p * 22, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      if (BOOK_IMG.complete && BOOK_IMG.naturalWidth) {
        // a small overshoot so it lands rather than fades
        const pop = p < 1 ? 1.12 - 0.12 * p : 1;
        const h = (46 + p * 12) * pop;
        const w = h * (BOOK_IMG.naturalWidth / BOOK_IMG.naturalHeight);
        ctx.globalAlpha = Math.min(1, p / 0.6);
        ctx.fillStyle = '#241b26';
        ctx.fillRect(bx - w / 2 - 1, by - h / 2 - 1, w + 2, h + 2);
        ctx.drawImage(BOOK_IMG, bx - w / 2, by - h / 2, w, h);
        ctx.globalAlpha = 1;
      }

      for (let i = 0; i < 14; i++) {
        const a = t * 0.8 + i * 0.45;
        const r = 28 + (i % 4) * 8 + Math.sin(t * 2 + i) * 3;
        ctx.globalAlpha = 0.3 + 0.35 * Math.sin(t * 3 + i);
        ctx.fillStyle = '#fff3c8';
        ctx.fillRect(Math.round(bx + Math.cos(a) * r),
                     Math.round(by + Math.sin(a) * r * 0.6), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  },

  /* ------------------------ level 5: home ------------------------- */
  kotahome: {
    music: 'lullaby',
    enter() {
      kotaDone = false;
      Dialogue.start([
        { text: 'Home. It has not been an easy year.' },
        { who: 'Uncle', char: 'husband',
          text: 'That gudiya \u2014 this time will teach you very much, ' +
                'which will be useful for your whole life.' },
        { who: 'Krishna ji', char: 'krishna',
          text: 'You are very smart. You are intelligent. You can work hard also.' },
        { who: 'Krishna ji', char: 'krishna',
          text: 'You will do great in your life. Let\u2019s go to college now, ' +
                'and have a good time.' }
      ], () => { kotaDone = true; });
    },
    done() { return kotaDone; },
    draw(t) {
      const FLOOR = 150;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#4a3d52');
      g.addColorStop(1, '#7a6472');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // a window with the evening outside
      ctx.fillStyle = '#3b3344'; ctx.fillRect(24, 28, 58, 46);
      ctx.fillStyle = '#8d7fa0'; ctx.fillRect(28, 32, 50, 38);
      ctx.fillStyle = '#3b3344';
      ctx.fillRect(51, 28, 3, 46); ctx.fillRect(24, 50, 58, 3);

      ctx.fillStyle = '#6b5334'; ctx.fillRect(226, 34, 46, 32);
      ctx.fillStyle = '#efe3c8'; ctx.fillRect(229, 37, 40, 26);

      ctx.fillStyle = '#5e4d58'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#6e5b67'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      // her bag, put down by the door
      ctx.fillStyle = '#c4536a'; ctx.fillRect(48, FLOOR - 11, 15, 11);
      ctx.fillStyle = '#9c3d52'; ctx.fillRect(48, FLOOR - 11, 15, 4);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.husband, 'idle', 1, 118, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.teen, 'idle', 1, 168, FLOOR, bob);

      // a warm light over the two of them
      const gl = ctx.createRadialGradient(143, FLOOR - 26, 6, 143, FLOOR - 26, 74);
      gl.addColorStop(0, 'rgba(255,226,160,.20)');
      gl.addColorStop(1, 'rgba(255,226,160,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(60, FLOOR - 100, 170, 110);
    }
  },

  /* --------------------- level 4: the music room ------------------ */
  musicdone: {
    music: 'lullaby',
    enter() {
      musicDone = false;
      Dialogue.start([
        { who: 'Teacher', char: 'musicteacher',
          text: 'Oh wow, you did so great. You will make a very good musician!' },
        { who: 'Ayrisha', char: 'child', text: 'Thank you, teacher!' }
      ], () => { musicDone = true; });
    },
    done() { return musicDone; },
    draw(t) {
      const FLOOR = 148;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#c8b6d4');
      g.addColorStop(1, '#a692b4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      ctx.fillStyle = '#8b769c'; ctx.fillRect(24, 26, 60, 46);
      ctx.fillStyle = '#bfe3ff'; ctx.fillRect(28, 30, 52, 38);
      ctx.fillStyle = '#8b769c';
      ctx.fillRect(52, 26, 3, 46); ctx.fillRect(24, 46, 60, 3);
      ctx.fillStyle = '#6b5334'; ctx.fillRect(232, 30, 44, 34);
      ctx.fillStyle = '#f2e6c8'; ctx.fillRect(235, 33, 38, 28);
      ctx.fillStyle = '#3f8f6a';
      for (let i = 0; i < 5; i++) ctx.fillRect(239 + i * 7, 40, 3, 14);

      ctx.fillStyle = '#7d6a8c'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#8e7a9c'; ctx.fillRect(0, FLOOR, VIEW_W, 3);

      drawUpright(ctx, 96, FLOOR);

      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.musicteacher, 'idle', 1, 74, FLOOR, bob);
      drawCharacter(ctx, CHARACTERS.child, 'idle', 1, 186, FLOOR, bob);

      // a few notes hanging in the air after the lesson
      for (let i = 0; i < 8; i++) {
        const a = t * 0.6 + i * 0.8;
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#ffe9a8';
        const nx = Math.round(150 + Math.cos(a) * (26 + (i % 3) * 10));
        const ny = Math.round(FLOOR - 58 + Math.sin(a * 1.3) * 16);
        ctx.fillRect(nx, ny, 2, 5);
        ctx.fillRect(nx - 2, ny + 5, 4, 2);
      }
      ctx.globalAlpha = 1;
    }
  },

  /* --------------------- level 2: the classroom ------------------- */
  classroom: {
    dur: 4.2,
    music: 'lullaby',
    enter() { Sound.play('bell'); },
    draw(t) {
      const FLOOR = 150;
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, '#cfd6c6');
      g.addColorStop(1, '#a9b39a');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, VIEW_W, VIEW_H);

      // blackboard
      ctx.fillStyle = '#6b5334'; ctx.fillRect(24, 26, 128, 62);
      ctx.fillStyle = '#2f3e33'; ctx.fillRect(28, 30, 120, 54);
      ctx.strokeStyle = 'rgba(240,245,235,.55)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const y = 42 + i * 11;
        ctx.moveTo(38, y); ctx.lineTo(38 + 40 + (i % 3) * 22, y);
      }
      ctx.stroke();
      ctx.fillStyle = '#e8e4d6'; ctx.fillRect(28, 84, 120, 4);

      // window with morning light coming in
      ctx.fillStyle = '#8b8f7d'; ctx.fillRect(206, 30, 76, 56);
      ctx.fillStyle = '#bfe3ff'; ctx.fillRect(210, 34, 68, 48);
      ctx.fillStyle = '#8b8f7d';
      ctx.fillRect(242, 30, 3, 56); ctx.fillRect(206, 56, 76, 3);
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = '#fff3c4';
      ctx.beginPath();
      ctx.moveTo(210, 82); ctx.lineTo(278, 82);
      ctx.lineTo(232, FLOOR); ctx.lineTo(150, FLOOR);
      ctx.closePath(); ctx.fill();
      ctx.restore();

      // floor
      ctx.fillStyle = '#8a7256'; ctx.fillRect(0, FLOOR, VIEW_W, VIEW_H - FLOOR);
      ctx.fillStyle = '#9b8163'; ctx.fillRect(0, FLOOR, VIEW_W, 3);
      ctx.fillStyle = 'rgba(0,0,0,.09)';
      for (let x = 0; x < VIEW_W; x += 26) ctx.fillRect(x, FLOOR + 3, 1, VIEW_H - FLOOR);

      // three desks; hers is the one on the right
      for (const dx of [56, 128, 206]) {
        ctx.fillStyle = '#a8814f'; ctx.fillRect(dx, FLOOR - 17, 44, 6);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(dx + 3, FLOOR - 11, 4, 11);
        ctx.fillRect(dx + 37, FLOOR - 11, 4, 11);
        ctx.fillStyle = '#8a6a3f'; ctx.fillRect(dx + 6, FLOOR - 12, 32, 3);
      }

      // her, arriving at her desk and settling in
      const walk = Math.min(1, t / 1.5);
      const x = 178 + walk * 34;
      const bob = Math.sin(t * 2) > 0 ? 0 : 1;
      drawCharacter(ctx, CHARACTERS.child, walk < 1 ? 'stride' : 'idle', 1, x, FLOOR, bob);

      // her bag, set down once she gets there
      if (walk >= 1) {
        ctx.globalAlpha = Math.min(1, (t - 1.5) / 0.5);
        ctx.fillStyle = '#c4536a'; ctx.fillRect(196, FLOOR - 9, 12, 9);
        ctx.fillStyle = '#9c3d52'; ctx.fillRect(196, FLOOR - 9, 12, 3);
        ctx.globalAlpha = 1;
      }

      // dust in the light
      for (let i = 0; i < 12; i++) {
        const a = t * 0.5 + i * 0.7;
        ctx.globalAlpha = 0.2 + 0.25 * Math.sin(t * 2 + i);
        ctx.fillStyle = '#fff6d8';
        ctx.fillRect(Math.round(180 + Math.cos(a) * (20 + i * 4)),
                     Math.round(96 + Math.sin(a * 1.3) * 26 + i), 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }
};

/* ============================== THEMES ============================ */
const THEMES = {
  monsoon: {
    sky: ['#4d5768', '#626b7c', '#7b8290'],
    far: '#495061', near: '#3c4354', under: '#232833',
    skyline: true, rain: true, windows: 'rgba(242,198,106,.55)',
    glow: 0.13, vignette: 'rgba(30,34,44,.28)'
  },
  afternoon: {
    sky: ['#7fbfe0', '#f0c98a', '#fae3bc'],
    far: '#b3947a', tree: '#86a06d', near: '#8a6a58', under: '#3c302a',
    skyline: false, rain: false, windows: 'rgba(255,224,150,.55)',
    glow: 0.07, vignette: 'rgba(120,70,30,.18)'
  },
  morning: {
    sky: ['#8fd3f4', '#c6e8f7', '#eaf3e0'],
    far: '#9db6a8', near: '#7d9a8a', under: '#4a4436',
    skyline: false, rain: false, windows: 'rgba(255,236,170,.4)',
    glow: 0.05, vignette: 'rgba(255,250,220,.12)'
  }
};
const theme = () => THEMES[(level && level.meta.theme) || 'monsoon'];

/* Skyline (or treeline) generated once per act. */
function buildBackdrop(lv) {
  skyline = [];
  let x = -40;
  let seed = 20020906;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const th = THEMES[lv.meta.theme] || THEMES.monsoon;

  while (x < lv.pxW + 200) {
    if (th.skyline) {
      const w = 26 + Math.floor(rnd() * 34);
      const h = 40 + Math.floor(rnd() * 62);
      skyline.push({ tree: false, x, w, h, lit: Array.from({ length: 12 }, () => rnd() > 0.55) });
      x += w + 4 + Math.floor(rnd() * 10);
    } else {
      // low houses with the odd tree between them
      const isTree = rnd() > 0.5;
      const w = isTree ? 22 : 30 + Math.floor(rnd() * 26);
      const h = isTree ? 46 + Math.floor(rnd() * 22) : 38 + Math.floor(rnd() * 40);
      skyline.push({ tree: isTree, x, w, h, lit: [] });
      x += w + 6 + Math.floor(rnd() * 14);
    }
  }

  rain = th.rain ? Array.from({ length: 90 }, () => ({
    x: Math.random() * VIEW_W, y: Math.random() * VIEW_H,
    len: 5 + Math.random() * 7, v: 4.5 + Math.random() * 3
  })) : [];
}

function drawBackdrop() {
  const th = theme();
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, th.sky[0]);
  g.addColorStop(0.6, th.sky[1]);
  g.addColorStop(1, th.sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  if (!th.skyline) {
    // sun, and a few clouds drifting the other way to the camera
    ctx.fillStyle = 'rgba(255,241,176,.9)';
    ctx.beginPath(); ctx.arc(VIEW_W * 0.8, 30, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,241,176,.25)';
    ctx.beginPath(); ctx.arc(VIEW_W * 0.8, 30, 22, 0, Math.PI * 2); ctx.fill();
    for (let i = 0; i < 3; i++) {
      const cxp = ((i * 131 - cam.x * 0.12) % (VIEW_W + 120)) - 60;
      drawCloud(ctx, cxp, 24 + (i % 2) * 16, 0.42);
    }
  }

  const base = GROUND_Y * TILE - cam.y + 6;
  const px = cam.x * 0.35;
  for (const b of skyline) {
    const sx = b.x - px;
    if (sx + b.w < -30 || sx > VIEW_W + 30) continue;
    if (b.tree) {
      ctx.fillStyle = '#6f5a3c';
      ctx.fillRect(sx + b.w / 2 - 2, base - b.h * 0.42, 4, b.h * 0.42);
      ctx.fillStyle = th.tree || th.far;
      ctx.beginPath();
      ctx.arc(sx + b.w / 2, base - b.h * 0.62, b.w * 0.52, 0, Math.PI * 2);
      ctx.arc(sx + b.w / 2 - 8, base - b.h * 0.48, b.w * 0.36, 0, Math.PI * 2);
      ctx.arc(sx + b.w / 2 + 8, base - b.h * 0.48, b.w * 0.36, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = th.far;
      ctx.fillRect(sx, base - b.h, b.w, b.h);
      ctx.fillStyle = th.windows;
      for (let i = 0; i < b.lit.length; i++) {
        if (!b.lit[i] || i % 3) continue;
        const wx = sx + 4 + (i % 3) * 8;
        const wy = base - b.h + 7 + Math.floor(i / 3) * 11;
        if (wy < base - 4) ctx.fillRect(wx, wy, 3, 4);
      }
    }
  }

  const px2 = cam.x * 0.6;
  for (let i = 0; i < skyline.length; i += 2) {
    const b = skyline[i];
    if (b.tree) continue;
    const sx = b.x * 0.8 - px2;
    if (sx + b.w < -30 || sx > VIEW_W + 30) continue;
    ctx.fillStyle = th.near;
    ctx.fillRect(sx, base + 4 - b.h * 0.7, b.w * 0.9, b.h * 0.7);
  }

  // everything under the road is underneath the city, not sky
  ctx.fillStyle = th.under;
  ctx.fillRect(0, GROUND_Y * TILE - cam.y, VIEW_W, VIEW_H);

  drawInteriorWalls();
}

/* Indoor stretches get a back wall painted over the sky, so a corridor
   does not show a treeline through it. */
function drawInteriorWalls() {
  for (const span of (level.meta.indoorSpans || [])) {
    const x0 = Math.max(0, span.from * TILE - cam.x);
    const x1 = Math.min(VIEW_W, span.to * TILE - cam.x);
    if (x1 <= x0) continue;
    const top = CEIL_Y * TILE - cam.y;
    const floor = GROUND_Y * TILE - cam.y;

    const iw = level.meta.interiorWall ||
               { top: '#cbb894', bottom: '#bda884', skirt: '#a8946f' };
    const wall = ctx.createLinearGradient(0, top, 0, floor);
    wall.addColorStop(0, iw.top);
    wall.addColorStop(1, iw.bottom);
    ctx.fillStyle = wall;
    ctx.fillRect(x0, top, x1 - x0, floor - top);

    ctx.fillStyle = iw.skirt;           // skirting
    ctx.fillRect(x0, floor - 5, x1 - x0, 5);
    ctx.fillStyle = 'rgba(255,255,255,.10)';
    ctx.fillRect(x0, top, x1 - x0, 3);

    // tube lights, so the ceiling is not one blank slab
    const first = Math.floor((cam.x + x0) / 96) * 96;
    for (let wx = first; wx < cam.x + x1 + 96; wx += 96) {
      const lx = wx - cam.x;
      if (lx < x0 - 40 || lx > x1) continue;
      ctx.fillStyle = '#8a7a5c';
      ctx.fillRect(lx + 14, top, 2, 7);
      ctx.fillRect(lx + 34, top, 2, 7);
      ctx.fillStyle = '#fdf6d8';
      ctx.fillRect(lx + 8, top + 7, 34, 4);
      ctx.fillStyle = 'rgba(255,246,200,.14)';
      ctx.fillRect(lx + 2, top + 11, 46, 22);
    }
  }
}

/* =============================== PROPS ============================ */
const FRONT_PROPS = new Set(['bus', 'auto', 'hospital', 'schoolfront', 'desk',
                             'herdesk', 'bench', 'schoolgate', 'blackboard',
                             'noticeboard', 'streetsign', 'mangotree',
                             'housefront', 'housegate', 'deskpc', 'bookshelf',
                             'painting', 'doorway', 'railing', 'plantpot',
                             'easel', 'rug', 'mangouncle', 'guardpost', 'tv', 'musicfront', 'musicgate',
                             'instrumentwall', 'musicposter', 'piano',
                             'harmoniumspot', 'mallyasign', 'harmonium',
                             'flute', 'degree', 'kotasign', 'allenfront',
                             'hostelbed', 'studydesk', 'wallclock', 'anamspot',
                             'coffeestall', 'examdesk', 'herexamdesk']);

function drawProps(layer) {
  const base = GROUND_Y * TILE - cam.y;
  for (const p of level.meta.props) {
    if (FRONT_PROPS.has(p.type) !== (layer === 'front')) continue;
    const sx = p.x * TILE - cam.x;
    if (sx < -180 || sx > VIEW_W + 180) continue;

    switch (p.type) {

      case 'streetlight': {
        ctx.fillStyle = '#2f2a3d';
        ctx.fillRect(sx + 7, base - 46, 3, 46);
        ctx.fillRect(sx + 7, base - 48, 10, 3);
        ctx.fillStyle = '#ffe08a';
        ctx.fillRect(sx + 14, base - 46, 5, 4);
        const grd = ctx.createRadialGradient(sx + 16, base - 44, 2, sx + 16, base - 44, 44);
        grd.addColorStop(0, `rgba(255,215,130,${theme().glow})`);
        grd.addColorStop(1, 'rgba(255,215,130,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(sx - 28, base - 88, 88, 92);
        break;
      }

      case 'checkpoint':
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 7, base - 26, 2, 26);
        ctx.fillStyle = player && player.x > p.x * TILE ? '#7bd36b' : '#c4536a';
        ctx.fillRect(sx + 9, base - 26, 10, 7);
        break;

      case 'bus': {
        const w = p.w * TILE, h = p.h * TILE;
        ctx.fillStyle = '#e4dcc6'; ctx.fillRect(sx, base - h, w, h);
        ctx.fillStyle = '#b03a34'; ctx.fillRect(sx, base - h + h * 0.58, w, 7);
        ctx.fillStyle = '#8d2f2a'; ctx.fillRect(sx, base - h, w, 4);
        ctx.fillStyle = '#2b3346';
        for (let i = 0; i < p.w - 1; i++) ctx.fillRect(sx + 5 + i * TILE, base - h + 8, 11, 13);
        ctx.fillStyle = '#1c1a24';
        ctx.fillRect(sx + 6, base - 7, 10, 7);
        ctx.fillRect(sx + w - 16, base - 7, 10, 7);
        ctx.fillStyle = '#6a6255'; ctx.fillRect(sx, base - h + h * 0.58 + 7, w, 2);
        break;
      }

      case 'auto': {
        const w = 2 * TILE;
        ctx.fillStyle = '#111014'; ctx.fillRect(sx + 2, base - 13, w - 4, 10);
        ctx.fillStyle = '#f2c11e'; ctx.fillRect(sx + 1, base - 20, w - 2, 8);
        ctx.fillStyle = '#8a6d10'; ctx.fillRect(sx + 1, base - 20, w - 2, 2);
        ctx.fillStyle = '#2b3346'; ctx.fillRect(sx + 5, base - 18, 9, 5);
        ctx.fillStyle = '#1c1a24';
        ctx.fillRect(sx + 4, base - 5, 6, 5);
        ctx.fillRect(sx + w - 10, base - 5, 6, 5);
        break;
      }

      case 'hospital': {
        const w = p.w * TILE, top = 2 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x, cx = dx + TILE;
        ctx.fillStyle = 'rgba(255,226,150,.7)';
        for (let r = 0; r < 4; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 18 + r * 22;
            if (wy > base - 84 || (r * 7 + c) % 3 === 0) continue;
            ctx.fillRect(sx + 6 + c * TILE, wy, 6, 8);
          }
        ctx.fillStyle = '#d94f5c';
        ctx.fillRect(cx - 3, top + 8, 7, 21);
        ctx.fillRect(cx - 10, top + 15, 21, 7);
        signboard(cx, base - 78, 86, 'MANIPAL');
        ctx.fillStyle = '#5a627a';
        ctx.fillRect(sx, base - 51, (p.doorX + 2 - p.x) * TILE, 4);
        ctx.fillStyle = '#4a5166'; ctx.fillRect(sx + 2, base - 47, 5, 47);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(dx, base - 44, 32, 44);
        ctx.fillStyle = '#e8b878'; ctx.fillRect(dx + 15, base - 44, 2, 44);
        break;
      }

      /* ------------------------- level 2 ------------------------- */

      case 'home': {
        ctx.fillStyle = '#d9c8a8'; ctx.fillRect(sx - 6, base - 54, 58, 54);
        ctx.fillStyle = '#b4643f'; ctx.fillRect(sx - 12, base - 62, 70, 9);
        ctx.fillStyle = '#7c5a3a'; ctx.fillRect(sx + 12, base - 30, 15, 30);
        ctx.fillStyle = '#9ec8de'; ctx.fillRect(sx + 2, base - 44, 12, 12);
        ctx.fillRect(sx + 32, base - 44, 12, 12);
        ctx.fillStyle = '#c8b697';
        ctx.fillRect(sx + 2, base - 38, 12, 1); ctx.fillRect(sx + 32, base - 38, 12, 1);
        break;
      }

      case 'tree': {
        ctx.fillStyle = '#6b5236';
        ctx.fillRect(sx + 6, base - 34, 5, 34);
        ctx.fillStyle = '#4e8a4a';
        ctx.beginPath();
        ctx.arc(sx + 8, base - 42, 15, 0, Math.PI * 2);
        ctx.arc(sx - 4, base - 34, 11, 0, Math.PI * 2);
        ctx.arc(sx + 20, base - 34, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#61a45a';
        ctx.beginPath(); ctx.arc(sx + 4, base - 46, 8, 0, Math.PI * 2); ctx.fill();
        break;
      }

      case 'bench': {
        const w = 2 * TILE;
        ctx.fillStyle = '#8a6a3f'; ctx.fillRect(sx, base - 16, w, 5);
        ctx.fillStyle = '#6f5433';
        ctx.fillRect(sx + 2, base - 11, 4, 11);
        ctx.fillRect(sx + w - 6, base - 11, 4, 11);
        ctx.fillRect(sx, base - 24, w, 4);
        break;
      }

      case 'flagpole': {
        ctx.fillStyle = '#b9bfc9'; ctx.fillRect(sx + 7, base - 68, 3, 68);
        ctx.fillStyle = '#e8e2d4'; ctx.fillRect(sx + 2, base - 4, 14, 4);
        ctx.fillStyle = '#f0952a'; ctx.fillRect(sx + 10, base - 68, 22, 5);
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 10, base - 63, 22, 5);
        ctx.fillStyle = '#2f7d43'; ctx.fillRect(sx + 10, base - 58, 22, 5);
        break;
      }

      case 'schoolgate': {
        const open = !!(level.meta.gate && level.meta.gate.opened);
        ctx.fillStyle = '#7a8493';
        ctx.fillRect(sx - 2, base - 52, 8, 52);
        ctx.fillRect(sx + 42, base - 52, 8, 52);
        ctx.fillStyle = '#8f99a8'; ctx.fillRect(sx - 6, base - 58, 60, 7);
        ctx.fillStyle = '#9aa4b3';
        if (open) {
          // both leaves folded back against their posts
          for (let i = 0; i < 3; i++) {
            ctx.fillRect(sx + 1 + i * 3, base - 44, 2, 44);
            ctx.fillRect(sx + 44 + i * 3, base - 44, 2, 44);
          }
        } else {
          for (let i = 0; i < 6; i++) ctx.fillRect(sx + 8 + i * 6, base - 44, 3, 44);
          ctx.fillRect(sx + 6, base - 34, 38, 3);
          ctx.fillStyle = '#c8a23a';                 // padlock
          ctx.fillRect(sx + 22, base - 30, 7, 6);
          ctx.fillStyle = '#8f99a8';
          ctx.fillRect(sx + 24, base - 34, 3, 4);
        }
        signboard(sx + 24, base - 84, 112, SCHOOL_NAME);
        break;
      }

      case 'schoolfront': {
        const w = p.w * TILE, top = 2 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = 'rgba(190,220,240,.55)';
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 16 + r * 20;
            if (wy > base - 62) continue;
            ctx.fillRect(sx + 5 + c * TILE, wy, 9, 11);
          }
        ctx.fillStyle = '#b4643f'; ctx.fillRect(sx - 4, top, w + 8, 7);
        ctx.fillStyle = '#5b4a3a'; ctx.fillRect(dx - 2, base - 46, 36, 46);
        ctx.fillStyle = '#f6e8c8'; ctx.fillRect(dx, base - 43, 32, 43);
        ctx.fillStyle = '#c8b48c'; ctx.fillRect(dx + 15, base - 43, 2, 43);
        break;
      }

      case 'mangouncle':
        drawCharacter(ctx, CHARACTERS.mangouncle, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 850) > 0 ? 0 : 1);
        break;

      case 'guardpost': {
        drawCharacter(ctx, CHARACTERS.guard, 'idle', 1, sx + 8, base,
                      Math.sin(performance.now() / 900) > 0 ? 0 : 1);
        // his stool, off to one side, so the post looks lived in
        ctx.fillStyle = '#6b5334';
        ctx.fillRect(sx + 20, base - 9, 12, 3);
        ctx.fillRect(sx + 21, base - 6, 2, 6);
        ctx.fillRect(sx + 29, base - 6, 2, 6);
        break;
      }

      case 'streetsign': {
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 8, base - 40, 3, 40);
        ctx.fillStyle = '#2f6b8f';
        ctx.fillRect(sx - 22, base - 52, 64, 14);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.text || LOCALITY, sx + 10, base - 42);
        ctx.textAlign = 'left';
        break;
      }

      case 'mangotree': {
        const w = p.w * TILE;
        const cxp = sx + w / 2;
        // trunk
        ctx.fillStyle = '#6b5236';
        ctx.fillRect(cxp - 6, base - 96, 12, 96);
        ctx.fillStyle = '#5a4429';
        ctx.fillRect(cxp - 6, base - 96, 4, 96);
        // roots
        ctx.fillRect(cxp - 14, base - 6, 9, 6);
        ctx.fillRect(cxp + 6, base - 6, 9, 6);
        // limbs out to each branch platform
        ctx.strokeStyle = '#6b5236';
        ctx.lineWidth = 4;
        ctx.beginPath();
        for (const br of p.branches) {
          const bx = (br.x + br.len / 2) * TILE - cam.x;
          const by = br.row * TILE - cam.y;
          ctx.moveTo(cxp, by + 10);
          ctx.lineTo(bx, by + 2);
        }
        ctx.stroke();
        // the branch platforms themselves
        for (const br of p.branches) {
          const bx = br.x * TILE - cam.x;
          const by = br.row * TILE - cam.y;
          ctx.fillStyle = '#7a5f3c';
          ctx.fillRect(bx, by, br.len * TILE, 5);
          ctx.fillStyle = '#8f7148';
          ctx.fillRect(bx, by, br.len * TILE, 2);
        }
        // canopy, drawn last so it sits over the limbs
        ctx.fillStyle = '#3f7a3c';
        for (const [ox, oy, r] of [[0, -104, 40], [-30, -88, 28], [32, -88, 28],
                                   [-16, -116, 26], [18, -116, 26]]) {
          ctx.beginPath();
          ctx.arc(cxp + ox, base + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#4f9448';
        for (const [ox, oy, r] of [[-8, -120, 20], [26, -100, 18], [-34, -98, 16]]) {
          ctx.beginPath();
          ctx.arc(cxp + ox, base + oy, r, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'housegate': {
        ctx.fillStyle = '#7c6a52';
        ctx.fillRect(sx, base - 30, 4, 30);
        ctx.fillRect(sx + 34, base - 30, 4, 30);
        ctx.fillStyle = '#95815f';
        for (let i = 0; i < 5; i++) ctx.fillRect(sx + 7 + i * 6, base - 24, 3, 24);
        ctx.fillRect(sx + 4, base - 26, 32, 3);
        ctx.fillRect(sx + 4, base - 12, 32, 3);
        break;
      }

      case 'housefront': {
        const w = p.w * TILE, top = 3 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        // sloped roof
        ctx.fillStyle = '#8a4b3a';
        ctx.beginPath();
        ctx.moveTo(sx - 8, top + 4);
        ctx.lineTo(sx + w / 2, top - 16);
        ctx.lineTo(sx + w + 8, top + 4);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6f3b2d';
        ctx.fillRect(sx - 8, top + 4, w + 16, 5);
        // the balcony she will end up on
        ctx.fillStyle = '#b08e70';
        ctx.fillRect(sx + 10, top + 34, 54, 4);
        ctx.fillStyle = '#c9a98a';
        for (let i = 0; i < 8; i++) ctx.fillRect(sx + 12 + i * 7, top + 22, 3, 12);
        // windows
        ctx.fillStyle = '#f5d78e';
        ctx.fillRect(sx + w - 44, top + 20, 15, 17);
        ctx.fillRect(sx + w - 24, top + 20, 15, 17);
        // the front door
        ctx.fillStyle = '#5b3a28'; ctx.fillRect(dx - 3, base - 48, 38, 48);
        ctx.fillStyle = '#7c4f34'; ctx.fillRect(dx, base - 45, 32, 45);
        ctx.fillStyle = '#e8c37a'; ctx.fillRect(dx + 26, base - 25, 3, 3);
        break;
      }

      case 'rug': {
        ctx.fillStyle = '#8a4b52'; ctx.fillRect(sx, base - 4, 74, 4);
        ctx.fillStyle = '#a85e63'; ctx.fillRect(sx + 6, base - 4, 62, 2);
        break;
      }

      case 'deskpc': {
        // He stands behind the desk, which is deliberately low: at this
        // scale a normal-height desk hides a 24px man completely.
        drawCharacter(ctx, CHARACTERS.husband, 'idle', 1, sx + 44, base,
                      Math.sin(performance.now() / 900) > 0 ? 0 : 1);
        const top = base - 14;
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx, top, 60, 4);
        ctx.fillStyle = '#573b28';
        ctx.fillRect(sx + 3, top + 4, 4, 10);
        ctx.fillRect(sx + 53, top + 4, 4, 10);
        // a boxy old monitor, glowing, off to his left
        ctx.fillStyle = '#d8d3c6'; ctx.fillRect(sx + 4, top - 20, 28, 20);
        ctx.fillStyle = '#3a5b6b'; ctx.fillRect(sx + 7, top - 17, 22, 13);
        ctx.fillStyle = 'rgba(150,220,255,.16)';
        ctx.fillRect(sx - 4, top - 27, 44, 28);
        ctx.fillStyle = '#b8b2a4'; ctx.fillRect(sx + 34, top - 3, 20, 3);
        break;
      }

      case 'bookshelf': {
        ctx.fillStyle = '#5f4128'; ctx.fillRect(sx, base - 62, 46, 62);
        ctx.fillStyle = '#3f2b19';
        for (let r = 0; r < 3; r++) ctx.fillRect(sx + 2, base - 58 + r * 19, 42, 3);
        const cols = ['#c8324b', '#3f8f4a', '#3c62b4', '#ef8a3c', '#7d5bbe', '#f5cd24'];
        for (let r = 0; r < 3; r++)
          for (let i = 0; i < 7; i++) {
            ctx.fillStyle = cols[(r * 7 + i) % cols.length];
            ctx.fillRect(sx + 4 + i * 6, base - 55 + r * 19, 4, 13);
          }
        break;
      }

      case 'painting': {
        ctx.fillStyle = '#7c5a34'; ctx.fillRect(sx, base - 60, 40, 32);
        ctx.fillStyle = '#f2e6c8'; ctx.fillRect(sx + 3, base - 57, 34, 26);
        ctx.fillStyle = '#8fb96a'; ctx.fillRect(sx + 3, base - 40, 34, 9);
        ctx.fillStyle = '#e0894a';
        ctx.beginPath(); ctx.arc(sx + 27, base - 48, 5, 0, Math.PI * 2); ctx.fill();
        break;
      }

      case 'doorway': {
        ctx.fillStyle = '#5b3a28'; ctx.fillRect(sx - 4, base - 58, 40, 58);
        ctx.fillStyle = '#f4dfae'; ctx.fillRect(sx, base - 54, 32, 54);
        ctx.fillStyle = 'rgba(255,224,160,.30)';
        ctx.fillRect(sx - 10, base - 62, 52, 62);
        break;
      }

      case 'railing': {
        const w = (p.w || 12) * TILE;
        ctx.fillStyle = '#b08e70'; ctx.fillRect(sx, base - 34, w, 5);
        ctx.fillStyle = '#c9a98a';
        for (let i = 0; i * 8 < w; i++) ctx.fillRect(sx + i * 8, base - 29, 3, 29);
        ctx.fillStyle = '#9b7a5e'; ctx.fillRect(sx, base - 6, w, 6);
        break;
      }

      case 'plantpot': {
        ctx.fillStyle = '#3f8f4a';
        for (const [ox, oy, r] of [[8, -30, 9], [1, -22, 7], [15, -22, 7]]) {
          ctx.beginPath(); ctx.arc(sx + ox, base + oy, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = '#b1633c'; ctx.fillRect(sx + 2, base - 14, 14, 14);
        ctx.fillStyle = '#c9754a'; ctx.fillRect(sx, base - 17, 18, 4);
        break;
      }

      case 'easel': {
        // she stands on the near side, facing into the canvas
        drawCharacter(ctx, CHARACTERS.tutor, 'idle', 1, sx + 6, base,
                      Math.sin(performance.now() / 800) > 0 ? 0 : 1);
        ctx.strokeStyle = '#8a6a3f'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(sx + 26, base); ctx.lineTo(sx + 36, base - 42);
        ctx.moveTo(sx + 50, base); ctx.lineTo(sx + 40, base - 42);
        ctx.moveTo(sx + 38, base - 20); ctx.lineTo(sx + 47, base - 4);
        ctx.stroke();
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx + 20, base - 40, 36, 4);
        ctx.fillStyle = '#fbf6ea'; ctx.fillRect(sx + 22, base - 66, 32, 27);
        ctx.fillStyle = '#c8324b';
        ctx.beginPath(); ctx.arc(sx + 34, base - 54, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3f8f4a'; ctx.fillRect(sx + 28, base - 47, 20, 5);
        break;
      }

      case 'musicgate': {
        ctx.fillStyle = '#7a6a84';
        ctx.fillRect(sx, base - 34, 5, 34);
        ctx.fillRect(sx + 40, base - 34, 5, 34);
        ctx.fillStyle = '#8f7d9a'; ctx.fillRect(sx - 4, base - 40, 53, 6);
        ctx.fillStyle = '#a08cb0';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 8 + i * 6, base - 28, 3, 28);
        break;
      }

      case 'musicfront': {
        const w = p.w * TILE, top = 3 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = '#8e5f7c'; ctx.fillRect(sx - 6, top - 6, w + 12, 9);
        // windows
        ctx.fillStyle = 'rgba(255,240,200,.6)';
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 14 + r * 20;
            if (wy > base - 62) continue;
            ctx.fillRect(sx + 5 + c * TILE, wy, 9, 11);
          }
        // a big treble clef on the wall
        ctx.strokeStyle = '#f6e3a8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx + w - 34, base - 74, 7, 0, Math.PI * 2);
        ctx.moveTo(sx + w - 34, base - 81);
        ctx.lineTo(sx + w - 30, base - 108);
        ctx.stroke();
        signboard(sx + w / 2, base - 58, 118, MUSIC_SCHOOL_NAME);
        // doorway
        ctx.fillStyle = '#4a3040'; ctx.fillRect(dx - 3, base - 46, 38, 46);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(dx, base - 43, 32, 43);
        ctx.fillStyle = '#e0b98a'; ctx.fillRect(dx + 15, base - 43, 2, 43);
        break;
      }

      case 'instrumentwall': {
        // a guitar and a pair of tablas hung on the wall
        ctx.fillStyle = '#8a5a34';
        ctx.beginPath(); ctx.ellipse(sx + 12, base - 40, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5f3d22';
        ctx.beginPath(); ctx.arc(sx + 12, base - 42, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx + 11, base - 68, 3, 18);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(sx + 10, base - 71, 5, 4);
        ctx.fillStyle = '#b9793f';
        ctx.fillRect(sx + 30, base - 44, 13, 14);
        ctx.fillRect(sx + 46, base - 40, 11, 10);
        ctx.fillStyle = '#efe4cf';
        ctx.fillRect(sx + 30, base - 46, 13, 3);
        ctx.fillRect(sx + 46, base - 42, 11, 3);
        break;
      }

      case 'allenfront': {
        const w = p.w * TILE, top = 3 * TILE - cam.y;
        const dx = p.doorX * TILE - cam.x;
        ctx.fillStyle = '#9c5f3c'; ctx.fillRect(sx - 6, top - 6, w + 12, 9);
        ctx.fillStyle = 'rgba(255,240,200,.55)';
        for (let r = 0; r < 3; r++)
          for (let c = 0; c < p.w; c += 2) {
            const wy = top + 14 + r * 20;
            if (wy > base - 62) continue;
            ctx.fillRect(sx + 5 + c * TILE, wy, 9, 11);
          }
        signboard(sx + w / 2, base - 58, 108, ['ALLEN', 'KOTA']);
        ctx.fillStyle = '#4a3040'; ctx.fillRect(dx - 3, base - 46, 38, 46);
        ctx.fillStyle = '#ffdca0'; ctx.fillRect(dx, base - 43, 32, 43);
        ctx.fillStyle = '#e0b98a'; ctx.fillRect(dx + 15, base - 43, 2, 43);
        break;
      }

      case 'hostelbed': {
        ctx.fillStyle = '#7d6a55'; ctx.fillRect(sx, base - 20, 4, 20);
        ctx.fillRect(sx + 58, base - 16, 4, 16);
        ctx.fillStyle = '#cdbfa6'; ctx.fillRect(sx, base - 14, 62, 8);
        ctx.fillStyle = '#e8dfcc'; ctx.fillRect(sx + 4, base - 19, 18, 6);
        ctx.fillStyle = '#8a6f8f'; ctx.fillRect(sx + 24, base - 15, 36, 3);
        break;
      }

      case 'studydesk': {
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx, base - 17, 58, 4);
        ctx.fillStyle = '#573b28';
        ctx.fillRect(sx + 3, base - 13, 4, 13);
        ctx.fillRect(sx + 51, base - 13, 4, 13);
        // books, papers, and a lamp burning
        ctx.fillStyle = '#c8324b'; ctx.fillRect(sx + 6, base - 24, 7, 7);
        ctx.fillStyle = '#3c62b4'; ctx.fillRect(sx + 14, base - 22, 7, 5);
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 24, base - 19, 18, 2);
        ctx.fillStyle = '#8e97a8'; ctx.fillRect(sx + 47, base - 30, 2, 13);
        ctx.fillStyle = '#e8b93c'; ctx.fillRect(sx + 42, base - 35, 12, 5);
        const gl = ctx.createRadialGradient(sx + 48, base - 30, 3, sx + 48, base - 30, 34);
        gl.addColorStop(0, 'rgba(255,226,140,.30)');
        gl.addColorStop(1, 'rgba(255,226,140,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(sx + 12, base - 64, 74, 66);
        break;
      }

      case 'wallclock': {
        ctx.fillStyle = '#e8ddd0';
        ctx.beginPath(); ctx.arc(sx + 10, base - 54, 11, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3b2d33'; ctx.lineWidth = 1;
        const tt = performance.now() / 1000;
        ctx.beginPath();
        ctx.moveTo(sx + 10, base - 54);
        ctx.lineTo(sx + 10 + Math.cos(tt - 1.6) * 7, base - 54 + Math.sin(tt - 1.6) * 7);
        ctx.moveTo(sx + 10, base - 54);
        ctx.lineTo(sx + 10 + Math.cos(tt / 12 - 1.6) * 4.5,
                   base - 54 + Math.sin(tt / 12 - 1.6) * 4.5);
        ctx.stroke();
        break;
      }

      case 'anamspot': {
        drawCharacter(ctx, CHARACTERS.anam, 'idle', 1, sx + 10, base,
                      Math.sin(performance.now() / 780) > 0 ? 0 : 1);
        break;
      }

      case 'coffeestall': {
        // a roadside stall with a board and two glasses on the counter
        ctx.fillStyle = '#7c4f34'; ctx.fillRect(sx - 6, base - 34, 74, 6);
        ctx.fillStyle = '#5b3a26';
        ctx.fillRect(sx - 4, base - 28, 5, 28);
        ctx.fillRect(sx + 62, base - 28, 5, 28);
        ctx.fillStyle = '#c8a06a'; ctx.fillRect(sx, base - 20, 62, 5);
        ctx.fillStyle = '#f4f1ea'; ctx.fillRect(sx + 8, base - 50, 46, 15);
        ctx.fillStyle = '#5b3a26';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('COLD COFFEE', sx + 31, base - 40);
        ctx.textAlign = 'left';
        for (const gx of [sx + 14, sx + 40]) {
          ctx.fillStyle = '#e8e4da'; ctx.fillRect(gx, base - 32, 9, 12);
          ctx.fillStyle = '#6b4a33'; ctx.fillRect(gx + 1, base - 28, 7, 8);
          ctx.fillStyle = '#f7f2e2'; ctx.fillRect(gx + 1, base - 30, 7, 2);
        }
        break;
      }

      case 'examdesk':
      case 'herexamdesk': {
        const w = 2 * TILE;
        ctx.fillStyle = '#a8814f'; ctx.fillRect(sx, base - 16, w, 5);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(sx + 3, base - 11, 4, 11);
        ctx.fillRect(sx + w - 7, base - 11, 4, 11);
        // an OMR sheet and a pencil
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 6, base - 18, 14, 2);
        ctx.fillStyle = '#c8324b'; ctx.fillRect(sx + 22, base - 18, 6, 1);
        if (p.type === 'herexamdesk') {
          ctx.save();
          ctx.globalAlpha = 0.3 + 0.15 * Math.sin(performance.now() / 400);
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(sx - 4, base - 42, w + 8, 28);
          ctx.restore();
        }
        break;
      }

      case 'mallyasign': {
        ctx.fillStyle = '#6a7f8f';
        ctx.fillRect(sx + 6, base - 46, 5, 46);
        ctx.fillRect(sx + 38, base - 46, 5, 46);
        signboard(sx + 24, base - 74, 116, ['MALLYA ADITI', 'INTERNATIONAL']);
        break;
      }

      case 'harmonium': {
        // box body, bellows at the back, keys along the front
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(sx, base - 22, 54, 22);
        ctx.fillStyle = '#8a6242'; ctx.fillRect(sx, base - 26, 54, 4);
        ctx.fillStyle = '#5a3d29'; ctx.fillRect(sx + 40, base - 40, 14, 18);
        ctx.fillStyle = '#c9a227';
        for (let i = 0; i < 3; i++) ctx.fillRect(sx + 42, base - 37 + i * 5, 10, 2);
        ctx.fillStyle = '#fdf8ec'; ctx.fillRect(sx + 3, base - 20, 34, 6);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 6 + i * 5.4, base - 20, 2, 4);
        break;
      }

      case 'flute': {
        // a bansuri on a small stand
        ctx.fillStyle = '#6b5334';
        ctx.fillRect(sx + 4, base - 26, 3, 26);
        ctx.fillRect(sx + 30, base - 26, 3, 26);
        ctx.fillStyle = '#d9b06a';
        ctx.fillRect(sx - 2, base - 30, 44, 5);
        ctx.fillStyle = '#a8813f';
        for (let i = 0; i < 6; i++) ctx.fillRect(sx + 6 + i * 5, base - 29, 2, 2);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(sx - 2, base - 30, 3, 5);
        ctx.fillRect(sx + 39, base - 30, 3, 5);
        break;
      }

      case 'degree': {
        // a rolled certificate with a ribbon, on a stand
        ctx.fillStyle = '#8e97a8'; ctx.fillRect(sx + 18, base - 26, 3, 26);
        ctx.fillStyle = '#f7f2e2';
        ctx.fillRect(sx + 2, base - 58, 36, 32);
        ctx.fillStyle = '#d8cfb6'; ctx.fillRect(sx + 2, base - 58, 36, 3);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 4; i++) ctx.fillRect(sx + 7, base - 50 + i * 5, 26, 1);
        ctx.fillStyle = '#c8402f';
        ctx.beginPath(); ctx.arc(sx + 20, base - 32, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffcf4d';
        ctx.beginPath(); ctx.arc(sx + 20, base - 32, 2.5, 0, Math.PI * 2); ctx.fill();
        // a soft glow, because this is the moment she grows
        const gl = ctx.createRadialGradient(sx + 20, base - 42, 4, sx + 20, base - 42, 46);
        gl.addColorStop(0, 'rgba(255,236,170,.28)');
        gl.addColorStop(1, 'rgba(255,236,170,0)');
        ctx.fillStyle = gl;
        ctx.fillRect(sx - 30, base - 90, 100, 96);
        break;
      }

      case 'kotasign': {
        ctx.fillStyle = '#8e97a8'; ctx.fillRect(sx + 14, base - 44, 3, 44);
        ctx.fillStyle = '#2f6b8f'; ctx.fillRect(sx - 14, base - 60, 62, 16);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('KOTA', sx + 17, base - 49);
        ctx.textAlign = 'left';
        // a milestone the way roads in Rajasthan have them
        ctx.fillStyle = '#e8e2d4';
        ctx.fillRect(sx + 34, base - 16, 14, 16);
        ctx.fillStyle = '#c8402f'; ctx.fillRect(sx + 34, base - 16, 14, 5);
        break;
      }

      case 'harmoniumspot': {
        drawCharacter(ctx, CHARACTERS.musicteacher, 'idle', 1, sx + 40, base,
                      Math.sin(performance.now() / 820) > 0 ? 0 : 1);
        // a harmonium sitting on the floor, lid up, bellows at the back
        const hx = sx - 34;
        ctx.fillStyle = '#6b4a33'; ctx.fillRect(hx, base - 20, 50, 20);
        ctx.fillStyle = '#8a6242'; ctx.fillRect(hx, base - 24, 50, 4);
        ctx.fillStyle = '#5a3d29'; ctx.fillRect(hx + 36, base - 38, 14, 18);
        ctx.fillStyle = '#c9a227';
        for (let i = 0; i < 3; i++) ctx.fillRect(hx + 38, base - 35 + i * 5, 10, 2);
        ctx.fillStyle = '#fdf8ec'; ctx.fillRect(hx + 3, base - 18, 30, 6);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 5; i++) ctx.fillRect(hx + 6 + i * 5.4, base - 18, 2, 4);
        // a music stand beside her
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 62, base - 40, 2, 40);
        ctx.fillRect(sx + 56, base - 2, 14, 2);
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 52, base - 52, 22, 14);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 3; i++) ctx.fillRect(sx + 55, base - 48 + i * 4, 16, 1);
        break;
      }

      case 'musicposter': {
        ctx.fillStyle = '#5f4128'; ctx.fillRect(sx, base - 58, 42, 30);
        ctx.fillStyle = '#f7f2e2'; ctx.fillRect(sx + 3, base - 55, 36, 24);
        ctx.fillStyle = '#241b26';
        for (let i = 0; i < 4; i++) ctx.fillRect(sx + 6, base - 50 + i * 5, 30, 1);
        ctx.fillStyle = '#c8324b';
        ctx.fillRect(sx + 12, base - 46, 3, 3);
        ctx.fillRect(sx + 22, base - 41, 3, 3);
        ctx.fillRect(sx + 30, base - 51, 3, 3);
        break;
      }

      case 'piano': {
        drawCharacter(ctx, CHARACTERS.musicteacher, 'idle', 1, sx + 74, base,
                      Math.sin(performance.now() / 820) > 0 ? 0 : 1);
        drawUpright(ctx, sx, base);
        break;
      }

      case 'tv': {
        const on = !!(level.meta.tv && level.meta.tv.on);
        const t = performance.now() / 1000;
        // stand
        ctx.fillStyle = '#5f4128';
        ctx.fillRect(sx + 4, base - 14, 46, 4);
        ctx.fillRect(sx + 8, base - 10, 5, 10);
        ctx.fillRect(sx + 41, base - 10, 5, 10);
        // set
        ctx.fillStyle = '#d6cfc0';
        ctx.fillRect(sx + 2, base - 48, 50, 34);
        ctx.fillStyle = '#b9b1a1';
        ctx.fillRect(sx + 40, base - 45, 9, 28);
        ctx.fillStyle = '#8f8778';
        ctx.beginPath(); ctx.arc(sx + 44, base - 38, 2.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 44, base - 30, 2.4, 0, Math.PI * 2); ctx.fill();
        // antenna
        ctx.strokeStyle = '#9a9284';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx + 18, base - 48); ctx.lineTo(sx + 10, base - 62);
        ctx.moveTo(sx + 24, base - 48); ctx.lineTo(sx + 34, base - 60);
        ctx.stroke();

        const px = sx + 6, py = base - 44, pw = 32, ph = 26;
        if (!on) {
          ctx.fillStyle = '#2e2b31';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = 'rgba(255,255,255,.05)';
          ctx.fillRect(px + 2, py + 2, 10, ph - 4);
        } else {
          // Kid vs Kat: Coop running, Mr Kat right behind him
          const t2 = performance.now() / 1000;
          ctx.fillStyle = '#cfd8e4';
          ctx.fillRect(px, py, pw, ph);
          ctx.fillStyle = '#b6c2d2';
          ctx.fillRect(px, py, pw, 8);
          ctx.fillStyle = '#8a7a5c';
          ctx.fillRect(px, py + ph - 5, pw, 5);

          const floor = py + ph - 5;
          const run = (t2 * 15) % (pw + 30);
          const bob = Math.abs(Math.sin(t2 * 11)) * 1.5;
          const coopX = Math.round(px + pw + 10 - run);
          const katX = coopX + 13;

          // Coop
          if (coopX > px - 10 && coopX < px + pw) {
            const by = Math.round(floor - bob);
            ctx.fillStyle = '#2e3550';
            ctx.fillRect(coopX + 1, by - 3, 2, 3);
            ctx.fillRect(coopX + 4, by - 3, 2, 3);
            ctx.fillStyle = '#3f7fbf';
            ctx.fillRect(coopX, by - 8, 7, 5);
            ctx.fillStyle = '#f2c9a0';
            ctx.fillRect(coopX + 1, by - 12, 5, 4);
            ctx.fillStyle = '#c0562e';                 // his red hair
            ctx.fillRect(coopX, by - 13, 7, 2);
            ctx.fillRect(coopX, by - 12, 1, 2);
            ctx.fillStyle = '#241b26';
            ctx.fillRect(coopX + 4, by - 11, 1, 1);
          }

          // Mr Kat — hairless, big ears, green eyes
          if (katX > px - 12 && katX < px + pw) {
            const by = Math.round(floor - Math.abs(Math.sin(t2 * 11 + 1)) * 1.5);
            ctx.fillStyle = '#8d8fa8';
            ctx.fillRect(katX + 8, by - 8, 3, 1);      // tail
            ctx.fillRect(katX + 10, by - 10, 1, 2);
            ctx.fillRect(katX + 1, by - 6, 7, 5);      // body
            ctx.fillRect(katX + 1, by - 1, 2, 1);
            ctx.fillRect(katX + 5, by - 1, 2, 1);
            ctx.fillRect(katX, by - 12, 7, 6);         // head
            ctx.fillRect(katX, by - 14, 2, 2);         // ears
            ctx.fillRect(katX + 5, by - 14, 2, 2);
            ctx.fillStyle = '#7fe04a';                 // green eyes
            ctx.fillRect(katX + 1, by - 11, 2, 2);
            ctx.fillRect(katX + 4, by - 11, 2, 2);
            ctx.fillStyle = '#241b26';
            ctx.fillRect(katX + 2, by - 10, 1, 1);
            ctx.fillRect(katX + 5, by - 10, 1, 1);
          }

          // scanlines and a bit of glow into the room
          ctx.fillStyle = 'rgba(0,0,0,.10)';
          for (let yy = 0; yy < ph; yy += 3) ctx.fillRect(px, py + yy, pw, 1);
          ctx.fillStyle = 'rgba(150,210,255,.14)';
          ctx.fillRect(px - 12, py - 10, pw + 24, ph + 26);
        }
        break;
      }

      case 'noticeboard': {
        ctx.fillStyle = '#6b5334'; ctx.fillRect(sx, base - 52, 44, 30);
        ctx.fillStyle = '#d8cba6'; ctx.fillRect(sx + 3, base - 49, 38, 24);
        const cols = ['#c4536a', '#5b7fc4', '#e8b93c', '#4e8a4a'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = cols[i];
          ctx.fillRect(sx + 6 + (i % 2) * 19, base - 45 + Math.floor(i / 2) * 12, 14, 9);
        }
        break;
      }

      case 'blackboard': {
        ctx.fillStyle = '#6b5334'; ctx.fillRect(sx, base - 74, 104, 52);
        ctx.fillStyle = '#2f3e33'; ctx.fillRect(sx + 4, base - 70, 96, 44);
        ctx.strokeStyle = 'rgba(240,245,235,.5)'; ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const y = base - 60 + i * 11;
          ctx.moveTo(sx + 12, y); ctx.lineTo(sx + 12 + 34 + (i % 3) * 18, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#e8e4d6'; ctx.fillRect(sx + 4, base - 26, 96, 4);
        break;
      }

      case 'desk':
      case 'herdesk': {
        const w = 2 * TILE;
        ctx.fillStyle = '#a8814f'; ctx.fillRect(sx, base - 16, w, 5);
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(sx + 3, base - 11, 4, 11);
        ctx.fillRect(sx + w - 7, base - 11, 4, 11);
        ctx.fillRect(sx + 5, base - 24, w - 10, 3);
        ctx.fillRect(sx + 5, base - 21, 3, 10);
        if (p.type === 'herdesk') {
          // a warm marker so you can see which desk is the goal
          ctx.save();
          ctx.globalAlpha = 0.3 + 0.15 * Math.sin(performance.now() / 400);
          ctx.fillStyle = '#ffd166';
          ctx.fillRect(sx - 4, base - 44, w + 8, 30);
          ctx.restore();
        }
        break;
      }
    }
  }
}

/* An upright piano: body, lid, keys, and a stool. */
function drawUpright(ctx, x, base) {
  ctx.fillStyle = '#5b3f2e'; ctx.fillRect(x, base - 46, 58, 46);
  ctx.fillStyle = '#6f4e39'; ctx.fillRect(x, base - 46, 58, 5);
  ctx.fillStyle = '#4a3226'; ctx.fillRect(x + 4, base - 39, 50, 16);
  ctx.fillStyle = '#fdf8ec'; ctx.fillRect(x + 4, base - 21, 50, 8);
  ctx.fillStyle = '#241b26';
  for (let i = 0; i < 9; i++) ctx.fillRect(x + 8 + i * 5.4, base - 21, 2, 5);
  ctx.fillStyle = '#3a2820'; ctx.fillRect(x + 4, base - 13, 50, 3);
  ctx.fillStyle = '#6b4a33';
  ctx.fillRect(x + 22, base - 9, 16, 3);
  ctx.fillRect(x + 24, base - 6, 2, 6);
  ctx.fillRect(x + 34, base - 6, 2, 6);
}

/* A small white board with pixel lettering. Takes one line or two —
   a long school name needs the second line to stay legible. */
function signboard(cx, y, w, text) {
  const lines = Array.isArray(text) ? text : [text];
  const h = lines.length > 1 ? 26 : 17;
  ctx.fillStyle = '#f4f1ea';
  ctx.fillRect(cx - w / 2, y, w, h);
  ctx.fillStyle = '#c8402f';
  ctx.fillRect(cx - w / 2, y, w, 3);
  ctx.fillStyle = '#1d2a44';
  ctx.textAlign = 'center';
  if (lines.length > 1) {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(lines[0], cx, y + 13);
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.fillText(lines[1], cx, y + 22);
  } else {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(lines[0], cx, y + 12);
  }
  ctx.textAlign = 'left';
}

/* Mangoes hang off the branches; walking into one takes it. */
function drawPickups() {
  for (const p of (level.meta.pickups || [])) {
    if (p.got) continue;
    const x = p.x - cam.x, y = p.y - cam.y;
    if (x < -20 || x > VIEW_W + 20) continue;
    const sway = Math.sin(performance.now() / 620 + p.x) * 1.2;

    const mx = x + sway;
    ctx.fillStyle = '#4a3a24';                       // stalk
    ctx.fillRect(Math.round(mx), y - 6, 1, 5);
    ctx.fillStyle = '#3f7a3c';                       // leaf
    ctx.fillRect(Math.round(mx) + 1, y - 7, 5, 2);

    ctx.save();
    ctx.translate(mx, y + 2);
    ctx.rotate(-0.42);
    ctx.fillStyle = '#e8a41f';                       // the mango
    ctx.beginPath(); ctx.ellipse(0, 0, 6.5, 4.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d2611f';                       // ripe blush
    ctx.beginPath(); ctx.ellipse(-2, -1, 3.4, 2.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f7d982';                       // highlight
    ctx.beginPath(); ctx.ellipse(2.4, 1.2, 1.8, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function collectPickups() {
  const list = level.meta.pickups || [];
  for (const p of list) {
    if (p.got) continue;
    if (Math.abs(p.x - player.x) < 9 &&
        p.y > player.top - 6 && p.y < player.bottom + 4) {
      p.got = true;
      Sound.play('pickup');
      updateCollectHud();
    }
  }
}

/* Has she got everything this level asks for? */
function allCollected() {
  const list = level.meta.pickups || [];
  return list.every(p => p.got);
}

/* The guard on the gate. He asks, she answers, and only then does it
   open — so being turned away is a conversation, not a silent wall. */
function enforceGate() {
  const gate = level.meta.gate;
  if (!gate || gate.opened) return;

  const limit = gate.x * TILE + 8;
  if (player.x > limit) {
    player.x = limit;
    if (player.vx > 0) player.vx = 0;
  }
  if (Dialogue.active || player.x < limit - 46) return;

  if (allCollected()) {
    if (!gate.askedYes) {
      gate.askedYes = true;
      Dialogue.start(gate.linesYes, () => {
        gate.opened = true;
        Sound.play('pickup');
      });
    }
  } else if (!gate.askedNo) {
    gate.askedNo = true;
    Dialogue.start(gate.linesNo);
  } else {
    showNote(gate.note || 'Not yet.');
  }
}

let noteTimer = null;
function showNote(text) {
  if (noteEl.textContent === text && noteEl.classList.contains('show')) return;
  noteEl.textContent = text;
  noteEl.classList.add('show');
  clearTimeout(noteTimer);
  noteTimer = setTimeout(() => noteEl.classList.remove('show'), 1800);
}

function updateCollectHud() {
  const list = level.meta.pickups || [];
  if (!list.length) { hudCollect.textContent = ''; return; }
  const got = list.filter(p => p.got).length;
  hudCollect.textContent = `MANGOES ${got}/${list.length}`;
}

function drawRain(dt) {
  if (!rain.length) return;
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
  // queued first: an exception in update or render must not stop the game
  requestAnimationFrame(frame);
  acc += Math.min(100, now - last);
  last = now;
  let steps = 0;
  while (acc >= STEP && steps < 5) { update(1); acc -= STEP; steps++; }
  render();
  Input.endFrame();
}

function update(dt) {
  if (state === 'levelcard') {
    if (Input.tapped('confirm') || Input.tapped('jump')) beginLevel();
    return;
  }
  if (Dialogue.active) {
    if (Input.tapped('confirm') || Input.tapped('jump')) Dialogue.advance();
    return;
  }
  if (state === 'art') return;   // the board owns the input
  if (Input.tapped('mute')) toggleMute();

  if (state === 'ending') {
    endingT += dt / 60;
    const finished = ending.done ? ending.done(endingT) : endingT > ending.dur;
    if (finished && !endingDone) {
      endingDone = true;
      say(CHAPTERS[chapterIdx].close, () => fadeThrough(nextChapter));
    }
    return;
  }
  if (state !== 'play') return;

  controlActor(player, level, dt);
  cam.follow(player, dt);
  collectPickups();
  enforceGate();

  if (player.y > level.pxH + 20) respawn();

  // one-shot lines that fire when she walks into somewhere
  for (const tr of (level.meta.triggers || [])) {
    if (!tr.done && player.x > tr.x * TILE) {
      tr.done = true;
      if (tr.grow) growUp();
      say(tr.lines);
    }
  }

  // the uncle at the mango tree starts talking as she comes up
  const unc = level.meta.uncle;
  if (unc && !unc.done && player.x > unc.x * TILE) {
    unc.done = true;
    Dialogue.start(unc.lines);
    return;
  }

  // someone standing in the way until she says hello
  const npc = level.meta.npc;
  if (npc && !npc.done) {
    const limit = npc.blockX * TILE;
    if (player.x > limit) {
      player.x = limit;
      if (player.vx > 0) player.vx = 0;
      showNote(npc.prompt || 'Press ENTER to talk');
    }
    if (player.x > limit - 34 && Input.tapped('confirm')) {
      Dialogue.start(npc.lines, () => { npc.done = true; });
      return;
    }
  }

  // her own desk: the night does not go in a straight line
  const desk = level.meta.desk;
  if (desk && !desk.done && player.x > desk.x * TILE) {
    desk.done = true;
    narrate(desk.lines);
    return;
  }

  // the television: she stops, watches, then carries on
  const tv = level.meta.tv;
  if (tv && !tv.done) {
    const limit = tv.x * TILE;
    if (player.x > limit) {
      player.x = limit;
      if (player.vx > 0) player.vx = 0;
    }
    if (player.x > limit - 48) {
      if (!tv.on) {
        showNote(tv.promptOn);
        if (Input.tapped('confirm')) { tv.on = true; Sound.play('pickup'); }
      } else {
        showNote(tv.promptOff);
        if (Input.tapped('confirm')) { tv.done = true; }
      }
    }
    if (!tv.done) return;
  }

  if (player.x >= level.meta.goalX) {
    const act = CHAPTERS[chapterIdx].acts[actIdx];
    state = 'transition';
    if (act.goalLines) {
      Dialogue.start(act.goalLines, finishAct);
    } else {
      finishAct();
    }
  }
}

function render() {
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;

  // once an ending has begun it stays on screen behind the story cards
  // During an ending he speaks from the box only: the scene is the
  // point, and standing him in the middle of it covers the family.
  if (ending) { ending.draw(endingT); return; }
  if (!level) return;

  drawBackdrop();
  drawProps('back');
  drawTiles(ctx, level, cam);
  drawProps('front');
  drawPickups();
  drawPlayer();
  drawGrowFlash();
  drawGuide(1);
  drawRain(1);

  const th = theme();
  const v = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  v.addColorStop(0, th.vignette);
  v.addColorStop(0.4, 'rgba(0,0,0,0)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

/* ============================== BOOT ============================== */
function toggleMute() {
  muteBtn.textContent = Sound.toggleMute() ? '♪ SOUND OFF' : '♪ SOUND ON';
}
muteBtn.addEventListener('click', () => { Sound.unlock(); toggleMute(); });

function boot() {
  /* ?level=2 jumps straight into a level, for testing. Levels are
     1-based in the URL because that is how they are named on screen. */
  const wanted = parseInt(new URLSearchParams(location.search).get('level'), 10);
  const startAt = Number.isFinite(wanted)
    ? Math.min(CHAPTERS.length, Math.max(1, wanted)) - 1
    : 0;
  startChapter(startAt);
  const kick = () => {
    Sound.unlock();
    removeEventListener('keydown', kick);
    removeEventListener('pointerdown', kick);
  };
  addEventListener('keydown', kick);
  addEventListener('pointerdown', kick);
  document.getElementById('lc-start').addEventListener('click', beginLevel);
  requestAnimationFrame(frame);
}
boot();
