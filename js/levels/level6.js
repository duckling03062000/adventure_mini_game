/* ------------------------------------------------------------------
   LEVEL 6 — COLLEGE, THE FIRST DAY OF IT

   It started in her bedroom, because that is where it actually
   started, and it stayed there for months.

     0.  college, from a bedroom, for months  (cutscene)
     1.  the gate, at last, and Shantanu
     2.  the cafeteria, and a chocolate cake
     3.  out of it, Akash, and then everybody else

   The rest of college is Level 7 onwards and has not been written yet.
------------------------------------------------------------------- */

const COLLEGE_NAME = ['COLLEGE'];

const COLLEGE_TILES = {
  '#': { fill: '#8a9078', top: '#a3a98f' },
  'B': { fill: '#94997f', top: '#adb296' },
  'C': { fill: '#cbb894', top: '#e0cfab' },
  'S': { fill: '#9c8f7a', top: '#b4a693' }
};

/* --------------------------- SCENE 1 -----------------------------
   The first morning anyone was actually allowed in. Somebody she has
   only ever seen in a little square is standing inside the gate.
------------------------------------------------------------------ */
function buildAct6a() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('streetsign', 6, { text: 'COLLEGE' });
  b.flat(5);
  b.prop('tree', b.x - 2);
  b.flat(4);
  b.prop('collegegate', b.x);
  b.flat(8);
  b.crates(1);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.gap(2);
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('tree', b.x - 2);
  b.flat(6);
  b.ledges(3, 2);
  b.flat(6);
  const meet = b.x;
  b.prop('shantanuspot', meet + 1);
  b.flat(12);

  return b.build({
    goalX: (meet - 2) * 16,
    name: 'act6a', theme: 'morning',
    tileStyles: COLLEGE_TILES
  });
}

/* --------------------------- SCENE 2 -----------------------------
   The cafeteria. He comes along, and the cake is at the near end of
   the counter where she can see it from the door.
------------------------------------------------------------------ */
function buildAct6cafe() {
  const b = makeBuilder();

  b.indoors();
  b.flat(5);
  b.prop('doorway', b.x - 3);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(4);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.prop('plantpot', b.x - 3);
  b.flat(5);
  const till = b.x;
  b.prop('cafecounter', till);
  b.prop('cafemanspot', till + 3);
  b.flat(12);

  return b.build({
    goalX: (till - 3) * 16,
    name: 'act6cafe', theme: 'morning',
    interiorWall: { top: '#e0d4bd', bottom: '#c8b99e', skirt: '#a0917a' },
    tileStyles: {
      '#': { fill: '#b0a48c', top: '#c6bba3' },
      'F': { fill: '#a3977f', top: '#b0a48c' },
      'S': { fill: '#a0917a', top: '#b8a992' },
      'C': { fill: '#c2a884', top: '#d8bd97' }
    },
    companion: { char: 'shantanu', tuning: TEEN_TUNING }
  });
}

/* --------------------------- SCENE 3 -----------------------------
   Out of the cafeteria. Akash first, and then the whole rest of the
   year, all of them faces off a screen until this morning.
------------------------------------------------------------------ */
function buildAct6akash() {
  const b = makeBuilder();

  b.flat(9);
  b.prop('tree', b.x - 3);
  b.flat(5);
  const akashX = b.x;
  b.prop('akashspot', akashX + 2);
  b.flat(10);

  b.block(2, 1, 'C', 'bench');
  b.flat(4);
  const hi1 = b.x;
  b.prop('classmateA', hi1 + 2);
  b.flat(9);

  b.prop('tree', b.x - 3);
  b.flat(4);
  const hi2 = b.x;
  b.prop('classmateB', hi2 + 2);
  b.flat(9);

  const hi3 = b.x;
  b.prop('classmateA', hi3 + 2);
  b.prop('classmateB', hi3 + 7);
  b.flat(12);

  return b.build({
    goalX: (hi3 + 11) * 16,
    name: 'act6akash', theme: 'morning',
    tileStyles: COLLEGE_TILES,
    companion: { char: 'shantanu', tuning: TEEN_TUNING },
    triggers: [
      { x: akashX - 2, talk: true, lines: [
          { who: 'Akash', char: 'akash',
            text: 'Hello! How are you guys? We meet after our long online phase.' },
          { who: 'Ayrisha', char: 'teen',
            text: 'It is so nice to meet you, Akash.' },
          { who: 'Shantanu', char: 'shantanu', text: 'Nice to meet you too.' }
        ] },
      /* and then everyone, all the way down the path */
      { x: hi1 - 2, talk: true, lines: [
          { who: 'Someone from the year', char: 'classmateA',
            text: 'Hi! Oh my god, hi!' },
          { who: 'Ayrisha', char: 'teen', text: 'Hi!' }
        ] },
      { x: hi2 - 2, talk: true, lines: [
          { who: 'Someone from the year', char: 'classmateB', text: 'Hi Ayrisha!' },
          { who: 'Ayrisha', char: 'teen', text: 'Hi!' }
        ] },
      { x: hi3 - 2, talk: true, lines: [
          { who: 'Someone from the year', char: 'classmateA', text: 'Hi!' },
          { who: 'Someone from the year', char: 'classmateB', text: 'Hi!' },
          { who: 'Ayrisha', char: 'teen', text: 'Hi! Hi!' }
        ] }
    ]
  });
}
