/* ------------------------------------------------------------------
   The range — Level 8, her room, and the game everyone was on.

   Targets come up around the arena and go away again. Click enough of
   them and the round is over. Missing costs nothing and running out of
   time costs nothing either: a target she does not get to just fades
   and another one comes up. Same rule as everything else in this game.
------------------------------------------------------------------- */

const FPS_TO_HIT = 12;
const FPS_LIFE = 1500;          // how long a target stays up, in ms
const FPS_GAP = 620;            // how long between them

const Fps = (() => {
  let board, arena, cross, onDone;
  let hits = 0, spawner = 0, live = [], running = false;

  function build(container, done) {
    board = container;
    onDone = done;
    hits = 0;
    live = [];
    running = true;

    arena = board.querySelector('.fps-arena');
    cross = board.querySelector('.fps-cross');
    for (const t of arena.querySelectorAll('.fps-target')) t.remove();

    arena.onmousemove = e => {
      const r = arena.getBoundingClientRect();
      cross.style.left = (e.clientX - r.left) + 'px';
      cross.style.top = (e.clientY - r.top) + 'px';
    };
    /* A click on the arena itself is a miss, and a miss is free. */
    arena.onclick = () => { if (running) flash(); };

    count();
    clearInterval(spawner);
    spawner = setInterval(spawn, FPS_GAP);
    spawn();
  }

  function flash() {
    arena.classList.add('is-miss');
    setTimeout(() => arena.classList.remove('is-miss'), 90);
  }

  function spawn() {
    if (!running) return;
    const t = document.createElement('button');
    t.type = 'button';
    t.className = 'fps-target';
    // kept off the very edges so nothing is unreachable
    t.style.left = (8 + Math.random() * 78) + '%';
    t.style.top = (10 + Math.random() * 72) + '%';
    const size = 34 + Math.random() * 22;
    t.style.width = t.style.height = size + 'px';
    t.onclick = e => { e.stopPropagation(); hit(t); };
    arena.appendChild(t);
    live.push(t);

    // it does not wait around
    setTimeout(() => {
      if (!t.isConnected || t.dataset.hit) return;
      t.classList.add('is-gone');
      setTimeout(() => t.remove(), 200);
    }, FPS_LIFE);
  }

  function hit(t) {
    if (!running || t.dataset.hit) return;
    t.dataset.hit = '1';
    t.classList.add('is-hit');
    setTimeout(() => t.remove(), 220);
    hits++;
    if (typeof Sound !== 'undefined') Sound.play('pickup');
    count();

    if (hits >= FPS_TO_HIT) {
      running = false;
      clearInterval(spawner);
      if (typeof Sound !== 'undefined') Sound.play('clear');
      setTimeout(() => {
        for (const el of arena.querySelectorAll('.fps-target')) el.remove();
        onDone && onDone();
      }, 900);
    }
  }

  function count() {
    const left = Math.max(0, FPS_TO_HIT - hits);
    board.querySelector('.fps-count').textContent =
      left ? `${left} to go` : 'round over';
    board.classList.toggle('art-ready', !left);
  }

  return { build };
})();
