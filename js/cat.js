/* ------------------------------------------------------------------
   The cat in the tree — Level 9.

   It is four branches up and it is not coming down for anybody. Four
   things to try, three options each, and the right one gets it one
   branch lower. The wrong ones do nothing at all: you cannot make it
   worse, and you cannot fail, which is the only decent way to write a
   puzzle about a frightened animal.
------------------------------------------------------------------- */

const CAT_STEPS = [
  {
    ask: 'It is right at the top, and half the street is shouting at it.',
    options: ['Shout louder', 'Ask everybody to be quiet', 'Shake the tree'],
    answer: 1,
    why: 'A frightened cat goes up, not down.'
  },
  {
    ask: 'It has stopped yowling. It still will not move.',
    options: ['Climb up after it', 'Put a bowl of food at the bottom', 'Throw a stick'],
    answer: 1,
    why: 'Give it a reason to come down on its own.'
  },
  {
    ask: 'Two branches lower. The next drop is a long one.',
    options: ['Pull it down by the scruff', 'Put something soft under the branch',
              'Point a hose at it'],
    answer: 1,
    why: 'It will come when the landing looks survivable.'
  },
  {
    ask: 'Lowest branch. It is looking straight at her.',
    options: ['Grab it', 'Hold your hands out and wait', 'Walk away'],
    answer: 1,
    why: 'It came the rest of the way itself.'
  }
];

