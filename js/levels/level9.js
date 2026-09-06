/* ------------------------------------------------------------------
   LEVEL 9 — THE CATS

     0.  the road outside the gate, and the cats she stops for
     1.  getting one of them out of a tree      (mini-game)
     2.  and then Shantanu, and the chicken place
------------------------------------------------------------------- */

const STREET_TILES = {
  '#': { fill: '#8f8a76', top: '#a8a28c' },
  'B': { fill: '#9a9482', top: '#b2ab97' },
  'C': { fill: '#cbb894', top: '#e0cfab' },
  'S': { fill: '#b4794f', top: '#c9906a' }
};

/* --------------------------- SCENE 1 -----------------------------
   The road outside the college gate. She cannot walk down it in under
   twenty minutes and never has been able to.
------------------------------------------------------------------ */
function buildAct9street() {
  const b = makeBuilder();

  b.flat(8);
  b.prop('collegegate', 3);
  b.flat(5);
  b.prop('tree', b.x - 3);
  b.flat(4);

  const cat1 = b.x;
  b.prop('cat', cat1 + 2, { coat: 'ginger' });
  b.flat(9);

  b.block(2, 1, 'C', 'bench');
  b.flat(4);
  const cat2 = b.x;
  b.prop('cat', cat2 + 1, { coat: 'black' });
  b.prop('cat', cat2 + 5, { coat: 'white', asleep: true });
  b.flat(10);

  b.checkpoint();
  b.flat(3);
  b.prop('streetlight', b.x - 3);
  b.flat(5);
  const cat3 = b.x;
  b.prop('cat', cat3 + 2, { coat: 'tabby' });
  b.flat(9);

  b.prop('home', b.x);
  b.flat(9);
  const tree = b.x;
  b.prop('treecat', tree);
  b.flat(12);

  return b.build({
    goalX: (tree - 3) * 16,
    name: 'act9street', theme: 'afternoon',
    tileStyles: STREET_TILES,
    triggers: [
      { x: cat1 - 2, talk: true, lines: [
          { text: 'A ginger one, on a wall, in the last of the sun.' },
          { who: 'Ayrisha', char: 'teen', text: 'Hello. Hello, you.' },
          { text: 'She was there four minutes.' }
        ] },
      { x: cat2 - 2, talk: true, lines: [
          { text: 'Two more by the bench. One of them does not wake up for it.' },
          { who: 'Ayrisha', char: 'teen', text: 'You are all so good.' }
        ] },
      { x: cat3 - 2, talk: true, lines: [
          { who: 'Ayrisha', char: 'teen', text: 'Okay. Last one. Then I am going.' },
          { text: 'It was not the last one.' }
        ] }
    ]
  });
}

/* --------------------------- SCENE 3 -----------------------------
   Shantanu turns up at the foot of the tree, and there is a fried
   chicken place at the end of the road.
------------------------------------------------------------------ */
function buildAct9kfc() {
  const b = makeBuilder();

  b.flat(9);
  b.prop('cat', 5, { coat: 'ginger' });
  b.flat(5);
  b.block(2, 1, 'C', 'bench');
  b.flat(6);
  b.gap(2);
  b.flat(6);
  b.checkpoint();
  b.flat(4);
  b.prop('streetlight', b.x - 3);
  b.flat(6);
  b.crates(1);
  b.flat(7);
  const till = b.x;
  b.prop('kfcfront', till);
  b.flat(14);

  return b.build({
    goalX: (till + 3) * 16,
    name: 'act9kfc', theme: 'afternoon',
    tileStyles: STREET_TILES,
    companion: { char: 'shantanu', tuning: TEEN_TUNING }
  });
}
