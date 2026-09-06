/* ------------------------------------------------------------------
   The test — Level 5, Sunday.

   Physics, chemistry and maths, two of each, in the order they come on
   the paper. Every question is a real one at the level she was working
   at, and every number in it works out.

   A wrong option does not count and does not punish. There is no mark,
   no timer and no failing: the paper is finished when it is finished.
------------------------------------------------------------------- */

const TEST_PAPER = [
  {
    subject: 'Physics',
    q: 'A stone is thrown straight up at 20 m/s. How high does it get? ' +
       'Take g = 10 m/s².',
    options: ['10 m', '20 m', '40 m', '200 m'],
    answer: 1,
    note: 'v² = 2gh, so h = 400 / 20.'
  },
  {
    subject: 'Physics',
    q: 'A body of mass 2 kg accelerates at 3 m/s². What is the ' +
       'force on it?',
    options: ['1.5 N', '5 N', '6 N', '9 N'],
    answer: 2,
    note: 'F = ma. Nothing more to it.'
  },
  {
    subject: 'Chemistry',
    q: 'How many moles are there in 36 g of water? ' +
       'H₂O is 18 g per mole.',
    options: ['0.5 mol', '1 mol', '2 mol', '18 mol'],
    answer: 2,
    note: 'Moles = mass / molar mass.'
  },
  {
    subject: 'Chemistry',
    q: 'What is the oxidation state of sulphur in H₂SO₄?',
    options: ['+2', '+4', '+6', '−2'],
    answer: 2,
    note: '2(+1) + S + 4(−2) = 0.'
  },
  {
    subject: 'Maths',
    q: 'Differentiate x³ with respect to x.',
    options: ['x²', '2x²', '3x²', '3x'],
    answer: 2,
    note: 'Bring the power down, then drop it by one.'
  },
  {
    subject: 'Maths',
    q: 'What are the roots of x² − 5x + 6 = 0?',
    options: ['1 and 6', '2 and 3', '−2 and −3', '5 and 6'],
    answer: 1,
    note: 'They add to 5 and multiply to 6.'
  }
];

const TestPaper = (() => {
  let board, at = 0, onDone = null, locked = false;

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    locked = false;
    render();
  }

  function render() {
    const q = TEST_PAPER[at];
    board.querySelector('.test-subject').textContent = q.subject;
    board.querySelector('.test-q').textContent = q.q;
    board.querySelector('.test-count').textContent =
      `question ${at + 1} of ${TEST_PAPER.length}`;

    const wrap = board.querySelector('.test-options');
    wrap.innerHTML = '';
    q.options.forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'test-option';
      b.innerHTML = `<span class="test-letter">${'ABCD'[i]}</span>` +
                    `<span class="test-text"></span>`;
      b.querySelector('.test-text').textContent = text;
      b.onclick = () => choose(b, i);
      wrap.appendChild(b);
    });
  }

  function choose(btn, i) {
    if (locked) return;
    btn.blur();
    const q = TEST_PAPER[at];

    /* Wrong simply does not count. It says so and lets her try again. */
    if (i !== q.answer) {
      btn.classList.add('is-wrong');
      btn.disabled = true;
      if (typeof Sound !== 'undefined') Sound.play('hurt');
      return;
    }

    locked = true;
    btn.classList.add('is-right');
    if (typeof Sound !== 'undefined') Sound.play('pickup');

    const note = document.createElement('p');
    note.className = 'test-note';
    note.textContent = q.note;
    board.querySelector('.art-inner').appendChild(note);

    setTimeout(() => {
      note.remove();
      at++;
      locked = false;
      if (at >= TEST_PAPER.length) {
        if (typeof Sound !== 'undefined') Sound.play('clear');
        onDone && onDone();
        return;
      }
      render();
    }, 1250);
  }

  return { build };
})();
