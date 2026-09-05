/* ------------------------------------------------------------------
   LEVEL 4 — THE MUSIC CLASS

   Yelahanka. From her home to the Jigyasa Centre of Music and Arts.

     1. the walk across Yelahanka   (outdoor platforming)
     2. inside the centre — down the corridor to the piano room
     3. the piano lesson             (the keyboard)
     4. the bow                      (the ending)

   Only the signboard names the place; the writing never does.
------------------------------------------------------------------- */

const MUSIC_SCHOOL_NAME = ['JIGYASA', 'MUSIC & ARTS'];
const MUSIC_LOCALITY = 'YELAHANKA';

/* --------------------------- SCENE 1 ----------------------------- */
function buildAct4a() {
  const b = makeBuilder();

  b.prop('home', 1);
  b.flat(10);
  b.prop('streetsign', 8, { text: MUSIC_LOCALITY });
  b.prop('tree', 6);
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
  b.prop('tree');
  b.crates(1);
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.ledges(3, 2);
  b.flat(5);
  b.prop('tree');
  b.flat(4);
  b.gap(2);
  b.flat(6);
  b.checkpoint();
  b.flat(3);

  b.prop('musicgate');
  b.flat(7);
  const goal = b.frontage(9, 'S', 'musicfront', { doorOffset: 7, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX,
    name: 'act4a',
    theme: 'morning',
    tileStyles: {
      '#': { fill: '#9a8f7a', top: '#b5a992' },
      'B': { fill: '#a89a80', top: '#bdb096' },
      'C': { fill: '#cfc0a4', top: '#e2d5ba' },
      'S': { fill: '#b47a9c', top: '#c993b2' }
    }
  });
}

/* --------------------------- SCENE 2 ----------------------------- */
/* Inside. A corridor hung with instruments, then the piano room. */
function buildAct4b() {
  const b = makeBuilder();

  b.indoors();
  b.flat(6);
  b.prop('instrumentwall', 2);
  b.flat(5);
  b.prop('noticeboard', b.x - 3);
  b.flat(4);
  b.crates(1, 1, 'C');
  b.flat(5);
  b.prop('instrumentwall', b.x - 4);
  b.flat(4);
  b.checkpoint();
  b.flat(4);
  b.prop('doorway', b.x);
  b.flat(5);
  b.prop('musicposter', b.x - 3);
  b.flat(6);
  const pianoX = b.x;
  b.prop('piano', pianoX);
  b.flat(10);

  return b.build({
    goalX: (pianoX - 1) * 16,
    name: 'act4b',
    theme: 'morning',
    interiorWall: { top: '#c8b6d4', bottom: '#ad97bd', skirt: '#8b769c' },
    tileStyles: MUSIC_TILES
  });
}

const MUSIC_TILES = {
  '#': { fill: '#8e7a9c', top: '#a692b4' },
  'F': { fill: '#7d6a8c', top: '#8e7a9c' },
  'S': { fill: '#8b769c', top: '#a08cb0' },
  'C': { fill: '#c2a884', top: '#d8bd97' }
};

/* --------------------------- SCENE 3 -----------------------------
   Piano done, she carries on down the room to where the harmonium
   are. The class bows before it starts, and she overdoes it.
------------------------------------------------------------------ */
function buildAct4c() {
  const b = makeBuilder();

  b.indoors();
  b.flat(5);
  b.prop('piano', 1);               // the one she has just finished at
  b.flat(6);
  b.prop('musicposter', b.x - 4);
  b.flat(5);
  b.crates(1, 1, 'C');
  b.flat(5);
  b.prop('instrumentwall', b.x - 4);
  b.flat(6);
  const spotX = b.x;
  b.prop('harmoniumspot', spotX);
  b.flat(10);

  return b.build({
    goalX: (spotX - 2) * 16,
    name: 'act4c',
    theme: 'morning',
    interiorWall: { top: '#c8b6d4', bottom: '#ad97bd', skirt: '#8b769c' },
    tileStyles: MUSIC_TILES
  });
}
