/* ------------------------------------------------------------------
   The Moodle — Level 7, the incubator cell.

   The college's own Moodle, built one line at a time. On the left is
   the site, empty to start with; on the right is what it needs next.
   Pick the line that does what the step asks and that part of the site
   appears.

   The tasks are deliberately small. Every one of them is a thing that
   is actually true about the code, and the wrong options are the two
   mistakes you would really make. A wrong pick greys out and the step
   waits: there is nothing to fail here.
------------------------------------------------------------------- */

const MOODLE_STEPS = [
  {
    part: 'bar',
    ask: 'The page needs a name at the top.',
    options: [
      'page.title = "My Courses"',
      'page.title == "My Courses"',
      '"My Courses" = page.title'
    ],
    answer: 0,
    why: 'One equals sign sets it. Two of them only ask a question.'
  },
  {
    part: 'nav',
    ask: 'Now fetch the list of courses from the server.',
    options: [
      'get("/api/courses")',
      'courses = get("/api/courses")',
      'courses = "/api/courses"'
    ],
    answer: 1,
    why: 'Ask for it, and keep hold of what comes back.'
  },
  {
    part: 'cards',
    ask: 'Put a card on the page for each course.',
    options: [
      'for c in courses: card(c)',
      'for c in card: courses(c)',
      'card(courses)'
    ],
    answer: 0,
    why: 'One card per course, so the loop goes over the courses.'
  },
  {
    part: 'att',
    ask: 'And the attendance figure. She was in 42 of 50 classes.',
    options: [
      'return total / present * 100',
      'return present * total / 100',
      'return present / total * 100'
    ],
    answer: 2,
    why: '42 divided by 50 is 84 per cent. The other two are not.'
  }
];

const Moodle = (() => {
  let board, at = 0, onDone = null, locked = false;

  const COURSES = [
    { code: 'CS-201', name: 'Data Structures' },
    { code: 'CS-204', name: 'Operating Systems' },
    { code: 'MA-210', name: 'Discrete Maths' },
    { code: 'CS-208', name: 'Databases' }
  ];

  function build(container, done) {
    board = container;
    onDone = done;
    at = 0;
    locked = false;

    /* The site starts as an empty frame and fills in as she goes. */
    for (const part of ['bar', 'nav', 'cards', 'att']) {
      board.querySelector('.moo-' + part).classList.remove('is-on');
    }
    board.querySelector('.moo-title').textContent = '';
    board.querySelector('.moo-nav').innerHTML = '';
    board.querySelector('.moo-cards').innerHTML = '';
    board.querySelector('.moo-att').innerHTML = '';
    board.querySelector('.moo-site').classList.remove('is-done');
    render();
  }

  /* What each finished step puts on the page. */
  function fill(part) {
    if (part === 'bar') {
      board.querySelector('.moo-title').textContent = 'My Courses';
    }
    if (part === 'nav') {
      const nav = board.querySelector('.moo-nav');
      for (const label of ['Dashboard', 'Courses', 'Grades', 'Calendar']) {
        const a = document.createElement('span');
        a.textContent = label;
        nav.appendChild(a);
      }
    }
    if (part === 'cards') {
      const wrap = board.querySelector('.moo-cards');
      for (const c of COURSES) {
        const card = document.createElement('div');
        card.className = 'moo-card';
        card.innerHTML = '<b></b><span></span><i></i>';
        card.querySelector('b').textContent = c.code;
        card.querySelector('span').textContent = c.name;
        wrap.appendChild(card);
      }
    }
    if (part === 'att') {
      const att = board.querySelector('.moo-att');
      att.innerHTML = '<p>Attendance</p>' +
        '<div class="moo-bar-track"><span></span></div><b>84%</b>' +
        '<small>42 of 50 classes</small>';
      requestAnimationFrame(() => {
        const fillEl = att.querySelector('.moo-bar-track span');
        if (fillEl) fillEl.style.width = '84%';
      });
    }
    board.querySelector('.moo-' + part).classList.add('is-on');
  }

  function render() {
    const step = MOODLE_STEPS[at];
    board.querySelector('.moo-ask').textContent = step.ask;
    board.querySelector('.moo-why').textContent = '';

    const opts = board.querySelector('.moo-opts');
    opts.innerHTML = '';
    step.options.forEach((text, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'moo-opt';
      b.textContent = text;
      b.onclick = () => choose(b, i);
      opts.appendChild(b);
    });

    board.querySelector('.moo-count').textContent =
      `step ${at + 1} of ${MOODLE_STEPS.length}`;
  }

  function choose(btn, i) {
    if (locked) return;
    btn.blur();
    const step = MOODLE_STEPS[at];

    /* Wrong just does not count. It goes grey and the step waits. */
    if (i !== step.answer) {
      btn.classList.add('is-wrong');
      btn.disabled = true;
      if (typeof Sound !== 'undefined') Sound.play('hurt');
      return;
    }

    locked = true;
    btn.classList.add('is-right');
    board.querySelector('.moo-why').textContent = step.why;
    fill(step.part);
    if (typeof Sound !== 'undefined') Sound.play('pickup');

    setTimeout(() => {
      at++;
      locked = false;
      if (at >= MOODLE_STEPS.length) {
        board.querySelector('.moo-site').classList.add('is-done');
        board.querySelector('.moo-ask').textContent = 'That is the Moodle.';
        board.querySelector('.moo-opts').innerHTML = '';
        board.querySelector('.moo-why').textContent = 'It works. It is live.';
        board.querySelector('.moo-count').textContent = 'done';
        board.classList.add('art-ready');
        if (typeof Sound !== 'undefined') Sound.play('clear');
        setTimeout(() => {
          board.classList.remove('art-ready');
          onDone && onDone();
        }, 2000);
        return;
      }
      render();
    }, 1500);
  }

  return { build };
})();
