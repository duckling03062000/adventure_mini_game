/* Title screen. Deliberately shows only the opening version of her —
   everything she grows into is discovered by playing. */

const skyCv = document.getElementById('hero-sky');
const stripCv = document.getElementById('hero-scene');

function loop(now) {
  const ts = now / 1000;
  drawSky(skyCv, ts);
  // one character, tight loop padding so she is on screen almost always
  drawWalkStrip(stripCv, ts, ['child'], { scale: 5, spacing: 120, speed: 30 });
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

document.getElementById('start').addEventListener('click', () => {
  location.href = 'game.html';
});
