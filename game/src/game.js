import { GAME_HEIGHT } from './constants.js';
import { createEnemyWave, drawEnemies, updateEnemies } from './enemy.js';
import { Player } from './player.js';

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export class Game {
  constructor(ui, input, sprites) {
    this.ui = ui;
    this.input = input;
    this.sprites = sprites;
    this.reset();
  }

  reset() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.player = new Player();
    this.enemies = createEnemyWave(this.level);
    this.bullets = [];
    this.gameOver = false;
    this.win = false;
    this.ui.hideOverlay();
    this.ui.update(this.snapshot());
  }

  snapshot() {
    return { score: this.score, lives: this.lives, level: this.level };
  }

  update(deltaTime) {
    if (this.gameOver || this.win) return;

    this.player.update(deltaTime, this.input);

    if (this.input.consumeShoot()) {
      const bullet = this.player.shoot();
      if (bullet) this.bullets.push(bullet);
    }

    for (const bullet of this.bullets) {
      bullet.y += bullet.vy * deltaTime;
    }
    this.bullets = this.bullets.filter((bullet) => bullet.y + bullet.height > 0);

    updateEnemies(this.enemies, deltaTime);

    this.handleCollisions();

    if (this.enemies.some((enemy) => enemy.y + enemy.height >= this.player.y)) {
      this.lives = 0;
      this.endGame(false);
    }

    if (this.enemies.length === 0) {
      this.level += 1;
      if (this.level > 3) {
        this.endGame(true);
      } else {
        this.enemies = createEnemyWave(this.level);
      }
    }

    this.ui.update(this.snapshot());
  }

  handleCollisions() {
    const remainingBullets = [];

    for (const bullet of this.bullets) {
      const hitEnemyIndex = this.enemies.findIndex((enemy) => intersects(bullet, enemy));
      if (hitEnemyIndex === -1) {
        remainingBullets.push(bullet);
        continue;
      }

      const enemy = this.enemies[hitEnemyIndex];
      enemy.hp -= 1;
      if (enemy.hp <= 0) {
        this.score += enemy.points;
        this.enemies.splice(hitEnemyIndex, 1);
      }
    }

    this.bullets = remainingBullets;
  }

  endGame(win) {
    this.gameOver = !win;
    this.win = win;
    if (win) {
      this.ui.showOverlay('Victory!', `You defended the stars with ${this.score} points.`);
    } else {
      this.ui.showOverlay('Game Over', `Final score: ${this.score}. Click restart to try again.`);
    }
  }

  draw(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#131a3b';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = '#1d2f6f';
    ctx.fillRect(0, GAME_HEIGHT - 24, ctx.canvas.width, 24);

    this.player.draw(ctx, this.sprites.player);
    drawEnemies(ctx, this.enemies, this.sprites.enemy);

    for (const bullet of this.bullets) {
      ctx.fillStyle = bullet.color;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
  }
}
