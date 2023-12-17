import kbd from './kbd.js';

function rpg(props, children = []) {
  let div = document.createElement('div');
  div.className = 'rpg';
  if (props.locked) { div.classList.add('locked') }

  for (let x of ['width', 'height']) {
    if (props[x]) { div.style[x] = props[x] }
  }

  div.append(...children);
  return div;
}

rpg.playSound = function(sound) {
  let resolve, promise = new Promise(res => resolve = res);
  let audio = document.createElement('audio');
  audio.src = sound;
  audio.addEventListener('ended', () => { audio.remove(); resolve() });
  document.body.append(audio);
  audio.play();
  return promise;
};

rpg.screen = function(children) {
  let div = document.createElement('div');
  div.className = 'screen';
  div.append(...children);
  return div;
};

rpg.animateScreen = function(name) {
  let resolve, promise = new Promise(res => resolve = res);
  let screen = document.querySelector('.rpg .screen');
  if (!screen) { return resolve() }
  screen.classList.remove('animate__animated', `animate__${name}`);
  requestAnimationFrame(() => {
    screen.classList.add('animate__animated', `animate__${name}`);
    screen.addEventListener('animationend', () => {
      screen.classList.remove('animate__animated', `animate__${name}`);
      resolve();
    }, { once: true });
  });

  return promise;
};

rpg.xyof = function(unit) {
  return [
    Number(unit.style.getPropertyValue('--rpg-x')),
    Number(unit.style.getPropertyValue('--rpg-y')),
  ];
};

rpg.viewport = function(children) {
  let div = document.createElement('div');
  div.className = 'viewport';
  div.append(...children);
  return div;
};

rpg.ui = function() {
  let div = document.createElement('div');
  div.className = 'ui';
  return div;
};

rpg.ui.msgbox = function(text) {
  let box = document.createElement('div');
  box.className = 'msgbox';
  document.querySelector('.rpg .ui').append(box);
  msgboxFrame(box, text);
  return new Promise(res => box.resolve = res);
};

function msgboxFrame(box, text, i = 0) {
  if (box.textContent.length >= text.length) {
    let div = document.createElement('div');
    div.className = 'cursor';
    div.textContent = '▼';
    box.append(div);

    box.msgboxKeyDownHandler = ev => {
      if (ev.key !== 'z') { return }
      box.remove();
      removeEventListener('keydown', box.msgboxKeyDownHandler);
      box.resolve();
    };

    addEventListener('keydown', box.msgboxKeyDownHandler);
    return;
  }

  requestAnimationFrame(() => msgboxFrame(box, text, i + 1));
  box.textContent = text.slice(0, i);
}

rpg.tilemap = function(tw, th, tmw, tmh, bg, tileset, roadblocks = [], children = []) {
  let div = document.createElement('div');
  div.className = 'tilemap';
  for (let [k, v] of Object.entries({ tw, th, tmw, tmh })) { div.style.setProperty(`--rpg-${k}`, v) }
  for (let [k, v] of Object.entries({ bg, tileset })) { div.style.setProperty(`--rpg-${k}`, `url("${v}")`) }
  div.roadblocks = roadblocks;
  div.append(...children);

  for (let tile of div.querySelectorAll('.tile')) {
    let tx = Number(tile.style.getPropertyValue('--rpg-tx'));
    let ty = Number(tile.style.getPropertyValue('--rpg-ty'));
    let rb = roadblocks[ty]?.[tx] || 'OOOO';
    if (rb[4] === 'H') { tile.style.setProperty('--rpg-high-tile', 2) }
  }

  return div;
};

rpg.tiles = function(children) {
  let div = document.createElement('div');
  div.className = 'tiles';
  div.append(...children);
  return div;
};

rpg.tile = function(x, y, tx, ty, layer) {
  let div = document.createElement('div');
  div.className = 'tile';
  for (let [k, v] of Object.entries({ x, y, tx, ty, layer })) { v != null && div.style.setProperty(`--rpg-${k}`, v) }
  return div;
};

