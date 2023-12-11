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

export default kbd;
