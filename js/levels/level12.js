/* ------------------------------------------------------------------
   LEVEL 12 — THE FIRST MORNING

     0.  north, one more flight                 (cutscene)
     1.  out of the society, to the cab
     2.  the cab                                (cutscene)
     3.  out of it, coffee, and in through the doors
     4.  and it goes on from there              (cutscene)

   She is the adult from here on: hat, crop top, jeans, sunglasses.
------------------------------------------------------------------- */

const NOIDA_TILES = {
  '#': { fill: '#9a9686', top: '#b3af9d' },
  'B': { fill: '#a4a08f', top: '#bcb8a5' },
  'C': { fill: '#cbb894', top: '#e0cfab' },
  'S': { fill: '#8d94a4', top: '#a4abbb' }
};

/* --------------------------- SCENE 2 -----------------------------
   Out from under the towers she woke up in, past the gate, to a cab
   with its engine already going.
------------------------------------------------------------------ */
function buildAct12society() {
  const b = makeBuilder();

  b.prop('towers', 0);
  b.flat(9);
  b.prop('tree', b.x - 3);
  b.flat(5);
  b.prop('societygate', b.x);
  b.flat(9);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.prop('cat', b.x - 4, { coat: 'white', asleep: true });
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('streetlight', b.x - 3);
  b.flat(6);
  const cab = b.x;
  b.prop('cab', cab);
  b.flat(10);

  return b.build({
    goalX: (cab - 3) * 16,
    name: 'act12society', theme: 'morning',
    tileStyles: NOIDA_TILES
  });
}

/* --------------------------- SCENE 4 -----------------------------
   Out of the cab, a coffee on the corner, and then the doors.
------------------------------------------------------------------ */
function buildAct12office() {
  const b = makeBuilder();

  b.flat(6);
  b.prop('cab', 1);
  b.flat(6);
  b.prop('tree', b.x - 3);
  b.flat(5);
  const shop = b.x;
  b.prop('coffeeshop', shop);
  b.flat(13);

  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.prop('streetlight', b.x - 3);
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('tree', b.x - 3);
  b.flat(6);
  const goal = b.frontage(11, 'S', 'dxcfront', { doorOffset: 9, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX, name: 'act12office', theme: 'morning',
    tileStyles: NOIDA_TILES,
    triggers: [
      { x: shop - 3, talk: true, lines: [
          { text: 'There was a place on the corner. There always is.' },
          { who: 'Ayrisha', char: 'noida', text: 'One coffee. To take away.' },
          { text: 'Two minutes.', on() { giveItem('coffeecup'); } }
        ] }
    ]
  });
}
