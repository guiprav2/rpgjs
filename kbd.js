let kbd = {
  up: 0,
  down: 1,
  hit: 2,
  release: -1,
  state: {},
};

kbd.get = key => kbd.state[key] || kbd.up;

function kbdFrame() {
  requestAnimationFrame(kbdFrame);
  for (let [k, v] of Object.entries(kbd.state)) {
    switch (v) {
      case kbd.hit: kbd.state[k] = kbd.down; break;
      case kbd.release: kbd.state[k] = kbd.up; break;
    }
  }
}

kbdFrame();

addEventListener('keydown', ev => {
  kbd.last = ev.key;
  if (ev.key.startsWith('Arrow')) { kbd.lastArrow = ev.key }
  if (kbd.get(ev.key) === kbd.down) { return }
  kbd.state[ev.key] = kbd.hit;
});

addEventListener('keyup', ev => {
  if (kbd.last === ev.key) { kbd.last = null }
  if (ev.key.startsWith('Arrow') && kbd.lastArrow === ev.key) { kbd.lastArrow = null }
  if (kbd.get(ev.key) === kbd.up) { return }
  kbd.state[ev.key] = kbd.release;
});

export default kbd;