rpg.findTiles = function(root, x, y) {
  let tiles = [];
  for (let tile of root.querySelectorAll('.tile')) {
    let x2 = Number(tile.style.getPropertyValue('--rpg-x'));
    let y2 = Number(tile.style.getPropertyValue('--rpg-y'));
    if (x === x2 && y === y2) { tiles.push(tile) }
  }
  return tiles;
};

rpg.trap = function(x, y, eventHandlers = {}) {
  let div = document.createElement('div');
  div.className = 'trap';
  for (let [k, v] of Object.entries({ x, y })) { v != null && div.style.setProperty(`--rpg-${k}`, v) }
  div.eventHandlers = eventHandlers;
  return div;
};

rpg.sprites = function(children) {
  let div = document.createElement('div');
  div.className = 'sprites';
  div.append(...children);
  return div;
};

rpg.sprite = function(x, y, sw, sh, sprite, layer, eventHandlers = {}) {
  let div = document.createElement('div');
  let internal = document.createElement('div');
  div.className = 'sprite';
  internal.className = 'sprite-internal';
  for (let [k, v] of Object.entries({ x, y, sw, sh, layer })) { v != null && div.style.setProperty(`--rpg-${k}`, v) }
  div.style.setProperty('--rpg-sprite', `url("${sprite}")`);
  div.eventHandlers = eventHandlers;
  div.append(internal);
  return div;
};

rpg.tileSprite = function(x, y, tx, ty, layer, eventHandlers) {
  let div = document.createElement('div');
  div.className = 'sprite';
  for (let [k, v] of Object.entries({ x, y })) { v != null && div.style.setProperty(`--rpg-${k}`, v) }
  div.eventHandlers = eventHandlers;
  div.append(rpg.tile(0, 0, tx, ty, layer));
  return div;
};

rpg.hero = function(sprite) {
  sprite.classList.add('hero');
  setTimeout(() => heroFrame(sprite), 100);
  return sprite;
};

function heroFrame(sprite, force) {
  requestAnimationFrame(() => heroFrame(sprite));
  if (sprite.closest('.rpg.locked')) { return }
  if (!sprite.classList.contains('walking') && kbd.lastArrow) {
    sprite.classList.add('walking');
    sprite.transitionHandler = () => heroFrame.transition(sprite);
    sprite.transitionHandler();
    sprite.addEventListener('transitionend', sprite.transitionHandler);
  }
}

addEventListener('keyhit', async ev => {
  if (ev.detail.originalEvent.key !== 'z') { return }
  let hero = document.querySelector('.rpg .hero');
  if (!hero || hero.closest('.rpg.locked')) { return }
  let target = rpg.targetSprite(hero);
  let { onAction } = target?.eventHandlers || {};
  if (!onAction) { return }
  let root = hero.closest('.rpg');
  root.classList.add('locked');
  await onAction(hero, target);
  document.querySelector('.rpg.locked')?.classList?.remove?.('locked');
});

heroFrame.transition = function(sprite) {
  let map = sprite.closest('.tilemap');
  let x = Number(sprite.style.getPropertyValue('--rpg-x'));
  let y = Number(sprite.style.getPropertyValue('--rpg-y'));
  let trap = map && rpg.findTrap(map, x, y);
  if (trap) { return rpg.fall(trap) }
  let locked = sprite.closest('.rpg.locked');
  let end = !map || locked;

  if (!end) {
    switch (kbd.lastArrow) {
      case 'ArrowDown': end = !rpg.step(sprite, 0); break;
      case 'ArrowUp': end = !rpg.step(sprite, 1); break;
      case 'ArrowRight': end = !rpg.step(sprite, 2); break;
      case 'ArrowLeft': end = !rpg.step(sprite, 3); break;
      default: end = true; break;
    }
  }

  if (end) {
    sprite.classList.remove('walking');
    sprite.removeEventListener('transitionend', sprite.transitionHandler);
    sprite.transitionHandler = null;
  }
};

rpg.findTrap = function(map, x, y) {
  for (let trap of map.querySelectorAll('.trap')) {
    let x2 = Number(trap.style.getPropertyValue('--rpg-x'));
    let y2 = Number(trap.style.getPropertyValue('--rpg-y'));
    if (x === x2 && y === y2) { return trap }
  }
  return null;
};

