/* ------------------------------------------------------------------
   LEVEL 5 — KOTA

   Teen Ayrisha, coaching at Allen, for two years.

     1. the walk to Allen              (outdoor, desert light)
     2. the classroom, and the board
     3. projectile motion              (mini-game)
     4. the hostel: study, sleep, the alarm, study, sleep, the alarm,
        and then morning on the balcony, and Anam
     5. Friends Bazar, with Anam behind her, and a cold coffee each
     6. Sunday. The test.              (mini-game)
     7. outside afterwards, with Anam
     8. the train out, and the flight home  (cutscenes)
     9. the jigsaw in her room         (mini-game)
    10. the dining table, and Papa     (cutscene)
    11. the flight to college          (the ending)
------------------------------------------------------------------- */

const KOTA_TILES = {
  '#': { fill: '#a89272', top: '#c2ab88' },
  'B': { fill: '#b09a78', top: '#c6b092' },
  'C': { fill: '#d0bb95', top: '#e2d0ac' },
  'S': { fill: '#c08a5e', top: '#d3a077' }
};
const HOSTEL_WALL = { top: '#c9bda6', bottom: '#b0a288', skirt: '#8f826c' };
const HOSTEL_TILES = {
  '#': { fill: '#9a8a70', top: '#b3a288' },
  'F': { fill: '#8c7d66', top: '#9a8a70' },
  'S': { fill: '#8f826c', top: '#a5977f' },
  'C': { fill: '#c2a884', top: '#d8bd97' }
};

/* --------------------------- SCENE 1 ----------------------------- */
function buildAct5a() {
  const b = makeBuilder();

  b.prop('home', 1);
  b.flat(10);
  b.prop('streetsign', 8, { text: 'KOTA' });
  b.flat(4);
  b.crates(1);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(4);
  b.gap(2);
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.steps(2);
  b.flat(5);
  b.block(2, 1, 'B', 'auto');
  b.flat(6);
  b.gap(2);
  b.flat(4);
  b.crates(2);
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.ledges(3, 2);
  b.flat(6);
  b.gap(2);
  b.flat(6);
  b.checkpoint();
  b.flat(3);

  b.prop('musicgate');
  b.flat(7);
  const goal = b.frontage(9, 'S', 'allenfront', { doorOffset: 7, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX, name: 'act5a', theme: 'afternoon',
    tileStyles: KOTA_TILES
  });
}

/* --------------------------- SCENE 2 -----------------------------
   Inside Allen. Down the corridor and into the classroom, where sir
   is already at the board.
------------------------------------------------------------------ */
function buildAct5b() {
  const b = makeBuilder();

  b.indoors();
  b.flat(6);
  b.prop('noticeboard', b.x - 4);
  b.flat(5);
  b.crates(1, 1, 'C');
  b.flat(5);
  b.prop('doorway', b.x);
  b.flat(5);
  b.block(2, 1, 'C', 'examdesk');
  b.flat(4);
  b.block(2, 1, 'C', 'examdesk');
  b.flat(4);
  b.checkpoint();
  b.flat(3);
  const boardX = b.x;
  b.prop('physicsclass', boardX);
  b.flat(12);

  return b.build({
    goalX: (boardX - 2) * 16,
    name: 'act5b', theme: 'morning',
    interiorWall: { top: '#cdd3dc', bottom: '#b3bac6', skirt: '#8f97a5' },
    tileStyles: CLASS_TILES
  });
}

const CLASS_TILES = {
  '#': { fill: '#9aa2b0', top: '#b0b8c4' },
  'F': { fill: '#8e96a4', top: '#9aa2b0' },
  'S': { fill: '#8f97a5', top: '#a5adb9' },
  'C': { fill: '#c2a884', top: '#d8bd97' }
};

/* --------------------------- SCENE 3 -----------------------------
   Out of the classroom and back to the hostel. The night does not go
   in a straight line: she studies, sleeps, wakes half an hour later,
   does a problem, sleeps, wakes again, does another. Then morning,
   and out on the balcony, Anam.
------------------------------------------------------------------ */
function buildAct5hostel() {
  const b = makeBuilder();

  b.indoors();
  b.flat(5);
  const bedX = 2;
  b.prop('hostelbed', 1);
  b.flat(6);
  const deskX = b.x;
  b.prop('studydesk', deskX);
  b.flat(8);
  b.prop('wallclock', b.x - 5);
  b.flat(5);
  b.crates(1, 1, 'C');
  b.flat(5);
  b.prop('doorway', b.x);
  b.flat(4);

  b.outdoors();
  b.flat(4);
  b.prop('railing', b.x - 4, { w: 16 });
  b.flat(6);
  const anamX = b.x;
  b.prop('anamspot', anamX);
  b.flat(10);

  /* The night, played out rather than described. Desk, bed, alarm,
     desk, bed, alarm, desk, and finally the bed for good. Then the sun
     comes up on her there, and the whole day happens: six o'clock, out
     to class, five in the evening, and back again. */
  const desk = deskX + 2, bed = bedX + 1;
  const night = [
    { to: desk, say: [{ text: 'Eleven at night. One more chapter.' }] },
    { to: bed,  say: [{ text: 'Half past twelve. She cannot keep her eyes open.' }] },
    { sleep: 1.7 },
    { alarm: true, say: [{ text: 'One o\u2019clock.' }] },
    { to: desk, say: [{ text: 'One problem, then. Just the one.' }] },
    { to: bed },
    { sleep: 1.6 },
    { alarm: true, say: [{ text: 'Two o\u2019clock.' }] },
    { to: desk, say: [{ text: 'One more problem.' }] },
    { to: bed,  say: [{ text: 'And then, finally, sleep.' }] },
    { sleep: 2.6 },
    { dawn: 2.6, stayAsleep: true },
    { alarm: true, say: [{ text: 'Six in the morning.' }] },
    { say: [{ text: 'Up, ready, and out to class.' }] },
    { say: [{ text: 'Five in the evening. Back again.' }] }
  ];

  return b.build({
    goalX: (anamX - 2) * 16,
    name: 'act5hostel', theme: 'afternoon',
    interiorWall: HOSTEL_WALL,
    tileStyles: HOSTEL_TILES,
    night: { x: deskX, steps: night }
  });
}