const Cat = (() => {
  let board, cv, c, at = 0, onDone = null, locked = false;
  let rung = 0, target = 0, raf = 0, t = 0;
  /* Extras that turn up on the ground as she thinks of them. */
  let bowl = false, cushion = false, hands = false, quiet = false;

  const W = 320, H = 220;
  const BRANCHES = [46, 78, 110, 142];      // y of each branch, top first
  const GROUND = 194;

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    locked = false;
    rung = 0;
    target = 0;
    bowl = cushion = hands = quiet = false;
    t = 0;

    cv = board.querySelector('.cat-canvas');
    cv.width = W;
    cv.height = H;
    c = cv.getContext('2d');
    c.imageSmoothingEnabled = false;

    render();
    if (!raf) raf = requestAnimationFrame(frame);
  }

  function render() {
    const step = CAT_STEPS[at];
    board.querySelector('.cat-ask').textContent = step.ask;
    board.querySelector('.cat-why').textContent = '';

    const opts = board.querySelector('.cat-opts');
    opts.innerHTML = '';
    step.options.forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-opt';
      b.textContent = text;
      b.onclick = () => choose(b, i);
      opts.appendChild(b);
    });

    board.querySelector('.cat-count').textContent =
      `${BRANCHES.length - rung} branch${BRANCHES.length - rung === 1 ? '' : 'es'} to go`;
  }

  function choose(btn, i) {
    if (locked) return;
    btn.blur();
    const step = CAT_STEPS[at];

    if (i !== step.answer) {
      btn.classList.add('is-wrong');
      btn.disabled = true;
      if (typeof Sound !== 'undefined') Sound.play('hurt');
      return;
    }

    locked = true;
    btn.classList.add('is-right');
    board.querySelector('.cat-why').textContent = step.why;
    if (at === 0) quiet = true;
    if (at === 1) bowl = true;
    if (at === 2) cushion = true;
    if (at === 3) hands = true;
    target = at + 1;
    if (typeof Sound !== 'undefined') Sound.play('pickup');

    setTimeout(() => {
      at++;
      locked = false;
      if (at >= CAT_STEPS.length) {
        board.querySelector('.cat-ask').textContent = 'She got it down.';
        board.querySelector('.cat-opts').innerHTML = '';
        board.querySelector('.cat-why').textContent =
          'It sat on her shoulder for a while afterwards, which was the point.';
        board.querySelector('.cat-count').textContent = 'down';
        board.classList.add('art-ready');
        if (typeof Sound !== 'undefined') Sound.play('clear');
        setTimeout(() => {
          board.classList.remove('art-ready');
          cancelAnimationFrame(raf);
          raf = 0;
          onDone && onDone();
        }, 2400);
        return;
      }
      render();
    }, 1500);
  }

  /* ------------------------------ drawing ----------------------- */
  function frame() {
    raf = requestAnimationFrame(frame);
    t += 1 / 60;
    rung += (target - rung) * 0.08;
    paint();
  }

  function catY() {
    if (rung >= BRANCHES.length) {
      // off the last branch and onto the ground
      const p = Math.min(1, rung - BRANCHES.length + 1);
      return BRANCHES[BRANCHES.length - 1] +
             (GROUND - BRANCHES[BRANCHES.length - 1]) * p;
    }
    const lo = Math.floor(rung), hi = Math.min(BRANCHES.length - 1, lo + 1);
    return BRANCHES[lo] + (BRANCHES[hi] - BRANCHES[lo]) * (rung - lo);
  }

  function paint() {
    // evening sky over the street
    const sky = c.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#6d7fa8');
    sky.addColorStop(1, '#e5b183');
    c.fillStyle = sky;
    c.fillRect(0, 0, W, H);

    c.fillStyle = '#8a8172';
    c.fillRect(0, GROUND, W, H - GROUND);
    c.fillStyle = '#9a9182';
    c.fillRect(0, GROUND, W, 3);

    /* The tree. */
    c.fillStyle = '#5b4530';
    c.fillRect(150, 40, 16, GROUND - 40);
    c.fillStyle = '#6d5238';
    c.fillRect(150, 40, 5, GROUND - 40);
    for (let i = 0; i < BRANCHES.length; i++) {
      const y = BRANCHES[i], left = i % 2 === 0;
      c.fillStyle = '#5b4530';
      if (left) c.fillRect(104, y + 6, 48, 7);
      else c.fillRect(164, y + 6, 48, 7);
    }
    // the canopy
    c.fillStyle = '#3f7a44';
    for (const [x, y, r] of [[158, 30, 44], [112, 48, 30], [206, 46, 30],
                             [132, 20, 26], [186, 22, 26]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#4e9153';
    for (const [x, y, r] of [[150, 22, 24], [186, 34, 18], [122, 38, 16]]) {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    }

    /* What she has put at the bottom of it. */
    if (cushion) {
      c.fillStyle = '#241b26'; c.fillRect(115, GROUND - 13, 46, 13);
      c.fillStyle = '#c2699a'; c.fillRect(116, GROUND - 12, 44, 11);
      c.fillStyle = '#d886ae'; c.fillRect(116, GROUND - 12, 44, 3);
    }
    if (bowl) {
      c.fillStyle = '#241b26'; c.fillRect(196, GROUND - 10, 26, 10);
      c.fillStyle = '#4aa8d8'; c.fillRect(197, GROUND - 9, 24, 8);
      c.fillStyle = '#c8905a'; c.fillRect(200, GROUND - 12, 18, 4);
    }

    /* Her, at the foot of it. */
    if (typeof CHARACTERS !== 'undefined' && typeof drawCharacter === 'function') {
      c.save();
      c.translate(0, 0);
      drawCharacter(c, CHARACTERS.teen, 'idle', 2, 58, GROUND,
                    Math.sin(t * 2) > 0 ? 0 : 1);
      c.restore();
      if (hands) {                       // arms out, waiting
        c.fillStyle = '#e8b78d';
        c.fillRect(70, GROUND - 34, 18, 5);
      }
    }

    /* The cat. */
    const cy = catY(), lo = Math.floor(Math.min(rung, BRANCHES.length - 1));
    const onLeft = lo % 2 === 0;
    const cx = rung >= BRANCHES.length ? 96 : (onLeft ? 120 : 192);
    drawCat(cx, cy + 6, quiet);

    /* The noise everybody was making, until she stopped it. */
    if (!quiet) {
      for (let i = 0; i < 5; i++) {
        const p = ((t * 1.2 + i * 0.2) % 1);
        c.globalAlpha = (1 - p) * 0.5;
        c.fillStyle = '#f4f1ea';
        c.font = '10px "Press Start 2P", monospace';
        c.fillText('!', 30 + i * 12, GROUND - 46 - p * 22);
      }
      c.globalAlpha = 1;
    }
  }

  /* A cat, sitting, tail out behind it. */
  function drawCat(x, y, calm) {
    const sway = Math.sin(t * 2.2) * 3;
    c.fillStyle = '#241b26';
    c.fillRect(x - 11, y - 15, 23, 16);                  // outline
    c.fillStyle = '#3a3038';
    c.fillRect(x - 10, y - 14, 21, 14);                  // body
    c.fillStyle = '#4a3f48';
    c.fillRect(x - 10, y - 14, 21, 4);
    // head
    c.fillStyle = '#241b26'; c.fillRect(x + 2, y - 24, 13, 11);
    c.fillStyle = '#3a3038'; c.fillRect(x + 3, y - 23, 11, 9);
    // ears
    c.fillStyle = '#241b26';
    c.fillRect(x + 3, y - 27, 3, 4); c.fillRect(x + 11, y - 27, 3, 4);
    // eyes
    c.fillStyle = calm ? '#8fe08f' : '#f2c14a';
    c.fillRect(x + 5, y - 21, 2, calm ? 1 : 3);
    c.fillRect(x + 10, y - 21, 2, calm ? 1 : 3);
    // tail
    c.fillStyle = '#241b26';
    c.fillRect(x - 17, y - 10 + sway, 7, 3);
    c.fillRect(x - 19, y - 14 + sway, 3, 6);
  }

  return { build };
})();
