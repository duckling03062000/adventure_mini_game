/* ------------------------------------------------------------------
   Game shell: chapters, scene flow, and world rendering.

   A chapter is one level: some opening cards, one or more playable
   acts, an ending scene, and some closing cards. Adding a level means
   adding an entry to CHAPTERS, not touching the flow code.
------------------------------------------------------------------- */

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const storyEl = document.getElementById('story');
const hudAct = document.getElementById('hud-act');
const muteBtn = document.getElementById('mute');
const hudCollect = document.getElementById('hud-collect');
const noteEl = document.getElementById('note');
const levelCard = document.getElementById('levelcard');
const fadeEl = document.getElementById('fade');
const artEl = document.getElementById('artboard');

/* The real cover, for the moment she is given it. */
const BOOK_IMG = new Image();
BOOK_IMG.src = 'assets/images/painting-nature.jpg';

/* ============================ THE SCRIPT ==========================
   All the words in one place, so they are easy to rewrite.
   Nothing here asserts a detail we do not actually know.
------------------------------------------------------------------ */
const SCRIPT = {
  /* ---- level 1 ---- */
  l1act1: {
    eyebrow: 'act 1 · papa', title: 'Get across the city',
    text: 'The call comes. The road is flooded, the buses have stopped dead, ' +
          'and the hospital is all the way across Bangalore. Get Papa there.'
  },
  l1act1done: {
    eyebrow: 'act 1 complete', title: 'Papa made it',
    text: 'Soaked through, still in uniform. But Ayrisha is not here yet.'
  },
  l1act2: {
    eyebrow: 'act 2 · mumma', title: 'Now bring Mumma',
    text: 'Mumma cannot run, and cannot jump the way Papa can. Take it ' +
          'slowly. Take it carefully. Just get Mumma there.'
  },
  l1act2done: {
    eyebrow: 'act 2 complete', title: 'Both of them, inside',
    text: 'The doors close behind Mumma. The rain keeps going without them.'
  },
  l1birth: {
    eyebrow: '6 september 2002', title: 'And then there were three',
    text: 'At the end of a very long wait, in a hospital across the city, ' +
          'Ayrisha arrives.'
  },
  l1gudiya: {
    eyebrow: 'and there she is', title: 'Our gudiya',
    text: 'And then comes our gudiya, our kuchupuchu precious bacha.',
    sweet: true
  },
  l1done: {
    eyebrow: 'level 1 complete', title: 'The Birth',
    text: 'Ayrisha is here. Everything after this is her story.'
  },

  /* ---- level 2 ---- */
  l2act: {
    eyebrow: 'act 1 · ayrisha', title: 'Three mangoes on the way',
    text: 'There is a big mango tree down the road, and three ripe ones up in ' +
          'the branches. Climb up, get all three, and then the gate.'
  },
  l2actdone: {
    eyebrow: 'act 1 complete', title: 'You made it to the class!',
    text: 'Bag down. Chair pulled out. She sits.'
  },
  l3a: {
    eyebrow: 'act 1 · ayrisha', title: 'To the teacher\u2019s house',
    text: 'Across town, down the lane, and up to the front door.'
  },
  l3book: {
    eyebrow: 'and she means it', title: 'You made it! You got this!',
    text: 'Painting Nature in Pen & Ink with Watercolor, by Claudia Nice. ' +
          'Hers now.',
    sweet: true,
    pos: 'top'
  },
  l3done: {
    eyebrow: 'level 3 complete', title: 'The Book',
    text: 'She carried it home and did not put it down for a week.'
  },
  l2done: {
    eyebrow: 'level 2 complete', title: 'Have a great day at school',
    text: 'Three mangoes, one classroom, and the first of a great many ' +
          'mornings.',
    sweet: true
  }
};

/* ============================= CHAPTERS =========================== */
const CHILD_TUNING  = { maxSpeed: 1.7,  accel: 0.36, jumpV: -5.6, w: 8 };
const PAPA_TUNING   = { maxSpeed: 2.15, accel: 0.5,  jumpV: -7.4, w: 10 };
const MUMMA_TUNING  = { maxSpeed: 1.35, accel: 0.3,  friction: 0.28, jumpV: -4.9, w: 11 };

