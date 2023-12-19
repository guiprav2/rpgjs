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
kbd.swipeKeypressInterval = 10;

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let touchActiveTime = null;
let keypressIntervalId;

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
document.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
  touchActiveTime = Date.now();
  touchStartX = touchEndX = event.touches[0].clientX;
  touchStartY = touchEndY = event.touches[0].clientY;
}

function handleTouchMove(event) {
  touchEndX = event.touches[0].clientX;
  touchEndY = event.touches[0].clientY;

  if (touchActiveTime) {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD || Math.abs(deltaY) > SWIPE_THRESHOLD) {
      !keypressIntervalId && handleSwipe(deltaX, deltaY);
    }
  }
}

function handleTouchEnd(event) {
  clearInterval(keypressIntervalId);
  keypressIntervalId = null;

  const deltaX = touchEndX - touchStartX;
  const deltaY = touchEndY - touchStartY;

  if (Math.abs(deltaX) < TAP_THRESHOLD && Math.abs(deltaY) < TAP_THRESHOLD) {
    if (Date.now() - touchActiveTime > 250) { simulateKeyPress('Escape') }
    else { simulateKeyPress('z') }
  }

  touchActiveTime = null;
  touchStartX = touchStartY = touchEndX = touchEndY = 0;
}

function handleSwipe(deltaX, deltaY) {
  clearInterval(keypressIntervalId);
  function simulateKey() {
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
  }
  keypressIntervalId = setInterval(simulateKey, kbd.swipeKeypressInterval);
  simulateKey();
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