rpg.fall = async function(trap) {
  let root = trap.closest('.rpg');
  let { onFall } = trap.eventHandlers || {};
  if (!onFall) { return }
  root.classList.add('locked');
  await onFall(root.querySelector('.hero'), trap);
  document.querySelector('.rpg.locked')?.classList?.remove?.('locked');
};

rpg.findSprite = function(root, x, y) {
  for (let sprite of root.querySelectorAll('.sprite')) {
    let x2 = Number(sprite.style.getPropertyValue('--rpg-x'));
    let y2 = Number(sprite.style.getPropertyValue('--rpg-y'));
    if (x === x2 && y === y2) { return sprite }
  }
  return null;
};

rpg.targetSprite = function(sprite) {
  let map = sprite.closest('.tilemap');
  let sx = Number(sprite.style.getPropertyValue('--rpg-x'));
  let sy = Number(sprite.style.getPropertyValue('--rpg-y'));
  let dir = Number(sprite.style.getPropertyValue('--rpg-sy')) || 0;
  switch (dir) {
    case 0: sy++; break;
    case 1: sy--; break;
    case 2: sx++; break;
    case 3: sx--; break;
  }
  return rpg.findSprite(map, sx, sy);
};

rpg.spriteUnblocked = function(sprite) {
  let map = sprite.closest('.tilemap');
  let sx = Number(sprite.style.getPropertyValue('--rpg-x'));
  let sy = Number(sprite.style.getPropertyValue('--rpg-y'));
  let dir = Number(sprite.style.getPropertyValue('--rpg-sy')) || 0;

  for (let tile of rpg.findTiles(map, sx, sy)) {
    let tx = Number(tile.style.getPropertyValue('--rpg-tx'));
    let ty = Number(tile.style.getPropertyValue('--rpg-ty'));
    let rb = map.roadblocks[ty]?.[tx] || 'OOOO';
    if (rb[dir] === 'X') { return false }
  }

  let nsx = sx, nsy = sy, incomingDir;
  switch (dir) {
    case 0: nsy++; incomingDir = 1; break;
    case 1: nsy--; incomingDir = 0; break;
    case 2: nsx++; incomingDir = 3; break;
    case 3: nsx--; incomingDir = 2; break;
  }

  for (let tile of rpg.findTiles(map, nsx, nsy)) {
    let tx = Number(tile.style.getPropertyValue('--rpg-tx'));
    let ty = Number(tile.style.getPropertyValue('--rpg-ty'));
    let roadblocks = map.roadblocks[ty]?.[tx] || 'OOOO';
    if (roadblocks[incomingDir] === 'X') { return false }
  }

  return !rpg.findSprite(map, nsx, nsy);
};

rpg.step = function(sprite, dir) {
  sprite.style.setProperty('--rpg-sy', dir);
  if (!rpg.spriteUnblocked(sprite)) { return false }

  switch (Number(dir)) {
    case 0: sprite.style.setProperty('--rpg-y', Number(sprite.style.getPropertyValue('--rpg-y')) + 1); break;
    case 1: sprite.style.setProperty('--rpg-y', Number(sprite.style.getPropertyValue('--rpg-y')) - 1); break;
    case 2: sprite.style.setProperty('--rpg-x', Number(sprite.style.getPropertyValue('--rpg-x')) + 1); break;
    case 3: sprite.style.setProperty('--rpg-x', Number(sprite.style.getPropertyValue('--rpg-x')) - 1); break;
  }

  return true;
};

rpg.fx = function(x, y, fw, fh, fx, fy, frames, image) {
  let resolve, promise = new Promise(res => resolve = res);
  let div = document.createElement('div');
  let internal = document.createElement('div');
  div.className = 'fx';
  internal.className = 'fx-internal';
  for (let [k, v] of Object.entries({ x, y, fw, fh, fx, fy, frames })) { div.style.setProperty(`--rpg-${k}`, v) }
  internal.style.backgroundImage = `url("${image}")`;

  internal.addEventListener('animationend', ev => {
    ev.target.remove();
    resolve();
  });

  div.append(internal);
  let tiles = document.querySelector('.rpg .tiles');
  tiles.append(div);
  return promise;
};

export default rpg;
