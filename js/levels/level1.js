/* ------------------------------------------------------------------
   LEVEL 1 — THE BIRTH
   Bangalore, 6 September 2002. Heavy monsoon rain.
   The goal is the hospital, across the city. Only the signboard on the
   building names it — the writing never does.

   Act 1: Papa has to get across a flooded city. Broken road,
          barricades, a stalled BMTC bus, a parked auto.
   Act 2: Mumma has to get there too, and cannot jump the way Papa
          can, so the route is gentler — that difference is the point.
------------------------------------------------------------------- */

/* ------------------------------- ACT 1 ---------------------------- */
/* Papa's run. Long, broken, and deliberately demanding. */
function buildAct1() {
  const b = makeBuilder(GRID_H);
  b.prop('streetlight', 4);
  b.flat(14, { puddleAt: [9] });
  b.gap(3);
  b.flat(6);
  b.crates(1);
  b.flat(4);
  b.crates(2);
  b.flat(6, { puddleAt: [2] });
  b.gap(3);
  b.prop('streetlight');
  b.flat(3);
  b.auto();
  b.flat(3);
  b.checkpoint();
  b.flat(5);
  b.crates(1);
  b.bus(5, 3);
  b.flat(5);
  b.gap(3);
  b.flat(4);
  b.crates(2, 2);
  b.flat(7, { puddleAt: [3] });
  b.ledges(4, 4);
  b.flat(3);
  b.gap(3);
  b.prop('streetlight');
  b.flat(5);
  b.checkpoint();
  b.flat(4);
  b.crates(3);
  b.flat(3);
  b.gap(3);
  b.flat(3);
  b.auto();
  b.flat(2);
  b.crates(1);
  b.bus(6, 3);
  b.flat(6, { puddleAt: [1, 4] });
  b.gap(3);
  b.flat(8);
  b.prop('streetlight');
  b.checkpoint();
  b.flat(6);
  const goal = b.frontage(12, 'W', 'hospital');
  b.flat(6);
  return b.build({ goalX: goal.goalX, name: 'act1', theme: 'monsoon' });
}

/* ------------------------------- ACT 2 ---------------------------- */
/* Mumma's walk. No holes she can fall into, nothing she cannot step
   over. Shorter, but she moves slowly, so it does not feel short. */
function buildAct2() {
  const b = makeBuilder(GRID_H);
  b.prop('streetlight', 3);
  b.flat(12, { puddleAt: [7] });
  b.crates(1);
  b.flat(8, { puddleAt: [3] });
  b.checkpoint();
  b.flat(6);
  b.auto();
  b.flat(5);
  b.ledges(3, 2);
  b.flat(6, { puddleAt: [2] });
  b.prop('streetlight');
  b.checkpoint();
  b.flat(7);
  b.crates(1, 2);
  b.flat(9, { puddleAt: [4] });
  b.crates(1);
  b.flat(6);
  b.prop('streetlight');
  b.checkpoint();
  b.flat(5);
  const goal = b.frontage(12, 'W', 'hospital');
  b.flat(6);
  return b.build({ goalX: goal.goalX, name: 'act2', theme: 'monsoon' });
}