/* --------------------------- SCENE 5 -----------------------------
   Friends Bazar. Anam walks it with her, and there is a man at the
   stall who asks them both what they want.
------------------------------------------------------------------ */
function buildAct5c() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('streetsign', 6, { text: 'FRIENDS BAZAR' });
  b.flat(4);
  b.crates(1);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.gap(2);
  b.flat(6);
  b.checkpoint();
  b.flat(5);
  b.crates(1);
  b.flat(6);
  const cafeX = b.x;
  b.prop('coffeestall', cafeX);
  b.prop('coffeeman', cafeX + 2);
  b.flat(12);

  return b.build({
    goalX: (cafeX - 3) * 16,
    name: 'act5c', theme: 'afternoon',
    tileStyles: KOTA_TILES,
    companion: { char: 'anam', tuning: TEEN_TUNING }
  });
}

/* --------------------------- SCENE 7 -----------------------------
   Outside the hall afterwards. Nothing in the way: the whole point is
   that for once there is nothing left to do today.
------------------------------------------------------------------ */
function buildAct5out() {
  const b = makeBuilder();

  b.flat(10);
  b.prop('allenfront', 0, { w: 6, doorX: 3 });
  b.flat(6);
  b.block(2, 1, 'C', 'bench');
  b.flat(8);
  b.prop('streetlight', b.x - 4);
  b.flat(10);
  const meet = b.x;
  b.flat(10);

  return b.build({
    goalX: meet * 16,
    name: 'act5out', theme: 'afternoon',
    tileStyles: KOTA_TILES,
    companion: { char: 'anam', tuning: TEEN_TUNING, carry: 'coldcoffee' }
  });
}

/* --------------------------- SCENE 9 -----------------------------
   Home. The street she grew up on, and the door of her own house. The
   only word for where this is is on the sign, as always.
------------------------------------------------------------------ */
const HOME_TILES = {
  '#': { fill: '#8f8a76', top: '#a8a28c' },
  'B': { fill: '#9a9482', top: '#b2ab97' },
  'C': { fill: '#cbb894', top: '#e0cfab' },
  'S': { fill: '#b4794f', top: '#c9906a' }
};

function buildAct5home() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('streetsign', 6, { text: 'RAJAJINAGAR' });
  b.flat(5);
  b.prop('tree', b.x - 2);
  b.flat(5);
  b.prop('home', b.x);
  b.flat(8);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.prop('streetlight', b.x - 3);
  b.flat(6);
  b.prop('home', b.x);
  b.flat(9);
  const goal = b.frontage(9, 'S', 'housefront', { doorOffset: 7, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX, name: 'act5home', theme: 'afternoon',
    tileStyles: HOME_TILES
  });
}

/* --------------------------- SCENE 10 ----------------------------
   Her own room, exactly as she left it, and a box on the floor she
   has not opened in two years.
------------------------------------------------------------------ */
function buildAct5room() {
  const b = makeBuilder();

  b.indoors();
  b.flat(4);
  b.prop('hostelbed', 1);
  b.flat(7);
  b.prop('bookshelf', b.x - 3);
  b.flat(5);
  b.block(2, 1, 'C', 'herdesk');
  b.flat(6);
  b.prop('plantpot', b.x - 3);
  b.flat(5);
  const boxX = b.x;
  b.prop('puzzlebox', boxX);
  b.flat(9);

  return b.build({
    goalX: (boxX - 2) * 16,
    name: 'act5room', theme: 'afternoon',
    box: { open: false },
    interiorWall: { top: '#d3c2d8', bottom: '#bda6c4', skirt: '#9a82a4' },
    tileStyles: {
      '#': { fill: '#a08fa8', top: '#b8a4be' },
      'F': { fill: '#96859e', top: '#a08fa8' },
      'S': { fill: '#9a82a4', top: '#b09aba' },
      'C': { fill: '#c2a884', top: '#d8bd97' }
    }
  });
}

/* --------------------------- SCENE 4 ----------------------------- */
/* Sunday. The exam hall, and the long walk to a desk. */
function buildAct5d() {
  const b = makeBuilder();

  b.indoors();
  b.flat(6);
  b.prop('noticeboard', b.x - 4);
  b.flat(5);
  b.block(2, 1, 'C', 'examdesk');
  b.flat(4);
  b.block(2, 1, 'C', 'examdesk');
  b.flat(4);
  b.checkpoint();
  b.flat(3);
  b.prop('blackboard', b.x + 1);
  b.flat(5);
  const herDesk = b.x;
  b.block(2, 1, 'C', 'examdesk');
  b.prop('herexamdesk', herDesk);
  b.flat(9);

  return b.build({
    goalX: herDesk * 16,
    name: 'act5d', theme: 'morning',
    interiorWall: { top: '#cdd3dc', bottom: '#b3bac6', skirt: '#8f97a5' },
    tileStyles: {
      '#': { fill: '#9aa2b0', top: '#b0b8c4' },
      'F': { fill: '#8e96a4', top: '#9aa2b0' },
      'S': { fill: '#8f97a5', top: '#a5adb9' },
      'C': { fill: '#c2a884', top: '#d8bd97' }
    }
  });
}