const CHAPTERS = [
  {
    id: 'level1',
    number: 1,
    title: 'The Birth',
    subtitle: 'Bangalore · 6th September, 2002',
    blurb: 'It has been raining over Bangalore, and the city has not stopped ' +
           'moving for a second.',
    objectives: [
      'Get <b>Papa</b> across the broken city to the hospital.',
      'Then bring <b>Mumma</b> — she cannot run, and cannot jump the way Papa can.',
      'Get them both inside.'
    ],
    acts: [
      { intro: [SCRIPT.l1act1], outro: [SCRIPT.l1act1done],
        build: buildAct1, char: 'officer', tuning: PAPA_TUNING,
        music: 'rush', hud: 'PAPA · to the hospital' },
      { intro: [SCRIPT.l1act2], outro: [SCRIPT.l1act2done],
        build: buildAct2, char: 'mother', tuning: MUMMA_TUNING,
        music: 'careful', hud: 'MUMMA · to the hospital' }
    ],
    ending: 'birth',
    close: [SCRIPT.l1birth, SCRIPT.l1gudiya, SCRIPT.l1done]
  },
  {
    id: 'level2',
    number: 2,
    title: "Let's go to school!",
    subtitle: 'AECS Layout · the first morning',
    blurb: 'Uniform on. Bag packed. A whole road between here and the gate.',
    objectives: [
      'Climb the big mango tree and take <b>all three mangoes</b>.',
      'The school gate will not open until you have them.',
      'Get inside and find her desk.'
    ],
    acts: [
      { intro: [SCRIPT.l2act], outro: [SCRIPT.l2actdone],
        build: buildLevel2, char: 'child', tuning: CHILD_TUNING,
        music: 'morning', hud: 'AYRISHA · first day' }
    ],
    ending: 'classroom',
    close: [SCRIPT.l2done]
  },
  {
    id: 'level3',
    number: 3,
    title: 'Let\u2019s go to art tutor!',
    subtitle: '',
    blurb: '',
    objectives: ['Let\u2019s do art.'],   // nothing here gives away what she gets
    acts: [
      { intro: [], outro: [], seamless: true,
        build: buildAct3a, char: 'child', tuning: CHILD_TUNING,
        music: 'afternoon', hud: 'AYRISHA · to the house' },
      { intro: [], outro: [], seamless: true,
        build: buildAct3b, char: 'child', tuning: CHILD_TUNING,
        music: 'indoors', hud: 'AYRISHA · find Aunty',
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
    close: [SCRIPT.l3book, SCRIPT.l3done]
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
let storyQueue = [];
let ending = null;
let endingT = 0;
let endingDone = false;
let bookGiven = false;
let bookT = 0;
let skyline = [];
let rain = [];

/* ============================== STORY ============================= */
function showStory(entries, after) {
  // an empty list is legitimate — a level may go straight into play
  if (!entries || !entries.length) { if (after) after(); return; }
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
  storyEl.classList.toggle('top', s.pos === 'top');
}

function advanceStory() {
  storyQueue.shift();
  if (storyQueue.length) { renderStory(); return; }
  storyEl.classList.add('hidden');
  const fn = storyQueue.after;
  storyQueue.after = null;
  if (fn) fn();
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
  storyEl.classList.add('hidden');   // the landing page owns the screen
  artEl.classList.add('hidden');
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
  // start the music here rather than after the intro cards, so the game
  // is never silent for the first several screens
  if (ch.acts[0].music) Sound.playMusic(ch.acts[0].music);
  showStory(ch.acts[0].intro, startCurrentAct);
}

/* ============================= CHAPTERS =========================== */
function startChapter(i) {
  chapterIdx = i;
  actIdx = 0;
  ending = null;
  level = null;
  Sound.stopMusic();
  showLevelCard(CHAPTERS[i]);
}

function startCurrentAct() {
  const a = CHAPTERS[chapterIdx].acts[actIdx];

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
  level = a.build();
  player = new Actor(a.char, 40, GROUND_Y * TILE, a.tuning);
  spawnX = player.x;
  cam = new Camera(level);
  cam.x = 0;
  buildBackdrop(level);
  hudAct.textContent = a.hud;
  updateCollectHud();
  Sound.playMusic(a.music);
  state = 'play';
}

function finishAct() {
  const ch = CHAPTERS[chapterIdx];
  const a = ch.acts[actIdx];
  const last = actIdx === ch.acts.length - 1;
  if (a.type !== 'art') Sound.play('clear');

  const next = last ? startEnding : () => { actIdx++; startCurrentAct(); };
  const cards = last ? a.outro : a.outro.concat(ch.acts[actIdx + 1].intro);

  // a seamless act just fades into the next scene
  if (a.seamless && !cards.length) { fadeThrough(next); return; }
  showStory(cards, () => {
    if (a.seamless) fadeThrough(next); else next();
  });
}

function startEnding() {
  const ch = CHAPTERS[chapterIdx];
  ending = ENDINGS[ch.ending];
  endingT = 0;
  endingDone = false;
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
        { who: 'Aunty', char: 'tutor', text: 'Oh wow, nice! You did a great job.' },
        { who: 'Aunty', char: 'tutor', text: 'Here is a book for you.',
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
                             'easel', 'rug']);

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
        const open = allCollected();
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

      case 'streetsign': {
        ctx.fillStyle = '#8e97a8';
        ctx.fillRect(sx + 8, base - 40, 3, 40);
        ctx.fillStyle = '#2f6b8f';
        ctx.fillRect(sx - 22, base - 52, 64, 14);
        ctx.fillStyle = '#f4f1ea';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(LOCALITY, sx + 10, base - 42);
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

/* The school gate stays shut until the mangoes are in. Enforced as a
   soft wall so she is stopped rather than teleported. */
function enforceGate() {
  if (level.meta.gateX === undefined || allCollected()) return;
  const limit = level.meta.gateX * TILE + 8;
  if (player.x > limit) {
    player.x = limit;
    if (player.vx > 0) player.vx = 0;
    showNote(level.meta.gateNote || 'Not yet!');
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
  if (state === 'story') {
    if (Input.tapped('confirm') || Input.tapped('jump')) advanceStory();
    return;
  }
  if (state === 'art') return;   // the board owns the input
  if (Input.tapped('mute')) toggleMute();

  if (state === 'ending') {
    endingT += dt / 60;
    const finished = ending.done ? ending.done(endingT) : endingT > ending.dur;
    if (finished && !endingDone) {
      endingDone = true;
      showStory(CHAPTERS[chapterIdx].close, nextChapter);
    }
    return;
  }
  if (state !== 'play') return;

  controlActor(player, level, dt);
  cam.follow(player, dt);
  collectPickups();
  enforceGate();

  if (player.y > level.pxH + 20) respawn();

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
  if (ending) { ending.draw(endingT); return; }
  if (!level) return;

  drawBackdrop();
  drawProps('back');
  drawTiles(ctx, level, cam);
  drawProps('front');
  drawPickups();
  drawActor(ctx, player, cam);
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
  storyEl.addEventListener('click', () => { if (state === 'story') advanceStory(); });
  document.getElementById('lc-start').addEventListener('click', beginLevel);
  requestAnimationFrame(frame);
}
boot();
