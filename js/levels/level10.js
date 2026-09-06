/* ------------------------------------------------------------------
   LEVEL 10 — AN HOUR TO KILL

     0.  the road outside the gate, and the juice corner on it
     1.  back along to the auditorium
     2.  the back row                          (cutscene)

   He walks both of the outdoor scenes with her.
------------------------------------------------------------------- */

/* --------------------------- SCENE 1 -----------------------------
   The cart parked on the corner, with a churn of ice on it.
------------------------------------------------------------------ */
function buildAct10juice() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('collegegate', 3);
  b.flat(6);
  b.prop('tree', b.x - 3);
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(5);
  b.prop('cat', b.x - 4, { coat: 'ginger', asleep: true });
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('streetlight', b.x - 3);
  b.flat(7);
  const cart = b.x;
  b.prop('juicecorner', cart);
  b.prop('juicemanspot', cart + 3);
  b.flat(12);

  return b.build({
    goalX: (cart - 3) * 16,
    name: 'act10juice', theme: 'afternoon',
    tileStyles: STREET_TILES,
    companion: { char: 'shantanu', tuning: TEEN_TUNING }
  });
}

/* --------------------------- SCENE 2 -----------------------------
   Back in through the gate and across to the auditorium, with the
   bottle in her hand and nothing at all in her face.
------------------------------------------------------------------ */
function buildAct10audi() {
  const b = makeBuilder();

  b.flat(9);
  b.prop('tree', b.x - 3);
  b.flat(5);
  b.crates(1);
  b.flat(6);
  b.block(2, 1, 'C', 'bench');
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('tree', b.x - 3);
  b.flat(6);
  const goal = b.frontage(10, 'S', 'audifront', { doorOffset: 8, openAll: true });
  b.flat(4);

  return b.build({
    goalX: goal.goalX, name: 'act10audi', theme: 'morning',
    tileStyles: COLLEGE_TILES,
    companion: { char: 'shantanu', tuning: TEEN_TUNING }
  });
}
