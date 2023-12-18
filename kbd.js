let kbd = { state: {} };

addEventListener('keydown', ev => {
  kbd.last = ev.key;
  if (ev.key.startsWith('Arrow')) { kbd.lastArrow = ev.key }
  if (kbd.state[ev.key]) { return }
  kbd.state[ev.key] = true;
  ev.target.dispatchEvent(new CustomEvent('keyhit', {
    detail: { originalEvent: ev },
    bubbles: true,
  }));
});

addEventListener('keyup', ev => {
  if (kbd.last === ev.key) { kbd.last = null }
  if (ev.key.startsWith('Arrow') && kbd.lastArrow === ev.key) { kbd.lastArrow = null }
  kbd.state[ev.key] = false;
});

const SWIPE_THRESHOLD = 50;
const TAP_THRESHOLD = 5;
const KEYPRESS_INTERVAL = 10;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchActive = false;
let keypressIntervalId;

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
  touchActive = true;
  touchStartX = touchEndX = event.touches[0].clientX;
  touchStartY = touchEndY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;

  if (touchActive) {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
      !keypressIntervalId && handleSwipe(deltaX, deltaY);
    }
  }
}

function handleTouchEnd(event) {
  touchActive = false;
  clearInterval(keypressIntervalId);
  keypressIntervalId = null;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) < TAP_THRESHOLD && Math.abs(deltaY) < TAP_THRESHOLD) {
    simulateKeyPress('z');
  }

  touchStartX = touchStartY = touchEndX = touchEndY = 0;
}

function handleSwipe(deltaX, deltaY) {
  clearInterval(keypressIntervalId);
  keypressIntervalId = setInterval(() => {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        simulateKeyPress('ArrowRight');
      } else {
        simulateKeyPress('ArrowLeft');
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        simulateKeyPress('ArrowDown');
      } else {
        simulateKeyPress('ArrowUp');
      }
    }
  }, KEYPRESS_INTERVAL);
}

function simulateKeyPress(key) {
  const event = new Event('keydown');
  event.key = key;
  dispatchEvent(event);
  requestAnimationFrame(() => {
    const event = new Event('keyup');
    event.key = key;
    dispatchEvent(event);
  });
}

export default kbd;
