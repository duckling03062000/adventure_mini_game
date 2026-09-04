/* ------------------------------------------------------------------
   LEVEL 3 — THE BOOK

   One level, four scenes, no cards in between: the screen fades and
   you are somewhere new.

     1. the walk to her art teacher's home  (outdoor platforming)
     2. inside the home — past her husband at his computer, out to the
        balcony where the teacher is painting  (indoor platforming)
     3. the painting she is set                (the art board)
     4. the book                               (the ending)

   It is a home, not a school. Nothing in it is institutional.
------------------------------------------------------------------- */

/* --------------------------- SCENE 1 ----------------------------- */
function buildAct3a() {
  const b = makeBuilder();

  b.flat(9);
  b.prop('tree', 5);
  b.crates(1);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(4);
  b.gap(2);
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.steps(2);
  b.flat(4);
  b.prop('tree');
  b.flat(4);
  b.gap(2);
  b.flat(5);
  b.block(2, 1, 'B', 'auto');
  b.flat(6);
  b.crates(2);
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.prop('tree');
  b.crates(1);
  b.flat(4);
  b.gap(2);
  b.flat(6);
  b.ledges(3, 2);
  b.flat(5);
  b.checkpoint();
  b.flat(4);

  /* her teacher's house — a gate, then the front door */
  b.prop('housegate');
  b.flat(6);
  const goal = b.frontage(8, 'S', 'housefront', { doorOffset: 6, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX,
    name: 'act3a',
    theme: 'afternoon',
    tileStyles: {
      '#': { fill: '#9c8f76', top: '#b7a98d' },
      'B': { fill: '#a89878', top: '#c0b08d' },
      'C': { fill: '#cbb894', top: '#e0cfab' },
      'S': { fill: '#c98f6a', top: '#dda583' }
    }
  });
}

/* --------------------------- SCENE 2 ----------------------------- */
/* Inside. Front room, corridor, then the balcony — which opens back
   out to the sky, so walking to the teacher is walking into the light. */
function buildAct3b() {
  const b = makeBuilder();

  b.indoors();
  b.flat(5);
  b.prop('rug', 2);
  b.flat(4);
  b.prop('deskpc', b.x - 3);        // her husband, working
  b.flat(6);
  b.prop('bookshelf', b.x - 2);
  b.flat(4);
  b.crates(1, 1, 'C');              // a stool in the way
  b.flat(5);
  b.checkpoint();
  b.flat(3);
  b.prop('painting', b.x - 2);
  b.flat(5);
  b.crates(1, 2, 'C');              // stacked canvases
  b.flat(6);
  b.prop('bookshelf', b.x - 3);
  b.flat(4);
  b.prop('doorway', b.x);           // out to the balcony
  b.flat(4);

  /* the balcony */
  b.outdoors();
  b.flat(4);
  b.prop('railing', b.x - 4, { w: 14 });
  b.flat(5);
  b.prop('plantpot');
  b.flat(3);
  const easelX = b.x;
  b.prop('easel', easelX);
  b.flat(10);

  return b.build({
    goalX: (easelX - 1) * 16,
    name: 'act3b',
    theme: 'afternoon',
    interiorWall: { top: '#c9a98a', bottom: '#b08e70', skirt: '#8f6f55' },
    tileStyles: {
      '#': { fill: '#b08a63', top: '#c6a077' },
      'F': { fill: '#9a7550', top: '#b08a63' },
      'S': { fill: '#8f6f55', top: '#a78469' },
      'C': { fill: '#c2a884', top: '#d8bd97' }
    }
  });
}
