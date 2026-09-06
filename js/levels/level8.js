/* ------------------------------------------------------------------
   LEVEL 8 — THE WALK BACK, AND THE REST OF THE EVENING

     0.  college to the hostel
     1.  her room, and the computer in it
     2.  the range                             (mini-game)
     3.  blocks                                (mini-game)
     4.  a knock, Shantanu, and biryani        (cutscene)
------------------------------------------------------------------- */

const HER_ROOM_WALL = { top: '#c4b6d4', bottom: '#a894bd', skirt: '#87759c' };
const HER_ROOM_TILES = {
  '#': { fill: '#8f80a4', top: '#a493b8' },
  'F': { fill: '#83759a', top: '#8f80a4' },
  'S': { fill: '#87759c', top: '#9d8bb0' },
  'C': { fill: '#c2a884', top: '#d8bd97' }
};

/* --------------------------- SCENE 1 -----------------------------
   Out of the gate and down the road, the way she did every evening.
------------------------------------------------------------------ */
function buildAct8walk() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('collegegate', 4);
  b.flat(6);
  b.prop('tree', b.x - 3);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.gap(2);
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('streetlight', b.x - 3);
  b.flat(5);
  b.crates(1);
  b.flat(6);
  b.ledges(3, 2);
  b.flat(6);
  b.prop('tree', b.x - 3);
  b.flat(5);
  const goal = b.frontage(9, 'S', 'housefront', { doorOffset: 7, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX, name: 'act8walk', theme: 'afternoon',
    tileStyles: COLLEGE_TILES
  });
}

/* --------------------------- SCENE 2 -----------------------------
   Her room. Bed, shelf, and the machine at the end of it with the
   game already open on it.
------------------------------------------------------------------ */
function buildAct8room() {
  const b = makeBuilder();

  b.indoors();
  b.flat(4);
  b.prop('hostelbed', 1);
  b.flat(7);
  b.prop('bookshelf', b.x - 3);
  b.flat(6);
  b.prop('plantpot', b.x - 3);
  b.flat(6);
  const rig = b.x;
  b.prop('gamerig', rig);
  b.flat(11);

  return b.build({
    goalX: (rig - 2) * 16,
    name: 'act8room', theme: 'afternoon',
    interiorWall: HER_ROOM_WALL,
    tileStyles: HER_ROOM_TILES
  });
}
