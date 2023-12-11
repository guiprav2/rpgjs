import kbd from './kbd.js';

function rpg(props, children = []) {
  let div = document.createElement('div');
  div.className = 'rpg';

  for (let x of ['width', 'height']) {
    if (props[x]) { div.style[x] = props[x] }
  }

  div.append(...children);
  return div;
}

rpg.viewport = function(children) {
  let div = document.createElement('div');
  div.className = 'viewport';
  div.append(...children);
  return div;
};

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

rpg.sprites = function(children) {
  let div = document.createElement('div');
  div.className = 'sprites';
  div.append(...children);
  return div;
};

rpg.sprite = function(x, y, sw, sh, sprite, layer) {
  let div = document.createElement('div');
  let internal = document.createElement('div');
  div.className = 'sprite';
  internal.className = 'sprite-internal';
  for (let [k, v] of Object.entries({ x, y, sw, sh, layer })) { v != null && div.style.setProperty(`--rpg-${k}`, v) }
  div.style.setProperty('--rpg-sprite', `url("${sprite}")`);
  div.append(internal);
  return div;
};

rpg.hero = function(sprite) {
  sprite.classList.add('hero');
  heroFrame(sprite);
  return sprite;
};

function heroFrame(sprite) {
  requestAnimationFrame(() => heroFrame(sprite));
  if (!sprite.classList.contains('walking') && kbd.lastArrow) {
    sprite.classList.add('walking');
    sprite.transitionHandler = () => heroFrame.transition(sprite);
    sprite.transitionHandler();
    sprite.addEventListener('transitionend', sprite.transitionHandler);
  }
}

heroFrame.transition = function(sprite) {
  let end = false;

  switch (kbd.lastArrow) {
    case 'ArrowDown': end = !rpg.step(sprite, 0); break;
    case 'ArrowUp': end = !rpg.step(sprite, 1); break;
    case 'ArrowRight': end = !rpg.step(sprite, 2); break;
    case 'ArrowLeft': end = !rpg.step(sprite, 3); break;
    default: end = true; break;
  }

  if (end) {
    sprite.classList.remove('walking');
    sprite.removeEventListener('transitionend', sprite.transitionHandler);
    sprite.transitionHandler = null;
  }
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

export default rpg;
