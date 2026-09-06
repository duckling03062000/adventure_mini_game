/* ------------------------------------------------------------------
   LEVEL 11 — 2020 TO 2024

     0.  the years going past on a calendar     (cutscene)
     1.  the corridor, and a room at the end of it
     2.  reverse a linked list                  (mini-game)
     3.  congratulations                        (cutscene)
     4.  2024, and the end of the chapter       (cutscene)
------------------------------------------------------------------- */

const INTERVIEW_WALL = { top: '#cfd6e2', bottom: '#b4bccb', skirt: '#8e97a8' };
const INTERVIEW_TILES = {
  '#': { fill: '#98a0ae', top: '#aeb6c2' },
  'F': { fill: '#8c94a2', top: '#98a0ae' },
  'S': { fill: '#8e97a8', top: '#a4acbb' },
  'C': { fill: '#c2a884', top: '#d8bd97' }
};

/* --------------------------- SCENE 2 -----------------------------
   A corridor of chairs with everybody else in her year sitting in
   them, and one door at the end that people keep going through.
------------------------------------------------------------------ */
function buildAct11interview() {
  const b = makeBuilder();

  b.indoors();
  b.flat(4);
  b.prop('noticeboard', b.x - 3);
  b.flat(4);
  b.block(2, 1, 'C', 'bench');
  b.prop('classmateA', b.x - 2);
  b.flat(4);
  b.block(2, 1, 'C', 'bench');
  b.prop('classmateB', b.x - 2);
  b.flat(4);
  b.block(2, 1, 'C', 'bench');
  b.prop('goodfriendspot', b.x - 2);
  b.flat(5);
  b.prop('doorway', b.x);
  b.flat(5);
  b.checkpoint();
  b.flat(3);
  b.prop('plantpot', b.x - 3);
  b.flat(4);
  const desk = b.x;
  b.block(2, 1, 'C', 'examdesk');
  b.prop('interviewer', desk + 4);
  b.flat(11);

  return b.build({
    goalX: (desk - 3) * 16,
    name: 'act11interview', theme: 'morning',
    interiorWall: INTERVIEW_WALL,
    tileStyles: INTERVIEW_TILES
  });
}
