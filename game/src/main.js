import { Game } from './game.js';
import { Input } from './input.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const sprites = {
  player: new Image(),
  enemy: new Image()
};

sprites.player.src = './assets/player-ship.svg';
sprites.enemy.src = './assets/enemy-ship.svg';

const ui = new UI();
const input = new Input();
const game = new Game(ui, input, sprites);

ui.onRestart(() => game.reset());

let lastTime = performance.now();

function frame(now) {
  const deltaTime = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  game.update(deltaTime);
  game.draw(ctx);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
