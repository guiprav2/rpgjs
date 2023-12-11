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

rpg.tilemap = function(tw, th, tmw, tmh, bg, tileset, children = []) {
  let div = document.createElement('div');
  div.className = 'tilemap';
  for (let [k, v] of Object.entries({ tw, th, tmw, tmh })) { div.style.setProperty(`--rpg-${k}`, v) }
  for (let [k, v] of Object.entries({ bg, tileset })) { div.style.setProperty(`--rpg-${k}`, `url("${v}")`) }
  div.append(...children);
  return div;
};

rpg.tiles = function(children) {
  let div = document.createElement('div');
  div.className = 'tiles';
  div.append(...children);
  return div;
};

rpg.tile = function(x, y, tx, ty) {
  let div = document.createElement('div');
  div.className = 'tile';
  for (let [k, v] of Object.entries({ x, y, tx, ty })) { div.style.setProperty(`--rpg-${k}`, v) }
  return div;
};

rpg.sprites = function(children) {
  let div = document.createElement('div');
  div.className = 'sprites';
  div.append(...children);
  return div;
};

rpg.sprite = function(x, y, sw, sh, sprite) {
  let div = document.createElement('div');
  let internal = document.createElement('div');
  div.className = 'sprite';
  internal.className = 'sprite-internal';
  for (let [k, v] of Object.entries({ x, y, sw, sh })) { div.style.setProperty(`--rpg-${k}`, v) }
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
  switch (kbd.lastArrow) {
    case 'ArrowDown':
      sprite.style.setProperty('--rpg-sy', 0);
      sprite.style.setProperty('--rpg-y', Number(sprite.style.getPropertyValue('--rpg-y')) + 1);
      break;

    case 'ArrowUp':
      sprite.style.setProperty('--rpg-sy', 1);
      sprite.style.setProperty('--rpg-y', Number(sprite.style.getPropertyValue('--rpg-y')) - 1);
      break;

    case 'ArrowRight':
      sprite.style.setProperty('--rpg-sy', 2);
      sprite.style.setProperty('--rpg-x', Number(sprite.style.getPropertyValue('--rpg-x')) + 1);
      break;

    case 'ArrowLeft':
      sprite.style.setProperty('--rpg-sy', 3);
      sprite.style.setProperty('--rpg-x', Number(sprite.style.getPropertyValue('--rpg-x')) - 1);
      break;

    default:
      sprite.classList.remove('walking');
      sprite.removeEventListener('transitionend', sprite.transitionHandler);
      sprite.transitionHandler = null;
      break;
  }
};

export default rpg;
