/* ------------------------------------------------------------------
   LEVEL 5 — COLLEGE ENTRANCE EXAMS

   Kota, Rajasthan. Teen Ayrisha, coaching at Allen.

     1. the walk to Allen              (outdoor, desert light)
     2. the hostel room and the balcony — study, sleep, wake, study
        again, and Anam
     3. Friends Bazar, and a cold coffee
     4. Sunday. The test.
     5. home                           (the ending)
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
   The room, then the balcony. The night does not go in a straight
   line: she studies, sleeps, wakes half an hour later, does one more
   problem, sleeps again. Then, outside, Anam.
------------------------------------------------------------------ */
function buildAct5b() {
  const b = makeBuilder();

  b.indoors();
  b.flat(5);
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

  /* the balcony */
  b.outdoors();
  b.flat(4);
  b.prop('railing', b.x - 4, { w: 16 });
  b.flat(6);
  const anamX = b.x;
  b.prop('anamspot', anamX);
  b.flat(10);

  return b.build({
    goalX: (anamX - 2) * 16,
    name: 'act5b', theme: 'afternoon',
    interiorWall: HOSTEL_WALL,
    tileStyles: HOSTEL_TILES,
    /* the study cycle, fired as she reaches her own desk */
    desk: {
      x: deskX + 2,
      lines: [
        { text: 'Eleven at night. One more chapter.' },
        { text: 'Half past two. She falls asleep over the page.' },
        { text: 'Three. Awake again, for no reason at all.' },
        { text: 'One more problem.' },
        { text: 'And then, finally, sleep.' }
      ]
    }
  });
}

/* --------------------------- SCENE 3 ----------------------------- */
/* Friends Bazar, with Anam, for a cold coffee. */
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
  b.flat(12);

  return b.build({
    goalX: (cafeX - 2) * 16,
    name: 'act5c', theme: 'afternoon',
    tileStyles: KOTA_TILES
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
