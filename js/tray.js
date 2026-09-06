/* ------------------------------------------------------------------
   The tray — Level 6, the fried chicken place.

   The meal is a burger, fries and a cola, and the board behind the
   counter has more on it than that. Pick the three that make up the
   order and they go on the tray. Anything else just does not go on,
   which is the whole of the difficulty: there is nothing to lose.
------------------------------------------------------------------- */

const TRAY_ORDER = ['burger', 'fries', 'cola'];

const TRAY_MENU = [
  { id: 'burger',  label: 'Burger',      draw: drawBurger },
  { id: 'wings',   label: 'Wings',       draw: drawWings },
  { id: 'fries',   label: 'Fries',       draw: drawFries },
  { id: 'icecream',label: 'Sundae',      draw: drawSundae },
  { id: 'cola',    label: 'Cola',        draw: drawCola },
  { id: 'wrap',    label: 'Wrap',        draw: drawWrap }
];

/* Each item is painted into its own little canvas, so the menu board
   and the tray show the same picture at two different sizes. */
function itemCanvas(item, size) {
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.save();
  c.scale(size / 48, size / 48);
  item.draw(c);
  c.restore();
  return cv;
}

function drawBurger(c) {
  c.fillStyle = '#d8a24e'; c.beginPath();
  c.ellipse(24, 16, 17, 9, 0, Math.PI, 0); c.fill();
  c.fillRect(7, 16, 34, 3);
  c.fillStyle = '#f0d08a';
  for (const [x, y] of [[16, 10], [24, 8], [32, 10]]) {
    c.fillRect(x, y, 2, 2);
  }
  c.fillStyle = '#6b9c4a'; c.fillRect(6, 19, 36, 4);       // lettuce
  c.fillStyle = '#8a4a2a'; c.fillRect(8, 23, 32, 7);       // patty
  c.fillStyle = '#f2c14a'; c.fillRect(7, 30, 34, 3);       // cheese
  c.fillStyle = '#c8934a'; c.fillRect(8, 33, 32, 8);
  c.fillStyle = '#b07f3c'; c.fillRect(8, 33, 32, 2);
}

function drawWings(c) {
  c.fillStyle = '#b06a30';
  for (const [x, y, r] of [[16, 26, 9], [30, 22, 8], [24, 34, 8]]) {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = '#d08a4a';
  for (const [x, y] of [[13, 23], [28, 19], [21, 31]]) c.fillRect(x, y, 5, 4);
}

function drawFries(c) {
  c.fillStyle = '#e8c05a';                                  // the fries
  for (let i = 0; i < 7; i++) c.fillRect(11 + i * 4, 8 + (i % 3) * 3, 3, 20);
  c.fillStyle = '#c8402f'; c.fillRect(10, 22, 28, 20);      // the carton
  c.fillStyle = '#a83224'; c.fillRect(10, 22, 28, 3);
  c.fillStyle = '#f4f1ea'; c.fillRect(16, 30, 16, 6);
}

function drawSundae(c) {
  c.fillStyle = '#f4f1ea';
  c.beginPath(); c.moveTo(14, 20); c.lineTo(34, 20);
  c.lineTo(28, 42); c.lineTo(20, 42); c.closePath(); c.fill();
  c.fillStyle = '#fbe8ee';
  c.beginPath(); c.arc(24, 17, 9, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#8a3f5a'; c.fillRect(16, 14, 16, 3);
}

function drawCola(c) {
  c.fillStyle = '#c8402f';
  c.beginPath(); c.moveTo(14, 12); c.lineTo(34, 12);
  c.lineTo(30, 44); c.lineTo(18, 44); c.closePath(); c.fill();
  c.fillStyle = '#f4f1ea'; c.fillRect(14, 20, 20, 7);
  c.fillStyle = '#c8402f'; c.fillRect(16, 22, 16, 3);
  c.fillStyle = '#e8e4da'; c.fillRect(13, 9, 22, 4);        // the lid
  c.fillStyle = '#f2c14a'; c.fillRect(26, 0, 3, 11);        // the straw
}

function drawWrap(c) {
  c.fillStyle = '#e8dcb8';
  c.beginPath(); c.moveTo(15, 10); c.lineTo(33, 14);
  c.lineTo(30, 42); c.lineTo(19, 42); c.closePath(); c.fill();
  c.fillStyle = '#c9bd94'; c.fillRect(17, 24, 14, 3);
  c.fillStyle = '#6b9c4a'; c.fillRect(18, 16, 12, 3);
  c.fillStyle = '#8a4a2a'; c.fillRect(18, 19, 12, 4);
}

const Tray = (() => {
  let board, onDone, on = [];

  function build(container, done) {
    board = container;
    onDone = done;
    on = [];

    board.querySelector('.tray-brief').textContent =
      'She asked for a burger, fries and a cola. Tap those three.';

    const menu = board.querySelector('.tray-menu');
    const plate = board.querySelector('.tray-plate');
    menu.innerHTML = '';
    plate.innerHTML = '';

    for (const item of TRAY_MENU) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tray-item';
      b.appendChild(itemCanvas(item, 96));
      const cap = document.createElement('span');
      cap.textContent = item.label;
      b.appendChild(cap);
      b.onclick = () => choose(item, b);
      menu.appendChild(b);
    }
    count();
  }

  function choose(item, btn) {
    if (on.includes(item.id) || btn.disabled) return;
    btn.blur();

    /* Not part of the order: it simply does not go on the tray. */
    if (!TRAY_ORDER.includes(item.id)) {
      btn.classList.add('is-nope');
      setTimeout(() => btn.classList.remove('is-nope'), 300);
      if (typeof Sound !== 'undefined') Sound.play('hurt');
      return;
    }

    on.push(item.id);
    btn.disabled = true;
    btn.classList.add('is-on');
    const slot = document.createElement('div');
    slot.className = 'tray-on';
    slot.appendChild(itemCanvas(item, 84));
    board.querySelector('.tray-plate').appendChild(slot);
    if (typeof Sound !== 'undefined') Sound.play('pickup');
    count();

    if (on.length === TRAY_ORDER.length) {
      board.querySelector('.tray-plate').classList.add('is-done');
      if (typeof Sound !== 'undefined') Sound.play('clear');
      setTimeout(() => {
        board.querySelector('.tray-plate').classList.remove('is-done');
        onDone && onDone();
      }, 1500);
    }
  }

  function count() {
    const left = TRAY_ORDER.length - on.length;
    board.querySelector('.tray-count').textContent =
      left ? `${left} more on the tray` : 'that is the meal';
    board.classList.toggle('art-ready', !left);
  }

  return { build };
})();
