/* ------------------------------------------------------------------
   LEVEL 7 — THE INCUBATOR CELL

     0.  the cell, and her friend from Moodle in it
     1.  the Moodle                            (mini-game)
     2.  out, and into the auditorium

     3.  the presentation                     (cutscene)
------------------------------------------------------------------- */

const CELL_WALL = { top: '#cfd6e2', bottom: '#b4bccb', skirt: '#8e97a8' };
const CELL_TILES = {
  '#': { fill: '#98a0ae', top: '#aeb6c2' },
  'F': { fill: '#8c94a2', top: '#98a0ae' },
  'S': { fill: '#8e97a8', top: '#a4acbb' },
  'C': { fill: '#c2a884', top: '#d8bd97' }
};

/* --------------------------- SCENE 1 -----------------------------
   The incubator cell: a long room with the good chairs in it, and one
   free computer at the far end.
------------------------------------------------------------------ */
function buildAct7cell() {
  const b = makeBuilder();

  b.indoors();
  b.flat(4);
  b.prop('doorway', b.x - 2);
  b.flat(4);
  b.prop('noticeboard', b.x - 3);
  b.flat(4);
  /* Stations along the room. She walks down past them rather than over
     them: it is a room full of people working, not an obstacle course. */
  b.prop('deskpc', b.x, { who: 'classmateA' });
  b.flat(6);
  const friendX = b.x;
  b.prop('moodlefriendspot', friendX + 2);
  b.flat(7);

  b.prop('bookshelf', b.x - 3);
  b.flat(5);
  b.prop('deskpc', b.x, { who: 'classmateB' });
  b.flat(6);
  b.checkpoint();
  b.flat(3);
  b.prop('plantpot', b.x - 3);
  b.flat(4);
  const hers = b.x;
  b.prop('deskpc', hers, { who: null });     // the free one
  b.flat(12);

  return b.build({
    goalX: (hers - 2) * 16,
    name: 'act7cell', theme: 'morning',
    interiorWall: CELL_WALL,
    tileStyles: CELL_TILES,
    triggers: [
      { x: friendX - 3, talk: true, lines: [
          { who: 'Friend from Moodle', char: 'moodlefriend',
            text: 'There she is. Let\u2019s work on some project.' },
          { who: 'Ayrisha', char: 'teen',
            text: 'Let\u2019s work on a Moodle project.' },
          { who: 'Friend from Moodle', char: 'moodlefriend', text: 'A Moodle. Yes. Let\u2019s go.' }
        ] }
    ]
  });
}

/* --------------------------- SCENE 3 -----------------------------
   Out of the cell, across, and in through the auditorium doors. He
   walks it with her, still worrying about the man inside.
------------------------------------------------------------------ */
function buildAct7audi() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('tree', b.x - 3);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(6);
  b.crates(1);
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('tree', b.x - 3);
  b.flat(6);
  const goal = b.frontage(10, 'S', 'audifront', { doorOffset: 8, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX, name: 'act7audi', theme: 'morning',
    tileStyles: COLLEGE_TILES,
    companion: { char: 'moodlefriend', tuning: TEEN_TUNING }
  });
}
