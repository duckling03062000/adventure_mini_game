/* ------------------------------------------------------------------
   LEVEL 2 — THE FIRST DAY

   One act. Ayrisha, small, walking to school for the first time.

   Deliberately the opposite of Level 1 in every way that matters:
   bright instead of dark, dry instead of flooded, and short obstacles
   instead of tall ones — because she is short. Nothing here can kill
   her; the only hole in the level is a drain she climbs back out of.

   The school's name is only ever on its signboard, never in the
   writing. SCHOOL_NAME is the one place to change it.
------------------------------------------------------------------- */

const SCHOOL_NAME = ['RYAN', 'INTERNATIONAL'];
const LOCALITY = 'AECS LAYOUT';

function buildLevel2() {
  const b = makeBuilder();

  /* --- the street outside home --- */
  b.prop('home', 1);
  b.flat(10);
  b.prop('streetsign', 8);
  b.prop('tree', 6);
  b.crates(1);                    // the neighbour's compound wall
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(4);
  b.gap(2);                       // an open drain
  b.flat(5);
  b.checkpoint();
  b.flat(3);

  /* --- the mango tree, and the uncle who owns it --- */
  const treeX = b.x;
  b.mangoTree(8);
  b.prop('mangouncle', treeX + 1);
  b.flat(6);

  b.steps(2);                     // kerb up
  b.flat(5);
  b.block(2, 1, 'B', 'auto');
  b.flat(6);
  b.gap(2);
  b.flat(4);
  b.prop('tree');
  b.crates(1);
  b.flat(5);
  b.checkpoint();
  b.flat(3);

  /* --- the school gate, and the guard on it --- */
  const gateX = b.x;
  b.prop('schoolgate');
  // declared after the gate so he draws in front of its bars, and
  // placed just past where she is stopped so he is facing her
  b.prop('guardpost', gateX + 1);
  b.flat(8);
  b.prop('flagpole', b.x - 3);
  b.block(2, 1, 'C', 'bench');
  b.flat(7);
  b.checkpoint();
  b.flat(4);

  /* --- through the front doors --- */
  b.frontage(7, 'S', 'schoolfront', { doorOffset: 5, openAll: true });

  /* --- the corridor --- */
  b.indoors();
  b.flat(6);
  b.prop('noticeboard', b.x - 4);
  b.flat(4);
  b.crates(1, 1, 'C');            // a stack of chairs left in the way
  b.flat(5);
  b.prop('noticeboard', b.x - 3);
  b.flat(4);
  b.checkpoint();
  b.flat(3);

  /* --- the classroom --- */
  b.prop('blackboard', b.x + 2);
  b.flat(6);
  const deskRow = b.x;
  b.block(2, 1, 'C', 'desk');
  b.flat(2);
  b.block(2, 1, 'C', 'desk');
  b.flat(2);
  const herDesk = b.x;
  b.block(2, 1, 'C', 'desk');
  b.prop('herdesk', herDesk);
  b.flat(8);

  return b.build({
    goalX: herDesk * 16,
    name: 'level2',
    treeX,
    /* The uncle starts talking when she comes up to his tree. */
    uncle: {
      x: treeX - 4,
      lines: [
        { who: 'Uncle', char: 'mangouncle', text: 'Hey Ayrisha, good morning!' },
        { who: 'Ayrisha', char: 'child', text: 'Good morning, uncle.' },
        { who: 'Uncle', char: 'mangouncle',
          text: 'Let\u2019s take these ripe mangoes to school.' },
        { who: 'Ayrisha', char: 'child', text: 'Sure, I\u2019ll get them.' }
      ]
    },
    /* The guard asks before he opens anything. */
    gate: {
      x: gateX,
      note: 'The mangoes first.',
      linesYes: [
        { who: 'Guard', char: 'guard',
          text: 'Hey Ayrisha, good morning. Did you bring those mangoes?' },
        { who: 'Ayrisha', char: 'child', text: 'Yes, I got them!' },
        { who: 'Guard', char: 'guard', text: 'Good girl. In you go.' }
      ],
      linesNo: [
        { who: 'Guard', char: 'guard',
          text: 'Hey Ayrisha, good morning. Did you bring those mangoes?' },
        { who: 'Ayrisha', char: 'child', text: 'Not yet\u2026' },
        { who: 'Guard', char: 'guard',
          text: 'Then off you go and get them. All three.' }
      ]
    },
    theme: 'morning',
    deskRow,
    tileStyles: {
      '#': { fill: '#9a8f7a', top: '#b5a992' },   // pavement
      'B': { fill: '#a89a80', top: '#bdb096' },   // kerb, steps
      'C': { fill: '#cfc0a4', top: '#e2d5ba' },   // compound wall, furniture
      'S': { fill: '#a8946f', top: '#bda88a' }    // ceiling slab
    }
  });
}
